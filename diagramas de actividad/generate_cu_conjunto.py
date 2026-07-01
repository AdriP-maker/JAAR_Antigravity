"""
Generador del Diagrama de Casos de Uso UNIFICADO (Conjunto)
Sistema JAAR - Junta de Agua y Alcantarillado Rural
Genera CU-Conjunto.jpg con todos los 23 CU agrupados por paquetes
"""

import os
from PIL import Image, ImageDraw, ImageFont

# ─── Salida ────────────────────────────────────────────────────────────────────
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "CU-Conjunto.jpg")

# ─── Dimensiones del canvas ────────────────────────────────────────────────────
W = 1800
H = 1300

# ─── Paleta de colores ─────────────────────────────────────────────────────────
BG           = (245, 247, 252)
BORDER_SYS   = (26,  35, 126)   # azul oscuro (contorno sistema)
FILL_SYS     = (248, 249, 255)  # fondo sistema

# Paquetes
PKG = [
    {"name": "Autenticación y Acceso",        "fill": (232,234,246), "stroke": (57, 73,171), "text": (26,35,126)},
    {"name": "Gestión Comunitaria",            "fill": (232,245,233), "stroke": (56,142, 60), "text": (27,94, 32)},
    {"name": "Gestión de Pagos",              "fill": (255,248,225), "stroke": (245,127, 23), "text": (230, 81,  0)},
    {"name": "Comisiones del Cobrador",        "fill": (252,228,236), "stroke": (198, 40, 40), "text": (183, 28, 28)},
    {"name": "Sistema de Puntos",             "fill": (243,229,245), "stroke": (123, 31,162), "text": ( 74, 20,140)},
    {"name": "Inteligencia y Análisis",        "fill": (224,247,250), "stroke": (  0,131,143), "text": (  0, 77, 64)},
]

# Actores
ACTOR_COLORS = {
    "Vecino":       (21, 101,192),
    "Cobrador":     (198, 40, 40),
    "Admin":        (46, 125, 50),
    "Sistema / IA": (  0,105,  92),
}

# ─── Datos de Casos de Uso por paquete ────────────────────────────────────────
PACKAGES_DATA = [
    {
        "pkg": 0,
        "cus": [
            ("CU-01", "Inicio de\nSesión"),
            ("CU-02", "Registro de\nNuevo Vecino"),
            ("CU-03", "Egreso /\nLogout"),
        ],
        "actors": ["Vecino", "Cobrador", "Admin"],
    },
    {
        "pkg": 1,
        "cus": [
            ("CU-04", "Registro de\nJornal"),
            ("CU-05", "Aprobación /\nRechazo Vecino"),
        ],
        "actors": ["Admin", "Cobrador"],
    },
    {
        "pkg": 2,
        "cus": [
            ("CU-06", "Pago Mensual\nEstándar"),
            ("CU-07", "Pago\nParcial"),
            ("CU-08", "Pago\nAnticipado"),
            ("CU-09", "Puesta\nal Día"),
            ("CU-10", "Pago\nDiario"),
        ],
        "actors": ["Vecino", "Cobrador"],
    },
    {
        "pkg": 3,
        "cus": [
            ("CU-11", "Comisión\nAutomática"),
            ("CU-12", "Consulta\nGanancias"),
            ("CU-13", "Config.\nSplit"),
        ],
        "actors": ["Cobrador", "Admin", "Sistema / IA"],
    },
    {
        "pkg": 4,
        "cus": [
            ("CU-14", "Puntos por\nPago Puntual"),
            ("CU-15", "Puntos por\nJornal"),
            ("CU-16", "Canje de\nPuntos"),
            ("CU-17", "Config.\nReglas Puntos"),
        ],
        "actors": ["Vecino", "Admin", "Sistema / IA"],
    },
    {
        "pkg": 5,
        "cus": [
            ("CU-18", "Puntaje\nde Riesgo"),
            ("CU-19", "Ruta\nInteligente"),
            ("CU-20", "Predicción de\nMorosidad"),
            ("CU-21", "Tablero de\nRecaudo"),
            ("CU-22", "Detección de\nAnomalías"),
            ("CU-23", "Estado de\nRiesgo Cliente"),
        ],
        "actors": ["Admin", "Cobrador", "Sistema / IA"],
    },
]

