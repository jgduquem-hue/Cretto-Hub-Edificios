import React, { useState, useMemo, useEffect } from "react";
import {
  Plus, Truck, Phone, User, Building2, CreditCard, Trash2, Download,
  X, Mail, MessageCircle, ChevronDown
} from "lucide-react";
import { PROVEEDORES_COSETTE_81, FORMAS_PAGO_SIMPLE, CATEGORIAS } from "./proveedores-data.js";

const STORAGE_KEY = "procurement::cosette-81";

const loadProveedores = () => {
  try {
    const raw = window.storage?.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return PROVEEDORES_COSETTE_81;
};

const saveProveedores = (list) => {
  try { window.storage?.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
};

/* ────────── Helpers de teléfono ────────── */
const phoneDigits = (raw) => {
  let d = (raw || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("57")) d = d.slice(2);
  return d;
};
const formatPhone = (raw) => {
  const d = phoneDigits(raw);
  if (d.length !== 10) return raw || "";
  return `+57 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
};
const whatsappUrl = (raw) => {
  const d = phoneDigits(raw);
  if (d.length !== 10) return null;
  return `https://wa.me/57${d}`;
};

/* ────────── Forma de pago helpers ────────── */
const formaPagoDisplay = (fp) => {
  if (!fp) return "";
  if (typeof fp === "string") return fp;
  if (fp.type === "Anticipado" && Array.isArray(fp.installments) && fp.installments.length) {
    return fp.installments.map(i => `${i.pct}% ${i.condicion || ""}`.trim()).join(" · ");
  }
  if (fp.type === "Anticipado") return "Anticipado";
  return "";
};

const PagoPill = ({ value }) => {
  const display = formaPagoDisplay(value);
  if (!display) return <span className="text-xs italic text-stone-400">—</span>;
  const isAnticipado = typeof value === "object" || value === "Anticipado";
  const isCredito = typeof value === "string" && value.startsWith("Crédito");
  const tone =
    isAnticipado ? "bg-amber-50 text-amber-700 border-amber-200" :
    isCredito ? "bg-sky-50 text-sky-700 border-sky-200" :
    "bg-stone-100 text-stone-700 border-stone-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`} title={display}>
      {display}
    </span>
  );
};

/* ────────── Side drawer (add/edit) ────────── */
const emptyProveedor = (proyecto) => ({
  id: null, razonSocial: "", nit: "", servicio: "", categoria: "Varios",
  email: "", telefono: "", contacto: "", cargo: "", formaPago: "", proyecto
});

const SideDrawer = ({ open, onClose, initial, onSave, onDelete, proyectoNombre }) => {
  const [form, setForm] = useState(initial || emptyProveedor(proyectoNombre));
  const [installments, setInstallments] = useState([]);

  // Reset on open
  useEffect(() => {
    if (!open) return;
    const base = initial || emptyProveedor(proyectoNombre);
    setForm(base);
    // Restore installments if formaPago is an object
    if (base.formaPago && typeof base.formaPago === "object" && Array.isArray(base.formaPago.installments)) {
      setInstallments(base.formaPago.installments);
    } else {
      setInstallments([]);
    }
  }, [open, initial, proyectoNombre]);

  if (!open) return null;

  const isAnticipado =
    form.formaPago === "Anticipado" ||
    (typeof form.formaPago === "object" && form.formaPago?.type === "Anticipado");

  const onFormaPagoChange = (v) => {
    if (v === "Anticipado") {
      setForm({ ...form, formaPago: { type: "Anticipado", installments } });
    } else {
      setForm({ ...form, formaPago: v });
      setInstallments([]);
    }
  };

  const addInstallment = () => {
    if (installments.length >= 3) return;
    const next = [...installments, { pct: 0, condicion: "" }];
    setInstallments(next);
    setForm({ ...form, formaPago: { type: "Anticipado", installments: next } });
  };
  const updateInstallment = (idx, key, value) => {
    const next = installments.map((it, i) => i === idx ? { ...it, [key]: value } : it);
    setInstallments(next);
    setForm({ ...form, formaPago: { type: "Anticipado", installments: next } });
  };
  const removeInstallment = (idx) => {
    const next = installments.filter((_, i) => i !== idx);
    setInstallments(next);
    setForm({ ...form, formaPago: { type: "Anticipado", installments: next } });
  };

  const totalPct = installments.reduce((s, i) => s + (Number(i.pct) || 0), 0);

  const canSave = (form.razonSocial || "").trim().length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-sm transition-opacity"
      />
      {/* Drawer */}
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[480px] flex-col border-l border-stone-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
          <div>
            <h2 className="font-serif text-lg leading-tight tracking-tight text-stone-900">
              {form.id ? "Editar proveedor" : "Nuevo proveedor"}
            </h2>
            <p className="text-[11px] text-stone-500">Proyecto: {form.proyecto || proyectoNombre}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <Field label="Razón social *" value={form.razonSocial} onChange={v => setForm({ ...form, razonSocial: v })} placeholder="Nombre comercial / razón social" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="NIT" value={form.nit} onChange={v => setForm({ ...form, nit: v })} placeholder="900.000.000-0" />
            <SelectField label="Categoría CAPEX" value={form.categoria} onChange={v => setForm({ ...form, categoria: v })} options={CATEGORIAS} />
          </div>
          <Field label="Servicio o producto" value={form.servicio} onChange={v => setForm({ ...form, servicio: v })} placeholder="¿Qué suministra?" />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Contacto" value={form.contacto} onChange={v => setForm({ ...form, contacto: v })} placeholder="Nombre" />
            <Field label="Cargo" value={form.cargo} onChange={v => setForm({ ...form, cargo: v })} placeholder="Cargo" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono (Colombia, 10 dígitos)" value={form.telefono} onChange={v => setForm({ ...form, telefono: v })} placeholder="300 123 4567" mono />
            <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="nombre@empresa.com" type="email" />
          </div>

          <div>
            <SelectField
              label="Forma de pago"
              value={isAnticipado ? "Anticipado" : (typeof form.formaPago === "string" ? form.formaPago : "")}
              onChange={onFormaPagoChange}
              options={FORMAS_PAGO_SIMPLE}
            />
            {isAnticipado && (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-amber-800">Pagos parciales (máx 3)</span>
                  <span className={`text-[11px] tabular-nums ${totalPct === 100 ? "text-emerald-700" : "text-amber-700"}`}>
                    Total: {totalPct}%
                  </span>
                </div>
                <div className="space-y-2">
                  {installments.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0} max={100}
                        value={it.pct}
                        onChange={e => updateInstallment(idx, "pct", e.target.value)}
                        className="w-16 rounded-md border border-stone-300 bg-white px-2 py-1 text-xs tabular-nums focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="text-xs text-stone-600">%</span>
                      <input
                        type="text"
                        value={it.condicion}
                        onChange={e => updateInstallment(idx, "condicion", e.target.value)}
                        placeholder="Ej: Anticipo, BoL, Contra entrega…"
                        className="flex-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button onClick={() => removeInstallment(idx)} className="rounded-md p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Eliminar pago">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {installments.length < 3 && (
                    <button onClick={addInstallment} className="mt-1 inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2 py-1 text-[11px] text-amber-800 hover:bg-amber-50">
                      <Plus className="h-3 w-3" /> Agregar pago
                    </button>
                  )}
                </div>
                <p className="mt-2 text-[10px] text-amber-700/80">
                  Ejemplo: 50% Anticipo · 30% BoL · 20% Contra entrega.
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-5 py-3">
          {form.id ? (
            <button
              onClick={() => { if (confirm("¿Eliminar este proveedor?")) onDelete(form.id); }}
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
              {form.id ? "Guardar cambios" : "Agregar proveedor"}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
};

const Field = ({ label, value, onChange, placeholder, type = "text", mono = false }) => (
  <label className="block">
    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-stone-500">{label}</span>
    <input
      type={type}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm placeholder-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${mono ? "font-mono tabular-nums" : ""}`}
    />
  </label>
);

const SelectField = ({ label, value, onChange, options }) => (
  <label className="block">
    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-stone-500">{label}</span>
    <div className="relative">
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-stone-300 bg-white px-3 py-1.5 pr-8 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        {options.map(o => <option key={o} value={o}>{o || "— sin definir —"}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
    </div>
  </label>
);

/* ────────── Categoría chip ────────── */
const CategoriaChip = ({ value }) => {
  if (!value) return null;
  const toneMap = {
    "Acero": "bg-zinc-100 text-zinc-700",
    "Avisos y Señalización": "bg-orange-50 text-orange-700",
    "Calefacción": "bg-red-50 text-red-700",
    "Construcción": "bg-stone-100 text-stone-800",
    "Diseño Arquitectónico": "bg-purple-50 text-purple-700",
    "Equipo": "bg-rose-50 text-rose-700",
    "Extracción": "bg-cyan-50 text-cyan-700",
    "Iluminación": "bg-yellow-50 text-yellow-800",
    "Jardinería": "bg-lime-50 text-lime-800",
    "Menaje": "bg-emerald-50 text-emerald-700",
    "Mobiliario": "bg-amber-50 text-amber-800",
    "Tecnología": "bg-sky-50 text-sky-700",
    "Varios": "bg-stone-100 text-stone-600",
    "Project Management": "bg-indigo-50 text-indigo-700"
  };
  const tone = toneMap[value] || "bg-stone-100 text-stone-600";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${tone}`}>
      {value}
    </span>
  );
};

/* ────────── Main screen ────────── */
const ProcurementScreen = ({ project }) => {
  const [proveedores, setProveedores] = useState(loadProveedores);
  const [filterCat, setFilterCat] = useState("Todos");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerInitial, setDrawerInitial] = useState(null);

  useEffect(() => { saveProveedores(proveedores); }, [proveedores]);

  const proyectoNombre = project?.nombre || "Cosette 81";

  const filterCounts = useMemo(() => {
    const counts = { Todos: proveedores.length };
    CATEGORIAS.forEach(c => { counts[c] = proveedores.filter(p => p.categoria === c).length; });
    return counts;
  }, [proveedores]);

  const filtered = useMemo(() => {
    if (filterCat === "Todos") return proveedores;
    return proveedores.filter(p => p.categoria === filterCat);
  }, [proveedores, filterCat]);

  const stats = useMemo(() => {
    const total = proveedores.length;
    const conContacto = proveedores.filter(p => p.contacto).length;
    const conTelefono = proveedores.filter(p => p.telefono).length;
    const conPago = proveedores.filter(p => formaPagoDisplay(p.formaPago)).length;
    return { total, conContacto, conTelefono, conPago };
  }, [proveedores]);

  const openAdd = () => { setDrawerInitial(null); setDrawerOpen(true); };
  const openEdit = (p) => { setDrawerInitial(p); setDrawerOpen(true); };
  const onSave = (data) => {
    if (data.id) {
      setProveedores(prev => prev.map(p => p.id === data.id ? data : p));
    } else {
      const newId = Math.max(0, ...proveedores.map(p => p.id || 0)) + 1;
      setProveedores(prev => [...prev, { ...data, id: newId }]);
    }
    setDrawerOpen(false);
  };
  const onDelete = (id) => {
    setProveedores(prev => prev.filter(p => p.id !== id));
    setDrawerOpen(false);
  };

  const exportCSV = () => {
    const headers = ["Razón social", "NIT", "Categoría", "Servicio", "Email", "Teléfono", "Contacto", "Cargo", "Forma de pago", "Proyecto"];
    const rows = proveedores.map(p => [
      p.razonSocial, p.nit, p.categoria, p.servicio, p.email, formatPhone(p.telefono),
      p.contacto, p.cargo, formaPagoDisplay(p.formaPago), p.proyecto
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proveedores-${proyectoNombre.toLowerCase().replace(/\s/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filterTabs = ["Todos", ...CATEGORIAS.filter(c => filterCounts[c] > 0)];

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-700" strokeWidth={1.7} />
            <h1 className="font-serif text-[28px] leading-tight tracking-tight text-stone-900">Procurement</h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Listado de proveedores asociados al proyecto <span className="font-medium text-stone-700">{proyectoNombre}</span>. Base para el flujo de caja de pagos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50">
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
          <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800">
            <Plus className="h-3.5 w-3.5" /> Agregar proveedor
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Proveedores", value: stats.total, icon: Building2 },
          { label: "Con contacto", value: `${stats.conContacto}/${stats.total}`, icon: User },
          { label: "Con teléfono", value: `${stats.conTelefono}/${stats.total}`, icon: Phone },
          { label: "Con forma de pago", value: `${stats.conPago}/${stats.total}`, icon: CreditCard }
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="rounded-lg border border-stone-200 bg-white p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-stone-400">
                <Icon className="h-3 w-3" /> {k.label}
              </div>
              <div className="mt-1 font-mono text-lg tabular-nums text-stone-900">{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* Filter chips */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {filterTabs.map(cat => {
          const active = filterCat === cat;
          const count = cat === "Todos" ? filterCounts.Todos : (filterCounts[cat] || 0);
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {cat}
              <span className={`rounded-full px-1.5 text-[10px] tabular-nums ${active ? "bg-white/20" : "bg-stone-100 text-stone-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-emerald-900 text-white shadow-sm">
              <tr>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Razón social</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">NIT</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Servicio / Producto</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Forma de pago</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Contacto</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Cargo</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Teléfono</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-sm text-stone-400">Sin proveedores en esta categoría.</td></tr>
              )}
              {filtered.map((p, idx) => {
                const wa = whatsappUrl(p.telefono);
                return (
                  <tr
                    key={p.id}
                    className={`cursor-pointer border-t border-stone-100 transition-colors hover:bg-emerald-50/50 ${idx % 2 ? "bg-stone-50/40" : ""}`}
                    onClick={() => openEdit(p)}
                  >
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium text-stone-900">{p.razonSocial || <span className="italic text-stone-400">—</span>}</div>
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-xs text-stone-700">
                      {p.nit || <span className="italic text-stone-400">—</span>}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <CategoriaChip value={p.categoria} />
                        {p.servicio
                          ? <span className="text-xs text-stone-700">{p.servicio}</span>
                          : <span className="text-xs italic text-stone-400">— sin descripción —</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <PagoPill value={p.formaPago} />
                    </td>
                    <td className="px-3 py-2 align-top">
                      {p.contacto || <span className="text-xs italic text-stone-400">—</span>}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-stone-600">
                      {p.cargo || <span className="italic text-stone-400">—</span>}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {p.telefono ? (
                        wa ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-xs text-emerald-800 hover:bg-emerald-100"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle className="h-3 w-3" /> {formatPhone(p.telefono)}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-stone-700">{p.telefono}</span>
                        )
                      ) : <span className="italic text-stone-400">—</span>}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {p.email ? (
                        <a
                          href={`mailto:${p.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-sky-700 hover:underline"
                          title="Enviar email"
                        >
                          <Mail className="h-3 w-3" /> {p.email}
                        </a>
                      ) : <span className="italic text-stone-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-stone-400">
        Click en cualquier fila para editar · cambios guardados automáticamente en este navegador.
      </div>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={drawerInitial}
        onSave={onSave}
        onDelete={onDelete}
        proyectoNombre={proyectoNombre}
      />
    </div>
  );
};

export default ProcurementScreen;
