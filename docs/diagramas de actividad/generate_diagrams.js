/**
 * Generador de Diagramas de Actividad con Swimlanes
 * Sistema SIMAP Digital — JAAR Antigravity
 * Usa node-canvas para generar PNG
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// ─── Configuración visual ─────────────────────────────────────────────────────
const BG         = '#FFFFFF';
const BORDER     = '#1E1E1E';
const HEADER_BG  = '#DCDCDC';
const TITLE_BG   = '#F0F0F0';
const LANE_DIV   = '#A0A0A0';
const BOX_FILL   = '#FFFFFF';
const BOX_BD     = '#1E1E1E';
const ARROW_CLR  = '#1E1E1E';
const TEXT_CLR   = '#000000';
const DEC_FILL   = '#FFFFFF';

const TITLE_H   = 46;
const HEADER_H  = 38;
const LANE_W    = 250;
const BOX_W     = 200;
const BOX_H     = 44;
const RADIUS    = 14;
const CIRCLE_R  = 14;
const V_GAP     = 26;
const FONT_SZ   = { title: 15, header: 13, box: 11, label: 9 };

const OUTPUT_DIR = __dirname;

// ─── Datos de los 23 diagramas ────────────────────────────────────────────────
const DIAGRAMS = [

/* ── CU-01: Inicio de Sesión ─────────────────────────────────────────────── */
{
  file: 'CU-01_Inicio_de_Sesion',
  title: 'CU-01: Inicio de Sesión',
  lanes: ['Usuario', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Abre la aplicación\ny ve pantalla Login' },
    { type:'action',   lane:0, label:'Ingresa usuario\ny contraseña' },
    { type:'action',   lane:0, label:'Presiona "Ingresar"' },
    { type:'action',   lane:1, label:'Valida credenciales\ncontra simap_usuarios' },
    { type:'decision', lane:1, label:'¿Credenciales\nválidas?' },
    { type:'action',   lane:1, label:'Guarda rol y usuario\nen localStorage' },
    { type:'action',   lane:1, label:'Redirige a vista\nsegún rol' },
    { type:'action',   lane:1, label:'Muestra mensaje\nde error' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,'Sí'],[6,7,''],[7,9,''],
    [5,8,'No'],[8,2,''],
  ]
},

/* ── CU-02: Registro de Nuevo Vecino ─────────────────────────────────────── */
{
  file: 'CU-02_Registro_de_Nuevo_Vecino',
  title: 'CU-02: Registro de Nuevo Vecino',
  lanes: ['Vecino', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Abre pantalla\nde registro' },
    { type:'action',   lane:0, label:'Ingresa nombre, casa,\nsector y contraseña' },
    { type:'action',   lane:0, label:'Presiona\n"Solicitar Acceso"' },
    { type:'action',   lane:1, label:'Valida que casa\nno esté duplicada' },
    { type:'decision', lane:1, label:'¿Casa\nexiste?' },
    { type:'action',   lane:1, label:'Crea registro con\nestado "pendiente"' },
    { type:'action',   lane:0, label:'Ve mensaje de\nenvío exitoso' },
    { type:'action',   lane:1, label:'Muestra aviso\nde casa duplicada' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,'No'],[6,7,''],[7,9,''],
    [5,8,'Sí'],[8,2,''],
  ]
},

/* ── CU-03: Aprobación / Rechazo de Vecino ───────────────────────────────── */
{
  file: 'CU-03_Aprobacion_Rechazo_Vecino',
  title: 'CU-03: Aprobación / Rechazo de Vecino por Admin',
  lanes: ['Admin', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Accede a /admin\nve solicitudes pendientes' },
    { type:'action',   lane:0, label:'Revisa nombre, casa\ny sector' },
    { type:'decision', lane:0, label:'¿Decisión?' },
    { type:'action',   lane:1, label:'Cambia estado\na "activo"' },
    { type:'action',   lane:1, label:'Cambia estado\na "rechazado"' },
    { type:'action',   lane:1, label:'Mueve de Pendientes\na Activos' },
    { type:'action',   lane:0, label:'Vecino puede\niniciar sesión' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],
    [3,4,'Aprobar'],[4,6,''],[6,7,''],[7,8,''],
    [3,5,'Rechazar'],[5,8,''],
  ]
},

