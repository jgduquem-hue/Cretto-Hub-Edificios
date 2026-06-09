import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Image, Camera, Send, Plus, Trash2, Edit3, Calendar, Users,
  Mail, Phone, Building2, X, Eye, Download, Sparkles, Newspaper,
  CheckCircle2, Filter, Search, TrendingUp, FileText, Upload, AlertCircle, Copy
} from "lucide-react";
import { sendEmail, subjectFor, getEmailConfig } from "./emailService.js";

/* ────────────────────────────────────────────────────────────────
   Bitácora para inversionistas y clientes
   - Entradas semanales de bitácora con: fotos, % avance, noticias
   - Audiencias segmentadas: inversionistas, clientes (compradores),
     fiduciaria, banco, interno
   - Cada audiencia tiene su lista de contactos con intereses
   - Generador de newsletter HTML por audiencia
────────────────────────────────────────────────────────────────── */

const AUDIENCIAS = [
  { id: "inversionistas", label: "Inversionistas / Sponsors", color: "indigo",
    intereses: ["financiero", "preventas", "hitos", "riesgos"] },
  { id: "clientes",       label: "Clientes / Compradores",   color: "emerald",
    intereses: ["avance-obra", "fotos", "fechas-entrega", "fechas-escrituracion"] },
  { id: "fiduciaria",     label: "Fiduciaria",               color: "violet",
    intereses: ["financiero", "preventas", "hitos", "legal"] },
  { id: "banco",          label: "Banco financiador",        color: "blue",
    intereses: ["financiero", "avance-obra", "hitos", "preventas"] },
  { id: "interno",        label: "Equipo interno",           color: "stone",
    intereses: ["avance-obra", "riesgos", "pendientes", "decisiones"] }
];

const INTERESES = [
  { id: "avance-obra",          label: "Avance de obra" },
  { id: "fotos",                label: "Fotos de avance" },
  { id: "financiero",           label: "Financiero" },
  { id: "preventas",            label: "Preventas / Ventas" },
  { id: "hitos",                label: "Hitos gerenciales" },
  { id: "fechas-entrega",       label: "Fechas de entrega" },
  { id: "fechas-escrituracion", label: "Escrituración" },
  { id: "riesgos",              label: "Riesgos y alertas" },
  { id: "pendientes",           label: "Pendientes críticos" },
  { id: "decisiones",           label: "Decisiones" },
  { id: "legal",                label: "Legal / Licencias" }
];

const COLOR_CLASS = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  indigo:  "bg-indigo-100 text-indigo-800 border-indigo-200",
  violet:  "bg-violet-100 text-violet-800 border-violet-200",
  blue:    "bg-blue-100 text-blue-800 border-blue-200",
  stone:   "bg-stone-100 text-stone-700 border-stone-200",
  amber:   "bg-amber-100 text-amber-800 border-amber-200",
  rose:    "bg-rose-100 text-rose-800 border-rose-200"
};

const SEED_CONTACTOS = [
  { id: 1, nombre: "Juan Ramírez",       organizacion: "Capital Partners",     audiencia: "inversionistas", email: "jr@capital.co",   telefono: "+57 310 555 0001", intereses: ["financiero", "preventas", "hitos", "riesgos"], aporteCop: 800000000, pctAporte: 25 },
  { id: 2, nombre: "Carolina Mejía",     organizacion: "Familia Mejía",        audiencia: "inversionistas", email: "cm@familia.co",   telefono: "+57 315 555 0002", intereses: ["financiero", "hitos"], aporteCop: 500000000, pctAporte: 15 },
  { id: 3, nombre: "Andrés López",       organizacion: "Comprador apto 502",   audiencia: "clientes",       email: "al@gmail.com",    telefono: "+57 320 555 0010", intereses: ["avance-obra", "fotos", "fechas-entrega"] },
  { id: 4, nombre: "María Pérez",        organizacion: "Comprador apto 803",   audiencia: "clientes",       email: "mp@gmail.com",    telefono: "+57 311 555 0011", intereses: ["fotos", "fechas-entrega", "fechas-escrituracion"] },
  { id: 5, nombre: "Fiduciaria Bogotá",  organizacion: "Coord. P.A. Versalles",audiencia: "fiduciaria",     email: "pa@fidubogota.co",telefono: "+57 1 555 0020",   intereses: ["financiero", "preventas", "hitos", "legal"] },
  { id: 6, nombre: "Bancolombia BC",     organizacion: "Crédito constructor",  audiencia: "banco",          email: "cc@bancolombia.co",telefono: "+57 1 555 0030",  intereses: ["financiero", "avance-obra", "hitos"] }
];

