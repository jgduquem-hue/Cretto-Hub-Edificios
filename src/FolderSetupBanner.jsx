import React, { useState, useEffect } from "react";
import { Folder, FolderOpen, AlertCircle, CheckCircle2, X, Download, RefreshCw } from "lucide-react";
import {
  isFsaSupported, tryRestoreFolder, hasSavedHandle, pickFolder,
  reconnectFolder, getCurrentFolderName, forgetFolder
} from "./fsAdapter.js";
import { migrarLocalStorageACarpeta } from "./migracionLocalStorage.js";

/* ────────────────────────────────────────────────────────────────
   FolderSetupBanner — muestra el estado de la persistencia local
   en carpeta del disco. Aparece arriba del hub.
   Estados:
   - sin soporte FSA (Safari/Firefox): banner amber + export manual
   - FSA OK pero sin carpeta configurada: banner emerald CTA
   - FSA OK con handle guardado pero sin permiso vigente: banner blue Reconectar
   - Carpeta conectada: chip discreto en esquina superior
────────────────────────────────────────────────────────────────── */

const FolderSetupBanner = ({ onReady }) => {
  const [estado, setEstado] = useState("checking"); // checking|no-soporte|sin-carpeta|reconectar|conectada
  const [folderName, setFolderName] = useState(null);
  const [oculto, setOculto] = useState(false);
  const [migrando, setMigrando] = useState(false);
  const [resultadoMig, setResultadoMig] = useState(null);

  /* Probar restaurar al montar */
  useEffect(() => {
    (async () => {
      if (!isFsaSupported()) {
        setEstado("no-soporte");
        return;
      }
      const name = await tryRestoreFolder();
      if (name) {
        setFolderName(name);
        setEstado("conectada");
        if (onReady) onReady(name);
        return;
      }
      const tieneHandle = await hasSavedHandle();
      setEstado(tieneHandle ? "reconectar" : "sin-carpeta");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = async () => {
    try {
      const name = await pickFolder();
      setFolderName(name);
      setEstado("conectada");
      // Migrar localStorage la primera vez
      setMigrando(true);
      const res = await migrarLocalStorageACarpeta();
      setResultadoMig(res);
      setMigrando(false);
      if (onReady) onReady(name);
    } catch (e) {
      if (e.name !== "AbortError") alert("No se pudo abrir la carpeta: " + e.message);
    }
  };

  const handleReconnect = async () => {
    const name = await reconnectFolder();
    if (name) {
      setFolderName(name);
      setEstado("conectada");
      if (onReady) onReady(name);
    } else {
      alert("No se pudo retomar la carpeta. Selecciona una nueva.");
      setEstado("sin-carpeta");
    }
  };

  const handleExportJSON = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("crettohub::")) data[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cretto-Hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (oculto && estado === "conectada") return <FolderChip name={folderName} />;

  /* Chip discreto cuando todo OK */
  if (estado === "conectada" && !resultadoMig) {
    return <FolderChip name={folderName} onForget={async () => { await forgetFolder(); setEstado("sin-carpeta"); setFolderName(null); }} />;
  }

  return (
    <>
      {/* Estado: navegador no soporta FSA */}
      {estado === "no-soporte" && (
        <Banner color="amber" icon={AlertCircle}>
          <div className="flex-1">
            <strong>Persistencia limitada</strong> — Tu navegador (Safari/Firefox) no soporta guardado en carpeta del disco. Los datos viven solo en este navegador.
            <span className="ml-2 text-[12px] opacity-80">Sugerencia: usa Chrome / Edge / Brave para guardado en carpeta. Mientras tanto, haz backups manuales.</span>
          </div>
          <button onClick={handleExportJSON} className="inline-flex items-center gap-1 rounded-md bg-amber-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-amber-800">
            <Download className="h-3.5 w-3.5" /> Exportar backup
          </button>
        </Banner>
      )}

      {/* Estado: sin carpeta configurada */}
      {estado === "sin-carpeta" && (
        <Banner color="emerald" icon={Folder}>
          <div className="flex-1">
            <strong>Configura una carpeta para guardar tus datos</strong> — Los cambios se escribirán como archivos JSON ahí. Backup = copiar la carpeta. Funciona sin internet.
            <span className="ml-2 text-[12px] opacity-80">Sugerencia: <code className="rounded bg-emerald-200 px-1">~/Documents/Cretto-Hub</code> o una carpeta en tu Drive/iCloud.</span>
          </div>
          <button onClick={handlePick} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-800">
            <FolderOpen className="h-3.5 w-3.5" /> Elegir carpeta
          </button>
        </Banner>
      )}

      {/* Estado: handle guardado pero falta gesto de permiso */}
      {estado === "reconectar" && (
        <Banner color="blue" icon={RefreshCw}>
          <div className="flex-1">
            <strong>Reconectar tu carpeta de datos</strong> — Tu navegador necesita un click para retomar el acceso a la carpeta que ya configuraste.
          </div>
          <button onClick={handleReconnect} className="inline-flex items-center gap-1 rounded-md bg-blue-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-blue-800">
            <RefreshCw className="h-3.5 w-3.5" /> Reconectar
          </button>
          <button onClick={async () => { await forgetFolder(); setEstado("sin-carpeta"); }} className="text-[11px] text-blue-700 hover:underline ml-2">Olvidar y elegir otra</button>
        </Banner>
      )}

      {/* Migración corriendo o completada */}
      {migrando && (
        <Banner color="blue" icon={RefreshCw}>
          <span>Migrando datos de localStorage a la carpeta…</span>
        </Banner>
      )}
      {resultadoMig && !migrando && (
        <Banner color="emerald" icon={CheckCircle2}>
          <div className="flex-1">
            <strong>Migración completada</strong> — {resultadoMig.ok}/{resultadoMig.total} archivos guardados en <code className="rounded bg-emerald-200 px-1">{folderName}</code>. {resultadoMig.fail > 0 && <span className="text-rose-700">{resultadoMig.fail} con error.</span>}
          </div>
          <button onClick={() => setResultadoMig(null)} className="rounded p-1 text-emerald-800 hover:bg-emerald-200"><X className="h-3.5 w-3.5" /></button>
        </Banner>
      )}
    </>
  );
};

const Banner = ({ color, icon: Icon, children }) => {
  const colors = {
    amber:   "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    blue:    "border-blue-200 bg-blue-50 text-blue-900"
  };
  return (
    <div className={`flex items-center gap-3 border-b px-6 py-2 text-[13px] ${colors[color]}`}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      {children}
    </div>
  );
};

const FolderChip = ({ name, onForget }) => (
  <div className="border-b border-stone-100 bg-emerald-50/40 px-6 py-1 text-[11px] text-emerald-800 flex items-center gap-2">
    <FolderOpen className="h-3 w-3" />
    <span>Guardando en: <strong className="font-mono">{name}</strong></span>
    {onForget && (
      <button onClick={onForget} className="ml-auto text-[10px] text-emerald-700 hover:underline">Desconectar carpeta</button>
    )}
  </div>
);

export default FolderSetupBanner;
