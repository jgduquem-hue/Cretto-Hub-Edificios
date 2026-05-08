# Template 11 — Informe de Cierre e Integración (versión ampliada)

> Versión enriquecida tras el ejercicio Cosette 81. Este template reemplaza al original del skill cretto-pmi-pm.

## Cuándo usar

Al **cierre formal del proyecto**, cuando el restaurante ya está operando y el punch list está cerrado o con plan de resolución aprobado. Es el documento más importante del archivo histórico de cada proyecto Cretto.

## Filosofía del informe

El informe de cierre Cretto debe ser **explícito, crudo y reflexivo**. No es un documento comercial. Es un documento técnico que:

1. **Cuantifica con rigor** lo ejecutado vs lo planeado.
2. **Atribuye responsabilidades** a cada actor (cliente, arquitecto, constructor, PM, normativa, imprevistos técnicos).
3. **Convierte cada sobrecosto en una lección aprendida** accionable para próximos proyectos.
4. **Hace recomendaciones contractuales y operativas** para mejorar el modelo Cretto.
5. **Sirve como caso histórico** para futuros proyectos del mismo cliente o del mismo modelo de marca.

Su extensión debe ser considerable cuando el proyecto lo amerita. No se sacrifica profundidad por brevedad.

---

## Estructura del informe ampliado