const SEED_ENTRADAS = [
  {
    id: 1, fecha: "2026-05-22", semana: 18, titulo: "Avance semanal #18",
    avancePct: 64, avancePctAnterior: 61, autor: "PM Cretto",
    bloques: [
      { id: 1, tipo: "noticia",    interes: "hitos",       titulo: "Punto de equilibrio alcanzado (72% preventas)", contenido: "Se alcanzó el punto de equilibrio con 43 unidades vendidas. Fiduciaria habilita desembolsos al constructor." },
      { id: 2, tipo: "noticia",    interes: "avance-obra", titulo: "Estructura piso 8 fundida", contenido: "Se completó la fundida del piso 8. Avance estructura: 67%. En cronograma." },
      { id: 3, tipo: "foto",       interes: "fotos",       titulo: "Fundida losa piso 8",    url: "https://placehold.co/600x400/2d5a3d/fff?text=Fundida+Piso+8" },
      { id: 4, tipo: "foto",       interes: "fotos",       titulo: "Fachada en montaje",     url: "https://placehold.co/600x400/3a4f63/fff?text=Fachada" },
      { id: 5, tipo: "kpi",        interes: "financiero",  titulo: "Ejecución CAPEX",        valor: "$ 19.500 MM / $ 30.000 MM (65%)" },
      { id: 6, tipo: "kpi",        interes: "preventas",   titulo: "Preventas",              valor: "43 / 60 unidades (72%)" },
      { id: 7, tipo: "alerta",     interes: "riesgos",     titulo: "Riesgo: importación ventanería", contenido: "Demora reportada por proveedor de aluminio. Mitigación: pedido anticipado y alternativa local." }
    ]
  }
];

/* Mapping stakeholder.tipos → audiencia bitácora */
const TIPO_TO_AUDIENCIA = {
  inversionista: "inversionistas",
  comprador:     "clientes",
  fiducia:       "fiduciaria",
  banco:         "banco",
  interno:       "interno"
};
const tipoAAudiencia = (tipos = []) => {
  for (const t of tipos) if (TIPO_TO_AUDIENCIA[t]) return TIPO_TO_AUDIENCIA[t];
  return null;
};

