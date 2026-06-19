import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Mic, MicOff, Square, Play, Pause, Calendar, Users, FileText,
  Sparkles, Plus, X, Clock, CheckCircle2, AlertCircle, Loader2,
  Download, Trash2, Search
} from "lucide-react";
import RaciNotifyModal from "./RaciNotify.jsx";
import StakeholderPicker from "./StakeholderPicker.jsx";
import { sendEmail } from "./emailService.js";
import { transcribeAudio, isConfigured as transcripConfigured, getApiKey, setApiKey, testConnection, estimateCost } from "./transcriptionService.js";
import { transcribeLocal, getLocalModel, setLocalModel, MODELS_DISPONIBLES } from "./whisperLocal.js";

const ENGINE_KEY = "crettohub::whisper-engine";
const getEngine = () => { try { return localStorage.getItem(ENGINE_KEY) || "local"; } catch { return "local"; } };
const setEngine = (v) => { try { localStorage.setItem(ENGINE_KEY, v); } catch {} };

/* Resuelve email primario de un stakeholder a partir del texto de asistente */
const findStakeholderEmail = (texto, stakeholders) => {
  if (!texto) return "";
  const t = texto.toLowerCase().trim();
  const s = stakeholders.find(s => (s.nombre || "").toLowerCase() === t || (s.organizacion || "").toLowerCase() === t);
  if (!s) return "";
  if (s.email) return s.email;
  const ppal = (s.contactos || []).find(c => c.esPrincipal && c.email);
  if (ppal) return ppal.email;
  const cualquiera = (s.contactos || []).find(c => c.email);
  return cualquiera?.email || "";
};

