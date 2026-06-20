import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Camera, Calendar, MapPin, Upload, X, Eye, Download, Trash2, Plus,
  Image as ImageIcon, Filter, Search, ChevronLeft, ChevronRight, Tag,
  FileText, Box, Layers, Building, Construction, Hammer, Sparkles, Info,
  ArrowRight, AlertCircle, CheckCircle2
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════════
   Bitácora de Obra — Cretto
   - Fotos por fecha (residente de obra sube desde celular)
   - Filtros por etapa, zona, fecha
   - Galería con lightbox + vista timeline
   - Repositorio de planos con guía clara por formato
   ════════════════════════════════════════════════════════════════════════════ */

/* ─── Etapas de obra Casa 107 ─── */
export const ETAPAS_OBRA = [
  { id: "preliminares",     label: "Preliminares",          color: "stone",   icon: "🚧", order: 1 },
  { id: "cimentacion",      label: "Cimentación",           color: "amber",   icon: "🪨", order: 2 },
  { id: "estructura",       label: "Estructura",            color: "orange",  icon: "🏗️", order: 3 },
  { id: "mamposteria",      label: "Mampostería",           color: "red",     icon: "🧱", order: 4 },
  { id: "mep",              label: "Redes MEP",             color: "violet",  icon: "🔧", order: 5 },
  { id: "acabados",         label: "Acabados",              color: "fuchsia", icon: "🎨", order: 6 },
  { id: "fachada",          label: "Fachada",               color: "blue",    icon: "🪟", order: 7 },
  { id: "urbanismo",        label: "Urbanismo y comunes",   color: "emerald", icon: "🌳", order: 8 },
  { id: "preentrega",       label: "Pre-entrega",           color: "indigo",  icon: "🔑", order: 9 }
];

/* ─── Zonas de obra ─── */
export const ZONAS_OBRA = [
  { id: "sotano-2",   label: "Sótano 2 (parqueaderos)" },
  { id: "sotano-1",   label: "Sótano 1 (parq + depósitos)" },
  { id: "piso-1",     label: "Piso 1" },
  { id: "piso-2",     label: "Piso 2" },
  { id: "piso-3",     label: "Piso 3" },
  { id: "piso-4",     label: "Piso 4" },
  { id: "piso-5",     label: "Piso 5" },
  { id: "piso-6",     label: "Piso 6" },
  { id: "piso-7",     label: "Piso 7" },
  { id: "piso-8",     label: "Piso 8" },
  { id: "piso-9",     label: "Piso 9" },
  { id: "piso-10",    label: "Piso 10 (penthouses)" },
  { id: "cubierta",   label: "Cubierta" },
  { id: "fachada",    label: "Fachada / exterior" },
  { id: "comunes",    label: "Zonas comunes" },
  { id: "lobby",      label: "Lobby" }
];

/* ─── Categorías de planos ─── */
export const CATEGORIAS_PLANOS = [
  { id: "arquitectonico",   label: "Arquitectónico",       desc: "Plantas, cortes, fachadas",            formatos: ["PDF", "DWG", "RVT", "IFC", "GLB"] },
  { id: "estructural",      label: "Estructural",          desc: "Diseño estructural, despieces",        formatos: ["PDF", "DWG", "RVT", "IFC"] },
  { id: "hidrosanitario",   label: "Hidrosanitario",       desc: "Hidráulico, sanitario, gas",           formatos: ["PDF", "DWG", "RVT"] },
  { id: "electrico",        label: "Eléctrico + voz/datos", desc: "Diagramas unifilares, salidas",       formatos: ["PDF", "DWG"] },
  { id: "hvac",             label: "HVAC + ventilación",   desc: "Ductos, equipos, ventilación",         formatos: ["PDF", "DWG"] },
  { id: "redes-especiales", label: "Redes especiales",     desc: "Voz/datos, CCTV, citofonía",           formatos: ["PDF", "DWG"] },
  { id: "urbanismo",        label: "Urbanismo y paisajismo", desc: "Sótanos, zonas comunes, parqueaderos", formatos: ["PDF", "DWG"] },
  { id: "detalles",         label: "Detalles constructivos", desc: "Aljibes, ascensores, escaleras",     formatos: ["PDF", "DWG"] }
];

