// Storage shim para CrettoHub
// - Mantiene window.storage.get/set/delete/list con firma async original
// - Si hay carpeta del usuario conectada (File System Access) → escribe en disco
// - En paralelo, mantiene una copia en localStorage como cache rápido + fallback
// - Si el navegador NO soporta FSA → solo localStorage (modo legacy)
//
// Los módulos siguen llamando a window.storage idéntico, no cambian.

import {
  isFsaSupported, hasFolder, readFile, writeFile, deleteFile, listAllKeys
} from "./fsAdapter.js";

const PREFIX = "crettohub::";

/* ───────── helpers cache (localStorage) ───────── */
const cacheGet = (key) => {
  try {
    const value = localStorage.getItem(PREFIX + key);
    if (value === null) return null;
    return { key, value, shared: false };
  } catch { return null; }
};

const cacheSet = (key, value) => {
  try { localStorage.setItem(PREFIX + key, String(value)); } catch {}
};

const cacheDel = (key) => {
  try { localStorage.removeItem(PREFIX + key); } catch {}
};

const cacheList = (prefix = "") => {
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (fullKey && fullKey.startsWith(PREFIX)) {
        const key = fullKey.slice(PREFIX.length);
        if (!prefix || key.startsWith(prefix)) keys.push(key);
      }
    }
  } catch {}
  return keys;
};

/* ───────── shim público ───────── */
function makeShim() {
  return {
    async get(key) {
      // 1) Si hay carpeta, intentar leer disco (fuente de verdad)
      if (hasFolder()) {
        try {
          const fileContent = await readFile(key);
          if (fileContent !== null) {
            // refrescar cache
            cacheSet(key, fileContent);
            return { key, value: fileContent, shared: false };
          }
        } catch (e) {
          console.warn(`[storage-shim] read disco falló para ${key}:`, e.message);
        }
      }
      // 2) Fallback / cache
      return cacheGet(key);
    },

    async set(key, value) {
      const str = String(value);
      // Cache siempre primero (instantáneo)
      cacheSet(key, str);
      // Disco si hay carpeta
      if (hasFolder()) {
        try { await writeFile(key, str); }
        catch (e) { console.warn(`[storage-shim] write disco falló para ${key}:`, e.message); }
      }
      return { key, value: str, shared: false };
    },

    async delete(key) {
      cacheDel(key);
      if (hasFolder()) {
        try { await deleteFile(key); }
        catch (e) { console.warn(`[storage-shim] delete disco falló para ${key}:`, e.message); }
      }
      return { key, deleted: true, shared: false };
    },

    async list(prefix = "") {
      // Si hay carpeta, listar archivos del disco
      if (hasFolder()) {
        try {
          const fsKeys = await listAllKeys(prefix);
          // Normalizar: el caller espera claves sin el prefijo crettohub::
          const normalized = fsKeys.map(k => k.replace(/^crettohub:+/, ""));
          return { keys: normalized, prefix, shared: false };
        } catch (e) {
          console.warn("[storage-shim] list disco falló:", e.message);
        }
      }
      return { keys: cacheList(prefix), prefix, shared: false };
    }
  };
}

if (typeof window !== "undefined" && !window.storage) {
  window.storage = makeShim();
}

// Re-export para que otros módulos puedan reaccionar al estado del FSA
export { isFsaSupported, hasFolder };