/* ── CU-04: Registro de Jornal Comunitario ───────────────────────────────── */
{
  file: 'CU-04_Registro_Jornal_Comunitario',
  title: 'CU-04: Registro de Jornal Comunitario',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Accede a /jornales' },
    { type:'action',   lane:0, label:'Selecciona vecino,\ntarea y fecha' },
    { type:'decision', lane:0, label:'¿Asistió?' },
    { type:'action',   lane:0, label:'Ingresa horas\ntrabajadas' },
    { type:'action',   lane:1, label:'Aplica multa\nconfigurada' },
    { type:'action',   lane:1, label:'Guarda registro\nen simap_jornales' },
    { type:'action',   lane:1, label:'Otorga puntos\n(8 / 3 / 0 pts)' },
    { type:'action',   lane:1, label:'Muestra\nconfirmación' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],
    [3,4,'Sí'],[4,6,''],
    [3,5,'No'],[5,6,''],
    [6,7,''],[7,8,''],[8,9,''],
  ]
},

/* ── CU-05: Registro de Gasto / Egreso ──────────────────────────────────── */
{
  file: 'CU-05_Registro_Egreso',
  title: 'CU-05: Registro de Gasto / Egreso',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Accede a /gastos' },
    { type:'action',   lane:0, label:'Ingresa monto,\ndescripción y fecha' },
    { type:'action',   lane:0, label:'Presiona\n"Registrar Gasto"' },
    { type:'action',   lane:1, label:'Valida monto > 0\ny descripción' },
    { type:'decision', lane:1, label:'¿Datos\nválidos?' },
    { type:'action',   lane:1, label:'Guarda en\nsimap_gastos' },
    { type:'action',   lane:1, label:'Muestra\n"Gasto guardado"' },
    { type:'action',   lane:1, label:'Muestra error\nde validación' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,'Sí'],[6,7,''],[7,9,''],
    [5,8,'No'],[8,2,''],
  ]
},

/* ── CU-06: Pago Mensual Estándar ────────────────────────────────────────── */
{
  file: 'CU-06_Pago_Mensual_Estandar',
  title: 'CU-06: Pago Mensual Estándar',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Selecciona hogar\nen lista de cobros' },
    { type:'action',   lane:1, label:'Muestra info hogar\ny meses pendientes' },
    { type:'action',   lane:0, label:'Selecciona mes y\npresiona "Registrar"' },
    { type:'action',   lane:1, label:'Muestra monto\nB/.3.00 por defecto' },
    { type:'action',   lane:0, label:'Confirma monto\ny método de pago' },
    { type:'action',   lane:1, label:'Crea registro\nde pago' },
    { type:'action',   lane:1, label:'Actualiza libro\nmayor del hogar' },
    { type:'action',   lane:1, label:'Otorga 2 pts base\nal hogar' },
    { type:'action',   lane:1, label:'Muestra confirmación' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,''],[6,7,''],[7,8,''],[8,9,''],[9,10,''],
  ]
},

/* ── CU-07: Pago Parcial ─────────────────────────────────────────────────── */
{
  file: 'CU-07_Pago_Parcial',
  title: 'CU-07: Pago Parcial',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Selecciona hogar\ny mes pendiente' },
    { type:'action',   lane:1, label:'Muestra saldo\npendiente del mes' },
    { type:'action',   lane:0, label:'Ingresa monto\nparcial' },
    { type:'action',   lane:1, label:'Valida 0 < monto\n≤ saldo pendiente' },
    { type:'decision', lane:1, label:'¿Monto\nválido?' },
    { type:'action',   lane:1, label:'Registra pago\nparcial' },
    { type:'action',   lane:1, label:'Calcula saldo\nrestante' },
    { type:'decision', lane:1, label:'¿Saldo\ncompleto?' },
    { type:'action',   lane:1, label:'Marca mes\ncomo "pagado"' },
    { type:'action',   lane:1, label:'Marca mes\ncomo "parcial"' },
    { type:'action',   lane:1, label:'Muestra confirmación' },
    { type:'action',   lane:1, label:'Muestra error\nde monto' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,'Sí'],[6,7,''],[7,8,''],
    [8,9,'Sí'],[9,11,''],[11,13,''],
    [8,10,'No'],[10,11,''],
    [5,12,'No'],[12,3,''],
  ]
},

