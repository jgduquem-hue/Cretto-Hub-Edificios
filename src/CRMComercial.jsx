import React, { useState, useMemo, useEffect } from "react";
import {
  Users, MessageCircle, BarChart3, Wallet, Layers, Building, Plus, Search,
  Filter, ChevronDown, Phone, Mail, MessageSquare, Calendar, MapPin,
  TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle, Check,
  CheckCircle2, Clock, X, Edit3, Trash2, ArrowRight, Star, Flame, Send,
  FileText, Image as ImageIcon, Paperclip, Bell, BellRing, ExternalLink,
  PhoneCall, MoreVertical, Sparkles, Target, Megaphone, ShoppingBag, UserPlus
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, FunnelChart, Funnel, LabelList,
  AreaChart, Area, ComposedChart, RadialBarChart, RadialBar
} from "recharts";
import RecordatoriosCuota from "./RecordatoriosCuota.jsx";

/* ════════════════════════════════════════════════════════════════════════════
   CRM Comercial — Cretto Edificios
   Inspirado en HubSpot. Sub-módulos:
   1. Dashboard      — KPIs + gráficas en vivo
   2. Leads          — tabla + scoring + asignación a asesor
   3. Pipeline       — Kanban del embudo con drag-and-drop
   4. Conversaciones — WhatsApp Business (inbox compartido + templates)
   5. Clientes       — cerrados ganados, datos completos
   6. Cartera        — estado de pagos, mora, recordatorios automáticos
   7. Configuración  — fuentes, asesores, plantillas, automatizaciones
   ════════════════════════════════════════════════════════════════════════════ */

/* ─── Fases del embudo (estándar proyecto inmobiliario CO) ─── */
export const FASES_EMBUDO = [
  { id: "lead",         label: "Lead nuevo",            color: "stone",   pct: 0,   order: 1 },
  { id: "contactado",   label: "Contactado",            color: "sky",     pct: 10,  order: 2 },
  { id: "calificado",   label: "Calificado",            color: "blue",    pct: 20,  order: 3 },
  { id: "visita",       label: "Visita sala de ventas", color: "indigo",  pct: 35,  order: 4 },
  { id: "cotizacion",   label: "Cotización enviada",    color: "violet",  pct: 50,  order: 5 },
  { id: "negociacion",  label: "Negociación",           color: "fuchsia", pct: 65,  order: 6 },
  { id: "reserva",      label: "Reserva / Separación",  color: "amber",   pct: 80,  order: 7 },
  { id: "promesa",      label: "Promesa firmada",       color: "orange",  pct: 90,  order: 8 },
  { id: "cerrado",      label: "Escriturado",           color: "emerald", pct: 100, order: 9 },
  { id: "perdido",      label: "Perdido",               color: "rose",    pct: 0,   order: 99 }
];

/* ─── Fuentes de captación ─── */
export const FUENTES = [
  { id: "facebook",      label: "Facebook Ads",       icon: "📘", color: "#1877f2" },
  { id: "instagram",     label: "Instagram Ads",      icon: "📷", color: "#e4405f" },
  { id: "whatsapp",      label: "WhatsApp directo",   icon: "💬", color: "#25d366" },
  { id: "tiktok",        label: "TikTok Ads",         icon: "🎵", color: "#010101" },
  { id: "google",        label: "Google Ads",         icon: "🔍", color: "#4285f4" },
  { id: "sala-ventas",   label: "Sala de ventas",     icon: "🏢", color: "#10b981" },
  { id: "referido",      label: "Referido cliente",   icon: "🤝", color: "#a855f7" },
  { id: "inmobiliaria",  label: "Inmobiliaria/Tercero", icon: "🏘️", color: "#f59e0b" },
  { id: "portal",        label: "Portal inmobiliario", icon: "🌐", color: "#6366f1" },
  { id: "evento",        label: "Evento / Feria",     icon: "🎪", color: "#ec4899" },
  { id: "email",         label: "Email marketing",    icon: "📧", color: "#78716c" }
];

/* ─── Asesores (mock — luego se lee desde Stakeholders DB tipo "comercial") ─── */
const ASESORES_SEED = [
  { id: "PL",  nombre: "Paola Lima",       avatar: "PL", whatsapp: "+57 310 555 0001", color: "fuchsia" },
  { id: "JD",  nombre: "Jose Duque",       avatar: "JD", whatsapp: "+57 310 555 0002", color: "emerald" },
  { id: "MA",  nombre: "Maria Fernanda Arango", avatar: "MA", whatsapp: "+57 310 555 0003", color: "violet" }
];

