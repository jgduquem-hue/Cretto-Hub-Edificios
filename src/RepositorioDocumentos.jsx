import React, { useState, useMemo, useEffect } from "react";
import {
  FileText, Upload, Search, Filter, Folder, Eye, Download, Trash2,
  FileImage, FileSpreadsheet, FilePlus, Tag, Calendar, User, Plus, X
} from "lucide-react";
import RaciNotifyModal from "./RaciNotify.jsx";

/* ────────────────────────────────────────────────────────────────
   Repositorio de Documentos — proyectos de edificación
   Categorías: arquitectura, técnicos, legales, comerciales,
   licencias, fiduciaria, financieros, actas y planimetría.

   Cada documento: nombre, categoría, subcategoría, versión, autor,
   fecha, estado (vigente/superado/borrador), tamaño, tags y notas.

   Al subir un documento, dispara el modal RACI para preguntar a
   quién notificar.
────────────────────────────────────────────────────────────────── */

const CATEGORIAS = [
  { id: "arquitectura",  label: "Arquitectura",      color: "emerald",  icon: FileImage,       sub: ["Planos generales", "Plantas", "Cortes", "Fachadas", "Detalles", "Renders"] },
  { id: "tecnicos",      label: "Técnicos / MEP",    color: "blue",     icon: FileSpreadsheet, sub: ["Estructural", "Hidrosanitario", "Eléctrico", "Gas", "Ventilación", "Suelos", "Bioclimático"] },
  { id: "legales",       label: "Legales",           color: "amber",    icon: FileText,        sub: ["Contratos", "Promesas", "Escrituras", "Reglamento PH", "Linderos", "Poderes"] },
  { id: "licencias",     label: "Licencias y POT",   color: "rose",     icon: FileText,        sub: ["Licencia construcción", "Demolición", "Vecindad", "POT", "Curaduría", "Modificaciones"] },
  { id: "comerciales",   label: "Comerciales",       color: "violet",   icon: FileText,        sub: ["Brochure", "Política comercial", "Lista de precios", "Cuadro de ventas", "Promesas firmadas", "Material POP"] },
  { id: "fiduciaria",    label: "Fiduciaria",        color: "indigo",   icon: FileText,        sub: ["Contrato fiducia", "Reglamento P.A.", "Aprobaciones desembolso", "Estados P.A.", "Informes fiduciaria"] },
  { id: "financieros",   label: "Financieros",       color: "teal",     icon: FileSpreadsheet, sub: ["CAPEX", "Flujo de caja", "Cierre financiero", "Aprobación banco", "Pagarés", "Garantías"] },
  { id: "actas",         label: "Actas y reuniones", color: "stone",    icon: FileText,        sub: ["Comité semanal", "Comité fiduciario", "Comité técnico", "Reunión cliente"] },
  { id: "calidad",       label: "Calidad e HSE",     color: "lime",     icon: FileText,        sub: ["Plan calidad", "Plan HSE", "Inspecciones", "No conformidades", "Permisos de trabajo"] }
];

const ESTADOS = [
  { id: "borrador",   label: "Borrador",  color: "stone" },
  { id: "revision",   label: "En revisión", color: "amber" },
  { id: "vigente",    label: "Vigente",   color: "emerald" },
  { id: "superado",   label: "Superado",  color: "stone" }
];

const COLOR_CLASS = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  blue:    "bg-blue-100 text-blue-800 border-blue-200",
  amber:   "bg-amber-100 text-amber-800 border-amber-200",
  rose:    "bg-rose-100 text-rose-800 border-rose-200",
  violet:  "bg-violet-100 text-violet-800 border-violet-200",
  indigo:  "bg-indigo-100 text-indigo-800 border-indigo-200",
  teal:    "bg-teal-100 text-teal-800 border-teal-200",
  stone:   "bg-stone-100 text-stone-700 border-stone-200",
  lime:    "bg-lime-100 text-lime-800 border-lime-200"
};

