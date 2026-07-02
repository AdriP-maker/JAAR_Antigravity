/**
 * Generador del Diagrama de Casos de Uso CONJUNTO (General)
 * Sistema JAAR - Junta de Agua y Alcantarillado Rural
 * Genera CU-Conjunto.jpg con los 23 CU agrupados por paquetes UML
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'CU-Conjunto.jpg');

// ─── Canvas dimensions ────────────────────────────────────────────────────────
const W = 1800;
const H = 1300;

// ─── Colores de paquetes ──────────────────────────────────────────────────────
const PKGS = [
  { name: 'Autenticación y Acceso',     fill: '#E8EAF6', stroke: '#3949AB', text: '#1A237E' },
  { name: 'Gestión Comunitaria',         fill: '#E8F5E9', stroke: '#388E3C', text: '#1B5E20' },
  { name: 'Gestión de Pagos',           fill: '#FFF8E1', stroke: '#F57F17', text: '#E65100' },
  { name: 'Comisiones del Cobrador',     fill: '#FCE4EC', stroke: '#C62828', text: '#B71C1C' },
  { name: 'Sistema de Puntos',          fill: '#F3E5F5', stroke: '#7B1FA2', text: '#4A148C' },
  { name: 'Inteligencia y Análisis',     fill: '#E0F7FA', stroke: '#00838F', text: '#004D40' },
];

// ─── Colores de actores ───────────────────────────────────────────────────────
const ACTOR_CLR = {
  'Vecino':       '#1565C0',
  'Cobrador':     '#C62828',
  'Admin':        '#2E7D32',
  'Sistema / IA': '#00695C',
};

// ─── Datos de paquetes ────────────────────────────────────────────────────────
const PACKAGES = [
  {
    pkg: 0,
    cus: [
      ['CU-01', 'Inicio de\nSesión'],
      ['CU-02', 'Registro de\nNuevo Vecino'],
      ['CU-03', 'Egreso /\nLogout'],
    ],
  },
  {
    pkg: 1,
    cus: [
      ['CU-04', 'Registro de\nJornal'],
      ['CU-05', 'Aprobación /\nRechazo Vecino'],
    ],
  },
  {
    pkg: 2,
    cus: [
      ['CU-06', 'Pago Mensual\nEstándar'],
      ['CU-07', 'Pago\nParcial'],
      ['CU-08', 'Pago\nAnticipado'],
      ['CU-09', 'Puesta\nal Día'],
      ['CU-10', 'Pago\nDiario'],
    ],
  },
  {
    pkg: 3,
    cus: [
      ['CU-11', 'Comisión\nAutomática'],
      ['CU-12', 'Consulta\nGanancias'],
      ['CU-13', 'Config.\nSplit'],
    ],
  },
  {
    pkg: 4,
    cus: [
      ['CU-14', 'Puntos por\nPago Puntual'],
      ['CU-15', 'Puntos por\nJornal'],
      ['CU-16', 'Canje de\nPuntos'],
      ['CU-17', 'Config.\nReglas Puntos'],
    ],
  },
  {
    pkg: 5,
    cus: [
      ['CU-18', 'Puntaje\nde Riesgo'],
      ['CU-19', 'Ruta\nInteligente'],
      ['CU-20', 'Predicción de\nMorosidad'],
      ['CU-21', 'Tablero de\nRecaudo'],
      ['CU-22', 'Detección de\nAnomalías'],
      ['CU-23', 'Estado de\nRiesgo Cliente'],
    ],
  },
];

// ─── Layout de paquetes: [x, y, w, h] ────────────────────────────────────────
const PKG_LAYOUT = [
  [195, 100, 400, 190],   // 0 Autenticación
  [630, 100, 380, 190],   // 1 Comunidad
  [195, 315, 640, 220],   // 2 Pagos
  [870, 315, 350, 220],   // 3 Comisiones
  [195, 560, 580, 200],   // 4 Puntos
  [195, 790, 840, 360],   // 5 IA/Análisis
];

// ─── Posición actores: [cx, cy] ───────────────────────────────────────────────
const ACTOR_POS = {
  'Vecino':       [80,  370],
  'Cobrador':     [80,  620],
  'Admin':        [1720, 280],
  'Sistema / IA': [1720, 880],
};

// ─── Relaciones actor → CU ────────────────────────────────────────────────────
const ACTOR_CU = {
  'Vecino':       ['CU-01','CU-02','CU-03','CU-06','CU-07','CU-08','CU-09','CU-10','CU-16','CU-23'],
  'Cobrador':     ['CU-01','CU-04','CU-06','CU-07','CU-08','CU-09','CU-10','CU-11','CU-12','CU-15','CU-18','CU-19'],
  'Admin':        ['CU-03','CU-04','CU-05','CU-13','CU-17','CU-18','CU-21','CU-22'],
  'Sistema / IA': ['CU-11','CU-14','CU-15','CU-18','CU-19','CU-20','CU-21','CU-22'],
};

// ─── Relaciones UML ───────────────────────────────────────────────────────────
const RELATIONS = [
  ['CU-06', 'CU-01', '«include»', '#555555'],
  ['CU-14', 'CU-06', '«extend»',  '#7B1FA2'],
  ['CU-15', 'CU-04', '«extend»',  '#7B1FA2'],
  ['CU-11', 'CU-06', '«extend»',  '#C62828'],
  ['CU-20', 'CU-07', '«extend»',  '#00838F'],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cuPositions(pkgRect, nCus) {
  const [px, py, pw, ph] = pkgRect;
  const headerH = 44;
  const areaX = px + 10, areaY = py + headerH + 8;
  const areaW = pw - 20, areaH = ph - headerH - 18;
  const cols = Math.min(nCus, 3);
  const rows = Math.ceil(nCus / cols);
  const cellW = areaW / cols, cellH = areaH / rows;
  const positions = [];
  for (let i = 0; i < nCus; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    positions.push([areaX + col * cellW + cellW / 2, areaY + row * cellH + cellH / 2]);
  }
  return positions;
}

function drawActor(ctx, cx, cy, color, label) {
  const r = 16;
  // Cabeza
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.stroke();
  // Cuerpo
  ctx.beginPath();
  ctx.moveTo(cx, cy + r);
  ctx.lineTo(cx, cy + r + 30);
  ctx.stroke();
  // Brazos
  ctx.beginPath();
  ctx.moveTo(cx - 22, cy + r + 12);
  ctx.lineTo(cx + 22, cy + r + 12);
  ctx.stroke();
  // Piernas
  ctx.beginPath();
  ctx.moveTo(cx, cy + r + 30);
  ctx.lineTo(cx - 18, cy + r + 55);
  ctx.moveTo(cx, cy + r + 30);
  ctx.lineTo(cx + 18, cy + r + 55);
  ctx.stroke();
  // Label
  ctx.fillStyle = color;
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  const lines = label.split('\n');
  const y0 = cy + r + 68;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, y0 + i * 15);
  }
  ctx.textAlign = 'left';
}

function drawPkg(ctx, x, y, w, h, info) {
  const tabW = 100, tabH = 20;
  // Tab
  ctx.fillStyle = info.stroke;
  ctx.fillRect(x, y, tabW, tabH);
  // Cuerpo
  ctx.fillStyle = info.fill;
  ctx.fillRect(x, y + tabH, w, h - tabH);
  ctx.strokeStyle = info.stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y + tabH, w, h - tabH);
  ctx.strokeRect(x, y, tabW, tabH);
  // Nombre
  ctx.fillStyle = info.stroke;
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(info.name, x + w / 2, y + tabH + 20);
  ctx.textAlign = 'left';
}

function drawEllipseCU(ctx, cx, cy, rx, ry, stroke) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function multilineCenter(ctx, cx, cy, text, fontSize, color) {
  const lines = text.split('\n');
  const lh = fontSize + 3;
  const startY = cy - (lines.length - 1) * lh / 2;
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'center';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, startY + i * lh);
  }
  ctx.textAlign = 'left';
}

function drawDashedLine(ctx, x1, y1, x2, y2, color) {
  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Fondo
  ctx.fillStyle = '#F5F7FC';
  ctx.fillRect(0, 0, W, H);

  // Barra de título
  ctx.fillStyle = '#1A237E';
  ctx.fillRect(0, 0, W, 56);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('JAAR — Diagrama de Casos de Uso General (Conjunto)', W / 2, 35);
  ctx.textAlign = 'left';

  // Rectángulo del sistema
  ctx.strokeStyle = '#1A237E';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#F8F9FF';
  ctx.fillRect(170, 70, 1460, 1205);
  ctx.strokeRect(170, 70, 1460, 1205);
  ctx.fillStyle = '#1A237E';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('«Sistema» JAAR — Junta de Agua y Alcantarillado Rural', 170 + 1460 / 2, 90);
  ctx.textAlign = 'left';

  const RX = 63, RY = 30;
  const cuCenters = {};

  // ── Dibujar paquetes y CUs ────────────────────────────────────────────────
  for (const pd of PACKAGES) {
    const info = PKGS[pd.pkg];
    const rect = PKG_LAYOUT[pd.pkg];
    const [px, py, pw, ph] = rect;
    drawPkg(ctx, px, py, pw, ph, info);

    const positions = cuPositions(rect, pd.cus.length);
    for (let i = 0; i < pd.cus.length; i++) {
      const [cuId, cuLabel] = pd.cus[i];
      const [cx, cy] = positions[i];
      cuCenters[cuId] = [cx, cy];

      drawEllipseCU(ctx, cx, cy, RX, RY, info.stroke);

      // ID
      ctx.fillStyle = info.stroke;
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(cuId, cx, cy - RY + 12);
      ctx.textAlign = 'left';

      // Etiqueta
      multilineCenter(ctx, cx, cy + 8, cuLabel, 10, '#1A1A1A');
    }
  }

  // ── Dibujar actores ───────────────────────────────────────────────────────
  for (const [actor, [ax, ay]] of Object.entries(ACTOR_POS)) {
    drawActor(ctx, ax, ay, ACTOR_CLR[actor], actor);
  }

  // ── Relaciones actor → CU ─────────────────────────────────────────────────
  for (const [actor, cus] of Object.entries(ACTOR_CU)) {
    const color = ACTOR_CLR[actor];
    const [ax, ay] = ACTOR_POS[actor];
    const actorFoot = [ax, ay + 16 + 55];

    for (const cuId of cus) {
      if (!cuCenters[cuId]) continue;
      const [cx, cy] = cuCenters[cuId];

      // Punto en el borde del óvalo (lado más cercano al actor)
      const dx = cx - ax;
      const angle = Math.atan2(cy - actorFoot[1], dx);
      const ex = cx - RX * Math.cos(angle);
      const ey = cy - RY * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(actorFoot[0], actorFoot[1]);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = color + '80'; // transparencia
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  // ── Relaciones UML include/extend ─────────────────────────────────────────
  for (const [src, dst, label, color] of RELATIONS) {
    if (!cuCenters[src] || !cuCenters[dst]) continue;
    const [sx, sy] = cuCenters[src];
    const [dx, dy] = cuCenters[dst];

    drawDashedLine(ctx, sx, sy, dx, dy, color);

    // Label
    const mx = (sx + dx) / 2, my = (sy + dy) / 2;
    ctx.font = '8px Arial';
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = '#FFFFCC';
    ctx.fillRect(mx - tw / 2 - 3, my - 8, tw + 6, 14);
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(mx - tw / 2 - 3, my - 8, tw + 6, 14);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(label, mx, my + 3);
    ctx.textAlign = 'left';
  }

  // ── Leyenda ───────────────────────────────────────────────────────────────
  const lx = 1635, ly = 1090;
  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(lx, ly, 160, 145);
  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 1;
  ctx.strokeRect(lx, ly, 160, 145);

  ctx.fillStyle = '#333333';
  ctx.font = 'bold 11px Arial';
  ctx.fillText('Leyenda', lx + 8, ly + 18);

  ctx.strokeStyle = '#777777';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(lx + 8, ly + 35); ctx.lineTo(lx + 38, ly + 35); ctx.stroke();
  ctx.fillStyle = '#555555';
  ctx.font = '9px Arial';
  ctx.fillText('Asociación actor→CU', lx + 44, ly + 39);

  ctx.save();
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = '#777777';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(lx + 8, ly + 55); ctx.lineTo(lx + 38, ly + 55); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  ctx.fillStyle = '#555555';
  ctx.fillText('«include» (obligatoria)', lx + 44, ly + 59);

  ctx.save();
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = '#7B1FA2';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(lx + 8, ly + 73); ctx.lineTo(lx + 38, ly + 73); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  ctx.fillStyle = '#7B1FA2';
  ctx.fillText('«extend» (opcional)', lx + 44, ly + 77);

  const actorColors = Object.entries(ACTOR_CLR);
  for (let i = 0; i < actorColors.length; i++) {
    const [name, color] = actorColors[i];
    const yy = ly + 92 + i * 13;
    ctx.fillStyle = color;
    ctx.fillRect(lx + 8, yy, 14, 10);
    ctx.fillStyle = '#333333';
    ctx.fillText(name, lx + 28, yy + 9);
  }

  // ── Guardar ───────────────────────────────────────────────────────────────
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
  fs.writeFileSync(OUTPUT_FILE, buffer);
  console.log(`✅ Guardado: ${OUTPUT_FILE}`);
}

render();
