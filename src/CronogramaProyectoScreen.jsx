import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar, Flag, CheckCircle2, Circle, AlertCircle, Plus, Trash2,
  Briefcase, Landmark, FileText, Home, ShoppingBag, Key, X
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Cronograma de PROYECTO (gerencial)
   Distinto del Cronograma de CONSTRUCCIÓN (CronogramaProScreen.jsx)
   que detalla actividades de obra.

   Este vista muestra los hitos gerenciales del proyecto:
   diseño → licencias → preventas → punto de equilibrio → obra →
   escrituración → entrega copropiedad → liquidación P.A.

   Vista: timeline horizontal con bandas por fase + lista de hitos.
────────────────────────────────────────────────────────────────── */

const FASES = [
  { id: "diseño",         label: "Diseño y estudios",      icon: FileText,   color: "#6366f1" },
  { id: "licencias",      label: "Licencias y permisos",   icon: FileText,   color: "#ec4899" },
  { id: "preventas",      label: "Preventas y comercial",  icon: ShoppingBag,color: "#a855f7" },
  { id: "fiducia",        label: "Estructuración fiducia", icon: Briefcase,  color: "#0ea5e9" },
  { id: "financiacion",   label: "Crédito bancario",       icon: Landmark,   color: "#06b6d4" },
  { id: "construccion",   label: "Construcción",           icon: Home,       color: "#10b981" },
  { id: "entrega",        label: "Entrega y escrituración",icon: Key,        color: "#f59e0b" },
  { id: "cierre",         label: "Cierre y liquidación",   icon: Flag,       color: "#78716c" }
];

const SEED_HITOS = [
  { id: 1, fase: "diseño",       nombre: "Anteproyecto aprobado",            fecha: "2026-01-15", estado: "completado",  responsable: "Arquitecto" },
  { id: 2, fase: "diseño",       nombre: "Estudios técnicos completos (MEP + suelos)", fecha: "2026-02-28", estado: "completado", responsable: "Ingenierías" },
  { id: 3, fase: "licencias",    nombre: "Radicación licencia construcción", fecha: "2026-03-05", estado: "completado",  responsable: "Curaduría" },
  { id: 4, fase: "licencias",    nombre: "Licencia ejecutoriada",            fecha: "2026-04-05", estado: "completado",  responsable: "Curaduría" },
  { id: 5, fase: "fiducia",      nombre: "Constitución P.A. y contrato fiducia", fecha: "2026-02-15", estado: "completado", responsable: "Fiduciaria" },
  { id: 6, fase: "financiacion", nombre: "Aprobación cupo crédito constructor", fecha: "2026-04-20", estado: "completado", responsable: "Banco" },
  { id: 7, fase: "preventas",    nombre: "Apertura sala de ventas",          fecha: "2026-02-01", estado: "completado",  responsable: "Comercializadora" },
  { id: 8, fase: "preventas",    nombre: "Punto de equilibrio (70% preventas)", fecha: "2026-05-15", estado: "completado", responsable: "Comercializadora" },
  { id: 9, fase: "construccion", nombre: "Inicio de obra",                   fecha: "2026-05-20", estado: "completado",  responsable: "Constructor" },
  { id: 10, fase: "construccion", nombre: "Cimentación terminada",           fecha: "2026-08-30", estado: "en-curso",    responsable: "Constructor" },
  { id: 11, fase: "construccion", nombre: "Estructura terminada",            fecha: "2027-03-30", estado: "pendiente",   responsable: "Constructor" },
  { id: 12, fase: "construccion", nombre: "Mampostería y MEP terminados",    fecha: "2027-09-30", estado: "pendiente",   responsable: "Constructor" },
  { id: 13, fase: "construccion", nombre: "Acabados y entrega de obra",      fecha: "2028-02-15", estado: "pendiente",   responsable: "Constructor" },
  { id: 14, fase: "entrega",     nombre: "Inicio escrituración masiva",      fecha: "2028-03-01", estado: "pendiente",   responsable: "Fiduciaria" },
  { id: 15, fase: "entrega",     nombre: "Entrega a copropiedad",            fecha: "2028-05-30", estado: "pendiente",   responsable: "PM Cretto" },
  { id: 16, fase: "cierre",      nombre: "Liquidación del P.A.",             fecha: "2028-08-30", estado: "pendiente",   responsable: "Fiduciaria" }
];

