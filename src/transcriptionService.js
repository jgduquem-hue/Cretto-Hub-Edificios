/* ────────────────────────────────────────────────────────────────
   Transcription Service — OpenAI Whisper API
   Modelo Bring-Your-Own-Key: el API key se guarda solo en el navegador
   del usuario (localStorage), nunca se sube a Git ni a otro lado.
────────────────────────────────────────────────────────────────── */

const KEY_STORAGE = "crettohub::openai-key";
const MODEL_STORAGE = "crettohub::whisper-model";

export const DEFAULT_MODEL = "whisper-1";

export const getApiKey = () => {
  try { return localStorage.getItem(KEY_STORAGE) || ""; } catch { return ""; }
};

export const setApiKey = (k) => {
  try {
    if (k) localStorage.setItem(KEY_STORAGE, k.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch {}
};

export const getModel = () => {
  try { return localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL; } catch { return DEFAULT_MODEL; }
};

export const setModel = (m) => {
  try { localStorage.setItem(MODEL_STORAGE, m || DEFAULT_MODEL); } catch {}
};

export const isConfigured = () => !!getApiKey();

/* Estimación de costo: Whisper cobra $0.006 USD por minuto de audio */
export const estimateCost = (seconds) => ({
  usd: Math.max(0.006, (seconds / 60) * 0.006),
  minutos: seconds / 60
});

/* Transcribe un Blob de audio usando Whisper API.
   Retorna { text, duration, language } o lanza error. */
export const transcribeAudio = async (audioBlob, { language = "es", onProgress } = {}) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key de OpenAI no configurada. Configúrala en Ajustes → Transcripciones.");

  if (!audioBlob || audioBlob.size === 0) throw new Error("Audio vacío.");
  if (audioBlob.size > 25 * 1024 * 1024) throw new Error("El audio supera 25 MB (límite de Whisper API). Divide la grabación o reduce calidad.");

  if (onProgress) onProgress({ stage: "uploading", pct: 10 });

  const form = new FormData();
  /* OpenAI acepta webm, mp3, mp4, mpga, m4a, wav. MediaRecorder genera webm. */
  const filename = `reunion-${Date.now()}.webm`;
  form.append("file", audioBlob, filename);
  form.append("model", getModel());
  if (language) form.append("language", language);
  form.append("response_format", "verbose_json");

  if (onProgress) onProgress({ stage: "transcribing", pct: 40 });

  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });

  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Whisper API: HTTP ${r.status}`);
  }

  const data = await r.json();
  if (onProgress) onProgress({ stage: "done", pct: 100 });

  return {
    text: data.text || "",
    duration: data.duration || 0,
    language: data.language || language
  };
};

/* Test de conexión — llama con audio de prueba mínimo */
export const testConnection = async () => {
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, error: "Sin API key configurada" };
  /* Solo verificamos que la key sea válida con un GET de models */
  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (!r.ok) return { ok: false, error: `HTTP ${r.status} — key inválida o sin saldo` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};
