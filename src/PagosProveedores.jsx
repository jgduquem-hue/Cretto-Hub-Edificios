import React, { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, X, Upload, Search, Filter, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { useResizableColumns, ResizableTh, ResetWidthsButton } from "./ResizableColumns.jsx";

/* ────────────────────────────────────────────────────────────────
   Pagos a proveedores — registro auxiliar enlazado al CAPEX por WBS
   - Cada pago: proveedor, descripción, monto, fecha, estado
     (causado / pagado), wbs, capitulo, soporte (factura)
   - Rollup por WBS alimenta el campo "ejecutado" (AC) del CAPEX
   - Persistencia: crettohub:pagos:<projectId>
────────────────────────────────────────────────────────────────── */

const ESTADOS = [
  { id: "causado", label: "Causado",  color: "amber" },
  { id: "pagado",  label: "Pagado",   color: "emerald" },
  { id: "rechazado", label: "Rechazado", color: "rose" }
];

const COLOR_CLASS = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  rose: "bg-rose-100 text-rose-800 border-rose-200",
  stone: "bg-stone-100 text-stone-700 border-stone-200"
};

const WBS_OPTIONS = [
  { v: "", label: "— Sin asignar —" },
  { v: "1", label: "1. Lote" },
  { v: "2", label: "2. Estudios" },
  { v: "3", label: "3. Licencias" },
  { v: "4.1", label: "4.1 Preliminares" },
  { v: "4.2", label: "4.2 Cimentación" },
  { v: "4.3", label: "4.3 Estructura" },
  { v: "4.4", label: "4.4 Mampostería" },
  { v: "4.5.1", label: "4.5.1 MEP Hidro" },
  { v: "4.5.2", label: "4.5.2 MEP Eléctrico" },
  { v: "4.5.3", label: "4.5.3 MEP HVAC" },
  { v: "4.6", label: "4.6 Acabados" },
  { v: "4.7", label: "4.7 Fachadas" },
  { v: "4.8", label: "4.8 Equipos" },
  { v: "4.9", label: "4.9 Urbanismo" },
  { v: "5.1", label: "5.1 Gerencia Cretto" },
  { v: "5.2", label: "5.2 Interventoría" },
  { v: "5.3", label: "5.3 Supervisión" },
  { v: "6", label: "6. Comercial" },
  { v: "7", label: "7. Financieros" },
  { v: "8", label: "8. Legales" },
  { v: "9", label: "9. Impuestos/Seguros" },
  { v: "10", label: "10. Imprevistos" }
];

const SEED_PAGOS = [
  { id: 1, fecha: "2026-05-15", proveedor: "Constructora ABC", descripcion: "Anticipo cimentación", monto: 800000000, estado: "pagado",  wbs: "4.2", soporte: "FA-001234.pdf" },
  { id: 2, fecha: "2026-05-22", proveedor: "Geotecnia SAS",    descripcion: "Estudio suelos final", monto: 47000000,  estado: "pagado",  wbs: "2",   soporte: "FA-CG-44.pdf" },
  { id: 3, fecha: "2026-05-28", proveedor: "Curaduría 2",       descripcion: "Licencia construcción", monto: 175000000, estado: "pagado",  wbs: "3",   soporte: "Recibo curaduría.pdf" },
  { id: 4, fecha: "2026-06-02", proveedor: "Acero del Sur",     descripcion: "Hierro estructura primer corte", monto: 280000000, estado: "causado", wbs: "4.3", soporte: "FA-AS-091.pdf" },
  { id: 5, fecha: "2026-06-10", proveedor: "Interventoría XYZ", descripcion: "Hon. interventoría mes 1", monto: 38000000,  estado: "pagado",  wbs: "5.2", soporte: "Cuenta cobro 001.pdf" }
];

const fmtCop = (n) => {
  const v = Math.round(parseFloat(n) || 0);
  if (Math.abs(v) >= 1000000000) return "$" + (v / 1000000000).toFixed(2) + " MMM";
  if (Math.abs(v) >= 1000000) return "$" + Math.round(v / 1000000).toLocaleString("es-CO").replace(/,/g, ".") + " MM";
  return "$" + v.toLocaleString("es-CO").replace(/,/g, ".");
};

/* Helper exportado: AC por WBS desde pagos */
export const acByWbs = (pagos, opts = {}) => {
  const incluirCausados = opts.incluirCausados !== false;
  const out = {};
  pagos.forEach(p => {
    if (p.estado === "rechazado") return;
    if (!incluirCausados && p.estado !== "pagado") return;
    if (!p.wbs) return;
    out[p.wbs] = (out[p.wbs] || 0) + (parseFloat(p.monto) || 0);
  });
  return out;
};