const SEED_DOCS = [
  { id: 1, nombre: "Planos arquitectónicos v3", categoria: "arquitectura", sub: "Plantas", version: "v3", autor: "Studio Manrique", fecha: "2026-04-12", estado: "vigente", tamaño: "12.4 MB", tags: ["pisos 1-10"], notas: "Reemplaza v2 — ajustes en piso técnico." },
  { id: 2, nombre: "Memoria de cálculo estructural", categoria: "tecnicos", sub: "Estructural", version: "v1", autor: "Ing. Rodríguez", fecha: "2026-03-20", estado: "vigente", tamaño: "8.1 MB", tags: ["NSR-10"], notas: "" },
  { id: 3, nombre: "Licencia de construcción C-2026-0145", categoria: "licencias", sub: "Licencia construcción", version: "Ejecutoriada", autor: "Curaduría 2", fecha: "2026-04-05", estado: "vigente", tamaño: "2.1 MB", tags: ["urgente"], notas: "Ejecutoriada — incluye observaciones del consejo." },
  { id: 4, nombre: "Contrato fiducia mercantil", categoria: "fiduciaria", sub: "Contrato fiducia", version: "Firmado", autor: "Fiduciaria Bogotá", fecha: "2026-02-15", estado: "vigente", tamaño: "1.8 MB", tags: ["P.A. Versalles"], notas: "" },
  { id: 5, nombre: "Política comercial y lista de precios", categoria: "comerciales", sub: "Lista de precios", version: "v2", autor: "Comercializadora XYZ", fecha: "2026-05-01", estado: "vigente", tamaño: "640 KB", tags: ["mayo 2026"], notas: "" },
  { id: 6, nombre: "Estudio de suelos", categoria: "tecnicos", sub: "Suelos", version: "Final", autor: "Geotecnia SAS", fecha: "2025-11-08", estado: "vigente", tamaño: "5.6 MB", tags: [], notas: "" }
];

