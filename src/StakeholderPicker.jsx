import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, ExternalLink, User, ChevronDown, X } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   StakeholderPicker — input con autocompletado desde Stakeholders DB
   - Si el valor coincide con un stakeholder, lo marca y muestra link
   - Permite texto libre como fallback (autoridades externas, etc.)
   - Filtros por tipos: ["proveedor", "constructor"] → solo muestra esos
   - onEditStakeholder(id|null) — null = crear nuevo en DB

   Uso:
     <StakeholderPicker
       value={form.proveedor}
       onChange={(text, stakeholderId) => setForm({ ...form, proveedor: text, proveedorId: stakeholderId })}
       stakeholders={stakeholders}
       tipos={["proveedor", "constructor"]}
       onEditStakeholder={onEditStakeholder}
       placeholder="Proveedor"
     />
────────────────────────────────────────────────────────────────── */

const StakeholderPicker = ({
  value, onChange, stakeholders = [], tipos = null,
  onEditStakeholder, placeholder = "Seleccionar…", className = ""
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  /* Cerrar al click fuera */
  useEffect(() => {
    const h = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const candidatos = useMemo(() => {
    let list = stakeholders.filter(s => s.estado !== "bloqueado");
    if (tipos && tipos.length) {
      list = list.filter(s => (s.tipos || []).some(t => tipos.includes(t)));
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        (s.nombre || "").toLowerCase().includes(q)
        || (s.razonSocial || "").toLowerCase().includes(q)
        || (s.especialidad || "").toLowerCase().includes(q)
      );
    }
    return list.slice(0, 12);
  }, [stakeholders, tipos, query]);

  /* Detectar si el value actual matchea un stakeholder */
  const matched = useMemo(() => {
    if (!value) return null;
    const v = value.toLowerCase().trim();
    return stakeholders.find(s => (s.nombre || "").toLowerCase() === v || (s.razonSocial || "").toLowerCase() === v);
  }, [value, stakeholders]);

  const pick = (s) => {
    onChange(s.nombre, s.id);
    setOpen(false);
    setQuery("");
  };

  const clear = () => onChange("", null);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <input
            value={value || ""}
            onChange={e => { onChange(e.target.value, null); setQuery(e.target.value); setOpen(true); }}
            onFocus={() => { setQuery(""); setOpen(true); }}
            placeholder={placeholder}
            className="w-full rounded-md border border-stone-300 bg-white px-2 py-1 pr-7 text-[12px] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {matched && (
            <span className="absolute right-7 top-1/2 -translate-y-1/2 rounded bg-emerald-100 px-1 py-0.5 text-[8px] font-bold text-emerald-800" title="Stakeholder de la DB">DB</span>
          )}
          <button type="button" onClick={() => setOpen(o => !o)} className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-stone-400 hover:bg-stone-100">
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        {matched && onEditStakeholder && (
          <button type="button" onClick={() => onEditStakeholder(matched.id)} className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-emerald-700" title="Abrir en Stakeholders DB">
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-72 max-h-64 overflow-y-auto rounded-md border border-stone-300 bg-white shadow-lg">
          <div className="border-b border-stone-100 bg-stone-50 px-2 py-1 text-[9px] uppercase tracking-wider text-stone-500">
            {candidatos.length === 0 ? "Sin coincidencias en la DB" : `${candidatos.length} stakeholder(s)`}
          </div>
          {candidatos.map(s => {
            const tip = (s.tipos || [])[0] || "";
            return (
              <button
                key={s.id} type="button" onClick={() => pick(s)}
                className="flex w-full items-start gap-2 border-b border-stone-100 px-2 py-1.5 text-left text-[12px] last:border-b-0 hover:bg-emerald-50"
              >
                <User className="mt-0.5 h-3 w-3 flex-shrink-0 text-stone-400" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-900 truncate">{s.nombre}</div>
                  <div className="truncate text-[10px] text-stone-500">{s.especialidad || s.razonSocial || ""} {tip && `· ${tip}`}</div>
                </div>
              </button>
            );
          })}
          {onEditStakeholder && (
            <button type="button" onClick={() => { onEditStakeholder(null); setOpen(false); }} className="block w-full border-t border-stone-200 bg-emerald-50/40 px-2 py-1.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100">
              + Crear stakeholder en DB →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StakeholderPicker;
