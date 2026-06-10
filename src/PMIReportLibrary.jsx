import React, { useState, useMemo } from "react";
import {
  FileText, FileCheck, Users, ListTree, Calendar, DollarSign,
  AlertTriangle, Edit3, Briefcase, BookOpen, Award, TrendingUp,
  Eye, Download, X, Sparkles, Target, Activity, ArrowRight, Info,
  Printer
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar, ScatterChart, Scatter, ReferenceLine, ComposedChart
} from "recharts";
import { getValor } from "./capexCronoLink.js";

/* ────────────────────────────────────────────────────────────────
   Biblioteca de Informes PMI — Cretto
   12 informes (11 PMBOK + Inversionistas) con:
   - Descripción detallada (qué es y para qué)
   - Cuándo usarlo
   - Estructura recomendada (cómo presentarlo)
   - Elementos gráficos requeridos
   - Preview con gráficas reales (recharts)
   - Plantilla generadora con datos del proyecto
────────────────────────────────────────────────────────────────── */

const CRETTO_COLORS = {
  primary: "#1F3D2E",     // verde Cretto oscuro
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  blue: "#3b82f6",
  violet: "#a855f7",
  indigo: "#6366f1",
  stone: "#78716c"
};

const PIE_COLORS = ["#1F3D2E", "#10b981", "#f59e0b", "#3b82f6", "#a855f7", "#f43f5e", "#6366f1", "#78716c", "#06b6d4", "#84cc16"];

/* Estilos por color (estáticos para que Tailwind los incluya) */
const CARD_STYLES = {
  emerald: { border: "border-stone-200 hover:border-emerald-300", bg: "from-emerald-50 to-white", icon: "text-emerald-700", header: "border-emerald-200 from-emerald-50 to-white" },
  violet:  { border: "border-stone-200 hover:border-violet-300",  bg: "from-violet-50 to-white",  icon: "text-violet-700",  header: "border-violet-200 from-violet-50 to-white" },
  indigo:  { border: "border-stone-200 hover:border-indigo-300",  bg: "from-indigo-50 to-white",  icon: "text-indigo-700",  header: "border-indigo-200 from-indigo-50 to-white" },
  blue:    { border: "border-stone-200 hover:border-blue-300",    bg: "from-blue-50 to-white",    icon: "text-blue-700",    header: "border-blue-200 from-blue-50 to-white" },
  amber:   { border: "border-stone-200 hover:border-amber-300",   bg: "from-amber-50 to-white",   icon: "text-amber-700",   header: "border-amber-200 from-amber-50 to-white" },
  rose:    { border: "border-stone-200 hover:border-rose-300",    bg: "from-rose-50 to-white",    icon: "text-rose-700",    header: "border-rose-200 from-rose-50 to-white" },
  stone:   { border: "border-stone-200 hover:border-stone-300",   bg: "from-stone-50 to-white",   icon: "text-stone-700",   header: "border-stone-200 from-stone-50 to-white" }
};

const fmtCop = (n) => {
  const v = Math.round(parseFloat(n) || 0);
  if (Math.abs(v) >= 1000000000) return "$" + (v / 1000000000).toFixed(2) + " MMM";
  if (Math.abs(v) >= 1000000) return "$" + Math.round(v / 1000000).toLocaleString("es-CO").replace(/,/g, ".") + " MM";
  return "$" + v.toLocaleString("es-CO").replace(/,/g, ".");
};

/* ════════════════════════════════════════════════════════════════
   CATÁLOGO DE INFORMES (12)
   ════════════════════════════════════════════════════════════════ */

