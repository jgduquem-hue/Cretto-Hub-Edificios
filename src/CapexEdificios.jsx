import React, { useState, useMemo, useEffect } from "react";
import {
  DollarSign, ChevronRight, ChevronDown, Plus, Upload, FileText,
  Trash2, X, Edit3, Eye, Search, Filter, AlertCircle, TrendingUp,
  TrendingDown, ArrowRight, Layers, Hammer, Briefcase, Wallet
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line, ReferenceLine
} from "recharts";
import { getValor, getHistorial, getVigenteIdx, setHistorial, matchTareas, avanceTareas } from "./capexCronoLink.js";

/* ────────────────────────────────────────────────────────────────
   CAPEX para proyectos de edificación
   Estructura PMI:
   - CAPÍTULOS grandes (10 capítulos principales)
   - El capítulo "Construcción" se descompone en una EDT/WBS detallada
     (8 paquetes de obra), alineada con el cronograma
   - Cada partida tiene MÚLTIPLES VERSIONES de presupuesto:
     • Inicial (Cretto/gerencia)
     • Constructor (contrato real)
     • Interventoría (validación)
     • Supervisión técnica (inicial)
     • Ejecutado (real al cierre)
   - Cada versión puede tener un DOCUMENTO FUENTE adjunto
   - Variances entre versiones se calculan y visualizan

   Vistas: por capítulo · WBS construcción · comparativo · gráfico
────────────────────────────────────────────────────────────────── */

/* Capítulos principales (rollup) */
export const CAPITULOS = [
  { id: "lote",         codigo: "1",  label: "Lote y adquisición",            icon: Briefcase, color: "#92400e" },
  { id: "estudios",     codigo: "2",  label: "Estudios y diseños",            icon: FileText,  color: "#6366f1" },
  { id: "licencias",    codigo: "3",  label: "Licencias y permisos",          icon: FileText,  color: "#ec4899" },
  { id: "construccion", codigo: "4",  label: "Construcción (obra)",           icon: Hammer,    color: "#10b981", hasWBS: true },
  { id: "honorarios",   codigo: "5",  label: "Honorarios profesionales",      icon: Briefcase, color: "#0ea5e9" },
  { id: "comercial",    codigo: "6",  label: "Comercialización y publicidad", icon: TrendingUp,color: "#a855f7" },
  { id: "financieros",  codigo: "7",  label: "Costos financieros",            icon: DollarSign,color: "#06b6d4" },
  { id: "legales",      codigo: "8",  label: "Legales y notariales",          icon: FileText,  color: "#78716c" },
  { id: "impuestos",    codigo: "9",  label: "Impuestos y seguros",           icon: FileText,  color: "#f59e0b" },
  { id: "imprevistos",  codigo: "10", label: "Imprevistos / Contingencia",    icon: AlertCircle,color:"#dc2626" }
];

/* WBS del capítulo Construcción — alineada con cronograma */
export const WBS_CONSTRUCCION = [
  { id: "4.1", codigo: "4.1", label: "Preliminares y demoliciones",       cronoTask: "preliminares" },
  { id: "4.2", codigo: "4.2", label: "Movimiento de tierras y cimentación", cronoTask: "cimentacion" },
  { id: "4.3", codigo: "4.3", label: "Estructura (concreto y/o metálica)",  cronoTask: "estructura" },
  { id: "4.4", codigo: "4.4", label: "Mampostería y muros",                cronoTask: "mamposteria" },
  { id: "4.5", codigo: "4.5", label: "Instalaciones MEP",                  cronoTask: "mep", sub: [
    { id: "4.5.1", codigo: "4.5.1", label: "Hidrosanitarias y gas" },
    { id: "4.5.2", codigo: "4.5.2", label: "Eléctricas y voz/datos" },
    { id: "4.5.3", codigo: "4.5.3", label: "HVAC y ventilación" }
  ]},
  { id: "4.6", codigo: "4.6", label: "Acabados (pisos, enchapes, pintura)", cronoTask: "acabados" },
  { id: "4.7", codigo: "4.7", label: "Fachadas, cubiertas e impermeabilización", cronoTask: "fachadas" },
  { id: "4.8", codigo: "4.8", label: "Equipos especiales (ascensores, planta, hidroflo)", cronoTask: "equipos" },
  { id: "4.9", codigo: "4.9", label: "Urbanismo, zonas comunes y paisajismo", cronoTask: "urbanismo" }
];

/* Las 5 versiones de presupuesto */
export const VERSIONES = [
  { id: "inicial",      label: "Presupuesto inicial (Cretto)", color: "indigo",  short: "Inicial" },
  { id: "constructor",  label: "Contrato constructor",         color: "emerald", short: "Constructor" },
  { id: "interventoria",label: "Interventoría",                color: "amber",   short: "Interventoría" },
  { id: "supervision",  label: "Supervisión técnica",          color: "violet",  short: "Supervisión" },
  { id: "ejecutado",    label: "Ejecutado (real)",             color: "rose",    short: "Ejecutado" }
];

/* ─── Fases de inversión (clasificación financiera de cada peso) ───
   PREOPERATIVO: todo lo que ocurre ANTES de iniciar obra (lote, estudios,
                 licencias, estructuración, mercadeo inicial).
   OPERATIVO:    durante la ejecución de obra (construcción, MEP, acabados,
                 honorarios obra, intereses crédito constructor).
   CIERRE:       al final (escrituración, reglamento PH, liquidación P.A.,
                 postventa, garantías, impuestos finales).
   Conecta con el flujo de caja: el momento de cada egreso depende de su fase. */
export const FASES_INVERSION = [
  { id: "preoperativo", label: "Pre-operativo", short: "Pre-op", color: "indigo", icon: "🏗️", descripcion: "Antes de iniciar obra: lote, estudios, licencias, mercadeo inicial" },
  { id: "operativo",    label: "Operativo",     short: "Op",     color: "emerald", icon: "⚙️", descripcion: "Durante la obra: construcción, MEP, acabados, honorarios, intereses" },
  { id: "cierre",       label: "Cierre",        short: "Cierre", color: "amber", icon: "🏁", descripcion: "Al final: escrituración, reglamento PH, liquidación P.A., postventa" }
];

/* Fase por defecto según capítulo (editable por partida) */
export const FASE_POR_CAPITULO = {
  lote:         "preoperativo",
  estudios:     "preoperativo",
  licencias:    "preoperativo",
  construccion: "operativo",
  honorarios:   "operativo",
  comercial:    "preoperativo",   // mercadeo y sala de ventas arrancan antes de obra
  financieros:  "operativo",      // intereses crédito corren durante obra
  legales:      "cierre",         // escrituración y reglamento P.H. al final
  impuestos:    "operativo",
  imprevistos:  "operativo"
};

/* Resuelve la fase de una partida: usa partida.fase si existe, sino el default por capítulo */
export const getFasePartida = (p) => p?.fase || FASE_POR_CAPITULO[p?.capitulo] || "operativo";

/* Ventana temporal típica de cada fase respecto al cronograma de obra (para distribuir el flujo de caja).
   offsetMesesInicio relativo al inicio de obra; durMeses = duración del desembolso. */
export const FASE_TIMING = {
  preoperativo: { offset: -8, dur: 8 },   // 8 meses antes del inicio de obra
  operativo:    { offset: 0,  dur: 18 },  // durante toda la obra
  cierre:       { offset: 16, dur: 6 }    // últimos meses + post-entrega
};

