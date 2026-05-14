# Documento de Requerimientos Generales

**Proyecto:** JAAR Digital · Cuentas Claras — Sistema de Gestión para Juntas Administradoras de Acueductos Rurales  
**Fecha:** 13 / 05 / 2026  
**Versión:** 2.0  
**Ingenieros de Requisitos:** Equipo de Desarrollo JAAR  

---

## 1. Introducción

El presente documento describe los requerimientos funcionales y no funcionales del sistema **JAAR Digital · Cuentas Claras**, una Aplicación Web Progresiva (PWA) con enfoque **offline-first** diseñada para la gestión integral de las Juntas Administradoras de Acueductos Rurales (JAAR) en Panamá.

El sistema atiende las necesidades operativas de las juntas comunitarias encargadas de administrar los acueductos rurales del país, en cumplimiento con las disposiciones establecidas en el **Decreto Ejecutivo N° 1839 del Ministerio de Salud (MINSA)**, que regula la organización, funcionamiento y supervisión de estos entes comunitarios.

JAAR Digital permite a los administradores, cobradores y clientes de cada acueducto rural llevar un control transparente de cobros, pagos, gastos, jornales comunitarios y comunicaciones, incluso en zonas con conectividad limitada o inexistente. Al funcionar como PWA offline-first, toda la información se almacena localmente en el dispositivo y se sincroniza con la nube cuando hay conexión disponible, garantizando la continuidad operativa en las áreas rurales de Panamá.

---

## 2. Alcance del Sistema

El sistema abarca los siguientes módulos y procesos:

- **Registro y autenticación de usuarios** con cuatro roles diferenciados: administrador (`admin`), cobrador (`cobrador`), auditor del MINSA (`minsa`) y cliente/abonado (`cliente`).
- **Gestión de cobros flexibles**, incluyendo cobro mensual, cobro diario (jornal), pago parcial, pago de múltiples meses simultáneamente y pago por adelantado.
- **Control de jornales comunitarios**, con registro de participación de los clientes en trabajos comunitarios de mantenimiento del acueducto y confirmación por parte del cliente.
- **Control de gastos**, con registro detallado de egresos operativos y de mantenimiento de la junta.
- **Foro de avisos comunitarios**, para la comunicación entre la junta y los clientes mediante publicaciones y avisos importantes.
- **Sistema de comisiones** para el cobrador y los desarrolladores, con distribución configurable (60% desarrolladores / 40% cobrador) sobre las tarifas de servicio.
- **Sistema de puntos y recompensas** para incentivar el pago puntual y la participación comunitaria de los usuarios.
- **Inteligencia artificial aplicada a cobros**, proporcionando insights predictivos, detección de patrones de morosidad y recomendaciones de gestión.
- **Reportes para el MINSA** en formato PDF y Excel, cumpliendo con los requerimientos de información del Decreto Ejecutivo N° 1839.
- **Sincronización offline/online**, garantizando que el sistema funcione completamente sin conexión a internet y sincronice los datos cuando la conectividad esté disponible.

---

## 3. Listado General de Requerimientos por Áreas

### ÁREA 1: Gestión de Usuarios y Autenticación

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RF-001 | RF | Registro e inicio de sesión de usuarios | El sistema debe permitir el registro de usuarios con nombre, cédula/ID, rol asignado y contraseña. Debe soportar inicio de sesión con credenciales almacenadas localmente. | Obligatorio |
| RF-001b | RF | Gestión de roles y permisos (RBAC) | El sistema debe implementar control de acceso basado en roles (RBAC) con cuatro roles: admin, cobrador, minsa y cliente. Cada rol tendrá permisos específicos según la matriz de acceso definida. | Obligatorio |

---

### ÁREA 2: Cobros y Pagos Flexibles

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RF-002 | RF | Registro de cobros mensuales | El sistema debe permitir registrar cobros mensuales a los clientes/abonados con la tarifa establecida por la junta. | Obligatorio |
| RF-009 | RF | Filtros de cobros por mes y estado | El sistema debe permitir filtrar los cobros por mes específico y por estado de pago (activo, moroso, corte). | Obligatorio |
| RF-010 | RF | Estados de pago del cliente | El sistema debe gestionar tres estados de pago para cada cliente: **activo** (al día), **moroso** (con meses pendientes) y **corte** (servicio suspendido por morosidad prolongada). | Obligatorio |
| RF-012 | RF | Pago parcial | El sistema debe permitir registrar pagos parciales cuando el cliente no puede cubrir el monto total del mes, manteniendo el saldo pendiente. | Obligatorio |
| RF-013 | RF | Pago de múltiples meses | El sistema debe permitir registrar el pago de varios meses en una sola transacción (pago multi-mes). | Obligatorio |
| RF-014 | RF | Pago por adelantado | El sistema debe permitir que un cliente pague meses futuros por adelantado, registrando cada mes como pagado. | Deseado |
| RF-015 | RF | Cobro diario (jornal) | El sistema debe soportar un modelo de cobro diario para juntas que manejen tarifas por jornada en lugar de tarifas mensuales. | Deseado |
| RF-016 | RF | Recibo/comprobante de pago | El sistema debe generar un comprobante digital de cada pago realizado, consultable por el cliente y el cobrador. | Obligatorio |

