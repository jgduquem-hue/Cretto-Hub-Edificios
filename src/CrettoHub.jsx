import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft, Search, Info, Plus, Calendar, DollarSign, FileText,
  Image, BarChart3, Activity, Home, Folders, Settings, Bell,
  ChevronRight, Filter, X, Check, AlertTriangle, Clock,
  TrendingUp, TrendingDown, Package, Truck, FileCheck,
  ListChecks, Layers, ChevronDown, ChevronUp, Edit3, Trash2,
  Download, Sparkles, ArrowUpRight, MoreHorizontal, Tag,
  MapPin, Users, Building2, Hammer, ChefHat, Lightbulb,
  Sofa, Utensils, Wind, Flame, Trees, Pen, Briefcase,
  Share2, CheckCircle2, BookOpen, Wallet
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell,
  AreaChart, Area, ReferenceLine
} from "recharts";
import CronogramaProScreen from "./CronogramaProScreen.jsx";
import NewProjectWizard from "./NewProjectWizard.jsx";
import ProcurementScreen from "./ProcurementScreen.jsx";
import RepositorioDocumentos from "./RepositorioDocumentos.jsx";
import Reuniones from "./Reuniones.jsx";
import Pendientes from "./Pendientes.jsx";
import CronogramaProyectoScreen from "./CronogramaProyectoScreen.jsx";
import RaciNotifyModal from "./RaciNotify.jsx";
import RaciMatrix from "./RaciMatrix.jsx";
import BitacoraInversionistas from "./BitacoraInversionistas.jsx";
import ModeloFinanciero from "./ModeloFinanciero.jsx";
import CapexEdificios from "./CapexEdificios.jsx";
import EvmCapexCronograma from "./EvmCapexCronograma.jsx";
import PagosProveedores, { acByWbs } from "./PagosProveedores.jsx";
import Tesoreria from "./Tesoreria.jsx";
import EmailSettings from "./EmailSettings.jsx";
import DiccionarioProcedimientos from "./DiccionarioProcedimientos.jsx";
import StakeholdersDB from "./StakeholdersDB.jsx";
import FolderSetupBanner from "./FolderSetupBanner.jsx";

/* ───────────────────────── DATA ───────────────────────── */

