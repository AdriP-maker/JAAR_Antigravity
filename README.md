# JAAR Digital · Cuentas Claras 💧

Sistema integral de gestión, cobranza y auditoría para las Juntas Administradoras de Acueductos Rurales de Panamá (JAAR). Diseñado con una arquitectura *Offline-First* que permite a los cobradores operar en comunidades sin acceso a internet, sincronizando los datos automáticamente cuando recuperan la conexión.

## 🚀 Características Principales

*   **Arquitectura Offline-First:** Uso de `IndexedDB` a través de `Dexie.js` para asegurar que todo el sistema (cobros, reportes, creación de usuarios) funcione sin conexión a internet.
*   **Gestión Multi-Rol:** 5 roles definidos con flujos y accesos independientes (`admin`, `cobrador`, `minsa`, `cliente`, `dev`).
*   **Motor de Gamificación:** Sistema de puntos automáticos que premia a los vecinos por pagos puntuales, meses adelantados, etc., permitiendo canjear puntos por descuentos.
*   **Reportes Oficiales:** Generación de reportes de ingresos, egresos y auditoría en formatos oficiales PDF (`jspdf`) y Excel (`xlsx`).
*   **Inteligencia Artificial (Ruta IA):** Motor de sugerencias para mejorar la relación entre cobrador y vecino, incluyendo un sistema de notificaciones.

## 🛠 Tecnologías Utilizadas

*   **Frontend:** React 18, Vite
*   **Base de Datos Local:** Dexie.js (IndexedDB wrapper)
*   **Estilos:** Vanilla CSS, CSS Variables (Soporte nativo Dark/Light Mode)
*   **Exportación de Datos:** jsPDF, jsPDF-AutoTable, SheetJS (xlsx)

## 📋 Requisitos Previos

*   [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
*   NPM o Yarn

## ⚙️ Instalación y Ejecución

1. Clona el repositorio o descarga el código fuente:
   ```bash
   git clone <url-del-repositorio>
   cd Pruebas_Antigravity
   ```

2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en la URL que indique la consola (usualmente `http://localhost:5173`).

## 🔐 Credenciales de Prueba (Entorno de Desarrollo)

Puedes acceder al sistema utilizando los siguientes roles y contraseñas por defecto (definidas en `src/utils/constants.js`):

| Rol | Usuario (Login) | Contraseña | Descripción |
| :--- | :--- | :--- | :--- |
| **Administrador Global** | `admin` | `admin123` | Control total del sistema, auditoría y finanzas. |
| **Cobrador en Campo** | `cobrador1` | `admin123` | Permite registrar cobros offline y ver sugerencias de IA. |
| **Auditor MINSA** | `minsa` | `admin123` | Solo lectura para emitir y descargar reportes oficiales. |
| **Soporte Técnico (Dev)** | `dev` | `admin123` | Solo lectura del log de auditoría del sistema, sin acceso a datos sensibles. |
| **Cliente / Vecino** | `cliente` | `1234` | Usuario de prueba. Ve su historial, pagos, puntos y avisos. |

## 🏗 Estructura del Proyecto

*   `/src/components/`: Componentes modulares y reutilizables.
*   `/src/context/`: Estados globales (Tema, Autenticación, Tostadas de alerta).
*   `/src/pages/`: Vistas principales de la aplicación por cada módulo.
*   `/src/services/`: Capa de lógica de negocio y comunicación con la base de datos Dexie.
*   `/src/utils/`: Funciones de formateo, criptografía y constantes del sistema.
*   `/docs/`: Documentación arquitectónica completa del proyecto.