# ─── Layout de paquetes (x, y, w, h) ─────────────────────────────────────────
# Espacio: sistema ocupa x=180..1620, y=90..1230
# Actores: izq x=20..160, der x=1625..1780
PKG_LAYOUT = [
    (195,  100, 400, 190),   # 0 Autenticación
    (630,  100, 350, 190),   # 1 Comunidad
    (195,  320, 620, 220),   # 2 Pagos
    (855,  320, 360, 220),   # 3 Comisiones
    (195,  580, 560, 200),   # 4 Puntos
    (195,  820, 820, 350),   # 5 IA
]

# Posiciones de actores: (x_centro, y_inicio_linea, lado)
# lado: 'L' = izquierda, 'R' = derecha
ACTOR_POS = {
    "Vecino":       (90,  350, "L"),
    "Cobrador":     (90,  600, "L"),
    "Admin":        (1710, 250, "R"),
    "Sistema / IA": (1710, 900, "R"),
}


# ─── Utilidades ───────────────────────────────────────────────────────────────

def load_font(size):
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
        candidates = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def text_bbox(draw, text, font):
    try:
        bb = draw.textbbox((0, 0), text, font=font)
        return bb[2]-bb[0], bb[3]-bb[1]
    except AttributeError:
        return draw.textsize(text, font=font)


