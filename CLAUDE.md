# Cretto Hub

Hub interno de gestión de proyectos de construcción retail/restaurante para **Cretto - Expanding Brands**.

## Stack

- React 18 + Vite 5
- Tailwind CSS 3
- lucide-react (iconos), recharts (gráficos)
- Sin backend: persistencia vía `window.storage` con shim a `localStorage` (prefijo `crettohub::`)

## Comandos

Este entorno usa **Bun** (no hay `npm`/`node` en el PATH). Usar:

```bash
bun install         # primera vez
bun run dev         # http://localhost:5173
bun run build
bun run preview
```

## Estructura

- `src/main.jsx` — entrada
- `src/CrettoHub.jsx` — componente principal con todas las pantallas
- `src/storage-shim.js` — polyfill `window.storage` → `localStorage`
- `src/index.css` — Tailwind base
- `CrettoHub.jsx` (raíz) — copia legado del componente; la versión viva es `src/CrettoHub.jsx`

## Pantallas

Inicio (portafolio + KPIs), Detalle de proyecto, CAPEX, Cronograma (Gantt + línea base), EVM (CPI/SPI/CV/SV + curva S + EAC), Informes (acta comité, mensual, cierre), Documentos (11 entregables PMI), Riesgos (matriz 5×5 + control de cambios).

Atajo global: `⌘K` / `Ctrl+K` abre command palette.

## Datos

Datos del proyecto **Cosette 81** (390 ítems CAPEX, 28 tareas de cronograma) embebidos como constantes `COSETTE_81_DATA` y `CRONOGRAMA_BASE` en `src/CrettoHub.jsx`. Para datos en vivo, reemplazar por llamadas a backend.

## Notas

- Node.js 18+ requerido.
- El proyecto se servía originalmente como artifact de Claude; el shim de storage existe para que funcione idéntico en navegador real.