const BitacoraInversionistas = ({ project, stakeholders = [], onEditStakeholder }) => {
  const [entradas, setEntradas] = useState(SEED_ENTRADAS);
  const [contactosLegacy, setContactosLegacy] = useState(SEED_CONTACTOS);
  /* Extras bitácora-only (intereses, aporte, pctAporte) keyed por stakeholderId */
  const [extras, setExtras] = useState({});
  const [tab, setTab] = useState("bitacora");
  const [entryModal, setEntryModal] = useState(null);
  const [contactModal, setContactModal] = useState(null);
  const [newsletterTarget, setNewsletterTarget] = useState(null);

  /* Si hay stakeholders, derivamos los contactos desde ahí + mergeamos extras locales.
     Si no, usamos los SEED_CONTACTOS legacy (compat con proyectos viejos). */
  const fuenteEsDB = stakeholders.length > 0;
  const contactos = useMemo(() => {
    if (!fuenteEsDB) return contactosLegacy;
    return stakeholders
      .map(s => {
        const aud = tipoAAudiencia(s.tipos);
        if (!aud) return null;
        const principal = (s.contactos || []).find(c => c.esPrincipal) || (s.contactos || [])[0];
        const ex = extras[s.id] || {};
        return {
          id: s.id,
          _stakeholderId: s.id,
          nombre: s.nombre,
          organizacion: s.esEmpresa ? (s.razonSocial || s.nombre) : (s.especialidad || ""),
          audiencia: aud,
          email: s.email || principal?.email || "",
          telefono: s.telefono || principal?.telefono || "",
          intereses: ex.intereses || [],
          aporteCop: ex.aporteCop || s.aporteCop || 0,
          pctAporte: ex.pctAporte || s.pctParticipacion || 0
        };
      })
      .filter(Boolean);
  }, [fuenteEsDB, stakeholders, extras, contactosLegacy]);

  /* Persistencia */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r1 = await window.storage.get(`crettohub:bitacora:${project?.id || "default"}`);
        if (m && r1 && r1.value) setEntradas(JSON.parse(r1.value));
        const r2 = await window.storage.get(`crettohub:contactos:${project?.id || "default"}`);
        if (m && r2 && r2.value) setContactosLegacy(JSON.parse(r2.value));
        const r3 = await window.storage.get(`crettohub:contactos-extras:${project?.id || "default"}`);
        if (m && r3 && r3.value) setExtras(JSON.parse(r3.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:bitacora:${project?.id || "default"}`, JSON.stringify(entradas)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [entradas, project?.id]);

  /* Solo persistimos los contactos legacy si no hay DB */
  useEffect(() => {
    if (fuenteEsDB) return;
    const t = setTimeout(() => {
      window.storage.set(`crettohub:contactos:${project?.id || "default"}`, JSON.stringify(contactosLegacy)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [contactosLegacy, project?.id, fuenteEsDB]);

  /* Extras bitácora-only (intereses, aporte) — siempre se guardan */
  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:contactos-extras:${project?.id || "default"}`, JSON.stringify(extras)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [extras, project?.id]);

  const upsertEntrada = (data) => {
    if (data.id && entradas.find(e => e.id === data.id)) {
      setEntradas(prev => prev.map(e => e.id === data.id ? data : e));
    } else {
      const id = Math.max(0, ...entradas.map(e => e.id)) + 1;
      setEntradas(prev => [{ ...data, id }, ...prev]);
    }
    setEntryModal(null);
  };

  const upsertContacto = (data) => {
    if (fuenteEsDB) {
      /* En modo DB solo guardamos los extras (intereses, aporte) keyed por stakeholderId.
         Nombre/email/teléfono siempre vienen de la DB. */
      const sid = data._stakeholderId || data.id;
      setExtras(prev => ({
        ...prev,
        [sid]: { intereses: data.intereses || [], aporteCop: data.aporteCop || 0, pctAporte: data.pctAporte || 0 }
      }));
    } else {
      if (data.id && contactosLegacy.find(c => c.id === data.id)) {
        setContactosLegacy(prev => prev.map(c => c.id === data.id ? data : c));
      } else {
        const id = Math.max(0, ...contactosLegacy.map(c => c.id)) + 1;
        setContactosLegacy(prev => [...prev, { ...data, id }]);
      }
    }
    setContactModal(null);
  };

  const removeContacto = (id) => {
    if (fuenteEsDB) {
      alert("Para eliminar este stakeholder, ve a la Base de Stakeholders.");
      return;
    }
    setContactosLegacy(prev => prev.filter(c => c.id !== id));
  };

  const stats = useMemo(() => {
    const ult = entradas[0];
    return {
      ultima: ult?.fecha || "—",
      avance: ult?.avancePct || 0,
      delta: ult ? ult.avancePct - (ult.avancePctAnterior || 0) : 0,
      entradas: entradas.length,
      contactos: contactos.length,
      porAudiencia: AUDIENCIAS.reduce((acc, a) => ({ ...acc, [a.id]: contactos.filter(c => c.audiencia === a.id).length }), {})
    };
  }, [entradas, contactos]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Bitácora · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Bitácora para inversionistas y clientes</h1>
          <p className="mt-1 text-sm text-stone-500">Fotos de avance, % de obra, noticias semanales y newsletter segmentado por audiencia.</p>
        </div>
      </header>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        <Kpi label="Última entrada" value={stats.ultima} />
        <Kpi label="% avance" value={`${stats.avance}%`} extra={stats.delta > 0 ? `+${stats.delta} pp` : ""} color="emerald" />
        <Kpi label="Entradas" value={stats.entradas} />
        <Kpi label="Contactos" value={stats.contactos} />
        <Kpi label="Audiencias" value={AUDIENCIAS.length} />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex border-b border-stone-200">
        {[
          { id: "bitacora", label: `Bitácora (${entradas.length})`, icon: Newspaper },
          { id: "contactos", label: `Contactos (${contactos.length})`, icon: Users },
          { id: "newsletter", label: "Generar newsletter", icon: Send }
        ].map(t => {
          const Ic = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-medium ${tab === t.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
              <Ic className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "bitacora" && (
        <BitacoraTab entradas={entradas} onNew={() => setEntryModal({})} onEdit={(e) => setEntryModal(e)} onDelete={(id) => setEntradas(prev => prev.filter(e => e.id !== id))} onSend={(entrada) => { setTab("newsletter"); setNewsletterTarget({ entrada, audiencia: null }); }} />
      )}
      {tab === "contactos" && (
        <ContactosTab
          contactos={contactos}
          onNew={() => fuenteEsDB ? (onEditStakeholder && onEditStakeholder(null)) : setContactModal({})}
          onEdit={(c) => fuenteEsDB ? (onEditStakeholder && onEditStakeholder(c._stakeholderId)) : setContactModal(c)}
          onEditIntereses={(c) => setContactModal(c)}
          onDelete={removeContacto}
          statsAudiencia={stats.porAudiencia}
          fuenteEsDB={fuenteEsDB}
        />
      )}
      {tab === "newsletter" && (
        <NewsletterTab entradas={entradas} contactos={contactos} target={newsletterTarget} setTarget={setNewsletterTarget} project={project} />
      )}

      {entryModal !== null && <EntryModal initial={entryModal.id ? entryModal : null} onClose={() => setEntryModal(null)} onSave={upsertEntrada} />}
      {contactModal !== null && <ContactModal initial={contactModal.id ? contactModal : null} onClose={() => setContactModal(null)} onSave={upsertContacto} />}
    </div>
  );
};

/* ─── KPIs ─── */
const Kpi = ({ label, value, color = "stone", extra }) => {
  const colors = {
    stone: "bg-stone-50 text-stone-800 border-stone-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200"
  };
  return (
    <div className={`rounded-md border p-3 ${colors[color]}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="font-serif text-2xl">{value}</div>
      {extra && <div className="text-[10px] text-emerald-700">{extra}</div>}
    </div>
  );
};

/* ─── Tab: Bitácora ─── */
const BitacoraTab = ({ entradas, onNew, onEdit, onDelete, onSend }) => (
  <div className="space-y-3">
    <div className="flex justify-end">
      <button onClick={onNew} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800">
        <Plus className="h-3.5 w-3.5" /> Nueva entrada
      </button>
    </div>
    {entradas.length === 0 && <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-stone-400">Sin entradas de bitácora.</div>}
    {entradas.map(e => (
      <div key={e.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">Semana {e.semana}</span>
              <h3 className="font-serif text-lg text-stone-900">{e.titulo}</h3>
              <span className="text-[11px] text-stone-500">{e.fecha} · {e.autor}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[12px]">
                <span className="font-serif text-2xl text-emerald-700">{e.avancePct}%</span>
                <span className="text-stone-500">avance</span>
                {e.avancePctAnterior != null && (
                  <span className="text-[10px] text-emerald-600">+{e.avancePct - e.avancePctAnterior} pp vs semana anterior</span>
                )}
              </div>
              <div className="h-2 flex-1 rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${e.avancePct}%` }} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button onClick={() => onSend(e)} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-800">
              <Send className="h-3 w-3" /> Enviar
            </button>
            <button onClick={() => onEdit(e)} className="rounded-md border border-stone-200 bg-white px-2 py-1 text-[11px] text-stone-600 hover:bg-stone-50">Editar</button>
            <button onClick={() => onDelete(e.id)} className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {/* Bloques */}
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {(e.bloques || []).map(b => <BloqueCard key={b.id} bloque={b} />)}
        </div>
      </div>
    ))}
  </div>
);

const BloqueCard = ({ bloque }) => {
  if (bloque.tipo === "foto") {
    return (
      <div className="overflow-hidden rounded-md border border-stone-200">
        <img src={bloque.url} alt={bloque.titulo} className="h-44 w-full object-cover" onError={(ev) => { ev.target.style.display = "none"; }} />
        <div className="px-2 py-1 text-[11px] text-stone-600">📷 {bloque.titulo}</div>
      </div>
    );
  }
  if (bloque.tipo === "kpi") {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-2">
        <div className="text-[10px] uppercase tracking-wider text-emerald-700">{bloque.titulo}</div>
        <div className="font-mono text-sm font-semibold text-emerald-900">{bloque.valor}</div>
      </div>
    );
  }
  if (bloque.tipo === "alerta") {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50/40 p-2">
        <div className="text-[11px] font-semibold text-rose-800">⚠ {bloque.titulo}</div>
        <div className="text-[11px] text-rose-700">{bloque.contenido}</div>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-stone-200 bg-white p-2">
      <div className="text-[11px] font-semibold text-stone-800">{bloque.titulo}</div>
      <div className="text-[11px] text-stone-600">{bloque.contenido}</div>
      <div className="mt-1 text-[9px] uppercase tracking-wider text-stone-400">{(INTERESES.find(i => i.id === bloque.interes) || {}).label}</div>
    </div>
  );
};