/* Genera HTML del acta para email */
const generarActaHTML = ({ project, reunion, linkActa }) => {
  const tipo = (reunion.tipo || "").replace(/-/g, " ");
  const asist = (reunion.asistentes || []).map(a => `<li>${a}</li>`).join("");
  const acts = (reunion.actividades || []).map(a =>
    `<tr><td style="padding:6px;border:1px solid #ddd">${a.descripcion || ""}</td><td style="padding:6px;border:1px solid #ddd">${a.responsable || "Por asignar"}</td><td style="padding:6px;border:1px solid #ddd;white-space:nowrap">${a.fecha || ""}</td></tr>`
  ).join("");
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#1c1917">
    <div style="border-left:4px solid #047857;padding-left:14px;margin-bottom:18px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#78716c">Acta · Cretto — ${project?.nombre || ""}</div>
      <h1 style="margin:6px 0;font-family:Georgia,serif;font-size:22px">${reunion.titulo || "Reunión"}</h1>
      <div style="font-size:13px;color:#57534e">${tipo} · ${reunion.fecha}</div>
    </div>
    ${reunion.meetLink ? `<div style="margin:14px 0;padding:10px;background:#ecfdf5;border-left:3px solid #047857;border-radius:4px"><a href="${reunion.meetLink}" style="color:#047857;font-weight:600;text-decoration:none">📹 Unirse a Google Meet</a><div style="font-size:11px;color:#57534e;margin-top:2px">${reunion.meetLink}</div></div>` : ""}
    ${reunion.razon ? `<h3 style="font-family:Georgia,serif;font-size:14px;color:#1c1917;margin:14px 0 4px">Razón / objetivo</h3><p style="font-size:13px;line-height:1.5;margin:0">${reunion.razon}</p>` : ""}
    <h3 style="font-family:Georgia,serif;font-size:14px;margin:14px 0 4px">Asistentes</h3>
    <ul style="font-size:13px;line-height:1.6;margin:0 0 0 18px">${asist || "<li>—</li>"}</ul>
    <h3 style="font-family:Georgia,serif;font-size:14px;margin:14px 0 4px">Resumen</h3>
    <div style="font-size:13px;line-height:1.55;white-space:pre-wrap">${(reunion.resumen || "—").replace(/</g, "&lt;")}</div>
    <h3 style="font-family:Georgia,serif;font-size:14px;margin:18px 0 6px">Actividades / compromisos</h3>
    ${acts ? `<table style="border-collapse:collapse;width:100%;font-size:12px"><thead><tr style="background:#f5f5f4"><th style="padding:6px;border:1px solid #ddd;text-align:left">Compromiso</th><th style="padding:6px;border:1px solid #ddd;text-align:left">Responsable</th><th style="padding:6px;border:1px solid #ddd;text-align:left">Fecha</th></tr></thead><tbody>${acts}</tbody></table>` : "<p style='font-size:12px;color:#a8a29e'>Sin actividades registradas.</p>"}
    <p style="margin-top:22px;font-size:12px">
      <a href="${linkActa}" style="color:#047857;font-weight:600">→ Ver acta completa con transcripción</a>
    </p>
    <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0 10px">
    <div style="font-size:11px;color:#a8a29e;text-align:center">Elaborado por Cretto · Gerencia de Proyectos</div>
  </body></html>`;
};

/* ────────────────────────────────────────────────────────────────
   Repositorio de Reuniones
   - Lista de reuniones (semanales / técnicas / fiduciaria / cliente)
   - Crear reunión manualmente (acta) o GRABAR en vivo
   - "Procesar" la grabación → extrae actividades, responsables y fechas
   - Al guardar acta, dispara modal RACI para notificar
   - Actividades extraídas alimentan el módulo de Pendientes
     (se exponen vía window.crettoHub.addPendientes — handler opcional)
────────────────────────────────────────────────────────────────── */

const TIPOS_REUNION = [
  { id: "comite-semanal",   label: "Comité semanal",       color: "emerald" },
  { id: "comite-tecnico",   label: "Comité técnico / MEP", color: "blue" },
  { id: "comite-fiducia",   label: "Comité fiduciario",    color: "indigo" },
  { id: "reunion-cliente",  label: "Reunión con cliente",  color: "violet" },
  { id: "comite-comercial", label: "Comité comercial",     color: "rose" },
  { id: "otra",             label: "Otra",                 color: "stone" }
];

const COLOR_CLASS = {
  emerald: "bg-emerald-100 text-emerald-800",
  blue:    "bg-blue-100 text-blue-800",
  indigo:  "bg-indigo-100 text-indigo-800",
  violet:  "bg-violet-100 text-violet-800",
  rose:    "bg-rose-100 text-rose-800",
  stone:   "bg-stone-100 text-stone-700",
  amber:   "bg-amber-100 text-amber-800"
};

const SEED_REUNIONES = [
  {
    id: 1, tipo: "comite-semanal", fecha: "2026-05-22", duracionMin: 62,
    titulo: "Comité semanal #18", asistentes: ["Jose Duque (PM Cretto)", "Sponsor", "Constructor", "Interventoría"],
    resumen: "Avance obra 64%. Pendientes de fachada por color de aluminio. Punto de equilibrio alcanzado (72%). Próxima entrega: piso 8 acabados.",
    actividades: [
      { id: 1, descripcion: "Confirmar color RAL fachada con arquitecto", responsable: "Arquitecto", fecha: "2026-05-29", estado: "pendiente" },
      { id: 2, descripcion: "Enviar cuadro de ventas mensual a fiduciaria", responsable: "Comercializadora", fecha: "2026-05-31", estado: "pendiente" }
    ],
    grabacionUrl: null
  }
];

const Reuniones = ({ project, onAddPendientes, raciData, stakeholders = [], onEditStakeholder }) => {
  const [reuniones, setReuniones] = useState(SEED_REUNIONES);
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [raciPayload, setRaciPayload] = useState(null);

  /* Persistencia */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:reuniones:${project?.id || "default"}`);
        if (m && r && r.value) setReuniones(JSON.parse(r.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:reuniones:${project?.id || "default"}`, JSON.stringify(reuniones)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [reuniones, project?.id]);

  const filtered = useMemo(() => {
    return reuniones.filter(r => {
      if (filtroTipo !== "all" && r.tipo !== filtroTipo) return false;
      if (query) {
        const q = query.toLowerCase();
        return r.titulo.toLowerCase().includes(q) || (r.resumen || "").toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [reuniones, filtroTipo, query]);

  const handleSave = async (data) => {
    let saved;
    if (data.id) {
      setReuniones(prev => prev.map(r => r.id === data.id ? data : r));
      saved = data;
    } else {
      const id = Math.max(0, ...reuniones.map(r => r.id)) + 1;
      saved = { ...data, id };
      setReuniones(prev => [saved, ...prev]);
    }
    setModalOpen(false);
    setEditing(null);

    // Push actividades al módulo de Pendientes
    if (onAddPendientes && saved.actividades?.length) {
      onAddPendientes(saved.actividades.map(a => ({
        ...a, origen: `Reunión: ${saved.titulo}`, reunionId: saved.id
      })));
    }

    /* ── Enviar acta por email a asistentes + responsables ── */
    const emails = new Set();
    (saved.asistentes || []).forEach(a => {
      const e = findStakeholderEmail(a, stakeholders);
      if (e) emails.add(e);
    });
    (saved.actividades || []).forEach(act => {
      const e = findStakeholderEmail(act.responsable, stakeholders);
      if (e) emails.add(e);
    });
    const linkActa = `${window.location.origin}${window.location.pathname}#reunion-${saved.id}`;
    if (emails.size > 0) {
      try {
        const html = generarActaHTML({ project, reunion: saved, linkActa });
        const body = `Acta: ${saved.titulo}\nFecha: ${saved.fecha}\nAsistentes: ${(saved.asistentes || []).join(", ")}\n\nRESUMEN\n${saved.resumen || "—"}\n\nACTIVIDADES\n${(saved.actividades || []).map(a => `• ${a.descripcion} — ${a.responsable || "Por asignar"} (${a.fecha || ""})`).join("\n") || "—"}\n\nVer acta completa con transcripción:\n${linkActa}`;
        await sendEmail({
          to: [...emails].join(","),
          subject: `[Acta · ${project?.nombre || "Cretto"}] ${saved.titulo} — ${saved.fecha}`,
          body, html
        });
      } catch (err) {
        console.warn("Envío de acta falló:", err.message);
      }
    }

    // Disparar RACI notify (opcional, además del email automático)
    setRaciPayload({
      tipo: "reunion-acta",
      projectName: project?.nombre,
      titulo: `Acta enviada: ${saved.titulo}`,
      contexto: `${saved.fecha} · ${saved.actividades?.length || 0} actividades · ${emails.size} correo${emails.size === 1 ? "" : "s"} enviado${emails.size === 1 ? "" : "s"}`,
      onSent: () => setRaciPayload(null)
    });
  };

  const handleDelete = (id) => {
    if (!confirm("¿Eliminar reunión?")) return;
    setReuniones(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Reuniones · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Repositorio de reuniones</h1>
          <p className="mt-1 text-sm text-stone-500">{reuniones.length} reuniones registradas · grabación + extracción de actividades.</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          <Plus className="h-4 w-4" /> Nueva reunión
        </button>
      </header>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <CatChip label={`Todas (${reuniones.length})`} active={filtroTipo === "all"} onClick={() => setFiltroTipo("all")} color="stone" />
        {TIPOS_REUNION.map(t => (
          <CatChip key={t.id} label={`${t.label} (${reuniones.filter(r => r.tipo === t.id).length})`} active={filtroTipo === t.id} onClick={() => setFiltroTipo(t.id)} color={t.color} />
        ))}
      </div>
      <div className="mb-3 relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título o contenido…" className="w-full rounded-md border border-stone-300 bg-white py-1.5 pl-8 pr-3 text-sm placeholder-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-stone-400">Sin reuniones registradas.</div>
        )}
        {filtered.map(r => {
          const tipo = TIPOS_REUNION.find(t => t.id === r.tipo) || TIPOS_REUNION[0];
          return (
            <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${COLOR_CLASS[tipo.color]}`}>{tipo.label}</span>
                    <h3 className="font-serif text-base text-stone-900">{r.titulo}</h3>
                    {r.grabacionUrl && <span className="inline-flex items-center gap-0.5 rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-medium text-rose-700"><Mic className="h-2.5 w-2.5" /> Grabada</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-stone-500">
                    <span className="inline-flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {r.fecha}</span>
                    {r.duracionMin && <span className="inline-flex items-center gap-0.5"><Clock className="h-3 w-3" /> {r.duracionMin} min</span>}
                    <span className="inline-flex items-center gap-0.5"><Users className="h-3 w-3" /> {(r.asistentes || []).length} asistentes</span>
                  </div>
                  {r.resumen && <p className="mt-2 text-[12px] leading-relaxed text-stone-700">{r.resumen}</p>}
                  {(r.actividades || []).length > 0 && (
                    <div className="mt-2 rounded-md bg-emerald-50/40 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                        <Sparkles className="mr-1 inline h-3 w-3" /> Actividades extraídas ({r.actividades.length})
                      </div>
                      <ul className="mt-1 space-y-0.5 text-[11px] text-stone-700">
                        {r.actividades.map(a => (
                          <li key={a.id} className="flex items-start gap-1">
                            <span className="mt-1 h-1 w-1 rounded-full bg-emerald-600" />
                            <span className="flex-1">{a.descripcion}</span>
                            <span className="text-stone-500">{a.responsable}</span>
                            <span className="font-mono text-stone-400">{a.fecha}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button onClick={() => { setEditing(r); setModalOpen(true); }} className="rounded-md border border-stone-200 bg-white px-2 py-1 text-[11px] text-stone-600 hover:bg-stone-50">Editar</button>
                  <button onClick={() => handleDelete(r.id)} className="rounded-md p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && <ReunionModal initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} stakeholders={stakeholders} onEditStakeholder={onEditStakeholder} />}
      <RaciNotifyModal open={!!raciPayload} payload={raciPayload} raciData={raciData} onClose={() => setRaciPayload(null)} />
    </div>
  );
};

const CatChip = ({ label, active, onClick, color }) => (
  <button onClick={onClick} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${active ? COLOR_CLASS[color] + " ring-1 ring-stone-300" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}>
    {label}
  </button>
);

/* ─── Modal: crear/editar reunión + grabación ─── */
const ReunionModal = ({ initial, onClose, onSave, stakeholders = [], onEditStakeholder }) => {
  const [form, setForm] = useState(initial || {
    tipo: "comite-semanal", fecha: new Date().toISOString().slice(0, 10),
    titulo: "", razon: "", duracionMin: "", asistentes: [], resumen: "", actividades: [],
    grabacionUrl: null, transcripcion: "",
    meetLink: "", horaInicio: "09:00"
  });
  const [tab, setTab] = useState("acta"); // acta | grabar | resumen | actividades
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [processing, setProcessing] = useState(false);
  const recIntRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const audioBlobRef = useRef(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [engine, setEngineState] = useState(getEngine()); // "local" | "cloud"
  const [progress, setProgress] = useState(null); // { stage, pct, file, loaded, total }

  useEffect(() => () => {
    if (recIntRef.current) clearInterval(recIntRef.current);
    if (mediaRef.current) try { mediaRef.current.stop(); } catch {}
  }, []);

  /* Grabación con MediaRecorder */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        audioBlobRef.current = blob;
        setForm(f => ({ ...f, grabacionUrl: url, duracionMin: Math.round(recTime / 60) }));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRef.current = rec;
      rec.start();
      setRecording(true);
      setRecTime(0);
      recIntRef.current = setInterval(() => setRecTime(t => t + 1), 1000);
    } catch (err) {
      alert("No se pudo acceder al micrófono: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRef.current) mediaRef.current.stop();
    if (recIntRef.current) clearInterval(recIntRef.current);
    setRecording(false);
  };

  /* "Procesar" grabación — extracción simulada de actividades */
  const procesarGrabacion = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    // Simulación: parsea bullets del resumen / transcripción
    const texto = (form.transcripcion || form.resumen || "");
    const lineas = texto.split(/[\.\n;]/).map(l => l.trim()).filter(l => l.length > 15);
    const verbosCompromiso = /(enviar|confirmar|aprobar|revisar|coordinar|definir|entregar|gestionar|programar|cotizar|contactar|verificar|validar|firmar|pagar|comprar|cerrar|llamar|consultar|escalar|presentar|preparar)/i;
    const extractedAct = lineas
      .filter(l => verbosCompromiso.test(l))
      .slice(0, 8)
      .map((l, i) => ({
        id: Date.now() + i,
        descripcion: l.length > 120 ? l.slice(0, 120) + "…" : l,
        responsable: "Por asignar",
        fecha: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        estado: "pendiente"
      }));
    /* NO sobrescribir el resumen escrito a mano: si ya hay texto, anexamos debajo */
    const extractoAuto = lineas.slice(0, 3).join(". ") + (lineas.length > 3 ? "…" : "");
    setForm(f => {
      const yaTiene = (f.resumen || "").trim();
      const resumenFinal = yaTiene
        ? `${f.resumen}\n\n──── Extracto automático de la grabación ────\n${extractoAuto}`
        : extractoAuto;
      return {
        ...f,
        actividades: [...(f.actividades || []), ...extractedAct],
        resumen: resumenFinal
      };
    });
    setProcessing(false);
    setTab("actividades");
  };

  const addActividad = () => setForm(f => ({
    ...f,
    actividades: [...(f.actividades || []), { id: Date.now(), descripcion: "", responsable: "", fecha: new Date().toISOString().slice(0, 10), estado: "pendiente" }]
  }));

  const updateAct = (id, patch) => setForm(f => ({
    ...f,
    actividades: f.actividades.map(a => a.id === id ? { ...a, ...patch } : a)
  }));

  const removeAct = (id) => setForm(f => ({ ...f, actividades: f.actividades.filter(a => a.id !== id) }));

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* Transcripción automática — engine "local" (Whisper en navegador) o "cloud" (OpenAI API) */
  const handleTranscribe = async () => {
    setTranscribeError("");
    setProgress(null);
    if (!audioBlobRef.current) {
      setTranscribeError("Sin audio. Graba primero.");
      return;
    }
    if (engine === "cloud" && !transcripConfigured()) {
      setShowKeyModal(true);
      return;
    }
    setTranscribing(true);
    try {
      const fn = engine === "local" ? transcribeLocal : transcribeAudio;
      const { text } = await fn(audioBlobRef.current, {
        language: engine === "local" ? "spanish" : "es",
        onProgress: (p) => setProgress(p)
      });
      const motor = engine === "local" ? `Whisper local · ${getLocalModel().split("/")[1]}` : "OpenAI Whisper API";
      setForm(f => {
        const yaTiene = (f.transcripcion || "").trim();
        const sep = yaTiene ? `${f.transcripcion}\n\n──── Transcripción automática (${motor} · ${new Date().toLocaleTimeString("es-CO")}) ────\n` : "";
        return { ...f, transcripcion: sep + text };
      });
      setTab("resumen");
    } catch (err) {
      setTranscribeError(err.message);
    } finally {
      setTranscribing(false);
      setProgress(null);
    }
  };

  const toggleEngine = (e) => { setEngine(e); setEngineState(e); };

  /* ─── Google Meet integration ─── */
  const crearMeet = () => {
    /* meet.new redirige a una sala nueva. El user copia el link y lo pega en el campo. */
    window.open("https://meet.new", "_blank", "noopener,noreferrer");
  };

  const unirseMeet = () => {
    if (form.meetLink) window.open(form.meetLink, "_blank", "noopener,noreferrer");
  };

  /* Programar el evento en Google Calendar con Meet auto + asistentes desde la DB */
  const programarEnCalendar = () => {
    const emails = (form.asistentes || [])
      .map(a => findStakeholderEmail(a, stakeholders))
      .filter(Boolean);

    /* Fecha + hora YYYYMMDDTHHmmSS — UTC para Calendar */
    const [yyyy, mm, dd] = (form.fecha || new Date().toISOString().slice(0, 10)).split("-");
    const [hh, mi] = (form.horaInicio || "09:00").split(":");
    const start = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd), parseInt(hh), parseInt(mi));
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1h por defecto
    const fmtDate = (d) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: form.titulo || "Reunión Cretto",
      details: [
        form.razon ? `Objetivo: ${form.razon}` : "",
        project?.nombre ? `Proyecto: ${project.nombre}` : "",
        "Convocada desde Cretto Hub"
      ].filter(Boolean).join("\n\n"),
      dates: `${fmtDate(start)}/${fmtDate(end)}`,
      add: "" /* placeholder; emails van en otro param */
    });
    if (emails.length) params.set("add", emails.join(","));
    /* "ctz" para zona horaria explícita */
    params.set("ctz", Intl.DateTimeFormat().resolvedOptions().timeZone);

    /* Google Calendar genera el Meet link automáticamente si el evento se crea logueado */
    const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">{initial ? "Editar reunión" : "Nueva reunión"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4">
          {[
            { id: "acta", label: "Acta" },
            { id: "grabar", label: "Grabar" },
            { id: "resumen", label: "Resumen y transcripción" },
            { id: "actividades", label: `Actividades (${form.actividades?.length || 0})` }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`-mb-px border-b-2 px-3 py-2 text-[12px] font-medium ${tab === t.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "acta" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Tipo">
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="inp">
                    {TIPOS_REUNION.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Fecha"><input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="inp" /></Field>
                <Field label="Hora inicio"><input type="time" value={form.horaInicio || "09:00"} onChange={e => setForm({ ...form, horaInicio: e.target.value })} className="inp" /></Field>
              </div>
              <Field label="Título"><input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="inp" placeholder="Ej. Comité semanal #19" /></Field>
              <Field label="Razón / objetivo de la reunión">
                <textarea value={form.razon} onChange={e => setForm({ ...form, razon: e.target.value })} rows={3} className="inp" placeholder="¿Por qué se convoca? Ej. Definir constructor con fiducia, revisar avance de preventas, aprobar cambio de diseño…" />
              </Field>
              <Field label={`Asistentes (${(form.asistentes || []).length})`}>
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {(form.asistentes || []).map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-800">
                        {a}
                        <button onClick={() => setForm({ ...form, asistentes: form.asistentes.filter((_, idx) => idx !== i) })} className="text-emerald-600 hover:text-rose-600">×</button>
                      </span>
                    ))}
                  </div>
                  <StakeholderPicker
                    value=""
                    onChange={(text) => {
                      if (text && !form.asistentes.includes(text)) {
                        setForm({ ...form, asistentes: [...(form.asistentes || []), text] });
                      }
                    }}
                    stakeholders={stakeholders}
                    onEditStakeholder={onEditStakeholder}
                    placeholder="+ Agregar asistente (buscar en DB o escribir nombre)"
                  />
                </div>
              </Field>

              {/* Google Meet */}
              <div className="rounded-md border border-stone-200 bg-stone-50/50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-base">📹</span>
                  <strong className="text-[12px] text-stone-800">Google Meet</strong>
                </div>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <button onClick={crearMeet} className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100">
                    ➕ Crear sala Meet ahora
                  </button>
                  <button onClick={programarEnCalendar} className="inline-flex items-center gap-1 rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-800 hover:bg-blue-100">
                    📅 Programar en Calendar con asistentes
                  </button>
                  {form.meetLink && (
                    <button onClick={unirseMeet} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-800">
                      🎥 Unirse al Meet
                    </button>
                  )}
                </div>
                <input
                  value={form.meetLink || ""}
                  onChange={e => setForm({ ...form, meetLink: e.target.value })}
                  placeholder="Pega aquí el link de Meet (https://meet.google.com/xxx-xxxx-xxx)"
                  className="inp"
                />
                <div className="mt-1 text-[10px] text-stone-500">
                  💡 <strong>Crear sala</strong>: abre meet.new en otra pestaña, te genera la sala, copias el link y lo pegas aquí.<br />
                  💡 <strong>Programar</strong>: abre Google Calendar pre-llenado con título, fecha, hora y emails de tus asistentes (DB). Calendar genera el Meet link automático al guardar.
                </div>
              </div>
            </div>
          )}

          {tab === "grabar" && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className={`flex h-32 w-32 items-center justify-center rounded-full transition-all ${recording ? "bg-rose-100 ring-8 ring-rose-50 animate-pulse" : "bg-stone-100"}`}>
                <Mic className={`h-12 w-12 ${recording ? "text-rose-600" : "text-stone-400"}`} />
              </div>
              <div className="mt-4 font-mono text-2xl text-stone-900">{fmtTime(recTime)}</div>
              <div className="mt-3 flex gap-2">
                {!recording ? (
                  <button onClick={startRecording} className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-rose-700">
                    <Mic className="h-4 w-4" /> Iniciar grabación
                  </button>
                ) : (
                  <button onClick={stopRecording} className="inline-flex items-center gap-1.5 rounded-md bg-stone-800 px-4 py-2 text-[13px] font-medium text-white hover:bg-stone-900">
                    <Square className="h-4 w-4" /> Detener
                  </button>
                )}
              </div>

              {!form.grabacionUrl && !recording && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className="text-center text-[11px] text-stone-400">Pulsa el micrófono para grabar la reunión. Al detener, el resultado aparece en <strong>Resumen y transcripción</strong>.</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-stone-500">
                    <span>— o —</span>
                  </div>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-800 hover:bg-blue-100">
                    📁 Subir grabación de Meet/Drive
                    <input
                      type="file"
                      accept="audio/*,video/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = URL.createObjectURL(file);
                        audioBlobRef.current = file;
                        setForm(f => ({ ...f, grabacionUrl: url, duracionMin: 0 }));
                      }}
                    />
                  </label>
                  <div className="text-[10px] text-stone-500 max-w-sm text-center">Funciona con la grabación que Google Meet guarda en Drive (MP4) o cualquier audio. Luego se transcribe con Whisper local.</div>
                </div>
              )}

              {form.grabacionUrl && (
                <div className="mt-6 w-full max-w-md rounded-md border border-emerald-200 bg-emerald-50/50 p-3">
                  <div className="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                    <Square className="h-3 w-3" /> Grabación lista ({fmtTime(recTime)})
                  </div>
                  <audio controls src={form.grabacionUrl} className="w-full" />

                  {/* Toggle motor de transcripción */}
                  <div className="mt-3 grid grid-cols-2 gap-1 rounded-md border border-stone-200 bg-white p-1 text-[10px]">
                    <button onClick={() => toggleEngine("local")} className={`rounded px-2 py-1 font-medium ${engine === "local" ? "bg-violet-600 text-white" : "bg-transparent text-stone-600 hover:bg-stone-100"}`}>
                      🖥️ Local (gratis, offline)
                    </button>
                    <button onClick={() => toggleEngine("cloud")} className={`rounded px-2 py-1 font-medium ${engine === "cloud" ? "bg-violet-600 text-white" : "bg-transparent text-stone-600 hover:bg-stone-100"}`}>
                      ☁️ Cloud OpenAI
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button onClick={handleTranscribe} disabled={transcribing} className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-violet-700 disabled:opacity-50">
                      {transcribing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      {transcribing ? "Transcribiendo…" : `Transcribir con IA (${engine === "local" ? "local" : "cloud"})`}
                    </button>
                    <button onClick={() => setTab("resumen")} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-800">
                      Ir a Resumen y transcripción →
                    </button>
                    <a href={form.grabacionUrl} download={`reunion-${form.fecha}.webm`} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[11px] text-stone-700 hover:bg-stone-50">
                      <Download className="h-3 w-3" /> Descargar audio
                    </a>
                  </div>

                  {/* Barra de progreso */}
                  {transcribing && progress && (
                    <div className="mt-2 rounded-md border border-violet-200 bg-violet-50 p-2">
                      <div className="mb-1 flex items-center justify-between text-[10px] text-violet-900">
                        <span className="font-semibold">
                          {progress.stage === "loading-model" && "Cargando modelo Whisper…"}
                          {progress.stage === "decoding-audio" && "Decodificando audio…"}
                          {progress.stage === "transcribing" && "Transcribiendo…"}
                          {progress.stage === "uploading" && "Subiendo audio…"}
                          {progress.stage === "done" && "Listo"}
                        </span>
                        <span>{progress.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-violet-200">
                        <div className="h-full bg-violet-600 transition-all" style={{ width: `${progress.pct}%` }} />
                      </div>
                      {progress.file && (
                        <div className="mt-1 truncate text-[9px] font-mono text-violet-700">{progress.file}</div>
                      )}
                    </div>
                  )}

                  {transcribeError && (
                    <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] text-rose-800">{transcribeError}</div>
                  )}

                  <div className="mt-1 text-[10px] text-stone-500">
                    {engine === "local" ? (
                      <>🔒 100% offline. Primera vez descarga modelo (~{MODELS_DISPONIBLES.find(m => m.id === getLocalModel())?.sizeMB || 75} MB), después instantáneo. Modelo: <span className="font-mono">{getLocalModel().split("/")[1]}</span> · <button onClick={() => setShowKeyModal(true)} className="font-semibold text-violet-700 hover:underline">Cambiar modelo</button></>
                    ) : (
                      <>☁️ Costo estimado: ~${estimateCost(recTime).usd.toFixed(3)} USD ({estimateCost(recTime).minutos.toFixed(1)} min) · {transcripConfigured() ? "✓ API key configurada" : <button onClick={() => setShowKeyModal(true)} className="font-semibold text-violet-700 hover:underline">Configurar API key</button>}</>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "resumen" && (
            <div className="space-y-3">
              <div className="rounded-md border border-stone-200 bg-stone-50/40 p-2 text-[11px] text-stone-600">
                3er punto — <strong>resultado de la reunión</strong>. Pega aquí la transcripción (o las notas) después de frenar la grabación, redacta el resumen y extrae las actividades comprometidas.
              </div>
              {form.grabacionUrl && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-2">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Audio grabado</div>
                  <audio controls src={form.grabacionUrl} className="w-full" />
                </div>
              )}
              <Field label="Resumen / temas tratados">
                <textarea value={form.resumen} onChange={e => setForm({ ...form, resumen: e.target.value })} rows={4} className="inp" placeholder="Avance, decisiones, riesgos, asuntos del cliente…" />
              </Field>
              <Field label="Transcripción / notas crudas (insumo para extracción)">
                <textarea value={form.transcripcion} onChange={e => setForm({ ...form, transcripcion: e.target.value })} rows={6} className="inp" placeholder="Pegar transcripción de la grabación o notas extensas. El sistema buscará verbos de compromiso para extraer actividades." />
              </Field>
              <button onClick={procesarGrabacion} disabled={processing || (!form.transcripcion && !form.resumen)} className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-violet-700 disabled:opacity-40">
                {processing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando…</> : <><Sparkles className="h-3.5 w-3.5" /> Extraer actividades del texto</>}
              </button>
              <div className="text-[10px] text-stone-500">
                💡 La transcripción automática (Whisper / AWS Transcribe) se conecta cuando integremos el servicio. Por ahora pega la transcripción manualmente.
              </div>
            </div>
          )}

          {tab === "actividades" && (
            <div className="space-y-2">
              <div className="rounded-md border border-stone-200 bg-stone-50/50 p-2 text-[11px] text-stone-600">
                Resumen de actividades que debe hacer cada persona de lo hablado en la reunión. Al <strong>Guardar y notificar</strong>, se envía un correo con el acta a todos los responsables + asistentes.
              </div>
              <div className="flex items-center justify-end">
                <button onClick={addActividad} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-[11px] text-stone-700 hover:bg-stone-50">
                  <Plus className="h-3 w-3" /> Agregar
                </button>
              </div>
              {(form.actividades || []).length === 0 && (
                <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-[12px] text-stone-400">
                  Sin actividades. Usa "Extraer actividades" en la pestaña Resumen y transcripción, o agrégalas manualmente.
                </div>
              )}
              {(form.actividades || []).map(a => {
                const emailAuto = findStakeholderEmail(a.responsable, stakeholders);
                return (
                  <div key={a.id} className="rounded-md border border-stone-200 bg-white p-2">
                    <div className="grid grid-cols-[1fr_180px_120px_auto] gap-2">
                      <input value={a.descripcion} onChange={e => updateAct(a.id, { descripcion: e.target.value })} placeholder="Compromiso / qué debe hacer" className="rounded border border-stone-200 px-2 py-1 text-[12px] focus:border-emerald-500 focus:outline-none" />
                      <StakeholderPicker
                        value={a.responsable || ""}
                        onChange={(txt) => updateAct(a.id, { responsable: txt })}
                        stakeholders={stakeholders}
                        onEditStakeholder={onEditStakeholder}
                        placeholder="Responsable"
                      />
                      <input type="date" value={a.fecha} onChange={e => updateAct(a.id, { fecha: e.target.value })} className="rounded border border-stone-200 px-2 py-1 text-[12px] focus:border-emerald-500 focus:outline-none" />
                      <button onClick={() => removeAct(a.id)} className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                      {emailAuto ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                          ✉ {emailAuto}
                        </span>
                      ) : a.responsable ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">
                          ⚠ Sin email en Stakeholders DB
                        </span>
                      ) : (
                        <span className="text-stone-400">Selecciona un responsable para auto-cargar email</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
          <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!form.titulo.trim()} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">
            Guardar y notificar
          </button>
        </footer>
        <style>{`.inp{width:100%;border:1px solid rgb(214,211,209);background:#fff;padding:6px 10px;font-size:13px;border-radius:6px}.inp:focus{outline:none;border-color:rgb(16,185,129);box-shadow:0 0 0 1px rgb(16,185,129)}`}</style>
      </div>
      {showKeyModal && <OpenAIKeyModal onClose={() => setShowKeyModal(false)} />}
    </div>
  );
};

/* ─── Modal: configurar transcripción (Local + Cloud) ─── */
const OpenAIKeyModal = ({ onClose }) => {
  const [key, setKey] = useState(getApiKey());
  const [show, setShow] = useState(false);
  const [test, setTest] = useState(null);
  const [testing, setTesting] = useState(false);
  const [modelo, setModelo] = useState(getLocalModel());
  const guardar = () => { setApiKey(key); setLocalModel(modelo); onClose(); };
  const probar = async () => {
    setTesting(true);
    setApiKey(key);
    const r = await testConnection();
    setTest(r);
    setTesting(false);
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-serif text-lg text-stone-900">Configurar transcripción con IA</h3>
            <div className="text-[11px] text-stone-500">Whisper local (gratis, offline) o Whisper API (cloud, mejor calidad)</div>
          </div>
        </div>

        {/* Local */}
        <div className="rounded-md border border-violet-200 bg-violet-50/60 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base">🖥️</span>
            <strong className="text-[13px] text-violet-900">Whisper local (recomendado para Casa 107)</strong>
          </div>
          <div className="text-[11px] text-stone-700">100% en tu navegador. <strong>Cero costos, cero datos enviados a terceros.</strong> Primera vez descarga el modelo desde Hugging Face (~75 MB). Después instantáneo y offline.</div>
          <label className="mt-2 block text-[10px] font-semibold uppercase tracking-wider text-stone-600">Modelo</label>
          <select value={modelo} onChange={e => setModelo(e.target.value)} className="w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-[12px]">
            {MODELS_DISPONIBLES.map(m => (
              <option key={m.id} value={m.id}>{m.label} · ~{m.sizeMB} MB</option>
            ))}
          </select>
        </div>

        {/* Cloud */}
        <div className="mt-3 rounded-md border border-stone-200 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base">☁️</span>
            <strong className="text-[13px] text-stone-800">Whisper API (OpenAI) — opcional</strong>
          </div>
          <div className="text-[11px] text-stone-600 mb-2">Mejor calidad para audios con ruido o varios hablantes. ~$0.36 USD por hora. Key se guarda solo en localStorage.</div>
          <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-stone-700">
            <li>Crea tu key en <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">platform.openai.com/api-keys</a></li>
            <li>Pega la key abajo (empieza con <code className="rounded bg-stone-100 px-1 font-mono text-[10px]">sk-…</code>)</li>
          </ol>
          <div className="mt-2 flex gap-1">
            <input
              type={show ? "text" : "password"}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-proj-…"
              className="flex-1 rounded border border-stone-300 bg-white px-2 py-1.5 font-mono text-[11px] focus:border-emerald-500 focus:outline-none"
            />
            <button onClick={() => setShow(s => !s)} className="rounded border border-stone-300 bg-white px-2 text-[11px] text-stone-600">{show ? "🙈" : "👁"}</button>
            <button onClick={probar} disabled={testing || !key.trim()} className="rounded border border-violet-300 bg-violet-50 px-2 text-[11px] font-medium text-violet-800 hover:bg-violet-100 disabled:opacity-40">
              {testing ? "…" : "Probar"}
            </button>
          </div>
          {test && (
            <div className={`mt-2 rounded-md border px-2 py-1 text-[11px] ${test.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
              {test.ok ? "✓ Conexión OK — key válida con saldo activo" : `✗ ${test.error}`}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
          <button onClick={guardar} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800">Guardar configuración</button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-stone-600">{label}</span>
    {children}
  </label>
);

export default Reuniones;
