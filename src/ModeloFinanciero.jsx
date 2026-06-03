import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp, Plus, Trash2, Eye, Download, X, Edit3, Briefcase,
  Landmark, Users, FileSpreadsheet, BarChart3, DollarSign, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, AreaChart, Area, ReferenceLine
} from "recharts";
import { VERSIONES as CAPEX_VERSIONES, CAPITULOS as CAPEX_CAPITULOS } from "./CapexEdificios.jsx";
import { rollupCapex, distribuyeFlujo, distribuyeIngresos, mergeFlujo, DEFAULT_VERSION_BY_TIPO } from "./modeloFinancieroLink.js";
import { Link as LinkIcon, Unlink } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Visor de Modelo Financiero
   Soporta múltiples versiones del modelo:
   - Proyecto (gerencial — visión completa)
   - Fiducia (versión entregada al P.A.)
   - Inversionista (TIR + ROI)
   - Banco (cumplimiento covenants)
   - + Custom

   Cada versión tiene: supuestos, flujo de caja mensual, KPIs,
   sensibilidad. Visor tabula + grafica.
────────────────────────────────────────────────────────────────── */

const TIPOS_MODELO = [
  { id: "proyecto",       label: "Modelo del proyecto",   color: "emerald", icon: TrendingUp, desc: "Visión gerencial completa — base interna" },
  { id: "fiducia",        label: "Modelo fiducia (P.A.)", color: "violet",  icon: Briefcase,  desc: "Versión entregada al patrimonio autónomo" },
  { id: "inversionista",  label: "Modelo inversionista",  color: "indigo",  icon: Users,      desc: "TIR / ROI por inversionista, distribución de utilidades" },
  { id: "banco",          label: "Modelo banco",          color: "blue",    icon: Landmark,   desc: "Cumplimiento de covenants y servicio de deuda" },
  { id: "custom",         label: "Modelo personalizado",  color: "stone",   icon: FileSpreadsheet, desc: "Versión libre" }
];

const COLOR_CLASS = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  violet:  "bg-violet-100 text-violet-800 border-violet-200",
  indigo:  "bg-indigo-100 text-indigo-800 border-indigo-200",
  blue:    "bg-blue-100 text-blue-800 border-blue-200",
  stone:   "bg-stone-100 text-stone-700 border-stone-200",
  rose:    "bg-rose-100 text-rose-800 border-rose-200",
  amber:   "bg-amber-100 text-amber-800 border-amber-200"
};