/* ── CU-08: Pago Anticipado ──────────────────────────────────────────────── */
{
  file: 'CU-08_Pago_Anticipado',
  title: 'CU-08: Pago Anticipado de Varios Meses',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Selecciona hogar\ne indica N meses' },
    { type:'action',   lane:1, label:'Calcula total:\nN × B/.3.00' },
    { type:'action',   lane:1, label:'Muestra desglose\nde meses a cubrir' },
    { type:'action',   lane:0, label:'Confirma pago\ntotal' },
    { type:'action',   lane:1, label:'Crea N registros\nde pago individuales' },
    { type:'action',   lane:1, label:'Otorga pts base\n(N × 2 pts)' },
    { type:'action',   lane:1, label:'Otorga pts bonus\n(meses extra × 10)' },
    { type:'action',   lane:1, label:'Muestra confirmación\ntotal' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,''],[6,7,''],[7,8,''],[8,9,''],
  ]
},

/* ── CU-09: Puesta al Día ────────────────────────────────────────────────── */
{
  file: 'CU-09_Puesta_al_Dia',
  title: 'CU-09: Puesta al Día',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Selecciona\nhogar moroso' },
    { type:'action',   lane:1, label:'Muestra detalle\nde deuda total' },
    { type:'action',   lane:0, label:'Selecciona\n"Puesta al Día"' },
    { type:'action',   lane:1, label:'Muestra resumen\ny total a liquidar' },
    { type:'action',   lane:0, label:'Confirma\npago total' },
    { type:'action',   lane:1, label:'Crea registros\npor cada mes' },
    { type:'action',   lane:1, label:'Cambia estado:\nmoroso → activo' },
    { type:'action',   lane:1, label:'Otorga pts base\ny bonus' },
    { type:'action',   lane:1, label:'Muestra confirmación' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,''],[6,7,''],[7,8,''],[8,9,''],[9,10,''],
  ]
},

/* ── CU-10: Pago Diario ──────────────────────────────────────────────────── */
{
  file: 'CU-10_Pago_Diario',
  title: 'CU-10: Pago Diario',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Selecciona hogar\ndel jornalero' },
    { type:'action',   lane:1, label:'Muestra modalidad\nDiario (B/.0.10/día)' },
    { type:'action',   lane:0, label:'Ingresa cantidad\nde días a pagar' },
    { type:'action',   lane:1, label:'Calcula monto:\ndías × B/.0.10' },
    { type:'action',   lane:0, label:'Confirma pago' },
    { type:'action',   lane:1, label:'Registra pago\ncon días cubiertos' },
    { type:'action',   lane:1, label:'Actualiza acumulado\ndel mes' },
    { type:'decision', lane:1, label:'¿Acumulado\n≥ B/.3.00?' },
    { type:'action',   lane:1, label:'Marca mes\ncomo "pagado"' },
    { type:'action',   lane:1, label:'Marca mes\ncomo "parcial"' },
    { type:'action',   lane:1, label:'Muestra confirmación' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,''],[6,7,''],[7,8,''],
    [8,9,'Sí'],[9,11,''],[11,12,''],
    [8,10,'No'],[10,11,''],
  ]
},

/* ── CU-11: Comisión Automática ──────────────────────────────────────────── */
{
  file: 'CU-11_Comision_Automatica',
  title: 'CU-11: Cobrador Registra Pago y Recibe Comisión',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Registra pago\nestándar B/.3.00' },
    { type:'action',   lane:0, label:'Confirma el pago' },
    { type:'action',   lane:1, label:'Calcula comisión\nautomática B/.1.00' },
    { type:'action',   lane:1, label:'Aplica split:\n60% dev / 40% cobrador' },
    { type:'action',   lane:1, label:'Crea registro de\ncomisión (atómico)' },
    { type:'decision', lane:1, label:'¿Transacción\nexitosa?' },
    { type:'action',   lane:1, label:'Confirma pago\ny comisión' },
    { type:'action',   lane:0, label:'Ve: "Comisión:\nB/.0.40"' },
    { type:'action',   lane:1, label:'Revierte todo\ny muestra error' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],[5,6,''],
    [6,7,'Sí'],[7,8,''],[8,10,''],
    [6,9,'No'],[9,10,''],
  ]
},

/* ── CU-12: Cobrador Consulta Ganancias ──────────────────────────────────── */
{
  file: 'CU-12_Cobrador_Consulta_Ganancias',
  title: 'CU-12: Cobrador Consulta sus Ganancias Acumuladas',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Abre /comisiones\ndesde el menú' },
    { type:'action',   lane:1, label:'Carga comisiones\ndel cobrador' },
    { type:'action',   lane:1, label:'Muestra panel:\ntotal, mes, promedio' },
    { type:'action',   lane:1, label:'Muestra tabla\ndesglose mensual' },
    { type:'action',   lane:0, label:'Filtra por\nrango de fechas' },
    { type:'action',   lane:1, label:'Actualiza\nvista filtrada' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,''],[6,7,''],
  ]
},

