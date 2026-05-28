import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Calendar, ListTree, BarChart3, Plus, X, ChevronRight, ChevronDown,
  Zap, AlertTriangle, Trash2, CheckCircle2, Circle, Diamond, Info
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Cronograma Pro — vista tipo MS Project para Cretto Hub
   - EDT/WBS jerárquica con grupos por fase
   - Dependencias tipadas (FS / SS / FF / SF) con lag en días
   - Flechas de dependencias en el Gantt
   - Cálculo de ruta crítica (CPM forward + backward pass)
   - Vista Calendario mensual
   - Drawer de edición con multi-predecesor
────────────────────────────────────────────────────────────────── */

/* ─────────── Date helpers ─────────── */
const parseDate = (s) => {
  if (!s) return null;
  if (s instanceof Date) return s;
  const [y, m, d] = String(s).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const fmtDate = (d) => {
  const x = parseDate(d);
  if (!x) return "—";
  return x.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "2-digit" });
};
const toISODate = (d) => {
  if (!d) return "";
  const x = parseDate(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const daysBetween = (a, b) => {
  const A = parseDate(a), B = parseDate(b);
  if (!A || !B) return 0;
  return Math.round((B - A) / 86400000);
};
const addDays = (d, days) => {
  const x = parseDate(d);
  const out = new Date(x);
  out.setDate(out.getDate() + days);
  return out;
};

/* ─────────── Dependency adapter (backward compat) ───────────
   Old shape: t.dep = [predId, predId]  (treated as FS, lag 0)
   New shape: t.dependencies = [{ id, type: "FS"|"SS"|"FF"|"SF", lag: number }]
*/
const normalizeDeps = (t) => {
  if (t.dependencies && Array.isArray(t.dependencies)) return t.dependencies;
  if (Array.isArray(t.dep)) return t.dep.map(id => ({ id, type: "FS", lag: 0 }));
  return [];
};

/* ─────────── CPM (Critical Path Method) ───────────
   Calcula ES/EF/LS/LF/slack/critical para cada tarea en días absolutos
   desde el inicio del proyecto. Maneja FS/SS/FF/SF + lag.
*/
const computeCPM = (tareas) => {
  if (!tareas || tareas.length === 0) return new Map();
  const projectStart = parseDate(
    tareas.map(t => parseDate(t.inicio)).sort((a, b) => a - b)[0]
  );
  const dayOf = (d) => daysBetween(projectStart, d);

  const byId = new Map();
  tareas.forEach(t => {
    const duracion = Math.max(1, daysBetween(t.inicio, t.fin));
    byId.set(t.id, {
      ...t,
      dependencies: normalizeDeps(t),
      duracion,
      ES: 0, EF: 0, LS: 0, LF: 0, slack: 0, critical: false,
      successors: []
    });
  });

  // Build successors list
  for (const t of byId.values()) {
    for (const dep of t.dependencies) {
      const pred = byId.get(dep.id);
      if (pred) pred.successors.push({ id: t.id, type: dep.type, lag: dep.lag || 0 });
    }
  }

  // Topological sort (Kahn's)
  const inDegree = new Map();
  for (const t of byId.values()) inDegree.set(t.id, t.dependencies.length);
  const queue = [];
  for (const [id, deg] of inDegree) if (deg === 0) queue.push(id);
  const sorted = [];
  while (queue.length) {
    const id = queue.shift();
    sorted.push(id);
    const t = byId.get(id);
    for (const s of t.successors) {
      const nd = inDegree.get(s.id) - 1;
      inDegree.set(s.id, nd);
      if (nd === 0) queue.push(s.id);
    }
  }
  // If cycle detected (sorted.length !== byId.size), fallback to chronological order
  if (sorted.length !== byId.size) {
    sorted.length = 0;
    Array.from(byId.values())
      .sort((a, b) => parseDate(a.inicio) - parseDate(b.inicio))
      .forEach(t => sorted.push(t.id));
  }

  // Forward pass
  for (const id of sorted) {
    const t = byId.get(id);
    let earliestES = dayOf(t.inicio);
    for (const dep of t.dependencies) {
      const pred = byId.get(dep.id);
      if (!pred) continue;
      const lag = dep.lag || 0;
      let candidate;
      if (dep.type === "FS") candidate = pred.EF + lag;
      else if (dep.type === "SS") candidate = pred.ES + lag;
      else if (dep.type === "FF") candidate = pred.EF - t.duracion + lag;
      else if (dep.type === "SF") candidate = pred.ES - t.duracion + lag;
      else candidate = pred.EF + lag;
      if (candidate > earliestES) earliestES = candidate;
    }
    t.ES = earliestES;
    t.EF = t.ES + t.duracion;
  }

  const projectEnd = Math.max(...Array.from(byId.values()).map(t => t.EF));

  // Backward pass
  for (const id of [...sorted].reverse()) {
    const t = byId.get(id);
    if (t.successors.length === 0) {
      t.LF = projectEnd;
    } else {
      let latestLF = Infinity;
      for (const succ of t.successors) {
        const s = byId.get(succ.id);
        const lag = succ.lag || 0;
        let candidate;
        if (succ.type === "FS") candidate = s.LS - lag;
        else if (succ.type === "SS") candidate = s.LS - lag + t.duracion;
        else if (succ.type === "FF") candidate = s.LF - lag;
        else if (succ.type === "SF") candidate = s.LF - lag + t.duracion;
        else candidate = s.LS - lag;
        if (candidate < latestLF) latestLF = candidate;
      }
      t.LF = latestLF;
    }
    t.LS = t.LF - t.duracion;
    t.slack = t.LS - t.ES;
    t.critical = t.slack === 0;
  }

  return byId;
};

/* ─────────── Pill / chip components ─────────── */
const StatePill = ({ avance }) => {
  if (avance >= 100) return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800"><CheckCircle2 className="h-3 w-3" /> Hecho</span>;
  if (avance > 0)   return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800"><Circle className="h-3 w-3" /> {avance}%</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600"><Circle className="h-3 w-3" /> Pendiente</span>;
};

/* ─────────── Main Screen ─────────── */
const CronogramaProScreen = ({ tareas, onTareasChange, onInfo }) => {
  const [view, setView] = useState("gantt");        // "gantt" | "edt" | "calendar"
  const [zoom, setZoom] = useState("month");         // "day" | "week" | "month" | "quarter" | "semester"
  const [showCritical, setShowCritical] = useState(false);
  const [showBaseline, setShowBaseline] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const [collapsedPhases, setCollapsedPhases] = useState(new Set());
  const [editing, setEditing] = useState(null);     // task object or "new"
  const [filterPhase, setFilterPhase] = useState("__all__");

  // CPM map: id → enriched task
  const cpm = useMemo(() => computeCPM(tareas), [tareas]);

  // Project bounds — siempre incluyen "hoy" + 12 meses de padding atrás (~1 año)
  // y 3 meses adelante. Esto permite scrollear a fechas del año pasado sin
  // restricción incluso si todas las actividades son futuras.
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (!tareas.length) return { minDate: new Date(), maxDate: new Date(), totalDays: 30 };
    const allDates = tareas.flatMap(t => [parseDate(t.inicio), parseDate(t.fin), parseDate(t.baselineInicio), parseDate(t.baselineFin)]).filter(Boolean);
    allDates.push(new Date()); // garantiza que la fecha actual cae dentro del rango
    const earliest = new Date(Math.min(...allDates));
    const latest   = new Date(Math.max(...allDates));
    // 12 meses (1 año) atrás de la fecha más temprana, snapped a inicio de mes
    const minD = new Date(earliest);
    minD.setMonth(minD.getMonth() - 12);
    minD.setDate(1);
    // 3 meses adelante de la última fecha
    const maxD = new Date(latest);
    maxD.setMonth(maxD.getMonth() + 3);
    return { minDate: minD, maxDate: maxD, totalDays: daysBetween(minD, maxD) };
  }, [tareas]);

  // Group by phase (WBS level 1)
  const phases = useMemo(() => {
    const m = {};
    tareas.forEach(t => {
      if (!m[t.fase]) m[t.fase] = { name: t.fase, color: t.color || "#1F3D2E", items: [] };
      m[t.fase].items.push(t);
    });
    let phaseIdx = 0;
    return Object.values(m).map(p => ({
      ...p,
      wbs: String(++phaseIdx),
      items: p.items
        .sort((a, b) => parseDate(a.inicio) - parseDate(b.inicio))
        .map((t, i) => ({ ...t, wbs: `${phaseIdx}.${i + 1}` }))
    }));
  }, [tareas]);

  const visiblePhases = useMemo(() => {
    if (filterPhase === "__all__") return phases;
    return phases.filter(p => p.name === filterPhase);
  }, [phases, filterPhase]);

  const togglePhase = (name) => {
    setCollapsedPhases(prev => {
      const n = new Set(prev);
      if (n.has(name)) n.delete(name);
      else n.add(name);
      return n;
    });
  };

  const handleSave = (task) => {
    if (task.__isNew) {
      const nextId = Math.max(0, ...tareas.map(t => t.id)) + 1;
      const { __isNew, ...rest } = task;
      onTareasChange([...tareas, { ...rest, id: nextId, dep: rest.dependencies?.map(d => d.id) || [] }]);
    } else {
      onTareasChange(tareas.map(t => t.id === task.id ? { ...task, dep: task.dependencies?.map(d => d.id) || [] } : t));
    }
    setEditing(null);
  };

  const handleDelete = (id) => {
    // also remove from other tasks' dependencies
    const newTareas = tareas
      .filter(t => t.id !== id)
      .map(t => ({
        ...t,
        dep: (t.dep || []).filter(d => d !== id),
        dependencies: normalizeDeps(t).filter(d => d.id !== id)
      }));
    onTareasChange(newTareas);
    setEditing(null);
  };

  // Stats
  const stats = useMemo(() => {
    const completed = tareas.filter(t => t.avance === 100).length;
    const inProgress = tareas.filter(t => t.avance > 0 && t.avance < 100).length;
    const criticalCount = Array.from(cpm.values()).filter(t => t.critical).length;
    const projectEnd = parseDate(minDate);
    projectEnd.setDate(projectEnd.getDate() + Math.max(...Array.from(cpm.values()).map(t => t.EF), 0));
    return { completed, inProgress, criticalCount, projectEnd };
  }, [tareas, cpm, minDate]);

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-stone-900">Cronograma</h1>
            <p className="mt-1 text-sm text-stone-500">
              {tareas.length} actividades · {phases.length} fases · {stats.criticalCount} en ruta crítica
            </p>
          </div>
          <button
            onClick={() => setEditing({ __isNew: true, fase: phases[0]?.name || "Definición", tarea: "", inicio: toISODate(new Date()), fin: toISODate(addDays(new Date(), 5)), baselineInicio: toISODate(new Date()), baselineFin: toISODate(addDays(new Date(), 5)), avance: 0, color: "#1F3D2E", dep: [], dependencies: [], isMilestone: false })}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
          >
            <Plus className="h-3.5 w-3.5" /> Nueva actividad
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
        {/* View switcher */}
        <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-0.5">
          {[
            { id: "gantt", label: "Gantt", icon: BarChart3 },
            { id: "edt", label: "EDT", icon: ListTree },
            { id: "calendar", label: "Calendario", icon: Calendar }
          ].map(v => {
            const Ic = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-all ${
                  view === v.id ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Ic className="h-3.5 w-3.5" /> {v.label}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-stone-200" />

        {/* Critical path toggle */}
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-stone-700">
          <input
            type="checkbox"
            checked={showCritical}
            onChange={e => setShowCritical(e.target.checked)}
            className="h-3.5 w-3.5 accent-rose-600"
          />
          <Zap className={`h-3.5 w-3.5 ${showCritical ? "text-rose-600" : "text-stone-400"}`} />
          <span>Ruta crítica</span>
        </label>

        {view === "gantt" && (
          <>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-stone-700">
              <input type="checkbox" checked={showBaseline} onChange={e => setShowBaseline(e.target.checked)} className="h-3.5 w-3.5 accent-emerald-700" />
              <span>Línea base</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-stone-700">
              <input type="checkbox" checked={showArrows} onChange={e => setShowArrows(e.target.checked)} className="h-3.5 w-3.5 accent-emerald-700" />
              <span>Flechas</span>
            </label>

            <div className="h-5 w-px bg-stone-200" />

            {/* Zoom switcher */}
            <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-0.5">
              {Object.values(ZOOM_CONFIG).map(z => (
                <button
                  key={z.id}
                  onClick={() => setZoom(z.id)}
                  className={`rounded px-2 py-1 text-[11px] font-medium transition-all ${
                    zoom === z.id ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600 hover:text-stone-900"
                  }`}
                  title={`Vista por ${z.label.toLowerCase()}`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="h-5 w-px bg-stone-200" />

        {/* Phase filter */}
        <select
          value={filterPhase}
          onChange={e => setFilterPhase(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-2 py-1 text-xs"
        >
          <option value="__all__">Todas las fases</option>
          {phases.map(p => <option key={p.name} value={p.name}>{p.wbs} · {p.name}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-3 text-[11px] text-stone-500">
          <span>✓ {stats.completed} hechas</span>
          <span>◐ {stats.inProgress} en curso</span>
          <span className="text-rose-700">⚡ {stats.criticalCount} críticas</span>
        </div>
      </div>

      {/* Views */}
      {view === "gantt" && (
        <GanttView
          phases={visiblePhases}
          cpm={cpm}
          minDate={minDate}
          totalDays={totalDays}
          zoom={zoom}
          showCritical={showCritical}
          showBaseline={showBaseline}
          showArrows={showArrows}
          collapsedPhases={collapsedPhases}
          onTogglePhase={togglePhase}
          onEdit={setEditing}
        />
      )}
      {view === "edt" && (
        <EDTView phases={visiblePhases} cpm={cpm} showCritical={showCritical} onEdit={setEditing} tareas={tareas} />
      )}
      {view === "calendar" && (
        <CalendarView tareas={tareas} cpm={cpm} showCritical={showCritical} onEdit={setEditing} />
      )}

      {/* Drawer */}
      {editing && (
        <TaskDrawer
          task={editing}
          tareas={tareas}
          phases={phases}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   GANTT VIEW — task list + chart with dep arrows + critical path
─────────────────────────────────────────────────────────────── */
const ROW_H = 32;
const PHASE_H = 36;
const DAY_W = 8; // fallback; real value viene del ZOOM_CONFIG

/* ─────────── Helpers de unidades de tiempo ─────────── */
const getISOWeek = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};
const getQuarter = (d) => Math.floor(d.getMonth() / 3) + 1;
const getSemester = (d) => Math.floor(d.getMonth() / 6) + 1;
const startOfWeek = (d) => {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7; // 0 = lunes
  x.setDate(x.getDate() - dow);
  x.setHours(0, 0, 0, 0);
  return x;
};
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfQuarter = (d) => new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
const startOfSemester = (d) => new Date(d.getFullYear(), Math.floor(d.getMonth() / 6) * 6, 1);
const startOfYear = (d) => new Date(d.getFullYear(), 0, 1);

/* ─────────── Configuración de zoom ───────────
   Cada nivel define el ancho por día (DAY_W) y los markers a usar como
   header primario (fila superior) y secundario (fila inferior).
*/
const ZOOM_CONFIG = {
  day:      { id: "day",      label: "Día",       dayW: 28,  primary: "month",   secondary: "day" },
  week:     { id: "week",     label: "Semana",    dayW: 12,  primary: "month",   secondary: "week" },
  month:    { id: "month",    label: "Mes",       dayW: 6,   primary: "year",    secondary: "month" },
  quarter:  { id: "quarter",  label: "Trimestre", dayW: 2.5, primary: "year",    secondary: "quarter" },
  semester: { id: "semester", label: "Semestre",  dayW: 1.2, primary: "year",    secondary: "semester" }
};

const buildMarkers = (unit, minDate, totalDays) => {
  const out = [];
  let cur;
  const end = addDays(minDate, totalDays);
  if (unit === "day") {
    cur = new Date(minDate); cur.setHours(0, 0, 0, 0);
    while (cur <= end) {
      out.push({ date: new Date(cur), label: cur.getDate() });
      cur.setDate(cur.getDate() + 1);
    }
  } else if (unit === "week") {
    cur = startOfWeek(minDate);
    while (cur <= end) {
      out.push({ date: new Date(cur), label: `S${getISOWeek(cur)}` });
      cur.setDate(cur.getDate() + 7);
    }
  } else if (unit === "month") {
    cur = startOfMonth(minDate);
    while (cur <= end) {
      out.push({ date: new Date(cur), label: cur.toLocaleDateString("es-CO", { month: "short", year: "2-digit" }).toUpperCase() });
      cur.setMonth(cur.getMonth() + 1);
    }
  } else if (unit === "quarter") {
    cur = startOfQuarter(minDate);
    while (cur <= end) {
      out.push({ date: new Date(cur), label: `Q${getQuarter(cur)} '${String(cur.getFullYear()).slice(-2)}` });
      cur.setMonth(cur.getMonth() + 3);
    }
  } else if (unit === "semester") {
    cur = startOfSemester(minDate);
    while (cur <= end) {
      out.push({ date: new Date(cur), label: `${getSemester(cur) === 1 ? "H1" : "H2"} '${String(cur.getFullYear()).slice(-2)}` });
      cur.setMonth(cur.getMonth() + 6);
    }
  } else if (unit === "year") {
    cur = startOfYear(minDate);
    while (cur <= end) {
      out.push({ date: new Date(cur), label: String(cur.getFullYear()) });
      cur.setFullYear(cur.getFullYear() + 1);
    }
  }
  return out;
};

const GanttView = ({ phases, cpm, minDate, totalDays, zoom = "month", showCritical, showBaseline, showArrows, collapsedPhases, onTogglePhase, onEdit }) => {
  const zoomCfg = ZOOM_CONFIG[zoom] || ZOOM_CONFIG.month;
  const DAY_PX = zoomCfg.dayW;
  const totalWidth = totalDays * DAY_PX;
  const containerRef = useRef(null);

  // Auto-scroll horizontal para centrar el día de hoy al montar/cambiar zoom
  // (suma 360 = ancho de la columna sticky-left de WBS)
  useEffect(() => {
    if (!containerRef.current) return;
    const todayInScroll = 360 + daysBetween(minDate, new Date()) * DAY_PX;
    const half = containerRef.current.clientWidth / 2;
    containerRef.current.scrollLeft = Math.max(0, todayInScroll - half);
  }, [minDate, zoom]);

  // Build row index for each task (for arrow positioning)
  const rowOf = useMemo(() => {
    const m = new Map();
    let row = 0;
    phases.forEach(p => {
      m.set(`phase:${p.name}`, row++);
      if (!collapsedPhases.has(p.name)) {
        p.items.forEach(t => {
          m.set(t.id, row++);
        });
      }
    });
    return m;
  }, [phases, collapsedPhases]);

  const totalHeight = (() => {
    let h = 0;
    phases.forEach(p => {
      h += PHASE_H;
      if (!collapsedPhases.has(p.name)) h += p.items.length * ROW_H;
    });
    return h;
  })();

  const dayToX = (date) => daysBetween(minDate, date) * DAY_PX;

  // Primary + secondary markers según zoom
  const primaryMarkers = useMemo(
    () => buildMarkers(zoomCfg.primary, minDate, totalDays),
    [minDate, totalDays, zoomCfg.primary]
  );
  const secondaryMarkers = useMemo(
    () => buildMarkers(zoomCfg.secondary, minDate, totalDays),
    [minDate, totalDays, zoomCfg.secondary]
  );
  // Vertical grid usa los secundarios para el zoom mes/trim/sem, y los primarios para día/sem
  const gridMarkers = zoomCfg.secondary === "day" ? primaryMarkers : secondaryMarkers;

  // Today line
  const todayX = dayToX(new Date());

  const LEFT_W = 360;
  const ROW_HEADER_H = 22;
  const HEADER_H = ROW_HEADER_H * 2; // dos filas: primaria + secundaria
  const fullWidth = LEFT_W + totalWidth;

  // Pre-computed row layout: list of { kind: 'phase' | 'task', y, phase, task }
  const rowLayout = useMemo(() => {
    const out = [];
    let y = 0;
    phases.forEach(p => {
      out.push({ kind: "phase", y, phase: p });
      y += PHASE_H;
      if (!collapsedPhases.has(p.name)) {
        p.items.forEach(t => {
          out.push({ kind: "task", y, phase: p, task: t });
          y += ROW_H;
        });
      }
    });
    return { rows: out, totalY: y };
  }, [phases, collapsedPhases]);

  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm" style={{ overflow: "clip" }}>
      <div
        ref={containerRef}
        style={{ overflowX: "scroll", overflowY: "clip" }}
      >
        <div className="relative" style={{ width: fullWidth }}>

          {/* HEADER ROW — sticky-top, 2 filas (primary + secondary) */}
          <div
            className="sticky top-[57px] z-30 flex border-b border-stone-200 bg-stone-100"
            style={{ height: HEADER_H }}
          >
            <div
              className="sticky left-0 z-40 flex items-center gap-2 border-r border-stone-200 bg-stone-100 px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-600"
              style={{ width: LEFT_W, height: HEADER_H }}
            >
              <div className="w-12">WBS</div>
              <div className="flex-1">Actividad</div>
              <div className="w-12 text-right">Días</div>
            </div>
            <div className="relative" style={{ width: totalWidth, height: HEADER_H }}>
              {/* Fila primaria (año / mes según zoom) */}
              {primaryMarkers.map((m, i) => {
                const x = dayToX(m.date);
                const nextX = i < primaryMarkers.length - 1 ? dayToX(primaryMarkers[i + 1].date) : totalWidth;
                return (
                  <div
                    key={`p${i}`}
                    className="absolute top-0 flex items-center justify-center border-r border-stone-300/70 bg-stone-200/50 text-[10px] font-semibold uppercase tracking-wider text-stone-700"
                    style={{ left: x, width: nextX - x, height: ROW_HEADER_H }}
                  >
                    {m.label}
                  </div>
                );
              })}
              {/* Fila secundaria (mes / semana / día / quarter / semestre según zoom) */}
              {secondaryMarkers.map((m, i) => {
                const x = dayToX(m.date);
                const nextX = i < secondaryMarkers.length - 1 ? dayToX(secondaryMarkers[i + 1].date) : totalWidth;
                const w = nextX - x;
                return (
                  <div
                    key={`s${i}`}
                    className="absolute flex items-center justify-center border-r border-stone-200 text-[10px] font-medium tracking-wider text-stone-600"
                    style={{ left: x, top: ROW_HEADER_H, width: w, height: ROW_HEADER_H }}
                  >
                    {w >= 14 ? m.label : ""}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BODY ROWS */}
          {rowLayout.rows.map((r, idx) => {
            if (r.kind === "phase") {
              const p = r.phase;
              const phStart = p.items.length ? Math.min(...p.items.map(t => parseDate(t.inicio).getTime())) : null;
              const phEnd   = p.items.length ? Math.max(...p.items.map(t => parseDate(t.fin).getTime())) : null;
              const x = phStart ? dayToX(new Date(phStart)) : 0;
              const w = phEnd ? dayToX(new Date(phEnd)) - x : 0;
              return (
                <div key={`ph:${p.name}`} className="flex border-b border-stone-200 bg-stone-50/30" style={{ height: PHASE_H }}>
                  <div
                    onClick={() => onTogglePhase(p.name)}
                    className="sticky left-0 z-30 flex shrink-0 cursor-pointer items-center gap-1 border-r border-stone-200 bg-stone-100 px-3 text-[12px] font-semibold text-stone-800 hover:bg-stone-200/70"
                    style={{ width: LEFT_W, height: PHASE_H }}
                  >
                    {collapsedPhases.has(p.name)
                      ? <ChevronRight className="h-3 w-3 text-stone-500" />
                      : <ChevronDown className="h-3 w-3 text-stone-500" />}
                    <span className="w-10 font-mono text-[10px] text-stone-500">{p.wbs}</span>
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="font-mono text-[10px] text-stone-500">{p.items.length}</span>
                  </div>
                  <div className="relative" style={{ width: totalWidth, height: PHASE_H }}>
                    {w > 0 && (
                      <div
                        className="absolute top-[10px] h-3 rounded-sm"
                        style={{ left: x, width: Math.max(w, 4), background: "#1F3D2E", opacity: 0.85 }}
                      >
                        <span className="absolute -left-1 top-1/2 h-3 w-1 -translate-y-1/2" style={{ borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "0", borderRight: "6px solid #1F3D2E" }} />
                        <span className="absolute -right-1 top-1/2 h-3 w-1 -translate-y-1/2" style={{ borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "6px solid #1F3D2E", borderRight: "0" }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // task row
            const t = r.task;
            const p = r.phase;
            const c = cpm.get(t.id);
            const isCrit = c?.critical;
            const startX = dayToX(parseDate(t.inicio));
            const endX   = dayToX(parseDate(t.fin));
            const w = Math.max(endX - startX, 2);
            const baseStartX = dayToX(parseDate(t.baselineInicio));
            const baseEndX   = dayToX(parseDate(t.baselineFin));
            const baseW = Math.max(baseEndX - baseStartX, 2);
            const barColor = isCrit && showCritical ? "#BE123C" : (p.color || "#1F3D2E");

            return (
              <div
                key={t.id}
                className={`flex border-b border-stone-100 ${isCrit && showCritical ? "bg-rose-50/30" : ""}`}
                style={{ height: ROW_H }}
              >
                <div
                  onClick={() => onEdit(t)}
                  className={`sticky left-0 z-30 flex shrink-0 cursor-pointer items-center gap-2 border-r border-stone-200 px-3 text-[12px] hover:bg-emerald-50 ${isCrit && showCritical ? "bg-rose-50/40" : "bg-white"}`}
                  style={{ width: LEFT_W, height: ROW_H }}
                >
                  <span className="w-12 font-mono text-[10px] text-stone-400">{t.wbs}</span>
                  {t.isMilestone && <Diamond className="h-3 w-3 text-amber-600" />}
                  <span className="flex-1 truncate text-stone-800">{t.tarea}</span>
                  <span className="w-10 text-right font-mono text-[10px] text-stone-500">{c?.duracion || 0}d</span>
                </div>
                <div className="relative" style={{ width: totalWidth, height: ROW_H }}>
                  {showBaseline && (
                    <div
                      className="absolute h-1.5 rounded-sm border border-stone-400/40"
                      style={{ top: ROW_H - 8, left: baseStartX, width: baseW, background: "transparent" }}
                      title={`Línea base: ${fmtDate(t.baselineInicio)} → ${fmtDate(t.baselineFin)}`}
                    />
                  )}
                  {t.isMilestone ? (
                    <div
                      onClick={() => onEdit(t)}
                      className="absolute cursor-pointer"
                      style={{ top: 8, left: startX - 8, width: 16, height: 16, transform: "rotate(45deg)", background: barColor }}
                      title={`${t.tarea} · ${fmtDate(t.inicio)}`}
                    />
                  ) : (
                    <div
                      onClick={() => onEdit(t)}
                      className="absolute cursor-pointer rounded-md transition-all hover:brightness-110"
                      style={{
                        top: 8, left: startX, width: w, height: ROW_H - 14,
                        background: barColor, opacity: 0.95,
                        boxShadow: isCrit && showCritical ? "0 0 0 1.5px #BE123C" : "0 1px 2px rgba(0,0,0,0.08)"
                      }}
                      title={`${t.tarea} · ${fmtDate(t.inicio)} → ${fmtDate(t.fin)} · ${t.avance}%`}
                    >
                      <div
                        className="h-full rounded-md"
                        style={{
                          width: `${t.avance}%`,
                          background: `linear-gradient(0deg, rgba(0,0,0,0.12), rgba(0,0,0,0.12)), ${barColor}`,
                          borderRadius: 6
                        }}
                      />
                      {w > 80 && (
                        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 truncate text-[10px] font-medium text-white">
                          {t.tarea}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* OVERLAY ABSOLUTO — vertical grid + today line + dependency arrows */}
          <div
            className="pointer-events-none absolute"
            style={{ left: LEFT_W, top: HEADER_H, width: totalWidth, height: rowLayout.totalY }}
          >
            {/* Vertical grid (líneas según zoom) */}
            {gridMarkers.map((m, i) => (
              <div key={i} className="absolute top-0 h-full border-l border-stone-100" style={{ left: dayToX(m.date) }} />
            ))}

            {/* Today line — dashed vertical line que cruza todas las filas */}
            {todayX >= 0 && todayX <= totalWidth && (
              <div className="absolute top-0 h-full" style={{ left: todayX }}>
                <div
                  className="h-full"
                  style={{
                    width: 0,
                    borderLeft: "2px dashed #059669",
                    filter: "drop-shadow(0 0 4px rgba(5,150,105,0.4))"
                  }}
                />
                <div className="absolute -top-[34px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                  Hoy · {new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                </div>
              </div>
            )}

            {/* Dependency arrows SVG */}
            {showArrows && (
              <DependencyArrows
                phases={phases}
                cpm={cpm}
                collapsedPhases={collapsedPhases}
                rowOf={rowOf}
                totalWidth={totalWidth}
                totalHeight={rowLayout.totalY}
                dayToX={dayToX}
                showCritical={showCritical}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────── Dependency arrows SVG overlay ────────── */
const DependencyArrows = ({ phases, cpm, collapsedPhases, rowOf, totalWidth, totalHeight, dayToX, showCritical }) => {
  // Calculate row Y for each task id
  const yOf = useMemo(() => {
    const m = new Map();
    let y = 0;
    phases.forEach(p => {
      y += PHASE_H;
      if (!collapsedPhases.has(p.name)) {
        p.items.forEach(t => {
          m.set(t.id, y + ROW_H / 2);
          y += ROW_H;
        });
      }
    });
    return m;
  }, [phases, collapsedPhases]);

  // Build list of arrows
  const arrows = [];
  for (const p of phases) {
    if (collapsedPhases.has(p.name)) continue;
    for (const t of p.items) {
      const deps = normalizeDeps(t);
      const ty = yOf.get(t.id);
      const tStartX = dayToX(parseDate(t.inicio));
      const tEndX = dayToX(parseDate(t.fin));
      const cTo = cpm.get(t.id);
      for (const dep of deps) {
        const predY = yOf.get(dep.id);
        if (predY == null || ty == null) continue;
        const pred = phases.flatMap(ph => ph.items).find(it => it.id === dep.id);
        if (!pred) continue;
        const pStartX = dayToX(parseDate(pred.inicio));
        const pEndX = dayToX(parseDate(pred.fin));
        const cFrom = cpm.get(pred.id);

        // Determine arrow source and target points based on dep type
        let sx, sy, tx;
        if (dep.type === "FS") { sx = pEndX; tx = tStartX; }
        else if (dep.type === "SS") { sx = pStartX; tx = tStartX; }
        else if (dep.type === "FF") { sx = pEndX; tx = tEndX; }
        else if (dep.type === "SF") { sx = pStartX; tx = tEndX; }
        else { sx = pEndX; tx = tStartX; }
        sy = predY;
        const isCrit = showCritical && cFrom?.critical && cTo?.critical;

        arrows.push({ sx, sy, tx, ty, type: dep.type, isCrit, key: `${pred.id}-${t.id}` });
      }
    }
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={totalWidth}
      height={totalHeight}
      style={{ overflow: "visible" }}
    >
      <defs>
        <marker id="arrow-normal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#78716C" />
        </marker>
        <marker id="arrow-critical" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#BE123C" />
        </marker>
      </defs>
      {arrows.map(a => {
        // L-shaped path: from (sx,sy) go horizontally to mid, then vertically, then horizontally to (tx,ty)
        const midX = a.sx < a.tx ? a.tx - 10 : a.sx + 10;
        const path = `M ${a.sx} ${a.sy} L ${midX} ${a.sy} L ${midX} ${a.ty} L ${a.tx} ${a.ty}`;
        return (
          <path
            key={a.key}
            d={path}
            fill="none"
            stroke={a.isCrit ? "#BE123C" : "#78716C"}
            strokeWidth={a.isCrit ? 1.5 : 1}
            strokeDasharray={a.type === "FS" ? "" : "3 2"}
            markerEnd={a.isCrit ? "url(#arrow-critical)" : "url(#arrow-normal)"}
          />
        );
      })}
    </svg>
  );
};

/* ────────────────────────────────────────────────────────────────
   EDT VIEW — outline table with WBS hierarchy
─────────────────────────────────────────────────────────────── */
const EDTView = ({ phases, cpm, showCritical, onEdit, tareas }) => {
  const taskMap = useMemo(() => new Map(tareas.map(t => [t.id, t])), [tareas]);
  const renderDeps = (t) => {
    const deps = normalizeDeps(t);
    if (!deps.length) return <span className="text-stone-300">—</span>;
    return deps.map(d => {
      const pred = taskMap.get(d.id);
      if (!pred) return null;
      const phs = phases.find(p => p.items.some(it => it.id === d.id));
      const predTask = phs?.items.find(it => it.id === d.id);
      const wbs = predTask?.wbs || d.id;
      const label = d.type === "FS" && (!d.lag || d.lag === 0) ? wbs : `${wbs}${d.type}${d.lag ? (d.lag > 0 ? `+${d.lag}` : d.lag) : ""}`;
      return <span key={d.id} className="mr-1 inline-block rounded bg-stone-100 px-1 py-0.5 font-mono text-[10px] text-stone-700">{label}</span>;
    });
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm" style={{ overflow: "clip" }}>
      <table className="w-full text-left text-sm">
        <thead className="sticky top-[57px] z-30 bg-emerald-900 text-white">
          <tr>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider w-20">WBS</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider">Actividad</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider w-16 text-right">Días</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider w-28">Inicio</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider w-28">Fin</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider w-40">Predecesores</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider w-20 text-right">Holgura</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider w-24">Estado</th>
          </tr>
        </thead>
        <tbody>
          {phases.map(p => (
            <React.Fragment key={p.name}>
              <tr className="border-b border-stone-200 bg-stone-100/70">
                <td className="px-3 py-2 font-mono text-[11px] text-stone-700">{p.wbs}</td>
                <td className="px-3 py-2 text-[13px] font-semibold text-stone-800">{p.name}</td>
                <td colSpan={6} className="px-3 py-2 text-[11px] text-stone-500">{p.items.length} actividades</td>
              </tr>
              {p.items.map(t => {
                const c = cpm.get(t.id);
                const isCrit = c?.critical;
                return (
                  <tr
                    key={t.id}
                    onClick={() => onEdit(t)}
                    className={`cursor-pointer border-b border-stone-100 hover:bg-emerald-50 ${isCrit && showCritical ? "bg-rose-50/30" : ""}`}
                  >
                    <td className="px-3 py-2 pl-8 font-mono text-[11px] text-stone-500">{t.wbs}</td>
                    <td className="px-3 py-2 text-[13px] text-stone-800">
                      {t.isMilestone && <Diamond className="mr-1 inline h-3 w-3 text-amber-600" />}
                      {t.tarea}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[11px] text-stone-600">{c?.duracion || 0}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-stone-600">{fmtDate(t.inicio)}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-stone-600">{fmtDate(t.fin)}</td>
                    <td className="px-3 py-2 text-[11px]">{renderDeps(t)}</td>
                    <td className={`px-3 py-2 text-right font-mono text-[11px] ${isCrit ? "font-bold text-rose-700" : "text-stone-600"}`}>
                      {c ? `${c.slack}d` : "—"}
                    </td>
                    <td className="px-3 py-2"><StatePill avance={t.avance} /></td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   CALENDAR VIEW — month grid
─────────────────────────────────────────────────────────────── */
const CalendarView = ({ tareas, cpm, showCritical, onEdit }) => {
  const [month, setMonth] = useState(() => {
    const first = tareas.map(t => parseDate(t.inicio)).sort((a, b) => a - b)[0] || new Date();
    return new Date(first.getFullYear(), first.getMonth(), 1);
  });

  const goPrev = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goNext = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const goToday = () => { const n = new Date(); setMonth(new Date(n.getFullYear(), n.getMonth(), 1)); };

  // Build calendar grid (6 weeks, starts on Monday)
  const cells = useMemo(() => {
    const first = new Date(month);
    const dow = (first.getDay() + 6) % 7; // 0 = Monday
    const start = addDays(first, -dow);
    const out = [];
    for (let i = 0; i < 42; i++) {
      out.push(addDays(start, i));
    }
    return out;
  }, [month]);

  // Map: ISO date → tasks happening that day
  const dayTasks = useMemo(() => {
    const m = new Map();
    tareas.forEach(t => {
      const s = parseDate(t.inicio);
      const e = parseDate(t.fin);
      const days = daysBetween(s, e);
      for (let i = 0; i <= days; i++) {
        const d = addDays(s, i);
        const key = toISODate(d);
        if (!m.has(key)) m.set(key, []);
        m.get(key).push({ ...t, isStart: i === 0, isEnd: i === days });
      }
    });
    return m;
  }, [tareas]);

  const today = toISODate(new Date());

  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="rounded-md border border-stone-200 px-2 py-1 text-xs hover:bg-stone-50">‹</button>
          <button onClick={goToday} className="rounded-md border border-stone-200 px-2 py-1 text-xs hover:bg-stone-50">Hoy</button>
          <button onClick={goNext} className="rounded-md border border-stone-200 px-2 py-1 text-xs hover:bg-stone-50">›</button>
        </div>
        <h2 className="font-serif text-xl text-stone-900">
          {month.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
        </h2>
        <div className="text-[11px] text-stone-500">{tareas.length} actividades</div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
          <div key={d} className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-stone-600">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const isOtherMonth = d.getMonth() !== month.getMonth();
          const isToday = toISODate(d) === today;
          const tasksHere = dayTasks.get(toISODate(d)) || [];
          return (
            <div
              key={i}
              className={`min-h-[100px] border-b border-r border-stone-100 p-1.5 ${isOtherMonth ? "bg-stone-50/50" : "bg-white"} ${isToday ? "ring-2 ring-emerald-500 ring-inset" : ""}`}
            >
              <div className={`mb-1 text-right text-[11px] ${isOtherMonth ? "text-stone-300" : isToday ? "font-bold text-emerald-700" : "text-stone-500"}`}>
                {d.getDate()}
              </div>
              <div className="space-y-0.5">
                {tasksHere.slice(0, 4).map((t, j) => {
                  const c = cpm.get(t.id);
                  const isCrit = c?.critical;
                  const bg = isCrit && showCritical ? "#BE123C" : (t.color || "#1F3D2E");
                  return (
                    <div
                      key={`${t.id}-${j}`}
                      onClick={() => onEdit(t)}
                      className="cursor-pointer truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-white hover:opacity-90"
                      style={{ background: bg, opacity: 0.92, borderLeft: t.isStart ? "2px solid white" : "", borderRight: t.isEnd ? "2px solid white" : "" }}
                      title={`${t.tarea} · ${fmtDate(t.inicio)} → ${fmtDate(t.fin)}`}
                    >
                      {t.isMilestone && "◆ "}{t.tarea}
                    </div>
                  );
                })}
                {tasksHere.length > 4 && <div className="text-[10px] text-stone-500">+{tasksHere.length - 4} más</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   TASK DRAWER — edit/create with dependency editor
─────────────────────────────────────────────────────────────── */
const TaskDrawer = ({ task, tareas, phases, onClose, onSave, onDelete }) => {
  const [form, setForm] = useState(() => ({
    ...task,
    dependencies: normalizeDeps(task)
  }));

  const isNew = !!task.__isNew;
  const canSave = form.tarea?.trim() && form.fase && form.inicio && form.fin;

  // Available predecessors (exclude self)
  const candidates = useMemo(() => tareas.filter(t => t.id !== form.id), [tareas, form.id]);

  const addDep = (id) => {
    if (form.dependencies.some(d => d.id === id)) return;
    setForm(f => ({ ...f, dependencies: [...f.dependencies, { id, type: "FS", lag: 0 }] }));
  };
  const updateDep = (id, patch) => {
    setForm(f => ({ ...f, dependencies: f.dependencies.map(d => d.id === id ? { ...d, ...patch } : d) }));
  };
  const removeDep = (id) => {
    setForm(f => ({ ...f, dependencies: f.dependencies.filter(d => d.id !== id) }));
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-400">{isNew ? "Nueva actividad" : "Editar actividad"}</div>
            <div className="text-[15px] font-semibold text-stone-900 truncate">{form.tarea || "(sin nombre)"}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>

        <div className="space-y-4 p-5">
          {/* Name */}
          <Field label="Nombre de la actividad">
            <input
              type="text"
              value={form.tarea || ""}
              onChange={e => setForm({ ...form, tarea: e.target.value })}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Ej. Mampostería piso 1"
            />
          </Field>

          {/* Phase + milestone */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fase / Paquete EDT">
              <select
                value={form.fase}
                onChange={e => setForm({ ...form, fase: e.target.value })}
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {phases.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                <option value="__new__">+ Nueva fase…</option>
              </select>
              {form.fase === "__new__" && (
                <input
                  type="text"
                  autoFocus
                  onBlur={e => setForm(f => ({ ...f, fase: e.target.value || phases[0]?.name }))}
                  className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm"
                  placeholder="Nombre de la nueva fase"
                />
              )}
            </Field>
            <Field label="Tipo">
              <label className="inline-flex cursor-pointer items-center gap-2 pt-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isMilestone || false}
                  onChange={e => setForm({ ...form, isMilestone: e.target.checked })}
                  className="h-4 w-4 accent-amber-600"
                />
                <Diamond className="h-3.5 w-3.5 text-amber-600" />
                <span>Hito (milestone)</span>
              </label>
            </Field>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inicio">
              <input
                type="date"
                value={form.inicio || ""}
                onChange={e => setForm({ ...form, inicio: e.target.value })}
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm"
              />
            </Field>
            <Field label="Fin">
              <input
                type="date"
                value={form.fin || ""}
                onChange={e => setForm({ ...form, fin: e.target.value })}
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm"
              />
            </Field>
          </div>

          {/* Baseline */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Línea base inicio">
              <input
                type="date"
                value={form.baselineInicio || ""}
                onChange={e => setForm({ ...form, baselineInicio: e.target.value })}
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm"
              />
            </Field>
            <Field label="Línea base fin">
              <input
                type="date"
                value={form.baselineFin || ""}
                onChange={e => setForm({ ...form, baselineFin: e.target.value })}
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm"
              />
            </Field>
          </div>

          {/* Progress + color */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Avance: ${form.avance || 0}%`}>
              <input
                type="range"
                min="0" max="100" step="5"
                value={form.avance || 0}
                onChange={e => setForm({ ...form, avance: parseInt(e.target.value) })}
                className="w-full accent-emerald-700"
              />
            </Field>
            <Field label="Color">
              <input
                type="color"
                value={form.color || "#1F3D2E"}
                onChange={e => setForm({ ...form, color: e.target.value })}
                className="h-8 w-full rounded-md border border-stone-300"
              />
            </Field>
          </div>

          {/* Dependency editor */}
          <Field label={`Predecesores (${form.dependencies.length})`}>
            <DepsInfoBox />

            <div className="space-y-1.5">
              {form.dependencies.map(d => {
                const pred = tareas.find(t => t.id === d.id);
                if (!pred) return null;
                return (
                  <div key={d.id} className="flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 p-1.5">
                    <span className="flex-1 truncate text-xs text-stone-700">{pred.tarea}</span>
                    <select
                      value={d.type}
                      onChange={e => updateDep(d.id, { type: e.target.value })}
                      className="rounded border border-stone-300 bg-white px-1 py-0.5 font-mono text-[10px]"
                    >
                      {["FS", "SS", "FF", "SF"].map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                    <input
                      type="number"
                      value={d.lag || 0}
                      onChange={e => updateDep(d.id, { lag: parseInt(e.target.value) || 0 })}
                      className="w-12 rounded border border-stone-300 bg-white px-1 py-0.5 text-center font-mono text-[10px]"
                      title="Lag en días"
                    />
                    <button onClick={() => removeDep(d.id)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-emerald-700 hover:underline">+ Agregar predecesor</summary>
              <div className="mt-1 max-h-48 overflow-y-auto rounded-md border border-stone-200 bg-white">
                {candidates
                  .filter(c => !form.dependencies.some(d => d.id === c.id))
                  .map(c => (
                    <button
                      key={c.id}
                      onClick={() => addDep(c.id)}
                      className="block w-full truncate border-b border-stone-100 px-2 py-1 text-left text-xs hover:bg-emerald-50"
                    >
                      <span className="text-stone-400">[{c.fase}]</span> {c.tarea}
                    </button>
                  ))}
              </div>
            </details>
          </Field>
        </div>

        <footer className="sticky bottom-0 flex items-center justify-between border-t border-stone-200 bg-stone-50 px-5 py-3">
          {!isNew ? (
            <button
              onClick={() => { if (confirm("¿Eliminar esta actividad?")) onDelete(form.id); }}
              className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50">
              Cancelar
            </button>
            <button
              onClick={() => onSave(form)}
              disabled={!canSave}
              className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isNew ? "Crear actividad" : "Guardar cambios"}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-500">{label}</span>
    {children}
  </label>
);

/* ─────────── DepsInfoBox: tooltip (i) desplegable con tipos de dependencia ─────────── */
const DepsInfoBox = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] text-stone-600 hover:bg-stone-100"
        aria-expanded={open}
      >
        <Info className="h-3 w-3" />
        <span>Tipos de dependencia</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-1.5 rounded-md border border-stone-200 bg-white p-3 text-[11px] leading-relaxed text-stone-700 shadow-sm">
          <div className="grid grid-cols-[40px_1fr] gap-x-2 gap-y-1.5">
            <code className="font-mono font-semibold text-emerald-800">FS</code>
            <div><strong>Fin → Inicio.</strong> El predecesor debe terminar para que la actividad pueda iniciar. Es el tipo más común (≈90% de los casos en obra).</div>
            <code className="font-mono font-semibold text-emerald-800">SS</code>
            <div><strong>Inicio → Inicio.</strong> Ambas inician al tiempo (o con un desfase). Útil cuando dos cuadrillas trabajan en paralelo desde el mismo punto.</div>
            <code className="font-mono font-semibold text-emerald-800">FF</code>
            <div><strong>Fin → Fin.</strong> Ambas terminan al tiempo. Útil cuando el cierre de una actividad depende del cierre de otra (ej. limpieza final de un piso).</div>
            <code className="font-mono font-semibold text-emerald-800">SF</code>
            <div><strong>Inicio → Fin.</strong> El predecesor inicia y la sucesora termina (raro, usado en just-in-time).</div>
          </div>

          <div className="mt-3 border-t border-stone-100 pt-2">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Lag</div>
            <div className="text-stone-600">
              Días de espera (positivo) o adelanto (negativo) entre las dos actividades.
              Ej. <code className="rounded bg-stone-100 px-1 py-0.5 font-mono">FS +3</code> = "empieza 3 días después de que termine el predecesor".
            </div>
          </div>

          <div className="mt-3 rounded-md border border-emerald-100 bg-emerald-50/50 p-2">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Ejemplo</div>
            <div className="text-stone-700">
              <strong>Pintura de muros</strong> tiene como predecesor <strong>Pañete</strong> con tipo <code className="rounded bg-white px-1 py-0.5 font-mono">FS +2</code>:
              la pintura empieza <strong>2 días después</strong> de terminar el pañete (tiempo de secado).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CronogramaProScreen;