/* Seed: 3 modelos para Torre Versalles */
const seedModelo = (tipo, factor = 1, etiqueta = "") => {
  const meses = ["Ene-26", "Feb-26", "Mar-26", "Abr-26", "May-26", "Jun-26", "Jul-26", "Ago-26", "Sep-26", "Oct-26", "Nov-26", "Dic-26", "Ene-27", "Feb-27", "Mar-27", "Abr-27", "May-27", "Jun-27", "Jul-27", "Ago-27", "Sep-27", "Oct-27", "Nov-27", "Dic-27"];
  // Curva S de ingresos y egresos
  const flujo = meses.map((m, i) => {
    const t = (i + 1) / meses.length;
    const sigmoid = 1 / (1 + Math.exp(-10 * (t - 0.5)));
    const ingresos = Math.round(48000 * sigmoid * factor); // millones COP acumulados
    const egresos = Math.round(36000 * sigmoid * factor);
    return { mes: m, ingresos, egresos, neto: ingresos - egresos };
  });
  // Convertir acumulado a mensual
  for (let i = flujo.length - 1; i > 0; i--) {
    flujo[i].ingresosMes = flujo[i].ingresos - flujo[i - 1].ingresos;
    flujo[i].egresosMes = flujo[i].egresos - flujo[i - 1].egresos;
  }
  flujo[0].ingresosMes = flujo[0].ingresos;
  flujo[0].egresosMes = flujo[0].egresos;

  const ingresoTotal = flujo[flujo.length - 1].ingresos;
  const egresoTotal = flujo[flujo.length - 1].egresos;
  const utilidad = ingresoTotal - egresoTotal;
  const tirAprox = tipo === "inversionista" ? 18 + Math.random() * 4 : (tipo === "banco" ? 12 : 22);

  return {
    nombre: TIPOS_MODELO.find(t => t.id === tipo).label + (etiqueta ? ` · ${etiqueta}` : ""),
    tipo,
    version: "v1",
    fecha: new Date().toISOString().slice(0, 10),
    autor: "PM Cretto",
    visibleAUDS: tipo === "proyecto" ? ["interno"] : tipo === "fiducia" ? ["interno", "fiduciaria"] : tipo === "inversionista" ? ["interno", "inversionistas"] : tipo === "banco" ? ["interno", "banco"] : ["interno"],
    supuestos: {
      areaVendible: 5500,
      unidades: 60,
      precioPromedioM2: 8000000,
      costoTotalConstruccion: Math.round(30000 * factor) * 1000000,
      contingenciaPct: 10,
      preventasPct: 70,
      tasaCreditoConstructor: 0.135,
      tasaDescuento: 0.16
    },
    kpis: {
      ingresoTotal: ingresoTotal * 1000000,
      egresoTotal: egresoTotal * 1000000,
      utilidad: utilidad * 1000000,
      margenPct: (utilidad / ingresoTotal) * 100,
      tirPct: tirAprox,
      vpn: utilidad * 1000000 * 0.6,
      payBackMeses: 22 + Math.round(Math.random() * 4),
      breakEvenMes: meses[Math.floor(meses.length * 0.55)]
    },
    flujo,
    sensibilidad: [
      { variable: "Precio venta -5%",    impactoTIR: -2.3, impactoUtilidad: -1500 },
      { variable: "Precio venta +5%",    impactoTIR: +2.4, impactoUtilidad: +1500 },
      { variable: "Costo +10%",          impactoTIR: -3.1, impactoUtilidad: -3000 },
      { variable: "Atraso obra +6 meses",impactoTIR: -4.2, impactoUtilidad: -2200 },
      { variable: "Preventas -10%",      impactoTIR: -1.8, impactoUtilidad: -800 }
    ],
    notas: ""
  };
};

const SEED_MODELOS = [
  { id: 1, ...seedModelo("proyecto", 1.0) },
  { id: 2, ...seedModelo("fiducia", 1.0, "Entrega marzo 2026"), notas: "Versión presentada a Fiduciaria Bogotá para aprobación del P.A." },
  { id: 3, ...seedModelo("inversionista", 1.0), notas: "Modelo con flujo distribuido por % de participación." }
];

const fmt = (n) => "$ " + Math.round((parseFloat(n) || 0) / 1000000).toLocaleString("es-CO").replace(/,/g, ".") + " MM";
const fmtPct = (n) => (parseFloat(n) || 0).toFixed(1) + "%";

