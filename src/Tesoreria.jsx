import React, { useState, useMemo, useEffect } from "react";
import {
  Wallet, AlertCircle, CheckCircle2, TrendingDown, TrendingUp, Calendar,
  Landmark, Hammer, Activity, Shield, AlertTriangle, DollarSign,
  ChevronDown, ChevronRight, Info, Zap, Clock
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, AreaChart, Area, ReferenceLine, ComposedChart
} from "recharts";
import { getValor } from "./capexCronoLink.js";
import { capexPorFase, capexFlujoEgresos, FASES_INVERSION } from "./CapexEdificios.jsx";

const FASE_HEX = { preoperativo: "#6366f1", operativo: "#10b981", cierre: "#f59e0b" };

/* ────────────────────────────────────────────────────────────────
   Tesorería — Dashboard CFO Cretto
   Alinea el cronograma de obra con tesorería y pagos.
   5 pestañas:
   1. Hitos Financieros (Matriz Cronograma ↔ Caja)
   2. Liquidez & Caja (colchón, días-caja, semáforo)
   3. Cronograma de Pagos (Tier 1/2/3, confirming, retenciones)
   4. Crédito Constructor (tramos, desembolsos)
   5. Stress Tests (escenarios)
────────────────────────────────────────────────────────────────── */

/* ─── Constantes Cretto estándar ─── */

/* Estructura de ingresos por tipo de proyecto */
const INGRESO_NOVIS = {
  cuotaInicial: 0.05,     // 5% al firmar promesa
  duranteObra: 0.15,      // 15% en cuotas mensuales durante obra
  escrituracion: 0.80     // 80% en escrituración (crédito hipotecario + recursos)
};
const INGRESO_VIS = {
  cuotaInicial: 0.01,
  duranteObra: 0.09,
  escrituracion: 0.70,
  subsidios: 0.20         // Mi Casa Ya + Frech
};

/* Tramos del crédito constructor por avance */
const TRAMOS_CREDITO = [
  { tramo: "Tramo 1", avance: 10, pctCupo: 15, descripcion: "Cimentación" },
  { tramo: "Tramo 2", avance: 25, pctCupo: 20, descripcion: "Primera placa entrepiso" },
  { tramo: "Tramo 3", avance: 50, pctCupo: 25, descripcion: "Estructura 50%" },
  { tramo: "Tramo 4", avance: 75, pctCupo: 20, descripcion: "Cubierta + MEP" },
  { tramo: "Tramo Final", avance: 95, pctCupo: 20, descripcion: "Obra terminada" }
];

/* Tier de proveedores estándar */
const TIER_PROVEEDORES = {
  "Constructor":      { tier: 1, plazoIdeal: 30, retencion: 0.05, color: "violet" },
  "Acero":            { tier: 1, plazoIdeal: 45, retencion: 0,    color: "violet" },
  "Concreto":         { tier: 1, plazoIdeal: 30, retencion: 0,    color: "violet" },
  "Ascensores":       { tier: 1, plazoIdeal: 60, retencion: 0.05, color: "violet" },
  "MEP":              { tier: 2, plazoIdeal: 30, retencion: 0.05, color: "amber" },
  "Estructura":       { tier: 2, plazoIdeal: 30, retencion: 0.05, color: "amber" },
  "Acabados":         { tier: 2, plazoIdeal: 45, retencion: 0,    color: "amber" },
  "Mano de obra":     { tier: 3, plazoIdeal: 15, retencion: 0,    color: "stone" },
  "Materiales":       { tier: 3, plazoIdeal: 30, retencion: 0,    color: "stone" },
  "Otro":             { tier: 3, plazoIdeal: 30, retencion: 0,    color: "stone" }
};

