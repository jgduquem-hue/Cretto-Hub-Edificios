import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Mic, MicOff, Square, Play, Pause, Calendar, Users, FileText,
  Sparkles, Plus, X, Clock, CheckCircle2, AlertCircle, Loader2,
  Download, Trash2, Search
} from "lucide-react";
import RaciNotifyModal from "./RaciNotify.jsx";

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

const Reuniones = ({ project, onAddPendientes, raciData }) => {
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

  const handleSave = (data) => {
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

    // Disparar RACI notify
    setRaciPayload({
      tipo: "reunion-acta",
      projectName: project?.nombre,
      titulo: `Acta guardada: ${saved.titulo}`,
      contexto: `${saved.fecha} · ${saved.actividades?.length || 0} actividades extraídas`,
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

      {modalOpen && <ReunionModal initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
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
const ReunionModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || {
    tipo: "comite-semanal", fecha: new Date().toISOString().slice(0, 10),
    titulo: "", duracionMin: "", asistentes: [], resumen: "", actividades: [],
    grabacionUrl: null, transcripcion: ""
  });
  const [tab, setTab] = useState("acta"); // acta | grabar | actividades
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [processing, setProcessing] = useState(false);
  const recIntRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

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
    setForm(f => ({
      ...f,
      actividades: [...(f.actividades || []), ...extractedAct],
      resumen: f.resumen || (lineas.slice(0, 3).join(". ") + (lineas.length > 3 ? "…" : ""))
    }));
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
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo">
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="inp">
                    {TIPOS_REUNION.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Fecha"><input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="inp" /></Field>
              </div>
              <Field label="Título"><input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="inp" placeholder="Ej. Comité semanal #19" /></Field>
              <Field label="Asistentes (separados por coma)">
                <input value={(form.asistentes || []).join(", ")} onChange={e => setForm({ ...form, asistentes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="inp" placeholder="Jose Duque, Sponsor, Constructor…" />
              </Field>
              <Field label="Resumen / temas tratados">
                <textarea value={form.resumen} onChange={e => setForm({ ...form, resumen: e.target.value })} rows={4} className="inp" placeholder="Avance, decisiones, riesgos, asuntos del cliente…" />
              </Field>
              <Field label="Transcripción / notas crudas (insumo para extracción)">
                <textarea value={form.transcripcion} onChange={e => setForm({ ...form, transcripcion: e.target.value })} rows={5} className="inp" placeholder="Pegar transcripción de la grabación o notas extensas. El sistema buscará verbos de compromiso para extraer actividades." />
              </Field>
              <button onClick={procesarGrabacion} disabled={processing || (!form.transcripcion && !form.resumen)} className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-violet-700 disabled:opacity-40">
                {processing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando…</> : <><Sparkles className="h-3.5 w-3.5" /> Extraer actividades del texto</>}
              </button>
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

              {form.grabacionUrl && (
                <div className="mt-6 w-full max-w-md rounded-md border border-stone-200 bg-stone-50 p-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Grabación lista</div>
                  <audio controls src={form.grabacionUrl} className="w-full" />
                  <div className="mt-2 flex gap-2">
                    <button onClick={procesarGrabacion} disabled={processing} className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-violet-700 disabled:opacity-40">
                      {processing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      {processing ? "Procesando…" : "Procesar grabación"}
                    </button>
                    <a href={form.grabacionUrl} download={`reunion-${form.fecha}.webm`} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[11px] text-stone-700 hover:bg-stone-50">
                      <Download className="h-3 w-3" /> Descargar
                    </a>
                  </div>
                  <div className="mt-2 text-[10px] text-stone-500">
                    💡 La transcripción automática se conecta cuando integremos un servicio (Whisper, AWS Transcribe). Por ahora, pegue la transcripción manualmente en el tab Acta y use "Extraer actividades".
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "actividades" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-stone-500">Cada actividad creada aquí se agrega al módulo de Pendientes al guardar.</div>
                <button onClick={addActividad} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-[11px] text-stone-700 hover:bg-stone-50">
                  <Plus className="h-3 w-3" /> Agregar
                </button>
              </div>
              {(form.actividades || []).length === 0 && (
                <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-[12px] text-stone-400">
                  Sin actividades. Usa "Extraer actividades" en el tab Acta o agrégalas manualmente.
                </div>
              )}
              {(form.actividades || []).map(a => (
                <div key={a.id} className="grid grid-cols-[1fr_140px_120px_auto] gap-2 rounded-md border border-stone-200 bg-white p-2">
                  <input value={a.descripcion} onChange={e => updateAct(a.id, { descripcion: e.target.value })} placeholder="Actividad / compromiso" className="rounded border border-stone-200 px-2 py-1 text-[12px] focus:border-emerald-500 focus:outline-none" />
                  <input value={a.responsable} onChange={e => updateAct(a.id, { responsable: e.target.value })} placeholder="Responsable" className="rounded border border-stone-200 px-2 py-1 text-[12px] focus:border-emerald-500 focus:outline-none" />
                  <input type="date" value={a.fecha} onChange={e => updateAct(a.id, { fecha: e.target.value })} className="rounded border border-stone-200 px-2 py-1 text-[12px] focus:border-emerald-500 focus:outline-none" />
                  <button onClick={() => removeAct(a.id)} className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
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
