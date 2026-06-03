import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2, Circle, AlertCircle, Plus, Trash2, Search, Filter,
  Calendar, User, ArrowUpCircle, Flag, X, Clock, Tag
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Módulo de Pendientes — seguimiento de actividades
   Las actividades pueden venir de:
   - Creación manual
   - Reuniones (módulo Reuniones empuja vía onAddPendientes)
   - Cambios de alcance (cambios)
   - Comités fiduciarios

   Vistas: Lista, Kanban por estado, agrupado por responsable.
────────────────────────────────────────────────────────────────── */

const PRIORIDADES = [
  { id: "alta",   label: "Alta",   color: "rose" },
  { id: "media",  label: "Media",  color: "amber" },
  { id: "baja",   label: "Baja",   color: "stone" }
];

const ESTADOS = [
  { id: "pendiente",  label: "Pendiente",  color: "stone" },
  { id: "en-curso",   label: "En curso",   color: "blue" },
  { id: "bloqueado",  label: "Bloqueado",  color: "rose" },
  { id: "completado", label: "Completado", color: "emerald" }
];

const CATEGORIAS = [
  "Obra", "Diseño", "Licencias", "Fiducia", "Banco", "Comercial",
  "Legal", "Compras", "MEP", "Acabados", "Calidad", "Otro"
];

const COLOR_CLASS = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  blue:    "bg-blue-100 text-blue-800 border-blue-200",
  amber:   "bg-amber-100 text-amber-800 border-amber-200",
  rose:    "bg-rose-100 text-rose-800 border-rose-200",
  stone:   "bg-stone-100 text-stone-700 border-stone-200"
};

const SEED = [
  { id: 1, descripcion: "Confirmar color RAL de fachada con arquitecto", responsable: "Arquitecto", categoria: "Diseño", prioridad: "alta", estado: "pendiente", fecha: "2026-05-29", origen: "Comité semanal #18", notas: "" },
  { id: 2, descripcion: "Enviar cuadro de ventas mensual a fiduciaria", responsable: "Comercializadora", categoria: "Fiducia", prioridad: "media", estado: "en-curso", fecha: "2026-05-31", origen: "Comité semanal #18", notas: "" },
  { id: 3, descripcion: "Gestionar pago anticipo estructura metálica", responsable: "PM Cretto", categoria: "Compras", prioridad: "alta", estado: "bloqueado", fecha: "2026-05-25", origen: "Manual", notas: "Esperando aprobación fiduciaria" }
];

