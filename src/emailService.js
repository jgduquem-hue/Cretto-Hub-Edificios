/* ────────────────────────────────────────────────────────────────
   Email service — abstracción con varios drivers
   Drivers soportados (sin backend):
   - mailto (default): abre el cliente de correo del usuario con
     destinatarios + asunto + cuerpo pre-rellenados. Cuerpo en texto.
   - emailjs: envía vía EmailJS (https://emailjs.com) — gratuito 200/mes,
     CORS-friendly. Requiere serviceId, templateId y publicKey.
   - clipboard: copia el HTML al portapapeles para pegar en Gmail/Outlook.

   Config se persiste en localStorage bajo "crettohub:email-config".
────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = "crettohub:email-config";

export const DEFAULT_CONFIG = {
  driver: "mailto",
  fromName: "Cretto · Gerencia de Proyectos",
  fromEmail: "",
  emailjs: { serviceId: "", templateId: "", publicKey: "" },
  bcc: ""
};

export const getEmailConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_CONFIG };
};

export const setEmailConfig = (cfg) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {}
};

const stripHtml = (html = "") =>
  html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

/* mailto driver — abre cliente de correo del usuario */
const sendMailto = ({ to, cc, bcc, subject, body, html }) => {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean).join(",");
  const textBody = body || stripHtml(html || "");
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (textBody) params.set("body", textBody);
  if (cc) params.set("cc", Array.isArray(cc) ? cc.join(",") : cc);
  if (bcc) params.set("bcc", Array.isArray(bcc) ? bcc.join(",") : bcc);
  const url = `mailto:${recipients}?${params.toString()}`;
  window.location.href = url;
  return { success: true, method: "mailto", recipients: recipients.split(",").filter(Boolean), note: "Se abrió tu cliente de correo predeterminado." };
};

/* EmailJS driver — envío directo desde el browser, sin backend */
const sendEmailJS = async ({ to, cc, bcc, subject, body, html, config }) => {
  const { serviceId, templateId, publicKey } = config.emailjs || {};
  if (!serviceId || !templateId || !publicKey) {
    return { success: false, method: "emailjs", error: "Falta configuración EmailJS (serviceId/templateId/publicKey)." };
  }
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  const results = [];
  for (const r of recipients) {
    try {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            to_email: r,
            cc_email: Array.isArray(cc) ? cc.join(",") : (cc || ""),
            bcc_email: Array.isArray(bcc) ? bcc.join(",") : (bcc || config.bcc || ""),
            from_name: config.fromName || DEFAULT_CONFIG.fromName,
            from_email: config.fromEmail || "",
            subject: subject || "",
            body: body || stripHtml(html || ""),
            html: html || ""
          }
        })
      });
      results.push({ to: r, ok: res.ok, status: res.status });
    } catch (e) {
      results.push({ to: r, ok: false, error: e.message });
    }
  }
  const okCount = results.filter(r => r.ok).length;
  return { success: okCount > 0, method: "emailjs", recipients, results, sent: okCount };
};

/* Clipboard driver — copia HTML al portapapeles para pegar */
const sendClipboard = async ({ html, body }) => {
  const content = html || body || "";
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blobHtml = new Blob([content], { type: "text/html" });
      const blobText = new Blob([stripHtml(content)], { type: "text/plain" });
      await navigator.clipboard.write([new window.ClipboardItem({ "text/html": blobHtml, "text/plain": blobText })]);
    } else {
      await navigator.clipboard.writeText(content);
    }
    return { success: true, method: "clipboard", note: "HTML copiado. Pégalo en Gmail/Outlook con Ctrl+V." };
  } catch (e) {
    return { success: false, method: "clipboard", error: e.message };
  }
};

/* API pública */
export const sendEmail = async ({ to, cc, bcc, subject, body, html, driver, config }) => {
  const cfg = config || getEmailConfig();
  const d = driver || cfg.driver || "mailto";
  if (d === "emailjs") return sendEmailJS({ to, cc, bcc, subject, body, html, config: cfg });
  if (d === "clipboard") return sendClipboard({ html, body });
  return sendMailto({ to, cc, bcc, subject, body, html });
};

/* Genera un asunto formal para Cretto */
export const subjectFor = ({ projectName, tipo, titulo }) => {
  const tag = (tipo || "").toUpperCase().replace(/-/g, " ");
  return `[Cretto · ${projectName || "Proyecto"}${tag ? " · " + tag : ""}] ${titulo || ""}`.trim();
};

/* Construye un cuerpo HTML estándar para notificaciones RACI */
export const buildRaciHtml = ({ projectName, titulo, contexto, mensaje, destinatarios, pmName }) => {
  const dest = (destinatarios || []).map(d => `<li>${escapeHtml(d.label)} <small style="color:#78716c">(${d.raci})</small></li>`).join("");
  return `<!DOCTYPE html><html><body style="font-family:system-ui,-apple-system,sans-serif;color:#1c1917;max-width:640px;margin:0 auto;padding:20px;background:#fafaf9">
    <div style="background:#fff;border:1px solid #e7e5e4;border-radius:8px;padding:24px">
      <div style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#059669">Cretto · ${escapeHtml(projectName || "Proyecto")}</div>
      <h2 style="font-family:Georgia,serif;font-size:20px;margin:4px 0 16px;color:#1c1917">${escapeHtml(titulo || "Notificación")}</h2>
      ${contexto ? `<div style="background:#f5f5f4;padding:12px;border-radius:6px;font-size:13px;margin-bottom:16px">${escapeHtml(contexto)}</div>` : ""}
      ${mensaje ? `<p style="font-size:13px;line-height:1.6;color:#44403c">${escapeHtml(mensaje)}</p>` : ""}
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e7e5e4">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#78716c;margin-bottom:6px">Destinatarios según matriz RACI</div>
        <ul style="font-size:12px;color:#44403c;padding-left:20px;margin:0">${dest}</ul>
      </div>
      <p style="margin-top:24px;font-size:11px;color:#78716c;text-align:center">Enviado por ${escapeHtml(pmName || "PM Cretto")} · Cretto Gerencia de Proyectos</p>
    </div>
  </body></html>`;
};

const escapeHtml = (s) => String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
