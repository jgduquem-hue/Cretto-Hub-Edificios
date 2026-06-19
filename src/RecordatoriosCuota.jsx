import React, { useState, useMemo, useEffect } from "react";
import {
  Bell, BellRing, AlertCircle, CheckCircle2, Clock, MessageSquare,
  Send, Settings, History, Wallet, ChevronRight, Copy, ExternalLink,
  Edit3, Save, X, Plus, Trash2, Calendar, AlertTriangle, Zap, Bot,
  TrendingUp, ArrowRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

/* ════════════════════════════════════════════════════════════════════════════
   Recordatorios de Cuota — Cretto Comercial
   - Alertas visibles por severidad
   - Botón manual "Enviar por WhatsApp" (wa.me)
   - Log de recordatorios enviados
   - Plantillas editables por nivel
   - Configuración del bot (stub para Meta Cloud API)
   ════════════════════════════════════════════════════════════════════════════ */

/* ─── Niveles de severidad ─── */
const NIVELES = [
  { id: "proximo",      label: "Próximo vencimiento",  diasMin: -5,  diasMax: -1, color: "blue",    icon: "🔔", bgClass: "bg-blue-50 border-blue-300 text-blue-900" },
  { id: "hoy",          label: "Vence hoy",             diasMin: 0,   diasMax: 0,  color: "amber",   icon: "⏰", bgClass: "bg-amber-50 border-amber-400 text-amber-900" },
  { id: "mora-leve",    label: "Mora reciente (1-7d)", diasMin: 1,   diasMax: 7,  color: "orange",  icon: "⚠️", bgClass: "bg-orange-100 border-orange-400 text-orange-900" },
  { id: "mora-media",   label: "Mora media (8-15d)",   diasMin: 8,   diasMax: 15, color: "rose",    icon: "🚨", bgClass: "bg-rose-100 border-rose-400 text-rose-900" },
  { id: "mora-alta",    label: "Mora alta (16+d)",     diasMin: 16,  diasMax: 999, color: "red",    icon: "🔥", bgClass: "bg-red-100 border-red-500 text-red-900" }
];

/* ─── Plantillas WhatsApp por nivel ─── */
const PLANTILLAS_DEFAULT = {
  proximo:    "Hola {nombre}! 👋 Te recordamos amablemente que el {fecha} vence la cuota #{numero} por ${monto} MM del apto {unidad}. Si ya pagaste, puedes ignorar este mensaje. Cualquier inquietud, estamos aquí. — Cretto Casa 107",
  hoy:        "Hola {nombre}, hoy ({fecha}) es el día del vencimiento de tu cuota #{numero} por ${monto} MM del apto {unidad}. Confirma tu pago para mantener tu compra al día. — Cretto Casa 107",
  "mora-leve":  "Hola {nombre}, tu cuota #{numero} por ${monto} MM venció el {fecha} ({diasMora} días). Por favor regulariza el pago lo antes posible. Si tienes alguna dificultad, llámanos al {telefonoAsesor}. — Cretto Casa 107",
  "mora-media": "Hola {nombre}, importante: tu cuota #{numero} lleva {diasMora} días en mora (${monto} MM, vencimiento {fecha}). El cargo por mora se está acumulando. Por favor contáctanos hoy para coordinar el pago. — Paola, Cretto Casa 107",
  "mora-alta":  "URGENTE {nombre}: tu cuota #{numero} tiene {diasMora} días en mora (${monto} MM). Necesitamos hablar contigo HOY para evitar inicio de gestión legal sobre el apto {unidad}. Te esperamos al WhatsApp +57 310 555 0001."
};

/* Calcula días entre dos fechas (positivo = a vence ha pasado) */
const diasEntreFechas = (fechaVence) => {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fechaVence); venc.setHours(0, 0, 0, 0);
  return Math.round((hoy - venc) / (1000 * 60 * 60 * 24));
};