/* Mapa Maestro: Hito constructivo ↔ implicación financiera */
const HITOS_MAESTROS = [
  { id: 1, hito: "Firma escritura del lote", avance: 0, ingresoActiva: "—", egreso: "Pago lote (15-20% costo)", accion: "Coordinar equity inicial o puente", riesgo: "Retraso inicio obra" },
  { id: 2, hito: "Obtención licencia construcción", avance: 0, ingresoActiva: "Apertura fiducia preventas", egreso: "Honorarios curaduría", accion: "Activar cuenta fiduciaria", riesgo: "Sin licencia no hay preventas" },
  { id: 3, hito: "🎯 PUNTO DE EQUILIBRIO", avance: 0, ingresoActiva: "Autorización fiducia inicio obra", egreso: "—", accion: "Solicitar aprobación crédito constructor", riesgo: "Sin PE no inicia obra", critico: true },
  { id: 4, hito: "Inicio obra / Descapote", avance: 3, ingresoActiva: "Tramo 0 crédito (opcional)", egreso: "Preliminares, campamento", accion: "Confirmar cupo crédito aprobado", riesgo: "Equity sin respaldo crediticio" },
  { id: 5, hito: "Cimentación completa", avance: 12, ingresoActiva: "Desembolso Tramo 1", egreso: "Pilotaje, acero cimentación", accion: "Solicitar visita avance banco", riesgo: "Demora desembolso = caja negativa", critico: true },
  { id: 6, hito: "Primera placa entrepiso", avance: 25, ingresoActiva: "Desembolso Tramo 2", egreso: "Estructura vertical piso 1", accion: "Informe avance para fiducia", riesgo: "Acero puede pausar suministro" },
  { id: 7, hito: "Estructura 50%", avance: 40, ingresoActiva: "Desembolso Tramo 3", egreso: "Estructura continua + MEP inicio", accion: "Revisión financiera mitad obra", riesgo: "Sobrecostos impactan margen" },
  { id: 8, hito: "Estructura completa", avance: 55, ingresoActiva: "Desembolso Tramo 4", egreso: "Cubierta, impermeabilización", accion: "Revisar presupuesto restante", riesgo: "Hito crítico para MEP/acabados", critico: true },
  { id: 9, hito: "MEP rough-in", avance: 70, ingresoActiva: "—", egreso: "Contratistas MEP", accion: "Confirmar saldo crédito suficiente", riesgo: "Retrasos generan cola en acabados" },
  { id: 10, hito: "Mampostería terminada", avance: 75, ingresoActiva: "Desembolso Tramo 5", egreso: "Bloque, mortero, mano obra", accion: "Activar confirming acabados", riesgo: "Extensión plazo crédito" },
  { id: 11, hito: "Inicio acabados", avance: 80, ingresoActiva: "—", egreso: "Pisos, pintura, ventanería", accion: "Pagos escalonados acabados", riesgo: "Lead time importados" },
  { id: 12, hito: "🏁 Obra terminada", avance: 98, ingresoActiva: "Desembolso Final", egreso: "Urbanismo, equipos", accion: "Tramitar licencia ocupación", riesgo: "Sin acta no inicia recaudo masivo", critico: true },
  { id: 13, hito: "Licencia ocupación", avance: 98, ingresoActiva: "Habilita escrituración", egreso: "Trámites legales, notaría", accion: "Coordinar notarías + bancos hipotecarios", riesgo: "Bloquea 70-80% del recaudo", critico: true },
  { id: 14, hito: "💰 Escrituración masiva", avance: 100, ingresoActiva: "Recaudo créditos hipotecarios", egreso: "Comisiones inmobiliarias finales", accion: "Turnos notariales + bancos", riesgo: "Demoras subsidios extienden cierre", critico: true },
  { id: 15, hito: "Entrega inmuebles", avance: 100, ingresoActiva: "Libera retenciones 5%", egreso: "Atención garantías", accion: "Liberar retenciones, calcular utilidad", riesgo: "Reclamaciones tardías" },
  { id: 16, hito: "Liquidación proyecto", avance: 100, ingresoActiva: "Utilidad distribuible", egreso: "Impuesto renta, liquidación fiducia", accion: "Cierre contable, distribución", riesgo: "—" }
];

const fmtCop = (n) => {
  const v = Math.round(parseFloat(n) || 0);
  if (Math.abs(v) >= 1000000000) return "$" + (v / 1000000000).toFixed(2) + " MMM";
  if (Math.abs(v) >= 1000000) return "$" + Math.round(v / 1000000).toLocaleString("es-CO").replace(/,/g, ".") + " MM";
  return "$" + v.toLocaleString("es-CO").replace(/,/g, ".");
};
const fmtPct = (n) => (parseFloat(n) || 0).toFixed(1) + "%";

const COLOR_CLASS = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  amber:   "bg-amber-100 text-amber-800 border-amber-200",
  rose:    "bg-rose-100 text-rose-800 border-rose-200",
  violet:  "bg-violet-100 text-violet-800 border-violet-200",
  blue:    "bg-blue-100 text-blue-800 border-blue-200",
  stone:   "bg-stone-100 text-stone-700 border-stone-200",
  indigo:  "bg-indigo-100 text-indigo-800 border-indigo-200"
};