/* ── CU-13: Admin Configura Split ────────────────────────────────────────── */
{
  file: 'CU-13_Admin_Configura_Split',
  title: 'CU-13: Admin Configura Split de Comisiones',
  lanes: ['Admin', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Abre /puntos-admin\nve configuración actual' },
    { type:'action',   lane:0, label:'Modifica porcentajes\ndev / cobrador' },
    { type:'action',   lane:0, label:'Confirma cambio' },
    { type:'action',   lane:1, label:'Valida que\nsumen 100%' },
    { type:'decision', lane:1, label:'¿Suma\n= 100%?' },
    { type:'action',   lane:1, label:'Guarda nueva config\ncon timestamp' },
    { type:'action',   lane:1, label:'Registra en log\nde auditoría' },
    { type:'action',   lane:1, label:'Muestra confirmación' },
    { type:'action',   lane:1, label:'Muestra error:\n"Deben sumar 100%"' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,'Sí'],[6,7,''],[7,8,''],[8,10,''],
    [5,9,'No'],[9,2,''],
  ]
},

/* ── CU-14: Puntos por Pago Puntual ──────────────────────────────────────── */
{
  file: 'CU-14_Puntos_Pago_Puntual',
  title: 'CU-14: Vecino Acumula Puntos por Pago Puntual',
  lanes: ['Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Detecta pago\ncompleto registrado' },
    { type:'action',   lane:0, label:'Verifica fecha\ndel pago vs mes' },
    { type:'decision', lane:0, label:'¿Fecha ≤\ndía 15?' },
    { type:'action',   lane:0, label:'Otorga 2 pts base\n+ 5 pts puntualidad' },
    { type:'action',   lane:0, label:'Otorga solo\n2 pts base' },
    { type:'action',   lane:0, label:'Registra transacciones\nde puntos' },
    { type:'action',   lane:0, label:'Actualiza saldo\nde puntos del hogar' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],
    [3,4,'Sí'],[4,6,''],
    [3,5,'No'],[5,6,''],
    [6,7,''],[7,8,''],
  ]
},

/* ── CU-15: Puntos por Asistir a Jornal ──────────────────────────────────── */
{
  file: 'CU-15_Puntos_Asistir_Jornal',
  title: 'CU-15: Vecino Acumula Puntos por Asistir a Jornal',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Accede a sección\nde jornales' },
    { type:'action',   lane:0, label:'Selecciona jornal\ny busca hogar' },
    { type:'decision', lane:0, label:'¿Tipo de\nasistencia?' },
    { type:'action',   lane:1, label:'Registra asistencia\npersonal' },
    { type:'action',   lane:1, label:'Otorga 8 pts\n(jornal_personal)' },
    { type:'action',   lane:1, label:'Registra asistencia\nsustituto' },
    { type:'action',   lane:1, label:'Otorga 3 pts\n(jornal_sustituto)' },
    { type:'action',   lane:1, label:'Muestra confirmación' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],
    [3,4,'Personal'],[4,5,''],[5,8,''],
    [3,6,'Sustituto'],[6,7,''],[7,8,''],
    [8,9,''],
  ]
},

/* ── CU-16: Canje de Puntos por Descuento ────────────────────────────────── */
{
  file: 'CU-16_Canje_Puntos_Descuento',
  title: 'CU-16: Vecino Canjea Puntos por Descuento',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Selecciona hogar\npara pago mensual' },
    { type:'action',   lane:1, label:'Muestra saldo\nde puntos disponibles' },
    { type:'action',   lane:0, label:'Indica que vecino\ndesea usar puntos' },
    { type:'action',   lane:1, label:'Calcula descuento:\npuntos × B/.0.10' },
    { type:'action',   lane:1, label:'Aplica descuento\nal cobro' },
    { type:'action',   lane:0, label:'Confirma pago\nen efectivo reducido' },
    { type:'action',   lane:1, label:'Registra pago\ncompleto B/.3.00' },
    { type:'action',   lane:1, label:'Deduce puntos\ncanjeados del saldo' },
    { type:'action',   lane:1, label:'Calcula comisión\nsobre B/.3.00' },
    { type:'action',   lane:1, label:'Muestra confirmación' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,''],[6,7,''],[7,8,''],[8,9,''],[9,10,''],[10,11,''],
  ]
},

