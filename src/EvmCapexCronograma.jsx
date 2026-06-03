import React, { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock,
  Hammer, Link as LinkIcon, ArrowRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine, ComposedChart, Line
} from "recharts";
import { WBS_CONSTRUCCION } from "./CapexEdificios.jsx";
import { computeEvmGlobal, matchTareas } from "./capexCronoLink.js";

/* ────────────────────────────────────────────────────────────────
   EVM por paquete WBS — une CAPEX y Cronograma
   - Toma WBS_CONSTRUCCION (paquetes 4.1 … 4.9)
   - Para cada paquete:
     · BAC = constructor vigente || inicial
     · PV = BAC × % planeado de tareas mapeadas
     · EV = BAC × % real de tareas mapeadas
     · AC = ejecutado
     · CPI, SPI, CV, SV, EAC, VAC
────────────────────────────────────────────────────────────────── */

const fmtCop = (n) => {
  const v = Math.round(parseFloat(n) || 0);
  if (Math.abs(v) >= 1000000000) return "$" + (v / 1000000000).toFixed(2) + " MMM";
  if (Math.abs(v) >= 1000000) return "$" + Math.round(v / 1000000).toLocaleString("es-CO").replace(/,/g, ".") + " MM";
  return "$" + v.toLocaleString("es-CO").replace(/,/g, ".");
};
const fmtNum = (n, d = 2) => n == null ? "—" : Number(n).toFixed(d);
const fmtPct = (n) => n == null ? "—" : Number(n).toFixed(1) + "%";

const STATUS_COLOR = {
  OK: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Atención: "bg-amber-100 text-amber-800 border-amber-200",
  Atraso: "bg-rose-100 text-rose-800 border-rose-200",
  Sobrecosto: "bg-rose-100 text-rose-800 border-rose-200",
  "Sin datos": "bg-stone-100 text-stone-600 border-stone-200"
};

