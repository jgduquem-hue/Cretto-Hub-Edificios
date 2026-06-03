import React, { useState, useEffect, useMemo } from "react";
import { Mail, X, Send, Users, Check, AlertCircle } from "lucide-react";
import { sendEmail, subjectFor, buildRaciHtml, getEmailConfig } from "./emailService.js";

/* ────────────────────────────────────────────────────────────────
   RACI Notify — modal central que pregunta a quién notificar
   por correo cuando hay un cambio en el proyecto, sube de un
   documento o se cierra un compromiso.

   Uso típico:
     const [notify, setNotify] = useState(null);
     ...
     setNotify({ titulo: "...", contexto: "...", onSent: () => {} });
     ...
     <RaciNotifyModal open={!!notify} payload={notify} onClose={...} />

   Roles RACI estándar:
   - R (Responsible): ejecuta
   - A (Accountable): aprueba
   - C (Consulted): consulta
   - I (Informed): informa
────────────────────────────────────────────────────────────────── */

export const ROLES_RACI_DEFAULT = [
  { id: "sponsor",            label: "Sponsor / Inversionista",        raci: "A" },
  { id: "promotor",           label: "Promotor / PM Promotor",         raci: "A" },
  { id: "pm-cretto",          label: "PM Cretto",                      raci: "R" },
  { id: "fiduciaria",         label: "Fiduciaria",                     raci: "I" },
  { id: "banco",              label: "Banco financiador",              raci: "I" },
  { id: "arquitecto",         label: "Arquitecto",                     raci: "C" },
  { id: "constructor",        label: "Constructor",                    raci: "R" },
  { id: "interventoria",      label: "Interventoría",                  raci: "C" },
  { id: "residente",          label: "Residente de obra",              raci: "I" },
  { id: "comercial",          label: "Gerente comercial",              raci: "I" },
  { id: "comercializadora",   label: "Comercializadora",               raci: "I" },
  { id: "ing-estructural",    label: "Ing. estructural",               raci: "C" },
  { id: "ing-mep",            label: "Ing. MEP (hidro/elec/gas)",      raci: "C" }
];

/* Pre-selección sugerida por tipo de evento */
export const RACI_SUGGESTIONS = {
  "documento-subido":   ["pm-cretto", "promotor", "interventoria", "arquitecto"],
  "documento-legal":    ["pm-cretto", "promotor", "sponsor", "fiduciaria", "banco"],
  "documento-licencia": ["pm-cretto", "promotor", "arquitecto", "constructor", "interventoria"],
  "documento-financiero":["pm-cretto", "promotor", "sponsor", "fiduciaria", "banco"],
  "cambio-alcance":     ["pm-cretto", "promotor", "sponsor", "constructor", "interventoria", "arquitecto"],
  "cambio-presupuesto": ["pm-cretto", "promotor", "sponsor", "fiduciaria", "banco"],
  "cambio-cronograma":  ["pm-cretto", "promotor", "constructor", "interventoria", "comercializadora"],
  "reunion-acta":       ["pm-cretto", "promotor", "sponsor"],
  "pendiente-vencido":  ["pm-cretto", "promotor"],
  "default":            ["pm-cretto", "promotor"]
};

const RACI_COLOR = {
  R: "bg-emerald-100 text-emerald-800",
  A: "bg-rose-100 text-rose-800",
  C: "bg-amber-100 text-amber-800",
  I: "bg-stone-100 text-stone-700"
};

