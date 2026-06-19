/* ────────────────────────────────────────────────────────────────
   Whisper local — corre 100% offline en el navegador (transformers.js).
   Primera vez descarga el modelo (~75 MB para whisper-base) y lo cachea
   en IndexedDB. Llamadas siguientes son instantáneas.

   Modelos disponibles (mayor calidad ↔ mayor peso):
   - Xenova/whisper-tiny   (~40 MB, rápido, calidad media)
   - Xenova/whisper-base   (~75 MB, balanceado) ← default
   - Xenova/whisper-small  (~250 MB, mejor calidad)
   - Xenova/whisper-medium (~750 MB, pro)
────────────────────────────────────────────────────────────────── */

import { pipeline, env } from "@huggingface/transformers";

/* Permitir solo modelos remotos (huggingface), no buscar en local server */
env.allowLocalModels = false;
/* Usar WebGPU si está disponible — 10x más rápido que WASM */
env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 4;

const MODEL_KEY = "crettohub::whisper-local-model";
const DEFAULT_MODEL = "Xenova/whisper-base";

export const MODELS_DISPONIBLES = [
  { id: "Xenova/whisper-tiny",   label: "Tiny — rápido, calidad media",        sizeMB: 40 },
  { id: "Xenova/whisper-base",   label: "Base — balanceado (recomendado)",     sizeMB: 75 },
  { id: "Xenova/whisper-small",  label: "Small — mejor calidad, descarga grande", sizeMB: 250 }
];

export const getLocalModel = () => {
  try { return localStorage.getItem(MODEL_KEY) || DEFAULT_MODEL; } catch { return DEFAULT_MODEL; }
};
export const setLocalModel = (m) => {
  try { localStorage.setItem(MODEL_KEY, m || DEFAULT_MODEL); } catch {}
};

/* Cache del pipeline ya instanciado para no recargar entre llamadas */
let pipelinePromise = null;
let currentModel = null;

const getPipeline = async (modelId, onProgress) => {
  if (pipelinePromise && currentModel === modelId) return pipelinePromise;
  currentModel = modelId;
  pipelinePromise = pipeline("automatic-speech-recognition", modelId, {
    progress_callback: (data) => {
      /* data: { status, file, progress, loaded, total } */
      if (onProgress) onProgress(data);
    }
  });
  return pipelinePromise;
};

/* Convierte Blob de audio a Float32Array @ 16kHz mono (lo que Whisper espera) */
const audioBlobToFloat32 = async (blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  /* OfflineAudioContext: decodifica y resamplea sin reproducir */
  const audioCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 16000, 16000);
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  /* Si ya es mono 16kHz, lo devolvemos directo */
  if (decoded.sampleRate === 16000 && decoded.numberOfChannels === 1) {
    return decoded.getChannelData(0);
  }
  /* Si no, resamplear con OfflineAudioContext */
  const offline = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    1, Math.ceil(decoded.duration * 16000), 16000
  );
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start(0);
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
};

/* Transcribe un Blob de audio usando Whisper local.
   Retorna { text, duration, language } */
export const transcribeLocal = async (audioBlob, { language = "spanish", onProgress } = {}) => {
  if (!audioBlob || audioBlob.size === 0) throw new Error("Audio vacío.");
  const modelId = getLocalModel();

  if (onProgress) onProgress({ stage: "loading-model", pct: 5 });
  const transcriber = await getPipeline(modelId, (p) => {
    if (p.status === "progress" && onProgress) {
      const pct = 5 + Math.round((p.progress || 0) * 0.5); // 5-55% mientras carga
      onProgress({ stage: "loading-model", pct, file: p.file, loaded: p.loaded, total: p.total });
    }
  });

  if (onProgress) onProgress({ stage: "decoding-audio", pct: 60 });
  const audio = await audioBlobToFloat32(audioBlob);

  if (onProgress) onProgress({ stage: "transcribing", pct: 70 });
  const output = await transcriber(audio, {
    language,
    task: "transcribe",
    return_timestamps: false,
    chunk_length_s: 30,
    stride_length_s: 5
  });

  if (onProgress) onProgress({ stage: "done", pct: 100 });
  return {
    text: (output?.text || "").trim(),
    duration: audio.length / 16000,
    language
  };
};

/* Pre-cargar el modelo (útil para "calentar" en background) */
export const precargarModelo = async (onProgress) => {
  const modelId = getLocalModel();
  await getPipeline(modelId, onProgress);
  return true;
};

/* Verificar si el modelo ya está cacheado (consulta IndexedDB) */
export const modeloEstaCacheado = async () => {
  try {
    const dbs = await indexedDB.databases?.();
    return (dbs || []).some(d => /transformers|onnx|huggingface/i.test(d.name || ""));
  } catch {
    return false;
  }
};
