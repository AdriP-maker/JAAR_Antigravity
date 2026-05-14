# Plan de Desarrollo y Mantenimiento

## 1. Hoja de Ruta (Roadmap)

### ✅ Fase 1: Prototipo Web Funcional (COMPLETADA)
- PWA con todas las pantallas operativas (Login, Cobros, Jornales, Gastos, Foro, Historial, Reporte MINSA).
- Sistema de roles (Admin, Cobrador, MINSA, Cliente).
- Exportación dual PDF + Excel (SheetJS offline).
- Filtros por fecha y tipo en reportes.
- Gestión de usuarios con aprobación por administrador.

### 🔄 Fase 2: Piloto en Comunidad (PRÓXIMA)
- Despliegue en GitHub Pages para pruebas de acceso remoto.
- Conexión real con Supabase (reemplazar `localStorage` por SDK de Supabase).
- Autenticación real con Supabase Auth.
- Service Worker completo para caché offline de los archivos de la app.
- Pruebas reales con la JAAR Los Alonsos (Caballero, Antón).

### ⚙️ Fase 2.5: Nuevas Funcionalidades (EN DESARROLLO)

Implementación de tres ejes de evolución sobre la base existente, cubriendo RF-12 a RF-25.

#### Eje 1 — Pagos Flexibles (`js/pagos.js`)
- Motor `PagosEngine` con soporte a 6 tipos de pago: mensual, diario, multi-mes, parcial, adelanto, puesta al día.
- Libro mayor de saldos por usuario/mes (`jaar_saldos`).
- Modal de cobro con 5 tabs de tipo de pago en `index.html`.
- Migración no destructiva de datos legacy (`PagosEngine.migrarDatosAntiguos()`).
- Casos de uso: CU-06 a CU-10.

#### Eje 2 — Comisiones y Puntos (`js/comisiones.js`, `js/puntos.js`)
- Split configurable de ingresos: 60% desarrolladores / 40% cobrador.
- Dashboard de ganancias del cobrador (`comisiones.html`).
- Sistema de puntos acumulables por pagos puntuales, jornales y bonos trimestrales/anuales.
- Canje de puntos: 1 pt = B/.0.10 de descuento (mínimo 10 pts, máximo B/.1.50/mes).
- Configuración admin de splits y reglas de puntos (`puntos-admin.html`).
- Casos de uso: CU-11 a CU-17.

#### Eje 3 — Inteligencia Artificial (`js/ai-engine.js`, `js/ai-insights.js`)
- Puntaje de riesgo por hogar (0-100) con 5 pesos ponderados.
- Predicción de morosidad: `tasa_base × factor_estacional × factor_tendencia × factor_sector × factor_jornales`.
- Cola de prioridad "Ruta Inteligente" ordenada por riesgo + urgencia + sector geográfico.
- Detección de anomalías con Z-score sobre agregados mensuales.
- Panel de Inteligencia en `admin.html`, badges de riesgo en `index.html`, mensaje amigable en `historial.html`.
- Casos de uso: CU-18 a CU-23.

#### Métricas de éxito de la Fase 2.5
- Análisis IA completo < 100ms para 200 hogares.
- Renderizado de modal de cobro < 50ms.
- Exportación Excel con 8 hojas sin errores.
- Migración de datos legacy sin pérdida.

### 🚀 Fase 3: Despliegue Oficial V1
- Módulo de notificaciones push (nuevos avisos en el foro).
- Dashboard de métricas para el administrador.
- Backup automático a Supabase Storage.
- Soporte multi-JAAR (varias juntas en la misma instancia).

---

## 2. Estrategia de Despliegue

### GitHub Pages (Fase Piloto — Gratuito)
La aplicación se desplegará en **GitHub Pages** usando la rama `main`.  
URL resultante: `https://[usuario].github.io/[repositorio]/`

Ventajas:
- Gratuito y sin servidor.
- Actualización automática al hacer `git push`.
- Dominio HTTPS incluido.
- Accesible desde cualquier celular con internet.

### Supabase (Backend Futuro)
- **Free Tier:** Soporta hasta 500MB de DB y 50,000 filas sin costo.
- Suficiente para cubrir 1,000+ vecinos durante la fase piloto.
- Escalable a plan pagado si el proyecto crece.

---

## 3. Mantenimiento del Sistema

### Actualizaciones de Código
```bash
# Flujo de trabajo para actualizar la app
git add .
git commit -m "feat: descripción del cambio"
git push origin main
# GitHub Pages actualiza automáticamente en ~2 minutos
```

### Gestión de Usuarios
- El administrador (`admin` / `admin123`) tiene control total desde `admin.html`.
- Para resetear contraseñas: Admin → tabla de Activos → botón "🔑 Reset Clave".
- **En producción con Supabase:** Las contraseñas se resetean por email automático.

### Respaldo de Datos
- **Fase piloto:** Los datos están en el `localStorage` de cada dispositivo (Navegador).
- **Con Supabase:** Backups diarios automáticos en la nube.

---

## 4. Convenciones de Código

### Nomenclatura de Archivos
- HTML: nombre descriptivo en minúsculas (`jornales.html`, `reporte.html`)
- JS: un archivo por módulo en `js/` (`foro.js`, `gastos.js`)
- Documentación: en `docs/` en formato Markdown (`.md`)

### Commits (Git)
Usar prefijos semánticos:
```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de CSS sin lógica
refactor: reestructuración de código
```

---

## 5. Credenciales de Demo (Solo Prototipo)

> ⚠️ Cambiar antes del piloto real con usuarios reales.

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `cobrador` | `1234` | Cobrador |
| `minsa` | `1234` | Inspector MINSA |
| `cliente` | `1234` | Vecino Demo |