const FORMATOS_INFO = {
  PDF: { label: "PDF", color: "rose",     icon: "📄", uso: "Vista universal · imprimible · obra y comité",  size: "Liviano (2-30 MB)" },
  DWG: { label: "DWG (AutoCAD)", color: "blue", icon: "📐", uso: "Edición técnica · fuente de verdad 2D",   size: "Medio (5-100 MB)" },
  RVT: { label: "RVT (Revit)",   color: "indigo", icon: "🏗️", uso: "Modelo BIM original · solo apertura con Revit", size: "Pesado (50-500 MB)" },
  IFC: { label: "IFC (BIM abierto)", color: "emerald", icon: "🧊", uso: "Estándar abierto BIM · base del viewer 3D futuro", size: "Pesado (50-300 MB)" },
  GLB: { label: "glTF/glb (3D web)", color: "fuchsia", icon: "🎮", uso: "3D liviano optimizado para navegador", size: "Liviano (5-30 MB)" }
};

/* ─── Seed: residentes/uploaders ─── */
const RESIDENTES = [
  { id: "PR", nombre: "Pablo Ruiz",     rol: "Coordinador técnico", color: "blue" },
  { id: "AA", nombre: "Alvaro Andrade", rol: "Interventoría",       color: "amber" },
  { id: "JD", nombre: "Jose Duque",     rol: "PM Cretto",           color: "emerald" }
];

/* ─── Seed: fotos demostrativas (placeholders SVG por ahora) ─── */
const SEED_FOTOS = [
  { id: 1, fecha: "2026-06-12", etapa: "preliminares", zona: "sotano-2", uploader: "PR", descripcion: "Cerramiento del lote completo. Caseta del residente instalada.", thumbnail: null },
  { id: 2, fecha: "2026-06-12", etapa: "preliminares", zona: "sotano-2", uploader: "PR", descripcion: "Demarcación de retiros y replanteo topográfico.", thumbnail: null },
  { id: 3, fecha: "2026-06-15", etapa: "preliminares", zona: "sotano-2", uploader: "PR", descripcion: "Inicio descapote, zona oriental del lote.", thumbnail: null },
  { id: 4, fecha: "2026-06-15", etapa: "preliminares", zona: "sotano-1", uploader: "AA", descripcion: "Vista panorámica del lote previo a la excavación.", thumbnail: null }
];

