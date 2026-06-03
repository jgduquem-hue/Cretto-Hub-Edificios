import React, { useState, useMemo } from "react";
import {
  X, ChevronRight, ChevronLeft, Check, FileText, Building2, Users,
  Calendar, DollarSign, ClipboardCheck, Circle, Loader2, CheckCircle2,
  AlertCircle, Plus, Trash2, Landmark, Briefcase
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   NewProjectWizard — proyectos de edificación residencial (vivienda)
   Estructura financiera tipo Colombia: fiducia inmobiliaria + crédito
   constructor + preventas. Pasos:
   1. Información general (lote, tipología, NPH)
   2. Equipo y stakeholders (incl. fiduciaria y banco)
   3. Estructura financiera (fiducia + banco + preventas)
   4. Fechas clave (incluye punto de equilibrio y escrituración)
   5. CAPEX y honorarios
   6. Documentos PMI requeridos
   7. Resumen + crear
────────────────────────────────────────────────────────────────── */

const STEPS = [
  { id: 1, title: "Información general", icon: Building2, desc: "Lote, tipología y producto" },
  { id: 2, title: "Equipo y stakeholders", icon: Users, desc: "Roles clave + fiducia + banco" },
  { id: 3, title: "Estructura financiera", icon: Landmark, desc: "Fiducia, banco, preventas" },
  { id: 4, title: "Fechas clave", icon: Calendar, desc: "Hitos contractuales" },
  { id: 5, title: "CAPEX y honorarios", icon: DollarSign, desc: "Presupuesto y fee Cretto" },
  { id: 6, title: "Documentos PMI", icon: ClipboardCheck, desc: "11 entregables del estándar" },
  { id: 7, title: "Resumen", icon: Check, desc: "Confirmar y crear" }
];

const DOCUMENTOS_PMI = [
  { id: 1,  nombre: "Acta de constitución (Project Charter)", cuando: "Al inicio", desc: "Autoriza formalmente el proyecto. Define objetivos, sponsor, restricciones y nivel de autoridad del PM.", obligatorio: true },
  { id: 2,  nombre: "Registro de stakeholders + matriz RACI", cuando: "Al inicio", desc: "Interesados con rol, intereses, influencia. RACI alimenta el módulo de notificaciones por correo.", obligatorio: true },
  { id: 3,  nombre: "EDT / WBS", cuando: "Planificación", desc: "Estructura jerárquica del trabajo, paquetes por capítulo de obra.", obligatorio: true },
  { id: 4,  nombre: "Cronograma de construcción + cronograma de proyecto", cuando: "Planificación", desc: "Dos vistas: cronograma de construcción (obra) y cronograma de proyecto (gerencial, incluye preventas, licencias, fiducia, escrituración).", obligatorio: true },
  { id: 5,  nombre: "Presupuesto CAPEX por capítulos", cuando: "Planificación", desc: "Desglose por capítulos de obra (preliminares, cimentación, estructura, mampostería, MEP, acabados, urbanismo, etc.).", obligatorio: true },
  { id: 6,  nombre: "Registro de riesgos", cuando: "Continuo", desc: "Matriz 5×5 con foco en riesgos típicos de edificación: licencias, vecinos, preventas, suelos, MEP.", obligatorio: true },
  { id: 7,  nombre: "Matriz de control de cambios", cuando: "Continuo", desc: "SCO (Solicitud de Cambio en Obra) tripartita: promotor, constructor, interventoría.", obligatorio: true },
  { id: 8,  nombre: "Plantilla de acta de comité semanal", cuando: "Cada semana", desc: "6 bloques estándar. Conectada al repositorio de reuniones y al módulo de pendientes.", obligatorio: true },
  { id: 9,  nombre: "Plantilla de informe de seguimiento (EVM)", cuando: "Mensual o por hito", desc: "Earned Value: CPI, SPI, CV, SV, curva S, pronóstico EAC.", obligatorio: true },
  { id: 10, nombre: "Registro de lecciones aprendidas", cuando: "Continuo + cierre", desc: "Bitácora de aprendizajes para próximos proyectos.", obligatorio: true },
  { id: 11, nombre: "Plantilla de informe de cierre e integración", cuando: "Fin del proyecto", desc: "Cierre formal: balance financiero, escrituración, entrega a copropiedad, lecciones.", obligatorio: true }
];

const ESTADO_DOC = { pendiente: "pendiente", preparacion: "preparacion", listo: "listo" };

const DEFAULT_FORM = {
  // Paso 1 — Información general
  nombre: "",
  promotor: "",                  // antes "cliente"
  desarrollo: "",                // marca del desarrollo inmobiliario
  direccion: "",
  ciudad: "Bogotá",
  loteM2: "",                    // área del lote
  areaConstruida: "",            // área total construida
  areaVendible: "",              // área vendible (sin zonas comunes)
  tipologia: "vivienda",         // vivienda | mixto | oficinas
  pctVivienda: 100,
  pctComercial: 0,
  pctOficinas: 0,
  unidadesViv: "",
  unidadesCom: "",
  parqueaderos: "",
  pisos: "",
  sotanos: "",
  estratoVis: "no-vis",          // no-vis | vis | vip | mixto
  usoSuelo: "",
  centroCosto: "",

  // Paso 2 — Equipo
  sponsors: [""],
  sponsorContact: "",
  pmCretto: "Jose Guillermo Duque",
  gerenteProyectoPromotor: "",   // PM del lado promotor (distinto al PM Cretto)
  gerenteComercial: "",
  comercializadora: "",
  arquitectos: [""],
  diseñadorFachadas: "",
  paisajismo: "",
  ingenieroEstructural: "",
  ingenieroSuelos: "",
  ingenieroHidraulico: "",
  ingenieroElectrico: "",
  ingenieroGas: "",
  ingenieroBioclimatico: "",
  constructor: "",
  interventor: "",
  residenteObra: "",
  curaduria: "",

  // Paso 3 — Estructura financiera (Colombia)
  fiduciaria: "",
  patrimonioAutonomo: "",
  bancoFinanciador: "",
  cupoCreditoConstructor: "",
  pctPreventas: 70,              // % requerido para punto de equilibrio
  unidadesPuntoEquilibrio: "",
  recursosPropios: "",
  modeloContrato: "Administración delegada",

  // Paso 4 — Fechas
  fechaContrato: "",
  fechaLicenciaEsperada: "",
  fechaPuntoEquilibrio: "",
  fechaInicioObra: "",
  fechaEntregaObra: "",
  fechaEscrituracionInicio: "",
  fechaEntregaCopropiedad: "",
  fechaCierre: "",

  // Paso 5 — Financiero
  capexEstimado: "",
  contingenciaPct: 10,
  honorariosCrettoPct: 3,
  precioVentaM2: "",

  // Paso 6 — Documentos
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

  const stepValid = useMemo(() => {
    if (step === 1) return form.nombre.trim() && form.promotor.trim() && form.areaConstruida && form.unidadesViv;
    if (step === 2) return form.pmCretto.trim() && (form.arquitectos || []).some(a => a.trim());
    if (step === 3) return form.fiduciaria.trim() || form.modeloContrato === "Recursos propios";
    if (step === 4) return form.fechaContrato && form.fechaInicioObra && form.fechaEntregaObra;
    if (step === 5) return form.capexEstimado;
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
        <header className="border-b border-stone-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400">Cretto · Nuevo proyecto de edificación</div>
              <h2 className="mt-0.5 font-serif text-xl text-stone-900">Crear nuevo proyecto</h2>
            </div>
            <button onClick={onClose} className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100">
              <X className="h-4 w-4" />
            </button>
          </div>

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

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!submitted ? (
            <>
              {step === 1 && <Step1 form={form} update={update} />}
              {step === 2 && <Step2 form={form} update={update} />}
              {step === 3 && <Step3 form={form} update={update} />}
              {step === 4 && <Step4 form={form} update={update} />}
              {step === 5 && <Step5 form={form} update={update} />}
              {step === 6 && <Step6 form={form} updateDoc={updateDoc} />}
              {step === 7 && <Step7 form={form} />}
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

        {!submitted && (
          <footer className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-3">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Anterior
            </button>
            <div className="text-[11px] text-stone-500">Paso {step} de {STEPS.length}</div>
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
const Step1 = ({ form, update }) => (
  <div className="mx-auto max-w-2xl">
    <SectionHeader title="Información general del proyecto" desc="Datos básicos del desarrollo inmobiliario, lote y producto." />
    <div className="space-y-4">
      <Field label="Nombre del proyecto" required>
        <Input value={form.nombre} onChange={v => update({ nombre: v })} placeholder="Ej. Torre Versalles" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Promotor / fideicomitente" required>
          <Input value={form.promotor} onChange={v => update({ promotor: v })} placeholder="Razón social del promotor" />
        </Field>
        <Field label="Nombre comercial del desarrollo">
          <Input value={form.desarrollo} onChange={v => update({ desarrollo: v })} placeholder="Marca comercial (opcional)" />
        </Field>
      </div>

      <Field label="Dirección del lote">
        <Input value={form.direccion} onChange={v => update({ direccion: v })} placeholder="Ej. Calle 81 # 8 - 85" />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Ciudad"><Input value={form.ciudad} onChange={v => update({ ciudad: v })} /></Field>
        <Field label="Uso de suelo (POT)">
          <Input value={form.usoSuelo} onChange={v => update({ usoSuelo: v })} placeholder="Ej. Consolidación 2" />
        </Field>
        <Field label="Centro de costo">
          <Input value={form.centroCosto} onChange={v => update({ centroCosto: v })} placeholder="Opcional" />
        </Field>
      </div>

      <div className="rounded-md border border-stone-200 bg-stone-50/40 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">Tipología y mezcla de usos</div>
        <Field label="Tipología principal">
          <Select value={form.tipologia} onChange={v => update({ tipologia: v })}>
            <option value="vivienda">Vivienda 100%</option>
            <option value="mixto">Mixto (vivienda + comercio / oficinas)</option>
            <option value="oficinas">Oficinas</option>
          </Select>
        </Field>
        {form.tipologia === "mixto" && (
          <div className="mt-2 grid grid-cols-3 gap-3">
            <Field label="% Vivienda"><Input type="number" value={form.pctVivienda} onChange={v => update({ pctVivienda: parseInt(v) || 0 })} /></Field>
            <Field label="% Comercio"><Input type="number" value={form.pctComercial} onChange={v => update({ pctComercial: parseInt(v) || 0 })} /></Field>
            <Field label="% Oficinas"><Input type="number" value={form.pctOficinas} onChange={v => update({ pctOficinas: parseInt(v) || 0 })} /></Field>
          </div>
        )}
        <div className="mt-2">
          <Field label="Segmento de vivienda">
            <Select value={form.estratoVis} onChange={v => update({ estratoVis: v })}>
              <option value="no-vis">No VIS</option>
              <option value="vis">VIS</option>
              <option value="vip">VIP</option>
              <option value="mixto">Mixto VIS / No VIS</option>
            </Select>
          </Field>
        </div>
      </div>

      <div className="rounded-md border border-stone-200 bg-stone-50/40 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">Áreas y unidades</div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Área del lote (m²)"><Input type="number" value={form.loteM2} onChange={v => update({ loteM2: v })} placeholder="Ej. 1200" /></Field>
          <Field label="Área construida (m²)" required><Input type="number" value={form.areaConstruida} onChange={v => update({ areaConstruida: v })} placeholder="Ej. 8000" /></Field>
          <Field label="Área vendible (m²)"><Input type="number" value={form.areaVendible} onChange={v => update({ areaVendible: v })} placeholder="Ej. 5500" /></Field>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-3">
          <Field label="Apartamentos" required><Input type="number" value={form.unidadesViv} onChange={v => update({ unidadesViv: v })} placeholder="Ej. 60" /></Field>
          <Field label="Locales / oficinas"><Input type="number" value={form.unidadesCom} onChange={v => update({ unidadesCom: v })} placeholder="Ej. 4" /></Field>
          <Field label="Parqueaderos"><Input type="number" value={form.parqueaderos} onChange={v => update({ parqueaderos: v })} placeholder="Ej. 80" /></Field>
          <Field label="Pisos"><Input type="number" value={form.pisos} onChange={v => update({ pisos: v })} placeholder="Ej. 12" /></Field>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Field label="Sótanos / niveles bajo rasante"><Input type="number" value={form.sotanos} onChange={v => update({ sotanos: v })} placeholder="Ej. 2" /></Field>
          <div />
        </div>
      </div>
    </div>
  </div>
);

/* ─────────── Step 2: Equipo y stakeholders ─────────── */
const Step2 = ({ form, update }) => (
  <div className="mx-auto max-w-2xl">
    <SectionHeader title="Equipo y stakeholders" desc="Roles clave del proyecto. Esta lista alimenta el Registro de stakeholders y la Matriz RACI — que después se usa para decidir a quién notificar por correo en cada cambio o documento subido." />
    <div className="space-y-4">

      <Field label="Sponsors / inversionistas">
        <MultiInput values={form.sponsors} onChange={v => update({ sponsors: v })} placeholder="Nombre del sponsor / inversionista" addLabel="Agregar inversionista" />
      </Field>
      <Field label="Contacto del sponsor principal (teléfono o email)">
        <Input value={form.sponsorContact} onChange={v => update({ sponsorContact: v })} placeholder="email@ejemplo.com o +57…" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="PM Cretto" required><Input value={form.pmCretto} onChange={v => update({ pmCretto: v })} /></Field>
        <Field label="Gerente de proyecto (lado promotor)">
          <Input value={form.gerenteProyectoPromotor} onChange={v => update({ gerenteProyectoPromotor: v })} placeholder="Contraparte del promotor" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Gerente comercial / ventas">
          <Input value={form.gerenteComercial} onChange={v => update({ gerenteComercial: v })} placeholder="Responsable comercial" />
        </Field>
        <Field label="Comercializadora / sala de ventas">
          <Input value={form.comercializadora} onChange={v => update({ comercializadora: v })} placeholder="Empresa comercializadora" />
        </Field>
      </div>

      <Field label="Arquitecto(s) / diseñador(es)" required>
        <MultiInput values={form.arquitectos} onChange={v => update({ arquitectos: v })} placeholder="Firma arquitectónica" addLabel="Agregar arquitecto" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Diseñador de fachadas"><Input value={form.diseñadorFachadas} onChange={v => update({ diseñadorFachadas: v })} placeholder="Especialista en fachadas" /></Field>
        <Field label="Paisajismo"><Input value={form.paisajismo} onChange={v => update({ paisajismo: v })} placeholder="Diseñador paisajístico" /></Field>
      </div>

      <div className="rounded-md border border-stone-200 bg-stone-50/40 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">Ingenierías</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ingeniero estructural"><Input value={form.ingenieroEstructural} onChange={v => update({ ingenieroEstructural: v })} placeholder="Calculista NSR-10" /></Field>
          <Field label="Ingeniero de suelos"><Input value={form.ingenieroSuelos} onChange={v => update({ ingenieroSuelos: v })} placeholder="Estudio geotécnico" /></Field>
          <Field label="Ingeniero hidráulico"><Input value={form.ingenieroHidraulico} onChange={v => update({ ingenieroHidraulico: v })} placeholder="Diseño hidrosanitario" /></Field>
          <Field label="Ingeniero eléctrico"><Input value={form.ingenieroElectrico} onChange={v => update({ ingenieroElectrico: v })} placeholder="Diseño RETIE" /></Field>
          <Field label="Ingeniero de gas"><Input value={form.ingenieroGas} onChange={v => update({ ingenieroGas: v })} placeholder="Diseño RETIG" /></Field>
          <Field label="Bioclimático / sostenibilidad"><Input value={form.ingenieroBioclimatico} onChange={v => update({ ingenieroBioclimatico: v })} placeholder="LEED / EDGE / CASA" /></Field>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Constructor / contratista principal">
          <Input value={form.constructor} onChange={v => update({ constructor: v })} placeholder="Empresa constructora (puede ser 'por definir')" />
        </Field>
        <Field label="Interventoría">
          <Input value={form.interventor} onChange={v => update({ interventor: v })} placeholder="Interventoría técnica (obligatoria si hay banco)" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Residente de obra"><Input value={form.residenteObra} onChange={v => update({ residenteObra: v })} /></Field>
        <Field label="Curaduría urbana"><Input value={form.curaduria} onChange={v => update({ curaduria: v })} placeholder="Ej. Curaduría 2 de Bogotá" /></Field>
      </div>

      <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-[12px] text-emerald-900">
        💡 Todos estos roles se agregan al <strong>Registro de stakeholders</strong> (doc PMI #02) y a la <strong>Matriz RACI</strong>. Cuando subas un documento o registres un cambio, el sistema te preguntará a qué roles notificar por correo según la RACI.
      </div>
    </div>
  </div>
);

/* ─────────── MultiInput ─────────── */
const MultiInput = ({ values, onChange, placeholder, addLabel }) => {
  const safe = values && values.length ? values : [""];
  const setAt = (idx, val) => { const next = [...safe]; next[idx] = val; onChange(next); };
  const add = () => onChange([...safe, ""]);
  const remove = (idx) => { const next = safe.filter((_, i) => i !== idx); onChange(next.length ? next : [""]); };
  return (
    <div className="space-y-1.5">
      {safe.map((v, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <input
            type="text"
            value={v}
            onChange={e => setAt(idx, e.target.value)}
            placeholder={`${placeholder}${safe.length > 1 ? ` ${idx + 1}` : ""}`}
            className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm placeholder-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {safe.length > 1 && (
            <button type="button" onClick={() => remove(idx)} className="rounded-md border border-stone-200 bg-white p-1.5 text-stone-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600" title="Eliminar">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-md border border-stone-300 border-dashed bg-white px-2 py-1 text-[11px] font-medium text-stone-600 hover:border-emerald-400 hover:text-emerald-700">
        <Plus className="h-3 w-3" /> {addLabel || "Agregar"}
      </button>
    </div>
  );
};

/* ─────────── Step 3: Estructura financiera (fiducia + banco) ─────────── */
const Step3 = ({ form, update }) => {
  const fmt = (n) => "$" + Math.round(parseFloat(n) || 0).toLocaleString("es-CO").replace(/,/g, ".");
  return (
    <div className="mx-auto max-w-2xl">
      <SectionHeader title="Estructura financiera del proyecto" desc="Modelo típico Colombia: fiducia inmobiliaria + crédito constructor + preventas. Si el proyecto es 100% con recursos propios, puedes saltar fiduciaria y banco." />
      <div className="space-y-4">

        <Field label="Modelo de contratación / financiamiento">
          <Select value={form.modeloContrato} onChange={v => update({ modeloContrato: v })}>
            <option value="Administración delegada">Administración delegada (constructor cobra honorarios)</option>
            <option value="Precio fijo (lump sum)">Precio fijo / lump sum</option>
            <option value="Llave en mano">Llave en mano</option>
            <option value="Recursos propios">Recursos propios (sin fiducia / banco)</option>
            <option value="Mixto">Mixto</option>
          </Select>
        </Field>

        <div className="rounded-md border border-stone-200 bg-stone-50/40 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-600">
            <Briefcase className="h-3 w-3" /> Fiducia inmobiliaria
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fiduciaria">
              <Input value={form.fiduciaria} onChange={v => update({ fiduciaria: v })} placeholder="Ej. Fiduciaria Bogotá, Alianza, Corficolombiana" />
            </Field>
            <Field label="Patrimonio autónomo (P.A.)">
              <Input value={form.patrimonioAutonomo} onChange={v => update({ patrimonioAutonomo: v })} placeholder="Ej. P.A. Torre Versalles" />
            </Field>
          </div>
        </div>

        <div className="rounded-md border border-stone-200 bg-stone-50/40 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-600">
            <Landmark className="h-3 w-3" /> Banco financiador
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Banco">
              <Input value={form.bancoFinanciador} onChange={v => update({ bancoFinanciador: v })} placeholder="Ej. Bancolombia, Davivienda, BBVA" />
            </Field>
            <Field label="Cupo crédito constructor (COP)">
              <Input type="number" value={form.cupoCreditoConstructor} onChange={v => update({ cupoCreditoConstructor: v })} placeholder="Ej. 15000000000" />
            </Field>
          </div>
          {form.cupoCreditoConstructor > 0 && (
            <div className="mt-1 text-[11px] text-stone-500">Cupo aprobado: <strong>{fmt(form.cupoCreditoConstructor)}</strong></div>
          )}
        </div>

        <div className="rounded-md border border-stone-200 bg-stone-50/40 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">Preventas y punto de equilibrio</div>
          <div className="grid grid-cols-3 gap-3">
            <Field label={`Preventas requeridas (${form.pctPreventas}%)`}>
              <input type="range" min="50" max="100" step="1" value={form.pctPreventas} onChange={e => update({ pctPreventas: parseInt(e.target.value) })} className="w-full accent-emerald-700" />
            </Field>
            <Field label="Unidades para punto de equilibrio">
              <Input type="number" value={form.unidadesPuntoEquilibrio} onChange={v => update({ unidadesPuntoEquilibrio: v })} placeholder={form.unidadesViv ? `≈ ${Math.round((parseInt(form.unidadesViv) || 0) * form.pctPreventas / 100)}` : "Ej. 42"} />
            </Field>
            <Field label="Recursos propios (COP)">
              <Input type="number" value={form.recursosPropios} onChange={v => update({ recursosPropios: v })} placeholder="Aporte del promotor" />
            </Field>
          </div>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3 text-[12px] text-amber-900">
          ⚠ <strong>Recuerda:</strong> sin punto de equilibrio (preventas mínimas) la fiducia no libera recursos al constructor y el banco no desembolsa. Es el hito financiero más crítico del proyecto.
        </div>
      </div>
    </div>
  );
};

/* ─────────── Step 4: Fechas clave ─────────── */
const Step4 = ({ form, update }) => {
  const diffDays = (a, b) => (!a || !b) ? null : Math.round((new Date(b) - new Date(a)) / 86400000);
  const daysObra = diffDays(form.fechaInicioObra, form.fechaEntregaObra);
  return (
    <div className="mx-auto max-w-2xl">
      <SectionHeader title="Fechas clave del proyecto" desc="Hitos contractuales y comerciales que enmarcan el proyecto de edificación residencial." />
      <div className="space-y-4">
        <Field label="Firma de contrato Cretto ↔ promotor" required>
          <Input type="date" value={form.fechaContrato} onChange={v => update({ fechaContrato: v })} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Licencia de construcción ejecutoriada (esperada)">
            <Input type="date" value={form.fechaLicenciaEsperada} onChange={v => update({ fechaLicenciaEsperada: v })} />
          </Field>
          <Field label="Punto de equilibrio (preventas)">
            <Input type="date" value={form.fechaPuntoEquilibrio} onChange={v => update({ fechaPuntoEquilibrio: v })} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Inicio de obra" required>
            <Input type="date" value={form.fechaInicioObra} onChange={v => update({ fechaInicioObra: v })} />
          </Field>
          <Field label="Entrega de obra (terminación)" required>
            <Input type="date" value={form.fechaEntregaObra} onChange={v => update({ fechaEntregaObra: v })} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Inicio escrituración masiva">
            <Input type="date" value={form.fechaEscrituracionInicio} onChange={v => update({ fechaEscrituracionInicio: v })} />
          </Field>
          <Field label="Entrega a copropiedad">
            <Input type="date" value={form.fechaEntregaCopropiedad} onChange={v => update({ fechaEntregaCopropiedad: v })} />
          </Field>
        </div>

        <Field label="Cierre formal estimado (liquidación del P.A.)">
          <Input type="date" value={form.fechaCierre} onChange={v => update({ fechaCierre: v })} />
        </Field>

        {daysObra != null && daysObra > 0 && (
          <div className={`rounded-md border p-3 text-[12px] ${
            daysObra < 365 ? "border-rose-200 bg-rose-50/60 text-rose-900" :
            daysObra < 730 ? "border-amber-200 bg-amber-50/60 text-amber-900" :
            "border-emerald-200 bg-emerald-50/60 text-emerald-900"
          }`}>
            {daysObra < 365 ? <AlertCircle className="mr-1 inline h-3.5 w-3.5" /> : "✓ "}
            <strong>{daysObra} días</strong> (~{Math.round(daysObra / 30)} meses) entre inicio y entrega de obra.{" "}
            {daysObra < 365 && "⚠ Muy ajustado para edificios. Validar con constructor."}
            {daysObra >= 365 && daysObra < 730 && "Cronograma normal para edificios medianos."}
            {daysObra >= 730 && "Cronograma holgado, típico de torres altas o mixtos."}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────── Step 5: CAPEX y honorarios ─────────── */
const Step5 = ({ form, update }) => {
  const capex = parseFloat(form.capexEstimado) || 0;
  const cont = capex * (form.contingenciaPct / 100);
  const total = capex + cont;
  const honorarios = capex * (form.honorariosCrettoPct / 100);
  const area = parseFloat(form.areaConstruida) || 0;
  const costoM2 = area > 0 ? capex / area : 0;
  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CO").replace(/,/g, ".");

  return (
    <div className="mx-auto max-w-2xl">
      <SectionHeader title="CAPEX y honorarios Cretto" desc="Estimación gruesa del presupuesto. El detalle por capítulos de obra se completa después en el módulo CAPEX." />
      <div className="space-y-4">
        <Field label="CAPEX total estimado (COP)" required>
          <Input type="number" value={form.capexEstimado} onChange={v => update({ capexEstimado: v })} placeholder="Ej. 30000000000" />
          <span className="mt-1 block text-[10px] text-stone-500">
            Referencia edificios residenciales medianos: $20.000 MM – $80.000 MM según altura y unidades. Costo típico construcción: $3M–$5M / m².
          </span>
        </Field>

        {area > 0 && capex > 0 && (
          <div className="rounded-md bg-stone-50 p-2 text-[11px] text-stone-600">
            Costo por m² construido: <strong className="font-mono">{fmt(costoM2)}/m²</strong>
          </div>
        )}

        <Field label="Precio promedio de venta (COP / m²)">
          <Input type="number" value={form.precioVentaM2} onChange={v => update({ precioVentaM2: v })} placeholder="Ej. 8000000" />
        </Field>

        <Field label={`Contingencia (${form.contingenciaPct}%)`}>
          <input type="range" min="5" max="20" step="1" value={form.contingenciaPct} onChange={e => update({ contingenciaPct: parseInt(e.target.value) })} className="w-full accent-emerald-700" />
          <div className="mt-1 flex justify-between text-[10px] text-stone-500">
            <span>5%</span><span>8-12% típico edificios</span><span>20% (alto riesgo)</span>
          </div>
        </Field>

        <Field label={`Honorarios Cretto (${form.honorariosCrettoPct}% sobre CAPEX)`}>
          <input type="range" min="1" max="8" step="0.5" value={form.honorariosCrettoPct} onChange={e => update({ honorariosCrettoPct: parseFloat(e.target.value) })} className="w-full accent-emerald-700" />
          <div className="mt-1 flex justify-between text-[10px] text-stone-500">
            <span>1%</span><span>3-5% típico</span><span>8%</span>
          </div>
        </Field>

        {capex > 0 && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700">Resumen financiero</div>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <div className="flex justify-between"><span>CAPEX base</span><span>{fmt(capex)}</span></div>
              <div className="flex justify-between"><span>+ Contingencia {form.contingenciaPct}%</span><span>{fmt(cont)}</span></div>
              <div className="flex justify-between border-t border-emerald-200 pt-1 font-bold text-emerald-900"><span>Total bajo gerencia</span><span>{fmt(total)}</span></div>
              <div className="mt-2 flex justify-between text-stone-600"><span>Honorarios Cretto ({form.honorariosCrettoPct}%)</span><span>{fmt(honorarios)}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────── Step 6: Documentos PMI ─────────── */
const Step6 = ({ form, updateDoc }) => {
  const cuentas = useMemo(() => {
    const counts = { pendiente: 0, preparacion: 0, listo: 0 };
    Object.values(form.documentos).forEach(d => { counts[d.estado] = (counts[d.estado] || 0) + 1; });
    return counts;
  }, [form.documentos]);

  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeader title="Documentos PMI requeridos" desc="Los 11 entregables del estándar PMBOK 8. Marca el estado inicial y asigna responsable + fecha compromiso." />
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
                      <button key={opt.id} onClick={() => updateDoc(doc.id, { estado: opt.id })} className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all ${colorMap[opt.color]}`}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <Input value={state.responsable} onChange={v => updateDoc(doc.id, { responsable: v })} placeholder="Responsable" small />
                <Input type="date" value={state.fechaCompromiso} onChange={v => updateDoc(doc.id, { fechaCompromiso: v })} small />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────── Step 7: Resumen ─────────── */
const Step7 = ({ form }) => {
  const docsCount = useMemo(() => {
    const c = { pendiente: 0, preparacion: 0, listo: 0 };
    Object.values(form.documentos).forEach(d => { c[d.estado]++; });
    return c;
  }, [form.documentos]);
  const fmt = (n) => "$" + Math.round(parseFloat(n) || 0).toLocaleString("es-CO").replace(/,/g, ".");
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeader title="Resumen del proyecto" desc="Revisa la información antes de crear el proyecto." />

      <SummarySection title="Información general">
        <SummaryRow label="Nombre" value={form.nombre} />
        <SummaryRow label="Promotor / fideicomitente" value={form.promotor} />
        {form.desarrollo && <SummaryRow label="Desarrollo comercial" value={form.desarrollo} />}
        <SummaryRow label="Dirección" value={`${form.direccion}${form.ciudad ? ", " + form.ciudad : ""}`} />
        <SummaryRow label="Tipología" value={form.tipologia === "mixto" ? `Mixto (${form.pctVivienda}% viv / ${form.pctComercial}% com / ${form.pctOficinas}% of)` : form.tipologia} />
        <SummaryRow label="Segmento" value={form.estratoVis.toUpperCase()} />
        <SummaryRow label="Área lote / construida / vendible" value={`${form.loteM2 || "—"} / ${form.areaConstruida || "—"} / ${form.areaVendible || "—"} m²`} />
        <SummaryRow label="Apartamentos · locales · parq." value={`${form.unidadesViv || 0} · ${form.unidadesCom || 0} · ${form.parqueaderos || 0}`} />
        <SummaryRow label="Pisos / sótanos" value={`${form.pisos || 0} / ${form.sotanos || 0}`} />
      </SummarySection>

      <SummarySection title="Equipo">
        <SummaryRow label="PM Cretto" value={form.pmCretto} />
        {form.gerenteProyectoPromotor && <SummaryRow label="PM Promotor" value={form.gerenteProyectoPromotor} />}
        <SummaryRow label={`Sponsors (${(form.sponsors || []).filter(s => s.trim()).length})`} value={(form.sponsors || []).filter(s => s.trim()).join(" · ")} />
        <SummaryRow label={`Arquitecto(s)`} value={(form.arquitectos || []).filter(a => a.trim()).join(" · ")} />
        {form.constructor && <SummaryRow label="Constructor" value={form.constructor} />}
        {form.interventor && <SummaryRow label="Interventoría" value={form.interventor} />}
        {form.comercializadora && <SummaryRow label="Comercializadora" value={form.comercializadora} />}
      </SummarySection>

      <SummarySection title="Estructura financiera">
        <SummaryRow label="Modelo de contratación" value={form.modeloContrato} />
        {form.fiduciaria && <SummaryRow label="Fiduciaria" value={form.fiduciaria} />}
        {form.patrimonioAutonomo && <SummaryRow label="Patrimonio autónomo" value={form.patrimonioAutonomo} />}
        {form.bancoFinanciador && <SummaryRow label="Banco" value={form.bancoFinanciador} />}
        {form.cupoCreditoConstructor && <SummaryRow label="Cupo crédito constructor" value={fmt(form.cupoCreditoConstructor)} />}
        <SummaryRow label="Preventas requeridas" value={`${form.pctPreventas}% (${form.unidadesPuntoEquilibrio || "—"} unidades)`} />
        {form.recursosPropios && <SummaryRow label="Recursos propios" value={fmt(form.recursosPropios)} />}
      </SummarySection>

      <SummarySection title="Fechas clave">
        <SummaryRow label="Firma de contrato" value={fmtDate(form.fechaContrato)} />
        {form.fechaLicenciaEsperada && <SummaryRow label="Licencia ejecutoriada" value={fmtDate(form.fechaLicenciaEsperada)} />}
        {form.fechaPuntoEquilibrio && <SummaryRow label="Punto de equilibrio" value={fmtDate(form.fechaPuntoEquilibrio)} />}
        <SummaryRow label="Inicio de obra" value={fmtDate(form.fechaInicioObra)} />
        <SummaryRow label="Entrega de obra" value={fmtDate(form.fechaEntregaObra)} />
        {form.fechaEscrituracionInicio && <SummaryRow label="Inicio escrituración" value={fmtDate(form.fechaEscrituracionInicio)} />}
        {form.fechaEntregaCopropiedad && <SummaryRow label="Entrega copropiedad" value={fmtDate(form.fechaEntregaCopropiedad)} />}
        {form.fechaCierre && <SummaryRow label="Cierre / liquidación P.A." value={fmtDate(form.fechaCierre)} />}
      </SummarySection>

      <SummarySection title="CAPEX y honorarios">
        <SummaryRow label="CAPEX base" value={fmt(form.capexEstimado)} />
        <SummaryRow label="Contingencia" value={`${form.contingenciaPct}% (${fmt((parseFloat(form.capexEstimado) || 0) * form.contingenciaPct / 100)})`} />
        <SummaryRow label="Total bajo gerencia" value={fmt((parseFloat(form.capexEstimado) || 0) * (1 + form.contingenciaPct / 100))} />
        <SummaryRow label="Honorarios Cretto" value={`${form.honorariosCrettoPct}% (${fmt((parseFloat(form.capexEstimado) || 0) * form.honorariosCrettoPct / 100)})`} />
        {form.precioVentaM2 && <SummaryRow label="Precio venta promedio" value={`${fmt(form.precioVentaM2)} / m²`} />}
      </SummarySection>

      <SummarySection title="Documentos PMI (11 entregables)">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-stone-100 p-2"><div className="font-serif text-2xl text-stone-800">{docsCount.pendiente}</div><div className="text-[10px] uppercase text-stone-500">Pendientes</div></div>
          <div className="rounded-md bg-amber-100 p-2"><div className="font-serif text-2xl text-amber-800">{docsCount.preparacion}</div><div className="text-[10px] uppercase text-amber-700">En preparación</div></div>
          <div className="rounded-md bg-emerald-100 p-2"><div className="font-serif text-2xl text-emerald-800">{docsCount.listo}</div><div className="text-[10px] uppercase text-emerald-700">Completos</div></div>
        </div>
      </SummarySection>

      <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-[12px] text-emerald-900">
        ✓ Al crear el proyecto, se generan los esqueletos de: <strong>CAPEX</strong>, <strong>Cronograma de construcción</strong>, <strong>Cronograma de proyecto</strong>, <strong>Repositorio de documentos</strong>, <strong>Repositorio de reuniones</strong>, <strong>Pendientes</strong>, <strong>Riesgos / cambios</strong> y los <strong>11 documentos PMI</strong>.
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
  <select value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
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