const PagosProveedores = ({ project, onPagosChange }) => {
  const [pagos, setPagos] = useState(SEED_PAGOS);
  const [modal, setModal] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("all");
  const [filtroWbs, setFiltroWbs] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:pagos:${project?.id || "default"}`);
        if (m && r && r.value) setPagos(JSON.parse(r.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:pagos:${project?.id || "default"}`, JSON.stringify(pagos)).catch(() => {});
    }, 500);
    if (onPagosChange) onPagosChange(pagos);
    return () => clearTimeout(t);
  }, [pagos, project?.id, onPagosChange]);

  const filtered = useMemo(() => {
    return pagos.filter(p => {
      if (filtroEstado !== "all" && p.estado !== filtroEstado) return false;
      if (filtroWbs !== "all" && p.wbs !== filtroWbs) return false;
      if (query) {
        const q = query.toLowerCase();
        return (p.proveedor || "").toLowerCase().includes(q) || (p.descripcion || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [pagos, filtroEstado, filtroWbs, query]);

  const stats = useMemo(() => {
    const acc = { pagado: 0, causado: 0, rechazado: 0 };
    pagos.forEach(p => { acc[p.estado] = (acc[p.estado] || 0) + (p.monto || 0); });
    return acc;
  }, [pagos]);

  /* Top 5 WBS con más pagado */
  const topWbs = useMemo(() => {
    const acc = acByWbs(pagos, { incluirCausados: false });
    return Object.entries(acc).map(([wbs, monto]) => ({ wbs, monto })).sort((a, b) => b.monto - a.monto).slice(0, 5);
  }, [pagos]);

  const upsert = (data) => {
    if (data.id && pagos.find(p => p.id === data.id)) {
      setPagos(prev => prev.map(p => p.id === data.id ? data : p));
    } else {
      const id = Math.max(0, ...pagos.map(p => p.id)) + 1;
      setPagos(prev => [{ ...data, id }, ...prev]);
    }
    setModal(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Pagos a proveedores · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Registro de pagos / facturación</h1>
          <p className="mt-1 text-sm text-stone-500">
            <ArrowRight className="mr-1 inline h-3.5 w-3.5" />
            Cada pago se enlaza a un WBS del CAPEX. La suma por WBS alimenta el campo <strong>Ejecutado (AC)</strong> del CAPEX y el EVM en vivo.
          </p>
        </div>
        <button onClick={() => setModal({})} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800">
          <Plus className="h-3.5 w-3.5" /> Nuevo pago
        </button>
      </header>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Kpi label="Total pagado" value={fmtCop(stats.pagado)} color="emerald" />
        <Kpi label="Causado (por pagar)" value={fmtCop(stats.causado)} color="amber" />
        <Kpi label="# Pagos" value={pagos.length} />
        <Kpi label="Top WBS" value={topWbs[0]?.wbs || "—"} sub={topWbs[0] ? fmtCop(topWbs[0].monto) : ""} />
      </div>

      {/* Filtros */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar proveedor o descripción…" className="w-full rounded-md border border-stone-300 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm">
          <option value="all">Todos los estados</option>
          {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
        <select value={filtroWbs} onChange={e => setFiltroWbs(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm">
          <option value="all">Todos los WBS</option>
          {WBS_OPTIONS.filter(w => w.v).map(w => <option key={w.v} value={w.v}>{w.label}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <PagosTable rows={filtered} onEdit={setModal} onDelete={(id) => setPagos(prev => prev.filter(x => x.id !== id))} />

      {/* Rollup AC por WBS */}
      <div className="mt-4 rounded-lg border border-stone-200 bg-white p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Suma de pagos por WBS — alimenta el AC del CAPEX</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {topWbs.map(t => (
            <div key={t.wbs} className="rounded-md border border-emerald-200 bg-emerald-50/40 p-2">
              <div className="font-mono text-[11px] font-semibold text-emerald-800">{t.wbs}</div>
              <div className="font-mono text-sm">{fmtCop(t.monto)}</div>
            </div>
          ))}
        </div>
      </div>

      {modal !== null && <PagoModal initial={modal.id ? modal : null} onClose={() => setModal(null)} onSave={upsert} />}
    </div>
  );
};

const PagosTable = ({ rows, onEdit, onDelete }) => {
  const cols = useResizableColumns("pagos.lista", {
    fecha: 100, proveedor: 180, descripcion: 260, wbs: 90, monto: 110, estado: 100, soporte: 180, acc: 50
  });
  const th = "border-b border-stone-200 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500";
  return (
    <>
      <div className="mb-1 flex justify-end"><ResetWidthsButton onReset={cols.reset} /></div>
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="text-[12px]">
          <thead className="bg-stone-50">
            <tr>
              <ResizableTh w={cols.w("fecha")} onResize={cols.r("fecha")} className={th}>Fecha</ResizableTh>
              <ResizableTh w={cols.w("proveedor")} onResize={cols.r("proveedor")} className={th}>Proveedor</ResizableTh>
              <ResizableTh w={cols.w("descripcion")} onResize={cols.r("descripcion")} className={th}>Descripción</ResizableTh>
              <ResizableTh w={cols.w("wbs")} onResize={cols.r("wbs")} className={th}>WBS</ResizableTh>
              <ResizableTh w={cols.w("monto")} onResize={cols.r("monto")} align="right" className={th}>Monto</ResizableTh>
              <ResizableTh w={cols.w("estado")} onResize={cols.r("estado")} className={th}>Estado</ResizableTh>
              <ResizableTh w={cols.w("soporte")} onResize={cols.r("soporte")} className={th}>Soporte</ResizableTh>
              <ResizableTh w={cols.w("acc")} onResize={cols.r("acc")} align="center" className={th}></ResizableTh>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-stone-400">Sin pagos para los filtros aplicados.</td></tr>}
            {rows.map(p => {
              const est = ESTADOS.find(e => e.id === p.estado) || ESTADOS[0];
              const tdBase = "px-3 py-1.5 overflow-hidden";
              return (
                <tr key={p.id} className="border-t border-stone-100 hover:bg-stone-50/60">
                  <td className={`${tdBase} font-mono text-[11px] text-stone-600`} style={cols.s("fecha")}>{p.fecha}</td>
                  <td className={tdBase} style={cols.s("proveedor")}><button onClick={() => onEdit(p)} className="text-left font-medium text-stone-900">{p.proveedor}</button></td>
                  <td className={`${tdBase} text-stone-700`} style={cols.s("descripcion")}>{p.descripcion}</td>
                  <td className={tdBase} style={cols.s("wbs")}>
                    {p.wbs
                      ? <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">{p.wbs}</span>
                      : <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800" title="Sin WBS no se cuenta como AC">Sin WBS</span>}
                  </td>
                  <td className={`${tdBase} text-right font-mono`} style={cols.s("monto")}>{fmtCop(p.monto)}</td>
                  <td className={tdBase} style={cols.s("estado")}><span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${COLOR_CLASS[est.color]}`}>{est.label}</span></td>
                  <td className={`${tdBase} text-[11px] text-stone-500`} style={cols.s("soporte")}>{p.soporte ? <>📎 {p.soporte}</> : "—"}</td>
                  <td className={`${tdBase} text-right`} style={cols.s("acc")}>
                    <button onClick={() => { if (confirm("¿Eliminar pago?")) onDelete(p.id); }} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

const Kpi = ({ label, value, color = "stone", sub }) => {
  const colors = {
    stone: "bg-stone-50 text-stone-800 border-stone-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200"
  };
  return (
    <div className={`rounded-md border p-3 ${colors[color]}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="font-serif text-lg">{value}</div>
      {sub && <div className="text-[10px] opacity-70">{sub}</div>}
    </div>
  );
};

const PagoModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || {
    fecha: new Date().toISOString().slice(0, 10), proveedor: "", descripcion: "",
    monto: "", estado: "causado", wbs: "", soporte: ""
  });
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">{initial ? "Editar pago" : "Nuevo pago"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha"><input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="inp" /></Field>
            <Field label="Estado">
              <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="inp">
                {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Proveedor" required><input value={form.proveedor} onChange={e => setForm({ ...form, proveedor: e.target.value })} className="inp" placeholder="Ej. Constructora ABC" /></Field>
          <Field label="Descripción"><input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="inp" placeholder="Ej. Anticipo cimentación" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Monto (COP)" required><input type="number" value={form.monto} onChange={e => setForm({ ...form, monto: parseFloat(e.target.value) || 0 })} className="inp" /></Field>
            <Field label="WBS del CAPEX">
              <select value={form.wbs} onChange={e => setForm({ ...form, wbs: e.target.value })} className="inp">
                {WBS_OPTIONS.map(w => <option key={w.v} value={w.v}>{w.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Soporte (factura / cuenta de cobro)"><input value={form.soporte} onChange={e => setForm({ ...form, soporte: e.target.value })} className="inp" placeholder="Ej. FA-001234.pdf" /></Field>
        </div>
        <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
          <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!form.proveedor.trim() || !form.monto} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">Guardar</button>
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

export default PagosProveedores;
