import React, { useState } from "react";
import { Mail, Save, Check, AlertCircle, ExternalLink } from "lucide-react";
import { getEmailConfig, setEmailConfig, sendEmail } from "./emailService.js";

/* Pantalla de configuración de envío de correo. */
const EmailSettings = () => {
  const [cfg, setCfg] = useState(() => getEmailConfig());
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [testEmail, setTestEmail] = useState("");

  const update = (patch) => setCfg(c => ({ ...c, ...patch }));
  const updateEmailJS = (patch) => setCfg(c => ({ ...c, emailjs: { ...c.emailjs, ...patch } }));

  const handleSave = () => {
    setEmailConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    if (!testEmail) { setTestStatus({ ok: false, msg: "Ingresa un email de prueba." }); return; }
    setTestStatus({ ok: null, msg: "Enviando…" });
    const res = await sendEmail({
      to: testEmail,
      subject: "[Cretto] Prueba de envío",
      body: "Este es un correo de prueba enviado desde Cretto Hub. Si lo recibiste, la configuración está OK.",
      html: "<p>Este es un correo de prueba enviado desde <strong>Cretto Hub</strong>. Si lo recibiste, la configuración está OK.</p>",
      config: cfg
    });
    setTestStatus(res.success ? { ok: true, msg: res.note || `Enviado con driver ${res.method}` } : { ok: false, msg: res.error || "Error en envío" });
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <header className="mb-5">
        <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Configuración · Email</div>
        <h1 className="mt-0.5 font-serif text-2xl text-stone-900">Envío de correos</h1>
        <p className="mt-1 text-sm text-stone-500">
          Configura cómo el hub envía notificaciones RACI y newsletters de bitácora. Por defecto abre el cliente de correo del usuario (mailto). Para envío automatizado real, configura EmailJS.
        </p>
      </header>

      <div className="space-y-4">
        {/* Driver selector */}
        <Section title="Método de envío">
          <div className="space-y-2">
            <DriverOption
              id="mailto" current={cfg.driver} onChange={(v) => update({ driver: v })}
              title="Abrir cliente de correo del usuario (mailto)"
              desc="Sin configuración. Cada notificación abre Gmail/Outlook con los destinatarios prellenados. El usuario hace clic en Enviar manualmente."
              recommended
            />
            <DriverOption
              id="emailjs" current={cfg.driver} onChange={(v) => update({ driver: v })}
              title="EmailJS (envío automatizado, 200/mes gratis)"
              desc="Envío automático sin backend. Requiere cuenta gratuita en emailjs.com y configurar serviceId, templateId y publicKey."
            />
            <DriverOption
              id="clipboard" current={cfg.driver} onChange={(v) => update({ driver: v })}
              title="Copiar HTML al portapapeles"
              desc="Para newsletters: copia el HTML formateado para pegar en Gmail/Outlook con formato preservado."
            />
          </div>
        </Section>

        {/* Datos generales */}
        <Section title="Datos del remitente">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre del remitente">
              <input value={cfg.fromName} onChange={e => update({ fromName: e.target.value })} className="inp" placeholder="Cretto · Gerencia de Proyectos" />
            </Field>
            <Field label="Email del remitente">
              <input type="email" value={cfg.fromEmail} onChange={e => update({ fromEmail: e.target.value })} className="inp" placeholder="jose@cretto.co" />
            </Field>
          </div>
          <Field label="BCC fijo (copia oculta a esta dirección en todos los envíos)">
            <input value={cfg.bcc} onChange={e => update({ bcc: e.target.value })} className="inp" placeholder="archivo@cretto.co (opcional)" />
          </Field>
        </Section>

        {/* EmailJS config */}
        {cfg.driver === "emailjs" && (
          <Section title="Configuración EmailJS">
            <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-[12px] text-blue-900">
              <strong>Setup en 4 pasos:</strong>
              <ol className="mt-1 list-decimal pl-5 space-y-0.5">
                <li>Crea cuenta gratuita en <a href="https://emailjs.com" target="_blank" rel="noopener" className="underline">emailjs.com</a> <ExternalLink className="ml-0.5 inline h-3 w-3" /></li>
                <li>Conecta un servicio de email (Gmail, Outlook, SMTP)</li>
                <li>Crea un template con variables: <code>to_email</code>, <code>subject</code>, <code>body</code>, <code>html</code>, <code>from_name</code></li>
                <li>Copia los IDs aquí abajo</li>
              </ol>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Service ID"><input value={cfg.emailjs?.serviceId || ""} onChange={e => updateEmailJS({ serviceId: e.target.value })} className="inp" placeholder="service_xxx" /></Field>
              <Field label="Template ID"><input value={cfg.emailjs?.templateId || ""} onChange={e => updateEmailJS({ templateId: e.target.value })} className="inp" placeholder="template_xxx" /></Field>
              <Field label="Public Key"><input value={cfg.emailjs?.publicKey || ""} onChange={e => updateEmailJS({ publicKey: e.target.value })} className="inp" placeholder="pub_xxx" /></Field>
            </div>
          </Section>
        )}

        {/* Test */}
        <Section title="Probar envío">
          <div className="flex items-end gap-2">
            <Field label="Enviar correo de prueba a">
              <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} className="inp" placeholder="tu@email.com" />
            </Field>
            <button onClick={handleTest} className="rounded-md bg-stone-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-stone-800">
              Enviar prueba
            </button>
          </div>
          {testStatus && (
            <div className={`mt-2 rounded-md p-2 text-[12px] ${testStatus.ok ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : testStatus.ok === false ? "border border-rose-200 bg-rose-50 text-rose-800" : "border border-stone-200 bg-stone-50 text-stone-700"}`}>
              {testStatus.ok ? <Check className="mr-1 inline h-3.5 w-3.5" /> : testStatus.ok === false ? <AlertCircle className="mr-1 inline h-3.5 w-3.5" /> : null}
              {testStatus.msg}
            </div>
          )}
        </Section>

        {/* Save */}
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-stone-500">La configuración se guarda en tu navegador (localStorage).</div>
          <button onClick={handleSave} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800">
            {saved ? <><Check className="h-3.5 w-3.5" /> Guardado</> : <><Save className="h-3.5 w-3.5" /> Guardar configuración</>}
          </button>
        </div>
      </div>

      <style>{`.inp{width:100%;border:1px solid rgb(214,211,209);background:#fff;padding:6px 10px;font-size:13px;border-radius:6px}.inp:focus{outline:none;border-color:rgb(16,185,129);box-shadow:0 0 0 1px rgb(16,185,129)}`}</style>
    </div>
  );
};

const DriverOption = ({ id, current, onChange, title, desc, recommended }) => {
  const active = current === id;
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-all ${active ? "border-emerald-600 bg-emerald-50/50" : "border-stone-200 bg-white hover:bg-stone-50"}`}>
      <input type="radio" checked={active} onChange={() => onChange(id)} className="mt-0.5 accent-emerald-700" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-stone-900">{title}</span>
          {recommended && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">RECOMENDADO</span>}
        </div>
        <div className="text-[11px] text-stone-600">{desc}</div>
      </div>
    </label>
  );
};

const Section = ({ title, children }) => (
  <div className="rounded-lg border border-stone-200 bg-white p-4">
    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">{title}</h3>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-stone-600">{label}</span>
    {children}
  </label>
);

export default EmailSettings;