const ESTADO_COLOR = {
  completado: { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-600" },
  "en-curso": { bg: "bg-amber-100",   text: "text-amber-800",   dot: "bg-amber-500" },
  pendiente:  { bg: "bg-stone-100",   text: "text-stone-700",   dot: "bg-stone-400" },
  retrasado:  { bg: "bg-rose-100",    text: "text-rose-800",    dot: "bg-rose-600" }
};

const CronogramaProyectoScreen = ({ project }) => {
  const [hitos, setHitos] = useState(SEED_HITOS);
  const [modal, setModal] = useState(null);
  const [filtroFase, setFiltroFase] = useState("all");

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:cronograma-proyecto:${project?.id || "default"}`);
        if (m && r && r.value) setHitos(JSON.parse(r.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:cronograma-proyecto:${project?.id || "default"}`, JSON.stringify(hitos)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [hitos, project?.id]);

  const visibles = useMemo(() => {
    return filtroFase === "all" ? hitos : hitos.filter(h => h.fase === filtroFase);
  }, [hitos, filtroFase]);

  /* Timeline range */
  const rango = useMemo(() => {
    if (hitos.length === 0) return null;
    const ds = hitos.map(h => new Date(h.fecha));
    const min = new Date(Math.min(...ds));
    const max = new Date(Math.max(...ds));
    return { min, max, dias: Math.max(1, (max - min) / 86400000) };
  }, [hitos]);

  const today = new Date();

  /* Months in range for timeline header */
  const meses = useMemo(() => {
    if (!rango) return [];
    const out = [];
    const d = new Date(rango.min.getFullYear(), rango.min.getMonth(), 1);
    while (d <= rango.max) {
      out.push(new Date(d));
      d.setMonth(d.getMonth() + 1);
    }
    return out;
  }, [rango]);

  const posPct = (fecha) => {
    if (!rango) return 0;
    return ((new Date(fecha) - rango.min) / 86400000) / rango.dias * 100;
  };

  const upsert = (data) => {
    if (data.id) setHitos(prev => prev.map(h => h.id === data.id ? data : h));
    else setHitos(prev => [...prev, { ...data, id: Math.max(0, ...prev.map(p => p.id)) + 1 }]);
    setModal(null);
  };

  const stats = useMemo(() => {
    return {
      total: hitos.length,
      completados: hitos.filter(h => h.estado === "completado").length,
      enCurso: hitos.filter(h => h.estado === "en-curso").length,
      retrasados: hitos.filter(h => h.estado !== "completado" && new Date(h.fecha) < today).length
    };
  }, [hitos]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Cronograma de Proyecto · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Hitos gerenciales del proyecto</h1>
          <p className="mt-1 text-sm text-stone-500">
            Vista gerencial: diseño → licencias → preventas → fiducia → construcción → escrituración → cierre. Distinto del <strong>Cronograma de Construcción</strong> (actividades detalladas de obra).
          </p>
        </div>
        <button onClick={() => setModal({})} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          <Plus className="h-4 w-4" /> Nuevo hito
        </button>
      </header>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        <Kpi label="Hitos totales" value={stats.total} />
        <Kpi label="Completados" value={stats.completados} color="emerald" />
        <Kpi label="En curso" value={stats.enCurso} color="amber" />
        <Kpi label="Retrasados" value={stats.retrasados} color="rose" />
      </div>

      {/* Filtros por fase */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <FaseChip label={`Todas (${hitos.length})`} active={filtroFase === "all"} onClick={() => setFiltroFase("all")} />
        {FASES.map(f => (
          <FaseChip key={f.id} label={`${f.label} (${hitos.filter(h => h.fase === f.id).length})`} active={filtroFase === f.id} onClick={() => setFiltroFase(f.id)} color={f.color} />
        ))}
      </div>

      {/* Timeline */}
      {rango && (
        <div className="mb-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
          <div className="border-b border-stone-200 bg-stone-50 px-4 py-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-stone-600">Línea de tiempo</h3>
          </div>
          <div className="p-4 pt-8">
            <div className="relative">
              {/* Meses — etiquetas rotadas + cambio de año destacado */}
              <div className="relative mb-3 h-14 border-b border-stone-200">
                {meses.map((m, idx) => {
                  const pct = posPct(m.toISOString().slice(0, 10));
                  const mes = m.toLocaleDateString("es-CO", { month: "short" }).replace(".", "");
                  const cambioAño = idx === 0 || m.getFullYear() !== meses[idx - 1].getFullYear();
                  return (
                    <div key={idx} className="absolute top-0 flex flex-col items-center" style={{ left: `${pct}%` }}>
                      {/* Tick mark */}
                      <div className={`w-px ${cambioAño ? "h-3 bg-stone-400" : "h-2 bg-stone-300"}`}></div>
                      {/* Etiqueta del mes inclinada */}
                      <div
                        className="origin-top-left whitespace-nowrap text-[9px] text-stone-600 font-mono"
                        style={{ transform: "rotate(-40deg)", marginTop: "2px" }}
                      >
                        {mes}{cambioAño && <span className="ml-0.5 font-bold text-stone-800">'{String(m.getFullYear()).slice(-2)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Línea hoy */}
              {today >= rango.min && today <= rango.max && (
                <div className="absolute top-0 h-full border-l-2 border-dashed border-rose-400" style={{ left: `${posPct(today.toISOString().slice(0, 10))}%` }}>
                  <span className="absolute -top-7 -translate-x-1/2 rounded bg-rose-500 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white shadow">Hoy</span>
                </div>
              )}
              {/* Filas por fase */}
              <div className="space-y-1.5 pt-2">
                {FASES.filter(f => filtroFase === "all" || f.id === filtroFase).map(f => {
                  const Ic = f.icon;
                  const hitosFase = visibles.filter(h => h.fase === f.id);
                  if (hitosFase.length === 0 && filtroFase === "all") return null;
                  return (
                    <div key={f.id} className="relative">
                      <div className="flex items-center gap-2">
                        <div className="flex w-44 items-center gap-1.5 text-[11px] text-stone-700">
                          <Ic className="h-3 w-3" style={{ color: f.color }} />
                          {f.label}
                        </div>
                        <div className="relative h-6 flex-1 rounded bg-stone-50">
                          {hitosFase.map(h => {
                            const pct = posPct(h.fecha);
                            const col = ESTADO_COLOR[h.estado] || ESTADO_COLOR.pendiente;
                            return (
                              <button
                                key={h.id}
                                onClick={() => setModal(h)}
                                title={`${h.nombre} · ${h.fecha} · ${h.responsable}`}
                                className={`absolute top-0 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-white shadow ${col.dot} hover:scale-125 transition-transform`}
                                style={{ left: `${pct}%`, background: f.color }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-3 py-2 text-left">Hito</th>
              <th className="px-3 py-2 text-left">Fase</th>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Responsable</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {visibles.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).map(h => {
              const f = FASES.find(x => x.id === h.fase) || FASES[0];
              const col = ESTADO_COLOR[h.estado] || ESTADO_COLOR.pendiente;
              const retrasado = h.estado !== "completado" && new Date(h.fecha) < today;
              return (
                <tr key={h.id} className={`border-t border-stone-100 hover:bg-stone-50/60 ${retrasado ? "bg-rose-50/30" : ""}`}>
                  <td className="px-3 py-2">
                    <button onClick={() => setModal(h)} className="text-left font-medium text-stone-900">{h.nombre}</button>
                  </td>
                  <td className="px-3 py-2"><span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: f.color + "22", color: f.color }}>{f.label}</span></td>
                  <td className="px-3 py-2 font-mono text-[12px]">{h.fecha}{retrasado && <AlertCircle className="ml-1 inline h-3 w-3 text-rose-600" />}</td>
                  <td className="px-3 py-2 text-stone-700">{h.responsable}</td>
                  <td className="px-3 py-2"><span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${col.bg} ${col.text}`}>{h.estado}</span></td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => setHitos(prev => prev.filter(x => x.id !== h.id))} className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal !== null && <HitoModal initial={modal.id ? modal : null} onClose={() => setModal(null)} onSave={upsert} />}
    </div>
  );
};

const Kpi = ({ label, value, color = "stone" }) => {
  const colors = {
    stone: "bg-stone-50 text-stone-800 border-stone-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200"
  };
  return (
    <div className={`rounded-md border p-3 ${colors[color]}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="font-serif text-2xl">{value}</div>
    </div>
  );
};

const FaseChip = ({ label, active, onClick, color }) => (
  <button onClick={onClick} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${active ? "ring-1 ring-stone-300" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`} style={active && color ? { background: color + "22", color, borderColor: color + "44" } : active ? { background: "rgb(231 229 228)", color: "rgb(41 37 36)" } : undefined}>
    {label}
  </button>
);

const HitoModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || {
    fase: "construccion", nombre: "", fecha: new Date().toISOString().slice(0, 10),
    estado: "pendiente", responsable: ""
  });
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">{initial ? "Editar hito" : "Nuevo hito"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-3 p-4">
          <Field label="Nombre del hito" required>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="inp" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fase">
              <select value={form.fase} onChange={e => setForm({ ...form, fase: e.target.value })} className="inp">
                {FASES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </Field>
            <Field label="Fecha">
              <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="inp" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Responsable">
              <input value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} className="inp" />
            </Field>
            <Field label="Estado">
              <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="inp">
                <option value="pendiente">Pendiente</option>
                <option value="en-curso">En curso</option>
                <option value="completado">Completado</option>
                <option value="retrasado">Retrasado</option>
              </select>
            </Field>
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

export default CronogramaProyectoScreen;