```
INFORME DE CIERRE E INTEGRACIÓN — [PROYECTO]
══════════════════════════════════════════════════════════════════
(CLOSE PROJECT REPORT — PMI/PMBOK 8 — Modelo Cretto Expanding Brands)

Encabezado:
  · Logo Cretto sutil
  · Nombre del proyecto, cliente, dirección
  · Fecha del informe, fecha de cierre operativo
  · Project Manager, sponsor
  · Estándar aplicado: PMI / PMBOK 8

──────────────────────────────────────────────────────────────────

1. RESUMEN EJECUTIVO (1 página)
   1.1 Veredicto del proyecto (1 párrafo crudo: cómo nos fue, qué aprendimos)
   1.2 Cifras clave: CAPEX inicial vs ejecutado, % desviación, días de demora
   1.3 Top 3 lecciones aprendidas
   1.4 Top 3 recomendaciones contractuales para próximos proyectos
   1.5 Estado al cierre: 🟢/🟡/🔴

──────────────────────────────────────────────────────────────────

2. FICHA TÉCNICA DEL PROYECTO
   · Nombre, cliente, dirección, ciudad, área m², capacidad puestos
   · CAPEX/puesto, CAPEX/m² (benchmark vs proyectos anteriores)
   · Project Manager, ciclo de vida aplicado
   · Fechas: contrato firmado, inicio de obra, soft opening planeado, soft opening real, cierre formal

──────────────────────────────────────────────────────────────────

3. ANÁLISIS FINANCIERO — CONSTRUCCIÓN (CONTRATO CONSTRUCTOR)
   
   Objetivo: análisis EXPLÍCITO Y DETALLADO del contrato de obra.
   Fuente de verdad: presupuesto detallado del constructor (no el CAPEX general).

   3.1 Resumen total inicial vs ejecutado
       · BAC (presupuesto inicial constructor) vs AC (ejecutado real)
       · Variación absoluta y %
       · Semáforo (umbral 10% / 15% / 20%)
       · Nota PM con interpretación (3-5 párrafos)
   
   3.2 Comparativo por capítulo (los 15 capítulos típicos)
       Tabla con: capítulo | inicial | ejecutado | Δ$ | Δ% | # adicionales | # eliminaciones | semáforo
       Incluir totales de directos + indirectos + total con verificación de coherencia.
   
   3.3 ANÁLISIS DETALLADO POR CAPÍTULO
       Para CADA capítulo (especialmente los 5 con mayor desviación absoluta y los 3 con mayor ahorro):
       
       3.3.x.1 Cifras (inicial, ejecutado, delta, %)
       3.3.x.2 Items adicionales detectados con su origen:
              · Cliente / Arquitecto / Constructor / Imprevisto técnico / Normativo
       3.3.x.3 Items eliminados o reducidos
       3.3.x.4 Análisis del PM (3-6 párrafos): qué pasó, por qué, quién es responsable
       3.3.x.5 Lecciones aprendidas específicas del capítulo
   
   3.4 Análisis de costos indirectos del constructor
       · % indirectos contractual vs ejecutado
       · Cálculo del ahorro de canalización directa (si aplica)
   
   3.5 Taxonomía del sobrecosto (descomposición por causa raíz)
       Tabla: causa raíz | $ aprox | % del sobrecosto total | responsable
       Categorías: imprecisión por presupuesto incompleto del constructor, omisión técnica del constructor,
       scope creep cliente, cambio de diseño arquitecto, retrabajos, mayor permanencia, normativo,
       imprevistos técnicos.

──────────────────────────────────────────────────────────────────

4. ANÁLISIS FINANCIERO — CAPEX GENERAL (si aplica)
   
   Si existe CAPEX general del cliente con todas las categorías:
   
   4.1 Comparativo por categoría (las 14-15 estándar)
       Tabla con: categoría | inicial | ejecutado | Δ$ | Δ% | semáforo | nota
   4.2 Ajustes de cierre del CAPEX (eliminaciones por doble contabilidad u otros)
   4.3 Cálculo final CAPEX/puesto y CAPEX/m² para benchmark histórico
   
   Si NO hay CAPEX general comparativo (caso Cosette 81):
   · Indicar el alcance del informe (solo construcción).
   · Reportar valor total ejecutado del proyecto (suma de todos los rubros conocidos).

──────────────────────────────────────────────────────────────────

5. ANÁLISIS DEL CRONOGRAMA
   
   5.1 Línea base vs ejecución
       Tabla con hitos: fecha plan inicial | fecha plan revisada PM | fecha real | desviación días
       Hitos típicos: licencia, demolición, cimentación, mampostería, MEP, acabados, equipos cocina,
       pruebas pre-operativas, soft opening, cierre formal.
   
   5.2 Identificación de la ruta crítica real
       · Qué capítulo/disciplina fue el cuello de botella efectivo.
       · Comparar con la ruta crítica planeada.
   
   5.3 ATRIBUCIÓN DE LA DEMORA
       Tabla: causa | días aprox | atribuible a (Constructor / Cliente / Arquitecto / PM / Normativo / Imprevisto)
       Suma debe coincidir con la desviación total.
       Cada causa debe tener 1-2 párrafos de explicación detallada.
   
   5.4 Acciones correctivas implementadas durante obra
       Fast-tracking, crashing, gestión de holguras, paralelización de actividades.

──────────────────────────────────────────────────────────────────

6. GESTIÓN DEL ALCANCE Y CALIDAD
   
   6.1 Validación del alcance
       · Entregables aceptados.
       · Entregables con ajustes post-apertura.
       · Scope creep identificado con impacto financiero cuantificado por origen.
   
   6.2 Reporte de calidad
       · Conformidad general.
       · No conformidades detectadas y corregidas.
       · No conformidades abiertas (punch list) con plan de resolución.
       · Oportunidades de mejora detectadas para próximos proyectos.

──────────────────────────────────────────────────────────────────

7. GESTIÓN DE RIESGOS E INCIDENTES
   
   Tabla riesgos: descripción | probabilidad inicial | impacto | respuesta | estado final
   Resumen: identificados, materializados, mitigados, abiertos al cierre.
   
   Sección especial: ROBOS y/o INCIDENTES OPERATIVOS durante obra (si aplica).

──────────────────────────────────────────────────────────────────

8. GESTIÓN DE STAKEHOLDERS
   
   8.1 Satisfacción final del cliente: 🟢/🟡/🔴 con justificación
   8.2 Calidad de relación con el constructor: anotaciones del PM
   8.3 Calidad de relación con el arquitecto: anotaciones del PM
   8.4 Áreas de mejora en comunicación

──────────────────────────────────────────────────────────────────

9. CAMBIOS APROBADOS DURANTE EL PROYECTO
   
   · Total de cambios formales (Solicitudes de Cambio en Obra firmadas).
   · Cambios sin SCO (decisiones tomadas sin proceso formal — riesgo).
   · Impacto financiero neto de cambios formales.
   · Top 5 cambios más impactantes con análisis.

──────────────────────────────────────────────────────────────────

10. LECCIONES APRENDIDAS (sección extensa)
    
    Formato por lección:
    LL-N: [título conciso]
    Categoría: [presupuestal / cronograma / contractual / técnico / stakeholder / normativo]
    → Situación observada en este proyecto.
    → Lección aprendida (qué entendimos).
    → Acción concreta para próximos proyectos.
    → Responsable de implementar la acción.
    
    Mínimo 10 lecciones para un proyecto de tamaño medio (300-500 m²).
    Mínimo 15 para un proyecto grande o con sobrecosto significativo.

──────────────────────────────────────────────────────────────────

11. RECOMENDACIONES CONTRACTUALES Y OPERATIVAS PARA PRÓXIMOS PROYECTOS
    
    Sección donde el PM hace recomendaciones de cambio al modelo Cretto.
    
    11.1 Recomendaciones contractuales (cláusulas, hitos, modelos de contrato)
    11.2 Recomendaciones operativas (procesos internos, listas de chequeo)
    11.3 Recomendaciones para el cliente (educación sobre el modelo, expectativas)
    11.4 Recomendaciones para constructor y arquitecto (mejores prácticas)

──────────────────────────────────────────────────────────────────

12. CIERRE Y TRANSICIÓN (Handover)
    
    12.1 Documentación entregada (planos as-built, dossier garantías, manuales, protocolos, certificaciones)
    12.2 Garantías activas (tabla con item / proveedor / vigencia / cobertura)
    12.3 Punch list al cierre (con responsable y fecha compromiso)
    12.4 Transferencia operativa al cliente
    12.5 Aprobación y firma (sponsor + PM)

──────────────────────────────────────────────────────────────────

ANEXOS (opcionales según proyecto)
    A1. Tabla maestra de items adicionales (todos, ordenados por capítulo)
    A2. Cronograma plan vs real visual
    A3. Matriz RACI final
    A4. Registro de cambios completo
    A5. Fotografías clave del proyecto (antes / durante / después)
```

