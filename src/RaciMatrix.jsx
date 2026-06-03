import React, { useState, useMemo, useEffect } from "react";
import {
  Users, Plus, Trash2, Mail, Save, AlertCircle, X, Edit3, Download
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Matriz RACI editable por proyecto
   - Filas: entregables / tipos de evento (los 11 docs PMI + eventos)
   - Columnas: roles del proyecto (auto-poblados desde el wizard)
   - Celdas: R / A / C / I / —
   - Cada rol tiene: nombre, organización, email
   - Una sola "A" por fila (Accountable) - validación visual
   - Persistencia por proyecto
   - getRaciSuggestionForEvent(eventType) → roles a notificar
────────────────────────────────────────────────────────────────── */

export const EVENTOS_RACI = [
  { id: "doc-01-charter",     grupo: "Documentos PMI", label: "01 · Acta de constitución" },
  { id: "doc-02-stakeholders",grupo: "Documentos PMI", label: "02 · Stakeholders + RACI" },
  { id: "doc-03-edt",         grupo: "Documentos PMI", label: "03 · EDT/WBS" },
  { id: "doc-04-cronograma",  grupo: "Documentos PMI", label: "04 · Cronograma" },
  { id: "doc-05-capex",       grupo: "Documentos PMI", label: "05 · CAPEX" },
  { id: "doc-06-riesgos",     grupo: "Documentos PMI", label: "06 · Riesgos" },
  { id: "doc-07-cambios",     grupo: "Documentos PMI", label: "07 · Control de cambios" },
  { id: "doc-08-acta-comite", grupo: "Documentos PMI", label: "08 · Acta comité semanal" },
  { id: "doc-09-evm",         grupo: "Documentos PMI", label: "09 · Informe EVM" },
  { id: "doc-10-lecciones",   grupo: "Documentos PMI", label: "10 · Lecciones aprendidas" },
  { id: "doc-11-cierre",      grupo: "Documentos PMI", label: "11 · Informe de cierre" },

  { id: "evt-doc-arquitectura", grupo: "Subida documentos", label: "Doc: Arquitectura" },
  { id: "evt-doc-tecnico",      grupo: "Subida documentos", label: "Doc: Técnico / MEP" },
  { id: "evt-doc-legal",        grupo: "Subida documentos", label: "Doc: Legal" },
  { id: "evt-doc-licencia",     grupo: "Subida documentos", label: "Doc: Licencia / POT" },
  { id: "evt-doc-comercial",    grupo: "Subida documentos", label: "Doc: Comercial" },
  { id: "evt-doc-fiduciaria",   grupo: "Subida documentos", label: "Doc: Fiduciaria" },
  { id: "evt-doc-financiero",   grupo: "Subida documentos", label: "Doc: Financiero" },

  { id: "evt-cambio-alcance",    grupo: "Cambios", label: "Cambio: Alcance" },
  { id: "evt-cambio-presupuesto",grupo: "Cambios", label: "Cambio: Presupuesto" },
  { id: "evt-cambio-cronograma", grupo: "Cambios", label: "Cambio: Cronograma" },

  { id: "evt-reunion-acta",      grupo: "Reuniones", label: "Acta de reunión guardada" },
  { id: "evt-pendiente-vencido", grupo: "Pendientes", label: "Pendiente vencido" },
  { id: "evt-pendiente-critico", grupo: "Pendientes", label: "Pendiente crítico creado" },

  { id: "evt-hito-completado",   grupo: "Hitos", label: "Hito gerencial completado" },
  { id: "evt-hito-retrasado",    grupo: "Hitos", label: "Hito gerencial retrasado" }
];

/* Mapeo entre el "tipo" usado por RaciNotifyModal y los eventos de la matriz */
export const TIPO_TO_EVENTO = {
  "documento-subido":     "evt-doc-arquitectura",
  "documento-legal":      "evt-doc-legal",
  "documento-licencia":   "evt-doc-licencia",
  "documento-financiero": "evt-doc-financiero",
  "cambio-alcance":       "evt-cambio-alcance",
  "cambio-presupuesto":   "evt-cambio-presupuesto",
  "cambio-cronograma":    "evt-cambio-cronograma",
  "reunion-acta":         "evt-reunion-acta",
  "pendiente-vencido":    "evt-pendiente-vencido"
};

const RACI_VALS = ["", "R", "A", "C", "I"];
const RACI_COLOR = {
  R: "bg-emerald-500 text-white",
  A: "bg-rose-500 text-white",
  C: "bg-amber-500 text-white",
  I: "bg-stone-400 text-white",
  "": "bg-stone-50 text-stone-300"
};

/* Roles por defecto si no hay proyecto */
const ROLES_DEFAULT = [
  { id: "pm-cretto",      nombre: "PM Cretto",            organizacion: "Cretto", email: "" },
  { id: "sponsor",        nombre: "Sponsor",              organizacion: "Promotor", email: "" },
  { id: "promotor",       nombre: "Gerente Promotor",     organizacion: "Promotor", email: "" },
  { id: "fiduciaria",     nombre: "Fiduciaria",           organizacion: "Fiduciaria", email: "" },
  { id: "banco",          nombre: "Banco financiador",    organizacion: "Banco", email: "" },
  { id: "arquitecto",     nombre: "Arquitecto",           organizacion: "Diseño", email: "" },
  { id: "constructor",    nombre: "Constructor",          organizacion: "Obra", email: "" },
  { id: "interventoria",  nombre: "Interventoría",        organizacion: "Control", email: "" },
  { id: "comercializadora",nombre: "Comercializadora",     organizacion: "Ventas", email: "" }
];

/* Construye roles iniciales desde el proyecto */
export const buildRolesFromProject = (project) => {
  if (!project) return [...ROLES_DEFAULT];
  const roles = [];
  const add = (id, nombre, organizacion, email) => {
    if (!nombre || !nombre.trim()) return;
    roles.push({ id, nombre: nombre.trim(), organizacion: organizacion || "", email: email || "" });
  };
  add("pm-cretto", project.pm || "PM Cretto", "Cretto");
  (project.sponsors || []).forEach((s, i) => add(`sponsor-${i + 1}`, s, "Promotor"));
  add("promotor", project.gerenteProyectoPromotor, "Promotor");
  add("comercial", project.gerenteComercial, "Comercial");
  add("comercializadora", project.comercializadora, "Comercial");
  add("fiduciaria", project.fiduciaria, "Fiduciaria");
  add("banco", project.bancoFinanciador, "Banco");
  (project.arquitectos || []).forEach((a, i) => add(`arq-${i + 1}`, a, "Diseño"));
  add("fachadas", project.diseñadorFachadas, "Diseño");
  add("paisajismo", project.paisajismo, "Diseño");
  add("ing-estructural", project.ingenieroEstructural, "Ingeniería");
  add("ing-suelos", project.ingenieroSuelos, "Ingeniería");
  add("ing-hidraulico", project.ingenieroHidraulico, "Ingeniería");
  add("ing-electrico", project.ingenieroElectrico, "Ingeniería");
  add("ing-gas", project.ingenieroGas, "Ingeniería");
  add("ing-bioclimatico", project.ingenieroBioclimatico, "Ingeniería");
  add("constructor", project.constructor, "Obra");
  add("interventoria", project.interventor, "Control");
  add("residente", project.residenteObra, "Obra");
  add("curaduria", project.curaduria, "Licencias");
  return roles.length ? roles : [...ROLES_DEFAULT];
};

/* Defaults RACI inteligentes por evento */
const SMART_DEFAULTS = {
  "evt-doc-arquitectura":   { "arq-1": "R", "pm-cretto": "A", "interventoria": "C", "constructor": "I" },
  "evt-doc-tecnico":        { "ing-estructural": "R", "pm-cretto": "A", "interventoria": "C", "constructor": "I" },
  "evt-doc-legal":          { "pm-cretto": "R", "promotor": "A", "sponsor-1": "I", "fiduciaria": "I", "banco": "I" },
  "evt-doc-licencia":       { "arq-1": "R", "pm-cretto": "A", "curaduria": "C", "constructor": "I", "interventoria": "I" },
  "evt-doc-comercial":      { "comercializadora": "R", "comercial": "A", "promotor": "I", "fiduciaria": "I" },
  "evt-doc-fiduciaria":     { "fiduciaria": "R", "promotor": "A", "pm-cretto": "C", "banco": "I", "sponsor-1": "I" },
  "evt-doc-financiero":     { "pm-cretto": "R", "promotor": "A", "sponsor-1": "I", "fiduciaria": "I", "banco": "I" },
  "evt-cambio-alcance":     { "pm-cretto": "R", "promotor": "A", "sponsor-1": "C", "constructor": "C", "interventoria": "C", "arq-1": "C" },
  "evt-cambio-presupuesto": { "pm-cretto": "R", "promotor": "A", "sponsor-1": "C", "fiduciaria": "I", "banco": "I" },
  "evt-cambio-cronograma":  { "pm-cretto": "R", "promotor": "A", "constructor": "C", "interventoria": "C", "comercializadora": "I" },
  "evt-reunion-acta":       { "pm-cretto": "R", "promotor": "I", "sponsor-1": "I" },
  "evt-pendiente-vencido":  { "pm-cretto": "R", "promotor": "I" },
  "evt-pendiente-critico":  { "pm-cretto": "R", "promotor": "A", "sponsor-1": "I" },
  "evt-hito-completado":    { "pm-cretto": "R", "promotor": "I", "sponsor-1": "I", "fiduciaria": "I", "banco": "I" },
  "evt-hito-retrasado":     { "pm-cretto": "R", "promotor": "A", "sponsor-1": "I", "constructor": "C" },
  "doc-01-charter":         { "pm-cretto": "R", "promotor": "A", "sponsor-1": "C" },
  "doc-02-stakeholders":    { "pm-cretto": "R", "promotor": "A" },
  "doc-03-edt":             { "pm-cretto": "R", "promotor": "A", "constructor": "C" },
  "doc-04-cronograma":      { "pm-cretto": "R", "promotor": "A", "constructor": "C", "interventoria": "C" },
  "doc-05-capex":           { "pm-cretto": "R", "promotor": "A", "sponsor-1": "C", "fiduciaria": "I" },
  "doc-06-riesgos":         { "pm-cretto": "R", "promotor": "A" },
  "doc-07-cambios":         { "pm-cretto": "R", "promotor": "A", "constructor": "C", "interventoria": "C" },
  "doc-08-acta-comite":     { "pm-cretto": "R", "promotor": "I" },
  "doc-09-evm":             { "pm-cretto": "R", "promotor": "A", "sponsor-1": "I" },
  "doc-10-lecciones":       { "pm-cretto": "R", "promotor": "I" },
  "doc-11-cierre":          { "pm-cretto": "R", "promotor": "A", "sponsor-1": "A", "fiduciaria": "I", "banco": "I" }
};

const buildDefaultMatrix = (roles) => {
  const m = {};
  EVENTOS_RACI.forEach(e => {
    m[e.id] = {};
    const sd = SMART_DEFAULTS[e.id] || {};
    roles.forEach(r => {
      m[e.id][r.id] = sd[r.id] || "";
    });
  });
  return m;
};

/* ─── Helper: roles a notificar para un tipo de evento (consumido por RaciNotifyModal) ─── */
export const getNotifyRolesFromMatrix = (matrix, roles, eventoId) => {
  if (!matrix || !matrix[eventoId]) return [];
  return roles
    .filter(r => ["R", "A", "C", "I"].includes(matrix[eventoId][r.id]))
    .map(r => ({
      id: r.id,
      label: `${r.nombre}${r.organizacion ? " · " + r.organizacion : ""}`,
      raci: matrix[eventoId][r.id]
    }));
};

const RaciMatrix = ({ project, onMatrixChange }) => {
  const [roles, setRoles] = useState(() => buildRolesFromProject(project));
  const [matrix, setMatrix] = useState(() => buildDefaultMatrix(buildRolesFromProject(project)));
  const [grupoExp, setGrupoExp] = useState(() => {
    const g = {};
    Array.from(new Set(EVENTOS_RACI.map(e => e.grupo))).forEach(x => { g[x] = true; });
    return g;
  });
  const [roleModal, setRoleModal] = useState(null);

  const storageKey = `crettohub:raci:${project?.id || "default"}`;

  /* Cargar */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(storageKey);
        if (m && r && r.value) {
          const data = JSON.parse(r.value);
          if (data.roles) setRoles(data.roles);
          if (data.matrix) setMatrix(data.matrix);
        }
      } catch {}
    })();
    return () => { m = false; };
  }, [storageKey]);

  /* Guardar */
  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(storageKey, JSON.stringify({ roles, matrix })).catch(() => {});
      if (onMatrixChange) onMatrixChange({ roles, matrix });
    }, 400);
    return () => clearTimeout(t);
  }, [roles, matrix, storageKey, onMatrixChange]);

  const grupos = useMemo(() => Array.from(new Set(EVENTOS_RACI.map(e => e.grupo))), []);

  /* Mutaciones de matriz */
  const setCell = (evtId, roleId, val) => {
    setMatrix(prev => {
      const next = { ...prev, [evtId]: { ...(prev[evtId] || {}) } };
      // Si pone "A", limpiar otras "A" en la misma fila
      if (val === "A") {
        Object.keys(next[evtId]).forEach(rid => {
          if (next[evtId][rid] === "A") next[evtId][rid] = "";
        });
      }
      next[evtId][roleId] = val;
      return next;
    });
  };

  const cycleCell = (evtId, roleId) => {
    const cur = matrix[evtId]?.[roleId] || "";
    const idx = RACI_VALS.indexOf(cur);
    const next = RACI_VALS[(idx + 1) % RACI_VALS.length];
    setCell(evtId, roleId, next);
  };

  /* Mutaciones de roles */
  const addRole = (data) => {
    const id = data.id || `role-${Date.now()}`;
    setRoles(prev => [...prev, { ...data, id }]);
    setMatrix(prev => {
      const next = { ...prev };
      EVENTOS_RACI.forEach(e => { next[e.id] = { ...(next[e.id] || {}), [id]: "" }; });
      return next;
    });
    setRoleModal(null);
  };

  const updateRole = (id, patch) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const removeRole = (id) => {
    if (!confirm("¿Eliminar este rol de la matriz?")) return;
    setRoles(prev => prev.filter(r => r.id !== id));
    setMatrix(prev => {
      const next = {};
      Object.entries(prev).forEach(([evt, row]) => {
        const { [id]: _, ...rest } = row;
        next[evt] = rest;
      });
      return next;
    });
  };

  /* Reset con defaults */
  const resetDefaults = () => {
    if (!confirm("¿Reiniciar la matriz a los valores sugeridos por defecto?")) return;
    setMatrix(buildDefaultMatrix(roles));
  };

  /* Validación: filas sin A */
  const filasSinA = useMemo(() => {
    return EVENTOS_RACI.filter(e => !Object.values(matrix[e.id] || {}).includes("A")).map(e => e.id);
  }, [matrix]);

  /* Export CSV */
  const exportCsv = () => {
    const headers = ["Evento", ...roles.map(r => r.nombre)];
    const lines = [headers.join(",")];
    EVENTOS_RACI.forEach(e => {
      lines.push([e.label, ...roles.map(r => matrix[e.id]?.[r.id] || "")].map(c => `"${c}"`).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `RACI-${project?.nombre || "proyecto"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Matriz RACI · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Responsabilidades y notificaciones</h1>
          <p className="mt-1 text-sm text-stone-500">
            Define quién es Responsable (R), Aprobador (A), Consultado (C) o Informado (I) por entregable y tipo de evento. El modal de notificaciones consulta esta matriz al subir documentos, registrar cambios y guardar actas.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetDefaults} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Reset defaults</button>
          <button onClick={exportCsv} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50"><Download className="h-3.5 w-3.5" /> CSV</button>
          <button onClick={() => setRoleModal({})} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800"><Plus className="h-3.5 w-3.5" /> Agregar rol</button>
        </div>
      </header>

      {/* Leyenda */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-stone-200 bg-white px-3 py-2 text-[11px]">
        <span className="font-semibold text-stone-700">Leyenda:</span>
        {[
          ["R", "Responsable (ejecuta)", "emerald"],
          ["A", "Aprobador (1 por fila)", "rose"],
          ["C", "Consultado", "amber"],
          ["I", "Informado", "stone"]
        ].map(([k, l, c]) => (
          <span key={k} className="inline-flex items-center gap-1">
            <span className={`inline-block h-4 w-4 rounded text-center font-mono text-[10px] font-bold ${RACI_COLOR[k]}`}>{k}</span>
            <span className="text-stone-600">{l}</span>
          </span>
        ))}
        <span className="ml-auto text-stone-500">Click en celda para ciclar: — → R → A → C → I</span>
      </div>

      {filasSinA.length > 0 && (
        <div className="mb-3 flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          <AlertCircle className="h-3.5 w-3.5" />
          <strong>{filasSinA.length}</strong> evento(s) no tienen Aprobador (A) asignado. Cada fila debe tener exactamente un "A".
        </div>
      )}

      {/* Matriz */}
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="text-[12px]">
          <thead className="sticky top-0 bg-stone-50">
            <tr>
              <th className="sticky left-0 z-10 min-w-[240px] border-b border-r border-stone-200 bg-stone-50 px-3 py-2 text-left text-[10px] uppercase tracking-wider text-stone-500">Evento / Entregable</th>
              {roles.map(r => (
                <th key={r.id} className="border-b border-stone-200 px-1 py-2 text-center align-bottom" style={{ minWidth: 70 }}>
                  <div className="flex flex-col items-center gap-0.5">
                    <button onClick={() => setRoleModal(r)} className="text-[10px] font-semibold text-stone-700 hover:text-emerald-700 text-center leading-tight" title={`${r.nombre}\n${r.organizacion}\n${r.email}`}>
                      {r.nombre}
                    </button>
                    {r.organizacion && <span className="text-[9px] text-stone-400">{r.organizacion}</span>}
                    <button onClick={() => removeRole(r.id)} className="text-stone-300 hover:text-rose-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grupos.map(g => {
              const expanded = grupoExp[g];
              const eventosGrupo = EVENTOS_RACI.filter(e => e.grupo === g);
              return (
                <React.Fragment key={g}>
                  <tr className="bg-stone-100/60">
                    <td className="sticky left-0 z-10 cursor-pointer border-r border-stone-200 bg-stone-100/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-700" colSpan={1} onClick={() => setGrupoExp(p => ({ ...p, [g]: !p[g] }))}>
                      {expanded ? "▾" : "▸"} {g} ({eventosGrupo.length})
                    </td>
                    <td colSpan={roles.length} className="bg-stone-100/60"></td>
                  </tr>
                  {expanded && eventosGrupo.map(e => {
                    const sinA = filasSinA.includes(e.id);
                    return (
                      <tr key={e.id} className="border-t border-stone-100">
                        <td className={`sticky left-0 z-10 border-r border-stone-200 bg-white px-3 py-1.5 text-stone-800 ${sinA ? "bg-amber-50/40" : ""}`}>
                          {e.label}
                        </td>
                        {roles.map(r => {
                          const val = matrix[e.id]?.[r.id] || "";
                          return (
                            <td key={r.id} className="border-l border-stone-100 px-1 py-1 text-center">
                              <button
                                onClick={() => cycleCell(e.id, r.id)}
                                className={`h-6 w-8 rounded font-mono text-[10px] font-bold transition-all hover:scale-110 ${RACI_COLOR[val]}`}
                                title={`${r.nombre} → ${e.label}`}
                              >
                                {val || "—"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {roleModal !== null && (
        <RoleModal
          initial={roleModal.id ? roleModal : null}
          onClose={() => setRoleModal(null)}
          onSave={(data) => {
            if (data.id && roles.find(r => r.id === data.id)) {
              updateRole(data.id, data);
              setRoleModal(null);
            } else {
              addRole(data);
            }
          }}
        />
      )}
    </div>
  );
};

const RoleModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || { id: "", nombre: "", organizacion: "", email: "", telefono: "" });
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">{initial ? "Editar rol" : "Nuevo rol"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-3 p-4">
          <Field label="Nombre / persona o función" required>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="inp" placeholder="Ej. Juan Pérez · Arquitecto" />
          </Field>
          <Field label="Organización / empresa">
            <input value={form.organizacion} onChange={e => setForm({ ...form, organizacion: e.target.value })} className="inp" placeholder="Ej. Studio Manrique" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email para notificaciones">
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="inp" placeholder="correo@empresa.com" />
            </Field>
            <Field label="Teléfono">
              <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="inp" placeholder="+57 …" />
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

export default RaciMatrix;