---

### ÁREA 3: Control de Caja y Gastos

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RF-003 | RF | Registro y control de gastos | El sistema debe permitir registrar gastos operativos de la junta (materiales, reparaciones, insumos, transporte, etc.) con fecha, monto, descripción y categoría. Debe mantener un balance de caja actualizado. | Obligatorio |

---

### ÁREA 4: Jornales Comunitarios

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RF-004 | RF | Registro de jornales comunitarios | El sistema debe permitir registrar jornales (trabajos comunitarios) programados por la junta, incluyendo fecha, descripción de la actividad y lista de participantes. | Obligatorio |
| RF-011 | RF | Confirmación de jornal por el cliente | El sistema debe permitir que cada cliente confirme su participación en un jornal comunitario, validando la asistencia registrada por el administrador. | Obligatorio |

---

### ÁREA 5: Comunicación Comunitaria

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RF-005 | RF | Foro de avisos comunitarios | El sistema debe proporcionar un módulo de foro/tablón de avisos donde el administrador y los cobradores puedan publicar avisos, noticias y comunicados para la comunidad. Los clientes podrán visualizar los avisos. | Obligatorio |

---

### ÁREA 6: Historial y Transparencia

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RF-006 | RF | Historial de pagos y transacciones | El sistema debe mantener un historial completo de todos los pagos, cobros, gastos y movimientos financieros, accesible según los permisos del rol del usuario. El cliente debe poder consultar su propio historial de pagos. | Obligatorio |

---

### ÁREA 7: Reportes e Informes

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RF-007 | RF | Generación de reportes MINSA | El sistema debe generar reportes en formato PDF y Excel cumpliendo con los formatos requeridos por el MINSA según el Decreto Ejecutivo N° 1839. Incluye reportes de ingresos, gastos, morosidad, jornales y estado general de la junta. Los reportes deben poder generarse en modo offline. | Obligatorio |

---

### ÁREA 8: Sincronización y Conectividad

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RF-008 | RF | Sincronización offline/online | El sistema debe funcionar completamente sin conexión a internet (offline-first), almacenando todos los datos en localStorage del navegador. Cuando se detecte conexión, el sistema debe sincronizar automáticamente los datos con el servidor en la nube, resolviendo conflictos de datos. | Obligatorio |

---

### ÁREA 9: Sistema de Comisiones

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RF-017 | RF | Cálculo automático de comisiones | El sistema debe calcular automáticamente las comisiones generadas por cada cobro realizado, distribuyéndolas según la configuración establecida: 60% para los desarrolladores y 40% para el cobrador. | Obligatorio |
| RF-018 | RF | Reporte de comisiones | El sistema debe generar reportes detallados de comisiones acumuladas por período, desglosados por cobrador y por concepto. | Obligatorio |
| RF-021 | RF | Configuración de porcentajes de comisión | El administrador debe poder ajustar los porcentajes de distribución de comisiones según acuerdos vigentes. | Deseado |

---

### ÁREA 10: Sistema de Puntos y Recompensas

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RF-019 | RF | Acumulación de puntos por acciones | El sistema debe otorgar puntos a los clientes por acciones positivas: pago puntual, participación en jornales comunitarios, pagos adelantados y otros comportamientos deseables definidos por la junta. | Obligatorio |
| RF-020 | RF | Catálogo y canje de recompensas | El sistema debe mantener un catálogo de recompensas canjeables por puntos (descuentos en tarifa, reconocimientos, etc.) y permitir que los clientes canjeen sus puntos acumulados. | Deseado |
| RF-021b | RF | Dashboard de puntos del cliente | Cada cliente debe poder visualizar su saldo de puntos, historial de puntos ganados y canjeados, y las recompensas disponibles. | Deseado |