const EvmCapexCronograma = ({ project, partidas = [], tareas = [] }) => {
  const [hoy, setHoy] = useState(new Date().toISOString().slice(0, 10));

  const { rows, totals } = useMemo(() => {
    return computeEvmGlobal(partidas, tareas, WBS_CONSTRUCCION, { hoy: new Date(hoy) });
  }, [partidas, tareas, hoy]);

  /* Datos para gráfico de barras PV/EV/AC */
  const chartData = rows.map(r => ({
    wbs: r.wbs,
    label: r.label.length > 18 ? r.label.slice(0, 18) + "…" : r.label,
    BAC: r.bac / 1000000,
    PV: r.pv / 1000000,
    EV: r.ev / 1000000,
    AC: r.ac / 1000000
  }));

  /* Si no hay tareas mapeadas en ningún paquete, mostrar guía */
  const algunMatch = rows.some(r => r.tareas.length > 0);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">EVM por WBS · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">CAPEX ↔ Cronograma — Earned Value</h1>
          <p className="mt-1 text-sm text-stone-500">
            <LinkIcon className="mr-1 inline h-3.5 w-3.5" />
            Cada paquete WBS del CAPEX se sincroniza con las tareas del cronograma para calcular Valor Ganado (EV), CPI y SPI a la fecha.
          </p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white px-3 py-2">
          <label className="text-[10px] uppercase tracking-wider text-stone-500">Fecha de corte</label>
          <input type="date" value={hoy} onChange={e => setHoy(e.target.value)} className="ml-2 text-[12px]" />
        </div>
      </header>

      {!algunMatch && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-900">
          <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
          <strong>Ninguna tarea del cronograma se mapea a los paquetes WBS.</strong> Para que el EVM funcione, las tareas del cronograma deben llamarse igual al cronoTask del nodo WBS (estructura, mep, fachadas…) o tener el campo <code className="rounded bg-amber-100 px-1">wbsKey</code> configurado.
        </div>
      )}

      {/* KPIs globales */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
        <Kpi label="BAC" value={fmtCop(totals.bac)} sub="Presupuesto al final" />
        <Kpi label="PV" value={fmtCop(totals.pv)} sub="Valor planeado" color="indigo" />
        <Kpi label="EV" value={fmtCop(totals.ev)} sub="Valor ganado" color="emerald" />
        <Kpi label="AC" value={fmtCop(totals.ac)} sub="Costo actual" color="rose" />
        <Kpi label="CPI" value={fmtNum(totals.cpi)} sub={totals.cpi >= 1 ? "Bajo presupuesto" : totals.cpi < 0.9 ? "Sobrecosto" : "Vigilar"} color={totals.cpi >= 1 ? "emerald" : totals.cpi < 0.9 ? "rose" : "amber"} />
        <Kpi label="SPI" value={fmtNum(totals.spi)} sub={totals.spi >= 1 ? "En plazo" : totals.spi < 0.9 ? "Atraso" : "Vigilar"} color={totals.spi >= 1 ? "emerald" : totals.spi < 0.9 ? "rose" : "amber"} />
        <Kpi label="EAC" value={fmtCop(totals.eac)} sub={`VAC ${fmtCop(totals.vac)}`} color={totals.vac >= 0 ? "emerald" : "rose"} />
      </div>

      {/* Gráfico */}
      <div className="mb-4 rounded-lg border border-stone-200 bg-white p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">PV / EV / AC por paquete WBS (MM COP)</h3>
        <div className="h-80">
          <ResponsiveContainer>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `$ ${Math.round(v).toLocaleString("es-CO")} MM`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="BAC" fill="#a8a29e" />
              <Bar dataKey="PV" fill="#6366f1" />
              <Bar dataKey="EV" fill="#10b981" />
              <Bar dataKey="AC" fill="#f43f5e" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-3 py-2 text-left">WBS</th>
              <th className="px-3 py-2 text-left">Paquete</th>
              <th className="px-3 py-2 text-left">Tareas cronograma</th>
              <th className="px-3 py-2 text-right">% plan</th>
              <th className="px-3 py-2 text-right">% real</th>
              <th className="px-3 py-2 text-right">BAC</th>
              <th className="px-3 py-2 text-right">PV</th>
              <th className="px-3 py-2 text-right">EV</th>
              <th className="px-3 py-2 text-right">AC</th>
              <th className="px-3 py-2 text-right">CPI</th>
              <th className="px-3 py-2 text-right">SPI</th>
              <th className="px-3 py-2 text-right">EAC</th>
              <th className="px-3 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const status = r.tareas.length === 0 ? "Sin datos" : r.status;
              return (
                <tr key={r.wbs} className="border-t border-stone-100">
                  <td className="px-3 py-1.5 font-mono text-[11px]">{r.wbs}</td>
                  <td className="px-3 py-1.5 text-stone-800">{r.label}</td>
                  <td className="px-3 py-1.5 text-[11px] text-stone-600">
                    {r.tareas.length === 0 ? <span className="italic text-stone-400">— sin match —</span> : r.tareas.map(t => t.nombre).slice(0, 2).join(" · ") + (r.tareas.length > 2 ? ` +${r.tareas.length - 2}` : "")}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono">{fmtPct(r.pctPlan)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{fmtPct(r.pctReal)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{fmtCop(r.bac)}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-indigo-700">{fmtCop(r.pv)}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-emerald-700">{fmtCop(r.ev)}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-rose-700">{fmtCop(r.ac)}</td>
                  <td className={`px-3 py-1.5 text-right font-mono font-semibold ${r.cpi == null ? "text-stone-400" : r.cpi >= 1 ? "text-emerald-700" : r.cpi < 0.9 ? "text-rose-700" : "text-amber-700"}`}>{fmtNum(r.cpi)}</td>
                  <td className={`px-3 py-1.5 text-right font-mono font-semibold ${r.spi == null ? "text-stone-400" : r.spi >= 1 ? "text-emerald-700" : r.spi < 0.9 ? "text-rose-700" : "text-amber-700"}`}>{fmtNum(r.spi)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{fmtCop(r.eac)}</td>
                  <td className="px-3 py-1.5"><span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[status]}`}>{status}</span></td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-stone-300 bg-stone-50 font-semibold">
              <td className="px-3 py-2"></td>
              <td className="px-3 py-2">Total construcción</td>
              <td></td>
              <td></td>
              <td></td>
              <td className="px-3 py-2 text-right font-mono">{fmtCop(totals.bac)}</td>
              <td className="px-3 py-2 text-right font-mono text-indigo-700">{fmtCop(totals.pv)}</td>
              <td className="px-3 py-2 text-right font-mono text-emerald-700">{fmtCop(totals.ev)}</td>
              <td className="px-3 py-2 text-right font-mono text-rose-700">{fmtCop(totals.ac)}</td>
              <td className={`px-3 py-2 text-right font-mono ${totals.cpi >= 1 ? "text-emerald-700" : "text-rose-700"}`}>{fmtNum(totals.cpi)}</td>
              <td className={`px-3 py-2 text-right font-mono ${totals.spi >= 1 ? "text-emerald-700" : "text-rose-700"}`}>{fmtNum(totals.spi)}</td>
              <td className="px-3 py-2 text-right font-mono">{fmtCop(totals.eac)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-md border border-stone-200 bg-stone-50 p-3 text-[11px] text-stone-600">
        <strong>Cómo se mapea CAPEX ↔ Cronograma:</strong>
        <ul className="mt-1 list-disc pl-5 space-y-0.5">
          <li>Cada nodo WBS del CAPEX tiene un <code className="rounded bg-stone-200 px-1">cronoTask</code> (estructura, mep, fachadas, …).</li>
          <li>El helper <code className="rounded bg-stone-200 px-1">matchTareas()</code> busca tareas del cronograma por <code>wbsKey</code> exacto o por nombre que contenga el cronoTask.</li>
          <li>BAC = constructor vigente (o inicial si no hay constructor). EV = BAC × % real ponderado por duración. PV = BAC × % planeado a la fecha.</li>
          <li>Para máxima precisión, asigna <code className="rounded bg-stone-200 px-1">wbsKey</code> en cada tarea del cronograma.</li>
        </ul>
      </div>
    </div>
  );
};

const Kpi = ({ label, value, sub, color = "stone" }) => {
  const colors = {
    stone: "bg-stone-50 border-stone-200 text-stone-800",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
    rose: "bg-rose-50 border-rose-200 text-rose-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800"
  };
  return (
    <div className={`rounded-md border p-2 ${colors[color]}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="font-serif text-base">{value}</div>
      {sub && <div className="text-[9px] opacity-70">{sub}</div>}
    </div>
  );
};

export default EvmCapexCronograma;
