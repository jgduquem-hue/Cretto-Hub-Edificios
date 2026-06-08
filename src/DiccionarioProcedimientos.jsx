import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen, Search, Plus, X, ExternalLink, FileText, CheckCircle2,
  Circle, Clock, AlertCircle, ChevronRight, ChevronDown, Trash2,
  Edit3, Calendar, Tag, Briefcase, Landmark, ShoppingBag, Hammer,
  Key, Shield, FileCheck, Building2, ArrowLeft
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Diccionario de procedimientos — "Información de interés"
   Knowledge base por proyecto con procedimientos detallados.
   Cada procedimiento contiene:
   - Resumen, categoría, entidad
   - Pasos numerados (paso a paso)
   - Documentos requeridos (con estado)
   - Hitos / cronograma de actividades (con responsable y fecha)
   - Enlaces de referencia (URLs)
   - Notas libres

   Seed: Alianza Fiduciaria — Condiciones de Giro
────────────────────────────────────────────────────────────────── */

const CATEGORIAS = [
  { id: "fiducia",    label: "Fiducia",            color: "violet", icon: Briefcase },
  { id: "banco",      label: "Banco / crédito",    color: "blue",   icon: Landmark },
  { id: "licencias",  label: "Licencias y POT",    color: "rose",   icon: FileText },
  { id: "preventas",  label: "Preventas / comercial", color: "amber", icon: ShoppingBag },
  { id: "obra",       label: "Obra / técnico",     color: "emerald",icon: Hammer },
  { id: "escrituracion", label: "Escrituración",   color: "indigo", icon: Key },
  { id: "polizas",    label: "Pólizas / seguros",  color: "teal",   icon: Shield },
  { id: "legal",      label: "Legal / contratos",  color: "stone",  icon: FileCheck },
  { id: "otro",       label: "Otro",               color: "stone",  icon: BookOpen }
];

const COLOR_CLASS = {
  violet:  "bg-violet-100 text-violet-800 border-violet-200",
  blue:    "bg-blue-100 text-blue-800 border-blue-200",
  rose:    "bg-rose-100 text-rose-800 border-rose-200",
  amber:   "bg-amber-100 text-amber-800 border-amber-200",
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  indigo:  "bg-indigo-100 text-indigo-800 border-indigo-200",
  teal:    "bg-teal-100 text-teal-800 border-teal-200",
  stone:   "bg-stone-100 text-stone-700 border-stone-200"
};

const ESTADO_DOC = [
  { id: "pendiente",  label: "Pendiente",   color: "stone" },
  { id: "en-tramite", label: "En trámite",  color: "amber" },
  { id: "obtenido",   label: "Obtenido",    color: "emerald" }
];

const ESTADO_HITO = [
  { id: "pendiente",  label: "Pendiente",   color: "stone" },
  { id: "en-curso",   label: "En curso",    color: "amber" },
  { id: "completado", label: "Completado",  color: "emerald" },
  { id: "retrasado",  label: "Retrasado",   color: "rose" }
];

/* ─── Seed ──────────────────────────────────────────────────────── */

