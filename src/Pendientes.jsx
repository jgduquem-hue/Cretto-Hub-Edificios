import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  CheckCircle2, Circle, AlertCircle, Plus, Trash2, Search, Filter,
  Calendar, User, ArrowUpCircle, Flag, X, Clock, Tag, MessageSquare,
  ChevronRight, ChevronDown, ListTree, Send, Paperclip, Edit3,
  Settings, GripVertical, Zap, UserPlus, Layers
} from "lucide-react";
import { useResizableColumns, ResizableTh, ResetWidthsButton } from "./ResizableColumns.jsx";
import { HUB_TO_NOTION_ID, notionUrl, NOTION_SOURCE } from "./notionSync.js";

/* ────────────────────────────────────────────────────────────────
   Seguimiento de actividades — estilo Notion
   - Sub-tareas anidadas (parentId)
   - Bitácora de comentarios por actividad
   - Kanban con drag & drop
   - Multi-filtros (responsable, categoría, prioridad, esfuerzo)
   - Tarjetas configurables (mostrar / ocultar campos)
   - Auto-merge de responsables a Stakeholders DB
   - 3 vistas: árbol · kanban · por responsable
────────────────────────────────────────────────────────────────── */

const PRIORIDADES = [
  { id: "alta",   label: "Alta",   color: "rose" },
  { id: "media",  label: "Media",  color: "amber" },
  { id: "baja",   label: "Baja",   color: "stone" }
];

const ESFUERZOS = [
  { id: "baja",   label: "Low" },
  { id: "media",  label: "Medium" },
  { id: "alta",   label: "High" }
];

const ESTADOS = [
  { id: "pendiente",  label: "To Do",      color: "stone" },
  { id: "en-curso",   label: "In Progress",color: "blue" },
  { id: "bloqueado",  label: "Blocked",    color: "rose" },
  { id: "completado", label: "Done",       color: "emerald" }
];

/* Categorías alineadas a tags Notion + edificación */
const CATEGORIAS = [
  "Financiero", "Legal", "Técnico", "Comercial",
  "Obra", "Diseño", "Licencias", "Fiducia", "Banco",
  "Compras", "MEP", "Acabados", "Calidad", "Otro"
];

const COLOR_CLASS = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  blue:    "bg-blue-100 text-blue-800 border-blue-200",
  amber:   "bg-amber-100 text-amber-800 border-amber-200",
  rose:    "bg-rose-100 text-rose-800 border-rose-200",
  stone:   "bg-stone-100 text-stone-700 border-stone-200",
  violet:  "bg-violet-100 text-violet-800 border-violet-200"
};

