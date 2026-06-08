import React, { useState, useEffect, useCallback } from "react";

/* ────────────────────────────────────────────────────────────────
   Resizable Columns — hook + componentes para tablas Excel-like
   con anchos ajustables persistidos por tabla.

   Uso:
     const cols = useResizableColumns("stakeholders.hoja", {
       nombre: 200, tipos: 140, ...
     });
     <table>
       <thead><tr>
         <ResizableTh w={cols.w("nombre")} onResize={cols.r("nombre")}>Nombre</ResizableTh>
         ...
       </tr></thead>
       <tbody>
         <tr><td style={cols.s("nombre")}>...</td></tr>
       </tbody>
     </table>
────────────────────────────────────────────────────────────────── */

const MIN_W = 50;
const STORAGE_PREFIX = "crettohub:colwidths:";

export const useResizableColumns = (tableKey, defaults = {}) => {
  const [widths, setWidths] = useState(defaults);
  const storageKey = STORAGE_PREFIX + tableKey;

  /* Cargar desde localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        setWidths(w => ({ ...defaults, ...saved }));
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  /* Guardar (debounced light) */
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify(widths)); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [widths, storageKey]);

  const w = (col) => widths[col] ?? defaults[col] ?? 120;
  const s = (col) => ({ width: w(col), minWidth: w(col), maxWidth: w(col) });
  const r = useCallback((col) => (delta, startW) => {
    setWidths(prev => ({ ...prev, [col]: Math.max(MIN_W, (startW ?? prev[col] ?? defaults[col] ?? 120) + delta) }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const reset = () => {
    try { localStorage.removeItem(storageKey); } catch {}
    setWidths(defaults);
  };

  return { widths, setWidths, w, s, r, reset };
};

/* Header con barrita de redimensionamiento al borde derecho */
export const ResizableTh = ({ w, onResize, align = "left", className = "", sticky = false, children, style = {} }) => {
  const onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = w;
    const move = (ev) => {
      const delta = ev.clientX - startX;
      onResize(delta, startW);
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
  return (
    <th
      className={`relative select-none ${className}`}
      style={{ textAlign: align, width: w, minWidth: w, maxWidth: w, ...style }}
    >
      {children}
      <span
        onMouseDown={onMouseDown}
        className="absolute right-0 top-0 h-full w-[6px] cursor-col-resize hover:bg-emerald-400/70"
        title="Arrastra para ajustar el ancho"
      />
    </th>
  );
};

/* Botón de reset reutilizable */
export const ResetWidthsButton = ({ onReset, label = "Reset anchos" }) => (
  <button onClick={onReset} className="text-[10px] text-stone-500 hover:text-emerald-700" title="Restaurar anchos de columnas">
    ↺ {label}
  </button>
);
