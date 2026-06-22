/* ════════════════════════════════════════════════════════════════════════════
   Cronograma Import — parsers de archivos de MS Project
   - MPP (binario): NO parseable en navegador → instrucción clara
   - XML (MS Project XML): parser completo
   - CSV: parser flexible que detecta columnas
   ════════════════════════════════════════════════════════════════════════════ */

const toISO = (date) => {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

/* Convierte duración MS Project (PT8H0M0S) a días */
const parseDurationMSProject = (dur) => {
  if (!dur) return 1;
  /* P0DT8H0M0S formato ISO duration */
  const match = dur.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 1;
  const days = parseInt(match[1] || 0);
  const hours = parseInt(match[2] || 0);
  /* MS Project asume 8h por día laboral */
  return Math.max(1, days + Math.round(hours / 8));
};

/* ─── Parser XML de MS Project ─── */
export const parseMSProjectXML = (xmlText) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const errors = doc.getElementsByTagName("parsererror");
  if (errors.length > 0) throw new Error("XML inválido");

  /* MS Project usa namespace, así que getElementsByTagName encuentra Task sin importar el prefijo */
  const tasksXml = [...doc.getElementsByTagName("Task")];
  if (tasksXml.length === 0) throw new Error("No se encontraron tareas en el XML. Verifica que sea un export de MS Project.");

  /* Buscar el nombre del proyecto */
  const projectName = doc.getElementsByTagName("Name")[0]?.textContent || "Importado";

  const getText = (parent, tag) => {
    const el = parent.getElementsByTagName(tag)[0];
    return el?.textContent || null;
  };

  /* Construir mapa de tareas */
  const tareasRaw = tasksXml.map(t => {
    const uid = getText(t, "UID");
    const id = getText(t, "ID");
    const name = getText(t, "Name");
    const start = getText(t, "Start");
    const finish = getText(t, "Finish");
    const pct = parseFloat(getText(t, "PercentComplete") || 0);
    const outlineLevel = parseInt(getText(t, "OutlineLevel") || 1);
    const isMilestone = getText(t, "Milestone") === "1";
    const isSummary = getText(t, "Summary") === "1";
    const notes = getText(t, "Notes") || "";

    /* Dependencias */
    const predLinks = [...t.getElementsByTagName("PredecessorLink")];
    const dependencies = predLinks.map(link => ({
      uid: getText(link, "PredecessorUID"),
      type: getText(link, "Type") || "1" // 1 = FS
    }));

    return {
      uid, id, name, start, finish, pct, outlineLevel,
      isMilestone, isSummary, notes, dependencies
    };
  }).filter(t => t.name && t.name.trim());

  /* Asignar IDs internos y resolver dependencias */
  let nextId = 1;
  const uidToId = new Map();
  tareasRaw.forEach(t => {
    if (!t.isSummary) {
      uidToId.set(t.uid, nextId++);
    }
  });

  /* Mapear fases por OutlineLevel 1 que son Summary */
  const fases = tareasRaw.filter(t => t.isSummary && t.outlineLevel === 1).map(t => t.name);
  const fasePorTarea = new Map();
  let faseActual = fases[0] || "Sin fase";
  tareasRaw.forEach(t => {
    if (t.isSummary && t.outlineLevel === 1) {
      faseActual = t.name;
    } else if (!t.isSummary) {
      fasePorTarea.set(t.uid, faseActual);
    }
  });

  /* Construir tareas finales (excluir summaries) */
  const tareas = tareasRaw.filter(t => !t.isSummary).map(t => {
    const inicio = toISO(t.start);
    const fin = toISO(t.finish);
    const deps = t.dependencies.map(d => uidToId.get(d.uid)).filter(Boolean);
    return {
      id: uidToId.get(t.uid),
      tarea: t.name,
      fase: fasePorTarea.get(t.uid) || "Sin fase",
      inicio, fin,
      baselineInicio: inicio, baselineFin: fin,
      avance: Math.round(t.pct),
      isMilestone: t.isMilestone,
      dep: deps,
      dependencies: deps.map(id => ({ id, type: "FS" })),
      notas: t.notes,
      color: "#1F3D2E"
    };
  });

  return { tareas, fases, projectName, total: tareas.length };
};