/* ─── Tab: Contactos ─── */
const ContactosTab = ({ contactos, onNew, onEdit, onEditIntereses, onDelete, statsAudiencia, fuenteEsDB }) => {
  const [filtro, setFiltro] = useState("all");
  const [query, setQuery] = useState("");
  const filtered = contactos.filter(c => {
    if (filtro !== "all" && c.audiencia !== filtro) return false;
    if (query) {
      const q = query.toLowerCase();
      return c.nombre.toLowerCase().includes(q) || c.organizacion.toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q);
    }
    return true;
  });
  return (
    <div className="space-y-3">
      {fuenteEsDB && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] text-blue-900">
          📌 <strong>Fuente única:</strong> los contactos vienen de la <strong>Base de Stakeholders</strong> (tipos inversionista, comprador, fiducia, banco, interno). Nombre, email y teléfono se editan ahí. Los <strong>intereses</strong> y <strong>aporte</strong> son específicos de la bitácora y se editan acá con el botón ✎.
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setFiltro("all")} className={`rounded-full border px-2.5 py-1 text-[11px] ${filtro === "all" ? "bg-stone-700 text-white border-stone-700" : "bg-white border-stone-200 text-stone-600"}`}>Todos ({contactos.length})</button>
        {AUDIENCIAS.map(a => (
          <button key={a.id} onClick={() => setFiltro(a.id)} className={`rounded-full border px-2.5 py-1 text-[11px] ${filtro === a.id ? COLOR_CLASS[a.color] : "bg-white border-stone-200 text-stone-600"}`}>
            {a.label} ({statsAudiencia[a.id] || 0})
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar…" className="rounded-md border border-stone-300 bg-white py-1 pl-7 pr-2 text-[12px] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <button onClick={onNew} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800">
          <Plus className="h-3.5 w-3.5" /> {fuenteEsDB ? "Nuevo en DB →" : "Nuevo contacto"}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Organización</th>
              <th className="px-3 py-2 text-left">Audiencia</th>
              <th className="px-3 py-2 text-left">Contacto</th>
              <th className="px-3 py-2 text-left">Intereses</th>
              <th className="px-3 py-2 text-right">Aporte</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const aud = AUDIENCIAS.find(a => a.id === c.audiencia) || AUDIENCIAS[0];
              return (
                <tr key={c.id} className="border-t border-stone-100 hover:bg-stone-50/60">
                  <td className="px-3 py-2 font-medium text-stone-900">
                    <button onClick={() => onEdit(c)} className="text-left">{c.nombre}</button>
                  </td>
                  <td className="px-3 py-2 text-stone-700">{c.organizacion}</td>
                  <td className="px-3 py-2"><span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${COLOR_CLASS[aud.color]}`}>{aud.label}</span></td>
                  <td className="px-3 py-2 text-[11px] text-stone-600">
                    {c.email && <div className="inline-flex items-center gap-0.5"><Mail className="h-3 w-3" /> {c.email}</div>}
                    {c.telefono && <div className="inline-flex items-center gap-0.5"><Phone className="h-3 w-3" /> {c.telefono}</div>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-0.5">
                      {(c.intereses || []).slice(0, 4).map(i => <span key={i} className="rounded bg-stone-100 px-1 py-0.5 text-[9px] text-stone-600">{(INTERESES.find(x => x.id === i) || {}).label || i}</span>)}
                      {(c.intereses || []).length > 4 && <span className="text-[9px] text-stone-400">+{c.intereses.length - 4}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-[11px] text-stone-600">{c.pctAporte ? `${c.pctAporte}%` : "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      {fuenteEsDB && (
                        <button onClick={() => onEditIntereses(c)} className="rounded p-1 text-stone-500 hover:bg-stone-100" title="Editar intereses y aporte (bitácora)"><Plus className="h-3.5 w-3.5 rotate-45" /></button>
                      )}
                      <button onClick={() => onDelete(c.id)} className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600" title={fuenteEsDB ? "Eliminar (en DB)" : "Eliminar contacto"}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── Tab: Newsletter ─── */
const NewsletterTab = ({ entradas, contactos, target, setTarget, project }) => {
  const [audSel, setAudSel] = useState(target?.audiencia || "inversionistas");
  const [entradaId, setEntradaId] = useState(target?.entrada?.id || entradas[0]?.id);
  const [sent, setSent] = useState(false);

  const entrada = useMemo(() => entradas.find(e => e.id === entradaId), [entradas, entradaId]);
  const audCfg = AUDIENCIAS.find(a => a.id === audSel) || AUDIENCIAS[0];
  const destinatarios = contactos.filter(c => c.audiencia === audSel);

  /* Filtrar bloques por intereses de la audiencia */
  const bloquesFiltrados = useMemo(() => {
    if (!entrada) return [];
    return (entrada.bloques || []).filter(b => audCfg.intereses.includes(b.interes));
  }, [entrada, audCfg]);

  /* Filtrar destinatarios — sólo los con al menos un interés que coincida con los bloques de la entrada */
  const destFinales = useMemo(() => {
    const interesesEntrada = new Set(bloquesFiltrados.map(b => b.interes));
    return destinatarios.filter(c => (c.intereses || []).some(i => interesesEntrada.has(i)) || (c.intereses || []).length === 0);
  }, [destinatarios, bloquesFiltrados]);

  if (entradas.length === 0) {
    return <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-stone-400">Crea primero una entrada de bitácora para generar un newsletter.</div>;
  }

  const [sendResult, setSendResult] = useState(null);

  /* Construye HTML del newsletter para envío */
  const buildHtml = () => {
    if (!entrada) return "";
    const bloquesHtml = bloquesFiltrados.map(b => {
      if (b.tipo === "foto") return `<div style="margin:16px 0"><img src="${b.url}" alt="" style="width:100%;border-radius:6px"><div style="text-align:center;font-size:11px;color:#78716c;font-style:italic;margin-top:4px">${esc(b.titulo)}</div></div>`;
      if (b.tipo === "kpi") return `<div style="margin:12px 0;border:1px solid #a7f3d0;background:#ecfdf5;border-radius:6px;padding:12px;text-align:center"><div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#059669">${esc(b.titulo)}</div><div style="font-family:Georgia,serif;font-size:20px;color:#064e3b">${esc(b.valor)}</div></div>`;
      if (b.tipo === "alerta") return `<div style="margin:12px 0;border-left:4px solid #f43f5e;background:#fff1f2;padding:12px;border-radius:0 6px 6px 0"><div style="font-size:12px;font-weight:600;color:#9f1239">⚠ ${esc(b.titulo)}</div><div style="font-size:11px;color:#be123c;margin-top:4px">${esc(b.contenido)}</div></div>`;
      return `<div style="margin:16px 0"><h4 style="font-size:14px;color:#1c1917;margin:0 0 4px">${esc(b.titulo)}</h4><p style="font-size:12px;line-height:1.6;color:#44403c;margin:0">${esc(b.contenido)}</p></div>`;
    }).join("");

    return `<!DOCTYPE html><html><body style="font-family:system-ui,-apple-system,sans-serif;background:#fafaf9;margin:0;padding:20px">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e7e5e4;border-radius:8px;padding:24px">
        <div style="border-bottom:1px solid #e7e5e4;padding-bottom:12px;margin-bottom:16px">
          <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#059669">${esc(project?.nombre || "Proyecto")} · Bitácora</div>
          <h2 style="font-family:Georgia,serif;font-size:24px;margin:4px 0 4px;color:#1c1917">${esc(entrada.titulo)}</h2>
          <div style="font-size:11px;color:#78716c">${esc(entrada.fecha)} · Semana ${esc(entrada.semana)} · Para: ${esc(audCfg.label)}</div>
        </div>
        <div style="background:#ecfdf5;border-radius:6px;padding:16px;text-align:center;margin-bottom:16px">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#059669">Avance general</div>
          <div style="font-family:Georgia,serif;font-size:40px;color:#064e3b">${entrada.avancePct}%</div>
          <div style="height:8px;border-radius:4px;background:#d1fae5;margin-top:8px;overflow:hidden"><div style="height:100%;background:#059669;width:${entrada.avancePct}%"></div></div>
        </div>
        ${bloquesHtml}
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e7e5e4;text-align:center;font-size:10px;color:#78716c">
          Elaborado por Cretto · Gerencia de Proyectos<br>Para preguntas: responde a este correo.
        </div>
      </div></body></html>`;
  };

  const handleSend = async () => {
    if (destFinales.length === 0) return;
    const emails = destFinales.map(d => d.email).filter(Boolean);
    if (emails.length === 0) {
      setSendResult({ ok: false, msg: "Ningún destinatario tiene email configurado." });
      return;
    }
    const cfg = getEmailConfig();
    const html = buildHtml();
    const res = await sendEmail({
      to: emails,
      bcc: cfg.bcc,
      subject: subjectFor({ projectName: project?.nombre, tipo: `Bitácora ${audCfg.label}`, titulo: entrada?.titulo }),
      body: `${entrada?.titulo}\n\nAvance: ${entrada?.avancePct}%\n\nVer correo en HTML para detalles.`,
      html,
      config: cfg
    });
    setSendResult({ ok: res.success, msg: res.success ? (res.note || `Enviado vía ${res.method} a ${emails.length} destinatario(s)`) : (res.error || "Error en envío") });
    if (res.success) {
      setSent(true);
      setTimeout(() => { setSent(false); setSendResult(null); }, 3000);
    }
  };

  const handleCopyHtml = async () => {
    const html = buildHtml();
    const res = await sendEmail({ driver: "clipboard", html });
    setSendResult({ ok: res.success, msg: res.success ? (res.note || "HTML copiado") : (res.error || "Error copiando") });
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
      {/* Configuración */}
      <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-4">
        <h3 className="font-serif text-base text-stone-900">Configurar envío</h3>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-600">Entrada de bitácora</label>
          <select value={entradaId} onChange={e => setEntradaId(parseInt(e.target.value))} className="mt-1 w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm">
            {entradas.map(e => <option key={e.id} value={e.id}>{e.titulo} ({e.fecha})</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-600">Audiencia</label>
          <div className="mt-1 space-y-1">
            {AUDIENCIAS.map(a => (
              <button key={a.id} onClick={() => setAudSel(a.id)} className={`flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-[12px] ${audSel === a.id ? COLOR_CLASS[a.color] + " border-current" : "border-stone-200 bg-white hover:bg-stone-50"}`}>
                <span>{a.label}</span>
                <span className="text-[10px] text-stone-500">{contactos.filter(c => c.audiencia === a.id).length}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-md bg-stone-50 p-2 text-[11px] text-stone-600">
          <div className="font-semibold">Filtrado inteligente</div>
          <div>Sólo se incluyen bloques con intereses: {audCfg.intereses.map(i => (INTERESES.find(x => x.id === i) || {}).label).filter(Boolean).join(" · ")}</div>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-600">Destinatarios ({destFinales.length})</div>
          <div className="mt-1 max-h-32 space-y-0.5 overflow-y-auto">
            {destFinales.map(d => (
              <div key={d.id} className="text-[11px] text-stone-700">{d.nombre} <span className="text-stone-400">· {d.email}</span></div>
            ))}
            {destFinales.length === 0 && <div className="text-[11px] italic text-stone-400">Sin destinatarios coincidentes</div>}
          </div>
        </div>
        <button onClick={handleSend} disabled={destFinales.length === 0 || sent} className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-[13px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">
          {sent ? <><CheckCircle2 className="h-4 w-4" /> Enviado</> : <><Send className="h-4 w-4" /> Enviar a {destFinales.length} contacto(s)</>}
        </button>
        <button onClick={handleCopyHtml} disabled={!entrada} className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40">
          <Copy className="h-3.5 w-3.5" /> Copiar HTML al portapapeles
        </button>
        {sendResult && (
          <div className={`mt-2 rounded-md p-2 text-[11px] ${sendResult.ok ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-rose-200 bg-rose-50 text-rose-800"}`}>
            {sendResult.ok ? <CheckCircle2 className="mr-1 inline h-3 w-3" /> : <AlertCircle className="mr-1 inline h-3 w-3" />}
            {sendResult.msg}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between border-b border-stone-200 pb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-stone-600">Preview newsletter · {audCfg.label}</h3>
          <span className="text-[10px] text-stone-400">{bloquesFiltrados.length} bloques relevantes</span>
        </div>
        <NewsletterPreview entrada={entrada} bloques={bloquesFiltrados} audiencia={audCfg} project={project} />
      </div>
    </div>
  );
};

const NewsletterPreview = ({ entrada, bloques, audiencia, project }) => {
  if (!entrada) return null;
  return (
    <div className="rounded-md bg-stone-50 p-4">
      <div className="mx-auto max-w-2xl rounded-md bg-white p-5 shadow-sm">
        <div className="border-b border-stone-200 pb-3">
          <div className="text-[10px] uppercase tracking-[0.15em] text-emerald-700">{project?.nombre || "Proyecto"} · Bitácora</div>
          <h2 className="font-serif text-2xl text-stone-900">{entrada.titulo}</h2>
          <div className="text-[11px] text-stone-500">{entrada.fecha} · Semana {entrada.semana} · Para: {audiencia.label}</div>
        </div>

        <div className="my-4 rounded-md bg-emerald-50 p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-emerald-700">Avance general</div>
          <div className="font-serif text-4xl text-emerald-800">{entrada.avancePct}%</div>
          <div className="mt-2 h-2 rounded-full bg-emerald-100">
            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${entrada.avancePct}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          {bloques.length === 0 && (
            <div className="rounded-md bg-amber-50 p-3 text-[12px] text-amber-800">⚠ No hay bloques que coincidan con los intereses de esta audiencia. Considera agregar contenido relevante a la entrada o ajustar los intereses.</div>
          )}
          {bloques.map(b => <BloqueNewsletter key={b.id} bloque={b} />)}
        </div>

        <div className="mt-5 border-t border-stone-200 pt-3 text-center text-[10px] text-stone-500">
          Elaborado por Cretto · Gerencia de Proyectos<br />
          Para preguntas: responde a este correo o llama a tu PM.
        </div>
      </div>
    </div>
  );
};

const BloqueNewsletter = ({ bloque }) => {
  if (bloque.tipo === "foto") {
    return (
      <div>
        <img src={bloque.url} alt={bloque.titulo} className="w-full rounded-md object-cover" />
        <div className="mt-1 text-center text-[11px] italic text-stone-500">{bloque.titulo}</div>
      </div>
    );
  }
  if (bloque.tipo === "kpi") {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50/60 p-3 text-center">
        <div className="text-[10px] uppercase tracking-wider text-emerald-700">{bloque.titulo}</div>
        <div className="font-serif text-xl text-emerald-900">{bloque.valor}</div>
      </div>
    );
  }
  if (bloque.tipo === "alerta") {
    return (
      <div className="rounded-md border-l-4 border-rose-500 bg-rose-50 p-3">
        <div className="text-[11px] font-semibold text-rose-800">⚠ {bloque.titulo}</div>
        <div className="text-[11px] text-rose-700">{bloque.contenido}</div>
      </div>
    );
  }
  return (
    <div>
      <h4 className="text-[13px] font-semibold text-stone-900">{bloque.titulo}</h4>
      <p className="text-[12px] leading-relaxed text-stone-700">{bloque.contenido}</p>
    </div>
  );
};

/* ─── Modal: Entrada de bitácora ─── */
const EntryModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || {
    fecha: new Date().toISOString().slice(0, 10), semana: "", titulo: "",
    avancePct: 0, avancePctAnterior: 0, autor: "PM Cretto", bloques: []
  });

  const addBloque = (tipo) => {
    setForm(f => ({
      ...f,
      bloques: [...(f.bloques || []), {
        id: Date.now(), tipo, interes: tipo === "foto" ? "fotos" : "avance-obra",
        titulo: "", contenido: "", valor: "", url: ""
      }]
    }));
  };
  const updateBloque = (id, patch) => setForm(f => ({ ...f, bloques: f.bloques.map(b => b.id === id ? { ...b, ...patch } : b) }));
  const removeBloque = (id) => setForm(f => ({ ...f, bloques: f.bloques.filter(b => b.id !== id) }));

  const handleImageUpload = (id, file) => {
    const reader = new FileReader();
    reader.onload = (ev) => updateBloque(id, { url: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">{initial ? "Editar entrada" : "Nueva entrada de bitácora"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Fecha"><input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="inp" /></Field>
              <Field label="Semana #"><input type="number" value={form.semana} onChange={e => setForm({ ...form, semana: parseInt(e.target.value) || "" })} className="inp" /></Field>
              <Field label="Autor"><input value={form.autor} onChange={e => setForm({ ...form, autor: e.target.value })} className="inp" /></Field>
            </div>
            <Field label="Título"><input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="inp" placeholder="Ej. Avance semanal #19" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="% avance actual"><input type="number" min="0" max="100" value={form.avancePct} onChange={e => setForm({ ...form, avancePct: parseInt(e.target.value) || 0 })} className="inp" /></Field>
              <Field label="% avance semana anterior"><input type="number" min="0" max="100" value={form.avancePctAnterior} onChange={e => setForm({ ...form, avancePctAnterior: parseInt(e.target.value) || 0 })} className="inp" /></Field>
            </div>

            <div className="rounded-md border border-stone-200 bg-stone-50/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-600">Bloques de contenido ({form.bloques?.length || 0})</div>
                <div className="flex gap-1">
                  <button onClick={() => addBloque("noticia")} className="rounded border border-stone-300 bg-white px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-50">+ Noticia</button>
                  <button onClick={() => addBloque("foto")} className="rounded border border-stone-300 bg-white px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-50">+ Foto</button>
                  <button onClick={() => addBloque("kpi")} className="rounded border border-stone-300 bg-white px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-50">+ KPI</button>
                  <button onClick={() => addBloque("alerta")} className="rounded border border-stone-300 bg-white px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-50">+ Alerta</button>
                </div>
              </div>
              <div className="space-y-2">
                {(form.bloques || []).map(b => (
                  <div key={b.id} className="rounded border border-stone-200 bg-white p-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-stone-600">{b.tipo}</span>
                      <select value={b.interes} onChange={e => updateBloque(b.id, { interes: e.target.value })} className="flex-1 rounded border border-stone-200 px-1 py-0.5 text-[11px]">
                        {INTERESES.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                      </select>
                      <button onClick={() => removeBloque(b.id)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    <input value={b.titulo} onChange={e => updateBloque(b.id, { titulo: e.target.value })} placeholder="Título" className="mt-1 w-full rounded border border-stone-200 px-2 py-1 text-[12px]" />
                    {b.tipo === "kpi" && <input value={b.valor} onChange={e => updateBloque(b.id, { valor: e.target.value })} placeholder="Valor (ej. $19.500 MM / 65%)" className="mt-1 w-full rounded border border-stone-200 px-2 py-1 text-[12px]" />}
                    {(b.tipo === "noticia" || b.tipo === "alerta") && <textarea value={b.contenido} onChange={e => updateBloque(b.id, { contenido: e.target.value })} placeholder="Contenido" rows={2} className="mt-1 w-full rounded border border-stone-200 px-2 py-1 text-[12px]" />}
                    {b.tipo === "foto" && (
                      <div className="mt-1 space-y-1">
                        <input value={b.url} onChange={e => updateBloque(b.id, { url: e.target.value })} placeholder="URL de imagen o cargar archivo abajo" className="w-full rounded border border-stone-200 px-2 py-1 text-[12px]" />
                        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(b.id, e.target.files[0])} className="text-[10px]" />
                        {b.url && <img src={b.url} alt="" className="h-20 w-full rounded object-cover" />}
                      </div>
                    )}
                  </div>
                ))}
                {(!form.bloques || form.bloques.length === 0) && <div className="text-center text-[11px] italic text-stone-400">Agrega bloques con los botones de arriba.</div>}
              </div>
            </div>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
          <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!form.titulo.trim()} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">Guardar</button>
        </footer>
        <style>{`.inp{width:100%;border:1px solid rgb(214,211,209);background:#fff;padding:6px 10px;font-size:13px;border-radius:6px}.inp:focus{outline:none;border-color:rgb(16,185,129);box-shadow:0 0 0 1px rgb(16,185,129)}`}</style>
      </div>
    </div>
  );
};

/* ─── Modal: Contacto ─── */
const ContactModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || {
    nombre: "", organizacion: "", audiencia: "inversionistas",
    email: "", telefono: "", intereses: [], aporteCop: "", pctAporte: ""
  });
  const toggleInteres = (id) => setForm(f => ({
    ...f,
    intereses: f.intereses.includes(id) ? f.intereses.filter(x => x !== id) : [...f.intereses, id]
  }));
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">{initial ? "Editar contacto" : "Nuevo contacto"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" required><input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="inp" /></Field>
            <Field label="Organización"><input value={form.organizacion} onChange={e => setForm({ ...form, organizacion: e.target.value })} className="inp" /></Field>
          </div>
          <Field label="Audiencia">
            <select value={form.audiencia} onChange={e => setForm({ ...form, audiencia: e.target.value })} className="inp">
              {AUDIENCIAS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="inp" /></Field>
            <Field label="Teléfono"><input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="inp" placeholder="+57 …" /></Field>
          </div>
          {form.audiencia === "inversionistas" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Aporte (COP)"><input type="number" value={form.aporteCop} onChange={e => setForm({ ...form, aporteCop: e.target.value })} className="inp" /></Field>
              <Field label="% participación"><input type="number" value={form.pctAporte} onChange={e => setForm({ ...form, pctAporte: e.target.value })} className="inp" /></Field>
            </div>
          )}
          <div>
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-stone-600">Intereses para segmentación</span>
            <div className="flex flex-wrap gap-1">
              {INTERESES.map(i => {
                const on = form.intereses.includes(i.id);
                return (
                  <button key={i.id} onClick={() => toggleInteres(i.id)} className={`rounded-full border px-2 py-0.5 text-[11px] ${on ? "border-emerald-600 bg-emerald-100 text-emerald-800" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}>
                    {i.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
          <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!form.nombre.trim()} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">Guardar</button>
        </footer>
        <style>{`.inp{width:100%;border:1px solid rgb(214,211,209);background:#fff;padding:6px 10px;font-size:13px;border-radius:6px}.inp:focus{outline:none;border-color:rgb(16,185,129);box-shadow:0 0 0 1px rgb(16,185,129)}`}</style>
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-stone-600">{label} {required && <span className="text-rose-500">*</span>}</span>
    {children}
  </label>
);

export default BitacoraInversionistas;
