# JAAR Digital · Cuentas Claras 💧

> **Sistema de Gestión para Juntas Administradoras de Acueductos Rurales (JAAR) — Panamá**  
> Aplicación Web Progresiva (PWA) · Offline-First · HTML + CSS + JavaScript Vainilla

---

## 🌐 Demo en Vivo

**[👉 Abrir la aplicación](https://[tu-usuario].github.io/[tu-repositorio]/)**

> Credenciales de demostración:
> | Usuario | Contraseña | Rol |
> |---|---|---|
> | `admin` | `admin123` | Administrador |
> | `cobrador` | `1234` | Cobrador / Tesorero |
> | `minsa` | `1234` | Inspector MINSA |
> | `cliente` | `1234` | Vecino / Cliente |

---

## 📋 Descripción del Proyecto

**JAAR Digital** es una solución tecnológica diseñada para digitalizar la gestión administrativa de los acueductos rurales comunitarios en Panamá, en cumplimiento del **Decreto Ejecutivo N° 1839** del Ministerio de Salud (MINSA).

### Problema que Resuelve
- ❌ Gestión manual en libretas (pérdida de datos, errores)
- ❌ Falta de transparencia en cobros y gastos
- ❌ Morosidad sin registro formal
- ❌ Dificultad para rendir cuentas al MINSA
- ❌ Zonas rurales **sin internet constante**

### Solución
Una PWA **Offline-First** que funciona sin internet, guarda datos localmente y los sincroniza cuando hay conexión.

---

## 🗂️ Módulos del Sistema

| Módulo | Archivo | Acceso |
|--------|---------|--------|
| 🔐 Login y Registro | `login.html` / `registro.html` | Público |
| 🛡️ Panel Admin | `admin.html` | Admin |
| 💧 Registro de Cobros | `index.html` | Cobrador |
| ⛏️ Jornales Comunitarios | `jornales.html` | Cobrador |
| 🧾 Egresos / Gastos | `gastos.html` | Cobrador |
| 💬 Foro de Avisos | `foro.html` | Cobrador (escribe) / Cliente (lee) |
| 👤 Historial del Cliente | `historial.html` | Cliente |
| 📊 Reporte MINSA | `reporte.html` | Cobrador / MINSA |

---

## 🔑 Sistema de Roles (RBAC)

```
Admin      → Aprobación de cuentas, Reset de contraseñas
Cobrador   → Cobros, Gastos, Jornales, Foro, Reportes
MINSA      → Solo vista de Reportes + Exportación PDF/Excel
Cliente    → Su historial personal + Leer avisos del Foro
```

---

## ⚙️ Tecnología

- **Frontend:** HTML5, CSS3, JavaScript Vainilla (Sin frameworks)
- **Persistencia:** `localStorage` (Offline-First)
- **PWA:** `manifest.json` (instalable en pantalla de inicio)
- **Exportación Excel:** [SheetJS](https://sheetjs.com/) (incluido localmente)
- **Backend (futuro):** Supabase (PostgreSQL)

---

## 📁 Estructura del Proyecto

```
JaarApp_Web/
├── login.html          # Página principal de acceso
├── registro.html       # Solicitud de nueva cuenta
├── admin.html          # Panel de administración
├── index.html          # Módulo de Cobros
├── jornales.html       # Módulo de Jornales
├── gastos.html         # Módulo de Egresos
├── foro.html           # Tablón de Avisos
├── historial.html      # Historial del Cliente
├── reporte.html        # Reporte Trimestral MINSA
├── styles.css          # Hoja de estilos global (Design System)
├── app.js              # Controlador de la vista Cobros
├── manifest.json       # Configuración PWA
└── js/
    ├── lib/
    │   └── xlsx.full.min.js  # SheetJS (offline)
    ├── store.js        # Capa de persistencia localStorage
    ├── auth.js         # Autenticación y control de roles
    ├── admin.js        # Lógica del panel admin
    ├── registro.js     # Lógica del formulario de registro
    ├── reporte.js      # Generación de reportes + Excel + PDF
    ├── foro.js         # Lógica del foro de avisos
    ├── gastos.js       # Lógica de egresos
    └── jornales.js     # Lógica de jornales comunitarios
```

---

## 🚀 Cómo Usar (Localmente)

1. Descarga o clona el repositorio:
   ```bash
   git clone https://github.com/[tu-usuario]/[tu-repositorio].git
   ```
2. Abre la carpeta `JaarApp_Web/`
3. Haz doble clic en `login.html`
4. ¡Listo! No requiere servidor ni instalación.

---

## 📄 Documentación

| Documento | Descripción |
|-----------|-------------|
| [📋 Propuesta del Proyecto](docs/propuesta.md) | Documento base de propuesta institucional |
| [🏗️ Arquitectura del Sistema](docs/arquitectura.md) | Diagrama y descripción técnica |
| [📌 Requisitos y Escenarios](docs/requisitos.md) | Casos de uso y flujos de trabajo |
| [📅 Plan de Desarrollo](docs/plan_desarrollo.md) | Hoja de ruta y mantenimiento |

---

## 👥 Equipo

Proyecto desarrollado en el marco del plan de digitalización de JAAR para **Panamá**.  
Para consultas institucionales: contactar al Ministerio de Salud (MINSA) — División de Ingeniería Sanitaria.

---

## 📜 Licencia

Este proyecto es de uso comunitario y gubernamental. Solo se permite su uso en beneficio de las Juntas Administradoras de Acueductos Rurales comunitarios.
