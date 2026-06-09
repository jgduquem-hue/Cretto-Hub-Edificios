/* ────────────────────────────────────────────────────────────────
   Notion Sync — metadata del puente entre hub y Notion
   Fuente: Tasks [PPMP] · Casa 107 (G Arquitectura workspace)
────────────────────────────────────────────────────────────────── */

export const NOTION_SOURCE = {
  workspace: "G Arquitectura",
  databaseUrl: "https://app.notion.com/p/302a7ed67f6183f2a2ec81b35667fce2",
  dataSourceId: "collection://194a7ed6-7f61-8337-9724-07ce9041ae6e",
  projectPageId: "374a7ed67f61804f86d8f433472f73d2",
  projectName: "Casa 107"
};

/* Team members URL → Name (Team [PPMP] data source) */
export const TEAM_MEMBERS = {
  "374a7ed67f618060becac5bf86dfee8b": { nombre: "Hector Gaviria",          rol: "Sponsor + GP Promotor", iniciales: "HG" },
  "374a7ed67f618055a1a2d5aa9c1a6033": { nombre: "Juan Diego Duque",        rol: "Inversionista",          iniciales: "JDD" },
  "374a7ed67f618050815ce1601caa9ae9": { nombre: "Paola Lima",              rol: "Comercial / Comercializadora", iniciales: "PL" },
  "374a7ed67f6180e58f5aeea6fcf837c0": { nombre: "Sandra Sandoval",         rol: "Contable / Sec. Hacienda", iniciales: "SS" },
  "374a7ed67f6180238ad0f6d160eab272": { nombre: "Alvaro Andrade",          rol: "Interventoría",          iniciales: "AA" },
  "374a7ed67f6180d9ba2befa65e6554f3": { nombre: "Diego Garcia",            rol: "Gestor licencias",       iniciales: "DG" },
  "374a7ed67f61805ab75ef3518cd9b185": { nombre: "Lizeth Gaona",            rol: "Legal — lotes/RPH",      iniciales: "LG" },
  "374a7ed67f61802b95a8ce14461fa3ee": { nombre: "Pablo Ruiz",              rol: "Coordinador técnico",    iniciales: "PR" },
  "374a7ed67f61801aba63d98e9955682d": { nombre: "Maria Fernanda Arango",   rol: "Legal — fiducia",        iniciales: "MFA" },
  "a33a7ed67f61825c83e3817fa45723d2": { nombre: "Jose Duque",              rol: "Project Director (PM Cretto)", iniciales: "JD" },
  "374a7ed67f6180b09e23d0a796a24c7f": { nombre: "Laura Robles",            rol: "Administrativa G Arquitectura", iniciales: "LR" },
  "374a7ed67f6180b89b5fef1e0aa20cc6": { nombre: "Daniella Sánchez",        rol: "Coordinadora BIM",       iniciales: "DS" }
};

export const resolveAssignee = (url) => {
  if (!url) return "";
  const id = url.replace("https://app.notion.com/p/", "").replace(/-/g, "");
  return TEAM_MEMBERS[id]?.nombre || "Por asignar";
};

/* Mapping hub.id → notionPageId (37 tareas Casa 107) */
export const HUB_TO_NOTION_ID = {
  1:  "f3fa7ed67f61837da3dc01f46e09c411", // Finalizar Proceso Segmentación Fiducia
  2:  "a41a7ed67f6182d683060163163d0180", // Reunión Abogados - Segmentación
  3:  "441a7ed67f618314a0968194bc17b334", // Reunión Fiducia - Definición Constructor
  4:  "cb5a7ed67f618247a7b201a0589ad50e", // Radicación Final de Crédito al Banco
  5:  "374a7ed67f6180f2a0bbc7d017fd3042", // Flujo de caja
  6:  "7aea7ed67f6183dfa0aa81e64564215c", // Entrega de Póliza Decenal
  7:  "e8da7ed67f61835e942e813e71624a2e", // Reunión con Asesor Angela Gaitán
  8:  "ab0a7ed67f61831cbb0f81a35187c1d3", // Reunión con Asesor Nicolás Cadena
  9:  "46ba7ed67f618246b21e8179003021b8", // Notificación de Desalojo
  10: "374a7ed67f6180ed8094f3f5eed2479c", // Actas de Vecindad
  11: "374a7ed67f6180a2ac22d333a706b66f", // Englobar Lotes
  12: "087a7ed67f61838d9d708160b7c745fc", // Cancelación de RPH
  13: "374a7ed67f6180a28751e7d515dc61fb", // Entregar Cuadros Comparativos
  14: "8d8a7ed67f61821dba62014d5206abc0", // Licitación de Pilotaje
  15: "67ca7ed67f6182a7810081054f19d465", // Licitación de Eléctrico
  16: "3baa7ed67f6182468c23017b527381c6", // Licitación de Ventanería
  17: "374a7ed67f61805b9510eaf2996c8aae", // Finalizar Presupuesto Obra Gris
  18: "374a7ed67f6180168342d1486befef89", // Expedición Licencia de construcción
  19: "374a7ed67f61800d8875d787e3a581ed", // Inscripción en secretaria de Hacienda
  20: "2cca7ed67f618341af68814e0c14ddbf", // Soterrar redes eléctricas
  21: "1eca7ed67f6183889e3781753efd9679", // Firmar actas de cada Unidad
  22: "374a7ed67f6180d0bc19ec4353ab3b05", // Definir la app de firma
  23: "1e0a7ed67f618253ae7201306fea0848", // PMT
  24: "029a7ed67f61821289c501aa9879e5d9", // Radicación Formal de FAI
  /* Nuevas (pulled live 8-jun-2026): */
  25: "374a7ed67f61805fbbfcf1be86d38c94", // Reunión para definir Segmentación
  26: "374a7ed67f61800e909be8416af68623", // Diligenciamiento de formatos
  27: "374a7ed67f618004ba3bd87cae89fb88", // Invitación a deuda privada
  28: "374a7ed67f618047b196cebb16389cdc", // Documentación para subir a Drive
  29: "374a7ed67f6180ff8d85f10597eb3c3f", // Revisión de contrato de acabado
  30: "374a7ed67f61805f9d1cd9bd55734c4c", // IDU revisión alcance sobre anden
  31: "374a7ed67f61800ea487ecaeff20720b", // Cerrar plantas arquitectónica
  32: "374a7ed67f6180049d41d783e679a19b", // Conciliación Factibilidad vs Flujo
  33: "374a7ed67f6180cc9f3dd76ba5526610", // Revisión de chequeo Técnico
  34: "374a7ed67f61804d9036ff7735ed9c1d", // Modificación encargo de preventas
  35: "374a7ed67f6180c79850c567d0238ab8", // Entrega planos estructurales Daniella→Laura
  36: "374a7ed67f61806cac9bc23ee1676789", // Envio Comercial listado unidades
  37: "374a7ed67f6180638fb8c20bbd9f9313"  // Corregir Póliza contratos de acabados
};

export const notionUrl = (pageId) => `https://www.notion.so/${(pageId || "").replace(/-/g, "")}`;

export const SYNC_META = {
  ultimoPullDesdeNotion: "2026-06-08T17:00:00Z",
  ultimoPushAnotion: null,
  totalTareasNotion: 37,
  notas: "Pull completo de Tasks [PPMP] · Casa 107 (37 tareas, 12 team members). Pídele a Claude 'trae cambios de Notion' o 'sube cambios al Notion' para sincronizar."
};