/* Seed: 37 actividades importadas live desde Notion - Casa 107 (Tasks [PPMP]) */
const SEED = [
  /* === 24 originales del primer export === */
  { id: 1,  parentId: null, descripcion: "Finalizar Proceso Segmentación Fiducia", responsable: "Hector Gaviria", tags: ["Financiero"], categoria: "Financiero", prioridad: "alta", esfuerzo: "media", estado: "pendiente", fecha: "2026-06-09", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 2,  parentId: 1,    descripcion: "Reunión Abogados - Segmentación", responsable: "Maria Fernanda Arango", tags: ["Financiero"], categoria: "Financiero", prioridad: "alta", esfuerzo: "media", estado: "pendiente", fecha: "2026-06-04", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 3,  parentId: 1,    descripcion: "Reunión Fiducia - Definición Constructor", responsable: "Hector Gaviria", tags: ["Financiero"], categoria: "Financiero", prioridad: "alta", esfuerzo: "media", estado: "pendiente", fecha: "2026-06-04", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 4,  parentId: null, descripcion: "Radicación Final de Crédito al Banco", responsable: "Juan Diego Duque, Hector Gaviria", tags: ["Financiero"], categoria: "Financiero", prioridad: "alta", esfuerzo: "media", estado: "pendiente", fecha: "2026-06-05", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 5,  parentId: 4,    descripcion: "Flujo de caja", responsable: "Hector Gaviria", tags: ["Financiero"], categoria: "Financiero", prioridad: "media", esfuerzo: "media", estado: "completado", fecha: "2026-06-02", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 6,  parentId: null, descripcion: "Entrega de Póliza Decenal", responsable: "Hector Gaviria", tags: ["Legal"], categoria: "Legal", prioridad: "alta", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 7,  parentId: 6,    descripcion: "Reunión con Asesor Angela Gaitán", responsable: "Hector Gaviria", tags: ["Legal"], categoria: "Legal", prioridad: "alta", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 8,  parentId: 6,    descripcion: "Reunión con Asesor Nicolás Cadena", responsable: "Hector Gaviria", tags: ["Legal"], categoria: "Legal", prioridad: "alta", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 9,  parentId: null, descripcion: "Notificación de Desalojo", responsable: "Juan Diego Duque", tags: ["Legal"], categoria: "Legal", prioridad: "alta", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 10, parentId: null, descripcion: "Actas de Vecindad", responsable: "Pablo Ruiz", tags: ["Técnico"], categoria: "Técnico", prioridad: "baja", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 11, parentId: null, descripcion: "Englobar Lotes", responsable: "Lizeth Gaona", tags: ["Legal"], categoria: "Legal", prioridad: "alta", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 12, parentId: null, descripcion: "Cancelación de RPH", responsable: "Lizeth Gaona", tags: ["Legal"], categoria: "Legal", prioridad: "alta", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 13, parentId: null, descripcion: "Entregar Cuadros Comparativos para licitación", responsable: "Pablo Ruiz", tags: ["Técnico"], categoria: "Técnico", prioridad: "media", esfuerzo: "media", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 14, parentId: 13,   descripcion: "Licitación de Pilotaje", responsable: "Pablo Ruiz", tags: ["Técnico"], categoria: "Técnico", prioridad: "media", esfuerzo: "media", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 15, parentId: 13,   descripcion: "Licitación de Eléctrico", responsable: "Pablo Ruiz", tags: ["Técnico"], categoria: "Técnico", prioridad: "media", esfuerzo: "media", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 16, parentId: 13,   descripcion: "Licitación de Ventanería", responsable: "Pablo Ruiz", tags: ["Técnico"], categoria: "Técnico", prioridad: "media", esfuerzo: "media", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 17, parentId: null, descripcion: "Finalizar Presupuesto Obra Gris", responsable: "Alvaro Andrade", tags: ["Técnico"], categoria: "Técnico", prioridad: "alta", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 18, parentId: null, descripcion: "Expedición Licencia de construcción", responsable: "Diego Garcia", tags: ["Técnico"], categoria: "Técnico", prioridad: "alta", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 19, parentId: null, descripcion: "Inscripción en secretaria de Hacienda", responsable: "Sandra Sandoval", tags: ["Técnico"], categoria: "Técnico", prioridad: "alta", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 20, parentId: null, descripcion: "Soterrar redes eléctricas", responsable: "Juan Diego Duque", tags: ["Técnico"], categoria: "Técnico", prioridad: "media", esfuerzo: "media", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 21, parentId: null, descripcion: "Firmar actas de cada Unidad", responsable: "Paola Lima", tags: ["Comercial"], categoria: "Comercial", prioridad: "alta", esfuerzo: "media", estado: "pendiente", fecha: "2026-06-15", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 22, parentId: 21,   descripcion: "Definir la app de firma y repositorio de documentación", responsable: "Paola Lima", tags: ["Comercial"], categoria: "Comercial", prioridad: "media", esfuerzo: "baja", estado: "completado", fecha: "2026-06-03", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 23, parentId: null, descripcion: "PMT", responsable: "Pablo Ruiz", tags: ["Técnico"], categoria: "Técnico", prioridad: "baja", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 24, parentId: null, descripcion: "Radicación Formal de FAI", responsable: "Por asignar", tags: ["Financiero"], categoria: "Financiero", prioridad: "alta", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "Dependencia: Finalizar Proceso Segmentación Fiducia (#1)", comentarios: [] },

  /* === 13 nuevas descubiertas en pull live (8-jun-2026) === */
  { id: 25, parentId: 24,   descripcion: "Reunión para definir Segmentación", responsable: "Maria Fernanda Arango, Jose Duque", tags: ["Financiero"], categoria: "Financiero", prioridad: "media", esfuerzo: "media", estado: "pendiente", fecha: "2026-06-05", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 26, parentId: 4,    descripcion: "Diligenciamiento de formatos", responsable: "Laura Robles", tags: ["Financiero"], categoria: "Financiero", prioridad: "media", esfuerzo: "baja", estado: "pendiente", fecha: "2026-06-05", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 27, parentId: null, descripcion: "Invitación a deuda privada a inversionistas", responsable: "Juan Diego Duque, Maria Fernanda Arango", tags: ["Financiero"], categoria: "Financiero", prioridad: "media", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 28, parentId: null, descripcion: "Documentación para subir a Drive por unidad", responsable: "Paola Lima", tags: ["Comercial"], categoria: "Comercial", prioridad: "media", esfuerzo: "baja", estado: "pendiente", fecha: "2026-06-16", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 29, parentId: 37,   descripcion: "Revisión de contrato de acabado", responsable: "Jose Duque", tags: ["Legal"], categoria: "Legal", prioridad: "media", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 30, parentId: null, descripcion: "IDU revisión de alcance sobre anden", responsable: "Por asignar", tags: [], categoria: "Otro", prioridad: "media", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 31, parentId: 21,   descripcion: "Cerrar plantas arquitectónica con Clientes", responsable: "Paola Lima", tags: ["Comercial"], categoria: "Comercial", prioridad: "media", esfuerzo: "baja", estado: "pendiente", fecha: "2026-06-15", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 32, parentId: 4,    descripcion: "Conciliación Factibilidad Financiera vs Flujo de caja", responsable: "Hector Gaviria, Laura Robles, Jose Duque", tags: ["Financiero"], categoria: "Financiero", prioridad: "alta", esfuerzo: "media", estado: "pendiente", fecha: "2026-06-04", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 33, parentId: 24,   descripcion: "Revisión de chequeo Técnico", responsable: "Pablo Ruiz, Hector Gaviria", tags: ["Financiero", "Técnico"], categoria: "Financiero", prioridad: "alta", esfuerzo: "media", estado: "pendiente", fecha: "2026-06-09", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 34, parentId: 24,   descripcion: "Modificación de encargo de preventas", responsable: "Hector Gaviria", tags: ["Financiero"], categoria: "Financiero", prioridad: "alta", esfuerzo: "baja", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 35, parentId: 4,    descripcion: "Entrega de planos estructurales (Daniella → Laura)", responsable: "Daniella Sánchez", tags: ["Financiero", "Técnico"], categoria: "Técnico", prioridad: "alta", esfuerzo: "media", estado: "pendiente", fecha: "2026-06-04", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 36, parentId: 24,   descripcion: "Envío de listado actualizado de unidades (Comercial)", responsable: "Paola Lima", tags: ["Financiero", "Comercial"], categoria: "Comercial", prioridad: "media", esfuerzo: "baja", estado: "pendiente", fecha: "2026-06-05", origen: "Notion · Casa 107", notas: "", comentarios: [] },
  { id: 37, parentId: null, descripcion: "Corregir Póliza de contratos de acabados", responsable: "Paola Lima", tags: ["Comercial"], categoria: "Comercial", prioridad: "media", esfuerzo: "media", estado: "pendiente", fecha: "", origen: "Notion · Casa 107", notas: "", comentarios: [] }
];