/* ── CU-17: Admin Configura Reglas de Puntos ─────────────────────────────── */
{
  file: 'CU-17_Admin_Reglas_Puntos',
  title: 'CU-17: Admin Configura Reglas de Puntos',
  lanes: ['Admin', 'Sistema'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Abre /puntos-admin\nsección reglas' },
    { type:'action',   lane:1, label:'Muestra config\nactual de puntos' },
    { type:'action',   lane:0, label:'Modifica valores\ny tasa de conversión' },
    { type:'action',   lane:0, label:'Confirma cambios' },
    { type:'action',   lane:1, label:'Valida valores > 0' },
    { type:'decision', lane:1, label:'¿Valores\nválidos?' },
    { type:'action',   lane:1, label:'Guarda config\ncon timestamp' },
    { type:'action',   lane:1, label:'Registra en log\nde auditoría' },
    { type:'action',   lane:1, label:'Muestra confirmación' },
    { type:'action',   lane:1, label:'Muestra error:\n"Valores deben ser > 0"' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],[5,6,''],
    [6,7,'Sí'],[7,8,''],[8,9,''],[9,11,''],
    [6,10,'No'],[10,3,''],
  ]
},

/* ── CU-18: Puntaje de Riesgo ────────────────────────────────────────────── */
{
  file: 'CU-18_Puntaje_Riesgo',
  title: 'CU-18: Cobrador Ve Puntaje de Riesgo de Cada Hogar',
  lanes: ['Cobrador', 'Sistema / IA'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Abre vista\nprincipal de cobros' },
    { type:'action',   lane:1, label:'Carga hogares\ncon datos actualizados' },
    { type:'action',   lane:1, label:'Muestra badge de\nriesgo (0-100) por color' },
    { type:'action',   lane:0, label:'Visualiza badges\ny prioriza cobros' },
    { type:'action',   lane:0, label:'Toca un badge\npara ver detalle' },
    { type:'action',   lane:1, label:'Muestra explicación\ndel puntaje' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],[5,6,''],[6,7,''],
  ]
},

/* ── CU-19: Ruta Inteligente ─────────────────────────────────────────────── */
{
  file: 'CU-19_Ruta_Inteligente',
  title: 'CU-19: Cobrador Activa "Ruta Inteligente"',
  lanes: ['Cobrador', 'Sistema / IA'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Abre vista de cobros\n(orden alfabético)' },
    { type:'action',   lane:0, label:'Presiona\n"Ruta Inteligente"' },
    { type:'action',   lane:1, label:'Activa algoritmo\nde priorización IA' },
    { type:'action',   lane:1, label:'Ordena por riesgo\ny sector geográfico' },
    { type:'action',   lane:1, label:'Añade razón breve\na cada tarjeta' },
    { type:'action',   lane:0, label:'Recorre lista\nen nuevo orden' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],[5,6,''],[6,7,''],
  ]
},

/* ── CU-20: Predicción de Morosidad ─────────────────────────────────────── */
{
  file: 'CU-20_Prediccion_Morosidad',
  title: 'CU-20: Sistema Predice Hogares en Riesgo de Morosidad',
  lanes: ['Sistema / IA', 'Cobrador'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Ejecuta análisis\nal inicio del mes' },
    { type:'action',   lane:0, label:'Analiza patrones:\nretrasos, tendencias' },
    { type:'action',   lane:0, label:'Identifica hogares\ncon alta probabilidad' },
    { type:'decision', lane:0, label:'¿Hogares\nen riesgo?' },
    { type:'action',   lane:0, label:'Genera alerta con\nnombre y probabilidad' },
    { type:'action',   lane:1, label:'Ve alerta en\npanel principal' },
    { type:'action',   lane:1, label:'Marca hogares para\nvisita proactiva' },
    { type:'action',   lane:0, label:'Muestra:\n"Sin hogares en riesgo"' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],
    [4,5,'Sí'],[5,6,''],[6,7,''],[7,9,''],
    [4,8,'No'],[8,9,''],
  ]
},