const Tesoreria = ({ project, partidas = [], tareas = [], pagos = [] }) => {
  const [tab, setTab] = useState("hitos");
  const [estadoActual, setEstadoActual] = useState({
    saldoDisponible: 8000000000,   // $8.000 MM como caja actual (editable)
    cupoCreditoConstructor: 25000000000,
    pctAvanceObraActual: 12,        // % avance físico estimado
    preventasAlcanzadas: 18         // unidades vendidas vs 28 PE (Casa 107)
  });

  /* ── Métricas derivadas ── */
  const supuestos = useMemo(() => {
    const totalUnidades = project?.unidades || project?.unidadesViv || 47;
    const peUnidades = project?.unidadesPuntoEquilibrio || Math.round(totalUnidades * 0.6);
    const precioVentaM2 = project?.precioVentaM2 || 14500000;
    const areaVendible = project?.areaVendible || 5500;
    const ventasTotalesEstimadas = areaVendible * precioVentaM2;
    const esVis = project?.estratoVis === "vis" || project?.estratoVis === "vip";

    const capexTotal = partidas.reduce((s, p) => s + (getValor(p, "constructor") || getValor(p, "inicial") || 0), 0)
      || (project?.capexEstimado || 0);

    const mesesObra = project?.fechaInicioObra && project?.fechaEntregaObra
      ? Math.max(1, Math.round((new Date(project.fechaEntregaObra) - new Date(project.fechaInicioObra)) / (1000*60*60*24*30)))
      : 18;

    const egresoMensualPromedio = capexTotal / mesesObra;
    const colchonMeses = egresoMensualPromedio > 0 ? estadoActual.saldoDisponible / egresoMensualPromedio : 0;

    return {
      totalUnidades, peUnidades, precioVentaM2, areaVendible,
      ventasTotalesEstimadas, esVis,
      capexTotal, mesesObra, egresoMensualPromedio, colchonMeses,
      pctPreventasAlcanzado: peUnidades > 0 ? (estadoActual.preventasAlcanzadas / peUnidades) * 100 : 0
    };
  }, [project, partidas, estadoActual]);

  /* Semáforo de liquidez */
  const semaforoLiquidez = supuestos.colchonMeses >= 2 ? "verde"
    : supuestos.colchonMeses >= 1 ? "amarillo" : "rojo";

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Tesorería · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Tesorería & Hitos Financieros</h1>
          <p className="mt-1 text-sm text-stone-500">
            Dashboard del CFO: cronograma de obra alineado con caja, crédito constructor, pagos y semáforo de liquidez.
          </p>
        </div>
      </header>

      {/* Banda superior de KPIs financieros */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        <KpiCard
          label="Saldo disponible"
          value={fmtCop(estadoActual.saldoDisponible)}
          icon={Wallet}
          color="emerald"
          editable
          onClick={() => {
            const v = prompt("Saldo disponible actual (COP):", estadoActual.saldoDisponible);
            if (v !== null) setEstadoActual(s => ({ ...s, saldoDisponible: parseFloat(v) || 0 }));
          }}
        />
        <KpiCard
          label="Colchón liquidez"
          value={`${supuestos.colchonMeses.toFixed(1)} meses`}
          icon={Shield}
          color={semaforoLiquidez === "verde" ? "emerald" : semaforoLiquidez === "amarillo" ? "amber" : "rose"}
          sub={semaforoLiquidez === "verde" ? "🟢 Sano" : semaforoLiquidez === "amarillo" ? "🟡 Monitoreo" : "🔴 Emergencia"}
        />
        <KpiCard
          label="Días de caja"
          value={`${Math.round(estadoActual.saldoDisponible / (supuestos.egresoMensualPromedio / 30))} días`}
          icon={Clock}
          color={supuestos.colchonMeses >= 2 ? "emerald" : "amber"}
        />
        <KpiCard
          label="Avance preventas"
          value={`${estadoActual.preventasAlcanzadas}/${supuestos.peUnidades}`}
          icon={Activity}
          color={supuestos.pctPreventasAlcanzado >= 100 ? "emerald" : supuestos.pctPreventasAlcanzado >= 80 ? "amber" : "rose"}
          sub={fmtPct(supuestos.pctPreventasAlcanzado) + " del PE"}
          editable
          onClick={() => {
            const v = prompt("Unidades preventas alcanzadas:", estadoActual.preventasAlcanzadas);
            if (v !== null) setEstadoActual(s => ({ ...s, preventasAlcanzadas: parseInt(v) || 0 }));
          }}
        />
        <KpiCard
          label="% Avance obra"
          value={`${estadoActual.pctAvanceObraActual}%`}
          icon={Hammer}
          color="blue"
          editable
          onClick={() => {
            const v = prompt("% avance físico de obra:", estadoActual.pctAvanceObraActual);
            if (v !== null) setEstadoActual(s => ({ ...s, pctAvanceObraActual: parseFloat(v) || 0 }));
          }}
        />
      </div>

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-stone-200">
        {[
          { id: "hitos",    label: "Matriz Hitos ↔ Caja", icon: Calendar },
          { id: "liquidez", label: "Liquidez & Caja",     icon: Wallet },
          { id: "egresos",  label: "Egresos CAPEX (fases)", icon: TrendingDown },
          { id: "pagos",    label: "Cronograma Pagos",    icon: DollarSign },
          { id: "credito",  label: "Crédito Constructor", icon: Landmark },
          { id: "stress",   label: "Stress Tests",        icon: Zap }
        ].map(t => {
          const Ic = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-medium ${tab === t.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
              <Ic className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "hitos" && <MatrizHitos supuestos={supuestos} estado={estadoActual} project={project} />}
      {tab === "liquidez" && <LiquidezTab supuestos={supuestos} estado={estadoActual} semaforo={semaforoLiquidez} partidas={partidas} project={project} />}
      {tab === "egresos" && <EgresosCapexTab partidas={partidas} project={project} ventasTotales={supuestos.ventasTotalesEstimadas} />}
      {tab === "pagos" && <CronogramaPagosTab pagos={pagos} partidas={partidas} project={project} />}
      {tab === "credito" && <CreditoConstructorTab supuestos={supuestos} estado={estadoActual} />}
      {tab === "stress" && <StressTestsTab supuestos={supuestos} estado={estadoActual} />}
    </div>
  );
};

/* ─────────────── Componentes auxiliares ─────────────── */

const KpiCard = ({ label, value, sub, icon: Icon, color = "stone", editable, onClick }) => (
  <div className={`rounded-md border p-3 ${COLOR_CLASS[color]} ${editable ? "cursor-pointer hover:opacity-80" : ""}`} onClick={onClick} title={editable ? "Click para editar" : ""}>
    <div className="flex items-center justify-between">
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      {Icon && <Icon className="h-3.5 w-3.5 opacity-70" />}
    </div>
    <div className="font-serif text-lg">{value}</div>
    {sub && <div className="text-[10px] opacity-75">{sub}</div>}
  </div>
);

/* ─────────────── Tab 1: Matriz de Hitos ─────────────── */
const MatrizHitos = ({ supuestos, estado, project }) => {
  const [expanded, setExpanded] = useState({});

  /* Para cada hito, calcular si está cubierto por la caja actual + crédito esperado */
  const hitosCalculados = useMemo(() => {
    return HITOS_MAESTROS.map(h => {
      /* Egreso aproximado = % capex que se gasta en ese hito */
      const capexAcumPct = h.avance / 100;
      const egresoEstimado = supuestos.capexTotal * 0.15 * (h.avance > 0 ? 1 : 0);  // 15% por hito clave promedio
      const ingresoEstimado = (h.ingresoActiva.includes("Tramo")) ? supuestos.capexTotal * 0.20
        : h.ingresoActiva.includes("Escrituración") ? supuestos.ventasTotalesEstimadas * 0.80
        : 0;
      /* Estado vs avance actual */
      const cumplido = h.avance > 0 && estado.pctAvanceObraActual >= h.avance;
      const proximo = !cumplido && h.avance > estado.pctAvanceObraActual && h.avance <= estado.pctAvanceObraActual + 15;
      return { ...h, egresoEstimado, ingresoEstimado, cumplido, proximo };
    });
  }, [supuestos, estado]);

  return (
    <div>
      <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50/40 p-3 text-[12px] text-emerald-900">
        💡 <strong>Matriz CFO Cretto:</strong> cada hito de obra tiene una doble lectura — avance físico para el PM, evento financiero para el CFO.
        Verde = cumplido · Azul = próximo · Crítico ⚠️ requiere atención de tesorería.
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-600">
            <tr>
              <th className="px-3 py-2 text-left w-8"></th>
              <th className="px-3 py-2 text-left">Hito Constructivo</th>
              <th className="px-3 py-2 text-center">% Avance</th>
              <th className="px-3 py-2 text-left">💰 Ingreso Habilitado</th>
              <th className="px-3 py-2 text-left">💸 Egreso Generado</th>
              <th className="px-3 py-2 text-left">🏦 Acción Financiera</th>
              <th className="px-3 py-2 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {hitosCalculados.map(h => {
              const isExp = expanded[h.id];
              return (
                <React.Fragment key={h.id}>
                  <tr className={`border-t border-stone-100 ${h.critico ? "bg-amber-50/30" : ""} ${h.cumplido ? "bg-emerald-50/30" : h.proximo ? "bg-blue-50/30" : ""}`}>
                    <td className="px-3 py-2">
                      <button onClick={() => setExpanded(e => ({ ...e, [h.id]: !e[h.id] }))}>
                        {isExp ? <ChevronDown className="h-3 w-3 text-stone-400" /> : <ChevronRight className="h-3 w-3 text-stone-400" />}
                      </button>
                    </td>
                    <td className="px-3 py-2 font-medium text-stone-800">
                      {h.critico && <AlertCircle className="mr-1 inline h-3 w-3 text-amber-600" />}
                      {h.hito}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="font-mono font-semibold">{h.avance}%</span>
                    </td>
                    <td className="px-3 py-2 text-stone-700">{h.ingresoActiva}</td>
                    <td className="px-3 py-2 text-stone-700">{h.egreso}</td>
                    <td className="px-3 py-2 text-[11px] text-stone-600">{h.accion}</td>
                    <td className="px-3 py-2 text-center">
                      {h.cumplido ? <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800">✓ Cumplido</span>
                        : h.proximo ? <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-800">⏭ Próximo</span>
                        : <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[9px] text-stone-600">Pendiente</span>}
                    </td>
                  </tr>
                  {isExp && (
                    <tr className="border-t border-stone-100 bg-stone-50/40">
                      <td></td>
                      <td colSpan={6} className="px-3 py-2 text-[11px]">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <div className="text-[10px] uppercase text-stone-500">Egreso estimado</div>
                            <div className="font-mono font-semibold text-rose-700">{fmtCop(h.egresoEstimado)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase text-stone-500">Ingreso estimado</div>
                            <div className="font-mono font-semibold text-emerald-700">{fmtCop(h.ingresoEstimado)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase text-stone-500">⚠️ Riesgo si se atrasa</div>
                            <div className="italic text-stone-700">{h.riesgo}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-md border border-rose-200 bg-rose-50/60 p-3 text-[12px] text-rose-900">
        <strong>🔴 Zona Muerta:</strong> entre "Obra terminada" (hito 12) y "Escrituración masiva" (hito 14) pueden pasar 30-90 días.
        Los intereses del crédito constructor siguen corriendo sin entradas de caja. Minimizar esa brecha es prioridad de tesorería.
      </div>
    </div>
  );
};

/* ─────────────── Tab 2: Liquidez ─────────────── */
const LiquidezTab = ({ supuestos, estado, semaforo, partidas = [], project }) => {
  /* Egresos reales del CAPEX por fase, distribuidos en el tiempo */
  const egresosCapex = useMemo(
    () => capexFlujoEgresos(partidas, "constructor", { inicioObra: project?.fechaInicioObra }),
    [partidas, project]
  );

  /* Proyección mensual — usa egresos reales del CAPEX si existen, sino curva sintética */
  const proyeccion = useMemo(() => {
    const usarReal = egresosCapex.length > 0;
    const meses = usarReal ? egresosCapex.length : supuestos.mesesObra;
    const out = [];
    let saldo = estado.saldoDisponible;
    for (let m = 0; m < meses; m++) {
      const ingresoEsperado = (m === 0 ? estado.saldoDisponible * 0.3 : 0)
        + supuestos.ventasTotalesEstimadas * (m / meses) * 0.001;
      const egresoEsperado = usarReal
        ? egresosCapex[m].total
        : supuestos.egresoMensualPromedio * (m < 3 ? 0.3 : m < meses * 0.7 ? 1.3 : 0.6);
      const flujoNeto = ingresoEsperado - egresoEsperado;
      saldo += flujoNeto;
      const colchon = supuestos.egresoMensualPromedio > 0 ? saldo / supuestos.egresoMensualPromedio : 0;
      const sem = colchon >= 2 ? "🟢" : colchon >= 1 ? "🟡" : "🔴";
      out.push({
        mes: usarReal ? egresosCapex[m].mes : `M${m + 1}`,
        saldo: Math.round(saldo / 1000000),
        ingreso: Math.round(ingresoEsperado / 1000000),
        egreso: Math.round(egresoEsperado / 1000000),
        colchon: colchon.toFixed(1),
        semaforo: sem
      });
    }
    return out;
  }, [supuestos, estado]);

  return (
    <div className="space-y-4">
      {/* Banner semáforo */}
      <div className={`rounded-md border p-3 ${semaforo === "verde" ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : semaforo === "amarillo" ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-rose-200 bg-rose-50 text-rose-900"}`}>
        {semaforo === "verde" && <><CheckCircle2 className="mr-1 inline h-4 w-4" /><strong>🟢 Situación sana</strong> — Colchón ≥ 2 meses. Monitoreo estándar.</>}
        {semaforo === "amarillo" && <><AlertTriangle className="mr-1 inline h-4 w-4" /><strong>🟡 Alerta amarilla</strong> — Activar medidas preventivas: acelerar preventas, renegociar plazos con Tier 2/3, revisar pagos no urgentes.</>}
        {semaforo === "rojo" && <><AlertCircle className="mr-1 inline h-4 w-4" /><strong>🔴 ALERTA ROJA — Protocolo Emergencia</strong> — Reunión dirección 48h, convocar banco, evaluar capitalización emergencia, suspender pagos no críticos.</>}
      </div>

      {/* Indicadores KPI */}
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Indicadores Clave de Liquidez (KPIs Cretto)</h3>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-stone-500">
            <tr className="border-b border-stone-200">
              <th className="px-2 py-2 text-left">Indicador</th>
              <th className="px-2 py-2 text-left">Fórmula</th>
              <th className="px-2 py-2 text-right">Valor actual</th>
              <th className="px-2 py-2 text-center">Estado</th>
              <th className="px-2 py-2 text-left">Umbrales (V / A / R)</th>
            </tr>
          </thead>
          <tbody>
            <KpiLiquidezRow label="Colchón de Liquidez" formula="Saldo / Costo mensual" value={`${supuestos.colchonMeses.toFixed(1)} meses`}
              estado={supuestos.colchonMeses >= 2 ? "🟢" : supuestos.colchonMeses >= 1 ? "🟡" : "🔴"} umbrales="≥2 / 1-2 / <1" />
            <KpiLiquidezRow label="Días de Caja" formula="Saldo / (Egresos/30)" value={`${Math.round(estado.saldoDisponible / (supuestos.egresoMensualPromedio / 30))} días`}
              estado={supuestos.colchonMeses >= 2 ? "🟢" : supuestos.colchonMeses >= 1 ? "🟡" : "🔴"} umbrales="≥60 / 30-60 / <30" />
            <KpiLiquidezRow label="Ratio Preventas vs PE" formula="Vendidas / PE" value={fmtPct(supuestos.pctPreventasAlcanzado)}
              estado={supuestos.pctPreventasAlcanzado >= 100 ? "🟢" : supuestos.pctPreventasAlcanzado >= 80 ? "🟡" : "🔴"} umbrales="≥100% / 80-99% / <80%" />
            <KpiLiquidezRow label="Avance Ventas vs Obra" formula="% ventas / % avance físico" value={
              estado.pctAvanceObraActual > 0
                ? fmtPct((supuestos.pctPreventasAlcanzado / estado.pctAvanceObraActual) * 100)
                : "—"
            } estado="🟢" umbrales="≥110% / 90-110% / <90%" />
          </tbody>
        </table>
      </div>

      {/* Gráfico proyección */}
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Proyección de Saldo Mensual (MM COP)</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <ComposedChart data={proyeccion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `$ ${v} MM`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="ingreso" fill="#10b981" name="Ingreso" />
              <Bar dataKey="egreso" fill="#f43f5e" name="Egreso" />
              <Line type="monotone" dataKey="saldo" stroke="#1e40af" strokeWidth={2} name="Saldo" />
              <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="3 3" label="Quiebre caja" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fuentes contingencia */}
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Fuentes de Liquidez de Contingencia (orden de activación)</h3>
        <div className="space-y-1">
          {[
            { p: 1, fuente: "Aceleración de preventas",        tiempo: "Inmediato", costo: "Costo comercial" },
            { p: 2, fuente: "Línea revolvente bancaria",       tiempo: "2-5 días",  costo: "IBR + spreads" },
            { p: 3, fuente: "Adelanto tramo crédito constructor", tiempo: "5-15 días", costo: "Incluido en crédito" },
            { p: 4, fuente: "Confirming (libera caja)",        tiempo: "3-7 días",  costo: "IBR + 2-4 pts" },
            { p: 5, fuente: "Aporte extraordinario socios",    tiempo: "5-20 días", costo: "Dilución / deuda" },
            { p: 6, fuente: "Crédito puente (bridge loan)",    tiempo: "10-30 días", costo: "Alto — último recurso" }
          ].map(f => (
            <div key={f.p} className="grid grid-cols-[40px_1fr_120px_180px] items-center gap-2 rounded border border-stone-100 bg-stone-50/40 p-2 text-[11px]">
              <span className="font-mono font-bold text-stone-700">#{f.p}</span>
              <span className="font-medium">{f.fuente}</span>
              <span className="text-stone-600">{f.tiempo}</span>
              <span className="italic text-stone-500">{f.costo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const KpiLiquidezRow = ({ label, formula, value, estado, umbrales }) => (
  <tr className="border-t border-stone-100">
    <td className="px-2 py-1.5 font-medium text-stone-800">{label}</td>
    <td className="px-2 py-1.5 text-[10px] italic text-stone-500">{formula}</td>
    <td className="px-2 py-1.5 text-right font-mono font-semibold">{value}</td>
    <td className="px-2 py-1.5 text-center">{estado}</td>
    <td className="px-2 py-1.5 text-[10px] text-stone-500">{umbrales}</td>
  </tr>
);

/* ─────────────── Tab: Egresos CAPEX por fase (flujo de caja 2 lados) ─────────────── */
const EgresosCapexTab = ({ partidas, project, ventasTotales }) => {
  const [version, setVersion] = useState("constructor");

  const porFase = useMemo(() => capexPorFase(partidas, version), [partidas, version]);
  const egresos = useMemo(
    () => capexFlujoEgresos(partidas, version, { inicioObra: project?.fechaInicioObra }),
    [partidas, version, project]
  );

  /* Lado de ingresos: 30% durante preventas/obra, 70% en escrituración (post-entrega) */
  const flujo2Lados = useMemo(() => {
    if (egresos.length === 0) return [];
    const totalMeses = egresos.length;
    const escrituraInicio = Math.max(0, totalMeses - 6); // últimos 6 meses
    let acumNeto = 0;
    return egresos.map((e, i) => {
      const ingresoPreventas = (ventasTotales * 0.30) / Math.max(1, escrituraInicio);
      const ingresoEscritura = i >= escrituraInicio ? (ventasTotales * 0.70) / Math.max(1, totalMeses - escrituraInicio) : 0;
      const ingreso = (i < escrituraInicio ? ingresoPreventas : 0) + ingresoEscritura;
      const egreso = e.total;
      const neto = ingreso - egreso;
      acumNeto += neto;
      return {
        mes: e.mes,
        ingreso: Math.round(ingreso / 1000000),
        egreso: -Math.round(egreso / 1000000),   // negativo para mostrar debajo del eje
        neto: Math.round(acumNeto / 1000000)
      };
    });
  }, [egresos, ventasTotales]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50/40 p-3 text-[12px] text-emerald-900">
        <div>
          <strong>Flujo de caja del proyecto — de un lado y del otro:</strong> egresos (CAPEX por fase) vs ingresos (preventas + escrituración).
          Conectado en vivo con el módulo CAPEX edificación.
        </div>
        <select value={version} onChange={e => setVersion(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1 text-[12px]">
          <option value="inicial">Presupuesto inicial</option>
          <option value="constructor">Contrato constructor</option>
          <option value="ejecutado">Ejecutado</option>
        </select>
      </div>

      {/* KPIs por fase */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {FASES_INVERSION.map(f => (
          <KpiCard key={f.id} label={`${f.icon} ${f.label}`} value={fmtCop(porFase[f.id] || 0)}
            sub={`${porFase.total > 0 ? ((porFase[f.id] / porFase.total) * 100).toFixed(0) : 0}% del CAPEX`}
            color={f.color === "indigo" ? "indigo" : f.color === "emerald" ? "emerald" : "amber"} />
        ))}
        <KpiCard label="CAPEX total" value={fmtCop(porFase.total)} color="stone" />
      </div>

      {/* Flujo de caja 2 lados */}
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">
          Flujo de caja del proyecto — Ingresos (↑) vs Egresos (↓) por mes · MM COP
        </h3>
        {flujo2Lados.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={flujo2Lados} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="mes" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `$ ${Math.abs(v)} MM`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke="#78716c" />
              <Bar dataKey="ingreso" fill="#10b981" name="Ingresos (preventas + escrituración)" />
              <Bar dataKey="egreso" fill="#f43f5e" name="Egresos (CAPEX)" />
              <Line type="monotone" dataKey="neto" stroke="#1e40af" strokeWidth={2} dot={false} name="Caja acumulada neta" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="py-12 text-center text-[12px] text-stone-400">
            Configura la fecha de inicio de obra y carga partidas CAPEX para ver el flujo de caja temporal.
          </div>
        )}
        <div className="mt-2 rounded-md bg-stone-50 p-2 text-[11px] text-stone-600">
          <strong>Lectura CFO:</strong> el punto más bajo de la <em>caja acumulada neta</em> (línea azul) es la <strong>máxima exposición de capital</strong> —
          el momento en que el proyecto necesita más equity o crédito. Es la zona muerta entre obra terminada y escrituración masiva.
        </div>
      </div>
    </div>
  );
};

/* ─────────────── Tab 3: Cronograma de Pagos ─────────────── */
const CronogramaPagosTab = ({ pagos, partidas, project }) => {
  /* Clasificar pagos por tier */
  const pagosPorTier = useMemo(() => {
    const tiers = { 1: [], 2: [], 3: [], otros: [] };
    pagos.forEach(p => {
      const cat = Object.entries(TIER_PROVEEDORES).find(([k]) =>
        (p.proveedor || "").toLowerCase().includes(k.toLowerCase()) ||
        (p.descripcion || "").toLowerCase().includes(k.toLowerCase())
      );
      const tier = cat ? cat[1].tier : 3;
      tiers[tier].push({ ...p, tier });
    });
    return tiers;
  }, [pagos]);

  const totalCausado = pagos.filter(p => p.estado === "causado").reduce((s, p) => s + (p.monto || 0), 0);
  const totalPagado = pagos.filter(p => p.estado === "pagado").reduce((s, p) => s + (p.monto || 0), 0);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-3 text-[12px] text-emerald-900">
        <strong>🎯 Principio CFO:</strong> maximizar el tiempo entre el recaudo y el desembolso. Toda negociación de plazos con proveedores es una herramienta financiera.
      </div>

      {/* KPIs pagos */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <KpiCard label="Total pagado" value={fmtCop(totalPagado)} icon={CheckCircle2} color="emerald" />
        <KpiCard label="Causado (por pagar)" value={fmtCop(totalCausado)} icon={Clock} color="amber" />
        <KpiCard label="Pagos Tier 1 (críticos)" value={pagosPorTier[1].length} icon={AlertCircle} color="violet" />
        <KpiCard label="Total pagos registrados" value={pagos.length} icon={DollarSign} />
      </div>

      {/* Categorización por Tier */}
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Clasificación por Tier — Palanca de Negociación</h3>
        <table className="w-full text-[11px]">
          <thead className="text-[10px] uppercase tracking-wider text-stone-500">
            <tr className="border-b border-stone-200">
              <th className="px-2 py-2 text-left">Tier</th>
              <th className="px-2 py-2 text-left">Categoría</th>
              <th className="px-2 py-2 text-left">Palanca de negociación</th>
              <th className="px-2 py-2 text-right">Plazo ideal</th>
              <th className="px-2 py-2 text-right">Retención</th>
              <th className="px-2 py-2 text-left">Confirming recomendado</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(TIER_PROVEEDORES).map(([cat, info]) => (
              <tr key={cat} className="border-t border-stone-100">
                <td className="px-2 py-1.5">
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${COLOR_CLASS[info.color]}`}>Tier {info.tier}</span>
                </td>
                <td className="px-2 py-1.5 font-medium text-stone-800">{cat}</td>
                <td className="px-2 py-1.5 text-[10px] italic text-stone-600">
                  {info.tier === 1 ? "Volumen / Contrato suministro" : info.tier === 2 ? "Avance mensual + retención" : "Mano de obra / Crédito proveedor"}
                </td>
                <td className="px-2 py-1.5 text-right font-mono">{info.plazoIdeal} días</td>
                <td className="px-2 py-1.5 text-right font-mono">{(info.retencion * 100).toFixed(0)}%</td>
                <td className="px-2 py-1.5 text-[10px]">
                  {info.tier <= 2 ? <span className="text-emerald-700">✓ Sí (factura &gt; $50MM)</span> : <span className="text-stone-400">No típicamente</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estrategias optimización */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-violet-200 bg-violet-50/40 p-3">
          <h4 className="mb-2 font-semibold text-violet-900">1️⃣ Confirming</h4>
          <ul className="space-y-1 text-[11px] text-violet-800">
            <li>• Plazo 60-120 días</li>
            <li>• Costo IBR + 2-4 pts</li>
            <li>• Acero, cemento, acabados</li>
            <li>• Factura &gt; $50 MM</li>
          </ul>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
          <h4 className="mb-2 font-semibold text-amber-900">2️⃣ Retenciones (5%)</h4>
          <ul className="space-y-1 text-[11px] text-amber-800">
            <li>• 5% sobre actas</li>
            <li>• Libera 3-6 meses post-entrega</li>
            <li>• Solo contratistas de obra</li>
            <li>• Sustituible por póliza cumplimiento</li>
          </ul>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3">
          <h4 className="mb-2 font-semibold text-blue-900">3️⃣ Anticipos estratégicos</h4>
          <ul className="space-y-1 text-[11px] text-blue-800">
            <li>• Acero: 20-30% (precio fijo)</li>
            <li>• Ascensores: 30% + hitos (lead time)</li>
            <li>• Acabados import.: 40% + saldo</li>
          </ul>
        </div>
      </div>

      {/* Regla de oro */}
      <div className="rounded-md border border-rose-200 bg-rose-50/40 p-3 text-[12px] text-rose-900">
        <strong>⚡ Regla de oro Cretto:</strong> ningún pago masivo a proveedores debe programarse antes de la fecha de desembolso del tramo de crédito constructor correspondiente.
      </div>
    </div>
  );
};

/* ─────────────── Tab 4: Crédito Constructor ─────────────── */
const CreditoConstructorTab = ({ supuestos, estado }) => {
  const tramosCalculados = TRAMOS_CREDITO.map(t => ({
    ...t,
    montoDesembolso: estado.cupoCreditoConstructor * (t.pctCupo / 100),
    cumplido: estado.pctAvanceObraActual >= t.avance,
    proximo: !((estado.pctAvanceObraActual >= t.avance)) && t.avance <= estado.pctAvanceObraActual + 15
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-blue-200 bg-blue-50/40 p-3 text-[12px] text-blue-900">
        💡 <strong>Crédito Constructor (Banco de Occidente — Casa 107):</strong> cupo aprobado de {fmtCop(estado.cupoCreditoConstructor)}, desembolsado por avance de obra mediante visitas del banco.
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <KpiCard label="Cupo aprobado" value={fmtCop(estado.cupoCreditoConstructor)} icon={Landmark} color="blue" />
        <KpiCard
          label="Desembolsado a hoy"
          value={fmtCop(tramosCalculados.filter(t => t.cumplido).reduce((s, t) => s + t.montoDesembolso, 0))}
          icon={CheckCircle2}
          color="emerald"
        />
        <KpiCard
          label="Disponible"
          value={fmtCop(tramosCalculados.filter(t => !t.cumplido).reduce((s, t) => s + t.montoDesembolso, 0))}
          icon={Wallet}
          color="amber"
        />
        <KpiCard label="Próximo tramo" value={tramosCalculados.find(t => t.proximo)?.tramo || "—"} icon={Clock} color="violet" />
      </div>

      {/* Tabla tramos */}
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-600">
            <tr>
              <th className="px-3 py-2 text-left">Tramo</th>
              <th className="px-3 py-2 text-left">Hito constructivo</th>
              <th className="px-3 py-2 text-right">% Avance obra</th>
              <th className="px-3 py-2 text-right">% Cupo</th>
              <th className="px-3 py-2 text-right">Monto (COP)</th>
              <th className="px-3 py-2 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {tramosCalculados.map(t => (
              <tr key={t.tramo} className={`border-t border-stone-100 ${t.cumplido ? "bg-emerald-50/30" : t.proximo ? "bg-blue-50/30" : ""}`}>
                <td className="px-3 py-2 font-semibold">{t.tramo}</td>
                <td className="px-3 py-2 text-stone-700">{t.descripcion}</td>
                <td className="px-3 py-2 text-right font-mono">{t.avance}%</td>
                <td className="px-3 py-2 text-right font-mono">{t.pctCupo}%</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{fmtCop(t.montoDesembolso)}</td>
                <td className="px-3 py-2 text-center">
                  {t.cumplido ? <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">✓ Desembolsado</span>
                    : t.proximo ? <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">⏭ Próximo</span>
                    : <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600">Pendiente</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Requisitos previos a cada desembolso */}
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Checklist Cretto — Antes de cada desembolso</h3>
        <ul className="space-y-1 text-[12px] text-stone-700">
          <li>☐ Informe de interventoría con % avance verificado</li>
          <li>☐ Actas de obra al día y sin objeciones del banco</li>
          <li>☐ Saldo de cupo disponible en crédito constructor confirmado</li>
          <li>☐ Facturas y actas de contratistas listas para radicar ante fiducia</li>
          <li>☐ Certificado de paz y salvo de aportes parafiscales</li>
        </ul>
      </div>
    </div>
  );
};

/* ─────────────── Tab 5: Stress Tests ─────────────── */
const StressTestsTab = ({ supuestos, estado }) => {
  const escenarios = [
    { id: "base",     nombre: "Base",     supuesto: "Ventas según proyección, costos estables",       ventasDelta: 0,    costosDelta: 0,    color: "emerald" },
    { id: "moderado", nombre: "Moderado", supuesto: "Ventas -20%, costos +8%",                         ventasDelta: -0.20, costosDelta: 0.08, color: "amber" },
    { id: "severo",   nombre: "Severo",   supuesto: "Ventas -35%, costos +15%, demora 3 meses PE",   ventasDelta: -0.35, costosDelta: 0.15, color: "rose" },
    { id: "extremo",  nombre: "Extremo",  supuesto: "Cierre crédito hipotecario + paralización 2 meses", ventasDelta: -0.50, costosDelta: 0.20, color: "rose" }
  ];

  const resultados = escenarios.map(e => {
    const ingresoAjustado = supuestos.ventasTotalesEstimadas * (1 + e.ventasDelta);
    const egresoAjustado = supuestos.capexTotal * (1 + e.costosDelta);
    const impacto = ingresoAjustado - egresoAjustado;
    const cubre = (estado.saldoDisponible + impacto) > 0;
    return { ...e, ingresoAjustado, egresoAjustado, impacto, cubre };
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-200 bg-amber-50/40 p-3 text-[12px] text-amber-900">
        ⚡ <strong>Stress Test CFO:</strong> aplicar ante incertidumbre (elecciones, alza tasas, caída demanda). Cada escenario simula impacto en liquidez del proyecto.
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-600">
            <tr>
              <th className="px-3 py-2 text-left">Escenario</th>
              <th className="px-3 py-2 text-left">Supuesto</th>
              <th className="px-3 py-2 text-right">Ingresos ajust.</th>
              <th className="px-3 py-2 text-right">Egresos ajust.</th>
              <th className="px-3 py-2 text-right">Impacto en liquidez</th>
              <th className="px-3 py-2 text-center">¿Cubre el colchón?</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map(r => (
              <tr key={r.id} className={`border-t border-stone-100 ${r.cubre ? "" : "bg-rose-50/30"}`}>
                <td className="px-3 py-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${COLOR_CLASS[r.color]}`}>{r.nombre}</span>
                </td>
                <td className="px-3 py-2 text-stone-700">{r.supuesto}</td>
                <td className="px-3 py-2 text-right font-mono">{fmtCop(r.ingresoAjustado)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmtCop(r.egresoAjustado)}</td>
                <td className={`px-3 py-2 text-right font-mono font-semibold ${r.impacto >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {fmtCop(r.impacto)}
                </td>
                <td className="px-3 py-2 text-center">
                  {r.cubre ? <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">✅ Sí</span>
                    : <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">❌ No</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-md border border-rose-200 bg-rose-50/40 p-3 text-[12px] text-rose-900">
        <strong>💡 Recomendaciones CFO de Control:</strong>
        <ol className="mt-1 list-decimal pl-5 space-y-0.5">
          <li>Si escenario Moderado ya rompe el colchón, hay que pre-negociar línea revolvente bancaria <strong>antes</strong> del PE.</li>
          <li>Stress test debe correrse mensualmente y compartirse con sponsors/banco como demostración de buen gobierno.</li>
          <li>Si Severo no se cubre, evaluar aporte extraordinario de socios <strong>antes</strong> de tocar el bridge loan.</li>
        </ol>
      </div>
    </div>
  );
};

export default Tesoreria;