export const SEED_PROCEDIMIENTOS = [
  {
    id: "alianza-condiciones-giro",
    categoria: "fiducia",
    entidad: "Alianza Fiduciaria",
    titulo: "Condiciones de giro — Fiducia inmobiliaria de preventas",
    resumen: "Variables del punto de equilibrio y requisitos que debe cumplir el promotor/constructor para que Alianza Fiduciaria libere los recursos al constructor. Marco normativo: Decreto 2555 de 2010 + Circular Básica Jurídica SuperFinanciera. Los porcentajes exactos están en el contrato de fiducia y la carta de instrucciones de cada proyecto.",
    pasos: [
      { id: 1, texto: "Estructurar el proyecto y firmar contrato de fiducia mercantil con Alianza. La fiduciaria entrega el modelo de Reglamento del Fideicomiso y la Carta de Instrucciones." },
      { id: 2, texto: "Aportar el lote al Patrimonio Autónomo (P.A.) mediante escritura pública de transferencia. Adjuntar estudio de títulos (30 años) y avalúo comercial." },
      { id: 3, texto: "Aprobar con Alianza el modelo de promesa de compraventa que firmarán los compradores y el modelo financiero del proyecto." },
      { id: 4, texto: "Constituir las pólizas requeridas (Cumplimiento del constructor, Todo Riesgo Construcción, Responsabilidad Civil Extracontractual). Alianza valida vigencia y montos." },
      { id: 5, texto: "Abrir sala de ventas con permiso de ventas vigente. Iniciar recaudo de cuotas iniciales directamente al P.A. (nunca a cuentas del promotor)." },
      { id: 6, texto: "Tramitar y obtener la licencia de construcción ejecutoriada en la curaduría. Sin ejecutoria no se verifica el punto de equilibrio." },
      { id: 7, texto: "Gestionar la aprobación del cupo del crédito constructor con el banco (Banco de Occidente para Casa 107). Entregar carta de aprobación a Alianza." },
      { id: 8, texto: "Solicitar a Alianza la verificación del PUNTO DE EQUILIBRIO una vez se cumplan las variables: preventas mínimas, % cuota inicial recaudada, licencia ejecutoriada, crédito aprobado, pólizas vigentes, lote en el P.A." },
      { id: 9, texto: "Alianza emite la CARTA DE CUMPLIMIENTO DE CONDICIONES DE GIRO. Habilita el primer desembolso al constructor." },
      { id: 10, texto: "Solicitar giros mensuales contra avance de obra. Cada giro requiere aval de interventoría, comprobantes del mes anterior, conciliación bancaria del P.A. y verificación de preventas y cartera." },
      { id: 11, texto: "Al finalizar la obra, iniciar escrituración masiva. La fiduciaria libera saldos a los compradores y retorna utilidades a Casa Developers SAS." },
      { id: 12, texto: "Liquidar el Patrimonio Autónomo. Entrega de informes finales y archivo." }
    ],
    documentos: [
      { id: 1,  nombre: "Contrato de fiducia mercantil firmado",         categoria: "Constitución", estado: "pendiente", responsable: "Alianza + Casa Developers" },
      { id: 2,  nombre: "Reglamento del Patrimonio Autónomo",            categoria: "Constitución", estado: "pendiente", responsable: "Alianza" },
      { id: 3,  nombre: "Estudio de títulos del lote (30 años)",         categoria: "Lote",         estado: "pendiente", responsable: "Abogado externo" },
      { id: 4,  nombre: "Certificado de tradición y libertad reciente",  categoria: "Lote",         estado: "pendiente", responsable: "Casa Developers" },
      { id: 5,  nombre: "Avalúo comercial del lote",                     categoria: "Lote",         estado: "pendiente", responsable: "Perito" },
      { id: 6,  nombre: "Escritura pública de aporte del lote al P.A.",  categoria: "Lote",         estado: "pendiente", responsable: "Notaría" },
      { id: 7,  nombre: "Estados financieros últimos 2 años de Casa Developers SAS", categoria: "Promotor", estado: "pendiente", responsable: "Casa Developers" },
      { id: 8,  nombre: "Certificado de existencia y representación legal", categoria: "Promotor",  estado: "pendiente", responsable: "Cámara de Comercio" },
      { id: 9,  nombre: "Modelo de promesa de compraventa aprobado por Alianza", categoria: "Comercial", estado: "pendiente", responsable: "Cretto + Alianza" },
      { id: 10, nombre: "Estudio de mercado / factibilidad",             categoria: "Comercial",    estado: "pendiente", responsable: "Comercializadora" },
      { id: 11, nombre: "Modelo financiero firmado por el promotor",     categoria: "Financiero",   estado: "en-tramite", responsable: "PM Cretto" },
      { id: 12, nombre: "Presupuesto detallado por capítulos (CAPEX)",   categoria: "Financiero",   estado: "en-tramite", responsable: "PM Cretto" },
      { id: 13, nombre: "Cronograma de obra aprobado por interventoría", categoria: "Técnico",      estado: "pendiente", responsable: "Penta + A. Andrade" },
      { id: 14, nombre: "Licencia de construcción ejecutoriada",         categoria: "Licencias",    estado: "en-tramite", responsable: "G Arquitectura" },
      { id: 15, nombre: "Permiso de ventas",                             categoria: "Licencias",    estado: "pendiente", responsable: "G Arquitectura" },
      { id: 16, nombre: "Carta de aprobación de crédito constructor",    categoria: "Banco",        estado: "pendiente", responsable: "Banco de Occidente" },
      { id: 17, nombre: "Póliza Todo Riesgo Construcción",               categoria: "Pólizas",      estado: "pendiente", responsable: "Penta Ingenieros" },
      { id: 18, nombre: "Póliza Responsabilidad Civil Extracontractual", categoria: "Pólizas",      estado: "pendiente", responsable: "Penta Ingenieros" },
      { id: 19, nombre: "Póliza de Cumplimiento del Constructor",        categoria: "Pólizas",      estado: "pendiente", responsable: "Penta Ingenieros" },
      { id: 20, nombre: "Estudios técnicos completos (estructural, MEP, suelos)", categoria: "Técnico", estado: "pendiente", responsable: "Ingenierías" }
    ],
    hitos: [
      { id: 1,  codigo: "F1",  nombre: "Constitución del Patrimonio Autónomo",                   fecha: "2026-06-15", responsable: "Alianza + Casa Developers", estado: "pendiente" },
      { id: 2,  codigo: "F2",  nombre: "Aporte del lote al P.A.",                                fecha: "2026-06-20", responsable: "Casa Developers + Notaría", estado: "pendiente" },
      { id: 3,  codigo: "F3",  nombre: "Apertura sala de ventas + permiso de ventas",            fecha: "2026-06-25", responsable: "Paola de Lima",            estado: "pendiente" },
      { id: 4,  codigo: "F4",  nombre: "Inicio recaudo preventas (cuotas iniciales al P.A.)",    fecha: "2026-06-25", responsable: "Paola de Lima + Alianza",  estado: "pendiente" },
      { id: 5,  codigo: "F5",  nombre: "Licencia de construcción ejecutoriada",                  fecha: "2026-06-10", responsable: "G Arquitectura + Curaduría", estado: "en-curso" },
      { id: 6,  codigo: "F6",  nombre: "Aprobación del crédito constructor",                     fecha: "2026-07-15", responsable: "Banco de Occidente",       estado: "pendiente" },
      { id: 7,  codigo: "F7",  nombre: "Pólizas y garantías constituidas",                       fecha: "2026-07-20", responsable: "Penta Ingenieros",         estado: "pendiente" },
      { id: 8,  codigo: "F8",  nombre: "VERIFICACIÓN DEL PUNTO DE EQUILIBRIO",                   fecha: "2026-07-25", responsable: "Alianza Fiduciaria",       estado: "pendiente" },
      { id: 9,  codigo: "F9",  nombre: "Carta de cumplimiento de condiciones de giro",           fecha: "2026-07-30", responsable: "Alianza Fiduciaria",       estado: "pendiente" },
      { id: 10, codigo: "F10", nombre: "Primer giro al constructor (Penta)",                     fecha: "2026-08-01", responsable: "Alianza Fiduciaria",       estado: "pendiente" },
      { id: 11, codigo: "F11", nombre: "Giros mensuales contra avance + aval interventoría",     fecha: "2028-02-01", responsable: "Alvaro Andrade + Alianza", estado: "pendiente" },
      { id: 12, codigo: "F12", nombre: "Inicio escrituración masiva",                            fecha: "2028-03-01", responsable: "Casa Developers + Notaría", estado: "pendiente" },
      { id: 13, codigo: "F13", nombre: "Liquidación del P.A.",                                   fecha: "2028-08-30", responsable: "Alianza Fiduciaria",       estado: "pendiente" }
    ],
    variablesPE: [
      { id: 1,  nombre: "Preventas mínimas firmadas",            valor: "60% (28 de 47 aptos)",   estado: "pendiente", critico: true },
      { id: 2,  nombre: "Cuota inicial recaudada",                valor: "40% del valor del 60% en preventas (~$19.000 MM)", estado: "pendiente", critico: true },
      { id: 3,  nombre: "Licencia de construcción ejecutoriada", valor: "Curaduría",              estado: "en-tramite", critico: true },
      { id: 4,  nombre: "Permiso de ventas",                      valor: "Post-licencia",          estado: "pendiente", critico: false },
      { id: 5,  nombre: "Propiedad del lote aportada al P.A.",    valor: "Escritura → P.A. Casa 107", estado: "pendiente", critico: true },
      { id: 6,  nombre: "Carta aprobación crédito constructor",   valor: "Banco de Occidente",     estado: "pendiente", critico: true },
      { id: 7,  nombre: "Pólizas vigentes",                        valor: "Cumplimiento + Todo Riesgo + RC", estado: "pendiente", critico: true },
      { id: 8,  nombre: "Estudios técnicos completos",             valor: "Estructural, MEP, suelos, bioclimático", estado: "pendiente", critico: false },
      { id: 9,  nombre: "Modelo financiero validado",              valor: "Versión fiducia aprobada", estado: "en-tramite", critico: false },
      { id: 10, nombre: "Cronograma + presupuesto aprobados",      valor: "Con aval interventoría", estado: "pendiente", critico: false }
    ],
    enlaces: [
      { titulo: "Alianza Fiduciaria — Inmobiliaria (personas)",          url: "https://www.alianza.com.co/fiducia/inmobiliaria" },
      { titulo: "Alianza Fiduciaria — Inmobiliaria de proyectos (empresas)", url: "https://www.alianza.com.co/empresas/inmobiliaria-de-proyectos" },
      { titulo: "Alianza Fiduciaria — Preguntas frecuentes Fiducia",      url: "https://www.alianza.com.co/fiducia" },
      { titulo: "Asofiduciarias — Fiducia Inmobiliaria en Colombia (PDF)", url: "https://www.asofiduciarias.org.co/wp-content/uploads/2017/12/La-Fiducia-Inmobiliaria-en-Colombia-AF-DIC-2015.pdf" },
      { titulo: "Esquema fiduciario de preventa — ACIG Consulting",       url: "https://acigconsulting.com/esquema-fiduciario-de-preventa/" },
      { titulo: "GH Revisores — Contrato fiducia inmobiliaria Colombia", url: "https://ghrevisores.com/contrato-de-fiducia-inmobiliaria-en-colombia-partes-etapas-y-responsabilidades/" }
    ],
    notas: "Para Casa 107 el número crítico es la cuota inicial: 40% del valor de las 28 unidades del 60% de preventas. Calcular con precio promedio confirmado por Paola y validar con Alianza antes de prometer fechas al constructor."
  }
];

