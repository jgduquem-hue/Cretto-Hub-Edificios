# Cretto Hub

Hub interno de gestión de proyectos de construcción retail/restaurante para **Cretto - Expanding Brands**.

Pantallas:

- **Inicio** — portafolio con KPIs y avance financiero/temporal por proyecto
- **Detalle de proyecto** — métricas y herramientas (CAPEX, Cronograma, EVM, Documentos, Informes, Riesgos)
- **CAPEX** — inventario completo con filtros, edición y estados
- **Cronograma** — Gantt con línea base, vista comparativa estilo MS Project
- **EVM** — CPI / SPI / CV / SV, curva S, pronóstico EAC y diagnóstico
- **Informes** — generador de actas de comité, informe mensual e informe de cierre
- **Documentos** — los 11 entregables PMI por grupo de procesos
- **Riesgos** — registro 5×5 + bitácora de control de cambios

Atajos: **⌘K** (o **Ctrl+K**) abre el command palette.

## Requisitos

- Node.js 18+ y npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre <http://localhost:5173>. El servidor recarga en caliente al editar archivos.

## Build de producción

```bash
npm run build
npm run preview
```

El build queda en `dist/`.

## Abrir en Antigravity

1. Descomprimir el zip en cualquier carpeta.
2. En Antigravity: **File → Open Folder** → seleccionar la carpeta `cretto-hub/`.
3. Abrir una terminal integrada y correr `npm install` seguido de `npm run dev`.
4. Antigravity detecta Vite automáticamente y ofrece previsualización en el panel lateral.

## Estructura

```
cretto-hub/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx          # Punto de entrada
    ├── index.css         # Tailwind + estilos base
    ├── storage-shim.js   # Polyfill de window.storage usando localStorage
    └── CrettoHub.jsx     # Componente principal con todas las pantallas
```

## Persistencia

El componente usa `window.storage` (API de Claude Artifacts). En navegador real,
`storage-shim.js` redirige las llamadas a `localStorage` con prefijo `crettohub::`,
así que los cambios en CAPEX y cronograma se mantienen entre recargas.

## Datos

Los datos del proyecto Cosette 81 (390 ítems CAPEX, 28 tareas de cronograma) están
embebidos en `CrettoHub.jsx`. Para cambiar a datos en vivo, reemplazar las constantes
`COSETTE_81_DATA` y `CRONOGRAMA_BASE` por llamadas a un backend.

## Stack

- React 18
- Vite 5
- Tailwind CSS 3
- lucide-react (iconos)
- recharts (curva S y gráficos)
