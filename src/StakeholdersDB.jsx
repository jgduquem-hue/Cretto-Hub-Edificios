import React, { useState, useMemo, useEffect } from "react";
import {
  Users, Plus, Search, X, Trash2, Download, Upload, Mail, Phone,
  Building2, MapPin, Globe, AlertCircle, CheckCircle2, Star,
  Filter, ChevronDown, ChevronRight, Edit3, FileText, Tag, Briefcase,
  Landmark, ShoppingBag, Hammer, Shield, UserCircle
} from "lucide-react";
import { useResizableColumns, ResizableTh, ResetWidthsButton } from "./ResizableColumns.jsx";

/* ────────────────────────────────────────────────────────────────
   StakeholdersDB — base de datos MAESTRA del proyecto
   "La reina": fuente única de contacto e información de cualquier
   actor (proveedor, inversionista, promotor, constructor, etc.).
   Otros módulos (RACI, Bitácora, Pagos, Notificaciones) consumen
   de aquí.

   Esquema combina PMI (registro de stakeholders + análisis) + lo
   que en práctica de edificación Colombia se necesita (NIT, régimen,
   forma de pago, pólizas, etc.).
────────────────────────────────────────────────────────────────── */

/* Tipos posibles — multi-select por stakeholder */
export const TIPOS_STAKEHOLDER = [
  { id: "promotor",        label: "Promotor / Fideicomitente", icon: Building2,  color: "indigo" },
  { id: "inversionista",   label: "Inversionista / Sponsor",   icon: Star,       color: "violet" },
  { id: "constructor",     label: "Constructor / Contratista", icon: Hammer,     color: "emerald" },
  { id: "interventoria",   label: "Interventoría",             icon: Shield,     color: "amber" },
  { id: "proveedor",       label: "Proveedor / Subcontratista",icon: ShoppingBag,color: "teal" },
  { id: "diseñador",       label: "Diseñador / Consultor",     icon: Edit3,      color: "blue" },
  { id: "fiducia",         label: "Fiduciaria",                icon: Briefcase,  color: "rose" },
  { id: "banco",           label: "Banco / Financiador",       icon: Landmark,   color: "stone" },
  { id: "comercial",       label: "Comercializadora",          icon: ShoppingBag,color: "rose" },
  { id: "comprador",       label: "Comprador final",           icon: UserCircle, color: "lime" },
  { id: "autoridad",       label: "Autoridad / Curaduría",     icon: FileText,   color: "amber" },
  { id: "interno",         label: "Equipo interno Cretto",     icon: Users,      color: "emerald" },
  { id: "otro",            label: "Otro",                      icon: Users,      color: "stone" }
];

const ESPECIALIDADES = [
  "Arquitectura", "Estructural", "Hidrosanitario", "Eléctrico", "Gas",
  "HVAC", "Suelos", "Bioclimático", "Fachadas", "Paisajismo",
  "Construcción civil", "Acabados", "Equipos especiales (ascensores)",
  "Gerencia de proyecto", "Interventoría", "Supervisión técnica",
  "Comercial", "Mercadeo", "Legal", "Contable", "Financiero",
  "Fiducia", "Banco", "Pólizas / Seguros", "Notaría", "Curaduría", "Otro"
];

const REGIMENES = [
  "Responsable de IVA",
  "No responsable de IVA",
  "Gran contribuyente",
  "Régimen simple",
  "Persona natural sin RUT"
];

const ESTADOS = [
  { id: "activo",    label: "Activo",       color: "emerald" },
  { id: "potencial", label: "Potencial",    color: "amber" },
  { id: "pausado",   label: "Pausado",      color: "stone" },
  { id: "bloqueado", label: "Bloqueado",    color: "rose" }
];

const ACTITUDES = [
  { id: "advocate",  label: "Promotor (advocate)",  color: "emerald" },
  { id: "supporter", label: "Apoyador (supporter)", color: "lime" },
  { id: "neutral",   label: "Neutral",              color: "stone" },
  { id: "resistor",  label: "Resistente",           color: "amber" },
  { id: "blocker",   label: "Bloqueador",           color: "rose" }
];

const ESTRATEGIAS_PMI = [
  { id: "manage-closely",  label: "Gestionar de cerca",     desc: "Alto poder + alto interés" },
  { id: "keep-satisfied",  label: "Mantener satisfecho",    desc: "Alto poder + bajo interés" },
  { id: "keep-informed",   label: "Mantener informado",     desc: "Bajo poder + alto interés" },
  { id: "monitor",         label: "Monitorear",             desc: "Bajo poder + bajo interés" }
];

const COLOR_CLASS = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  violet:  "bg-violet-100 text-violet-800 border-violet-200",
  indigo:  "bg-indigo-100 text-indigo-800 border-indigo-200",
  rose:    "bg-rose-100 text-rose-800 border-rose-200",
  amber:   "bg-amber-100 text-amber-800 border-amber-200",
  blue:    "bg-blue-100 text-blue-800 border-blue-200",
  teal:    "bg-teal-100 text-teal-800 border-teal-200",
  lime:    "bg-lime-100 text-lime-800 border-lime-200",
  stone:   "bg-stone-100 text-stone-700 border-stone-200"
};

/* Strategy auto-derived from influencia + interes */
export const deriveEstrategia = (influencia, interes) => {
  const power = (influencia || 0) >= 4;
  const intr = (interes || 0) >= 4;
  if (power && intr) return "manage-closely";
  if (power && !intr) return "keep-satisfied";
  if (!power && intr) return "keep-informed";
  return "monitor";
};

