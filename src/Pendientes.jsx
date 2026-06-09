import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2, Circle, AlertCircle, Plus, Trash2, Search, Filter,
  Calendar, User, ArrowUpCircle, Flag, X, Clock, Tag, MessageSquare,
  ChevronRight, ChevronDown, ListTree, Send, Paperclip, Edit3
} from "lucide-react";
import { useResizableColumns, ResizableTh, ResetWidthsButton } from "./ResizableColumns.jsx";

/* ────────────────────────────────────────────────────────────────
   Pendientes — Notion-style task management
   - Actividades anidadas (sub-tareas con parentId)
   - Bitácora de comentarios por actividad
   - 3 vistas: lista (con árbol), kanban, por responsable
   - Detail drawer con pestañas: Detalles · Sub-tareas · Bitácora
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
  {
    id: 1, parentId: null, descripcion: "Cerrar condiciones de giro Alianza Fiduciaria",
    responsable: "PM Cretto", categoria: "Fiducia", prioridad: "alta", estado: "en-curso",
    fecha: "2026-07-25", origen: "Comité semanal", notas: "Es la ruta crítica antes del 1-ago",
    comentarios: [
      { id: 1, fecha: "2026-06-08T10:30:00", autor: "PM Cretto", texto: "Reunión inicial con Alianza programada para el 10-jun." }
    ]
  },
  {
    id: 2, parentId: 1, descripcion: "Recolectar 60% preventas firmadas (28 aptos)",
    responsable: "Paola de Lima", categoria: "Comercial", prioridad: "alta", estado: "pendiente",
    fecha: "2026-07-20", origen: "Sub-tarea", notas: "",
    comentarios: []
  },
  {
    id: 3, parentId: 1, descripcion: "Recaudar 40% del valor del 60% como cuota inicial",
    responsable: "Paola de Lima", categoria: "Comercial", prioridad: "alta", estado: "pendiente",
    fecha: "2026-07-22", origen: "Sub-tarea", notas: "≈ $19.000 MM",
    comentarios: []
  },
  {
    id: 4, parentId: 1, descripcion: "Constituir pólizas (Cumplimiento + TRC + RC)",
    responsable: "Penta Ingenieros", categoria: "Legal", prioridad: "alta", estado: "pendiente",
    fecha: "2026-07-20", origen: "Sub-tarea", notas: "",
    comentarios: []
  },
  {
    id: 5, parentId: null, descripcion: "Obtener licencia de construcción ejecutoriada",
    responsable: "G Arquitectura", categoria: "Licencias", prioridad: "alta", estado: "en-curso",
    fecha: "2026-06-10", origen: "Manual", notas: "Por salir esta semana",
    comentarios: [
      { id: 1, fecha: "2026-06-05T09:00:00", autor: "G Arquitectura", texto: "Curaduría confirmó que el acto administrativo sale el viernes." }
    ]
  },
  {
    id: 6, parentId: null, descripcion: "Aprobar cupo crédito constructor Banco Occidente",
    responsable: "PM Cretto", categoria: "Banco", prioridad: "alta", estado: "pendiente",
    fecha: "2026-07-15", origen: "Manual", notas: "",
    comentarios: []
  }
];

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const Pendientes = ({ project, registerAdder }) => {
  const [items, setItems] = useState(SEED);
  const [view, setView] = useState("lista");
  const [query, setQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("activos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("all");
  const [filtroResp, setFiltroResp] = useState("all");
  const [detailId, setDetailId] = useState(null);
  const [colapsados, setColapsados] = useState({}); // id → true si está colapsado

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

  /* Adder externo (Reuniones → Pendientes) */
  useEffect(() => {
    if (registerAdder) {
      registerAdder((nuevos) => {
        const baseId = Math.max(0, ...items.map(i => i.id)) + 1;
        const conIds = nuevos.map((n, idx) => ({
          id: baseId + idx, parentId: null,
          descripcion: n.descripcion || "Sin descripción",
          responsable: n.responsable || "Por asignar",
          categoria: n.categoria || "Otro",
          prioridad: n.prioridad || "media",
          estado: n.estado || "pendiente",
          fecha: n.fecha || new Date().toISOString().slice(0, 10),
          origen: n.origen || "Manual",
          notas: n.notas || "",
          comentarios: []
        }));
        setItems(prev => [...conIds, ...prev]);
      });
    }
  }, [registerAdder, items]);

  const today = new Date().toISOString().slice(0, 10);

  /* Filtrado plano + reconstrucción jerárquica */
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

  /* Construir árbol para vista lista */
  const arbol = useMemo(() => {
    const map = new Map(filtered.map(i => [i.id, { ...i, hijos: [] }]));
    const roots = [];
    filtered.forEach(i => {
      const node = map.get(i.id);
      if (i.parentId && map.has(i.parentId)) {
        map.get(i.parentId).hijos.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [filtered]);

  /* Top-level (sin parentId) para kanban */
  const topLevel = useMemo(() => filtered.filter(i => !i.parentId), [filtered]);

  /* Subtareas count por id */
  const subtareasCount = useMemo(() => {
    const c = {};
    items.forEach(i => { if (i.parentId) c[i.parentId] = (c[i.parentId] || 0) + 1; });
    return c;
  }, [items]);

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
      setItems(prev => prev.map(i => i.id === data.id ? { ...i, ...data } : i));
    } else {
      const id = Math.max(0, ...items.map(i => i.id)) + 1;
      setItems(prev => [{ ...data, id, comentarios: data.comentarios || [] }, ...prev]);
    }
  };

  const handleDelete = (id) => {
    if (!confirm("¿Eliminar pendiente y sus sub-tareas?")) return;
    // Eliminar recursivamente
    const aBorrar = new Set([id]);
    let added = true;
    while (added) {
      added = false;
      items.forEach(i => { if (aBorrar.has(i.parentId) && !aBorrar.has(i.id)) { aBorrar.add(i.id); added = true; } });
    }
    setItems(prev => prev.filter(i => !aBorrar.has(i.id)));
    if (detailId === id) setDetailId(null);
  };

  const toggleEstado = (i) => {
    const next = i.estado === "completado" ? "pendiente" : "completado";
    setItems(prev => prev.map(x => x.id === i.id ? { ...x, estado: next } : x));
  };

  const addComentario = (id, texto) => {
    if (!texto.trim()) return;
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const com = i.comentarios || [];
      const nuevoId = Math.max(0, ...com.map(c => c.id || 0)) + 1;
      return {
        ...i,
        comentarios: [...com, { id: nuevoId, fecha: new Date().toISOString(), autor: "PM Cretto", texto: texto.trim() }]
      };
    }));
  };

  const deleteComentario = (id, comId) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, comentarios: (i.comentarios || []).filter(c => c.id !== comId) } : i));
  };

  const addSubtarea = (parentId) => {
    const parent = items.find(i => i.id === parentId);
    const id = Math.max(0, ...items.map(i => i.id)) + 1;
    const nueva = {
      id, parentId, descripcion: "Nueva sub-tarea",
      responsable: parent?.responsable || "",
      categoria: parent?.categoria || "Otro",
      prioridad: "media", estado: "pendiente",
      fecha: parent?.fecha || new Date().toISOString().slice(0, 10),
      origen: "Sub-tarea", notas: "", comentarios: []
    };
    setItems(prev => [...prev, nueva]);
    return id;
  };

  const toggleColapsado = (id) => setColapsados(c => ({ ...c, [id]: !c[id] }));

  const detailItem = useMemo(() => items.find(i => i.id === detailId), [items, detailId]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Pendientes · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Seguimiento de actividades</h1>
          <p className="mt-1 text-sm text-stone-500">Actividades con sub-tareas anidadas y bitácora de comentarios por actividad.</p>
        </div>
        <button onClick={() => setDetailId("new")} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          <Plus className="h-4 w-4" /> Nueva actividad
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
              {v === "lista" ? "Árbol" : v === "kanban" ? "Kanban" : "Por responsable"}
            </button>
          ))}
        </div>
      </div>

      {/* Vistas */}
      {view === "lista" && (
        <TreeView arbol={arbol} today={today} subtareasCount={subtareasCount}
          colapsados={colapsados} onToggleColapso={toggleColapsado}
          onDetail={setDetailId} onToggle={toggleEstado} onDelete={handleDelete} onAddSub={addSubtarea} />
      )}
      {view === "kanban" && (
        <KanbanView items={topLevel} subtareasCount={subtareasCount}
          onDetail={setDetailId}
          onMove={(i, estado) => setItems(prev => prev.map(x => x.id === i.id ? { ...x, estado } : x))} />
      )}
      {view === "responsable" && (
        <ResponsableView items={filtered} onDetail={setDetailId} onToggle={toggleEstado} today={today} />
      )}

      {/* Detail Drawer */}
      {detailId !== null && (
        <DetailDrawer
          item={detailId === "new" ? null : detailItem}
          allItems={items}
          subtareasCount={subtareasCount}
          today={today}
          onClose={() => setDetailId(null)}
          onSave={(data) => { upsert(data); if (detailId === "new") setDetailId(null); }}
          onDelete={handleDelete}
          onAddSub={addSubtarea}
          onOpenSub={setDetailId}
          onAddComentario={addComentario}
          onDelComentario={deleteComentario}
          onToggle={toggleEstado}
        />
      )}
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

