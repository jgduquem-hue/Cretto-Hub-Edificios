import React, { useState, useMemo, useEffect } from "react";
import {
  Building, Home, Car, Package, FileText, Image as ImageIcon, Edit3,
  Plus, X, Check, Search, Filter, Eye, Upload, Trash2, Download,
  CheckCircle2, AlertCircle, DollarSign, Layers, Grid3x3, MapPin,
  User, Calendar, Camera, Star, ArrowRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

/* ════════════════════════════════════════════════════════════════════════════
   Inventario Comercial — Casa 107
   - 47 unidades organizadas por piso
   - Vista plano: grid color-coded por estado
   - Drawer detalle con 5 tabs (General, Acabados, Parqueaderos, Documentos, Cambios)
   - Vínculo bidireccional con CRM (lead actual del apto)
   - Paquetes de acabados con costos
   ════════════════════════════════════════════════════════════════════════════ */

/* ─── Estados de unidad ─── */
export const ESTADOS = [
  { id: "disponible", label: "Disponible", color: "emerald", hex: "#10b981", bgClass: "bg-emerald-50 border-emerald-300 text-emerald-900" },
  { id: "reservada",  label: "Reservada",  color: "amber",   hex: "#f59e0b", bgClass: "bg-amber-100 border-amber-400 text-amber-900" },
  { id: "separada",   label: "Separada",   color: "orange",  hex: "#f97316", bgClass: "bg-orange-100 border-orange-400 text-orange-900" },
  { id: "vendida",    label: "Escriturada", color: "violet", hex: "#a855f7", bgClass: "bg-violet-100 border-violet-400 text-violet-900" },
  { id: "bloqueada",  label: "Bloqueada",  color: "stone",   hex: "#78716c", bgClass: "bg-stone-200 border-stone-400 text-stone-700" }
];

/* ─── Tipologías Casa 107 ─── */
export const TIPOLOGIAS = [
  { id: "A", label: "Tipo A — 1 alcoba",      areaM2: 58,  alcobas: 1, banos: 1, precioBaseMM: 720 },
  { id: "B", label: "Tipo B — 2 alcobas",     areaM2: 74,  alcobas: 2, banos: 2, precioBaseMM: 950 },
  { id: "C", label: "Tipo C — 2 alc grande",  areaM2: 82,  alcobas: 2, banos: 2, precioBaseMM: 1100 },
  { id: "D", label: "Tipo D — 3 alcobas",     areaM2: 95,  alcobas: 3, banos: 2, precioBaseMM: 1350 },
  { id: "PH", label: "Penthouse",             areaM2: 145, alcobas: 3, banos: 3, precioBaseMM: 2200 }
];

/* ─── Paquetes de acabados ─── */
export const PAQUETES_ACABADOS = [
  {
    id: "standard",
    label: "Standard",
    color: "stone",
    descripcion: "Entrega obra blanca: piso porcelanato, ventanas vidrio templado, baños cerámica, cocina integral básica.",
    deltaPrecioMM: 0,
    items: [
      "Piso porcelanato 60×60 cm color beige",
      "Cocina integral en madera laminada, mesón quartz",
      "Closet básico habitación principal",
      "Baño con sanitario, lavamanos y ducha estándar",
      "Pintura blanca interior",
      "Ventanas aluminio + vidrio templado 6mm"
    ]
  },
  {
    id: "plus",
    label: "Plus",
    color: "blue",
    descripcion: "Mejora de acabados: piso flotante en zonas sociales, cocina ampliada, closets en todas las alcobas.",
    deltaPrecioMM: 35,
    items: [
      "Piso porcelanato 80×80 cm + flotante en zonas sociales",
      "Cocina integral con isla, mesón quartz premium",
      "Closets en todas las alcobas",
      "Iluminación LED empotrada en cocina y baños",
      "Pintura color a elección (4 ambientes)",
      "Ventanas piso a techo en sala"
    ]
  },
  {
    id: "premium",
    label: "Premium",
    color: "violet",
    descripcion: "Acabados de lujo: pisos en mármol, domótica básica, vestier y baño principal premium.",
    deltaPrecioMM: 85,
    items: [
      "Piso porcelanato gran formato 120×60 cm + mármol baños",
      "Cocina italiana con isla, electrodomésticos premium incluidos",
      "Vestier en habitación principal",
      "Baño principal con tina y ducha de lluvia",
      "Domótica básica (iluminación + persianas automáticas)",
      "Aire acondicionado central"
    ]
  },
  {
    id: "custom",
    label: "Custom",
    color: "fuchsia",
    descripcion: "Personalización total a pedido del cliente con arquitecto Cretto.",
    deltaPrecioMM: 120,
    items: [
      "Diseño interior personalizado con arquitecto Cretto",
      "Distribución modificable (previa aprobación estructural)",
      "Acabados a elección del cliente con tope presupuestal",
      "Smart home completo con asistente Alexa/Google",
      "Iluminación de diseño con dimming",
      "Materiales importados a elección"
    ]
  }
];

/* ─── Tipos de modificaciones que el cliente puede solicitar ─── */
export const TIPOS_MODIFICACION = [
  { id: "distribucion",  label: "Modificación de distribución" },
  { id: "acabado",       label: "Cambio de acabado específico" },
  { id: "electrico",     label: "Punto eléctrico adicional" },
  { id: "hidraulico",    label: "Punto hidráulico adicional" },
  { id: "cocina",        label: "Personalización de cocina" },
  { id: "bano",          label: "Personalización de baño" },
  { id: "closet",        label: "Closet a la medida" },
  { id: "domotica",      label: "Instalación domótica" },
  { id: "otro",          label: "Otra" }
];

/* ═════════════════ GENERACIÓN DE 47 UNIDADES CASA 107 ═════════════════ */
const generarUnidades = () => {
  const units = [];
  let id = 1;

  /* Piso 1: 5 aptos con patio (101-105) */
  ["A","A","B","C","D"].forEach((tipo, i) => {
    const t = TIPOLOGIAS.find(x => x.id === tipo);
    units.push({
      id: id++, numero: `10${i+1}`, piso: 1, tipo,
      areaM2: t.areaM2 + 8, // +8m² patio
      alcobas: t.alcobas, banos: t.banos,
      precioMM: t.precioBaseMM + 50, // premium por piso bajo + patio
      estado: i === 0 ? "vendida" : i === 1 ? "separada" : i === 2 ? "reservada" : "disponible",
      leadId: i === 0 ? 9 : null,
      paquete: i === 0 ? "plus" : "standard",
      parqueaderos: [`P${i+1}`],
      depositos: [`D${i+1}`],
      observaciones: i === 0 ? "Cliente VIP - escriturado mayo 2026" : ""
    });
  });

  /* Pisos 2-9: 5 aptos cada uno (XX1, XX2, XX3, XX4, XX5) */
  for (let p = 2; p <= 9; p++) {
    const tipos = ["A","B","B","C","D"];
    tipos.forEach((tipo, i) => {
      const t = TIPOLOGIAS.find(x => x.id === tipo);
      const numero = `${p}0${i+1}`;
      /* Aplicar estados realistas según seed de leads del CRM */
      const estado =
        numero === "204" ? "reservada" :
        numero === "302" ? "disponible" :
        numero === "405" ? "reservada" :
        numero === "402" ? "vendida" :
        numero === "501" ? "separada" :
        numero === "503" ? "reservada" :
        numero === "504" ? "separada" :
        numero === "603" ? "separada" :
        numero === "602" ? "separada" :
        numero === "701" ? "separada" :
        numero === "203" ? "reservada" :
        numero === "304" ? "vendida" :
        "disponible";
      const leadIdMap = { "204": 3, "402": 9, "302": 4, "405": 5, "501": 6, "503": 13, "504": 17, "603": 20, "602": 7, "701": 8, "203": 12, "304": 19 };
      units.push({
        id: id++, numero, piso: p, tipo,
        areaM2: t.areaM2 + (p > 7 ? 3 : 0), // pisos altos un poco más grandes
        alcobas: t.alcobas, banos: t.banos,
        precioMM: t.precioBaseMM + (p * 12), // precio sube con altura
        estado,
        leadId: leadIdMap[numero] || null,
        paquete: estado === "vendida" ? "plus" : estado === "separada" ? "premium" : "standard",
        parqueaderos: [`P${units.length + 5}`],
        depositos: [`D${units.length + 5}`],
        observaciones: ""
      });
    });
  }

  /* Piso 10: 2 penthouses (PH-1001, PH-1002) con 2 parqueaderos */
  ["PH","PH"].forEach((tipo, i) => {
    const t = TIPOLOGIAS.find(x => x.id === tipo);
    units.push({
      id: id++, numero: `PH-100${i+1}`, piso: 10, tipo,
      areaM2: t.areaM2 + (i * 10), // PH-1002 un poco más grande
      alcobas: t.alcobas, banos: t.banos,
      precioMM: t.precioBaseMM + (i * 200),
      estado: i === 0 ? "separada" : "disponible",
      leadId: i === 0 ? 16 : null,
      paquete: i === 0 ? "premium" : "standard",
      parqueaderos: [`P${units.length + 5}`, `P${units.length + 6}`],
      depositos: [`D${units.length + 5}`, `D${units.length + 6}`],
      observaciones: i === 0 ? "Familia Rodríguez - 3 hijos" : "Vista 360°, gran terraza"
    });
  });

  return units;
};

const SEED_UNIDADES = generarUnidades();

const fmtCop = (n) => "$" + Math.round(n).toLocaleString("es-CO").replace(/,/g, ".") + " MM";

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════════════════════════════════════════ */
const InventarioComercial = ({ project }) => {
  const [tab, setTab] = useState("plano");
  const [unidades, setUnidades] = useState(SEED_UNIDADES);
  const [seleccionada, setSeleccionada] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("all");
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [pisoActivo, setPisoActivo] = useState(1);

  /* Leer leads del CRM para mostrar dueño actual */
  const [leads, setLeads] = useState([]);
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:crm-leads:${project?.id || "default"}`);
        if (m && r && r.value) setLeads(JSON.parse(r.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  /* Persistencia */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:inventario:${project?.id || "default"}`);
        if (m && r && r.value) setUnidades(JSON.parse(r.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:inventario:${project?.id || "default"}`, JSON.stringify(unidades)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [unidades, project?.id]);

  const updateUnidad = (id, patch) => {
    setUnidades(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
    if (seleccionada?.id === id) setSeleccionada(prev => ({ ...prev, ...patch }));
  };

  /* KPIs */
  const kpis = useMemo(() => {
    const total = unidades.length;
    const por = (estId) => unidades.filter(u => u.estado === estId).length;
    return {
      total,
      disponibles: por("disponible"),
      reservadas: por("reservada"),
      separadas: por("separada"),
      vendidas: por("vendida"),
      bloqueadas: por("bloqueada"),
      ventasMM: unidades.reduce((s, u) => s + (u.estado === "vendida" ? u.precioMM : 0), 0),
      pipelineMM: unidades.reduce((s, u) => s + (["reservada","separada"].includes(u.estado) ? u.precioMM : 0), 0),
      preventas: por("reservada") + por("separada") + por("vendida"),
      pe: 28, // punto de equilibrio Casa 107
      pctAvancePE: ((por("reservada") + por("separada") + por("vendida")) / 28) * 100
    };
  }, [unidades]);

  const TABS = [
    { id: "plano",   label: "Vista plano",      icon: Grid3x3 },
    { id: "tabla",   label: "Tabla general",    icon: Layers },
    { id: "graficos", label: "Gráficos",        icon: BarChart },
    { id: "parqueaderos", label: "Parqueaderos & Depósitos", icon: Car }
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-6">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-pink-600">Inventario · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Unidades inmobiliarias</h1>
          <p className="mt-1 text-sm text-stone-500">
            {kpis.total} unidades · {kpis.disponibles} disponibles · {kpis.preventas}/{kpis.pe} para punto de equilibrio
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
        {ESTADOS.map(e => {
          const count = kpis[e.id === "disponible" ? "disponibles" : e.id === "reservada" ? "reservadas" : e.id === "separada" ? "separadas" : e.id === "vendida" ? "vendidas" : "bloqueadas"];
          return (
            <div key={e.id} className={`rounded-lg border p-3 ${e.bgClass}`}>
              <div className="text-[9px] uppercase tracking-wider opacity-80">{e.label}</div>
              <div className="font-serif text-2xl font-semibold">{count}</div>
              <div className="text-[10px] opacity-70">{((count / kpis.total) * 100).toFixed(0)}% del total</div>
            </div>
          );
        })}
        <div className="rounded-lg border border-pink-200 bg-pink-50 p-3 text-pink-900">
          <div className="text-[9px] uppercase tracking-wider opacity-80">Avance PE</div>
          <div className="font-serif text-2xl font-semibold">{kpis.pctAvancePE.toFixed(0)}%</div>
          <div className="text-[10px] opacity-70">{kpis.preventas}/{kpis.pe} aptos</div>
        </div>
      </div>

      {/* Barra avance PE */}
      <div className="mb-4 rounded-lg border border-stone-200 bg-white p-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-stone-700">Progreso preventas hacia punto de equilibrio</span>
          <span className="text-stone-600">{fmtCop(kpis.ventasMM)} cerrados · {fmtCop(kpis.pipelineMM)} en cierre</span>
        </div>
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-stone-100">
          <div className="absolute inset-y-0 left-0 bg-violet-500" style={{ width: `${(kpis.vendidas / kpis.pe) * 100}%` }} />
          <div className="absolute inset-y-0 bg-orange-400" style={{ left: `${(kpis.vendidas / kpis.pe) * 100}%`, width: `${(kpis.separadas / kpis.pe) * 100}%` }} />
          <div className="absolute inset-y-0 bg-amber-400" style={{ left: `${((kpis.vendidas + kpis.separadas) / kpis.pe) * 100}%`, width: `${(kpis.reservadas / kpis.pe) * 100}%` }} />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 text-[10px] font-bold text-stone-700">PE: 28 aptos (60%)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-stone-200">
        {TABS.map(t => {
          const Ic = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-medium ${tab === t.id ? "border-pink-600 text-pink-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
              <Ic className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "plano"   && <PlanoView unidades={unidades} pisoActivo={pisoActivo} setPisoActivo={setPisoActivo} onSelect={setSeleccionada} />}
      {tab === "tabla"   && <TablaView unidades={unidades} leads={leads} filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado} filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo} onSelect={setSeleccionada} />}
      {tab === "graficos" && <GraficosView unidades={unidades} />}
      {tab === "parqueaderos" && <ParqueaderosView unidades={unidades} />}

      {seleccionada && (
        <UnidadDrawer
          unidad={seleccionada}
          leads={leads}
          onClose={() => setSeleccionada(null)}
          onUpdate={(patch) => updateUnidad(seleccionada.id, patch)}
        />
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   VISTA PLANO — Grid de unidades por piso
   ════════════════════════════════════════════════════════════════════════════ */
const PlanoView = ({ unidades, pisoActivo, setPisoActivo, onSelect }) => {
  const pisos = [...new Set(unidades.map(u => u.piso))].sort((a, b) => b - a); // de arriba abajo
  const unidadesPiso = unidades.filter(u => u.piso === pisoActivo);

  return (
    <div className="grid grid-cols-[80px_1fr] gap-3">
      {/* Selector de piso vertical (estilo elevador) */}
      <div className="rounded-lg border border-stone-200 bg-white p-2">
        <div className="mb-2 text-center text-[9px] font-bold uppercase text-stone-500">Piso</div>
        <div className="space-y-1">
          {pisos.map(p => {
            const enPiso = unidades.filter(u => u.piso === p);
            const disp = enPiso.filter(u => u.estado === "disponible").length;
            return (
              <button
                key={p}
                onClick={() => setPisoActivo(p)}
                className={`w-full rounded-md border p-2 text-center transition-all ${pisoActivo === p ? "border-pink-500 bg-pink-50 text-pink-800" : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"}`}
              >
                <div className="font-serif text-xl font-bold">{p === 10 ? "PH" : p}</div>
                <div className="text-[9px] opacity-70">{enPiso.length} aptos</div>
                {disp > 0 && <div className="text-[8px] text-emerald-600">{disp} disp</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de unidades del piso activo */}
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg">
            Piso {pisoActivo === 10 ? "Penthouse" : pisoActivo} <span className="text-[12px] font-normal text-stone-500">— {unidadesPiso.length} unidades</span>
          </h3>
          <div className="flex gap-1 text-[10px]">
            {ESTADOS.map(e => (
              <div key={e.id} className="flex items-center gap-0.5">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: e.hex }}></div>
                {e.label}
              </div>
            ))}
          </div>
        </div>

        {/* Plano sintético */}
        <div className="rounded-lg bg-stone-50 p-4 border-2 border-dashed border-stone-300">
          <div className="text-[9px] uppercase tracking-wider text-stone-500 mb-1 text-center">Plano esquemático · Vista superior</div>
          <div className={`grid gap-2 ${unidadesPiso.length <= 2 ? "grid-cols-2" : "grid-cols-5"}`}>
            {unidadesPiso.map(u => {
              const est = ESTADOS.find(e => e.id === u.estado);
              const tipo = TIPOLOGIAS.find(t => t.id === u.tipo);
              return (
                <button
                  key={u.id}
                  onClick={() => onSelect(u)}
                  className={`group rounded-lg border-2 p-3 text-left transition-all hover:scale-105 hover:shadow-md ${est?.bgClass}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-mono text-lg font-bold">{u.numero}</div>
                    <span className="rounded bg-white/60 px-1 py-0.5 text-[8px] font-bold">{u.tipo}</span>
                  </div>
                  <div className="mt-1 text-[10px] leading-tight opacity-80">
                    {u.areaM2}m² · {u.alcobas}alc/{u.banos}b
                  </div>
                  <div className="mt-1 font-mono text-[11px] font-semibold">${u.precioMM} MM</div>
                  <div className="mt-1 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase">
                    {est?.label}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-stone-500">
            <span>🚪</span> Ascensores y zonas comunes en planta central <span>🚪</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   VISTA TABLA — Listado con filtros
   ════════════════════════════════════════════════════════════════════════════ */
const TablaView = ({ unidades, leads, filtroEstado, setFiltroEstado, filtroTipo, setFiltroTipo, onSelect }) => {
  const filtradas = unidades.filter(u => {
    if (filtroEstado !== "all" && u.estado !== filtroEstado) return false;
    if (filtroTipo !== "all" && u.tipo !== filtroTipo) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-stone-200 bg-white p-3">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-[12px]">
          <option value="all">Todos los estados</option>
          {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-[12px]">
          <option value="all">Todos los tipos</option>
          {TIPOLOGIAS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <div className="text-[11px] text-stone-500">{filtradas.length} de {unidades.length}</div>
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-3 py-2 text-left">Apto</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-right">Área</th>
              <th className="px-3 py-2 text-center">Alc/Baños</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Cliente</th>
              <th className="px-3 py-2 text-left">Paquete</th>
              <th className="px-3 py-2 text-center">Park / Dep</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map(u => {
              const est = ESTADOS.find(e => e.id === u.estado);
              const tipo = TIPOLOGIAS.find(t => t.id === u.tipo);
              const lead = leads.find(l => l.id === u.leadId);
              const paq = PAQUETES_ACABADOS.find(p => p.id === u.paquete);
              return (
                <tr key={u.id} className="border-t border-stone-100 hover:bg-stone-50/40 cursor-pointer" onClick={() => onSelect(u)}>
                  <td className="px-3 py-2 font-mono font-bold">{u.numero}</td>
                  <td className="px-3 py-2 text-[11px]">{tipo?.id}</td>
                  <td className="px-3 py-2 text-right font-mono">{u.areaM2} m²</td>
                  <td className="px-3 py-2 text-center text-[11px]">{u.alcobas}/{u.banos}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">${u.precioMM} MM</td>
                  <td className="px-3 py-2"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${est?.bgClass}`}>{est?.label}</span></td>
                  <td className="px-3 py-2 text-[11px]">{lead?.nombre || <span className="italic text-stone-400">—</span>}</td>
                  <td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 text-[10px] font-medium text-${paq?.color}-700`}>{paq?.label}</span></td>
                  <td className="px-3 py-2 text-center text-[10px] text-stone-600">{u.parqueaderos?.length || 0}/{u.depositos?.length || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   VISTA GRÁFICOS
   ════════════════════════════════════════════════════════════════════════════ */
const GraficosView = ({ unidades }) => {
  const porTipo = TIPOLOGIAS.map(t => ({
    tipo: t.id,
    total: unidades.filter(u => u.tipo === t.id).length,
    vendidas: unidades.filter(u => u.tipo === t.id && u.estado === "vendida").length
  })).filter(x => x.total > 0);

  const porPiso = [...new Set(unidades.map(u => u.piso))].sort((a, b) => a - b).map(p => ({
    piso: `P${p}`,
    disponible: unidades.filter(u => u.piso === p && u.estado === "disponible").length,
    reservada: unidades.filter(u => u.piso === p && u.estado === "reservada").length,
    separada: unidades.filter(u => u.piso === p && u.estado === "separada").length,
    vendida: unidades.filter(u => u.piso === p && u.estado === "vendida").length
  }));

  const ventasPorPaquete = PAQUETES_ACABADOS.map(p => ({
    name: p.label,
    value: unidades.filter(u => u.paquete === p.id).length,
    color: p.id === "standard" ? "#78716c" : p.id === "plus" ? "#3b82f6" : p.id === "premium" ? "#a855f7" : "#d946ef"
  })).filter(x => x.value > 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Unidades por tipología</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={porTipo}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="tipo" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="total" fill="#ec4899" name="Total" />
            <Bar dataKey="vendidas" fill="#a855f7" name="Vendidas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Estado por piso</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={porPiso}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="piso" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="disponible" stackId="a" fill="#10b981" />
            <Bar dataKey="reservada" stackId="a" fill="#f59e0b" />
            <Bar dataKey="separada" stackId="a" fill="#f97316" />
            <Bar dataKey="vendida" stackId="a" fill="#a855f7" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Distribución por paquete de acabados</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={ventasPorPaquete} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={d => `${d.name} (${d.value})`}>
              {ventasPorPaquete.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Resumen valor inventario (MM COP)</h3>
        <div className="space-y-2 text-[12px]">
          <Row label="Valor total inventario" value={fmtCop(unidades.reduce((s, u) => s + u.precioMM, 0))} bold />
          <Row label="Vendido (escriturado)" value={fmtCop(unidades.filter(u => u.estado === "vendida").reduce((s, u) => s + u.precioMM, 0))} color="violet" />
          <Row label="En cierre (separado)" value={fmtCop(unidades.filter(u => u.estado === "separada").reduce((s, u) => s + u.precioMM, 0))} color="orange" />
          <Row label="Reservado" value={fmtCop(unidades.filter(u => u.estado === "reservada").reduce((s, u) => s + u.precioMM, 0))} color="amber" />
          <Row label="Disponible para venta" value={fmtCop(unidades.filter(u => u.estado === "disponible").reduce((s, u) => s + u.precioMM, 0))} color="emerald" />
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, color = "stone", bold = false }) => (
  <div className={`flex items-center justify-between border-b border-stone-100 py-1.5 ${bold ? "font-bold text-stone-900" : `text-${color}-800`}`}>
    <span>{label}</span>
    <span className="font-mono">{value}</span>
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   VISTA PARQUEADEROS Y DEPÓSITOS
   ════════════════════════════════════════════════════════════════════════════ */
const ParqueaderosView = ({ unidades }) => {
  const parqs = unidades.flatMap(u => (u.parqueaderos || []).map(p => ({ codigo: p, apto: u.numero, estado: u.estado })));
  const deps = unidades.flatMap(u => (u.depositos || []).map(d => ({ codigo: d, apto: u.numero, estado: u.estado })));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-1.5 font-serif text-lg"><Car className="h-5 w-5 text-stone-600" /> Parqueaderos</h3>
        <div className="mb-3 text-[11px] text-stone-500">Sótano 1 y 2 · {parqs.length} cupos asignados</div>
        <div className="grid grid-cols-8 gap-1">
          {parqs.map((p, idx) => {
            const est = ESTADOS.find(e => e.id === p.estado);
            return (
              <div key={`${p.codigo}-${p.apto}-${idx}`} className={`rounded border p-1.5 text-center ${est?.bgClass}`} title={`Apto ${p.apto}`}>
                <div className="font-mono text-[10px] font-bold">{p.codigo}</div>
                <div className="text-[9px] opacity-70">{p.apto}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-1.5 font-serif text-lg"><Package className="h-5 w-5 text-stone-600" /> Depósitos</h3>
        <div className="mb-3 text-[11px] text-stone-500">Sótano 2 · {deps.length} cupos asignados</div>
        <div className="grid grid-cols-8 gap-1">
          {deps.map((d, idx) => {
            const est = ESTADOS.find(e => e.id === d.estado);
            return (
              <div key={`${d.codigo}-${d.apto}-${idx}`} className={`rounded border p-1.5 text-center ${est?.bgClass}`} title={`Apto ${d.apto}`}>
                <div className="font-mono text-[10px] font-bold">{d.codigo}</div>
                <div className="text-[9px] opacity-70">{d.apto}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   DRAWER DETALLE DE UNIDAD — 5 pestañas
   ════════════════════════════════════════════════════════════════════════════ */
const UnidadDrawer = ({ unidad, leads, onClose, onUpdate }) => {
  const [tab, setTab] = useState("general");
  const lead = leads.find(l => l.id === unidad.leadId);
  const tipo = TIPOLOGIAS.find(t => t.id === unidad.tipo);
  const paquete = PAQUETES_ACABADOS.find(p => p.id === unidad.paquete);
  const est = ESTADOS.find(e => e.id === unidad.estado);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <header className={`flex items-start justify-between border-b border-stone-200 p-4 ${est?.bgClass}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-3xl font-bold">{unidad.numero}</span>
              <span className="rounded bg-white/70 px-2 py-0.5 text-[10px] font-bold">{tipo?.id}</span>
              <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold uppercase">{est?.label}</span>
            </div>
            <div className="mt-0.5 text-[11px] opacity-80">
              Piso {unidad.piso === 10 ? "PH" : unidad.piso} · {unidad.areaM2} m² · {unidad.alcobas} alc / {unidad.banos} baños · {fmtCop(unidad.precioMM)}
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-white/40"><X className="h-5 w-5" /></button>
        </header>

        <div className="flex border-b border-stone-200">
          {[
            { id: "general",     label: "General",       icon: Home },
            { id: "acabados",    label: "Acabados",      icon: Star },
            { id: "extras",      label: "Park + Depo",   icon: Car },
            { id: "documentos",  label: "Documentos",    icon: FileText },
            { id: "cambios",     label: "Cambios",       icon: Edit3 }
          ].map(t => {
            const Ic = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`-mb-px flex flex-1 items-center justify-center gap-1 border-b-2 px-2 py-2 text-[11px] font-medium ${tab === t.id ? "border-pink-600 text-pink-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
                <Ic className="h-3 w-3" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "general"   && <TabGeneral unidad={unidad} lead={lead} onUpdate={onUpdate} />}
          {tab === "acabados"  && <TabAcabados unidad={unidad} paquete={paquete} onUpdate={onUpdate} />}
          {tab === "extras"    && <TabExtras unidad={unidad} onUpdate={onUpdate} />}
          {tab === "documentos" && <TabDocumentos unidad={unidad} onUpdate={onUpdate} />}
          {tab === "cambios"   && <TabCambios unidad={unidad} onUpdate={onUpdate} />}
        </div>
      </div>
    </div>
  );
};

/* ─── Tab 1: General ─── */
const TabGeneral = ({ unidad, lead, onUpdate }) => (
  <div className="space-y-3 text-[12px]">
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-600">Estado</label>
      <select value={unidad.estado} onChange={e => onUpdate({ estado: e.target.value })} className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5">
        {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
      </select>
    </div>
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-600">Precio (MM COP)</label>
      <input type="number" value={unidad.precioMM} onChange={e => onUpdate({ precioMM: parseInt(e.target.value) || 0 })} className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 font-mono" />
    </div>
    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-600">Cliente actual</div>
      {lead ? (
        <div className="space-y-1">
          <div className="font-medium text-stone-900">{lead.nombre}</div>
          <div className="text-[11px] text-stone-600">{lead.telefono} · {lead.email}</div>
          <a href={`#crm-lead-${lead.id}`} className="inline-flex items-center gap-1 text-[10px] text-pink-700 hover:underline">
            Ver en CRM <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      ) : (
        <div className="text-[11px] italic text-stone-400">Sin cliente asignado · ir a CRM para vincular</div>
      )}
    </div>
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-600">Observaciones</label>
      <textarea value={unidad.observaciones || ""} onChange={e => onUpdate({ observaciones: e.target.value })} rows={3} className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5" placeholder="Notas internas sobre esta unidad…" />
    </div>
  </div>
);

/* ─── Tab 2: Acabados ─── */
const TabAcabados = ({ unidad, paquete, onUpdate }) => (
  <div className="space-y-3 text-[12px]">
    <div className="text-[11px] text-stone-600">Selecciona el paquete de acabados contratado por el cliente. El delta se suma al precio base.</div>
    <div className="grid grid-cols-2 gap-2">
      {PAQUETES_ACABADOS.map(p => (
        <button
          key={p.id}
          onClick={() => onUpdate({ paquete: p.id })}
          className={`rounded-lg border-2 p-3 text-left transition-all ${unidad.paquete === p.id ? `border-${p.color}-500 bg-${p.color}-50` : "border-stone-200 bg-white hover:bg-stone-50"}`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-bold text-${p.color}-800`}>{p.label}</span>
            {unidad.paquete === p.id && <Check className={`h-4 w-4 text-${p.color}-700`} />}
          </div>
          <div className="mt-1 text-[10px] text-stone-600 line-clamp-2">{p.descripcion}</div>
          <div className="mt-1 font-mono text-[11px] font-semibold">
            {p.deltaPrecioMM === 0 ? "Incluido" : `+ $${p.deltaPrecioMM} MM`}
          </div>
        </button>
      ))}
    </div>
    {paquete && (
      <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">Incluye:</div>
        <ul className="space-y-1 text-[11px]">
          {paquete.items.map((it, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <Check className="h-3 w-3 flex-shrink-0 text-emerald-600 mt-0.5" /> {it}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

/* ─── Tab 3: Parqueadero + Depósito ─── */
const TabExtras = ({ unidad, onUpdate }) => {
  const addParq = () => onUpdate({ parqueaderos: [...(unidad.parqueaderos || []), `P${Date.now().toString().slice(-3)}`] });
  const addDep  = () => onUpdate({ depositos: [...(unidad.depositos || []), `D${Date.now().toString().slice(-3)}`] });
  const updParq = (i, val) => onUpdate({ parqueaderos: unidad.parqueaderos.map((p, idx) => idx === i ? val : p) });
  const updDep  = (i, val) => onUpdate({ depositos: unidad.depositos.map((d, idx) => idx === i ? val : d) });
  const delParq = (i) => onUpdate({ parqueaderos: unidad.parqueaderos.filter((_, idx) => idx !== i) });
  const delDep  = (i) => onUpdate({ depositos: unidad.depositos.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4 text-[12px]">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="flex items-center gap-1 font-semibold text-stone-800"><Car className="h-4 w-4" /> Parqueaderos asignados</h4>
          <button onClick={addParq} className="rounded border border-stone-300 px-2 py-1 text-[10px] hover:bg-stone-50">+ Agregar</button>
        </div>
        {(unidad.parqueaderos || []).length === 0 ? (
          <div className="rounded border border-dashed border-stone-300 p-2 text-center text-[11px] italic text-stone-400">Sin parqueadero asignado</div>
        ) : (
          <div className="space-y-1">
            {(unidad.parqueaderos || []).map((p, i) => (
              <div key={i} className="flex items-center gap-2 rounded border border-stone-200 bg-white p-2">
                <Car className="h-3.5 w-3.5 text-stone-500" />
                <input value={p} onChange={e => updParq(i, e.target.value)} className="flex-1 rounded border border-stone-200 px-2 py-0.5 font-mono text-[11px]" />
                <input placeholder="Ubicación en plano (Sótano-Eje)" className="flex-1 rounded border border-stone-200 px-2 py-0.5 text-[11px]" />
                <button onClick={() => delParq(i)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="flex items-center gap-1 font-semibold text-stone-800"><Package className="h-4 w-4" /> Depósitos asignados</h4>
          <button onClick={addDep} className="rounded border border-stone-300 px-2 py-1 text-[10px] hover:bg-stone-50">+ Agregar</button>
        </div>
        {(unidad.depositos || []).length === 0 ? (
          <div className="rounded border border-dashed border-stone-300 p-2 text-center text-[11px] italic text-stone-400">Sin depósito asignado</div>
        ) : (
          <div className="space-y-1">
            {(unidad.depositos || []).map((d, i) => (
              <div key={i} className="flex items-center gap-2 rounded border border-stone-200 bg-white p-2">
                <Package className="h-3.5 w-3.5 text-stone-500" />
                <input value={d} onChange={e => updDep(i, e.target.value)} className="flex-1 rounded border border-stone-200 px-2 py-0.5 font-mono text-[11px]" />
                <input placeholder="Ubicación en plano" className="flex-1 rounded border border-stone-200 px-2 py-0.5 text-[11px]" />
                <button onClick={() => delDep(i)} className="rounded p-0.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50/50 p-2 text-[10px] text-amber-900">
        💡 Próximo paso: subir plano sótanos con marcador interactivo de ubicación. Hoy guardamos el código y la ubicación textual.
      </div>
    </div>
  );
};

/* ─── Tab 4: Documentos ─── */
const TabDocumentos = ({ unidad, onUpdate }) => {
  const [docs, setDocs] = useState(unidad.documentos || []);

  const handleUpload = (e) => {
    const files = [...e.target.files];
    const nuevos = files.map(f => ({
      id: Date.now() + Math.random(),
      nombre: f.name,
      tamano: f.size,
      tipo: f.type,
      fechaSubida: new Date().toISOString().slice(0, 10),
      categoria: "otro"
    }));
    const actualizado = [...docs, ...nuevos];
    setDocs(actualizado);
    onUpdate({ documentos: actualizado });
  };

  const updCategoria = (id, categoria) => {
    const a = docs.map(d => d.id === id ? { ...d, categoria } : d);
    setDocs(a);
    onUpdate({ documentos: a });
  };

  const eliminar = (id) => {
    const a = docs.filter(d => d.id !== id);
    setDocs(a);
    onUpdate({ documentos: a });
  };

  const categorias = [
    { id: "reserva",     label: "Acta de reserva" },
    { id: "separacion",  label: "Recibo separación" },
    { id: "promesa",     label: "Promesa de compraventa" },
    { id: "escritura",   label: "Escritura pública" },
    { id: "cedula",      label: "Cédula cliente" },
    { id: "ingresos",    label: "Certificación de ingresos" },
    { id: "credito",     label: "Aprobación crédito" },
    { id: "otro",        label: "Otro" }
  ];

  return (
    <div className="space-y-3 text-[12px]">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-stone-300 p-4 hover:bg-stone-50">
        <Upload className="h-5 w-5 text-stone-500" />
        <span className="text-[12px] text-stone-700">Subir documentos (contratos, actas, recibos, fotos…)</span>
        <input type="file" multiple className="hidden" onChange={handleUpload} />
      </label>
      {docs.length === 0 && <div className="text-center text-[11px] italic text-stone-400">Sin documentos cargados</div>}
      {docs.map(d => (
        <div key={d.id} className="flex items-center gap-2 rounded-md border border-stone-200 bg-white p-2">
          <FileText className="h-4 w-4 flex-shrink-0 text-stone-500" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-medium">{d.nombre}</div>
            <div className="text-[9px] text-stone-500">{(d.tamano / 1024).toFixed(0)} KB · {d.fechaSubida}</div>
          </div>
          <select value={d.categoria} onChange={e => updCategoria(d.id, e.target.value)} className="rounded border border-stone-200 px-1 py-0.5 text-[10px]">
            {categorias.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <button onClick={() => eliminar(d.id)} className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
        </div>
      ))}
    </div>
  );
};

/* ─── Tab 5: Cambios solicitados ─── */
const TabCambios = ({ unidad, onUpdate }) => {
  const [cambios, setCambios] = useState(unidad.cambios || []);
  const [nuevo, setNuevo] = useState({ tipo: "distribucion", descripcion: "", costoMM: 0, estado: "solicitado" });

  const agregar = () => {
    if (!nuevo.descripcion.trim()) return;
    const c = { ...nuevo, id: Date.now(), fecha: new Date().toISOString().slice(0, 10) };
    const a = [...cambios, c];
    setCambios(a);
    onUpdate({ cambios: a });
    setNuevo({ tipo: "distribucion", descripcion: "", costoMM: 0, estado: "solicitado" });
  };

  const updateCambio = (id, patch) => {
    const a = cambios.map(c => c.id === id ? { ...c, ...patch } : c);
    setCambios(a);
    onUpdate({ cambios: a });
  };

  const eliminar = (id) => {
    const a = cambios.filter(c => c.id !== id);
    setCambios(a);
    onUpdate({ cambios: a });
  };

  return (
    <div className="space-y-3 text-[12px]">
      <div className="text-[11px] text-stone-600">Modificaciones, automatizaciones o personalizaciones que el cliente solicita sobre el paquete base.</div>

      <div className="rounded-md border border-pink-200 bg-pink-50/50 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-pink-800">Nueva solicitud</div>
        <div className="grid grid-cols-2 gap-2">
          <select value={nuevo.tipo} onChange={e => setNuevo({ ...nuevo, tipo: e.target.value })} className="rounded border border-stone-300 bg-white px-2 py-1 text-[11px]">
            {TIPOS_MODIFICACION.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <input type="number" value={nuevo.costoMM} onChange={e => setNuevo({ ...nuevo, costoMM: parseFloat(e.target.value) || 0 })} placeholder="Costo adicional MM" className="rounded border border-stone-300 bg-white px-2 py-1 text-[11px]" />
        </div>
        <textarea value={nuevo.descripcion} onChange={e => setNuevo({ ...nuevo, descripcion: e.target.value })} rows={2} placeholder="Descripción del cambio solicitado…" className="mt-2 w-full rounded border border-stone-300 bg-white px-2 py-1 text-[11px]" />
        <button onClick={agregar} disabled={!nuevo.descripcion.trim()} className="mt-2 rounded bg-pink-700 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-pink-800 disabled:opacity-40">
          + Agregar cambio
        </button>
      </div>

      {cambios.length === 0 && <div className="text-center text-[11px] italic text-stone-400">Sin cambios solicitados</div>}

      {cambios.map(c => {
        const tipo = TIPOS_MODIFICACION.find(t => t.id === c.tipo);
        return (
          <div key={c.id} className="rounded-md border border-stone-200 bg-white p-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[9px] font-semibold">{tipo?.label}</span>
                  <span className="text-[10px] text-stone-500">{c.fecha}</span>
                </div>
                <div className="mt-1 text-[11px] text-stone-800">{c.descripcion}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-mono text-[11px] font-semibold text-pink-800">+${c.costoMM} MM</span>
                <select value={c.estado} onChange={e => updateCambio(c.id, { estado: e.target.value })} className="rounded border border-stone-200 bg-white px-1 py-0.5 text-[9px]">
                  <option value="solicitado">Solicitado</option>
                  <option value="cotizado">Cotizado</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="ejecutado">Ejecutado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
                <button onClick={() => eliminar(c.id)} className="text-[9px] text-stone-400 hover:text-rose-600">Eliminar</button>
              </div>
            </div>
          </div>
        );
      })}

      {cambios.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
          <strong>Total cambios aprobados:</strong> ${cambios.filter(c => ["aprobado","ejecutado"].includes(c.estado)).reduce((s, c) => s + c.costoMM, 0)} MM adicionales sobre el precio base.
        </div>
      )}
    </div>
  );
};

export default InventarioComercial;