const Pendientes = ({ project, registerAdder }) => {
  const [items, setItems] = useState(SEED);
  const [view, setView] = useState("lista"); // lista | kanban | responsable
  const [query, setQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("activos"); // activos | all | + estados
  const [filtroPrioridad, setFiltroPrioridad] = useState("all");
  const [filtroResp, setFiltroResp] = useState("all");
  const [modal, setModal] = useState(null);

  /* Persistencia */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:pendientes:${project?.id || "default"}`);
        if (m && r && r.value) setItems(JSON.parse(r.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:pendientes:${project?.id || "default"}`, JSON.stringify(items)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [items, project?.id]);

  /* Exponer "adder" externo (para Reuniones, Cambios, etc.) */
  useEffect(() => {
    if (registerAdder) {
      registerAdder((nuevos) => {
        const baseId = Math.max(0, ...items.map(i => i.id)) + 1;
        const conIds = nuevos.map((n, idx) => ({
          id: baseId + idx,
          descripcion: n.descripcion || "Sin descripción",
          responsable: n.responsable || "Por asignar",
          categoria: n.categoria || "Otro",
          prioridad: n.prioridad || "media",
          estado: n.estado || "pendiente",
          fecha: n.fecha || new Date().toISOString().slice(0, 10),
          origen: n.origen || "Manual",
          notas: n.notas || ""
        }));
        setItems(prev => [...conIds, ...prev]);
      });
    }
  }, [registerAdder, items]);

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (filtroEstado === "activos" && i.estado === "completado") return false;
      if (filtroEstado !== "activos" && filtroEstado !== "all" && i.estado !== filtroEstado) return false;
      if (filtroPrioridad !== "all" && i.prioridad !== filtroPrioridad) return false;
      if (filtroResp !== "all" && i.responsable !== filtroResp) return false;
      if (query) {
        const q = query.toLowerCase();
        return i.descripcion.toLowerCase().includes(q) || (i.responsable || "").toLowerCase().includes(q) || (i.notas || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, query, filtroEstado, filtroPrioridad, filtroResp]);

  const responsables = useMemo(() => Array.from(new Set(items.map(i => i.responsable).filter(Boolean))), [items]);

  const stats = useMemo(() => {
    const activos = items.filter(i => i.estado !== "completado");
    return {
      total: items.length,
      activos: activos.length,
      vencidos: activos.filter(i => i.fecha < today).length,
      hoy: activos.filter(i => i.fecha === today).length,
      bloqueados: items.filter(i => i.estado === "bloqueado").length,
      completados: items.filter(i => i.estado === "completado").length
    };
  }, [items, today]);

  const upsert = (data) => {
    if (data.id && items.find(i => i.id === data.id)) {
      setItems(prev => prev.map(i => i.id === data.id ? data : i));
    } else {
      const id = Math.max(0, ...items.map(i => i.id)) + 1;
      setItems(prev => [{ ...data, id }, ...prev]);
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    if (!confirm("¿Eliminar pendiente?")) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const toggleEstado = (i) => {
    const next = i.estado === "completado" ? "pendiente" : "completado";
    setItems(prev => prev.map(x => x.id === i.id ? { ...x, estado: next } : x));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Pendientes · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Seguimiento de actividades</h1>
        </div>
        <button onClick={() => setModal({})} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          <Plus className="h-4 w-4" /> Nuevo pendiente
        </button>
      </header>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        <Kpi label="Activos" value={stats.activos} color="emerald" />
        <Kpi label="Vencidos" value={stats.vencidos} color="rose" icon={AlertCircle} />
        <Kpi label="Para hoy" value={stats.hoy} color="amber" icon={Clock} />
        <Kpi label="Bloqueados" value={stats.bloqueados} color="rose" />
        <Kpi label="Completados" value={stats.completados} color="stone" />
      </div>

      {/* Filtros + view switch */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar…" className="w-full rounded-md border border-stone-300 bg-white py-1.5 pl-8 pr-3 text-sm placeholder-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm">
          <option value="activos">Activos</option>
          <option value="all">Todos los estados</option>
          {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
        <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm">
          <option value="all">Toda prioridad</option>
          {PRIORIDADES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select value={filtroResp} onChange={e => setFiltroResp(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm">
          <option value="all">Todo responsable</option>
          {responsables.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <div className="ml-auto inline-flex rounded-md border border-stone-300 bg-white p-0.5">
          {["lista", "kanban", "responsable"].map(v => (
            <button key={v} onClick={() => setView(v)} className={`rounded px-2 py-1 text-[11px] font-medium ${view === v ? "bg-emerald-700 text-white" : "text-stone-600 hover:text-stone-900"}`}>
              {v === "lista" ? "Lista" : v === "kanban" ? "Kanban" : "Por responsable"}
            </button>
          ))}
        </div>
      </div>

      {/* Vistas */}
      {view === "lista" && (
        <ListaView items={filtered} today={today} onEdit={(i) => setModal(i)} onToggle={toggleEstado} onDelete={handleDelete} />
      )}
      {view === "kanban" && (
        <KanbanView items={filtered} onEdit={(i) => setModal(i)} onMove={(i, estado) => setItems(prev => prev.map(x => x.id === i.id ? { ...x, estado } : x))} />
      )}
      {view === "responsable" && (
        <ResponsableView items={filtered} onEdit={(i) => setModal(i)} onToggle={toggleEstado} today={today} />
      )}

      {modal !== null && <PendienteModal initial={modal.id ? modal : null} onClose={() => setModal(null)} onSave={upsert} />}
    </div>
  );
};

const Kpi = ({ label, value, color, icon: Icon }) => (
  <div className={`rounded-md border p-3 ${COLOR_CLASS[color]}`}>
    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider opacity-80">
      {Icon && <Icon className="h-3 w-3" />} {label}
    </div>
    <div className="font-serif text-2xl">{value}</div>
  </div>
);

const PrioPill = ({ p }) => {
  const cfg = PRIORIDADES.find(x => x.id === p) || PRIORIDADES[1];
  return <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold ${COLOR_CLASS[cfg.color]}`}>{cfg.label}</span>;
};

const EstadoPill = ({ e }) => {
  const cfg = ESTADOS.find(x => x.id === e) || ESTADOS[0];
  return <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold ${COLOR_CLASS[cfg.color]}`}>{cfg.label}</span>;
};

const ListaView = ({ items, today, onEdit, onToggle, onDelete }) => (
  <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
    <table className="w-full text-[13px]">
      <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
        <tr>
          <th className="w-8 px-3 py-2"></th>
          <th className="px-3 py-2 text-left">Actividad</th>
          <th className="px-3 py-2 text-left">Responsable</th>
          <th className="px-3 py-2 text-left">Categoría</th>
          <th className="px-3 py-2 text-left">Prioridad</th>
          <th className="px-3 py-2 text-left">Estado</th>
          <th className="px-3 py-2 text-left">Fecha</th>
          <th className="px-3 py-2 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 && (
          <tr><td colSpan={8} className="px-3 py-8 text-center text-stone-400">Sin pendientes para los filtros aplicados.</td></tr>
        )}
        {items.map(i => {
          const vencido = i.estado !== "completado" && i.fecha < today;
          return (
            <tr key={i.id} className={`border-t border-stone-100 hover:bg-stone-50/60 ${vencido ? "bg-rose-50/30" : ""}`}>
              <td className="px-3 py-2">
                <button onClick={() => onToggle(i)} title="Marcar completado">
                  {i.estado === "completado" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-stone-300" />}
                </button>
              </td>
              <td className="px-3 py-2">
                <button onClick={() => onEdit(i)} className="text-left">
                  <div className={`font-medium ${i.estado === "completado" ? "text-stone-400 line-through" : "text-stone-900"}`}>{i.descripcion}</div>
                  {i.origen && <div className="text-[10px] text-stone-400">{i.origen}</div>}
                </button>
              </td>
              <td className="px-3 py-2 text-stone-700">{i.responsable}</td>
              <td className="px-3 py-2"><span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600">{i.categoria}</span></td>
              <td className="px-3 py-2"><PrioPill p={i.prioridad} /></td>
              <td className="px-3 py-2"><EstadoPill e={i.estado} /></td>
              <td className={`px-3 py-2 text-[12px] ${vencido ? "font-semibold text-rose-700" : "text-stone-500"}`}>
                {vencido && <AlertCircle className="mr-0.5 inline h-3 w-3" />}
                {i.fecha}
              </td>
              <td className="px-3 py-2 text-right">
                <button onClick={() => onDelete(i.id)} className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const KanbanView = ({ items, onEdit, onMove }) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
    {ESTADOS.map(est => {
      const cols = items.filter(i => i.estado === est.id);
      return (
        <div key={est.id} className="rounded-lg border border-stone-200 bg-stone-50/40 p-2">
          <div className="mb-2 flex items-center justify-between px-1">
            <EstadoPill e={est.id} />
            <span className="text-[11px] text-stone-500">{cols.length}</span>
          </div>
          <div className="space-y-1.5">
            {cols.map(i => (
              <div key={i.id} className="rounded border border-stone-200 bg-white p-2 text-[12px] shadow-sm">
                <button onClick={() => onEdit(i)} className="block text-left font-medium text-stone-900">{i.descripcion}</button>
                <div className="mt-1 flex items-center justify-between text-[10px] text-stone-500">
                  <span>{i.responsable}</span>
                  <PrioPill p={i.prioridad} />
                </div>
                <div className="mt-1 flex gap-0.5">
                  {ESTADOS.filter(e => e.id !== i.estado).map(e => (
                    <button key={e.id} onClick={() => onMove(i, e.id)} className="rounded bg-stone-100 px-1 py-0.5 text-[9px] text-stone-600 hover:bg-stone-200" title={`Mover a ${e.label}`}>→ {e.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const ResponsableView = ({ items, onEdit, onToggle, today }) => {
  const grupos = useMemo(() => {
    const g = {};
    items.forEach(i => { (g[i.responsable] = g[i.responsable] || []).push(i); });
    return g;
  }, [items]);
  return (
    <div className="space-y-3">
      {Object.entries(grupos).map(([resp, lista]) => (
        <div key={resp} className="rounded-lg border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-stone-500" />
              <span className="font-medium text-stone-900">{resp}</span>
            </div>
            <span className="text-[11px] text-stone-500">{lista.length} pendientes</span>
          </div>
          <div className="divide-y divide-stone-100">
            {lista.map(i => {
              const vencido = i.estado !== "completado" && i.fecha < today;
              return (
                <div key={i.id} className={`flex items-center gap-2 px-3 py-1.5 text-[12px] ${vencido ? "bg-rose-50/30" : ""}`}>
                  <button onClick={() => onToggle(i)}>
                    {i.estado === "completado" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-stone-300" />}
                  </button>
                  <button onClick={() => onEdit(i)} className="flex-1 text-left">
                    <span className={`${i.estado === "completado" ? "text-stone-400 line-through" : "text-stone-800"}`}>{i.descripcion}</span>
                  </button>
                  <PrioPill p={i.prioridad} />
                  <EstadoPill e={i.estado} />
                  <span className={`font-mono text-[11px] ${vencido ? "font-semibold text-rose-700" : "text-stone-500"}`}>{i.fecha}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const PendienteModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || {
    descripcion: "", responsable: "", categoria: "Obra", prioridad: "media",
    estado: "pendiente", fecha: new Date().toISOString().slice(0, 10), origen: "Manual", notas: ""
  });
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">{initial ? "Editar pendiente" : "Nuevo pendiente"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-3 p-4">
          <Field label="Actividad / compromiso" required>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={2} className="inp" placeholder="Ej. Confirmar especificación de ascensores con proveedor" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Responsable">
              <input value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} className="inp" placeholder="Quién ejecuta" />
            </Field>
            <Field label="Fecha compromiso">
              <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="inp" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Categoría">
              <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="inp">
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Prioridad">
              <select value={form.prioridad} onChange={e => setForm({ ...form, prioridad: e.target.value })} className="inp">
                {PRIORIDADES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="inp">
                {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Origen">
            <input value={form.origen} onChange={e => setForm({ ...form, origen: e.target.value })} className="inp" placeholder="Manual, Reunión, Cambio…" />
          </Field>
          <Field label="Notas">
            <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} rows={2} className="inp" />
          </Field>
        </div>
        <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
          <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!form.descripcion.trim()} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">Guardar</button>
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

export default Pendientes;
