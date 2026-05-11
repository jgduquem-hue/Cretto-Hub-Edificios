import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, Edit3, Check, X, Truck, Phone, User, Building2,
  CreditCard, Trash2, Download
} from "lucide-react";
import { PROVEEDORES_COSETTE_81, FORMAS_PAGO } from "./proveedores-data.js";

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

const PagoPill = ({ value }) => {
  if (!value) return <span className="text-xs italic text-stone-400">—</span>;
  const tone =
    value === "Contado" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    value === "Anticipado" ? "bg-amber-50 text-amber-700 border-amber-200" :
    value.startsWith("Crédito") ? "bg-sky-50 text-sky-700 border-sky-200" :
    "bg-stone-100 text-stone-700 border-stone-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {value}
    </span>
  );
};

const Field = ({ value, onChange, placeholder, editing, type = "text", options }) => {
  if (!editing) {
    if (type === "select") return <PagoPill value={value} />;
    return value
      ? <span className="text-sm text-stone-900">{value}</span>
      : <span className="text-xs italic text-stone-400">—</span>;
  }
  if (type === "select") {
    return (
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-md border border-stone-300 bg-white px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        {options.map(o => <option key={o} value={o}>{o || "— sin definir —"}</option>)}
      </select>
    );
  }
  return (
    <input
      type="text"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-stone-300 bg-white px-2 py-1 text-xs placeholder-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
    />
  );
};

const ProcurementScreen = ({ project }) => {
  const [proveedores, setProveedores] = useState(loadProveedores);
  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

  useEffect(() => { saveProveedores(proveedores); }, [proveedores]);

  const proyectoNombre = project?.nombre || "Cosette 81";

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return proveedores;
    return proveedores.filter(p =>
      (p.razonSocial || "").toLowerCase().includes(t) ||
      (p.servicio || "").toLowerCase().includes(t) ||
      (p.contacto || "").toLowerCase().includes(t) ||
      (p.nit || "").toLowerCase().includes(t)
    );
  }, [proveedores, q]);

  const stats = useMemo(() => {
    const total = proveedores.length;
    const conContacto = proveedores.filter(p => p.contacto).length;
    const conTelefono = proveedores.filter(p => p.telefono).length;
    const conPago = proveedores.filter(p => p.formaPago).length;
    return { total, conContacto, conTelefono, conPago };
  }, [proveedores]);

  const startEdit = (p) => {
    setEditingId(p.id);
    setDraft({ ...p });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = () => {
    setProveedores(prev => prev.map(p => p.id === editingId ? draft : p));
    cancelEdit();
  };

  const addNew = () => {
    const newId = Math.max(0, ...proveedores.map(p => p.id)) + 1;
    const newRow = {
      id: newId, razonSocial: "Nuevo proveedor", nit: "", servicio: "",
      formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: proyectoNombre
    };
    setProveedores(prev => [...prev, newRow]);
    setEditingId(newId);
    setDraft(newRow);
  };

  const remove = (id) => {
    if (!confirm("¿Eliminar este proveedor?")) return;
    setProveedores(prev => prev.filter(p => p.id !== id));
    if (editingId === id) cancelEdit();
  };

  const exportCSV = () => {
    const headers = ["Razón social", "NIT", "Servicio", "Forma de pago", "Contacto", "Cargo", "Teléfono", "Proyecto"];
    const rows = proveedores.map(p => [
      p.razonSocial, p.nit, p.servicio, p.formaPago, p.contacto, p.cargo, p.telefono, p.proyecto
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proveedores-${proyectoNombre.toLowerCase().replace(/\s/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
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
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
          <button
            onClick={addNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
          >
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

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2">
        <Search className="h-4 w-4 text-stone-400" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por razón social, servicio, contacto o NIT…"
          className="flex-1 bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
        />
        {q && (
          <button onClick={() => setQ("")} className="text-xs text-stone-400 hover:text-stone-700">limpiar</button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-emerald-900 text-white">
              <tr>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Razón social</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">NIT</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Servicio / producto</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Forma de pago</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Contacto</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Cargo</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider">Teléfono</th>
                <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-sm text-stone-400">Sin resultados.</td></tr>
              )}
              {filtered.map((p, idx) => {
                const editing = editingId === p.id;
                const row = editing ? draft : p;
                return (
                  <tr key={p.id} className={`border-t border-stone-100 ${idx % 2 ? "bg-stone-50/40" : ""} ${editing ? "bg-emerald-50/60" : ""}`}>
                    <td className="px-3 py-2 align-top">
                      <Field
                        editing={editing}
                        value={row.razonSocial}
                        onChange={v => setDraft({ ...draft, razonSocial: v })}
                        placeholder="Razón social"
                      />
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-xs">
                      <Field
                        editing={editing}
                        value={row.nit}
                        onChange={v => setDraft({ ...draft, nit: v })}
                        placeholder="900.000.000-0"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Field
                        editing={editing}
                        value={row.servicio}
                        onChange={v => setDraft({ ...draft, servicio: v })}
                        placeholder="Tipo de servicio o producto"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Field
                        editing={editing}
                        type="select"
                        options={FORMAS_PAGO}
                        value={row.formaPago}
                        onChange={v => setDraft({ ...draft, formaPago: v })}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Field
                        editing={editing}
                        value={row.contacto}
                        onChange={v => setDraft({ ...draft, contacto: v })}
                        placeholder="Nombre"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Field
                        editing={editing}
                        value={row.cargo}
                        onChange={v => setDraft({ ...draft, cargo: v })}
                        placeholder="Cargo"
                      />
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-xs">
                      <Field
                        editing={editing}
                        value={row.telefono}
                        onChange={v => setDraft({ ...draft, telefono: v })}
                        placeholder="+57 300 000 0000"
                      />
                    </td>
                    <td className="px-3 py-2 align-top text-right whitespace-nowrap">
                      {editing ? (
                        <>
                          <button onClick={saveEdit} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2 py-1 text-[11px] text-white hover:bg-emerald-800">
                            <Check className="h-3 w-3" /> Guardar
                          </button>
                          <button onClick={cancelEdit} className="ml-1 inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-[11px] text-stone-700 hover:bg-stone-50">
                            <X className="h-3 w-3" /> Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(p)} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-[11px] text-stone-700 hover:bg-stone-50">
                            <Edit3 className="h-3 w-3" /> Editar
                          </button>
                          <button onClick={() => remove(p.id)} className="ml-1 inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-100" title="Eliminar">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-stone-400">
        Los cambios se guardan automáticamente en este navegador. Próximo paso: usar este listado como base del flujo de caja de pagos por proveedor.
      </div>
    </div>
  );
};

export default ProcurementScreen;