const RepositorioDocumentos = ({ project, onInfo, raciData }) => {
  const [docs, setDocs] = useState(SEED_DOCS);
  const [query, setQuery] = useState("");
  const [filtroCat, setFiltroCat] = useState("all");
  const [filtroEstado, setFiltroEstado] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [raciPayload, setRaciPayload] = useState(null);

  /* Persistencia */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:docs:${project?.id || "default"}`);
        if (m && r && r.value) setDocs(JSON.parse(r.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:docs:${project?.id || "default"}`, JSON.stringify(docs)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [docs, project?.id]);

  const filtered = useMemo(() => {
    return docs.filter(d => {
      if (filtroCat !== "all" && d.categoria !== filtroCat) return false;
      if (filtroEstado !== "all" && d.estado !== filtroEstado) return false;
      if (query) {
        const q = query.toLowerCase();
        return d.nombre.toLowerCase().includes(q) || d.autor.toLowerCase().includes(q) || (d.tags || []).some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [docs, query, filtroCat, filtroEstado]);

  const stats = useMemo(() => {
    const total = docs.length;
    const byCat = {};
    CATEGORIAS.forEach(c => { byCat[c.id] = docs.filter(d => d.categoria === c.id).length; });
    return { total, byCat };
  }, [docs]);

  const handleUpload = (doc) => {
    const id = Math.max(0, ...docs.map(d => d.id)) + 1;
    const newDoc = { ...doc, id, fecha: doc.fecha || new Date().toISOString().slice(0, 10) };
    setDocs(prev => [newDoc, ...prev]);
    setUploadOpen(false);
    // Disparar modal RACI
    const tipoRaci =
      doc.categoria === "legales" ? "documento-legal" :
      doc.categoria === "licencias" ? "documento-licencia" :
      doc.categoria === "financieros" || doc.categoria === "fiduciaria" ? "documento-financiero" :
      "documento-subido";
    setRaciPayload({
      tipo: tipoRaci,
      projectName: project?.nombre,
      titulo: `Documento subido: ${newDoc.nombre}`,
      contexto: `Categoría: ${CATEGORIAS.find(c => c.id === newDoc.categoria)?.label} · ${newDoc.sub || ""} · ${newDoc.version || ""}`,
      onSent: () => setRaciPayload(null)
    });
  };

  const handleDelete = (id) => {
    if (!confirm("¿Eliminar documento?")) return;
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Repositorio · Proyecto {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Documentos del proyecto</h1>
          <p className="mt-1 text-sm text-stone-500">{stats.total} documentos · organizados por categoría e historial de versiones.</p>
        </div>
        <button onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          <Upload className="h-4 w-4" /> Subir documento
        </button>
      </header>

      {/* Quick filters por categoría */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <CatChip label={`Todas (${stats.total})`} active={filtroCat === "all"} onClick={() => setFiltroCat("all")} color="stone" />
        {CATEGORIAS.map(c => (
          <CatChip key={c.id} label={`${c.label} (${stats.byCat[c.id] || 0})`} active={filtroCat === c.id} onClick={() => setFiltroCat(c.id)} color={c.color} icon={c.icon} />
        ))}
      </div>

      {/* Search + filters */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, autor o tag…"
            className="w-full rounded-md border border-stone-300 bg-white py-1.5 pl-8 pr-3 text-sm placeholder-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm">
          <option value="all">Todos los estados</option>
          {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-3 py-2 text-left">Documento</th>
              <th className="px-3 py-2 text-left">Categoría</th>
              <th className="px-3 py-2 text-left">Versión</th>
              <th className="px-3 py-2 text-left">Autor</th>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-stone-400">Sin documentos para los filtros aplicados.</td></tr>
            )}
            {filtered.map(d => {
              const cat = CATEGORIAS.find(c => c.id === d.categoria) || CATEGORIAS[0];
              const est = ESTADOS.find(e => e.id === d.estado) || ESTADOS[0];
              const Ic = cat.icon;
              return (
                <tr key={d.id} className="border-t border-stone-100 hover:bg-stone-50/60">
                  <td className="px-3 py-2">
                    <div className="flex items-start gap-2">
                      <Ic className="mt-0.5 h-4 w-4 text-stone-400" />
                      <div>
                        <div className="font-medium text-stone-900">{d.nombre}</div>
                        {d.notas && <div className="text-[11px] text-stone-500">{d.notas}</div>}
                        {(d.tags || []).length > 0 && (
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {d.tags.map((t, i) => <span key={i} className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600">#{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${COLOR_CLASS[cat.color]}`}>{cat.label}</span>
                    {d.sub && <div className="mt-0.5 text-[10px] text-stone-500">{d.sub}</div>}
                  </td>
                  <td className="px-3 py-2 font-mono text-[12px]">{d.version}</td>
                  <td className="px-3 py-2 text-stone-700">{d.autor}</td>
                  <td className="px-3 py-2 text-stone-500">{d.fecha}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${COLOR_CLASS[est.color]}`}>{est.label}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <button className="rounded p-1 text-stone-500 hover:bg-stone-100" title="Ver"><Eye className="h-3.5 w-3.5" /></button>
                      <button className="rounded p-1 text-stone-500 hover:bg-stone-100" title="Descargar"><Download className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(d.id)} className="rounded p-1 text-stone-500 hover:bg-rose-50 hover:text-rose-600" title="Eliminar"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} onUpload={handleUpload} />}
      <RaciNotifyModal open={!!raciPayload} payload={raciPayload} raciData={raciData} onClose={() => setRaciPayload(null)} />
    </div>
  );
};

const CatChip = ({ label, active, onClick, color, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${active ? COLOR_CLASS[color] + " ring-1 ring-offset-1 ring-stone-300" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}
  >
    {Icon && <Icon className="h-3 w-3" />}
    {label}
  </button>
);

/* ─── Modal de subida ─── */
const UploadModal = ({ onClose, onUpload }) => {
  const [form, setForm] = useState({
    nombre: "", categoria: "arquitectura", sub: "", version: "v1",
    autor: "", fecha: new Date().toISOString().slice(0, 10),
    estado: "vigente", tags: "", notas: "", tamaño: ""
  });
  const cat = CATEGORIAS.find(c => c.id === form.categoria) || CATEGORIAS[0];

  const handleSubmit = () => {
    if (!form.nombre.trim()) return;
    onUpload({
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">Subir documento</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-3 p-4">
          <Field label="Nombre del documento" required>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="inp" placeholder="Ej. Plano arquitectónico piso 5 v2" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría">
              <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value, sub: "" })} className="inp">
                {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Subcategoría">
              <select value={form.sub} onChange={e => setForm({ ...form, sub: e.target.value })} className="inp">
                <option value="">—</option>
                {cat.sub.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Versión"><input value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} className="inp" /></Field>
            <Field label="Autor / firma"><input value={form.autor} onChange={e => setForm({ ...form, autor: e.target.value })} className="inp" /></Field>
            <Field label="Fecha"><input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="inp" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estado">
              <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="inp">
                {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </Field>
            <Field label="Tags (separados por coma)">
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="inp" placeholder="urgente, piso 5" />
            </Field>
          </div>
          <Field label="Notas">
            <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} rows={2} className="inp" />
          </Field>
          <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-3 text-center text-[12px] text-stone-500">
            <Upload className="mx-auto mb-1 h-5 w-5 text-stone-400" />
            Arrastra el archivo aquí o haz clic para seleccionar (la subida real se conecta al backend).
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
          <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50">Cancelar</button>
          <button onClick={handleSubmit} disabled={!form.nombre.trim()} className="rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">Subir y notificar</button>
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

export default RepositorioDocumentos;