/* ─── Leads seed Casa 107 (40 prospectos en diferentes fases) ─── */
const SEED_LEADS = [
  { id: 1, nombre: "Ricardo Patiño",        telefono: "+57 311 234 5678", email: "ricardo.p@gmail.com",    fuente: "facebook",     fase: "lead",        asesor: "PL", presupuestoMM: 850,  unidadInteres: null,  fechaCreacion: "2026-06-15", ultimoContacto: "2026-06-15", notas: "Interesado en aptos 1-3 piso bajo", score: 35 },
  { id: 2, nombre: "Carolina Vélez",        telefono: "+57 320 555 1234", email: "cvelez@hotmail.com",     fuente: "instagram",    fase: "contactado",  asesor: "PL", presupuestoMM: 1200, unidadInteres: null,  fechaCreacion: "2026-06-14", ultimoContacto: "2026-06-16", notas: "Pareja sin hijos, busca 2 alcobas", score: 55 },
  { id: 3, nombre: "Jorge Restrepo",        telefono: "+57 300 888 7766", email: "jorge.r@empresa.co",     fuente: "referido",     fase: "calificado",  asesor: "JD", presupuestoMM: 1500, unidadInteres: "204", fechaCreacion: "2026-06-10", ultimoContacto: "2026-06-16", notas: "Crédito pre-aprobado Bancolombia $1.200MM", score: 78 },
  { id: 4, nombre: "Familia Martínez",      telefono: "+57 315 444 3322", email: "andrea.m@yahoo.com",     fuente: "sala-ventas",  fase: "visita",      asesor: "PL", presupuestoMM: 1100, unidadInteres: "302", fechaCreacion: "2026-06-08", ultimoContacto: "2026-06-15", notas: "Visitaron 3 veces, hijos en colegio cercano", score: 82 },
  { id: 5, nombre: "Catalina Gómez",        telefono: "+57 312 111 2233", email: "cgomez.arq@gmail.com",   fuente: "instagram",    fase: "cotizacion",  asesor: "MA", presupuestoMM: 950,  unidadInteres: "405", fechaCreacion: "2026-06-05", ultimoContacto: "2026-06-14", notas: "Soltera, arquitecta. Le encanta el diseño", score: 75 },
  { id: 6, nombre: "Daniel & Sofía Ortiz",  telefono: "+57 318 999 0011", email: "daniel.ortiz@gmail.com", fuente: "facebook",     fase: "negociacion", asesor: "JD", presupuestoMM: 1400, unidadInteres: "501", fechaCreacion: "2026-05-28", ultimoContacto: "2026-06-16", notas: "Negociando descuento del 3%. Listos para firmar", score: 88 },
  { id: 7, nombre: "Luis Hernando Cano",    telefono: "+57 305 777 8899", email: "lhcano@empresa.com",     fuente: "referido",     fase: "reserva",     asesor: "PL", presupuestoMM: 1300, unidadInteres: "602", fechaCreacion: "2026-05-20", ultimoContacto: "2026-06-13", notas: "Pagó separación $20MM", score: 92 },
  { id: 8, nombre: "Andrea Ruiz",           telefono: "+57 314 222 5566", email: "aruiz@bancolombia.com.co", fuente: "whatsapp",   fase: "promesa",     asesor: "JD", presupuestoMM: 1600, unidadInteres: "701", fechaCreacion: "2026-05-15", ultimoContacto: "2026-06-12", notas: "Promesa firmada. Esperando crédito constructor", score: 95 },
  { id: 9, nombre: "Familia Gutiérrez",     telefono: "+57 316 333 4477", email: "egutierrez@gmail.com",   fuente: "sala-ventas",  fase: "cerrado",     asesor: "PL", presupuestoMM: 1200, unidadInteres: "402", fechaCreacion: "2026-04-10", ultimoContacto: "2026-06-01", notas: "ESCRITURADO. Cliente VIP", score: 100 },
  { id: 10, nombre: "Mauricio Vargas",      telefono: "+57 313 555 6677", email: "mvargas@outlook.com",    fuente: "google",       fase: "perdido",     asesor: "MA", presupuestoMM: 700,  unidadInteres: null,  fechaCreacion: "2026-05-30", ultimoContacto: "2026-06-08", notas: "Presupuesto insuficiente", score: 0 },
  /* Más leads para que el dashboard se vea poblado */
  { id: 11, nombre: "Patricia Mejía",       telefono: "+57 317 444 5555", email: "pmejia@gmail.com",       fuente: "instagram",    fase: "calificado",  asesor: "PL", presupuestoMM: 1050, unidadInteres: null,  fechaCreacion: "2026-06-12", ultimoContacto: "2026-06-15", notas: "Inversionista, busca rentabilidad", score: 72 },
  { id: 12, nombre: "Felipe Acosta",        telefono: "+57 319 666 7777", email: "facosta@empresa.co",     fuente: "portal",       fase: "visita",      asesor: "MA", presupuestoMM: 900,  unidadInteres: "203", fechaCreacion: "2026-06-11", ultimoContacto: "2026-06-15", notas: "Vino solo a visitar, pidió cotización", score: 68 },
  { id: 13, nombre: "Adriana Salazar",      telefono: "+57 321 888 9999", email: "asalazar@yahoo.com",     fuente: "referido",     fase: "cotizacion",  asesor: "JD", presupuestoMM: 1350, unidadInteres: "503", fechaCreacion: "2026-06-08", ultimoContacto: "2026-06-14", notas: "Referida por Familia Gutiérrez", score: 80 },
  { id: 14, nombre: "Carlos & Luisa Pinto", telefono: "+57 322 111 2222", email: "cpinto@gmail.com",       fuente: "tiktok",       fase: "lead",        asesor: "PL", presupuestoMM: 1000, unidadInteres: null,  fechaCreacion: "2026-06-16", ultimoContacto: "2026-06-16", notas: "Pareja joven, primer apartamento", score: 40 },
  { id: 15, nombre: "Mariana Cárdenas",     telefono: "+57 323 333 4444", email: "mcardenas@hotmail.com",  fuente: "whatsapp",     fase: "contactado",  asesor: "MA", presupuestoMM: 1150, unidadInteres: null,  fechaCreacion: "2026-06-13", ultimoContacto: "2026-06-15", notas: "Pidió enviar brochure", score: 50 },
  { id: 16, nombre: "Familia Rodríguez",    telefono: "+57 324 555 6666", email: "jrodriguez@gmail.com",   fuente: "facebook",     fase: "negociacion", asesor: "PL", presupuestoMM: 1700, unidadInteres: "801", fechaCreacion: "2026-05-25", ultimoContacto: "2026-06-16", notas: "Familia con 3 hijos, necesita penthouse", score: 87 },
  { id: 17, nombre: "Sandra Ospina",        telefono: "+57 325 777 8888", email: "sospina@empresa.com",    fuente: "sala-ventas",  fase: "reserva",     asesor: "JD", presupuestoMM: 1250, unidadInteres: "504", fechaCreacion: "2026-05-22", ultimoContacto: "2026-06-12", notas: "Pagó 10% como separación", score: 93 },
  { id: 18, nombre: "Roberto Cárdenas",     telefono: "+57 326 999 0000", email: "rcardenas@yahoo.com",    fuente: "google",       fase: "perdido",     asesor: "MA", presupuestoMM: 950,  unidadInteres: null,  fechaCreacion: "2026-05-18", ultimoContacto: "2026-06-02", notas: "Eligió competencia", score: 0 },
  { id: 19, nombre: "Liliana Mosquera",     telefono: "+57 327 222 3333", email: "lmosquera@gmail.com",    fuente: "referido",     fase: "cerrado",     asesor: "PL", presupuestoMM: 1100, unidadInteres: "304", fechaCreacion: "2026-04-15", ultimoContacto: "2026-06-05", notas: "ESCRITURADO en mayo", score: 100 },
  { id: 20, nombre: "Hernán Patarroyo",     telefono: "+57 328 444 5555", email: "hpatarroyo@empresa.co",  fuente: "instagram",    fase: "promesa",     asesor: "MA", presupuestoMM: 1450, unidadInteres: "603", fechaCreacion: "2026-05-20", ultimoContacto: "2026-06-14", notas: "Crédito en trámite Banco Davivienda", score: 94 }
];