const ModeloFinanciero = ({ project, partidas = [], tareas = [] }) => {
  const [modelos, setModelos] = useState(SEED_MODELOS);
  const [activoId, setActivoId] = useState(1);
  const [modal, setModal] = useState(null);
  const [compararId, setCompararId] = useState(null);

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:modelos-fin:${project?.id || "default"}`);
        if (m && r && r.value) setModelos(JSON.parse(r.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:modelos-fin:${project?.id || "default"}`, JSON.stringify(modelos)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [modelos, project?.id]);

  const activoBase = useMemo(() => modelos.find(m => m.id === activoId) || modelos[0], [modelos, activoId]);

  /* Derivar un modelo: si está en modo vivo, recalcula KPIs y flujo */
  const derivarModelo = (base) => {
    if (!base) return null;
    const link = base.linkCapex;
    if (!link?.activo || partidas.length === 0) return base;
    const versionId = link.versionCapex || DEFAULT_VERSION_BY_TIPO[base.tipo] || "constructor";
    const { porCapitulo, total: egresoTotal } = rollupCapex(partidas, versionId);
    const ingresoTotal = base.supuestos.areaVendible * base.supuestos.precioPromedioM2;
    const opts = {
      inicio: project?.fechaInicioObra,
      fin: project?.fechaEntregaObra,
      inicioPreventas: project?.fechaContrato || project?.fechaInicioObra,
      fechaEntrega: project?.fechaEntregaObra,
      fechaEscrituracion: project?.fechaEscrituracionInicio || project?.fechaEntregaObra
    };
    const egresos = distribuyeFlujo(partidas, tareas, versionId, opts);
    const ingresos = distribuyeIngresos(ingresoTotal, opts);
    const flujo = mergeFlujo(ingresos, egresos).map(f => ({
      ...f,
      ingresos: Math.round(f.ingresos / 1000000),
      egresos: Math.round(f.egresos / 1000000),
      neto: Math.round(f.neto / 1000000),
      ingresosMes: Math.round(f.ingresosMes / 1000000),
      egresosMes: Math.round(f.egresosMes / 1000000)
    }));
    const utilidad = ingresoTotal - egresoTotal;
    const breakEvenIdx = flujo.findIndex(f => f.neto >= 0);
    const breakEvenMes = breakEvenIdx >= 0 ? flujo[breakEvenIdx].mes : "—";
    return {
      ...base,
      _derivado: true,
      _versionUsada: versionId,
      _porCapitulo: porCapitulo,
      kpis: { ...base.kpis, ingresoTotal, egresoTotal, utilidad, margenPct: ingresoTotal > 0 ? (utilidad / ingresoTotal) * 100 : 0, breakEvenMes },
      flujo: flujo.length > 0 ? flujo : base.flujo
    };
  };

  /* Derivación en vivo desde CAPEX + Cronograma */
  const activo = useMemo(() => derivarModelo(activoBase), [activoBase, partidas, tareas, project]);
  const comparado = useMemo(() => {
    if (!compararId) return null;
    const base = modelos.find(m => m.id === compararId);
    return derivarModelo(base);
  }, [compararId, modelos, partidas, tareas, project]);

  const handleNewFromTemplate = (tipo) => {
    const id = Math.max(0, ...modelos.map(m => m.id)) + 1;
    const nuevo = { id, ...seedModelo(tipo, 1.0) };
    setModelos(prev => [...prev, nuevo]);
    setActivoId(id);
    setModal(null);
  };

  const handleDelete = (id) => {
    if (!confirm("¿Eliminar este modelo?")) return;
    setModelos(prev => prev.filter(m => m.id !== id));
    if (activoId === id) setActivoId(modelos[0]?.id);
  };

  if (!activo) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 text-center">
        <p className="text-stone-500">Sin modelos financieros. Crea uno para empezar.</p>
        <button onClick={() => setModal({ tipo: "new" })} className="mt-3 inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800">
          <Plus className="h-3.5 w-3.5" /> Nuevo modelo
        </button>
      </div>
    );
  }

  const tipoCfg = TIPOS_MODELO.find(t => t.id === activo.tipo) || TIPOS_MODELO[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Modelo Financiero · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Visor de modelos financieros</h1>
          <p className="mt-1 text-sm text-stone-500">{modelos.length} versiones · cada audiencia ve su propia versión del modelo.</p>
        </div>
        <button onClick={() => setModal({ tipo: "new" })} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800">
          <Plus className="h-3.5 w-3.5" /> Nuevo modelo
        </button>
      </header>

      {/* Selector de modelo */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {modelos.map(m => {
          const cfg = TIPOS_MODELO.find(t => t.id === m.tipo) || TIPOS_MODELO[0];
          const Ic = cfg.icon;
          const active = activoId === m.id;
          return (
            <button key={m.id} onClick={() => setActivoId(m.id)} className={`group inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-all ${active ? COLOR_CLASS[cfg.color] + " ring-1 ring-stone-300" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}>
              <Ic className="h-3.5 w-3.5" />
              {m.nombre}
              <span className="ml-1 rounded bg-white/40 px-1 text-[9px] font-mono">{m.version}</span>
              {active && (
                <span onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} className="ml-1 cursor-pointer rounded p-0.5 text-current/60 hover:bg-rose-200 hover:text-rose-700">
                  <Trash2 className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel CAPEX link */}
      <LinkCapexPanel
        activo={activoBase}
        partidas={partidas}
        tareas={tareas}
        onChange={(linkCapex) => setModelos(prev => prev.map(m => m.id === activoId ? { ...m, linkCapex } : m))}
      />

      {/* Comparador */}
      <CompararPanel
        activo={activo}
        comparado={comparado}
        modelos={modelos}
        activoId={activoId}
        compararId={compararId}
        setCompararId={setCompararId}
      />

      {/* Header del modelo activo */}
      <div className={`mb-4 rounded-lg border p-4 ${COLOR_CLASS[tipoCfg.color]}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <tipoCfg.icon className="h-4 w-4" />
              <h2 className="font-serif text-lg">{activo.nombre}</h2>
              <span className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-[10px]">{activo.version}</span>
              {activo._derivado && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  <LinkIcon className="h-3 w-3" /> En vivo · {CAPEX_VERSIONES.find(v => v.id === activo._versionUsada)?.short}
                </span>
              )}
            </div>
            <p className="mt-1 text-[12px] opacity-80">{tipoCfg.desc}</p>
            {activo.notas && <p className="mt-1 text-[11px] italic opacity-70">{activo.notas}</p>}
          </div>
          <div className="text-right text-[11px] opacity-80">
            <div>Actualizado: {activo.fecha}</div>
            <div>Autor: {activo.autor}</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
        <Kpi label="Ingreso total" value={fmt(activo.kpis.ingresoTotal)} />
        <Kpi label="Egreso total" value={fmt(activo.kpis.egresoTotal)} />
        <Kpi label="Utilidad" value={fmt(activo.kpis.utilidad)} color="emerald" />
        <Kpi label="Margen" value={fmtPct(activo.kpis.margenPct)} color="emerald" />
        <Kpi label="TIR" value={fmtPct(activo.kpis.tirPct)} color="emerald" />
        <Kpi label="VPN" value={fmt(activo.kpis.vpn)} />
      </div>

      {/* Supuestos */}
      <Section title="Supuestos clave">
        <div className="grid grid-cols-2 gap-2 text-[12px] md:grid-cols-4">
          <Supuesto label="Área vendible" value={`${activo.supuestos.areaVendible.toLocaleString("es-CO")} m²`} />
          <Supuesto label="Unidades" value={activo.supuestos.unidades} />
          <Supuesto label="Precio promedio" value={`${fmt(activo.supuestos.precioPromedioM2)}/m²`} />
          <Supuesto label="Costo construcción" value={fmt(activo.supuestos.costoTotalConstruccion)} />
          <Supuesto label="Contingencia" value={fmtPct(activo.supuestos.contingenciaPct)} />
          <Supuesto label="Preventas req." value={fmtPct(activo.supuestos.preventasPct)} />
          <Supuesto label="Tasa crédito constructor" value={fmtPct(activo.supuestos.tasaCreditoConstructor * 100)} />
          <Supuesto label="Tasa descuento" value={fmtPct(activo.supuestos.tasaDescuento * 100)} />
        </div>
      </Section>

      {/* Flujo de caja */}
      <Section title="Flujo de caja (mensual y acumulado)">
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <AreaChart data={activo.flujo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v.toLocaleString("es-CO")} />
              <Tooltip formatter={(v) => `$ ${v.toLocaleString("es-CO")} MM`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="ingresos" name="Ingresos acum." stroke="#059669" fill="#10b98155" />
              <Area type="monotone" dataKey="egresos" name="Egresos acum." stroke="#dc2626" fill="#f8717155" />
              <Line type="monotone" dataKey="neto" name="Neto acum." stroke="#1e40af" strokeWidth={2} dot={false} />
              <ReferenceLine y={0} stroke="#78716c" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 text-[11px] text-stone-500">
          Break-even estimado: <strong>{activo.kpis.breakEvenMes}</strong> · Payback: <strong>{activo.kpis.payBackMeses} meses</strong>
        </div>
      </Section>

      {/* Tabla del flujo */}
      <Section title="Detalle mensual">
        <div className="max-h-72 overflow-auto rounded-md border border-stone-200">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-stone-50 text-[10px] uppercase tracking-wider text-stone-600">
              <tr>
                <th className="px-2 py-1.5 text-left">Mes</th>
                <th className="px-2 py-1.5 text-right">Ingreso mes</th>
                <th className="px-2 py-1.5 text-right">Egreso mes</th>
                <th className="px-2 py-1.5 text-right">Ingreso acum.</th>
                <th className="px-2 py-1.5 text-right">Egreso acum.</th>
                <th className="px-2 py-1.5 text-right">Neto acum.</th>
              </tr>
            </thead>
            <tbody>
              {activo.flujo.map((f, i) => (
                <tr key={i} className="border-t border-stone-100 font-mono">
                  <td className="px-2 py-1">{f.mes}</td>
                  <td className="px-2 py-1 text-right text-emerald-700">{f.ingresosMes?.toLocaleString("es-CO")}</td>
                  <td className="px-2 py-1 text-right text-rose-700">{f.egresosMes?.toLocaleString("es-CO")}</td>
                  <td className="px-2 py-1 text-right">{f.ingresos.toLocaleString("es-CO")}</td>
                  <td className="px-2 py-1 text-right">{f.egresos.toLocaleString("es-CO")}</td>
                  <td className={`px-2 py-1 text-right font-semibold ${f.neto >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{f.neto.toLocaleString("es-CO")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-1 text-[10px] text-stone-500">Valores en millones de COP.</div>
      </Section>

      {/* Sensibilidad */}
      <Section title="Análisis de sensibilidad">
        <div className="h-56 w-full">
          <ResponsiveContainer>
            <BarChart data={activo.sensibilidad} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="variable" tick={{ fontSize: 10 }} width={150} />
              <Tooltip />
              <ReferenceLine x={0} stroke="#78716c" />
              <Bar dataKey="impactoTIR" name="Impacto TIR (pp)" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* Audiencias */}
      <Section title="Audiencias con acceso a este modelo">
        <div className="flex flex-wrap gap-1.5">
          {(activo.visibleAUDS || []).map(a => (
            <span key={a} className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-700">{a}</span>
          ))}
          {(activo.visibleAUDS || []).length === 0 && <span className="text-[11px] italic text-stone-400">Sin audiencias configuradas</span>}
        </div>
      </Section>

      {modal && modal.tipo === "new" && (
        <NewModeloModal onClose={() => setModal(null)} onCreate={handleNewFromTemplate} />
      )}
    </div>
  );
};

const Kpi = ({ label, value, color = "stone" }) => {
  const colors = {
    stone: "bg-stone-50 text-stone-800 border-stone-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200"
  };
  return (
    <div className={`rounded-md border p-3 ${colors[color]}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="font-serif text-lg">{value}</div>
    </div>
  );
};

const Supuesto = ({ label, value }) => (
  <div className="rounded-md bg-stone-50 p-2">
    <div className="text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
    <div className="font-mono text-[13px] text-stone-900">{value}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-4 rounded-lg border border-stone-200 bg-white p-4">
    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">{title}</h3>
    {children}
  </div>
);

const NewModeloModal = ({ onClose, onCreate }) => (
  <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
    <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <h3 className="font-serif text-base">Crear nuevo modelo financiero</h3>
        <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
      </header>
      <div className="space-y-2 p-4">
        <p className="text-[12px] text-stone-600">Selecciona el tipo de modelo. Se generará una plantilla con flujo de caja, KPIs y sensibilidad que podrás editar después.</p>
        {TIPOS_MODELO.map(t => {
          const Ic = t.icon;
          return (
            <button key={t.id} onClick={() => onCreate(t.id)} className={`flex w-full items-center gap-3 rounded-md border p-3 text-left transition-all hover:shadow-sm ${COLOR_CLASS[t.color]}`}>
              <Ic className="h-4 w-4 flex-shrink-0" />
              <div>
                <div className="font-semibold">{t.label}</div>
                <div className="text-[11px] opacity-80">{t.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

/* ─── Panel comparador entre dos modelos ─── */
const CompararPanel = ({ activo, comparado, modelos, activoId, compararId, setCompararId }) => {
  if (!activo) return null;
  const disponibles = modelos.filter(m => m.id !== activoId);
  const tipoActivo = TIPOS_MODELO.find(t => t.id === activo.tipo);
  const tipoComp = comparado ? TIPOS_MODELO.find(t => t.id === comparado.tipo) : null;

  const dEgreso = comparado ? activo.kpis.egresoTotal - comparado.kpis.egresoTotal : 0;
  const dUtil = comparado ? activo.kpis.utilidad - comparado.kpis.utilidad : 0;
  const dMargen = comparado ? activo.kpis.margenPct - comparado.kpis.margenPct : 0;

  /* Comparativo por capítulo si ambos son derivados */
  const porCapitulo = useMemo(() => {
    if (!comparado || !activo._porCapitulo || !comparado._porCapitulo) return null;
    return CAPEX_CAPITULOS.map(c => ({
      id: c.id,
      label: c.label,
      activo: activo._porCapitulo[c.id] || 0,
      comparado: comparado._porCapitulo[c.id] || 0
    })).filter(r => r.activo > 0 || r.comparado > 0);
  }, [activo, comparado]);

  return (
    <div className="mb-3 rounded-lg border border-stone-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-stone-700">Comparar contra:</span>
        <select
          value={compararId || ""}
          onChange={(e) => setCompararId(e.target.value ? parseInt(e.target.value) : null)}
          className="rounded border border-stone-300 bg-white px-2 py-0.5 text-[11px]"
        >
          <option value="">— Sin comparación —</option>
          {disponibles.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        {comparado && (
          <span className="text-[11px] text-stone-500">
            {tipoActivo?.label.split(" ")[0]} vs {tipoComp?.label.split(" ")[0]}
          </span>
        )}
      </div>

      {comparado && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <DeltaCard label="Δ Egreso total" delta={dEgreso} good={dEgreso <= 0} />
          <DeltaCard label="Δ Utilidad" delta={dUtil} good={dUtil >= 0} />
          <DeltaCard label="Δ Margen" delta={dMargen} good={dMargen >= 0} suffix="pp" raw />
        </div>
      )}

      {porCapitulo && porCapitulo.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-md border border-stone-200">
          <table className="w-full text-[11px]">
            <thead className="bg-stone-50 text-[9px] uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-2 py-1 text-left">Capítulo</th>
                <th className="px-2 py-1 text-right">{activo.nombre.split(" ")[0]} <span className="text-stone-400">({activo._versionUsada || "snap"})</span></th>
                <th className="px-2 py-1 text-right">{comparado.nombre.split(" ")[0]} <span className="text-stone-400">({comparado._versionUsada || "snap"})</span></th>
                <th className="px-2 py-1 text-right">Δ COP</th>
                <th className="px-2 py-1 text-right">Δ %</th>
              </tr>
            </thead>
            <tbody>
              {porCapitulo.map(r => {
                const delta = r.activo - r.comparado;
                const pct = r.comparado > 0 ? (delta / r.comparado) * 100 : null;
                const cls = Math.abs(pct || 0) < 3 ? "text-stone-500" : delta > 0 ? "text-rose-700" : "text-emerald-700";
                return (
                  <tr key={r.id} className="border-t border-stone-100">
                    <td className="px-2 py-0.5 text-stone-800">{r.label}</td>
                    <td className="px-2 py-0.5 text-right font-mono">{fmtMM(r.activo)}</td>
                    <td className="px-2 py-0.5 text-right font-mono">{fmtMM(r.comparado)}</td>
                    <td className={`px-2 py-0.5 text-right font-mono ${cls}`}>{delta === 0 ? "—" : fmtMM(delta)}</td>
                    <td className={`px-2 py-0.5 text-right font-mono ${cls}`}>{pct == null ? "—" : (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {comparado && (
        <div className="mt-2 rounded bg-amber-50 p-2 text-[10px] text-amber-900">
          <strong>Lectura PMI:</strong> {dEgreso > 0
            ? <>El modelo activo proyecta <strong>{fmtMM(dEgreso)}</strong> MM más de egresos que el modelo comparado. Este desvío debe sustentarse en comité {comparado.tipo === "fiducia" ? "fiduciario" : comparado.tipo === "inversionista" ? "de inversionistas" : "interno"}.</>
            : dEgreso < 0
            ? <>El modelo activo proyecta <strong>{fmtMM(-dEgreso)}</strong> MM menos de egresos. Verifica si refleja ahorros reales o subestimación.</>
            : <>Ambos modelos coinciden en egresos.</>
          }
        </div>
      )}
    </div>
  );
};

const fmtMM = (n) => {
  const v = Math.round((parseFloat(n) || 0) / 1000000);
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  return sign + "$" + abs.toLocaleString("es-CO").replace(/,/g, ".") + " MM";
};

const DeltaCard = ({ label, delta, good, suffix, raw }) => {
  const cls = good ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800";
  const v = raw ? (delta >= 0 ? "+" : "") + Number(delta).toFixed(1) + (suffix ? ` ${suffix}` : "") : fmtMM(delta);
  return (
    <div className={`rounded-md border p-2 ${cls}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="font-mono text-sm font-semibold">{v}</div>
    </div>
  );
};

/* ─── Panel de configuración del link al CAPEX ─── */
const LinkCapexPanel = ({ activo, partidas, tareas, onChange }) => {
  if (!activo) return null;
  const link = activo.linkCapex || { activo: false, versionCapex: DEFAULT_VERSION_BY_TIPO[activo.tipo] || "constructor", lockSnapshot: false };
  const versionDefault = DEFAULT_VERSION_BY_TIPO[activo.tipo] || "constructor";
  const sinDatos = partidas.length === 0;

  return (
    <div className={`mb-3 rounded-lg border p-3 ${link.activo ? "border-emerald-300 bg-emerald-50/60" : "border-stone-200 bg-white"}`}>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5">
          {link.activo ? <LinkIcon className="h-4 w-4 text-emerald-700" /> : <Unlink className="h-4 w-4 text-stone-400" />}
          <input
            type="checkbox"
            checked={link.activo}
            disabled={sinDatos}
            onChange={(e) => onChange({ ...link, activo: e.target.checked })}
            className="accent-emerald-700"
          />
          <span className="text-[12px] font-semibold text-stone-800">
            {link.activo ? "Modelo derivado del CAPEX en vivo" : "Modelo en modo snapshot (independiente)"}
          </span>
        </label>

        {link.activo && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-stone-600">Versión CAPEX:</span>
              <select
                value={link.versionCapex || versionDefault}
                onChange={(e) => onChange({ ...link, versionCapex: e.target.value })}
                className="rounded border border-stone-300 bg-white px-2 py-0.5 text-[11px]"
              >
                {CAPEX_VERSIONES.map(v => <option key={v.id} value={v.id}>{v.short}</option>)}
              </select>
            </div>
            <span className="text-[11px] text-stone-500">
              {partidas.length} partidas · {tareas.length} tareas crono
            </span>
          </>
        )}

        {sinDatos && (
          <span className="text-[11px] italic text-amber-700">
            Sin partidas CAPEX cargadas — visita el módulo CAPEX edificación primero.
          </span>
        )}
      </div>

      {link.activo && (
        <div className="mt-2 rounded border border-emerald-200 bg-white p-2 text-[11px] text-stone-700">
          <strong className="text-emerald-800">¿Cómo funciona?</strong> Egreso total se calcula con los valores <em>{CAPEX_VERSIONES.find(v => v.id === (link.versionCapex || versionDefault))?.label}</em> de cada partida.
          Flujo mensual = distribución de cada partida en las fechas de su tarea de cronograma (matching por <code className="rounded bg-stone-100 px-1">cronoTask</code> / <code className="rounded bg-stone-100 px-1">wbsKey</code>).
          Si una partida no tiene tarea mapeada, se distribuye uniforme entre inicio y entrega de obra.
        </div>
      )}
    </div>
  );
};

export default ModeloFinanciero;