export const REPORT_CATALOG = [
  /* ─────────────────────────────────────────────────────────────
     01 — ACTA DE CONSTITUCIÓN (Project Charter)
     ───────────────────────────────────────────────────────────── */
  {
    id: "charter",
    pmiId: "01",
    titulo: "Acta de Constitución",
    subtitulo: "Project Charter",
    grupo: "Inicio",
    icon: FileCheck,
    color: "emerald",
    cuandoUsar: "Una sola vez al inicio del proyecto, antes de planificación detallada.",
    descripcion: `Documento que **autoriza formalmente** el proyecto, asigna al PM con autoridad y le da el mandato para usar los recursos de la organización.

Es la "biblia" del proyecto. Si hay dudas de alcance o decisiones futuras, este documento es la fuente de verdad.

**¿Por qué importa?** Sin Charter firmado, no hay proyecto formal — solo una idea. El Charter blinda al PM ante decisiones difíciles y alinea expectativas del sponsor desde el día uno.`,
    estructura: [
      "1. Propósito y justificación del proyecto (por qué)",
      "2. Objetivos medibles (SMART) y criterios de éxito",
      "3. Descripción de alto nivel del producto/entregable",
      "4. Requisitos de alto nivel",
      "5. Riesgos iniciales identificados",
      "6. Resumen de hitos macro (timeline)",
      "7. Presupuesto resumido y financiamiento",
      "8. Lista preliminar de stakeholders",
      "9. Requisitos de aprobación (qué define éxito)",
      "10. Project Manager asignado + nivel de autoridad",
      "11. Patrocinador que autoriza el proyecto + firma"
    ],
    elementosGraficos: [
      "Timeline visual de hitos macro (mini-Gantt)",
      "Pie chart de presupuesto preliminar por capítulo",
      "Tabla comparativa de objetivos vs criterios de éxito"
    ],
    preview: PreviewCharter
  },

  /* ─────────────────────────────────────────────────────────────
     02 — REGISTRO DE STAKEHOLDERS + MATRIZ RACI
     ───────────────────────────────────────────────────────────── */
  {
    id: "stakeholders",
    pmiId: "02",
    titulo: "Stakeholders + Matriz RACI",
    subtitulo: "Stakeholder Register + Responsibility Assignment",
    grupo: "Inicio",
    icon: Users,
    color: "violet",
    cuandoUsar: "Al inicio + actualizar cada vez que cambia el ecosistema de actores.",
    descripcion: `Inventario completo de los actores del proyecto con su análisis de Poder × Interés (matriz de Mendelow) + asignación de responsabilidades RACI por cada entregable o evento.

**¿Por qué importa?** Los proyectos no fracasan por costo o cronograma — fracasan por **no gestionar a las personas correctas en el momento correcto**. Este documento te dice a quién mantener satisfecho, a quién consultar, y a quién solo informar.

**RACI** = Responsible (ejecuta) · Accountable (aprueba — uno solo por fila) · Consulted (consulta antes) · Informed (avisa después).`,
    estructura: [
      "1. Tabla de stakeholders: nombre, rol, organización, contacto",
      "2. Análisis Poder × Interés (matriz Mendelow 2×2)",
      "3. Estrategia de gestión por cuadrante:",
      "   • Alto poder + alto interés → Manage closely",
      "   • Alto poder + bajo interés → Keep satisfied",
      "   • Bajo poder + alto interés → Keep informed",
      "   • Bajo poder + bajo interés → Monitor",
      "4. Expectativas y temores documentados",
      "5. Matriz RACI: filas = entregables/eventos, columnas = stakeholders",
      "6. Plan de comunicación: qué se reporta, a quién, con qué frecuencia, por qué canal"
    ],
    elementosGraficos: [
      "Scatter plot Power × Interest con los 4 cuadrantes",
      "Heatmap matriz RACI (colores por R/A/C/I)",
      "Bar chart con # de stakeholders por categoría/tipo"
    ],
    preview: PreviewStakeholders
  },

  /* ─────────────────────────────────────────────────────────────
     03 — EDT / WBS
     ───────────────────────────────────────────────────────────── */
  {
    id: "edt",
    pmiId: "03",
    titulo: "EDT / WBS",
    subtitulo: "Estructura de Desglose del Trabajo",
    grupo: "Planificación",
    icon: ListTree,
    color: "indigo",
    cuandoUsar: "Planificación, antes de cronograma y presupuesto. Base de TODO lo demás.",
    descripcion: `**Descomposición jerárquica del 100% del trabajo** del proyecto en paquetes manejables. Cada nivel es más granular hasta llegar a "paquetes de trabajo" (work packages) que el equipo puede estimar y ejecutar.

**Regla del 100%**: la suma de los hijos = 100% del padre. Si algo no está en la EDT, no es parte del proyecto.

**¿Por qué importa?** El cronograma, el CAPEX y el EVM se construyen sobre la EDT. Si la EDT está mal, todo lo demás también. En Casa 107, la EDT del capítulo Construcción (4.x) tiene 9 paquetes alineados con cronograma y CAPEX.`,
    estructura: [
      "1. Codificación jerárquica (1, 1.1, 1.1.1, ...)",
      "2. Estructura por capítulos (ej. para edificación):",
      "   1. Lote · 2. Estudios · 3. Licencias · 4. Construcción · 5. Honorarios · ...",
      "3. Paquetes de trabajo terminales con:",
      "   • Dueño asignado",
      "   • Duración estimada",
      "   • Costo estimado",
      "   • Criterios de aceptación",
      "4. Diccionario WBS: cada paquete con descripción extendida",
      "5. Mapping a cronograma (cronoTask) para EVM"
    ],
    elementosGraficos: [
      "Diagrama de árbol (org-chart) jerárquico",
      "Pie chart de % horas-hombre por capítulo principal",
      "Bar chart por nivel de profundidad (cantidad de paquetes)"
    ],
    preview: PreviewEDT
  },

  /* ─────────────────────────────────────────────────────────────
     04 — CRONOGRAMA CON HITOS + RUTA CRÍTICA
     ───────────────────────────────────────────────────────────── */
  {
    id: "cronograma",
    pmiId: "04",
    titulo: "Cronograma con Hitos y Ruta Crítica",
    subtitulo: "Project Schedule",
    grupo: "Planificación",
    icon: Calendar,
    color: "blue",
    cuandoUsar: "Planificación inicial (línea base) + actualizaciones continuas.",
    descripcion: `Plan temporal de actividades con dependencias, recursos, hitos y la **ruta crítica** identificada.

**Ruta crítica** = secuencia de actividades sin holgura. Cualquier retraso en estas actividades retrasa todo el proyecto.

**¿Por qué importa?** Sin cronograma con hitos visibles, el equipo no sabe qué priorizar. Sin ruta crítica identificada, no sabes dónde concentrar el esfuerzo de aceleración cuando hay retrasos.

En Casa 107: 18 meses de obra gris desde 1-ago-2026 hasta 1-feb-2028, con curva S concentrada en los meses centrales.`,
    estructura: [
      "1. Lista de actividades por capítulo EDT",
      "2. Para cada actividad: duración, inicio/fin, dependencias (FS/FF/SS/SF), recursos",
      "3. Hitos macro resaltados (firma contrato, punto de equilibrio, licencia, inicio obra, entrega)",
      "4. Ruta crítica identificada y resaltada en rojo",
      "5. Línea base (baseline) congelada para comparar vs avance real",
      "6. Curva S de avance planeado (% acumulado en el tiempo)",
      "7. Buffers/reservas explícitas"
    ],
    elementosGraficos: [
      "Diagrama de Gantt con dependencias y ruta crítica resaltada",
      "Curva S de avance acumulado",
      "Línea temporal de hitos macro con semáforos"
    ],
    preview: PreviewCronograma
  },

  /* ─────────────────────────────────────────────────────────────
     05 — PRESUPUESTO CAPEX
     ───────────────────────────────────────────────────────────── */
  {
    id: "capex",
    pmiId: "05",
    titulo: "Presupuesto CAPEX",
    subtitulo: "Cost Baseline",
    grupo: "Planificación",
    icon: DollarSign,
    color: "amber",
    cuandoUsar: "Planificación inicial (línea base) + actualizar con cada cambio aprobado.",
    descripcion: `Inversión total del proyecto desglosada por capítulos y partidas. Es la **línea base de costo** contra la cual se mide el EVM.

Para vivienda en Colombia, los capítulos típicos son: Lote, Estudios y Diseños, Licencias, Construcción (con WBS detallado), Honorarios, Comercialización, Costos Financieros, Legales, Impuestos, Imprevistos.

**¿Por qué importa?** Cada peso del proyecto necesita categoría, proveedor, estado de aprobación y estado de pago — esto es **innegociable en Cretto**. El CAPEX define el techo de gasto y permite controlar desviaciones temprano.

En Casa 107 manejamos 5 versiones por partida: Inicial (Cretto) · Constructor · Interventoría · Supervisión · Ejecutado.`,
    estructura: [
      "1. Cuadro maestro por capítulo (1-10)",
      "2. Para cada capítulo, partidas con:",
      "   • Presupuesto inicial (línea base)",
      "   • Contratado / Constructor",
      "   • Ejecutado / Pagado",
      "   • % avance financiero",
      "   • Saldo disponible",
      "3. Contingencia explícita (típico 8-12%)",
      "4. Honorarios separados del CAPEX (0.5% VTV en Casa 107)",
      "5. Análisis de variances por capítulo",
      "6. Tabla de proveedores Tier 1/2/3"
    ],
    elementosGraficos: [
      "Pie chart distribución por capítulo",
      "Bar chart Inicial vs Contratado vs Ejecutado",
      "Curva S de gasto acumulado vs presupuesto",
      "Waterfall de cambios al CAPEX"
    ],
    preview: PreviewCapex
  },

  /* ─────────────────────────────────────────────────────────────
     06 — REGISTRO DE RIESGOS
     ───────────────────────────────────────────────────────────── */
  {
    id: "riesgos",
    pmiId: "06",
    titulo: "Registro de Riesgos",
    subtitulo: "Risk Register",
    grupo: "Continuo",
    icon: AlertTriangle,
    color: "rose",
    cuandoUsar: "Continuo. Revisión semanal o quincenal en comité.",
    descripcion: `Inventario vivo de eventos negativos potenciales con su **matriz 5×5** (Probabilidad × Impacto) y **plan de respuesta**.

**Estrategias PMI**: Evitar · Transferir (seguros/pólizas) · Mitigar · Aceptar.

**¿Por qué importa?** Los proyectos no se mueren por riesgos identificados — se mueren por riesgos NO identificados. Este documento obliga a pensar proactivamente y a tener un plan B antes de que el evento ocurra.

Riesgos típicos en Casa 107 (edificación CO): demoras Curaduría, alza acero, paros vecinos, vencimiento póliza decenal, demora desembolso fiducia.`,
    estructura: [
      "1. ID, descripción, categoría (regulatorio/financiero/técnico/social/laboral)",
      "2. Probabilidad (1-5), Impacto (1-5), Exposición = P × I",
      "3. Disparadores (trigger events) — señales tempranas",
      "4. Estrategia de respuesta",
      "5. Plan de mitigación detallado",
      "6. Dueño del riesgo + fecha próxima revisión",
      "7. Costo de mitigación si aplica",
      "8. Estado: Activo / Materializado / Cerrado / Aceptado",
      "9. Riesgos secundarios derivados"
    ],
    elementosGraficos: [
      "Heatmap matriz 5×5 (Probabilidad × Impacto)",
      "Bar chart por categoría",
      "Tendencia de exposición total mes a mes",
      "Top 10 riesgos críticos"
    ],
    preview: PreviewRiesgos
  },

  /* ─────────────────────────────────────────────────────────────
     07 — MATRIZ DE CONTROL DE CAMBIOS
     ───────────────────────────────────────────────────────────── */
  {
    id: "cambios",
    pmiId: "07",
    titulo: "Matriz de Control de Cambios",
    subtitulo: "Change Control Log",
    grupo: "Continuo",
    icon: Edit3,
    color: "indigo",
    cuandoUsar: "Continuo. Cada solicitud de cambio genera una entrada (SCO).",
    descripcion: `Bitácora formal de **Solicitudes de Cambio en Obra (SCO)** con cuantificación de impacto en alcance, tiempo, costo y calidad.

**Regla de oro Cretto**: ningún cambio se ejecuta sin SCO aprobada y firmada por las 3 partes (promotor, constructor, interventoría). Sin firma = no se paga.

**¿Por qué importa?** El Scope Creep mata más proyectos que los errores técnicos. Esta matriz fuerza disciplina: cada "pequeño cambio" se cuantifica antes de aceptarlo. Acumular muchos pequeños = uno grande sin presupuesto.`,
    estructura: [
      "1. # SCO, fecha solicitud, solicitante",
      "2. Descripción del cambio + justificación de negocio",
      "3. Análisis de impacto:",
      "   • Alcance: qué se agrega/quita/modifica",
      "   • Tiempo: días de impacto",
      "   • Costo: COP impacto (positivo o negativo)",
      "   • Calidad: efecto en especificaciones",
      "   • Riesgo: riesgos nuevos derivados",
      "4. Aprobador (típicamente promotor) + fecha aprobación",
      "5. Estado: En análisis / Aprobado / Rechazado / Diferido / Implementado",
      "6. Implementación: fecha, acta, evidencia"
    ],
    elementosGraficos: [
      "Waterfall del impacto acumulado en CAPEX",
      "Bar stacked por estado y categoría",
      "Tendencia de SCO mes a mes",
      "Pie por tipo de cambio (alcance/diseño/cliente)"
    ],
    preview: PreviewCambios
  },

  /* ─────────────────────────────────────────────────────────────
     08 — ACTA DE COMITÉ SEMANAL
     ───────────────────────────────────────────────────────────── */
  {
    id: "comite",
    pmiId: "08",
    titulo: "Acta de Comité Semanal",
    subtitulo: "Weekly Steering Committee Minutes",
    grupo: "Operación",
    icon: FileText,
    color: "emerald",
    cuandoUsar: "Cada semana. El producto recurrente más importante del PM.",
    descripcion: `Registro estructurado del comité semanal con los **6 bloques estándar Cretto** + para vivienda, bloque adicional de avance comercial.

**¿Por qué importa?** Sin actas, las decisiones tomadas en comité se olvidan y se renegocian la semana siguiente. El acta es la fuente única de verdad sobre lo acordado.

Para Casa 107: el bloque comercial es CRÍTICO porque sin punto de equilibrio (28 aptos = 60%) la fiducia no autoriza el inicio de obra.`,
    estructura: [
      "1. Encabezado: fecha, semana #, asistentes, próximo comité",
      "2. Bloque 1 — **Avance de la semana**: qué se logró vs plan",
      "3. Bloque 2 — **Próxima semana**: qué se ejecutará",
      "4. Bloque 3 — **Decisiones tomadas**: con responsable y fecha límite",
      "5. Bloque 4 — **Riesgos nuevos o materializados**",
      "6. Bloque 5 — **Pendientes vivos** con responsable y fecha",
      "7. Bloque 6 — **Asuntos del cliente** (sponsor)",
      "8. [Solo vivienda] Bloque 7 — **Avance comercial**: preventas vs PE, saldo fiducia, desembolsos pendientes"
    ],
    elementosGraficos: [
      "KPI cards: avance %, preventas/PE, saldo caja, días para próximo hito",
      "Mini progress bars por capítulo principal",
      "Semáforos de hitos próximos (3 semanas)",
      "Bar de pendientes por responsable"
    ],
    preview: PreviewComite
  },

  /* ─────────────────────────────────────────────────────────────
     09 — INFORME DE SEGUIMIENTO (EVM)
     ───────────────────────────────────────────────────────────── */
  {
    id: "evm",
    pmiId: "09",
    titulo: "Informe de Seguimiento EVM",
    subtitulo: "Earned Value Management Report",
    grupo: "Operación",
    icon: Activity,
    color: "blue",
    cuandoUsar: "Mensual o por hito macro completado.",
    descripcion: `Reporte cuantitativo con las métricas de **Earned Value Management (EVM)** del PMBOK: PV, EV, AC, CV, SV, CPI, SPI, EAC, VAC.

**¿Por qué importa?** EVM permite responder con números: ¿el proyecto va bien?, ¿cuánto va a costar al final?, ¿cuándo terminará realmente? Sin EVM, la respuesta es opinión.

**Indicadores clave**:
- **CPI** (Cost Performance Index) = EV/AC. >1 = bajo presupuesto. <1 = sobrecosto.
- **SPI** (Schedule Performance Index) = EV/PV. >1 = adelantado. <1 = atrasado.
- **EAC** (Estimate At Completion) = BAC/CPI. Pronóstico del costo final.

Para Casa 107 con WBS de construcción 4.x, EVM se calcula por paquete y se consolida.`,
    estructura: [
      "1. KPIs ejecutivos: PV, EV, AC, CV, SV, CPI, SPI, EAC, VAC",
      "2. Curva S consolidada (PV/EV/AC) acumulada",
      "3. Tendencia CPI/SPI mes a mes",
      "4. EVM por paquete WBS con semáforo (OK/Atención/Atraso/Sobrecosto)",
      "5. Análisis de variances con causa raíz y plan corrección",
      "6. Pronóstico EAC y VAC con ETC (Estimate To Complete)",
      "7. Recomendaciones del PM"
    ],
    elementosGraficos: [
      "Curva S PV/EV/AC (area chart)",
      "Tendencia CPI/SPI (line chart con líneas referencia en 1.0)",
      "Bar chart de variance por WBS",
      "Gauge de CPI y SPI consolidados"
    ],
    preview: PreviewEVM
  },

  /* ─────────────────────────────────────────────────────────────
     10 — REGISTRO DE LECCIONES APRENDIDAS
     ───────────────────────────────────────────────────────────── */
  {
    id: "lecciones",
    pmiId: "10",
    titulo: "Lecciones Aprendidas",
    subtitulo: "Lessons Learned Register",
    grupo: "Continuo / Cierre",
    icon: BookOpen,
    color: "violet",
    cuandoUsar: "Continuo durante el proyecto + consolidación formal en cierre.",
    descripcion: `Bitácora de aprendizajes — positivos y negativos — para alimentar futuros proyectos. Las lecciones se capturan **cuando ocurre el evento**, no al final.

**¿Por qué importa?** El error más caro en gerencia es repetir errores ya cometidos en otros proyectos. Una buena base de lecciones convierte cada proyecto en activo para los siguientes.

Para Cretto, este registro alimenta la **biblioteca corporativa de lecciones** que se consulta en cada nuevo proyecto.`,
    estructura: [
      "1. ID, fecha, fase del proyecto, categoría",
      "2. Situación: qué pasó (contexto)",
      "3. Acción tomada: cómo se respondió",
      "4. Resultado: éxito o fracaso",
      "5. Lección: qué aprendimos",
      "6. Recomendación para próximo proyecto",
      "7. Dueño / quien la registra",
      "8. Tags para búsqueda futura"
    ],
    elementosGraficos: [
      "Pie chart por categoría",
      "Bar chart por fase (cuándo ocurrieron)",
      "Pie de sentimiento (✓ positivas / ✗ negativas / ⚠ neutras)",
      "Top 10 lecciones más relevantes"
    ],
    preview: PreviewLecciones
  },

  /* ─────────────────────────────────────────────────────────────
     11 — INFORME DE CIERRE
     ───────────────────────────────────────────────────────────── */
  {
    id: "cierre",
    pmiId: "11",
    titulo: "Informe de Cierre e Integración",
    subtitulo: "Project Closure Report",
    grupo: "Cierre",
    icon: Award,
    color: "emerald",
    cuandoUsar: "Una sola vez, al cierre formal del proyecto. Cierra el ciclo PMI.",
    descripcion: `Documento final que consolida los resultados del proyecto, los compara contra la línea base, captura lecciones y formaliza la transferencia operativa.

**¿Por qué importa?** Sin cierre formal, el proyecto queda en limbo administrativo. Este documento permite liquidar el patrimonio autónomo, liberar retenciones, distribuir utilidades y archivar el proyecto.

Para Casa 107: el cierre coincide con la liquidación del P.A. de Alianza Fiduciaria.`,
    estructura: [
      "1. Resumen ejecutivo (1 página)",
      "2. Alcance: entregado vs planeado",
      "3. Cronograma: real vs línea base + análisis de variance",
      "4. Presupuesto: ejecutado vs CAPEX + EVM final",
      "5. Calidad: incidencias, NC, postventa",
      "6. Riesgos materializados y cómo se manejaron",
      "7. Top 10 lecciones aprendidas",
      "8. Transferencia operativa al cliente:",
      "   • Manuales, garantías, planos as-built",
      "   • Capacitación a copropiedad / operación",
      "   • Lista de contactos y proveedores",
      "9. Cierre financiero: utilidad final, distribución, impuestos",
      "10. Agradecimientos al equipo + firma sponsor"
    ],
    elementosGraficos: [
      "Comparativo planeado vs real (bar)",
      "Curva S final (PV / EV / AC) cerrada",
      "Pie de presupuesto final por capítulo",
      "Tabla de KPIs finales con semáforo",
      "Línea de tiempo con hitos completados"
    ],
    preview: PreviewCierre
  },

  /* ─────────────────────────────────────────────────────────────
     12 — INFORME A INVERSIONISTAS  ★ NUEVO ★
     ───────────────────────────────────────────────────────────── */
  {
    id: "inversionistas",
    pmiId: "12",
    titulo: "Informe a Inversionistas ★",
    subtitulo: "Investor Quarterly Report",
    grupo: "Stakeholders",
    icon: TrendingUp,
    color: "amber",
    cuandoUsar: "Mensual (preventas) o trimestral (obra). Obligatorio antes y después del punto de equilibrio.",
    descripcion: `Reporte ejecutivo orientado a **sponsors / inversionistas** con foco en retorno, riesgo y decisiones que requieren su input.

**¿Por qué importa?** Los inversionistas son los dueños del capital — necesitan información financiera, no técnica. Este documento traduce el avance de obra al lenguaje de ROI, TIR, riesgo y momento de salida.

**Pensado para que se lea en 5 minutos** mientras toman café. Si hay que extender, los anexos al final.

Para Casa 107: los inversionistas son Hector Gaviria, Juan Diego Duque, Juan Felipe Gaviria y Alvaro Correa. Tienen aporte económico y exigen visibilidad mensual durante preventas, trimestral durante obra.`,
    estructura: [
      "1. **Resumen executive de 1 página** (snapshot del estado)",
      "2. Hitos críticos: cumplidos / en curso / próximos 30 días",
      "3. KPIs financieros:",
      "   • Avance % físico vs financiero",
      "   • Preventas: # / valor / vs punto de equilibrio",
      "   • TIR proyectada (vs original)",
      "   • VPN actualizado",
      "   • Margen proyectado",
      "4. Salud del proyecto: semáforos por dimensión (alcance/tiempo/costo/calidad/riesgo)",
      "5. Riesgos materiales (top 3-5)",
      "6. **Decisiones que requieren input del inversionista** ⚠️",
      "7. Próximos pasos y comité siguiente",
      "8. Anexos: detalle financiero, fotos, EVM completo"
    ],
    elementosGraficos: [
      "Gauge de avance físico vs financiero (lado a lado)",
      "Gauge de preventas vs punto de equilibrio",
      "Bar chart de utilidad por escenario (base/moderado/severo)",
      "Curva ROI proyectada en el tiempo",
      "Pie chart de aporte/participación por inversionista",
      "Semáforos en grid (5 dimensiones × estado)"
    ],
    preview: PreviewInversionistas
  }
];