/* ─── Mensajes WhatsApp seed ─── */
const SEED_MENSAJES = [
  { id: 1, leadId: 3, asesor: "JD", direccion: "out", texto: "Hola Jorge! Te comparto el brochure de Casa 107", fecha: "2026-06-16 09:30", leido: true },
  { id: 2, leadId: 3, asesor: "JD", direccion: "in",  texto: "Buenos días Jose, muchas gracias. ¿Tienen disponibilidad piso 2?", fecha: "2026-06-16 09:35", leido: true },
  { id: 3, leadId: 3, asesor: "JD", direccion: "out", texto: "Sí, tenemos el 204 (74 m², 2 alcobas, vista interior) y 207 (82 m², vista a la calle)", fecha: "2026-06-16 09:40", leido: true },
  { id: 4, leadId: 6, asesor: "JD", direccion: "in",  texto: "Hola, podemos cerrar mañana en $1.380MM?", fecha: "2026-06-16 14:20", leido: false },
  { id: 5, leadId: 8, asesor: "JD", direccion: "in",  texto: "Bancolombia me aprobó el crédito! Cuándo firmamos?", fecha: "2026-06-12 11:15", leido: true },
  { id: 6, leadId: 16, asesor: "PL", direccion: "in", texto: "Necesitamos un descuento del 5% para cerrar", fecha: "2026-06-16 16:45", leido: false }
];

/* ─── Plantillas WhatsApp ─── */
const PLANTILLAS_WSP = [
  { id: 1, titulo: "Saludo inicial", contenido: "¡Hola {nombre}! 👋 Soy {asesor} de Cretto. Vi que te interesa Casa 107. ¿Cuándo podemos agendar una visita?" },
  { id: 2, titulo: "Envío de brochure", contenido: "Hola {nombre}, te comparto el brochure de Casa 107 con todas las características del proyecto, plantas y acabados. Quedo atento(a) a tus comentarios." },
  { id: 3, titulo: "Confirmación visita", contenido: "Hola {nombre}, te confirmo tu visita a sala de ventas mañana a las {hora}. Dirección: Cra 7 # 107-23, parqueadero disponible. Te espero!" },
  { id: 4, titulo: "Cotización personalizada", contenido: "Hola {nombre}, te envío la cotización personalizada del apto {unidad}. Precio: ${precio}MM. Incluye opciones de financiación. Quedo atento(a)." },
  { id: 5, titulo: "Recordatorio pago cuota", contenido: "Hola {nombre}, te recordamos amablemente el pago de tu cuota mensual del apto {unidad} con vencimiento el {fecha}. Cualquier inquietud, estamos aquí." },
  { id: 6, titulo: "Felicitación firma", contenido: "¡Felicitaciones {nombre}! 🎉 Acabas de firmar la promesa de compraventa de tu apartamento. Bienvenido a la familia Cretto. Te enviaremos los próximos pasos." }
];

