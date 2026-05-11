// Listado base de proveedores asociados al proyecto Cosette 81.
// Schema por proveedor:
//   razonSocial: nombre comercial/razón social
//   nit: NIT (vacío para llenar)
//   servicio: tipo de servicio o producto suministrado
//   formaPago: "Contado" | "Crédito 30" | "Crédito 60" | "Anticipado" | "" (vacío para llenar)
//   contacto: nombre del contacto principal
//   cargo: cargo del contacto
//   telefono: teléfono del contacto
//   proyecto: proyecto al que está asociado el proveedor
//
// Los campos vacíos se llenan desde la pantalla Procurement de la web app
// y se persisten en window.storage con prefijo "procurement::".

export const PROVEEDORES_COSETTE_81 = [
  { id: 1,  razonSocial: "ABC Plantas",                            nit: "", servicio: "Jardinería — plantas y arreglos",                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 2,  razonSocial: "Acopio",                                 nit: "", servicio: "Papel industrial y dispensadores (Kimberly Clark)",     formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 3,  razonSocial: "Aldelo",                                 nit: "", servicio: "Tecnología — POS, software y periféricos",              formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 4,  razonSocial: "Alteca",                                 nit: "", servicio: "Calefacción eléctrica (paneles Thermaheat)",            formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 5,  razonSocial: "Amazon",                                 nit: "", servicio: "Menaje, iluminación y varios — importación",           formaPago: "Anticipado", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 6,  razonSocial: "Ambiente Gourmet",                       nit: "", servicio: "Menaje — vajilla, utensilios, azucareras",              formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 7,  razonSocial: "Aua",                                    nit: "", servicio: "Filtro de agua",                                        formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 8,  razonSocial: "Audionics",                              nit: "", servicio: "Sistema de sonido — diseño e instalación",              formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 9,  razonSocial: "Barba Puntilla",                         nit: "", servicio: "Menaje — tablas de madera, accesorios bar",             formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 10, razonSocial: "Bartending",                             nit: "", servicio: "Menaje y dotación de bar",                              formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 11, razonSocial: "BBG",                                    nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 12, razonSocial: "Business People",                        nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 13, razonSocial: "Cachivaches",                            nit: "", servicio: "Menaje — varios decorativos",                            formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 14, razonSocial: "Carmiña Villegas",                       nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 15, razonSocial: "Casa Ideas",                             nit: "", servicio: "Menaje y decoración",                                    formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 16, razonSocial: "Condor",                                 nit: "", servicio: "Menaje — utensilios de cocina",                          formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 17, razonSocial: "Crisloza",                               nit: "", servicio: "Menaje cerámico — vajilla y platos",                     formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 18, razonSocial: "Daniel Real",                            nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 19, razonSocial: "Detiketa",                               nit: "", servicio: "Tecnología — impresora de rótulos",                      formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 20, razonSocial: "Devoción",                               nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 21, razonSocial: "Dinastía",                               nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 22, razonSocial: "DLK",                                    nit: "", servicio: "Cliente del proyecto (DLK)",                             formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 23, razonSocial: "DLK Importaciones",                      nit: "", servicio: "Importaciones del cliente",                              formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 24, razonSocial: "Dollar City",                            nit: "", servicio: "Menaje — utilería de bajo costo",                        formaPago: "Contado", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 25, razonSocial: "Drinkstuff",                             nit: "", servicio: "Insumos de bar",                                         formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 26, razonSocial: "Duque Arquitectura",                     nit: "", servicio: "Construcción — contratista general (admin. delegada)",   formaPago: "Crédito 30", contacto: "Esteban Duque", cargo: "Representante Legal", telefono: "", proyecto: "Cosette 81" },
  { id: 27, razonSocial: "Electrolux",                             nit: "", servicio: "Equipos de cocina",                                      formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 28, razonSocial: "Eurolink",                               nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 29, razonSocial: "Fantasy",                                nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 30, razonSocial: "Fer y Ale",                              nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 31, razonSocial: "Ferretería Multicentro",                 nit: "", servicio: "Ferretería — herramientas y suministros varios",         formaPago: "Contado", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 32, razonSocial: "Flamecorp",                              nit: "", servicio: "Calefacción a gas",                                      formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 33, razonSocial: "Fruver Granadino",                       nit: "", servicio: "Insumos de cocina",                                      formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 34, razonSocial: "Galeria Rattan",                         nit: "", servicio: "Mobiliario — sillas y muebles de rattan",                formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 35, razonSocial: "Hobart",                                 nit: "", servicio: "Equipos de cocina — lavavajillas industriales",          formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 36, razonSocial: "Home Sentry",                            nit: "", servicio: "Menaje y decoración",                                    formaPago: "Contado", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 37, razonSocial: "Homecenter",                             nit: "", servicio: "Ferretería, materiales y varios",                        formaPago: "Contado", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 38, razonSocial: "Hot Trade",                              nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 39, razonSocial: "Ikea",                                   nit: "", servicio: "Mobiliario y menaje",                                    formaPago: "Contado", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 40, razonSocial: "Industrias Cruz",                        nit: "", servicio: "Varios — lockers metálicos lámina Cold Rolled",          formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 41, razonSocial: "Ing Gastronomica",                       nit: "", servicio: "Sistema de extracción e inyección de cocina",            formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 42, razonSocial: "Ingeniería Investigación y Ambiente S.A.", nit: "", servicio: "Estudios técnicos / ambientales",                      formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 43, razonSocial: "Joserrago",                              nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 44, razonSocial: "Juan de Hoyos",                          nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 45, razonSocial: "Kitchenaid",                             nit: "", servicio: "Equipos de cocina — pequeños electrodomésticos",         formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 46, razonSocial: "Kitech",                                 nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 47, razonSocial: "Ktronix",                                nit: "", servicio: "Tecnología — equipos de operación",                      formaPago: "Contado", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 48, razonSocial: "Le Creuset",                             nit: "", servicio: "Menaje premium — ollas y vajilla",                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 49, razonSocial: "Leal Group",                             nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 50, razonSocial: "Loto del Sur",                           nit: "", servicio: "Amenidades baños (jabones, etc.)",                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 51, razonSocial: "Mercadeo",                               nit: "", servicio: "Mercadeo / publicidad",                                  formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 52, razonSocial: "Mesas y Sillas",                         nit: "", servicio: "Mobiliario — mesas y sillas",                            formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 53, razonSocial: "Onalak",                                 nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 54, razonSocial: "Oporto",                                 nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 55, razonSocial: "Orquidea",                               nit: "", servicio: "Jardinería / arreglos florales",                         formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 56, razonSocial: "Pallomaro",                              nit: "", servicio: "Equipos de cocina industrial",                           formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 57, razonSocial: "Pricesmart",                             nit: "", servicio: "Insumos al por mayor",                                   formaPago: "Contado", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 58, razonSocial: "Produequipos",                           nit: "", servicio: "Acero / equipos en acero inoxidable",                    formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 59, razonSocial: "Rosental",                               nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 60, razonSocial: "Silicio Seguridad Electrónica",          nit: "", servicio: "CCTV — Hikvision, sistema DVR e instalación",            formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 61, razonSocial: "Studio Manrique",                        nit: "", servicio: "Arquitecto — diseño arquitectónico y de iluminación",    formaPago: "Crédito 30", contacto: "Alberto Manrique", cargo: "Gerente General", telefono: "", proyecto: "Cosette 81" },
  { id: 62, razonSocial: "Suministros y Servicios Hoteleros",      nit: "", servicio: "Menaje y dotación hotelera",                             formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 63, razonSocial: "Tybso",                                  nit: "", servicio: "Menaje",                                                 formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 64, razonSocial: "Urbana Consultores",                     nit: "", servicio: "Gestión de licencia de construcción",                    formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 65, razonSocial: "Victor Malpica",                         nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 66, razonSocial: "Victoria",                               nit: "", servicio: "",                                                       formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 67, razonSocial: "WinterHalter",                           nit: "", servicio: "Equipos de cocina — lavavajillas industrial",            formaPago: "", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" },
  { id: 68, razonSocial: "Zara Home",                              nit: "", servicio: "Menaje — textiles y decoración",                         formaPago: "Contado", contacto: "", cargo: "", telefono: "", proyecto: "Cosette 81" }
];

export const FORMAS_PAGO = ["", "Contado", "Anticipado", "Crédito 15", "Crédito 30", "Crédito 60", "Crédito 90"];
