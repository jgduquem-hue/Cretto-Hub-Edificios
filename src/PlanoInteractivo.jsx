import React, { useState, useRef, useEffect } from "react";
import {
  Upload, Edit3, Eye, X, Save, Trash2, MousePointer2, Map,
  RotateCcw, Check, AlertCircle, ZoomIn, ZoomOut, Info, Crosshair
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════════
   Plano Interactivo — editor + visor de polígonos de apartamentos sobre el plano
   - Subir imagen del plano por piso
   - Editor: click para agregar vértices al polígono del apto seleccionado
   - Visor: polígonos coloreados por estado, click abre detalle
   - Coordenadas relativas (0-100%) → responsive
   ════════════════════════════════════════════════════════════════════════════ */

/* Estados de unidad — mismo color que en Inventario */
const ESTADO_COLORS = {
  disponible: "#10b981",  // emerald
  reservada:  "#f59e0b",  // amber
  separada:   "#f97316",  // orange
  vendida:    "#a855f7",  // violet
  bloqueada:  "#78716c"   // stone
};
const ESTADO_LABEL = {
  disponible: "Disponible", reservada: "Reservada", separada: "Separada", vendida: "Escriturada", bloqueada: "Bloqueada"
};

const PlanoInteractivo = ({ project, unidades, onUpdateUnidad, onOpenUnidad }) => {
  const [pisoActivo, setPisoActivo] = useState(1);
  const [modo, setModo] = useState("vista"); // "vista" | "edicion"
  const [aptoEditando, setAptoEditando] = useState(null);
  const [puntosNuevos, setPuntosNuevos] = useState([]);
  const [planosPisos, setPlanosPisos] = useState({}); // { 1: dataUrl, 2: dataUrl, ... }
  const [hover, setHover] = useState(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  /* Persistencia */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:planos-pisos:${project?.id || "default"}`);
        if (m && r && r.value) setPlanosPisos(JSON.parse(r.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:planos-pisos:${project?.id || "default"}`, JSON.stringify(planosPisos)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [planosPisos, project?.id]);

  const pisos = [...new Set(unidades.map(u => u.piso))].sort((a, b) => b - a);
  const unidadesPiso = unidades.filter(u => u.piso === pisoActivo);
  const planoPisoActual = planosPisos[pisoActivo];

  const subirPlano = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        /* Comprimir si es muy grande — max 2000px ancho */
        const canvas = document.createElement("canvas");
        const maxW = 2000;
        const ratio = Math.min(maxW / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPlanosPisos(prev => ({ ...prev, [pisoActivo]: dataUrl }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  /* Click sobre el plano → en modo edición, agrega vértice */
  const onClickPlano = (e) => {
    if (modo !== "edicion" || !aptoEditando) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPuntosNuevos(prev => [...prev, { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) }]);
  };

  /* Doble click cierra el polígono y lo guarda */
  const cerrarPoligono = () => {
    if (!aptoEditando || puntosNuevos.length < 3) return;
    onUpdateUnidad(aptoEditando.id, { poligono: puntosNuevos, planoPiso: pisoActivo });
    setPuntosNuevos([]);
    setAptoEditando(null);
    setModo("vista");
  };

  const cancelarEdicion = () => {
    setPuntosNuevos([]);
    setAptoEditando(null);
    setModo("vista");
  };

  const empezarEdicion = (unidad) => {
    setAptoEditando(unidad);
    setPuntosNuevos(unidad.poligono || []);
    setModo("edicion");
  };

  const borrarPoligono = (unidad) => {
    if (!confirm(`¿Borrar el polígono del apto ${unidad.numero}?`)) return;
    onUpdateUnidad(unidad.id, { poligono: null, planoPiso: null });
  };

  return (
    <div className="space-y-3">
      {/* Header con selector piso + modo */}
      <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-3">
        <div className="flex items-center gap-3">
          <Map className="h-5 w-5 text-pink-700" />
          <h3 className="font-serif text-lg">Plano interactivo</h3>
          <div className="flex gap-1">
            {pisos.map(p => (
              <button key={p} onClick={() => { setPisoActivo(p); cancelarEdicion(); }} className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${pisoActivo === p ? "bg-pink-700 text-white" : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"}`}>
                {p === 10 ? "PH" : p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {modo === "edicion" ? (
            <>
              <button onClick={cerrarPoligono} disabled={puntosNuevos.length < 3} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40">
                <Save className="h-3 w-3" /> Cerrar polígono ({puntosNuevos.length} pts)
              </button>
              <button onClick={() => setPuntosNuevos(prev => prev.slice(0, -1))} disabled={puntosNuevos.length === 0} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-[11px] text-stone-700 hover:bg-stone-50 disabled:opacity-40">
                <RotateCcw className="h-3 w-3" /> Deshacer punto
              </button>
              <button onClick={cancelarEdicion} className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-100">
                <X className="inline h-3 w-3" /> Cancelar
              </button>
            </>
          ) : (
            <label className="cursor-pointer inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-1 text-[12px] text-stone-700 hover:bg-stone-50">
              <Upload className="h-3 w-3" /> {planoPisoActual ? "Reemplazar plano" : "Subir plano del piso"}
              <input type="file" accept="image/*" className="hidden" onChange={subirPlano} />
            </label>
          )}
        </div>
      </div>

      {/* Banner de instrucciones según modo */}
      {modo === "edicion" && aptoEditando && (
        <div className="rounded-md border border-fuchsia-200 bg-fuchsia-50 p-3 text-[12px] text-fuchsia-900">
          <Crosshair className="inline h-4 w-4 mr-1" />
          <strong>Editando apto {aptoEditando.numero}:</strong> Click en el plano para marcar cada esquina del apartamento. Cuando tengas todas las esquinas (mínimo 3, típicamente 4-6), click "Cerrar polígono".
        </div>
      )}
      {modo === "vista" && !planoPisoActual && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-900">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          <strong>Sin plano para el piso {pisoActivo === 10 ? "PH" : pisoActivo}.</strong> Sube una imagen PNG o JPG del plano de planta para empezar.
          <div className="mt-2 text-[11px]">
            <strong>Cómo conseguirla:</strong> en AutoCAD → File → Plot → "PNG / Plot To File" · en Revit → Vista del Piso → Export → Image PNG · si tienes PDF → Vista Previa → Exportar como PNG 200 dpi
          </div>
        </div>
      )}
      {modo === "vista" && planoPisoActual && (
        <div className="rounded-md border border-stone-200 bg-stone-50 p-2 text-[11px] text-stone-600">
          <Eye className="inline h-3 w-3 mr-1" />
          Click en un polígono para abrir el detalle del apartamento. Los colores indican el estado (verde disponible, ámbar reservado, naranja separado, violeta vendido).
        </div>
      )}

      {/* Plano con overlay SVG */}
      {planoPisoActual && (
        <div ref={containerRef} className="relative rounded-lg border border-stone-200 bg-white overflow-hidden">
          <div className="relative">
            <img
              ref={imgRef}
              src={planoPisoActual}
              alt={`Plano piso ${pisoActivo}`}
              className={`block w-full select-none ${modo === "edicion" ? "cursor-crosshair" : ""}`}
              onClick={onClickPlano}
              onDoubleClick={modo === "edicion" ? cerrarPoligono : undefined}
              draggable={false}
            />
            {/* Overlay SVG con polígonos */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Polígonos ya guardados */}
              {unidadesPiso.filter(u => u.poligono).map(u => {
                const points = u.poligono.map(p => `${p.x},${p.y}`).join(" ");
                const color = ESTADO_COLORS[u.estado] || "#78716c";
                const isHover = hover === u.id;
                return (
                  <g key={u.id} className="pointer-events-auto">
                    <polygon
                      points={points}
                      fill={color}
                      fillOpacity={isHover ? 0.55 : 0.35}
                      stroke={color}
                      strokeWidth={isHover ? 0.4 : 0.2}
                      vectorEffect="non-scaling-stroke"
                      onMouseEnter={() => setHover(u.id)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => modo === "vista" && onOpenUnidad?.(u)}
                      style={{ cursor: modo === "vista" ? "pointer" : "default" }}
                    />
                    {/* Etiqueta del apto en el centro del polígono */}
                    {(() => {
                      const cx = u.poligono.reduce((s, p) => s + p.x, 0) / u.poligono.length;
                      const cy = u.poligono.reduce((s, p) => s + p.y, 0) / u.poligono.length;
                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="2.2" fill="white" fontWeight="bold" stroke={color} strokeWidth="0.1" style={{ pointerEvents: "none", userSelect: "none" }}>
                          {u.numero}
                        </text>
                      );
                    })()}
                  </g>
                );
              })}

              {/* Polígono en edición */}
              {modo === "edicion" && puntosNuevos.length > 0 && (
                <g>
                  {puntosNuevos.length >= 3 && (
                    <polygon
                      points={puntosNuevos.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="#d946ef"
                      fillOpacity={0.25}
                      stroke="#a21caf"
                      strokeWidth={0.3}
                      vectorEffect="non-scaling-stroke"
                      strokeDasharray="0.8,0.4"
                    />
                  )}
                  {puntosNuevos.length >= 2 && puntosNuevos.length < 3 && (
                    <polyline
                      points={puntosNuevos.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="#a21caf"
                      strokeWidth={0.3}
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {puntosNuevos.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="0.6" fill="#a21caf" />
                  ))}
                  {puntosNuevos.length > 0 && (
                    <text x={puntosNuevos[0].x + 1} y={puntosNuevos[0].y - 1} fontSize="2" fill="#a21caf" fontWeight="bold">
                      Inicio
                    </text>
                  )}
                </g>
              )}
            </svg>

            {/* Tooltip al hacer hover */}
            {hover && (() => {
              const u = unidadesPiso.find(x => x.id === hover);
              if (!u) return null;
              return (
                <div className="absolute top-2 right-2 rounded-md bg-stone-900/90 px-3 py-2 text-[11px] text-white backdrop-blur shadow-lg">
                  <div className="font-bold text-base">{u.numero}</div>
                  <div>{u.areaM2}m² · {u.alcobas}alc/{u.banos}b · Tipo {u.tipo}</div>
                  <div>${u.precioMM} MM</div>
                  <div className="mt-1 inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ESTADO_COLORS[u.estado] }}></span>
                    {ESTADO_LABEL[u.estado]}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Lista de unidades del piso con estado de polígono */}
      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        <div className="border-b border-stone-100 bg-stone-50/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">
          Apartamentos del piso {pisoActivo === 10 ? "PH" : pisoActivo} — {unidadesPiso.length} unidades
        </div>
        <div className="divide-y divide-stone-100">
          {unidadesPiso.map(u => {
            const tienePoligono = u.poligono && u.poligono.length >= 3;
            return (
              <div key={u.id} className="flex items-center gap-3 px-3 py-2 hover:bg-stone-50/40">
                <div className="font-mono font-bold text-stone-800 w-12">{u.numero}</div>
                <div className="text-[11px] text-stone-600 flex-1">{u.areaM2}m² · {u.alcobas}alc · Tipo {u.tipo}</div>
                <span className="rounded px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: ESTADO_COLORS[u.estado] + "33", color: ESTADO_COLORS[u.estado] }}>
                  {ESTADO_LABEL[u.estado]}
                </span>
                <div className="w-32 text-right">
                  {tienePoligono ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700">
                      <Check className="h-3 w-3" /> Polígono marcado
                    </span>
                  ) : (
                    <span className="text-[10px] italic text-stone-400">Sin marcar</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => empezarEdicion(u)}
                    disabled={!planoPisoActual}
                    className="inline-flex items-center gap-1 rounded-md border border-fuchsia-300 bg-fuchsia-50 px-2 py-1 text-[10px] font-medium text-fuchsia-800 hover:bg-fuchsia-100 disabled:opacity-40"
                    title={planoPisoActual ? "Marcar / re-marcar polígono" : "Primero sube el plano"}
                  >
                    <Edit3 className="h-3 w-3" /> {tienePoligono ? "Re-dibujar" : "Marcar"}
                  </button>
                  {tienePoligono && (
                    <button onClick={() => borrarPoligono(u)} className="rounded-md p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda inferior */}
      <div className="rounded-md border border-stone-200 bg-white p-2 flex items-center gap-3 text-[10px]">
        <span className="font-semibold text-stone-600">Leyenda:</span>
        {Object.entries(ESTADO_LABEL).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1 text-stone-700">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ESTADO_COLORS[k] }}></span>
            {v}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PlanoInteractivo;