const COLOR_CLASS = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  indigo:  "bg-indigo-100 text-indigo-800 border-indigo-200",
  amber:   "bg-amber-100 text-amber-800 border-amber-200",
  violet:  "bg-violet-100 text-violet-800 border-violet-200",
  rose:    "bg-rose-100 text-rose-800 border-rose-200",
  blue:    "bg-blue-100 text-blue-800 border-blue-200",
  stone:   "bg-stone-100 text-stone-700 border-stone-200"
};

/* ─── Helpers exportables (consumidos por Tesorería y Modelo Financiero) ─── */

/* Valor efectivo de una partida para una versión, aplicando override de pagos en "ejecutado" */
export const valorEfectivo = (p, versionId, pagosPorWbs = {}) => {
  if (versionId === "ejecutado" && pagosPorWbs[p.wbs] != null) return pagosPorWbs[p.wbs];
  return getValor(p, versionId);
};

/* Totales de CAPEX agrupados por fase de inversión (preoperativo/operativo/cierre).
   Devuelve { preoperativo, operativo, cierre, total } para la versión dada. */
export const capexPorFase = (partidas = [], versionId = "constructor", pagosPorWbs = {}) => {
  const out = { preoperativo: 0, operativo: 0, cierre: 0, total: 0 };
  partidas.forEach(p => {
    const v = valorEfectivo(p, versionId, pagosPorWbs) ?? valorEfectivo(p, "inicial", pagosPorWbs) ?? 0;
    const fase = getFasePartida(p);
    out[fase] = (out[fase] || 0) + v;
    out.total += v;
  });
  return out;
};

/* Distribuye el egreso de CAPEX en una línea de tiempo mensual según la fase de cada partida.
   Retorna [{ key, mes, date, preoperativo, operativo, cierre, total, acumulado }].
   inicioObra: fecha ISO del inicio de obra (ancla temporal). */
export const capexFlujoEgresos = (partidas = [], versionId = "constructor", opts = {}) => {
  const inicioObra = opts.inicioObra ? new Date(opts.inicioObra) : new Date();
  const pagosPorWbs = opts.pagosPorWbs || {};
  const acc = {}; // key "YYYY-MM" -> { preoperativo, operativo, cierre }

  const addToMonth = (monto, fase, offsetMeses, durMeses) => {
    if (!monto || monto <= 0 || durMeses <= 0) return;
    const cuota = monto / durMeses;
    for (let i = 0; i < durMeses; i++) {
      const d = new Date(inicioObra.getFullYear(), inicioObra.getMonth() + offsetMeses + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[key]) acc[key] = { preoperativo: 0, operativo: 0, cierre: 0 };
      acc[key][fase] += cuota;
    }
  };

  partidas.forEach(p => {
    const monto = valorEfectivo(p, versionId, pagosPorWbs) ?? valorEfectivo(p, "inicial", pagosPorWbs) ?? 0;
    const fase = getFasePartida(p);
    const t = FASE_TIMING[fase] || FASE_TIMING.operativo;
    addToMonth(monto, fase, t.offset, t.dur);
  });

  const keys = Object.keys(acc).sort();
  let acumulado = 0;
  return keys.map(k => {
    const [y, m] = k.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    const row = acc[k];
    const total = row.preoperativo + row.operativo + row.cierre;
    acumulado += total;
    return {
      key: k,
      mes: date.toLocaleDateString("es-CO", { month: "short", year: "2-digit" }),
      date,
      preoperativo: Math.round(row.preoperativo),
      operativo: Math.round(row.operativo),
      cierre: Math.round(row.cierre),
      total: Math.round(total),
      acumulado: Math.round(acumulado)
    };
  });
};

