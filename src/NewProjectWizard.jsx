import React, { useState, useMemo } from "react";
import {
  X, ChevronRight, ChevronLeft, Check, FileText, Building2, Users,
  Calendar, DollarSign, ClipboardCheck, Circle, Loader2, CheckCircle2,
  AlertCircle
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   NewProjectWizard — wizard multi-paso para crear proyecto Cretto
   Pasos:
   1. Información general
   2. Equipo y stakeholders
   3. Fechas clave
   4. Alcance financiero
   5. Documentos PMI requeridos
   6. Resumen + crear
────────────────────────────────────────────────────────────────── */

const STEPS = [
  { id: 1, title: "Información general", icon: Building2, desc: "Datos del proyecto y ubicación" },
  { id: 2, title: "Equipo y stakeholders", icon: Users, desc: "Roles clave del proyecto" },
  { id: 3, title: "Fechas clave", icon: Calendar, desc: "Hitos contractuales" },
  { id: 4, title: "Alcance financiero", icon: DollarSign, desc: "CAPEX inicial y contingencia" },
  { id: 5, title: "Documentos PMI", icon: ClipboardCheck, desc: "11 entregables del estándar" },
  { id: 6, title: "Resumen", icon: Check, desc: "Confirmar y crear" }
];

const DOCUMENTOS_PMI = [
  { id: 1,  nombre: "Acta de constitución (Project Charter)", cuando: "Al inicio", desc: "Autoriza formalmente el proyecto. Define objetivos, sponsor, restricciones y nivel de autoridad del PM.", obligatorio: true },
  { id: 2,  nombre: "Registro de stakeholders + matriz RACI", cuando: "Al inicio", desc: "Lista de interesados con su rol, intereses, influencia y matriz RACI (Responsable, Aprobador, Consultado, Informado).", obligatorio: true },
  { id: 3,  nombre: "EDT / WBS", cuando: "Planificación", desc: "Estructura jerárquica del trabajo. Descompone el alcance en paquetes manejables.", obligatorio: true },
  { id: 4,  nombre: "Cronograma con hitos + ruta crítica", cuando: "Planificación", desc: "Plan temporal con dependencias, línea base y los 12 hitos típicos del proyecto Cretto.", obligatorio: true },
  { id: 5,  nombre: "Presupuesto CAPEX (15 categorías)", cuando: "Planificación", desc: "Desglose presupuestal por categoría con proveedores, estados y trazabilidad de pagos.", obligatorio: true },
  { id: 6,  nombre: "Registro de riesgos", cuando: "Continuo", desc: "Matriz 5×5 (probabilidad × impacto). Identificación, mitigación y monitoreo continuo.", obligatorio: true },
  { id: 7,  nombre: "Matriz de control de cambios", cuando: "Continuo", desc: "Toda solicitud de cambio (alcance / tiempo / costo) registrada con SCO (Solicitud de Cambio en Obra) tripartita.", obligatorio: true },
  { id: 8,  nombre: "Plantilla de acta de comité semanal", cuando: "Cada semana", desc: "6 bloques estándar: avance, próxima semana, decisiones, riesgos, pendientes, asuntos del cliente.", obligatorio: true },
  { id: 9,  nombre: "Plantilla de informe de seguimiento (EVM)", cuando: "Mensual o por hito", desc: "Earned Value Management: CPI, SPI, CV, SV, curva S, pronóstico EAC.", obligatorio: true },
  { id: 10, nombre: "Registro de lecciones aprendidas", cuando: "Continuo + cierre", desc: "Bitácora de aprendizajes — qué funcionó, qué no, acciones para próximos proyectos.", obligatorio: true },
  { id: 11, nombre: "Plantilla de informe de cierre e integración", cuando: "Fin del proyecto", desc: "Cierre formal del proyecto: balance financiero, cronograma, lecciones, transferencia operativa.", obligatorio: true }
];

const ESTADO_DOC = { pendiente: "pendiente", preparacion: "preparacion", listo: "listo" };

/* Tipos de proyecto soportados — cada uno cambia labels/placeholders */
const TIPOS_PROYECTO = [
  { id: "edificio_residencial", label: "Edificio residencial", unidadLabel: "Apartamentos", entregaLabel: "Entrega de obra", ejemploArea: "8000", ejemploUnidades: "60" },
  { id: "edificio_comercial",   label: "Edificio comercial / oficinas", unidadLabel: "Locales / oficinas", entregaLabel: "Entrega de obra", ejemploArea: "5000", ejemploUnidades: "40" },
  { id: "edificio_mixto",       label: "Edificio mixto (vivienda + comercio)", unidadLabel: "Unidades totales", entregaLabel: "Entrega de obra", ejemploArea: "10000", ejemploUnidades: "80" },
  { id: "restaurante",          label: "Restaurante / local comercial", unidadLabel: "Puestos", entregaLabel: "Soft opening", ejemploArea: "329", ejemploUnidades: "106" },
  { id: "remodelacion",         label: "Remodelación / adecuación", unidadLabel: "Unidades intervenidas", entregaLabel: "Entrega de obra", ejemploArea: "500", ejemploUnidades: "1" },
  { id: "otro",                 label: "Otro tipo de proyecto", unidadLabel: "Unidades", entregaLabel: "Entrega de obra", ejemploArea: "", ejemploUnidades: "" }
];

const tipoCfg = (id) => TIPOS_PROYECTO.find(t => t.id === id) || TIPOS_PROYECTO[0];

const DEFAULT_FORM = {
  // Paso 1
  tipoProyecto: "edificio_residencial",
  nombre: "",
  cliente: "",
  marca: "",
  direccion: "",
  ciudad: "Bogotá",
  area: "",
  unidades: "",
  pisos: "",
  centroCosto: "",
  // Paso 2
  sponsor: "",
  sponsorContact: "",
  pmCretto: "Jose Guillermo Duque",
  gerenteComercial: "",
  arquitecto: "",
  ingenieroEstructural: "",
  constructor: "",
  interventor: "",
  residenteObra: "",
  // Paso 3
  fechaContrato: "",
  fechaInicioObra: "",
  fechaEntrega: "",
  fechaCierre: "",
  // Paso 4
  capexEstimado: "",
  contingenciaPct: 15,
  financiamiento: "Cliente directo",
  // Paso 5 — documentos: { id → { estado, responsable, fechaCompromiso } }
  documentos: Object.fromEntries(DOCUMENTOS_PMI.map(d => [d.id, { estado: ESTADO_DOC.pendiente, responsable: "", fechaCompromiso: "" }]))
};

const NewProjectWizard = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitted, setSubmitted] = useState(false);

  const update = (patch) => setForm(f => ({ ...f, ...patch }));
  const updateDoc = (id, patch) => setForm(f => ({
    ...f,
    documentos: { ...f.documentos, [id]: { ...f.documentos[id], ...patch } }
  }));

  // Validación por paso
  const stepValid = useMemo(() => {
    if (step === 1) return form.tipoProyecto && form.nombre.trim() && form.cliente.trim() && form.area && form.unidades;
    if (step === 2) return form.pmCretto.trim() && form.constructor.trim() && form.arquitecto.trim();
    if (step === 3) return form.fechaContrato && form.fechaInicioObra && form.fechaEntrega;
    if (step === 4) return form.capexEstimado;
    return true;
  }, [step, form]);

  const handleNext = () => {
    if (step < STEPS.length) setStep(s => s + 1);
    else handleSubmit();
  };
  const handlePrev = () => step > 1 && setStep(s => s - 1);

  const handleSubmit = () => {
    setSubmitted(true);
    if (onSubmit) onSubmit(form);
    setTimeout(() => onClose && onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="my-0 flex h-screen w-full max-w-4xl flex-col overflow-hidden bg-stone-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="border-b border-stone-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Cretto · Nuevo proyecto</div>
              <h2 className="mt-0.5 font-serif text-xl text-stone-900">Crear nuevo proyecto</h2>
            </div>
            <button onClick={onClose} className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="mt-4 flex items-center gap-1">
            {STEPS.map((s, idx) => {
              const Ic = s.icon;
              const active = step === s.id;
              const done = step > s.id;
              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => done && setStep(s.id)}
                    disabled={!done && !active}
                    className={`flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-all ${
                      active ? "bg-emerald-100 text-emerald-900 font-semibold" :
                      done ? "text-emerald-700 hover:bg-emerald-50 cursor-pointer" :
                      "text-stone-400"
                    }`}
                    title={s.desc}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      active ? "bg-emerald-700 text-white" :
                      done ? "bg-emerald-600 text-white" :
                      "bg-stone-200 text-stone-500"
                    }`}>
                      {done ? <Check className="h-3 w-3" /> : <Ic className="h-3 w-3" />}
                    </div>
                    <span className="hidden md:inline">{s.title}</span>
                  </button>
                  {idx < STEPS.length - 1 && <div className={`h-px flex-1 ${done ? "bg-emerald-300" : "bg-stone-200"}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </header>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!submitted ? (
            <>
              {step === 1 && <Step1 form={form} update={update} />}
              {step === 2 && <Step2 form={form} update={update} />}
              {step === 3 && <Step3 form={form} update={update} />}
              {step === 4 && <Step4 form={form} update={update} />}
              {step === 5 && <Step5 form={form} updateDoc={updateDoc} />}
              {step === 6 && <Step6 form={form} />}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
                <h3 className="mt-4 font-serif text-2xl text-stone-900">¡Proyecto creado!</h3>
                <p className="mt-2 text-sm text-stone-500">{form.nombre} está listo para empezar.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer / navigation */}
        {!submitted && (
          <footer className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-3">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Anterior
            </button>
            <div className="text-[11px] text-stone-500">
              Paso {step} de {STEPS.length}
            </div>
            <button
              onClick={handleNext}
              disabled={!stepValid}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === STEPS.length ? "Crear proyecto" : "Siguiente"} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

/* ─────────── Step 1: Información general ─────────── */
const Step1 = ({ form, update }) => {
  const t = tipoCfg(form.tipoProyecto);
  return (
    <div className="mx-auto max-w-2xl">
      <SectionHeader title="Información general del proyecto" desc="Datos básicos del proyecto y su ubicación. Selecciona primero el tipo de proyecto — algunas preguntas se ajustarán según el tipo." />
      <div className="space-y-4">
        <Field label="Tipo de proyecto" required>
          <Select value={form.tipoProyecto} onChange={v => update({ tipoProyecto: v })}>
            {TIPOS_PROYECTO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </Select>
        </Field>

        <Field label="Nombre del proyecto" required>
          <Input
            value={form.nombre}
            onChange={v => update({ nombre: v })}
            placeholder={
              form.tipoProyecto === "edificio_residencial" ? "Ej. Torre Versalles" :
              form.tipoProyecto === "restaurante" ? "Ej. Cosette 81" :
              "Ej. nombre del proyecto"
            }
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Cliente / promotor" required>
            <Input value={form.cliente} onChange={v => update({ cliente: v })} placeholder={form.tipoProyecto === "restaurante" ? "Ej. DLK" : "Razón social del promotor"} />
          </Field>
          <Field label={form.tipoProyecto === "restaurante" ? "Marca" : "Marca / desarrollo"}>
            <Input
              value={form.marca}
              onChange={v => update({ marca: v })}
              placeholder={
                form.tipoProyecto === "restaurante" ? "Ej. Cosette" :
                form.tipoProyecto === "edificio_residencial" ? "Nombre del desarrollo (opcional)" :
                "Identificador opcional"
              }
            />
          </Field>
        </div>

        <Field label="Dirección">
          <Input value={form.direccion} onChange={v => update({ direccion: v })} placeholder="Ej. Calle 81 # 8 - 85" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ciudad">
            <Input value={form.ciudad} onChange={v => update({ ciudad: v })} />
          </Field>
          <Field label="Centro de costo">
            <Input value={form.centroCosto} onChange={v => update({ centroCosto: v })} placeholder="Opcional" />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Área construida (m²)" required>
            <Input type="number" value={form.area} onChange={v => update({ area: v })} placeholder={t.ejemploArea} />
          </Field>
          <Field label={t.unidadLabel} required>
            <Input type="number" value={form.unidades} onChange={v => update({ unidades: v })} placeholder={t.ejemploUnidades} />
          </Field>
          <Field label="Pisos / niveles">
            <Input type="number" value={form.pisos} onChange={v => update({ pisos: v })} placeholder="Ej. 12" />
          </Field>
        </div>
      </div>
    </div>
  );
};

/* ─────────── Step 2: Equipo y stakeholders ─────────── */
const Step2 = ({ form, update }) => {
  const isResto = form.tipoProyecto === "restaurante";
  return (
    <div className="mx-auto max-w-2xl">
      <SectionHeader title="Equipo y stakeholders del proyecto" desc="Roles clave que participarán en el proyecto. Esta información alimenta el registro de stakeholders y la matriz RACI." />
      <div className="space-y-4">
        <Field label="Sponsor del proyecto (representante del cliente / promotor)">
          <Input value={form.sponsor} onChange={v => update({ sponsor: v })} placeholder="Nombre completo" />
        </Field>
        <Field label="Contacto del sponsor (teléfono o email)">
          <Input value={form.sponsorContact} onChange={v => update({ sponsorContact: v })} placeholder="email@ejemplo.com o +57…" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="PM Cretto" required>
            <Input value={form.pmCretto} onChange={v => update({ pmCretto: v })} />
          </Field>
          <Field label={isResto ? "Gerente de marca" : "Gerente comercial / ventas"}>
            <Input
              value={form.gerenteComercial}
              onChange={v => update({ gerenteComercial: v })}
              placeholder={isResto ? "Representante operativo de la marca" : "Responsable comercial del desarrollo"}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Arquitecto / diseñador" required>
            <Input value={form.arquitecto} onChange={v => update({ arquitecto: v })} placeholder="Firma arquitectónica" />
          </Field>
          <Field label="Ingeniero estructural">
            <Input
              value={form.ingenieroEstructural}
              onChange={v => update({ ingenieroEstructural: v })}
              placeholder="Calculista estructural"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Constructor / contratista principal" required>
            <Input value={form.constructor} onChange={v => update({ constructor: v })} placeholder="Empresa constructora" />
          </Field>
          <Field label="Interventor">
            <Input
              value={form.interventor}
              onChange={v => update({ interventor: v })}
              placeholder={isResto ? "Opcional" : "Interventoría técnica / administrativa"}
            />
          </Field>
        </div>

        <Field label="Residente de obra">
          <Input value={form.residenteObra} onChange={v => update({ residenteObra: v })} placeholder="Persona en sitio durante la ejecución" />
        </Field>

        <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-[12px] text-emerald-900">
          💡 Estos roles serán automáticamente agregados al <strong>Registro de stakeholders</strong> (documento PMI #02). Podrás editarlos y agregar más contactos desde el módulo de Procurement una vez creado el proyecto.
        </div>
      </div>
    </div>
  );
};

/* ─────────── Step 3: Fechas clave ─────────── */
const Step3 = ({ form, update }) => {
  const t = tipoCfg(form.tipoProyecto);
  const isResto = form.tipoProyecto === "restaurante";
  // benchmarks por tipo (días entre inicio de obra y entrega)
  const benchmarks = {
    edificio_residencial: { min: 365, max: 730, note: "Edificios residenciales típicamente requieren 12-24 meses según altura y unidades." },
    edificio_comercial:   { min: 365, max: 730, note: "Edificios comerciales: 12-24 meses según tamaño." },
    edificio_mixto:       { min: 540, max: 900, note: "Mixtos suelen tomar 18-30 meses por la coordinación de varios usos." },
    restaurante:          { min: 120, max: 180, note: "Restaurantes Cretto típicamente requieren 120-180 días." },
    remodelacion:         { min: 60,  max: 180, note: "Remodelaciones medianas: 2-6 meses." },
    otro:                 { min: 90,  max: 365, note: "Validar cronograma con el constructor." }
  };
  const bench = benchmarks[form.tipoProyecto] || benchmarks.otro;
  const diffDays = (a, b) => (!a || !b) ? null : Math.round((new Date(b) - new Date(a)) / 86400000);
  const days = diffDays(form.fechaInicioObra, form.fechaEntrega);

  return (
    <div className="mx-auto max-w-2xl">
      <SectionHeader title="Fechas clave del proyecto" desc="Los 4 hitos contractuales que enmarcan el proyecto. Pueden ajustarse después en el módulo de Cronograma." />
      <div className="space-y-4">
        <Field label="Fecha de firma de contrato con el cliente" required>
          <Input type="date" value={form.fechaContrato} onChange={v => update({ fechaContrato: v })} />
        </Field>
        <Field label="Fecha de inicio de obra" required>
          <Input type="date" value={form.fechaInicioObra} onChange={v => update({ fechaInicioObra: v })} />
        </Field>
        <Field label={`${t.entregaLabel} planeada`} required>
          <Input type="date" value={form.fechaEntrega} onChange={v => update({ fechaEntrega: v })} />
        </Field>
        <Field label="Cierre formal estimado (opcional)">
          <Input type="date" value={form.fechaCierre} onChange={v => update({ fechaCierre: v })} />
        </Field>

        {days != null && days > 0 && (
          <div className={`rounded-md border p-3 text-[12px] ${
            days < bench.min ? "border-rose-200 bg-rose-50/60 text-rose-900" :
            days < bench.max ? "border-amber-200 bg-amber-50/60 text-amber-900" :
            "border-emerald-200 bg-emerald-50/60 text-emerald-900"
          }`}>
            {days < bench.min ? <AlertCircle className="mr-1 inline h-3.5 w-3.5" /> : "✓ "}
            <strong>{days} días</strong> (~{Math.round(days / 30)} meses) entre inicio de obra y {t.entregaLabel.toLowerCase()}.{" "}
            {days < bench.min && `⚠ Probable cronograma muy ajustado. ${bench.note}`}
            {days >= bench.min && days < bench.max && `Cronograma ajustado. Validar viabilidad con el constructor (rango típico ${bench.min}-${bench.max} días).`}
            {days >= bench.max && `Cronograma razonable. ${bench.note}`}
          </div>
        )}
        {days != null && days <= 0 && (
          <div className="rounded-md border border-rose-200 bg-rose-50/60 p-3 text-[12px] text-rose-900">
            <AlertCircle className="mr-1 inline h-3.5 w-3.5" /> La {t.entregaLabel.toLowerCase()} debe ser posterior al inicio de obra.
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────── Step 4: Alcance financiero ─────────── */
const Step4 = ({ form, update }) => {
  const capex = parseFloat(form.capexEstimado) || 0;
  const cont = capex * (form.contingenciaPct / 100);
  const total = capex + cont;
  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CO").replace(/,/g, ".");

  return (
    <div className="mx-auto max-w-2xl">
      <SectionHeader title="Alcance financiero inicial" desc="Estimación gruesa del CAPEX. El detalle por categoría (15 rubros) se completará posteriormente en el módulo CAPEX." />
      <div className="space-y-4">
        <Field label="CAPEX total estimado (COP)" required>
          <Input
            type="number"
            value={form.capexEstimado}
            onChange={v => update({ capexEstimado: v })}
            placeholder={
              form.tipoProyecto === "edificio_residencial" ? "Ej. 30000000000 (edificios típicos)" :
              form.tipoProyecto === "restaurante" ? "Ej. 3000000000" :
              "Ej. 5000000000"
            }
          />
          <span className="mt-1 block text-[10px] text-stone-500">
            {form.tipoProyecto === "restaurante"
              ? "Referencia Cosette 81: ~$3.030 MM · Cosette 109: ~$3.637 MM"
              : form.tipoProyecto === "edificio_residencial"
              ? "Referencia: edificios residenciales medianos suelen estar entre $20.000 MM y $80.000 MM según altura y unidades"
              : "Estimación bruta — el detalle por categoría se define después en el módulo CAPEX"}
          </span>
        </Field>

        <Field label={`Contingencia (${form.contingenciaPct}%)`}>
          <input
            type="range"
            min="5"
            max="25"
            step="1"
            value={form.contingenciaPct}
            onChange={e => update({ contingenciaPct: parseInt(e.target.value) })}
            className="w-full accent-emerald-700"
          />
          <div className="mt-1 flex justify-between text-[10px] text-stone-500">
            <span>5% (mínimo)</span><span>10-15% (recomendado)</span><span>25% (proyectos complejos)</span>
          </div>
        </Field>

        <Field label="Modelo de financiamiento / contratación">
          <Select value={form.financiamiento} onChange={v => update({ financiamiento: v })}>
            <option value="Cliente directo">Cliente directo (compras y pagos gestionados por el cliente)</option>
            <option value="Administración delegada">Administración delegada (constructor gestiona compras, cobra honorarios)</option>
            <option value="Precio fijo (lump sum)">Precio fijo / lump sum (contratista asume riesgo del costo)</option>
            <option value="Llave en mano">Llave en mano (constructor entrega proyecto terminado)</option>
            <option value="Mixto">Mixto (combinación según rubro)</option>
          </Select>
        </Field>

        {capex > 0 && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700">Resumen financiero</div>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <div className="flex justify-between"><span>CAPEX base</span><span>{fmt(capex)}</span></div>
              <div className="flex justify-between"><span>+ Contingencia {form.contingenciaPct}%</span><span>{fmt(cont)}</span></div>
              <div className="flex justify-between border-t border-emerald-200 pt-1 font-bold text-emerald-900"><span>Total bajo gerencia</span><span>{fmt(total)}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────── Step 5: Documentos PMI ─────────── */
const Step5 = ({ form, updateDoc }) => {
  const cuentas = useMemo(() => {
    const counts = { pendiente: 0, preparacion: 0, listo: 0 };
    Object.values(form.documentos).forEach(d => { counts[d.estado] = (counts[d.estado] || 0) + 1; });
    return counts;
  }, [form.documentos]);

  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeader
        title="Documentos PMI requeridos"
        desc="Los 11 entregables del estándar PMBOK 8 que todo proyecto Cretto debe producir. Marca el estado inicial de cada uno y asigna responsable + fecha compromiso (si aplica)."
      />

      {/* Resumen */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <StatCard label="Pendientes" value={cuentas.pendiente} color="stone" />
        <StatCard label="En preparación" value={cuentas.preparacion} color="amber" />
        <StatCard label="Completos" value={cuentas.listo} color="emerald" />
      </div>

      <div className="space-y-2">
        {DOCUMENTOS_PMI.map(doc => {
          const state = form.documentos[doc.id];
          return (
            <div key={doc.id} className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 font-mono text-[10px] font-semibold text-emerald-800">
                      {String(doc.id).padStart(2, "0")}
                    </span>
                    <h4 className="text-[13px] font-semibold text-stone-900">{doc.nombre}</h4>
                    <span className="rounded-full bg-stone-100 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-stone-600">{doc.cuando}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-stone-600">{doc.desc}</p>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-[auto_1fr_1fr] items-center gap-2">
                {/* Estado pills */}
                <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-0.5">
                  {[
                    { id: ESTADO_DOC.pendiente, label: "Pendiente", color: "stone" },
                    { id: ESTADO_DOC.preparacion, label: "En prep.", color: "amber" },
                    { id: ESTADO_DOC.listo, label: "Completo", color: "emerald" }
                  ].map(opt => {
                    const active = state.estado === opt.id;
                    const colorMap = {
                      stone: active ? "bg-stone-700 text-white" : "text-stone-600 hover:text-stone-900",
                      amber: active ? "bg-amber-600 text-white" : "text-stone-600 hover:text-stone-900",
                      emerald: active ? "bg-emerald-700 text-white" : "text-stone-600 hover:text-stone-900"
                    };
                    return (
                      <button
                        key={opt.id}
                        onClick={() => updateDoc(doc.id, { estado: opt.id })}
                        className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all ${colorMap[opt.color]}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <Input
                  value={state.responsable}
                  onChange={v => updateDoc(doc.id, { responsable: v })}
                  placeholder="Responsable"
                  small
                />
                <Input
                  type="date"
                  value={state.fechaCompromiso}
                  onChange={v => updateDoc(doc.id, { fechaCompromiso: v })}
                  small
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────── Step 6: Resumen ─────────── */
const Step6 = ({ form }) => {
  const docsCount = useMemo(() => {
    const c = { pendiente: 0, preparacion: 0, listo: 0 };
    Object.values(form.documentos).forEach(d => { c[d.estado]++; });
    return c;
  }, [form.documentos]);

  const fmt = (n) => "$" + Math.round(parseFloat(n) || 0).toLocaleString("es-CO").replace(/,/g, ".");
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeader title="Resumen del proyecto" desc="Revisa la información antes de crear el proyecto. Una vez creado, podrás editar cualquier dato desde los módulos del hub." />

      <SummarySection title="Información general">
        <SummaryRow label="Tipo de proyecto" value={tipoCfg(form.tipoProyecto).label} />
        <SummaryRow label="Nombre" value={form.nombre} />
        <SummaryRow label="Cliente / promotor" value={form.cliente} />
        {form.marca && <SummaryRow label={form.tipoProyecto === "restaurante" ? "Marca" : "Marca / desarrollo"} value={form.marca} />}
        <SummaryRow label="Dirección" value={`${form.direccion}${form.ciudad ? ", " + form.ciudad : ""}`} />
        <SummaryRow label="Área construida" value={form.area ? `${form.area} m²` : "—"} />
        <SummaryRow label={tipoCfg(form.tipoProyecto).unidadLabel} value={form.unidades} />
        {form.pisos && <SummaryRow label="Pisos / niveles" value={form.pisos} />}
        {form.centroCosto && <SummaryRow label="Centro de costo" value={form.centroCosto} />}
      </SummarySection>

      <SummarySection title="Equipo">
        <SummaryRow label="PM Cretto" value={form.pmCretto} />
        <SummaryRow label="Sponsor" value={`${form.sponsor}${form.sponsorContact ? ` · ${form.sponsorContact}` : ""}`} />
        <SummaryRow label="Arquitecto" value={form.arquitecto} />
        {form.ingenieroEstructural && <SummaryRow label="Ingeniero estructural" value={form.ingenieroEstructural} />}
        <SummaryRow label="Constructor" value={form.constructor} />
        {form.interventor && <SummaryRow label="Interventor" value={form.interventor} />}
        {form.gerenteComercial && <SummaryRow label={form.tipoProyecto === "restaurante" ? "Gerente de marca" : "Gerente comercial"} value={form.gerenteComercial} />}
        {form.residenteObra && <SummaryRow label="Residente de obra" value={form.residenteObra} />}
      </SummarySection>

      <SummarySection title="Fechas clave">
        <SummaryRow label="Firma de contrato" value={fmtDate(form.fechaContrato)} />
        <SummaryRow label="Inicio de obra" value={fmtDate(form.fechaInicioObra)} />
        <SummaryRow label={tipoCfg(form.tipoProyecto).entregaLabel} value={fmtDate(form.fechaEntrega)} />
        {form.fechaCierre && <SummaryRow label="Cierre estimado" value={fmtDate(form.fechaCierre)} />}
      </SummarySection>

      <SummarySection title="Alcance financiero">
        <SummaryRow label="CAPEX base" value={fmt(form.capexEstimado)} />
        <SummaryRow label="Contingencia" value={`${form.contingenciaPct}% (${fmt((parseFloat(form.capexEstimado) || 0) * form.contingenciaPct / 100)})`} />
        <SummaryRow label="Total bajo gerencia" value={fmt((parseFloat(form.capexEstimado) || 0) * (1 + form.contingenciaPct / 100))} />
        <SummaryRow label="Financiamiento" value={form.financiamiento} />
      </SummarySection>

      <SummarySection title="Documentos PMI (11 entregables)">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-stone-100 p-2"><div className="font-serif text-2xl text-stone-800">{docsCount.pendiente}</div><div className="text-[10px] uppercase text-stone-500">Pendientes</div></div>
          <div className="rounded-md bg-amber-100 p-2"><div className="font-serif text-2xl text-amber-800">{docsCount.preparacion}</div><div className="text-[10px] uppercase text-amber-700">En preparación</div></div>
          <div className="rounded-md bg-emerald-100 p-2"><div className="font-serif text-2xl text-emerald-800">{docsCount.listo}</div><div className="text-[10px] uppercase text-emerald-700">Completos</div></div>
        </div>
      </SummarySection>

      <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-[12px] text-emerald-900">
        ✓ Al crear el proyecto, podrás acceder a los módulos: CAPEX, Cronograma, Procurement, Documentos, Riesgos, EVM e Informes. La estructura básica del cronograma (12 hitos) y los esqueletos de los 11 documentos PMI se generarán automáticamente.
      </div>
    </div>
  );
};

/* ─────────── Components reusables ─────────── */
const SectionHeader = ({ title, desc }) => (
  <div className="mb-6">
    <h3 className="font-serif text-xl text-stone-900">{title}</h3>
    <p className="mt-1 text-sm text-stone-500">{desc}</p>
  </div>
);

const Field = ({ label, required, children }) => (
  <label className="block">
    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-stone-600">
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    {children}
  </label>
);

const Input = ({ value, onChange, placeholder, type = "text", small }) => (
  <input
    type={type}
    value={value || ""}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full rounded-md border border-stone-300 bg-white ${small ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"} placeholder-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
  />
);

const Select = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
  >
    {children}
  </select>
);

const StatCard = ({ label, value, color }) => {
  const colors = {
    stone: "bg-stone-100 text-stone-700 border-stone-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200"
  };
  return (
    <div className={`rounded-md border p-2 text-center ${colors[color]}`}>
      <div className="font-serif text-xl">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
};

const SummarySection = ({ title, children }) => (
  <div className="mb-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
    <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">{title}</h4>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div className="grid grid-cols-[180px_1fr] gap-2 text-[12px]">
    <span className="text-stone-500">{label}</span>
    <span className="font-medium text-stone-900">{value || <span className="italic text-stone-300">—</span>}</span>
  </div>
);

export default NewProjectWizard;