/* ─── Helper formatos ───────────────────────────────────────────── */
const Pill = ({ children, color = "stone" }) => (
  <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${COLOR_CLASS[color]}`}>{children}</span>
);

const EstadoDocPill = ({ estado }) => {
  const cfg = ESTADO_DOC.find(e => e.id === estado) || ESTADO_DOC[0];
  return <Pill color={cfg.color}>{cfg.label}</Pill>;
};
const EstadoHitoPill = ({ estado }) => {
  const cfg = ESTADO_HITO.find(e => e.id === estado) || ESTADO_HITO[0];
  return <Pill color={cfg.color}>{cfg.label}</Pill>;
};

/* ─── Componente principal ──────────────────────────────────────── */
const DiccionarioProcedimientos = ({ project }) => {
  const [procedimientos, setProcedimientos] = useState(SEED_PROCEDIMIENTOS);
  const [filtroCat, setFiltroCat] = useState("all");
  const [query, setQuery] = useState("");
  const [seleccionado, setSeleccionado] = useState(null); // id del procedimiento abierto
  const [modal, setModal] = useState(null);

  /* Persistencia por proyecto */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:dicc:${project?.id || "default"}`);
        if (m && r && r.value) setProcedimientos(JSON.parse(r.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:dicc:${project?.id || "default"}`, JSON.stringify(procedimientos)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [procedimientos, project?.id]);

  const filtered = useMemo(() => {
    return procedimientos.filter(p => {
      if (filtroCat !== "all" && p.categoria !== filtroCat) return false;
      if (query) {
        const q = query.toLowerCase();
        return p.titulo.toLowerCase().includes(q) || (p.resumen || "").toLowerCase().includes(q) || (p.entidad || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [procedimientos, query, filtroCat]);

  const open = useMemo(() => procedimientos.find(p => p.id === seleccionado), [procedimientos, seleccionado]);

  const updateProc = (id, patch) => setProcedimientos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  const removeProc = (id) => {
    if (!confirm("¿Eliminar procedimiento?")) return;
    setProcedimientos(prev => prev.filter(p => p.id !== id));
    if (seleccionado === id) setSeleccionado(null);
  };
  const addProc = (data) => {
    const id = data.id || `proc-${Date.now()}`;
    setProcedimientos(prev => [...prev, { ...data, id, pasos: [], documentos: [], hitos: [], variablesPE: [], enlaces: [] }]);
    setModal(null);
    setSeleccionado(id);
  };

  if (open) {
    return (
      <ProcedimientoDetalle
        proc={open}
        onBack={() => setSeleccionado(null)}
        onUpdate={(patch) => updateProc(open.id, patch)}
        onDelete={() => removeProc(open.id)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Información de interés · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Diccionario de procedimientos</h1>
          <p className="mt-1 text-sm text-stone-500">
            Procedimientos críticos del proyecto con paso a paso, documentos requeridos, hitos y enlaces de referencia.
            Cada procedimiento es una "ficha" navegable y editable.
          </p>
        </div>
        <button onClick={() => setModal({})} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          <Plus className="h-4 w-4" /> Nuevo procedimiento
        </button>
      </header>

      {/* Filtros */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <CatChip label={`Todos (${procedimientos.length})`} active={filtroCat === "all"} onClick={() => setFiltroCat("all")} color="stone" />
        {CATEGORIAS.map(c => {
          const count = procedimientos.filter(p => p.categoria === c.id).length;
          return <CatChip key={c.id} label={`${c.label} (${count})`} active={filtroCat === c.id} onClick={() => setFiltroCat(c.id)} color={c.color} icon={c.icon} />;
        })}
      </div>
      <div className="mb-4 relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título, entidad o contenido…" className="w-full rounded-md border border-stone-300 bg-white py-1.5 pl-8 pr-3 text-sm placeholder-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
      </div>

      {/* Grid de fichas */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-stone-400">Sin procedimientos para los filtros aplicados.</div>
        )}
        {filtered.map(p => {
          const cat = CATEGORIAS.find(c => c.id === p.categoria) || CATEGORIAS[0];
          const Ic = cat.icon;
          const docsObt = (p.documentos || []).filter(d => d.estado === "obtenido").length;
          const docsTotal = (p.documentos || []).length;
          const hitosComp = (p.hitos || []).filter(h => h.estado === "completado").length;
          const hitosTotal = (p.hitos || []).length;
          return (
            <button key={p.id} onClick={() => setSeleccionado(p.id)} className="text-left rounded-lg border border-stone-200 bg-white p-4 transition-all hover:border-emerald-400 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${COLOR_CLASS[cat.color]}`}>
                    <Ic className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <Pill color={cat.color}>{cat.label}</Pill>
                    {p.entidad && <div className="mt-1 text-[10px] text-stone-500">{p.entidad}</div>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-300" />
              </div>
              <h3 className="mt-2 font-serif text-[15px] leading-tight text-stone-900">{p.titulo}</h3>
              {p.resumen && <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-stone-600">{p.resumen}</p>}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Mini label="Pasos" value={(p.pasos || []).length} />
                <Mini label="Docs" value={`${docsObt}/${docsTotal}`} highlight={docsObt === docsTotal && docsTotal > 0} />
                <Mini label="Hitos" value={`${hitosComp}/${hitosTotal}`} highlight={hitosComp === hitosTotal && hitosTotal > 0} />
              </div>
            </button>
          );
        })}
      </div>

      {modal !== null && <NewProcModal onClose={() => setModal(null)} onSave={addProc} />}
    </div>
  );
};