/* Seed: partidas iniciales para Torre Versalles */
const SEED_PARTIDAS = [
  // Capítulo 1: Lote
  { id: 1,  capitulo: "lote",      wbs: "1.1", nombre: "Adquisición del lote",              valores: { inicial: 5000000000, constructor: null, interventoria: null, supervision: null, ejecutado: 5000000000 }, fuentes: { inicial: "Modelo financiero v1", ejecutado: "Escritura 1234/2025" } },
  { id: 2,  capitulo: "lote",      wbs: "1.2", nombre: "Avalúo y due diligence",            valores: { inicial: 30000000, constructor: null, interventoria: null, supervision: null, ejecutado: 28000000 } },

  // Capítulo 2: Estudios
  { id: 3,  capitulo: "estudios",  wbs: "2.1", nombre: "Estudio de suelos y topografía",    valores: { inicial: 45000000, constructor: null, interventoria: null, supervision: null, ejecutado: 47000000 } },
  { id: 4,  capitulo: "estudios",  wbs: "2.2", nombre: "Diseño arquitectónico",             valores: { inicial: 280000000, constructor: null, interventoria: null, supervision: null, ejecutado: 265000000 } },
  { id: 5,  capitulo: "estudios",  wbs: "2.3", nombre: "Diseño estructural",                valores: { inicial: 120000000, constructor: null, interventoria: null, supervision: null, ejecutado: 120000000 } },
  { id: 6,  capitulo: "estudios",  wbs: "2.4", nombre: "Diseños MEP (hidro, eléctrico, gas)", valores: { inicial: 95000000, constructor: null, interventoria: null, supervision: null, ejecutado: 0 } },
  { id: 7,  capitulo: "estudios",  wbs: "2.5", nombre: "Diseño bioclimático / certificación", valores: { inicial: 35000000, constructor: null, interventoria: null, supervision: null, ejecutado: 0 } },

  // Capítulo 3: Licencias
  { id: 8,  capitulo: "licencias", wbs: "3.1", nombre: "Licencia de construcción",          valores: { inicial: 180000000, constructor: null, interventoria: null, supervision: null, ejecutado: 175000000 } },
  { id: 9,  capitulo: "licencias", wbs: "3.2", nombre: "Acta de vecindad y trámites POT",   valores: { inicial: 25000000, constructor: null, interventoria: null, supervision: null, ejecutado: 22000000 } },

  // Capítulo 4: Construcción — por WBS
  { id: 10, capitulo: "construccion", wbs: "4.1", nombre: "Preliminares y demoliciones",     valores: { inicial: 380000000,   constructor: 410000000,   interventoria: 395000000, supervision: 400000000, ejecutado: 412000000 } },
  { id: 11, capitulo: "construccion", wbs: "4.2", nombre: "Cimentación",                     valores: { inicial: 2100000000,  constructor: 2350000000,  interventoria: 2250000000, supervision: 2280000000, ejecutado: 2380000000 } },
  { id: 12, capitulo: "construccion", wbs: "4.3", nombre: "Estructura",                      valores: { inicial: 6800000000,  constructor: 7200000000,  interventoria: 7050000000, supervision: 7100000000, ejecutado: 0 } },
  { id: 13, capitulo: "construccion", wbs: "4.4", nombre: "Mampostería",                     valores: { inicial: 1900000000,  constructor: 2050000000,  interventoria: 1980000000, supervision: 2000000000, ejecutado: 0 } },
  { id: 14, capitulo: "construccion", wbs: "4.5.1", nombre: "MEP — Hidrosanitarias y gas",   valores: { inicial: 1500000000,  constructor: 1620000000,  interventoria: 1580000000, supervision: 1600000000, ejecutado: 0 } },
  { id: 15, capitulo: "construccion", wbs: "4.5.2", nombre: "MEP — Eléctricas",              valores: { inicial: 1700000000,  constructor: 1850000000,  interventoria: 1780000000, supervision: 1800000000, ejecutado: 0 } },
  { id: 16, capitulo: "construccion", wbs: "4.5.3", nombre: "MEP — HVAC / ventilación",      valores: { inicial: 900000000,   constructor: 980000000,   interventoria: 940000000,  supervision: 950000000,  ejecutado: 0 } },
  { id: 17, capitulo: "construccion", wbs: "4.6", nombre: "Acabados",                        valores: { inicial: 4200000000,  constructor: 4500000000,  interventoria: 4350000000, supervision: 4400000000, ejecutado: 0 } },
  { id: 18, capitulo: "construccion", wbs: "4.7", nombre: "Fachadas y cubiertas",            valores: { inicial: 2300000000,  constructor: 2580000000,  interventoria: 2480000000, supervision: 2500000000, ejecutado: 0 } },
  { id: 19, capitulo: "construccion", wbs: "4.8", nombre: "Equipos (ascensores, planta)",    valores: { inicial: 1400000000,  constructor: 1520000000,  interventoria: 1460000000, supervision: 1480000000, ejecutado: 0 } },
  { id: 20, capitulo: "construccion", wbs: "4.9", nombre: "Urbanismo y zonas comunes",       valores: { inicial: 1100000000,  constructor: 1180000000,  interventoria: 1130000000, supervision: 1150000000, ejecutado: 0 } },

  // Capítulo 5: Honorarios
  { id: 21, capitulo: "honorarios", wbs: "5.1", nombre: "Gerencia de proyecto (Cretto)",     valores: { inicial: 900000000, constructor: null, interventoria: null, supervision: null, ejecutado: 220000000 } },
  { id: 22, capitulo: "honorarios", wbs: "5.2", nombre: "Interventoría técnica",             valores: { inicial: 450000000, constructor: null, interventoria: 480000000, supervision: null, ejecutado: 110000000 } },
  { id: 23, capitulo: "honorarios", wbs: "5.3", nombre: "Supervisión técnica independiente", valores: { inicial: 200000000, constructor: null, interventoria: null, supervision: 215000000, ejecutado: 50000000 } },

  // Capítulo 6: Comercial
  { id: 24, capitulo: "comercial", wbs: "6.1", nombre: "Comisión comercializadora",         valores: { inicial: 1800000000, constructor: null, interventoria: null, supervision: null, ejecutado: 380000000 } },
  { id: 25, capitulo: "comercial", wbs: "6.2", nombre: "Sala de ventas (montaje y operación)", valores: { inicial: 250000000, constructor: null, interventoria: null, supervision: null, ejecutado: 240000000 } },
  { id: 26, capitulo: "comercial", wbs: "6.3", nombre: "Material publicitario y marketing", valores: { inicial: 320000000, constructor: null, interventoria: null, supervision: null, ejecutado: 145000000 } },

  // Capítulo 7: Financieros
  { id: 27, capitulo: "financieros", wbs: "7.1", nombre: "Intereses crédito constructor",   valores: { inicial: 1600000000, constructor: null, interventoria: null, supervision: null, ejecutado: 280000000 } },
  { id: 28, capitulo: "financieros", wbs: "7.2", nombre: "Comisión fiduciaria",             valores: { inicial: 180000000, constructor: null, interventoria: null, supervision: null, ejecutado: 65000000 } },

  // Capítulo 8: Legales
  { id: 29, capitulo: "legales", wbs: "8.1", nombre: "Constitución P.A. y escrituración",    valores: { inicial: 120000000, constructor: null, interventoria: null, supervision: null, ejecutado: 40000000 } },
  { id: 30, capitulo: "legales", wbs: "8.2", nombre: "Reglamento P.H. y propiedad horizontal", valores: { inicial: 45000000, constructor: null, interventoria: null, supervision: null, ejecutado: 0 } },

  // Capítulo 9: Impuestos
  { id: 31, capitulo: "impuestos", wbs: "9.1", nombre: "Predial e impuestos del lote",      valores: { inicial: 80000000, constructor: null, interventoria: null, supervision: null, ejecutado: 35000000 } },
  { id: 32, capitulo: "impuestos", wbs: "9.2", nombre: "Pólizas y seguros todo riesgo",     valores: { inicial: 220000000, constructor: 240000000, interventoria: null, supervision: null, ejecutado: 110000000 } },

  // Capítulo 10: Imprevistos
  { id: 33, capitulo: "imprevistos", wbs: "10.1", nombre: "Contingencia (10%)",             valores: { inicial: 2500000000, constructor: null, interventoria: null, supervision: null, ejecutado: 180000000 } }
];

/* Seed: documentos fuente */
const SEED_DOCS = [
  { id: 1, nombre: "Contrato constructor Torre Versalles v1.pdf",  version: "constructor",   fecha: "2026-04-15", autor: "Constructora ABC", capitulosAfectados: ["construccion"], aplicado: true },
  { id: 2, nombre: "Informe interventoría #1 — validación inicial.pdf", version: "interventoria", fecha: "2026-05-10", autor: "Interventoría XYZ", capitulosAfectados: ["construccion"], aplicado: true },
  { id: 3, nombre: "Supervisión técnica — verificación contrato.pdf", version: "supervision", fecha: "2026-05-18", autor: "Supervisión Independiente", capitulosAfectados: ["construccion"], aplicado: true },
  { id: 4, nombre: "Modelo financiero entregado a fiducia v3.xlsx", version: "inicial",       fecha: "2026-02-20", autor: "PM Cretto",        capitulosAfectados: ["lote","estudios","licencias","construccion","honorarios","comercial","financieros","legales","impuestos","imprevistos"], aplicado: true }
];

const fmtCop = (n) => {
  if (n == null || n === 0) return "—";
  const v = Math.round(parseFloat(n) || 0);
  if (Math.abs(v) >= 1000000000) return "$" + (v / 1000000000).toFixed(2) + " MMM";
  if (Math.abs(v) >= 1000000) return "$" + Math.round(v / 1000000).toLocaleString("es-CO").replace(/,/g, ".") + " MM";
  return "$" + v.toLocaleString("es-CO").replace(/,/g, ".");
};
const fmtPct = (n) => (n == null ? "—" : (n >= 0 ? "+" : "") + n.toFixed(1) + "%");

