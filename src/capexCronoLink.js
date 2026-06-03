/* ────────────────────────────────────────────────────────────────
   CAPEX ↔ Cronograma link helpers
   - getValor(partida, versionId): resuelve número desde número legado
     o desde historial { historial:[{version,fecha,monto,doc}], vigenteIdx }
   - matchTareas(tareas, cronoTask): tareas del cronograma que mapean
     a un nodo WBS (por cronoTask exact match o por nombre heurístico)
   - computeEvmByWbs(partidas, tareas, wbsNode): retorna PV, EV, AC,
     SPI, CPI, status por paquete WBS
────────────────────────────────────────────────────────────────── */

/* Obtiene valor numérico desde la estructura potencialmente historizada */
export const getValor = (partida, versionId) => {
  const v = partida?.valores?.[versionId];
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "object" && Array.isArray(v.historial)) {
    const idx = v.vigenteIdx != null ? v.vigenteIdx : v.historial.length - 1;
    const item = v.historial[idx];
    return item?.monto ?? null;
  }
  return null;
};

/* Lista todas las versiones (para UI de historial) */
export const getHistorial = (partida, versionId) => {
  const v = partida?.valores?.[versionId];
  if (v == null) return [];
  if (typeof v === "number") return [{ version: "v1", fecha: null, monto: v, doc: partida?.fuentes?.[versionId] || "" }];
  if (typeof v === "object" && Array.isArray(v.historial)) return v.historial;
  return [];
};

export const getVigenteIdx = (partida, versionId) => {
  const v = partida?.valores?.[versionId];
  if (v == null) return 0;
  if (typeof v === "number") return 0;
  if (typeof v === "object" && Array.isArray(v.historial)) {
    return v.vigenteIdx != null ? v.vigenteIdx : v.historial.length - 1;
  }
  return 0;
};

/* Actualiza historial completo */
export const setHistorial = (partida, versionId, historial, vigenteIdx) => {
  const newVal = { historial, vigenteIdx: vigenteIdx != null ? vigenteIdx : historial.length - 1 };
  return { ...partida, valores: { ...partida.valores, [versionId]: newVal } };
};

/* Normaliza texto para matching (lowercase + sin acentos) */
const normalize = (s) => (s || "").toString().toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]/g, "");

/* Hace match entre cronoTask (string) y tareas del cronograma.
   Prioridad: t.wbsKey exact → t.nombre contiene cronoTask normalizado */
export const matchTareas = (tareas, cronoTask) => {
  if (!cronoTask || !tareas?.length) return [];
  const key = normalize(cronoTask);
  const exact = tareas.filter(t => normalize(t.wbsKey) === key);
  if (exact.length) return exact;
  return tareas.filter(t => normalize(t.nombre).includes(key));
};

/* Promedio ponderado de avance de un conjunto de tareas, por duración */
export const avanceTareas = (tareas) => {
  if (!tareas?.length) return 0;
  let totalDur = 0, sumPond = 0;
  tareas.forEach(t => {
    const ini = new Date(t.inicio);
    const fin = new Date(t.fin);
    const dur = Math.max(1, (fin - ini) / 86400000);
    totalDur += dur;
    sumPond += dur * (t.avance || 0);
  });
  return totalDur > 0 ? sumPond / totalDur : 0;
};

/* Avance planeado (PV%) hoy = (días transcurridos / días totales) capeado en [0,100] */
export const avancePlaneado = (tareas, hoyDate) => {
  if (!tareas?.length) return 0;
  const hoy = hoyDate || new Date();
  let totalDur = 0, sumPond = 0;
  tareas.forEach(t => {
    const ini = new Date(t.inicio);
    const fin = new Date(t.fin);
    const dur = Math.max(1, (fin - ini) / 86400000);
    const trans = Math.max(0, Math.min(dur, (hoy - ini) / 86400000));
    const pctPlan = (trans / dur) * 100;
    totalDur += dur;
    sumPond += dur * pctPlan;
  });
  return totalDur > 0 ? sumPond / totalDur : 0;
};

/* EVM por paquete WBS:
   - Budget BAC = constructor (vigente) || inicial
   - PV = BAC × % planeado
   - EV = BAC × % real
   - AC = ejecutado (vigente)
   - CPI = EV / AC, SPI = EV / PV */
export const computeEvmByWbs = (partidas, tareas, wbsNode, opts = {}) => {
  const hoy = opts.hoy || new Date();
  const matched = matchTareas(tareas, wbsNode.cronoTask);
  const partidaIds = [wbsNode.id, ...(wbsNode.sub || []).map(s => s.id)];
  const ps = partidas.filter(p => partidaIds.includes(p.wbs));

  let bac = 0, ac = 0, inicial = 0;
  ps.forEach(p => {
    const constr = getValor(p, "constructor");
    const ini = getValor(p, "inicial") || 0;
    bac += constr != null ? constr : ini;
    inicial += ini;
    ac += getValor(p, "ejecutado") || 0;
  });

  const pctReal = avanceTareas(matched);
  const pctPlan = avancePlaneado(matched, hoy);
  const ev = bac * (pctReal / 100);
  const pv = bac * (pctPlan / 100);
  const cpi = ac > 0 ? ev / ac : null;
  const spi = pv > 0 ? ev / pv : null;
  const cv = ev - ac;
  const sv = ev - pv;
  const eac = cpi && cpi > 0 ? bac / cpi : bac;
  const vac = bac - eac;

  let status = "OK";
  if (cpi != null && cpi < 0.9) status = "Sobrecosto";
  else if (spi != null && spi < 0.9) status = "Atraso";
  else if (cpi != null && cpi < 1 && spi != null && spi < 1) status = "Atención";

  return {
    wbs: wbsNode.id,
    label: wbsNode.label,
    cronoTask: wbsNode.cronoTask,
    partidas: ps,
    tareas: matched,
    bac, inicial, ac, ev, pv, cpi, spi, cv, sv, eac, vac,
    pctReal, pctPlan,
    status
  };
};

/* Rollup global */
export const computeEvmGlobal = (partidas, tareas, wbsNodes, opts) => {
  const rows = wbsNodes.map(n => computeEvmByWbs(partidas, tareas, n, opts));
  const totals = rows.reduce((a, r) => ({
    bac: a.bac + (r.bac || 0),
    ac: a.ac + (r.ac || 0),
    ev: a.ev + (r.ev || 0),
    pv: a.pv + (r.pv || 0)
  }), { bac: 0, ac: 0, ev: 0, pv: 0 });
  totals.cpi = totals.ac > 0 ? totals.ev / totals.ac : null;
  totals.spi = totals.pv > 0 ? totals.ev / totals.pv : null;
  totals.cv = totals.ev - totals.ac;
  totals.sv = totals.ev - totals.pv;
  totals.eac = totals.cpi && totals.cpi > 0 ? totals.bac / totals.cpi : totals.bac;
  totals.vac = totals.bac - totals.eac;
  return { rows, totals };
};