/* ════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — GALLERY + PICKER + PREVIEW
   ════════════════════════════════════════════════════════════════ */

const PMIReportLibrary = ({ project, partidas = [], tareas = [], stakeholders = [], pagos = [], onClose }) => {
  const [seleccionado, setSeleccionado] = useState(null);
  const [filtroGrupo, setFiltroGrupo] = useState("all");

  const grupos = ["Inicio", "Planificación", "Continuo", "Operación", "Stakeholders", "Cierre"];

  const filtrados = filtroGrupo === "all"
    ? REPORT_CATALOG
    : REPORT_CATALOG.filter(r => r.grupo === filtroGrupo || r.grupo.includes(filtroGrupo));

  if (seleccionado) {
    return (
      <ReportDetail
        report={seleccionado}
        project={project}
        partidas={partidas}
        tareas={tareas}
        stakeholders={stakeholders}
        pagos={pagos}
        onBack={() => setSeleccionado(null)}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Biblioteca PMI · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Informes y Documentos PMI</h1>
          <p className="mt-1 text-sm text-stone-500">
            {REPORT_CATALOG.length} plantillas estándar Cretto-PMI. Click en cualquiera para ver descripción, estructura, elementos gráficos y preview con datos del proyecto.
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100"><X className="h-5 w-5" /></button>
        )}
      </header>

      {/* Filtro grupos */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <FilterChip label={`Todos (${REPORT_CATALOG.length})`} active={filtroGrupo === "all"} onClick={() => setFiltroGrupo("all")} />
        {grupos.map(g => {
          const count = REPORT_CATALOG.filter(r => r.grupo.includes(g)).length;
          if (count === 0) return null;
          return <FilterChip key={g} label={`${g} (${count})`} active={filtroGrupo === g} onClick={() => setFiltroGrupo(g)} />;
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtrados.map(r => {
          const Ic = r.icon;
          const cardStyle = CARD_STYLES[r.color] || CARD_STYLES.stone;
          return (
            <button
              key={r.id}
              onClick={() => setSeleccionado(r)}
              className={`group rounded-xl border bg-gradient-to-br p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${cardStyle.border} ${cardStyle.bg}`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white ${cardStyle.icon}`}>
                  <Ic className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <div className="flex gap-1">
                  <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-700">{r.pmiId}</span>
                  {r.id === "inversionistas" && <span className="rounded bg-amber-600 px-1.5 py-0.5 text-[9px] font-bold text-white">NUEVO</span>}
                </div>
              </div>
              <h3 className="mt-3 font-serif text-[17px] leading-tight tracking-tight text-stone-900">{r.titulo}</h3>
              <p className="mt-0.5 text-[11px] italic text-stone-500">{r.subtitulo}</p>
              <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-stone-600">{r.descripcion.split("\n")[0]}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-[10px] text-stone-500">
                <span className="rounded bg-stone-100 px-1.5 py-0.5">{r.grupo}</span>
                <ArrowRight className="h-3 w-3 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-700 transition-all" />
                <span className="text-emerald-700 opacity-0 group-hover:opacity-100">Ver detalle</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FilterChip = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${active ? "border-emerald-600 bg-emerald-100 text-emerald-800" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}>
    {label}
  </button>
);

/* ════════════════════════════════════════════════════════════════
   VISTA DE DETALLE DE UN INFORME
   ════════════════════════════════════════════════════════════════ */

const ReportDetail = ({ report, project, partidas, tareas, stakeholders, pagos, onBack, onClose }) => {
  const [tab, setTab] = useState("descripcion");
  const Ic = report.icon;

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-emerald-700">
        ← Volver a la biblioteca
      </button>

      <header className={`mb-4 rounded-lg border bg-gradient-to-br p-5 ${(CARD_STYLES[report.color] || CARD_STYLES.stone).header}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg border border-stone-200 bg-white ${(CARD_STYLES[report.color] || CARD_STYLES.stone).icon}`}>
              <Ic className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-stone-200 px-2 py-0.5 font-mono text-[10px] font-bold text-stone-700">PMI {report.pmiId}</span>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600">{report.grupo}</span>
              </div>
              <h1 className="mt-1 font-serif text-2xl text-stone-900">{report.titulo}</h1>
              <p className="text-sm italic text-stone-500">{report.subtitulo}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">
              <Printer className="h-3.5 w-3.5" /> Imprimir
            </button>
            <button onClick={() => setTab("preview")} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800">
              <Sparkles className="h-3.5 w-3.5" /> Generar preview
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-4 flex border-b border-stone-200">
        {[
          { id: "descripcion", label: "Descripción" },
          { id: "estructura",  label: "Estructura recomendada" },
          { id: "graficos",    label: "Elementos gráficos" },
          { id: "preview",     label: "✨ Preview con datos" }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`-mb-px border-b-2 px-4 py-2 text-[12px] font-medium ${tab === t.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "descripcion" && (
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-[12px] text-emerald-900">
            <Info className="mr-1 inline h-3.5 w-3.5" /><strong>Cuándo usarlo:</strong> {report.cuandoUsar}
          </div>
          <div className="prose prose-sm max-w-none text-[14px] leading-relaxed text-stone-800">
            {report.descripcion.split("\n\n").map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }} />
            ))}
          </div>
        </div>
      )}

      {tab === "estructura" && (
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h3 className="mb-3 font-serif text-lg text-stone-900">📋 Estructura recomendada</h3>
          <ol className="space-y-1.5 text-[13px] text-stone-800">
            {report.estructura.map((s, i) => (
              <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: s.replace(/^(\d+\.) /, "<strong>$1</strong> ").replace(/^   • /, "&nbsp;&nbsp;&nbsp;• ").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
            ))}
          </ol>
        </div>
      )}

      {tab === "graficos" && (
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h3 className="mb-3 font-serif text-lg text-stone-900">📊 Elementos gráficos requeridos</h3>
          <p className="mb-3 text-[12px] text-stone-500">
            Cretto exige que todo informe incluya elementos visuales — los reportes en texto plano no convencen a sponsors ni a comités.
          </p>
          <ul className="space-y-2">
            {report.elementosGraficos.map((g, i) => (
              <li key={i} className="flex items-start gap-2 rounded-md border border-stone-200 bg-stone-50/50 p-2">
                <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
                <span className="text-[13px] text-stone-800">{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "preview" && report.preview && (
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-lg text-stone-900">✨ Preview con datos de {project?.nombre}</h3>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">Datos en vivo del hub</span>
          </div>
          {React.createElement(report.preview, { project, partidas, tareas, stakeholders, pagos })}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   PREVIEWS — uno por cada uno de los 12 informes
   Cada preview es un componente que renderiza HTML + recharts
   con datos reales del proyecto cuando están disponibles
   ════════════════════════════════════════════════════════════════ */

function PreviewHeader({ project, titulo, subtitulo }) {
  return (
    <div className="mb-4 rounded-md border-l-4 border-emerald-700 bg-stone-50 p-3">
      <div className="text-[10px] uppercase tracking-wider text-emerald-700">Cretto · {project?.nombre}</div>
      <div className="font-serif text-lg text-stone-900">{titulo}</div>
      {subtitulo && <div className="text-[11px] text-stone-500">{subtitulo}</div>}
      <div className="mt-1 text-[10px] text-stone-500">Fecha: {new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })} · PM: {project?.pm || "Jose Guillermo Duque"}</div>
    </div>
  );
}

function PreviewFooter() {
  return <div className="mt-6 border-t border-stone-200 pt-3 text-center text-[10px] text-stone-500">Elaborado por Cretto · Gerencia de Proyectos</div>;
}

/* 1 — CHARTER */
function PreviewCharter({ project, partidas }) {
  const capex = partidas.reduce((s, p) => s + (getValor(p, "inicial") || 0), 0) || project?.capexEstimado || 0;
  const capexPorCapitulo = useMemo(() => {
    const m = {};
    partidas.forEach(p => { m[p.capitulo] = (m[p.capitulo] || 0) + (getValor(p, "inicial") || 0); });
    return Object.entries(m).map(([k, v]) => ({ name: k, value: Math.round(v / 1000000) })).filter(x => x.value > 0).slice(0, 8);
  }, [partidas]);

  const hitos = [
    { hito: "Firma contrato", fecha: project?.fechaContrato, idx: 1 },
    { hito: "Licencia ejecutoriada", fecha: project?.fechaLicenciaEsperada, idx: 2 },
    { hito: "Punto de equilibrio", fecha: project?.fechaPuntoEquilibrio, idx: 3 },
    { hito: "Inicio obra", fecha: project?.fechaInicioObra, idx: 4 },
    { hito: "Entrega obra", fecha: project?.fechaEntregaObra, idx: 5 }
  ].filter(h => h.fecha);

  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo="Acta de Constitución del Proyecto" subtitulo="Project Charter — Estándar PMBOK 8" />

      <Section title="Propósito y Justificación">
        <p>Construcción de edificio residencial <strong>{project?.nombre}</strong> ({project?.unidadesViv || 47} apartamentos, {project?.pisos || 10} pisos, {project?.sotanos || 2} sótanos)
        promovido por <strong>{project?.cliente}</strong>, ubicado en {project?.direccion}.</p>
      </Section>

      <Section title="Objetivos SMART">
        <ul className="list-disc pl-5 space-y-1">
          <li>Entregar obra terminada el <strong>{project?.fechaEntregaObra}</strong> con cumplimiento &gt;95% de cronograma</li>
          <li>Ejecutar CAPEX dentro del +5%/-3% del presupuesto base ({fmtCop(capex)})</li>
          <li>Alcanzar punto de equilibrio comercial (60% preventas = ~28 aptos) antes de inicio de obra</li>
          <li>Cero accidentes incapacitantes en obra (ATEL = 0)</li>
        </ul>
      </Section>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Hitos Macro (Timeline)">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={hitos} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="hito" tick={{ fontSize: 10 }} width={140} />
              <Tooltip formatter={(v, n, p) => p?.payload?.fecha} />
              <Bar dataKey="idx" fill={CRETTO_COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
        <Section title="Presupuesto Preliminar por Capítulo">
          {capexPorCapitulo.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={capexPorCapitulo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={false}>
                  {capexPorCapitulo.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `${fmtCop(v * 1000000)}`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="text-stone-400 italic">Pendiente cargar CAPEX</div>}
        </Section>
      </div>

      <Section title="Restricciones y Supuestos">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Fiducia:</strong> {project?.fiduciaria} — sin punto de equilibrio no se desembolsa</li>
          <li><strong>Crédito constructor:</strong> {project?.bancoFinanciador} (cupo por confirmar)</li>
          <li><strong>Modelo de contratación:</strong> {project?.modeloContrato}</li>
        </ul>
      </Section>

      <Section title="PM Asignado y Autoridad">
        <p><strong>Project Manager:</strong> {project?.pmCretto || project?.pm} (Cretto)</p>
        <p><strong>Autoridad:</strong> Decisión sobre cambios &le; 2% CAPEX. Sobre ese umbral requiere autorización del Sponsor.</p>
      </Section>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded border border-stone-300 p-3">
          <div className="text-[10px] uppercase text-stone-500 mb-8">Firma Sponsor</div>
          <div className="text-stone-700">{project?.sponsor || "Hector Gaviria"} · {project?.cliente}</div>
        </div>
        <div className="rounded border border-stone-300 p-3">
          <div className="text-[10px] uppercase text-stone-500 mb-8">Firma PM</div>
          <div className="text-stone-700">{project?.pmCretto || "Jose Guillermo Duque"} · Cretto</div>
        </div>
      </div>

      <PreviewFooter />
    </div>
  );
}

/* 2 — STAKEHOLDERS + RACI */
function PreviewStakeholders({ project, stakeholders }) {
  const scatter = stakeholders.map(s => ({ x: s.influencia || 3, y: s.interes || 3, name: s.nombre || "—", organizacion: s.organizacion }));
  const porTipo = useMemo(() => {
    const m = {};
    stakeholders.forEach(s => (s.tipos || []).forEach(t => { m[t] = (m[t] || 0) + 1; }));
    return Object.entries(m).map(([k, v]) => ({ tipo: k, count: v })).slice(0, 8);
  }, [stakeholders]);

  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo="Registro de Stakeholders y Matriz RACI" />

      <Section title="Resumen Cuantitativo">
        <div className="grid grid-cols-4 gap-2">
          <Kpi label="Total stakeholders" value={stakeholders.length} />
          <Kpi label="Con email" value={stakeholders.filter(s => s.email || (s.contactos || []).some(c => c.email)).length} />
          <Kpi label="Inversionistas" value={stakeholders.filter(s => (s.tipos || []).includes("inversionista")).length} />
          <Kpi label="Proveedores/Constructor" value={stakeholders.filter(s => (s.tipos || []).some(t => ["constructor", "proveedor", "diseñador"].includes(t))).length} />
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Matriz Poder × Interés (Mendelow)">
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" domain={[0, 5]} label={{ value: "Influencia", position: "insideBottom", offset: -5, fontSize: 10 }} tick={{ fontSize: 10 }} />
              <YAxis type="number" dataKey="y" domain={[0, 5]} label={{ value: "Interés", angle: -90, position: "insideLeft", fontSize: 10 }} tick={{ fontSize: 10 }} />
              <ReferenceLine x={3} stroke="#94a3b8" strokeDasharray="3 3" />
              <ReferenceLine y={3} stroke="#94a3b8" strokeDasharray="3 3" />
              <Tooltip formatter={(v, n, p) => p?.payload?.name} />
              <Scatter data={scatter} fill={CRETTO_COLORS.violet} />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-1 grid grid-cols-2 gap-1 text-[9px] text-stone-500">
            <div>↖ Keep informed</div><div>↗ <strong>Manage closely</strong></div>
            <div>↙ Monitor</div><div>↘ Keep satisfied</div>
          </div>
        </Section>

        <Section title="Distribución por Tipo">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={porTipo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill={CRETTO_COLORS.indigo} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <Section title="Top Stakeholders por Influencia">
        <table className="w-full text-[11px]">
          <thead className="text-[9px] uppercase text-stone-500">
            <tr className="border-b border-stone-200">
              <th className="px-2 py-1 text-left">Nombre</th>
              <th className="px-2 py-1 text-left">Rol</th>
              <th className="px-2 py-1 text-center">Infl</th>
              <th className="px-2 py-1 text-center">Int</th>
              <th className="px-2 py-1 text-left">Estrategia</th>
            </tr>
          </thead>
          <tbody>
            {stakeholders.slice().sort((a, b) => (b.influencia || 0) - (a.influencia || 0)).slice(0, 8).map(s => (
              <tr key={s.id} className="border-b border-stone-100">
                <td className="px-2 py-1 font-medium">{s.nombre}</td>
                <td className="px-2 py-1 text-stone-600">{s.rol || s.especialidad}</td>
                <td className="px-2 py-1 text-center">{s.influencia}</td>
                <td className="px-2 py-1 text-center">{s.interes}</td>
                <td className="px-2 py-1 text-[10px] italic">{s.estrategia || "monitor"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <PreviewFooter />
    </div>
  );
}

/* 3 — EDT/WBS */
function PreviewEDT({ project, partidas }) {
  const porCapitulo = useMemo(() => {
    const m = {};
    partidas.forEach(p => { m[p.capitulo] = (m[p.capitulo] || 0) + 1; });
    return Object.entries(m).map(([k, v]) => ({ capitulo: k, partidas: v }));
  }, [partidas]);

  const total = partidas.length;
  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo="Estructura de Desglose del Trabajo (EDT/WBS)" />

      <div className="grid grid-cols-3 gap-2">
        <Kpi label="Capítulos principales" value={porCapitulo.length} />
        <Kpi label="Total partidas" value={total} />
        <Kpi label="Profundidad WBS" value="3 niveles" />
      </div>

      <Section title="Cantidad de Partidas por Capítulo">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={porCapitulo} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="capitulo" tick={{ fontSize: 10 }} width={120} />
            <Tooltip />
            <Bar dataKey="partidas" fill={CRETTO_COLORS.indigo} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Árbol WBS — Capítulo 4 (Construcción)">
        <div className="space-y-1 font-mono text-[11px]">
          <div><strong>4.</strong> Construcción</div>
          <div className="pl-4">├─ <strong>4.1</strong> Preliminares y demoliciones</div>
          <div className="pl-4">├─ <strong>4.2</strong> Cimentación</div>
          <div className="pl-4">├─ <strong>4.3</strong> Estructura</div>
          <div className="pl-4">├─ <strong>4.4</strong> Mampostería</div>
          <div className="pl-4">├─ <strong>4.5</strong> MEP</div>
          <div className="pl-8">│   ├─ 4.5.1 Hidrosanitarias</div>
          <div className="pl-8">│   ├─ 4.5.2 Eléctricas</div>
          <div className="pl-8">│   └─ 4.5.3 HVAC</div>
          <div className="pl-4">├─ <strong>4.6</strong> Acabados</div>
          <div className="pl-4">├─ <strong>4.7</strong> Fachadas</div>
          <div className="pl-4">├─ <strong>4.8</strong> Equipos</div>
          <div className="pl-4">└─ <strong>4.9</strong> Urbanismo</div>
        </div>
      </Section>

      <PreviewFooter />
    </div>
  );
}

/* 4 — CRONOGRAMA + CURVA S */
function PreviewCronograma({ project, tareas }) {
  /* Curva S simulada por meses */
  const curvaS = useMemo(() => {
    const meses = 18;
    return Array.from({ length: meses }, (_, i) => {
      const t = (i + 1) / meses;
      const planeado = 100 / (1 + Math.exp(-10 * (t - 0.5)));
      const real = i < 4 ? planeado * 0.9 : null;
      return { mes: `M${i + 1}`, planeado: Math.round(planeado), real: real != null ? Math.round(real) : null };
    });
  }, []);

  const fasesPorMes = [
    { fase: "Preliminares", inicio: 1, fin: 3 },
    { fase: "Cimentación",  inicio: 2, fin: 6 },
    { fase: "Estructura",   inicio: 4, fin: 12 },
    { fase: "Mampostería",  inicio: 8, fin: 14 },
    { fase: "MEP",          inicio: 10, fin: 16 },
    { fase: "Acabados",     inicio: 13, fin: 17 },
    { fase: "Urbanismo",    inicio: 16, fin: 18 }
  ].map(f => ({ ...f, duracion: f.fin - f.inicio + 1, offset: f.inicio }));

  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo="Cronograma con Hitos y Ruta Crítica" />

      <div className="grid grid-cols-4 gap-2">
        <Kpi label="Inicio obra" value={project?.fechaInicioObra || "—"} />
        <Kpi label="Entrega obra" value={project?.fechaEntregaObra || "—"} />
        <Kpi label="Duración" value="18 meses" />
        <Kpi label="Actividades en ruta crítica" value={tareas.length || "TBD"} />
      </div>

      <Section title="Curva S — Avance Planeado vs Real (% acumulado)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={curvaS}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} unit="%" />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="planeado" stroke={CRETTO_COLORS.primary} fill={CRETTO_COLORS.primary + "33"} name="Planeado" />
            <Line type="monotone" dataKey="real" stroke={CRETTO_COLORS.amber} strokeWidth={2} name="Real" dot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Gantt — Fases macro">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={fasesPorMes} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 18]} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="fase" tick={{ fontSize: 10 }} width={100} />
            <Tooltip formatter={(v, n, p) => `M${p?.payload?.inicio}-M${p?.payload?.fin}`} />
            <Bar dataKey="offset" stackId="a" fill="transparent" />
            <Bar dataKey="duracion" stackId="a" fill={CRETTO_COLORS.blue} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <PreviewFooter />
    </div>
  );
}

/* 5 — CAPEX */
function PreviewCapex({ project, partidas }) {
  const porCapitulo = useMemo(() => {
    const m = {};
    partidas.forEach(p => {
      const v = getValor(p, "inicial") || 0;
      m[p.capitulo] = (m[p.capitulo] || 0) + v;
    });
    return Object.entries(m).map(([k, v]) => ({ capitulo: k, monto: Math.round(v / 1000000) })).filter(x => x.monto > 0);
  }, [partidas]);

  const versions = ["inicial", "constructor", "ejecutado"];
  const comparativo = useMemo(() => {
    return porCapitulo.slice(0, 7).map(c => {
      const partidasCap = partidas.filter(p => p.capitulo === c.capitulo);
      return {
        capitulo: c.capitulo,
        inicial: Math.round(partidasCap.reduce((s, p) => s + (getValor(p, "inicial") || 0), 0) / 1000000),
        constructor: Math.round(partidasCap.reduce((s, p) => s + (getValor(p, "constructor") || 0), 0) / 1000000),
        ejecutado: Math.round(partidasCap.reduce((s, p) => s + (getValor(p, "ejecutado") || 0), 0) / 1000000)
      };
    });
  }, [partidas, porCapitulo]);

  const total = porCapitulo.reduce((s, x) => s + x.monto, 0);

  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo="Presupuesto CAPEX por Capítulos" />

      <div className="grid grid-cols-4 gap-2">
        <Kpi label="CAPEX total" value={fmtCop(total * 1000000)} />
        <Kpi label="Capítulos" value={porCapitulo.length} />
        <Kpi label="Partidas" value={partidas.length} />
        <Kpi label="Contingencia" value={`${project?.contingenciaPct || 10}%`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Distribución por Capítulo">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={porCapitulo} dataKey="monto" nameKey="capitulo" cx="50%" cy="50%" outerRadius={80} label={(d) => `${d.capitulo.slice(0, 10)} ${((d.monto / total) * 100).toFixed(0)}%`}>
                {porCapitulo.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => fmtCop(v * 1000000)} />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Comparativo: Inicial vs Constructor vs Ejecutado (MM)">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparativo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="capitulo" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="inicial" fill={CRETTO_COLORS.indigo} />
              <Bar dataKey="constructor" fill={CRETTO_COLORS.emerald} />
              <Bar dataKey="ejecutado" fill={CRETTO_COLORS.amber} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <PreviewFooter />
    </div>
  );
}

/* 6 — RIESGOS */
function PreviewRiesgos({ project }) {
  const riesgosSeed = [
    { id: 1, desc: "Demora desembolso fiducia",       P: 3, I: 4, cat: "Financiero" },
    { id: 2, desc: "Alza acero / inflación",          P: 4, I: 3, cat: "Mercado" },
    { id: 3, desc: "Demora licencia construcción",    P: 2, I: 5, cat: "Regulatorio" },
    { id: 4, desc: "Quejas vecinos / paro",           P: 3, I: 3, cat: "Social" },
    { id: 5, desc: "Atraso preventas → no PE",        P: 4, I: 5, cat: "Comercial" },
    { id: 6, desc: "Incumplimiento contratista",      P: 2, I: 4, cat: "Operativo" },
    { id: 7, desc: "Cambio diseño post-licencia",     P: 3, I: 3, cat: "Alcance" }
  ];
  const porCategoria = riesgosSeed.reduce((acc, r) => { acc[r.cat] = (acc[r.cat] || 0) + 1; return acc; }, {});
  const dataCat = Object.entries(porCategoria).map(([k, v]) => ({ categoria: k, count: v }));

  /* Matriz 5×5 — contar cuántos riesgos en cada celda */
  const matriz5x5 = [];
  for (let p = 1; p <= 5; p++) {
    for (let i = 1; i <= 5; i++) {
      const count = riesgosSeed.filter(r => r.P === p && r.I === i).length;
      matriz5x5.push({ P: p, I: i, count, exposure: p * i });
    }
  }

  const scoreColor = (e) => e <= 4 ? "bg-emerald-200" : e <= 8 ? "bg-amber-200" : e <= 15 ? "bg-orange-300" : "bg-rose-400";

  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo="Registro de Riesgos · Matriz 5×5" />

      <div className="grid grid-cols-4 gap-2">
        <Kpi label="Riesgos activos" value={riesgosSeed.length} />
        <Kpi label="Críticos (≥15)" value={riesgosSeed.filter(r => r.P * r.I >= 15).length} />
        <Kpi label="Categorías" value={Object.keys(porCategoria).length} />
        <Kpi label="Exposición total" value={riesgosSeed.reduce((s, r) => s + r.P * r.I, 0)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Heatmap Matriz Probabilidad × Impacto">
          <div className="text-center text-[9px] text-stone-500 mb-1">Impacto →</div>
          <div className="grid grid-cols-6 gap-0.5">
            <div></div>
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="text-center text-[9px] text-stone-500">{i}</div>)}
            {[5, 4, 3, 2, 1].map(p => (
              <React.Fragment key={p}>
                <div className="text-right text-[9px] text-stone-500 pr-1">{p}</div>
                {[1, 2, 3, 4, 5].map(i => {
                  const cell = matriz5x5.find(c => c.P === p && c.I === i);
                  return (
                    <div key={i} className={`flex h-8 items-center justify-center rounded text-[10px] font-bold ${scoreColor(p * i)} ${cell?.count > 0 ? "text-stone-900" : "text-stone-500/40"}`}>
                      {cell?.count > 0 ? cell.count : ""}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-stone-500">↑ Probabilidad</div>
        </Section>

        <Section title="Riesgos por Categoría">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dataCat}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill={CRETTO_COLORS.rose} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <Section title="Top 5 Riesgos Críticos (P × I desc)">
        <table className="w-full text-[11px]">
          <thead className="text-[9px] uppercase text-stone-500"><tr className="border-b border-stone-200"><th className="px-2 py-1 text-left">Riesgo</th><th>P</th><th>I</th><th>Exp</th><th>Categoría</th></tr></thead>
          <tbody>
            {riesgosSeed.slice().sort((a, b) => (b.P * b.I) - (a.P * a.I)).slice(0, 5).map(r => (
              <tr key={r.id} className="border-b border-stone-100"><td className="px-2 py-1">{r.desc}</td><td className="text-center">{r.P}</td><td className="text-center">{r.I}</td><td className="text-center"><strong>{r.P * r.I}</strong></td><td className="text-[10px]">{r.cat}</td></tr>
            ))}
          </tbody>
        </table>
      </Section>

      <PreviewFooter />
    </div>
  );
}

/* 7 — CAMBIOS */
function PreviewCambios({ project }) {
  const cambiosSeed = [
    { sco: 1, desc: "Cambio fachada (RAL)",     impacto: 45,  estado: "Aprobado" },
    { sco: 2, desc: "Adicional ascensor extra", impacto: 180, estado: "En análisis" },
    { sco: 3, desc: "Modificación piso 8",      impacto: -25, estado: "Aprobado" },
    { sco: 4, desc: "Mejora acabados zonas comunes", impacto: 95, estado: "Diferido" },
    { sco: 5, desc: "Ajuste sistema gas",       impacto: 30,  estado: "Aprobado" }
  ];
  const dataWaterfall = cambiosSeed.filter(c => c.estado === "Aprobado").reduce((acc, c, i) => {
    const prev = acc[i - 1]?.acum || 0;
    acc.push({ sco: `SCO #${c.sco}`, impacto: c.impacto, acum: prev + c.impacto });
    return acc;
  }, []);
  const porEstado = ["Aprobado", "En análisis", "Diferido", "Rechazado"].map(e => ({ estado: e, count: cambiosSeed.filter(c => c.estado === e).length }));

  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo="Matriz de Control de Cambios" />

      <div className="grid grid-cols-4 gap-2">
        <Kpi label="Total SCO" value={cambiosSeed.length} />
        <Kpi label="Aprobados" value={porEstado.find(e => e.estado === "Aprobado")?.count} />
        <Kpi label="Impacto acum (MM)" value={`${dataWaterfall[dataWaterfall.length - 1]?.acum || 0}`} />
        <Kpi label="Pendientes" value={porEstado.find(e => e.estado === "En análisis")?.count} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Waterfall — Impacto Acumulado en CAPEX (MM)">
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={dataWaterfall}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sco" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="impacto" fill={CRETTO_COLORS.amber} />
              <Line type="monotone" dataKey="acum" stroke={CRETTO_COLORS.rose} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </Section>

        <Section title="SCO por Estado">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={porEstado.filter(p => p.count > 0)} dataKey="count" nameKey="estado" cx="50%" cy="50%" outerRadius={80} label>
                {porEstado.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <PreviewFooter />
    </div>
  );
}

/* 8 — COMITÉ SEMANAL */
function PreviewComite({ project }) {
  const semana = 18;
  const avance = 12;
  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo={`Acta de Comité Semanal · Semana #${semana}`} subtitulo={`Comité del ${new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`} />

      <Section title="📊 KPIs Ejecutivos">
        <div className="grid grid-cols-4 gap-2">
          <Kpi label="Avance físico" value={`${avance}%`} color="blue" />
          <Kpi label="Preventas" value="18/28 aptos" color="amber" sub="64% del PE" />
          <Kpi label="Saldo fiducia" value="$8.000 MM" color="emerald" />
          <Kpi label="Días próximo hito" value="14 días" sub="Licencia constr." />
        </div>
      </Section>

      <Section title="1️⃣ Avance de la semana">
        <ul className="list-disc pl-5 space-y-1">
          <li>Finalización de planos arquitectónicos v3 — G Arquitectura</li>
          <li>Reunión con Banco Occidente: pre-aprobación cupo crédito constructor</li>
          <li>Sala de ventas: 3 nuevas reservas firmadas (acumulado: 18 aptos)</li>
        </ul>
      </Section>

      <Section title="2️⃣ Próxima semana">
        <ul className="list-disc pl-5 space-y-1">
          <li>Constitución del Patrimonio Autónomo con Alianza Fiduciaria</li>
          <li>Comité técnico con interventoría (Alvaro Andrade)</li>
          <li>Reunión inversionistas — actualización trimestral</li>
        </ul>
      </Section>

      <Section title="3️⃣ Decisiones tomadas">
        <table className="w-full text-[11px]">
          <thead className="text-[9px] uppercase text-stone-500"><tr className="border-b border-stone-200"><th className="px-2 py-1 text-left">Decisión</th><th className="text-left">Responsable</th><th className="text-left">Fecha límite</th></tr></thead>
          <tbody>
            <tr className="border-b border-stone-100"><td className="px-2 py-1">Validar color RAL fachada</td><td>G Arquitectura</td><td>15-jun</td></tr>
            <tr className="border-b border-stone-100"><td className="px-2 py-1">Confirmar póliza decenal</td><td>Hector Gaviria</td><td>20-jun</td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="4️⃣ Riesgos nuevos">
        <p>Demora reportada por Curaduría — posible retraso de 1 semana en ejecutoria de licencia.</p>
      </Section>

      <Section title="7️⃣ Avance comercial (vivienda)">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={[
            { metrica: "Preventas vs PE", actual: 18, meta: 28 },
            { metrica: "Recaudo cuota inicial", actual: 7600, meta: 19000 }
          ]} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="metrica" tick={{ fontSize: 10 }} width={130} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="actual" fill={CRETTO_COLORS.amber} />
            <Bar dataKey="meta" fill={CRETTO_COLORS.stone + "55"} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <PreviewFooter />
    </div>
  );
}

/* 9 — EVM */
function PreviewEVM({ project }) {
  const curva = Array.from({ length: 12 }, (_, i) => {
    const t = (i + 1) / 12;
    const pv = Math.round(1000 * (1 / (1 + Math.exp(-10 * (t - 0.5)))));
    const ev = i < 5 ? Math.round(pv * 0.92) : null;
    const ac = i < 5 ? Math.round(pv * 0.95) : null;
    return { mes: `M${i + 1}`, PV: pv, EV: ev, AC: ac };
  });
  const cpiSpiTrend = Array.from({ length: 5 }, (_, i) => ({
    mes: `M${i + 1}`,
    CPI: (0.92 + (Math.random() * 0.1 - 0.05)).toFixed(2),
    SPI: (0.95 + (Math.random() * 0.1 - 0.05)).toFixed(2)
  }));

  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo="Informe de Seguimiento EVM" />

      <Section title="📊 KPIs EVM Ejecutivos">
        <div className="grid grid-cols-3 gap-2">
          <Kpi label="PV (Valor Planeado)" value="$500 MM" color="indigo" />
          <Kpi label="EV (Valor Ganado)" value="$460 MM" color="emerald" />
          <Kpi label="AC (Costo Real)" value="$475 MM" color="amber" />
          <Kpi label="CPI" value="0.97" color="amber" sub="Bajo presupuesto" />
          <Kpi label="SPI" value="0.92" color="amber" sub="Ligero atraso" />
          <Kpi label="EAC pronóstico" value="$24.500 MM" color="rose" />
        </div>
      </Section>

      <Section title="Curva S: PV · EV · AC (MM acumulado)">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={curva}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="PV" stroke={CRETTO_COLORS.indigo} fill={CRETTO_COLORS.indigo + "33"} />
            <Line type="monotone" dataKey="EV" stroke={CRETTO_COLORS.emerald} strokeWidth={2} />
            <Line type="monotone" dataKey="AC" stroke={CRETTO_COLORS.rose} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Tendencia CPI / SPI">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={cpiSpiTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
            <YAxis domain={[0.7, 1.2]} tick={{ fontSize: 10 }} />
            <ReferenceLine y={1.0} stroke="#dc2626" strokeDasharray="3 3" label={{ value: "Objetivo 1.0", fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="CPI" stroke={CRETTO_COLORS.emerald} strokeWidth={2} />
            <Line type="monotone" dataKey="SPI" stroke={CRETTO_COLORS.blue} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Section>

      <PreviewFooter />
    </div>
  );
}

/* 10 — LECCIONES */
function PreviewLecciones({ project }) {
  const porCat = [
    { categoria: "Fiducia", count: 5, color: "violet" },
    { categoria: "Comercial", count: 4, color: "amber" },
    { categoria: "Técnico", count: 8, color: "blue" },
    { categoria: "Legal", count: 3, color: "rose" },
    { categoria: "Proveedores", count: 6, color: "emerald" }
  ];
  const sentimiento = [{ tipo: "Positivas", v: 12 }, { tipo: "Negativas", v: 9 }, { tipo: "Neutras", v: 5 }];

  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo="Registro de Lecciones Aprendidas" />

      <div className="grid grid-cols-2 gap-4">
        <Section title="Lecciones por Categoría">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={porCat} dataKey="count" nameKey="categoria" cx="50%" cy="50%" outerRadius={80} label>
                {porCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Sentimiento">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sentimiento}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="v">
                {sentimiento.map((d, i) => <Cell key={i} fill={d.tipo === "Positivas" ? CRETTO_COLORS.emerald : d.tipo === "Negativas" ? CRETTO_COLORS.rose : CRETTO_COLORS.stone} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <Section title="Top Lecciones Recientes">
        <ul className="space-y-2">
          <li className="rounded border border-emerald-200 bg-emerald-50/40 p-2"><strong>✓ Pre-negociar con Bancolombia el cupo de confirming antes del PE</strong> — ahorró 25 días en ciclo de pagos a acerías.</li>
          <li className="rounded border border-rose-200 bg-rose-50/40 p-2"><strong>✗ No confiar en plazos verbales con Curaduría</strong> — demora real fue 2x lo informado. Siempre confirmar por escrito.</li>
          <li className="rounded border border-amber-200 bg-amber-50/40 p-2"><strong>⚠ Reservar 15% buffer en cronograma de acabados</strong> — proveedores importados sistemáticamente entregan 2-3 semanas tarde.</li>
        </ul>
      </Section>

      <PreviewFooter />
    </div>
  );
}

/* 11 — CIERRE */
function PreviewCierre({ project }) {
  const compar = [
    { dim: "Tiempo", planeado: 18, real: 19.5 },
    { dim: "Costo (MMM)", planeado: 30, real: 30.8 },
    { dim: "Alcance (%)", planeado: 100, real: 98 },
    { dim: "Calidad (NC)", planeado: 0, real: 3 }
  ];
  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo="Informe de Cierre e Integración" />

      <Section title="📊 KPIs Finales">
        <div className="grid grid-cols-4 gap-2">
          <Kpi label="Duración" value="19.5 / 18 m" sub="+8%" color="amber" />
          <Kpi label="CAPEX final" value="$30.8 MMM" sub="+2.7%" color="amber" />
          <Kpi label="Alcance" value="98%" sub="2 punch list pendientes" color="emerald" />
          <Kpi label="Utilidad neta" value="$8.250 MM" sub="ROI 28%" color="emerald" />
        </div>
      </Section>

      <Section title="Planeado vs Real">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={compar}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dim" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="planeado" fill={CRETTO_COLORS.indigo} />
            <Bar dataKey="real" fill={CRETTO_COLORS.amber} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Transferencia Operativa">
        <ul className="list-disc pl-5 space-y-1">
          <li>Entrega de planos as-built al cliente (V3 firmada)</li>
          <li>Capacitación a administración de copropiedad (4 horas)</li>
          <li>Manual de propietario y garantías por unidad</li>
          <li>Liberación de retenciones del 5% (programada para mes +6)</li>
        </ul>
      </Section>

      <PreviewFooter />
    </div>
  );
}

/* 12 — INVERSIONISTAS */
function PreviewInversionistas({ project, stakeholders }) {
  const inversionistas = stakeholders.filter(s => (s.tipos || []).includes("inversionista"));
  const pctAvancePhys = 12;
  const pctPreventasPE = 64;
  const utilidadEscenarios = [
    { escenario: "Pesimista",  utilidad: 4500 },
    { escenario: "Base",       utilidad: 8250 },
    { escenario: "Optimista",  utilidad: 10800 }
  ];
  const roiTime = [
    { fase: "Inicio",       roi: 0 },
    { fase: "Preventas 60%", roi: 5 },
    { fase: "Obra 50%",     roi: 12 },
    { fase: "Entrega",      roi: 22 },
    { fase: "Liquidación",  roi: 28 }
  ];

  return (
    <div className="space-y-4 text-[12px]">
      <PreviewHeader project={project} titulo="🎯 Reporte Ejecutivo a Inversionistas" subtitulo="Q2 2026 · Casa 107" />

      <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3 text-[12px]">
        <strong>⚡ Resumen Ejecutivo:</strong> Proyecto en fase de preventas. 64% del PE alcanzado. Licencia por ejecutoriar.
        Decisión clave para inversionistas: <strong>aprobar pre-negociación confirming Bancolombia</strong> antes de iniciar obra (decisión en próximo comité de inversionistas — 25 jun).
      </div>

      <Section title="📊 KPIs Financieros del Proyecto">
        <div className="grid grid-cols-4 gap-2">
          <Kpi label="Avance físico" value={`${pctAvancePhys}%`} color="blue" />
          <Kpi label="Preventas / PE" value={`${pctPreventasPE}%`} sub="18/28 aptos" color="amber" />
          <Kpi label="TIR proyectada" value="22%" sub="vs 20% original" color="emerald" />
          <Kpi label="Utilidad proyectada" value="$8.250 MM" sub="margen 10%" color="emerald" />
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Avance Físico vs Financiero (Gauge)">
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart innerRadius="40%" outerRadius="100%" data={[
              { name: "Físico", value: pctAvancePhys, fill: CRETTO_COLORS.blue },
              { name: "Financiero", value: 18, fill: CRETTO_COLORS.amber },
              { name: "Preventas/PE", value: pctPreventasPE, fill: CRETTO_COLORS.emerald }
            ]}>
              <RadialBar minAngle={15} background dataKey="value" />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Utilidad por Escenario (MM)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={utilidadEscenarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="escenario" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => `$${v} MM`} />
              <Bar dataKey="utilidad">
                {utilidadEscenarios.map((_, i) => <Cell key={i} fill={i === 0 ? CRETTO_COLORS.rose : i === 1 ? CRETTO_COLORS.amber : CRETTO_COLORS.emerald} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <Section title="Curva ROI Proyectada en el Tiempo">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={roiTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fase" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} unit="%" />
            <Tooltip formatter={v => `${v}%`} />
            <Area type="monotone" dataKey="roi" stroke={CRETTO_COLORS.emerald} fill={CRETTO_COLORS.emerald + "44"} />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      {inversionistas.length > 0 && (
        <Section title="Aporte por Inversionista">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-stone-500"><tr className="border-b border-stone-200"><th className="px-2 py-1 text-left">Inversionista</th><th>% Participación</th><th>Aporte (COP)</th></tr></thead>
            <tbody>
              {inversionistas.map(i => (
                <tr key={i.id} className="border-b border-stone-100">
                  <td className="px-2 py-1 font-medium">{i.nombre}</td>
                  <td className="text-center">{i.pctParticipacion || "—"}%</td>
                  <td className="text-right">{fmtCop(i.aporteCop || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      <Section title="🚦 Semáforo Salud del Proyecto">
        <div className="grid grid-cols-5 gap-2">
          {[
            { d: "Alcance", e: "🟢" },
            { d: "Tiempo",  e: "🟡" },
            { d: "Costo",   e: "🟢" },
            { d: "Calidad", e: "🟢" },
            { d: "Riesgo",  e: "🟡" }
          ].map(s => (
            <div key={s.d} className="rounded border border-stone-200 bg-white p-2 text-center">
              <div className="text-2xl">{s.e}</div>
              <div className="text-[10px] uppercase text-stone-600">{s.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="rounded-md border border-rose-200 bg-rose-50/40 p-3">
        <strong>⚠️ Decisiones que requieren input del inversionista:</strong>
        <ol className="mt-1 list-decimal pl-5 space-y-0.5">
          <li>Aprobar pre-negociación de cupo confirming con Bancolombia (estima ahorro ~$120 MM)</li>
          <li>Confirmar aporte adicional contingencia ante posible demora licencia (2 semanas)</li>
          <li>Validar estrategia de incentivos para acelerar últimas 10 preventas</li>
        </ol>
      </div>

      <PreviewFooter />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Auxiliares de presentación
   ════════════════════════════════════════════════════════════════ */

function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3">
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
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800"
  };
  return (
    <div className={`rounded border p-2 ${colors[color]}`}>
      <div className="text-[9px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="font-mono text-sm font-semibold">{value}</div>
      {sub && <div className="text-[9px] opacity-70">{sub}</div>}
    </div>
  );
}

export default PMIReportLibrary;