const CapexEdificios = ({ project, tareas = [], onPartidasChange, pagosPorWbs = {} }) => {
  /* Helper que devuelve el valor "efectivo" para una versión, aplicando override de pagos en "ejecutado" */
  const getValorEfectivo = (p, vid) => valorEfectivo(p, vid, pagosPorWbs);
  const [partidas, setPartidas] = useState(SEED_PARTIDAS);
  const [docs, setDocs] = useState(SEED_DOCS);
  const [vista, setVista] = useState("capitulos"); // capitulos | wbs | comparativo | grafico | documentos
  const [versionRef, setVersionRef] = useState("inicial"); // versión "base" para comparar
  const [versionComp, setVersionComp] = useState("constructor"); // versión a comparar
  const [expanded, setExpanded] = useState({ construccion: true });
  const [modal, setModal] = useState(null);
  const [docModal, setDocModal] = useState(null);
  const [query, setQuery] = useState("");

  /* Persistencia */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r1 = await window.storage.get(`crettohub:capex-edif:${project?.id || "default"}`);
        if (m && r1 && r1.value) setPartidas(JSON.parse(r1.value));
        const r2 = await window.storage.get(`crettohub:capex-docs:${project?.id || "default"}`);
        if (m && r2 && r2.value) setDocs(JSON.parse(r2.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:capex-edif:${project?.id || "default"}`, JSON.stringify(partidas)).catch(() => {});
    }, 500);
    if (onPartidasChange) onPartidasChange(partidas);
    return () => clearTimeout(t);
  }, [partidas, project?.id, onPartidasChange]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:capex-docs:${project?.id || "default"}`, JSON.stringify(docs)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [docs, project?.id]);

  /* Totales por capítulo y versión */
  const totales = useMemo(() => {
    const t = {};
    CAPITULOS.forEach(c => {
      t[c.id] = { inicial: 0, constructor: 0, interventoria: 0, supervision: 0, ejecutado: 0 };
    });
    partidas.forEach(p => {
      if (!t[p.capitulo]) return;
      VERSIONES.forEach(v => {
        const val = getValorEfectivo(p, v.id);
        if (val != null) t[p.capitulo][v.id] += val;
      });
    });
    return t;
  }, [partidas, pagosPorWbs]);

  /* Total general por versión */
  const totalGeneral = useMemo(() => {
    const acc = { inicial: 0, constructor: 0, interventoria: 0, supervision: 0, ejecutado: 0 };
    Object.values(totales).forEach(c => {
      VERSIONES.forEach(v => { acc[v.id] += c[v.id] || 0; });
    });
    return acc;
  }, [totales]);

  const variancePct = (a, b) => (b > 0 && a > 0) ? ((a - b) / b) * 100 : null;

  const filteredPartidas = useMemo(() => {
    if (!query) return partidas;
    const q = query.toLowerCase();
    return partidas.filter(p => p.nombre.toLowerCase().includes(q) || p.wbs.includes(q));
  }, [partidas, query]);

  /* Mutaciones */
  const upsertPartida = (data) => {
    if (data.id && partidas.find(p => p.id === data.id)) {
      setPartidas(prev => prev.map(p => p.id === data.id ? data : p));
    } else {
      const id = Math.max(0, ...partidas.map(p => p.id)) + 1;
      setPartidas(prev => [...prev, { ...data, id }]);
    }
    setModal(null);
  };

  const deletePartida = (id) => {
    if (!confirm("¿Eliminar partida?")) return;
    setPartidas(prev => prev.filter(p => p.id !== id));
  };

  /* Aplicar documento de proveedor → actualizar masivamente una versión
     Simulación: el doc trae nuevos valores por wbs */
  const applyDocumento = (doc, updatesByWbs) => {
    const versionId = doc.version;
    // Versiones que conservan historial al recibir nuevos docs (otrosíes / revisiones)
    const HISTORIZADAS = ["constructor", "interventoria", "supervision", "ejecutado"];
    setPartidas(prev => prev.map(p => {
      if (updatesByWbs[p.wbs] == null) return p;
      const monto = updatesByWbs[p.wbs];
      const fecha = doc.fecha || new Date().toISOString().slice(0, 10);
      const docName = doc.nombre;
      if (HISTORIZADAS.includes(versionId)) {
        const histPrev = getHistorial(p, versionId);
        const nuevoItem = { version: `v${histPrev.length + 1}`, fecha, monto, doc: docName, etiqueta: doc.etiqueta || "" };
        const nuevoHist = [...histPrev, nuevoItem];
        return setHistorial(p, versionId, nuevoHist, nuevoHist.length - 1);
      }
      return {
        ...p,
        valores: { ...p.valores, [versionId]: monto },
        fuentes: { ...(p.fuentes || {}), [versionId]: docName }
      };
    }));
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, aplicado: true } : d));
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">CAPEX edificación · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Presupuesto por capítulos y WBS</h1>
          <p className="mt-1 text-sm text-stone-500">
            {CAPITULOS.length} capítulos · {partidas.length} partidas · {VERSIONES.length} versiones comparables (Cretto · Constructor · Interventoría · Supervisión · Ejecutado)
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDocModal({})} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">
            <Upload className="h-3.5 w-3.5" /> Adjuntar doc proveedor
          </button>
          <button onClick={() => setModal({})} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800">
            <Plus className="h-3.5 w-3.5" /> Nueva partida
          </button>
        </div>
      </header>

      {/* Totales por versión */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        {VERSIONES.map(v => {
          const tot = totalGeneral[v.id];
          const ref = totalGeneral.inicial;
          const dv = v.id !== "inicial" && tot > 0 ? variancePct(tot, ref) : null;
          return (
            <div key={v.id} className={`rounded-md border p-3 ${COLOR_CLASS[v.color]}`}>
              <div className="text-[10px] uppercase tracking-wider opacity-80">{v.short}</div>
              <div className="font-serif text-lg">{fmtCop(tot)}</div>
              {dv != null && (
                <div className="mt-0.5 flex items-center gap-0.5 text-[10px]">
                  {dv >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {fmtPct(dv)} vs inicial
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tabs de vista */}
      <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-stone-200">
        {[
          { id: "capitulos",  label: "Por capítulos",        icon: Layers },
          { id: "fases",      label: "Fases & Flujo de caja",icon: Wallet },
          { id: "wbs",        label: "WBS construcción",     icon: Hammer },
          { id: "comparativo",label: "Comparativo versiones",icon: ArrowRight },
          { id: "grafico",    label: "Gráfico",              icon: TrendingUp },
          { id: "documentos", label: `Documentos (${docs.length})`, icon: FileText }
        ].map(t => {
          const Ic = t.icon;
          return (
            <button key={t.id} onClick={() => setVista(t.id)} className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-medium ${vista === t.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
              <Ic className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
        <div className="ml-auto relative pb-2">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-stone-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar…" className="rounded-md border border-stone-300 bg-white py-1 pl-7 pr-2 text-[12px]" />
        </div>
      </div>

      {vista === "capitulos" && (
        <CapitulosView
          partidas={filteredPartidas}
          totales={totales}
          pagosPorWbs={pagosPorWbs}
          expanded={expanded}
          toggleCapitulo={(id) => setExpanded(p => ({ ...p, [id]: !p[id] }))}
          onEdit={(p) => setModal(p)}
          onDelete={deletePartida}
          variancePct={variancePct}
        />
      )}

      {vista === "fases" && (
        <FasesView
          partidas={filteredPartidas}
          pagosPorWbs={pagosPorWbs}
          project={project}
          onEdit={(p) => setModal(p)}
        />
      )}

      {vista === "wbs" && (
        <WbsConstruccionView
          partidas={partidas.filter(p => p.capitulo === "construccion")}
          totales={totales.construccion}
          pagosPorWbs={pagosPorWbs}
          onEdit={(p) => setModal(p)}
          tareas={tareas}
        />
      )}

      {vista === "comparativo" && (
        <ComparativoView
          partidas={partidas}
          versionRef={versionRef}
          versionComp={versionComp}
          setVersionRef={setVersionRef}
          setVersionComp={setVersionComp}
          variancePct={variancePct}
        />
      )}

      {vista === "grafico" && (
        <GraficoView totales={totales} totalGeneral={totalGeneral} />
      )}

      {vista === "documentos" && (
        <DocumentosView docs={docs} onUpload={() => setDocModal({})} onApply={applyDocumento} partidas={partidas} />
      )}

      {modal !== null && (
        <PartidaModal initial={modal.id ? modal : null} onClose={() => setModal(null)} onSave={upsertPartida} />
      )}
      {docModal !== null && (
        <DocModal onClose={() => setDocModal(null)} onSave={(doc, updates) => {
          const id = Math.max(0, ...docs.map(d => d.id)) + 1;
          const nuevo = { ...doc, id, aplicado: true };
          setDocs(prev => [...prev, nuevo]);
          applyDocumento(nuevo, updates);
          setDocModal(null);
        }} partidas={partidas} />
      )}
    </div>
  );
};

/* ─── Vista: Por capítulos ─── */
const CapitulosView = ({ partidas, totales, pagosPorWbs = {}, expanded, toggleCapitulo, onEdit, onDelete, variancePct }) => (
  <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
    <table className="w-full text-[12px]">
      <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
        <tr>
          <th className="px-3 py-2 text-left">Capítulo / Partida</th>
          <th className="px-3 py-2 text-left w-20">WBS</th>
          {VERSIONES.map(v => (
            <th key={v.id} className="px-3 py-2 text-right">{v.short}</th>
          ))}
          <th className="w-10"></th>
        </tr>
      </thead>
      <tbody>
        {CAPITULOS.map(cap => {
          const exp = expanded[cap.id];
          const items = partidas.filter(p => p.capitulo === cap.id);
          const t = totales[cap.id] || {};
          const Ic = cap.icon;
          return (
            <React.Fragment key={cap.id}>
              <tr className="border-t border-stone-200 bg-stone-50/60">
                <td className="px-3 py-1.5">
                  <button onClick={() => toggleCapitulo(cap.id)} className="inline-flex items-center gap-1.5 text-left font-semibold text-stone-800">
                    {exp ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    <Ic className="h-3.5 w-3.5" style={{ color: cap.color }} />
                    <span>{cap.codigo}. {cap.label}</span>
                    {cap.hasWBS && <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-semibold text-emerald-800">WBS</span>}
                    <span className="text-[10px] text-stone-500">({items.length})</span>
                  </button>
                </td>
                <td></td>
                {VERSIONES.map(v => (
                  <td key={v.id} className="px-3 py-1.5 text-right font-mono font-semibold" style={{ color: cap.color }}>{fmtCop(t[v.id])}</td>
                ))}
                <td></td>
              </tr>
              {exp && items.map(p => (
                <tr key={p.id} className="border-t border-stone-100 hover:bg-stone-50/40">
                  <td className="px-3 py-1.5 pl-8">
                    <button onClick={() => onEdit(p)} className="text-left text-stone-800">{p.nombre}</button>
                  </td>
                  <td className="px-3 py-1.5 font-mono text-[10px] text-stone-500">{p.wbs}</td>
                  {VERSIONES.map(v => {
                    const val = valorEfectivo(p, v.id, pagosPorWbs);
                    const fromPagos = v.id === "ejecutado" && pagosPorWbs[p.wbs] != null;
                    const hist = getHistorial(p, v.id);
                    const fuente = p.fuentes?.[v.id] || hist[getVigenteIdx(p, v.id)]?.doc;
                    return (
                      <td key={v.id} className="px-3 py-1.5 text-right font-mono text-stone-700" title={fromPagos ? "AC sumado desde módulo Pagos" : fuente || ""}>
                        {fmtCop(val)}
                        {fromPagos && <span className="ml-0.5 rounded bg-emerald-100 px-1 text-[8px] font-bold text-emerald-700" title="Desde Pagos">📦</span>}
                        {!fromPagos && hist.length > 1 && <span className="ml-0.5 rounded bg-stone-100 px-1 text-[8px] font-bold text-stone-600" title={`${hist.length} versiones`}>v{hist.length}</span>}
                        {!fromPagos && fuente && <FileText className="ml-0.5 inline h-2.5 w-2.5 text-emerald-500" />}
                      </td>
                    );
                  })}
                  <td className="px-3 py-1.5 text-right">
                    <button onClick={() => onDelete(p.id)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  </div>
);

/* ─── Vista: Fases de inversión + Flujo de caja ─── */
const FASE_HEX = { preoperativo: "#6366f1", operativo: "#10b981", cierre: "#f59e0b" };

const FasesView = ({ partidas, pagosPorWbs, project, onEdit }) => {
  const [version, setVersion] = useState("constructor");

  /* Totales por fase */
  const porFase = useMemo(() => capexPorFase(partidas, version, pagosPorWbs), [partidas, version, pagosPorWbs]);

  /* Partidas agrupadas por fase */
  const partidasPorFase = useMemo(() => {
    const g = { preoperativo: [], operativo: [], cierre: [] };
    partidas.forEach(p => { g[getFasePartida(p)].push(p); });
    return g;
  }, [partidas]);

  /* Flujo de egresos mensual */
  const flujo = useMemo(
    () => capexFlujoEgresos(partidas, version, { inicioObra: project?.fechaInicioObra, pagosPorWbs }),
    [partidas, version, project, pagosPorWbs]
  );

  const pieData = FASES_INVERSION.map(f => ({ name: f.label, value: Math.round((porFase[f.id] || 0) / 1000000), fase: f.id }));

  return (
    <div className="space-y-4">
      {/* Selector de versión + explicación */}
      <div className="flex items-center justify-between rounded-md border border-stone-200 bg-stone-50/40 p-3">
        <div className="text-[12px] text-stone-600">
          <strong>Clasificación financiera</strong> de cada peso del CAPEX por fase. Conecta con el flujo de caja: cada egreso se desembolsa en su ventana temporal.
        </div>
        <select value={version} onChange={e => setVersion(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1 text-[12px]">
          {VERSIONES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
        </select>
      </div>

      {/* KPIs por fase */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {FASES_INVERSION.map(f => {
          const monto = porFase[f.id] || 0;
          const pct = porFase.total > 0 ? (monto / porFase.total) * 100 : 0;
          return (
            <div key={f.id} className={`rounded-lg border p-4 ${COLOR_CLASS[f.color]}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider">{f.label}</div>
                    <div className="text-[9px] opacity-70">{partidasPorFase[f.id].length} partidas</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-lg">{fmtCop(monto)}</div>
                  <div className="text-[10px] opacity-70">{pct.toFixed(0)}% del CAPEX</div>
                </div>
              </div>
              <div className="mt-2 text-[10px] leading-snug opacity-80">{f.descripcion}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pie distribución por fase */}
        <div className="rounded-lg border border-stone-200 bg-white p-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Distribución del CAPEX por fase (MM)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(d) => `${d.name} ${((d.value / pieData.reduce((s, x) => s + x.value, 0)) * 100).toFixed(0)}%`}>
                {pieData.map((d, i) => <Cell key={i} fill={FASE_HEX[d.fase]} />)}
              </Pie>
              <Tooltip formatter={v => fmtCop(v * 1000000)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Flujo de caja — egresos mensuales apilados por fase */}
        <div className="rounded-lg border border-stone-200 bg-white p-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Flujo de egresos por fase — distribución temporal (MM)</h3>
          {flujo.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={flujo.map(r => ({ ...r, preoperativo: Math.round(r.preoperativo / 1000000), operativo: Math.round(r.operativo / 1000000), cierre: Math.round(r.cierre / 1000000), acumulado: Math.round(r.acumulado / 1000000) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="mes" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `$ ${v} MM`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="preoperativo" stackId="a" fill={FASE_HEX.preoperativo} name="Pre-op" />
                <Bar dataKey="operativo" stackId="a" fill={FASE_HEX.operativo} name="Operativo" />
                <Bar dataKey="cierre" stackId="a" fill={FASE_HEX.cierre} name="Cierre" />
                <Line type="monotone" dataKey="acumulado" stroke="#1e40af" strokeWidth={2} dot={false} name="Acumulado" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <div className="py-12 text-center text-[12px] text-stone-400">Sin fecha de inicio de obra — configúrala en el proyecto para ver el flujo temporal.</div>}
          {flujo.length > 0 && (
            <div className="mt-1 text-[10px] text-stone-500">Ancla: inicio de obra {project?.fechaInicioObra || "—"}. Pre-op desembolsa antes; cierre después de entrega.</div>
          )}
        </div>
      </div>

      {/* Tabla de partidas por fase */}
      <div className="space-y-2">
        {FASES_INVERSION.map(f => (
          <div key={f.id} className="overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className={`flex items-center justify-between border-b border-stone-100 px-3 py-2 ${COLOR_CLASS[f.color]}`}>
              <div className="flex items-center gap-2 text-[12px] font-semibold">
                <span>{f.icon}</span> {f.label} <span className="opacity-60">({partidasPorFase[f.id].length})</span>
              </div>
              <div className="font-mono text-[12px] font-semibold">{fmtCop(porFase[f.id] || 0)}</div>
            </div>
            {partidasPorFase[f.id].length > 0 ? (
              <table className="w-full text-[11px]">
                <tbody>
                  {partidasPorFase[f.id].map(p => {
                    const cap = CAPITULOS.find(c => c.id === p.capitulo);
                    return (
                      <tr key={p.id} className="border-t border-stone-100 hover:bg-stone-50/60">
                        <td className="px-3 py-1.5">
                          <button onClick={() => onEdit(p)} className="text-left text-stone-800 hover:text-emerald-700">{p.nombre}</button>
                        </td>
                        <td className="px-3 py-1.5 text-[10px] text-stone-500">{cap?.label}</td>
                        <td className="px-3 py-1.5 font-mono text-[10px] text-stone-400">{p.wbs}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{fmtCop(valorEfectivo(p, version, pagosPorWbs))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : <div className="px-3 py-2 text-[11px] italic text-stone-400">Sin partidas en esta fase.</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Vista: WBS construcción ─── */
const WbsConstruccionView = ({ partidas, totales, pagosPorWbs = {}, onEdit, tareas = [] }) => {
  const findPartida = (wbs) => partidas.find(p => p.wbs === wbs);
  return (
    <div className="space-y-2">
      <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-3 text-[12px] text-emerald-900">
        <Hammer className="mr-1 inline h-3.5 w-3.5" />
        <strong>EDT/WBS del capítulo Construcción (4.x)</strong> — alineada con el cronograma. {tareas.length > 0 ? `Sincronizada con ${tareas.length} tareas del cronograma. ` : ""}Cada paquete muestra avance real vs presupuesto.
      </div>
      {WBS_CONSTRUCCION.map(w => {
        const p = findPartida(w.id);
        const matched = matchTareas(tareas, w.cronoTask);
        const avance = avanceTareas(matched);
        const bac = p ? (getValor(p, "constructor") || getValor(p, "inicial") || 0) : 0;
        const ev = bac * avance / 100;
        const ac = p ? (valorEfectivo(p, "ejecutado", pagosPorWbs) || 0) : 0;
        const cpi = ac > 0 ? ev / ac : null;
        return (
          <div key={w.id} className="rounded-lg border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">{w.codigo}</span>
                <span className="font-semibold text-stone-800">{w.label}</span>
                {w.cronoTask && (
                  <span className={`rounded px-1.5 py-0.5 text-[9px] ${matched.length > 0 ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>
                    🔗 {w.cronoTask} {matched.length > 0 ? `· ${matched.length} tarea(s) · ${avance.toFixed(0)}% real` : "(sin match en cronograma)"}
                  </span>
                )}
                {cpi != null && (
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${cpi >= 1 ? "bg-emerald-100 text-emerald-800" : cpi < 0.9 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
                    CPI {cpi.toFixed(2)}
                  </span>
                )}
              </div>
              {p && (
                <button onClick={() => onEdit(p)} className="rounded border border-stone-200 bg-white px-2 py-0.5 text-[10px] text-stone-600 hover:bg-stone-50">Editar</button>
              )}
            </div>
            {p ? (
              <div className="grid grid-cols-5 gap-0 divide-x divide-stone-100">
                {VERSIONES.map(v => {
                  const val = getValor(p, v.id);
                  const ref = getValor(p, "inicial");
                  const dv = v.id !== "inicial" && val > 0 && ref > 0 ? ((val - ref) / ref) * 100 : null;
                  return (
                    <div key={v.id} className={`p-2 ${COLOR_CLASS[v.color]}`}>
                      <div className="text-[9px] uppercase tracking-wider opacity-80">{v.short}</div>
                      <div className="font-mono text-[13px] font-semibold">{fmtCop(val)}</div>
                      {dv != null && (
                        <div className="text-[9px] opacity-90">{fmtPct(dv)} vs inicial</div>
                      )}
                      {p.fuentes?.[v.id] && <div className="mt-0.5 truncate text-[8px] opacity-60" title={p.fuentes[v.id]}>📎 {p.fuentes[v.id]}</div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-2 text-[11px] italic text-stone-400">Sin partida creada — agrega una con WBS {w.codigo}.</div>
            )}
            {w.sub && (
              <div className="border-t border-stone-100 bg-stone-50/30">
                {w.sub.map(s => {
                  const sp = findPartida(s.id);
                  return (
                    <div key={s.id} className="border-t border-stone-100 px-3 py-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-stone-200 px-1 py-0.5 font-mono text-[9px] text-stone-700">{s.codigo}</span>
                          <span className="text-[12px] text-stone-700">{s.label}</span>
                        </div>
                        <div className="flex gap-3 text-[10px] font-mono text-stone-600">
                          {VERSIONES.map(v => (
                            <span key={v.id} className={`rounded px-1 py-0.5 ${COLOR_CLASS[v.color]}`}>{v.short[0]}: {fmtCop(getValor(sp, v.id))}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─── Vista: Comparativo ─── */
const ComparativoView = ({ partidas, versionRef, versionComp, setVersionRef, setVersionComp, variancePct }) => {
  const refCfg = VERSIONES.find(v => v.id === versionRef);
  const compCfg = VERSIONES.find(v => v.id === versionComp);
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 rounded-md border border-stone-200 bg-white p-3">
        <span className="text-[11px] text-stone-600">Comparar</span>
        <select value={versionComp} onChange={e => setVersionComp(e.target.value)} className="rounded border border-stone-300 px-2 py-1 text-[12px]">
          {VERSIONES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
        </select>
        <span className="text-[11px] text-stone-600">vs</span>
        <select value={versionRef} onChange={e => setVersionRef(e.target.value)} className="rounded border border-stone-300 px-2 py-1 text-[12px]">
          {VERSIONES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-3 py-2 text-left">Partida</th>
              <th className="px-3 py-2 text-left">WBS</th>
              <th className="px-3 py-2 text-right">{refCfg.short}</th>
              <th className="px-3 py-2 text-right">{compCfg.short}</th>
              <th className="px-3 py-2 text-right">Δ COP</th>
              <th className="px-3 py-2 text-right">Δ %</th>
              <th className="px-3 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {partidas.map(p => {
              const a = getValor(p, versionComp);
              const b = getValor(p, versionRef);
              if (a == null && b == null) return null;
              const delta = (a || 0) - (b || 0);
              const dpct = variancePct(a, b);
              const estado = dpct == null ? "—" : Math.abs(dpct) < 3 ? "OK" : dpct > 0 ? "Sobre" : "Bajo";
              const color = dpct == null ? "stone" : Math.abs(dpct) < 3 ? "emerald" : Math.abs(dpct) < 10 ? "amber" : "rose";
              return (
                <tr key={p.id} className="border-t border-stone-100">
                  <td className="px-3 py-1.5 text-stone-800">{p.nombre}</td>
                  <td className="px-3 py-1.5 font-mono text-[10px] text-stone-500">{p.wbs}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{fmtCop(b)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{fmtCop(a)}</td>
                  <td className={`px-3 py-1.5 text-right font-mono ${delta > 0 ? "text-rose-700" : delta < 0 ? "text-emerald-700" : "text-stone-500"}`}>{delta === 0 ? "—" : fmtCop(delta)}</td>
                  <td className={`px-3 py-1.5 text-right font-mono ${dpct == null ? "text-stone-400" : dpct > 0 ? "text-rose-700" : "text-emerald-700"}`}>{fmtPct(dpct)}</td>
                  <td className="px-3 py-1.5"><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${COLOR_CLASS[color]}`}>{estado}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── Vista: Gráfico ─── */
const GraficoView = ({ totales, totalGeneral }) => {
  const data = CAPITULOS.map(c => ({
    cap: c.label,
    color: c.color,
    inicial: (totales[c.id]?.inicial || 0) / 1000000,
    constructor: (totales[c.id]?.constructor || 0) / 1000000,
    interventoria: (totales[c.id]?.interventoria || 0) / 1000000,
    supervision: (totales[c.id]?.supervision || 0) / 1000000,
    ejecutado: (totales[c.id]?.ejecutado || 0) / 1000000
  }));
  const pieData = CAPITULOS.map(c => ({
    name: c.label,
    value: (totales[c.id]?.inicial || 0) / 1000000,
    fill: c.color
  })).filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Comparativo por capítulo (MM COP)</h3>
        <div className="h-96">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="cap" tick={{ fontSize: 9 }} width={140} />
              <Tooltip formatter={(v) => `$ ${Math.round(v).toLocaleString("es-CO")} MM`} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="inicial" fill="#6366f1" />
              <Bar dataKey="constructor" fill="#10b981" />
              <Bar dataKey="interventoria" fill="#f59e0b" />
              <Bar dataKey="supervision" fill="#a855f7" />
              <Bar dataKey="ejecutado" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Distribución presupuesto inicial</h3>
        <div className="h-96">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={(d) => `${d.name.slice(0, 18)} (${((d.value / pieData.reduce((s, x) => s + x.value, 0)) * 100).toFixed(0)}%)`}>
                {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip formatter={(v) => `$ ${Math.round(v).toLocaleString("es-CO")} MM`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* ─── Vista: Documentos ─── */
const DocumentosView = ({ docs, onUpload, partidas }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between rounded-md border border-stone-200 bg-stone-50 p-3 text-[12px] text-stone-700">
      <div>📎 Los documentos de proveedores (constructor, interventoría, supervisión) actualizan las versiones del CAPEX al ser cargados. Permiten trazabilidad y auditoría.</div>
      <button onClick={onUpload} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800">
        <Upload className="h-3.5 w-3.5" /> Subir documento
      </button>
    </div>
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <table className="w-full text-[13px]">
        <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
          <tr>
            <th className="px-3 py-2 text-left">Documento</th>
            <th className="px-3 py-2 text-left">Versión que actualiza</th>
            <th className="px-3 py-2 text-left">Autor / proveedor</th>
            <th className="px-3 py-2 text-left">Capítulos afectados</th>
            <th className="px-3 py-2 text-left">Fecha</th>
            <th className="px-3 py-2 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {docs.map(d => {
            const vCfg = VERSIONES.find(v => v.id === d.version);
            return (
              <tr key={d.id} className="border-t border-stone-100">
                <td className="px-3 py-2 text-stone-800">📎 {d.nombre}</td>
                <td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${COLOR_CLASS[vCfg?.color || "stone"]}`}>{vCfg?.label || d.version}</span></td>
                <td className="px-3 py-2 text-stone-600">{d.autor}</td>
                <td className="px-3 py-2 text-[11px] text-stone-600">{(d.capitulosAfectados || []).join(", ")}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{d.fecha}</td>
                <td className="px-3 py-2">
                  {d.aplicado ? <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">Aplicado</span> : <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Pendiente</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

/* ─── Modal: editar partida ─── */
const HISTORIZADAS_IDS = ["constructor", "interventoria", "supervision", "ejecutado"];

const PartidaModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || {
    capitulo: "construccion", wbs: "", nombre: "",
    valores: { inicial: "", constructor: "", interventoria: "", supervision: "", ejecutado: "" },
    fuentes: {}
  });
  const [versionExp, setVersionExp] = useState(null);

  /* Lee monto vigente. Si es historial, devuelve el monto del vigente. */
  const valVigente = (vid) => {
    const v = form.valores?.[vid];
    if (v == null || v === "") return "";
    if (typeof v === "number") return v;
    if (typeof v === "object" && v.historial) {
      const idx = v.vigenteIdx != null ? v.vigenteIdx : v.historial.length - 1;
      return v.historial[idx]?.monto ?? "";
    }
    return "";
  };

  /* Setea como número simple — solo si NO es historial (en historial editas adentro) */
  const updateVal = (k, v) => {
    const cur = form.valores?.[k];
    if (typeof cur === "object" && cur?.historial) return; // protegido — usa el panel
    setForm(f => ({ ...f, valores: { ...f.valores, [k]: v === "" ? null : parseFloat(v) } }));
  };

  /* Helpers de historial */
  const histList = (vid) => {
    const v = form.valores?.[vid];
    if (v == null) return [];
    if (typeof v === "number") return [{ version: "v1", fecha: null, monto: v, doc: "", etiqueta: "Inicial" }];
    return v.historial || [];
  };
  const histIdx = (vid) => {
    const v = form.valores?.[vid];
    if (v == null || typeof v === "number") return 0;
    return v.vigenteIdx != null ? v.vigenteIdx : (v.historial?.length || 1) - 1;
  };
  const addVersion = (vid) => {
    const hist = histList(vid);
    const next = [...hist, { version: `v${hist.length + 1}`, fecha: new Date().toISOString().slice(0, 10), monto: 0, doc: "", etiqueta: "" }];
    setForm(f => ({ ...f, valores: { ...f.valores, [vid]: { historial: next, vigenteIdx: next.length - 1 } } }));
  };
  const updVersion = (vid, idx, patch) => {
    const hist = histList(vid);
    const next = hist.map((h, i) => i === idx ? { ...h, ...patch } : h);
    setForm(f => ({ ...f, valores: { ...f.valores, [vid]: { historial: next, vigenteIdx: histIdx(vid) } } }));
  };
  const removeVersion = (vid, idx) => {
    const hist = histList(vid).filter((_, i) => i !== idx);
    if (hist.length === 0) {
      setForm(f => ({ ...f, valores: { ...f.valores, [vid]: null } }));
      return;
    }
    setForm(f => ({ ...f, valores: { ...f.valores, [vid]: { historial: hist, vigenteIdx: Math.min(histIdx(vid), hist.length - 1) } } }));
  };
  const setVigente = (vid, idx) => {
    const hist = histList(vid);
    setForm(f => ({ ...f, valores: { ...f.valores, [vid]: { historial: hist, vigenteIdx: idx } } }));
  };
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">{initial ? "Editar partida" : "Nueva partida"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Capítulo">
              <select value={form.capitulo} onChange={e => setForm({ ...form, capitulo: e.target.value, fase: form.fase || FASE_POR_CAPITULO[e.target.value] })} className="inp">
                {CAPITULOS.map(c => <option key={c.id} value={c.id}>{c.codigo}. {c.label}</option>)}
              </select>
            </Field>
            <Field label="Fase de inversión">
              <select value={form.fase || FASE_POR_CAPITULO[form.capitulo] || "operativo"} onChange={e => setForm({ ...form, fase: e.target.value })} className="inp">
                {FASES_INVERSION.map(f => <option key={f.id} value={f.id}>{f.icon} {f.label}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código WBS"><input value={form.wbs} onChange={e => setForm({ ...form, wbs: e.target.value })} className="inp" placeholder="Ej. 4.3.1" /></Field>
            <Field label="Tarea cronograma (opcional)">
              <input value={form.cronoTask || ""} onChange={e => setForm({ ...form, cronoTask: e.target.value })} className="inp" placeholder="Ej. estructura" />
            </Field>
          </div>
          <Field label="Nombre de la partida" required>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="inp" placeholder="Ej. Estructura piso 1-3" />
          </Field>
          <div className="rounded-md border border-stone-200 bg-stone-50/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-600">Valores por versión (COP)</div>
              <div className="text-[10px] text-stone-500">Las versiones con 🕒 admiten historial (otrosíes / revisiones)</div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {VERSIONES.map(v => {
                const versionable = HISTORIZADAS_IDS.includes(v.id);
                const hist = histList(v.id);
                const multi = hist.length > 1;
                return (
                  <div key={v.id}>
                    <span className={`mb-1 flex items-center justify-between rounded px-1 py-0.5 text-[10px] font-semibold ${COLOR_CLASS[v.color]}`}>
                      <span>{v.short}</span>
                      {versionable && <span title="Admite historial">🕒</span>}
                    </span>
                    <input
                      type="number"
                      disabled={multi}
                      value={valVigente(v.id)}
                      onChange={e => updateVal(v.id, e.target.value)}
                      className="inp"
                      placeholder="0"
                      title={multi ? "Editar desde el panel de versiones" : ""}
                    />
                    {versionable && (
                      <button
                        type="button"
                        onClick={() => setVersionExp(versionExp === v.id ? null : v.id)}
                        className="mt-1 inline-flex w-full items-center justify-center gap-0.5 rounded border border-stone-200 bg-white px-1 py-0.5 text-[9px] text-stone-600 hover:bg-stone-50"
                      >
                        {hist.length > 0 ? `${hist.length} versión${hist.length > 1 ? "es" : ""}` : "+ versión"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Panel de historial para la versión expandida */}
            {versionExp && (
              <div className="mt-3 rounded border border-stone-300 bg-white p-2">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-stone-700">
                    Historial · {VERSIONES.find(x => x.id === versionExp)?.label}
                  </div>
                  <button onClick={() => addVersion(versionExp)} className="rounded bg-emerald-700 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-emerald-800">+ Nueva versión</button>
                </div>
                {histList(versionExp).length === 0 && (
                  <div className="text-center text-[11px] italic text-stone-400 py-2">Sin versiones. Agrega una para empezar el historial.</div>
                )}
                <div className="space-y-1">
                  {histList(versionExp).map((h, idx) => {
                    const esVigente = idx === histIdx(versionExp);
                    return (
                      <div key={idx} className={`grid grid-cols-[80px_100px_120px_1fr_60px_auto] items-center gap-1 rounded p-1.5 text-[11px] ${esVigente ? "bg-emerald-50/60 ring-1 ring-emerald-300" : "bg-stone-50"}`}>
                        <input value={h.version} onChange={e => updVersion(versionExp, idx, { version: e.target.value })} className="rounded border border-stone-200 px-1 py-0.5 font-mono text-[10px]" />
                        <input type="date" value={h.fecha || ""} onChange={e => updVersion(versionExp, idx, { fecha: e.target.value })} className="rounded border border-stone-200 px-1 py-0.5 text-[10px]" />
                        <input type="number" value={h.monto || ""} onChange={e => updVersion(versionExp, idx, { monto: parseFloat(e.target.value) || 0 })} className="rounded border border-stone-200 px-1 py-0.5 font-mono text-[10px]" placeholder="Monto" />
                        <input value={h.etiqueta || ""} onChange={e => updVersion(versionExp, idx, { etiqueta: e.target.value })} className="rounded border border-stone-200 px-1 py-0.5 text-[10px]" placeholder="Ej. Contrato inicial, Otrosí #1…" />
                        <button onClick={() => setVigente(versionExp, idx)} className={`rounded px-1 py-0.5 text-[9px] font-bold ${esVigente ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-600 hover:bg-stone-300"}`} title="Marcar como vigente">
                          {esVigente ? "VIGENTE" : "Usar"}
                        </button>
                        <button onClick={() => removeVersion(versionExp, idx)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

/* ─── Modal: subir documento que actualiza una versión ─── */
const DocModal = ({ onClose, onSave, partidas }) => {
  const [doc, setDoc] = useState({ nombre: "", version: "constructor", fecha: new Date().toISOString().slice(0, 10), autor: "", capitulosAfectados: ["construccion"] });
  const [updates, setUpdates] = useState({}); // { wbs: value }

  const partidasCap = useMemo(() => partidas.filter(p => doc.capitulosAfectados.includes(p.capitulo)), [partidas, doc.capitulosAfectados]);

  const setUpd = (wbs, val) => setUpdates(prev => ({ ...prev, [wbs]: val === "" ? null : parseFloat(val) }));

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">Subir documento de proveedor</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <Field label="Nombre del documento" required>
            <input value={doc.nombre} onChange={e => setDoc({ ...doc, nombre: e.target.value })} className="inp" placeholder="Ej. Oferta constructor v2.pdf" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Actualiza versión">
              <select value={doc.version} onChange={e => setDoc({ ...doc, version: e.target.value })} className="inp">
                {VERSIONES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </Field>
            <Field label="Fecha"><input type="date" value={doc.fecha} onChange={e => setDoc({ ...doc, fecha: e.target.value })} className="inp" /></Field>
            <Field label="Autor / proveedor"><input value={doc.autor} onChange={e => setDoc({ ...doc, autor: e.target.value })} className="inp" placeholder="Constructora ABC" /></Field>
          </div>
          <div>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-600">Capítulos afectados</span>
            <div className="flex flex-wrap gap-1">
              {CAPITULOS.map(c => {
                const on = doc.capitulosAfectados.includes(c.id);
                return (
                  <button key={c.id} onClick={() => setDoc({ ...doc, capitulosAfectados: on ? doc.capitulosAfectados.filter(x => x !== c.id) : [...doc.capitulosAfectados, c.id] })} className={`rounded-full border px-2 py-0.5 text-[11px] ${on ? "border-emerald-600 bg-emerald-100 text-emerald-800" : "border-stone-200 bg-white text-stone-600"}`}>
                    {c.codigo}. {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-3 text-center text-[12px] text-stone-500">
            <Upload className="mx-auto mb-1 h-5 w-5 text-stone-400" />
            Arrastra el archivo aquí (PDF/XLSX). La carga real se conecta al backend.
          </div>
          <div className="rounded-md border border-stone-200 bg-white p-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">Valores a actualizar por partida</div>
            <p className="mb-2 text-[11px] text-stone-500">Indica el valor que el documento del proveedor reporta para cada partida. Al aplicar, se actualiza la columna <strong>{VERSIONES.find(v => v.id === doc.version)?.short}</strong>.</p>
            <div className="max-h-64 overflow-y-auto">
              {partidasCap.map(p => (
                <div key={p.id} className="grid grid-cols-[60px_1fr_180px] gap-2 border-b border-stone-100 py-1">
                  <span className="font-mono text-[10px] text-stone-500">{p.wbs}</span>
                  <span className="text-[11px] text-stone-700">{p.nombre}</span>
                  <input type="number" value={updates[p.wbs] ?? ""} onChange={e => setUpd(p.wbs, e.target.value)} placeholder={`Actual: ${fmtCop(getValor(p, doc.version))}`} className="rounded border border-stone-200 px-2 py-0.5 text-[11px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
          <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
          <button onClick={() => onSave(doc, updates)} disabled={!doc.nombre.trim()} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">Aplicar a CAPEX</button>
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

export default CapexEdificios;