/* Mapping responsable → datos para auto-crear en Stakeholders DB */
const STAKEHOLDER_SUGERIDOS = {
  "Maria Fernanda Arango": { tipos: ["interno"], especialidad: "Legal", rol: "Abogada — segmentación fiducia" },
  "Pablo Ruiz":             { tipos: ["diseñador"], especialidad: "Arquitectura", rol: "Coordinador técnico (licitaciones, vecindad, PMT)" },
  "Lizeth Gaona":           { tipos: ["interno"], especialidad: "Legal", rol: "Abogada — lotes y RPH" },
  "Diego Garcia":           { tipos: ["interno"], especialidad: "Licencias", rol: "Gestor de licencia de construcción" },
  "Sandra Sandoval":        { tipos: ["interno"], especialidad: "Contable", rol: "Sec. Hacienda + impuestos" },
  "Laura Robles":           { tipos: ["interno"], especialidad: "Otro", rol: "Administrativa G Arquitectura" },
  "Daniella Sánchez":       { tipos: ["interno"], especialidad: "Arquitectura", rol: "Coordinadora BIM" },
  "Jose Duque":             { tipos: ["interno"], especialidad: "Gerencia de proyecto", rol: "Project Director" }
};

const DEFAULT_CARD_CONFIG = {
  responsable: true, fecha: true, prioridad: true, categoria: true,
  esfuerzo: false, subtareas: true, comentarios: true, origen: false
};

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

/* Hidrata el SEED con notionPageId tomado del mapping */
const SEED_CON_NOTION = SEED.map(t => ({ ...t, notionPageId: HUB_TO_NOTION_ID[t.id] || null }));

