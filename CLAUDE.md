# Cretto Hub — Edificios

Hub interno de gestión de proyectos de **construcción de edificios** (vivienda residencial, oficinas, mixtos) para **Cretto - Expanding Brands**.

Este repo es un fork de [`Cretto-hub`](https://github.com/jgduquem-hue/Cretto-hub) — pensado originalmente para restaurantes — adaptado al alcance de edificios. La estructura base de pantallas, wizard, Gantt, EDT, CAPEX, Procurement e Informes está heredada y debe ajustarse a las particularidades de proyectos inmobiliarios.

## Skill por defecto (IMPORTANTE)

> **Antes de responder cualquier pregunta de arquitectura, presupuestos, cronograma, riesgos, stakeholders o documentos del proyecto, invoca el skill `anthropic-skills:cretto-pmi-pm`.**

Razón: el skill define el rol de PM senior bajo PMBOK 8 aplicado al modelo de proyectos Cretto. Aplica igual a edificios (con las salvedades que se enumeran en `.claude/init.md`).

Si no estás seguro de cómo invocarlo, lee primero `.claude/init.md` — ahí está el bootstrap explícito.

## Stack

- React 18 + Vite 5
- Tailwind CSS 3
- lucide-react (iconos), recharts (gráficos)
- Sin backend: persistencia vía `window.storage` con shim a `localStorage` (prefijo `crettohub::`)

## Comandos

Este entorno usa **Bun** (no hay `npm`/`node` en el PATH). Usar:

```bash
bun install         # primera vez
bun run dev         # http://localhost:5173 (o 5174 si el puerto está ocupado)
bun run build
bun run preview
```

## Estructura

- `src/main.jsx` — entrada
- `src/CrettoHub.jsx` — componente principal con todas las pantallas
- `src/CronogramaProScreen.jsx` — Gantt pro estilo MS Project (EDT, CPM, calendario, Plan/Real/Comparativo)
- `src/NewProjectWizard.jsx` — wizard de 6 pasos para crear nuevos proyectos. **Ya soporta tipos de proyecto: residencial, oficinas, mixto, restaurante, remodelación, otro.** Sponsors y arquitectos múltiples + ingenierías (estructural, suelos, hidráulica, eléctrica).
- `src/ProcurementScreen.jsx` — proveedores con WhatsApp/Gmail directos
- `src/proveedores-data.js` — listado base
- `src/storage-shim.js` — polyfill `window.storage` → `localStorage`
- `src/index.css` — Tailwind base
- `CrettoHub.jsx` (raíz) — copia legado del componente; la versión viva es `src/CrettoHub.jsx`
- `.cretto/` — assets del logo + templates de informes + playbooks PM

## Pantallas

Inicio (portafolio + KPIs), Detalle de proyecto, CAPEX, Cronograma (Gantt + EDT + Calendario), EVM, Procurement (proveedores), Informes (acta comité, mensual, cierre), Documentos (11 entregables PMI), Riesgos (matriz 5×5 + control de cambios).

Atajo global: `⌘K` / `Ctrl+K` abre command palette.

## Datos seed

Datos del proyecto **Cosette 81** (390 ítems CAPEX, 28 tareas de cronograma, 68 proveedores) están embebidos como constantes en `src/CrettoHub.jsx` (`COSETTE_81_DATA`, `CRONOGRAMA_BASE`). Estos sirven como ejemplo histórico — para edificios habrá que crear sets nuevos o eliminarlos cuando se conecte un backend.

## Lo que probablemente hay que adaptar para edificios

Esta lista NO es exhaustiva — está acá para arrancar:

1. **CAPEX 15 categorías**: las actuales son de restaurante (Equipo cocina, Menaje, etc.). Edificios necesitan: estructura, mampostería, acabados zonas comunes, ascensores, hidrosanitario, eléctrico, redes, urbanismo, etc.
2. **Hitos del proyecto**: los 12 hitos típicos Cretto van Firma → ... → Soft Opening. En edificios: Licencias urbanísticas → Cimentación → Estructura → Mampostería → Redes → Acabados → Pre-entrega → Entrega → Postventa.
3. **Stakeholders**: además de sponsor + PM + constructor + arquitecto + ingenierías (ya soportado en el wizard), edificios típicamente involucran: fiduciaria, banca de fondeo, curador urbano, vecinos / consejo comunal, copropietarios futuros.
4. **CRONOGRAMA_BASE**: actividades específicas de obra de restaurante. Para edificios hay que generar paquetes de obra por torre/piso/zona.
5. **Documentos PMI**: los 11 entregables PMBOK aplican igual, pero los anexos legales cambian (licencia de construcción → licencia urbanística + permisos sectoriales).
6. **Riesgos típicos**: licencias, vecindad, fluctuación de precio de materiales (acero, concreto), mano de obra rotativa, mayor permanencia por lluvias en estructura.
7. **EVM**: la curva S de edificios es distinta a restaurantes (curva más plana, hitos de obra más espaciados). Validar CPI/SPI con baseline.

## Notas

- Node.js 18+ requerido.
- El proyecto se servía originalmente como artifact de Claude; el shim de storage existe para que funcione idéntico en navegador real.
- Skill plugin: requiere que esté instalado en este equipo el skill `anthropic-skills:cretto-pmi-pm`. Si la sesión no lo encuentra disponible, indícalo al usuario.