/* ─── Seed: stakeholders de Casa 107 ───────────────────────────── */
export const SEED_STAKEHOLDERS_CASA107 = [
  {
    id: 1, nombre: "Casa Developers SAS", esEmpresa: true, razonSocial: "Casa Developers SAS",
    nit: "", regimen: "Responsable de IVA", representanteLegal: "Hector Gaviria",
    tipos: ["promotor"], especialidad: "Gerencia de proyecto", rol: "Promotor / Fideicomitente del proyecto Casa 107",
    estado: "activo",
    email: "", telefono: "", celular: "", whatsapp: "", sitioWeb: "",
    direccion: "Bogotá", ciudad: "Bogotá", pais: "Colombia",
    contactos: [{ nombre: "Hector Gaviria", cargo: "Gerente de proyecto promotor", email: "", telefono: "", esPrincipal: true }],
    influencia: 5, interes: 5, poder: "alto", actitud: "advocate",
    expectativas: "Cumplimiento financiero, cronograma, calidad y rentabilidad",
    estrategia: "manage-closely", raciDefault: "A",
    aporteCop: 0, pctParticipacion: 0, tipoAporte: "Lote + gestión",
    formaPago: "", plazoPago: 0, cuentaBancaria: "", banco: "",
    polizas: [], documentos: [], tags: ["promotor", "Casa Developers"], notas: ""
  },
  {
    id: 2, nombre: "Hector Gaviria", esEmpresa: false, razonSocial: "", nit: "", regimen: "Persona natural sin RUT",
    representanteLegal: "",
    tipos: ["inversionista", "promotor"], especialidad: "Gerencia de proyecto",
    rol: "Inversionista principal + Gerente de proyecto del promotor",
    estado: "activo",
    email: "", telefono: "", celular: "", whatsapp: "", sitioWeb: "",
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    contactos: [{ nombre: "Hector Gaviria", cargo: "—", email: "", telefono: "", esPrincipal: true }],
    influencia: 5, interes: 5, poder: "alto", actitud: "advocate",
    expectativas: "Retorno financiero y control del proyecto", estrategia: "manage-closely", raciDefault: "A",
    aporteCop: 0, pctParticipacion: 0, tipoAporte: "Efectivo + gestión",
    formaPago: "", plazoPago: 0, cuentaBancaria: "", banco: "",
    polizas: [], documentos: [], tags: ["sponsor principal"], notas: ""
  },
  {
    id: 3, nombre: "Juan Diego Duque", esEmpresa: false, regimen: "Persona natural sin RUT",
    tipos: ["inversionista"], especialidad: "Financiero", rol: "Inversionista",
    estado: "activo",
    email: "", telefono: "", celular: "", contactos: [{ nombre: "Juan Diego Duque", cargo: "Inversionista", email: "", telefono: "", esPrincipal: true }],
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    influencia: 4, interes: 4, poder: "alto", actitud: "supporter",
    expectativas: "Retorno financiero", estrategia: "manage-closely", raciDefault: "C",
    aporteCop: 0, pctParticipacion: 0, tipoAporte: "Efectivo",
    polizas: [], documentos: [], tags: ["sponsor"], notas: ""
  },
  {
    id: 4, nombre: "Juan Felipe Gaviria", esEmpresa: false, regimen: "Persona natural sin RUT",
    tipos: ["inversionista"], especialidad: "Financiero", rol: "Inversionista",
    estado: "activo",
    email: "", telefono: "", celular: "", contactos: [{ nombre: "Juan Felipe Gaviria", cargo: "Inversionista", email: "", telefono: "", esPrincipal: true }],
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    influencia: 4, interes: 4, poder: "alto", actitud: "supporter",
    expectativas: "Retorno financiero", estrategia: "manage-closely", raciDefault: "C",
    aporteCop: 0, pctParticipacion: 0, tipoAporte: "Efectivo",
    polizas: [], documentos: [], tags: ["sponsor"], notas: ""
  },
  {
    id: 5, nombre: "Alvaro Correa", esEmpresa: false, regimen: "Persona natural sin RUT",
    tipos: ["inversionista"], especialidad: "Financiero", rol: "Inversionista",
    estado: "activo",
    email: "", telefono: "", celular: "", contactos: [{ nombre: "Alvaro Correa", cargo: "Inversionista", email: "", telefono: "", esPrincipal: true }],
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    influencia: 4, interes: 3, poder: "alto", actitud: "neutral",
    expectativas: "Retorno financiero", estrategia: "keep-satisfied", raciDefault: "I",
    aporteCop: 0, pctParticipacion: 0, tipoAporte: "Efectivo",
    polizas: [], documentos: [], tags: ["sponsor"], notas: ""
  },
  {
    id: 6, nombre: "Paola de Lima", esEmpresa: false, regimen: "Responsable de IVA",
    tipos: ["comercial"], especialidad: "Comercial", rol: "Gerente comercial / Comercializadora",
    estado: "activo",
    email: "", telefono: "", celular: "", contactos: [{ nombre: "Paola de Lima", cargo: "Gerente comercial", email: "", telefono: "", esPrincipal: true }],
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    influencia: 4, interes: 5, poder: "alto", actitud: "advocate",
    expectativas: "Cumplimiento de meta de preventas y comisión", estrategia: "manage-closely", raciDefault: "R",
    formaPago: "Comisión sobre ventas", plazoPago: 30, cuentaBancaria: "", banco: "",
    polizas: [], documentos: [], tags: ["comercial", "preventas"], notas: ""
  },
  {
    id: 7, nombre: "G Arquitectura", esEmpresa: true, razonSocial: "G Arquitectura",
    nit: "", regimen: "Responsable de IVA", representanteLegal: "",
    tipos: ["diseñador"], especialidad: "Arquitectura",
    rol: "Diseño arquitectónico + fachadas + paisajismo Casa 107",
    estado: "activo",
    email: "", telefono: "", celular: "", sitioWeb: "",
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    contactos: [{ nombre: "—", cargo: "Director de proyecto", email: "", telefono: "", esPrincipal: true }],
    influencia: 4, interes: 4, poder: "alto", actitud: "advocate",
    expectativas: "Pago honorarios y respeto al diseño", estrategia: "manage-closely", raciDefault: "R",
    formaPago: "Honorarios por hitos", plazoPago: 30, cuentaBancaria: "", banco: "",
    polizas: [], documentos: [], tags: ["arquitectura", "fachadas", "paisajismo"], notas: ""
  },
  {
    id: 8, nombre: "MDV", esEmpresa: true, razonSocial: "MDV",
    tipos: ["diseñador"], especialidad: "Arquitectura", rol: "Diseño arquitectónico co-firma",
    estado: "activo",
    email: "", telefono: "", celular: "",
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    contactos: [{ nombre: "—", cargo: "Director", email: "", telefono: "", esPrincipal: true }],
    influencia: 3, interes: 3, poder: "alto", actitud: "supporter",
    expectativas: "Pago de honorarios", estrategia: "keep-informed", raciDefault: "C",
    formaPago: "Honorarios por hitos", plazoPago: 30,
    polizas: [], documentos: [], tags: ["arquitectura"], notas: ""
  },
  {
    id: 9, nombre: "Penta Ingenieros", esEmpresa: true, razonSocial: "Penta Ingenieros S.A.S",
    nit: "", regimen: "Responsable de IVA", representanteLegal: "",
    tipos: ["constructor"], especialidad: "Construcción civil",
    rol: "Constructor principal — Administración Delegada",
    estado: "activo",
    email: "", telefono: "", celular: "", sitioWeb: "",
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    contactos: [{ nombre: "—", cargo: "Gerente de construcción", email: "", telefono: "", esPrincipal: true }],
    influencia: 5, interes: 5, poder: "alto", actitud: "advocate",
    expectativas: "Honorarios, recursos a tiempo, pagos de proveedores", estrategia: "manage-closely", raciDefault: "R",
    formaPago: "Administración delegada (honorarios + costos reembolsables)", plazoPago: 30, cuentaBancaria: "", banco: "",
    polizas: [
      { tipo: "Cumplimiento", aseguradora: "", monto: 0, vigenciaInicio: "", vigenciaFin: "" },
      { tipo: "Todo Riesgo Construcción", aseguradora: "", monto: 0, vigenciaInicio: "", vigenciaFin: "" },
      { tipo: "Responsabilidad Civil Extracontractual", aseguradora: "", monto: 0, vigenciaInicio: "", vigenciaFin: "" }
    ],
    documentos: [], tags: ["constructor", "obra"], notas: ""
  },
  {
    id: 10, nombre: "Alvaro Andrade", esEmpresa: false, regimen: "Responsable de IVA",
    tipos: ["interventoria"], especialidad: "Interventoría",
    rol: "Interventoría técnica de obra Casa 107",
    estado: "activo",
    email: "", telefono: "", celular: "", contactos: [{ nombre: "Alvaro Andrade", cargo: "Interventor", email: "", telefono: "", esPrincipal: true }],
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    influencia: 4, interes: 4, poder: "alto", actitud: "neutral",
    expectativas: "Pago de honorarios + información oportuna", estrategia: "manage-closely", raciDefault: "C",
    formaPago: "Honorarios mensuales", plazoPago: 30,
    polizas: [{ tipo: "Cumplimiento", aseguradora: "", monto: 0, vigenciaInicio: "", vigenciaFin: "" }],
    documentos: [], tags: ["interventoría"], notas: ""
  },
  {
    id: 11, nombre: "Alianza Fiduciaria", esEmpresa: true, razonSocial: "Alianza Fiduciaria S.A.",
    nit: "", regimen: "Gran contribuyente", representanteLegal: "",
    tipos: ["fiducia"], especialidad: "Fiducia",
    rol: "Fiducia inmobiliaria de preventas — administra el P.A. Casa 107",
    estado: "activo",
    email: "", telefono: "", celular: "", sitioWeb: "https://www.alianza.com.co",
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    contactos: [
      { nombre: "—", cargo: "Coordinador P.A.", email: "", telefono: "", esPrincipal: true },
      { nombre: "—", cargo: "Gerente comercial fiducia", email: "", telefono: "", esPrincipal: false }
    ],
    influencia: 5, interes: 3, poder: "alto", actitud: "neutral",
    expectativas: "Cumplimiento de condiciones de giro y reporte oportuno", estrategia: "keep-satisfied", raciDefault: "I",
    polizas: [], documentos: [],
    tags: ["fiducia", "P.A.", "condiciones giro"],
    notas: "Patrimonio Autónomo Casa 107. Condiciones de giro: ver Información de Interés."
  },
  {
    id: 12, nombre: "Banco de Occidente", esEmpresa: true, razonSocial: "Banco de Occidente S.A.",
    nit: "", regimen: "Gran contribuyente",
    tipos: ["banco"], especialidad: "Banco",
    rol: "Crédito constructor Casa 107",
    estado: "activo",
    email: "", telefono: "", sitioWeb: "https://www.bancodeoccidente.com.co",
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    contactos: [{ nombre: "—", cargo: "Ejecutivo crédito constructor", email: "", telefono: "", esPrincipal: true }],
    influencia: 4, interes: 3, poder: "alto", actitud: "neutral",
    expectativas: "Cumplimiento covenants, garantías y servicio de deuda", estrategia: "keep-satisfied", raciDefault: "I",
    polizas: [], documentos: [], tags: ["banco", "crédito constructor"], notas: ""
  },
  {
    id: 13, nombre: "Jose Guillermo Duque", esEmpresa: false, regimen: "Responsable de IVA",
    tipos: ["interno"], especialidad: "Gerencia de proyecto",
    rol: "PM Cretto — Gerencia de proyecto Casa 107",
    estado: "activo",
    email: "jgduquem@gmail.com", telefono: "", celular: "",
    contactos: [{ nombre: "Jose Guillermo Duque", cargo: "PM Cretto", email: "jgduquem@gmail.com", telefono: "", esPrincipal: true }],
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    influencia: 4, interes: 5, poder: "alto", actitud: "advocate",
    expectativas: "Cumplimiento de honorarios + autoridad operativa", estrategia: "manage-closely", raciDefault: "R",
    formaPago: "Honorarios 0,5% VTV", plazoPago: 30,
    polizas: [], documentos: [], tags: ["PM Cretto", "interno"], notas: ""
  }
];