/* ─── Parser CSV ─── */
export const parseCSV = (csvText) => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV vacío o sin filas.");

  /* Detectar separador */
  const firstLine = lines[0];
  const separator = firstLine.includes(";") && !firstLine.includes(",")
    ? ";"
    : firstLine.includes("\t")
    ? "\t"
    : ",";

  const headers = firstLine.split(separator).map(h => h.trim().toLowerCase().replace(/[^a-záéíóúñ ]/g, ""));

  /* Mapeo flexible de nombres de columnas */
  const findCol = (...names) => {
    for (const n of names) {
      const idx = headers.findIndex(h => h.includes(n.toLowerCase()));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const idxName = findCol("name", "tarea", "actividad", "nombre");
  const idxStart = findCol("start", "inicio", "comienzo", "fecha inicio");
  const idxFinish = findCol("finish", "fin", "termina", "fecha fin");
  const idxDuration = findCol("duration", "duracion", "duración", "días");
  const idxPercent = findCol("percent complete", "completado", "avance", "% complete", "complete");
  const idxPhase = findCol("phase", "fase", "categoria", "grupo");
  const idxMilestone = findCol("milestone", "hito");
  const idxPred = findCol("predecessor", "precedente", "anterior", "depend");

  if (idxName < 0) throw new Error("CSV debe tener una columna de nombre de tarea (Name, Tarea, Actividad...).");

  const parseDate = (s) => {
    if (!s) return null;
    const cleaned = s.trim();
    /* DD/MM/YYYY o DD-MM-YYYY */
    const m1 = cleaned.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (m1) return `${m1[3]}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
    /* YYYY-MM-DD */
    const m2 = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m2) return `${m2[1]}-${m2[2].padStart(2, "0")}-${m2[3].padStart(2, "0")}`;
    const d = new Date(cleaned);
    return isNaN(d) ? null : toISO(d);
  };

  const tareas = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(separator).map(c => c.trim().replace(/^["']|["']$/g, ""));
    if (!cols[idxName]) continue;

    const inicio = idxStart >= 0 ? parseDate(cols[idxStart]) : null;
    let fin = idxFinish >= 0 ? parseDate(cols[idxFinish]) : null;
    /* Si tenemos duración pero no fin, calcular */
    if (inicio && !fin && idxDuration >= 0) {
      const dur = parseInt(cols[idxDuration]) || 1;
      const d = new Date(inicio);
      d.setDate(d.getDate() + dur);
      fin = toISO(d);
    }

    const deps = idxPred >= 0 ? (cols[idxPred] || "").split(/[,;]/).map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];

    tareas.push({
      id: i,
      tarea: cols[idxName],
      fase: idxPhase >= 0 ? cols[idxPhase] || "Sin fase" : "Sin fase",
      inicio: inicio || toISO(new Date()),
      fin: fin || toISO(new Date(Date.now() + 86400000)),
      baselineInicio: inicio,
      baselineFin: fin,
      avance: idxPercent >= 0 ? Math.round(parseFloat(cols[idxPercent]) || 0) : 0,
      isMilestone: idxMilestone >= 0 ? /si|yes|true|1/i.test(cols[idxMilestone] || "") : false,
      dep: deps,
      dependencies: deps.map(id => ({ id, type: "FS" })),
      color: "#1F3D2E"
    });
  }

  if (tareas.length === 0) throw new Error("No se pudieron extraer tareas del CSV.");

  const fases = [...new Set(tareas.map(t => t.fase))];
  return { tareas, fases, projectName: "Importado CSV", total: tareas.length };
};

/* ─── Detector de archivo MPP binario ─── */
export const isMPPBinary = async (file) => {
  /* MS Project files empiezan con un compound file header (D0 CF 11 E0 ...) */
  const buf = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buf);
  return bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0;
};

/* ─── Punto de entrada unificado ─── */
export const importarArchivo = async (file) => {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop();

  /* MPP binario — no soportado, instruir al usuario */
  if (ext === "mpp") {
    const esBinario = await isMPPBinary(file);
    throw new Error(
      esBinario
        ? "📂 El archivo .mpp es binario propietario de Microsoft Project y no se puede leer en el navegador.\n\n" +
          "✅ Solución (toma 30 segundos):\n" +
          "1. Abre tu archivo en Microsoft Project\n" +
          "2. Archivo → Guardar Como…\n" +
          "3. En 'Tipo de archivo' elige '**XML (*.xml)**'\n" +
          "4. Guarda y sube el XML aquí\n\n" +
          "El XML contiene exactamente la misma información (tareas, fechas, dependencias, avance, hitos)."
        : "El archivo no parece ser un .mpp válido."
    );
  }

  const text = await file.text();

  if (ext === "xml" || text.trim().startsWith("<?xml")) {
    return parseMSProjectXML(text);
  }

  if (ext === "csv" || ext === "tsv" || ext === "txt") {
    return parseCSV(text);
  }

  throw new Error(`Formato no soportado: .${ext}. Usa XML (export de MS Project) o CSV.`);
};

/* ─── Template CSV de referencia para el usuario ─── */
export const PLANTILLA_CSV = `Tarea,Fase,Inicio,Fin,Duración,Avance,Hito,Predecesor
Estudios y diseños,Planeación,2026-06-01,2026-08-31,90,100,No,
Licencia construcción,Planeación,2026-08-15,2026-11-30,107,60,No,1
Aprobación licencia,Planeación,2026-11-30,2026-11-30,0,0,Sí,2
Descapote,Construcción,2026-12-01,2026-12-20,20,0,No,3
Cimentación,Construcción,2026-12-20,2027-02-28,70,0,No,4
Estructura,Construcción,2027-03-01,2027-08-31,180,0,No,5
Mampostería,Construcción,2027-06-01,2027-10-31,150,0,No,6
Redes MEP,Construcción,2027-07-01,2027-12-15,165,0,No,6
Acabados,Construcción,2027-10-01,2028-01-15,105,0,No,7
Fachada,Construcción,2027-09-01,2027-12-30,120,0,No,6
Pre-entrega,Cierre,2028-01-15,2028-01-31,15,0,No,9
Entrega,Cierre,2028-02-01,2028-02-01,0,0,Sí,11
`;