---

## Reglas de generación

1. **Nunca omitir secciones aunque alguna quede corta.** La estructura completa comunica rigor.
2. **El análisis por capítulo es OBLIGATORIO** para los 5 con mayor desviación absoluta y los 3 con mayor ahorro. Para los demás, mínimo 1 párrafo de análisis.
3. **Cada sobrecosto debe tener ATRIBUCIÓN explícita** (cliente / arquitecto / constructor / PM / normativo / imprevisto). No dejar items sin clasificar.
4. **Las lecciones aprendidas deben ser ACCIONABLES.** No sirve "se podría hacer mejor" — debe ser "implementar tal cosa, responsable X, antes del proyecto Y".
5. **Las recomendaciones contractuales deben ser CONCRETAS** — con cláusulas redactadas o procesos definidos, no aspiraciones genéricas.
6. **Tono crudo.** No suavizar el análisis para no incomodar al constructor o arquitecto. La franqueza es lo que hace valioso el informe.
7. **Cifras con coherencia.** Cuando se hagan ajustes (eliminación de duplicados, doble contabilidad), reportar las cifras antes Y después del ajuste con trazabilidad.

---

## Formato de salida

**HTML interactivo autocontenido (preferido):**
- Estilo profesional tipo reporte corporativo Cretto.
- Logo Cretto sutil en header (verde corporativo sobre fondo claro menta).
- Portada con datos del proyecto.
- Tabla de contenido navegable.
- Tablas filtrables/ordenables cuando aplique.
- Indicadores semáforo 🟢🟡🔴 consistentes.
- Gráficos embebidos (BAC vs AC, cronograma plan vs real, distribución de causas del sobrecosto).
- Botón "Imprimir a PDF" con paginación limpia.
- Pie: "Elaborado por: Cretto - Gerencia de Proyectos".

**Paleta Cretto (validada con Jose):**
- Verde Cretto principal: `#0E6E37`
- Verde claro (accents): `#A8C9A1`
- Fondo claro: `#F4F8F2`
- Texto principal: `#1F2937`
- Texto secundario: `#6B7280`
- Acento ámbar (alertas): `#B45309`
- Acento rojo (críticos): `#991B1B`

**Alternativos:** Markdown para Google Docs, DOCX para entrega formal con firma.

---

## Mejoras frente al template original del skill

Frente al template `11-informe-cierre.md` original del skill cretto-pmi-pm, esta versión añade:

1. **Sección 1 (Resumen Ejecutivo de 1 página)** — antes no existía formalmente.
2. **Sección 3.3 (Análisis Detallado por Capítulo)** — antes era solo una tabla resumen. Ahora exige análisis del PM por capítulo.
3. **Sección 3.5 (Taxonomía del Sobrecosto)** — clasificación por causa raíz, no estaba en el original.
4. **Sección 5.3 (Atribución de la Demora)** — desagrega responsabilidades del retraso.
5. **Sección 9 (Cambios Aprobados con SCO)** — formaliza el control de cambios.
6. **Sección 10 (Lecciones Aprendidas extendidas)** — pasa de 5-10 a 10-15 mínimo, con formato accionable.
7. **Sección 11 (Recomendaciones Contractuales)** — completamente nueva. Convierte el informe en input para mejora del modelo Cretto.
8. **Reglas de generación** que exigen tono crudo, atribución explícita, accionabilidad.
9. **Paleta de colores Cretto definida** — antes no estaba especificada.
