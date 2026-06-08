import { writeFile, writeMeta } from "./fsAdapter.js";

/* ────────────────────────────────────────────────────────────────
   Migración one-shot:
   lee TODAS las claves de localStorage con prefijo crettohub::
   y las escribe como archivos JSON en la carpeta seleccionada.
   Se ejecuta al configurar la carpeta por primera vez.
────────────────────────────────────────────────────────────────── */

const PREFIX = "crettohub::";

export const migrarLocalStorageACarpeta = async () => {
  const claves = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) {
      const value = localStorage.getItem(k);
      if (value != null) claves.push({ k: k.slice(PREFIX.length), v: value });
    }
  }

  const resultados = { ok: 0, fail: 0, total: claves.length, errores: [] };
  for (const { k, v } of claves) {
    try {
      // El shim usa "crettohub::" como prefijo en localStorage; pasamos sin prefijo al writeFile (lo mapea internamente)
      await writeFile(k, v);
      resultados.ok++;
    } catch (e) {
      resultados.fail++;
      resultados.errores.push({ clave: k, error: e.message });
    }
  }

  try {
    await writeMeta({
      version: 1,
      app: "Cretto Hub",
      ultimaMigracion: new Date().toISOString(),
      fuente: "localStorage",
      totalClaves: resultados.total,
      ok: resultados.ok,
      fail: resultados.fail
    });
  } catch {}

  return resultados;
};
