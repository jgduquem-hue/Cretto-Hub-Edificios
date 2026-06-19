import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Users, Megaphone, Target, Calendar, DollarSign,
  AlertTriangle, Award, Activity, ArrowRight, X, Printer, Building, Wallet,
  Mail, FileText, Sparkles, Info, Eye, BarChart3, Layers, ShoppingBag,
  CheckCircle2, ClockIcon, Clock, ArrowDown
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
  ComposedChart, ReferenceLine, ScatterChart, Scatter, RadialBarChart, RadialBar
} from "recharts";

/* ════════════════════════════════════════════════════════════════════════════
   Reportes Comerciales — Cretto
   Catálogo navegable de 12 reportes (8 internos + 4 cliente).
   Cada reporte: descripción + estructura + elementos gráficos + preview vivo.
   ════════════════════════════════════════════════════════════════════════════ */

const CRETTO_COLORS = {
  primary: "#1F3D2E", emerald: "#10b981", amber: "#f59e0b", rose: "#f43f5e",
  blue: "#3b82f6", violet: "#a855f7", indigo: "#6366f1", fuchsia: "#d946ef",
  pink: "#ec4899", stone: "#78716c"
};
const PIE_COLORS = ["#ec4899", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#6366f1", "#d946ef", "#06b6d4", "#84cc16"];

const fmtCop = (n) => {
  const v = Math.round(parseFloat(n) || 0);
  if (Math.abs(v) >= 1000000000) return "$" + (v / 1000000000).toFixed(2) + " MMM";
  if (Math.abs(v) >= 1000000) return "$" + Math.round(v / 1000000).toLocaleString("es-CO").replace(/,/g, ".") + " MM";
  return "$" + v.toLocaleString("es-CO").replace(/,/g, ".");
};
const fmtMM = (n) => "$" + Math.round(n).toLocaleString("es-CO").replace(/,/g, ".") + " MM";

/* ─── Probabilidad de cierre por fase del embudo (pipeline ponderado) ─── */
const PROB_FASE = {
  lead: 0.05, contactado: 0.10, calificado: 0.20, visita: 0.35,
  cotizacion: 0.50, negociacion: 0.65, reserva: 0.85, promesa: 0.95, cerrado: 1.0, perdido: 0
};

/* ════════════════════════════════════════════════════════════════════════════
   CATÁLOGO
   ════════════════════════════════════════════════════════════════════════════ */
export const REPORTES_CATALOGO = [
  /* ── INTERNOS ── */
  { id: "R1", grupo: "Internos", titulo: "Avance Preventas vs Punto de Equilibrio", icon: Target, color: "fuchsia",
    cuando: "Semanal · martes en comité",
    descripcion: `Mide qué tan cerca está el proyecto del **punto de equilibrio comercial** (60% preventas = 28/47 aptos en Casa 107). Sin PE, la fiducia no autoriza inicio de obra y los inversionistas no recuperan capital.

**Lectura clave**: número absoluto + velocidad de preventa (aptos/mes) → proyección de fecha de PE → comparación contra fecha presupuestada en el modelo financiero. Si la velocidad baja, alertar 8 semanas antes de impacto en cronograma de obra.`,
    estructura: ["Avance actual (vendidos + separados + reservados) / 28", "Velocidad de preventa (aptos/mes últimos 3 meses)", "Proyección fecha llegar a PE", "Gap vs fecha plan", "Recomendación de acción"],
    graficos: ["Gauge circular del % PE", "Barra apilada por estado", "Línea proyección cumplimiento", "Velocidad mes a mes"],
    audiencia: "Sponsor + Inversionistas + Director Comercial",
    preview: PreviewAvancePE
  },
  { id: "R2", grupo: "Internos", titulo: "Forecast 30 / 60 / 90 días", icon: TrendingUp, color: "blue",
    cuando: "Quincenal",
    descripcion: `Pipeline ponderado por probabilidad de cierre × valor. Da una proyección **realista** (no aspiracional) de cuánto se cerrará en 30, 60 y 90 días.

**Fórmula**: para cada lead activo, valor esperado = precioMM × probabilidad de la fase actual. La probabilidad va de 5% (lead nuevo) a 95% (promesa firmada). Suma agrupando por ventana temporal estimada.`,
    estructura: ["Pipeline ponderado total (suma de valores × probabilidad)", "Distribución por ventana 30/60/90", "Detalle por asesor", "Top 5 deals a cerrar", "Riesgos identificados"],
    graficos: ["Barras 30/60/90 (esperado vs comprometido)", "Top deals con probabilidad", "Acumulado por asesor"],
    audiencia: "Director Comercial + CFO",
    preview: PreviewForecast
  },
  { id: "R3", grupo: "Internos", titulo: "Performance por Asesor", icon: Users, color: "violet",
    cuando: "Mensual",
    descripcion: `Compara la productividad de los asesores comerciales. KPIs por persona: leads asignados, conversión (% que cierra), ticket promedio, días en pipeline, tiempo de respuesta.

**Para qué sirve**: identificar al mejor closer, decidir asignación de leads "premium" (score >80), detectar asesores que necesitan coaching o sobrecarga.`,
    estructura: ["Tabla con KPIs por asesor", "Ranking de conversión", "Ranking de ticket promedio", "Velocidad de respuesta", "Acciones recomendadas"],
    graficos: ["Barras conversión por asesor", "Scatter ticket promedio × volumen", "Embudo individual de cada uno"],
    audiencia: "Director Comercial + RRHH",
    preview: PreviewPerformanceAsesor
  },
  { id: "R4", grupo: "Internos", titulo: "CAC por canal de captación", icon: Megaphone, color: "amber",
    cuando: "Mensual",
    descripcion: `**Costo de Adquisición de Cliente** (Customer Acquisition Cost) por canal. Divide la inversión publicitaria de cada fuente entre los cerrados ganados que originaron.

**Para qué sirve**: decidir dónde invertir el próximo peso de marketing. Si Facebook tiene CAC $4MM y referidos $0, no es obvio que Facebook deba seguir si referidos puede escalarse.`,
    estructura: ["Inversión publicitaria por canal (input)", "Leads generados por canal", "Cerrados ganados por canal", "CAC = Inversión / cerrados", "ROI proyectado", "Recomendación de reasignación"],
    graficos: ["Pie inversión", "Pie cerrados", "Bar CAC por canal", "Funnel por fuente"],
    audiencia: "Gerencia Comercial + Marketing",
    preview: PreviewCACCanal
  },
  { id: "R5", grupo: "Internos", titulo: "Cohorte de Leads", icon: Calendar, color: "indigo",
    cuando: "Mensual",
    descripcion: `Agrupa leads por **mes de entrada** y rastrea su conversión a través del tiempo. Permite ver si los leads de marzo están convirtiendo mejor que los de mayo, y a qué velocidad.

**Para qué sirve**: detectar si el embudo se ha vuelto más lento, si la calidad de los leads cae, o si una campaña específica generó leads de mejor calidad.`,
    estructura: ["Matriz cohorte mes × meses post-entrada", "% conversión acumulada por cohorte", "Tiempo medio al cierre por cohorte", "Insights comparativos"],
    graficos: ["Heatmap cohorte", "Líneas de conversión acumulada"],
    audiencia: "Director Comercial",
    preview: PreviewCohorte
  },
  { id: "R6", grupo: "Internos", titulo: "Análisis de Embudo (cuello de botella)", icon: Activity, color: "rose",
    cuando: "Quincenal",
    descripcion: `Diagnostica **dónde se atascan los leads** en el embudo. Mide tiempo promedio en cada fase, tasa de pasada (conversion rate fase→fase), y leads "estancados" (> X días sin movimiento).

**Para qué sirve**: si "Cotización enviada" tiene 8 leads desde hace 3 semanas sin moverse, hay un problema (precio? competencia? falta de seguimiento?). Acción concreta: workflow automático de reactivación.`,
    estructura: ["Tiempo medio por fase", "Tasa de conversión entre fases", "Leads estancados > 14 días", "Causas comunes identificadas", "Plan de reactivación"],
    graficos: ["Embudo con drop-off rate", "Bar tiempo por fase", "Lista de leads estancados"],
    audiencia: "Director Comercial + Asesores",
    preview: PreviewEmbudoBottleneck
  },
  { id: "R7", grupo: "Internos", titulo: "Inventario Restante", icon: Building, color: "emerald",
    cuando: "Semanal",
    descripcion: `Muestra qué unidades quedan disponibles, agrupadas por tipología y piso. Calcula el valor del inventario restante y el mix de venta (qué tipologías son las más vendidas y cuáles podrían necesitar incentivos).

**Para qué sirve**: priorizar acciones de venta sobre tipologías rezagadas (descuentos, paquetes con parqueadero gratis), y planear lanzamiento de pre-venta para penthouses.`,
    estructura: ["Resumen vendidas vs disponibles por tipo", "Valor inventario restante", "Pisos con más disponibilidad", "Mix de venta vs presupuesto", "Tipologías a priorizar"],
    graficos: ["Bar stacked vendidas/disponibles por tipología", "Pie valor restante", "Heatmap por piso"],
    audiencia: "Director Comercial + Sponsor",
    preview: PreviewInventarioRestante
  },
  { id: "R8", grupo: "Internos", titulo: "Cartera y Mora", icon: Wallet, color: "orange",
    cuando: "Mensual",
    descripcion: `Estado de la cartera de clientes que firmaron promesa/reserva. Indica cuántos están al día, cuántos en mora, monto en riesgo, y proyección de recaudo.

**Para qué sirve**: detectar clientes con riesgo de desistir antes de escrituración, gestionar mora temprana, y proyectar caja real.`,
    estructura: ["KPIs cartera total", "Distribución al día / próximo / vencido", "Top deudores en mora", "Cuota promedio", "Recaudo esperado próximo mes"],
    graficos: ["Pie estado cartera", "Bar mora por antigüedad", "Línea recaudo histórico vs esperado"],
    audiencia: "Director Comercial + Tesorería",
    preview: PreviewCartera
  },

  /* ── CLIENTE ── */
  { id: "C1", grupo: "Cliente", titulo: "Cotización Formal de Apartamento", icon: FileText, color: "blue",
    cuando: "Al solicitar info de un apto específico · vigencia 15 días",
    descripcion: `Documento formal con toda la información del apartamento cotizado: características, precio, opciones de financiación, plan de pagos y datos del asesor responsable.

**Para qué sirve**: el cliente lo recibe por email/WhatsApp tras la primera visita seria. Tiene vigencia limitada (15 días normalmente) para generar urgencia. Es el primer paso formal hacia la promesa de compraventa.`,
    estructura: ["Encabezado Cretto + proyecto + fecha + vigencia", "Datos del cliente", "Características de la unidad (tipo, área, alcobas, baños, paquete acabados, parqueaderos, depósitos)", "Precio total + valor m²", "3 opciones de financiación (contado / 30-70 / 50-50)", "Plan de pagos detallado", "Fechas clave", "Asesor responsable + firma Cretto"],
    graficos: ["Tabla de precio desglosado", "Calendario visual de pagos", "Render del apto"],
    audiencia: "Prospecto (lead en fase cotización)",
    preview: PreviewCotizacion
  },
  { id: "C2", grupo: "Cliente", titulo: "Plan de Pagos Personalizado", icon: Calendar, color: "emerald",
    cuando: "Al firmar promesa · validez del contrato",
    descripcion: `Calendario completo de pagos del cliente con todas las cuotas, fechas, abonos extraordinarios y saldo proyectado. Es el documento de referencia mensual para el cliente.

**Para qué sirve**: el cliente tiene visibilidad clara de cuánto debe y cuándo. Reduce dudas y permite planear sus finanzas personales. Sustento legal del cronograma de pagos firmado.`,
    estructura: ["Resumen del compromiso (precio total, separación, cuota inicial, saldo crédito)", "Tabla cuotas mensuales con fechas, montos, abonos", "Saldo proyectado tras cada cuota", "Política de mora", "Datos de contacto Tesorería"],
    graficos: ["Línea saldo decreciente", "Bar mensual cuota", "Donut composición del pago total"],
    audiencia: "Cliente comprador (post-promesa)",
    preview: PreviewPlanPagos
  },
  { id: "C3", grupo: "Cliente", titulo: "Estado de Cuenta Mensual", icon: Wallet, color: "violet",
    cuando: "Mensual al corte (día 1)",
    descripcion: `Foto del estado de pagos del cliente: cuotas pagadas, próximas, saldo a la fecha. Se envía cada mes por email + WhatsApp.

**Para qué sirve**: transparencia mensual. El cliente ve qué ha pagado, qué le falta, y cuándo es su próximo pago. Construye confianza y reduce reclamos.`,
    estructura: ["Saldo a la fecha", "Cuotas pagadas (con fecha y monto)", "Próximas cuotas (3 siguientes)", "% avance del pago", "Próxima fecha de pago + link WhatsApp para preguntas"],
    graficos: ["Gauge % pagado", "Timeline pagos", "Próximas cuotas"],
    audiencia: "Cliente comprador",
    preview: PreviewEstadoCuenta
  },
  { id: "C4", grupo: "Cliente", titulo: "Newsletter de Avance de Obra", icon: Mail, color: "amber",
    cuando: "Mensual con fotos",
    descripcion: `Boletín mensual a clientes con fotos del avance de obra, hitos cumplidos, próximos hitos y mensaje del PM. Crea engagement y reduce ansiedad durante los 18 meses de obra.

**Para qué sirve**: el cliente firmó hace meses y la obra apenas empieza. Sin comunicación regular, se siente abandonado y empieza a llamar. Este boletín mantiene la relación viva y muestra que el proyecto avanza según lo prometido.`,
    estructura: ["Saludo del PM (1 párrafo)", "% avance físico vs financiero", "Hitos cumplidos este mes", "Próximos hitos (mes siguiente)", "4-6 fotos de obra", "Fecha proyectada de entrega", "Link a sala de ventas para visitas"],
    graficos: ["Barra de avance", "Galería de fotos", "Mini timeline de hitos"],
    audiencia: "Clientes compradores (escriturados + en cartera)",
    preview: PreviewNewsletterObra
  }
];

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — Catálogo navegable
   ════════════════════════════════════════════════════════════════════════════ */
const ReportesComercial = ({ project }) => {
  const [audiencia, setAudiencia] = useState("Internos");
  const [seleccionado, setSeleccionado] = useState(null);
  const [leads, setLeads] = useState([]);
  const [unidades, setUnidades] = useState([]);

  /* Leer leads + inventario del storage */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r1 = await window.storage.get(`crettohub:crm-leads:${project?.id || "default"}`);
        if (m && r1 && r1.value) setLeads(JSON.parse(r1.value));
        const r2 = await window.storage.get(`crettohub:inventario:${project?.id || "default"}`);
        if (m && r2 && r2.value) setUnidades(JSON.parse(r2.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  const reportesFiltrados = REPORTES_CATALOGO.filter(r => r.grupo === audiencia);

  if (seleccionado) {
    return <ReporteDetalle reporte={seleccionado} project={project} leads={leads} unidades={unidades} onBack={() => setSeleccionado(null)} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-5">
        <div className="text-[10px] uppercase tracking-[0.15em] text-fuchsia-600">Reportes Comerciales · {project?.nombre || ""}</div>
        <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Catálogo de informes</h1>
        <p className="mt-1 text-sm text-stone-500">
          {REPORTES_CATALOGO.length} reportes · {REPORTES_CATALOGO.filter(r => r.grupo === "Internos").length} internos · {REPORTES_CATALOGO.filter(r => r.grupo === "Cliente").length} para cliente
        </p>
      </header>

      {/* Toggle audiencia */}
      <div className="mb-5 inline-flex rounded-lg border border-stone-200 bg-white p-1">
        {["Internos", "Cliente"].map(a => (
          <button key={a} onClick={() => setAudiencia(a)} className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-all ${audiencia === a ? "bg-fuchsia-700 text-white" : "text-stone-600 hover:bg-stone-100"}`}>
            {a === "Internos" ? "🏢" : "👤"} {a === "Internos" ? "Reportes Internos" : "Documentos al Cliente"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {reportesFiltrados.map(r => {
          const Ic = r.icon;
          return (
            <button key={r.id} onClick={() => setSeleccionado(r)} className="group rounded-xl border border-stone-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-fuchsia-300 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${r.color}-50 text-${r.color}-700`}>
                  <Ic className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-700">{r.id}</span>
              </div>
              <h3 className="mt-3 font-serif text-[16px] leading-tight tracking-tight text-stone-900">{r.titulo}</h3>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-stone-600">{r.descripcion.split("\n")[0]}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-stone-500">
                <span className="rounded bg-stone-100 px-1.5 py-0.5">{r.cuando}</span>
                <ArrowRight className="h-3 w-3 text-stone-400 group-hover:translate-x-0.5 group-hover:text-fuchsia-700 transition-all" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   DETALLE DE REPORTE
   ════════════════════════════════════════════════════════════════════════════ */
const ReporteDetalle = ({ reporte, project, leads, unidades, onBack }) => {
  const [tab, setTab] = useState("descripcion");
  const Ic = reporte.icon;
  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-fuchsia-700">← Volver al catálogo</button>

      <header className={`mb-4 rounded-lg border border-${reporte.color}-200 bg-${reporte.color}-50/50 p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg border border-stone-200 bg-white text-${reporte.color}-700`}>
              <Ic className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-stone-200 px-2 py-0.5 font-mono text-[10px] font-bold">{reporte.id}</span>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px]">{reporte.grupo}</span>
              </div>
              <h1 className="mt-1 font-serif text-2xl text-stone-900">{reporte.titulo}</h1>
              <p className="text-[12px] italic text-stone-500">📅 {reporte.cuando} · 👥 {reporte.audiencia}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">
              <Printer className="h-3.5 w-3.5" /> Imprimir
            </button>
            <button onClick={() => setTab("preview")} className="inline-flex items-center gap-1.5 rounded-md bg-fuchsia-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-fuchsia-800">
              <Sparkles className="h-3.5 w-3.5" /> Generar reporte
            </button>
          </div>
        </div>
      </header>

      <div className="mb-4 flex border-b border-stone-200">
        {[
          { id: "descripcion", label: "Descripción" },
          { id: "estructura",  label: "Estructura recomendada" },
          { id: "graficos",    label: "Elementos gráficos" },
          { id: "preview",     label: "✨ Reporte en vivo" }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`-mb-px border-b-2 px-4 py-2 text-[12px] font-medium ${tab === t.id ? "border-fuchsia-700 text-fuchsia-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "descripcion" && (
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="prose prose-sm max-w-none text-[14px] leading-relaxed text-stone-800">
            {reporte.descripcion.split("\n\n").map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
            ))}
          </div>
        </div>
      )}
      {tab === "estructura" && (
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h3 className="mb-3 font-serif text-lg">📋 Estructura recomendada</h3>
          <ol className="list-decimal space-y-1.5 pl-5 text-[13px] text-stone-800">
            {reporte.estructura.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}
      {tab === "graficos" && (
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h3 className="mb-3 font-serif text-lg">📊 Elementos gráficos</h3>
          <ul className="space-y-2">
            {reporte.graficos.map((g, i) => (
              <li key={i} className="flex items-start gap-2 rounded-md border border-stone-200 bg-stone-50/50 p-2">
                <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-fuchsia-700" />
                <span className="text-[13px]">{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {tab === "preview" && reporte.preview && (
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-lg">✨ Reporte con datos de {project?.nombre}</h3>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">Datos en vivo</span>
          </div>
          {React.createElement(reporte.preview, { project, leads, unidades })}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   PREVIEWS — funciones por reporte
   ════════════════════════════════════════════════════════════════════════════ */

function ReporteHeader({ project, titulo, subtitulo }) {
  return (
    <div className="mb-4 rounded-md border-l-4 border-fuchsia-700 bg-stone-50 p-3">
      <div className="text-[10px] uppercase tracking-wider text-fuchsia-700">Cretto · {project?.nombre}</div>
      <div className="font-serif text-lg text-stone-900">{titulo}</div>
      {subtitulo && <div className="text-[11px] text-stone-500">{subtitulo}</div>}
      <div className="mt-1 text-[10px] text-stone-500">Generado: {new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}</div>
    </div>
  );
}
function ReporteFooter() {
  return <div className="mt-6 border-t border-stone-200 pt-3 text-center text-[10px] text-stone-500">Cretto · Gerencia Comercial</div>;
}
function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3 mb-3">
      <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">{title}</h4>
      {children}
    </div>
  );
}
function Kpi({ label, value, sub, color = "stone" }) {
  const colors = {
    stone: "bg-stone-50 border-stone-200 text-stone-800",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    rose: "bg-rose-50 border-rose-200 text-rose-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    fuchsia: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800",
    violet: "bg-violet-50 border-violet-200 text-violet-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800"
  };
  return (
    <div className={`rounded-lg border p-2 ${colors[color]}`}>
      <div className="text-[9px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold">{value}</div>
      {sub && <div className="text-[9px] opacity-70">{sub}</div>}
    </div>
  );
}

/* ─── R1: Avance Preventas vs PE ─── */
function PreviewAvancePE({ project, leads, unidades }) {
  const PE = 28;
  const vendidas = unidades.filter(u => u.estado === "vendida").length;
  const separadas = unidades.filter(u => u.estado === "separada").length;
  const reservadas = unidades.filter(u => u.estado === "reservada").length;
  const preventas = vendidas + separadas + reservadas;
  const pctPE = (preventas / PE) * 100;
  const faltantes = Math.max(0, PE - preventas);

  /* Velocidad histórica simulada: últimos 4 meses */
  const velocidad = [
    { mes: "Mar", aptos: 2, acum: 2 },
    { mes: "Abr", aptos: 4, acum: 6 },
    { mes: "May", aptos: 5, acum: 11 },
    { mes: "Jun", aptos: preventas - 11, acum: preventas }
  ];
  const velocidadProm = preventas / 4; // aptos/mes
  const mesesFaltantes = velocidadProm > 0 ? faltantes / velocidadProm : 99;

  return (
    <div className="space-y-3 text-[12px]">
      <ReporteHeader project={project} titulo="Avance de Preventas hacia Punto de Equilibrio" subtitulo="Reporte semanal de gerencia comercial" />

      <Section title="KPIs ejecutivos">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Kpi label="Preventas actuales" value={`${preventas} / ${PE}`} sub={`${pctPE.toFixed(0)}% del PE`} color="fuchsia" />
          <Kpi label="Faltantes para PE" value={faltantes} sub="aptos" color="amber" />
          <Kpi label="Velocidad" value={`${velocidadProm.toFixed(1)}/mes`} sub="últimos 4 meses" color="blue" />
          <Kpi label="ETA punto equilibrio" value={mesesFaltantes < 99 ? `${mesesFaltantes.toFixed(1)} meses` : "—"} sub="al ritmo actual" color={mesesFaltantes < 4 ? "emerald" : mesesFaltantes < 8 ? "amber" : "rose"} />
        </div>
      </Section>

      <Section title="Distribución de las preventas">
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={[{ name: "Avance", vendidas, separadas, reservadas, faltantes }]} layout="vertical" stackOffset="expand">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="vendidas" stackId="a" fill={CRETTO_COLORS.violet} name="Vendidas" />
            <Bar dataKey="separadas" stackId="a" fill="#f97316" name="Separadas" />
            <Bar dataKey="reservadas" stackId="a" fill={CRETTO_COLORS.amber} name="Reservadas" />
            <Bar dataKey="faltantes" stackId="a" fill="#e7e5e4" name="Faltantes" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Velocidad mes a mes (acumulado)">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={velocidad}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="aptos" fill={CRETTO_COLORS.fuchsia} name="Aptos del mes" />
            <Line type="monotone" dataKey="acum" stroke={CRETTO_COLORS.primary} strokeWidth={2} name="Acumulado" />
            <ReferenceLine y={PE} stroke="#dc2626" strokeDasharray="3 3" label={{ value: `PE: ${PE}`, fontSize: 10, fill: "#dc2626" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Section>

      <div className={`rounded-md border p-3 ${mesesFaltantes < 4 ? "border-emerald-200 bg-emerald-50 text-emerald-900" : mesesFaltantes < 8 ? "border-amber-200 bg-amber-50 text-amber-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}>
        <strong>🎯 Recomendación PM:</strong> {mesesFaltantes < 4
          ? "Vamos según plan. Mantener ritmo y blindar promesas de cierre."
          : mesesFaltantes < 8
          ? "Velocidad insuficiente. Considerar campaña referidos + descuento por separación rápida."
          : "Alerta: punto de equilibrio en riesgo. Evaluar precio, ajustar tipologías rezagadas, escalar inversión en canales con mejor CAC."}
      </div>
      <ReporteFooter />
    </div>
  );
}

/* ─── R2: Forecast 30/60/90 ─── */
function PreviewForecast({ project, leads, unidades }) {
  const activos = leads.filter(l => !["cerrado", "perdido"].includes(l.fase));

  const ponderado = activos.reduce((acc, l) => {
    const p = PROB_FASE[l.fase] || 0;
    const valor = l.presupuestoMM * p;
    if (["promesa", "reserva"].includes(l.fase)) acc.dias30 += valor;
    else if (["negociacion", "cotizacion"].includes(l.fase)) acc.dias60 += valor;
    else acc.dias90 += valor;
    acc.total += valor;
    return acc;
  }, { dias30: 0, dias60: 0, dias90: 0, total: 0 });

  const topDeals = activos.slice().sort((a, b) => (b.presupuestoMM * (PROB_FASE[b.fase] || 0)) - (a.presupuestoMM * (PROB_FASE[a.fase] || 0))).slice(0, 5);

  return (
    <div className="space-y-3 text-[12px]">
      <ReporteHeader project={project} titulo="Forecast 30 / 60 / 90 días" subtitulo="Pipeline ponderado por probabilidad de cierre" />

      <Section title="Pipeline ponderado">
        <div className="grid grid-cols-3 gap-2">
          <Kpi label="30 días" value={fmtMM(ponderado.dias30)} sub="alta probabilidad" color="emerald" />
          <Kpi label="60 días" value={fmtMM(ponderado.dias60)} sub="negociación" color="amber" />
          <Kpi label="90 días" value={fmtMM(ponderado.dias90)} sub="prospección" color="blue" />
        </div>
        <div className="mt-2 rounded-md bg-stone-50 p-2 text-center">
          <div className="text-[10px] uppercase text-stone-500">Pipeline ponderado total</div>
          <div className="font-serif text-2xl font-bold text-fuchsia-700">{fmtMM(ponderado.total)}</div>
        </div>
      </Section>

      <Section title="Top 5 deals a cerrar (ordenados por valor esperado)">
        <table className="w-full text-[11px]">
          <thead className="text-[9px] uppercase text-stone-500">
            <tr className="border-b"><th className="px-2 py-1 text-left">Lead</th><th className="text-left">Fase</th><th className="text-right">Valor</th><th className="text-center">Prob</th><th className="text-right">Esperado</th></tr>
          </thead>
          <tbody>
            {topDeals.map(d => (
              <tr key={d.id} className="border-b border-stone-100">
                <td className="px-2 py-1.5 font-medium">{d.nombre}</td>
                <td className="text-[10px]">{d.fase}</td>
                <td className="text-right font-mono">${d.presupuestoMM} MM</td>
                <td className="text-center text-[10px]">{((PROB_FASE[d.fase] || 0) * 100).toFixed(0)}%</td>
                <td className="text-right font-mono font-semibold">{fmtMM(d.presupuestoMM * (PROB_FASE[d.fase] || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <ReporteFooter />
    </div>
  );
}

/* ─── R3: Performance por asesor ─── */
function PreviewPerformanceAsesor({ project, leads }) {
  const ASESORES = [...new Set(leads.map(l => l.asesor))].filter(Boolean);
  const data = ASESORES.map(a => {
    const ls = leads.filter(l => l.asesor === a);
    const cerrados = ls.filter(l => l.fase === "cerrado");
    const perdidos = ls.filter(l => l.fase === "perdido");
    const activos = ls.length - cerrados.length - perdidos.length;
    const conversion = ls.length ? (cerrados.length / ls.length) * 100 : 0;
    const ticketProm = cerrados.length ? cerrados.reduce((s, l) => s + l.presupuestoMM, 0) / cerrados.length : 0;
    return {
      asesor: a,
      leads: ls.length,
      activos,
      cerrados: cerrados.length,
      perdidos: perdidos.length,
      conversion,
      ticketProm,
      ventasMM: cerrados.reduce((s, l) => s + l.presupuestoMM, 0)
    };
  });

  return (
    <div className="space-y-3 text-[12px]">
      <ReporteHeader project={project} titulo="Performance por Asesor Comercial" subtitulo="KPIs mensuales individuales" />

      <Section title="Comparativo por asesor">
        <table className="w-full text-[11px]">
          <thead className="text-[9px] uppercase text-stone-500">
            <tr className="border-b">
              <th className="px-2 py-1 text-left">Asesor</th>
              <th className="text-center">Leads</th>
              <th className="text-center">Activos</th>
              <th className="text-center">Cerrados</th>
              <th className="text-center">Conversión</th>
              <th className="text-right">Ticket Prom.</th>
              <th className="text-right">Ventas</th>
            </tr>
          </thead>
          <tbody>
            {data.sort((a, b) => b.conversion - a.conversion).map((a, i) => (
              <tr key={a.asesor} className="border-b border-stone-100">
                <td className="px-2 py-1.5 font-medium">
                  {i === 0 && "🏆 "}{a.asesor}
                </td>
                <td className="text-center">{a.leads}</td>
                <td className="text-center">{a.activos}</td>
                <td className="text-center">{a.cerrados}</td>
                <td className="text-center font-mono"><span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${a.conversion > 20 ? "bg-emerald-100 text-emerald-800" : a.conversion > 10 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>{a.conversion.toFixed(0)}%</span></td>
                <td className="text-right font-mono">{a.ticketProm ? fmtMM(a.ticketProm) : "—"}</td>
                <td className="text-right font-mono font-semibold">{fmtMM(a.ventasMM)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Volumen activo vs cerrados">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="asesor" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="activos" fill={CRETTO_COLORS.violet} name="Activos" />
            <Bar dataKey="cerrados" fill={CRETTO_COLORS.emerald} name="Cerrados" />
          </BarChart>
        </ResponsiveContainer>
      </Section>
      <ReporteFooter />
    </div>
  );
}

/* ─── R4: CAC por canal ─── */
function PreviewCACCanal({ project, leads }) {
  /* Asumir inversiones mensuales por canal (input editable luego) */
  const INVERSION = {
    facebook: 8000000, instagram: 6000000, tiktok: 4000000, google: 5000000,
    "sala-ventas": 2000000, portal: 3000000, referido: 0, whatsapp: 0, evento: 5000000, email: 1000000, inmobiliaria: 0
  };

  const fuentes = [...new Set(leads.map(l => l.fuente))];
  const data = fuentes.map(f => {
    const ls = leads.filter(l => l.fuente === f);
    const cerrados = ls.filter(l => l.fase === "cerrado").length;
    const inv = INVERSION[f] || 0;
    return {
      fuente: f, leads: ls.length, cerrados, inversion: inv,
      cac: cerrados ? inv / cerrados / 1000000 : (inv ? 999 : 0),
      ventasMM: ls.filter(l => l.fase === "cerrado").reduce((s, l) => s + l.presupuestoMM, 0)
    };
  });

  return (
    <div className="space-y-3 text-[12px]">
      <ReporteHeader project={project} titulo="CAC por canal de captación" subtitulo="Costo de adquisición de cliente · análisis mensual" />

      <Section title="Resumen por canal">
        <table className="w-full text-[11px]">
          <thead className="text-[9px] uppercase text-stone-500">
            <tr className="border-b"><th className="px-2 py-1 text-left">Canal</th><th className="text-right">Inversión</th><th className="text-center">Leads</th><th className="text-center">Cerrados</th><th className="text-right">CAC</th><th className="text-right">Ventas</th><th className="text-right">ROI</th></tr>
          </thead>
          <tbody>
            {data.sort((a, b) => (a.cac || 999) - (b.cac || 999)).map(d => {
              const roi = d.inversion ? ((d.ventasMM * 1000000 - d.inversion) / d.inversion * 100) : 0;
              return (
                <tr key={d.fuente} className="border-b border-stone-100">
                  <td className="px-2 py-1.5 font-medium">{d.fuente}</td>
                  <td className="text-right font-mono">{fmtCop(d.inversion)}</td>
                  <td className="text-center">{d.leads}</td>
                  <td className="text-center">{d.cerrados}</td>
                  <td className="text-right font-mono"><span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${d.cac === 0 ? "bg-emerald-100 text-emerald-800" : d.cac < 5 ? "bg-emerald-100 text-emerald-800" : d.cac < 15 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>{d.cac === 0 ? "Gratis" : `$${d.cac.toFixed(1)} MM`}</span></td>
                  <td className="text-right font-mono">{fmtMM(d.ventasMM)}</td>
                  <td className="text-right font-mono">{d.inversion ? `${roi.toFixed(0)}%` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
        <strong>💡 Insight comercial:</strong> los canales sin costo (referidos, WhatsApp directo) tienen el mejor ROI por definición. Antes de subir inversión en Facebook/Instagram, evaluar lanzar programa de referidos con incentivo de $X MM por referido escriturado.
      </div>
      <ReporteFooter />
    </div>
  );
}

/* ─── R5: Cohorte (heatmap simulado) ─── */
function PreviewCohorte({ project, leads }) {
  const cohortes = [
    { mes: "Mar 2026", entrados: 12, m0: 0, m1: 8, m2: 12, m3: 16, conv: 16 },
    { mes: "Abr 2026", entrados: 14, m0: 0, m1: 7, m2: 14, m3: null, conv: 14 },
    { mes: "May 2026", entrados: 16, m0: 0, m1: 6, m2: null, m3: null, conv: 6 },
    { mes: "Jun 2026", entrados: leads.filter(l => l.fechaCreacion?.startsWith("2026-06")).length, m0: 0, m1: null, m2: null, m3: null, conv: 0 }
  ];

  return (
    <div className="space-y-3 text-[12px]">
      <ReporteHeader project={project} titulo="Cohorte de leads · conversión a lo largo del tiempo" subtitulo="Mide qué tan bien convierten los leads agrupados por mes de entrada" />

      <Section title="Tabla de cohorte (% conversión acumulada)">
        <table className="w-full text-[11px]">
          <thead className="text-[9px] uppercase text-stone-500">
            <tr className="border-b"><th className="px-2 py-1 text-left">Cohorte</th><th className="text-center">Entrados</th><th className="text-center">Mes 0</th><th className="text-center">Mes 1</th><th className="text-center">Mes 2</th><th className="text-center">Mes 3</th></tr>
          </thead>
          <tbody>
            {cohortes.map(c => (
              <tr key={c.mes} className="border-b border-stone-100">
                <td className="px-2 py-1.5 font-medium">{c.mes}</td>
                <td className="text-center">{c.entrados}</td>
                {[c.m0, c.m1, c.m2, c.m3].map((v, i) => (
                  <td key={i} className="text-center">
                    {v != null ? <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${v === 0 ? "bg-stone-100 text-stone-500" : v < 10 ? "bg-rose-100 text-rose-700" : v < 20 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{v}%</span> : <span className="text-stone-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-[11px] text-blue-900">
        <strong>📈 Lectura:</strong> los leads de marzo convirtieron 16% en 3 meses. Los de abril van 14% en 2 meses (ritmo similar). Los de mayo y junio aún están temprano en el ciclo — se evaluarán en próximos reportes.
      </div>
      <ReporteFooter />
    </div>
  );
}

/* ─── R6: Embudo bottleneck ─── */
function PreviewEmbudoBottleneck({ project, leads }) {
  const FASES = ["lead", "contactado", "calificado", "visita", "cotizacion", "negociacion", "reserva", "promesa", "cerrado"];
  const data = FASES.map(f => ({
    fase: f, leads: leads.filter(l => l.fase === f).length,
    tiempoProm: f === "cotizacion" ? 18 : f === "calificado" ? 12 : f === "visita" ? 8 : f === "negociacion" ? 14 : 6 // días simulados
  }));

  return (
    <div className="space-y-3 text-[12px]">
      <ReporteHeader project={project} titulo="Análisis del embudo · diagnóstico de cuellos de botella" subtitulo="Tiempo medio por fase y leads estancados" />

      <Section title="Tiempo medio por fase (días)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fase" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 10 }} unit="d" />
            <Tooltip />
            <Bar dataKey="tiempoProm" fill={CRETTO_COLORS.rose} />
            <ReferenceLine y={14} stroke="#f97316" strokeDasharray="3 3" label={{ value: "Alerta 14d", fontSize: 10 }} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="🚨 Leads estancados (>14 días sin movimiento)">
        <div className="text-[11px]">
          Identificados <strong>{leads.filter(l => l.fase === "cotizacion").length} leads en fase Cotización</strong> que requieren reactivación inmediata. Workflow sugerido:
          <ol className="mt-1 list-decimal pl-5">
            <li>Día 7: WhatsApp con descuento de $5MM por reserva en 5 días</li>
            <li>Día 14: llamada del asesor + ajuste de oferta</li>
            <li>Día 21: mover a "perdido" si no responde + análisis razón</li>
          </ol>
        </div>
      </Section>
      <ReporteFooter />
    </div>
  );
}

/* ─── R7: Inventario restante ─── */
function PreviewInventarioRestante({ project, unidades }) {
  const TIPOS = ["A", "B", "C", "D", "PH"];
  const data = TIPOS.map(t => {
    const u = unidades.filter(x => x.tipo === t);
    return {
      tipo: t,
      total: u.length,
      disponibles: u.filter(x => x.estado === "disponible").length,
      vendidas: u.filter(x => x.estado === "vendida").length,
      valorRest: u.filter(x => x.estado === "disponible").reduce((s, x) => s + x.precioMM, 0)
    };
  }).filter(x => x.total > 0);

  const valorTotalRest = data.reduce((s, x) => s + x.valorRest, 0);

  return (
    <div className="space-y-3 text-[12px]">
      <ReporteHeader project={project} titulo="Inventario restante · análisis del mix de venta" subtitulo="Qué tipologías quedan, valor del inventario disponible" />

      <Section title="Resumen">
        <div className="grid grid-cols-4 gap-2">
          <Kpi label="Total inventario" value={unidades.length} color="stone" />
          <Kpi label="Disponibles" value={unidades.filter(u => u.estado === "disponible").length} sub={`${(unidades.filter(u => u.estado === "disponible").length / unidades.length * 100).toFixed(0)}%`} color="emerald" />
          <Kpi label="Valor restante" value={fmtMM(valorTotalRest)} color="fuchsia" />
          <Kpi label="Tipologías" value={data.length} color="indigo" />
        </div>
      </Section>

      <Section title="Disponibles vs vendidas por tipología">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tipo" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="vendidas" stackId="a" fill={CRETTO_COLORS.violet} name="Vendidas" />
            <Bar dataKey="disponibles" stackId="a" fill={CRETTO_COLORS.emerald} name="Disponibles" />
          </BarChart>
        </ResponsiveContainer>
      </Section>
      <ReporteFooter />
    </div>
  );
}

/* ─── R8: Cartera y mora ─── */
function PreviewCartera({ project, leads }) {
  /* Mock cartera */
  const enCartera = leads.filter(l => ["reserva", "promesa", "cerrado"].includes(l.fase));
  const totalCarteraMM = enCartera.reduce((s, l) => s + l.presupuestoMM, 0);
  const estados = [
    { label: "Al día", count: Math.floor(enCartera.length * 0.7), color: CRETTO_COLORS.emerald },
    { label: "Próximo vence", count: Math.floor(enCartera.length * 0.2), color: CRETTO_COLORS.amber },
    { label: "En mora", count: Math.ceil(enCartera.length * 0.1), color: CRETTO_COLORS.rose }
  ];

  return (
    <div className="space-y-3 text-[12px]">
      <ReporteHeader project={project} titulo="Cartera y mora · estado de los compromisos de pago" subtitulo="Reporte mensual de gestión de cobranza" />

      <Section title="Estado de la cartera">
        <div className="grid grid-cols-4 gap-2">
          <Kpi label="Clientes en cartera" value={enCartera.length} color="indigo" />
          <Kpi label="Valor total" value={fmtMM(totalCarteraMM)} color="fuchsia" />
          <Kpi label="Al día" value={estados[0].count} sub={`${(estados[0].count/enCartera.length*100).toFixed(0)}%`} color="emerald" />
          <Kpi label="En mora" value={estados[2].count} sub="acción inmediata" color="rose" />
        </div>
      </Section>

      <Section title="Distribución de estado">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={estados} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
              {estados.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </Section>
      <ReporteFooter />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   DOCUMENTOS CLIENTE
   ════════════════════════════════════════════════════════════════════════════ */

/* ─── C1: Cotización formal ─── */
function PreviewCotizacion({ project, leads, unidades }) {
  const u = unidades[0] || { numero: "302", tipo: "B", areaM2: 74, alcobas: 2, banos: 2, precioMM: 1100, parqueaderos: ["P15"], depositos: ["D15"] };
  const fechaVigencia = new Date(Date.now() + 15 * 86400000).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="space-y-3 text-[12px]">
      <div className="border-l-4 border-fuchsia-700 bg-stone-50 p-3 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-fuchsia-700">Cretto · {project?.nombre}</div>
        <div className="font-serif text-2xl text-stone-900">Cotización Formal</div>
        <div className="text-[11px] text-stone-500">N° COT-2026-001 · Vigencia hasta {fechaVigencia}</div>
      </div>

      <Section title="Cliente">
        <div className="text-[12px]"><strong>Sr/a. Felipe Acosta</strong> · facosta@empresa.co · +57 319 666 7777</div>
      </Section>

      <Section title={`Apartamento ${u.numero} — Tipo ${u.tipo}`}>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div><strong>Área:</strong> {u.areaM2} m²</div>
          <div><strong>Alcobas:</strong> {u.alcobas}</div>
          <div><strong>Baños:</strong> {u.banos}</div>
          <div><strong>Parqueadero:</strong> {u.parqueaderos?.[0] || "—"}</div>
          <div><strong>Depósito:</strong> {u.depositos?.[0] || "—"}</div>
          <div><strong>Acabados:</strong> Standard incluido</div>
        </div>
      </Section>

      <Section title="Inversión total">
        <div className="text-center my-3">
          <div className="text-[11px] text-stone-500">Precio total</div>
          <div className="font-serif text-3xl font-bold text-fuchsia-700">{fmtMM(u.precioMM)}</div>
          <div className="text-[11px] text-stone-500">${(u.precioMM / u.areaM2 * 1000000).toLocaleString("es-CO").replace(/,/g, ".")} / m²</div>
        </div>
      </Section>

      <Section title="Opciones de financiación">
        <table className="w-full text-[11px]">
          <thead className="text-[9px] uppercase text-stone-500"><tr className="border-b"><th className="px-2 py-1 text-left">Plan</th><th>Separación</th><th>Cuota inicial</th><th>Saldo a crédito</th></tr></thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">Contado (4% dto)</td><td className="text-center">$30 MM</td><td className="text-center">{fmtMM(u.precioMM * 0.96 - 30)}</td><td className="text-center">—</td></tr>
            <tr className="border-b"><td className="px-2 py-1">30/70</td><td className="text-center">$30 MM</td><td className="text-center">{fmtMM(u.precioMM * 0.3 - 30)}</td><td className="text-center">{fmtMM(u.precioMM * 0.7)}</td></tr>
            <tr className="border-b"><td className="px-2 py-1">50/50</td><td className="text-center">$30 MM</td><td className="text-center">{fmtMM(u.precioMM * 0.5 - 30)}</td><td className="text-center">{fmtMM(u.precioMM * 0.5)}</td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="Asesor comercial">
        <div className="text-[12px]"><strong>Maria Fernanda Arango</strong> · +57 310 555 0003 · paola@cretto.co</div>
      </Section>

      <div className="mt-4 text-center text-[10px] italic text-stone-500">Cotización con vigencia limitada. Sujeta a disponibilidad. Cretto - Expanding Brands.</div>
    </div>
  );
}

/* ─── C2: Plan de pagos ─── */
function PreviewPlanPagos({ project, leads, unidades }) {
  const u = unidades[0];
  const precio = u?.precioMM || 1100;
  const cuotaInicial = precio * 0.3;
  const numCuotas = 18;
  const cuotaMensual = cuotaInicial / numCuotas;
  const credito = precio * 0.7;

  const cuotas = Array.from({ length: 6 }, (_, i) => ({
    nro: i + 1,
    fecha: new Date(2026, 6 + i, 5).toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
    monto: cuotaMensual,
    pagada: i < 2
  }));

  return (
    <div className="space-y-3 text-[12px]">
      <div className="border-l-4 border-emerald-700 bg-stone-50 p-3 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-emerald-700">Cretto · {project?.nombre}</div>
        <div className="font-serif text-2xl text-stone-900">Plan de Pagos · Apto {u?.numero || "302"}</div>
      </div>

      <Section title="Compromiso total">
        <div className="grid grid-cols-3 gap-2">
          <Kpi label="Precio total" value={fmtMM(precio)} color="stone" />
          <Kpi label="Cuota inicial (30%)" value={fmtMM(cuotaInicial)} color="emerald" />
          <Kpi label="Crédito hipotecario" value={fmtMM(credito)} sub="a la entrega" color="blue" />
        </div>
      </Section>

      <Section title={`Cuota mensual: ${fmtMM(cuotaMensual)} · ${numCuotas} cuotas`}>
        <table className="w-full text-[11px]">
          <thead className="text-[9px] uppercase text-stone-500"><tr className="border-b"><th>Cuota #</th><th className="text-left">Fecha</th><th className="text-right">Monto</th><th>Estado</th></tr></thead>
          <tbody>
            {cuotas.map(c => (
              <tr key={c.nro} className="border-b">
                <td className="text-center font-mono">{c.nro}</td>
                <td className="text-left">{c.fecha}</td>
                <td className="text-right font-mono">{fmtMM(c.monto)}</td>
                <td className="text-center">{c.pagada ? <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">✓ Pagada</span> : <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] text-stone-700">Pendiente</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[10px] text-amber-900">
        💡 Política de mora: cargo del 1.5% mensual sobre cuota vencida. Tras 60 días en mora, se inicia gestión legal de incumplimiento.
      </div>
    </div>
  );
}

/* ─── C3: Estado de cuenta ─── */
function PreviewEstadoCuenta({ project }) {
  return (
    <div className="space-y-3 text-[12px]">
      <div className="border-l-4 border-violet-700 bg-stone-50 p-3 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-violet-700">Cretto · {project?.nombre}</div>
        <div className="font-serif text-2xl text-stone-900">Estado de Cuenta</div>
        <div className="text-[11px] text-stone-500">Apto 304 · Sra. Liliana Mosquera · Junio 2026</div>
      </div>

      <Section title="Resumen">
        <div className="grid grid-cols-3 gap-2">
          <Kpi label="Precio total" value="$1.100 MM" color="stone" />
          <Kpi label="Pagado" value="$330 MM" sub="30% completado" color="emerald" />
          <Kpi label="Saldo pendiente" value="$770 MM" sub="crédito hipotecario" color="amber" />
        </div>
      </Section>

      <Section title="Cuotas pagadas (últimas 3)">
        <table className="w-full text-[11px]">
          <tbody>
            <tr className="border-b"><td className="px-2 py-1.5">Cuota #5 · 05-jun-2026</td><td className="text-right font-mono">$18 MM</td><td className="text-emerald-600">✓</td></tr>
            <tr className="border-b"><td className="px-2 py-1.5">Cuota #4 · 05-may-2026</td><td className="text-right font-mono">$18 MM</td><td className="text-emerald-600">✓</td></tr>
            <tr className="border-b"><td className="px-2 py-1.5">Cuota #3 · 05-abr-2026</td><td className="text-right font-mono">$18 MM</td><td className="text-emerald-600">✓</td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="Próximas cuotas">
        <table className="w-full text-[11px]">
          <tbody>
            <tr className="border-b bg-amber-50/50"><td className="px-2 py-1.5"><strong>Cuota #6 · 05-jul-2026</strong></td><td className="text-right font-mono"><strong>$18 MM</strong></td><td>⏰ próxima</td></tr>
            <tr className="border-b"><td className="px-2 py-1.5">Cuota #7 · 05-ago-2026</td><td className="text-right font-mono">$18 MM</td><td>—</td></tr>
            <tr className="border-b"><td className="px-2 py-1.5">Cuota #8 · 05-sep-2026</td><td className="text-right font-mono">$18 MM</td><td>—</td></tr>
          </tbody>
        </table>
      </Section>

      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-900">
        ¿Dudas? Escribe a tu asesora <strong>Paola Lima</strong> al WhatsApp <strong>+57 310 555 0001</strong>. Estamos para ayudarte.
      </div>
    </div>
  );
}

/* ─── C4: Newsletter avance ─── */
function PreviewNewsletterObra({ project }) {
  return (
    <div className="space-y-3 text-[12px]">
      <div className="border-l-4 border-amber-700 bg-amber-50/40 p-3 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-amber-700">Cretto · {project?.nombre} · Newsletter mensual</div>
        <div className="font-serif text-2xl text-stone-900">¡Tu hogar avanza! · Junio 2026</div>
      </div>

      <Section title="Saludo del PM">
        <p className="text-[13px] leading-relaxed">
          Apreciado(a) cliente, este mes hemos consolidado las decisiones técnicas finales con la interventoría y avanzamos en preparación del lote. Te comparto el avance.
          <br /><br />— <strong>Jose Duque, Project Manager Cretto</strong>
        </p>
      </Section>

      <Section title="Avance de obra">
        <div className="grid grid-cols-2 gap-3">
          <Kpi label="Avance físico" value="3%" sub="vs 5% planeado" color="amber" />
          <Kpi label="Avance financiero" value="8%" sub="dentro del presupuesto" color="emerald" />
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-stone-100">
          <div className="h-full bg-emerald-500" style={{ width: "3%" }} />
        </div>
      </Section>

      <Section title="✅ Hitos cumplidos este mes">
        <ul className="list-disc pl-5 space-y-0.5 text-[12px]">
          <li>Cierre fiduciario con Alianza Fiduciaria</li>
          <li>Aprobación final de planos arquitectónicos v3</li>
          <li>Visto bueno interventoría para inicio de obra</li>
        </ul>
      </Section>

      <Section title="🚧 Próximos hitos">
        <ul className="list-disc pl-5 space-y-0.5 text-[12px]">
          <li>Inicio de descapote y movimiento de tierras (julio)</li>
          <li>Excavación para cimentación (agosto)</li>
          <li>Pilotaje (septiembre)</li>
        </ul>
      </Section>

      <Section title="📸 Galería de obra">
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 text-[10px]">
              📷 Foto avance {i}
            </div>
          ))}
        </div>
      </Section>

      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-900">
        <strong>Fecha proyectada de entrega:</strong> 1° de febrero de 2028 · te invitamos a visitarnos en sala de ventas cualquier sábado.
      </div>
    </div>
  );
}

export default ReportesComercial;
