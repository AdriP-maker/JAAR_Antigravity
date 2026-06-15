/**
 * Constants for SIMAP Digital
 */

export const ROLES = {
  ADMIN: 'admin',
  COBRADOR: 'cobrador',
  MINSA: 'minsa',
  CLIENTE: 'cliente',
  DEV: 'dev',
};

export const ESTADOS = {
  ACTIVO: 'activo',
  PARCIAL: 'parcial',
  MOROSO: 'moroso',
  CORTE: 'corte',
};

export const ESTADO_LABELS = {
  activo: { text: '✅ Al Día', variant: 'success' },
  parcial: { text: '🟡 Parcial', variant: 'warning' },
  moroso: { text: '⚠️ Moroso', variant: 'warning' },
  corte: { text: '🔴 Corte', variant: 'danger' },
};

export const TIPOS_PAGO = {
  MENSUAL: 'mensual',
  DIARIO: 'diario',
  MULTI_MES: 'multi_mes',
  PARCIAL: 'parcial',
  ADELANTO: 'adelanto',
  PUESTA_AL_DIA: 'puesta_al_dia',
};

export const TIPO_PAGO_LABELS = {
  mensual: 'Cuota Mensual',
  diario: 'Pago Diario',
  multi_mes: 'Multi-Mes',
  parcial: 'Parcial',
  adelanto: 'Adelanto',
  puesta_al_dia: 'Puesta al Día',
};

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const MESES_CORTOS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

export const DEFAULT_CONFIG = {
  cuotaMensual: 3.00,
  permitirParciales: true,
  mesesGraciaCorte: 3,
};

export const SYSTEM_USERS = [
  { user: 'admin',    pass: 'admin123', rol: 'admin',    nombre: 'Administrador',   estado: 'activo' },
  { user: 'cobrador', pass: '1234',     rol: 'cobrador', nombre: 'Cobrador Demo',   estado: 'activo' },
  { user: 'minsa',    pass: '1234',     rol: 'minsa',    nombre: 'Inspector MINSA', estado: 'activo' },
  { user: 'cliente',  pass: '1234',     rol: 'cliente',  nombre: 'Cliente Demo',    estado: 'activo' },
  { user: 'dev',      pass: 'admin123', rol: 'dev',      nombre: 'Soporte Técnico', estado: 'activo' },
];

export const ROLE_HOME = {
  admin: '/admin',
  cobrador: '/cobros',
  minsa: '/reporte',
  cliente: '/historial',
  dev: '/admin', // Will show only Auditoría tab
};

export const DEMO_USERS = [
  { id: 1, nombre: 'Sanchez Maylene',   sector: 'Caballero Centro', pagadoEsteMes: false, mesesSinPagar: 0 },
  { id: 2, nombre: 'Familia Rodriguez', sector: 'Caballero Arriba', pagadoEsteMes: true,  mesesSinPagar: 0 },
  { id: 3, nombre: 'Los Alonsos',       sector: 'Caballero Abajo',  pagadoEsteMes: false, mesesSinPagar: 2 },
  { id: 4, nombre: 'Familia Moreno',    sector: 'Caballero Centro', pagadoEsteMes: false, mesesSinPagar: 3 },
];

export const DEMO_GASTOS = [
  { id: 101, monto: 126.93, desc: 'Compra de materiales e insumos de aseo',        fecha: '28/12/2023' },
  { id: 102, monto: 596.50, desc: 'Pago anual electricidad sistema (bomba)',        fecha: '06/01/2024' },
  { id: 103, monto: 80.84,  desc: 'Tubos PVC, llaves de paso y uniones',           fecha: '30/01/2024' },
  { id: 104, monto: 25.90,  desc: 'Confección de boletos y papelería',             fecha: '09/02/2024' },
  { id: 105, monto: 702.50, desc: 'Materiales y combustible revisión tuberías',     fecha: '25/03/2024' },
  { id: 106, monto: 545.50, desc: 'Cemento, pago día de trabajo local',            fecha: '22/04/2024' },
  { id: 107, monto: 65.09,  desc: 'Pegamento y gasolina (daño toma de agua)',      fecha: '11/07/2024' },
  { id: 108, monto: 92.25,  desc: 'Alimentación jornada de limpieza en toma',      fecha: '06/08/2024' },
  { id: 109, monto: 38.00,  desc: 'Tablón, tubos blancos PVC',                    fecha: '21/10/2024' },
  { id: 110, monto: 22.07,  desc: 'Jabón, cloro y meriendas',                     fecha: '26/11/2024' },
];