const Pendientes = ({ project, registerAdder, stakeholders = [], onAddStakeholders }) => {
  const [items, setItems] = useState(SEED_CON_NOTION);
  const [view, setView] = useState("kanban");   // default a kanban (Notion-like)
  const [query, setQuery] = useState("");

  /* Multi-filtros (arrays para multi-select) */
  const [filterPrioridad, setFilterPrioridad] = useState([]);
  const [filterCategoria, setFilterCategoria] = useState([]);
  const [filterResponsable, setFilterResponsable] = useState([]);
  const [filterEsfuerzo, setFilterEsfuerzo] = useState([]);
  const [hideCompleted, setHideCompleted] = useState(true);

  const [detailId, setDetailId] = useState(null);
  const [colapsados, setColapsados] = useState({});
  const [cardConfig, setCardConfig] = useState(DEFAULT_CARD_CONFIG);
  const [configOpen, setConfigOpen] = useState(false);
  const [filtrosOpen, setFiltrosOpen] = useState(false);

  /* Persistencia items */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:pendientes:${project?.id || "default"}`);
        if (m && r && r.value) {
          const stored = JSON.parse(r.value);
          /* 1) Enriquecer storeds con notionPageId */
          const enriched = stored.map(t => t.notionPageId ? t : { ...t, notionPageId: HUB_TO_NOTION_ID[t.id] || null });
          /* 2) Merge: agregar tareas del SEED que NO existan en stored (por notionPageId o por id) */
          const existingNotionIds = new Set(enriched.map(t => t.notionPageId).filter(Boolean));
          const existingIds = new Set(enriched.map(t => t.id));
          const faltantes = SEED_CON_NOTION.filter(s =>
            (!s.notionPageId || !existingNotionIds.has(s.notionPageId)) && !existingIds.has(s.id)
          );
          setItems([...enriched, ...faltantes]);
        }
        const r2 = await window.storage.get(`crettohub:pendientes-cardcfg:${project?.id || "default"}`);
        if (m && r2 && r2.value) setCardConfig({ ...DEFAULT_CARD_CONFIG, ...JSON.parse(r2.value) });
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

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:pendientes-cardcfg:${project?.id || "default"}`, JSON.stringify(cardConfig)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [cardConfig, project?.id]);

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
          esfuerzo: n.esfuerzo || "media",
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

  /* Detectar responsables que NO están en Stakeholders DB */
  const responsablesEnTasks = useMemo(() => {
    const s = new Set();
    items.forEach(i => (i.responsable || "").split(",").map(x => x.trim()).filter(Boolean).forEach(x => s.add(x)));
    return Array.from(s);
  }, [items]);

  const responsablesFaltantes = useMemo(() => {
    const enDB = new Set(stakeholders.map(s => (s.nombre || "").trim()));
    return responsablesEnTasks.filter(r => r !== "Por asignar" && !enDB.has(r));
  }, [responsablesEnTasks, stakeholders]);

  const handleAgregarFaltantes = () => {
    if (!onAddStakeholders) return;
    const nuevos = responsablesFaltantes.map((nombre, idx) => {
      const sug = STAKEHOLDER_SUGERIDOS[nombre] || {};
      return {
        nombre, esEmpresa: false, razonSocial: "", nit: "", regimen: "Persona natural sin RUT",
        representanteLegal: "",
        tipos: sug.tipos || ["interno"],
        especialidad: sug.especialidad || "Otro",
        rol: sug.rol || "Importado desde Notion (Casa 107)",
        estado: "activo",
        email: "", telefono: "", celular: "", whatsapp: "", sitioWeb: "",
        direccion: "", ciudad: "Bogotá", pais: "Colombia",
        contactos: [{ nombre, cargo: sug.rol || "", email: "", telefono: "", esPrincipal: true }],
        influencia: 3, interes: 3, poder: "alto", actitud: "neutral",
        estrategia: "monitor", raciDefault: "R",
        polizas: [], documentos: [], notas: "Importado automáticamente desde Seguimiento de actividades (Notion)."
      };
    });
    onAddStakeholders(nuevos);
  };

  /* Filtros */
  const filtered = useMemo(() => {
    return items.filter(i => {
      if (hideCompleted && i.estado === "completado") return false;
      if (filterPrioridad.length && !filterPrioridad.includes(i.prioridad)) return false;
      if (filterCategoria.length) {
        const taskTags = (i.tags && i.tags.length) ? i.tags : (i.categoria ? [i.categoria] : []);
        if (!filterCategoria.some(c => taskTags.includes(c))) return false;
      }
      if (filterEsfuerzo.length && !filterEsfuerzo.includes(i.esfuerzo)) return false;
      if (filterResponsable.length) {
        const resps = (i.responsable || "").split(",").map(x => x.trim());
        if (!filterResponsable.some(r => resps.includes(r))) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        return i.descripcion.toLowerCase().includes(q) || (i.responsable || "").toLowerCase().includes(q) || (i.notas || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, query, filterPrioridad, filterCategoria, filterEsfuerzo, filterResponsable, hideCompleted]);

  /* Árbol */
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

  const topLevel = useMemo(() => filtered.filter(i => !i.parentId), [filtered]);

  const subtareasCount = useMemo(() => {
    const c = {};
    items.forEach(i => { if (i.parentId) c[i.parentId] = (c[i.parentId] || 0) + 1; });
    return c;
  }, [items]);

  const responsables = useMemo(() => {
    const set = new Set();
    items.forEach(i => (i.responsable || "").split(",").map(x => x.trim()).filter(Boolean).forEach(x => set.add(x)));
    return Array.from(set).sort();
  }, [items]);

  const stats = useMemo(() => {
    const activos = items.filter(i => i.estado !== "completado");
    return {
      total: items.length,
      activos: activos.length,
      vencidos: activos.filter(i => i.fecha && i.fecha < today).length,
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

  const moveTo = (item, estado) => setItems(prev => prev.map(x => x.id === item.id ? { ...x, estado } : x));

  const addComentario = (id, texto) => {
    if (!texto.trim()) return;
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const com = i.comentarios || [];
      const nuevoId = Math.max(0, ...com.map(c => c.id || 0)) + 1;
      return { ...i, comentarios: [...com, { id: nuevoId, fecha: new Date().toISOString(), autor: "PM Cretto", texto: texto.trim() }] };
    }));
  };

  const deleteComentario = (id, comId) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, comentarios: (i.comentarios || []).filter(c => c.id !== comId) } : i));
  };

  const addSubtarea = (parentId) => {
    const parent = items.find(i => i.id === parentId);
    const id = Math.max(0, ...items.map(i => i.id)) + 1;
    setItems(prev => [...prev, {
      id, parentId, descripcion: "Nueva sub-tarea",
      responsable: parent?.responsable || "",
      categoria: parent?.categoria || "Otro",
      prioridad: "media", esfuerzo: "media", estado: "pendiente",
      fecha: parent?.fecha || new Date().toISOString().slice(0, 10),
      origen: "Sub-tarea", notas: "", comentarios: []
    }]);
    return id;
  };

  const toggleColapsado = (id) => setColapsados(c => ({ ...c, [id]: !c[id] }));

  const detailItem = useMemo(() => items.find(i => i.id === detailId), [items, detailId]);

  const totalFiltrosActivos = filterPrioridad.length + filterCategoria.length + filterEsfuerzo.length + filterResponsable.length;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Seguimiento · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Seguimiento de actividades</h1>
          <p className="mt-1 text-sm text-stone-500">Tareas anidadas con kanban drag-and-drop, multi-filtros y bitácora de comentarios.</p>
        </div>
        <button onClick={() => setDetailId("new")} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          <Plus className="h-4 w-4" /> Nueva actividad
        </button>
      </header>

      {/* Banner: conexión Notion */}
      {items.some(i => i.notionPageId) && (
        <div className="mb-3 flex items-center gap-3 rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-[12px] text-violet-900">
          <span className="text-base">🔗</span>
          <div className="flex-1">
            <strong>Conectado con Notion</strong> · {NOTION_SOURCE.projectName} · {items.filter(i => i.notionPageId).length}/{items.length} tareas con link Notion · Pídele a Claude <em>"trae cambios de Notion"</em> o <em>"sube cambios al Notion"</em> para sincronizar.
          </div>
          <a href={NOTION_SOURCE.databaseUrl} target="_blank" rel="noopener noreferrer" className="rounded-md border border-violet-300 bg-white px-3 py-1 text-[11px] font-medium text-violet-700 hover:bg-violet-100">
            Abrir base en Notion ↗
          </a>
        </div>
      )}

      {/* Banner: responsables faltantes */}
      {responsablesFaltantes.length > 0 && onAddStakeholders && (
        <div className="mb-3 flex items-center gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          <UserPlus className="h-4 w-4 flex-shrink-0" />
          <div className="flex-1">
            <strong>{responsablesFaltantes.length} responsable(s) no están en la DB de Stakeholders:</strong> {responsablesFaltantes.join(", ")}
          </div>
          <button onClick={handleAgregarFaltantes} className="rounded-md bg-amber-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-amber-800 whitespace-nowrap">
            Agregar a DB
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        <Kpi label="Activos" value={stats.activos} color="emerald" />
        <Kpi label="Vencidos" value={stats.vencidos} color="rose" icon={AlertCircle} />
        <Kpi label="Para hoy" value={stats.hoy} color="amber" icon={Clock} />
        <Kpi label="Bloqueados" value={stats.bloqueados} color="rose" />
        <Kpi label="Completados" value={stats.completados} color="stone" />
      </div>

      {/* Search + view + filtros + config */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar…" className="w-full rounded-md border border-stone-300 bg-white py-1.5 pl-8 pr-3 text-sm placeholder-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <button onClick={() => setFiltrosOpen(o => !o)} className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium ${totalFiltrosActivos > 0 ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"}`}>
          <Filter className="h-3.5 w-3.5" /> Filtros {totalFiltrosActivos > 0 && <span className="rounded-full bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold text-white">{totalFiltrosActivos}</span>}
        </button>
        <label className="inline-flex items-center gap-1 text-[11px] text-stone-600">
          <input type="checkbox" checked={hideCompleted} onChange={e => setHideCompleted(e.target.checked)} className="accent-emerald-700" />
          Ocultar completados
        </label>
        {view === "kanban" && (
          <button onClick={() => setConfigOpen(o => !o)} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">
            <Settings className="h-3.5 w-3.5" /> Tarjeta
          </button>
        )}
        <div className="ml-auto inline-flex rounded-md border border-stone-300 bg-white p-0.5">
          {[
            { id: "kanban",      label: "Kanban" },
            { id: "lista",       label: "Árbol" },
            { id: "responsable", label: "Por responsable" }
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} className={`rounded px-2 py-1 text-[11px] font-medium ${view === v.id ? "bg-emerald-700 text-white" : "text-stone-600 hover:text-stone-900"}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {filtrosOpen && (
        <div className="mb-3 rounded-lg border border-stone-200 bg-white p-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <FilterChips label="Prioridad" options={PRIORIDADES.map(p => ({ value: p.id, label: p.label, color: p.color }))} selected={filterPrioridad} onChange={setFilterPrioridad} />
            <FilterChips label="Esfuerzo" options={ESFUERZOS.map(e => ({ value: e.id, label: e.label }))} selected={filterEsfuerzo} onChange={setFilterEsfuerzo} />
            <FilterChips label="Categoría" options={CATEGORIAS.map(c => ({ value: c, label: c }))} selected={filterCategoria} onChange={setFilterCategoria} />
            <FilterChips label="Responsable" options={responsables.map(r => ({ value: r, label: r }))} selected={filterResponsable} onChange={setFilterResponsable} />
          </div>
          {totalFiltrosActivos > 0 && (
            <div className="mt-2 flex items-center justify-between border-t border-stone-100 pt-2">
              <span className="text-[11px] text-stone-500">{totalFiltrosActivos} filtros activos · {filtered.length} resultado(s)</span>
              <button onClick={() => { setFilterPrioridad([]); setFilterCategoria([]); setFilterEsfuerzo([]); setFilterResponsable([]); }} className="text-[11px] text-emerald-700 hover:underline">Limpiar todos</button>
            </div>
          )}
        </div>
      )}

      {/* Panel config tarjeta */}
      {configOpen && view === "kanban" && (
        <div className="mb-3 rounded-lg border border-stone-200 bg-white p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-700">Campos visibles en tarjeta kanban</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries({
              responsable: "Responsable", fecha: "Fecha", prioridad: "Prioridad",
              categoria: "Categoría", esfuerzo: "Esfuerzo", subtareas: "# sub-tareas",
              comentarios: "# comentarios", origen: "Origen"
            }).map(([k, label]) => (
              <label key={k} className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[11px]">
                <input type="checkbox" checked={cardConfig[k]} onChange={e => setCardConfig({ ...cardConfig, [k]: e.target.checked })} className="accent-emerald-700" />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Vistas */}
      {view === "lista" && (
        <TreeView arbol={arbol} today={today} subtareasCount={subtareasCount}
          colapsados={colapsados} onToggleColapso={toggleColapsado}
          onDetail={setDetailId} onToggle={toggleEstado} onDelete={handleDelete} onAddSub={addSubtarea} />
      )}
      {view === "kanban" && (
        <KanbanDnd items={topLevel} subtareasCount={subtareasCount}
          onDetail={setDetailId} onMove={moveTo} cardConfig={cardConfig} today={today} />
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

/* ─── Multi-select chips para filtros ─── */
const FilterChips = ({ label, options, selected, onChange }) => {
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-600">{label}</div>
      <div className="flex flex-wrap gap-1">
        {options.map(o => {
          const on = selected.includes(o.value);
          return (
            <button key={o.value} onClick={() => toggle(o.value)}
              className={`rounded-full border px-2 py-0.5 text-[11px] transition-all ${on ? "border-emerald-600 bg-emerald-100 text-emerald-800" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Vista árbol ─── */
/* ─── Tabla de actividades (con sub-tareas anidadas en árbol) ─── */
const TreeView = ({ arbol, today, subtareasCount, colapsados, onToggleColapso, onDetail, onToggle, onDelete, onAddSub }) => {
  const cols = useResizableColumns("pendientes.tabla", {
    expand: 30, check: 30, descripcion: 320, tags: 160, responsable: 160,
    prioridad: 80, esfuerzo: 80, estado: 110, fecha: 95, sub: 50, com: 50, origen: 130, acc: 70
  });
  const th = "border-b border-stone-200 px-2 py-2 text-[9px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-50";

  /* Aplana el árbol con depth */
  const flat = useMemo(() => {
    const out = [];
    const walk = (node, depth) => {
      out.push({ ...node, _depth: depth });
      if (!colapsados[node.id] && node.hijos?.length) node.hijos.forEach(h => walk(h, depth + 1));
    };
    arbol.forEach(n => walk(n, 0));
    return out;
  }, [arbol, colapsados]);

  return (
    <>
      <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
        <span><ListTree className="mr-1 inline h-3 w-3" /> Tabla — sub-tareas anidadas con ▸ para expandir</span>
        <ResetWidthsButton onReset={cols.reset} />
      </div>
      <div className="overflow-x-auto overflow-y-visible rounded-lg border border-stone-200 bg-white">
        <table className="text-[12px]">
          <thead>
            <tr>
              <ResizableTh w={cols.w("expand")} onResize={cols.r("expand")} className={th}></ResizableTh>
              <ResizableTh w={cols.w("check")} onResize={cols.r("check")} className={th}></ResizableTh>
              <ResizableTh w={cols.w("descripcion")} onResize={cols.r("descripcion")} className={th}>Actividad</ResizableTh>
              <ResizableTh w={cols.w("tags")} onResize={cols.r("tags")} className={th}>Tags</ResizableTh>
              <ResizableTh w={cols.w("responsable")} onResize={cols.r("responsable")} className={th}>Responsable</ResizableTh>
              <ResizableTh w={cols.w("prioridad")} onResize={cols.r("prioridad")} className={th}>Prioridad</ResizableTh>
              <ResizableTh w={cols.w("esfuerzo")} onResize={cols.r("esfuerzo")} className={th}>Esfuerzo</ResizableTh>
              <ResizableTh w={cols.w("estado")} onResize={cols.r("estado")} className={th}>Estado</ResizableTh>
              <ResizableTh w={cols.w("fecha")} onResize={cols.r("fecha")} className={th}>Fecha</ResizableTh>
              <ResizableTh w={cols.w("sub")} onResize={cols.r("sub")} align="center" className={th}>Sub</ResizableTh>
              <ResizableTh w={cols.w("com")} onResize={cols.r("com")} align="center" className={th}>💬</ResizableTh>
              <ResizableTh w={cols.w("origen")} onResize={cols.r("origen")} className={th}>Origen</ResizableTh>
              <ResizableTh w={cols.w("acc")} onResize={cols.r("acc")} align="center" className={th}>Acc</ResizableTh>
            </tr>
          </thead>
          <tbody>
            {flat.length === 0 && <tr><td colSpan={13} className="px-3 py-8 text-center text-[12px] text-stone-400">Sin actividades.</td></tr>}
            {flat.map(node => {
              const vencido = node.estado !== "completado" && node.fecha && node.fecha < today;
              const tieneHijos = node.hijos && node.hijos.length > 0;
              const colapsado = colapsados[node.id];
              const numSub = subtareasCount[node.id] || 0;
              const numCom = (node.comentarios || []).length;
              const tags = (node.tags && node.tags.length) ? node.tags : (node.categoria ? [node.categoria] : []);
              const esfCfg = ESFUERZOS.find(e => e.id === node.esfuerzo);
              const tdBase = "border-l border-stone-100 px-2 py-1.5 overflow-hidden";
              return (
                <tr key={node.id} className={`group border-t border-stone-100 hover:bg-stone-50/60 ${vencido ? "bg-rose-50/30" : ""}`}>
                  {/* Expand */}
                  <td className={`${tdBase} text-center`} style={cols.s("expand")}>
                    {tieneHijos ? (
                      <button onClick={() => onToggleColapso(node.id)} className="rounded p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700">
                        {colapsado ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    ) : <span className="text-stone-200">·</span>}
                  </td>
                  {/* Check */}
                  <td className={`${tdBase} text-center`} style={cols.s("check")}>
                    <button onClick={() => onToggle(node)} title="Completar">
                      {node.estado === "completado" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-stone-300 hover:text-stone-500" />}
                    </button>
                  </td>
                  {/* Descripción (con indent) */}
                  <td className={tdBase} style={cols.s("descripcion")}>
                    <button onClick={() => onDetail(node.id)} className="text-left w-full" style={{ paddingLeft: node._depth * 16 }}>
                      <span className={`text-[12px] ${node.estado === "completado" ? "text-stone-400 line-through" : "text-stone-800"}`}>{node.descripcion}</span>
                    </button>
                  </td>
                  {/* Tags multi */}
                  <td className={tdBase} style={cols.s("tags")}>
                    <div className="flex flex-wrap gap-0.5">
                      {tags.map(t => (
                        <span key={t} className={`rounded px-1 py-0.5 text-[9px] font-medium ${COLOR_CLASS[TAG_COLOR[t] || "stone"]}`}>{t}</span>
                      ))}
                    </div>
                  </td>
                  {/* Responsable */}
                  <td className={`${tdBase} text-[11px] text-stone-700`} style={cols.s("responsable")}>{node.responsable || "—"}</td>
                  {/* Prioridad */}
                  <td className={tdBase} style={cols.s("prioridad")}><PrioPill p={node.prioridad} /></td>
                  {/* Esfuerzo */}
                  <td className={tdBase} style={cols.s("esfuerzo")}>
                    {esfCfg && <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-700">{esfCfg.label}</span>}
                  </td>
                  {/* Estado */}
                  <td className={tdBase} style={cols.s("estado")}><EstadoPill e={node.estado} /></td>
                  {/* Fecha */}
                  <td className={tdBase} style={cols.s("fecha")}>
                    <span className={`font-mono text-[10px] ${vencido ? "font-semibold text-rose-700" : "text-stone-500"}`}>
                      {vencido && <AlertCircle className="mr-0.5 inline h-3 w-3" />}{node.fecha || "—"}
                    </span>
                  </td>
                  {/* Sub */}
                  <td className={`${tdBase} text-center`} style={cols.s("sub")}>
                    {numSub > 0 && <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1 py-0.5 text-[10px] font-semibold text-emerald-800"><ListTree className="h-2.5 w-2.5" />{numSub}</span>}
                  </td>
                  {/* Comentarios */}
                  <td className={`${tdBase} text-center`} style={cols.s("com")}>
                    {numCom > 0 && <span className="inline-flex items-center gap-0.5 text-[10px] text-stone-600"><MessageSquare className="h-2.5 w-2.5" />{numCom}</span>}
                  </td>
                  {/* Origen */}
                  <td className={`${tdBase} text-[10px] italic text-stone-500`} style={cols.s("origen")}>{node.origen || "—"}</td>
                  {/* Acciones */}
                  <td className={`${tdBase} text-center`} style={cols.s("acc")}>
                    <div className="inline-flex gap-0.5 opacity-0 group-hover:opacity-100">
                      <button onClick={() => { const id = onAddSub(node.id); onDetail(id); }} className="rounded p-0.5 text-stone-400 hover:bg-emerald-50 hover:text-emerald-700" title="Sub-tarea"><Plus className="h-3 w-3" /></button>
                      <button onClick={() => onDetail(node.id)} className="rounded p-0.5 text-stone-400 hover:bg-stone-100" title="Detalle"><Edit3 className="h-3 w-3" /></button>
                      <button onClick={() => onDelete(node.id)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600" title="Eliminar"><Trash2 className="h-3 w-3" /></button>
                    </div>
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

/* ─── Kanban con drag & drop ─── */
const KanbanDnd = ({ items, subtareasCount, onDetail, onMove, cardConfig, today }) => {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const onDragStart = (e, item) => {
    setDraggingId(item.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(item.id));
  };
  const onDragEnd = () => { setDraggingId(null); setDragOverCol(null); };
  const onDragOverCol = (e, estado) => { e.preventDefault(); setDragOverCol(estado); };
  const onDropCol = (e, estado) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData("text/plain"));
    const item = items.find(i => i.id === id);
    if (item && item.estado !== estado) onMove(item, estado);
    setDraggingId(null);
    setDragOverCol(null);
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {ESTADOS.map(est => {
        const cols = items.filter(i => i.estado === est.id);
        const isOver = dragOverCol === est.id;
        return (
          <div key={est.id}
            onDragOver={(e) => onDragOverCol(e, est.id)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => onDropCol(e, est.id)}
            className={`rounded-lg border-2 p-2 transition-all ${isOver ? "border-emerald-400 bg-emerald-50/60" : "border-stone-200 bg-stone-50/40"}`}>
            <div className="mb-2 flex items-center justify-between px-1">
              <EstadoPill e={est.id} />
              <span className="text-[11px] text-stone-500">{cols.length}</span>
            </div>
            <div className="space-y-1.5 min-h-[60px]">
              {cols.map(i => (
                <KanbanCard key={i.id} item={i}
                  numSub={subtareasCount[i.id] || 0}
                  numCom={(i.comentarios || []).length}
                  cardConfig={cardConfig}
                  today={today}
                  dragging={draggingId === i.id}
                  onDragStart={(e) => onDragStart(e, i)}
                  onDragEnd={onDragEnd}
                  onClick={() => onDetail(i.id)}
                />
              ))}
              {cols.length === 0 && <div className="rounded-md border border-dashed border-stone-200 p-3 text-center text-[10px] italic text-stone-400">Suelta una tarjeta aquí</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TAG_COLOR = { Financiero: "amber", Legal: "violet", Técnico: "blue", Comercial: "rose" };

const KanbanCard = ({ item, numSub, numCom, cardConfig, today, dragging, onDragStart, onDragEnd, onClick }) => {
  const vencido = item.estado !== "completado" && item.fecha && item.fecha < today;
  /* Multi-tags: si la tarea tiene array de tags lo usamos; sino caemos a categoria */
  const tags = (item.tags && item.tags.length) ? item.tags : (item.categoria ? [item.categoria] : []);
  const esfCfg = ESFUERZOS.find(e => e.id === item.esfuerzo);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group cursor-pointer rounded-md border border-stone-200 bg-white p-2 text-[12px] shadow-sm hover:border-emerald-400 hover:shadow ${dragging ? "opacity-30" : ""} ${vencido ? "border-l-2 border-l-rose-500" : ""}`}
    >
      <div className="flex items-start gap-1">
        <GripVertical className="h-3 w-3 flex-shrink-0 text-stone-300 group-hover:text-stone-400" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-stone-900">{item.descripcion}</div>

          {/* Pills */}
          {(cardConfig.categoria || cardConfig.prioridad || cardConfig.esfuerzo) && (
            <div className="mt-1 flex flex-wrap gap-1">
              {cardConfig.categoria && tags.map(t => (
                <span key={t} className={`rounded px-1 py-0.5 text-[9px] font-medium ${COLOR_CLASS[TAG_COLOR[t] || "stone"]}`}>{t}</span>
              ))}
              {cardConfig.prioridad && <PrioPill p={item.prioridad} />}
              {cardConfig.esfuerzo && esfCfg && <span className="rounded bg-stone-100 px-1 py-0.5 text-[9px] text-stone-600">{esfCfg.label}</span>}
            </div>
          )}

          {/* Meta row */}
          <div className="mt-1 flex items-center justify-between text-[10px] text-stone-500">
            <div className="flex items-center gap-1 truncate">
              {cardConfig.responsable && item.responsable && <span className="truncate" title={item.responsable}>👤 {item.responsable}</span>}
            </div>
            <div className="flex items-center gap-1.5">
              {cardConfig.comentarios && numCom > 0 && <span className="inline-flex items-center gap-0.5"><MessageSquare className="h-2.5 w-2.5" />{numCom}</span>}
              {cardConfig.subtareas && numSub > 0 && <span className="inline-flex items-center gap-0.5 text-emerald-700"><ListTree className="h-2.5 w-2.5" />{numSub}</span>}
            </div>
          </div>

          {/* Fecha */}
          {cardConfig.fecha && item.fecha && (
            <div className={`mt-1 inline-flex items-center gap-0.5 text-[10px] ${vencido ? "font-semibold text-rose-700" : "text-stone-500"}`}>
              {vencido && <AlertCircle className="h-2.5 w-2.5" />}
              <Calendar className="h-2.5 w-2.5" /> {item.fecha}
            </div>
          )}

          {/* Origen */}
          {cardConfig.origen && item.origen && (
            <div className="mt-0.5 text-[9px] italic text-stone-400">{item.origen}</div>
          )}
        </div>
      </div>
    </div>
  );
};

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
            <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-stone-500" /><span className="font-medium text-stone-900">{resp}</span></div>
            <span className="text-[11px] text-stone-500">{lista.length} pendientes</span>
          </div>
          <div className="divide-y divide-stone-100">
            {lista.map(i => {
              const vencido = i.estado !== "completado" && i.fecha && i.fecha < today;
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
                  <span className={`font-mono text-[11px] ${vencido ? "font-semibold text-rose-700" : "text-stone-500"}`}>{i.fecha || "—"}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── Detail Drawer ─── */
const DetailDrawer = ({ item, allItems, subtareasCount, today, onClose, onSave, onDelete, onAddSub, onOpenSub, onAddComentario, onDelComentario, onToggle }) => {
  const isNew = !item;
  const [form, setForm] = useState(item || {
    descripcion: "", responsable: "", categoria: "Financiero", prioridad: "media", esfuerzo: "media",
    estado: "pendiente", fecha: new Date().toISOString().slice(0, 10), origen: "Manual", notas: "",
    parentId: null, comentarios: []
  });
  const [tab, setTab] = useState("detalles");
  const [nuevoComentario, setNuevoComentario] = useState("");
  useEffect(() => { setForm(item || { descripcion: "", responsable: "", categoria: "Financiero", prioridad: "media", esfuerzo: "media", estado: "pendiente", fecha: new Date().toISOString().slice(0, 10), origen: "Manual", notas: "", parentId: null, comentarios: [] }); setTab("detalles"); }, [item?.id]);

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
                <input value={form.descripcion} onChange={e => update({ descripcion: e.target.value })} placeholder="Nombre de la actividad…" className={`flex-1 border-0 bg-transparent font-serif text-xl text-stone-900 focus:outline-none ${form.estado === "completado" ? "text-stone-400 line-through" : ""}`} autoFocus={isNew} />
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {item?.notionPageId && (
                <a href={notionUrl(item.notionPageId)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-violet-300 bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700 hover:bg-violet-100" title="Abrir esta tarea en Notion">
                  🔗 Notion
                </a>
              )}
              {!isNew && <button onClick={() => onDelete(item.id)} className="rounded p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600" title="Eliminar"><Trash2 className="h-4 w-4" /></button>}
              <button onClick={onClose} className="rounded p-1.5 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
            <Prop label="Responsable"><input value={form.responsable} onChange={e => update({ responsable: e.target.value })} className="rounded border border-stone-200 px-2 py-0.5 text-[12px] focus:border-emerald-500 focus:outline-none" /></Prop>
            <Prop label="Fecha"><input type="date" value={form.fecha} onChange={e => update({ fecha: e.target.value })} className="rounded border border-stone-200 px-2 py-0.5 text-[12px] focus:border-emerald-500 focus:outline-none" /></Prop>
            <Prop label="Prioridad"><select value={form.prioridad} onChange={e => update({ prioridad: e.target.value })} className="rounded border border-stone-200 px-2 py-0.5 text-[12px]">{PRIORIDADES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></Prop>
            <Prop label="Esfuerzo"><select value={form.esfuerzo} onChange={e => update({ esfuerzo: e.target.value })} className="rounded border border-stone-200 px-2 py-0.5 text-[12px]">{ESFUERZOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}</select></Prop>
            <Prop label="Estado"><select value={form.estado} onChange={e => update({ estado: e.target.value })} className="rounded border border-stone-200 px-2 py-0.5 text-[12px]">{ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}</select></Prop>
            <Prop label="Categoría"><select value={form.categoria} onChange={e => update({ categoria: e.target.value })} className="rounded border border-stone-200 px-2 py-0.5 text-[12px]">{CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}</select></Prop>
          </div>
        </header>
        <div className="flex border-b border-stone-200 bg-stone-50 px-4">
          {[
            { id: "detalles",  label: "Detalles" },
            { id: "subtareas", label: `Sub-tareas${subtareas.length > 0 ? ` (${subtareas.length})` : ""}`, disabled: isNew },
            { id: "bitacora",  label: `Bitácora${(form.comentarios || []).length > 0 ? ` (${(form.comentarios || []).length})` : ""}`, disabled: isNew }
          ].map(t => (
            <button key={t.id} disabled={t.disabled} onClick={() => setTab(t.id)} className={`-mb-px border-b-2 px-3 py-2 text-[12px] font-medium ${tab === t.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-800 disabled:opacity-40"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {tab === "detalles" && (
            <div className="space-y-3">
              <Field label="Notas"><textarea value={form.notas} onChange={e => update({ notas: e.target.value })} rows={6} className="inp" placeholder="Detalles, contexto, links…" /></Field>
              <Field label="Origen"><input value={form.origen} onChange={e => update({ origen: e.target.value })} className="inp" placeholder="Manual, Reunión, Notion…" /></Field>
              {isNew && <div className="rounded-md bg-emerald-50 p-2 text-[11px] text-emerald-800">Al guardar, podrás agregar sub-tareas y comentarios.</div>}
            </div>
          )}
          {tab === "subtareas" && !isNew && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-stone-500">{subtareas.length} sub-tareas.</p>
                <button onClick={() => { const id = onAddSub(item.id); onOpenSub(id); }} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-800"><Plus className="h-3 w-3" /> Sub-tarea</button>
              </div>
              {subtareas.length === 0 && <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-[12px] text-stone-400">Sin sub-tareas todavía.</div>}
              {subtareas.map(s => {
                const vencido = s.estado !== "completado" && s.fecha && s.fecha < today;
                return (
                  <button key={s.id} onClick={() => onOpenSub(s.id)} className={`flex w-full items-center gap-2 rounded-md border border-stone-200 bg-white p-2 text-left text-[12px] hover:border-emerald-400 hover:shadow-sm ${vencido ? "bg-rose-50/30" : ""}`}>
                    {s.estado === "completado" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-stone-300" />}
                    <div className="flex-1 min-w-0">
                      <div className={`${s.estado === "completado" ? "text-stone-400 line-through" : "text-stone-800"}`}>{s.descripcion}</div>
                      <div className="text-[10px] text-stone-500">{s.responsable} · {s.fecha}{(s.comentarios || []).length > 0 ? ` · ${s.comentarios.length} 💬` : ""}</div>
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
              <p className="text-[11px] text-stone-500">Registro cronológico de actualizaciones y comentarios.</p>
              <div className="space-y-2">
                {(form.comentarios || []).length === 0 && <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-[12px] text-stone-400">Sin comentarios.</div>}
                {(form.comentarios || []).slice().reverse().map(c => (
                  <div key={c.id} className="group rounded-md border border-stone-200 bg-stone-50/40 p-2.5">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-500"><User className="h-3 w-3" /><strong className="text-stone-800">{c.autor}</strong><span>· {fmtDateTime(c.fecha)}</span></div>
                      <button onClick={() => onDelComentario(item.id, c.id)} className="rounded p-0.5 text-stone-300 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    <p className="text-[12px] leading-relaxed text-stone-800 whitespace-pre-wrap">{c.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {tab === "bitacora" && !isNew && (
          <footer className="border-t border-stone-200 bg-white p-3">
            <form onSubmit={handleSubmitComentario} className="flex gap-2">
              <textarea value={nuevoComentario} onChange={e => setNuevoComentario(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleSubmitComentario(e); }} placeholder="Agregar comentario… (⌘+Enter)" rows={2} className="flex-1 resize-none rounded-md border border-stone-300 px-3 py-1.5 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              <button type="submit" disabled={!nuevoComentario.trim()} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40"><Send className="h-3.5 w-3.5" /></button>
            </form>
          </footer>
        )}
        {isNew && (
          <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
            <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
            <button onClick={() => onSave(form)} disabled={!form.descripcion.trim()} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">Crear actividad</button>
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