/* ─── Vista árbol jerárquico (estilo Notion list) ─── */
const TreeView = ({ arbol, today, subtareasCount, colapsados, onToggleColapso, onDetail, onToggle, onDelete, onAddSub }) => (
  <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
    <div className="border-b border-stone-200 bg-stone-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">
      <ListTree className="mr-1 inline h-3 w-3" /> Vista árbol — sub-tareas anidadas
    </div>
    {arbol.length === 0 && <div className="p-6 text-center text-[12px] text-stone-400">Sin actividades.</div>}
    <div className="divide-y divide-stone-100">
      {arbol.map(node => (
        <TreeRow key={node.id} node={node} depth={0} today={today}
          subtareasCount={subtareasCount} colapsados={colapsados} onToggleColapso={onToggleColapso}
          onDetail={onDetail} onToggle={onToggle} onDelete={onDelete} onAddSub={onAddSub} />
      ))}
    </div>
  </div>
);

const TreeRow = ({ node, depth, today, subtareasCount, colapsados, onToggleColapso, onDetail, onToggle, onDelete, onAddSub }) => {
  const vencido = node.estado !== "completado" && node.fecha < today;
  const tieneHijos = node.hijos && node.hijos.length > 0;
  const colapsado = colapsados[node.id];
  const numSub = subtareasCount[node.id] || 0;

  return (
    <>
      <div className={`group flex items-center gap-2 px-3 py-1.5 hover:bg-stone-50/60 ${vencido ? "bg-rose-50/30" : ""}`} style={{ paddingLeft: 12 + depth * 20 }}>
        {/* Expandidor */}
        <button onClick={() => tieneHijos && onToggleColapso(node.id)} className={`flex h-4 w-4 items-center justify-center rounded text-stone-400 ${tieneHijos ? "hover:bg-stone-200 hover:text-stone-700" : "invisible"}`}>
          {colapsado ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {/* Toggle completado */}
        <button onClick={() => onToggle(node)} title="Marcar completado">
          {node.estado === "completado" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-stone-300 hover:text-stone-500" />}
        </button>
        {/* Descripción */}
        <button onClick={() => onDetail(node.id)} className="flex-1 text-left">
          <span className={`text-[13px] ${node.estado === "completado" ? "text-stone-400 line-through" : "text-stone-800"}`}>{node.descripcion}</span>
          {(node.comentarios || []).length > 0 && <span className="ml-2 inline-flex items-center gap-0.5 rounded bg-stone-100 px-1 py-0.5 text-[9px] text-stone-600"><MessageSquare className="h-2.5 w-2.5" /> {node.comentarios.length}</span>}
          {numSub > 0 && <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-semibold text-emerald-800"><ListTree className="h-2.5 w-2.5" /> {numSub}</span>}
        </button>
        {/* Metadata */}
        <span className="text-[10px] text-stone-500">{node.responsable}</span>
        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[9px] text-stone-600">{node.categoria}</span>
        <PrioPill p={node.prioridad} />
        <EstadoPill e={node.estado} />
        <span className={`font-mono text-[10px] ${vencido ? "font-semibold text-rose-700" : "text-stone-500"}`} style={{ minWidth: 65 }}>
          {vencido && <AlertCircle className="mr-0.5 inline h-3 w-3" />}{node.fecha}
        </span>
        {/* Acciones */}
        <div className="ml-1 inline-flex gap-0.5 opacity-0 group-hover:opacity-100">
          <button onClick={() => { const id = onAddSub(node.id); onDetail(id); }} className="rounded p-0.5 text-stone-400 hover:bg-emerald-50 hover:text-emerald-700" title="Agregar sub-tarea"><Plus className="h-3 w-3" /></button>
          <button onClick={() => onDetail(node.id)} className="rounded p-0.5 text-stone-400 hover:bg-stone-100" title="Ver detalle"><Edit3 className="h-3 w-3" /></button>
          <button onClick={() => onDelete(node.id)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600" title="Eliminar"><Trash2 className="h-3 w-3" /></button>
        </div>
      </div>
      {/* Hijos */}
      {!colapsado && tieneHijos && node.hijos.map(h => (
        <TreeRow key={h.id} node={h} depth={depth + 1} today={today}
          subtareasCount={subtareasCount} colapsados={colapsados} onToggleColapso={onToggleColapso}
          onDetail={onDetail} onToggle={onToggle} onDelete={onDelete} onAddSub={onAddSub} />
      ))}
    </>
  );
};

/* ─── Kanban (solo top-level) ─── */
const KanbanView = ({ items, subtareasCount, onDetail, onMove }) => (
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
            {cols.map(i => {
              const numSub = subtareasCount[i.id] || 0;
              const numCom = (i.comentarios || []).length;
              return (
                <div key={i.id} className="rounded border border-stone-200 bg-white p-2 text-[12px] shadow-sm">
                  <button onClick={() => onDetail(i.id)} className="block text-left font-medium text-stone-900">{i.descripcion}</button>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-stone-500">
                    <span>{i.responsable}</span>
                    <div className="flex items-center gap-1">
                      {numCom > 0 && <span className="inline-flex items-center gap-0.5"><MessageSquare className="h-2.5 w-2.5" />{numCom}</span>}
                      {numSub > 0 && <span className="inline-flex items-center gap-0.5 text-emerald-700"><ListTree className="h-2.5 w-2.5" />{numSub}</span>}
                      <PrioPill p={i.prioridad} />
                    </div>
                  </div>
                  <div className="mt-1 flex gap-0.5">
                    {ESTADOS.filter(e => e.id !== i.estado).map(e => (
                      <button key={e.id} onClick={() => onMove(i, e.id)} className="rounded bg-stone-100 px-1 py-0.5 text-[9px] text-stone-600 hover:bg-stone-200" title={`Mover a ${e.label}`}>→ {e.label}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

/* ─── Por responsable ─── */
const ResponsableView = ({ items, onDetail, onToggle, today }) => {
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
                  <button onClick={() => onDetail(i.id)} className="flex-1 text-left">
                    <span className={`${i.estado === "completado" ? "text-stone-400 line-through" : "text-stone-800"}`}>{i.descripcion}</span>
                    {i.parentId && <span className="ml-1 text-[10px] text-stone-400">(sub-tarea)</span>}
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

/* ─── Drawer de detalle estilo Notion ─── */
const DetailDrawer = ({ item, allItems, subtareasCount, today, onClose, onSave, onDelete, onAddSub, onOpenSub, onAddComentario, onDelComentario, onToggle }) => {
  const isNew = !item;
  const [form, setForm] = useState(item || {
    descripcion: "", responsable: "", categoria: "Obra", prioridad: "media",
    estado: "pendiente", fecha: new Date().toISOString().slice(0, 10), origen: "Manual", notas: "",
    parentId: null, comentarios: []
  });
  const [tab, setTab] = useState("detalles");
  const [nuevoComentario, setNuevoComentario] = useState("");

  /* Sync cuando cambia el item (al abrir otra tarea) */
  useEffect(() => { setForm(item || { descripcion: "", responsable: "", categoria: "Obra", prioridad: "media", estado: "pendiente", fecha: new Date().toISOString().slice(0, 10), origen: "Manual", notas: "", parentId: null, comentarios: [] }); setTab("detalles"); }, [item?.id]);

  /* Auto-save al cambiar campos (solo si no es nuevo) */
  const update = (patch) => {
    const next = { ...form, ...patch };
    setForm(next);
    if (!isNew) onSave(next);
  };

  const subtareas = useMemo(() => allItems.filter(i => i.parentId === item?.id), [allItems, item?.id]);
  const breadcrumbParent = useMemo(() => item?.parentId ? allItems.find(i => i.id === item.parentId) : null, [allItems, item]);

  const handleSubmitComentario = (e) => {
    e?.preventDefault?.();
    if (!nuevoComentario.trim() || isNew) return;
    onAddComentario(item.id, nuevoComentario);
    setNuevoComentario("");
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-2xl flex-col bg-white shadow-2xl">
        <header className="border-b border-stone-200 px-5 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {breadcrumbParent && (
                <button onClick={() => onOpenSub(breadcrumbParent.id)} className="mb-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-stone-500 hover:text-emerald-700">
                  ← Sub-tarea de: <span className="font-semibold">{breadcrumbParent.descripcion.slice(0, 50)}</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                {item && (
                  <button onClick={() => onToggle(item)} className="flex-shrink-0">
                    {form.estado === "completado" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-stone-300 hover:text-stone-500" />}
                  </button>
                )}
                <input
                  value={form.descripcion}
                  onChange={e => update({ descripcion: e.target.value })}
                  placeholder="Nombre de la actividad…"
                  className={`flex-1 border-0 bg-transparent font-serif text-xl text-stone-900 focus:outline-none ${form.estado === "completado" ? "text-stone-400 line-through" : ""}`}
                  autoFocus={isNew}
                />
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {!isNew && (
                <button onClick={() => onDelete(item.id)} className="rounded p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
              )}
              <button onClick={onClose} className="rounded p-1.5 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Quick props row */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
            <Prop label="Responsable">
              <input value={form.responsable} onChange={e => update({ responsable: e.target.value })} className="rounded border border-stone-200 px-2 py-0.5 text-[12px] focus:border-emerald-500 focus:outline-none" />
            </Prop>
            <Prop label="Fecha">
              <input type="date" value={form.fecha} onChange={e => update({ fecha: e.target.value })} className="rounded border border-stone-200 px-2 py-0.5 text-[12px] focus:border-emerald-500 focus:outline-none" />
            </Prop>
            <Prop label="Prioridad">
              <select value={form.prioridad} onChange={e => update({ prioridad: e.target.value })} className="rounded border border-stone-200 px-2 py-0.5 text-[12px] focus:border-emerald-500 focus:outline-none">
                {PRIORIDADES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Prop>
            <Prop label="Estado">
              <select value={form.estado} onChange={e => update({ estado: e.target.value })} className="rounded border border-stone-200 px-2 py-0.5 text-[12px] focus:border-emerald-500 focus:outline-none">
                {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </Prop>
            <Prop label="Categoría">
              <select value={form.categoria} onChange={e => update({ categoria: e.target.value })} className="rounded border border-stone-200 px-2 py-0.5 text-[12px] focus:border-emerald-500 focus:outline-none">
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Prop>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4">
          {[
            { id: "detalles",    label: "Detalles" },
            { id: "subtareas",   label: `Sub-tareas${subtareas.length > 0 ? ` (${subtareas.length})` : ""}`, disabled: isNew },
            { id: "bitacora",    label: `Bitácora${(form.comentarios || []).length > 0 ? ` (${(form.comentarios || []).length})` : ""}`, disabled: isNew }
          ].map(t => (
            <button key={t.id} disabled={t.disabled} onClick={() => setTab(t.id)} className={`-mb-px border-b-2 px-3 py-2 text-[12px] font-medium ${tab === t.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-800 disabled:opacity-40"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === "detalles" && (
            <div className="space-y-3">
              <Field label="Notas">
                <textarea value={form.notas} onChange={e => update({ notas: e.target.value })} rows={6} className="inp" placeholder="Detalles, contexto, links, archivos relacionados…" />
              </Field>
              <Field label="Origen">
                <input value={form.origen} onChange={e => update({ origen: e.target.value })} className="inp" placeholder="Manual, Reunión, Cambio…" />
              </Field>
              {isNew && (
                <div className="rounded-md bg-emerald-50 p-2 text-[11px] text-emerald-800">
                  Al guardar, podrás agregar sub-tareas y comentarios.
                </div>
              )}
            </div>
          )}

          {tab === "subtareas" && !isNew && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-stone-500">{subtareas.length} sub-tareas. Cada una funciona como una actividad completa con sus propias notas, fechas y bitácora.</p>
                <button onClick={() => { const id = onAddSub(item.id); onOpenSub(id); }} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-800">
                  <Plus className="h-3 w-3" /> Sub-tarea
                </button>
              </div>
              {subtareas.length === 0 && <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-[12px] text-stone-400">Sin sub-tareas todavía.</div>}
              {subtareas.map(s => {
                const vencido = s.estado !== "completado" && s.fecha < today;
                const subSub = subtareasCount[s.id] || 0;
                return (
                  <button key={s.id} onClick={() => onOpenSub(s.id)} className={`flex w-full items-center gap-2 rounded-md border border-stone-200 bg-white p-2 text-left text-[12px] hover:border-emerald-400 hover:shadow-sm ${vencido ? "bg-rose-50/30" : ""}`}>
                    {s.estado === "completado" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-stone-300" />}
                    <div className="flex-1 min-w-0">
                      <div className={`${s.estado === "completado" ? "text-stone-400 line-through" : "text-stone-800"}`}>{s.descripcion}</div>
                      <div className="text-[10px] text-stone-500">{s.responsable} · {s.fecha}{subSub > 0 ? ` · ${subSub} sub` : ""}{(s.comentarios || []).length > 0 ? ` · ${s.comentarios.length} 💬` : ""}</div>
                    </div>
                    <PrioPill p={s.prioridad} />
                    <EstadoPill e={s.estado} />
                  </button>
                );
              })}
            </div>
          )}

          {tab === "bitacora" && !isNew && (
            <div className="space-y-3">
              <p className="text-[11px] text-stone-500">Registro cronológico de actualizaciones, decisiones y comentarios sobre esta actividad. Como un thread de Notion.</p>
              <div className="space-y-2">
                {(form.comentarios || []).length === 0 && <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-[12px] text-stone-400">Sin comentarios. Sé el primero en agregar uno.</div>}
                {(form.comentarios || []).slice().reverse().map(c => (
                  <div key={c.id} className="group rounded-md border border-stone-200 bg-stone-50/40 p-2.5">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                        <User className="h-3 w-3" />
                        <strong className="text-stone-800">{c.autor}</strong>
                        <span>· {fmtDateTime(c.fecha)}</span>
                      </div>
                      <button onClick={() => onDelComentario(item.id, c.id)} className="rounded p-0.5 text-stone-300 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    <p className="text-[12px] leading-relaxed text-stone-800 whitespace-pre-wrap">{c.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer: campo de comentario fijo abajo (solo en pestaña bitácora) */}
        {tab === "bitacora" && !isNew && (
          <footer className="border-t border-stone-200 bg-white p-3">
            <form onSubmit={handleSubmitComentario} className="flex gap-2">
              <textarea
                value={nuevoComentario}
                onChange={e => setNuevoComentario(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleSubmitComentario(e); }}
                placeholder="Agregar comentario…  (⌘+Enter para enviar)"
                rows={2}
                className="flex-1 resize-none rounded-md border border-stone-300 px-3 py-1.5 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button type="submit" disabled={!nuevoComentario.trim()} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </footer>
        )}

        {/* Botón guardar para nuevos */}
        {isNew && (
          <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
            <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
            <button onClick={() => onSave(form)} disabled={!form.descripcion.trim()} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">
              Crear actividad
            </button>
          </footer>
        )}

        <style>{`.inp{width:100%;border:1px solid rgb(214,211,209);background:#fff;padding:6px 10px;font-size:13px;border-radius:6px}.inp:focus{outline:none;border-color:rgb(16,185,129);box-shadow:0 0 0 1px rgb(16,185,129)}`}</style>
      </aside>
    </>
  );
};

const Prop = ({ label, children }) => (
  <span className="inline-flex items-center gap-1">
    <span className="text-[10px] uppercase tracking-wider text-stone-500">{label}:</span>
    {children}
  </span>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-stone-600">{label}</span>
    {children}
  </label>
);

export default Pendientes;