const getNivel = (diasMora) => {
  for (const n of NIVELES) {
    if (diasMora >= n.diasMin && diasMora <= n.diasMax) return n;
  }
  return null;
};

const formatFecha = (iso) => new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const fmtMM = (n) => `$${n.toFixed(1)} MM`;

/* ════════════════════════════════════════════════════════════════════════════
   Generación de cuotas a partir de leads en cartera (reserva, promesa, cerrado)
   - Cada lead tiene cronograma simulado de 18 cuotas mensuales (cuota inicial)
   - El día del corte depende del id del lead para variación realista
   ════════════════════════════════════════════════════════════════════════════ */
const generarCuotas = (leads) => {
  const enCartera = leads.filter(l => ["reserva", "promesa", "cerrado"].includes(l.fase));
  const cuotas = [];
  enCartera.forEach(lead => {
    const numCuotas = 18;
    const cuotaInicial = lead.presupuestoMM * 0.3;
    const cuotaMensual = cuotaInicial / numCuotas;
    const dia = ((lead.id * 3) % 28) + 1;
    const inicioMes = new Date(2026, 0, dia);
    for (let i = 1; i <= numCuotas; i++) {
      const fechaVence = new Date(inicioMes);
      fechaVence.setMonth(fechaVence.getMonth() + i - 1);
      const isoFecha = fechaVence.toISOString().slice(0, 10);
      const diasMora = diasEntreFechas(isoFecha);
      const nivel = getNivel(diasMora);
      /* Asumir que las cuotas ANTES del mes actual están pagadas (a menos que estén en mora) */
      const pagadaPorDefecto = diasMora > 5; // las muy viejas se asumen pagadas
      cuotas.push({
        id: `${lead.id}-${i}`,
        leadId: lead.id,
        lead,
        numero: i,
        fechaVence: isoFecha,
        montoMM: cuotaMensual,
        diasMora,
        nivel,
        estado: pagadaPorDefecto && diasMora > 8 ? "pagada" : "pendiente"
      });
    }
  });
  return cuotas;
};

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════════════════════════════════════════ */
const RecordatoriosCuota = ({ leads = [], project }) => {
  const [tab, setTab] = useState("alertas");
  const [plantillas, setPlantillas] = useState(PLANTILLAS_DEFAULT);
  const [historial, setHistorial] = useState([]);
  const [config, setConfig] = useState({
    automatizado: false,
    avisoAntes: 3,
    avisoVencimiento: true,
    diasReintentoMora: [1, 7, 14, 21],
    telefonoEnvio: "+57 310 555 0001",
    asesor: "Paola Lima"
  });
  const [editandoPlantilla, setEditandoPlantilla] = useState(null);

  /* Persistencia */
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const r1 = await window.storage.get(`crettohub:recordatorios-plantillas:${project?.id || "default"}`);
        if (m && r1 && r1.value) setPlantillas(JSON.parse(r1.value));
        const r2 = await window.storage.get(`crettohub:recordatorios-historial:${project?.id || "default"}`);
        if (m && r2 && r2.value) setHistorial(JSON.parse(r2.value));
        const r3 = await window.storage.get(`crettohub:recordatorios-config:${project?.id || "default"}`);
        if (m && r3 && r3.value) setConfig(JSON.parse(r3.value));
      } catch {}
    })();
    return () => { m = false; };
  }, [project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:recordatorios-plantillas:${project?.id || "default"}`, JSON.stringify(plantillas)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [plantillas, project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:recordatorios-historial:${project?.id || "default"}`, JSON.stringify(historial)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [historial, project?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set(`crettohub:recordatorios-config:${project?.id || "default"}`, JSON.stringify(config)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [config, project?.id]);

  const cuotas = useMemo(() => generarCuotas(leads), [leads]);

  /* Solo las cuotas que NECESITAN acción (pendientes con nivel = próximo/hoy/mora) */
  const alertasActivas = useMemo(
    () => cuotas.filter(c => c.estado === "pendiente" && c.nivel),
    [cuotas]
  );

  /* KPIs */
  const kpis = useMemo(() => {
    const porNivel = {};
    NIVELES.forEach(n => { porNivel[n.id] = alertasActivas.filter(c => c.nivel.id === n.id).length; });
    const totalMora = alertasActivas.filter(c => c.diasMora > 0).reduce((s, c) => s + c.montoMM, 0);
    const totalProximo = alertasActivas.filter(c => c.diasMora < 0).reduce((s, c) => s + c.montoMM, 0);
    return { porNivel, totalMora, totalProximo, totalAlertas: alertasActivas.length };
  }, [alertasActivas]);

  const enviarRecordatorio = (cuota) => {
    const nivel = cuota.nivel.id;
    const plantilla = plantillas[nivel];
    const texto = plantilla
      .replace("{nombre}", cuota.lead.nombre.split(" ")[0])
      .replace("{numero}", cuota.numero)
      .replace("{fecha}", formatFecha(cuota.fechaVence))
      .replace(/\{monto\}/g, cuota.montoMM.toFixed(1))
      .replace("{unidad}", cuota.lead.unidadInteres || "—")
      .replace("{diasMora}", Math.abs(cuota.diasMora))
      .replace("{telefonoAsesor}", config.telefonoEnvio);

    const telefono = cuota.lead.telefono?.replace(/\D/g, "") || "";
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    /* Log al historial */
    setHistorial(prev => [{
      id: Date.now(),
      fecha: new Date().toISOString(),
      cuotaId: cuota.id,
      leadId: cuota.leadId,
      leadNombre: cuota.lead.nombre,
      cuotaNumero: cuota.numero,
      nivel: nivel,
      monto: cuota.montoMM,
      texto: texto.slice(0, 200),
      canal: "WhatsApp manual"
    }, ...prev].slice(0, 200));
  };

  const copiarTexto = (cuota) => {
    const nivel = cuota.nivel.id;
    const plantilla = plantillas[nivel];
    const texto = plantilla
      .replace("{nombre}", cuota.lead.nombre.split(" ")[0])
      .replace("{numero}", cuota.numero)
      .replace("{fecha}", formatFecha(cuota.fechaVence))
      .replace(/\{monto\}/g, cuota.montoMM.toFixed(1))
      .replace("{unidad}", cuota.lead.unidadInteres || "—")
      .replace("{diasMora}", Math.abs(cuota.diasMora))
      .replace("{telefonoAsesor}", config.telefonoEnvio);
    navigator.clipboard?.writeText(texto);
  };

  const marcarPagada = (cuota) => {
    setHistorial(prev => [{
      id: Date.now(),
      fecha: new Date().toISOString(),
      cuotaId: cuota.id,
      leadId: cuota.leadId,
      leadNombre: cuota.lead.nombre,
      cuotaNumero: cuota.numero,
      nivel: "pago",
      monto: cuota.montoMM,
      texto: "Pago marcado como recibido",
      canal: "manual"
    }, ...prev].slice(0, 200));
  };

  const TABS = [
    { id: "alertas",   label: "Alertas activas", icon: BellRing, count: kpis.totalAlertas },
    { id: "proximas",  label: "Cuotas próximas", icon: Calendar },
    { id: "plantillas", label: "Plantillas WhatsApp", icon: Edit3 },
    { id: "bot",        label: "Bot WhatsApp", icon: Bot, badge: "EN CONSTRUCCIÓN" },
    { id: "historial",  label: "Historial", icon: History, count: historial.length }
  ];

  return (
    <div className="space-y-4">
      {/* KPI panel con bell badge */}
      <div className="rounded-lg border border-stone-200 bg-gradient-to-r from-pink-50 via-rose-50 to-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative">
                <BellRing className="h-6 w-6 text-rose-700" />
                {kpis.totalAlertas > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">{kpis.totalAlertas}</span>
                )}
              </span>
              <h2 className="font-serif text-lg text-stone-900">Centro de alertas de cartera</h2>
            </div>
            <p className="mt-1 text-[12px] text-stone-600">
              {kpis.totalAlertas} cuotas requieren tu atención · {fmtMM(kpis.totalMora)} en mora · {fmtMM(kpis.totalProximo)} por vencer
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
          {NIVELES.map(n => (
            <div key={n.id} className={`rounded-md border p-2 text-center ${n.bgClass}`}>
              <div className="text-base">{n.icon}</div>
              <div className="font-serif text-xl font-bold">{kpis.porNivel[n.id] || 0}</div>
              <div className="text-[9px] leading-tight font-semibold opacity-80">{n.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-stone-200">
        {TABS.map(t => {
          const Ic = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-medium ${tab === t.id ? "border-rose-600 text-rose-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
              <Ic className="h-3.5 w-3.5" /> {t.label}
              {t.count != null && t.count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${tab === t.id ? "bg-rose-100 text-rose-800" : "bg-stone-200 text-stone-700"}`}>{t.count}</span>
              )}
              {t.badge && <span className="rounded bg-amber-200 px-1 py-0.5 text-[8px] font-bold uppercase text-amber-900">{t.badge}</span>}
            </button>
          );
        })}
      </div>

      {tab === "alertas" && <AlertasTab cuotas={alertasActivas} onEnviar={enviarRecordatorio} onCopiar={copiarTexto} onPagar={marcarPagada} />}
      {tab === "proximas" && <ProximasTab cuotas={cuotas} />}
      {tab === "plantillas" && <PlantillasTab plantillas={plantillas} setPlantillas={setPlantillas} editando={editandoPlantilla} setEditando={setEditandoPlantilla} />}
      {tab === "bot" && <BotTab config={config} setConfig={setConfig} plantillas={plantillas} />}
      {tab === "historial" && <HistorialTab historial={historial} />}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   TAB: ALERTAS ACTIVAS
   ════════════════════════════════════════════════════════════════════════════ */
const AlertasTab = ({ cuotas, onEnviar, onCopiar, onPagar }) => {
  const ordenadas = [...cuotas].sort((a, b) => b.diasMora - a.diasMora);

  if (ordenadas.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-12 text-center">
        <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-600" />
        <div className="font-serif text-lg text-emerald-900">Todo al día 🎉</div>
        <div className="text-[12px] text-emerald-700">No hay cuotas vencidas ni próximas a vencer.</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ordenadas.map(c => (
        <div key={c.id} className={`rounded-lg border-l-4 bg-white p-3 shadow-sm border border-stone-200 ${c.nivel?.bgClass.split(" ").find(s => s.startsWith("border-")) || "border-stone-300"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{c.nivel?.icon}</span>
                <span className="font-medium text-stone-900">{c.lead.nombre}</span>
                <span className="text-[10px] text-stone-500">· Apto {c.lead.unidadInteres || "—"}</span>
                <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${c.nivel?.bgClass}`}>{c.nivel?.label}</span>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-2 text-[11px] text-stone-600 md:grid-cols-5">
                <div>Cuota #{c.numero}</div>
                <div>Vence: {formatFecha(c.fechaVence)}</div>
                <div className="font-mono font-semibold text-stone-800">{fmtMM(c.montoMM)}</div>
                <div>{c.diasMora > 0 ? `🔴 ${c.diasMora}d en mora` : c.diasMora === 0 ? "🟡 Hoy" : `🟢 En ${Math.abs(c.diasMora)}d`}</div>
                <div className="text-stone-500">{c.lead.telefono}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onEnviar(c)}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
                title="Abre WhatsApp con plantilla pre-llenada"
              >
                <MessageSquare className="h-3 w-3" /> Enviar
              </button>
              <button
                onClick={() => onCopiar(c)}
                className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-[10px] text-stone-700 hover:bg-stone-50"
                title="Copiar texto al portapapeles"
              >
                <Copy className="h-3 w-3" /> Copiar
              </button>
              <button
                onClick={() => onPagar(c)}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700 hover:bg-emerald-100"
                title="Marcar como pagada (registra en historial)"
              >
                <CheckCircle2 className="h-3 w-3" /> Pagada
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   TAB: CUOTAS PRÓXIMAS (todas las próximas no vencidas)
   ════════════════════════════════════════════════════════════════════════════ */
const ProximasTab = ({ cuotas }) => {
  const futuras = cuotas
    .filter(c => c.estado === "pendiente" && c.diasMora < -5)
    .sort((a, b) => a.diasMora - b.diasMora)
    .slice(0, 30);

  /* Proyección recaudo próximos 30/60/90 días */
  const proyeccion = (rango) => cuotas
    .filter(c => c.estado === "pendiente" && c.diasMora >= -rango && c.diasMora <= 0)
    .reduce((s, c) => s + c.montoMM, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <div className="text-[9px] uppercase text-emerald-800">Próximos 30 días</div>
          <div className="font-mono text-lg font-bold text-emerald-900">{fmtMM(proyeccion(30))}</div>
        </div>
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
          <div className="text-[9px] uppercase text-blue-800">Próximos 60 días</div>
          <div className="font-mono text-lg font-bold text-blue-900">{fmtMM(proyeccion(60))}</div>
        </div>
        <div className="rounded-md border border-violet-200 bg-violet-50 p-3">
          <div className="text-[9px] uppercase text-violet-800">Próximos 90 días</div>
          <div className="font-mono text-lg font-bold text-violet-900">{fmtMM(proyeccion(90))}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-[11px]">
          <thead className="bg-stone-50 text-[9px] uppercase text-stone-500">
            <tr>
              <th className="px-3 py-2 text-left">Cliente</th>
              <th className="px-3 py-2 text-left">Apto</th>
              <th className="px-3 py-2 text-center">Cuota</th>
              <th className="px-3 py-2 text-left">Vence</th>
              <th className="px-3 py-2 text-center">En</th>
              <th className="px-3 py-2 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {futuras.map(c => (
              <tr key={c.id} className="border-t border-stone-100">
                <td className="px-3 py-2 font-medium">{c.lead.nombre}</td>
                <td className="px-3 py-2 text-stone-600">{c.lead.unidadInteres || "—"}</td>
                <td className="px-3 py-2 text-center">#{c.numero}</td>
                <td className="px-3 py-2 text-stone-600">{formatFecha(c.fechaVence)}</td>
                <td className="px-3 py-2 text-center text-[10px] text-stone-500">{Math.abs(c.diasMora)}d</td>
                <td className="px-3 py-2 text-right font-mono">{fmtMM(c.montoMM)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   TAB: PLANTILLAS WHATSAPP
   ════════════════════════════════════════════════════════════════════════════ */
const PlantillasTab = ({ plantillas, setPlantillas, editando, setEditando }) => {
  const [textoEdit, setTextoEdit] = useState("");

  const empezarEdit = (nivelId) => {
    setEditando(nivelId);
    setTextoEdit(plantillas[nivelId]);
  };

  const guardar = () => {
    setPlantillas(prev => ({ ...prev, [editando]: textoEdit }));
    setEditando(null);
  };

  const VARIABLES = [
    { v: "{nombre}", e: "Nombre del cliente" },
    { v: "{numero}", e: "Número de cuota" },
    { v: "{fecha}", e: "Fecha de vencimiento" },
    { v: "{monto}", e: "Monto MM" },
    { v: "{unidad}", e: "Apartamento" },
    { v: "{diasMora}", e: "Días de mora" },
    { v: "{telefonoAsesor}", e: "Teléfono asesor" }
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
        💡 Las plantillas se personalizan automáticamente al enviar. Usa las variables entre llaves para inyectar datos del cliente.
        <div className="mt-1 flex flex-wrap gap-1">
          {VARIABLES.map(({ v, e }) => (
            <span key={v} className="inline-flex items-center gap-1 rounded bg-white border border-amber-200 px-1.5 py-0.5 text-[10px]">
              <code className="font-mono text-amber-800">{v}</code>
              <span className="text-amber-700">{e}</span>
            </span>
          ))}
        </div>
      </div>

      {NIVELES.map(n => (
        <div key={n.id} className={`rounded-lg border bg-white p-3 ${n.bgClass}`}>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{n.icon}</span>
              <strong className="text-[13px]">{n.label}</strong>
              <span className="text-[10px] opacity-70">({n.diasMin}d a {n.diasMax === 999 ? "∞" : `${n.diasMax}d`})</span>
            </div>
            {editando === n.id ? (
              <div className="flex gap-1">
                <button onClick={guardar} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] text-white"><Save className="h-3 w-3" /> Guardar</button>
                <button onClick={() => setEditando(null)} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-[10px]"><X className="h-3 w-3" /></button>
              </div>
            ) : (
              <button onClick={() => empezarEdit(n.id)} className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-[10px]">
                <Edit3 className="h-3 w-3" /> Editar
              </button>
            )}
          </div>
          {editando === n.id ? (
            <textarea value={textoEdit} onChange={e => setTextoEdit(e.target.value)} rows={4} className="w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-[11px]" />
          ) : (
            <div className="rounded-md bg-white p-2 text-[11px] leading-relaxed text-stone-700 whitespace-pre-wrap">{plantillas[n.id]}</div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   TAB: BOT WHATSAPP (stub para Meta Cloud API)
   ════════════════════════════════════════════════════════════════════════════ */
const BotTab = ({ config, setConfig, plantillas }) => {
  const [activarConfirm, setActivarConfirm] = useState(false);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🤖</span>
          <div className="flex-1">
            <h3 className="font-serif text-lg text-stone-900">Bot WhatsApp Business · Automatización de cobranza</h3>
            <p className="mt-1 text-[12px] text-stone-700">
              <strong>En construcción.</strong> La configuración queda lista. Cuando activemos la integración con
              <strong> Meta WhatsApp Business Cloud API</strong> (gratis hasta 1.000 conversaciones/mes), el bot dispara los
              recordatorios automáticamente según las reglas configuradas abajo. Mientras tanto, los recordatorios se envían
              con un click desde "Alertas activas".
            </p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-mono text-stone-700">
              Estado: 🔴 Inactivo · Modo manual
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Reglas de disparo automático</h4>
        <div className="space-y-2 text-[12px]">
          <label className="flex items-center justify-between">
            <span>Días antes del vencimiento para 1er aviso</span>
            <input type="number" value={config.avisoAntes} onChange={e => setConfig({ ...config, avisoAntes: parseInt(e.target.value) || 0 })} className="w-16 rounded border border-stone-300 px-2 py-1 text-right font-mono" />
          </label>
          <label className="flex items-center justify-between">
            <input type="checkbox" checked={config.avisoVencimiento} onChange={e => setConfig({ ...config, avisoVencimiento: e.target.checked })} className="mr-2" />
            <span className="flex-1">Enviar aviso el día del vencimiento</span>
          </label>
          <div>
            <span className="block mb-1">Días de mora para reintentos:</span>
            <div className="flex flex-wrap gap-1">
              {config.diasReintentoMora.map((d, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] text-rose-800">
                  +{d} días
                  <button onClick={() => setConfig({ ...config, diasReintentoMora: config.diasReintentoMora.filter((_, idx) => idx !== i) })} className="ml-1 text-rose-600 hover:text-rose-900">×</button>
                </span>
              ))}
              <button onClick={() => {
                const nuevo = prompt("Días de mora para nuevo reintento:");
                if (nuevo && !isNaN(parseInt(nuevo))) setConfig({ ...config, diasReintentoMora: [...config.diasReintentoMora, parseInt(nuevo)].sort((a, b) => a - b) });
              }} className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-2 py-0.5 text-[11px] text-stone-700 hover:bg-stone-50">
                <Plus className="h-3 w-3" /> Agregar
              </button>
            </div>
          </div>
          <label className="flex items-center justify-between">
            <span>Asesor responsable</span>
            <input value={config.asesor} onChange={e => setConfig({ ...config, asesor: e.target.value })} className="rounded border border-stone-300 px-2 py-1" />
          </label>
          <label className="flex items-center justify-between">
            <span>Teléfono envío (Cretto)</span>
            <input value={config.telefonoEnvio} onChange={e => setConfig({ ...config, telefonoEnvio: e.target.value })} className="rounded border border-stone-300 px-2 py-1 font-mono" />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">Próxima activación (qué falta)</h4>
        <ol className="list-decimal pl-5 space-y-1 text-[12px] text-stone-700">
          <li>Crear cuenta WhatsApp Business + número Meta para Cretto Casa 107</li>
          <li>Verificar negocio en Meta Business Manager (1-3 días hábiles)</li>
          <li>Aprobar las 5 plantillas en Meta Cloud API (formato específico)</li>
          <li>Conectar credenciales (access token + phone-number-id) al hub</li>
          <li>Activar webhook para recibir respuestas y conversaciones entrantes</li>
        </ol>
        <button
          onClick={() => alert("Pendiente: integración con Meta WhatsApp Business Cloud API. Los detalles técnicos se documentarán cuando avancemos.")}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white opacity-50 cursor-not-allowed"
          disabled
        >
          <Zap className="h-3.5 w-3.5" /> Conectar Meta Cloud API
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   TAB: HISTORIAL DE ENVÍOS
   ════════════════════════════════════════════════════════════════════════════ */
const HistorialTab = ({ historial }) => {
  if (historial.length === 0) {
    return <div className="py-12 text-center text-[12px] italic text-stone-400">Sin recordatorios enviados aún. Cada envío queda registrado aquí.</div>;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <table className="w-full text-[11px]">
        <thead className="bg-stone-50 text-[9px] uppercase text-stone-500">
          <tr>
            <th className="px-3 py-2 text-left">Fecha</th>
            <th className="px-3 py-2 text-left">Cliente</th>
            <th className="px-3 py-2 text-center">Cuota</th>
            <th className="px-3 py-2 text-left">Nivel</th>
            <th className="px-3 py-2 text-right">Monto</th>
            <th className="px-3 py-2 text-left">Canal</th>
            <th className="px-3 py-2 text-left">Mensaje (extracto)</th>
          </tr>
        </thead>
        <tbody>
          {historial.map(h => {
            const nivel = NIVELES.find(n => n.id === h.nivel);
            return (
              <tr key={h.id} className="border-t border-stone-100">
                <td className="px-3 py-2 text-[10px]">{new Date(h.fecha).toLocaleString("es-CO")}</td>
                <td className="px-3 py-2 font-medium">{h.leadNombre}</td>
                <td className="px-3 py-2 text-center">#{h.cuotaNumero}</td>
                <td className="px-3 py-2">
                  {nivel ? <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${nivel.bgClass}`}>{nivel.icon} {nivel.label}</span>
                  : h.nivel === "pago" ? <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800">✓ Pago</span>
                  : <span>—</span>}
                </td>
                <td className="px-3 py-2 text-right font-mono">{fmtMM(h.monto)}</td>
                <td className="px-3 py-2 text-[10px] text-stone-600">{h.canal}</td>
                <td className="px-3 py-2 text-[10px] text-stone-500 line-clamp-1">{h.texto}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecordatoriosCuota;
