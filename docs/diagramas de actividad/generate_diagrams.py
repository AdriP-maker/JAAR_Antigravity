"""
Generador de Diagramas de Actividad con Swimlanes
Sistema SIMAP Digital - JAAR Antigravity
Genera todos los CU como diagramas de actividad en formato PNG
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont

# ─── Configuración visual ──────────────────────────────────────────────────────
BG_COLOR       = (255, 255, 255)
BORDER_COLOR   = (30,  30,  30)
HEADER_BG      = (220, 220, 220)
LANE_DIVIDER   = (160, 160, 160)
TITLE_BG       = (240, 240, 240)
BOX_FILL       = (255, 255, 255)
BOX_BORDER     = (30,  30,  30)
ARROW_COLOR    = (30,  30,  30)
TEXT_COLOR     = (0,   0,   0)
LABEL_TEXT     = (0,   0,   0)

TITLE_H        = 44    # altura franja título
HEADER_H       = 38    # altura cabeceras de swim‑lane
LANE_W         = 240   # anchura de cada swim‑lane
MARGIN         = 18    # margen interno
BOX_W          = 190   # ancho caja acción
BOX_H          = 40    # alto caja acción
RADIUS         = 14    # radio esquinas redondeadas
CIRCLE_R       = 13    # radio nodo inicial/final
V_GAP          = 22    # separación vertical entre cajas
FONT_TITLE     = 15
FONT_HEADER    = 13
FONT_BOX       = 11
FONT_LABEL     = 9

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


# ──────────────────────────────────────────────────────────────────────────────
# Datos de los diagramas
# Formato:
#   title: título del diagrama
#   lanes: lista de swim-lanes (actores)
#   nodes: lista de nodos
#       type: 'start' | 'action' | 'decision' | 'end'
#       label: texto (puede ser multilínea con \n)
#       lane: índice de swim-lane (0-based)
#   edges: lista de (origen_idx, destino_idx, label_opcional)
# ──────────────────────────────────────────────────────────────────────────────

DIAGRAMS = [

# ─── CU-01: Inicio de Sesión ──────────────────────────────────────────────────
{
  "file": "CU-01_Inicio_de_Sesion",
  "title": "CU-01: Inicio de Sesión",
  "lanes": ["Usuario", "Sistema"],
  "nodes": [
    # 0
    {"type":"start",    "lane":0, "label":""},
    # 1
    {"type":"action",   "lane":0, "label":"Abre la aplicación\ny ve pantalla Login"},
    # 2
    {"type":"action",   "lane":0, "label":"Ingresa usuario\ny contraseña"},
    # 3
    {"type":"action",   "lane":0, "label":"Presiona\n\"Ingresar\""},
    # 4
    {"type":"action",   "lane":1, "label":"Valida credenciales\ncontra simap_usuarios"},
    # 5
    {"type":"decision", "lane":1, "label":"¿Credenciales\nválidas?"},
    # 6
    {"type":"action",   "lane":1, "label":"Guarda rol y usuario\nen localStorage"},
    # 7
    {"type":"action",   "lane":1, "label":"Redirige a vista\nsegún rol"},
    # 8
    {"type":"action",   "lane":1, "label":"Muestra mensaje\nde error"},
    # 9
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),
    (5,6,"Sí"),(6,7,""),(7,9,""),
    (5,8,"No"),(8,2,""),
  ]
},

# ─── CU-02: Registro de Nuevo Vecino ─────────────────────────────────────────
{
  "file": "CU-02_Registro_de_Nuevo_Vecino",
  "title": "CU-02: Registro de Nuevo Vecino",
  "lanes": ["Vecino", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Abre pantalla\nde registro"},
    {"type":"action",   "lane":0, "label":"Ingresa nombre,\ncasa, sector, clave"},
    {"type":"action",   "lane":0, "label":"Presiona\n\"Solicitar Acceso\""},
    {"type":"action",   "lane":1, "label":"Valida que casa\nno esté duplicada"},
    {"type":"decision", "lane":1, "label":"¿Casa\nexiste?"},
    {"type":"action",   "lane":1, "label":"Crea registro con\nestado 'pendiente'"},
    {"type":"action",   "lane":0, "label":"Ve mensaje de\nenvío exitoso"},
    {"type":"action",   "lane":1, "label":"Muestra aviso\nde casa duplicada"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),
    (5,6,"No"),(6,7,""),(7,9,""),
    (5,8,"Sí"),(8,2,""),
  ]
},

# ─── CU-03: Aprobación/Rechazo de Vecino por Admin ───────────────────────────
{
  "file": "CU-03_Aprobacion_Rechazo_Vecino",
  "title": "CU-03: Aprobación / Rechazo de Vecino",
  "lanes": ["Admin", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Accede a /admin\nve solicitudes pendientes"},
    {"type":"action",   "lane":0, "label":"Revisa nombre, casa\ny sector del solicitante"},
    {"type":"decision", "lane":0, "label":"¿Decisión?"},
    {"type":"action",   "lane":1, "label":"Cambia estado\na 'activo'"},
    {"type":"action",   "lane":1, "label":"Cambia estado\na 'rechazado'"},
    {"type":"action",   "lane":1, "label":"Mueve de Pendientes\na Activos"},
    {"type":"action",   "lane":0, "label":"Vecino puede\niniciar sesión"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),
    (3,4,"Aprobar"),(4,6,""),(6,7,""),(7,8,""),
    (3,5,"Rechazar"),(5,8,""),
  ]
},

# ─── CU-04: Registro de Jornal Comunitario ────────────────────────────────────
{
  "file": "CU-04_Registro_Jornal_Comunitario",
  "title": "CU-04: Registro de Jornal Comunitario",
  "lanes": ["Cobrador", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Accede a /jornales"},
    {"type":"action",   "lane":0, "label":"Selecciona vecino,\ntarea y fecha"},
    {"type":"decision", "lane":0, "label":"¿Asistió?"},
    {"type":"action",   "lane":0, "label":"Ingresa horas\ntrabajadas"},
    {"type":"action",   "lane":1, "label":"Aplica multa\nconfigurada"},
    {"type":"action",   "lane":1, "label":"Guarda registro\nen simap_jornales"},
    {"type":"action",   "lane":1, "label":"Otorga puntos\n(8/3/0 pts)"},
    {"type":"action",   "lane":1, "label":"Muestra\nconfirmación"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),
    (3,4,"Sí"),(4,6,""),
    (3,5,"No"),(5,6,""),
    (6,7,""),(7,8,""),(8,9,""),
  ]
},

# ─── CU-05: Registro de Gasto / Egreso ───────────────────────────────────────
{
  "file": "CU-05_Registro_Egreso",
  "title": "CU-05: Registro de Gasto / Egreso",
  "lanes": ["Cobrador", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Accede a /gastos"},
    {"type":"action",   "lane":0, "label":"Ingresa monto,\ndescripción y fecha"},
    {"type":"action",   "lane":0, "label":"Presiona\n\"Registrar Gasto\""},
    {"type":"action",   "lane":1, "label":"Valida monto > 0\ny descripción"},
    {"type":"decision", "lane":1, "label":"¿Datos\nválidos?"},
    {"type":"action",   "lane":1, "label":"Guarda en\nsimap_gastos"},
    {"type":"action",   "lane":1, "label":"Muestra\n\"Gasto guardado\""},
    {"type":"action",   "lane":1, "label":"Muestra error\nde validación"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),
    (5,6,"Sí"),(6,7,""),(7,9,""),
    (5,8,"No"),(8,2,""),
  ]
},

# ─── CU-06: Pago Mensual Estándar ─────────────────────────────────────────────
{
  "file": "CU-06_Pago_Mensual_Estandar",
  "title": "CU-06: Pago Mensual Estándar",
  "lanes": ["Cobrador", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Selecciona hogar\nen lista de cobros"},
    {"type":"action",   "lane":1, "label":"Muestra info hogar\ny meses pendientes"},
    {"type":"action",   "lane":0, "label":"Selecciona mes\ny presiona \"Registrar\""},
    {"type":"action",   "lane":1, "label":"Muestra monto\nB/.3.00 por defecto"},
    {"type":"action",   "lane":0, "label":"Confirma monto\ny método de pago"},
    {"type":"action",   "lane":1, "label":"Crea registro\nde pago"},
    {"type":"action",   "lane":1, "label":"Actualiza libro\nmayor del hogar"},
    {"type":"action",   "lane":1, "label":"Otorga 2 puntos\nbase al hogar"},
    {"type":"action",   "lane":1, "label":"Muestra\nconfirmación"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),(6,7,""),(7,8,""),(8,9,""),(9,10,""),
  ]
},

# ─── CU-07: Pago Parcial ──────────────────────────────────────────────────────
{
  "file": "CU-07_Pago_Parcial",
  "title": "CU-07: Pago Parcial",
  "lanes": ["Cobrador", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Selecciona hogar\ny mes pendiente"},
    {"type":"action",   "lane":1, "label":"Muestra saldo\npendiente del mes"},
    {"type":"action",   "lane":0, "label":"Ingresa monto\nparcial"},
    {"type":"action",   "lane":1, "label":"Valida 0 < monto\n≤ saldo pendiente"},
    {"type":"decision", "lane":1, "label":"¿Monto\nválido?"},
    {"type":"action",   "lane":1, "label":"Registra pago\nparcial"},
    {"type":"action",   "lane":1, "label":"Calcula saldo\nrestante"},
    {"type":"decision", "lane":1, "label":"¿Saldo\ncompleto?"},
    {"type":"action",   "lane":1, "label":"Marca mes\ncomo 'pagado'"},
    {"type":"action",   "lane":1, "label":"Marca mes\ncomo 'parcial'"},
    {"type":"action",   "lane":1, "label":"Muestra\nconfirmación"},
    {"type":"action",   "lane":1, "label":"Muestra error\nde monto"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),
    (5,6,"Sí"),(6,7,""),(7,8,""),
    (8,9,"Sí"),(9,11,""),(11,13,""),
    (8,10,"No"),(10,11,""),
    (5,12,"No"),(12,3,""),
  ]
},

# ─── CU-08: Pago Anticipado ────────────────────────────────────────────────────
{
  "file": "CU-08_Pago_Anticipado",
  "title": "CU-08: Pago Anticipado de Varios Meses",
  "lanes": ["Cobrador", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Selecciona hogar\ne indica N meses"},
    {"type":"action",   "lane":1, "label":"Calcula total:\nN × B/.3.00"},
    {"type":"action",   "lane":1, "label":"Muestra desglose\nde meses a cubrir"},
    {"type":"action",   "lane":0, "label":"Confirma pago\ntotal"},
    {"type":"action",   "lane":1, "label":"Crea N registros\nde pago individuales"},
    {"type":"action",   "lane":1, "label":"Otorga pts base\n(N×2 pts)"},
    {"type":"action",   "lane":1, "label":"Otorga pts bonus\n(meses extra×10)"},
    {"type":"action",   "lane":1, "label":"Muestra\nconfirmación total"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),(6,7,""),(7,8,""),(8,9,""),
  ]
},

# ─── CU-09: Puesta al Día ──────────────────────────────────────────────────────
{
  "file": "CU-09_Puesta_al_Dia",
  "title": "CU-09: Puesta al Día",
  "lanes": ["Cobrador", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Selecciona\nhogar moroso"},
    {"type":"action",   "lane":1, "label":"Muestra detalle\nde deuda total"},
    {"type":"action",   "lane":0, "label":"Selecciona\n\"Puesta al Día\""},
    {"type":"action",   "lane":1, "label":"Muestra resumen\ny total a liquidar"},
    {"type":"action",   "lane":0, "label":"Confirma\npago total"},
    {"type":"action",   "lane":1, "label":"Crea registros\npor cada mes"},
    {"type":"action",   "lane":1, "label":"Cambia estado\nde moroso a activo"},
    {"type":"action",   "lane":1, "label":"Otorga pts base\ny bonus"},
    {"type":"action",   "lane":1, "label":"Muestra\nconfirmación"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),(6,7,""),(7,8,""),(8,9,""),(9,10,""),
  ]
},

# ─── CU-10: Pago Diario ────────────────────────────────────────────────────────
{
  "file": "CU-10_Pago_Diario",
  "title": "CU-10: Pago Diario",
  "lanes": ["Cobrador", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Selecciona hogar\ndel jornalero"},
    {"type":"action",   "lane":1, "label":"Muestra modalidad\nDiario (B/.0.10/día)"},
    {"type":"action",   "lane":0, "label":"Ingresa cantidad\nde días a pagar"},
    {"type":"action",   "lane":1, "label":"Calcula monto:\ndías × B/.0.10"},
    {"type":"action",   "lane":0, "label":"Confirma pago"},
    {"type":"action",   "lane":1, "label":"Registra pago\ncon días cubiertos"},
    {"type":"action",   "lane":1, "label":"Actualiza acumulado\ndel mes"},
    {"type":"decision", "lane":1, "label":"¿Acumulado\n≥ B/.3.00?"},
    {"type":"action",   "lane":1, "label":"Marca mes\ncomo 'pagado'"},
    {"type":"action",   "lane":1, "label":"Marca mes\ncomo 'parcial'"},
    {"type":"action",   "lane":1, "label":"Muestra\nconfirmación"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),(6,7,""),(7,8,""),
    (8,9,"Sí"),(9,11,""),(11,12,""),
    (8,10,"No"),(10,11,""),
  ]
},

# ─── CU-11: Comisión Automática ────────────────────────────────────────────────
{
  "file": "CU-11_Comision_Automatica",
  "title": "CU-11: Cobrador Registra Pago y Recibe Comisión",
  "lanes": ["Cobrador", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Registra pago\nestándar B/.3.00"},
    {"type":"action",   "lane":0, "label":"Confirma el pago"},
    {"type":"action",   "lane":1, "label":"Calcula comisión\nautomática B/.1.00"},
    {"type":"action",   "lane":1, "label":"Aplica split:\n60% dev / 40% cobrador"},
    {"type":"action",   "lane":1, "label":"Crea registro de\ncomisión (atómico)"},
    {"type":"decision", "lane":1, "label":"¿Transacción\nexitosa?"},
    {"type":"action",   "lane":1, "label":"Confirma pago\ny comisión"},
    {"type":"action",   "lane":0, "label":"Ve: \"Tu comisión:\nB/.0.40\""},
    {"type":"action",   "lane":1, "label":"Revierte todo\ny muestra error"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),
    (6,7,"Sí"),(7,8,""),(8,10,""),
    (6,9,"No"),(9,10,""),
  ]
},

# ─── CU-12: Cobrador Consulta Ganancias ───────────────────────────────────────
{
  "file": "CU-12_Cobrador_Consulta_Ganancias",
  "title": "CU-12: Cobrador Consulta sus Ganancias Acumuladas",
  "lanes": ["Cobrador", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Abre /comisiones\ndesde el menú"},
    {"type":"action",   "lane":1, "label":"Carga comisiones\ndel cobrador"},
    {"type":"action",   "lane":1, "label":"Muestra panel:\ntotal, mes, promedio"},
    {"type":"action",   "lane":1, "label":"Muestra tabla\ndesglose mensual"},
    {"type":"action",   "lane":0, "label":"Filtra por\nrango de fechas"},
    {"type":"action",   "lane":1, "label":"Actualiza\nvista filtrada"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),(6,7,""),
  ]
},

# ─── CU-13: Admin Configura Split de Comisiones ───────────────────────────────
{
  "file": "CU-13_Admin_Configura_Split",
  "title": "CU-13: Admin Configura Split de Comisiones",
  "lanes": ["Admin", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Abre /puntos-admin\nve configuración actual"},
    {"type":"action",   "lane":0, "label":"Modifica porcentajes\ndev/cobrador"},
    {"type":"action",   "lane":0, "label":"Confirma cambio"},
    {"type":"action",   "lane":1, "label":"Valida que\nsumen 100%"},
    {"type":"decision", "lane":1, "label":"¿Suma\n= 100%?"},
    {"type":"action",   "lane":1, "label":"Guarda nueva config\ncon timestamp"},
    {"type":"action",   "lane":1, "label":"Registra en log\nde auditoría"},
    {"type":"action",   "lane":1, "label":"Muestra\nconfirmación"},
    {"type":"action",   "lane":1, "label":"Muestra error:\n\"Deben sumar 100%\""},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),
    (5,6,"Sí"),(6,7,""),(7,8,""),(8,10,""),
    (5,9,"No"),(9,2,""),
  ]
},

# ─── CU-14: Puntos por Pago Puntual ───────────────────────────────────────────
{
  "file": "CU-14_Puntos_Pago_Puntual",
  "title": "CU-14: Vecino Acumula Puntos por Pago Puntual",
  "lanes": ["Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Detecta pago\ncompleto registrado"},
    {"type":"action",   "lane":0, "label":"Verifica fecha\ndel pago vs mes"},
    {"type":"decision", "lane":0, "label":"¿Fecha ≤\ndía 15?"},
    {"type":"action",   "lane":0, "label":"Otorga 2 pts base\n+ 5 pts puntualidad"},
    {"type":"action",   "lane":0, "label":"Otorga solo\n2 pts base"},
    {"type":"action",   "lane":0, "label":"Registra transacciones\nde puntos"},
    {"type":"action",   "lane":0, "label":"Actualiza saldo\nde puntos del hogar"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),
    (3,4,"Sí"),(4,6,""),
    (3,5,"No"),(5,6,""),
    (6,7,""),(7,8,""),
  ]
},

# ─── CU-15: Puntos por Asistir a Jornal ───────────────────────────────────────
{
  "file": "CU-15_Puntos_Asistir_Jornal",
  "title": "CU-15: Vecino Acumula Puntos por Asistir a Jornal",
  "lanes": ["Cobrador", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Accede a sección\nde jornales"},
    {"type":"action",   "lane":0, "label":"Selecciona jornal\ny busca hogar"},
    {"type":"decision", "lane":0, "label":"¿Tipo de\nasistencia?"},
    {"type":"action",   "lane":1, "label":"Registra asistencia\npersonal"},
    {"type":"action",   "lane":1, "label":"Otorga 8 pts\n(jornal_personal)"},
    {"type":"action",   "lane":1, "label":"Registra asistencia\nsustituto"},
    {"type":"action",   "lane":1, "label":"Otorga 3 pts\n(jornal_sustituto)"},
    {"type":"action",   "lane":1, "label":"Muestra\nconfirmación"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),
    (3,4,"Personal"),(4,5,""),(5,8,""),
    (3,6,"Sustituto"),(6,7,""),(7,8,""),
    (8,9,""),
  ]
},

# ─── CU-16: Canje de Puntos por Descuento ────────────────────────────────────
{
  "file": "CU-16_Canje_Puntos_Descuento",
  "title": "CU-16: Vecino Canjea Puntos por Descuento",
  "lanes": ["Cobrador", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Selecciona hogar\npara pago mensual"},
    {"type":"action",   "lane":1, "label":"Muestra saldo\nde puntos disponibles"},
    {"type":"action",   "lane":0, "label":"Indica que vecino\ndesea usar puntos"},
    {"type":"action",   "lane":1, "label":"Calcula descuento:\npuntos × B/.0.10"},
    {"type":"action",   "lane":1, "label":"Aplica descuento\nal cobro"},
    {"type":"action",   "lane":0, "label":"Confirma pago\nen efectivo reducido"},
    {"type":"action",   "lane":1, "label":"Registra pago\ncompleto B/.3.00"},
    {"type":"action",   "lane":1, "label":"Deduce puntos\ncanjeados del saldo"},
    {"type":"action",   "lane":1, "label":"Calcula comisión\nsobre B/.3.00"},
    {"type":"action",   "lane":1, "label":"Muestra\nconfirmación"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),(6,7,""),(7,8,""),(8,9,""),(9,10,""),(10,11,""),
  ]
},

# ─── CU-17: Admin Configura Reglas de Puntos ─────────────────────────────────
{
  "file": "CU-17_Admin_Reglas_Puntos",
  "title": "CU-17: Admin Configura Reglas de Puntos",
  "lanes": ["Admin", "Sistema"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Abre /puntos-admin\nsección reglas"},
    {"type":"action",   "lane":1, "label":"Muestra config\nactual de puntos"},
    {"type":"action",   "lane":0, "label":"Modifica valores\ny tasa de conversión"},
    {"type":"action",   "lane":0, "label":"Confirma cambios"},
    {"type":"action",   "lane":1, "label":"Valida valores\n> 0"},
    {"type":"decision", "lane":1, "label":"¿Valores\nválidos?"},
    {"type":"action",   "lane":1, "label":"Guarda config\ncon timestamp"},
    {"type":"action",   "lane":1, "label":"Registra en log\nde auditoría"},
    {"type":"action",   "lane":1, "label":"Muestra\nconfirmación"},
    {"type":"action",   "lane":1, "label":"Muestra error:\n\"Valores deben ser > 0\""},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),
    (6,7,"Sí"),(7,8,""),(8,9,""),(9,11,""),
    (6,10,"No"),(10,3,""),
  ]
},

# ─── CU-18: Puntaje de Riesgo ─────────────────────────────────────────────────
{
  "file": "CU-18_Puntaje_Riesgo",
  "title": "CU-18: Cobrador Ve Puntaje de Riesgo de Cada Hogar",
  "lanes": ["Cobrador", "Sistema / IA"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Abre vista\nprincipal de cobros"},
    {"type":"action",   "lane":1, "label":"Carga lista de hogares\ncon datos actualizados"},
    {"type":"action",   "lane":1, "label":"Muestra badge de\nriesgo (0-100) por color"},
    {"type":"action",   "lane":0, "label":"Visualiza badges\ny prioriza cobros"},
    {"type":"action",   "lane":0, "label":"Toca un badge\npara ver detalle"},
    {"type":"action",   "lane":1, "label":"Muestra explicación\nbreve del puntaje"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),(6,7,""),
  ]
},

# ─── CU-19: Ruta Inteligente ───────────────────────────────────────────────────
{
  "file": "CU-19_Ruta_Inteligente",
  "title": "CU-19: Cobrador Activa \"Ruta Inteligente\"",
  "lanes": ["Cobrador", "Sistema / IA"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Abre vista de cobros\n(orden alfabético)"},
    {"type":"action",   "lane":0, "label":"Presiona\n\"Ruta Inteligente\""},
    {"type":"action",   "lane":1, "label":"Activa algoritmo\nde priorización IA"},
    {"type":"action",   "lane":1, "label":"Ordena por riesgo\ny sector geográfico"},
    {"type":"action",   "lane":1, "label":"Añade razón breve\na cada tarjeta"},
    {"type":"action",   "lane":0, "label":"Recorre lista\nen nuevo orden"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),(6,7,""),
  ]
},

# ─── CU-20: Predicción de Morosidad ───────────────────────────────────────────
{
  "file": "CU-20_Prediccion_Morosidad",
  "title": "CU-20: Sistema Predice Hogares en Riesgo de Morosidad",
  "lanes": ["Sistema / IA", "Cobrador"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Ejecuta análisis\nal inicio del mes"},
    {"type":"action",   "lane":0, "label":"Analiza patrones:\nretrasos, tendencias"},
    {"type":"action",   "lane":0, "label":"Identifica hogares\ncon alta probabilidad"},
    {"type":"decision", "lane":0, "label":"¿Hogares\nen riesgo?"},
    {"type":"action",   "lane":0, "label":"Genera alerta con\nnombre y probabilidad"},
    {"type":"action",   "lane":1, "label":"Ve alerta en\npanel principal"},
    {"type":"action",   "lane":1, "label":"Marca hogares para\nvisita proactiva"},
    {"type":"action",   "lane":0, "label":"Muestra: \"Sin hogares\nen riesgo este mes\""},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),
    (4,5,"Sí"),(5,6,""),(6,7,""),(7,9,""),
    (4,8,"No"),(8,9,""),
  ]
},

# ─── CU-21: Tablero de Métricas ────────────────────────────────────────────────
{
  "file": "CU-21_Tablero_Metricas",
  "title": "CU-21: Admin Revisa Tablero de Métricas de Recaudo",
  "lanes": ["Admin", "Sistema / IA"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Abre el tablero\nde métricas"},
    {"type":"action",   "lane":1, "label":"Calcula: tasa, día\npromedio, tendencia"},
    {"type":"action",   "lane":1, "label":"Muestra desglose\npor sector"},
    {"type":"action",   "lane":1, "label":"Muestra alertas\nde anomalías (IA)"},
    {"type":"action",   "lane":0, "label":"Filtra por mes,\ntrimestre o año"},
    {"type":"action",   "lane":1, "label":"Actualiza\nvista filtrada"},
    {"type":"action",   "lane":0, "label":"Hace clic en sector\npara ver detalle"},
    {"type":"action",   "lane":1, "label":"Muestra hogares\ndel sector"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),(6,7,""),(7,8,""),(8,9,""),
  ]
},

# ─── CU-22: Detección de Anomalías ────────────────────────────────────────────
{
  "file": "CU-22_Deteccion_Anomalias",
  "title": "CU-22: Sistema Detecta Anomalía en Recaudo",
  "lanes": ["Sistema / IA", "Admin"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Ejecuta análisis\nde anomalías (diario)"},
    {"type":"action",   "lane":0, "label":"Calcula tasa recaudo\npor sector"},
    {"type":"action",   "lane":0, "label":"Aplica z-score\nvs promedio histórico"},
    {"type":"decision", "lane":0, "label":"¿z-score\n> 2?"},
    {"type":"action",   "lane":0, "label":"Genera alerta:\nsector, desviación"},
    {"type":"action",   "lane":1, "label":"Ve alerta en\ntablero de métricas"},
    {"type":"action",   "lane":1, "label":"Marca alerta:\n\"investigada/resuelta\""},
    {"type":"action",   "lane":0, "label":"Sin anomalías,\nno genera alerta"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),
    (4,5,"Sí"),(5,6,""),(6,7,""),(7,9,""),
    (4,8,"No"),(8,9,""),
  ]
},

# ─── CU-23: Estado de Riesgo para Cliente ────────────────────────────────────
{
  "file": "CU-23_Estado_Riesgo_Cliente",
  "title": "CU-23: Cliente Ve su Estado de Riesgo",
  "lanes": ["Cliente", "Sistema / IA"],
  "nodes": [
    {"type":"start",    "lane":0, "label":""},
    {"type":"action",   "lane":0, "label":"Abre /historial\ncon sus credenciales"},
    {"type":"action",   "lane":1, "label":"Carga historial y\npuntaje de riesgo"},
    {"type":"action",   "lane":1, "label":"Traduce puntaje a\nmensaje amigable"},
    {"type":"action",   "lane":1, "label":"Muestra mensaje\ne ícono por nivel"},
    {"type":"action",   "lane":1, "label":"Muestra recomendaciones\npersonalizadas"},
    {"type":"action",   "lane":0, "label":"Lee recomendaciones\ny toma acciones"},
    {"type":"action",   "lane":0, "label":"Presiona \"Consejos\"\npara más info"},
    {"type":"action",   "lane":1, "label":"Muestra tips de\nmejora de estado"},
    {"type":"end",      "lane":0, "label":""},
  ],
  "edges": [
    (0,1,""),(1,2,""),(2,3,""),(3,4,""),(4,5,""),(5,6,""),(6,7,""),(7,8,""),(8,9,""),
  ]
},

]  # fin DIAGRAMS


# ──────────────────────────────────────────────────────────────────────────────
# Utilidades de dibujo
# ──────────────────────────────────────────────────────────────────────────────

def load_font(size):
    """Carga una fuente TrueType si está disponible, sino usa la por defecto."""
    import platform
    candidates = []
    if platform.system() == "Windows":
        candidates = [
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/calibri.ttf",
            "C:/Windows/Fonts/segoeui.ttf",
        ]
    elif platform.system() == "Darwin":
        candidates = ["/Library/Fonts/Arial.ttf", "/System/Library/Fonts/Helvetica.ttc"]
    else:
        candidates = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                      "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def text_size(draw, text, font):
    """Devuelve (w, h) del texto, compatible con versiones antiguas y nuevas de Pillow."""
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]
    except AttributeError:
        return draw.textsize(text, font=font)


def draw_rounded_rect(draw, x1, y1, x2, y2, r, fill, outline, lw=2):
    """Dibuja rectángulo con esquinas redondeadas."""
    draw.rectangle([x1+r, y1, x2-r, y2], fill=fill, outline=None)
    draw.rectangle([x1, y1+r, x2, y2-r], fill=fill, outline=None)
    draw.ellipse([x1, y1, x1+2*r, y1+2*r], fill=fill)
    draw.ellipse([x2-2*r, y1, x2, y1+2*r], fill=fill)
    draw.ellipse([x1, y2-2*r, x1+2*r, y2], fill=fill)
    draw.ellipse([x2-2*r, y2-2*r, x2, y2], fill=fill)
    # Borde
    draw.arc([x1, y1, x1+2*r, y1+2*r], 180, 270, fill=outline, width=lw)
    draw.arc([x2-2*r, y1, x2, y1+2*r], 270, 360, fill=outline, width=lw)
    draw.arc([x1, y2-2*r, x1+2*r, y2], 90, 180, fill=outline, width=lw)
    draw.arc([x2-2*r, y2-2*r, x2, y2], 0, 90, fill=outline, width=lw)
    draw.line([x1+r, y1, x2-r, y1], fill=outline, width=lw)
    draw.line([x1+r, y2, x2-r, y2], fill=outline, width=lw)
    draw.line([x1, y1+r, x1, y2-r], fill=outline, width=lw)
    draw.line([x2, y1+r, x2, y2-r], fill=outline, width=lw)


def draw_diamond(draw, cx, cy, hw, hh, fill, outline, lw=2):
    """Dibuja rombo (nodo de decisión)."""
    pts = [(cx, cy-hh), (cx+hw, cy), (cx, cy+hh), (cx-hw, cy)]
    draw.polygon(pts, fill=fill, outline=outline)


def draw_arrow(draw, x1, y1, x2, y2, label="", font=None):
    """Dibuja flecha con punta y etiqueta opcional."""
    draw.line([(x1, y1), (x2, y2)], fill=ARROW_COLOR, width=2)
    # Punta de flecha
    angle = math.atan2(y2-y1, x2-x1)
    hs = 10
    ang = math.pi/6
    ax1 = x2 - hs*math.cos(angle-ang)
    ay1 = y2 - hs*math.sin(angle-ang)
    ax2 = x2 - hs*math.cos(angle+ang)
    ay2 = y2 - hs*math.sin(angle+ang)
    draw.polygon([(x2,y2),(int(ax1),int(ay1)),(int(ax2),int(ay2))], fill=ARROW_COLOR)
    if label and font:
        mx, my = (x1+x2)//2, (y1+y2)//2
        draw.text((mx+3, my-10), label, fill=(80,80,80), font=font)


def wrap_text(text, max_chars=20):
    """Ajusta texto a múltiples líneas."""
    lines = text.split('\n')
    result = []
    for line in lines:
        if len(line) <= max_chars:
            result.append(line)
        else:
            words = line.split(' ')
            cur = ""
            for w in words:
                if len(cur)+len(w)+1 <= max_chars:
                    cur = (cur+" "+w).strip()
                else:
                    if cur:
                        result.append(cur)
                    cur = w
            if cur:
                result.append(cur)
    return '\n'.join(result)


# ──────────────────────────────────────────────────────────────────────────────
# Motor de layout
# ──────────────────────────────────────────────────────────────────────────────

def compute_layout(diagram):
    """
    Asigna coordenadas (cx, cy) a cada nodo.
    Usa un layout de columnas (una por swim-lane) y filas que
    evolucionan con las dependencias.
    """
    nodes  = diagram["nodes"]
    edges  = diagram["edges"]
    n_lanes = len(diagram["lanes"])

    # Construir grafo de dependencias
    in_edges  = {i: [] for i in range(len(nodes))}
    out_edges = {i: [] for i in range(len(nodes))}
    for (src, dst, lbl) in edges:
        out_edges[src].append(dst)
        in_edges[dst].append(src)

    # BFS / toposort simple para asignar filas
    row = [-1] * len(nodes)
    # Nodo(s) de inicio
    starts = [i for i, n in enumerate(nodes) if n["type"] == "start"]
    queue = list(starts)
    for s in starts:
        row[s] = 0

    visited = set(starts)
    while queue:
        cur = queue.pop(0)
        for nxt in out_edges[cur]:
            proposed = row[cur] + 1
            if row[nxt] < proposed:
                row[nxt] = proposed
            if nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)

    # Si hay nodos sin visitar, asignarles fila al final
    max_row = max(r for r in row if r >= 0) + 1
    for i in range(len(nodes)):
        if row[i] < 0:
            row[i] = max_row
            max_row += 1

    # Calcular coordenadas
    positions = []
    for i, node in enumerate(nodes):
        lane_idx = node["lane"]
        cx = lane_idx * LANE_W + LANE_W // 2
        cy = row[i] * (BOX_H + V_GAP) + (BOX_H + V_GAP) // 2
        positions.append((cx, cy))

    return positions, row


# ──────────────────────────────────────────────────────────────────────────────
# Renderizador
# ──────────────────────────────────────────────────────────────────────────────

def render_diagram(diagram, output_path):
    nodes   = diagram["nodes"]
    edges   = diagram["edges"]
    lanes   = diagram["lanes"]
    title   = diagram["title"]
    n_lanes = len(lanes)

    positions, rows = compute_layout(diagram)
    max_row = max(rows) + 1

    total_w = n_lanes * LANE_W + 2
    content_h = max_row * (BOX_H + V_GAP) + V_GAP + 20
    total_h = TITLE_H + HEADER_H + content_h + 10

    img  = Image.new("RGB", (total_w, total_h), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Fuentes
    f_title  = load_font(FONT_TITLE)
    f_header = load_font(FONT_HEADER)
    f_box    = load_font(FONT_BOX)
    f_label  = load_font(FONT_LABEL)

    # ── Borde exterior ────────────────────────────────────────────────────────
    draw.rectangle([0, 0, total_w-1, total_h-1], outline=BORDER_COLOR, width=2)

    # ── Franja título ─────────────────────────────────────────────────────────
    draw.rectangle([0, 0, total_w-1, TITLE_H], fill=TITLE_BG, outline=BORDER_COLOR, width=1)
    tw, th = text_size(draw, title, f_title)
    draw.text(((total_w-tw)//2, (TITLE_H-th)//2), title, fill=TEXT_COLOR, font=f_title)

    # ── Cabeceras de swim-lanes ───────────────────────────────────────────────
    for i, lane in enumerate(lanes):
        x0 = i * LANE_W
        x1 = x0 + LANE_W
        draw.rectangle([x0, TITLE_H, x1, TITLE_H+HEADER_H], fill=HEADER_BG, outline=BORDER_COLOR, width=1)
        lw, lh = text_size(draw, lane, f_header)
        draw.text((x0+(LANE_W-lw)//2, TITLE_H+(HEADER_H-lh)//2), lane, fill=TEXT_COLOR, font=f_header)

    # ── Líneas divisoras de swim-lanes ────────────────────────────────────────
    content_y0 = TITLE_H + HEADER_H
    for i in range(1, n_lanes):
        x = i * LANE_W
        draw.line([(x, content_y0), (x, total_h-1)], fill=LANE_DIVIDER, width=1)

    # ── Calcular posiciones absolutas ─────────────────────────────────────────
    offset_y = content_y0 + V_GAP
    abs_pos = []
    for i, (cx, cy) in enumerate(positions):
        abs_pos.append((cx, cy + offset_y))

    # ── Dibujar aristas ───────────────────────────────────────────────────────
    for (src, dst, lbl) in edges:
        sx, sy = abs_pos[src]
        dx, dy = abs_pos[dst]
        stype = nodes[src]["type"]
        dtype = nodes[dst]["type"]

        # Punto de salida
        if stype == "start":
            out_pt = (sx, sy + CIRCLE_R)
        elif stype == "decision":
            # si van al mismo nivel o va hacia arriba -> lateral; si baja -> abajo
            if dy > sy:
                out_pt = (sx, sy + BOX_H//2 + 4)
            else:
                out_pt = (sx + BOX_W//2 + 4, sy)
        else:
            out_pt = (sx, sy + BOX_H//2)

        # Punto de entrada
        if dtype == "end":
            in_pt = (dx, dy - CIRCLE_R)
        elif dtype == "decision":
            if dy < sy:
                in_pt = (dx, dy + BOX_H//2 + 4)
            else:
                in_pt = (dx, dy - BOX_H//2 - 4)
        else:
            in_pt = (dx, dy - BOX_H//2)

        # Si cruza swim-lanes: routing con punto intermedio
        if nodes[src]["lane"] != nodes[dst]["lane"]:
            mid_x = (out_pt[0] + in_pt[0]) // 2
            mid_y = (out_pt[1] + in_pt[1]) // 2
            draw.line([out_pt, (in_pt[0], out_pt[1])], fill=ARROW_COLOR, width=2)
            draw_arrow(draw, in_pt[0], out_pt[1], in_pt[0], in_pt[1], lbl, f_label)
        else:
            # Si el destino está hacia arriba (bucle): usa offset lateral
            if in_pt[1] < out_pt[1] - 5:
                ox = out_pt[0] + LANE_W//2 - 20
                pts = [out_pt, (ox, out_pt[1]), (ox, in_pt[1]), in_pt]
                for k in range(len(pts)-1):
                    if k == len(pts)-2:
                        draw_arrow(draw, pts[k][0], pts[k][1], pts[k+1][0], pts[k+1][1], lbl if k==0 else "", f_label)
                    else:
                        draw.line([pts[k], pts[k+1]], fill=ARROW_COLOR, width=2)
            else:
                draw_arrow(draw, out_pt[0], out_pt[1], in_pt[0], in_pt[1], lbl, f_label)

    # ── Dibujar nodos ─────────────────────────────────────────────────────────
    for i, node in enumerate(nodes):
        cx, cy = abs_pos[i]
        ntype  = node["type"]
        label  = wrap_text(node.get("label",""))

        if ntype == "start":
            draw.ellipse([cx-CIRCLE_R, cy-CIRCLE_R, cx+CIRCLE_R, cy+CIRCLE_R],
                         fill=(0,0,0), outline=(0,0,0))

        elif ntype == "end":
            draw.ellipse([cx-CIRCLE_R-3, cy-CIRCLE_R-3, cx+CIRCLE_R+3, cy+CIRCLE_R+3],
                         fill=BOX_FILL, outline=(0,0,0), width=2)
            draw.ellipse([cx-CIRCLE_R, cy-CIRCLE_R, cx+CIRCLE_R, cy+CIRCLE_R],
                         fill=(0,0,0))

        elif ntype == "decision":
            hw = BOX_W//2
            hh = BOX_H//2 + 4
            draw_diamond(draw, cx, cy, hw, hh, BOX_FILL, BOX_BORDER)
            lines = label.split('\n')
            total_th = sum(text_size(draw, l, f_box)[1] for l in lines) + 2*(len(lines)-1)
            y_text = cy - total_th//2
            for ln in lines:
                lw2, lh = text_size(draw, ln, f_box)
                draw.text((cx-lw2//2, y_text), ln, fill=TEXT_COLOR, font=f_box)
                y_text += lh + 2

        else:  # action
            x1 = cx - BOX_W//2
            y1 = cy - BOX_H//2
            x2 = cx + BOX_W//2
            y2 = cy + BOX_H//2
            draw_rounded_rect(draw, x1, y1, x2, y2, RADIUS, BOX_FILL, BOX_BORDER)
            lines = label.split('\n')
            total_th = sum(text_size(draw, l, f_box)[1] for l in lines) + 2*(len(lines)-1)
            y_text = cy - total_th//2
            for ln in lines:
                lw2, lh = text_size(draw, ln, f_box)
                draw.text((cx-lw2//2, y_text), ln, fill=TEXT_COLOR, font=f_box)
                y_text += lh + 2

    img.save(output_path, "PNG", dpi=(150,150))
    print(f"  ✓ {os.path.basename(output_path)}")


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main():
    print("Verificando Pillow...")
    try:
        from PIL import Image
    except ImportError:
        print("ERROR: Pillow no está instalado. Instálalo con: pip install Pillow")
        return

    print(f"\nGenerando {len(DIAGRAMS)} diagramas de actividad...")
    for d in DIAGRAMS:
        fname = d["file"] + ".png"
        out   = os.path.join(OUTPUT_DIR, fname)
        try:
            render_diagram(d, out)
        except Exception as e:
            print(f"  ✗ Error en {d['file']}: {e}")
            import traceback; traceback.print_exc()

    print(f"\n¡Listo! Todos los diagramas guardados en:\n  {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