/* ── CU-21: Tablero de Métricas ──────────────────────────────────────────── */
{
  file: 'CU-21_Tablero_Metricas',
  title: 'CU-21: Admin Revisa Tablero de Métricas de Recaudo',
  lanes: ['Admin', 'Sistema / IA'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Abre el tablero\nde métricas' },
    { type:'action',   lane:1, label:'Calcula: tasa, día\npromedio, tendencia' },
    { type:'action',   lane:1, label:'Muestra desglose\npor sector' },
    { type:'action',   lane:1, label:'Muestra alertas\nde anomalías (IA)' },
    { type:'action',   lane:0, label:'Filtra por mes,\ntrimestre o año' },
    { type:'action',   lane:1, label:'Actualiza\nvista filtrada' },
    { type:'action',   lane:0, label:'Hace clic en sector\npara ver detalle' },
    { type:'action',   lane:1, label:'Muestra hogares\ndel sector' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,''],[6,7,''],[7,8,''],[8,9,''],
  ]
},

/* ── CU-22: Detección de Anomalías ──────────────────────────────────────── */
{
  file: 'CU-22_Deteccion_Anomalias',
  title: 'CU-22: Sistema Detecta Anomalía en Recaudo',
  lanes: ['Sistema / IA', 'Admin'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Ejecuta análisis\nde anomalías (diario)' },
    { type:'action',   lane:0, label:'Calcula tasa recaudo\npor sector' },
    { type:'action',   lane:0, label:'Aplica z-score\nvs promedio histórico' },
    { type:'decision', lane:0, label:'¿z-score\n> 2?' },
    { type:'action',   lane:0, label:'Genera alerta:\nsector y desviación' },
    { type:'action',   lane:1, label:'Ve alerta en\ntablero de métricas' },
    { type:'action',   lane:1, label:'Marca alerta:\n"investigada / resuelta"' },
    { type:'action',   lane:0, label:'Sin anomalías,\nno genera alerta' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],
    [4,5,'Sí'],[5,6,''],[6,7,''],[7,9,''],
    [4,8,'No'],[8,9,''],
  ]
},

/* ── CU-23: Estado de Riesgo para Cliente ────────────────────────────────── */
{
  file: 'CU-23_Estado_Riesgo_Cliente',
  title: 'CU-23: Cliente Ve su Estado de Riesgo',
  lanes: ['Cliente', 'Sistema / IA'],
  nodes: [
    { type:'start',    lane:0, label:'' },
    { type:'action',   lane:0, label:'Abre /historial\ncon sus credenciales' },
    { type:'action',   lane:1, label:'Carga historial y\npuntaje de riesgo' },
    { type:'action',   lane:1, label:'Traduce puntaje a\nmensaje amigable' },
    { type:'action',   lane:1, label:'Muestra mensaje\ne ícono por nivel' },
    { type:'action',   lane:1, label:'Muestra recomendaciones\npersonalizadas' },
    { type:'action',   lane:0, label:'Lee recomendaciones\ny toma acciones' },
    { type:'action',   lane:0, label:'Presiona "Consejos"\npara más info' },
    { type:'action',   lane:1, label:'Muestra tips de\nmejora de estado' },
    { type:'end',      lane:0, label:'' },
  ],
  edges:[
    [0,1,''],[1,2,''],[2,3,''],[3,4,''],[4,5,''],
    [5,6,''],[6,7,''],[7,8,''],[8,9,''],
  ]
},

]; // end DIAGRAMS

// ─── Layout engine ────────────────────────────────────────────────────────────

function computeLayout(diagram) {
  const { nodes, edges } = diagram;
  const outEdges = nodes.map(() => []);
  const inEdges  = nodes.map(() => []);
  for (const [s, d] of edges) {
    outEdges[s].push(d);
    inEdges[d].push(s);
  }

  const row = new Array(nodes.length).fill(-1);
  const starts = nodes.reduce((acc, n, i) => n.type === 'start' ? [...acc, i] : acc, []);
  const queue = [...starts];
  starts.forEach(s => { row[s] = 0; });
  const visited = new Set(starts);

  while (queue.length) {
    const cur = queue.shift();
    for (const nxt of outEdges[cur]) {
      if (row[nxt] < row[cur] + 1) row[nxt] = row[cur] + 1;
      if (!visited.has(nxt)) { visited.add(nxt); queue.push(nxt); }
    }
  }

  let maxRow = Math.max(...row.filter(r => r >= 0)) + 1;
  for (let i = 0; i < nodes.length; i++) {
    if (row[i] < 0) { row[i] = maxRow++; }
  }

  const positions = nodes.map((n, i) => ({
    cx: n.lane * LANE_W + LANE_W / 2,
    cy: row[i] * (BOX_H + V_GAP) + (BOX_H + V_GAP) / 2,
  }));
  return { positions, rows: row, maxRow };
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function roundedRect(ctx, x1, y1, x2, y2, r) {
  const w = x2 - x1, h = y2 - y1;
  ctx.beginPath();
  ctx.moveTo(x1 + r, y1);
  ctx.lineTo(x2 - r, y1);
  ctx.arcTo(x2, y1, x2, y1 + r, r);
  ctx.lineTo(x2, y2 - r);
  ctx.arcTo(x2, y2, x2 - r, y2, r);
  ctx.lineTo(x1 + r, y2);
  ctx.arcTo(x1, y2, x1, y2 - r, r);
  ctx.lineTo(x1, y1 + r);
  ctx.arcTo(x1, y1, x1 + r, y1, r);
  ctx.closePath();
}

function diamond(ctx, cx, cy, hw, hh) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
}