const formatFecha = (iso) => new Date(iso + "T00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
const formatFechaCorta = (iso) => new Date(iso + "T00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" });

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════════════════════════════════════════ */
const BitacoraObra = ({ project }) => {
  const [tab, setTab] = useState("galeria");
  const [fotos, setFotos] = useState(SEED_FOTOS);
  const [planos, setPlanos] = useState([]);
  const [filtroEtapa, setFiltroEtapa] = useState("all");
  const [filtroZona, setFiltroZona] = useState("all");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [lightbox, setLightbox] = useState(null); // foto seleccionada

  /* Persistencia */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:bitacora-fotos:${project?.id || "default"}`);
        if (m && r && r.value) setFotos(JSON.parse(r.value));
        const p = await window.storage.get(`crettohub:bitacora-planos:${project?.id || "default"}`);
        if (m && p && p.value) setPlanos(JSON.parse(p.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:bitacora-fotos:${project?.id || "default"}`, JSON.stringify(fotos)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [fotos, project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:bitacora-planos:${project?.id || "default"}`, JSON.stringify(planos)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [planos, project?.id]);

  const fotosFiltradas = useMemo(() => {
    return fotos.filter(f => {
      if (filtroEtapa !== "all" && f.etapa !== filtroEtapa) return false;
      if (filtroZona !== "all" && f.zona !== filtroZona) return false;
      if (filtroFecha && f.fecha !== filtroFecha) return false;
      if (busqueda && !`${f.descripcion} ${f.etapa} ${f.zona}`.toLowerCase().includes(busqueda.toLowerCase())) return false;
      return true;
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [fotos, filtroEtapa, filtroZona, filtroFecha, busqueda]);

  /* Agrupadas por fecha para timeline */
  const fotosPorFecha = useMemo(() => {
    const grupos = {};
    fotosFiltradas.forEach(f => {
      grupos[f.fecha] = grupos[f.fecha] || [];
      grupos[f.fecha].push(f);
    });
    return Object.entries(grupos).sort(([a], [b]) => new Date(b) - new Date(a));
  }, [fotosFiltradas]);

  const TABS = [
    { id: "galeria",  label: "Galería por fecha",  icon: Calendar },
    { id: "timeline", label: "Timeline visual",    icon: Layers },
    { id: "etapas",   label: "Por etapa",          icon: Construction, count: ETAPAS_OBRA.length },
    { id: "subir",    label: "Subir fotos",        icon: Upload },
    { id: "planos",   label: "Planos y modelo 3D", icon: Box, badge: "GUÍA" }
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-6">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-orange-600">Bitácora de obra · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Bitácora fotográfica</h1>
          <p className="mt-1 text-sm text-stone-500">
            {fotos.length} fotos · {planos.length} planos · subidas por residente, interventoría y PM
          </p>
        </div>
        <button onClick={() => setTab("subir")} className="inline-flex items-center gap-1.5 rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700">
          <Camera className="h-4 w-4" /> Subir foto
        </button>
      </header>

      {/* KPIs por etapa */}
      <div className="mb-4 grid grid-cols-3 gap-2 md:grid-cols-9">
        {ETAPAS_OBRA.map(e => {
          const count = fotos.filter(f => f.etapa === e.id).length;
          return (
            <button key={e.id} onClick={() => { setFiltroEtapa(e.id); setTab("galeria"); }} className={`rounded-md border p-2 text-center transition-all hover:scale-105 ${filtroEtapa === e.id ? `border-${e.color}-400 bg-${e.color}-50` : "border-stone-200 bg-white"}`}>
              <div className="text-base">{e.icon}</div>
              <div className="font-serif text-lg font-bold">{count}</div>
              <div className="text-[9px] leading-tight text-stone-600">{e.label}</div>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-stone-200">
        {TABS.map(t => {
          const Ic = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-medium ${tab === t.id ? "border-orange-600 text-orange-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
              <Ic className="h-3.5 w-3.5" /> {t.label}
              {t.badge && <span className="rounded bg-amber-200 px-1 py-0.5 text-[8px] font-bold uppercase text-amber-900">{t.badge}</span>}
            </button>
          );
        })}
      </div>

      {tab === "galeria" && (
        <GaleriaView
          fotos={fotosFiltradas}
          fotosPorFecha={fotosPorFecha}
          filtroEtapa={filtroEtapa} setFiltroEtapa={setFiltroEtapa}
          filtroZona={filtroZona} setFiltroZona={setFiltroZona}
          filtroFecha={filtroFecha} setFiltroFecha={setFiltroFecha}
          busqueda={busqueda} setBusqueda={setBusqueda}
          onPhotoClick={setLightbox}
          onDelete={(id) => setFotos(prev => prev.filter(f => f.id !== id))}
        />
      )}
      {tab === "timeline" && <TimelineView fotosPorFecha={fotosPorFecha} onPhotoClick={setLightbox} />}
      {tab === "etapas" && <EtapasView fotos={fotos} onClick={(etapa) => { setFiltroEtapa(etapa); setTab("galeria"); }} />}
      {tab === "subir" && <SubirView setFotos={setFotos} fotos={fotos} onSubido={() => setTab("galeria")} />}
      {tab === "planos" && <PlanosGuiaView planos={planos} setPlanos={setPlanos} />}

      {lightbox && <Lightbox foto={lightbox} fotos={fotosFiltradas} onClose={() => setLightbox(null)} onNavigate={setLightbox} />}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   GALERÍA POR FECHA
   ════════════════════════════════════════════════════════════════════════════ */
const GaleriaView = ({ fotos, fotosPorFecha, filtroEtapa, setFiltroEtapa, filtroZona, setFiltroZona, filtroFecha, setFiltroFecha, busqueda, setBusqueda, onPhotoClick, onDelete }) => (
  <div className="space-y-3">
    {/* Filtros */}
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-stone-200 bg-white p-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-stone-400" />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar en descripción…" className="w-full rounded-md border border-stone-300 bg-white py-1.5 pl-7 pr-2 text-[12px]" />
      </div>
      <select value={filtroEtapa} onChange={e => setFiltroEtapa(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-[12px]">
        <option value="all">Todas las etapas</option>
        {ETAPAS_OBRA.map(e => <option key={e.id} value={e.id}>{e.icon} {e.label}</option>)}
      </select>
      <select value={filtroZona} onChange={e => setFiltroZona(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-[12px]">
        <option value="all">Todas las zonas</option>
        {ZONAS_OBRA.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
      </select>
      <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-[12px]" />
      <button onClick={() => { setFiltroEtapa("all"); setFiltroZona("all"); setFiltroFecha(""); setBusqueda(""); }} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-[11px] text-stone-700 hover:bg-stone-50">Limpiar</button>
      <div className="text-[11px] text-stone-500">{fotos.length} fotos</div>
    </div>

    {fotosPorFecha.length === 0 && (
      <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
        <Camera className="mx-auto mb-2 h-10 w-10 text-stone-300" />
        <div className="font-serif text-stone-700">Sin fotos para los filtros aplicados</div>
        <div className="text-[12px] text-stone-500">Sube la primera foto desde la pestaña "Subir fotos"</div>
      </div>
    )}

    {/* Agrupadas por fecha */}
    {fotosPorFecha.map(([fecha, fotosDelDia]) => (
      <div key={fecha} className="rounded-lg border border-stone-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="font-serif text-base font-semibold">{formatFecha(fecha)}</span>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">{fotosDelDia.length} fotos</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {fotosDelDia.map(foto => <PhotoCard key={foto.id} foto={foto} onClick={() => onPhotoClick(foto)} onDelete={() => onDelete(foto.id)} />)}
        </div>
      </div>
    ))}
  </div>
);

const PhotoCard = ({ foto, onClick, onDelete }) => {
  const etapa = ETAPAS_OBRA.find(e => e.id === foto.etapa);
  const zona = ZONAS_OBRA.find(z => z.id === foto.zona);
  const uploader = RESIDENTES.find(r => r.id === foto.uploader);
  return (
    <div className="group relative overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
      <button onClick={onClick} className="block w-full">
        {foto.thumbnail ? (
          <img src={foto.thumbnail} alt={foto.descripcion} className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300">
            <ImageIcon className="h-10 w-10 text-stone-400" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-1.5">
          <span className={`rounded bg-${etapa?.color}-100 px-1.5 py-0.5 text-[9px] font-bold text-${etapa?.color}-800`}>
            {etapa?.icon} {etapa?.label}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
          <div className="line-clamp-2 text-[10px] leading-tight">{foto.descripcion}</div>
          <div className="mt-0.5 flex items-center justify-between text-[9px] opacity-90">
            <span>📍 {zona?.label}</span>
            <span>📷 {uploader?.avatar || uploader?.nombre?.split(" ")[0]}</span>
          </div>
        </div>
      </button>
      <button onClick={onDelete} className="absolute right-1 top-1 hidden rounded-full bg-rose-600 p-1 text-white group-hover:flex hover:bg-rose-700">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   TIMELINE — Vista cronológica visual
   ════════════════════════════════════════════════════════════════════════════ */
const TimelineView = ({ fotosPorFecha, onPhotoClick }) => (
  <div className="rounded-lg border border-stone-200 bg-white p-4">
    {fotosPorFecha.length === 0 ? (
      <div className="py-12 text-center text-[12px] italic text-stone-400">Sin fotos. Sube la primera para empezar la bitácora.</div>
    ) : (
      <div className="relative pl-8">
        {/* línea vertical */}
        <div className="absolute bottom-0 left-3 top-0 w-0.5 bg-stone-200"></div>
        {fotosPorFecha.map(([fecha, fotosDelDia]) => (
          <div key={fecha} className="relative mb-6">
            <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-orange-600 bg-white">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-600"></div>
            </div>
            <div className="font-serif text-base font-bold text-orange-800">{formatFecha(fecha)}</div>
            <div className="mt-1 text-[10px] text-stone-500">{fotosDelDia.length} fotografías registradas</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {fotosDelDia.slice(0, 8).map(foto => {
                const etapa = ETAPAS_OBRA.find(e => e.id === foto.etapa);
                return (
                  <button key={foto.id} onClick={() => onPhotoClick(foto)} className={`group flex items-center gap-1 rounded-md border border-${etapa?.color}-200 bg-${etapa?.color}-50 px-2 py-1 text-[10px] hover:scale-105`}>
                    <span>{etapa?.icon}</span>
                    <span className="font-medium text-stone-800 line-clamp-1 max-w-[180px]">{foto.descripcion}</span>
                  </button>
                );
              })}
              {fotosDelDia.length > 8 && (
                <span className="rounded-md bg-stone-100 px-2 py-1 text-[10px] text-stone-600">+{fotosDelDia.length - 8} más</span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   ETAPAS — Resumen por etapa
   ════════════════════════════════════════════════════════════════════════════ */
const EtapasView = ({ fotos, onClick }) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
    {ETAPAS_OBRA.map(e => {
      const fotosDeEtapa = fotos.filter(f => f.etapa === e.id);
      const ultimaFecha = fotosDeEtapa.length ? fotosDeEtapa.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0].fecha : null;
      return (
        <button key={e.id} onClick={() => onClick(e.id)} className={`rounded-xl border bg-white p-4 text-left transition-all hover:scale-[1.02] hover:shadow-md border-${e.color}-200`}>
          <div className="flex items-center justify-between">
            <span className="text-3xl">{e.icon}</span>
            <span className={`rounded-full bg-${e.color}-100 px-2 py-0.5 text-[10px] font-bold text-${e.color}-800`}>{fotosDeEtapa.length} fotos</span>
          </div>
          <h3 className="mt-2 font-serif text-lg font-semibold text-stone-900">{e.label}</h3>
          {ultimaFecha ? (
            <div className="mt-1 text-[11px] text-stone-500">Última: {formatFecha(ultimaFecha)}</div>
          ) : (
            <div className="mt-1 text-[11px] italic text-stone-400">Sin registros aún</div>
          )}
        </button>
      );
    })}
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   SUBIR FOTOS — Formulario para residente
   ════════════════════════════════════════════════════════════════════════════ */
const SubirView = ({ setFotos, fotos, onSubido }) => {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    etapa: "preliminares",
    zona: "sotano-2",
    uploader: "PR",
    descripcion: ""
  });
  const [archivos, setArchivos] = useState([]);
  const inputRef = useRef(null);

  const procesarArchivos = (files) => {
    const arr = [...files];
    const promesas = arr.map(file => new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        /* Comprimir a max 1200px de ancho */
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxW = 1200;
          const ratio = Math.min(maxW / img.width, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve({ nombre: file.name, dataUrl, size: file.size });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }));
    Promise.all(promesas).then(items => setArchivos(items.filter(Boolean)));
  };

  const guardar = () => {
    if (archivos.length === 0) return;
    const baseId = Math.max(0, ...fotos.map(f => f.id)) + 1;
    const nuevas = archivos.map((a, i) => ({
      id: baseId + i,
      fecha: form.fecha,
      etapa: form.etapa,
      zona: form.zona,
      uploader: form.uploader,
      descripcion: form.descripcion || a.nombre.replace(/\.[^.]+$/, ""),
      thumbnail: a.dataUrl
    }));
    setFotos(prev => [...nuevas, ...prev]);
    setArchivos([]);
    setForm({ ...form, descripcion: "" });
    onSubido?.();
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h3 className="mb-3 font-serif text-lg">📷 Datos del registro</h3>
        <div className="space-y-3 text-[12px]">
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-1 block text-[10px] font-semibold uppercase text-stone-600">Fecha de la foto</span>
              <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="w-full rounded border border-stone-300 px-2 py-1.5" />
            </label>
            <label>
              <span className="mb-1 block text-[10px] font-semibold uppercase text-stone-600">Tomada por</span>
              <select value={form.uploader} onChange={e => setForm({ ...form, uploader: e.target.value })} className="w-full rounded border border-stone-300 bg-white px-2 py-1.5">
                {RESIDENTES.map(r => <option key={r.id} value={r.id}>{r.nombre} ({r.rol})</option>)}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase text-stone-600">Etapa de obra</span>
            <select value={form.etapa} onChange={e => setForm({ ...form, etapa: e.target.value })} className="w-full rounded border border-stone-300 bg-white px-2 py-1.5">
              {ETAPAS_OBRA.map(e => <option key={e.id} value={e.id}>{e.icon} {e.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase text-stone-600">Zona</span>
            <select value={form.zona} onChange={e => setForm({ ...form, zona: e.target.value })} className="w-full rounded border border-stone-300 bg-white px-2 py-1.5">
              {ZONAS_OBRA.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase text-stone-600">Descripción (opcional)</span>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={3} placeholder="Ej. Vaciado de losa entrepiso 3, sector occidente." className="w-full rounded border border-stone-300 px-2 py-1.5" />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h3 className="mb-3 font-serif text-lg">🖼️ Fotos</h3>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-orange-300 bg-orange-50/40 p-8 text-center hover:bg-orange-50">
          <Upload className="h-10 w-10 text-orange-500" />
          <div className="font-medium text-orange-800">Selecciona o toma fotos</div>
          <div className="text-[11px] text-stone-600">Desde celular: cámara directa · desde PC: arrastra archivos</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={(e) => procesarArchivos(e.target.files)}
          />
        </label>
        {archivos.length > 0 && (
          <>
            <div className="mt-3 text-[11px] text-stone-600">{archivos.length} foto(s) seleccionada(s) · se comprimirán automáticamente</div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {archivos.map((a, i) => (
                <img key={i} src={a.dataUrl} alt={a.nombre} className="aspect-square w-full rounded border border-stone-200 object-cover" />
              ))}
            </div>
            <button onClick={guardar} className="mt-3 w-full rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700">
              Guardar {archivos.length} foto(s) en la bitácora
            </button>
          </>
        )}
        <div className="mt-3 rounded-md bg-stone-50 p-2 text-[10px] text-stone-600">
          💡 Las fotos se comprimen a 1200px de ancho y JPEG calidad 70% antes de guardarlas. Esto ahorra espacio sin perder claridad para auditoría de obra.
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   LIGHTBOX — Visor de foto grande con navegación
   ════════════════════════════════════════════════════════════════════════════ */
const Lightbox = ({ foto, fotos, onClose, onNavigate }) => {
  const idx = fotos.findIndex(f => f.id === foto.id);
  const etapa = ETAPAS_OBRA.find(e => e.id === foto.etapa);
  const zona = ZONAS_OBRA.find(z => z.id === foto.zona);
  const uploader = RESIDENTES.find(r => r.id === foto.uploader);

  const prev = () => idx > 0 && onNavigate(fotos[idx - 1]);
  const next = () => idx < fotos.length - 1 && onNavigate(fotos[idx + 1]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-900/90 backdrop-blur" onClick={onClose}>
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -right-2 -top-10 rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20">
          <X className="h-5 w-5" />
        </button>
        {idx > 0 && <button onClick={prev} className="absolute -left-12 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><ChevronLeft className="h-5 w-5" /></button>}
        {idx < fotos.length - 1 && <button onClick={next} className="absolute -right-12 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><ChevronRight className="h-5 w-5" /></button>}
        {foto.thumbnail ? (
          <img src={foto.thumbnail} alt={foto.descripcion} className="max-h-[80vh] max-w-[85vw] rounded-lg object-contain" />
        ) : (
          <div className="flex h-96 w-96 items-center justify-center rounded-lg bg-stone-700 text-stone-400">
            <ImageIcon className="h-20 w-20" />
          </div>
        )}
        <div className="mt-3 rounded-lg bg-white/10 p-3 text-white backdrop-blur">
          <div className="flex items-center gap-2">
            <span className={`rounded bg-${etapa?.color}-100 px-2 py-0.5 text-[10px] font-bold text-${etapa?.color}-800`}>{etapa?.icon} {etapa?.label}</span>
            <span className="text-[11px] opacity-80">📍 {zona?.label}</span>
            <span className="text-[11px] opacity-80">📅 {formatFecha(foto.fecha)}</span>
            <span className="text-[11px] opacity-80">📷 {uploader?.nombre}</span>
          </div>
          <div className="mt-1 text-[13px]">{foto.descripcion}</div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   PLANOS Y MODELO 3D — Guía + upload por categoría
   ════════════════════════════════════════════════════════════════════════════ */
const PlanosGuiaView = ({ planos, setPlanos }) => {
  const [categoria, setCategoria] = useState("arquitectonico");
  const inputRef = useRef(null);

  const subirArchivo = (files) => {
    const arr = [...files];
    arr.forEach(file => {
      const ext = (file.name.split(".").pop() || "").toUpperCase();
      const formato = ["PDF", "DWG", "RVT", "IFC", "GLB", "GLTF"].includes(ext) ? (ext === "GLTF" ? "GLB" : ext) : "OTRO";
      const reader = new FileReader();
      reader.onload = (e) => {
        const id = Date.now() + Math.random();
        setPlanos(prev => [...prev, {
          id, nombre: file.name, categoria, formato,
          tamanoMB: (file.size / 1024 / 1024).toFixed(1),
          fechaSubida: new Date().toISOString().slice(0, 10),
          dataUrl: formato === "PDF" ? e.target.result : null, // solo PDF como dataUrl (vista previa)
          tamanoBytes: file.size
        }]);
      };
      if (formato === "PDF") reader.readAsDataURL(file); else { setPlanos(prev => [...prev, { id: Date.now() + Math.random(), nombre: file.name, categoria, formato, tamanoMB: (file.size / 1024 / 1024).toFixed(1), fechaSubida: new Date().toISOString().slice(0, 10), tamanoBytes: file.size }]); }
    });
  };

  const planosCategoria = planos.filter(p => p.categoria === categoria);

  return (
    <div className="space-y-4">
      {/* Guía superior */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="mb-2 flex items-center gap-2 font-serif text-lg text-amber-900"><Info className="h-5 w-5" /> Guía: qué formato subir y para qué</h3>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
          {Object.entries(FORMATOS_INFO).map(([fmt, info]) => (
            <div key={fmt} className={`rounded-md border bg-white p-2 border-${info.color}-200`}>
              <div className="text-2xl">{info.icon}</div>
              <div className={`font-bold text-${info.color}-800`}>{info.label}</div>
              <div className="text-[10px] text-stone-600">{info.uso}</div>
              <div className="text-[9px] text-stone-500">{info.size}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-md bg-white p-2 text-[12px] text-stone-700">
          🎯 <strong>Camino al modelo 3D interactivo</strong>: pídele al arquitecto que exporte desde Revit a <strong>IFC</strong> y a <strong>glb</strong>.
          Súbelos aquí. Cuando montemos el viewer 3D (usaremos <code className="rounded bg-stone-100 px-1">web-ifc-three</code> open source — sin costos),
          el modelo aparecerá clickeable. Click en un apartamento → abre toda su info (cliente, fotos, planos, parqueadero, depósito).
        </div>
      </div>

      {/* Selector categoría */}
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">Categoría</div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIAS_PLANOS.map(c => {
            const cnt = planos.filter(p => p.categoria === c.id).length;
            return (
              <button key={c.id} onClick={() => setCategoria(c.id)} className={`rounded-md border px-3 py-1.5 text-[11px] font-medium ${categoria === c.id ? "border-orange-500 bg-orange-50 text-orange-800" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}>
                {c.label} {cnt > 0 && <span className="ml-1 rounded-full bg-stone-200 px-1 text-[9px]">{cnt}</span>}
              </button>
            );
          })}
        </div>
        {(() => {
          const c = CATEGORIAS_PLANOS.find(x => x.id === categoria);
          return (
            <div className="mt-2 rounded-md bg-stone-50 p-2 text-[11px] text-stone-600">
              <strong>{c?.label}:</strong> {c?.desc}. Formatos aceptados: {c?.formatos.join(" · ")}
            </div>
          );
        })()}
      </div>

      {/* Upload area */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-orange-300 bg-orange-50/40 p-6 text-center hover:bg-orange-50">
        <Upload className="h-8 w-8 text-orange-500" />
        <div className="font-medium text-orange-800">Subir planos a "{CATEGORIAS_PLANOS.find(c => c.id === categoria)?.label}"</div>
        <div className="text-[10px] text-stone-600">PDF, DWG, RVT, IFC o GLB · máx 100 MB por archivo</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.dwg,.rvt,.ifc,.glb,.gltf"
          className="hidden"
          onChange={e => subirArchivo(e.target.files)}
        />
      </label>

      {/* Lista de planos */}
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-stone-50 text-[10px] uppercase text-stone-500">
            <tr>
              <th className="px-3 py-2 text-left">Archivo</th>
              <th className="px-3 py-2 text-center">Formato</th>
              <th className="px-3 py-2 text-right">Tamaño</th>
              <th className="px-3 py-2 text-left">Subido</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {planosCategoria.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-[12px] italic text-stone-400">Sin planos en esta categoría</td></tr>
            )}
            {planosCategoria.map(p => {
              const fmt = FORMATOS_INFO[p.formato];
              return (
                <tr key={p.id} className="border-t border-stone-100 hover:bg-stone-50/50">
                  <td className="px-3 py-2 font-medium">{p.nombre}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold bg-${fmt?.color || "stone"}-100 text-${fmt?.color || "stone"}-800`}>{fmt?.icon} {p.formato}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-stone-600">{p.tamanoMB} MB</td>
                  <td className="px-3 py-2 text-stone-600">{p.fechaSubida}</td>
                  <td className="px-3 py-2 text-right">
                    {p.dataUrl && <a href={p.dataUrl} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-emerald-600 hover:bg-emerald-50"><Eye className="h-3.5 w-3.5 inline" /></a>}
                    <button onClick={() => setPlanos(prev => prev.filter(x => x.id !== p.id))} className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5 inline" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stub modelo 3D */}
      <div className="rounded-lg border-2 border-dashed border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 to-violet-50 p-5">
        <div className="flex items-start gap-3">
          <span className="text-4xl">🎮</span>
          <div className="flex-1">
            <h3 className="font-serif text-lg text-stone-900">Modelo 3D interactivo · próximamente</h3>
            <p className="mt-1 text-[12px] text-stone-700">
              Cuando subas un archivo <strong>IFC</strong> o <strong>glb</strong> de la categoría "Arquitectónico", aquí aparecerá el modelo 3D del edificio. Click sobre cualquier apartamento → drawer con:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-0.5 text-[12px] text-stone-700">
              <li>Cliente actual (si está vendido)</li>
              <li>Fotos del apartamento</li>
              <li>Planos específicos del apto</li>
              <li>Parqueadero y depósito asociados</li>
              <li>Acabados contratados, modificaciones, documentos firmados</li>
            </ul>
            <div className="mt-3 rounded-md border border-fuchsia-200 bg-white p-3 text-[11px]">
              <strong className="text-fuchsia-800">🛠 Stack técnico (open source, sin costos):</strong>
              <ul className="mt-1 list-disc pl-5 space-y-0.5 text-stone-700">
                <li><code className="rounded bg-stone-100 px-1">three.js</code> + <code className="rounded bg-stone-100 px-1">@react-three/fiber</code> — render 3D en navegador</li>
                <li><code className="rounded bg-stone-100 px-1">web-ifc-three</code> — leer archivos IFC directamente</li>
                <li><code className="rounded bg-stone-100 px-1">@react-three/drei</code> — controles de cámara, raycaster para click</li>
              </ul>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-[10px] font-mono text-stone-700">
              Estado: 🔴 Inactivo · Sube archivos IFC/glb para activar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitacoraObra;