const RaciNotifyModal = ({ open, payload, onClose, raciData }) => {
  const tipo = payload?.tipo || "default";
  const titulo = payload?.titulo || "Notificar cambio";
  const contexto = payload?.contexto || "";

  /* Si hay matriz del proyecto, derivar roles y pre-selección desde ella */
  const { roles, sugeridos } = useMemo(() => {
    if (raciData?.matrix && raciData?.roles?.length) {
      const map = {
        "documento-subido":     "evt-doc-arquitectura",
        "documento-legal":      "evt-doc-legal",
        "documento-licencia":   "evt-doc-licencia",
        "documento-financiero": "evt-doc-financiero",
        "cambio-alcance":       "evt-cambio-alcance",
        "cambio-presupuesto":   "evt-cambio-presupuesto",
        "cambio-cronograma":    "evt-cambio-cronograma",
        "reunion-acta":         "evt-reunion-acta",
        "pendiente-vencido":    "evt-pendiente-vencido"
      };
      const evtId = payload?.eventoId || map[tipo];
      const row = raciData.matrix[evtId] || {};
      const rolesFromMatrix = raciData.roles.map(r => ({
        id: r.id,
        label: `${r.nombre}${r.organizacion ? " · " + r.organizacion : ""}${r.email ? " · " + r.email : ""}`,
        email: r.email || "",
        nombre: r.nombre,
        raci: row[r.id] || "I"
      }));
      const sug = raciData.roles.filter(r => ["R", "A", "C", "I"].includes(row[r.id])).map(r => r.id);
      return { roles: rolesFromMatrix, sugeridos: sug.length ? sug : (RACI_SUGGESTIONS[tipo] || RACI_SUGGESTIONS.default) };
    }
    return {
      roles: payload?.roles || ROLES_RACI_DEFAULT,
      sugeridos: RACI_SUGGESTIONS[tipo] || RACI_SUGGESTIONS.default
    };
  }, [raciData, tipo, payload]);

  const [selected, setSelected] = useState(new Set(sugeridos));
  const [mensaje, setMensaje] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected(new Set(sugeridos));
      setMensaje("");
      setSent(false);
    }
  }, [open, tipo]);

  if (!open) return null;

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const [sendResult, setSendResult] = useState(null);

  const handleSend = async () => {
    const seleccionados = roles.filter(r => selected.has(r.id));
    const emails = seleccionados.map(r => r.email).filter(Boolean);
    const sinEmail = seleccionados.filter(r => !r.email);

    if (emails.length === 0) {
      setSendResult({ ok: false, msg: "Ninguno de los seleccionados tiene email configurado en la matriz RACI." });
      return;
    }

    const cfg = getEmailConfig();
    const subject = subjectFor({ projectName: payload?.projectName, tipo, titulo });
    const html = buildRaciHtml({
      projectName: payload?.projectName,
      titulo,
      contexto,
      mensaje,
      destinatarios: seleccionados,
      pmName: cfg.fromName
    });

    const res = await sendEmail({
      to: emails,
      bcc: cfg.bcc,
      subject,
      body: `${titulo}\n\n${contexto || ""}\n\n${mensaje || ""}\n\n— ${cfg.fromName || "Cretto"}`,
      html,
      config: cfg
    });

    setSendResult({
      ok: res.success,
      msg: res.success
        ? `${res.note || `Enviado vía ${res.method}`}${sinEmail.length > 0 ? ` · ${sinEmail.length} sin email: ${sinEmail.map(r => r.nombre || r.id).join(", ")}` : ""}`
        : (res.error || "Error en envío")
    });

    if (res.success) {
      setSent(true);
      const notif = { titulo, contexto, tipo, destinatarios: [...selected], emails, mensaje, fecha: new Date().toISOString(), method: res.method };
      if (payload?.onSent) payload.onSent(notif);
      setTimeout(() => onClose(), 1500);
    }
  };

  const handleSkip = () => {
    if (payload?.onSent) payload.onSent(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-700" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-400">Matriz RACI · Notificación</div>
              <h3 className="font-serif text-base text-stone-900">{titulo}</h3>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
        </header>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Check className="h-12 w-12 text-emerald-600" />
            <p className="mt-2 font-serif text-lg text-stone-900">Notificación enviada</p>
            <p className="text-[12px] text-stone-500">{selected.size} destinatarios · {tipo}</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3">
              {contexto && (
                <div className="mb-3 rounded-md bg-stone-50 p-2 text-[12px] text-stone-700">{contexto}</div>
              )}
              <p className="mb-2 text-[12px] text-stone-600">
                <Users className="mr-1 inline h-3.5 w-3.5" />
                ¿A qué roles RACI debemos notificar por correo? La pre-selección viene de la matriz para este tipo de evento.
              </p>
              <div className="max-h-64 overflow-y-auto rounded-md border border-stone-200">
                {roles.map(r => {
                  const on = selected.has(r.id);
                  return (
                    <label key={r.id} className={`flex items-center gap-2 border-b border-stone-100 px-2 py-1.5 text-[12px] last:border-b-0 ${on ? "bg-emerald-50/40" : "bg-white hover:bg-stone-50"}`}>
                      <input type="checkbox" checked={on} onChange={() => toggle(r.id)} className="accent-emerald-700" />
                      <span className={`inline-block w-5 rounded text-center font-mono text-[10px] font-bold ${RACI_COLOR[r.raci]}`}>{r.raci}</span>
                      <span className="flex-1 text-stone-800">{r.label}</span>
                    </label>
                  );
                })}
              </div>
              <textarea
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                rows={2}
                placeholder="Mensaje adicional (opcional)"
                className="mt-2 w-full rounded-md border border-stone-300 px-2 py-1.5 text-[12px] placeholder-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {sendResult && !sent && (
                <div className={`mt-2 rounded-md p-2 text-[11px] ${sendResult.ok ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-rose-200 bg-rose-50 text-rose-800"}`}>
                  {sendResult.ok ? <Check className="mr-1 inline h-3 w-3" /> : <AlertCircle className="mr-1 inline h-3 w-3" />}
                  {sendResult.msg}
                </div>
              )}
            </div>

            <footer className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-4 py-2.5">
              <button onClick={handleSkip} className="text-[12px] text-stone-500 hover:text-stone-800">No notificar</button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-500">{selected.size} seleccionados</span>
                <button
                  onClick={handleSend}
                  disabled={selected.size === 0}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" /> Enviar correo
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default RaciNotifyModal;