function arrowHead(ctx, x1, y1, x2, y2) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const hs = 10, ang = Math.PI / 6;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hs * Math.cos(angle - ang), y2 - hs * Math.sin(angle - ang));
  ctx.lineTo(x2 - hs * Math.cos(angle + ang), y2 - hs * Math.sin(angle + ang));
  ctx.closePath();
  ctx.fillStyle = ARROW_CLR;
  ctx.fill();
}

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = ARROW_CLR;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawArrow(ctx, x1, y1, x2, y2, label) {
  drawLine(ctx, x1, y1, x2, y2);
  arrowHead(ctx, x1, y1, x2, y2);
  if (label) {
    ctx.font = `${FONT_SZ.label}px Arial`;
    ctx.fillStyle = '#555';
    ctx.fillText(label, (x1 + x2) / 2 + 4, (y1 + y2) / 2 - 6);
  }
}

function wrapLines(text, maxChars = 22) {
  const paragraphs = text.split('\n');
  const result = [];
  for (const para of paragraphs) {
    if (para.length <= maxChars) { result.push(para); continue; }
    const words = para.split(' ');
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length <= maxChars) {
        cur = (cur + ' ' + w).trim();
      } else {
        if (cur) result.push(cur);
        cur = w;
      }
    }
    if (cur) result.push(cur);
  }
  return result;
}

function multilineText(ctx, text, cx, cy, fontSize) {
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = TEXT_CLR;
  const lines = wrapLines(text);
  const lh = fontSize + 3;
  const startY = cy - ((lines.length - 1) * lh) / 2;
  for (let i = 0; i < lines.length; i++) {
    const tw = ctx.measureText(lines[i]).width;
    ctx.fillText(lines[i], cx - tw / 2, startY + i * lh);
  }
}

// ─── Main renderer ────────────────────────────────────────────────────────────