/* ─── Componente principal ──────────────────────────────────────── */
const StakeholdersDB = ({ project, onChange }) => {
  const [stakeholders, setStakeholders] = useState(SEED_STAKEHOLDERS_CASA107);
  const [query, setQuery] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [filtroEstado, setFiltroEstado] = useState("activos");
  const [vista, setVista] = useState("hoja"); // hoja | analisis-pmi
  const [modal, setModal] = useState(null); // stakeholder o {} para nuevo

  /* Persistencia */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:stakeholders:${project?.id || "default"}`);
        if (m && r && r.value) setStakeholders(JSON.parse(r.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:stakeholders:${project?.id || "default"}`, JSON.stringify(stakeholders)).catch(() => {});
    }, 500);
    if (onChange) onChange(stakeholders);
    return () => clearTimeout(t);
  }, [stakeholders, project?.id, onChange]);

  const filtered = useMemo(() => {
    return stakeholders.filter(s => {
      if (filtroEstado === "activos" && s.estado !== "activo") return false;
      if (filtroEstado !== "activos" && filtroEstado !== "all" && s.estado !== filtroEstado) return false;
      if (filtroTipo !== "all" && !(s.tipos || []).includes(filtroTipo)) return false;
      if (query) {
        const q = query.toLowerCase();
        return (s.nombre || "").toLowerCase().includes(q)
          || (s.razonSocial || "").toLowerCase().includes(q)
          || (s.email || "").toLowerCase().includes(q)
          || (s.especialidad || "").toLowerCase().includes(q)
          || (s.rol || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [stakeholders, query, filtroTipo, filtroEstado]);

  const stats = useMemo(() => {
    const total = stakeholders.length;
    const porTipo = {};
    TIPOS_STAKEHOLDER.forEach(t => { porTipo[t.id] = stakeholders.filter(s => (s.tipos || []).includes(t.id)).length; });
    const conEmail = stakeholders.filter(s => s.email || (s.contactos || []).some(c => c.email)).length;
    const conTelefono = stakeholders.filter(s => s.telefono || s.celular || (s.contactos || []).some(c => c.telefono)).length;
    return { total, porTipo, conEmail, conTelefono };
  }, [stakeholders]);

  const upsert = (data) => {
    if (data.id && stakeholders.find(s => s.id === data.id)) {
      setStakeholders(prev => prev.map(s => s.id === data.id ? { ...data, fechaUpdate: new Date().toISOString() } : s));
    } else {
      const id = Math.max(0, ...stakeholders.map(s => s.id)) + 1;
      setStakeholders(prev => [...prev, { ...data, id, fechaCreacion: new Date().toISOString() }]);
    }
    setModal(null);
  };

  const remove = (id) => {
    if (!confirm("¿Eliminar stakeholder de la base maestra?")) return;
    setStakeholders(prev => prev.filter(s => s.id !== id));
  };

  const exportCsv = () => {
    const headers = ["Nombre", "Tipo(s)", "Especialidad", "Rol", "Estado", "Email", "Teléfono", "Celular", "Ciudad", "Influencia", "Interés", "Estrategia PMI", "RACI", "Notas"];
    const lines = [headers.join(",")];
    stakeholders.forEach(s => {
      lines.push([
        s.nombre, (s.tipos || []).join(";"), s.especialidad, s.rol, s.estado,
        s.email, s.telefono, s.celular, s.ciudad,
        s.influencia, s.interes, s.estrategia, s.raciDefault,
        s.notas
      ].map(c => `"${(c == null ? "" : String(c)).replace(/"/g, '""')}"`).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `Stakeholders-${project?.nombre || "proyecto"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Stakeholders · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Base de datos maestra de stakeholders</h1>
          <p className="mt-1 text-sm text-stone-500">
            Fuente única de actores del proyecto. Otros módulos (Matriz RACI, Bitácora, Pagos, Notificaciones) consumen de aquí.
            Combina estándar PMI (registro + análisis de influencia/interés) con datos prácticos de edificación Colombia (NIT, pólizas, forma de pago).
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button onClick={() => setModal({})} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">
            <Plus className="h-4 w-4" /> Nuevo stakeholder
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        <Kpi label="Total" value={stats.total} />
        <Kpi label="Con email" value={`${stats.conEmail}/${stats.total}`} color="emerald" />
        <Kpi label="Con teléfono" value={`${stats.conTelefono}/${stats.total}`} color="emerald" />
        <Kpi label="Inversionistas" value={stats.porTipo.inversionista || 0} color="violet" />
        <Kpi label="Proveedores" value={(stats.porTipo.proveedor || 0) + (stats.porTipo.constructor || 0) + (stats.porTipo.diseñador || 0)} color="teal" />
      </div>

      {/* Tabs */}
      <div className="mb-3 flex border-b border-stone-200">
        {[
          { id: "hoja", label: "Hoja maestra (vista calc)" },
          { id: "analisis-pmi", label: "Análisis PMI (matriz P/I)" }
        ].map(t => (
          <button key={t.id} onClick={() => setVista(t.id)} className={`-mb-px border-b-2 px-3 py-2 text-[12px] font-medium ${vista === t.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre, email, especialidad…" className="w-full rounded-md border border-stone-300 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm">
          <option value="all">Todos los tipos</option>
          {TIPOS_STAKEHOLDER.map(t => <option key={t.id} value={t.id}>{t.label} ({stats.porTipo[t.id] || 0})</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm">
          <option value="activos">Solo activos</option>
          <option value="all">Todos los estados</option>
          {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
      </div>

      {vista === "hoja" && (
        <HojaCalcView
          stakeholders={filtered}
          onEdit={(s) => setModal(s)}
          onDelete={remove}
          onPatch={(id, patch) => setStakeholders(prev => prev.map(s => s.id === id ? { ...s, ...patch, fechaUpdate: new Date().toISOString() } : s))}
          onCreateBlank={() => {
            const id = Math.max(0, ...stakeholders.map(s => s.id)) + 1;
            setStakeholders(prev => [...prev, {
              id, nombre: "Nuevo stakeholder", tipos: ["otro"], especialidad: "Otro", rol: "", estado: "activo",
              email: "", telefono: "", celular: "", ciudad: "Bogotá", pais: "Colombia",
              contactos: [], influencia: 3, interes: 3, poder: "alto", actitud: "neutral",
              estrategia: "monitor", raciDefault: "I", polizas: [], tags: [], notas: "",
              fechaCreacion: new Date().toISOString()
            }]);
          }}
        />
      )}
      {vista === "analisis-pmi" && <AnalisisPMIView stakeholders={filtered} onEdit={(s) => setModal(s)} />}

      {modal !== null && (
        <StakeholderModal initial={modal.id ? modal : null} onClose={() => setModal(null)} onSave={upsert} />
      )}
    </div>
  );
};

/* ─── Editable cells ───────────────────────────────────────────── */
const CellText = ({ value, onChange, mono, placeholder }) => (
  <input
    value={value || ""}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder || "—"}
    className={`w-full border-0 bg-transparent px-1 py-0.5 text-[11px] ${mono ? "font-mono text-[10px]" : ""} focus:bg-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-400`}
  />
);

const CellNumber = ({ value, onChange, min = 1, max = 5 }) => (
  <input
    type="number" min={min} max={max}
    value={value || ""}
    onChange={e => onChange(parseInt(e.target.value) || 0)}
    className="w-12 border-0 bg-transparent px-1 py-0.5 text-center font-mono text-[11px] focus:bg-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-400"
  />
);

const CellSelect = ({ value, onChange, options, render, width }) => (
  <select
    value={value || ""}
    onChange={e => onChange(e.target.value)}
    className="w-full border-0 bg-transparent px-1 py-0.5 text-[11px] focus:bg-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-400"
    style={width ? { width } : undefined}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

/* Multi-select por chips (para tipos) */
const CellTipos = ({ tipos = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const cfgs = tipos.map(tid => TIPOS_STAKEHOLDER.find(x => x.id === tid)).filter(Boolean);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex w-full flex-wrap gap-0.5 px-1 py-0.5 text-left hover:bg-emerald-50">
        {cfgs.length === 0 && <span className="text-[10px] italic text-stone-400">Asignar…</span>}
        {cfgs.slice(0, 3).map(t => <span key={t.id} className={`rounded px-1 py-0.5 text-[9px] font-semibold ${COLOR_CLASS[t.color]}`}>{t.label.split(" ")[0]}</span>)}
        {cfgs.length > 3 && <span className="text-[9px] text-stone-400">+{cfgs.length - 3}</span>}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-56 max-h-72 overflow-y-auto rounded-md border border-stone-300 bg-white shadow-lg">
          {TIPOS_STAKEHOLDER.map(t => {
            const on = tipos.includes(t.id);
            const Ic = t.icon;
            return (
              <label key={t.id} className="flex items-center gap-2 border-b border-stone-100 px-2 py-1 text-[11px] last:border-b-0 hover:bg-stone-50">
                <input type="checkbox" checked={on} onChange={() => onChange(on ? tipos.filter(x => x !== t.id) : [...tipos, t.id])} className="accent-emerald-700" />
                <Ic className="h-3 w-3" />
                <span>{t.label}</span>
              </label>
            );
          })}
          <button onClick={() => setOpen(false)} className="w-full bg-stone-100 px-2 py-1 text-[10px] text-stone-600 hover:bg-stone-200">Cerrar</button>
        </div>
      )}
    </div>
  );
};

/* Tags editable */
const CellTags = ({ tags = [], onChange }) => (
  <input
    value={tags.join(", ")}
    onChange={e => onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
    placeholder="tag1, tag2"
    className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px] focus:bg-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-400"
  />
);

/* ─── Vista hoja de cálculo (editable inline) ───────────────────── */
const HojaCalcView = ({ stakeholders, onEdit, onDelete, onPatch, onCreateBlank }) => {
  /* Resolución de email/tel principal (preferencia: campo principal del row → contacto principal) */
  const principalEmail = (s) => s.email || (s.contactos || []).find(c => c.esPrincipal)?.email || "";
  const principalTel = (s) => s.telefono || (s.contactos || []).find(c => c.esPrincipal)?.telefono || "";

  /* Anchos de columna redimensionables */
  const cols = useResizableColumns("stakeholders.hoja", {
    nombre: 200, tipos: 140, especialidad: 130, rol: 200, estado: 100,
    nit: 100, email: 180, telefono: 100, celular: 100, ciudad: 100,
    infl: 60, int: 60, actitud: 110, estrategia: 140, raci: 60,
    formaPago: 140, polizas: 70, acc: 70
  });

  const thBase = "border-b border-stone-200 px-2 py-2 text-[9px] font-semibold uppercase tracking-wider text-stone-500";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] text-stone-500">
        <span>💡 <strong>Edición inline</strong>: click en cualquier celda. <strong>Anchos ajustables</strong>: arrastra el borde derecho de cada cabecera.</span>
        <div className="flex items-center gap-2">
          <ResetWidthsButton onReset={cols.reset} />
          <button onClick={onCreateBlank} className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100">
            <Plus className="h-3 w-3" /> Agregar fila en blanco
          </button>
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-visible rounded-lg border border-stone-200 bg-white">
        <table className="text-[11px]">
          <thead className="sticky top-0 z-20 bg-stone-50">
            <tr>
              <ResizableTh w={cols.w("nombre")} onResize={cols.r("nombre")} className={`${thBase} sticky left-0 z-30 border-r bg-stone-50 px-3`}>Nombre</ResizableTh>
              <ResizableTh w={cols.w("tipos")} onResize={cols.r("tipos")} className={thBase}>Tipos</ResizableTh>
              <ResizableTh w={cols.w("especialidad")} onResize={cols.r("especialidad")} className={thBase}>Especialidad</ResizableTh>
              <ResizableTh w={cols.w("rol")} onResize={cols.r("rol")} className={thBase}>Rol</ResizableTh>
              <ResizableTh w={cols.w("estado")} onResize={cols.r("estado")} className={thBase}>Estado</ResizableTh>
              <ResizableTh w={cols.w("nit")} onResize={cols.r("nit")} className={thBase}>NIT</ResizableTh>
              <ResizableTh w={cols.w("email")} onResize={cols.r("email")} className={thBase}>Email</ResizableTh>
              <ResizableTh w={cols.w("telefono")} onResize={cols.r("telefono")} className={thBase}>Teléfono</ResizableTh>
              <ResizableTh w={cols.w("celular")} onResize={cols.r("celular")} className={thBase}>Celular</ResizableTh>
              <ResizableTh w={cols.w("ciudad")} onResize={cols.r("ciudad")} className={thBase}>Ciudad</ResizableTh>
              <ResizableTh w={cols.w("infl")} onResize={cols.r("infl")} align="center" className={thBase}>Infl.</ResizableTh>
              <ResizableTh w={cols.w("int")} onResize={cols.r("int")} align="center" className={thBase}>Int.</ResizableTh>
              <ResizableTh w={cols.w("actitud")} onResize={cols.r("actitud")} className={thBase}>Actitud</ResizableTh>
              <ResizableTh w={cols.w("estrategia")} onResize={cols.r("estrategia")} className={thBase}>Estrategia PMI</ResizableTh>
              <ResizableTh w={cols.w("raci")} onResize={cols.r("raci")} align="center" className={thBase}>RACI</ResizableTh>
              <ResizableTh w={cols.w("formaPago")} onResize={cols.r("formaPago")} className={thBase}>Forma pago</ResizableTh>
              <ResizableTh w={cols.w("polizas")} onResize={cols.r("polizas")} align="center" className={thBase}>Pólizas</ResizableTh>
              <ResizableTh w={cols.w("acc")} onResize={cols.r("acc")} align="center" className={thBase}>Acc.</ResizableTh>
            </tr>
          </thead>
          <tbody>
            {stakeholders.length === 0 && (
              <tr><td colSpan={18} className="px-3 py-8 text-center text-stone-400">Sin stakeholders para los filtros aplicados.</td></tr>
            )}
            {stakeholders.map(s => {
              const estCfg = ESTRATEGIAS_PMI.find(e => e.id === s.estrategia);
              const tdBase = "border-l border-stone-100 px-1 py-1 overflow-hidden";
              return (
                <tr key={s.id} className="border-t border-stone-100 hover:bg-stone-50/40">
                  <td className="sticky left-0 z-10 border-r border-stone-200 bg-white px-1 py-1 overflow-hidden" style={cols.s("nombre")}>
                    <CellText value={s.nombre} onChange={(v) => onPatch(s.id, { nombre: v })} placeholder="Nombre / razón social" />
                    {s.esEmpresa && (
                      <input
                        value={s.representanteLegal || ""}
                        onChange={e => onPatch(s.id, { representanteLegal: e.target.value })}
                        placeholder="Representante legal"
                        className="block w-full border-0 bg-transparent px-1 text-[10px] text-stone-500 focus:bg-emerald-50 focus:outline-none"
                      />
                    )}
                  </td>
                  <td className={tdBase} style={cols.s("tipos")}><CellTipos tipos={s.tipos || []} onChange={(v) => onPatch(s.id, { tipos: v })} /></td>
                  <td className={tdBase} style={cols.s("especialidad")}><CellSelect value={s.especialidad} onChange={(v) => onPatch(s.id, { especialidad: v })} options={ESPECIALIDADES.map(e => ({ value: e, label: e }))} /></td>
                  <td className={tdBase} style={cols.s("rol")}><CellText value={s.rol} onChange={(v) => onPatch(s.id, { rol: v })} placeholder="Rol en el proyecto" /></td>
                  <td className={tdBase} style={cols.s("estado")}><CellSelect value={s.estado} onChange={(v) => onPatch(s.id, { estado: v })} options={ESTADOS.map(e => ({ value: e.id, label: e.label }))} /></td>
                  <td className={tdBase} style={cols.s("nit")}><CellText value={s.nit} onChange={(v) => onPatch(s.id, { nit: v })} mono placeholder="NIT/CC" /></td>
                  <td className={tdBase} style={cols.s("email")}><CellText value={principalEmail(s)} onChange={(v) => onPatch(s.id, { email: v })} placeholder="email@…" /></td>
                  <td className={tdBase} style={cols.s("telefono")}><CellText value={principalTel(s)} onChange={(v) => onPatch(s.id, { telefono: v })} mono placeholder="+57…" /></td>
                  <td className={tdBase} style={cols.s("celular")}><CellText value={s.celular} onChange={(v) => onPatch(s.id, { celular: v })} mono placeholder="+57…" /></td>
                  <td className={tdBase} style={cols.s("ciudad")}><CellText value={s.ciudad} onChange={(v) => onPatch(s.id, { ciudad: v })} placeholder="Ciudad" /></td>
                  <td className={`${tdBase} text-center`} style={cols.s("infl")}><CellNumber value={s.influencia} onChange={(v) => onPatch(s.id, { influencia: v, estrategia: deriveEstrategia(v, s.interes) })} /></td>
                  <td className={`${tdBase} text-center`} style={cols.s("int")}><CellNumber value={s.interes} onChange={(v) => onPatch(s.id, { interes: v, estrategia: deriveEstrategia(s.influencia, v) })} /></td>
                  <td className={tdBase} style={cols.s("actitud")}><CellSelect value={s.actitud} onChange={(v) => onPatch(s.id, { actitud: v })} options={ACTITUDES.map(a => ({ value: a.id, label: a.label }))} /></td>
                  <td className={`${tdBase} text-[10px] italic text-stone-600`} style={cols.s("estrategia")}>{estCfg?.label || "—"}</td>
                  <td className={`${tdBase} text-center`} style={cols.s("raci")}>
                    <CellSelect value={s.raciDefault} onChange={(v) => onPatch(s.id, { raciDefault: v })} options={[
                      { value: "",  label: "—" }, { value: "R", label: "R" }, { value: "A", label: "A" }, { value: "C", label: "C" }, { value: "I", label: "I" }
                    ]} />
                  </td>
                  <td className={tdBase} style={cols.s("formaPago")}><CellText value={s.formaPago} onChange={(v) => onPatch(s.id, { formaPago: v })} placeholder="Forma de pago" /></td>
                  <td className={`${tdBase} text-center`} style={cols.s("polizas")}>
                    <button onClick={() => onEdit(s)} className="rounded bg-stone-100 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-200" title="Editar pólizas en panel completo">{(s.polizas || []).length} ✎</button>
                  </td>
                  <td className={`${tdBase} text-center`} style={cols.s("acc")}>
                    <div className="inline-flex gap-0.5">
                      <button onClick={() => onEdit(s)} className="rounded p-0.5 text-stone-500 hover:bg-stone-100" title="Panel completo"><Edit3 className="h-3 w-3" /></button>
                      <button onClick={() => onDelete(s.id)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600" title="Eliminar"><Trash2 className="h-3 w-3" /></button>
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

/* ─── Vista Análisis PMI — matriz Power/Interest ────────────────── */
const AnalisisPMIView = ({ stakeholders, onEdit }) => {
  const quadrants = {
    "manage-closely": stakeholders.filter(s => s.estrategia === "manage-closely" || (s.influencia >= 4 && s.interes >= 4)),
    "keep-satisfied": stakeholders.filter(s => s.estrategia === "keep-satisfied" || (s.influencia >= 4 && s.interes < 4)),
    "keep-informed":  stakeholders.filter(s => s.estrategia === "keep-informed"  || (s.influencia < 4 && s.interes >= 4)),
    "monitor":        stakeholders.filter(s => s.estrategia === "monitor"        || (s.influencia < 4 && s.interes < 4))
  };
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="mb-3 text-[12px] text-stone-600">
        <strong>Matriz Power / Interest (PMI)</strong> — Estrategia de gestión derivada del análisis Influencia × Interés (1-5). Click en un stakeholder para editar.
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ESTRATEGIAS_PMI.map(est => {
          const sk = quadrants[est.id] || [];
          const tone = est.id === "manage-closely" ? "emerald" : est.id === "keep-satisfied" ? "amber" : est.id === "keep-informed" ? "blue" : "stone";
          return (
            <div key={est.id} className={`rounded-lg border ${COLOR_CLASS[tone]} p-3`}>
              <div className="mb-1 flex items-center justify-between">
                <h4 className="text-[13px] font-semibold">{est.label}</h4>
                <span className="text-[10px] opacity-70">{sk.length}</span>
              </div>
              <div className="text-[10px] opacity-80 mb-2">{est.desc}</div>
              <div className="space-y-1">
                {sk.length === 0 && <div className="text-[11px] italic opacity-60">— sin stakeholders —</div>}
                {sk.map(s => (
                  <button key={s.id} onClick={() => onEdit(s)} className="flex w-full items-center justify-between rounded bg-white/70 px-2 py-1 text-left text-[11px] hover:bg-white">
                    <span className="font-medium">{s.nombre}</span>
                    <span className="font-mono text-[9px]">I{s.influencia || 0}·E{s.interes || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Kpi = ({ label, value, color = "stone" }) => {
  const colors = {
    stone: "bg-stone-50 text-stone-800 border-stone-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    violet: "bg-violet-50 text-violet-800 border-violet-200",
    teal: "bg-teal-50 text-teal-800 border-teal-200"
  };
  return (
    <div className={`rounded-md border p-3 ${colors[color]}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="font-serif text-xl">{value}</div>
    </div>
  );
};

/* ─── Modal de edición ──────────────────────────────────────────── */
const StakeholderModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || {
    nombre: "", esEmpresa: false, razonSocial: "", nit: "", regimen: "Responsable de IVA",
    representanteLegal: "",
    tipos: [], especialidad: "Otro", rol: "", estado: "activo",
    email: "", telefono: "", celular: "", whatsapp: "", sitioWeb: "",
    direccion: "", ciudad: "Bogotá", pais: "Colombia",
    contactos: [], influencia: 3, interes: 3, poder: "alto", actitud: "neutral",
    expectativas: "", estrategia: "monitor", raciDefault: "I",
    aporteCop: 0, pctParticipacion: 0, tipoAporte: "",
    formaPago: "", plazoPago: 30, cuentaBancaria: "", banco: "",
    polizas: [], documentos: [], tags: [], notas: ""
  });
  const [tab, setTab] = useState("basico");

  /* Auto-derive estrategia */
  useEffect(() => {
    setForm(f => ({ ...f, estrategia: deriveEstrategia(f.influencia, f.interes) }));
  }, [form.influencia, form.interes]);

  const update = (patch) => setForm(f => ({ ...f, ...patch }));
  const toggleTipo = (id) => update({ tipos: (form.tipos || []).includes(id) ? form.tipos.filter(t => t !== id) : [...(form.tipos || []), id] });

  const addContacto = () => update({ contactos: [...(form.contactos || []), { nombre: "", cargo: "", email: "", telefono: "", esPrincipal: false }] });
  const updContacto = (idx, patch) => update({ contactos: form.contactos.map((c, i) => i === idx ? { ...c, ...patch } : c) });
  const rmContacto = (idx) => update({ contactos: form.contactos.filter((_, i) => i !== idx) });

  const addPoliza = () => update({ polizas: [...(form.polizas || []), { tipo: "Cumplimiento", aseguradora: "", monto: 0, vigenciaInicio: "", vigenciaFin: "" }] });
  const updPoliza = (idx, patch) => update({ polizas: form.polizas.map((p, i) => i === idx ? { ...p, ...patch } : p) });
  const rmPoliza = (idx) => update({ polizas: form.polizas.filter((_, i) => i !== idx) });

  const tieneTipo = (id) => (form.tipos || []).includes(id);
  const esInversionista = tieneTipo("inversionista");
  const esProveedor = tieneTipo("proveedor") || tieneTipo("constructor") || tieneTipo("diseñador");
  const esConstructor = tieneTipo("constructor") || tieneTipo("interventoria");

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">{initial ? `Editar: ${form.nombre}` : "Nuevo stakeholder"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>

        <div className="flex border-b border-stone-200 bg-stone-50 px-4">
          {[
            { id: "basico",     label: "Básico" },
            { id: "contacto",   label: "Contacto" },
            { id: "pmi",        label: "Análisis PMI" },
            { id: "financiero", label: esInversionista || esProveedor ? "Financiero" : "Financiero (n/a)" },
            { id: "polizas",    label: `Pólizas (${form.polizas?.length || 0})` },
            { id: "notas",      label: "Notas" }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`-mb-px border-b-2 px-3 py-2 text-[12px] font-medium ${tab === t.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "basico" && (
            <div className="space-y-3">
              <Field label="Nombre / razón social" required>
                <input value={form.nombre} onChange={e => update({ nombre: e.target.value })} className="inp" placeholder="Ej. Casa Developers SAS o Juan Pérez" />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="¿Es empresa?">
                  <select value={form.esEmpresa ? "si" : "no"} onChange={e => update({ esEmpresa: e.target.value === "si" })} className="inp">
                    <option value="no">Persona natural</option>
                    <option value="si">Empresa / Jurídica</option>
                  </select>
                </Field>
                <Field label="NIT / Cédula"><input value={form.nit} onChange={e => update({ nit: e.target.value })} className="inp" /></Field>
                <Field label="Régimen tributario">
                  <select value={form.regimen} onChange={e => update({ regimen: e.target.value })} className="inp">
                    {REGIMENES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
              </div>
              {form.esEmpresa && (
                <Field label="Representante legal">
                  <input value={form.representanteLegal} onChange={e => update({ representanteLegal: e.target.value })} className="inp" />
                </Field>
              )}
              <div>
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-600">Tipos (multi-select)</span>
                <div className="flex flex-wrap gap-1">
                  {TIPOS_STAKEHOLDER.map(t => {
                    const on = (form.tipos || []).includes(t.id);
                    const Ic = t.icon;
                    return (
                      <button key={t.id} type="button" onClick={() => toggleTipo(t.id)} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${on ? COLOR_CLASS[t.color] + " ring-1 ring-stone-300" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}>
                        <Ic className="h-3 w-3" /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Especialidad">
                  <select value={form.especialidad} onChange={e => update({ especialidad: e.target.value })} className="inp">
                    {ESPECIALIDADES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Estado">
                  <select value={form.estado} onChange={e => update({ estado: e.target.value })} className="inp">
                    {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Rol en el proyecto">
                <textarea value={form.rol} onChange={e => update({ rol: e.target.value })} rows={2} className="inp" placeholder="Ej. Constructor principal en administración delegada" />
              </Field>
            </div>
          )}

          {tab === "contacto" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email principal"><input type="email" value={form.email} onChange={e => update({ email: e.target.value })} className="inp" /></Field>
                <Field label="Sitio web"><input value={form.sitioWeb} onChange={e => update({ sitioWeb: e.target.value })} className="inp" placeholder="https://…" /></Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Teléfono fijo"><input value={form.telefono} onChange={e => update({ telefono: e.target.value })} className="inp" /></Field>
                <Field label="Celular"><input value={form.celular} onChange={e => update({ celular: e.target.value })} className="inp" /></Field>
                <Field label="WhatsApp"><input value={form.whatsapp} onChange={e => update({ whatsapp: e.target.value })} className="inp" /></Field>
              </div>
              <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
                <Field label="Dirección"><input value={form.direccion} onChange={e => update({ direccion: e.target.value })} className="inp" /></Field>
                <Field label="Ciudad"><input value={form.ciudad} onChange={e => update({ ciudad: e.target.value })} className="inp" /></Field>
                <Field label="País"><input value={form.pais} onChange={e => update({ pais: e.target.value })} className="inp" /></Field>
              </div>

              <div className="rounded-md border border-stone-200 bg-stone-50/40 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-600">Contactos del equipo</span>
                  <button onClick={addContacto} className="rounded border border-stone-300 bg-white px-2 py-0.5 text-[10px] hover:bg-stone-50">+ Contacto</button>
                </div>
                {(form.contactos || []).length === 0 && <div className="text-center text-[11px] italic text-stone-400 py-2">Sin contactos adicionales.</div>}
                {(form.contactos || []).map((c, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_1fr_60px_auto] gap-1 border-b border-stone-100 py-1 text-[11px] last:border-b-0">
                    <input value={c.nombre} onChange={e => updContacto(idx, { nombre: e.target.value })} placeholder="Nombre" className="rounded border border-stone-200 px-1 py-0.5" />
                    <input value={c.cargo} onChange={e => updContacto(idx, { cargo: e.target.value })} placeholder="Cargo" className="rounded border border-stone-200 px-1 py-0.5" />
                    <input value={c.email} onChange={e => updContacto(idx, { email: e.target.value })} placeholder="email" className="rounded border border-stone-200 px-1 py-0.5" />
                    <input value={c.telefono} onChange={e => updContacto(idx, { telefono: e.target.value })} placeholder="tel" className="rounded border border-stone-200 px-1 py-0.5" />
                    <label className="flex items-center justify-center gap-0.5 text-[9px]"><input type="checkbox" checked={c.esPrincipal || false} onChange={e => updContacto(idx, { esPrincipal: e.target.checked })} /> Princ.</label>
                    <button onClick={() => rmContacto(idx)} className="rounded p-0.5 text-stone-400 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "pmi" && (
            <div className="space-y-3">
              <div className="rounded-md bg-blue-50 p-2 text-[11px] text-blue-900">
                <strong>Estándar PMI:</strong> Registro de stakeholders + análisis Power × Interest (Mendelow). La estrategia se calcula automáticamente.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={`Influencia (poder): ${form.influencia}`}>
                  <input type="range" min="1" max="5" value={form.influencia} onChange={e => update({ influencia: parseInt(e.target.value) })} className="w-full accent-emerald-700" />
                  <div className="flex justify-between text-[9px] text-stone-500"><span>1 ninguna</span><span>5 muy alta</span></div>
                </Field>
                <Field label={`Interés: ${form.interes}`}>
                  <input type="range" min="1" max="5" value={form.interes} onChange={e => update({ interes: parseInt(e.target.value) })} className="w-full accent-emerald-700" />
                  <div className="flex justify-between text-[9px] text-stone-500"><span>1 ninguno</span><span>5 muy alto</span></div>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Poder">
                  <select value={form.poder} onChange={e => update({ poder: e.target.value })} className="inp">
                    <option value="alto">Alto</option>
                    <option value="bajo">Bajo</option>
                  </select>
                </Field>
                <Field label="Actitud">
                  <select value={form.actitud} onChange={e => update({ actitud: e.target.value })} className="inp">
                    {ACTITUDES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </Field>
                <Field label="RACI por defecto">
                  <select value={form.raciDefault} onChange={e => update({ raciDefault: e.target.value })} className="inp">
                    <option value="">—</option>
                    <option value="R">R (Responsable)</option>
                    <option value="A">A (Aprobador)</option>
                    <option value="C">C (Consultado)</option>
                    <option value="I">I (Informado)</option>
                  </select>
                </Field>
              </div>
              <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-2 text-[11px]">
                <strong>Estrategia de gestión derivada:</strong> {ESTRATEGIAS_PMI.find(e => e.id === form.estrategia)?.label} — {ESTRATEGIAS_PMI.find(e => e.id === form.estrategia)?.desc}
              </div>
              <Field label="Expectativas del stakeholder">
                <textarea value={form.expectativas} onChange={e => update({ expectativas: e.target.value })} rows={2} className="inp" placeholder="¿Qué espera obtener del proyecto?" />
              </Field>
            </div>
          )}

          {tab === "financiero" && (
            <div className="space-y-3">
              {esInversionista && (
                <div className="rounded-md border border-violet-200 bg-violet-50/40 p-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-violet-800">Datos como inversionista</div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Aporte (COP)"><input type="number" value={form.aporteCop} onChange={e => update({ aporteCop: parseFloat(e.target.value) || 0 })} className="inp" /></Field>
                    <Field label="% participación"><input type="number" value={form.pctParticipacion} onChange={e => update({ pctParticipacion: parseFloat(e.target.value) || 0 })} className="inp" /></Field>
                    <Field label="Tipo de aporte"><input value={form.tipoAporte} onChange={e => update({ tipoAporte: e.target.value })} className="inp" placeholder="Efectivo / Lote / Diseño" /></Field>
                  </div>
                </div>
              )}
              {esProveedor && (
                <div className="rounded-md border border-teal-200 bg-teal-50/40 p-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-teal-800">Datos como proveedor</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Forma de pago"><input value={form.formaPago} onChange={e => update({ formaPago: e.target.value })} className="inp" placeholder="Honorarios mensuales / Adm. delegada / Contado" /></Field>
                    <Field label="Plazo (días)"><input type="number" value={form.plazoPago} onChange={e => update({ plazoPago: parseInt(e.target.value) || 0 })} className="inp" /></Field>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <Field label="Cuenta bancaria"><input value={form.cuentaBancaria} onChange={e => update({ cuentaBancaria: e.target.value })} className="inp" /></Field>
                    <Field label="Banco"><input value={form.banco} onChange={e => update({ banco: e.target.value })} className="inp" /></Field>
                  </div>
                </div>
              )}
              {!esInversionista && !esProveedor && (
                <div className="rounded-md bg-stone-50 p-3 text-[12px] text-stone-600">
                  Los campos financieros se activan al marcar el stakeholder como Inversionista, Constructor, Proveedor o Diseñador.
                </div>
              )}
            </div>
          )}

          {tab === "polizas" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-stone-600">Pólizas vigentes — exigibles a constructor e interventoría según contrato.</div>
                <button onClick={addPoliza} className="rounded border border-stone-300 bg-white px-2 py-1 text-[11px] hover:bg-stone-50">+ Póliza</button>
              </div>
              {(form.polizas || []).length === 0 && <div className="rounded border border-dashed border-stone-300 p-4 text-center text-[12px] text-stone-400">Sin pólizas registradas.</div>}
              {(form.polizas || []).map((p, idx) => (
                <div key={idx} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_auto] gap-1 rounded border border-stone-200 p-2 text-[11px]">
                  <input value={p.tipo} onChange={e => updPoliza(idx, { tipo: e.target.value })} placeholder="Tipo (Cumplimiento, TRC, RC...)" className="rounded border border-stone-200 px-1 py-0.5" />
                  <input value={p.aseguradora} onChange={e => updPoliza(idx, { aseguradora: e.target.value })} placeholder="Aseguradora" className="rounded border border-stone-200 px-1 py-0.5" />
                  <input type="number" value={p.monto} onChange={e => updPoliza(idx, { monto: parseFloat(e.target.value) || 0 })} placeholder="Monto COP" className="rounded border border-stone-200 px-1 py-0.5 font-mono" />
                  <input type="date" value={p.vigenciaInicio} onChange={e => updPoliza(idx, { vigenciaInicio: e.target.value })} className="rounded border border-stone-200 px-1 py-0.5" />
                  <input type="date" value={p.vigenciaFin} onChange={e => updPoliza(idx, { vigenciaFin: e.target.value })} className="rounded border border-stone-200 px-1 py-0.5" />
                  <button onClick={() => rmPoliza(idx)} className="rounded p-0.5 text-stone-400 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}

          {tab === "notas" && (
            <div className="space-y-3">
              <Field label="Notas">
                <textarea value={form.notas} onChange={e => update({ notas: e.target.value })} rows={8} className="inp" placeholder="Notas históricas, observaciones, contexto del stakeholder…" />
              </Field>
            </div>
          )}
        </div>

        <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
          <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!form.nombre.trim() || (form.tipos || []).length === 0} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">
            Guardar
          </button>
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

/* ─── API consumible por otros módulos ──────────────────────────── */
export const getStakeholdersByTipo = (stakeholders, tipoId) =>
  (stakeholders || []).filter(s => (s.tipos || []).includes(tipoId) && s.estado === "activo");

export const getStakeholderEmail = (s) =>
  s.email || (s.contactos || []).find(c => c.esPrincipal)?.email || (s.contactos || [])[0]?.email || "";

export default StakeholdersDB;
