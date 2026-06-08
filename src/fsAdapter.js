/* ────────────────────────────────────────────────────────────────
   File System Access adapter
   - Maneja un directory handle persistente en IndexedDB
   - Lee/escribe JSON en la carpeta elegida por el usuario
   - Mapea claves "crettohub:<modulo>:<projectId>" a archivos
     "<projectId>/<modulo>.json"
────────────────────────────────────────────────────────────────── */

const IDB_NAME = "crettohub-fs";
const IDB_STORE = "handles";
const IDB_KEY = "rootDir";

export const isFsaSupported = () =>
  typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";

/* ─── IndexedDB para persistir el handle ─── */
const openIdb = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const idbGet = async (key) => {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const idbSet = async (key, value) => {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const idbDel = async (key) => {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

/* ─── Permisos ─── */
const ensurePermission = async (handle, mode = "readwrite") => {
  if (!handle) return false;
  const opts = { mode };
  if ((await handle.queryPermission(opts)) === "granted") return true;
  if ((await handle.requestPermission(opts)) === "granted") return true;
  return false;
};

/* ─── Estado del singleton ─── */
let rootHandle = null;
let cachedName = null;

export const getCurrentFolderName = () => cachedName;
export const hasFolder = () => rootHandle !== null;

/* Restaurar el handle al iniciar (silencioso) */
export const tryRestoreFolder = async () => {
  if (!isFsaSupported()) return null;
  try {
    const handle = await idbGet(IDB_KEY);
    if (!handle) return null;
    const ok = await ensurePermission(handle, "readwrite");
    if (ok) {
      rootHandle = handle;
      cachedName = handle.name;
      return handle.name;
    }
    /* Permiso no concedido — handle existe pero falta gesto del usuario.
       Devolvemos null pero NO borramos el handle: el banner ofrecerá reconectar. */
    return null;
  } catch {
    return null;
  }
};

/* Verifica si hay un handle guardado (sin pedir permiso) */
export const hasSavedHandle = async () => {
  try { return !!(await idbGet(IDB_KEY)); } catch { return false; }
};

/* Reconectar (pide permiso al usuario explícitamente) */
export const reconnectFolder = async () => {
  if (!isFsaSupported()) return null;
  const handle = await idbGet(IDB_KEY);
  if (!handle) return null;
  const ok = await ensurePermission(handle, "readwrite");
  if (!ok) return null;
  rootHandle = handle;
  cachedName = handle.name;
  return handle.name;
};

/* Elegir carpeta nueva */
export const pickFolder = async () => {
  if (!isFsaSupported()) throw new Error("File System Access API no soportada en este navegador");
  const handle = await window.showDirectoryPicker({ mode: "readwrite", id: "cretto-hub-root" });
  await ensurePermission(handle, "readwrite");
  await idbSet(IDB_KEY, handle);
  rootHandle = handle;
  cachedName = handle.name;
  return handle.name;
};

/* Olvidar carpeta */
export const forgetFolder = async () => {
  rootHandle = null;
  cachedName = null;
  await idbDel(IDB_KEY);
};

/* ─── Mapping de claves ─── */
/* "crettohub:<modulo>:<projectId>" → ["<projectId>", "<modulo>.json"]
   "crettohub::<modulo>"           → ["_global", "<modulo>.json"]
   también acepta sólo "<modulo>" → ["_global", "<modulo>.json"] */
export const keyToPath = (rawKey) => {
  let key = rawKey || "";
  // Soporta tanto "crettohub::xxx" (legacy) como "crettohub:xxx:yyy"
  if (key.startsWith("crettohub::")) key = key.slice("crettohub::".length);
  else if (key.startsWith("crettohub:")) key = key.slice("crettohub:".length);
  const parts = key.split(":");
  if (parts.length === 1) return { dir: "_global", file: `${parts[0]}.json` };
  const [modulo, projectId, ...rest] = parts;
  const proj = projectId || "_default";
  const file = rest.length > 0 ? `${modulo}-${rest.join("-")}.json` : `${modulo}.json`;
  return { dir: proj, file };
};

/* Inverso: path → clave canónica */
export const pathToKey = (dir, file) => {
  const modulo = file.replace(/\.json$/, "");
  if (dir === "_global") return `crettohub::${modulo}`;
  return `crettohub:${modulo}:${dir}`;
};

/* ─── Operaciones de archivo ─── */
const getDirHandle = async (dirName) => {
  if (!rootHandle) return null;
  return rootHandle.getDirectoryHandle(dirName, { create: true });
};

export const readFile = async (rawKey) => {
  if (!rootHandle) return null;
  const { dir, file } = keyToPath(rawKey);
  try {
    const dh = await getDirHandle(dir);
    const fh = await dh.getFileHandle(file);
    const f = await fh.getFile();
    const txt = await f.text();
    return txt;
  } catch (e) {
    if (e.name === "NotFoundError") return null;
    throw e;
  }
};

export const writeFile = async (rawKey, valueStr) => {
  if (!rootHandle) return false;
  const { dir, file } = keyToPath(rawKey);
  const dh = await getDirHandle(dir);
  const fh = await dh.getFileHandle(file, { create: true });
  const w = await fh.createWritable();
  // Pretty JSON (intentamos parsear y reformatear)
  let content = valueStr;
  try {
    const parsed = JSON.parse(valueStr);
    content = JSON.stringify(parsed, null, 2);
  } catch { /* no es JSON, escribimos tal cual */ }
  await w.write(content);
  await w.close();
  return true;
};

export const deleteFile = async (rawKey) => {
  if (!rootHandle) return false;
  const { dir, file } = keyToPath(rawKey);
  try {
    const dh = await getDirHandle(dir);
    await dh.removeEntry(file);
    return true;
  } catch (e) {
    if (e.name === "NotFoundError") return false;
    throw e;
  }
};

/* Lista todos los archivos JSON bajo la raíz. Devuelve claves canónicas. */
export const listAllKeys = async (prefix = "") => {
  if (!rootHandle) return [];
  const out = [];
  for await (const [dirName, dirHandle] of rootHandle.entries()) {
    if (dirHandle.kind !== "directory") continue;
    for await (const [fileName, fh] of dirHandle.entries()) {
      if (fh.kind !== "file") continue;
      if (!fileName.endsWith(".json")) continue;
      const key = pathToKey(dirName, fileName);
      // Match con el prefix flexible: aceptamos el prefix con o sin "crettohub:"
      const k = key.replace(/^crettohub:+/, "");
      if (!prefix || key.includes(prefix) || k.includes(prefix)) out.push(key);
    }
  }
  return out;
};

/* ─── Escribir metadata ─── */
export const writeMeta = async (meta) => {
  if (!rootHandle) return;
  const fh = await rootHandle.getFileHandle("_meta.json", { create: true });
  const w = await fh.createWritable();
  await w.write(JSON.stringify(meta, null, 2));
  await w.close();
};