function renderDiagram(diagram) {
  const { nodes, edges, lanes, title } = diagram;
  const nLanes = lanes.length;
  const { positions, rows, maxRow } = computeLayout(diagram);

  const totalW   = nLanes * LANE_W + 2;
  const contentH = maxRow * (BOX_H + V_GAP) + V_GAP + 20;
  const totalH   = TITLE_H + HEADER_H + contentH + 10;

  const canvas = createCanvas(totalW, totalH);
  const ctx    = canvas.getContext('2d');

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, totalW, totalH);

  // Outer border
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, totalW - 2, totalH - 2);

  // Title bar
  ctx.fillStyle = TITLE_BG;
  ctx.fillRect(0, 0, totalW, TITLE_H);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, totalW, TITLE_H);
  ctx.font = `bold ${FONT_SZ.title}px Arial`;
  ctx.fillStyle = TEXT_CLR;
  const tw = ctx.measureText(title).width;
  ctx.fillText(title, (totalW - tw) / 2, TITLE_H / 2 + FONT_SZ.title / 3);

  // Lane headers
  for (let i = 0; i < nLanes; i++) {
    const x0 = i * LANE_W;
    ctx.fillStyle = HEADER_BG;
    ctx.fillRect(x0, TITLE_H, LANE_W, HEADER_H);
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(x0, TITLE_H, LANE_W, HEADER_H);
    ctx.font = `bold ${FONT_SZ.header}px Arial`;
    ctx.fillStyle = TEXT_CLR;
    const lw = ctx.measureText(lanes[i]).width;
    ctx.fillText(lanes[i], x0 + (LANE_W - lw) / 2, TITLE_H + HEADER_H / 2 + FONT_SZ.header / 3);
  }

  // Lane dividers
  const contentY0 = TITLE_H + HEADER_H;
  ctx.strokeStyle = LANE_DIV;
  ctx.lineWidth = 1;
  for (let i = 1; i < nLanes; i++) {
    const x = i * LANE_W;
    ctx.beginPath(); ctx.moveTo(x, contentY0); ctx.lineTo(x, totalH); ctx.stroke();
  }

  const offsetY = contentY0 + V_GAP;
  const absPos  = positions.map(p => ({ cx: p.cx, cy: p.cy + offsetY }));

  // ── Draw edges ────────────────────────────────────────────────────────────
  ctx.strokeStyle = ARROW_CLR;
  ctx.lineWidth = 2;

  for (const [si, di, lbl] of edges) {
    const { cx: sx, cy: sy } = absPos[si];
    const { cx: dx, cy: dy } = absPos[di];
    const stype = nodes[si].type;
    const dtype = nodes[di].type;

    // Exit point
    let outX, outY;
    if (stype === 'start') {
      outX = sx; outY = sy + CIRCLE_R;
    } else if (stype === 'decision') {
      outX = sx; outY = dy > sy ? sy + BOX_H / 2 + 4 : sy;
    } else {
      outX = sx; outY = sy + BOX_H / 2;
    }

    // Entry point
    let inX, inY;
    if (dtype === 'end') {
      inX = dx; inY = dy - CIRCLE_R - 3;
    } else if (dtype === 'decision') {
      inX = dx; inY = dy - BOX_H / 2 - 4;
    } else {
      inX = dx; inY = dy - BOX_H / 2;
    }

    const crossLane = nodes[si].lane !== nodes[di].lane;

    if (crossLane) {
      // Route: go right/left to destination x, then down/up
      drawLine(ctx, outX, outY, inX, outY);
      drawArrow(ctx, inX, outY, inX, inY, lbl);
    } else if (inY < outY - 5) {
      // Loop back up — offset to the right
      const ox = outX + LANE_W / 2 - 20;
      drawLine(ctx, outX, outY, ox, outY);
      drawLine(ctx, ox, outY, ox, inY);
      drawArrow(ctx, ox, inY, inX, inY, lbl);
    } else {
      drawArrow(ctx, outX, outY, inX, inY, lbl);
    }
  }

  // ── Draw nodes ────────────────────────────────────────────────────────────
  for (let i = 0; i < nodes.length; i++) {
    const { cx, cy } = absPos[i];
    const { type, label = '' } = nodes[i];

    if (type === 'start') {
      ctx.beginPath();
      ctx.arc(cx, cy, CIRCLE_R, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();

    } else if (type === 'end') {
      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, CIRCLE_R + 4, 0, Math.PI * 2);
      ctx.fillStyle = BOX_FILL;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Inner solid
      ctx.beginPath();
      ctx.arc(cx, cy, CIRCLE_R, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();

    } else if (type === 'decision') {
      const hw = BOX_W / 2, hh = BOX_H / 2 + 4;
      diamond(ctx, cx, cy, hw, hh);
      ctx.fillStyle = DEC_FILL;
      ctx.fill();
      ctx.strokeStyle = BOX_BD;
      ctx.lineWidth = 2;
      ctx.stroke();
      multilineText(ctx, label, cx, cy, FONT_SZ.box);

    } else { // action
      const x1 = cx - BOX_W / 2, y1 = cy - BOX_H / 2;
      const x2 = cx + BOX_W / 2, y2 = cy + BOX_H / 2;
      roundedRect(ctx, x1, y1, x2, y2, RADIUS);
      ctx.fillStyle = BOX_FILL;
      ctx.fill();
      ctx.strokeStyle = BOX_BD;
      ctx.lineWidth = 2;
      ctx.stroke();
      multilineText(ctx, label, cx, cy, FONT_SZ.box);
    }
  }

  return canvas;
}

// ─── Entry point ──────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nGenerando ${DIAGRAMS.length} diagramas de actividad...\n`);
  let ok = 0, fail = 0;
  for (const d of DIAGRAMS) {
    try {
      const canvas = renderDiagram(d);
      const outPath = path.join(OUTPUT_DIR, d.file + '.png');
      const buf = canvas.toBuffer('image/png');
      fs.writeFileSync(outPath, buf);
      console.log(`  ✓ ${d.file}.png`);
      ok++;
    } catch (e) {
      console.error(`  ✗ Error en ${d.file}:`, e.message);
      fail++;
    }
  }
  console.log(`\n¡Listo! ${ok} diagramas generados${fail ? `, ${fail} con error` : ''}.`);
  console.log(`Carpeta: ${OUTPUT_DIR}`);
}

main();