---

### ÁREA 11: Inteligencia Artificial Aplicada

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RF-022 | RF | Predicción de morosidad | El sistema debe analizar patrones históricos de pago para predecir qué clientes tienen alta probabilidad de caer en morosidad, permitiendo acciones preventivas. | Deseado |
| RF-023 | RF | Insights de recaudación | El sistema debe generar insights automáticos sobre tendencias de recaudación, comparativas mensuales y proyecciones de ingresos basadas en datos históricos. | Deseado |
| RF-024 | RF | Recomendaciones de gestión | El sistema debe proporcionar recomendaciones inteligentes al administrador, como mejores horarios de cobro, rutas óptimas para el cobrador y estrategias de reducción de morosidad. | Deseado |
| RF-025 | RF | Análisis de salud financiera | El sistema debe calcular y presentar indicadores de salud financiera de la junta: tasa de recaudación, ratio de morosidad, sostenibilidad operativa y tendencias a largo plazo. | Deseado |

---

## 4. Requerimientos No Funcionales

| ID | Tipo | Nombre del Requisito | Descripción | Prioridad |
|----|------|----------------------|-------------|-----------|
| RNF-001 | RNF | Offline-First | El sistema debe funcionar completamente sin conexión a internet. Todas las operaciones CRUD, generación de reportes y consultas deben operar con datos locales (localStorage). La sincronización con la nube es secundaria y ocurre cuando hay conectividad disponible. | Obligatorio |
| RNF-002 | RNF | Portabilidad | El sistema debe funcionar en cualquier navegador web moderno (Chrome, Firefox, Safari, Edge) y en cualquier dispositivo (celular, tableta, computadora) sin necesidad de instalación nativa. Como PWA, debe ser instalable desde el navegador. | Obligatorio |
| RNF-003 | RNF | Seguridad (RBAC) | El sistema debe implementar Control de Acceso Basado en Roles (RBAC) robusto, asegurando que cada usuario solo pueda acceder a las funcionalidades y datos correspondientes a su rol asignado. Las contraseñas deben almacenarse con hash seguro. | Obligatorio |
| RNF-004 | RNF | Privacidad de datos | El sistema debe proteger la información personal de los clientes y las transacciones financieras. Los datos almacenados localmente deben estar protegidos y no ser accesibles por aplicaciones de terceros. | Obligatorio |
| RNF-005 | RNF | Rendimiento | Los análisis de inteligencia artificial deben ejecutarse en menos de 100 milisegundos para comunidades de hasta 200 hogares. Las operaciones CRUD deben tener un tiempo de respuesta inferior a 500 milisegundos. | Obligatorio |
| RNF-006 | RNF | Exportación offline | El sistema debe permitir la generación y descarga de reportes en formato PDF y Excel sin necesidad de conexión a internet, utilizando bibliotecas de generación del lado del cliente. | Obligatorio |
| RNF-007 | RNF | Diseño responsivo | La interfaz debe ser completamente adaptable a dispositivos móviles, priorizando la experiencia en celulares ya que es el dispositivo principal de los cobradores en campo. | Obligatorio |
| RNF-008 | RNF | Mantenibilidad | El código debe ser modular, documentado y seguir convenciones de desarrollo estándar para facilitar el mantenimiento y la evolución del sistema. | Obligatorio |

---

## 5. Modelo de Datos (localStorage)

El sistema utiliza `localStorage` del navegador como almacenamiento principal, siguiendo el enfoque offline-first. Las siguientes claves definen el modelo de datos:

| Clave localStorage | Descripción | Estructura |
|---------------------|-------------|------------|
| `jaar_users` | Registro de todos los usuarios del sistema | Array de objetos: `{ id, nombre, cedula, rol, passwordHash, estado, fechaRegistro }` |
| `jaar_pagos` | Registro de todos los pagos y cobros realizados | Array de objetos: `{ id, clienteId, monto, mes, anio, fecha, tipo, cobradorId, parcial, saldoPendiente }` |
| `jaar_saldos` | Saldos y estados de cuenta de cada cliente | Array de objetos: `{ clienteId, saldoPendiente, mesesPendientes, estado, ultimoPago }` |
| `jaar_comisiones` | Registro de comisiones generadas | Array de objetos: `{ id, pagoId, cobradorId, montoTotal, montoCobrador, montoDevs, fecha }` |
| `jaar_puntos` | Puntos acumulados por cada cliente | Array de objetos: `{ clienteId, puntosActuales, historial: [{ accion, puntos, fecha }] }` |
| `jaar_gastos` | Registro de gastos operativos de la junta | Array de objetos: `{ id, descripcion, monto, categoria, fecha, registradoPor }` |
| `jaar_jornales` | Registro de jornales comunitarios | Array de objetos: `{ id, fecha, descripcion, participantes: [{ clienteId, confirmado }] }` |
| `jaar_avisos` | Avisos del foro comunitario | Array de objetos: `{ id, titulo, contenido, autorId, fecha, tipo }` |
| `jaar_config` | Configuración general del sistema | Objeto: `{ tarifaMensual, porcentajeDevs, porcentajeCobrador, nombreJunta, comunidad }` |
| `jaar_sync` | Control de sincronización offline/online | Objeto: `{ ultimaSync, pendientes: [], conflictos: [] }` |
| `jaar_recompensas` | Catálogo de recompensas canjeables | Array de objetos: `{ id, nombre, descripcion, costoPuntos, disponible }` |
| `jaar_ia_cache` | Caché de análisis de inteligencia artificial | Objeto: `{ predicciones, insights, recomendaciones, ultimoAnalisis }` |

---

## 6. Roles del Sistema

El sistema maneja cuatro roles con permisos diferenciados:

### Descripción de Roles

| Rol | Descripción |
|-----|-------------|
| **admin** | Administrador de la junta. Tiene acceso completo a todas las funcionalidades del sistema: gestión de usuarios, cobros, gastos, jornales, reportes, configuración de comisiones y supervisión general. |
| **cobrador** | Encargado de realizar los cobros en campo. Puede registrar pagos, consultar estados de cuenta de clientes, ver sus comisiones y publicar avisos. |
| **minsa** | Auditor del Ministerio de Salud. Tiene acceso de solo lectura a reportes financieros, estadísticas de la junta y cumplimiento regulatorio según el Decreto Ejecutivo N° 1839. |
| **cliente** | Abonado/usuario del servicio de agua. Puede consultar su estado de cuenta, historial de pagos, confirmar jornales, ver avisos comunitarios y gestionar sus puntos de recompensa. |

### Matriz de Acceso por Rol

| Funcionalidad | admin | cobrador | minsa | cliente |
|---------------|:-----:|:--------:|:-----:|:-------:|
| Gestión de usuarios | ✅ | ❌ | ❌ | ❌ |
| Registrar cobros/pagos | ✅ | ✅ | ❌ | ❌ |
| Consultar cobros (todos) | ✅ | ✅ | ✅ | ❌ |
| Consultar pagos propios | — | — | — | ✅ |
| Registrar gastos | ✅ | ❌ | ❌ | ❌ |
| Consultar gastos | ✅ | ❌ | ✅ | ❌ |
| Crear jornales | ✅ | ❌ | ❌ | ❌ |
| Confirmar jornal propio | — | — | — | ✅ |
| Consultar jornales | ✅ | ✅ | ✅ | ✅ |
| Publicar avisos | ✅ | ✅ | ❌ | ❌ |
| Ver avisos | ✅ | ✅ | ✅ | ✅ |
| Generar reportes MINSA | ✅ | ❌ | ✅ | ❌ |
| Ver comisiones (todas) | ✅ | ❌ | ❌ | ❌ |
| Ver comisiones propias | — | ✅ | — | — |
| Configurar sistema | ✅ | ❌ | ❌ | ❌ |
| Ver puntos propios | — | — | — | ✅ |
| Gestionar recompensas | ✅ | ❌ | ❌ | ❌ |
| Canjear recompensas | — | — | — | ✅ |
| Ver análisis IA | ✅ | ✅ | ✅ | ❌ |
| Filtrar cobros (mes/estado) | ✅ | ✅ | ✅ | ❌ |
| Cambiar estado de pago | ✅ | ✅ | ❌ | ❌ |

---

## 7. Resumen Estadístico

| Categoría | Obligatorios | Deseados | Total |
|-----------|:------------:|:--------:|:-----:|
| Requerimientos Funcionales (RF) | 14 | 7 | 21 |
| Requerimientos No Funcionales (RNF) | 8 | 0 | 8 |
| **TOTAL** | **22** | **7** | **29** |

---

*Documento elaborado bajo metodología de Ingeniería de Requisitos*  
*Sistema: JAAR Digital · Cuentas Claras — Versión 2.0*  
*Conforme al Decreto Ejecutivo N° 1839 del MINSA, República de Panamá*