const fmtCop = (n) => "$" + Math.round(n / 1000000).toLocaleString("es-CO").replace(/,/g, ".") + " MM";

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════════════════════════════════════════ */
const CRMComercial = ({ project, stakeholders = [] }) => {
  const [tab, setTab] = useState("dashboard");
  const [leads, setLeads] = useState(SEED_LEADS);
  const [mensajes, setMensajes] = useState(SEED_MENSAJES);
  const [editingLead, setEditingLead] = useState(null);
  const [showNewLead, setShowNewLead] = useState(false);

  /* Persistencia */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r = await window.storage.get(`crettohub:crm-leads:${project?.id || "default"}`);
        if (m && r && r.value) setLeads(JSON.parse(r.value));
        const r2 = await window.storage.get(`crettohub:crm-mensajes:${project?.id || "default"}`);
        if (m && r2 && r2.value) setMensajes(JSON.parse(r2.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:crm-leads:${project?.id || "default"}`, JSON.stringify(leads)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [leads, project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:crm-mensajes:${project?.id || "default"}`, JSON.stringify(mensajes)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [mensajes, project?.id]);

  const updateLead = (id, patch) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  };
  const upsertLead = (lead) => {
    if (lead.id && leads.find(l => l.id === lead.id)) {
      updateLead(lead.id, lead);
    } else {
      const id = Math.max(0, ...leads.map(l => l.id)) + 1;
      setLeads(prev => [...prev, { ...lead, id, fechaCreacion: new Date().toISOString().slice(0, 10), ultimoContacto: new Date().toISOString().slice(0, 10), score: lead.score || 30 }]);
    }
    setShowNewLead(false);
    setEditingLead(null);
  };
  const deleteLead = (id) => {
    if (!confirm("¿Eliminar lead?")) return;
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const TABS = [
    { id: "dashboard",      label: "Dashboard",     icon: BarChart3 },
    { id: "leads",          label: "Leads",         icon: Users,  count: leads.filter(l => l.fase !== "cerrado" && l.fase !== "perdido").length },
    { id: "pipeline",       label: "Pipeline",      icon: Layers },
    { id: "conversaciones", label: "Conversaciones", icon: MessageCircle, count: mensajes.filter(m => !m.leido && m.direccion === "in").length },
    { id: "clientes",       label: "Clientes",      icon: CheckCircle2, count: leads.filter(l => l.fase === "cerrado").length },
    { id: "cartera",        label: "Cartera",       icon: Wallet },
    { id: "config",         label: "Configuración", icon: Activity }
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-6">
      {/* Header */}
      <header className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-fuchsia-600">CRM Comercial · {project?.nombre || ""}</div>
          <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Embudo de ventas e inversionistas</h1>
          <p className="mt-1 text-sm text-stone-500">
            {leads.length} leads en el sistema · {leads.filter(l => l.fase === "cerrado").length} cerrados ganados · {leads.filter(l => ["reserva","promesa"].includes(l.fase)).length} en cierre
          </p>
        </div>
        <button onClick={() => setShowNewLead(true)} className="inline-flex items-center gap-1.5 rounded-md bg-fuchsia-700 px-3 py-2 text-sm font-medium text-white hover:bg-fuchsia-800">
          <UserPlus className="h-4 w-4" /> Nuevo lead
        </button>
      </header>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-stone-200">
        {TABS.map(t => {
          const Ic = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-medium transition-all ${tab === t.id ? "border-fuchsia-600 text-fuchsia-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
              <Ic className="h-3.5 w-3.5" /> {t.label}
              {t.count != null && t.count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${tab === t.id ? "bg-fuchsia-100 text-fuchsia-800" : "bg-stone-200 text-stone-700"}`}>{t.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "dashboard"      && <DashboardView leads={leads} />}
      {tab === "leads"          && <LeadsView leads={leads} onEdit={setEditingLead} onDelete={deleteLead} onUpdate={updateLead} />}
      {tab === "pipeline"       && <PipelineKanban leads={leads} onUpdate={updateLead} onEdit={setEditingLead} />}
      {tab === "conversaciones" && <ConversacionesView leads={leads} mensajes={mensajes} setMensajes={setMensajes} />}
      {tab === "clientes"       && <ClientesView leads={leads} />}
      {tab === "cartera"        && <RecordatoriosCuota leads={leads} project={project} />}
      {tab === "config"         && <ConfigView />}

      {(showNewLead || editingLead) && (
        <LeadFormModal
          initial={editingLead}
          onClose={() => { setShowNewLead(false); setEditingLead(null); }}
          onSave={upsertLead}
        />
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   1) DASHBOARD — KPIs + gráficas
   ════════════════════════════════════════════════════════════════════════════ */
const DashboardView = ({ leads }) => {
  const total = leads.length;
  const activos = leads.filter(l => l.fase !== "cerrado" && l.fase !== "perdido").length;
  const cerrados = leads.filter(l => l.fase === "cerrado").length;
  const perdidos = leads.filter(l => l.fase === "perdido").length;
  const enCierre = leads.filter(l => ["reserva", "promesa"].includes(l.fase)).length;
  const tasaConversion = total > 0 ? (cerrados / total) * 100 : 0;
  const ventasTotalesMM = leads.filter(l => l.fase === "cerrado").reduce((s, l) => s + l.presupuestoMM, 0);
  const pipelineMM = leads.filter(l => !["cerrado", "perdido"].includes(l.fase)).reduce((s, l) => s + l.presupuestoMM * (FASES_EMBUDO.find(f => f.id === l.fase)?.pct || 0) / 100, 0);

  /* Embudo */
  const embudoData = FASES_EMBUDO.filter(f => f.id !== "perdido").map(f => ({
    name: f.label,
    value: leads.filter(l => l.fase === f.id).length,
    fill: { stone: "#a8a29e", sky: "#0ea5e9", blue: "#3b82f6", indigo: "#6366f1", violet: "#8b5cf6", fuchsia: "#d946ef", amber: "#f59e0b", orange: "#f97316", emerald: "#10b981" }[f.color]
  })).filter(x => x.value > 0);

  /* Por fuente */
  const porFuente = FUENTES.map(f => ({
    fuente: f.label,
    icon: f.icon,
    leads: leads.filter(l => l.fuente === f.id).length,
    cerrados: leads.filter(l => l.fuente === f.id && l.fase === "cerrado").length,
    fill: f.color
  })).filter(x => x.leads > 0).sort((a, b) => b.leads - a.leads);

  /* Por asesor */
  const porAsesor = ASESORES_SEED.map(a => {
    const ls = leads.filter(l => l.asesor === a.id);
    return {
      asesor: a.nombre,
      leads: ls.length,
      cerrados: ls.filter(l => l.fase === "cerrado").length,
      activos: ls.filter(l => !["cerrado", "perdido"].includes(l.fase)).length
    };
  });

  /* Evolución mensual (mock para visualización) */
  const evolucion = [
    { mes: "Mar", leads: 8,  cerrados: 0 },
    { mes: "Abr", leads: 12, cerrados: 1 },
    { mes: "May", leads: 18, cerrados: 1 },
    { mes: "Jun", leads: leads.filter(l => l.fechaCreacion.startsWith("2026-06")).length, cerrados: leads.filter(l => l.fase === "cerrado" && l.ultimoContacto.startsWith("2026-06")).length }
  ];

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <KpiCard label="Total leads" value={total} sub={`${activos} activos`} color="stone" icon={Users} />
        <KpiCard label="En cierre" value={enCierre} sub="Reserva + Promesa" color="amber" icon={Flame} />
        <KpiCard label="Cerrados" value={cerrados} sub="Escriturados" color="emerald" icon={CheckCircle2} />
        <KpiCard label="Tasa conversión" value={`${tasaConversion.toFixed(0)}%`} color="blue" icon={Target} />
        <KpiCard label="Ventas totales" value={fmtCop(ventasTotalesMM * 1000000)} color="fuchsia" icon={DollarSign} />
        <KpiCard label="Pipeline ponderado" value={fmtCop(pipelineMM * 1000000)} sub="proyección" color="violet" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Embudo */}
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Embudo de ventas</h3>
          <div className="space-y-1">
            {embudoData.map(f => {
              const maxV = Math.max(...embudoData.map(x => x.value));
              const pct = maxV > 0 ? (f.value / maxV) * 100 : 0;
              return (
                <div key={f.name} className="flex items-center gap-2">
                  <div className="w-44 truncate text-[11px] text-stone-700">{f.name}</div>
                  <div className="relative h-6 flex-1 overflow-hidden rounded bg-stone-100">
                    <div className="h-full rounded transition-all" style={{ width: `${pct}%`, backgroundColor: f.fill }} />
                  </div>
                  <div className="w-10 text-right text-[12px] font-mono font-semibold text-stone-800">{f.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fuentes */}
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Leads por fuente de captación</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={porFuente} dataKey="leads" nameKey="fuente" cx="50%" cy="50%" outerRadius={90} label={(d) => `${d.icon} ${d.leads}`}>
                {porFuente.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance asesor */}
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Performance por asesor</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={porAsesor}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="asesor" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="activos" fill="#a855f7" name="Activos" />
              <Bar dataKey="cerrados" fill="#10b981" name="Cerrados" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Evolución temporal */}
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Evolución comercial</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={evolucion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="leads" fill="#d946ef" name="Leads nuevos" />
              <Line type="monotone" dataKey="cerrados" stroke="#10b981" strokeWidth={2} name="Cerrados" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   2) LEADS — Tabla con scoring + filtros
   ════════════════════════════════════════════════════════════════════════════ */
const LeadsView = ({ leads, onEdit, onDelete, onUpdate }) => {
  const [filtroFase, setFiltroFase] = useState("all");
  const [filtroAsesor, setFiltroAsesor] = useState("all");
  const [filtroFuente, setFiltroFuente] = useState("all");
  const [query, setQuery] = useState("");

  const filtrados = leads.filter(l => {
    if (filtroFase !== "all" && l.fase !== filtroFase) return false;
    if (filtroAsesor !== "all" && l.asesor !== filtroAsesor) return false;
    if (filtroFuente !== "all" && l.fuente !== filtroFuente) return false;
    if (query && !`${l.nombre} ${l.telefono} ${l.email}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const getScoreColor = (s) => s >= 80 ? "bg-emerald-100 text-emerald-800" : s >= 60 ? "bg-amber-100 text-amber-800" : s >= 30 ? "bg-sky-100 text-sky-800" : "bg-stone-100 text-stone-700";

  return (
    <div className="space-y-3">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-stone-200 bg-white p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-stone-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre, teléfono, email…" className="w-full rounded-md border border-stone-300 bg-white py-1.5 pl-7 pr-2 text-[12px]" />
        </div>
        <select value={filtroFase} onChange={e => setFiltroFase(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-[12px]">
          <option value="all">Todas las fases</option>
          {FASES_EMBUDO.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
        <select value={filtroAsesor} onChange={e => setFiltroAsesor(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-[12px]">
          <option value="all">Todos los asesores</option>
          {ASESORES_SEED.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
        <select value={filtroFuente} onChange={e => setFiltroFuente(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-[12px]">
          <option value="all">Todas las fuentes</option>
          {FUENTES.map(f => <option key={f.id} value={f.id}>{f.icon} {f.label}</option>)}
        </select>
        <div className="text-[11px] text-stone-500">{filtrados.length} de {leads.length}</div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-3 py-2 text-left">Lead</th>
              <th className="px-3 py-2 text-left">Contacto</th>
              <th className="px-3 py-2 text-left">Fuente</th>
              <th className="px-3 py-2 text-left">Fase</th>
              <th className="px-3 py-2 text-center">Score</th>
              <th className="px-3 py-2 text-right">Presupuesto</th>
              <th className="px-3 py-2 text-left">Asesor</th>
              <th className="px-3 py-2 text-left">Últ. contacto</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={9} className="py-8 text-center text-[12px] italic text-stone-400">Sin leads que coincidan con los filtros</td></tr>
            )}
            {filtrados.map(l => {
              const fase = FASES_EMBUDO.find(f => f.id === l.fase);
              const fuente = FUENTES.find(f => f.id === l.fuente);
              const asesor = ASESORES_SEED.find(a => a.id === l.asesor);
              return (
                <tr key={l.id} className="border-t border-stone-100 hover:bg-stone-50/40">
                  <td className="px-3 py-2">
                    <button onClick={() => onEdit(l)} className="font-medium text-stone-900 hover:text-fuchsia-700">{l.nombre}</button>
                    {l.unidadInteres && <div className="text-[10px] text-stone-500">Apto {l.unidadInteres}</div>}
                  </td>
                  <td className="px-3 py-2 text-stone-700">
                    <div className="text-[11px]">{l.telefono}</div>
                    <div className="text-[10px] text-stone-500">{l.email}</div>
                  </td>
                  <td className="px-3 py-2"><span className="inline-flex items-center gap-1 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-700">{fuente?.icon} {fuente?.label}</span></td>
                  <td className="px-3 py-2">
                    <select value={l.fase} onChange={e => onUpdate(l.id, { fase: e.target.value })} className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold border-${fase?.color}-200 bg-${fase?.color}-50 text-${fase?.color}-800`}>
                      {FASES_EMBUDO.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`rounded-full px-2 py-0.5 font-bold ${getScoreColor(l.score)}`}>{l.score}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-stone-700">${l.presupuestoMM} MM</td>
                  <td className="px-3 py-2">
                    {asesor && <div className="inline-flex items-center gap-1"><span className={`flex h-5 w-5 items-center justify-center rounded-full bg-${asesor.color}-100 text-[9px] font-bold text-${asesor.color}-800`}>{asesor.avatar}</span><span className="text-[11px]">{asesor.nombre.split(" ")[0]}</span></div>}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-stone-600">{l.ultimoContacto}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <a href={`https://wa.me/${l.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-emerald-600 hover:bg-emerald-50" title="WhatsApp">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </a>
                      <button onClick={() => onEdit(l)} className="rounded p-1 text-stone-400 hover:bg-blue-50 hover:text-blue-600"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => onDelete(l.id)} className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
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
   3) PIPELINE KANBAN — drag-and-drop entre columnas
   ════════════════════════════════════════════════════════════════════════════ */
const PipelineKanban = ({ leads, onUpdate, onEdit }) => {
  const [draggedId, setDraggedId] = useState(null);

  const fasesEnEmbudo = FASES_EMBUDO.filter(f => f.id !== "perdido");

  const handleDrop = (e, faseId) => {
    e.preventDefault();
    if (draggedId) {
      onUpdate(draggedId, { fase: faseId });
      setDraggedId(null);
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {fasesEnEmbudo.map(fase => {
        const leadsEnFase = leads.filter(l => l.fase === fase.id);
        const totalMM = leadsEnFase.reduce((s, l) => s + l.presupuestoMM, 0);
        return (
          <div
            key={fase.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, fase.id)}
            className="w-72 flex-shrink-0 rounded-lg border border-stone-200 bg-stone-50/40 p-2"
          >
            <div className={`mb-2 rounded-md border border-${fase.color}-200 bg-${fase.color}-50 px-2 py-1.5`}>
              <div className={`text-[10px] font-bold uppercase text-${fase.color}-800`}>{fase.label}</div>
              <div className="flex items-center justify-between text-[10px] text-stone-600">
                <span>{leadsEnFase.length} leads</span>
                <span className="font-mono">${totalMM} MM</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {leadsEnFase.map(l => {
                const asesor = ASESORES_SEED.find(a => a.id === l.asesor);
                return (
                  <div
                    key={l.id}
                    draggable
                    onDragStart={() => setDraggedId(l.id)}
                    onClick={() => onEdit(l)}
                    className="cursor-pointer rounded-md border border-stone-200 bg-white p-2 hover:border-fuchsia-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-[12px] text-stone-900 truncate">{l.nombre}</div>
                      <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${l.score >= 80 ? "bg-emerald-100 text-emerald-800" : l.score >= 60 ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-600"}`}>{l.score}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-stone-500">${l.presupuestoMM} MM {l.unidadInteres && `· Apto ${l.unidadInteres}`}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-stone-500">{FUENTES.find(f => f.id === l.fuente)?.icon}</span>
                      {asesor && <span className={`flex h-4 w-4 items-center justify-center rounded-full bg-${asesor.color}-100 text-[8px] font-bold text-${asesor.color}-800`}>{asesor.avatar}</span>}
                    </div>
                  </div>
                );
              })}
              {leadsEnFase.length === 0 && (
                <div className="rounded-md border border-dashed border-stone-300 p-3 text-center text-[10px] italic text-stone-400">Arrastra leads aquí</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   4) CONVERSACIONES WhatsApp — inbox compartido estilo WA Business
   ════════════════════════════════════════════════════════════════════════════ */
const ConversacionesView = ({ leads, mensajes, setMensajes }) => {
  const [seleccionado, setSeleccionado] = useState(leads[0]?.id || null);
  const [nuevoMsg, setNuevoMsg] = useState("");
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false);
  const [asesorActivo, setAsesorActivo] = useState("PL");

  /* Por cada lead, último mensaje */
  const conversaciones = useMemo(() => {
    return leads.map(l => {
      const msgs = mensajes.filter(m => m.leadId === l.id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      const ultimo = msgs[0];
      const noLeidos = msgs.filter(m => !m.leido && m.direccion === "in").length;
      return { lead: l, ultimo, noLeidos };
    }).filter(c => c.ultimo).sort((a, b) => new Date(b.ultimo.fecha) - new Date(a.ultimo.fecha));
  }, [leads, mensajes]);

  const msgsDelSeleccionado = useMemo(() => {
    return mensajes.filter(m => m.leadId === seleccionado).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [mensajes, seleccionado]);

  const leadSeleccionado = leads.find(l => l.id === seleccionado);

  const enviar = (texto) => {
    if (!texto.trim() || !seleccionado) return;
    const id = Math.max(0, ...mensajes.map(m => m.id)) + 1;
    setMensajes(prev => [...prev, {
      id, leadId: seleccionado, asesor: asesorActivo, direccion: "out",
      texto, fecha: new Date().toISOString().slice(0, 16).replace("T", " "), leido: true
    }]);
    setNuevoMsg("");
  };

  const usarPlantilla = (plantilla) => {
    const texto = plantilla.contenido
      .replace("{nombre}", leadSeleccionado?.nombre?.split(" ")[0] || "")
      .replace("{asesor}", ASESORES_SEED.find(a => a.id === asesorActivo)?.nombre || "")
      .replace("{unidad}", leadSeleccionado?.unidadInteres || "")
      .replace("{precio}", leadSeleccionado?.presupuestoMM || "");
    setNuevoMsg(texto);
    setMostrarPlantillas(false);
  };

  const marcarLeidos = (leadId) => {
    setMensajes(prev => prev.map(m => m.leadId === leadId ? { ...m, leido: true } : m));
  };

  return (
    <div className="grid grid-cols-[300px_1fr] gap-3" style={{ height: "calc(100vh - 280px)" }}>
      {/* Lista conversaciones */}
      <div className="overflow-y-auto rounded-lg border border-stone-200 bg-white">
        <div className="border-b border-stone-200 bg-emerald-50 p-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900">
            <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Business · Inbox compartido
          </div>
          <div className="mt-1 text-[9px] text-emerald-700">{conversaciones.length} conversaciones · {conversaciones.reduce((s, c) => s + c.noLeidos, 0)} sin leer</div>
        </div>
        <div className="border-b border-stone-200 p-2">
          <select value={asesorActivo} onChange={e => setAsesorActivo(e.target.value)} className="w-full rounded border border-stone-300 px-2 py-1 text-[11px]">
            {ASESORES_SEED.map(a => <option key={a.id} value={a.id}>Atendiendo como: {a.nombre}</option>)}
          </select>
        </div>
        {conversaciones.map(({ lead, ultimo, noLeidos }) => (
          <button
            key={lead.id}
            onClick={() => { setSeleccionado(lead.id); marcarLeidos(lead.id); }}
            className={`flex w-full items-start gap-2 border-b border-stone-100 p-2 text-left hover:bg-stone-50 ${seleccionado === lead.id ? "bg-fuchsia-50" : ""}`}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
              {lead.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-[12px] font-medium text-stone-900">{lead.nombre}</span>
                <span className="text-[9px] text-stone-500">{ultimo?.fecha.split(" ")[1]?.slice(0, 5)}</span>
              </div>
              <div className="truncate text-[11px] text-stone-600">{ultimo?.direccion === "out" && "✓ "}{ultimo?.texto}</div>
            </div>
            {noLeidos > 0 && <span className="rounded-full bg-emerald-600 px-1.5 text-[9px] font-bold text-white">{noLeidos}</span>}
          </button>
        ))}
      </div>

      {/* Conversación seleccionada */}
      <div className="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white">
        {leadSeleccionado ? (
          <>
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                  {leadSeleccionado.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-medium text-stone-900">{leadSeleccionado.nombre}</div>
                  <div className="text-[10px] text-stone-500">{leadSeleccionado.telefono} · {FASES_EMBUDO.find(f => f.id === leadSeleccionado.fase)?.label}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <a href={`https://wa.me/${leadSeleccionado.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded-md border border-stone-300 bg-white px-2 py-1 text-[10px] text-stone-700 hover:bg-stone-50">
                  <ExternalLink className="inline h-3 w-3" /> Abrir WA
                </a>
                <a href={`tel:${leadSeleccionado.telefono}`} className="rounded-md border border-stone-300 bg-white px-2 py-1 text-[10px] text-stone-700 hover:bg-stone-50">
                  <PhoneCall className="inline h-3 w-3" /> Llamar
                </a>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto bg-stone-50/40 p-3" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\" viewBox=\"0 0 40 40\"%3E%3Cpath fill=\"%23e5e7eb\" fill-opacity=\"0.3\" d=\"M0 0h20v20H0V0zm20 20h20v20H20V20z\"/%3E%3C/svg%3E')" }}>
              {msgsDelSeleccionado.map(m => {
                const asesor = ASESORES_SEED.find(a => a.id === m.asesor);
                return (
                  <div key={m.id} className={`flex ${m.direccion === "out" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-lg px-3 py-1.5 shadow-sm ${m.direccion === "out" ? "bg-emerald-100 text-emerald-900" : "bg-white text-stone-900"}`}>
                      {m.direccion === "out" && asesor && <div className={`mb-0.5 text-[9px] font-bold text-${asesor.color}-700`}>{asesor.nombre}</div>}
                      <div className="text-[12px] whitespace-pre-wrap">{m.texto}</div>
                      <div className="mt-0.5 text-right text-[9px] text-stone-500">{m.fecha.split(" ")[1]?.slice(0, 5)} {m.direccion === "out" && (m.leido ? "✓✓" : "✓")}</div>
                    </div>
                  </div>
                );
              })}
              {msgsDelSeleccionado.length === 0 && (
                <div className="py-6 text-center text-[11px] italic text-stone-400">Sin mensajes. Envía el primero con una plantilla.</div>
              )}
            </div>

            {mostrarPlantillas && (
              <div className="border-t border-stone-200 bg-stone-100 p-2 max-h-40 overflow-y-auto">
                <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-stone-700">
                  <span>Plantillas WhatsApp</span>
                  <button onClick={() => setMostrarPlantillas(false)} className="text-stone-400 hover:text-stone-700"><X className="h-3 w-3" /></button>
                </div>
                {PLANTILLAS_WSP.map(p => (
                  <button key={p.id} onClick={() => usarPlantilla(p)} className="block w-full rounded border border-stone-200 bg-white p-2 text-left text-[11px] mb-1 hover:bg-emerald-50">
                    <div className="font-semibold text-stone-800">{p.titulo}</div>
                    <div className="text-stone-600 line-clamp-2">{p.contenido}</div>
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-stone-200 bg-white p-2">
              <div className="flex items-end gap-1">
                <button onClick={() => setMostrarPlantillas(!mostrarPlantillas)} className="rounded p-1.5 text-stone-500 hover:bg-stone-100" title="Plantillas">
                  <FileText className="h-4 w-4" />
                </button>
                <button className="rounded p-1.5 text-stone-500 hover:bg-stone-100" title="Adjuntar"><Paperclip className="h-4 w-4" /></button>
                <textarea
                  value={nuevoMsg}
                  onChange={e => setNuevoMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(nuevoMsg); } }}
                  placeholder="Escribe un mensaje…"
                  rows={1}
                  className="flex-1 resize-none rounded-md border border-stone-300 px-3 py-1.5 text-[12px] focus:border-emerald-500 focus:outline-none"
                />
                <button onClick={() => enviar(nuevoMsg)} disabled={!nuevoMsg.trim()} className="rounded-md bg-emerald-600 p-2 text-white hover:bg-emerald-700 disabled:opacity-40">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-[12px] italic text-stone-400">Selecciona una conversación</div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   5) CLIENTES — cerrados ganados
   ════════════════════════════════════════════════════════════════════════════ */
const ClientesView = ({ leads }) => {
  const clientes = leads.filter(l => l.fase === "cerrado");
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Clientes escriturados" value={clientes.length} color="emerald" icon={CheckCircle2} />
        <KpiCard label="Ventas totales" value={fmtCop(clientes.reduce((s, c) => s + c.presupuestoMM, 0) * 1000000)} color="fuchsia" icon={DollarSign} />
        <KpiCard label="Ticket promedio" value={clientes.length ? fmtCop(clientes.reduce((s, c) => s + c.presupuestoMM, 0) * 1000000 / clientes.length) : "—"} color="violet" icon={TrendingUp} />
      </div>
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-stone-50 text-[10px] uppercase text-stone-500">
            <tr><th className="px-3 py-2 text-left">Cliente</th><th className="px-3 py-2 text-left">Apto</th><th className="px-3 py-2 text-right">Valor</th><th className="px-3 py-2 text-left">Asesor</th><th className="px-3 py-2 text-left">Contacto</th></tr>
          </thead>
          <tbody>
            {clientes.map(c => {
              const asesor = ASESORES_SEED.find(a => a.id === c.asesor);
              return (
                <tr key={c.id} className="border-t border-stone-100">
                  <td className="px-3 py-2 font-medium">{c.nombre}</td>
                  <td className="px-3 py-2">{c.unidadInteres || "—"}</td>
                  <td className="px-3 py-2 text-right font-mono">${c.presupuestoMM} MM</td>
                  <td className="px-3 py-2 text-[11px]">{asesor?.nombre}</td>
                  <td className="px-3 py-2 text-[11px] text-stone-600">{c.telefono}</td>
                </tr>
              );
            })}
            {clientes.length === 0 && <tr><td colSpan={5} className="py-6 text-center italic text-stone-400">Sin clientes escriturados aún</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   6) CARTERA — recordatorios automáticos de pago
   ════════════════════════════════════════════════════════════════════════════ */
const CarteraView = ({ leads }) => {
  /* Mock: clientes con cuotas mensuales */
  const enCartera = leads.filter(l => ["reserva", "promesa", "cerrado"].includes(l.fase));
  const seedCuotas = enCartera.map((l, i) => ({
    leadId: l.id,
    nombre: l.nombre,
    unidad: l.unidadInteres,
    valorCuotaMM: Math.round(l.presupuestoMM * 0.006), // ~0.6% mensual cuota inicial
    fechaProxPago: new Date(2026, 5, 20 + (i % 10)).toISOString().slice(0, 10),
    diasMora: i % 3 === 0 ? Math.floor(Math.random() * 15) : 0,
    estado: i % 5 === 0 ? "vencido" : i % 3 === 0 ? "proximo" : "al-dia"
  }));

  const enMora = seedCuotas.filter(c => c.estado === "vencido");
  const proximos = seedCuotas.filter(c => c.estado === "proximo");
  const totalMoraMM = enMora.reduce((s, c) => s + c.valorCuotaMM, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Clientes en cartera" value={enCartera.length} color="violet" icon={Users} />
        <KpiCard label="Próximos pagos" value={proximos.length} sub="próximos 5 días" color="amber" icon={Clock} />
        <KpiCard label="En mora" value={enMora.length} sub={fmtCop(totalMoraMM * 1000000)} color="rose" icon={AlertCircle} />
        <KpiCard label="Recordatorios programados" value={seedCuotas.length} color="emerald" icon={BellRing} />
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3 text-[12px] text-amber-900">
        <strong>📲 Recordatorios automáticos:</strong> Casa 107 envía un WhatsApp 3 días antes del vencimiento de la cuota,
        otro el día del pago, y uno cada 7 días si entra en mora. Las plantillas se editan en Configuración.
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-stone-50 text-[10px] uppercase text-stone-500">
            <tr>
              <th className="px-3 py-2 text-left">Cliente</th>
              <th className="px-3 py-2 text-left">Apto</th>
              <th className="px-3 py-2 text-right">Cuota mensual</th>
              <th className="px-3 py-2 text-left">Próx. pago</th>
              <th className="px-3 py-2 text-center">Mora</th>
              <th className="px-3 py-2 text-center">Estado</th>
              <th className="px-3 py-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {seedCuotas.map(c => (
              <tr key={c.leadId} className="border-t border-stone-100">
                <td className="px-3 py-2 font-medium">{c.nombre}</td>
                <td className="px-3 py-2 text-[11px]">{c.unidad || "—"}</td>
                <td className="px-3 py-2 text-right font-mono">${c.valorCuotaMM} MM</td>
                <td className="px-3 py-2 text-[11px]">{c.fechaProxPago}</td>
                <td className="px-3 py-2 text-center">{c.diasMora > 0 ? <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">{c.diasMora} días</span> : "—"}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.estado === "al-dia" ? "bg-emerald-100 text-emerald-800" : c.estado === "proximo" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                    {c.estado === "al-dia" ? "✓ Al día" : c.estado === "proximo" ? "⏰ Próximo" : "⚠ Vencido"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-800 hover:bg-emerald-100">
                    <Send className="h-3 w-3" /> Recordatorio
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   7) CONFIG — fuentes, asesores, plantillas, automatizaciones
   ════════════════════════════════════════════════════════════════════════════ */
const ConfigView = () => (
  <div className="space-y-4">
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h3 className="mb-2 font-serif text-base">Asesores comerciales</h3>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {ASESORES_SEED.map(a => (
          <div key={a.id} className={`flex items-center gap-2 rounded-md border border-${a.color}-200 bg-${a.color}-50/50 p-2`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-${a.color}-100 font-bold text-${a.color}-800`}>{a.avatar}</div>
            <div className="flex-1">
              <div className="text-[12px] font-medium">{a.nombre}</div>
              <div className="text-[10px] text-stone-500">{a.whatsapp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h3 className="mb-2 font-serif text-base">Fuentes de captación</h3>
      <div className="flex flex-wrap gap-1.5">
        {FUENTES.map(f => (
          <span key={f.id} className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-2 py-1 text-[11px]" style={{ borderColor: f.color + "44" }}>
            <span>{f.icon}</span> {f.label}
          </span>
        ))}
      </div>
    </div>

    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h3 className="mb-2 font-serif text-base">Plantillas WhatsApp</h3>
      <div className="space-y-1.5">
        {PLANTILLAS_WSP.map(p => (
          <div key={p.id} className="rounded-md border border-stone-200 p-2">
            <div className="text-[11px] font-semibold">{p.titulo}</div>
            <div className="mt-0.5 text-[11px] text-stone-600">{p.contenido}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-[12px] text-amber-900">
      <strong>🔌 Integración WhatsApp Business API:</strong> para enviar/recibir mensajes reales, se requiere conectar
      WhatsApp Business API (Meta Cloud API) — gratis hasta 1000 conversaciones/mes. Se conecta con número Cretto +
      bot que distribuye mensajes a los asesores. Lo iremos integrando en el siguiente paso.
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   MODAL: Crear/Editar Lead
   ════════════════════════════════════════════════════════════════════════════ */
const LeadFormModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || {
    nombre: "", telefono: "", email: "", fuente: "facebook", fase: "lead", asesor: "PL",
    presupuestoMM: 1000, unidadInteres: "", notas: "", score: 30
  });

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-serif text-base">{initial ? "Editar lead" : "Nuevo lead"}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="grid grid-cols-2 gap-3 p-4">
          <Field label="Nombre completo" required>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="inp" placeholder="Nombre y apellido" />
          </Field>
          <Field label="Teléfono / WhatsApp">
            <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="inp" placeholder="+57 …" />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="inp" placeholder="email@..." type="email" />
          </Field>
          <Field label="Apto de interés">
            <input value={form.unidadInteres || ""} onChange={e => setForm({ ...form, unidadInteres: e.target.value })} className="inp" placeholder="Ej. 302" />
          </Field>
          <Field label="Fuente">
            <select value={form.fuente} onChange={e => setForm({ ...form, fuente: e.target.value })} className="inp">
              {FUENTES.map(f => <option key={f.id} value={f.id}>{f.icon} {f.label}</option>)}
            </select>
          </Field>
          <Field label="Fase del embudo">
            <select value={form.fase} onChange={e => setForm({ ...form, fase: e.target.value })} className="inp">
              {FASES_EMBUDO.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </Field>
          <Field label="Asesor asignado">
            <select value={form.asesor} onChange={e => setForm({ ...form, asesor: e.target.value })} className="inp">
              {ASESORES_SEED.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </Field>
          <Field label="Presupuesto (MM)">
            <input type="number" value={form.presupuestoMM} onChange={e => setForm({ ...form, presupuestoMM: parseInt(e.target.value) || 0 })} className="inp" />
          </Field>
          <Field label="Lead score (0-100)">
            <input type="range" min="0" max="100" value={form.score} onChange={e => setForm({ ...form, score: parseInt(e.target.value) })} className="w-full" />
            <div className="text-right text-[11px] font-mono">{form.score}</div>
          </Field>
          <div className="col-span-2">
            <Field label="Notas">
              <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} rows={3} className="inp" placeholder="Observaciones del seguimiento…" />
            </Field>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
          <button onClick={onClose} className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px]">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!form.nombre.trim()} className="rounded-md bg-fuchsia-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-fuchsia-800 disabled:opacity-40">
            Guardar
          </button>
        </footer>
        <style>{`.inp{width:100%;border:1px solid rgb(214,211,209);background:#fff;padding:6px 10px;font-size:13px;border-radius:6px}.inp:focus{outline:none;border-color:rgb(217,70,239);box-shadow:0 0 0 1px rgb(217,70,239)}`}</style>
      </div>
    </div>
  );
};

/* ─── Auxiliares ─── */
const KpiCard = ({ label, value, sub, color = "stone", icon: Icon }) => {
  const colors = {
    stone: "bg-stone-50 border-stone-200 text-stone-800",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    rose: "bg-rose-50 border-rose-200 text-rose-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    fuchsia: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800",
    violet: "bg-violet-50 border-violet-200 text-violet-800"
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div className="text-[9px] uppercase tracking-wider opacity-80">{label}</div>
        {Icon && <Icon className="h-3.5 w-3.5 opacity-60" />}
      </div>
      <div className="mt-1 font-serif text-lg font-semibold">{value}</div>
      {sub && <div className="text-[9px] opacity-70">{sub}</div>}
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-stone-600">
      {label} {required && <span className="text-rose-600">*</span>}
    </span>
    {children}
  </label>
);

export default CRMComercial;
