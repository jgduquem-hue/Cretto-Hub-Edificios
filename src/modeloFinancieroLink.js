import { getValor, matchTareas } from "./capexCronoLink.js";

/* ────────────────────────────────────────────────────────────────
   Modelo Financiero ← CAPEX/Cronograma
   - rollupCapex(partidas, versionId): total egreso por capítulo y total
   - distribuyeFlujo(partidas, tareas, versionId, opts):
     curva mensual de egresos derivada de fechas del cronograma.
     Si no hay tareas mapeadas, distribuye uniforme sobre el rango
     del modelo (opts.inicio, opts.fin).
   - distribuyeIngresos: curva de ingresos por preventas
     (modelo simple: arranca tras punto de equilibrio, lineal)
────────────────────────────────────────────────────────────────── */

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (d) => d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });

const monthsBetween = (a, b) => {
  const out = [];
  const cur = new Date(a.getFullYear(), a.getMonth(), 1);
  while (cur <= b) {
    out.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
};

/* Distribuye un monto entre los meses cubiertos por [iniDate, finDate]
   proporcional al número de días que caen en cada mes */
const distribuyeEntreFechas = (monto, iniDate, finDate, acc) => {
  if (!monto || monto <= 0) return;
  const totalDias = Math.max(1, (finDate - iniDate) / 86400000);
  const cur = new Date(iniDate);
  while (cur <= finDate) {
    const finMes = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    const corte = finMes < finDate ? finMes : finDate;
    const dias = ((corte - cur) / 86400000) + 1;
    const k = monthKey(cur);
    acc[k] = (acc[k] || 0) + monto * (dias / totalDias);
    cur.setDate(1);
    cur.setMonth(cur.getMonth() + 1);
  }
};

/* Rollup CAPEX por capítulo, usando una versión específica */
export const rollupCapex = (partidas, versionId = "constructor") => {
  const porCapitulo = {};
  let total = 0;
  partidas.forEach(p => {
    const v = getValor(p, versionId) ?? getValor(p, "inicial") ?? 0;
    porCapitulo[p.capitulo] = (porCapitulo[p.capitulo] || 0) + v;
    total += v;
  });
  return { porCapitulo, total };
};

/* Distribución temporal de egresos */
export const distribuyeFlujo = (partidas, tareas, versionId = "constructor", opts = {}) => {
  const acc = {};
  const fallbackIni = opts.inicio ? new Date(opts.inicio) : new Date();
  const fallbackFin = opts.fin ? new Date(opts.fin) : new Date(fallbackIni.getFullYear() + 2, fallbackIni.getMonth(), 1);

  partidas.forEach(p => {
    const monto = getValor(p, versionId) ?? getValor(p, "inicial") ?? 0;
    if (monto <= 0) return;
    // Buscar tarea(s) en el cronograma por wbs/cronoTask
    const matched = matchTareas(tareas, p.cronoTask || p.wbs);
    if (matched.length > 0) {
      // Distribuir por cada tarea
      matched.forEach(t => {
        const ini = new Date(t.inicio);
        const fin = new Date(t.fin);
        distribuyeEntreFechas(monto / matched.length, ini, fin, acc);
      });
    } else {
      // Fallback: distribuir uniforme en el rango global
      distribuyeEntreFechas(monto, fallbackIni, fallbackFin, acc);
    }
  });

  // Construir array ordenado
  const meses = Object.keys(acc).sort();
  let acumulado = 0;
  return meses.map(k => {
    const [y, m] = k.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    const egresoMes = Math.round(acc[k]);
    acumulado += egresoMes;
    return { key: k, mes: monthLabel(date), date, egresoMes, egresoAcum: acumulado };
  });
};

/* Distribución temporal de ingresos (preventas)
   Modelo simple: comienza X meses después de inicio comercial, lineal
   hasta entrega + saldo a escrituración */
export const distribuyeIngresos = (totalIngreso, opts = {}) => {
  const ini = opts.inicioPreventas ? new Date(opts.inicioPreventas) : new Date();
  const fin = opts.fechaEntrega ? new Date(opts.fechaEntrega) : new Date(ini.getFullYear() + 2, ini.getMonth(), 1);
  const escritura = opts.fechaEscrituracion ? new Date(opts.fechaEscrituracion) : fin;

  const acc = {};
  // 30% en preventas (ini → fin), 70% en escrituración (fin → escritura+3 meses)
  distribuyeEntreFechas(totalIngreso * 0.30, ini, fin, acc);
  const escritFin = new Date(escritura);
  escritFin.setMonth(escritFin.getMonth() + 3);
  distribuyeEntreFechas(totalIngreso * 0.70, escritura, escritFin, acc);

  const meses = Object.keys(acc).sort();
  let acumulado = 0;
  return meses.map(k => {
    const [y, m] = k.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    const ingresoMes = Math.round(acc[k]);
    acumulado += ingresoMes;
    return { key: k, mes: monthLabel(date), date, ingresoMes, ingresoAcum: acumulado };
  });
};

/* Fusiona ingresos y egresos en un solo array por mes */
export const mergeFlujo = (ingresos, egresos) => {
  const map = {};
  ingresos.forEach(r => { map[r.key] = { ...map[r.key], key: r.key, mes: r.mes, ingresoMes: r.ingresoMes, ingresoAcum: r.ingresoAcum }; });
  egresos.forEach(r => { map[r.key] = { ...map[r.key], key: r.key, mes: r.mes, egresoMes: r.egresoMes, egresoAcum: r.egresoAcum }; });
  const keys = Object.keys(map).sort();
  let ingAc = 0, egAc = 0;
  return keys.map(k => {
    const r = map[k];
    ingAc = r.ingresoAcum ?? ingAc;
    egAc = r.egresoAcum ?? egAc;
    return {
      mes: r.mes,
      key: k,
      ingresosMes: r.ingresoMes || 0,
      egresosMes: r.egresoMes || 0,
      ingresos: ingAc,
      egresos: egAc,
      neto: ingAc - egAc
    };
  });
};

/* Default mapping por tipo de modelo → versión CAPEX a usar */
export const DEFAULT_VERSION_BY_TIPO = {
  proyecto:      "constructor",   // visión interna realista
  fiducia:       "inicial",       // congelado a lo entregado al P.A.
  inversionista: "inicial",       // ancla del business case original
  banco:         "constructor",   // covenants vs contrato vigente
  ejecutado:     "ejecutado",     // real al cierre
  custom:        "constructor"
};