const Mini = ({ label, value, highlight }) => (
  <div className={`rounded p-1 ${highlight ? "bg-emerald-50" : "bg-stone-50"}`}>
    <div className={`font-mono text-[12px] font-semibold ${highlight ? "text-emerald-700" : "text-stone-800"}`}>{value}</div>
    <div className="text-[9px] uppercase tracking-wider text-stone-500">{label}</div>
  </div>
);

const CatChip = ({ label, active, onClick, color, icon: Icon }) => (
  <button onClick={onClick} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${active ? COLOR_CLASS[color] + " ring-1 ring-stone-300" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}>
    {Icon && <Icon className="h-3 w-3" />}
    {label}
  </button>
);

/* ─── Detalle de procedimiento ──────────────────────────────────── */
const ProcedimientoDetalle = ({ proc, onBack, onUpdate, onDelete }) => {
  const cat = CATEGORIAS.find(c => c.id === proc.categoria) || CATEGORIAS[0];
  const Ic = cat.icon;
  const [edicion, setEdicion] = useState(null); // { tipo, id?, data? }

  const updateField = (field, value) => onUpdate({ [field]: value });
  const updateList = (listName, id, patch) => onUpdate({ [listName]: proc[listName].map(it => it.id === id ? { ...it, ...patch } : it) });
  const addToList = (listName, item) => {
    const nextId = Math.max(0, ...(proc[listName] || []).map(it => it.id)) + 1;
    onUpdate({ [listName]: [...(proc[listName] || []), { ...item, id: nextId }] });
  };
  const removeFromList = (listName, id) => onUpdate({ [listName]: (proc[listName] || []).filter(it => it.id !== id) });

  const docsStats = useMemo(() => {
    const total = (proc.documentos || []).length;
    const obt = (proc.documentos || []).filter(d => d.estado === "obtenido").length;
    const tram = (proc.documentos || []).filter(d => d.estado === "en-tramite").length;
    return { total, obt, tram, pct: total > 0 ? Math.round((obt / total) * 100) : 0 };
  }, [proc.documentos]);

  const hitosStats = useMemo(() => {
    const total = (proc.hitos || []).length;
    const comp = (proc.hitos || []).filter(h => h.estado === "completado").length;
    return { total, comp, pct: total > 0 ? Math.round((comp / total) * 100) : 0 };
  }, [proc.hitos]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      {/* Header */}
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-[11px] text-stone-600 hover:bg-stone-50">
        <ArrowLeft className="h-3 w-3" /> Volver al diccionario
      </button>
      <div className={`mb-4 rounded-lg border p-4 ${COLOR_CLASS[cat.color]}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Ic className="h-4 w-4" />
              <Pill color={cat.color}>{cat.label}</Pill>
              {proc.entidad && <span className="text-[11px] opacity-80">{proc.entidad}</span>}
            </div>
            <h2 className="mt-1 font-serif text-2xl">{proc.titulo}</h2>
            <p className="mt-2 text-[13px] leading-relaxed opacity-90">{proc.resumen}</p>
          </div>
          <button onClick={onDelete} className="rounded p-1 text-current/60 hover:bg-rose-100 hover:text-rose-700" title="Eliminar procedimiento">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Kpi label="Pasos" value={(proc.pasos || []).length} />
        <Kpi label="Documentos" value={`${docsStats.obt}/${docsStats.total}`} sub={`${docsStats.pct}% obtenidos · ${docsStats.tram} en trámite`} />
        <Kpi label="Hitos" value={`${hitosStats.comp}/${hitosStats.total}`} sub={`${hitosStats.pct}% completados`} />
        <Kpi label="Variables PE" value={(proc.variablesPE || []).length} sub={`${(proc.variablesPE || []).filter(v => v.critico).length} críticas`} />
      </div>

      {/* Variables del Punto de Equilibrio (si existen) */}
      {(proc.variablesPE || []).length > 0 && (
        <Section title="Variables del Punto de Equilibrio" subtitle="Cada variable debe cumplirse para que Alianza libere recursos">
          <div className="overflow-hidden rounded-md border border-stone-200">
            <table className="w-full text-[12px]">
              <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Variable</th>
                  <th className="px-3 py-2 text-left">Valor / Meta</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-center">Crítica</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {proc.variablesPE.map(v => (
                  <tr key={v.id} className="border-t border-stone-100">
                    <td className="px-3 py-1.5 font-mono text-[11px]">{v.id}</td>
                    <td className="px-3 py-1.5 text-stone-800">{v.nombre}</td>
                    <td className="px-3 py-1.5 text-stone-600">{v.valor}</td>
                    <td className="px-3 py-1.5">
                      <select value={v.estado} onChange={e => updateList("variablesPE", v.id, { estado: e.target.value })} className="rounded border border-stone-200 bg-white px-1 py-0.5 text-[11px]">
                        {ESTADO_DOC.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-1.5 text-center">{v.critico && <AlertCircle className="inline h-3.5 w-3.5 text-rose-600" />}</td>
                    <td className="px-3 py-1.5 text-right">
                      <button onClick={() => removeFromList("variablesPE", v.id)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddRowButton onClick={() => addToList("variablesPE", { nombre: "Nueva variable", valor: "", estado: "pendiente", critico: false })} label="Agregar variable" />
        </Section>
      )}

      {/* Paso a paso */}
      <Section title="Paso a paso" subtitle="Secuencia del procedimiento">
        <ol className="space-y-2">
          {(proc.pasos || []).map((p, idx) => (
            <li key={p.id} className="flex items-start gap-3 rounded-md border border-stone-200 bg-white p-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 font-mono text-[11px] font-bold text-emerald-800">{idx + 1}</span>
              <textarea
                value={p.texto}
                onChange={e => updateList("pasos", p.id, { texto: e.target.value })}
                rows={2}
                className="flex-1 resize-none rounded border-0 bg-transparent text-[13px] text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button onClick={() => removeFromList("pasos", p.id)} className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
            </li>
          ))}
        </ol>
        <AddRowButton onClick={() => addToList("pasos", { texto: "Nuevo paso" })} label="Agregar paso" />
      </Section>

      {/* Documentos */}
      <Section title="Documentos requeridos" subtitle={`${docsStats.obt} de ${docsStats.total} obtenidos`}>
        <div className="overflow-hidden rounded-md border border-stone-200">
          <table className="w-full text-[12px]">
            <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-3 py-2 text-left">Documento</th>
                <th className="px-3 py-2 text-left">Categoría</th>
                <th className="px-3 py-2 text-left">Responsable</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(proc.documentos || []).map(d => (
                <tr key={d.id} className="border-t border-stone-100">
                  <td className="px-3 py-1.5 text-stone-800">{d.nombre}</td>
                  <td className="px-3 py-1.5 text-stone-600">{d.categoria}</td>
                  <td className="px-3 py-1.5 text-stone-600">{d.responsable}</td>
                  <td className="px-3 py-1.5">
                    <select value={d.estado} onChange={e => updateList("documentos", d.id, { estado: e.target.value })} className="rounded border border-stone-200 bg-white px-1 py-0.5 text-[11px]">
                      {ESTADO_DOC.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <button onClick={() => removeFromList("documentos", d.id)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddRowButton onClick={() => addToList("documentos", { nombre: "Nuevo documento", categoria: "", responsable: "", estado: "pendiente" })} label="Agregar documento" />
      </Section>

      {/* Hitos / cronograma */}
      <Section title="Cronograma de actividades" subtitle={`${hitosStats.comp} de ${hitosStats.total} hitos completados`}>
        <div className="overflow-hidden rounded-md border border-stone-200">
          <table className="w-full text-[12px]">
            <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-3 py-2 text-left">Cód</th>
                <th className="px-3 py-2 text-left">Hito</th>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Responsable</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(proc.hitos || []).map(h => (
                <tr key={h.id} className="border-t border-stone-100">
                  <td className="px-3 py-1.5 font-mono text-[11px] font-bold text-stone-700">{h.codigo}</td>
                  <td className="px-3 py-1.5 text-stone-800">{h.nombre}</td>
                  <td className="px-3 py-1.5 font-mono text-[11px]">{h.fecha}</td>
                  <td className="px-3 py-1.5 text-stone-600">{h.responsable}</td>
                  <td className="px-3 py-1.5">
                    <select value={h.estado} onChange={e => updateList("hitos", h.id, { estado: e.target.value })} className="rounded border border-stone-200 bg-white px-1 py-0.5 text-[11px]">
                      {ESTADO_HITO.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <button onClick={() => removeFromList("hitos", h.id)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddRowButton onClick={() => addToList("hitos", { codigo: `H${(proc.hitos || []).length + 1}`, nombre: "Nuevo hito", fecha: "", responsable: "", estado: "pendiente" })} label="Agregar hito" />
      </Section>

      {/* Enlaces */}
      <Section title="Enlaces de referencia" subtitle="Documentación oficial y sitios consultados">
        <ul className="space-y-1">
          {(proc.enlaces || []).map((e, idx) => (
            <li key={idx} className="flex items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-[12px]">
              <a href={e.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-700 hover:underline">
                <ExternalLink className="h-3 w-3" /> {e.titulo}
              </a>
              <span className="ml-2 truncate text-[10px] text-stone-400">{e.url}</span>
              <button onClick={() => onUpdate({ enlaces: proc.enlaces.filter((_, i) => i !== idx) })} className="ml-2 rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
            </li>
          ))}
        </ul>
        <AddLinkInline onAdd={(e) => onUpdate({ enlaces: [...(proc.enlaces || []), e] })} />
      </Section>

      {/* Notas */}
      <Section title="Notas">
        <textarea
          value={proc.notas || ""}
          onChange={e => updateField("notas", e.target.value)}
          rows={3}
          placeholder="Notas y observaciones del PM…"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </Section>
    </div>
  );
};

const Section = ({ title, subtitle, children }) => (
  <div className="mb-5 rounded-lg border border-stone-200 bg-white p-4">
    <div className="mb-3 flex items-baseline justify-between">
      <h3 className="text-[12px] font-semibold uppercase tracking-wider text-stone-700">{title}</h3>
      {subtitle && <span className="text-[11px] text-stone-500">{subtitle}</span>}
    </div>
    {children}
  </div>
);

const Kpi = ({ label, value, sub }) => (
  <div className="rounded-md border border-stone-200 bg-white p-3">
    <div className="text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
    <div className="font-serif text-xl text-stone-900">{value}</div>
    {sub && <div className="text-[10px] text-stone-500">{sub}</div>}
  </div>
);

const AddRowButton = ({ onClick, label }) => (
  <button onClick={onClick} className="mt-2 inline-flex items-center gap-1 rounded-md border border-dashed border-stone-300 bg-white px-3 py-1 text-[11px] font-medium text-stone-600 hover:border-emerald-400 hover:text-emerald-700">
    <Plus className="h-3 w-3" /> {label}
  </button>
);

const AddLinkInline = ({ onAdd }) => {
  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const add = () => { if (!titulo || !url) return; onAdd({ titulo, url }); setTitulo(""); setUrl(""); };
  return (
    <div className="mt-2 flex gap-2">
      <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" className="flex-1 rounded border border-stone-200 px-2 py-1 text-[12px] focus:border-emerald-500 focus:outline-none" />
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" className="flex-[2] rounded border border-stone-200 px-2 py-1 text-[12px] focus:border-emerald-500 focus:outline-none" />
      <button onClick={add} disabled={!titulo || !url} className="rounded bg-emerald-700 px-3 py-1 text-[11px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">Agregar enlace</button>
    </div>
  );
};

const NewProcModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ categoria: "fiducia", entidad: "", titulo: "", resumen: "", notas: "" });
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">Nuevo procedimiento</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-3 p-4">
          <Field label="Título" required>
            <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="inp" placeholder="Ej. Aprobación crédito constructor — Banco Occidente" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría">
              <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="inp">
                {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Entidad / proveedor">
              <input value={form.entidad} onChange={e => setForm({ ...form, entidad: e.target.value })} className="inp" placeholder="Ej. Alianza Fiduciaria" />
            </Field>
          </div>
          <Field label="Resumen">
            <textarea value={form.resumen} onChange={e => setForm({ ...form, resumen: e.target.value })} rows={3} className="inp" placeholder="Qué busca el procedimiento, marco normativo, importancia…" />
          </Field>
        </div>
        <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
          <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!form.titulo.trim()} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">Crear procedimiento</button>
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

export default DiccionarioProcedimientos;
