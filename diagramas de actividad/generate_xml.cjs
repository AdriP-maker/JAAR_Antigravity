/**
 * Generador de Diagramas de Actividad en formato draw.io XML
 * Sistema SIMAP Digital — JAAR Antigravity
 * Compatible con diagrams.net / draw.io / Lucidchart / VS Code extension
 */

const fs   = require('fs');
const path = require('path');

const OUTPUT_DIR = __dirname;

// ─── Medidas del layout ───────────────────────────────────────────────────────
const LANE_W   = 240;   // ancho de cada swim-lane (más ancho para textos largos)
const ROW_H    = 100;   // altura de cada fila (más alto para flujo de flechas limpio)
const BOX_W    = 180;   // ancho de caja de acción
const BOX_H    = 46;    // alto de caja de acción
const DEC_W    = 110;   // ancho rombo de decisión
const DEC_H    = 60;    // alto rombo de decisión
const CIRCLE_D = 24;    // diámetro nodos inicio/fin
const HEADER_H = 36;    // altura cabecera del pool/lane
const PAD_TOP  = 30;    // padding superior dentro del lane


// ─── Datos de los 23 diagramas ────────────────────────────────────────────────
// nodes: { id, type:'start'|'action'|'decision'|'end', label, lane }
// edges: [srcId, dstId, label]
const DIAGRAMS = [

/* ── CU-01: Inicio de Sesión ─────────────────────────────────────────────── */
{
  file:  'CU-01_Inicio_de_Sesion',
  title: 'CU-01: Inicio de Sesión',
  lanes: ['Usuario', 'Sistema'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Abre la aplicación\ny ve pantalla Login' },
    { id:'n2', type:'action',   lane:0, label:'Ingresa usuario\ny contraseña' },
    { id:'n3', type:'action',   lane:0, label:'Presiona "Ingresar"' },
    { id:'n4', type:'action',   lane:1, label:'Valida credenciales\ncontra simap_usuarios' },
    { id:'n5', type:'decision', lane:1, label:'¿Credenciales\nválidas?' },
    { id:'n6', type:'action',   lane:1, label:'Guarda rol y usuario\nen localStorage' },
    { id:'n7', type:'action',   lane:1, label:'Redirige a vista\nsegún rol' },
    { id:'n8', type:'action',   lane:1, label:'Muestra mensaje\nde error' },
    { id:'n9', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6','Sí'],['n6','n7',''],['n7','n9',''],
    ['n5','n8','No'],['n8','n2',''],
  ]
},

/* ── CU-02: Registro de Nuevo Vecino ─────────────────────────────────────── */
{
  file:  'CU-02_Registro_de_Nuevo_Vecino',
  title: 'CU-02: Registro de Nuevo Vecino',
  lanes: ['Vecino', 'Sistema'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Abre pantalla\nde registro' },
    { id:'n2', type:'action',   lane:0, label:'Ingresa nombre, casa,\nsector y contraseña' },
    { id:'n3', type:'action',   lane:0, label:'Presiona\n"Solicitar Acceso"' },
    { id:'n4', type:'action',   lane:1, label:'Valida que casa\nno esté duplicada' },
    { id:'n5', type:'decision', lane:1, label:'¿Casa\nexiste?' },
    { id:'n6', type:'action',   lane:1, label:'Crea registro con\nestado "pendiente"' },
    { id:'n7', type:'action',   lane:0, label:'Ve mensaje de\nenvío exitoso' },
    { id:'n8', type:'action',   lane:1, label:'Muestra aviso\nde casa duplicada' },
    { id:'n9', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6','No'],['n6','n7',''],['n7','n9',''],
    ['n5','n8','Sí'],['n8','n2',''],
  ]
},

/* ── CU-03: Aprobación / Rechazo de Vecino ───────────────────────────────── */
{
  file:  'CU-03_Aprobacion_Rechazo_Vecino',
  title: 'CU-03: Aprobación / Rechazo de Vecino por Admin',
  lanes: ['Admin', 'Sistema'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Accede a /admin\nve solicitudes pendientes' },
    { id:'n2', type:'action',   lane:0, label:'Revisa nombre, casa\ny sector' },
    { id:'n3', type:'decision', lane:0, label:'¿Decisión?' },
    { id:'n4', type:'action',   lane:1, label:'Cambia estado\na "activo"' },
    { id:'n5', type:'action',   lane:1, label:'Cambia estado\na "rechazado"' },
    { id:'n6', type:'action',   lane:1, label:'Mueve de Pendientes\na Activos' },
    { id:'n7', type:'action',   lane:0, label:'Vecino puede\niniciar sesión' },
    { id:'n8', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],
    ['n3','n4','Aprobar'],['n4','n6',''],['n6','n7',''],['n7','n8',''],
    ['n3','n5','Rechazar'],['n5','n8',''],
  ]
},

/* ── CU-04: Registro de Jornal Comunitario ───────────────────────────────── */
{
  file:  'CU-04_Registro_Jornal_Comunitario',
  title: 'CU-04: Registro de Jornal Comunitario',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Accede a /jornales' },
    { id:'n2', type:'action',   lane:0, label:'Selecciona vecino,\ntarea y fecha' },
    { id:'n3', type:'decision', lane:0, label:'¿Asistió?' },
    { id:'n4', type:'action',   lane:0, label:'Ingresa horas\ntrabajadas' },
    { id:'n5', type:'action',   lane:1, label:'Aplica multa\nconfigurada' },
    { id:'n6', type:'action',   lane:1, label:'Guarda registro\nen simap_jornales' },
    { id:'n7', type:'action',   lane:1, label:'Otorga puntos\n(8 / 3 / 0 pts)' },
    { id:'n8', type:'action',   lane:1, label:'Muestra\nconfirmación' },
    { id:'n9', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],
    ['n3','n4','Sí'],['n4','n6',''],
    ['n3','n5','No'],['n5','n6',''],
    ['n6','n7',''],['n7','n8',''],['n8','n9',''],
  ]
},

/* ── CU-05: Registro de Gasto / Egreso ──────────────────────────────────── */
{
  file:  'CU-05_Registro_Egreso',
  title: 'CU-05: Registro de Gasto / Egreso',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Accede a /gastos' },
    { id:'n2', type:'action',   lane:0, label:'Ingresa monto,\ndescripción y fecha' },
    { id:'n3', type:'action',   lane:0, label:'Presiona\n"Registrar Gasto"' },
    { id:'n4', type:'action',   lane:1, label:'Valida monto > 0\ny descripción' },
    { id:'n5', type:'decision', lane:1, label:'¿Datos\nválidos?' },
    { id:'n6', type:'action',   lane:1, label:'Guarda en\nsimap_gastos' },
    { id:'n7', type:'action',   lane:1, label:'Muestra\n"Gasto guardado"' },
    { id:'n8', type:'action',   lane:1, label:'Muestra error\nde validación' },
    { id:'n9', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6','Sí'],['n6','n7',''],['n7','n9',''],
    ['n5','n8','No'],['n8','n2',''],
  ]
},

/* ── CU-06: Pago Mensual Estándar ────────────────────────────────────────── */
{
  file:  'CU-06_Pago_Mensual_Estandar',
  title: 'CU-06: Pago Mensual Estándar',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { id:'n0',  type:'start',    lane:0, label:'' },
    { id:'n1',  type:'action',   lane:0, label:'Selecciona hogar\nen lista de cobros' },
    { id:'n2',  type:'action',   lane:1, label:'Muestra info hogar\ny meses pendientes' },
    { id:'n3',  type:'action',   lane:0, label:'Selecciona mes y\npresiona "Registrar"' },
    { id:'n4',  type:'action',   lane:1, label:'Muestra monto\nB/.3.00 por defecto' },
    { id:'n5',  type:'action',   lane:0, label:'Confirma monto\ny método de pago' },
    { id:'n6',  type:'action',   lane:1, label:'Crea registro\nde pago' },
    { id:'n7',  type:'action',   lane:1, label:'Actualiza libro\nmayor del hogar' },
    { id:'n8',  type:'action',   lane:1, label:'Otorga 2 pts base\nal hogar' },
    { id:'n9',  type:'action',   lane:1, label:'Muestra confirmación' },
    { id:'n10', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6',''],['n6','n7',''],['n7','n8',''],['n8','n9',''],['n9','n10',''],
  ]
},

/* ── CU-07: Pago Parcial ─────────────────────────────────────────────────── */
{
  file:  'CU-07_Pago_Parcial',
  title: 'CU-07: Pago Parcial',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { id:'n0',  type:'start',    lane:0, label:'' },
    { id:'n1',  type:'action',   lane:0, label:'Selecciona hogar\ny mes pendiente' },
    { id:'n2',  type:'action',   lane:1, label:'Muestra saldo\npendiente del mes' },
    { id:'n3',  type:'action',   lane:0, label:'Ingresa monto\nparcial' },
    { id:'n4',  type:'action',   lane:1, label:'Valida 0 < monto\n≤ saldo pendiente' },
    { id:'n5',  type:'decision', lane:1, label:'¿Monto\nválido?' },
    { id:'n6',  type:'action',   lane:1, label:'Registra pago\nparcial' },
    { id:'n7',  type:'action',   lane:1, label:'Calcula saldo\nrestante' },
    { id:'n8',  type:'decision', lane:1, label:'¿Saldo\ncompleto?' },
    { id:'n9',  type:'action',   lane:1, label:'Marca mes\ncomo "pagado"' },
    { id:'n10', type:'action',   lane:1, label:'Marca mes\ncomo "parcial"' },
    { id:'n11', type:'action',   lane:1, label:'Muestra confirmación' },
    { id:'n12', type:'action',   lane:1, label:'Muestra error\nde monto' },
    { id:'n13', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6','Sí'],['n6','n7',''],['n7','n8',''],
    ['n8','n9','Sí'],['n9','n11',''],['n11','n13',''],
    ['n8','n10','No'],['n10','n11',''],
    ['n5','n12','No'],['n12','n3',''],
  ]
},

/* ── CU-08: Pago Anticipado ──────────────────────────────────────────────── */
{
  file:  'CU-08_Pago_Anticipado',
  title: 'CU-08: Pago Anticipado de Varios Meses',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Selecciona hogar\ne indica N meses' },
    { id:'n2', type:'action',   lane:1, label:'Calcula total:\nN × B/.3.00' },
    { id:'n3', type:'action',   lane:1, label:'Muestra desglose\nde meses a cubrir' },
    { id:'n4', type:'action',   lane:0, label:'Confirma pago\ntotal' },
    { id:'n5', type:'action',   lane:1, label:'Crea N registros\nde pago individuales' },
    { id:'n6', type:'action',   lane:1, label:'Otorga pts base\n(N × 2 pts)' },
    { id:'n7', type:'action',   lane:1, label:'Otorga pts bonus\n(meses extra × 10)' },
    { id:'n8', type:'action',   lane:1, label:'Muestra confirmación\ntotal' },
    { id:'n9', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6',''],['n6','n7',''],['n7','n8',''],['n8','n9',''],
  ]
},

/* ── CU-09: Puesta al Día ────────────────────────────────────────────────── */
{
  file:  'CU-09_Puesta_al_Dia',
  title: 'CU-09: Puesta al Día',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { id:'n0',  type:'start',    lane:0, label:'' },
    { id:'n1',  type:'action',   lane:0, label:'Selecciona\nhogar moroso' },
    { id:'n2',  type:'action',   lane:1, label:'Muestra detalle\nde deuda total' },
    { id:'n3',  type:'action',   lane:0, label:'Selecciona\n"Puesta al Día"' },
    { id:'n4',  type:'action',   lane:1, label:'Muestra resumen\ny total a liquidar' },
    { id:'n5',  type:'action',   lane:0, label:'Confirma\npago total' },
    { id:'n6',  type:'action',   lane:1, label:'Crea registros\npor cada mes' },
    { id:'n7',  type:'action',   lane:1, label:'Cambia estado:\nmoroso → activo' },
    { id:'n8',  type:'action',   lane:1, label:'Otorga pts base\ny bonus' },
    { id:'n9',  type:'action',   lane:1, label:'Muestra confirmación' },
    { id:'n10', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6',''],['n6','n7',''],['n7','n8',''],['n8','n9',''],['n9','n10',''],
  ]
},

/* ── CU-10: Pago Diario ──────────────────────────────────────────────────── */
{
  file:  'CU-10_Pago_Diario',
  title: 'CU-10: Pago Diario',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { id:'n0',  type:'start',    lane:0, label:'' },
    { id:'n1',  type:'action',   lane:0, label:'Selecciona hogar\ndel jornalero' },
    { id:'n2',  type:'action',   lane:1, label:'Muestra modalidad\nDiario (B/.0.10/día)' },
    { id:'n3',  type:'action',   lane:0, label:'Ingresa cantidad\nde días a pagar' },
    { id:'n4',  type:'action',   lane:1, label:'Calcula monto:\ndías × B/.0.10' },
    { id:'n5',  type:'action',   lane:0, label:'Confirma pago' },
    { id:'n6',  type:'action',   lane:1, label:'Registra pago\ncon días cubiertos' },
    { id:'n7',  type:'action',   lane:1, label:'Actualiza acumulado\ndel mes' },
    { id:'n8',  type:'decision', lane:1, label:'¿Acumulado\n≥ B/.3.00?' },
    { id:'n9',  type:'action',   lane:1, label:'Marca mes\ncomo "pagado"' },
    { id:'n10', type:'action',   lane:1, label:'Marca mes\ncomo "parcial"' },
    { id:'n11', type:'action',   lane:1, label:'Muestra confirmación' },
    { id:'n12', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6',''],['n6','n7',''],['n7','n8',''],
    ['n8','n9','Sí'],['n9','n11',''],['n11','n12',''],
    ['n8','n10','No'],['n10','n11',''],
  ]
},

/* ── CU-11: Comisión Automática ──────────────────────────────────────────── */
{
  file:  'CU-11_Comision_Automatica',
  title: 'CU-11: Cobrador Registra Pago y Recibe Comisión',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { id:'n0',  type:'start',    lane:0, label:'' },
    { id:'n1',  type:'action',   lane:0, label:'Registra pago\nestándar B/.3.00' },
    { id:'n2',  type:'action',   lane:0, label:'Confirma el pago' },
    { id:'n3',  type:'action',   lane:1, label:'Calcula comisión\nautomática B/.1.00' },
    { id:'n4',  type:'action',   lane:1, label:'Aplica split:\n60% dev / 40% cobrador' },
    { id:'n5',  type:'action',   lane:1, label:'Crea registro de\ncomisión (atómico)' },
    { id:'n6',  type:'decision', lane:1, label:'¿Transacción\nexitosa?' },
    { id:'n7',  type:'action',   lane:1, label:'Confirma pago\ny comisión' },
    { id:'n8',  type:'action',   lane:0, label:'Ve: "Comisión:\nB/.0.40"' },
    { id:'n9',  type:'action',   lane:1, label:'Revierte todo\ny muestra error' },
    { id:'n10', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],['n5','n6',''],
    ['n6','n7','Sí'],['n7','n8',''],['n8','n10',''],
    ['n6','n9','No'],['n9','n10',''],
  ]
},

/* ── CU-12: Cobrador Consulta Ganancias ──────────────────────────────────── */
{
  file:  'CU-12_Cobrador_Consulta_Ganancias',
  title: 'CU-12: Cobrador Consulta sus Ganancias Acumuladas',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Abre /comisiones\ndesde el menú' },
    { id:'n2', type:'action',   lane:1, label:'Carga comisiones\ndel cobrador' },
    { id:'n3', type:'action',   lane:1, label:'Muestra panel:\ntotal, mes, promedio' },
    { id:'n4', type:'action',   lane:1, label:'Muestra tabla\ndesglose mensual' },
    { id:'n5', type:'action',   lane:0, label:'Filtra por\nrango de fechas' },
    { id:'n6', type:'action',   lane:1, label:'Actualiza\nvista filtrada' },
    { id:'n7', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6',''],['n6','n7',''],
  ]
},

/* ── CU-13: Admin Configura Split ────────────────────────────────────────── */
{
  file:  'CU-13_Admin_Configura_Split',
  title: 'CU-13: Admin Configura Split de Comisiones',
  lanes: ['Admin', 'Sistema'],
  nodes: [
    { id:'n0',  type:'start',    lane:0, label:'' },
    { id:'n1',  type:'action',   lane:0, label:'Abre /puntos-admin\nve configuración actual' },
    { id:'n2',  type:'action',   lane:0, label:'Modifica porcentajes\ndev / cobrador' },
    { id:'n3',  type:'action',   lane:0, label:'Confirma cambio' },
    { id:'n4',  type:'action',   lane:1, label:'Valida que\nsumen 100%' },
    { id:'n5',  type:'decision', lane:1, label:'¿Suma\n= 100%?' },
    { id:'n6',  type:'action',   lane:1, label:'Guarda nueva config\ncon timestamp' },
    { id:'n7',  type:'action',   lane:1, label:'Registra en log\nde auditoría' },
    { id:'n8',  type:'action',   lane:1, label:'Muestra confirmación' },
    { id:'n9',  type:'action',   lane:1, label:'Muestra error:\n"Deben sumar 100%"' },
    { id:'n10', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6','Sí'],['n6','n7',''],['n7','n8',''],['n8','n10',''],
    ['n5','n9','No'],['n9','n2',''],
  ]
},

/* ── CU-14: Puntos por Pago Puntual ──────────────────────────────────────── */
{
  file:  'CU-14_Puntos_Pago_Puntual',
  title: 'CU-14: Vecino Acumula Puntos por Pago Puntual',
  lanes: ['Sistema'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Detecta pago\ncompleto registrado' },
    { id:'n2', type:'action',   lane:0, label:'Verifica fecha\ndel pago vs mes' },
    { id:'n3', type:'decision', lane:0, label:'¿Fecha ≤ día 15?' },
    { id:'n4', type:'action',   lane:0, label:'Otorga 2 pts base\n+ 5 pts puntualidad' },
    { id:'n5', type:'action',   lane:0, label:'Otorga solo\n2 pts base' },
    { id:'n6', type:'action',   lane:0, label:'Registra transacciones\nde puntos' },
    { id:'n7', type:'action',   lane:0, label:'Actualiza saldo\nde puntos del hogar' },
    { id:'n8', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],
    ['n3','n4','Sí'],['n4','n6',''],
    ['n3','n5','No'],['n5','n6',''],
    ['n6','n7',''],['n7','n8',''],
  ]
},

/* ── CU-15: Puntos por Asistir a Jornal ──────────────────────────────────── */
{
  file:  'CU-15_Puntos_Asistir_Jornal',
  title: 'CU-15: Vecino Acumula Puntos por Asistir a Jornal',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Accede a sección\nde jornales' },
    { id:'n2', type:'action',   lane:0, label:'Selecciona jornal\ny busca hogar' },
    { id:'n3', type:'decision', lane:0, label:'¿Tipo de\nasistencia?' },
    { id:'n4', type:'action',   lane:1, label:'Registra asistencia\npersonal' },
    { id:'n5', type:'action',   lane:1, label:'Otorga 8 pts\n(jornal_personal)' },
    { id:'n6', type:'action',   lane:1, label:'Registra asistencia\nsustituto' },
    { id:'n7', type:'action',   lane:1, label:'Otorga 3 pts\n(jornal_sustituto)' },
    { id:'n8', type:'action',   lane:1, label:'Muestra confirmación' },
    { id:'n9', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],
    ['n3','n4','Personal'],['n4','n5',''],['n5','n8',''],
    ['n3','n6','Sustituto'],['n6','n7',''],['n7','n8',''],
    ['n8','n9',''],
  ]
},

/* ── CU-16: Canje de Puntos por Descuento ────────────────────────────────── */
{
  file:  'CU-16_Canje_Puntos_Descuento',
  title: 'CU-16: Vecino Canjea Puntos por Descuento',
  lanes: ['Cobrador', 'Sistema'],
  nodes: [
    { id:'n0',  type:'start',    lane:0, label:'' },
    { id:'n1',  type:'action',   lane:0, label:'Selecciona hogar\npara pago mensual' },
    { id:'n2',  type:'action',   lane:1, label:'Muestra saldo\nde puntos disponibles' },
    { id:'n3',  type:'action',   lane:0, label:'Indica que vecino\ndesea usar puntos' },
    { id:'n4',  type:'action',   lane:1, label:'Calcula descuento:\npuntos × B/.0.10' },
    { id:'n5',  type:'action',   lane:1, label:'Aplica descuento\nal cobro' },
    { id:'n6',  type:'action',   lane:0, label:'Confirma pago\nen efectivo reducido' },
    { id:'n7',  type:'action',   lane:1, label:'Registra pago\ncompleto B/.3.00' },
    { id:'n8',  type:'action',   lane:1, label:'Deduce puntos\ncanjeados del saldo' },
    { id:'n9',  type:'action',   lane:1, label:'Calcula comisión\nsobre B/.3.00' },
    { id:'n10', type:'action',   lane:1, label:'Muestra confirmación' },
    { id:'n11', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6',''],['n6','n7',''],['n7','n8',''],['n8','n9',''],['n9','n10',''],['n10','n11',''],
  ]
},

/* ── CU-17: Admin Configura Reglas de Puntos ─────────────────────────────── */
{
  file:  'CU-17_Admin_Reglas_Puntos',
  title: 'CU-17: Admin Configura Reglas de Puntos',
  lanes: ['Admin', 'Sistema'],
  nodes: [
    { id:'n0',  type:'start',    lane:0, label:'' },
    { id:'n1',  type:'action',   lane:0, label:'Abre /puntos-admin\nsección reglas' },
    { id:'n2',  type:'action',   lane:1, label:'Muestra config\nactual de puntos' },
    { id:'n3',  type:'action',   lane:0, label:'Modifica valores\ny tasa de conversión' },
    { id:'n4',  type:'action',   lane:0, label:'Confirma cambios' },
    { id:'n5',  type:'action',   lane:1, label:'Valida valores > 0' },
    { id:'n6',  type:'decision', lane:1, label:'¿Valores\nválidos?' },
    { id:'n7',  type:'action',   lane:1, label:'Guarda config\ncon timestamp' },
    { id:'n8',  type:'action',   lane:1, label:'Registra en log\nde auditoría' },
    { id:'n9',  type:'action',   lane:1, label:'Muestra confirmación' },
    { id:'n10', type:'action',   lane:1, label:'Muestra error:\n"Valores deben ser > 0"' },
    { id:'n11', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],['n5','n6',''],
    ['n6','n7','Sí'],['n7','n8',''],['n8','n9',''],['n9','n11',''],
    ['n6','n10','No'],['n10','n3',''],
  ]
},

/* ── CU-18: Puntaje de Riesgo ────────────────────────────────────────────── */
{
  file:  'CU-18_Puntaje_Riesgo',
  title: 'CU-18: Cobrador Ve Puntaje de Riesgo de Cada Hogar',
  lanes: ['Cobrador', 'Sistema / IA'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Abre vista\nprincipal de cobros' },
    { id:'n2', type:'action',   lane:1, label:'Carga hogares\ncon datos actualizados' },
    { id:'n3', type:'action',   lane:1, label:'Muestra badge de\nriesgo (0-100) por color' },
    { id:'n4', type:'action',   lane:0, label:'Visualiza badges\ny prioriza cobros' },
    { id:'n5', type:'action',   lane:0, label:'Toca un badge\npara ver detalle' },
    { id:'n6', type:'action',   lane:1, label:'Muestra explicación\ndel puntaje' },
    { id:'n7', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],
    ['n4','n5',''],['n5','n6',''],['n6','n7',''],
  ]
},

/* ── CU-19: Ruta Inteligente ─────────────────────────────────────────────── */
{
  file:  'CU-19_Ruta_Inteligente',
  title: 'CU-19: Cobrador Activa "Ruta Inteligente"',
  lanes: ['Cobrador', 'Sistema / IA'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Abre vista de cobros\n(orden alfabético)' },
    { id:'n2', type:'action',   lane:0, label:'Presiona\n"Ruta Inteligente"' },
    { id:'n3', type:'action',   lane:1, label:'Activa algoritmo\nde priorización IA' },
    { id:'n4', type:'action',   lane:1, label:'Ordena por riesgo\ny sector geográfico' },
    { id:'n5', type:'action',   lane:1, label:'Añade razón breve\na cada tarjeta' },
    { id:'n6', type:'action',   lane:0, label:'Recorre lista\nen nuevo orden' },
    { id:'n7', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],
    ['n4','n5',''],['n5','n6',''],['n6','n7',''],
  ]
},

/* ── CU-20: Predicción de Morosidad ─────────────────────────────────────── */
{
  file:  'CU-20_Prediccion_Morosidad',
  title: 'CU-20: Sistema Predice Hogares en Riesgo de Morosidad',
  lanes: ['Sistema / IA', 'Cobrador'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Ejecuta análisis\nal inicio del mes' },
    { id:'n2', type:'action',   lane:0, label:'Analiza patrones:\nretrasos, tendencias' },
    { id:'n3', type:'action',   lane:0, label:'Identifica hogares\ncon alta probabilidad' },
    { id:'n4', type:'decision', lane:0, label:'¿Hogares\nen riesgo?' },
    { id:'n5', type:'action',   lane:0, label:'Genera alerta con\nnombre y probabilidad' },
    { id:'n6', type:'action',   lane:1, label:'Ve alerta en\npanel principal' },
    { id:'n7', type:'action',   lane:1, label:'Marca hogares para\nvisita proactiva' },
    { id:'n8', type:'action',   lane:0, label:'Muestra:\n"Sin hogares en riesgo"' },
    { id:'n9', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],
    ['n4','n5','Sí'],['n5','n6',''],['n6','n7',''],['n7','n9',''],
    ['n4','n8','No'],['n8','n9',''],
  ]
},

/* ── CU-21: Tablero de Métricas ──────────────────────────────────────────── */
{
  file:  'CU-21_Tablero_Metricas',
  title: 'CU-21: Admin Revisa Tablero de Métricas de Recaudo',
  lanes: ['Admin', 'Sistema / IA'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Abre el tablero\nde métricas' },
    { id:'n2', type:'action',   lane:1, label:'Calcula: tasa, día\npromedio, tendencia' },
    { id:'n3', type:'action',   lane:1, label:'Muestra desglose\npor sector' },
    { id:'n4', type:'action',   lane:1, label:'Muestra alertas\nde anomalías (IA)' },
    { id:'n5', type:'action',   lane:0, label:'Filtra por mes,\ntrimestre o año' },
    { id:'n6', type:'action',   lane:1, label:'Actualiza\nvista filtrada' },
    { id:'n7', type:'action',   lane:0, label:'Hace clic en sector\npara ver detalle' },
    { id:'n8', type:'action',   lane:1, label:'Muestra hogares\ndel sector' },
    { id:'n9', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6',''],['n6','n7',''],['n7','n8',''],['n8','n9',''],
  ]
},

/* ── CU-22: Detección de Anomalías ──────────────────────────────────────── */
{
  file:  'CU-22_Deteccion_Anomalias',
  title: 'CU-22: Sistema Detecta Anomalía en Recaudo',
  lanes: ['Sistema / IA', 'Admin'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Ejecuta análisis\nde anomalías (diario)' },
    { id:'n2', type:'action',   lane:0, label:'Calcula tasa recaudo\npor sector' },
    { id:'n3', type:'action',   lane:0, label:'Aplica z-score\nvs promedio histórico' },
    { id:'n4', type:'decision', lane:0, label:'¿z-score > 2?' },
    { id:'n5', type:'action',   lane:0, label:'Genera alerta:\nsector y desviación' },
    { id:'n6', type:'action',   lane:1, label:'Ve alerta en\ntablero de métricas' },
    { id:'n7', type:'action',   lane:1, label:'Marca alerta:\n"investigada / resuelta"' },
    { id:'n8', type:'action',   lane:0, label:'Sin anomalías,\nno genera alerta' },
    { id:'n9', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],
    ['n4','n5','Sí'],['n5','n6',''],['n6','n7',''],['n7','n9',''],
    ['n4','n8','No'],['n8','n9',''],
  ]
},

/* ── CU-23: Estado de Riesgo para Cliente ────────────────────────────────── */
{
  file:  'CU-23_Estado_Riesgo_Cliente',
  title: 'CU-23: Cliente Ve su Estado de Riesgo',
  lanes: ['Cliente', 'Sistema / IA'],
  nodes: [
    { id:'n0', type:'start',    lane:0, label:'' },
    { id:'n1', type:'action',   lane:0, label:'Abre /historial\ncon sus credenciales' },
    { id:'n2', type:'action',   lane:1, label:'Carga historial y\npuntaje de riesgo' },
    { id:'n3', type:'action',   lane:1, label:'Traduce puntaje a\nmensaje amigable' },
    { id:'n4', type:'action',   lane:1, label:'Muestra mensaje\ne ícono por nivel' },
    { id:'n5', type:'action',   lane:1, label:'Muestra recomendaciones\npersonalizadas' },
    { id:'n6', type:'action',   lane:0, label:'Lee recomendaciones\ny toma acciones' },
    { id:'n7', type:'action',   lane:0, label:'Presiona "Consejos"\npara más info' },
    { id:'n8', type:'action',   lane:1, label:'Muestra tips de\nmejora de estado' },
    { id:'n9', type:'end',      lane:0, label:'' },
  ],
  edges:[
    ['n0','n1',''],['n1','n2',''],['n2','n3',''],['n3','n4',''],['n4','n5',''],
    ['n5','n6',''],['n6','n7',''],['n7','n8',''],['n8','n9',''],
  ]
},

]; // end DIAGRAMS


// ─── Layout engine ────────────────────────────────────────────────────────────

function computeRows(nodes, edges) {
  const n = nodes.length;
  const out = Array.from({length:n}, ()=>[]);
  const idToIdx = {};
  nodes.forEach((nd, i) => { idToIdx[nd.id] = i; });

  for (const [s, d] of edges) {
    const si = idToIdx[s], di = idToIdx[d];
    if (si !== undefined && di !== undefined) out[si].push(di);
  }

  const row = new Array(n).fill(-1);
  const starts = nodes.reduce((acc, nd, i) => nd.type === 'start' ? [...acc, i] : acc, []);
  const queue = [...starts];
  starts.forEach(i => { row[i] = 0; });
  const visited = new Set(starts);

  while (queue.length) {
    const cur = queue.shift();
    for (const nxt of out[cur]) {
      if (row[nxt] < row[cur] + 1) row[nxt] = row[cur] + 1;
      if (!visited.has(nxt)) { visited.add(nxt); queue.push(nxt); }
    }
  }

  let maxR = Math.max(...row.filter(r=>r>=0)) + 1;
  for (let i = 0; i < n; i++) if (row[i] < 0) row[i] = maxR++;
  return row;
}

// ─── XML builder ──────────────────────────────────────────────────────────────

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/"/g,'&quot;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\n/g,'&#xa;');
}

function buildXML(diagram) {
  const { nodes, edges, lanes, title } = diagram;
  const nLanes = lanes.length;
  const rows   = computeRows(nodes, edges);
  const maxRow = Math.max(...rows) + 1;

  // Ancho del pool: 36 (cabecera lateral) + nLanes * LANE_W
  const poolW = 36 + nLanes * LANE_W;
  const poolH = HEADER_H + maxRow * ROW_H + PAD_TOP + 30;

  // Prefijo único de ID por diagrama
  const pfx = diagram.file.replace(/[^a-z0-9]/gi,'_');

  let idCounter = 10;
  const newId = () => `${pfx}_${idCounter++}`;

  // Mapeo ID nodo → ID celda draw.io
  const cellIds = {};

  // Posiciones de los nodos locales al carril
  const nodePos = {};
  for (let i = 0; i < nodes.length; i++) {
    const nd  = nodes[i];
    // Centrado horizontalmente dentro de su carril
    const lx = LANE_W / 2;
    // Posición Y local: cabecera del carril + padding + offset de fila
    const ly = HEADER_H + PAD_TOP + rows[i] * ROW_H + ROW_H / 2;
    nodePos[nd.id] = { lx, ly };
  }

  let cells = '';

  // ── Pool (contenedor principal con cabecera a la izquierda) ────────────────
  const poolId = `${pfx}_pool`;
  cells += `    <mxCell id="${poolId}" value="${esc(title)}" style="swimlane;html=1;horizontal=0;childLayout=stackLayout;horizontalStack=1;resizeParent=1;resizeParentMax=0;startSize=36;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=13;swimlaneBackground=#ffffff;collapsible=0;container=1;connectable=0;" vertex="1" parent="1">
      <mxGeometry x="20" y="20" width="${poolW}" height="${poolH}" as="geometry"/>
    </mxCell>\n`;

  // ── Swim-lanes (carriles de actores con cabecera arriba) ───────────────────
  const laneIds = [];
  for (let i = 0; i < nLanes; i++) {
    const lid = `${pfx}_lane${i}`;
    laneIds.push(lid);
    cells += `    <mxCell id="${lid}" value="${esc(lanes[i])}" style="swimlane;html=1;horizontal=1;startSize=${HEADER_H};fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=12;swimlaneBackground=#ffffff;collapsible=0;container=1;connectable=0;" vertex="1" parent="${poolId}">
      <mxGeometry x="${i * LANE_W}" y="0" width="${LANE_W}" height="${poolH}" as="geometry"/>
    </mxCell>\n`;
  }

  // ── Nodos ─────────────────────────────────────────────────────────────────
  for (let i = 0; i < nodes.length; i++) {
    const nd  = nodes[i];
    const cid = newId();
    cellIds[nd.id] = cid;
    const { lx, ly } = nodePos[nd.id];
    const parentLane = laneIds[nd.lane];

    if (nd.type === 'start') {
      // Círculo blanco vacío con borde negro
      cells += `    <mxCell id="${cid}" value="" style="ellipse;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;verticalLabelPosition=bottom;verticalAlign=top;" vertex="1" parent="${parentLane}">
      <mxGeometry x="${lx - CIRCLE_D/2}" y="${ly - CIRCLE_D/2}" width="${CIRCLE_D}" height="${CIRCLE_D}" as="geometry"/>
    </mxCell>\n`;

    } else if (nd.type === 'end') {
      // Nodo final UML clásico (círculo relleno en centro y anillo exterior)
      cells += `    <mxCell id="${cid}" value="" style="ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;strokeWidth=1.2;" vertex="1" parent="${parentLane}">
      <mxGeometry x="${lx - CIRCLE_D/2}" y="${ly - CIRCLE_D/2}" width="${CIRCLE_D}" height="${CIRCLE_D}" as="geometry"/>
    </mxCell>\n`;

    } else if (nd.type === 'decision') {
      // Rombo de decisión blanco con borde negro
      cells += `    <mxCell id="${cid}" value="${esc(nd.label)}" style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;align=center;verticalAlign=middle;fontSize=11;strokeWidth=1.2;" vertex="1" parent="${parentLane}">
      <mxGeometry x="${lx - DEC_W/2}" y="${ly - DEC_H/2}" width="${DEC_W}" height="${DEC_H}" as="geometry"/>
    </mxCell>\n`;

    } else { // action
      // Caja de acción redondeada blanca con borde negro
      cells += `    <mxCell id="${cid}" value="${esc(nd.label)}" style="rounded=1;arcSize=18;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;align=center;verticalAlign=middle;fontSize=11;strokeWidth=1.2;" vertex="1" parent="${parentLane}">
      <mxGeometry x="${lx - BOX_W/2}" y="${ly - BOX_H/2}" width="${BOX_W}" height="${BOX_H}" as="geometry"/>
    </mxCell>\n`;
    }
  }

  // ── Conectores (Edges) ────────────────────────────────────────────────────
  for (const [srcId, dstId, lbl] of edges) {
    const eid    = newId();
    const srcCid = cellIds[srcId];
    const dstCid = cellIds[dstId];
    if (!srcCid || !dstCid) continue;

    const srcNode = nodes.find(n => n.id === srcId);
    const dstNode = nodes.find(n => n.id === dstId);
    const crossLane = srcNode.lane !== dstNode.lane;

    let edgeStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;strokeColor=#000000;strokeWidth=1.2;';

    const srcIdx = nodes.findIndex(n => n.id === srcId);
    const dstIdx = nodes.findIndex(n => n.id === dstId);
    const srcRow = rows[srcIdx];
    const dstRow = rows[dstIdx];

    if (dstRow < srcRow) {
      // Bucle hacia arriba (retorno)
      if (srcNode.lane === dstNode.lane) {
        // En el mismo carril: salir por la derecha, entrar por la derecha
        edgeStyle += 'exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;';
      } else if (dstNode.lane < srcNode.lane) {
        // Hacia la izquierda: salir por la izquierda, entrar por la izquierda
        edgeStyle += 'exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;';
      } else {
        // Hacia la derecha: salir por la derecha, entrar por la derecha
        edgeStyle += 'exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;';
      }
    } else if (crossLane) {
      // Cruce de carriles (horizontal o diagonal hacia abajo)
      if (dstNode.lane > srcNode.lane) {
        // De izquierda a derecha: sale del lado derecho del origen, entra en el lado izquierdo del destino
        edgeStyle += 'exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;';
      } else {
        // De derecha a izquierda: sale del lado izquierdo del origen, entra en el lado derecho del destino
        edgeStyle += 'exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;';
      }
    } else {
      // Flujo normal hacia abajo en el mismo carril
      edgeStyle += 'exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;';
    }

    cells += `    <mxCell id="${eid}" value="${esc(lbl)}" style="${edgeStyle}fontSize=10;fontColor=#000000;" edge="1" source="${srcCid}" target="${dstCid}" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>\n`;
  }

  // ── Assemble XML ──────────────────────────────────────────────────────────
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
${cells}  </root>
</mxGraphModel>`;
}


// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log(`\nGenerando ${DIAGRAMS.length} diagramas XML (draw.io)...\n`);
  let ok = 0, fail = 0;

  for (const d of DIAGRAMS) {
    try {
      const xml     = buildXML(d);
      const outPath = path.join(OUTPUT_DIR, d.file + '.xml');
      fs.writeFileSync(outPath, xml, 'utf8');
      console.log(`  ✓ ${d.file}.xml`);
      ok++;
    } catch (e) {
      console.error(`  ✗ Error en ${d.file}:`, e.message);
      fail++;
    }
  }

  console.log(`\n¡Listo! ${ok} archivos XML generados${fail ? `, ${fail} con error` : ''}.`);
  console.log(`Carpeta: ${OUTPUT_DIR}`);
  console.log(`\nAbre cualquier .xml en diagrams.net (draw.io) para editarlo.`);
}

main();