def draw_actor(draw, cx, cy, color, f_actor, label):
    """Dibuja figura de palito (stick figure) UML."""
    r = 16
    # Cabeza
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=color, width=2, fill=(255,255,255))
    # Cuerpo
    draw.line([(cx, cy+r), (cx, cy+r+30)], fill=color, width=2)
    # Brazos
    draw.line([(cx-22, cy+r+12), (cx+22, cy+r+12)], fill=color, width=2)
    # Piernas
    draw.line([(cx, cy+r+30), (cx-18, cy+r+55)], fill=color, width=2)
    draw.line([(cx, cy+r+30), (cx+18, cy+r+55)], fill=color, width=2)
    # Etiqueta
    lines = label.split("\n")
    total_h = len(lines) * 16
    y0 = cy + r + 60
    for line in lines:
        tw, th = text_bbox(draw, line, f_actor)
        draw.text((cx - tw//2, y0), line, fill=color, font=f_actor)
        y0 += 16


def draw_ellipse_cu(draw, cx, cy, rx, ry, fill, stroke, lw=2):
    draw.ellipse([cx-rx, cy-ry, cx+rx, cy+ry], fill=fill, outline=stroke, width=lw)


def draw_pkg_box(draw, x, y, w, h, pkg_info, f_pkg):
    """Dibuja rectángulo de paquete UML con tab arriba."""
    tab_w, tab_h = 90, 20
    fill   = pkg_info["fill"]
    stroke = pkg_info["stroke"]
    lw = 2
    # Tab
    draw.rectangle([x, y, x+tab_w, y+tab_h], fill=stroke, outline=stroke, width=lw)
    # Cuerpo
    draw.rectangle([x, y+tab_h, x+w, y+h], fill=fill, outline=stroke, width=lw)
    # Nombre
    name = pkg_info["name"]
    tw, th = text_bbox(draw, name, f_pkg)
    draw.text((x+w//2 - tw//2, y+tab_h+6), name, fill=pkg_info["stroke"], font=f_pkg)


def multiline_center(draw, cx, cy, text, font, color):
    lines = text.split("\n")
    line_h = 15
    total_h = len(lines) * line_h
    y0 = cy - total_h//2 + 2
    for line in lines:
        tw, th = text_bbox(draw, line, font)
        draw.text((cx - tw//2, y0), line, fill=color, font=font)
        y0 += line_h


# ─── Cálculo de posición de CU dentro de paquete ─────────────────────────────

def cu_positions(pkg_rect, n_cus):
    """Distribuye los óvalos de CU dentro del paquete."""
    x, y, w, h = pkg_rect
    header_h = 44  # tab + nombre
    area_x = x + 10
    area_y = y + header_h + 10
    area_w = w - 20
    area_h = h - header_h - 20

    cols = min(n_cus, 3) if n_cus > 2 else n_cus
    rows = (n_cus + cols - 1) // cols

    cell_w = area_w // cols
    cell_h = area_h // rows

    positions = []
    for i in range(n_cus):
        col = i % cols
        row = i // cols
        cx = area_x + col * cell_w + cell_w // 2
        cy = area_y + row * cell_h + cell_h // 2
        positions.append((cx, cy))
    return positions


# ─── Render principal ─────────────────────────────────────────────────────────

def render():
    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Fuentes
    f_title  = load_font(20)
    f_pkg    = load_font(11)
    f_cu_id  = load_font(9)
    f_cu_lbl = load_font(10)
    f_actor  = load_font(11)
    f_rel    = load_font(8)

    # ── Título ────────────────────────────────────────────────────────────────
    title = "JAAR — Diagrama de Casos de Uso General (Conjunto)"
    tw, th = text_bbox(draw, title, f_title)
    draw.rectangle([0, 0, W, 55], fill=(26,35,126))
    draw.text((W//2 - tw//2, 15), title, fill=(255,255,255), font=f_title)

    # ── Rectángulo sistema ────────────────────────────────────────────────────
    sys_x1, sys_y1, sys_x2, sys_y2 = 180, 70, 1620, 1240
    draw.rectangle([sys_x1, sys_y1, sys_x2, sys_y2],
                   fill=FILL_SYS, outline=BORDER_SYS, width=3)
    sys_label = "«Sistema» JAAR - Junta de Agua y Alcantarillado Rural"
    tw, th = text_bbox(draw, sys_label, f_pkg)
    draw.text((sys_x1 + (sys_x2-sys_x1)//2 - tw//2, sys_y1 + 6),
              sys_label, fill=BORDER_SYS, font=f_pkg)

    # ── CU óvalo dimensiones ──────────────────────────────────────────────────
    RX, RY = 62, 30  # radios del óvalo

    # ── Guardar centros de CU para trazar relaciones ──────────────────────────
    cu_centers = {}   # "CU-XX" -> (cx, cy)

    # ── Dibujar paquetes y CUs ────────────────────────────────────────────────
    for pd in PACKAGES_DATA:
        pidx = pd["pkg"]
        pkg_info = PKG[pidx]
        pkg_rect = PKG_LAYOUT[pidx]
        px, py, pw, ph = pkg_rect

        draw_pkg_box(draw, px, py, pw, ph, pkg_info, f_pkg)

        cus = pd["cus"]
        positions = cu_positions(pkg_rect, len(cus))

        for i, (cu_id, cu_label) in enumerate(cus):
            cx, cy = positions[i]
            cu_centers[cu_id] = (cx, cy)

            # Óvalo
            draw_ellipse_cu(draw, cx, cy, RX, RY,
                            fill=(255,255,255),
                            stroke=pkg_info["stroke"], lw=2)
            # ID pequeño arriba
            id_tw, _ = text_bbox(draw, cu_id, f_cu_id)
            draw.text((cx - id_tw//2, cy - RY + 4), cu_id,
                      fill=pkg_info["stroke"], font=f_cu_id)
            # Label centrado
            multiline_center(draw, cx, cy + 6, cu_label, f_cu_lbl, (30,30,30))

    # ── Dibujar actores ───────────────────────────────────────────────────────
    actor_centers = {}
    for actor_name, (ax, ay, side) in ACTOR_POS.items():
        color = ACTOR_COLORS[actor_name]
        draw_actor(draw, ax, ay, color, f_actor, actor_name)
        actor_centers[actor_name] = (ax, ay)

    # ── Relaciones actor → CU ─────────────────────────────────────────────────
    ACTOR_CU = {
        "Vecino":       ["CU-01","CU-02","CU-03","CU-06","CU-07",
                         "CU-08","CU-09","CU-10","CU-16","CU-23"],
        "Cobrador":     ["CU-01","CU-04","CU-06","CU-07","CU-08",
                         "CU-09","CU-10","CU-11","CU-12","CU-15","CU-18","CU-19"],
        "Admin":        ["CU-03","CU-04","CU-05","CU-13","CU-17",
                         "CU-18","CU-21","CU-22"],
        "Sistema / IA": ["CU-11","CU-14","CU-15","CU-18","CU-19",
                         "CU-20","CU-21","CU-22"],
    }

    for actor_name, cus in ACTOR_CU.items():
        color = ACTOR_COLORS[actor_name]
        ax, ay = actor_centers[actor_name]
        actor_foot = (ax, ay + 16 + 55)  # base de las piernas

        for cu_id in cus:
            if cu_id not in cu_centers:
                continue
            cx, cy = cu_centers[cu_id]

            # Punto de conexión en el óvalo (lado más cercano al actor)
            if ax < cx:  # actor a la izquierda
                ex = cx - RX
            else:
                ex = cx + RX
            ey = cy

            draw.line([actor_foot, (ex, ey)], fill=color + (160,) if len(color)==3 else color, width=1)

    # ── Relaciones <<include>> y <<extend>> ───────────────────────────────────
    RELATIONS = [
        # (from_cu, to_cu, tipo, color)
        ("CU-06", "CU-01", "«include»", (100,100,100)),
        ("CU-14", "CU-06", "«extend»",  (123, 31,162)),
        ("CU-15", "CU-04", "«extend»",  (123, 31,162)),
        ("CU-11", "CU-06", "«extend»",  (198, 40, 40)),
        ("CU-20", "CU-07", "«extend»",  (  0,131,143)),
    ]

    for (src, dst, label, color) in RELATIONS:
        if src not in cu_centers or dst not in cu_centers:
            continue
        sx, sy = cu_centers[src]
        dx, dy = cu_centers[dst]
        # línea punteada
        total = ((dx-sx)**2 + (dy-sy)**2)**0.5
        if total == 0:
            continue
        segs = int(total / 8)
        for i in range(0, segs, 2):
            t0, t1 = i/segs, min((i+1)/segs, 1.0)
            x0 = int(sx + (dx-sx)*t0)
            y0 = int(sy + (dy-sy)*t0)
            x1 = int(sx + (dx-sx)*t1)
            y1 = int(sy + (dy-sy)*t1)
            draw.line([(x0,y0),(x1,y1)], fill=color, width=1)
        # etiqueta
        mx, my = (sx+dx)//2, (sy+dy)//2
        tw, th = text_bbox(draw, label, f_rel)
        draw.rectangle([mx-tw//2-2, my-th//2-1, mx+tw//2+2, my+th//2+1],
                       fill=(255,255,220), outline=color, width=1)
        draw.text((mx-tw//2, my-th//2), label, fill=color, font=f_rel)

    # ── Leyenda ───────────────────────────────────────────────────────────────
    leg_x, leg_y = 1630, 1100
    draw.rectangle([leg_x, leg_y, leg_x+155, leg_y+125],
                   fill=(250,250,250), outline=(100,100,100), width=1)
    draw.text((leg_x+5, leg_y+5),   "Leyenda",            fill=(30,30,30),    font=f_actor)
    draw.line([(leg_x+5, leg_y+30), (leg_x+35, leg_y+30)], fill=(80,80,80), width=2)
    draw.text((leg_x+40, leg_y+22), "Asociación actor-CU",fill=(60,60,60),    font=f_cu_id)
    # punteada include
    for i in range(0, 30, 4):
        draw.line([(leg_x+5+i, leg_y+52),(leg_x+5+i+2, leg_y+52)],fill=(100,100,100),width=1)
    draw.text((leg_x+40, leg_y+44), "«include»",          fill=(100,100,100), font=f_cu_id)
    # punteada extend
    for i in range(0, 30, 4):
        draw.line([(leg_x+5+i, leg_y+72),(leg_x+5+i+2, leg_y+72)],fill=(123,31,162),width=1)
    draw.text((leg_x+40, leg_y+64), "«extend»",           fill=(123,31,162),  font=f_cu_id)
    # colores actores
    for idx, (name, color) in enumerate(ACTOR_COLORS.items()):
        yy = leg_y + 86 + idx*10
        draw.rectangle([leg_x+5, yy, leg_x+15, yy+8], fill=color)
        draw.text((leg_x+20, yy-1), name, fill=(40,40,40), font=f_cu_id)

    # ── Guardar ───────────────────────────────────────────────────────────────
    img.save(OUTPUT_FILE, "JPEG", quality=95)
    print(f"✅ Guardado: {OUTPUT_FILE}")


if __name__ == "__main__":
    render()