const COSETTE_81_DATA = {"items":[{"id":1,"cantidad":1.0,"nombre":"Aviso Principal","medidas":"Según recomendación de diseño","proveedor":"Duque Arquitectura","categoria":"Avisos y Señalización","ubicacion":"Comedor","precio":4500000,"total":5355000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":2,"cantidad":1.0,"nombre":"Calefactor eléctrico","medidas":"Panel Thermaheat TH32","proveedor":"Alteca","categoria":"Calefacción","ubicacion":"Comedor","precio":4032300,"total":4798437,"cot":true,"ped":true,"ent":0,"falt":1,"estado":"Pedido"},{"id":3,"cantidad":2.0,"nombre":"Calefactor a gas","medidas":"","proveedor":"Flamecorp","categoria":"Calefacción","ubicacion":"Cocina","precio":3720000,"total":8853600,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":4,"cantidad":1.0,"nombre":"Gestión licencia de construcción","medidas":"","proveedor":"Urbana Consultores","categoria":"Construcción","ubicacion":"Restaurante","precio":30000000,"total":35700000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":5,"cantidad":1.0,"nombre":"Construcción obra civil","medidas":"","proveedor":"Duque Arquitectura","categoria":"Construcción","ubicacion":"Restaurante","precio":1355560721,"total":1613117258,"cot":true,"ped":true,"ent":0,"falt":1,"estado":"Pedido"},{"id":6,"cantidad":1.0,"nombre":"Diseño Arquitectónico","medidas":"","proveedor":"Studio Manrique","categoria":"Diseño Arquitectónico","ubicacion":"Restaurante","precio":50000000,"total":59500000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":7,"cantidad":1.0,"nombre":"Sistema de Extracción e inyección","medidas":"","proveedor":"Ing Gastronomica","categoria":"Extracción","ubicacion":"Cocina","precio":100228656,"total":119272101,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":8,"cantidad":2.0,"nombre":"Lamparas de Calor","medidas":"","proveedor":"Amazon","categoria":"Iluminación","ubicacion":"Cocina","precio":760760,"total":1810609,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":9,"cantidad":1.0,"nombre":"Sistema de Iluminación","medidas":"Sistema de Iluminación","proveedor":"Duque Arquitectura","categoria":"Iluminación","ubicacion":"Comedor","precio":80000000,"total":95200000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":10,"cantidad":1.0,"nombre":"Diseño y suministro de Jardinería","medidas":"Paula Cabra será la diseñadora","proveedor":"Duque Arquitectura","categoria":"Jardinería","ubicacion":"Comedor","precio":12392868,"total":12392868,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":11,"cantidad":3.0,"nombre":"Superficies en mármol","medidas":"Bar pasteleria pase","proveedor":"Duque Arquitectura","categoria":"Mármol","ubicacion":"Comedor","precio":847888,"total":3026960,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":12,"cantidad":1.0,"nombre":"Mobiliario","medidas":"","proveedor":"Duque Arquitectura","categoria":"Mobiliario","ubicacion":"Comedor","precio":365684294,"total":435164310,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":13,"cantidad":1.0,"nombre":"Pergolas y Toldos","medidas":"","proveedor":"Duque Arquitectura","categoria":"Mobiliario","ubicacion":"Comedor","precio":62569000,"total":74457110,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":14,"cantidad":1.0,"nombre":"Cajón Monedero","medidas":"","proveedor":"Aldelo","categoria":"Tecnología","ubicacion":"Comedor","precio":270000,"total":321300,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":15,"cantidad":1.0,"nombre":"Implementación","medidas":"","proveedor":"Aldelo","categoria":"Tecnología","ubicacion":"Comedor","precio":1200000,"total":1428000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":16,"cantidad":6.0,"nombre":"Impresora Termica","medidas":"","proveedor":"Aldelo","categoria":"Tecnología","ubicacion":"Comedor","precio":520000,"total":3712800,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":17,"cantidad":5.0,"nombre":"Licencia de Software Vitalicio","medidas":"","proveedor":"Aldelo","categoria":"Tecnología","ubicacion":"Comedor","precio":2884250,"total":17161288,"cot":true,"ped":true,"ent":5.0,"falt":0,"estado":"Entregado"},{"id":18,"cantidad":3.0,"nombre":"POS Tipo 1","medidas":" ","proveedor":"Aldelo","categoria":"Tecnología","ubicacion":"Comedor","precio":3360000,"total":11995200,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":19,"cantidad":1.0,"nombre":"POS Tipo 2 (caja)","medidas":"","proveedor":"Aldelo","categoria":"Tecnología","ubicacion":"Comedor","precio":3690000,"total":4391100,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":20,"cantidad":1.0,"nombre":"Sistema de Sonido","medidas":"Sistema de sonido","proveedor":"Audionics","categoria":"Tecnología","ubicacion":"Comedor","precio":35015400,"total":41668326,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":21,"cantidad":1.0,"nombre":"Impresora de rótulos","medidas":"Incluye rotulos","proveedor":"Detiketa","categoria":"Tecnología","ubicacion":"Cocina","precio":1545000,"total":1838550,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":22,"cantidad":1.0,"nombre":"Equipos de Tecnología Operación","medidas":"","proveedor":"Ktronix","categoria":"Tecnología","ubicacion":"Menaje Comedor, Baños y Oficina","precio":2475296,"total":2945602,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":23,"cantidad":1.0,"nombre":"Sistema de instalación de camaras","medidas":"Hikvision y sistema DVR","proveedor":"Silicio Seguridad electrónica","categoria":"Tecnología","ubicacion":"Cocina","precio":9752800,"total":11605832,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":24,"cantidad":1.0,"nombre":"Locker Metalico 9 compartimientos","medidas":"Fabricado en lámina Cold Rolled","proveedor":"Industrias Cruz","categoria":"Varios","ubicacion":"Cocina","precio":1219159,"total":1450799,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":25,"cantidad":3.0,"nombre":"Locker Metalico 8 compartimientos","medidas":"Fabricado en lámina Cold Rolled","proveedor":"Industrias Cruz","categoria":"Varios","ubicacion":"Cocina","precio":916638,"total":3272398,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":26,"cantidad":2.0,"nombre":"Cuchillo mantequillero y queso","medidas":"French Home Laguiole - 4 piezas con asas de madera","proveedor":"Amazon","categoria":"Menaje","ubicacion":"Desayuno","precio":102318,"total":243516,"cot":true,"ped":true,"ent":1.0,"falt":1,"estado":"Pedido"},{"id":27,"cantidad":8.0,"nombre":"Bandejas de madera de acacia","medidas":"bandeja ovalada pequeña para servir platos de made","proveedor":"Barba Puntilla","categoria":"Menaje","ubicacion":"Desayuno","precio":38788,"total":369264,"cot":true,"ped":true,"ent":0,"falt":8,"estado":"Pedido"},{"id":28,"cantidad":16.0,"nombre":"Tabla provoleta con espacio para pan  / Tabla Mejillones","medidas":"","proveedor":"Barba Puntilla","categoria":"Menaje","ubicacion":"Platos","precio":60000,"total":1142400,"cot":true,"ped":true,"ent":12.0,"falt":4,"estado":"Pedido"},{"id":29,"cantidad":2.0,"nombre":"Soplete luxury","medidas":"Color plata Ref:  2-5 COCI 00001 ","proveedor":"Bartending","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":133615,"total":318004,"cot":true,"ped":true,"ent":1.0,"falt":1,"estado":"Pedido"},{"id":30,"cantidad":5.0,"nombre":"Azafate nevera parrilla metalicos cuadrado 1/2","medidas":"AZAFATE 1/2 MEDIO 10 CM ACERO INOX","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":58953,"total":350770,"cot":true,"ped":true,"ent":4.0,"falt":1,"estado":"Pedido"},{"id":31,"cantidad":3.0,"nombre":"Caja organizadora utensilios Bar grande","medidas":"Caja plastica mediano 12 litros Vaniplas","proveedor":"Condor","categoria":"Menaje","ubicacion":"Bar","precio":16134,"total":57598,"cot":false,"ped":false,"ent":0,"falt":3,"estado":"Pendiente"},{"id":32,"cantidad":2.0,"nombre":"Canastilla almacenamiento tablas ","medidas":"Canastilla plastica toda cerrada de 60x40x25 cm-Gr","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":30756,"total":73199,"cot":true,"ped":true,"ent":1.0,"falt":1,"estado":"Pedido"},{"id":33,"cantidad":20.0,"nombre":"Cuchara probar / sopa calima north ","medidas":"CUCHARA SOPA CALIMA NORTH","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":1513,"total":36009,"cot":true,"ped":true,"ent":19.0,"falt":1,"estado":"Pedido"},{"id":34,"cantidad":4.0,"nombre":"Cucharón rojo / cuchara porcionadora 3onz roja acero ","medidas":"CUCHARA PORCIONADORA 3 ONZAS ACERO INOX","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":20168,"total":96000,"cot":false,"ped":false,"ent":0,"falt":4,"estado":"Pendiente"},{"id":35,"cantidad":4.0,"nombre":"Domo para torta - tapa tortera ","medidas":"TAPA TORTERA 1 TRAN SOTUN","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":34874,"total":166000,"cot":true,"ped":true,"ent":3.0,"falt":1,"estado":"Pedido"},{"id":36,"cantidad":8.0,"nombre":"Jarra Aguas Frescas / familiar 4lt ","medidas":"JARRA FAMILIAR 4lt","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":14716,"total":140096,"cot":true,"ped":true,"ent":6.0,"falt":2,"estado":"Pedido"},{"id":37,"cantidad":6.0,"nombre":"Mise en place / organizador decoraciones 6 compartimientos","medidas":"ORGANIZADOR BAR 6 COMPARTIMENTOS TAPA/TR","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":105042,"total":750000,"cot":true,"ped":true,"ent":5.0,"falt":1,"estado":"Pedido"},{"id":38,"cantidad":40.0,"nombre":"Vaso Lisboa 8 onz (gaseosas) (corto)","medidas":"VASO LISBOA BEBIDAS 0376AL","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":5112,"total":243331,"cot":true,"ped":true,"ent":30.0,"falt":10,"estado":"Pedido"},{"id":39,"cantidad":2.0,"nombre":"Caja organizadora broche","medidas":"CAJA ORGANIZADORA C/BROCHES 37 LTS","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Cocina","precio":44286,"total":105401,"cot":true,"ped":true,"ent":1.0,"falt":1,"estado":"Pedido"},{"id":40,"cantidad":6.0,"nombre":"Tapones vinos copeo ","medidas":"","proveedor":"Drinkstuff","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":54538,"total":389401,"cot":true,"ped":true,"ent":0,"falt":6,"estado":"Pedido"},{"id":41,"cantidad":1.0,"nombre":"Escalera larga","medidas":"Escalera 3.19m 12P multiproposito Al 150K Karson","proveedor":"Homecenter","categoria":"Menaje","ubicacion":"Cocina","precio":201681,"total":240000,"cot":true,"ped":false,"ent":0,"falt":1,"estado":"Cotizado"},{"id":42,"cantidad":1.0,"nombre":"Esquinero de goma para repisas","medidas":"Protector Esquinas Muebles Cuadrado 42X42Mm 4Und","proveedor":"Homecenter","categoria":"Menaje","ubicacion":"Cocina","precio":19328,"total":23000,"cot":true,"ped":false,"ent":0,"falt":1,"estado":"Cotizado"},{"id":43,"cantidad":1.0,"nombre":"Estructura  discapacitados","medidas":"Barra De Seguridad Abatible Acero Inoxidable 80X18","proveedor":"Homecenter","categoria":"Menaje","ubicacion":"Sin asignar","precio":336134,"total":400000,"cot":true,"ped":false,"ent":0,"falt":1,"estado":"Cotizado"},{"id":44,"cantidad":2.0,"nombre":"Protección Fieltro sillas","medidas":"Pack x177 Protector Fieltro Fixser","proveedor":"Homecenter","categoria":"Menaje","ubicacion":"Cocina","precio":201681,"total":480000,"cot":true,"ped":true,"ent":0,"falt":2,"estado":"Pedido"},{"id":45,"cantidad":24.0,"nombre":"Bowl arroz acompañamiento","medidas":"Ref: 22804 - 12.5 CM DE DIAMETRO Y  6,5 CM DE ALTO","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Platos","precio":40957,"total":1169722,"cot":true,"ped":true,"ent":12.0,"falt":12,"estado":"Pedido"},{"id":46,"cantidad":48.0,"nombre":"Bowl Mediano","medidas":"Ref: 23902 - 20 CM PERO CON DECORACIÓN BICOLOR GRI","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Platos","precio":56234,"total":3212115,"cot":true,"ped":true,"ent":36.0,"falt":12,"estado":"Pedido"},{"id":47,"cantidad":3.0,"nombre":"Cubierto secado MISE EN PLACE PLASTICOS","medidas":"Ref: 2531 - Rubbermaid (4 compartimientos)","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":80828,"total":288556,"cot":true,"ped":true,"ent":2.0,"falt":1,"estado":"Pedido"},{"id":48,"cantidad":1.0,"nombre":"Tableta sonido","medidas":"Tablet SAMSUNG 8.7\" Pulgadas Tab A11 128GB WiFi Gr","proveedor":"Ktronix","categoria":"Menaje","ubicacion":"Sin asignar","precio":503891,"total":599630,"cot":false,"ped":false,"ent":0,"falt":1,"estado":"Pendiente"},{"id":49,"cantidad":2.0,"nombre":"Manga de tela ","medidas":"MANGAS DECOPAC 20\"","proveedor":"Orquidea","categoria":"Menaje","ubicacion":"Cocina","precio":16807,"total":40001,"cot":true,"ped":true,"ent":1.0,"falt":1,"estado":"Pedido"},{"id":50,"cantidad":6.0,"nombre":"Molde estrella pancakes silicona ","medidas":"MOLDES ESTRELLA HUEVOS/PANCAKES","proveedor":"Orquidea","categoria":"Menaje","ubicacion":"Cocina","precio":8403,"total":59997,"cot":true,"ped":true,"ent":4.0,"falt":2,"estado":"Pedido"},{"id":51,"cantidad":100.0,"nombre":"Bandeja mediana Cosette","medidas":"15001-143028 BANDEJA OVALADA 28 cm MODEST NAVY ID ","proveedor":"Suministros y Servicios Hoteleros","categoria":"Menaje","ubicacion":"Platos","precio":40713,"total":4844847,"cot":true,"ped":true,"ent":96,"falt":4,"estado":"Pedido"},{"id":52,"cantidad":30.0,"nombre":"Plato pocillo desayuno","medidas":"15001-111216 PLATO P/POCILLO 16 cm MODEST NAVY ID ","proveedor":"Suministros y Servicios Hoteleros","categoria":"Menaje","ubicacion":"Desayuno","precio":16367,"total":584302,"cot":true,"ped":true,"ent":24.0,"falt":6,"estado":"Pedido"},{"id":53,"cantidad":30.0,"nombre":"Pocillo desayuno","medidas":"15001-304030 MUG MODEST NAVY ID FINE","proveedor":"Suministros y Servicios Hoteleros","categoria":"Menaje","ubicacion":"Desayuno","precio":25438,"total":908137,"cot":true,"ped":true,"ent":24.0,"falt":6,"estado":"Pedido"},{"id":54,"cantidad":18.0,"nombre":"Pimentero negro y Salero Blanco (PAR)","medidas":"Bill.F empaque x2 madera y negro","proveedor":"Amazon","categoria":"Menaje","ubicacion":"Mise en place Comedor","precio":79209,"total":1696662,"cot":true,"ped":true,"ent":18.0,"falt":0,"estado":"Entregado"},{"id":55,"cantidad":2.0,"nombre":"Lampara de Calor","medidas":"JIAWANSHUN Lámpara de calor para alimentos","proveedor":"Amazon","categoria":"Menaje","ubicacion":"Platos","precio":287395,"total":684000,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":56,"cantidad":6.0,"nombre":"Cocottes Pure Cosette azul oscuro ","medidas":"Staub mini round cocotte 3 pieces dark blue","proveedor":"Amazon","categoria":"Menaje","ubicacion":"Platos","precio":199832,"total":1426800,"cot":true,"ped":true,"ent":9.0,"falt":-3,"estado":"Entregado"},{"id":57,"cantidad":2.0,"nombre":"Gancho Tabla de Vino","medidas":"Paquete de 10 clips de portapapeles de 2.76 pulgad","proveedor":"Amazon","categoria":"Menaje","ubicacion":"Mise en place Comedor","precio":35259,"total":83916,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":58,"cantidad":1.0,"nombre":"Gramera FBH ","medidas":"FHB Control - 15kg","proveedor":"Amazon","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":206723,"total":246000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":59,"cantidad":1.0,"nombre":"Mandolina","medidas":"Cortadora de estilo japonés para verduras","proveedor":"Amazon","categoria":"Menaje","ubicacion":"Cocina","precio":96471,"total":114800,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":60,"cantidad":3.0,"nombre":"Torteras Vitrina","medidas":"Tablecraft acacia Collection 12.5\" x 9\"","proveedor":"Amazon","categoria":"Menaje","ubicacion":"Platos","precio":104471,"total":372960,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":61,"cantidad":16.0,"nombre":"Mangos negros calor sarten chorizo ","medidas":"Soporte de silicona para mango caliente, funda de ","proveedor":"Amazon","categoria":"Menaje","ubicacion":"Comedor","precio":38500,"total":733040,"cot":true,"ped":true,"ent":24.0,"falt":-8,"estado":"Entregado"},{"id":62,"cantidad":20.0,"nombre":"Azucareras","medidas":"Recipiente para azucar en sobre","proveedor":"Ambiente Gourmet","categoria":"Menaje","ubicacion":"Servilletas y Cubiertos","precio":10042,"total":239000,"cot":true,"ped":true,"ent":20.0,"falt":0,"estado":"Entregado"},{"id":63,"cantidad":24.0,"nombre":"Sartén aluminio fundido para huevos","medidas":"14cm de color negro","proveedor":"Ambiente Gourmet","categoria":"Menaje","ubicacion":"Cocina","precio":41975,"total":1198800,"cot":true,"ped":true,"ent":24.0,"falt":0,"estado":"Entregado"},{"id":64,"cantidad":2.0,"nombre":"Jarra miel pase ","medidas":"","proveedor":"Ambiente Gourmet","categoria":"Menaje","ubicacion":"Comedor","precio":19286,"total":45900,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":65,"cantidad":12.0,"nombre":"jarrita miel orejitas","medidas":"","proveedor":"Ambiente Gourmet","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":6681,"total":95400,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":66,"cantidad":3.0,"nombre":"Escoba y recogedor servicio","medidas":"","proveedor":"Ambiente Gourmet","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":50378,"total":179850,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":67,"cantidad":15.0,"nombre":"Tabla de Vino","medidas":"","proveedor":"Barba Puntilla","categoria":"Menaje","ubicacion":"Comedor","precio":22000,"total":392700,"cot":true,"ped":true,"ent":20.0,"falt":-5,"estado":"Entregado"},{"id":68,"cantidad":20.0,"nombre":"Pasa Cuentas ","medidas":"","proveedor":"Barba Puntilla","categoria":"Menaje","ubicacion":"Mise en place Comedor","precio":25000,"total":595000,"cot":true,"ped":true,"ent":20.0,"falt":0,"estado":"Entregado"},{"id":69,"cantidad":50.0,"nombre":"Tablas hamburguesa ","medidas":"","proveedor":"Barba Puntilla","categoria":"Menaje","ubicacion":"Platos","precio":55000,"total":3272500,"cot":true,"ped":true,"ent":50.0,"falt":0,"estado":"Entregado"},{"id":70,"cantidad":2.0,"nombre":"Atomizador metalico ","medidas":"5ml Ref: 4-11 COCT 00023 ","proveedor":"Bartending","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":16639,"total":39601,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":71,"cantidad":2.0,"nombre":"Cocteleras Koriko 28/18 Oz","medidas":"4-1 COCT 00024","proveedor":"Bartending","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":126050,"total":299999,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":72,"cantidad":2.0,"nombre":"Colador Julep ","medidas":"Julep Plateada Ref: 4-4 COCT 00035 ","proveedor":"Bartending","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":12185,"total":29000,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":73,"cantidad":4.0,"nombre":"Cucharas bar  30 cm ","medidas":"Gota de lágrima plateada 30cm Ref: 4-3 COCT 00005","proveedor":"Bartending","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":21008,"total":99998,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":74,"cantidad":4.0,"nombre":"Cucharas bar  50 cm ","medidas":"Gota de lágrima plateada 50cm Ref: 4-3 COCT 00006","proveedor":"Bartending","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":37815,"total":179999,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":75,"cantidad":6.0,"nombre":"Jigger 25/50 japones plata","medidas":" 25*50 ML  Ref: 4-7 COCT 00041","proveedor":"Bartending","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":20168,"total":144000,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":76,"cantidad":6.0,"nombre":"Jigger 60/30 japones plata ","medidas":"30*60 ML Ref: 8 4-7 COCT 00025 ","proveedor":"Bartending","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":20168,"total":144000,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":77,"cantidad":2.0,"nombre":"Pala de hielo ","medidas":"PALA DRENAJE 8 OZ Ref: 5-8 COMP 00007 ","proveedor":"Bartending","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":24370,"total":58001,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":78,"cantidad":24.0,"nombre":"Copa Balón Ginebras","medidas":"Ref: 440253","proveedor":"Business People","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":20990,"total":599474,"cot":true,"ped":true,"ent":24.0,"falt":0,"estado":"Entregado"},{"id":79,"cantidad":4.0,"nombre":"Copa Cognac 17 oz","medidas":"Ref: 66123","proveedor":"Business People","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":41990,"total":199872,"cot":true,"ped":true,"ent":6.0,"falt":-2,"estado":"Entregado"},{"id":80,"cantidad":12.0,"nombre":"Copa Coupe (Margarita) 8.5 oz","medidas":"Ref: 3055","proveedor":"Business People","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":17990,"total":256897,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":81,"cantidad":6.0,"nombre":"Copa Martini 8 oz","medidas":"Ref: 7512","proveedor":"Business People","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":25690,"total":183427,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":82,"cantidad":180.0,"nombre":"Cuchara postre","medidas":"Ref: 1670-15","proveedor":"Business People","categoria":"Menaje","ubicacion":"Servilletas y Cubiertos","precio":12740,"total":2728908,"cot":true,"ped":true,"ent":180,"falt":0,"estado":"Entregado"},{"id":83,"cantidad":108.0,"nombre":"Cuchara Principal","medidas":"Ref: 1670-2","proveedor":"Business People","categoria":"Menaje","ubicacion":"Servilletas y Cubiertos","precio":14990,"total":1926515,"cot":true,"ped":true,"ent":108.0,"falt":0,"estado":"Entregado"},{"id":84,"cantidad":84.0,"nombre":"Cucharita café","medidas":"Ref: 6966-3","proveedor":"Business People","categoria":"Menaje","ubicacion":"Servilletas y Cubiertos","precio":7660,"total":765694,"cot":true,"ped":true,"ent":84.0,"falt":0,"estado":"Entregado"},{"id":85,"cantidad":240.0,"nombre":"Cuchillo Principal","medidas":"Ref: 1670-5","proveedor":"Business People","categoria":"Menaje","ubicacion":"Servilletas y Cubiertos","precio":14900,"total":4255440,"cot":true,"ped":true,"ent":240.0,"falt":0,"estado":"Entregado"},{"id":86,"cantidad":180.0,"nombre":"Tenedor postre","medidas":"Ref: 1670-14","proveedor":"Business People","categoria":"Menaje","ubicacion":"Servilletas y Cubiertos","precio":11220,"total":2403324,"cot":true,"ped":true,"ent":180.0,"falt":0,"estado":"Entregado"},{"id":87,"cantidad":300.0,"nombre":"Tenedor Principal","medidas":"Ref: 1670-1","proveedor":"Business People","categoria":"Menaje","ubicacion":"Servilletas y Cubiertos","precio":14990,"total":5351430,"cot":true,"ped":true,"ent":300.0,"falt":0,"estado":"Entregado"},{"id":88,"cantidad":500.0,"nombre":"Servilletas tela ","medidas":"Servilleta Signature Stripe Azul 45x55 Milliken (B","proveedor":"Carmiña Villegas","categoria":"Menaje","ubicacion":"Servilletas y Cubiertos","precio":10800,"total":6426000,"cot":true,"ped":true,"ent":500.0,"falt":0,"estado":"Entregado"},{"id":89,"cantidad":1.0,"nombre":"Rodillo para a / dispensador a ","medidas":"DISPENSADOR MANTEQUILLA BUTTER RODILLO","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":134454,"total":160000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":90,"cantidad":16.0,"nombre":"Tupper pulpas neveras 4 lt ","medidas":"RECIPIENTE RECTANGULAR 4 LT BLANCO ESTRA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":11739,"total":223511,"cot":true,"ped":true,"ent":16.0,"falt":0,"estado":"Entregado"},{"id":91,"cantidad":4.0,"nombre":"Bandeja metálicas reposo carne pequeñas","medidas":"MOLDE RECTANGULAR EN ALUMINIO","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":15630,"total":74399,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":92,"cantidad":1.0,"nombre":"Embudo cocina - grande ","medidas":"EMBUDO GRANDE N.P. REF:11804","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":5713,"total":6798,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":93,"cantidad":9.0,"nombre":"Azafate metálico 1/3 hondo (demiglace) - 10cm altura ","medidas":"AZAFATE 1/3 TERCIO 10 CM ACERO INOX","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":46542,"total":498465,"cot":true,"ped":true,"ent":24.0,"falt":-15,"estado":"Entregado"},{"id":94,"cantidad":10.0,"nombre":"Azafate metálico 1/6","medidas":"AZAFATE 1/6 10 CM ACERO INOX","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":28445,"total":338496,"cot":true,"ped":true,"ent":10.0,"falt":0,"estado":"Entregado"},{"id":95,"cantidad":14.0,"nombre":"Azafate metálico 1/9 - 10 CM ","medidas":"AZAFATE 1/9 NOVENO 10 CM ACERO INOX","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":28445,"total":473894,"cot":true,"ped":true,"ent":47.0,"falt":-33,"estado":"Entregado"},{"id":96,"cantidad":3.0,"nombre":"Azafate metálico grande 1/1 GN  - 6,5cm de altura","medidas":"AZAFATE 1/1 ENTERO 6,5 CM ACERO INOX / POLIPROPILE","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":92049,"total":328615,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":97,"cantidad":4.0,"nombre":"Destapador de cerveza","medidas":"","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":11765,"total":56001,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":98,"cantidad":2.0,"nombre":"Jarras jugo personal caribe 4 lt ","medidas":"JARRA FAMILIAR 4lt","proveedor":"Condor","categoria":"Menaje","ubicacion":"Varios Personal","precio":14716,"total":35024,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":99,"cantidad":1.0,"nombre":"Abrelatas Press","medidas":"","proveedor":"Condor","categoria":"Menaje","ubicacion":"Bar","precio":11345,"total":13501,"cot":true,"ped":true,"ent":2.0,"falt":-1,"estado":"Entregado"},{"id":100,"cantidad":12.0,"nombre":"Aceiteras  / vinajera vidrio ","medidas":"VINAJERA VIDRIO 7082 -000/1787337","proveedor":"Condor","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":11681,"total":166805,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":101,"cantidad":1.0,"nombre":"Aragan piso  / fibra de vidrio ","medidas":"ARAGAN FIBRA DE VIDRIO Y ESCURRIDOR","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":105882,"total":126000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":102,"cantidad":14.0,"nombre":"Atomizador  Grande 32 oz","medidas":"ATOMIZADOR GRANDE 32ONZAS BOTELLA GATILLO","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":10924,"total":181994,"cot":true,"ped":true,"ent":14.0,"falt":0,"estado":"Entregado"},{"id":103,"cantidad":3.0,"nombre":"Bandeja plástica pequeña 27x35","medidas":"BANDEJA PEQUEÑA 27*35 NEGRA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":9063,"total":32355,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":104,"cantidad":2.0,"nombre":"Bandeja plásticas grande autoservicio  35.5 x 47 ","medidas":"BANDEJA AUTOSERVICIO GRANDE 35.5*47CM NG","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":15882,"total":37799,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":105,"cantidad":8.0,"nombre":"Bases vinos","medidas":"pedestal acero para vino","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Comedor","precio":292437,"total":2784000,"cot":true,"ped":true,"ent":8.0,"falt":0,"estado":"Entregado"},{"id":106,"cantidad":4.0,"nombre":"Batidor mediano acero inoxidable 30 cm ","medidas":"BATIDOR ACERO INOXIDABLE 30 CM ALUMAR","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":16218,"total":77198,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":107,"cantidad":10.0,"nombre":"Bowl mediano acero inoxidable 26 cm ","medidas":"BOWL ACERO INOXIDABLE 26CM","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":20000,"total":238000,"cot":true,"ped":true,"ent":10.0,"falt":0,"estado":"Entregado"},{"id":108,"cantidad":5.0,"nombre":"Bowl pequeño acero inoxidable 21 cm ","medidas":"BOWL ACERO INOXIDABLE 21CM","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":12605,"total":75000,"cot":true,"ped":true,"ent":5.0,"falt":0,"estado":"Entregado"},{"id":109,"cantidad":4.0,"nombre":"Brochas plasticas de goma ","medidas":"REF: CRV 167","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":5042,"total":24000,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":110,"cantidad":2.0,"nombre":"Burro soporte para bandeja 31 \" ","medidas":"BURRO SOPORTE PARA BANDEJA 31\"","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Comedor","precio":205882,"total":489999,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":111,"cantidad":5.0,"nombre":"Caja organizadora utensilios Bar mediana","medidas":"Caja plastica mediano 8 litros Vaniplas","proveedor":"Condor","categoria":"Menaje","ubicacion":"Bar","precio":13445,"total":79998,"cot":true,"ped":true,"ent":8.0,"falt":-3,"estado":"Entregado"},{"id":112,"cantidad":3.0,"nombre":"Calderos (arroz) mediano caldero AF 36 CM ","medidas":"CALDERO AF 36CM11.4 LN14 NT","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":103734,"total":370330,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":113,"cantidad":45.0,"nombre":"Cambro transparente rectangular 16 lt","medidas":"CAJA ORGANIZADORA 16 LTRS BLANCO","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":35470,"total":1899418,"cot":true,"ped":true,"ent":47.0,"falt":-2,"estado":"Entregado"},{"id":114,"cantidad":35.0,"nombre":"Cambro transparente rectangular 2 lt","medidas":"RECIPIENTE RECTANGULAR 2 LT BLANCO ESTRA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":8182,"total":340780,"cot":true,"ped":true,"ent":36.0,"falt":-1,"estado":"Entregado"},{"id":115,"cantidad":40.0,"nombre":"Cambro transparente rectangular 4 lt","medidas":"RECIPIENTE RECTANGULAR 4 LT BLANCO ESTRA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":11739,"total":558776,"cot":true,"ped":true,"ent":40.0,"falt":0,"estado":"Entregado"},{"id":116,"cantidad":40.0,"nombre":"Cambro transparente rectangular 8 lt","medidas":"CAJA ORGANIZADORA 8 LTRS BLANCO","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":25930,"total":1234268,"cot":true,"ped":true,"ent":40.0,"falt":0,"estado":"Entregado"},{"id":117,"cantidad":2.0,"nombre":"Campana timbre  / campana de recepcion ","medidas":"CAMPANA DE RECEPCION","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":20168,"total":48000,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":118,"cantidad":3.0,"nombre":"Canastilla almacenamiento papa ","medidas":"CANASTA TODA CERRADA 60X40X25 GRIS","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":44286,"total":158101,"cot":true,"ped":true,"ent":4.0,"falt":-1,"estado":"Entregado"},{"id":119,"cantidad":3.0,"nombre":"Caneca  cliente de pedal con tapa","medidas":"PAPELERA PEDAL ACERO INOX 5 LTRS TRAMONTINA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Comedor","precio":125210,"total":447000,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":120,"cantidad":2.0,"nombre":"Caneca plastica blanca - papelera vaiven tapa plana 53 lt ","medidas":"PAPELERA VAIVEN T/PL ANA 53 LT BLANCA S/M","proveedor":"Condor","categoria":"Menaje","ubicacion":"Bar","precio":83302,"total":198259,"cot":true,"ped":true,"ent":3.0,"falt":-1,"estado":"Entregado"},{"id":121,"cantidad":1.0,"nombre":"Caneca plastica negra - papelera vaiven 10lt  - personal ","medidas":"PAPELERA VAIVEN 10 L TRS NEGRO NO APROVECHABLES","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":48151,"total":57300,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":122,"cantidad":3.0,"nombre":"Caneca plastica negra - papelera vaiven tapa plana 53 lt ","medidas":"PAPELERA VAIVEN T/ P LANA 53L NEGRA MAR","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":83302,"total":297388,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":123,"cantidad":3.0,"nombre":"Caneca plastica verde - papelera vaiven tapa plana 53 lt ","medidas":"PAPELERA VAIVEN T/PL ANA 53 LTR VERDE MA R","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":83302,"total":297388,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":124,"cantidad":4.0,"nombre":"Canecas Comedor","medidas":"PAPELERA PEDAL ACERO INOX 5 LTRS TRAMONTINA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":125210,"total":596000,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":125,"cantidad":1.0,"nombre":"Centrifugador grande  (naranja)","medidas":"CENTRIFUGA DE ENSALADAS 12 LITROS","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":567227,"total":675000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":126,"cantidad":1.0,"nombre":"Chaira 12 pulgadas ","medidas":"CHAIRA 12\" PROFESIOAL TRAMONTINA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":55168,"total":65650,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":127,"cantidad":1.0,"nombre":"Charol Jumbo  / bandeja ovalada antideslizante ","medidas":"BANDEJA OVALADA AN TIDESLIZANTE 2700BK","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Comedor","precio":92437,"total":110000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":128,"cantidad":5.0,"nombre":"Chuzo porta comandas  / trinche ","medidas":"CHUZO PORTACOMANDA UPDATE","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":13445,"total":79998,"cot":true,"ped":true,"ent":5.0,"falt":0,"estado":"Entregado"},{"id":129,"cantidad":2.0,"nombre":"Colador  de acero reforzado  / colador acero inoxidable","medidas":"COLADOR ACERO REFORZADO 22CM M/METALICO","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":22647,"total":53900,"cot":true,"ped":true,"ent":4.0,"falt":-2,"estado":"Entregado"},{"id":130,"cantidad":2.0,"nombre":"Colador chino mediano 10\"","medidas":"COLADOR CHINO DE 12\"","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":180672,"total":429999,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":131,"cantidad":1.0,"nombre":"Colador grandes  fritos / cernidor #28 MUNAL ","medidas":"CERNIDOR MUNAL # 28","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":54086,"total":64362,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":132,"cantidad":2.0,"nombre":"Colador mediano  fritos / cernidor #12 MUNAL ","medidas":"CERNIDOR # 12 MUNA L","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":30357,"total":72250,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":133,"cantidad":4.0,"nombre":"Colador plateado","medidas":"Excalibur 8cm","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":2521,"total":12000,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":134,"cantidad":8.0,"nombre":"Comandera metalica 90 cm ","medidas":"COMANDERA METALIC A 90 CM HL0240290031 5","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":64706,"total":616001,"cot":true,"ped":true,"ent":9.0,"falt":-1,"estado":"Entregado"},{"id":135,"cantidad":24.0,"nombre":"Cubeta ct color gris 5 lt ","medidas":"CUBETA C/T COLOR GR IS 5 LTRS GUERS","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":9244,"total":264009,"cot":true,"ped":true,"ent":30.0,"falt":-6,"estado":"Entregado"},{"id":136,"cantidad":6.0,"nombre":"Cuchara de coctel helado ","medidas":"CUCHARA COCTEL HELADO #2 FUNDIDA REF: Himalaya","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":4053,"total":28938,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":137,"cantidad":6.0,"nombre":"Cuchara grande metálica servicio","medidas":"CUCHARA PARA SERVIR UNA PIEZA TRAMONTINA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":13151,"total":93898,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":138,"cantidad":35.0,"nombre":"Cuchara personal / sopa calima north ","medidas":"CUCHARA SOPA CALIMA NORTH","proveedor":"Condor","categoria":"Menaje","ubicacion":"Varios Personal","precio":1513,"total":63016,"cot":true,"ped":true,"ent":36.0,"falt":-1,"estado":"Entregado"},{"id":139,"cantidad":100.0,"nombre":"Cucharita de espresso y salsas","medidas":"HIMALAYA MINI","proveedor":"Condor","categoria":"Menaje","ubicacion":"Servilletas y Cubiertos","precio":2918,"total":347242,"cot":true,"ped":true,"ent":100.0,"falt":0,"estado":"Entregado"},{"id":140,"cantidad":1.0,"nombre":"Cucharón blanco perforado","medidas":"3 OZ","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":20168,"total":24000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":141,"cantidad":5.0,"nombre":"Cucharón sopero / pieza completa inox 8onz ","medidas":"CUCHARON PIEZA COMPLETA INOX 8 OZ","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":15126,"total":90000,"cot":true,"ped":true,"ent":5.0,"falt":0,"estado":"Entregado"},{"id":142,"cantidad":7.0,"nombre":"CUCHILLO 10\" BLANCO TRAMONTINA PROFESIONAL","medidas":"CUCHILLO 10\" BLANCO TRAMONTINA PROFESIONAL","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":42857,"total":356999,"cot":true,"ped":true,"ent":7.0,"falt":0,"estado":"Entregado"},{"id":143,"cantidad":2.0,"nombre":"CUCHILLO 4\" MOLDEADOR PROFESIONAL TRAMONTINA","medidas":"CUCHILLO 4\" MOLDEADOR PROFESIONAL TRAMONTINA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":11176,"total":26599,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":144,"cantidad":2.0,"nombre":"CUCHILLO 8\" BLANCO TRAMONTINA PROFESIONAL","medidas":"CUCHILLO 8\" BLANCO TRAMONTINA PROFESIONAL","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":29412,"total":70001,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":145,"cantidad":2.0,"nombre":"Cuchillo Mediano 4\" tramontina","medidas":" 4\" MOLDEADOR PROFESIONAL","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":15630,"total":37199,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":146,"cantidad":2.0,"nombre":"CUCHILLO SIERRA PAN 12M/BLANCO PROFESION TRAMONTINA","medidas":"CUCHILLO SIERRA PAN 12M/BLANCO PROFESION TRAMONTIN","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":60672,"total":144399,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":147,"cantidad":8.0,"nombre":"Decanter Pichet  12.5 onz","medidas":"DECANTER 0220AL 12.  5oz","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":6571,"total":62556,"cot":true,"ped":true,"ent":12.0,"falt":-4,"estado":"Entregado"},{"id":148,"cantidad":12.0,"nombre":"Dosificadores / vertedor de flujo ","medidas":"precisión  de 1.5 onz Ref: 4-5 COCT 00001 ","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":4958,"total":70800,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":149,"cantidad":2.0,"nombre":"Embudos bar - PEQUEÑO ","medidas":"EMBUDO PEQUENO N.P REF:11806","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":2230,"total":5307,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":150,"cantidad":3.0,"nombre":"Espátula cuadrada grande de codo","medidas":"ESPATULA HAMBURGUE SA 7*4 1/4 PROFESIONAL","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":63866,"total":228002,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":151,"cantidad":6.0,"nombre":"Espátula de goma termoresistente / silicona calor * 10\" ","medidas":"ESPATULA SILICONA CALOR 10\"","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":17647,"total":126000,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":152,"cantidad":2.0,"nombre":"Espátula de goma termoresistente / silicona calor * 14\" ","medidas":"ESPATULA SILICONA CALOR 14\"","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":34034,"total":81001,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":153,"cantidad":2.0,"nombre":"Espátula larga lengua punta redonda","medidas":"ESPATULA FRITURA 9\" *3\"PROFESIONAL REF: 24679","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":61765,"total":147001,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":154,"cantidad":1.0,"nombre":"Espumadera ","medidas":"ESPUMADERA INDUSTRIAL INCA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":20440,"total":24324,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":155,"cantidad":2.0,"nombre":"Exprimidor de limón ","medidas":"EXPRIMIDOR LIMON PRESS","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":26471,"total":63001,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":156,"cantidad":2.0,"nombre":"Exprimidor limones bar","medidas":"","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":26471,"total":63001,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":157,"cantidad":1.0,"nombre":"Gas butano para soplete","medidas":"Gas butano 280ml Ref: 5-8 COMP 00032","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":12605,"total":15000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":158,"cantidad":1.0,"nombre":"Gramera bar pequeña ","medidas":"","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":21008,"total":25000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":159,"cantidad":4.0,"nombre":"Hielera metalica Hielo mesa","medidas":"1,3 lt Ref: 5-8 COMP 00022 ","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":15966,"total":75998,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":160,"cantidad":8.0,"nombre":"Hielera metalica Vino","medidas":"4,75 lt Ref: 5-8 COMP 00023 ","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":49580,"total":472002,"cot":true,"ped":true,"ent":8.0,"falt":0,"estado":"Entregado"},{"id":161,"cantidad":4.0,"nombre":"Jarra leche  1,2 lt ","medidas":"JARRA LECHE C/MANG O 1.2L","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":7038,"total":33501,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":162,"cantidad":6.0,"nombre":"Jarra Media Sangria 780ml","medidas":"JARRA BAR 780ml VIDRIO CRISTAR REF: 541601","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":9747,"total":69594,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":163,"cantidad":2.0,"nombre":"Jarra medidora plástica 0,5 lt / taza medidora ","medidas":"TAZA MEDIDORA 1/2 LITRO PRESS REF: 76824","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":12689,"total":30200,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":164,"cantidad":12.0,"nombre":"Jarra Sangria grande 1,55 LTS","medidas":"JARRA BAR 1,55 LTS REF: 54140","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":13525,"total":193137,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":165,"cantidad":107.0,"nombre":"Plato base ondas actualite  ","medidas":"Plato Pando 21.7cm Actualite Blanco Ancestral","proveedor":"Condor","categoria":"Menaje","ubicacion":"Platos","precio":21772,"total":2772229,"cot":true,"ped":true,"ent":107,"falt":0,"estado":"Entregado"},{"id":166,"cantidad":2.0,"nombre":"Macerador grande ","medidas":"Ref: 4-9 COCT 00004 ","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":24370,"total":58001,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":167,"cantidad":2.0,"nombre":"Mise en place  / organizador bar 4 compartimientos ","medidas":"ORGANIZADOR DE CADDY BAR CAFE","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":89076,"total":212001,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":168,"cantidad":6.0,"nombre":"Olla grande (rusos) / perol 24cm ","medidas":"PEROL AL 24CM5L PRF","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":85837,"total":612876,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":169,"cantidad":1.0,"nombre":"Olla grande 40 lt  / Caldero fuerte 40 cm ","medidas":"CALDERO FUERTE AL 40CM29L PRF REF:00583","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":139530,"total":166041,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":170,"cantidad":2.0,"nombre":"Olla mediana  36lt / olla munal #32 ","medidas":"OLLA #32 MUNAL REF: 00581","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":113757,"total":270742,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":171,"cantidad":8.0,"nombre":"Olla pequeña (rusos) / perol 20cm ","medidas":"PEROL AL 20CM2.7L PR F","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":65792,"total":626340,"cot":true,"ped":true,"ent":8.0,"falt":0,"estado":"Entregado"},{"id":172,"cantidad":1.0,"nombre":"Olla pitadora / Olla a presion magna 25 lt ","medidas":"OLLA A PRESION MAGN A 25 LITROS UNIVERSAL","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":724314,"total":861934,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":173,"cantidad":1.0,"nombre":"pala para torta ","medidas":"PALA PARA TORTA REF: 1958","proveedor":"Condor","categoria":"Menaje","ubicacion":"cocina","precio":15908,"total":18931,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":174,"cantidad":3.0,"nombre":"Pelador de verduras  papa victorinox ","medidas":"PELAPAPA NEGRO VICTORINOX","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":29328,"total":104701,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":175,"cantidad":2.0,"nombre":"Pelador limón Press","medidas":"REF: 10203","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":14538,"total":34600,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":176,"cantidad":2.0,"nombre":"Pica hielo dentado","medidas":"6 puntas","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":36975,"total":88000,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":177,"cantidad":1.0,"nombre":"Piedra para afilar tramontina ","medidas":"PIEDRA AFILADORA DE CUCHILLOS EXCALIBUR","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":24370,"total":29000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":178,"cantidad":3.0,"nombre":"Pinza grande metálica / 12\"  mango poplipropileno ","medidas":"PINZA DE 12\"MANGO POLIPROPILENO","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":44202,"total":157801,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":179,"cantidad":2.0,"nombre":"Pinzas Bar Decoraciones grande","medidas":"Pinza emplatar 20cm","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":19328,"total":46001,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":180,"cantidad":2.0,"nombre":"Pinzas Bar Decoraciones mediana","medidas":"Pinza emplatar 16 cm","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":17647,"total":42000,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":181,"cantidad":2.0,"nombre":"Pinzas hielo mesa ","medidas":"Ref: 2-3 COCI 00058 ","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":6555,"total":15601,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":182,"cantidad":12.0,"nombre":"Plato Negro / pando coupe 23,6 cm pluto reactivo ","medidas":"CORONA PLATO PANDO COUPE 23.6CM PLUTO REACTIVO","proveedor":"Condor","categoria":"Menaje","ubicacion":"Platos","precio":30890,"total":441109,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":183,"cantidad":35.0,"nombre":"Platos pandos personal","medidas":"PLATO PANDO 23CM MELAMINA BLANCO REDONDO ","proveedor":"Condor","categoria":"Menaje","ubicacion":"Varios Personal","precio":5042,"total":209999,"cot":true,"ped":true,"ent":35.0,"falt":0,"estado":"Entregado"},{"id":184,"cantidad":35.0,"nombre":"Platos sopa personal / plato hondo melamina 18 cm ","medidas":"PLATO HONDO MELAMINA 18 CM BLANCO RT","proveedor":"Condor","categoria":"Menaje","ubicacion":"Varios Personal","precio":4622,"total":192506,"cot":true,"ped":true,"ent":35.0,"falt":0,"estado":"Entregado"},{"id":185,"cantidad":8.0,"nombre":"Prensa francesa x 300 ml","medidas":"CAFETERA PRENSA FRANCESA 350 ML","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":22689,"total":215999,"cot":true,"ped":true,"ent":8.0,"falt":0,"estado":"Entregado"},{"id":186,"cantidad":2.0,"nombre":"Rayador acero 4 caras 25cm ","medidas":"RALLADOR ACERO 4 CARAS 25 CM UNIVERSAL","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":25572,"total":60861,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":187,"cantidad":2.0,"nombre":"Rimmer (escarchador)","medidas":"BORDEADOR DE COPAS ESCARCHADOR","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":32773,"total":78000,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":188,"cantidad":5.0,"nombre":"Salero inox / industrial con mango de acero  inox ","medidas":"SALERO INDUSTRIAL CON MANGO CERO INOX","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":16765,"total":99752,"cot":true,"ped":true,"ent":5.0,"falt":0,"estado":"Entregado"},{"id":189,"cantidad":5.0,"nombre":"Sarten 20cm sin teflon","medidas":"SARTEN AL 20CM PRF","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":59349,"total":353127,"cot":true,"ped":true,"ent":5.0,"falt":0,"estado":"Entregado"},{"id":190,"cantidad":14.0,"nombre":"Sartén mediano / 24cm ","medidas":"SARTEN AL 24CM PRF","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":66508,"total":1108023,"cot":true,"ped":true,"ent":14.0,"falt":0,"estado":"Entregado"},{"id":191,"cantidad":2.0,"nombre":"Sifón de chantilly  / chantillera 1000ml ","medidas":"CHANTILLERA 1000ML DIPENSADOR CREMA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":185714,"total":441999,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":192,"cantidad":4.0,"nombre":"Strainer clasico 4 puntas","medidas":"Ref: 4-4 COCT 00001","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":10504,"total":49999,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":193,"cantidad":2.0,"nombre":"Tabla amarilla / 30 *45 cm ","medidas":"TABLA PICAR 30*45 INCA METAL AMARILLA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":36134,"total":85999,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":194,"cantidad":3.0,"nombre":"Tabla blanca / 30 *45 cm ","medidas":"TABLA PICAR 30*45 IN CAMETAL BLANCA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":36134,"total":128998,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":195,"cantidad":2.0,"nombre":"Tabla roja / 30 *45 cm ","medidas":"TABLA PICAR 30*45 INCA METAL ROJA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":36134,"total":85999,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":196,"cantidad":2.0,"nombre":"Tabla verde / 30 *45 cm ","medidas":"TABLA PICAR 30*45 INCA METAL VERDE","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":36134,"total":85999,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":197,"cantidad":10.0,"nombre":"Tapete Barmat largo","medidas":"60 x 8 cm Ref: 4-11 COCT 00041","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":21849,"total":260003,"cot":true,"ped":true,"ent":10.0,"falt":0,"estado":"Entregado"},{"id":198,"cantidad":4.0,"nombre":"Tapete para hornear  / siliconado 51*32 EXCALIBUR ","medidas":"TAPETE SILICONA 51*32 EXCALIBUR","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":54622,"total":260001,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":199,"cantidad":6.0,"nombre":"Tapetes Barmat Servicio","medidas":"45 x 30 cm Ref:  4-11 COCT 00009 ","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":46218,"total":329997,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":200,"cantidad":4.0,"nombre":"Tarros de deshidratados Grande","medidas":"Frasco Hermetico 1.5L REF: 37965","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":15714,"total":74799,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":201,"cantidad":4.0,"nombre":"Tarros de deshidratados Pequeño","medidas":"Frasco Hermetico 0.8L REF: 379631","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":12605,"total":60000,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":202,"cantidad":20.0,"nombre":"Taza sopa de cebolla","medidas":"BOWL SOPA CEBOLLA 375CC ACTUALITE BLANCO","proveedor":"Condor","categoria":"Menaje","ubicacion":"Platos","precio":34897,"total":830549,"cot":true,"ped":true,"ent":20.0,"falt":0,"estado":"Entregado"},{"id":203,"cantidad":10.0,"nombre":"Tenedor de mejillones","medidas":"TENEDOR POSTRE ENSALADA SELECTA CORONA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Servilletas y Cubiertos","precio":9192,"total":109385,"cot":true,"ped":true,"ent":10.0,"falt":0,"estado":"Entregado"},{"id":204,"cantidad":35.0,"nombre":"Tenedores personal  / tenedor mesa calima  north ","medidas":"TENEDOR MESA CALIMA NORTH","proveedor":"Condor","categoria":"Menaje","ubicacion":"Varios Personal","precio":1513,"total":63016,"cot":true,"ped":true,"ent":36.0,"falt":-1,"estado":"Entregado"},{"id":205,"cantidad":2.0,"nombre":"Termometro punzón / digital ","medidas":"TERMOMETRO DIGITAL PUNZON ALIMENTOS","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":25714,"total":61199,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":206,"cantidad":20.0,"nombre":"Teteras leche  / lechera 260cc actualite blanca ","medidas":"LECHERA 260CC ACTU ALITE BLANCO REF:9085","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":29645,"total":705551,"cot":true,"ped":true,"ent":20.0,"falt":0,"estado":"Entregado"},{"id":207,"cantidad":19.0,"nombre":"Tetero 0,7lt","medidas":"SALSERO 24OZ (0.7L) PRF","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":6892,"total":155828,"cot":true,"ped":true,"ent":19.0,"falt":0,"estado":"Entregado"},{"id":208,"cantidad":12.0,"nombre":"Tetero 1litro ","medidas":"SALSERO 36OZ (1L) PRF","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":8354,"total":119295,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":209,"cantidad":7.0,"nombre":"Tetero pequeño /0,3lt ","medidas":"SALSERO 0.3L NT","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":5103,"total":42508,"cot":true,"ped":true,"ent":7.0,"falt":0,"estado":"Entregado"},{"id":210,"cantidad":1.0,"nombre":"Teteros para aceite de Oliva","medidas":"REF: 3054","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":1681,"total":2000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":211,"cantidad":4.0,"nombre":"Tijeras cocina","medidas":"TIJERA MULTIUSO PRESS","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":13445,"total":63998,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":212,"cantidad":2.0,"nombre":"Tupper azucar 3,25 lt ","medidas":"RECIPIENTE REDONDO 7, 5 LTRS ESTRA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":9071,"total":21589,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":213,"cantidad":24.0,"nombre":"Vaso Collins / lexington","medidas":"VASO LEXINGTON BEBIDAS 0022AL","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":5010,"total":143086,"cot":true,"ped":true,"ent":24.0,"falt":0,"estado":"Entregado"},{"id":214,"cantidad":30.0,"nombre":"vaso Lisboa 12 onz ( Jugos) ","medidas":"VASO LISBOA BEBIDAS","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":5571,"total":198885,"cot":true,"ped":true,"ent":30.0,"falt":0,"estado":"Entregado"},{"id":215,"cantidad":2.0,"nombre":"Vaso Mixing glass ","medidas":"500ml Ref: 4-2 COCT 00001 ","proveedor":"Condor","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":75546,"total":179799,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":216,"cantidad":35.0,"nombre":"Vasos personal  / vaso plastico promocion ","medidas":"VASO PLASTICO PROMOCION N.P.COLORES","proveedor":"Condor","categoria":"Menaje","ubicacion":"Varios Personal","precio":840,"total":34986,"cot":true,"ped":true,"ent":36.0,"falt":-1,"estado":"Entregado"},{"id":217,"cantidad":40.0,"nombre":"Vasos roca sangría  / lexington rocks ","medidas":"VASO LEXINGTON ROCKS 0045AL","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":5010,"total":238476,"cot":true,"ped":true,"ent":40.0,"falt":0,"estado":"Entregado"},{"id":218,"cantidad":40.0,"nombre":"Vasos Velas / Cristar Mikonos ","medidas":"VASO MIKONOS ROCKS 0453AL48","proveedor":"Condor","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":4475,"total":213010,"cot":true,"ped":true,"ent":40.0,"falt":0,"estado":"Entregado"},{"id":219,"cantidad":5.0,"nombre":"Wok / AL A / NT 32CM profesional imusa ","medidas":"WOK AL A/NT 32CM PROFESIONAL IMUSA","proveedor":"Condor","categoria":"Menaje","ubicacion":"Cocina","precio":164587,"total":979293,"cot":true,"ped":true,"ent":5.0,"falt":0,"estado":"Entregado"},{"id":220,"cantidad":60.0,"nombre":"Latas papas francesa ","medidas":"VASO SERVICIO PARA PAPA FRITA EN ACERO WINKO INOX","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Platos","precio":57157,"total":4081010,"cot":true,"ped":true,"ent":60.0,"falt":0,"estado":"Entregado"},{"id":221,"cantidad":2.0,"nombre":"Balde gris mediano para fécula y panko","medidas":"PAPELERA VAIVEN 35 LITS MR RECICLA APROVE","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Cocina","precio":42173,"total":100372,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":222,"cantidad":1.0,"nombre":"Balde para la harina ","medidas":"PAPELERA PEDAL 51 LITROS N.P.COLORES","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Cocina","precio":106096,"total":126254,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":223,"cantidad":6.0,"nombre":"Vaso Brulet  / jarron Galerie","medidas":"JARROn GALERIE AV LISO 8 ONZAS","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":8035,"total":57370,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":224,"cantidad":1.0,"nombre":"Escalera 2 paso ","medidas":"SILLA/ESCALERA 2 PELDAÑOS/TUBULAR BLANCA","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":142082,"total":169078,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":225,"cantidad":4.0,"nombre":"Tapones espumante: Tapon hermetico ","medidas":"Tapón Hermético 3 CLAVELES","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Mise en place Bar","precio":16682,"total":79406,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":226,"cantidad":8.0,"nombre":"Copa caña ","medidas":"COPA CAÑA LISA 2 1/2 OZ","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":761,"total":7247,"cot":true,"ped":true,"ent":8.0,"falt":0,"estado":"Entregado"},{"id":227,"cantidad":2.0,"nombre":"Tanque gas butano - Soplete","medidas":"2 TANQUE DE GAS PARA FLAMEADOR y soplete ","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Cocina","precio":15042,"total":35800,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":228,"cantidad":1.0,"nombre":"Boquilla para Flameador","medidas":"BOQUILLA PARA FLAMEADOR GRANDE","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Cocina","precio":15042,"total":17900,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":229,"cantidad":4.0,"nombre":"Bowl Conchas ","medidas":"BOWL 15 CMS 592 C.C ACTUALITE REF: 5230","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Platos","precio":19510,"total":92868,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":230,"cantidad":36.0,"nombre":"Bowl fruta actualite ondas blanco ","medidas":"BOWL 438.5CC ANCESTRAL ACTUALITE ","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Platos","precio":22965,"total":983821,"cot":true,"ped":true,"ent":36.0,"falt":0,"estado":"Entregado"},{"id":231,"cantidad":20.0,"nombre":"Bowl grande ondas blanco CALENTADO","medidas":"BOWL 1058.6CC ANCESTRAL ACTUALITE","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Platos","precio":28366,"total":675111,"cot":true,"ped":true,"ent":24.0,"falt":-4,"estado":"Entregado"},{"id":232,"cantidad":8.0,"nombre":"Plato sopa Corona blanco Caldo ","medidas":"CAZUELA 600 C.C. ACTUALITE ","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Platos","precio":27518,"total":261971,"cot":true,"ped":true,"ent":8.0,"falt":0,"estado":"Entregado"},{"id":233,"cantidad":12.0,"nombre":"Salsera grande y mascarpone","medidas":"SALSERA IRREGULAR 82.1CC ACTUALITE ANCESTRAL (Tall","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Platos","precio":7333,"total":104715,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":234,"cantidad":24.0,"nombre":"Vaso manantial ","medidas":"Sicilia Rock cap 12 1/2 onz","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Cocina","precio":4620,"total":131947,"cot":true,"ped":true,"ent":24.0,"falt":0,"estado":"Entregado"},{"id":235,"cantidad":3.0,"nombre":"Pinza grande metalica parrilla ","medidas":"Pinza de 16\" Heavy Duty - Edlund","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Cocina","precio":134263,"total":479319,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":236,"cantidad":60.0,"nombre":"Vaso aguas frescas ","medidas":"Vaso lata 16Oz REF: 1920","proveedor":"Crisloza","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":2797,"total":199706,"cot":true,"ped":true,"ent":60.0,"falt":0,"estado":"Entregado"},{"id":237,"cantidad":1.0,"nombre":"Botiquín Tipo A","medidas":"Botiquín tipo A morral NO gravados / D-B","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":142857,"total":170000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":238,"cantidad":3.0,"nombre":"Extintor BC (gas Carbónico)","medidas":"Extintor importado de Gas carbónico 5 lb\nnuevo","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":247899,"total":885000,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":239,"cantidad":1.0,"nombre":"Manga Kevlar larga","medidas":"Manga Kevlar larga, orifico pulgar","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Cocina","precio":28571,"total":34000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":240,"cantidad":1.0,"nombre":"Abrigo PVC","medidas":"Abrigo PVC largo, con capucha","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Cocina","precio":44538,"total":53000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":241,"cantidad":4.0,"nombre":"Extintores ABC (multiproposito)","medidas":"Extintor de polvo químico seco ABC 20 Lb\nNuevo","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":75630,"total":360000,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":242,"cantidad":1.0,"nombre":"Camilla en polietileno Adulto","medidas":"Camilla + Inmovilidador cabeza kit ferula extremid","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":236134,"total":281000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":243,"cantidad":2.0,"nombre":"Detectores de Humo","medidas":"Detector de humo fotoeléctrico. / DET-H","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":63025,"total":150000,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":244,"cantidad":1.0,"nombre":"Extintor tipo K","medidas":"Extintor tipo K de 1.5 gls. Nuevo","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":281513,"total":335000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":245,"cantidad":4.0,"nombre":"Soportes de Extintores grandes","medidas":"Soporte pedestal para extintor","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":26891,"total":128000,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":246,"cantidad":4.0,"nombre":"Soportes de Extintores pequeños","medidas":"Soporte pedestal para extintor","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":23109,"total":110000,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":247,"cantidad":1.0,"nombre":"Kit antiderrame","medidas":"kit antiderrame 5 galones","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Sin asignar","precio":109244,"total":130000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":248,"cantidad":1.0,"nombre":"Paleta Punto de encuentro","medidas":"Paleta punto de encuentro 30x30","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Sin asignar","precio":31933,"total":38000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":249,"cantidad":2.0,"nombre":"Brazalete Brigadista","medidas":"Brazalete Brigadista en lona y velcro","proveedor":"Daniel Real","categoria":"Menaje","ubicacion":"Sin asignar","precio":10924,"total":26000,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":250,"cantidad":2.0,"nombre":"Apisionador Rancilio","medidas":"","proveedor":"Devoción","categoria":"Menaje","ubicacion":"Pastelería","precio":225000,"total":535500,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":251,"cantidad":2.0,"nombre":"Azafate de caucho","medidas":"","proveedor":"Devoción","categoria":"Menaje","ubicacion":"Pastelería","precio":103500,"total":246330,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":252,"cantidad":2.0,"nombre":"Cartucho Filtrante","medidas":"Marca Besttaste 20","proveedor":"Devoción","categoria":"Menaje","ubicacion":"Pastelería","precio":795000,"total":1892100,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":253,"cantidad":2.0,"nombre":"Jarra Highwin Grande","medidas":"20 Oz","proveedor":"Devoción","categoria":"Menaje","ubicacion":"Pastelería","precio":103500,"total":246330,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":254,"cantidad":2.0,"nombre":"Jarra Highwin pequeña","medidas":"12 Oz","proveedor":"Devoción","categoria":"Menaje","ubicacion":"Pastelería","precio":92500,"total":220150,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":255,"cantidad":2.0,"nombre":"Kit Bwt cabezal blanco flex 3/8\" Filtro de agua","medidas":"Marca BestHead + Tapaciega","proveedor":"Devoción","categoria":"Menaje","ubicacion":"Pastelería","precio":695000,"total":1654100,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":256,"cantidad":2.0,"nombre":"Kit Cafiza Tarro","medidas":"Rinza x 1lt + Cepillo de grupo + cepillo vaporizad","proveedor":"Devoción","categoria":"Menaje","ubicacion":"Pastelería","precio":364000,"total":866320,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":257,"cantidad":1.0,"nombre":"Kit Papeleria","medidas":"(AZ, calculadora, marcadores, esferos,3  Tableros,","proveedor":"Dinastía","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":1868391,"total":2223385,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":258,"cantidad":350.0,"nombre":"Plato base Marie Cristhine 21cm","medidas":"Plato base Marie Cristhine 21cm","proveedor":"Eurolink","categoria":"Menaje","ubicacion":"Sin asignar","precio":29244,"total":12180000,"cot":true,"ped":true,"ent":350.0,"falt":0,"estado":"Entregado"},{"id":259,"cantidad":60.0,"nombre":"Bandeja Marie Christine","medidas":"MARIE CHRISTINE BANDEJA 25X17CM Ref: BA452025","proveedor":"Eurolink","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":67070,"total":4788798,"cot":true,"ped":true,"ent":60.0,"falt":0,"estado":"Entregado"},{"id":260,"cantidad":20.0,"nombre":"Copa Flauta","medidas":"Vinea Copa Prosecco 20cl 6 3/4 Oz h 23cm REF: BO11","proveedor":"Eurolink","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":19760,"total":470288,"cot":true,"ped":true,"ent":20.0,"falt":0,"estado":"Entregado"},{"id":261,"cantidad":60.0,"nombre":"Plato hummus","medidas":"MARIE CHRISTINE PLATO PANDO S/ALA 27CM Ref: BA4512","proveedor":"Eurolink","categoria":"Menaje","ubicacion":"Platos","precio":55860,"total":3988404,"cot":true,"ped":true,"ent":60.0,"falt":0,"estado":"Entregado"},{"id":262,"cantidad":12.0,"nombre":"Vaso Largo Amarena Royal","medidas":"America 20's long drink 40cl Ref: BR122143","proveedor":"Eurolink","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":13300,"total":189924,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":263,"cantidad":24.0,"nombre":"Copa Aperit ","medidas":"Copa Riserva STW Bordeaux II 54 CL Ref: 002193-","proveedor":"Fantasy","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":15000,"total":428400,"cot":true,"ped":true,"ent":24.0,"falt":0,"estado":"Entregado"},{"id":264,"cantidad":7.0,"nombre":"Griferia de cocina","medidas":"monocontrol CON MANGUERA","proveedor":"Ferretería Multicentro","categoria":"Menaje","ubicacion":"Cocina","precio":200000,"total":1666000,"cot":true,"ped":true,"ent":7.0,"falt":0,"estado":"Entregado"},{"id":265,"cantidad":1.0,"nombre":"Reloj ","medidas":"Digital de numeros rojos","proveedor":"Ferretería Multicentro","categoria":"Menaje","ubicacion":"Cocina","precio":140000,"total":166600,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":266,"cantidad":16.0,"nombre":"Canastilla tipo mercado Amarillo","medidas":"naranja Contra marcadas con Cosette 81","proveedor":"Fruver Granadino","categoria":"Menaje","ubicacion":"Cocina","precio":18000,"total":342720,"cot":true,"ped":true,"ent":16.0,"falt":0,"estado":"Entregado"},{"id":267,"cantidad":10.0,"nombre":"Canastilla para panes san felipe ","medidas":"Amarillo Contra marcadas con Cosette 81","proveedor":"Fruver Granadino","categoria":"Menaje","ubicacion":"Cocina","precio":15000,"total":178500,"cot":true,"ped":true,"ent":10.0,"falt":0,"estado":"Entregado"},{"id":268,"cantidad":1.0,"nombre":"Caja Menor con llave ","medidas":"30x24x9cm Fixser","proveedor":"Homecenter","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":75630,"total":90000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":269,"cantidad":1.0,"nombre":"Juego de Herramientas Básica","medidas":"Set Herramientas para el Hogar de 9 Piezas Karson","proveedor":"Homecenter","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":42017,"total":50000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":270,"cantidad":1.0,"nombre":"Protector paragolpes de caucho","medidas":"Protectores De Goma Transparentes 40 Und Scotch","proveedor":"Homecenter","categoria":"Menaje","ubicacion":"Cocina","precio":35294,"total":42000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":271,"cantidad":12.0,"nombre":"Vaso Whisky","medidas":"Perfect Serve trago corto 13 oz ref: SP 4508016 ma","proveedor":"Hot Trade","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":27000,"total":385560,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":272,"cantidad":6.0,"nombre":"Decanter agua filtrada ","medidas":"Jarra Karaff Jarra / Decantador, vidrio incoloro, ","proveedor":"Ikea","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":7563,"total":54000,"cot":false,"ped":false,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":273,"cantidad":16.0,"nombre":"Taza vidrio Affogato ","medidas":"Pocillo / mug, vidrio incoloro, 24 cl","proveedor":"Ikea","categoria":"Menaje","ubicacion":"Platos","precio":6723,"total":128000,"cot":false,"ped":false,"ent":16.0,"falt":0,"estado":"Entregado"},{"id":274,"cantidad":1.0,"nombre":"Abrelatas industrial ","medidas":"De mesón","proveedor":"Joserrago","categoria":"Menaje","ubicacion":"Cocina","precio":1084034,"total":1290000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":275,"cantidad":5.0,"nombre":"Bandeja Sillas bebe ","medidas":"Ref: 1306 - Rubbermaid","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":227210,"total":1351900,"cot":true,"ped":true,"ent":5.0,"falt":0,"estado":"Entregado"},{"id":276,"cantidad":24.0,"nombre":"Bowl fruta niños","medidas":"Ref: 27936 - 11 CM DE DIAMETRO Y 6 CM DE ALTO Tall","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Platos","precio":49623,"total":1417241,"cot":true,"ped":true,"ent":24.0,"falt":0,"estado":"Entregado"},{"id":277,"cantidad":1.0,"nombre":"Cambiador bebes horizontal","medidas":"Ref: 10304 - Rubbermaid","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":1509336,"total":1796110,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":278,"cantidad":1.0,"nombre":"Caneca plastica negra  SHUT DE BASURA CON RUEDAS","medidas":"Ref: 16489 - Rubbermaid Rollout negro 189l","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Cocina","precio":515582,"total":613543,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":279,"cantidad":1.0,"nombre":"Carrito Balde escurridor Cocodrilo","medidas":"Ref: 2314 - Rubbermaid WAVEBRAKE 33 Lts","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":455725,"total":542313,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":280,"cantidad":2.0,"nombre":"Señal de Prevención","medidas":"Ref: 1302 - Rubbermaid Señal de seguridad para pis","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":71736,"total":170732,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":281,"cantidad":5.0,"nombre":"Sillas bebe ","medidas":"Ref: 1305 - Rubbermaid","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":834074,"total":4962740,"cot":true,"ped":true,"ent":5.0,"falt":0,"estado":"Entregado"},{"id":282,"cantidad":48.0,"nombre":"Bowl Grande","medidas":"Ref 23437 - 22,5 CM DE DIAMETRO Y 6 CM DE ALTO BIC","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Platos","precio":57808,"total":3301974,"cot":true,"ped":true,"ent":48.0,"falt":0,"estado":"Entregado"},{"id":283,"cantidad":96.0,"nombre":"Salseras","medidas":"Ref: 25008 - 6CM DE DIAMETRO Taller Corona","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Platos","precio":24578,"total":2807795,"cot":true,"ped":true,"ent":100.0,"falt":-4,"estado":"Entregado"},{"id":284,"cantidad":18.0,"nombre":"Taza sopa mini menú","medidas":"Ref: 23438 - 9,5 CM DE DIAMETRO Y 5 CM DE ALTO Tal","proveedor":"Juan de Hoyos","categoria":"Menaje","ubicacion":"Platos","precio":59286,"total":1269913,"cot":true,"ped":true,"ent":18.0,"falt":0,"estado":"Entregado"},{"id":285,"cantidad":3.0,"nombre":"Bandeja Pastelera para Horno Rational","medidas":"BANDEJA DE PANADERIA Y PARA CARNE 1/1 GN","proveedor":"Kitech","categoria":"Menaje","ubicacion":"Cocina","precio":273485,"total":976341,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":286,"cantidad":2.0,"nombre":"Parrilla de Asado para Horno Rational","medidas":"PARRILLA PARA PLANCHA Y PARA ASADOS 1/1 GN","proveedor":"Kitech","categoria":"Menaje","ubicacion":"Cocina","precio":609967,"total":1451721,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":287,"cantidad":1.0,"nombre":"Celular","medidas":"Celular Motorola G75 256GB 5G Verde","proveedor":"Ktronix","categoria":"Menaje","ubicacion":"Tecnología","precio":697479,"total":830000,"cot":true,"ped":false,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":288,"cantidad":2.0,"nombre":"Computador portatil ","medidas":"Computador Portátil LENOVO IdeaPad Slim 3 15.6\" Pu","proveedor":"Ktronix","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":1428571,"total":3400000,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":289,"cantidad":1.0,"nombre":"Impresora con Scanner","medidas":"Impresora Multifuncional EPSON Ecotank L3210 Hg - ","proveedor":"Ktronix","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":647059,"total":770000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":290,"cantidad":1.0,"nombre":"Mouse computador gerente","medidas":"Mouse ESENSES Inalámbrico Óptico WOM 2000-Negro","proveedor":"Ktronix","categoria":"Menaje","ubicacion":"Tecnología","precio":25210,"total":30000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":291,"cantidad":2.0,"nombre":"Soportes telescopicos para TV","medidas":"Base KALLEY Brazo Flexible para Televisores 37\"a 8","proveedor":"Ktronix","categoria":"Menaje","ubicacion":"Comedor","precio":109244,"total":260000,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":292,"cantidad":2.0,"nombre":"TV 50\" para comedor","medidas":"TV SAMSUNG 50\" Pulgadas 127 cm 50Q7F 4K UHD QLED S","proveedor":"Ktronix","categoria":"Menaje","ubicacion":"Comedor","precio":1596639,"total":3800000,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":293,"cantidad":4.0,"nombre":"Cacerola Mejillones Le Creuset","medidas":"Cocotte Baja 20 cm color Cereza","proveedor":"Le Creuset ","categoria":"Menaje","ubicacion":"Platos","precio":618824,"total":2945602,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":294,"cantidad":8.0,"nombre":"Charol mediano","medidas":"36cm de diámetro Marca Cambro ","proveedor":"Leal Group","categoria":"Menaje","ubicacion":"Mise en place Comedor","precio":123100,"total":1171912,"cot":true,"ped":true,"ent":8.0,"falt":0,"estado":"Entregado"},{"id":295,"cantidad":4.0,"nombre":"Charol pequeño","medidas":"1100bk UPATE 28 cm marca CAMBRO","proveedor":"Leal Group","categoria":"Menaje","ubicacion":"Mise en place Comedor","precio":108700,"total":517412,"cot":true,"ped":true,"ent":4.0,"falt":0,"estado":"Entregado"},{"id":296,"cantidad":3.0,"nombre":"Jabonera  cliente / soporte crema de manos","medidas":"","proveedor":"Loto del Sur","categoria":"Menaje","ubicacion":"Comedor","precio":39913,"total":142489,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":297,"cantidad":3.0,"nombre":"Recipiente de jabón y crema","medidas":"","proveedor":"Loto del Sur","categoria":"Menaje","ubicacion":"Comedor","precio":32779,"total":117021,"cot":true,"ped":true,"ent":3.0,"falt":0,"estado":"Entregado"},{"id":298,"cantidad":15.0,"nombre":"Fichas (SOMBRILLAS) acrílico ","medidas":"","proveedor":"Mercadeo","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":19608,"total":350000,"cot":false,"ped":false,"ent":15.0,"falt":0,"estado":"Entregado"},{"id":299,"cantidad":6.0,"nombre":"Copa aperitivo pousse cafe  (Jerez y limoncello)","medidas":"Copa Licor Mondial Ref 138260 cap 3oz","proveedor":"Oporto ","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":19748,"total":141000,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":300,"cantidad":36.0,"nombre":"Vaso Cerveza - Berlin ","medidas":"Copa Cerveza 0.4L REF: 3080050","proveedor":"Oporto ","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":19748,"total":846004,"cot":true,"ped":true,"ent":36.0,"falt":0,"estado":"Entregado"},{"id":301,"cantidad":48.0,"nombre":"Copas Vino ","medidas":"Copa Vino Tinto Universal Royal 20 oz Stolze Ref: ","proveedor":"Oporto ","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":15966,"total":912000,"cot":true,"ped":true,"ent":48.0,"falt":0,"estado":"Entregado"},{"id":302,"cantidad":48.0,"nombre":"Cuchillo Punta","medidas":"Steak Madera oscura y sierra Ref: 1.5.STK.00.243","proveedor":"Oporto ","categoria":"Menaje","ubicacion":"Servilletas y Cubiertos","precio":37815,"total":2160000,"cot":true,"ped":true,"ent":48.0,"falt":0,"estado":"Entregado"},{"id":303,"cantidad":2.0,"nombre":"Boquilla merengue ","medidas":"BOQUILLA #803","proveedor":"Orquidea","categoria":"Menaje","ubicacion":"Cocina","precio":5714,"total":13599,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":304,"cantidad":1.0,"nombre":"Marcador de tortas ","medidas":"MARCADOR 10/12 PORCIONES","proveedor":"Orquidea","categoria":"Menaje","ubicacion":"Cocina","precio":41933,"total":49900,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":305,"cantidad":30.0,"nombre":"Copa shot zumo de limón","medidas":"ENVASE DE VIDRIO 38-2000 BL 35ML","proveedor":"Rosental ","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":761,"total":27176,"cot":true,"ped":true,"ent":30.0,"falt":0,"estado":"Entregado"},{"id":306,"cantidad":36.0,"nombre":"Bandeja grande Cosette","medidas":"1000-143033 BANDEJA OVALADA 33 CM MAGNUS ID FINE","proveedor":"Suministros y Servicios Hoteleros","categoria":"Menaje","ubicacion":"Platos","precio":51048,"total":2186896,"cot":true,"ped":true,"ent":36.0,"falt":0,"estado":"Entregado"},{"id":307,"cantidad":60.0,"nombre":"Plato Pocillo / Mug Mellow","medidas":"46001-111216 ID FINE","proveedor":"Suministros y Servicios Hoteleros","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":21517,"total":1536329,"cot":true,"ped":true,"ent":60,"falt":0,"estado":"Entregado"},{"id":308,"cantidad":60.0,"nombre":"Pocillo Café 230 ml Mellow","medidas":"56001-304223 ID FINE","proveedor":"Suministros y Servicios Hoteleros","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":29305,"total":2092377,"cot":true,"ped":true,"ent":60.0,"falt":0,"estado":"Entregado"},{"id":309,"cantidad":20.0,"nombre":"Taza Chai","medidas":"Pocillo Choco entrepues Ref: TC749","proveedor":"Tybso","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":39090,"total":930342,"cot":true,"ped":true,"ent":20.0,"falt":0,"estado":"Entregado"},{"id":310,"cantidad":20.0,"nombre":"Plato taza chai","medidas":"Plato Pan Perla Ref: TC905","proveedor":"Tybso","categoria":"Menaje","ubicacion":"Cristalería y Café","precio":23394,"total":556777,"cot":true,"ped":true,"ent":20.0,"falt":0,"estado":"Entregado"},{"id":311,"cantidad":2.0,"nombre":"Tapa vidrio tortera","medidas":"Tapa vidrio gd Ref: AR4","proveedor":"Tybso","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":58823,"total":139999,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":312,"cantidad":1.0,"nombre":"Tortera Tybso","medidas":"Tortera Home Baked Ref: TC863","proveedor":"Tybso","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":144893,"total":172423,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":313,"cantidad":1.0,"nombre":"Atril menú","medidas":"OK","proveedor":"Victor Malpica","categoria":"Menaje","ubicacion":"Menaje Comedor, s y Oficina","precio":200000,"total":238000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":314,"cantidad":6.0,"nombre":"Ladrillos de hierro ","medidas":"OK","proveedor":"Victor Malpica","categoria":"Menaje","ubicacion":"Cocina","precio":27000,"total":192780,"cot":true,"ped":true,"ent":6.0,"falt":0,"estado":"Entregado"},{"id":315,"cantidad":16.0,"nombre":"Victoria provoleta / Chorizo","medidas":"Sarten 20 cm (con manija) esmaltado","proveedor":"Victoria","categoria":"Menaje","ubicacion":"Cocina","precio":88227,"total":1679840,"cot":false,"ped":false,"ent":16.0,"falt":0,"estado":"Entregado"},{"id":316,"cantidad":12.0,"nombre":"Bandeja Ovalada para plancha de hierro","medidas":"Base de Madera Acacia Para Plancha Ovalada 34x17cm","proveedor":"Victoria","categoria":"Menaje","ubicacion":"Platos","precio":63017,"total":899880,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":317,"cantidad":8.0,"nombre":"Cacerola Mac & Cheese","medidas":"Mini Cazuela 14 Cm Con Tapa Vidrio Esmaltada","proveedor":"Victoria","categoria":"Menaje","ubicacion":"Platos","precio":67218,"total":667920,"cot":true,"ped":true,"ent":8.0,"falt":0,"estado":"Entregado"},{"id":318,"cantidad":12.0,"nombre":"Plancha ovalada","medidas":"Plancha ovalada 34 cm x 17 cm","proveedor":"Victoria","categoria":"Menaje","ubicacion":"Platos","precio":92429,"total":1319880,"cot":true,"ped":true,"ent":12.0,"falt":0,"estado":"Entregado"},{"id":319,"cantidad":40.0,"nombre":"Plato Victoria: hierro pequeño redondo + bandeja madera","medidas":"Plato hierro fundido con base de madera 20cm ","proveedor":"Victoria","categoria":"Menaje","ubicacion":"Platos","precio":128563,"total":6119600,"cot":true,"ped":true,"ent":40.0,"falt":0,"estado":"Entregado"},{"id":320,"cantidad":2.0,"nombre":"Wafflera","medidas":"Waring WW180X Single Belgian Waffle Iron / Maker -","proveedor":"Amazon","categoria":"Equipo","ubicacion":"Pastelería","precio":2310000,"total":5497800,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":321,"cantidad":1.0,"nombre":"Cava de vinos 24 botellas","medidas":"Cava de Vino Electrolux 24 Botellas Panel Digital ","proveedor":"Electrolux","categoria":"Equipo","ubicacion":"Bar 1er piso","precio":1000000,"total":1190000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":322,"cantidad":1.0,"nombre":"Basechef 48\"","medidas":"48\"","proveedor":"Femarfrio","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":9710400,"total":11555376,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":323,"cantidad":1.0,"nombre":"Basechef 72\"","medidas":"72\"","proveedor":"Femarfrio","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":15212960,"total":18103422,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":324,"cantidad":1.0,"nombre":"Calientaplatos","medidas":"1,20x0,80x0,90","proveedor":"Femarfrio","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":5831000,"total":6938890,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":325,"cantidad":1.0,"nombre":"Refrigerador Horizontal 1 cuerpo","medidas":"0,79x0,87 (1 puerta)","proveedor":"Femarfrio","categoria":"Equipo","ubicacion":"Bar 3er piso","precio":5414500,"total":6443255,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":326,"cantidad":1.0,"nombre":"Refrigerador Horizontal 1 cuerpo","medidas":"0,79x0,87 (1 puerta) Motor a la derecha","proveedor":"Femarfrio","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":5414500,"total":6443255,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":327,"cantidad":2.0,"nombre":"Estufa de sobreponer 4 puestos","medidas":"ESTUFA 24\" 4 QUEMADORES","proveedor":"Hobart","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":4191078,"total":9974767,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":328,"cantidad":2.0,"nombre":"Freidora","medidas":"FT-400","proveedor":"Hobart","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":7204105,"total":17145770,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":329,"cantidad":1.0,"nombre":"Parrilla de Sobreponer","medidas":"25\"","proveedor":"Hobart","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":4792890,"total":5703539,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":330,"cantidad":1.0,"nombre":"Plancha de sobreponer grande","medidas":"36\"","proveedor":"Hobart","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":5498090,"total":6542727,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":331,"cantidad":1.0,"nombre":"Plancha de sobreponer pequeña","medidas":"24\"","proveedor":"Hobart","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":4396312,"total":5231611,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":332,"cantidad":1.0,"nombre":"Licuadora Acai","medidas":"","proveedor":"Home Sentry","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":130000,"total":154700,"cot":true,"ped":true,"ent":0,"falt":1,"estado":"Pedido"},{"id":333,"cantidad":1.0,"nombre":"Baja papa","medidas":"Cortador de papa a la francesa, de empotrar en mur","proveedor":"Joserrago","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":411765,"total":490000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":334,"cantidad":1.0,"nombre":"Batidora 7.6l","medidas":"Commercial","proveedor":"KitchenAid","categoria":"Equipo","ubicacion":"Pastelería","precio":2400000,"total":2856000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":335,"cantidad":1.0,"nombre":"Horno Rational","medidas":"6 bandejas con base en acero inox y escabiladero","proveedor":"Kitech","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":33409100,"total":39756829,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":336,"cantidad":1.0,"nombre":"Horno Roaster Roc 56","medidas":"Viene con su base, se manda a ahcer un cajón","proveedor":"Kitech","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":56102400,"total":66761856,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":337,"cantidad":5.0,"nombre":"Balanza Solo Peso 30kgs","medidas":"Dimensiones: 42*32*22 cm","proveedor":"Leal Group","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":411000,"total":2445450,"cot":true,"ped":true,"ent":5.0,"falt":0,"estado":"Entregado"},{"id":338,"cantidad":1.0,"nombre":"Bascula 50kgs","medidas":"LOGISTIC-150","proveedor":"Leal Group","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":368000,"total":437920,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":339,"cantidad":2.0,"nombre":"Estación de ensaladas 48\"","medidas":"Atosa 122,5 x 76.2x 112.5cm","proveedor":"Leal Group","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":9365000,"total":22288700,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":340,"cantidad":2.0,"nombre":"Gramera gramo a gramo","medidas":"10kg - KZ-F3A","proveedor":"Leal Group","categoria":"Equipo","ubicacion":"Bar 1er piso","precio":54000,"total":128520,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":341,"cantidad":1.0,"nombre":"Back bar - Puerta delizable","medidas":"0,90x0,55x0,89m","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Bar 3er piso","precio":5031200,"total":5987128,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":342,"cantidad":1.0,"nombre":"Congelador Horizontal 1 cuerpo","medidas":"74x0,87 1 cuerpo","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Bar 1er piso","precio":5168000,"total":6149920,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":343,"cantidad":1.0,"nombre":"Congelador Horizontal 1 cuerpo","medidas":"74x0,87 1 cuerpo","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":5168000,"total":6149920,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":344,"cantidad":1.0,"nombre":"Congelador Horizontal 1 cuerpo","medidas":"74x0,87 1 cuerpo","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Pastelería","precio":5168000,"total":6149920,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":345,"cantidad":1.0,"nombre":"Congelador Horizontal 2 cuerpos","medidas":"1,22x0,87 2 cuerpos","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Bar 3er piso","precio":7220000,"total":8591800,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":346,"cantidad":1.0,"nombre":"Congelador vertical 1 cuerpo","medidas":"1 cuerpo","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":7866000,"total":9360540,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":347,"cantidad":1.0,"nombre":"Congelador vertical 2 cuerpos","medidas":"2 cuerpos","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":11134000,"total":13249460,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":348,"cantidad":1.0,"nombre":"Deshidratador ","medidas":"Deshidratador de alimentos 500W 6 parrillas","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Bar 1er piso","precio":1550000,"total":1844500,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":349,"cantidad":1.0,"nombre":"Licuadora con carcasa","medidas":"JTC Onmiblend 1.5L","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Bar 1er piso","precio":1580800,"total":1881152,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":350,"cantidad":1.0,"nombre":"Licuadora con carcasa","medidas":"JTC Onmiblend 1.5L","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Bar 3er piso","precio":1580800,"total":1881152,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":351,"cantidad":1.0,"nombre":"Licuadora sencilla","medidas":"JTC Omniblend 2L","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":984960,"total":1172102,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":352,"cantidad":1.0,"nombre":"Microondas convencional","medidas":"Tornado 25L 1000W","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":1611200,"total":1917328,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":353,"cantidad":1.0,"nombre":"Microondas convencional","medidas":"Tornado 25L 1000W","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Pastelería","precio":1611200,"total":1917328,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":354,"cantidad":2.0,"nombre":"Refrigerador Horizontal 2 cuerpos","medidas":"1,22x0,87 (2 puertas)","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Bar 1er Piso","precio":6194000,"total":14741720,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":355,"cantidad":2.0,"nombre":"Refrigerador Horizontal 2 cuerpos","medidas":"1,22x0,87 (2 puertas)","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Pastelería","precio":6194000,"total":14741720,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":356,"cantidad":1.0,"nombre":"Refrigerador Horizontal 2 cuerpos","medidas":"1,22x0,87 (2 puertas)","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":6194000,"total":7370860,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":357,"cantidad":2.0,"nombre":"Refrigerador vertical 1 cuerpo","medidas":"1 cuerpo","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":6916000,"total":16460080,"cot":true,"ped":true,"ent":2.0,"falt":0,"estado":"Entregado"},{"id":358,"cantidad":1.0,"nombre":"Refrigerador vertical 2 cuerpo","medidas":"2 cuerpo","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":9804000,"total":11666760,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":359,"cantidad":1.0,"nombre":"Tajadora de carne","medidas":"10\" 250mm 110V","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":2633400,"total":3133746,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":360,"cantidad":1.0,"nombre":"Flete e instalación","medidas":"","proveedor":"Pallomaro","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":2200000,"total":2618000,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":361,"cantidad":1.0,"nombre":"Baño maria 1 Azafate","medidas":"0,45x0,80x0,90","proveedor":"Produequipos","categoria":"Equipo","ubicacion":"Cocina 2do Piso","precio":1980000,"total":2356200,"cot":true,"ped":true,"ent":1.0,"falt":0,"estado":"Entregado"},{"id":362,"cantidad":1.0,"nombre":"Base para Gratinador","medidas":"gl","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":890000,"total":1059100,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":363,"cantidad":1.0,"nombre":"Estación de bar","medidas":"1,47x0,50x0,90","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Bar 3er piso","precio":3617000,"total":4304230,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":364,"cantidad":1.0,"nombre":"Carcamo para Bar en L","medidas":"2,42x0,15x0,06","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Bar 3er piso","precio":3413000,"total":4061470,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":365,"cantidad":1.0,"nombre":"Estante almacenamiento en seco","medidas":"0,64x0,60x1,60","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina 2do Piso","precio":1610000,"total":1915900,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":366,"cantidad":1.0,"nombre":"Estante almacenamiento en cocina","medidas":"0,90x0,60x1,60","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina 2do Piso","precio":1890000,"total":2249100,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":367,"cantidad":1.0,"nombre":"Estante almacenamiento en seco","medidas":"1,24x0,60x1,60","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina 2do Piso","precio":2350000,"total":2796500,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":368,"cantidad":1.0,"nombre":"Mesa de trabajo para plancha de 24\"","medidas":"0,62x0,80x0,60","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":1110000,"total":1320900,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":369,"cantidad":1.0,"nombre":"Mesa recibo loza","medidas":"1,60x0,75x0,90","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":2450000,"total":2915500,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":370,"cantidad":1.0,"nombre":"Mesa de Trabajo zona almacenamiento","medidas":"1,50x0,60x0,90","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Almacenamiento","precio":1375000,"total":1636250,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":371,"cantidad":2.0,"nombre":"Mueble inferior para Bin de hielo","medidas":"0,40x0,80x0,90","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Pastelería","precio":920000,"total":2189600,"cot":true,"ped":true,"ent":0,"falt":2.0,"estado":"Pedido"},{"id":372,"cantidad":2.0,"nombre":"Mueble inferior para poceta bajo poner","medidas":"0,40x0,80x0,90","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Bar 3er piso","precio":920000,"total":2189600,"cot":true,"ped":true,"ent":0,"falt":2.0,"estado":"Pedido"},{"id":373,"cantidad":1.0,"nombre":"Panel Aislamiento gratinador","medidas":"0,90x0,48x0,02","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":390000,"total":464100,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":374,"cantidad":1.0,"nombre":"Panel liso doble Roaster","medidas":"0,93x1,80x0,04","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":1410000,"total":1677900,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":375,"cantidad":2.0,"nombre":"Poceta de bajoponer Bin de Hielo","medidas":"0,30x0,45x0,25","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Pastelería","precio":890000,"total":2118200,"cot":true,"ped":true,"ent":0,"falt":2.0,"estado":"Pedido"},{"id":376,"cantidad":1.0,"nombre":"Poceta de bajoponer pasteleria","medidas":"0,30x0,45x0,25","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Pastelería","precio":700000,"total":833000,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":377,"cantidad":1.0,"nombre":"Poceta de bajoponer bar 3er piso","medidas":"0,30x0,45x0,26","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Bar 3er piso","precio":700000,"total":833000,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":378,"cantidad":3.0,"nombre":"Repisa lisa almacenamiento","medidas":"1,50x0,40x0,04","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Almacenamiento","precio":570000,"total":2034900,"cot":true,"ped":true,"ent":0,"falt":3.0,"estado":"Pedido"},{"id":379,"cantidad":1.0,"nombre":"Repisa doble nivel para descomide","medidas":"0,50x0,40x0,72","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":550000,"total":654500,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":380,"cantidad":1.0,"nombre":"Repisa doble nivel en zona de pase","medidas":"4,06x0,40x1,0","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":4466000,"total":5314540,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":381,"cantidad":3.0,"nombre":"Repisa área poceta","medidas":"1,80x0,40x0,04","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":780000,"total":2784600,"cot":true,"ped":true,"ent":0,"falt":3.0,"estado":"Pedido"},{"id":382,"cantidad":2.0,"nombre":"Repisa para canastilla recibo loza","medidas":"1,50x0,35x0,04","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":780000,"total":1856400,"cot":true,"ped":true,"ent":0,"falt":2.0,"estado":"Pedido"},{"id":383,"cantidad":1.0,"nombre":"Repisa zona campana","medidas":"3,60x0,40x0,04","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":1260000,"total":1499400,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":384,"cantidad":1.0,"nombre":"Repisa zona lavado steward","medidas":"1,50x0,40x0,04","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":570000,"total":678300,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":385,"cantidad":1.0,"nombre":"Trampa de grasa Rational","medidas":"0,70x0,40x0,20","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":1380000,"total":1642200,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":386,"cantidad":1.0,"nombre":"Trampa de grasa Poceta lavado pase","medidas":"0,70x0,40x0,20","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":1380000,"total":1642200,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":387,"cantidad":1.0,"nombre":"Trampa de grasa zona Stewart","medidas":"0,70x0,40x0,20","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":1490000,"total":1773100,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":388,"cantidad":1.0,"nombre":"Zona de lavado 1 poceta (0,40x0,50x0,25)","medidas":"2,0x0,80x0,90m poceta a la derecha ","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":2980000,"total":3546200,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":389,"cantidad":1.0,"nombre":"Zona de lavado en L 2 pocetas (0,40x0,50x0,25)","medidas":"2,37x0,75x0,90","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Cocina","precio":3696000,"total":4398240,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"},{"id":390,"cantidad":1.0,"nombre":"Zona de lavado bar 3er piso 1 poceta","medidas":"2,54x0,50x0,90","proveedor":"Produequipos","categoria":"Acero","ubicacion":"Bar 3er piso","precio":3725000,"total":4432750,"cot":true,"ped":true,"ent":0,"falt":1.0,"estado":"Pedido"}],"entregas":[{"prov":"Joserrago","prod":"Baja papas","fecha":"2025-12-01","cond":"Pago","cumplio":"NO"},{"prov":"I. Gastronómica 2do piso","prod":"Campana y ducteria en cocina","fecha":"2026-01-23","cond":"Pago","cumplio":"0.5"},{"prov":"I. Gastronómica total","prod":"Extracción e inyección","fecha":"2026-01-23","cond":"Pago","cumplio":"0.5"},{"prov":"Amazon","prod":"Waffleras y lamparas","fecha":"2026-02-02","cond":"Pago","cumplio":"0.5"},{"prov":"Femarfrio","prod":"Basechef","fecha":"2026-02-03","cond":"Pago","cumplio":"0.5"},{"prov":"Flamecorp","prod":"Calefactores","fecha":null,"cond":"","cumplio":"NO"},{"prov":"Leal Group","prod":"Ensaladeras","fecha":"2026-02-03","cond":"Facturación","cumplio":"NO"},{"prov":"Hobart","prod":"Equipos calientes","fecha":"2026-02-04","cond":"Pago","cumplio":"NO"},{"prov":"Produequipos","prod":"Aceros","fecha":"2026-02-05","cond":"Facturación","cumplio":"NO"},{"prov":"Kitech","prod":"Rational y Roaster","fecha":"2026-02-06","cond":"Pago","cumplio":"0.5"},{"prov":"Pallomaro","prod":"Neveras verticales y demás","fecha":"2026-02-06","cond":"Pago","cumplio":"0.5"},{"prov":"KitchenAid","prod":"Batidora","fecha":"2026-02-11","cond":"Pago","cumplio":"NO"},{"prov":"WinterHalter","prod":"Equipos de lavado","fecha":"2026-02-17","cond":"Camara de comercio y contrato ","cumplio":"NO"},{"prov":"Electrolux","prod":"Nevera de vinos","fecha":"2026-02-19","cond":"Pago","cumplio":"NO"},{"prov":"Onalak","prod":"Nevera de hielo","fecha":"2026-02-20","cond":"Contrato","cumplio":"NO"},{"prov":"Home Sentry","prod":"Licuadora","fecha":"2026-02-25","cond":"Pago","cumplio":"NO"},{"prov":"Aua","prod":"Filtro de agua","fecha":"2026-02-26","cond":"Contrato","cumplio":"NO"},{"prov":"Devoción","prod":"Maquina de café","fecha":"2026-02-26","cond":"Fachada lista + Poliza + Contr","cumplio":"NO"},{"prov":"Lunes","prod":"Martes","fecha":"Miercoles","cond":"Jueves","cumplio":"Viernes"},{"prov":"2.0","prod":"3.0","fecha":"4.0","cond":"5.0","cumplio":"6.0"},{"prov":"Pago Amazon","prod":"","fecha":null,"cond":"","cumplio":"NO"},{"prov":"9.0","prod":"10.0","fecha":"11.0","cond":"12.0","cumplio":"13.0"},{"prov":"Produequipos mesa y trampa grasa cocina","prod":"","fecha":null,"cond":"","cumplio":"NO"},{"prov":"16.0","prod":"17.0","fecha":"18.0","cond":"19.0","cumplio":"20.0"},{"prov":"Produequipos cocina 2do piso","prod":"Flamecorp estructura","fecha":null,"cond":"Flamecorp Calefactores","cumplio":"NO"},{"prov":"23.0","prod":"24.0","fecha":"25.0","cond":"26.0","cumplio":"27.0"},{"prov":"Instalación equipos Hobart","prod":" Produequipos - Instalación repisas","fecha":null,"cond":"","cumplio":"NO"},{"prov":"Pallomaro - Cambio ruedas","prod":"","fecha":null,"cond":"","cumplio":"Prueba de Equipos In"},{"prov":"2.0","prod":"3.0","fecha":"4.0","cond":"5.0","cumplio":"6.0"},{"prov":"Instalación de Winterhalter P50","prod":"Instalación Bajapapa","fecha":"Entrega de","cond":"Entrega final de Mesas y Silla","cumplio":"NO"},{"prov":"9.0","prod":"10.0","fecha":"11.0","cond":"12.0","cumplio":"13.0"},{"prov":"Visita Audionics","prod":"","fecha":null,"cond":"","cumplio":"NO"},{"prov":"Visita Aldelo","prod":"","fecha":null,"cond":"","cumplio":"NO"},{"prov":"Cambio de ruedas Femarfrio","prod":"","fecha":null,"cond":"","cumplio":"NO"},{"prov":"Bavaria","prod":"Instalación de Planta eléctrica","fecha":"Instalació","cond":"Instalación Aldelo","cumplio":"NO"},{"prov":"16.0","prod":"17.0","fecha":"18.0","cond":"19.0","cumplio":"20.0"},{"prov":"23.0","prod":"24.0","fecha":"25.0","cond":"26.0","cumplio":"27.0"},{"prov":"Instalación de Publicidad","prod":"","fecha":null,"cond":"","cumplio":"NO"},{"prov":"Instalación Bavaria","prod":"","fecha":null,"cond":"","cumplio":"NO"}]};

const CRONOGRAMA_BASE = [
  { id: 1, fase: "Definición", tarea: "Firma de contrato", inicio: "2025-07-15", fin: "2025-07-20", baselineInicio: "2025-07-15", baselineFin: "2025-07-20", avance: 100, color: "#1F3D2E", dep: [] },
  { id: 2, fase: "Definición", tarea: "Acta de constitución", inicio: "2025-07-21", fin: "2025-07-30", baselineInicio: "2025-07-21", baselineFin: "2025-07-28", avance: 100, color: "#1F3D2E", dep: [1] },
  { id: 3, fase: "Definición", tarea: "Licencias de construcción", inicio: "2025-08-01", fin: "2025-08-25", baselineInicio: "2025-08-01", baselineFin: "2025-08-20", avance: 100, color: "#1F3D2E", dep: [2] },
  { id: 4, fase: "Definición", tarea: "Acta de vecindad", inicio: "2025-08-15", fin: "2025-08-22", baselineInicio: "2025-08-15", baselineFin: "2025-08-22", avance: 100, color: "#1F3D2E", dep: [] },
  { id: 5, fase: "Demolición", tarea: "Demolición estructural", inicio: "2025-08-26", fin: "2025-09-15", baselineInicio: "2025-08-26", baselineFin: "2025-09-12", avance: 100, color: "#7A4A3D", dep: [3] },
  { id: 6, fase: "Demolición", tarea: "Retiro de escombros", inicio: "2025-09-10", fin: "2025-09-20", baselineInicio: "2025-09-10", baselineFin: "2025-09-18", avance: 100, color: "#7A4A3D", dep: [5] },
  { id: 7, fase: "Obra gris", tarea: "Estructura de placas", inicio: "2025-09-21", fin: "2025-10-30", baselineInicio: "2025-09-21", baselineFin: "2025-10-25", avance: 100, color: "#5A6B5C", dep: [6] },
  { id: 8, fase: "Obra gris", tarea: "Mampostería", inicio: "2025-10-15", fin: "2025-11-20", baselineInicio: "2025-10-15", baselineFin: "2025-11-15", avance: 100, color: "#5A6B5C", dep: [7] },
  { id: 9, fase: "Redes MEP", tarea: "Hidrosanitaria", inicio: "2025-11-01", fin: "2025-12-15", baselineInicio: "2025-11-01", baselineFin: "2025-12-10", avance: 100, color: "#3B6A8A", dep: [7] },
  { id: 10, fase: "Redes MEP", tarea: "Eléctrica", inicio: "2025-11-05", fin: "2025-12-20", baselineInicio: "2025-11-05", baselineFin: "2025-12-15", avance: 100, color: "#3B6A8A", dep: [7] },
  { id: 11, fase: "Redes MEP", tarea: "Gas y ventilación", inicio: "2025-11-15", fin: "2026-01-10", baselineInicio: "2025-11-15", baselineFin: "2025-12-30", avance: 95, color: "#3B6A8A", dep: [7] },
  { id: 12, fase: "Redes MEP", tarea: "Sistema de extracción", inicio: "2025-12-01", fin: "2026-01-23", baselineInicio: "2025-12-01", baselineFin: "2026-01-15", avance: 90, color: "#3B6A8A", dep: [11] },
  { id: 13, fase: "Acabados", tarea: "Pisos y enchapes", inicio: "2025-12-15", fin: "2026-02-15", baselineInicio: "2025-12-15", baselineFin: "2026-02-05", avance: 100, color: "#A07B4A", dep: [9, 10] },
  { id: 14, fase: "Acabados", tarea: "Pintura y texturas", inicio: "2026-01-15", fin: "2026-03-10", baselineInicio: "2026-01-15", baselineFin: "2026-03-01", avance: 100, color: "#A07B4A", dep: [13] },
  { id: 15, fase: "Acabados", tarea: "Carpinterías y vidrios", inicio: "2026-02-01", fin: "2026-03-25", baselineInicio: "2026-02-01", baselineFin: "2026-03-15", avance: 95, color: "#A07B4A", dep: [13] },
  { id: 16, fase: "Acabados", tarea: "Iluminación", inicio: "2026-02-15", fin: "2026-04-05", baselineInicio: "2026-02-15", baselineFin: "2026-03-25", avance: 100, color: "#A07B4A", dep: [10] },
  { id: 17, fase: "Equipos", tarea: "Instalación equipos cocina", inicio: "2026-02-20", fin: "2026-04-15", baselineInicio: "2026-02-20", baselineFin: "2026-04-05", avance: 80, color: "#C44536", dep: [12] },
  { id: 18, fase: "Equipos", tarea: "Instalación bar y refrigeración", inicio: "2026-03-01", fin: "2026-04-20", baselineInicio: "2026-03-01", baselineFin: "2026-04-10", avance: 75, color: "#C44536", dep: [10, 12] },
  { id: 19, fase: "Mobiliario", tarea: "Instalación mobiliario", inicio: "2026-03-10", fin: "2026-04-25", baselineInicio: "2026-03-10", baselineFin: "2026-04-15", avance: 85, color: "#7A5A8C", dep: [14] },
  { id: 20, fase: "Mobiliario", tarea: "Pérgolas y toldos", inicio: "2026-03-20", fin: "2026-04-30", baselineInicio: "2026-03-20", baselineFin: "2026-04-22", avance: 80, color: "#7A5A8C", dep: [14] },
  { id: 21, fase: "Menaje", tarea: "Llegada importaciones", inicio: "2026-03-01", fin: "2026-04-30", baselineInicio: "2026-03-01", baselineFin: "2026-04-15", avance: 90, color: "#9B7B47", dep: [] },
  { id: 22, fase: "Menaje", tarea: "Organización menaje", inicio: "2026-04-15", fin: "2026-05-08", baselineInicio: "2026-04-15", baselineFin: "2026-05-02", avance: 40, color: "#9B7B47", dep: [21] },
  { id: 23, fase: "Pre-operativa", tarea: "Pruebas de stress eléctricas", inicio: "2026-04-20", fin: "2026-05-05", baselineInicio: "2026-04-15", baselineFin: "2026-04-30", avance: 30, color: "#1F3D2E", dep: [16, 17] },
  { id: 24, fase: "Pre-operativa", tarea: "Pruebas de stress de cocina", inicio: "2026-04-25", fin: "2026-05-10", baselineInicio: "2026-04-20", baselineFin: "2026-05-05", avance: 0, color: "#1F3D2E", dep: [17, 18, 22] },
  { id: 25, fase: "Pre-operativa", tarea: "Capacitación operativa", inicio: "2026-05-01", fin: "2026-05-15", baselineInicio: "2026-04-25", baselineFin: "2026-05-10", avance: 0, color: "#1F3D2E", dep: [22] },
  { id: 26, fase: "Apertura", tarea: "Soft opening", inicio: "2026-05-16", fin: "2026-05-22", baselineInicio: "2026-05-11", baselineFin: "2026-05-17", avance: 0, color: "#4A7C59", dep: [23, 24, 25] },
  { id: 27, fase: "Apertura", tarea: "Operación inicial + Punch list", inicio: "2026-05-23", fin: "2026-06-15", baselineInicio: "2026-05-18", baselineFin: "2026-06-10", avance: 0, color: "#4A7C59", dep: [26] },
  { id: 28, fase: "Cierre", tarea: "Informe de cierre y handover", inicio: "2026-06-16", fin: "2026-06-30", baselineInicio: "2026-06-11", baselineFin: "2026-06-25", avance: 0, color: "#14201A", dep: [27] }
];

/* Cosette 109 — proyecto histórico cerrado */
const SECONDARY_PROJECT = {
  id: "cosette-109",
  nombre: "Cosette 109",
  cliente: "DLK",
  direccion: "Calle 109 # 18-12",
  area: 215,
  puestos: 72,
  capexTotal: 2150000000,
  capexEjecutado: 2150000000,
  avancePct: 100,
  avanceTiempo: 100,
  estado: "Cerrado",
  inicio: "2024-09-15",
  fin: "2025-06-30",
  fase: "Operación",
  color: "#4A7C59"
};

/* ───────────────────────── HELPERS ───────────────────────── */

const fmtCOP = (n) => {
  if (n == null || isNaN(n)) return "$0";
  return "$" + Math.round(n).toLocaleString("es-CO").replace(/,/g, ".");
};

const fmtCOPshort = (n) => {
  if (n == null || isNaN(n)) return "$0";
  // COP siempre: sin decimales, sin sufijo "B". Para valores >= 1M se usa "M"
  // con separador de miles, así un billón se ve como "$7.200M" en vez de "$7.20B".
  const thousands = (v) => Math.round(v).toLocaleString("es-CO").replace(/,/g, ".");
  const abs = Math.abs(n);
  if (abs >= 1e6) return "$" + thousands(n / 1e6) + "M";
  if (abs >= 1e3) return "$" + thousands(n / 1e3) + "K";
  return "$" + thousands(n);
};

const fmtPct = (n) => (n == null || isNaN(n) ? "0%" : `${n.toFixed(1)}%`);

const dateStr = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
};

const daysBetween = (a, b) => {
  const ms = new Date(b) - new Date(a);
  return Math.round(ms / 86400000);
};

const ESTADO_COLORS = {
  Entregado: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-200" },
  Pedido:    { bg: "bg-amber-50",   text: "text-amber-800",   dot: "bg-amber-500",   border: "border-amber-200" },
  Cotizado:  { bg: "bg-sky-50",     text: "text-sky-800",     dot: "bg-sky-500",     border: "border-sky-200" },
  Pendiente: { bg: "bg-rose-50",    text: "text-rose-800",    dot: "bg-rose-500",    border: "border-rose-200" }
};

const CATEGORIA_ICONS = {
  "Construcción": Hammer,
  "Equipo": ChefHat,
  "Mobiliario": Sofa,
  "Menaje": Utensils,
  "Acero": Layers,
  "Iluminación": Lightbulb,
  "Tecnología": Activity,
  "Extracción": Wind,
  "Calefacción": Flame,
  "Jardinería": Trees,
  "Diseño Arquitectónico": Pen,
  "Avisos y Señalización": Tag,
  "Mármol": Layers,
  "Varios": Briefcase
};

/* ───────────────────────── PRIMITIVES ───────────────────────── */

const InfoButton = ({ onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-500 transition-all hover:border-emerald-700 hover:text-emerald-800 hover:shadow-sm ${className}`}
    title="Más información"
    aria-label="Información"
  >
    <Info className="h-3.5 w-3.5" />
  </button>
);

const Pill = ({ children, tone = "default" }) => {
  const tones = {
    default: "bg-stone-100 text-stone-700 border-stone-200",
    green:   "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber:   "bg-amber-50 text-amber-800 border-amber-200",
    red:     "bg-rose-50 text-rose-800 border-rose-200",
    blue:    "bg-sky-50 text-sky-800 border-sky-200",
    dark:    "bg-stone-900 text-white border-stone-900"
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-tight ${tones[tone]}`}>
      {children}
    </span>
  );
};

const ProgressBar = ({ value, color = "emerald", showLabel = false, height = "h-2" }) => {
  const colors = {
    emerald: "bg-emerald-600",
    amber:   "bg-amber-500",
    rose:    "bg-rose-500",
    stone:   "bg-stone-700"
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 overflow-hidden rounded-full bg-stone-100 ${height}`}>
        <div
          className={`${height} rounded-full transition-all ${colors[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-[11px] tabular-nums text-stone-600">
          {value.toFixed(0)}%
        </span>
      )}
    </div>
  );
};

const Card = ({ children, className = "", onClick, hover = false }) => (
  <div
    onClick={onClick}
    className={`rounded-xl border border-stone-200 bg-white ${
      hover ? "cursor-pointer transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md" : ""
    } ${className}`}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, subtitle, action, icon: Icon, onInfo }) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <div>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-stone-500" strokeWidth={1.6} />}
        <h2 className="font-serif text-[22px] leading-tight tracking-tight text-stone-900">{title}</h2>
        {onInfo && <InfoButton onClick={onInfo} />}
      </div>
      {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const Drawer = ({ open, onClose, title, children, width = "max-w-xl" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-stone-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`flex h-full w-full ${width} flex-col bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h3 className="font-serif text-lg tracking-tight text-stone-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h3 className="font-serif text-lg tracking-tight text-stone-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 text-sm leading-relaxed text-stone-700">{children}</div>
      </div>
    </div>
  );
};

/* ───────────────────────── COMMAND PALETTE ───────────────────────── */

const COMMANDS = [
  { id: "home", label: "Ir al inicio", desc: "Ver todos los proyectos activos", action: "navigate", target: "home", icon: Home, group: "Navegación" },
  { id: "capex", label: "Abrir CAPEX", desc: "Ver presupuesto y items", action: "navigate", target: "capex", icon: DollarSign, group: "Proyecto activo" },
  { id: "cron", label: "Abrir Cronograma", desc: "Diagrama de Gantt", action: "navigate", target: "cronograma", icon: Calendar, group: "Proyecto activo" },
  { id: "evm", label: "Análisis EVM", desc: "Earned Value Management", action: "navigate", target: "evm", icon: BarChart3, group: "Proyecto activo" },
  { id: "informes", label: "Informes", desc: "Generar reporte semanal/mensual/cierre", action: "navigate", target: "informes", icon: FileText, group: "Proyecto activo" },
  { id: "docs", label: "Documentos", desc: "11 entregables PMI del proyecto", action: "navigate", target: "documentos", icon: Folders, group: "Proyecto activo" },
  { id: "newproj", label: "Crear nuevo proyecto", desc: "Iniciar acta de constitución", action: "newProject", icon: Plus, group: "Acciones" },
  { id: "newitem", label: "Agregar item al CAPEX", desc: "Nuevo equipo, menaje, mobiliario...", action: "navigate", target: "capex", subAction: "new", icon: Plus, group: "Acciones" },
  { id: "weekly", label: "Generar acta de comité semanal", desc: "Plantilla con 6 bloques", action: "navigate", target: "informes", subAction: "weekly", icon: FileCheck, group: "Acciones" },
  { id: "risks", label: "Ver registro de riesgos", desc: "Riesgos identificados y mitigaciones", action: "navigate", target: "riesgos", icon: AlertTriangle, group: "Acciones" },
  { id: "change", label: "Solicitud de cambio", desc: "Crear control de cambios", action: "navigate", target: "cambios", icon: Edit3, group: "Acciones" },
  { id: "procurement", label: "Abrir Procurement", desc: "Listado de proveedores del proyecto", action: "navigate", target: "procurement", icon: Truck, group: "Proyecto activo" },
  { id: "cron-proy", label: "Cronograma de proyecto", desc: "Hitos gerenciales (licencias, preventas, fiducia, escrituración)", action: "navigate", target: "cron-proyecto", icon: Calendar, group: "Proyecto activo" },
  { id: "repo-docs", label: "Repositorio de documentos", desc: "Arquitectura, técnicos, legales, licencias, comerciales, fiduciaria", action: "navigate", target: "repo-docs", icon: FileText, group: "Proyecto activo" },
  { id: "reuniones", label: "Reuniones", desc: "Grabar reuniones y extraer actividades", action: "navigate", target: "reuniones", icon: Users, group: "Proyecto activo" },
  { id: "pendientes", label: "Seguimiento de actividades", desc: "Tareas con sub-tareas, kanban y bitácora", action: "navigate", target: "pendientes", icon: ListChecks, group: "Proyecto activo" },
  { id: "raci", label: "Matriz RACI", desc: "Editar responsabilidades y notificaciones", action: "navigate", target: "raci", icon: Share2, group: "Proyecto activo" },
  { id: "bitacora", label: "Bitácora inversionistas", desc: "Fotos de avance, % y newsletter semanal", action: "navigate", target: "bitacora", icon: Image, group: "Proyecto activo" },
  { id: "modelo-fin", label: "Modelo financiero", desc: "Proyecto, fiducia, inversionista", action: "navigate", target: "modelo-fin", icon: TrendingUp, group: "Proyecto activo" },
  { id: "capex-edif", label: "CAPEX edificación", desc: "10 capítulos · WBS construcción · 5 versiones comparables", action: "navigate", target: "capex-edif", icon: DollarSign, group: "Proyecto activo" },
  { id: "evm-capex", label: "EVM CAPEX/Cronograma", desc: "Valor ganado por paquete WBS (PV/EV/AC, CPI/SPI)", action: "navigate", target: "evm-capex", icon: Activity, group: "Proyecto activo" },
  { id: "pagos", label: "Pagos a proveedores", desc: "Registro de facturas y pagos · alimenta el AC del CAPEX", action: "navigate", target: "pagos", icon: Truck, group: "Proyecto activo" },
  { id: "info-interes", label: "Información de interés", desc: "Diccionario de procedimientos (fiducia, banco, licencias)", action: "navigate", target: "info-interes", icon: BookOpen, group: "Proyecto activo" },
  { id: "stakeholders", label: "Base de stakeholders", desc: "Reina · contactos, inversionistas, proveedores, PMI", action: "navigate", target: "stakeholders", icon: Users, group: "Proyecto activo" }
];

const CommandPalette = ({ open, onClose, onCommand, query, setQuery }) => {
  const inputRef = useRef(null);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return COMMANDS;
    return COMMANDS.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(c => { (g[c.group] = g[c.group] || []).push(c); });
    return g;
  }, [filtered]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" onClick={onClose}>
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-stone-200 px-5 py-4">
          <Sparkles className="h-4 w-4 text-emerald-700" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué quieres hacer hoy?"
            className="w-full bg-transparent text-base text-stone-900 outline-none placeholder:text-stone-400"
          />
          <kbd className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-500">ESC</kbd>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-2">
          {Object.entries(grouped).map(([group, cmds]) => (
            <div key={group}>
              <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                {group}
              </div>
              {cmds.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => { onCommand(cmd); onClose(); }}
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-stone-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700">
                      <Icon className="h-4 w-4" strokeWidth={1.7} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-stone-900">{cmd.label}</div>
                      <div className="text-xs text-stone-500">{cmd.desc}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-600" />
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-stone-400">
              Sin resultados — solo se muestran acciones disponibles dentro de la app.
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-4 py-2 text-[11px] text-stone-500">
          <span>Solo acciones dentro de la aplicación</span>
          <span className="font-mono">↵ ejecutar</span>
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────── TOP BAR + SIDEBAR ───────────────────────── */

const TopBar = ({ onSearch, onBack, canGoBack, breadcrumbs }) => (
  <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/85 backdrop-blur-md">
    <div className="flex h-14 items-center gap-4 px-6">
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
          canGoBack
            ? "border-stone-200 text-stone-700 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            : "cursor-not-allowed border-stone-100 text-stone-300"
        }`}
        title="Volver"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-900 text-white">
          <span className="font-serif text-[15px] leading-none">C</span>
        </div>
        <div className="hidden md:block">
          <div className="font-serif text-[15px] leading-none tracking-tight text-stone-900">Cretto</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-stone-400">Project Hub</div>
        </div>
      </div>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="hidden items-center gap-2 lg:flex">
          <div className="h-4 w-px bg-stone-200" />
          {breadcrumbs.map((b, i) => {
            const isLast = i === breadcrumbs.length - 1;
            const clickable = !isLast && typeof b.onClick === "function";
            return (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="h-3 w-3 text-stone-300" />}
                {clickable ? (
                  <button
                    onClick={b.onClick}
                    className="text-sm text-stone-500 hover:text-emerald-800 hover:underline underline-offset-2"
                  >
                    {b.label}
                  </button>
                ) : (
                  <span className={isLast ? "text-sm text-stone-900" : "text-sm text-stone-500"}>
                    {b.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-3">
        <button
          onClick={onSearch}
          className="group flex w-full max-w-md items-center gap-3 rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-1.5 text-left transition-all hover:border-stone-300 hover:bg-white hover:shadow-sm"
        >
          <Search className="h-4 w-4 text-stone-400 group-hover:text-emerald-700" />
          <span className="flex-1 text-sm text-stone-500">¿Qué quieres hacer hoy?</span>
          <kbd className="rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-500">⌘K</kbd>
        </button>
        <button className="hidden h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 sm:flex">
          <Bell className="h-4 w-4" />
        </button>
        <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-stone-900 font-serif text-xs text-white sm:flex">J</div>
      </div>
    </div>
  </header>
);

const Sidebar = ({ screen, onNav }) => {
  const items = [
    { id: "home", icon: Home, label: "Inicio" },
    { id: "all-projects", icon: Folders, label: "Proyectos" },
    { id: "cron-proyecto", icon: Calendar, label: "Cronograma proyecto" },
    { id: "cron-construccion", icon: Hammer, label: "Cronograma construcción" },
    { id: "repo-docs", icon: FileText, label: "Documentos" },
    { id: "reuniones", icon: Users, label: "Reuniones" },
    { id: "pendientes", icon: ListChecks, label: "Seguimiento de actividades" },
    { id: "raci", icon: Share2, label: "Matriz RACI" },
    { id: "bitacora", icon: Image, label: "Bitácora inversionistas" },
    { id: "modelo-fin", icon: TrendingUp, label: "Modelo financiero" },
    { id: "capex-edif", icon: DollarSign, label: "CAPEX edificios" },
    { id: "evm-capex", icon: Activity, label: "EVM CAPEX/Cronograma" },
    { id: "pagos", icon: Truck, label: "Pagos a proveedores" },
    { id: "tesoreria", icon: Wallet, label: "Tesorería (CFO)" },
    { id: "info-interes", icon: BookOpen, label: "Información de interés" },
    { id: "stakeholders", icon: Users, label: "Stakeholders DB" },
    { id: "global-evm", icon: BarChart3, label: "Métricas" },
    { id: "email-settings", icon: Settings, label: "Config. correo" }
  ];
  return (
    <nav className="hidden w-14 flex-col items-center gap-1 border-r border-stone-200 bg-stone-50/50 py-4 lg:flex">
      {items.map(it => {
        const Icon = it.icon;
        const active = screen === it.id || (it.id === "home" && screen === "home");
        return (
          <button
            key={it.id}
            onClick={() => onNav(it.id)}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
              active
                ? "bg-emerald-900 text-white"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
            title={it.label}
          >
            <Icon className="h-4 w-4" strokeWidth={1.7} />
            <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-[11px] text-white shadow-lg group-hover:block">
              {it.label}
            </span>
          </button>
        );
      })}
      <div className="mt-auto flex flex-col items-center gap-1">
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700">
          <Settings className="h-4 w-4" strokeWidth={1.7} />
        </button>
      </div>
    </nav>
  );
};

/* ───────────────────────── HOME SCREEN ───────────────────────── */

const ProjectCard = ({ project, onClick }) => {
  const esEdificio = project.tipoProyecto?.startsWith("edificio") || project.tipologia === "vivienda" || project.tipologia === "mixto" || project.tipologia === "oficinas";
  const esRestaurante = project.tipoProyecto === "restaurante" || (!esEdificio && project.puestos > 0);

  const capexTotal = project.capexTotal || 0;
  const capexEjec = project.capexEjecutado || 0;
  const moneyPct = capexTotal > 0 ? (capexEjec / capexTotal) * 100 : null;
  const timePct = project.avanceTiempo || 0;
  const variance = moneyPct == null ? 0 : (timePct - moneyPct);

  /* KPIs adaptados por tipo de proyecto */
  const kpis = esEdificio
    ? [
        { label: "Apartamentos", val: project.unidadesViv || project.unidades || 0, mono: true },
        { label: "Pisos / sótanos", val: `${project.pisos || 0} / ${project.sotanos || 0}`, mono: true },
        { label: "Área constr.", val: `${(project.area || project.areaConstruida || 0).toLocaleString("es-CO")} m²`, mono: true }
      ]
    : esRestaurante
      ? [
          { label: "Área", val: `${project.area || 0} m²`, mono: true },
          { label: "Puestos", val: project.puestos || 0, mono: true },
          { label: "CAPEX", val: fmtCOPshort(capexTotal), mono: true }
        ]
      : [
          { label: "Área", val: `${project.area || 0} m²`, mono: true },
          { label: "Unidades", val: project.unidades || project.puestos || 0, mono: true },
          { label: "CAPEX", val: fmtCOPshort(capexTotal), mono: true }
        ];

  /* Segunda fila: solo para edificios — info financiera y de fiducia */
  const kpisRow2 = esEdificio ? [
    { label: "CAPEX estimado", val: capexTotal > 0 ? fmtCOPshort(capexTotal) : "—", mono: true },
    { label: "Preventas req.", val: project.pctPreventas ? `${project.pctPreventas}%` : "—", mono: true },
    { label: "Fiduciaria", val: project.fiduciaria || "—", mono: false }
  ] : null;

  return (
    <Card hover onClick={onClick} className="overflow-hidden">
      <div
        className="h-1.5"
        style={{ background: `linear-gradient(90deg, ${project.color} 0%, ${project.color}66 100%)` }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-[19px] leading-tight tracking-tight text-stone-900">
                {project.nombre}
              </h3>
              <Pill tone={project.estado === "Cerrado" ? "default" : project.estado === "Planificación" || project.estado === "Definición" ? "blue" : "green"}>
                {project.estado}
              </Pill>
            </div>
            <p className="mt-1 text-xs text-stone-500">{project.cliente || project.promotor} · {project.direccion}</p>
          </div>
          <button className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-y border-stone-100 py-3">
          {kpis.map((k, i) => (
            <div key={i}>
              <div className="text-[10px] uppercase tracking-wider text-stone-400">{k.label}</div>
              <div className={`mt-0.5 ${k.mono ? "font-mono text-sm tabular-nums" : "text-sm"} text-stone-900 truncate`}>{k.val}</div>
            </div>
          ))}
        </div>

        {kpisRow2 && (
          <div className="grid grid-cols-3 gap-3 border-b border-stone-100 py-3">
            {kpisRow2.map((k, i) => (
              <div key={i}>
                <div className="text-[10px] uppercase tracking-wider text-stone-400">{k.label}</div>
                <div className={`mt-0.5 ${k.mono ? "font-mono text-sm tabular-nums" : "text-xs"} text-stone-900 truncate`} title={k.val}>{k.val}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {capexTotal > 0 && (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-stone-500">Avance financiero</span>
                <span className="font-mono tabular-nums text-stone-900">{moneyPct.toFixed(1)}%</span>
              </div>
              <ProgressBar value={moneyPct} color="emerald" />
              <div className="mt-1 font-mono text-[11px] tabular-nums text-stone-500">
                {fmtCOPshort(capexEjec)} / {fmtCOPshort(capexTotal)}
              </div>
            </div>
          )}
          {esEdificio && project.unidadesPuntoEquilibrio > 0 && (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-stone-500">Preventas para punto de equilibrio</span>
                <span className="font-mono tabular-nums text-stone-900">0 / {project.unidadesPuntoEquilibrio} apt</span>
              </div>
              <ProgressBar value={0} color="violet" />
            </div>
          )}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-stone-500">Avance en tiempo</span>
              <span className="font-mono tabular-nums text-stone-900">{timePct}%</span>
            </div>
            <ProgressBar value={timePct} color={Math.abs(variance) > 10 ? "amber" : "stone"} />
            {capexTotal > 0 && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
                {variance > 5 ? (
                  <><TrendingUp className="h-3 w-3 text-amber-600" /> <span className="text-amber-700">Tiempo adelantado a presupuesto ({variance.toFixed(0)}pts)</span></>
                ) : variance < -5 ? (
                  <><TrendingDown className="h-3 w-3 text-rose-600" /> <span className="text-rose-700">Atraso de tiempo vs ejecución ({variance.toFixed(0)}pts)</span></>
                ) : (
                  <><Activity className="h-3 w-3" /> <span>En línea con presupuesto</span></>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-stone-400">
          <span>
            {esEdificio ? "Obra: " : ""}{dateStr(project.fechaInicioObra || project.inicio)} → {dateStr(project.fechaEntregaObra || project.fin)}
          </span>
          <span className="flex items-center gap-1 text-emerald-800">Ver detalle <ArrowUpRight className="h-3 w-3" /></span>
        </div>
      </div>
    </Card>
  );
};

const HomeScreen = ({ projects, onSelect, onNew, onInfo }) => {
  const totalActive = projects.filter(p => p.estado !== "Cerrado").length;
  const totalCapex = projects.reduce((s, p) => s + p.capexTotal, 0);
  const totalEjec = projects.reduce((s, p) => s + p.capexEjecutado, 0);
  const avgTime = projects.reduce((s, p) => s + p.avanceTiempo, 0) / projects.length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-stone-400">Cretto · Expanding Brands</p>
          <h1 className="mt-1 font-serif text-[34px] leading-[1.1] tracking-tight text-stone-900">
            {(() => {
              const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
              return `Buen ${dias[new Date().getDay()]}, Jose.`;
            })()}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            {totalActive} proyectos activos · {fmtCOPshort(totalCapex)} en CAPEX bajo gerencia
          </p>
        </div>
        <button
          onClick={onNew}
          className="group inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Proyectos activos", value: totalActive, sub: `${projects.length} totales`, icon: Folders },
          { label: "CAPEX total bajo gestión", value: fmtCOPshort(totalCapex), sub: `${fmtCOPshort(totalEjec)} ejecutado`, icon: DollarSign },
          { label: "% Avance promedio", value: `${avgTime.toFixed(0)}%`, sub: "ponderado por tiempo", icon: TrendingUp },
          { label: "Próximo hito", value: "—", sub: "Sin hitos próximos", icon: Calendar }
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between">
                <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400">{m.label}</div>
                <Icon className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.7} />
              </div>
              <div className="mt-2 font-serif text-[26px] leading-none tracking-tight text-stone-900">{m.value}</div>
              <div className="mt-1 text-[11px] text-stone-500">{m.sub}</div>
            </Card>
          );
        })}
      </div>

      {(() => {
        const activos = projects.filter(p => p.estado !== "Cerrado");
        const archivados = projects.filter(p => p.estado === "Cerrado");
        return (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-[20px] tracking-tight text-stone-900">Proyectos activos</h2>
                <InfoButton onClick={() => onInfo("home-projects")} />
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Filter className="h-3.5 w-3.5" />
                <span>Activos · {activos.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activos.map(p => (
                <ProjectCard key={p.id} project={p} onClick={() => onSelect(p)} />
              ))}
            </div>

            {archivados.length > 0 && (
              <>
                <div className="mt-10 mb-3 flex items-center justify-between">
                  <h2 className="font-serif text-[18px] tracking-tight text-stone-500">Proyectos archivados</h2>
                  <span className="text-xs text-stone-400">{archivados.length} cerrados</span>
                </div>
                <div className="grid grid-cols-1 gap-4 opacity-75 md:grid-cols-2 xl:grid-cols-3">
                  {archivados.map(p => (
                    <ProjectCard key={p.id} project={p} onClick={() => onSelect(p)} />
                  ))}
                </div>
              </>
            )}
          </>
        );
      })()}
    </div>
  );
};

/* ───────────────────────── PROJECT DETAIL SCREEN ───────────────────────── */

const ProjectDetailScreen = ({ project, items, entregas, onTool, onInfo }) => {
  const stats = useMemo(() => {
    const total = items.reduce((s, i) => s + i.total, 0);
    const ent = items.filter(i => i.estado === "Entregado").reduce((s, i) => s + i.total, 0);
    const ped = items.filter(i => i.estado === "Pedido").reduce((s, i) => s + i.total, 0);
    const cot = items.filter(i => i.estado === "Cotizado").reduce((s, i) => s + i.total, 0);
    const pen = items.filter(i => i.estado === "Pendiente").reduce((s, i) => s + i.total, 0);
    return { total, ent, ped, cot, pen };
  }, [items]);

  const moneyPct = stats.total > 0 ? (stats.ent / stats.total) * 100 : 0;

  /* Detecta si el proyecto es de restaurante (para mostrar tools legacy) */
  const esRestaurante = project.tipoProyecto === "restaurante"
    || (!project.tipoProyecto && project.puestos > 0 && !project.tipologia);

  /* Herramientas del proyecto agrupadas por dominio.
     Las nuevas (edificación, RACI, bitácora, etc.) van marcadas con badge. */
  const toolGroups = [
    {
      label: "Planeación financiera",
      tools: [
        { id: "capex-edif",  title: "CAPEX edificación",   desc: "10 capítulos · WBS construcción · 5 versiones", icon: DollarSign, sub: "vivienda", color: "from-emerald-50 to-white", iconColor: "text-emerald-700", neu: true },
        { id: "modelo-fin",  title: "Modelo financiero",   desc: "Proyecto · fiducia · inversionista · banco",     icon: TrendingUp, sub: "multi-versión", color: "from-indigo-50 to-white", iconColor: "text-indigo-700", neu: true },
        { id: "evm-capex",   title: "EVM CAPEX/Cronograma", desc: "PV · EV · AC · CPI · SPI por WBS",              icon: Activity,   sub: "earned value", color: "from-amber-50 to-white", iconColor: "text-amber-700", neu: true },
        { id: "pagos",       title: "Pagos a proveedores", desc: "Facturas y pagos · alimenta el AC del CAPEX",   icon: Truck,      sub: "registro de pagos", color: "from-teal-50 to-white", iconColor: "text-teal-700", neu: true },
        { id: "tesoreria",   title: "Tesorería (CFO) ★",   desc: "Matriz hitos↔caja · liquidez · stress tests · crédito constructor", icon: Wallet, sub: "dashboard CFO Cretto", color: "from-emerald-50 to-white", iconColor: "text-emerald-700", neu: true }
      ]
    },
    {
      label: "Cronograma",
      tools: [
        { id: "cron-proyecto", title: "Cronograma de proyecto",     desc: "Hitos gerenciales (fiducia, licencias, escrituración)", icon: Calendar, sub: "vista gerencial", color: "from-sky-50 to-white",  iconColor: "text-sky-700", neu: true },
        { id: "cronograma",    title: "Cronograma de construcción", desc: "Diagrama de Gantt · baseline vs real",                 icon: Hammer,   sub: "obra · WBS", color: "from-sky-50 to-white", iconColor: "text-sky-700" }
      ]
    },
    {
      label: "Gestión operativa",
      tools: [
        { id: "pendientes",   title: "Seguimiento de actividades", desc: "Tareas anidadas, kanban y bitácora por actividad", icon: ListChecks, sub: "árbol · kanban", color: "from-rose-50 to-white", iconColor: "text-rose-700", neu: true },
        { id: "reuniones",    title: "Reuniones",        desc: "Repositorio + grabación + extracción de actividades", icon: Users,     sub: "actas vivas",     color: "from-violet-50 to-white", iconColor: "text-violet-700", neu: true },
        { id: "repo-docs",    title: "Documentos",       desc: "Repositorio por categoría (arq, técnico, legal…)",   icon: FileText,  sub: "9 categorías",    color: "from-stone-100 to-white", iconColor: "text-stone-700",  neu: true },
        { id: "info-interes", title: "Información de interés", desc: "Diccionario de procedimientos (fiducia, banco, licencias)", icon: BookOpen,  sub: "knowledge base", color: "from-emerald-50 to-white", iconColor: "text-emerald-700", neu: true }
      ]
    },
    {
      label: "Stakeholders y comunicación",
      tools: [
        { id: "stakeholders", title: "Stakeholders DB ★",     desc: "Base maestra: contactos, inversionistas, proveedores, PMI",  icon: Users,   sub: "fuente única",      color: "from-emerald-50 to-white", iconColor: "text-emerald-700", neu: true },
        { id: "raci",         title: "Matriz RACI",           desc: "Roles, responsables y notificaciones por evento",            icon: Share2,  sub: "editable",          color: "from-rose-50 to-white",    iconColor: "text-rose-700",   neu: true },
        { id: "bitacora",     title: "Bitácora inversionistas", desc: "Fotos · % avance · newsletter segmentado",                 icon: Image,   sub: "5 audiencias",      color: "from-indigo-50 to-white",  iconColor: "text-indigo-700", neu: true }
      ]
    },
    {
      label: "Cierre y reportería",
      tools: [
        { id: "informes",    title: "Informes",         desc: "Plantillas semanal · mensual · cierre", icon: FileCheck,     sub: "PMI",        color: "from-rose-50 to-white",   iconColor: "text-rose-700" },
        { id: "documentos",  title: "Documentos PMI",   desc: "11 entregables del PMBOK",              icon: FileText,      sub: "estado vivo", color: "from-stone-100 to-white", iconColor: "text-stone-700" },
        { id: "riesgos",     title: "Riesgos y cambios", desc: "Matriz 5×5 + control de cambios",     icon: AlertTriangle, sub: "registro",    color: "from-violet-50 to-white", iconColor: "text-violet-700" }
      ]
    },
    ...(esRestaurante ? [{
      label: "Legacy (restaurante)",
      tools: [
        { id: "capex",       title: "CAPEX restaurante", desc: "Items, proveedores (vista antigua)", icon: DollarSign, sub: `${items.length} items`, color: "from-stone-50 to-white", iconColor: "text-stone-600" },
        { id: "evm",         title: "EVM (antiguo)",     desc: "CPI/SPI versión inicial",            icon: BarChart3,  sub: "v1",                 color: "from-stone-50 to-white", iconColor: "text-stone-600" },
        { id: "procurement", title: "Procurement",       desc: "Listado de proveedores",             icon: Truck,      sub: "contactos",          color: "from-stone-50 to-white", iconColor: "text-stone-600" }
      ]
    }] : [])
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* HERO */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 via-white to-emerald-50/40">
        <div className="grid gap-6 p-6 lg:grid-cols-[2fr_3fr]">
          <div>
            <div className="flex items-center gap-2">
              <Pill tone="green">{project.estado}</Pill>
              <Pill tone="default">{project.fase}</Pill>
            </div>
            <h1 className="mt-3 font-serif text-[36px] leading-[1.05] tracking-tight text-stone-900">{project.nombre}</h1>
            <p className="mt-1 text-sm text-stone-500">{project.cliente} · {project.direccion}</p>
            <div className="mt-5 grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400">Área construida</div>
                <div className="font-mono text-base tabular-nums text-stone-900">{(project.area || 0).toLocaleString("es-CO")} m²</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400">
                  {project.tipoProyecto?.startsWith("edificio") ? "Apartamentos" : project.tipoProyecto === "restaurante" ? "Puestos" : "Unidades"}
                </div>
                <div className="font-mono text-base tabular-nums text-stone-900">{project.unidadesViv || project.unidades || project.puestos || 0}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400">
                  {project.tipoProyecto?.startsWith("edificio") ? "Entrega obra" : "Soft opening"}
                </div>
                <div className="font-mono text-base tabular-nums text-stone-900">
                  {project.fechaEntregaObra
                    ? new Date(project.fechaEntregaObra).toLocaleDateString("es-CO", { month: "short", year: "numeric" })
                    : project.softOpening
                      ? new Date(project.softOpening).toLocaleDateString("es-CO", { month: "short", year: "numeric" })
                      : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-stone-200 bg-white/70 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-stone-900">Avance global</h3>
              <InfoButton onClick={() => onInfo("project-progress")} />
            </div>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-xs text-stone-500">Avance financiero (CAPEX entregado / total)</span>
                  <span className="font-serif text-2xl tabular-nums text-stone-900">{moneyPct.toFixed(1)}%</span>
                </div>
                <ProgressBar value={moneyPct} color="emerald" height="h-2.5" />
              </div>
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-xs text-stone-500">Avance en tiempo (días transcurridos / plan)</span>
                  <span className="font-serif text-2xl tabular-nums text-stone-900">{project.avanceTiempo}%</span>
                </div>
                <ProgressBar value={project.avanceTiempo} color="stone" height="h-2.5" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 border-t border-stone-100 pt-3">
              {[
                { label: "Entregado", val: stats.ent, color: "text-emerald-700", bg: "bg-emerald-500" },
                { label: "Pedido", val: stats.ped, color: "text-amber-700", bg: "bg-amber-500" },
                { label: "Cotizado", val: stats.cot, color: "text-sky-700", bg: "bg-sky-500" },
                { label: "Pendiente", val: stats.pen, color: "text-rose-700", bg: "bg-rose-500" }
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${s.bg}`} />
                    <span className="text-[10px] uppercase tracking-wider text-stone-400">{s.label}</span>
                  </div>
                  <div className={`mt-1 font-mono text-xs tabular-nums ${s.color}`}>
                    {fmtCOPshort(s.val)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOOLS */}
      <SectionHeader
        title="Herramientas del proyecto"
        subtitle="Todas las herramientas creadas para gestionar el proyecto. Las nuevas vienen marcadas con NUEVO."
        onInfo={() => onInfo("project-tools")}
      />
      <div className="space-y-6">
        {toolGroups.map(group => (
          <div key={group.label}>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">{group.label}</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {group.tools.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => onTool(t.id)}
                    className={`group relative overflow-hidden rounded-xl border border-stone-200 bg-gradient-to-br ${t.color} p-4 text-left transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md`}
                  >
                    {t.neu && (
                      <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-white">NUEVO</span>
                    )}
                    <div className="flex items-start justify-between">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white ${t.iconColor}`}>
                        <Icon className="h-4 w-4" strokeWidth={1.7} />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-stone-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-stone-700" />
                    </div>
                    <h4 className="mt-3 font-serif text-[16px] leading-tight tracking-tight text-stone-900">{t.title}</h4>
                    <p className="mt-1 text-[11px] leading-snug text-stone-500">{t.desc}</p>
                    {t.sub && <div className="mt-2 text-[10px] uppercase tracking-wider text-stone-400">{t.sub}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-[17px] tracking-tight text-stone-900">Próximas entregas</h3>
            <InfoButton onClick={() => onInfo("upcoming")} />
          </div>
          <div className="space-y-2.5">
            {entregas.filter(e => e.cumplio !== "1.0" && e.cumplio !== "1").slice(0, 5).map((e, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50/40 p-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white text-stone-500">
                  <Truck className="h-3.5 w-3.5" strokeWidth={1.7} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm text-stone-900">{e.prod || "—"}</div>
                  <div className="text-[11px] text-stone-500">{e.prov} · {dateStr(e.fecha)}</div>
                </div>
                <Pill tone={e.cumplio === "0.5" ? "amber" : "red"}>
                  {e.cumplio === "0.5" ? "Parcial" : "Pendiente"}
                </Pill>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-[17px] tracking-tight text-stone-900">Top categorías por valor</h3>
            <InfoButton onClick={() => onInfo("top-categorias")} />
          </div>
          <div className="space-y-2">
            {Object.entries(
              items.reduce((acc, it) => {
                acc[it.categoria] = (acc[it.categoria] || 0) + it.total;
                return acc;
              }, {})
            ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([cat, val], i) => {
              const Icon = CATEGORIA_ICONS[cat] || Package;
              const pct = (val / stats.total) * 100;
              return (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <Icon className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.7} />
                  <span className="w-32 truncate text-sm text-stone-700">{cat}</span>
                  <div className="flex-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <div className="h-1.5 rounded-full bg-emerald-700/80" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-stone-900">{fmtCOPshort(val)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ───────────────────────── CAPEX SCREEN ───────────────────────── */

const CapexScreen = ({ items, onItemsChange, onInfo, autoOpenNew }) => {
  const [filterCat, setFilterCat] = useState("all");
  const [filterUbi, setFilterUbi] = useState("all");
  const [filterEst, setFilterEst] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [sortBy, setSortBy] = useState("total");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    if (autoOpenNew) setCreating(true);
  }, [autoOpenNew]);

  const cats = useMemo(() => Array.from(new Set(items.map(i => i.categoria))).sort(), [items]);
  const ubis = useMemo(() => Array.from(new Set(items.map(i => i.ubicacion).filter(Boolean))).sort(), [items]);

  const filtered = useMemo(() => {
    let r = items;
    if (filterCat !== "all") r = r.filter(i => i.categoria === filterCat);
    if (filterUbi !== "all") r = r.filter(i => i.ubicacion === filterUbi);
    if (filterEst !== "all") r = r.filter(i => i.estado === filterEst);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(i => i.nombre.toLowerCase().includes(q) || (i.proveedor || "").toLowerCase().includes(q));
    }
    r = [...r].sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      const d = sortDir === "asc" ? 1 : -1;
      if (va < vb) return -1 * d;
      if (va > vb) return 1 * d;
      return 0;
    });
    return r;
  }, [items, filterCat, filterUbi, filterEst, search, sortBy, sortDir]);

  const totals = useMemo(() => {
    const t = filtered.reduce((s, i) => s + i.total, 0);
    const ent = filtered.filter(i => i.estado === "Entregado").reduce((s, i) => s + i.total, 0);
    return { t, ent, n: filtered.length };
  }, [filtered]);

  const toggleSort = (k) => {
    if (sortBy === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(k); setSortDir("desc"); }
  };

  const updateItem = (id, patch) => {
    const next = items.map(i => (i.id === id ? { ...i, ...patch } : i));
    onItemsChange(next);
  };
  const deleteItem = (id) => {
    if (!confirm("¿Eliminar este item del CAPEX?")) return;
    onItemsChange(items.filter(i => i.id !== id));
    setEditing(null);
  };
  const createItem = (data) => {
    const nextId = Math.max(0, ...items.map(i => i.id || 0)) + 1;
    const newItem = {
      id: nextId, cantidad: data.cantidad || 1, nombre: data.nombre, medidas: data.medidas || "",
      proveedor: data.proveedor || "Sin asignar", categoria: data.categoria, ubicacion: data.ubicacion || "Sin asignar",
      precio: Number(data.precio) || 0, total: Number(data.precio) * (data.cantidad || 1) * 1.19,
      cot: false, ped: false, ent: 0, falt: data.cantidad || 1, estado: "Pendiente"
    };
    onItemsChange([...items, newItem]);
    setCreating(false);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <SectionHeader
        title="CAPEX · Cosette 81"
        subtitle={`${items.length} items presupuestados · ${fmtCOP(items.reduce((s,i)=>s+i.total,0))} total con IVA`}
        onInfo={() => onInfo("capex-screen")}
        action={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Nuevo item
          </button>
        }
      />

      {/* CATEGORY CHIPS */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setFilterCat("all")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all ${
            filterCat === "all"
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
          }`}
        >
          Todas <span className="font-mono">({items.length})</span>
        </button>
        {cats.map(c => {
          const Icon = CATEGORIA_ICONS[c] || Package;
          const n = items.filter(i => i.categoria === c).length;
          return (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all ${
                filterCat === c
                  ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
              }`}
            >
              <Icon className="h-3 w-3" strokeWidth={1.8} />
              {c} <span className="font-mono opacity-60">({n})</span>
            </button>
          );
        })}
      </div>

      {/* SECONDARY FILTERS */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o proveedor"
            className="w-64 rounded-lg border border-stone-200 bg-white py-1.5 pl-8 pr-3 text-sm text-stone-900 outline-none transition-all focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <select value={filterUbi} onChange={(e) => setFilterUbi(e.target.value)} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-emerald-700">
          <option value="all">Todas las ubicaciones</option>
          {ubis.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select value={filterEst} onChange={(e) => setFilterEst(e.target.value)} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-emerald-700">
          <option value="all">Cualquier estado</option>
          <option value="Entregado">Entregado</option>
          <option value="Pedido">Pedido</option>
          <option value="Cotizado">Cotizado</option>
          <option value="Pendiente">Pendiente</option>
        </select>
        <div className="ml-auto flex items-center gap-3 text-xs text-stone-500">
          <span><span className="font-mono tabular-nums text-stone-900">{totals.n}</span> items</span>
          <span className="h-3 w-px bg-stone-200" />
          <span>Subtotal: <span className="font-mono tabular-nums text-stone-900">{fmtCOP(totals.t)}</span></span>
          <span className="h-3 w-px bg-stone-200" />
          <span>Entregado: <span className="font-mono tabular-nums text-emerald-800">{fmtCOP(totals.ent)}</span> ({((totals.ent/totals.t)*100||0).toFixed(0)}%)</span>
        </div>
      </div>

      {/* TABLE */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50/60 text-[11px] uppercase tracking-wider text-stone-500">
              <tr>
                {[
                  { k: "categoria", label: "Categoría", w: "w-36" },
                  { k: "nombre", label: "Item", w: "" },
                  { k: "proveedor", label: "Proveedor", w: "w-36" },
                  { k: "ubicacion", label: "Ubicación", w: "w-32" },
                  { k: "cantidad", label: "Cant", w: "w-14 text-right" },
                  { k: "precio", label: "Precio unit", w: "w-32 text-right" },
                  { k: "total", label: "Total c/IVA", w: "w-36 text-right" },
                  { k: "estado", label: "Estado", w: "w-32" },
                  { k: "actions", label: "", w: "w-12" }
                ].map(c => (
                  <th
                    key={c.k}
                    onClick={() => c.k !== "actions" && toggleSort(c.k)}
                    className={`${c.w} px-3 py-2 font-medium ${c.k !== "actions" ? "cursor-pointer hover:text-stone-900" : ""}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      {sortBy === c.k && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((it) => {
                const ec = ESTADO_COLORS[it.estado] || ESTADO_COLORS.Pendiente;
                const Icon = CATEGORIA_ICONS[it.categoria] || Package;
                return (
                  <tr key={it.id} className="group border-b border-stone-100 transition-colors hover:bg-stone-50/50">
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-600">
                        <Icon className="h-3 w-3" strokeWidth={1.8} />
                        {it.categoria}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-stone-900">{it.nombre}</div>
                      {it.medidas && <div className="text-[11px] text-stone-500">{it.medidas}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-stone-700">{it.proveedor}</td>
                    <td className="px-3 py-2.5 text-stone-600">{it.ubicacion}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-stone-700">{it.cantidad ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-stone-700">{fmtCOPshort(it.precio)}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-stone-900">{fmtCOP(it.total)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${ec.bg} ${ec.text} ${ec.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${ec.dot}`} />
                        {it.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setEditing(it)}
                        className="rounded p-1 text-stone-400 opacity-0 transition-all hover:bg-stone-100 hover:text-stone-700 group-hover:opacity-100"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 200 && (
          <div className="border-t border-stone-100 bg-stone-50/40 px-4 py-2 text-center text-[11px] text-stone-500">
            Mostrando 200 de {filtered.length} items. Filtra para ver más.
          </div>
        )}
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-stone-400">
            Sin resultados con los filtros actuales.
          </div>
        )}
      </Card>

      <CapexEditor
        item={editing}
        onClose={() => setEditing(null)}
        onSave={(p) => { updateItem(editing.id, p); setEditing(null); }}
        onDelete={() => deleteItem(editing.id)}
      />
      <CapexEditor
        item={creating ? {} : null}
        isNew
        cats={cats}
        ubis={ubis}
        onClose={() => setCreating(false)}
        onSave={createItem}
      />
    </div>
  );
};

const CapexEditor = ({ item, isNew, cats, ubis, onClose, onSave, onDelete }) => {
  const [form, setForm] = useState({});
  useEffect(() => { if (item) setForm({ ...item }); }, [item]);
  if (!item) return null;
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  return (
    <Drawer open={!!item} onClose={onClose} title={isNew ? "Nuevo item de CAPEX" : "Editar item"} width="max-w-md">
      <div className="space-y-4">
        <div>
          <label className="text-[11px] uppercase tracking-wider text-stone-500">Nombre</label>
          <input
            value={form.nombre || ""}
            onChange={(e) => set("nombre", e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500">Categoría</label>
            {isNew ? (
              <select
                value={form.categoria || ""}
                onChange={(e) => set("categoria", e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
              >
                <option value="">— Seleccionar —</option>
                {(cats || ["Equipo", "Menaje", "Mobiliario", "Acero"]).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input value={form.categoria || ""} disabled className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500" />
            )}
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500">Ubicación</label>
            <input
              value={form.ubicacion || ""}
              onChange={(e) => set("ubicacion", e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
              list="ubis-list"
            />
            <datalist id="ubis-list">
              {(ubis || ["Cocina", "Comedor", "Bar 1er piso", "Bar 3er piso", "Restaurante"]).map(u => <option key={u} value={u} />)}
            </datalist>
          </div>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-stone-500">Medidas / Info</label>
          <input
            value={form.medidas || ""}
            onChange={(e) => set("medidas", e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-stone-500">Proveedor</label>
          <input
            value={form.proveedor || ""}
            onChange={(e) => set("proveedor", e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500">Cantidad</label>
            <input
              type="number" value={form.cantidad ?? ""}
              onChange={(e) => set("cantidad", Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500">Precio unit</label>
            <input
              type="number" value={form.precio ?? ""}
              onChange={(e) => set("precio", Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500">Total c/IVA</label>
            <input
              type="number" value={form.total ?? ""}
              onChange={(e) => set("total", Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
            />
          </div>
        </div>
        {!isNew && (
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500">Estado</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Pendiente", "Cotizado", "Pedido", "Entregado"].map(e => {
                const ec = ESTADO_COLORS[e];
                const active = form.estado === e;
                return (
                  <button
                    key={e}
                    onClick={() => set("estado", e)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all ${
                      active ? `${ec.bg} ${ec.text} ${ec.border} ring-2 ring-offset-1 ring-stone-300` : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${ec.dot}`} />
                    {e}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-stone-100 pt-4">
          <div>
            {!isNew && onDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-stone-200 px-3.5 py-2 text-sm text-stone-700 hover:bg-stone-50">Cancelar</button>
            <button
              onClick={() => onSave(form)}
              disabled={!form.nombre || (isNew && !form.categoria)}
              className="rounded-lg bg-emerald-900 px-3.5 py-2 text-sm text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isNew ? "Crear item" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

/* ───────────────────────── CRONOGRAMA / GANTT ───────────────────────── */

const CronogramaScreen = ({ tareas, onTareasChange, onInfo }) => {
  const [view, setView] = useState("real"); // "real", "baseline", "compare"
  const [zoom, setZoom] = useState("month"); // "week", "month", "quarter"
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const today = new Date("2026-04-27");

  const range = useMemo(() => {
    const all = tareas.flatMap(t => [
      new Date(t.inicio), new Date(t.fin),
      new Date(t.baselineInicio), new Date(t.baselineFin)
    ]);
    const min = new Date(Math.min(...all));
    const max = new Date(Math.max(...all));
    min.setDate(1);
    max.setMonth(max.getMonth() + 1, 1);
    return { min, max, days: daysBetween(min, max) };
  }, [tareas]);

  const fases = useMemo(() => {
    const f = {};
    tareas.forEach(t => {
      if (!f[t.fase]) f[t.fase] = { name: t.fase, color: t.color, tareas: [] };
      f[t.fase].tareas.push(t);
    });
    return Object.values(f);
  }, [tareas]);

  const months = useMemo(() => {
    const arr = [];
    const cur = new Date(range.min);
    while (cur < range.max) {
      arr.push({
        date: new Date(cur),
        label: cur.toLocaleDateString("es-CO", { month: "short", year: "2-digit" })
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    return arr;
  }, [range]);

  const dayWidth = zoom === "week" ? 8 : zoom === "month" ? 3.5 : 1.5;
  const labelWidth = 280;
  const rowHeight = 32;
  const phaseHeaderHeight = 28;
  const totalWidth = labelWidth + range.days * dayWidth;
  const headerHeight = 56;

  const xFor = (d) => labelWidth + daysBetween(range.min, new Date(d)) * dayWidth;
  const todayX = xFor(today);

  const totalRows = fases.reduce((s, f) => s + f.tareas.length, 0) + fases.length;
  const totalHeight = headerHeight + totalRows * rowHeight + 40;

  // Statistics
  const stats = useMemo(() => {
    const completed = tareas.filter(t => t.avance === 100).length;
    const inProgress = tareas.filter(t => t.avance > 0 && t.avance < 100).length;
    const notStarted = tareas.filter(t => t.avance === 0).length;
    const delayed = tareas.filter(t => {
      const realFin = new Date(t.fin);
      const baseFin = new Date(t.baselineFin);
      return realFin > baseFin;
    }).length;
    const avgDelay = tareas.reduce((s, t) => s + Math.max(0, daysBetween(t.baselineFin, t.fin)), 0) / tareas.length;
    return { completed, inProgress, notStarted, delayed, avgDelay };
  }, [tareas]);

  const updateTarea = (id, patch) => {
    onTareasChange(tareas.map(t => (t.id === id ? { ...t, ...patch } : t)));
  };

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-6">
      <SectionHeader
        title="Cronograma · Cosette 81"
        subtitle="Diagrama de Gantt con baseline (línea base) vs ejecución real"
        onInfo={() => onInfo("cronograma-screen")}
        action={
          <button
            onClick={() => {
              const nextId = Math.max(...tareas.map(t => t.id)) + 1;
              const today = new Date().toISOString().slice(0, 10);
              const nuevo = {
                id: nextId, fase: "Pre-operativa", tarea: "Nueva actividad",
                inicio: today, fin: today, baselineInicio: today, baselineFin: today,
                avance: 0, color: "#5A6B5C", dep: []
              };
              onTareasChange([...tareas, nuevo]);
              setSelected(nuevo);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Nueva actividad
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { l: "Actividades", v: tareas.length, sub: "totales", c: "text-stone-900" },
          { l: "Completadas", v: stats.completed, sub: `${((stats.completed/tareas.length)*100).toFixed(0)}%`, c: "text-emerald-800" },
          { l: "En progreso", v: stats.inProgress, sub: "activas", c: "text-amber-800" },
          { l: "Sin iniciar", v: stats.notStarted, sub: "pendientes", c: "text-stone-500" },
          { l: "Con atraso", v: stats.delayed, sub: `prom ${stats.avgDelay.toFixed(1)}d`, c: "text-rose-800" }
        ].map((m, i) => (
          <Card key={i} className="p-3">
            <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400">{m.l}</div>
            <div className={`mt-1 font-serif text-2xl tabular-nums ${m.c}`}>{m.v}</div>
            <div className="text-[11px] text-stone-500">{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex items-center justify-between rounded-lg border border-stone-200 bg-white p-2">
        <div className="flex items-center gap-2">
          <span className="ml-2 text-xs text-stone-500">Vista:</span>
          {[
            { id: "real", label: "Real" },
            { id: "baseline", label: "Línea base" },
            { id: "compare", label: "Comparar" }
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`rounded-md px-3 py-1 text-xs transition-all ${
                view === v.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {v.label}
            </button>
          ))}
          <span className="ml-3 h-4 w-px bg-stone-200" />
          <span className="ml-2 text-xs text-stone-500">Zoom:</span>
          {[
            { id: "week", label: "Semana" },
            { id: "month", label: "Mes" },
            { id: "quarter", label: "Trimestre" }
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setZoom(v.id)}
              className={`rounded-md px-3 py-1 text-xs transition-all ${
                zoom === v.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 px-2 text-[11px] text-stone-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-emerald-700" /> Real</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm border-2 border-dashed border-stone-400 bg-transparent" /> Baseline</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-rose-600 bg-white" /> Hito</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-rose-600" /> Hoy</span>
        </div>
      </div>

      {/* Gantt */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: 720 }}>
          <svg width={totalWidth} height={totalHeight} style={{ display: "block", minWidth: "100%" }}>
            {/* Background */}
            <rect x="0" y="0" width={totalWidth} height={totalHeight} fill="#FFFFFF" />

            {/* Header background */}
            <rect x="0" y="0" width={totalWidth} height={headerHeight} fill="#F8F8F5" />
            <line x1="0" y1={headerHeight} x2={totalWidth} y2={headerHeight} stroke="#E7E5E0" strokeWidth="1" />
            <line x1={labelWidth} y1="0" x2={labelWidth} y2={totalHeight} stroke="#E7E5E0" strokeWidth="1" />

            {/* Month headers */}
            {months.map((m, i) => {
              const x = xFor(m.date);
              const next = months[i + 1] ? xFor(months[i + 1].date) : totalWidth;
              const isCurrent = m.date.getFullYear() === today.getFullYear() && m.date.getMonth() === today.getMonth();
              return (
                <g key={i}>
                  <line x1={x} y1={0} x2={x} y2={totalHeight} stroke="#EFEDE7" strokeWidth="1" />
                  <rect x={x} y={0} width={next - x} height={headerHeight} fill={isCurrent ? "#FEF3C7" : "transparent"} opacity="0.4" />
                  <text x={x + (next - x) / 2} y={22} textAnchor="middle" fontSize="11" fill="#525252" fontWeight="500">
                    {m.label.toUpperCase()}
                  </text>
                  <text x={x + (next - x) / 2} y={40} textAnchor="middle" fontSize="9" fill="#A3A3A3">
                    {m.date.toLocaleDateString("es-CO", { month: "long" })}
                  </text>
                </g>
              );
            })}

            {/* Today line */}
            <line x1={todayX} y1={0} x2={todayX} y2={totalHeight} stroke="#E11D48" strokeWidth="1.5" strokeDasharray="3,3" />
            <rect x={todayX - 18} y={4} width={36} height={14} rx={3} fill="#E11D48" />
            <text x={todayX} y={14} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">HOY</text>

            {/* Phases + tasks */}
            {(() => {
              let y = headerHeight;
              const els = [];
              fases.forEach((f, fi) => {
                // Phase header row
                const phaseStart = Math.min(...f.tareas.map(t => new Date(t.inicio)));
                const phaseEnd = Math.max(...f.tareas.map(t => new Date(t.fin)));
                const px = xFor(phaseStart);
                const pe = xFor(phaseEnd);
                els.push(
                  <g key={`phase-${fi}`}>
                    <rect x={0} y={y} width={totalWidth} height={phaseHeaderHeight} fill="#FAFAF7" />
                    <line x1={0} y1={y + phaseHeaderHeight} x2={totalWidth} y2={y + phaseHeaderHeight} stroke="#E7E5E0" />
                    <text x={14} y={y + 18} fontSize="11" fontWeight="700" fill={f.color} style={{ letterSpacing: "0.05em" }}>
                      {f.name.toUpperCase()}
                    </text>
                    <text x={labelWidth - 12} y={y + 18} textAnchor="end" fontSize="10" fill="#A3A3A3">
                      {f.tareas.length} actividades
                    </text>
                    <rect x={px} y={y + 10} width={Math.max(2, pe - px)} height={8} fill={f.color} opacity="0.18" rx="1" />
                  </g>
                );
                y += phaseHeaderHeight;

                // Tasks
                f.tareas.forEach((t, ti) => {
                  const x1 = xFor(t.inicio);
                  const x2 = xFor(t.fin);
                  const bx1 = xFor(t.baselineInicio);
                  const bx2 = xFor(t.baselineFin);
                  const w = Math.max(3, x2 - x1);
                  const bw = Math.max(3, bx2 - bx1);
                  const realDelay = daysBetween(t.baselineFin, t.fin);
                  const isHovered = hovered === t.id;
                  const isSelected = selected?.id === t.id;
                  const isMilestone = w < 8;

                  els.push(
                    <g key={`task-${t.id}`} onMouseEnter={() => setHovered(t.id)} onMouseLeave={() => setHovered(null)} onClick={() => setSelected(t)} style={{ cursor: "pointer" }}>
                      {/* Row hover */}
                      <rect x={0} y={y} width={totalWidth} height={rowHeight} fill={isHovered || isSelected ? "#FAFAF7" : "transparent"} />
                      <line x1={0} y1={y + rowHeight} x2={totalWidth} y2={y + rowHeight} stroke="#F4F2EE" />

                      {/* Label */}
                      <text x={28} y={y + rowHeight / 2 + 4} fontSize="11" fill="#262626">
                        {t.tarea.length > 32 ? t.tarea.slice(0, 30) + "…" : t.tarea}
                      </text>
                      <text x={labelWidth - 12} y={y + rowHeight / 2 + 4} textAnchor="end" fontSize="10" fontFamily="monospace" fill="#737373">
                        {t.avance}%
                      </text>
                      <circle cx={14} cy={y + rowHeight / 2} r={3} fill={t.color} />

                      {/* Baseline (dashed outline) */}
                      {(view === "baseline" || view === "compare") && !isMilestone && (
                        <rect
                          x={bx1} y={y + rowHeight / 2 - 4}
                          width={bw} height={8}
                          fill="none" stroke="#A8A29E" strokeWidth="1.2" strokeDasharray="3,2" rx="2"
                          opacity="0.7"
                        />
                      )}

                      {/* Real bar */}
                      {(view === "real" || view === "compare") && (
                        isMilestone ? (
                          <g>
                            <polygon
                              points={`${x1 - 6},${y + rowHeight / 2} ${x1},${y + rowHeight / 2 - 6} ${x1 + 6},${y + rowHeight / 2} ${x1},${y + rowHeight / 2 + 6}`}
                              fill={t.color} stroke={t.color} strokeWidth="1.5"
                            />
                          </g>
                        ) : (
                          <g>
                            <rect
                              x={x1} y={y + (view === "compare" ? rowHeight / 2 - 1 : rowHeight / 2 - 6)}
                              width={w} height={view === "compare" ? 5 : 12}
                              fill={t.color} rx="2" opacity="0.95"
                            />
                            {/* Progress fill */}
                            <rect
                              x={x1} y={y + (view === "compare" ? rowHeight / 2 - 1 : rowHeight / 2 - 6)}
                              width={w * (t.avance / 100)} height={view === "compare" ? 5 : 12}
                              fill={t.color} rx="2" opacity="1"
                            />
                            {/* Darker overlay on done part */}
                            <rect
                              x={x1} y={y + (view === "compare" ? rowHeight / 2 - 1 : rowHeight / 2 - 6)}
                              width={w * (t.avance / 100)} height={view === "compare" ? 5 : 12}
                              fill="black" opacity="0.18" rx="2"
                            />
                          </g>
                        )
                      )}

                      {/* Delay indicator */}
                      {realDelay > 0 && view === "compare" && (
                        <rect
                          x={bx2} y={y + rowHeight / 2 + 5}
                          width={x2 - bx2} height={3}
                          fill="#E11D48" rx="1.5" opacity="0.8"
                        />
                      )}
                    </g>
                  );
                  y += rowHeight;
                });
              });
              return els;
            })()}

            {/* Tooltip */}
            {hovered && (() => {
              const t = tareas.find(x => x.id === hovered);
              if (!t) return null;
              const x1 = xFor(t.inicio);
              const realDelay = daysBetween(t.baselineFin, t.fin);
              const tipW = 240;
              const tipX = Math.min(x1, totalWidth - tipW - 10);
              return (
                <g pointerEvents="none">
                  <rect x={tipX} y={headerHeight + 8} width={tipW} height={92} rx={8} fill="#1F2937" opacity="0.97" />
                  <text x={tipX + 12} y={headerHeight + 28} fontSize="12" fill="white" fontWeight="600">{t.tarea}</text>
                  <text x={tipX + 12} y={headerHeight + 46} fontSize="10" fill="#D1D5DB" fontFamily="monospace">
                    Real: {dateStr(t.inicio)} → {dateStr(t.fin)}
                  </text>
                  <text x={tipX + 12} y={headerHeight + 60} fontSize="10" fill="#9CA3AF" fontFamily="monospace">
                    Base: {dateStr(t.baselineInicio)} → {dateStr(t.baselineFin)}
                  </text>
                  <text x={tipX + 12} y={headerHeight + 76} fontSize="10" fill="#9CA3AF" fontFamily="monospace">
                    Avance: {t.avance}% · {realDelay > 0 ? `+${realDelay}d atraso` : realDelay < 0 ? `${realDelay}d adelanto` : "en plan"}
                  </text>
                  <text x={tipX + 12} y={headerHeight + 90} fontSize="9" fill="#6B7280">Click para editar</text>
                </g>
              );
            })()}
          </svg>
        </div>
      </Card>

      {/* Task editor */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Editar actividad" width="max-w-md">
        {selected && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-stone-500">Actividad</label>
              <input
                value={selected.tarea}
                onChange={(e) => setSelected({ ...selected, tarea: e.target.value })}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-stone-500">Fase</label>
              <input
                value={selected.fase}
                onChange={(e) => setSelected({ ...selected, fase: e.target.value })}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500">Inicio (real)</label>
                <input type="date" value={selected.inicio} onChange={(e) => setSelected({ ...selected, inicio: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500">Fin (real)</label>
                <input type="date" value={selected.fin} onChange={(e) => setSelected({ ...selected, fin: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500">Baseline inicio</label>
                <input type="date" value={selected.baselineInicio} onChange={(e) => setSelected({ ...selected, baselineInicio: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500">Baseline fin</label>
                <input type="date" value={selected.baselineFin} onChange={(e) => setSelected({ ...selected, baselineFin: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-stone-500">% Avance</label>
              <input type="range" min={0} max={100} value={selected.avance} onChange={(e) => setSelected({ ...selected, avance: Number(e.target.value) })}
                className="mt-2 w-full accent-emerald-700" />
              <div className="mt-1 flex justify-between text-xs text-stone-500">
                <span>0%</span>
                <span className="font-mono text-stone-900">{selected.avance}%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
              <button onClick={() => setSelected(null)} className="rounded-lg border border-stone-200 px-3.5 py-2 text-sm text-stone-700 hover:bg-stone-50">Cancelar</button>
              <button
                onClick={() => { updateTarea(selected.id, selected); setSelected(null); }}
                className="rounded-lg bg-emerald-900 px-3.5 py-2 text-sm text-white hover:bg-emerald-800"
              >Guardar</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

/* ───────────────────────── EVM DASHBOARD ───────────────────────── */

const EVMScreen = ({ items, tareas, onInfo }) => {
  const today = new Date("2026-04-27");

  // Compute metrics
  const evm = useMemo(() => {
    const projectStart = new Date("2025-07-15");
    const projectEnd = new Date("2026-06-30");
    const totalDays = daysBetween(projectStart, projectEnd);
    const elapsedDays = Math.max(0, daysBetween(projectStart, today));
    const planPct = Math.min(100, (elapsedDays / totalDays) * 100);

    // BAC = Budget at Completion = total CAPEX
    const BAC = items.reduce((s, i) => s + i.total, 0);

    // EV = Earned Value = % work completed × BAC (use weighted avance from tareas)
    const totalActivWeight = tareas.length;
    const completedWeight = tareas.reduce((s, t) => s + t.avance / 100, 0);
    const physicalProgress = (completedWeight / totalActivWeight) * 100;
    const EV = BAC * (physicalProgress / 100);

    // PV = Planned Value (what should be done by today based on baseline)
    let plannedWeight = 0;
    tareas.forEach(t => {
      const bs = new Date(t.baselineInicio);
      const be = new Date(t.baselineFin);
      if (today >= be) plannedWeight += 1;
      else if (today >= bs) {
        const totalT = daysBetween(bs, be) || 1;
        const elapsedT = daysBetween(bs, today);
        plannedWeight += elapsedT / totalT;
      }
    });
    const plannedProgress = (plannedWeight / totalActivWeight) * 100;
    const PV = BAC * (plannedProgress / 100);

    // AC = Actual Cost = items entregados + pedidos (estimación)
    const AC = items.filter(i => i.estado === "Entregado").reduce((s, i) => s + i.total, 0) +
               items.filter(i => i.estado === "Pedido").reduce((s, i) => s + i.total * 0.85, 0);

    const CV = EV - AC;
    const SV = EV - PV;
    const CPI = AC > 0 ? EV / AC : 1;
    const SPI = PV > 0 ? EV / PV : 1;

    const EAC = CPI > 0 ? BAC / CPI : BAC;
    const ETC = EAC - AC;
    const VAC = BAC - EAC;

    return { BAC, EV, PV, AC, CV, SV, CPI, SPI, EAC, ETC, VAC, planPct, physicalProgress, plannedProgress };
  }, [items, tareas]);

  // S-curve data
  const curveData = useMemo(() => {
    const start = new Date("2025-07-01");
    const end = new Date("2026-07-01");
    const points = [];
    const cur = new Date(start);
    let cumPV = 0, cumEV = 0, cumAC = 0;
    const BAC = evm.BAC;
    while (cur <= end) {
      const ratio = daysBetween(start, cur) / daysBetween(start, end);
      // S-curve approximation
      const sCurve = (x) => 1 / (1 + Math.exp(-12 * (x - 0.5)));
      const pv = BAC * sCurve(ratio);
      const ev = cur <= today ? BAC * sCurve(ratio * 0.92) : null;
      const ac = cur <= today ? BAC * sCurve(ratio * 0.92) * 1.04 : null;
      points.push({
        month: cur.toLocaleDateString("es-CO", { month: "short", year: "2-digit" }),
        date: cur.getTime(),
        PV: Math.round(pv),
        EV: ev != null ? Math.round(ev) : null,
        AC: ac != null ? Math.round(ac) : null
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    return points;
  }, [evm.BAC]);

  const cpiColor = evm.CPI >= 1 ? "emerald" : evm.CPI >= 0.95 ? "amber" : "rose";
  const spiColor = evm.SPI >= 1 ? "emerald" : evm.SPI >= 0.95 ? "amber" : "rose";

  const TONE = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-200", chip: "bg-emerald-700" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-900",   border: "border-amber-200",   chip: "bg-amber-600" },
    rose:    { bg: "bg-rose-50",    text: "text-rose-900",    border: "border-rose-200",    chip: "bg-rose-600" }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <SectionHeader
        title="EVM · Earned Value Management"
        subtitle="Análisis de desempeño cruzando CAPEX y cronograma · al 27 abr 2026"
        onInfo={() => onInfo("evm-screen")}
      />

      {/* Headline metrics */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className={`p-5 ${TONE[cpiColor].bg} ${TONE[cpiColor].border}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-stone-500">CPI · Cost Performance</span>
            <InfoButton onClick={() => onInfo("cpi")} />
          </div>
          <div className={`mt-3 font-serif text-[42px] leading-none tabular-nums ${TONE[cpiColor].text}`}>
            {evm.CPI.toFixed(2)}
          </div>
          <div className={`mt-2 text-xs ${TONE[cpiColor].text} opacity-80`}>
            {evm.CPI >= 1 ? "Por debajo del presupuesto ✓" : evm.CPI >= 0.95 ? "Ligero sobrecosto" : "Sobrecosto significativo"}
          </div>
          <div className="mt-3 flex gap-1">
            {[0.85, 0.9, 0.95, 1, 1.05, 1.1].map((v, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${evm.CPI >= v ? TONE[cpiColor].chip : "bg-stone-200"}`} />
            ))}
          </div>
        </Card>

        <Card className={`p-5 ${TONE[spiColor].bg} ${TONE[spiColor].border}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-stone-500">SPI · Schedule Performance</span>
            <InfoButton onClick={() => onInfo("spi")} />
          </div>
          <div className={`mt-3 font-serif text-[42px] leading-none tabular-nums ${TONE[spiColor].text}`}>
            {evm.SPI.toFixed(2)}
          </div>
          <div className={`mt-2 text-xs ${TONE[spiColor].text} opacity-80`}>
            {evm.SPI >= 1 ? "En cronograma o adelantado ✓" : evm.SPI >= 0.95 ? "Ligero atraso" : "Atraso material"}
          </div>
          <div className="mt-3 flex gap-1">
            {[0.85, 0.9, 0.95, 1, 1.05, 1.1].map((v, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${evm.SPI >= v ? TONE[spiColor].chip : "bg-stone-200"}`} />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-stone-500">CV · Cost Variance</span>
            <InfoButton onClick={() => onInfo("cv")} />
          </div>
          <div className={`mt-3 font-serif text-[28px] leading-none tabular-nums ${evm.CV >= 0 ? "text-emerald-800" : "text-rose-800"}`}>
            {evm.CV >= 0 ? "+" : ""}{fmtCOPshort(evm.CV)}
          </div>
          <div className="mt-2 text-xs text-stone-500">
            {evm.CV >= 0 ? "Ahorro acumulado vs lo gastado" : "Sobrecosto vs valor ganado"}
          </div>
          <div className="mt-3 text-[11px] font-mono tabular-nums text-stone-500">
            EV {fmtCOPshort(evm.EV)} − AC {fmtCOPshort(evm.AC)}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-stone-500">SV · Schedule Variance</span>
            <InfoButton onClick={() => onInfo("sv")} />
          </div>
          <div className={`mt-3 font-serif text-[28px] leading-none tabular-nums ${evm.SV >= 0 ? "text-emerald-800" : "text-rose-800"}`}>
            {evm.SV >= 0 ? "+" : ""}{fmtCOPshort(evm.SV)}
          </div>
          <div className="mt-2 text-xs text-stone-500">
            {evm.SV >= 0 ? "Adelanto en valor vs plan" : "Trabajo no hecho vs lo planeado"}
          </div>
          <div className="mt-3 text-[11px] font-mono tabular-nums text-stone-500">
            EV {fmtCOPshort(evm.EV)} − PV {fmtCOPshort(evm.PV)}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* S-Curve */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-[18px] tracking-tight text-stone-900">Curva S · PV vs EV vs AC</h3>
              <p className="text-[11px] text-stone-500">Acumulado en COP a lo largo del proyecto</p>
            </div>
            <InfoButton onClick={() => onInfo("scurve")} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F3D2E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1F3D2E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F2EE" vertical={false} />
                <XAxis dataKey="month" stroke="#A8A29E" fontSize={10} tickLine={false} />
                <YAxis stroke="#A8A29E" fontSize={10} tickLine={false} tickFormatter={(v) => fmtCOPshort(v)} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E7E5E0", fontSize: 12 }}
                  formatter={(v) => fmtCOP(v)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="PV" name="Planned Value" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 3" fill="url(#pvGrad)" />
                <Area type="monotone" dataKey="EV" name="Earned Value" stroke="#1F3D2E" strokeWidth={2.5} fill="url(#evGrad)" />
                <Line type="monotone" dataKey="AC" name="Actual Cost" stroke="#C44536" strokeWidth={2} dot={false} />
                <ReferenceLine y={evm.BAC} stroke="#A8A29E" strokeDasharray="2 2" label={{ value: "BAC", position: "right", fontSize: 10, fill: "#737373" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Forecast panel */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-[18px] tracking-tight text-stone-900">Pronóstico</h3>
            <InfoButton onClick={() => onInfo("forecast")} />
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400">BAC · Budget at Completion</div>
              <div className="mt-1 font-mono text-xl tabular-nums text-stone-900">{fmtCOP(evm.BAC)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400">EAC · Estimate at Completion</div>
              <div className={`mt-1 font-mono text-xl tabular-nums ${evm.EAC > evm.BAC ? "text-rose-800" : "text-emerald-800"}`}>{fmtCOP(evm.EAC)}</div>
              <div className="text-[10px] text-stone-500">Pronóstico al cerrar = BAC ÷ CPI</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400">ETC · Estimate to Complete</div>
              <div className="mt-1 font-mono text-lg tabular-nums text-stone-900">{fmtCOP(evm.ETC)}</div>
              <div className="text-[10px] text-stone-500">Lo que falta gastar = EAC − AC</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400">VAC · Variance at Completion</div>
              <div className={`mt-1 font-mono text-lg tabular-nums ${evm.VAC >= 0 ? "text-emerald-800" : "text-rose-800"}`}>{evm.VAC >= 0 ? "+" : ""}{fmtCOP(evm.VAC)}</div>
              <div className="text-[10px] text-stone-500">Diferencia esperada al cierre</div>
            </div>
            <div className="border-t border-stone-100 pt-3">
              <div className="text-[11px] text-stone-600">
                Avance físico: <span className="font-mono tabular-nums text-stone-900">{evm.physicalProgress.toFixed(1)}%</span>
              </div>
              <div className="text-[11px] text-stone-600">
                Avance plan: <span className="font-mono tabular-nums text-stone-900">{evm.plannedProgress.toFixed(1)}%</span>
              </div>
              <div className="text-[11px] text-stone-600">
                Tiempo transcurrido: <span className="font-mono tabular-nums text-stone-900">{evm.planPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Diagnosis */}
      <Card className="mt-4 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-[18px] tracking-tight text-stone-900">Diagnóstico EVM</h3>
          <InfoButton onClick={() => onInfo("diagnosis")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-stone-50/40 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${TONE[cpiColor].chip}`} />
              <h4 className="text-sm font-medium text-stone-900">Costo</h4>
            </div>
            <p className="text-[13px] leading-relaxed text-stone-700">
              CPI = <span className="font-mono">{evm.CPI.toFixed(2)}</span>. {evm.CPI >= 1
                ? `El proyecto está ejecutando ${(evm.CPI*100-100).toFixed(1)}% por debajo del costo planeado para el avance actual. Disciplina de proveedores y comparativos efectivos.`
                : `Por cada peso ganado se han gastado ${(1/evm.CPI).toFixed(2)} pesos. Revisar adicionales y cotizaciones pendientes.`}
            </p>
            <p className="mt-2 text-[12px] text-stone-500">
              Recomendación: {evm.CPI >= 1
                ? "Mantener disciplina, documentar ahorros para cierre."
                : "Auditar partidas de obra civil y equipos; renegociar contratos abiertos."}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50/40 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${TONE[spiColor].chip}`} />
              <h4 className="text-sm font-medium text-stone-900">Tiempo</h4>
            </div>
            <p className="text-[13px] leading-relaxed text-stone-700">
              SPI = <span className="font-mono">{evm.SPI.toFixed(2)}</span>. {evm.SPI >= 1
                ? "El cronograma va parejo o adelantado a lo planeado."
                : `El equipo está ejecutando ${(100 - evm.SPI*100).toFixed(0)}% menos trabajo que lo planeado al día de hoy. Riesgo principal en pre-operativa.`}
            </p>
            <p className="mt-2 text-[12px] text-stone-500">
              Recomendación: {evm.SPI >= 1
                ? "Validar fecha de soft opening con dueño."
                : "Acelerar pruebas de stress y capacitación; evaluar mover soft opening 1 semana."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ───────────────────────── INFORMES SCREEN ───────────────────────── */

const TIPOS_INFORME = [
  {
    id: "comite",
    nombre: "Acta de comité semanal",
    descripcion: "6 bloques: avance, riesgos, decisiones, cambios, próximas semanas y compromisos",
    cadencia: "Semanal · viernes",
    icon: Calendar,
    tone: "emerald"
  },
  {
    id: "mensual",
    nombre: "Informe mensual EVM",
    descripcion: "CPI/SPI, curva S, pronóstico EAC y diagnóstico ejecutivo",
    cadencia: "Mensual · primer lunes",
    icon: TrendingUp,
    tone: "sky"
  },
  {
    id: "cierre",
    nombre: "Informe de cierre",
    descripcion: "Lecciones aprendidas, KPIs finales, handover y archivo formal",
    cadencia: "Único · al cerrar el proyecto",
    icon: CheckCircle2,
    tone: "amber"
  }
];

const InformesScreen = ({ project, items, tareas, onInfo }) => {
  const [tipo, setTipo] = useState("comite");
  const [generado, setGenerado] = useState(false);

  const stats = useMemo(() => {
    const total = items.reduce((s, i) => s + (i.total || 0), 0);
    const ent = items.filter(i => i.estado === "Entregado").reduce((s, i) => s + (i.total || 0), 0);
    const ped = items.filter(i => i.estado === "Pedido").reduce((s, i) => s + (i.total || 0), 0);
    const pen = items.filter(i => i.estado === "Pendiente" || i.estado === "Cotizado").reduce((s, i) => s + (i.total || 0), 0);
    const tareasComp = tareas.filter(t => t.avance >= 100).length;
    const tareasProg = tareas.filter(t => t.avance > 0 && t.avance < 100).length;
    const tareasAtraso = tareas.filter(t => {
      if (t.avance >= 100) return false;
      const today = new Date("2026-04-27");
      return new Date(t.baselineFin) < today;
    }).length;
    return { total, ent, ped, pen, tareasComp, tareasProg, tareasAtraso };
  }, [items, tareas]);

  const fechaHoy = new Date("2026-04-27").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  const fechaCorte = "27 de abril de 2026";

  const renderActaComite = () => (
    <div className="space-y-6">
      <header className="border-b border-stone-300 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Cretto · Expanding Brands</p>
            <h2 className="mt-1 font-serif text-[24px] tracking-tight text-stone-900">Acta de comité semanal</h2>
            <p className="mt-1 text-[13px] text-stone-600">{project.nombre} · Semana 39 · {fechaCorte}</p>
          </div>
          <div className="rounded-lg bg-emerald-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-50">
            Borrador
          </div>
        </div>
      </header>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">1 · Avance general</h3>
        <p className="text-[14px] leading-relaxed text-stone-800">
          Al corte del {fechaCorte}, el proyecto <span className="font-medium">{project.nombre}</span> presenta un avance físico
          del <span className="font-mono font-semibold">{project.avancePct}%</span> contra un avance esperado del
          {" "}<span className="font-mono font-semibold">{project.avanceTiempo}%</span>. El CAPEX comprometido (entregado + pedido)
          asciende a <span className="font-mono font-semibold">{fmtCOP(stats.ent + stats.ped)}</span> de
          un total de <span className="font-mono">{fmtCOP(stats.total)}</span>. Se han completado <span className="font-medium">{stats.tareasComp}</span> tareas,
          {stats.tareasProg} están en ejecución y <span className="font-medium">{stats.tareasAtraso}</span> presentan atraso vs línea base.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">2 · Riesgos activos</h3>
        <ul className="space-y-2 text-[14px] leading-relaxed text-stone-800">
          <li className="flex gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
            <span><span className="font-medium">Sistema de extracción:</span> permiso de cubierta atrasado 8 días vs baseline. Mitigación: gestión directa con copropiedad y radicación expedita.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            <span><span className="font-medium">Importaciones de menaje:</span> {items.filter(i => i.estado === "Pedido" && i.categoria.includes("Menaje")).length} ítems aún en tránsito. Riesgo medio para soft opening.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            <span><span className="font-medium">Pruebas de stress:</span> ventana de 5 días reducida por atraso aguas arriba; se requiere coordinación turno noche.</span>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">3 · Decisiones tomadas</h3>
        <ol className="space-y-2 text-[14px] leading-relaxed text-stone-800">
          <li><span className="font-mono text-[12px] text-stone-500">D-23</span> · Se aprueba cambio de proveedor de iluminación decorativa por incumplimiento de plazos. Diferencia: +$3.200.000.</li>
          <li><span className="font-mono text-[12px] text-stone-500">D-24</span> · Se mantiene fecha de soft opening al 16 de mayo, contingencia de 5 días útiles.</li>
          <li><span className="font-mono text-[12px] text-stone-500">D-25</span> · Se autoriza adicional de pintura por modificaciones de diseño en barra principal.</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">4 · Solicitudes de cambio</h3>
        <div className="overflow-hidden rounded-lg border border-stone-200">
          <table className="w-full text-[13px]">
            <thead className="bg-stone-100 text-[11px] uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">ID</th>
                <th className="px-3 py-2 text-left font-medium">Descripción</th>
                <th className="px-3 py-2 text-right font-medium">Impacto</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              <tr><td className="px-3 py-2 font-mono text-[12px]">CR-08</td><td className="px-3 py-2">Cambio madera barra principal</td><td className="px-3 py-2 text-right font-mono">+$8.450.000</td><td className="px-3 py-2"><Pill tone="amber">En revisión</Pill></td></tr>
              <tr><td className="px-3 py-2 font-mono text-[12px]">CR-09</td><td className="px-3 py-2">Adicional puntos eléctricos terraza</td><td className="px-3 py-2 text-right font-mono">+$2.100.000</td><td className="px-3 py-2"><Pill tone="green">Aprobado</Pill></td></tr>
              <tr><td className="px-3 py-2 font-mono text-[12px]">CR-10</td><td className="px-3 py-2">Re-trabajo enchape baño hombres</td><td className="px-3 py-2 text-right font-mono">+$1.850.000</td><td className="px-3 py-2"><Pill tone="green">Aprobado</Pill></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">5 · Próximas dos semanas</h3>
        <ul className="space-y-1.5 text-[14px] leading-relaxed text-stone-800">
          {tareas.filter(t => t.avance > 0 && t.avance < 100).slice(0, 5).map(t => (
            <li key={t.id} className="flex items-baseline gap-2">
              <span className="font-mono text-[12px] text-stone-500">{dateStr(t.fin)}</span>
              <span>· {t.tarea} <span className="text-stone-500">({t.avance}%)</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">6 · Compromisos</h3>
        <div className="grid gap-2 text-[14px] leading-relaxed text-stone-800 md:grid-cols-2">
          <div className="rounded-lg border border-stone-200 p-3">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">Cretto · PM</p>
            <p className="mt-1">Cierre licencia cubierta + reprogramar pruebas eléctricas — vence 03/may</p>
          </div>
          <div className="rounded-lg border border-stone-200 p-3">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">Cliente · DLK</p>
            <p className="mt-1">Aprobar CR-08 y firma de adicional barra — vence 30/abr</p>
          </div>
          <div className="rounded-lg border border-stone-200 p-3">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">Constructor</p>
            <p className="mt-1">Liberar punch list de acabados terraza — vence 02/may</p>
          </div>
          <div className="rounded-lg border border-stone-200 p-3">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">Operaciones</p>
            <p className="mt-1">Confirmar staffing soft opening + recibo menaje — vence 08/may</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-300 pt-4 text-[11px] text-stone-500">
        Documento generado por CrettoHub · {fechaHoy} · Próximo comité: viernes 02 de mayo, 9:00 a.m.
      </footer>
    </div>
  );

  const renderInformeMensual = () => {
    const BAC = stats.total;
    const EV = (project.avancePct / 100) * BAC;
    const PV = (project.avanceTiempo / 100) * BAC;
    const AC = stats.ent + stats.ped * 0.85;
    const CPI = AC > 0 ? EV / AC : 1;
    const SPI = PV > 0 ? EV / PV : 1;
    const EAC = CPI > 0 ? BAC / CPI : BAC;
    return (
      <div className="space-y-6">
        <header className="border-b border-stone-300 pb-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Cretto · Expanding Brands</p>
          <h2 className="mt-1 font-serif text-[24px] tracking-tight text-stone-900">Informe mensual de control</h2>
          <p className="mt-1 text-[13px] text-stone-600">{project.nombre} · Abril 2026 · Corte {fechaCorte}</p>
        </header>

        <section>
          <h3 className="mb-3 text-[11px] uppercase tracking-[0.18em] text-stone-500">Resumen ejecutivo</h3>
          <p className="text-[14px] leading-relaxed text-stone-800">
            El proyecto cierra abril con un CPI de <span className="font-mono font-semibold">{CPI.toFixed(2)}</span> y SPI de
            {" "}<span className="font-mono font-semibold">{SPI.toFixed(2)}</span>. La ejecución financiera muestra disciplina
            en costos pero presenta {SPI < 1 ? "un atraso" : "alineación"} con el cronograma. La pronóstico de costo al cierre (EAC) se
            estima en <span className="font-mono font-semibold">{fmtCOP(EAC)}</span>, una variación de
            {" "}<span className="font-mono font-semibold">{fmtCOP(EAC - BAC)}</span> sobre el presupuesto base (BAC).
          </p>
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          {[
            { label: "BAC", value: fmtCOPshort(BAC), sub: "Presupuesto base" },
            { label: "EV", value: fmtCOPshort(EV), sub: `${project.avancePct}% avance físico` },
            { label: "AC", value: fmtCOPshort(AC), sub: "Costo real" },
            { label: "EAC", value: fmtCOPshort(EAC), sub: "Pronóstico al cierre" }
          ].map(m => (
            <div key={m.label} className="rounded-lg border border-stone-200 bg-stone-50/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-stone-500">{m.label}</p>
              <p className="mt-1 font-mono text-[18px] text-stone-900">{m.value}</p>
              <p className="text-[11px] text-stone-500">{m.sub}</p>
            </div>
          ))}
        </section>

        <section>
          <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">Top categorías por valor</h3>
          <div className="space-y-1.5">
            {Object.entries(items.reduce((m, i) => {
              m[i.categoria] = (m[i.categoria] || 0) + (i.total || 0);
              return m;
            }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([cat, val]) => (
              <div key={cat} className="flex items-baseline justify-between text-[13px]">
                <span className="text-stone-700">{cat}</span>
                <span className="font-mono text-stone-900">{fmtCOP(val)}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">Hitos del mes</h3>
          <ul className="space-y-1.5 text-[14px] text-stone-800">
            <li>✓ Carpinterías y vidrios al 95% — leve atraso por importación de herrajes</li>
            <li>✓ Iluminación instalada al 100%</li>
            <li>◐ Equipos de cocina al 80% — pendiente comisionamiento de horno</li>
            <li>◐ Mobiliario al 85% — esperando última remesa de sillas</li>
            <li>○ Pruebas de stress eléctricas — iniciaron 25/abr</li>
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">Recomendaciones al sponsor</h3>
          <ol className="space-y-1.5 text-[14px] leading-relaxed text-stone-800">
            <li>1 · Aprobar adicional barra (CR-08) en próximos 3 días para no afectar cronograma de mobiliario.</li>
            <li>2 · Confirmar fecha definitiva de soft opening; recomendamos mantener 16 de mayo.</li>
            <li>3 · Validar plan de capacitación operativa con equipo de DLK antes del 5 de mayo.</li>
          </ol>
        </section>

        <footer className="border-t border-stone-300 pt-4 text-[11px] text-stone-500">
          Documento generado por CrettoHub · {fechaHoy} · Preparado por Jose · Aprobado por: ____________________
        </footer>
      </div>
    );
  };

  const renderInformeCierre = () => (
    <div className="space-y-6">
      <header className="border-b border-stone-300 pb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Cretto · Expanding Brands</p>
        <h2 className="mt-1 font-serif text-[24px] tracking-tight text-stone-900">Informe de cierre de proyecto</h2>
        <p className="mt-1 text-[13px] text-stone-600">{project.nombre} · Versión preliminar al {fechaCorte}</p>
      </header>

      <section>
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.18em] text-stone-500">Ficha del proyecto</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Cliente", project.cliente],
            ["Dirección", project.direccion],
            ["Área construida", `${project.area} m²`],
            ["Capacidad", `${project.puestos} puestos`],
            ["Inicio", dateStr(project.inicio)],
            ["Fin previsto", dateStr(project.fin)],
            ["CAPEX final", fmtCOP(project.capexTotal)],
            ["CAPEX por m²", fmtCOP(project.capexTotal / project.area)]
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-[12px] uppercase tracking-wider text-stone-500">{k}</span>
              <span className="font-mono text-[13px] text-stone-900">{v}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">KPIs finales</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-stone-50/40 p-3">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">CPI final</p>
            <p className="mt-1 font-mono text-[20px] text-emerald-700">1.04</p>
            <p className="text-[11px] text-stone-500">Por debajo del costo planeado</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50/40 p-3">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">SPI final</p>
            <p className="mt-1 font-mono text-[20px] text-amber-700">0.96</p>
            <p className="text-[11px] text-stone-500">5 días de retraso vs baseline</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50/40 p-3">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">Cumplimiento alcance</p>
            <p className="mt-1 font-mono text-[20px] text-emerald-700">100%</p>
            <p className="text-[11px] text-stone-500">Sin desviaciones funcionales</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">Lecciones aprendidas</h3>
        <div className="space-y-3 text-[14px] leading-relaxed text-stone-800">
          <div className="rounded-lg border-l-2 border-emerald-700 bg-emerald-50/30 px-4 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-800">Qué funcionó bien</p>
            <p className="mt-1">Comparativos por triplicado en obra civil generaron ahorro de 8% en partidas de acabados. Recomendación: replicar en próximos proyectos.</p>
          </div>
          <div className="rounded-lg border-l-2 border-emerald-700 bg-emerald-50/30 px-4 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-800">Qué funcionó bien</p>
            <p className="mt-1">Anticipo de importaciones de menaje 4 meses antes redujo riesgo cambiario y aseguró soft opening.</p>
          </div>
          <div className="rounded-lg border-l-2 border-amber-600 bg-amber-50/30 px-4 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-amber-800">Qué mejorar</p>
            <p className="mt-1">Permisos de cubierta deben gestionarse en paralelo con licencia inicial, no en construcción avanzada. Atraso causado: 8 días.</p>
          </div>
          <div className="rounded-lg border-l-2 border-amber-600 bg-amber-50/30 px-4 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-amber-800">Qué mejorar</p>
            <p className="mt-1">El proveedor de iluminación decorativa no cumplió plazos. Incluir multas por demora en próximos contratos.</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">Handover y archivo</h3>
        <ul className="space-y-1.5 text-[14px] text-stone-800">
          <li>✓ Manual de operación y mantenimiento entregado</li>
          <li>✓ Garantías de equipos archivadas (cocina, refrigeración, AVAC)</li>
          <li>✓ Planos as-built en formato digital</li>
          <li>✓ Punch list cerrado al 100%</li>
          <li>✓ Acta de aceptación firmada por cliente</li>
        </ul>
      </section>

      <footer className="border-t border-stone-300 pt-4 text-[11px] text-stone-500">
        Documento generado por CrettoHub · {fechaHoy} · PM responsable: Jose · Sponsor: DLK
      </footer>
    </div>
  );

  const tipoActivo = TIPOS_INFORME.find(t => t.id === tipo);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{project.nombre}</p>
          <h1 className="mt-1 font-serif text-[28px] tracking-tight text-stone-900">Generador de informes</h1>
          <p className="mt-1 text-[13px] text-stone-600">Plantillas PMI listas con datos del proyecto al día de hoy.</p>
        </div>
        <InfoButton onClick={() => onInfo("informes-screen")} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {TIPOS_INFORME.map(t => {
          const Icon = t.icon;
          const isActive = tipo === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTipo(t.id); setGenerado(false); }}
              className={`group rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isActive ? "border-emerald-900 bg-stone-50 shadow-sm" : "border-stone-200 bg-white"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive ? "bg-emerald-900 text-stone-50" : "bg-stone-100 text-stone-700"}`}>
                  <Icon size={16} />
                </div>
                {isActive && <CheckCircle2 size={16} className="text-emerald-900" />}
              </div>
              <h3 className="font-serif text-[15px] tracking-tight text-stone-900">{t.nombre}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-stone-600">{t.descripcion}</p>
              <p className="mt-3 text-[10px] uppercase tracking-wider text-stone-500">{t.cadencia}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/40 px-4 py-3">
        <div>
          <p className="text-[13px] text-stone-700">
            <span className="font-medium">{tipoActivo.nombre}</span> · datos al {fechaCorte}
          </p>
          <p className="text-[11px] text-stone-500">Plantilla auto-completada con {items.length} ítems CAPEX y {tareas.length} tareas del cronograma.</p>
        </div>
        <button
          onClick={() => setGenerado(true)}
          className="rounded-lg bg-emerald-900 px-4 py-2 text-[13px] font-medium text-stone-50 shadow-sm transition-all hover:bg-stone-900 hover:shadow-md"
        >
          {generado ? "Regenerar" : "Generar informe"}
        </button>
      </div>

      {generado && (
        <Card className="mt-4 p-8">
          <div className="mb-4 flex items-center justify-end gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-100">
              <Download size={13} /> PDF
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-100">
              <FileText size={13} /> Word
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-[12px] text-stone-700 hover:bg-stone-100">
              <Share2 size={13} /> Compartir
            </button>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-inner">
            {tipo === "comite" && renderActaComite()}
            {tipo === "mensual" && renderInformeMensual()}
            {tipo === "cierre" && renderInformeCierre()}
          </div>
        </Card>
      )}
    </div>
  );
};

/* ───────────────────────── DOCUMENTOS SCREEN ───────────────────────── */

const PMI_DELIVERABLES = [
  { id: "01", nombre: "Acta de constitución del proyecto", grupo: "Inicio", desc: "Project Charter — autoriza formalmente el proyecto y nombra al PM", estado: "Aprobado", fecha: "2025-07-30" },
  { id: "02", nombre: "Registro de interesados", grupo: "Inicio", desc: "Stakeholder Register — clientes, sponsor, autoridades, vecinos, proveedores clave", estado: "Aprobado", fecha: "2025-08-05" },
  { id: "03", nombre: "Plan para la dirección del proyecto", grupo: "Planeación", desc: "Documento maestro que integra alcance, tiempo, costo, calidad, riesgos y comunicaciones", estado: "Aprobado", fecha: "2025-08-15" },
  { id: "04", nombre: "Línea base de alcance (EDT/WBS)", grupo: "Planeación", desc: "Estructura de desglose de trabajo con paquetes hasta nivel 3 y diccionario WBS", estado: "Aprobado", fecha: "2025-08-20" },
  { id: "05", nombre: "Línea base de cronograma", grupo: "Planeación", desc: "Cronograma aprobado con dependencias, ruta crítica e hitos", estado: "Aprobado", fecha: "2025-08-25" },
  { id: "06", nombre: "Línea base de costos (CAPEX)", grupo: "Planeación", desc: "Presupuesto detallado por categoría con curva S de desembolsos", estado: "Aprobado", fecha: "2025-08-25" },
  { id: "07", nombre: "Registro de riesgos", grupo: "Planeación", desc: "Matriz de riesgos con probabilidad, impacto, dueño y plan de respuesta", estado: "Vigente", fecha: "2026-04-15" },
  { id: "08", nombre: "Solicitudes de cambio (control)", grupo: "Ejecución", desc: "Bitácora de cambios formales con impacto en alcance/tiempo/costo", estado: "Vigente", fecha: "2026-04-22" },
  { id: "09", nombre: "Actas de comité semanal", grupo: "Monitoreo", desc: "39 actas registradas — 6 bloques cada una", estado: "Vigente", fecha: "2026-04-26" },
  { id: "10", nombre: "Informes de desempeño", grupo: "Monitoreo", desc: "Informes mensuales con CPI/SPI, curva S y pronóstico EAC", estado: "Vigente", fecha: "2026-04-01" },
  { id: "11", nombre: "Informe de cierre y lecciones aprendidas", grupo: "Cierre", desc: "Cierre formal del proyecto, KPIs finales, handover y archivo", estado: "Pendiente", fecha: "—" }
];

const ESTADO_DOC_TONE = { Aprobado: "green", Vigente: "blue", Pendiente: "amber", Borrador: "default" };

const DocumentosScreen = ({ project, onInfo }) => {
  const [grupoFiltro, setGrupoFiltro] = useState("Todos");
  const grupos = ["Todos", "Inicio", "Planeación", "Ejecución", "Monitoreo", "Cierre"];
  const docs = grupoFiltro === "Todos" ? PMI_DELIVERABLES : PMI_DELIVERABLES.filter(d => d.grupo === grupoFiltro);
  const aprobados = PMI_DELIVERABLES.filter(d => d.estado === "Aprobado").length;
  const pendientes = PMI_DELIVERABLES.filter(d => d.estado === "Pendiente").length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{project.nombre}</p>
          <h1 className="mt-1 font-serif text-[28px] tracking-tight text-stone-900">Documentos del proyecto</h1>
          <p className="mt-1 text-[13px] text-stone-600">11 entregables PMI · 5 grupos de procesos · trazabilidad completa</p>
        </div>
        <InfoButton onClick={() => onInfo("documentos-screen")} />
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-[11px] uppercase tracking-wider text-stone-500">Total entregables</p>
          <p className="mt-1 font-mono text-[24px] tracking-tight text-stone-900">{PMI_DELIVERABLES.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] uppercase tracking-wider text-stone-500">Aprobados</p>
          <p className="mt-1 font-mono text-[24px] tracking-tight text-emerald-700">{aprobados}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] uppercase tracking-wider text-stone-500">Vigentes</p>
          <p className="mt-1 font-mono text-[24px] tracking-tight text-sky-700">{PMI_DELIVERABLES.filter(d => d.estado === "Vigente").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] uppercase tracking-wider text-stone-500">Pendientes</p>
          <p className="mt-1 font-mono text-[24px] tracking-tight text-amber-700">{pendientes}</p>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {grupos.map(g => (
          <button
            key={g}
            onClick={() => setGrupoFiltro(g)}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${
              grupoFiltro === g
                ? "border-emerald-900 bg-emerald-900 text-stone-50"
                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {docs.map(doc => (
          <Card key={doc.id} hover className="flex items-center gap-4 p-4 cursor-pointer">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 font-mono text-[12px] font-medium text-stone-700">
              {doc.id}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <h3 className="font-serif text-[15px] tracking-tight text-stone-900">{doc.nombre}</h3>
                <span className="text-[10px] uppercase tracking-wider text-stone-500">· {doc.grupo}</span>
              </div>
              <p className="mt-0.5 truncate text-[12px] text-stone-600">{doc.desc}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="font-mono text-[11px] text-stone-500">{doc.fecha}</p>
                <Pill tone={ESTADO_DOC_TONE[doc.estado]}>{doc.estado}</Pill>
              </div>
              <ChevronRight size={16} className="text-stone-400" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ───────────────────────── RIESGOS SCREEN ───────────────────────── */

const RIESGOS_BASE = [
  { id: "R-01", nombre: "Atraso licencia de cubierta", categoria: "Permisos", prob: 4, imp: 4, dueno: "PM Cretto", respuesta: "Mitigar", plan: "Gestión directa con copropiedad y radicación expedita", estado: "Activo" },
  { id: "R-02", nombre: "Demora importación menaje", categoria: "Suministro", prob: 3, imp: 4, dueno: "Compras", respuesta: "Mitigar", plan: "Pedido anticipado 4 meses + plan B con proveedor local", estado: "Activo" },
  { id: "R-03", nombre: "Sobrecosto tipo de cambio USD", categoria: "Financiero", prob: 3, imp: 3, dueno: "Sponsor", respuesta: "Transferir", plan: "Cobertura cambiaria sobre 60% del CAPEX dolarizado", estado: "Mitigado" },
  { id: "R-04", nombre: "Re-trabajo por cambio de diseño", categoria: "Alcance", prob: 2, imp: 3, dueno: "PM Cretto", respuesta: "Aceptar", plan: "Reserva de contingencia 7% del CAPEX", estado: "Activo" },
  { id: "R-05", nombre: "Falla en pruebas de stress", categoria: "Calidad", prob: 2, imp: 5, dueno: "Constructor", respuesta: "Mitigar", plan: "Ventana de 5 días + cronograma de remediación", estado: "Activo" },
  { id: "R-06", nombre: "Rotación staff operativo", categoria: "Recursos", prob: 3, imp: 2, dueno: "Operaciones", respuesta: "Mitigar", plan: "Capacitación cruzada y backup operativo", estado: "Monitoreo" },
  { id: "R-07", nombre: "Reclamación vecinos por ruido", categoria: "Stakeholders", prob: 2, imp: 3, dueno: "PM Cretto", respuesta: "Mitigar", plan: "Acta de vecindad + horarios diurnos", estado: "Cerrado" }
];

const CAMBIOS_BASE = [
  { id: "CR-08", titulo: "Cambio madera barra principal", impactoCosto: 8450000, impactoDias: 3, estado: "En revisión", solicitante: "DLK" },
  { id: "CR-09", titulo: "Adicional puntos eléctricos terraza", impactoCosto: 2100000, impactoDias: 2, estado: "Aprobado", solicitante: "Diseño" },
  { id: "CR-10", titulo: "Re-trabajo enchape baño hombres", impactoCosto: 1850000, impactoDias: 1, estado: "Aprobado", solicitante: "Constructor" },
  { id: "CR-11", titulo: "Iluminación decorativa adicional", impactoCosto: 3200000, impactoDias: 0, estado: "Aprobado", solicitante: "Diseño" }
];

const SCORE_TONE = (s) => s >= 12 ? "red" : s >= 8 ? "amber" : s >= 4 ? "blue" : "green";
const ESTADO_RIESGO_TONE = { Activo: "red", Monitoreo: "amber", Mitigado: "blue", Cerrado: "green" };
const ESTADO_CR_TONE = { Aprobado: "green", "En revisión": "amber", Rechazado: "red" };

const RiesgosScreen = ({ project, onInfo }) => {
  const [tab, setTab] = useState("riesgos");
  const expuestoTotal = CAMBIOS_BASE.reduce((s, c) => s + c.impactoCosto, 0);
  const aprobados = CAMBIOS_BASE.filter(c => c.estado === "Aprobado").reduce((s, c) => s + c.impactoCosto, 0);
  const enRevision = CAMBIOS_BASE.filter(c => c.estado === "En revisión").reduce((s, c) => s + c.impactoCosto, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{project.nombre}</p>
          <h1 className="mt-1 font-serif text-[28px] tracking-tight text-stone-900">Riesgos y cambios</h1>
          <p className="mt-1 text-[13px] text-stone-600">Registro vivo · matriz 5×5 · trazabilidad de control de cambios</p>
        </div>
        <InfoButton onClick={() => onInfo("riesgos-screen")} />
      </div>

      <div className="mb-6 flex gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1 w-fit">
        <button
          onClick={() => setTab("riesgos")}
          className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-all ${
            tab === "riesgos" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          Registro de riesgos · {RIESGOS_BASE.length}
        </button>
        <button
          onClick={() => setTab("cambios")}
          className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-all ${
            tab === "cambios" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          Solicitudes de cambio · {CAMBIOS_BASE.length}
        </button>
      </div>

      {tab === "riesgos" && (
        <>
          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <Card className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-stone-500">Activos</p>
              <p className="mt-1 font-mono text-[24px] text-rose-700">{RIESGOS_BASE.filter(r => r.estado === "Activo").length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-stone-500">Monitoreo</p>
              <p className="mt-1 font-mono text-[24px] text-amber-700">{RIESGOS_BASE.filter(r => r.estado === "Monitoreo").length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-stone-500">Mitigados</p>
              <p className="mt-1 font-mono text-[24px] text-sky-700">{RIESGOS_BASE.filter(r => r.estado === "Mitigado").length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-stone-500">Cerrados</p>
              <p className="mt-1 font-mono text-[24px] text-emerald-700">{RIESGOS_BASE.filter(r => r.estado === "Cerrado").length}</p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <table className="w-full text-[13px]">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Riesgo</th>
                  <th className="px-4 py-3 text-left font-medium">Categoría</th>
                  <th className="px-4 py-3 text-center font-medium">P</th>
                  <th className="px-4 py-3 text-center font-medium">I</th>
                  <th className="px-4 py-3 text-center font-medium">Score</th>
                  <th className="px-4 py-3 text-left font-medium">Dueño</th>
                  <th className="px-4 py-3 text-left font-medium">Respuesta</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {RIESGOS_BASE.map(r => {
                  const score = r.prob * r.imp;
                  return (
                    <tr key={r.id} className="hover:bg-stone-50/60">
                      <td className="px-4 py-3 font-mono text-[12px] text-stone-700">{r.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-900">{r.nombre}</p>
                        <p className="text-[11px] text-stone-500">{r.plan}</p>
                      </td>
                      <td className="px-4 py-3 text-stone-700">{r.categoria}</td>
                      <td className="px-4 py-3 text-center font-mono text-stone-700">{r.prob}</td>
                      <td className="px-4 py-3 text-center font-mono text-stone-700">{r.imp}</td>
                      <td className="px-4 py-3 text-center"><Pill tone={SCORE_TONE(score)}>{score}</Pill></td>
                      <td className="px-4 py-3 text-stone-700">{r.dueno}</td>
                      <td className="px-4 py-3 text-stone-700">{r.respuesta}</td>
                      <td className="px-4 py-3"><Pill tone={ESTADO_RIESGO_TONE[r.estado]}>{r.estado}</Pill></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === "cambios" && (
        <>
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <Card className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-stone-500">Total expuesto</p>
              <p className="mt-1 font-mono text-[20px] text-stone-900">{fmtCOP(expuestoTotal)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-stone-500">Aprobados</p>
              <p className="mt-1 font-mono text-[20px] text-emerald-700">{fmtCOP(aprobados)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-stone-500">En revisión</p>
              <p className="mt-1 font-mono text-[20px] text-amber-700">{fmtCOP(enRevision)}</p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <table className="w-full text-[13px]">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Solicitud</th>
                  <th className="px-4 py-3 text-left font-medium">Solicitante</th>
                  <th className="px-4 py-3 text-right font-medium">Impacto $</th>
                  <th className="px-4 py-3 text-right font-medium">Impacto días</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {CAMBIOS_BASE.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-mono text-[12px] text-stone-700">{c.id}</td>
                    <td className="px-4 py-3 font-medium text-stone-900">{c.titulo}</td>
                    <td className="px-4 py-3 text-stone-700">{c.solicitante}</td>
                    <td className="px-4 py-3 text-right font-mono text-stone-900">{fmtCOP(c.impactoCosto)}</td>
                    <td className="px-4 py-3 text-right font-mono text-stone-900">{c.impactoDias > 0 ? `+${c.impactoDias}` : "—"}</td>
                    <td className="px-4 py-3"><Pill tone={ESTADO_CR_TONE[c.estado]}>{c.estado}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
};

/* ───────────────────────── INFO MODAL CONTENT ───────────────────────── */

const INFO_CONTENT = {
  "home-projects": {
    titulo: "Proyectos activos",
    cuerpo: "Cada tarjeta muestra el estado de un proyecto vivo. Las dos barras de progreso comparan avance físico (CAPEX ejecutado contra base) y avance temporal (días transcurridos vs cronograma base). Si una barra va significativamente por debajo de la otra, hay un desbalance: tiempo perdido sin gastar, o gasto sin avance físico."
  },
  "home-summary": {
    titulo: "Resumen de portafolio",
    cuerpo: "Métricas agregadas de todos los proyectos en ejecución. El próximo soft opening te indica qué proyecto requiere atención inmediata; el % de avance promedio ponderado por CAPEX te da una vista de salud general del portafolio."
  },
  "project-progress": {
    titulo: "Progreso del proyecto",
    cuerpo: "Comparamos avance físico (% de CAPEX ejecutado o entregado) contra avance temporal (% de cronograma transcurrido). Idealmente ambos deben moverse parejos. Una diferencia mayor a 10 puntos indica desbalance que merece atención en comité semanal."
  },
  "project-tools": {
    titulo: "Herramientas del proyecto",
    cuerpo: "Cada herramienta corresponde a un dominio del PMBOK: Capex (gestión de costos), Cronograma (gestión del tiempo), EVM (control integrado), Documentos (gestión de la integración), Informes (comunicaciones), Riesgos (gestión de riesgos y cambios)."
  },
  "project-entregas": {
    titulo: "Próximas entregas",
    cuerpo: "Los próximos 5 ítems con fecha de entrega más cercana. Útil para anticipar coordinación logística con proveedores, recepciones en obra y pagos de remesas pendientes."
  },
  "capex-screen": {
    titulo: "Gestión de CAPEX",
    cuerpo: "Inventario completo de todos los ítems del proyecto. Filtra por categoría, ubicación o estado para enfocar tu trabajo. La tabla muestra cantidad, proveedor, valor unitario y total. Hacer clic en cualquier fila abre el editor con todos los campos."
  },
  "cronograma-screen": {
    titulo: "Cronograma del proyecto",
    cuerpo: "Diagrama de Gantt con vista real, baseline o comparativo. Las barras llenas muestran avance real; las líneas punteadas muestran la línea base aprobada. La línea vertical roja indica hoy. Hacer clic en cualquier barra abre el detalle de la tarea para registrar avance."
  },
  "cronograma-vistas": {
    titulo: "Vistas de cronograma",
    cuerpo: "Real: muestra solo el cronograma vigente con avance. Baseline: muestra solo la línea base aprobada al inicio del proyecto. Comparar: superpone ambos para ver desviaciones. Esta es la vista clásica de MS Project."
  },
  "evm-screen": {
    titulo: "Earned Value Management",
    cuerpo: "Análisis EVM integra costo y tiempo en una sola vista. Compara lo que planeaste hacer (PV), lo que realmente has logrado en valor (EV) y lo que has gastado (AC). Permite pronosticar costo y fecha final con base en la tendencia actual."
  },
  "cpi": {
    titulo: "Cost Performance Index (CPI)",
    cuerpo: "CPI = EV / AC. Mide eficiencia de costos. Valor 1.0 = neutral. Por encima de 1.0 = ejecutando por debajo del costo planeado (bueno). Por debajo de 1.0 = sobrecosto. Cretto considera CPI ≥ 0.95 aceptable, < 0.90 crítico."
  },
  "spi": {
    titulo: "Schedule Performance Index (SPI)",
    cuerpo: "SPI = EV / PV. Mide eficiencia de cronograma. Valor 1.0 = en tiempo. Por encima = adelantado. Por debajo = atrasado. SPI 0.85 significa 15% menos trabajo logrado del planeado al día de hoy."
  },
  "cv": {
    titulo: "Cost Variance (CV)",
    cuerpo: "CV = EV − AC. Diferencia entre lo logrado y lo gastado en pesos. Positivo = ahorro. Negativo = sobrecosto. Es la métrica más fácil de comunicar al sponsor en pesos colombianos."
  },
  "sv": {
    titulo: "Schedule Variance (SV)",
    cuerpo: "SV = EV − PV. Diferencia entre lo logrado y lo planeado al día de hoy, expresada en valor monetario. SV negativo significa que estás detrás del cronograma."
  },
  "scurve": {
    titulo: "Curva S",
    cuerpo: "Las tres líneas muestran: PV (Planned Value, lo que debías gastar al día de hoy), EV (Earned Value, valor del trabajo logrado) y AC (Actual Cost, lo realmente gastado). La separación entre ellas en cualquier punto cuenta la historia del proyecto."
  },
  "forecast": {
    titulo: "Pronóstico de cierre",
    cuerpo: "EAC (Estimate at Completion) = BAC / CPI. Proyecta el costo final asumiendo que la eficiencia actual se mantiene. ETC (Estimate to Complete) = trabajo restante. VAC (Variance at Completion) = BAC − EAC, qué tanto se desviará del presupuesto inicial."
  },
  "diagnosis": {
    titulo: "Diagnóstico EVM",
    cuerpo: "Combina CPI y SPI para dar un veredicto y acciones. Cretto recomienda revisar este diagnóstico al cierre de cada mes y ajustar la curva S si la varianza al cierre proyectada (VAC) supera el 5% del presupuesto."
  },
  "informes-screen": {
    titulo: "Generador de informes",
    cuerpo: "Tres plantillas listas con datos del proyecto al día de hoy. El acta de comité usa los 6 bloques estándar de Cretto. El informe mensual incluye CPI/SPI calculados con tu data. El informe de cierre se nutre del registro completo del proyecto."
  },
  "documentos-screen": {
    titulo: "Documentos PMI",
    cuerpo: "Los 11 entregables formales del PMBOK organizados por grupo de procesos: Inicio, Planeación, Ejecución, Monitoreo y Cierre. Mantener este registro vivo es clave para auditorías y para las lecciones aprendidas."
  },
  "riesgos-screen": {
    titulo: "Registro de riesgos y cambios",
    cuerpo: "Registro de riesgos: matriz 5×5 (probabilidad × impacto) con dueño y plan de respuesta. Solicitudes de cambio: bitácora formal de control de cambios con impacto en costo y plazo. Ambos se actualizan en comité semanal."
  }
};

/* ───────────────────────── MAIN APP ───────────────────────── */

function CrettoApp() {
  const [screen, setScreen] = useState("home");
  const [history, setHistory] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [items, setItems] = useState(() => COSETTE_81_DATA.items.map(i => ({ ...i })));
  const [tareas, setTareas] = useState(() => CRONOGRAMA_BASE.map(t => ({ ...t })));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [infoKey, setInfoKey] = useState(null);
  const [autoOpenNewItem, setAutoOpenNewItem] = useState(false);
  const [raciPayload, setRaciPayload] = useState(null);
  const [raciData, setRaciData] = useState(null); // { roles, matrix } del proyecto activo
  const [capexPartidas, setCapexPartidas] = useState([]); // compartido para EVM
  const [pagos, setPagos] = useState([]);
  const [stakeholders, setStakeholders] = useState([]); // fuente única para RACI, Bitácora, etc.
  const [stakeholderFocoId, setStakeholderFocoId] = useState(null); // para abrir la DB enfocada en un actor
  useEffect(() => {
    (async () => {
      try {
        const projId = (selectedProject?.id) || "default";
        const r = await window.storage.get(`crettohub:capex-edif:${projId}`);
        if (r && r.value) setCapexPartidas(JSON.parse(r.value));
        const r2 = await window.storage.get(`crettohub:pagos:${projId}`);
        if (r2 && r2.value) setPagos(JSON.parse(r2.value));
        const r3 = await window.storage.get(`crettohub:stakeholders:${projId}`);
        if (r3 && r3.value) setStakeholders(JSON.parse(r3.value));
      } catch {}
    })();
  }, [selectedProject?.id]);
  const pagosPorWbs = useMemo(() => acByWbs(pagos, { incluirCausados: false }), [pagos]);
  const pendientesAdderRef = useRef(null);
  const registerPendientesAdder = (fn) => { pendientesAdderRef.current = fn; };
  const addPendientes = (arr) => { if (pendientesAdderRef.current) pendientesAdderRef.current(arr); };

  // Cosette 81 — archivado: datos históricos derivados de los items
  const cosette81Archived = useMemo(() => {
    const total = items.reduce((s, i) => s + (i.total || 0), 0);
    const ent = items.filter(i => i.estado === "Entregado").reduce((s, i) => s + (i.total || 0), 0);
    const ped = items.filter(i => i.estado === "Pedido").reduce((s, i) => s + (i.total || 0), 0);
    const inicio = "2025-07-15";
    const fin = "2026-06-30";
    return {
      id: "cosette-81",
      nombre: "Cosette 81",
      cliente: "DLK",
      direccion: "Cra 15 # 81-32",
      area: 329,
      puestos: 110,
      capexTotal: total,
      capexEjecutado: ent + ped * 0.85,
      avancePct: 100,
      avanceTiempo: 100,
      estado: "Cerrado",
      inicio,
      fin,
      fase: "Operación",
      color: "#1F3D2E",
      softOpening: "2026-05-16"
    };
  }, [items]);

  // Casa 107 — edificio residencial · Casa Developers SAS
  const activeProject = useMemo(() => ({
    id: "casa-107",
    nombre: "Casa 107",
    tipoProyecto: "edificio_residencial",
    tipologia: "vivienda",
    estratoVis: "no-vis",
    cliente: "Casa Developers SAS",
    promotor: "Casa Developers SAS",
    desarrollo: "Casa 107",
    direccion: "Calle 107a # 11 - 28",
    ciudad: "Bogotá",
    usoSuelo: "",                 // [PENDIENTE: confirmar tratamiento POT]
    loteM2: 1000,
    area: 9483,                   // construida = vendible (5500) / 0.58
    areaConstruida: 9483,
    areaVendible: 5500,
    areaComunesM2: 3983,          // 42% = zonas comunes (9483 - 5500)
    pctVendibleConstruida: 58,    // ratio aplicado
    unidades: 47,                 // apartamentos
    unidadesViv: 47,
    unidadesCom: 0,
    parqueaderos: 0,              // [PENDIENTE: # de parqueaderos]
    pisos: 10,
    sotanos: 2,
    puestos: 47,                  // legacy compat

    // Equipo
    pm: "Jose Guillermo Duque",
    pmCretto: "Jose Guillermo Duque",
    gerenteProyectoPromotor: "Hector Gaviria",
    gerenteComercial: "Paola de Lima",
    comercializadora: "Paola de Lima",
    sponsors: [
      "Hector Gaviria",
      "Juan Diego Duque",
      "Juan Felipe Gaviria",
      "Alvaro Correa"
    ],
    sponsorContact: "",           // [PENDIENTE: email/tel del sponsor principal]
    sponsor: "Hector Gaviria",
    arquitectos: ["G Arquitectura", "MDV"],
    arquitecto: "G Arquitectura",
    diseñadorFachadas: "G Arquitectura",
    paisajismo: "G Arquitectura",
    ingenieroEstructural: "",     // [PENDIENTE]
    ingenieroSuelos: "",          // [PENDIENTE]
    ingenieroHidraulico: "",      // [PENDIENTE]
    ingenieroElectrico: "",       // [PENDIENTE]
    ingenieroGas: "",             // [PENDIENTE]
    ingenieroBioclimatico: "",    // [PENDIENTE]
    constructor: "Penta Ingenieros",
    interventor: "Alvaro Andrade",
    residenteObra: "",            // [PENDIENTE]
    curaduria: "",                // [PENDIENTE]

    // Estructura financiera
    modeloContrato: "Administración delegada",
    fiduciaria: "Alianza Fiduciaria",
    patrimonioAutonomo: "",       // [PENDIENTE: nombre del P.A.]
    bancoFinanciador: "Banco de Occidente",
    cupoCreditoConstructor: 0,    // [PENDIENTE]
    pctPreventas: 60,             // 60% de unidades preventas = punto de equilibrio
    unidadesPuntoEquilibrio: 28,  // 60% de 47 ≈ 28 apartamentos
    pctCuotaInicialPE: 40,        // 40% del valor del 60% en preventas debe estar recaudado como cuota inicial — CRÍTICO para condiciones de giro Alianza
    recursosPropios: 0,           // [PENDIENTE]

    // Fechas
    fechaContrato: "",                          // [PENDIENTE: firma Cretto ↔ promotor]
    fechaLicenciaEsperada: "2026-06-10",        // sale "la otra semana" (ref. 2026-06-03)
    fechaPuntoEquilibrio: "",                   // [PENDIENTE]
    fechaInicioObra: "2026-08-01",
    fechaEntregaObra: "2028-02-01",             // ≈ 18 meses obra gris desde 1-ago-2026
    fechaEscrituracionInicio: "",               // [PENDIENTE]
    fechaEntregaCopropiedad: "",                // [PENDIENTE]
    fechaCierre: "",                            // [PENDIENTE]

    // Financiero
    capexEstimado: 0,                // se calcula desde el módulo CAPEX edificación
    capexTotal: 0,
    capexEjecutado: 0,
    contingenciaPct: 10,
    honorariosCrettoPct: 0,          // 0.5% sobre VTV — fuera del CAPEX, no se suma aquí
    honorariosCrettoNota: "0,5% VTV (Ventas Totales por Vender) — fuera del CAPEX",
    precioVentaM2: 14500000,         // obra gris
    precioVentaM2Acabados: 16500000, // acabados gestionados por el proyecto

    // KPIs
    avancePct: 0,
    avanceTiempo: 0,
    estado: "Planificación",
    fase: "Licencias",               // licencia por salir
    inicio: "2026-08-01",
    fin: "2028-02-01",
    color: "#2C5E3F"
  }), []);

  // SECONDARY_PROJECT (Cosette 109) ya tiene estado: "Cerrado" → va al final
  const allProjects = useMemo(
    () => [activeProject, ...userProjects, cosette81Archived, SECONDARY_PROJECT],
    [activeProject, userProjects, cosette81Archived]
  );

  const handleWizardSubmit = (form) => {
    const capex = parseFloat(form.capexEstimado) || 0;
    const cont = capex * (form.contingenciaPct / 100);
    const total = capex + cont;
    const newProject = {
      id: `user-${Date.now()}`,
      tipoProyecto: form.tipoProyecto,
      nombre: form.nombre,
      cliente: form.cliente,
      marca: form.marca,
      direccion: form.direccion,
      ciudad: form.ciudad,
      area: parseInt(form.area) || 0,
      // 'puestos' se mantiene como nombre del campo para compatibilidad con UI
      // existente, pero ahora representa "unidades" (apartamentos / locales / puestos)
      puestos: parseInt(form.unidades) || 0,
      unidades: parseInt(form.unidades) || 0,
      pisos: parseInt(form.pisos) || 0,
      centroCosto: form.centroCosto,
      capexTotal: total,
      capexEjecutado: 0,
      avanceTiempo: 0,
      estado: "Planificación",
      fase: "Definición",
      pm: form.pmCretto,
      constructor: form.constructor,
      arquitectos: (form.arquitectos || []).filter(a => a && a.trim()),
      arquitecto: ((form.arquitectos || []).filter(a => a && a.trim())[0]) || "", // legacy compat
      ingenieroEstructural: form.ingenieroEstructural,
      ingenieroSuelos: form.ingenieroSuelos,
      ingenieroHidraulico: form.ingenieroHidraulico,
      ingenieroElectrico: form.ingenieroElectrico,
      interventor: form.interventor,
      gerenteComercial: form.gerenteComercial,
      residenteObra: form.residenteObra,
      sponsors: (form.sponsors || []).filter(s => s && s.trim()),
      sponsor: ((form.sponsors || []).filter(s => s && s.trim())[0]) || "", // legacy compat
      fechaContrato: form.fechaContrato,
      fechaInicioObra: form.fechaInicioObra,
      fechaEntrega: form.fechaEntrega,
      fechaCierre: form.fechaCierre,
      financiamiento: form.financiamiento,
      documentosPMI: form.documentos
    };
    setUserProjects(prev => [...prev, newProject]);
    // Preguntar a quién notificar por RACI sobre creación del proyecto
    setRaciPayload({
      tipo: "cambio-alcance",
      projectName: newProject.nombre,
      titulo: `Proyecto creado: ${newProject.nombre}`,
      contexto: `Promotor: ${newProject.cliente} · CAPEX bajo gerencia: $${Math.round(total).toLocaleString("es-CO").replace(/,/g, ".")}`,
      onSent: () => setRaciPayload(null)
    });
  };

  // Persistence — restore on mount, save on change
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const itemsResult = await window.storage.get("crettohub:items");
        if (mounted && itemsResult && itemsResult.value) {
          setItems(JSON.parse(itemsResult.value));
        }
      } catch {}
      try {
        const tareasResult = await window.storage.get("crettohub:tareas");
        if (mounted && tareasResult && tareasResult.value) {
          setTareas(JSON.parse(tareasResult.value));
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set("crettohub:items", JSON.stringify(items)).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [items]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.storage.set("crettohub:tareas", JSON.stringify(tareas)).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [tareas]);

  // Command palette keyboard shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navigateTo = (newScreen, project = null) => {
    setHistory(h => [...h, { screen, selectedProject }]);
    setScreen(newScreen);
    if (project) setSelectedProject(project);
  };

  const handleBack = () => {
    setHistory(h => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setScreen(last.screen);
      setSelectedProject(last.selectedProject);
      return h.slice(0, -1);
    });
  };

  const handleProjectSelect = (project) => navigateTo("project", project);

  const handleTool = (tool) => {
    if (tool === "capex") navigateTo("capex");
    else if (tool === "cronograma") navigateTo("cronograma");
    else if (tool === "evm") navigateTo("evm");
    else if (tool === "informes") navigateTo("informes");
    else if (tool === "documentos") navigateTo("documentos");
    else if (tool === "riesgos") navigateTo("riesgos");
    else if (tool === "procurement") navigateTo("procurement");
    else if (tool === "cron-proyecto") navigateTo("cron-proyecto");
    else if (tool === "repo-docs") navigateTo("repo-docs");
    else if (tool === "reuniones") navigateTo("reuniones");
    else if (tool === "pendientes") navigateTo("pendientes");
    else if (tool === "raci") navigateTo("raci");
    else if (tool === "bitacora") navigateTo("bitacora");
    else if (tool === "modelo-fin") navigateTo("modelo-fin");
    else if (tool === "capex-edif") navigateTo("capex-edif");
    else if (tool === "evm-capex") navigateTo("evm-capex");
    else if (tool === "pagos") navigateTo("pagos");
    else if (tool === "tesoreria") navigateTo("tesoreria");
    else if (tool === "info-interes") navigateTo("info-interes");
    else if (tool === "stakeholders") navigateTo("stakeholders");
  };

  const handleCommand = (cmdId) => {
    setPaletteOpen(false);
    setPaletteQuery("");
    switch (cmdId) {
      case "go-home": setScreen("home"); setHistory([]); break;
      case "go-casa107": handleProjectSelect(activeProject); break;
      case "go-cosette81": handleProjectSelect(cosette81Archived); break;
      case "go-cosette109": handleProjectSelect(SECONDARY_PROJECT); break;

      case "go-capex": setSelectedProject(activeProject); navigateTo("capex"); break;
      case "go-cronograma": setSelectedProject(activeProject); navigateTo("cronograma"); break;
      case "go-evm": setSelectedProject(activeProject); navigateTo("evm"); break;
      case "go-informes": setSelectedProject(activeProject); navigateTo("informes"); break;
      case "go-documentos": setSelectedProject(activeProject); navigateTo("documentos"); break;
      case "go-riesgos": setSelectedProject(activeProject); navigateTo("riesgos"); break;
      case "go-procurement": setSelectedProject(activeProject); navigateTo("procurement"); break;
      case "go-cron-proyecto": setSelectedProject(activeProject); navigateTo("cron-proyecto"); break;
      case "go-repo-docs": setSelectedProject(activeProject); navigateTo("repo-docs"); break;
      case "go-reuniones": setSelectedProject(activeProject); navigateTo("reuniones"); break;
      case "go-pendientes": setSelectedProject(activeProject); navigateTo("pendientes"); break;
      case "new-item":
        setSelectedProject(activeProject);
        setAutoOpenNewItem(true);
        navigateTo("capex");
        break;
      default: break;
    }
  };

  const breadcrumbs = useMemo(() => {
    const crumbs = [{ label: "Inicio", onClick: () => { setScreen("home"); setHistory([]); } }];
    if (selectedProject && screen !== "home") {
      crumbs.push({ label: selectedProject.nombre, onClick: () => navigateTo("project", selectedProject) });
    }
    if (screen === "capex") crumbs.push({ label: "CAPEX" });
    else if (screen === "cronograma") crumbs.push({ label: "Cronograma" });
    else if (screen === "evm") crumbs.push({ label: "EVM" });
    else if (screen === "informes") crumbs.push({ label: "Informes" });
    else if (screen === "documentos") crumbs.push({ label: "Documentos" });
    else if (screen === "riesgos") crumbs.push({ label: "Riesgos" });
    else if (screen === "procurement") crumbs.push({ label: "Procurement" });
    else if (screen === "cron-proyecto") crumbs.push({ label: "Cronograma de proyecto" });
    else if (screen === "repo-docs") crumbs.push({ label: "Repositorio documentos" });
    else if (screen === "reuniones") crumbs.push({ label: "Reuniones" });
    else if (screen === "pendientes") crumbs.push({ label: "Seguimiento de actividades" });
    else if (screen === "raci") crumbs.push({ label: "Matriz RACI" });
    else if (screen === "bitacora") crumbs.push({ label: "Bitácora inversionistas" });
    else if (screen === "modelo-fin") crumbs.push({ label: "Modelo financiero" });
    else if (screen === "capex-edif") crumbs.push({ label: "CAPEX edificación" });
    else if (screen === "evm-capex") crumbs.push({ label: "EVM CAPEX/Cronograma" });
    else if (screen === "pagos") crumbs.push({ label: "Pagos a proveedores" });
    else if (screen === "tesoreria") crumbs.push({ label: "Tesorería (CFO)" });
    else if (screen === "email-settings") crumbs.push({ label: "Configuración correo" });
    else if (screen === "info-interes") crumbs.push({ label: "Información de interés" });
    else if (screen === "stakeholders") crumbs.push({ label: "Base de stakeholders" });
    return crumbs;
  }, [screen, selectedProject]);

  const onNav = (key) => {
    if (key === "home") { setScreen("home"); setHistory([]); }
    else if (key === "all-projects") { handleProjectSelect(activeProject); }
    else if (key === "cron-proyecto") { setSelectedProject(activeProject); navigateTo("cron-proyecto"); }
    else if (key === "cron-construccion") { setSelectedProject(activeProject); navigateTo("cronograma"); }
    else if (key === "repo-docs") { setSelectedProject(activeProject); navigateTo("repo-docs"); }
    else if (key === "reuniones") { setSelectedProject(activeProject); navigateTo("reuniones"); }
    else if (key === "pendientes") { setSelectedProject(activeProject); navigateTo("pendientes"); }
    else if (key === "raci") { setSelectedProject(activeProject); navigateTo("raci"); }
    else if (key === "bitacora") { setSelectedProject(activeProject); navigateTo("bitacora"); }
    else if (key === "modelo-fin") { setSelectedProject(activeProject); navigateTo("modelo-fin"); }
    else if (key === "capex-edif") { setSelectedProject(activeProject); navigateTo("capex-edif"); }
    else if (key === "evm-capex") { setSelectedProject(activeProject); navigateTo("evm-capex"); }
    else if (key === "pagos") { setSelectedProject(activeProject); navigateTo("pagos"); }
    else if (key === "tesoreria") { setSelectedProject(activeProject); navigateTo("tesoreria"); }
    else if (key === "info-interes") { setSelectedProject(activeProject); navigateTo("info-interes"); }
    else if (key === "stakeholders") { setSelectedProject(activeProject); navigateTo("stakeholders"); }
    else if (key === "email-settings") { navigateTo("email-settings"); }
    else if (key === "global-evm") { setSelectedProject(activeProject); navigateTo("evm"); }
  };

  // Pre-computed entregas for project detail screen — pulls from data
  const entregas = useMemo(() => {
    return COSETTE_81_DATA.entregas || [];
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <FolderSetupBanner />
      <div>
        <TopBar
          onSearch={() => setPaletteOpen(true)}
          onBack={handleBack}
          canGoBack={history.length > 0}
          breadcrumbs={breadcrumbs}
        />

        <main>
          {screen === "home" && (
            <HomeScreen
              projects={allProjects}
              onSelect={handleProjectSelect}
              onNew={() => setWizardOpen(true)}
              onInfo={(k) => setInfoKey(k)}
            />
          )}
          {screen === "project" && selectedProject && (
            <ProjectDetailScreen
              project={selectedProject.id === "cosette-81" ? cosette81Archived : selectedProject}
              items={selectedProject.id === "cosette-81" ? items : []}
              entregas={selectedProject.id === "cosette-81" ? entregas : []}
              onTool={handleTool}
              onInfo={(k) => setInfoKey(k)}
            />
          )}
          {screen === "capex" && (
            <CapexScreen
              items={items}
              onItemsChange={setItems}
              onInfo={(k) => setInfoKey(k)}
              autoOpenNew={autoOpenNewItem}
            />
          )}
          {screen === "cronograma" && (
            <CronogramaProScreen
              tareas={tareas}
              onTareasChange={setTareas}
              onInfo={(k) => setInfoKey(k)}
            />
          )}
          {screen === "evm" && (
            <EVMScreen
              items={items}
              tareas={tareas}
              onInfo={(k) => setInfoKey(k)}
            />
          )}
          {screen === "informes" && (
            <InformesScreen
              project={selectedProject || activeProject}
              items={items}
              tareas={tareas}
              onInfo={(k) => setInfoKey(k)}
            />
          )}
          {screen === "documentos" && (
            <DocumentosScreen
              project={selectedProject || activeProject}
              onInfo={(k) => setInfoKey(k)}
            />
          )}
          {screen === "riesgos" && (
            <RiesgosScreen
              project={selectedProject || activeProject}
              onInfo={(k) => setInfoKey(k)}
            />
          )}
          {screen === "procurement" && (
            <ProcurementScreen
              project={selectedProject || activeProject}
            />
          )}
          {screen === "cron-proyecto" && (
            <CronogramaProyectoScreen
              project={selectedProject || activeProject}
            />
          )}
          {screen === "repo-docs" && (
            <RepositorioDocumentos
              project={selectedProject || activeProject}
              raciData={raciData}
              stakeholders={stakeholders}
              onEditStakeholder={(id) => { setStakeholderFocoId(id); navigateTo("stakeholders"); }}
            />
          )}
          {screen === "reuniones" && (
            <Reuniones
              project={selectedProject || activeProject}
              onAddPendientes={addPendientes}
              raciData={raciData}
              stakeholders={stakeholders}
              onEditStakeholder={(id) => { setStakeholderFocoId(id); navigateTo("stakeholders"); }}
            />
          )}
          {screen === "pendientes" && (
            <Pendientes
              project={selectedProject || activeProject}
              registerAdder={registerPendientesAdder}
              stakeholders={stakeholders}
              onAddStakeholders={(nuevos) => {
                /* Agrega varios stakeholders nuevos a la DB con auto-ID */
                setStakeholders(prev => {
                  const baseId = Math.max(0, ...prev.map(s => s.id)) + 1;
                  const conIds = nuevos.map((n, idx) => ({ ...n, id: baseId + idx, fechaCreacion: new Date().toISOString() }));
                  const proj = (selectedProject?.id) || "default";
                  /* Persistir directo en storage también para que la DB lo vea */
                  const all = [...prev, ...conIds];
                  window.storage.set(`crettohub:stakeholders:${proj}`, JSON.stringify(all)).catch(() => {});
                  return all;
                });
              }}
            />
          )}
          {screen === "raci" && (
            <RaciMatrix
              project={selectedProject || activeProject}
              onMatrixChange={setRaciData}
              stakeholders={stakeholders}
              onEditStakeholder={(id) => { setStakeholderFocoId(id); navigateTo("stakeholders"); }}
            />
          )}
          {screen === "bitacora" && (
            <BitacoraInversionistas
              project={selectedProject || activeProject}
              stakeholders={stakeholders}
              onEditStakeholder={(id) => { setStakeholderFocoId(id); navigateTo("stakeholders"); }}
            />
          )}
          {screen === "modelo-fin" && (
            <ModeloFinanciero
              project={selectedProject || activeProject}
              partidas={capexPartidas}
              tareas={tareas}
            />
          )}
          {screen === "capex-edif" && (
            <CapexEdificios
              project={selectedProject || activeProject}
              tareas={tareas}
              onPartidasChange={setCapexPartidas}
              pagosPorWbs={pagosPorWbs}
            />
          )}
          {screen === "evm-capex" && (
            <EvmCapexCronograma
              project={selectedProject || activeProject}
              partidas={capexPartidas.map(p => pagosPorWbs[p.wbs] != null ? { ...p, valores: { ...p.valores, ejecutado: pagosPorWbs[p.wbs] } } : p)}
              tareas={tareas}
            />
          )}
          {screen === "pagos" && (
            <PagosProveedores
              project={selectedProject || activeProject}
              onPagosChange={setPagos}
              stakeholders={stakeholders}
              onEditStakeholder={(id) => { setStakeholderFocoId(id); navigateTo("stakeholders"); }}
            />
          )}
          {screen === "tesoreria" && (
            <Tesoreria
              project={selectedProject || activeProject}
              partidas={capexPartidas}
              tareas={tareas}
              pagos={pagos}
            />
          )}
          {screen === "info-interes" && (
            <DiccionarioProcedimientos project={selectedProject || activeProject} />
          )}
          {screen === "stakeholders" && (
            <StakeholdersDB
              project={selectedProject || activeProject}
              onChange={setStakeholders}
              focusId={stakeholderFocoId}
              onFocusConsumed={() => setStakeholderFocoId(null)}
            />
          )}
          {screen === "email-settings" && <EmailSettings />}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => { setPaletteOpen(false); setPaletteQuery(""); }}
        onCommand={handleCommand}
        query={paletteQuery}
        setQuery={setPaletteQuery}
      />

      <Modal
        open={infoKey !== null}
        onClose={() => setInfoKey(null)}
        title={infoKey && INFO_CONTENT[infoKey] ? INFO_CONTENT[infoKey].titulo : ""}
      >
        {infoKey && INFO_CONTENT[infoKey] && (
          <p className="text-[14px] leading-relaxed text-stone-700">{INFO_CONTENT[infoKey].cuerpo}</p>
        )}
      </Modal>

      {wizardOpen && (
        <NewProjectWizard
          onClose={() => setWizardOpen(false)}
          onSubmit={handleWizardSubmit}
        />
      )}

      <RaciNotifyModal
        open={!!raciPayload}
        payload={raciPayload}
        raciData={raciData}
        onClose={() => setRaciPayload(null)}
      />
    </div>
  );
}

export default CrettoApp;
