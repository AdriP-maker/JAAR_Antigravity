import fs from 'fs';
import https from 'https';
import path from 'path';

const docsDir = 'd:/JARR/JAAR_Antigravity/docs';

// Better DFD Context diagram - Left-to-Right layout with cleaner structure
const newContextDiagram = `
flowchart LR
    V["👤 Vecino / Cliente"]
    C["🏃 Cobrador en Campo"]
    A["👨‍💼 Administrador Global"]
    M["🏥 Auditor MINSA"]
    D["💻 Soporte Técnico"]
    SIMAP(["⚙️ 1.0\\nSIMAP Digital\\nCuentas Claras"])

    V -->|"Solicitud de Registro\\nCredenciales de Acceso\\nConfirmación de Jornal"| SIMAP
    SIMAP -->|"Historial de Pagos y Puntos\\nEstado de Riesgo Amigable\\nNotificaciones y Avisos"| V

    C -->|"Registro de Cobros\\nRegistro de Asistencias\\nRegistro de Gastos"| SIMAP
    SIMAP -->|"Ruta Inteligente IA\\nSugerencias de Diálogo\\nComisiones Ganadas"| C

    A -->|"Aprobación / Rechazo Vecinos\\nConfiguración de Reglas\\nSolicitud de Auditoría"| SIMAP
    SIMAP -->|"Tablero de Recaudo\\nAlertas de Anomalía\\nLogs de Auditoría"| A

    M -->|"Solicitud de Reportes\\nTrimestrales / Anuales"| SIMAP
    SIMAP -->|"Reportes Oficiales\\nPDF y Excel MINSA"| M

    D -->|"Solicitud de Logs\\nde Sistema Técnico"| SIMAP
    SIMAP -->|"Log de Auditoría\\n(Sin Datos Sensibles)"| D
`;

function downloadImage(name, code) {
  return new Promise((resolve, reject) => {
    const obj = { code: code.trim(), mermaid: { theme: "default" } };
    const json = JSON.stringify(obj);
    const base64 = Buffer.from(json).toString('base64');
    const url = `https://mermaid.ink/img/${base64}?width=1400`;
    const dest = path.join(docsDir, `${name}.png`);

    console.log(`Downloading ${name}...`);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed: ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log(`Done: ${name}.png`); resolve(); });
    }).on('error', reject);
  });
}

async function main() {
  await downloadImage('dfd_contexto', newContextDiagram);
  console.log('dfd_contexto.png updated successfully!');
}

main().catch(console.error);
