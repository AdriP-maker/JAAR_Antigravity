# Fichas de Requisitos — JAAR Digital · Cuentas Claras

> Sistema de gestión de acueductos rurales para Panamá

---

## FICHA DE REQUISITO — RF-001

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-001 |
| **Nombre** | Gestión de Usuarios |
| **Descripción** | El sistema debe permitir registrar nuevos usuarios (administradores, cobradores, clientes) con un flujo de aprobación por parte del administrador. Debe incluir funcionalidades de suspensión temporal de cuentas, reseteo de contraseña y activación/desactivación de usuarios. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Junta Administradora de Acueducto Rural (JAAR) |
| **Etapa del Proyecto** | Análisis y Diseño |
| **Observación** | El registro de nuevos usuarios queda en estado pendiente hasta que un administrador lo apruebe. El reseteo de contraseña se realiza vía correo electrónico o enlace temporal. |

---

## FICHA DE REQUISITO — RF-002

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-002 |
| **Nombre** | Registro de Cobros Offline/Online |
| **Descripción** | El sistema debe permitir al cobrador registrar pagos de los clientes tanto en modo online (con conexión a internet) como en modo offline (sin conexión). Los cobros registrados en modo offline deben almacenarse localmente y sincronizarse automáticamente al recuperar la conectividad. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Cobrador de campo / JAAR Piloto Caballero (Antón) |
| **Etapa del Proyecto** | Implementación |
| **Observación** | La funcionalidad offline es crítica dado que muchas comunidades rurales carecen de cobertura de datos móviles estable. Se utiliza almacenamiento local (IndexedDB / SQLite) como respaldo. |

---

## FICHA DE REQUISITO — RF-003

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-003 |
| **Nombre** | Control de Caja y Gastos |
| **Descripción** | El sistema debe registrar las entradas de dinero (cobros) y las salidas (gastos operativos del acueducto: compra de cloro, tuberías, reparaciones, etc.). Debe calcular el saldo disponible en caja y generar un resumen de movimientos por período. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Tesorero de la JAAR |
| **Etapa del Proyecto** | Implementación |
| **Observación** | Los gastos deben categorizarse (mantenimiento, insumos, administrativos, emergencias). El cierre de caja debe poder realizarse mensualmente con firma del tesorero y presidente de la junta. |

---

## FICHA DE REQUISITO — RF-004

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-004 |
| **Nombre** | Control de Jornales |
| **Descripción** | El sistema debe gestionar la asistencia a jornales comunitarios (limpieza de tanques, mantenimiento de tuberías, etc.). Incluye registro de asistencia, designación de sustitutos cuando un cliente no puede asistir y aplicación de multas por inasistencia injustificada. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Reglamento interno de la JAAR |
| **Etapa del Proyecto** | Implementación |
| **Observación** | La multa por inasistencia es configurable por la junta. El sustituto debe ser registrado antes del jornal. La asistencia se confirma tanto por el administrador como por el cliente (ver RF-011). |

---

## FICHA DE REQUISITO — RF-005

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-005 |
| **Nombre** | Foro de Avisos |
| **Descripción** | El sistema debe proporcionar un módulo de avisos donde la junta directiva pueda publicar comunicados dirigidos a toda la comunidad (cortes de agua programados, convocatorias a jornales, reuniones, avisos de morosidad general, etc.). Los clientes deben poder visualizar los avisos al ingresar al sistema. |
| **Prioridad** | ☐ Obligatorio &nbsp;&nbsp; ☑ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Presidente de la JAAR |
| **Etapa del Proyecto** | Implementación – Fase 2 |
| **Observación** | Los avisos deben tener fecha de publicación, fecha de vigencia y prioridad (urgente, informativo). Posibilidad futura de notificaciones push. |

---

## FICHA DE REQUISITO — RF-006

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-006 |
| **Nombre** | Historial del Cliente |
| **Descripción** | El sistema debe mantener un historial completo por cada cliente/hogar que incluya: todos los pagos realizados, meses en mora, multas aplicadas, jornales cumplidos, puntos acumulados y cualquier observación registrada por la junta. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Secretario de la JAAR |
| **Etapa del Proyecto** | Implementación |
| **Observación** | El historial debe ser consultable por rango de fechas y exportable. Sirve como respaldo ante disputas de pago con los clientes. |

---

## FICHA DE REQUISITO — RF-007

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-007 |
| **Nombre** | Reportes MINSA |
| **Descripción** | El sistema debe generar los reportes requeridos por el Ministerio de Salud (MINSA) para la supervisión de acueductos rurales. Los reportes deben poder exportarse en formato PDF y Excel, e incluir datos de recaudación, cantidad de abonados, estado de morosidad y mantenimiento realizado. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Normativa MINSA / JAAR |
| **Etapa del Proyecto** | Implementación – Módulo de reportes |
| **Observación** | El formato del reporte debe ajustarse a las plantillas oficiales exigidas por el MINSA. Se recomienda automatizar la generación mensual. |

---

## FICHA DE REQUISITO — RF-008

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-008 |
| **Nombre** | Sincronización Automática con Supabase |
| **Descripción** | El sistema debe sincronizar automáticamente los datos locales (cobros, asistencia, gastos) con la base de datos en la nube (Supabase) cuando se detecte conexión a internet. La sincronización debe manejar conflictos de datos y garantizar la integridad referencial. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Equipo de desarrollo / Arquitectura técnica |
| **Etapa del Proyecto** | Implementación |
| **Observación** | Se debe implementar un mecanismo de resolución de conflictos (última escritura gana o merge manual). La sincronización debe ejecutarse en segundo plano sin bloquear la interfaz del usuario. |

---

## FICHA DE REQUISITO — RF-009

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-009 |
| **Nombre** | Filtros en Cobros |
| **Descripción** | El sistema debe permitir filtrar la lista de cobros por mes de facturación y por estado de pago (pagado, pendiente, parcial). Los filtros deben poder combinarse para facilitar la consulta y gestión de cobros. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Cobrador de campo |
| **Etapa del Proyecto** | Implementación |
| **Observación** | Los filtros deben ser persistentes durante la sesión del usuario. Incluir opción de búsqueda por nombre o número de lote del cliente. |

---

## FICHA DE REQUISITO — RF-010

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-010 |
| **Nombre** | Estados de Pago |
| **Descripción** | El sistema debe clasificar automáticamente a cada cliente/hogar en uno de tres estados de pago: **Activo** (al día con sus pagos), **Moroso** (con 1 o más meses de atraso) o **Para Corte** (con 3 o más meses de atraso, sujeto a suspensión del servicio). El estado debe actualizarse automáticamente al registrar pagos o al cambiar de mes. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Reglamento interno de la JAAR |
| **Etapa del Proyecto** | Implementación |
| **Observación** | Los umbrales de meses para cada estado deben ser configurables por el administrador. El cambio de estado debe generar una notificación al cliente afectado. |

---

## FICHA DE REQUISITO — RF-011

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-011 |
| **Nombre** | Confirmación de Jornal por el Cliente |
| **Descripción** | El sistema debe permitir al cliente confirmar su asistencia a un jornal comunitario desde su perfil. Esta confirmación complementa el registro que hace el administrador, generando una doble validación de la asistencia. |
| **Prioridad** | ☐ Obligatorio &nbsp;&nbsp; ☑ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Clientes de la comunidad / JAAR Piloto Caballero |
| **Etapa del Proyecto** | Implementación – Fase 2 |
| **Observación** | La confirmación del cliente tiene una ventana de tiempo (ej. 48 horas después del jornal). Si hay discrepancia entre la confirmación del administrador y la del cliente, el sistema debe alertar al presidente de la junta. |

---

## FICHA DE REQUISITO — RF-012

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-012 |
| **Nombre** | Pagos Parciales |
| **Descripción** | El sistema debe permitir al cliente realizar pagos parciales de su cuota mensual. El monto abonado se acumula hasta completar el total de la cuota del mes correspondiente. El sistema debe mostrar claramente el saldo restante por pagar para ese mes. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Clientes de la comunidad / Cobrador de campo |
| **Etapa del Proyecto** | Implementación – Nuevas funcionalidades |
| **Observación** | Cada abono parcial debe quedar registrado como una transacción independiente con fecha, monto y cobrador. El estado del mes pasa de "pendiente" a "parcial" y finalmente a "pagado" al completar la cuota. |

---

## FICHA DE REQUISITO — RF-013

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-013 |
| **Nombre** | Pagos Multi-Mes |
| **Descripción** | El sistema debe permitir al cliente pagar varios meses a la vez en una sola transacción. El cobrador selecciona los meses a cubrir y el sistema calcula el monto total. Cada mes queda registrado individualmente como pagado. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Cobrador de campo / Clientes |
| **Etapa del Proyecto** | Implementación – Nuevas funcionalidades |
| **Observación** | El pago multi-mes genera un único recibo con el desglose de los meses cubiertos. Se aplica una comisión por cada mes incluido (ver RF-017). |

---

## FICHA DE REQUISITO — RF-014

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-014 |
| **Nombre** | Pagos Diarios |
| **Descripción** | El sistema debe permitir registrar pagos diarios a una tarifa de B/.0.10 por día. Esta modalidad permite a los clientes con menor capacidad económica ir abonando diariamente hasta completar la cuota mensual. El sistema acumula los pagos diarios y los aplica al mes en curso. |
| **Prioridad** | ☐ Obligatorio &nbsp;&nbsp; ☑ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Cobrador de campo / Comunidad rural |
| **Etapa del Proyecto** | Implementación – Nuevas funcionalidades |
| **Observación** | La tarifa diaria (B/.0.10) debe ser configurable por el administrador. El cobrador debe poder registrar múltiples días en una sola visita (ej. pago de 5 días = B/.0.50). Al acumular el equivalente de la cuota mensual, el mes se marca como pagado. |

---

## FICHA DE REQUISITO — RF-015

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-015 |
| **Nombre** | Puesta al Día |
| **Descripción** | El sistema debe ofrecer la opción de "Puesta al Día" que permite al cliente pagar toda su deuda acumulada (meses en mora, multas pendientes) en un solo pago. El sistema calcula automáticamente el monto total adeudado y genera un resumen antes de confirmar la transacción. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Tesorero de la JAAR / Cobrador |
| **Etapa del Proyecto** | Implementación – Nuevas funcionalidades |
| **Observación** | Al completar la puesta al día, el estado del cliente cambia automáticamente a "Activo". El recibo generado debe detallar cada concepto cancelado (meses, multas). La junta puede configurar si se otorgan descuentos por puesta al día. |

---

## FICHA DE REQUISITO — RF-016

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-016 |
| **Nombre** | Pagos Adelantados |
| **Descripción** | El sistema debe permitir al cliente pagar meses futuros por adelantado. El cobrador selecciona los meses futuros a cubrir y el sistema los registra como pagados anticipadamente, evitando que generen cobro cuando llegue su fecha. |
| **Prioridad** | ☐ Obligatorio &nbsp;&nbsp; ☑ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Clientes / Cobrador de campo |
| **Etapa del Proyecto** | Implementación – Nuevas funcionalidades |
| **Observación** | Los pagos adelantados deben diferenciarse visualmente en el historial del cliente. Si la tarifa cambia en el futuro, los meses ya pagados por adelantado no se ven afectados por el cambio de tarifa. |

---

## FICHA DE REQUISITO — RF-017

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-017 |
| **Nombre** | Comisiones por Cobro |
| **Descripción** | El sistema debe aplicar una comisión fija de B/.1.00 por cada pago registrado. Esta comisión se distribuye automáticamente: 60% para los desarrolladores de la plataforma y 40% para el cobrador que realizó la transacción. El sistema debe llevar un registro detallado de las comisiones generadas. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Modelo de negocio JAAR Digital |
| **Etapa del Proyecto** | Implementación – Nuevas funcionalidades |
| **Observación** | La comisión de B/.1.00 y el porcentaje de distribución (60/40) deben ser configurables por el administrador del sistema (ver RF-021). La comisión se cobra adicional a la tarifa del agua y se muestra desglosada en el recibo del cliente. |

---

## FICHA DE REQUISITO — RF-018

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-018 |
| **Nombre** | Dashboard de Ganancias del Cobrador |
| **Descripción** | El sistema debe proporcionar un panel de control personalizado para cada cobrador donde pueda visualizar: total de comisiones acumuladas en el período, cantidad de cobros realizados, promedio de cobros por día, comparativo con períodos anteriores y proyección de ganancias del mes. |
| **Prioridad** | ☐ Obligatorio &nbsp;&nbsp; ☑ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Cobrador de campo / Modelo de negocio |
| **Etapa del Proyecto** | Implementación – Nuevas funcionalidades |
| **Observación** | El dashboard debe incluir gráficos visuales (barras, líneas) para facilitar la comprensión. El cobrador solo ve sus propias ganancias; el administrador puede ver las de todos los cobradores. |

---

## FICHA DE REQUISITO — RF-019

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-019 |
| **Nombre** | Sistema de Puntos |
| **Descripción** | El sistema debe implementar un mecanismo de acumulación de puntos para los clientes basado en comportamientos positivos: pagos puntuales (antes de la fecha límite), asistencia a jornales comunitarios, pagos adelantados y participación en actividades de la JAAR. Los puntos se acumulan por hogar. |
| **Prioridad** | ☐ Obligatorio &nbsp;&nbsp; ☑ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Equipo JAAR / Estrategia de fidelización |
| **Etapa del Proyecto** | Implementación – Nuevas funcionalidades |
| **Observación** | La cantidad de puntos otorgados por cada acción debe ser configurable por el administrador (ver RF-021). Los puntos no expiran salvo que la junta lo determine. El balance de puntos debe ser visible para el cliente en su perfil. |

---

## FICHA DE REQUISITO — RF-020

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-020 |
| **Nombre** | Canje de Puntos por Descuentos |
| **Descripción** | El sistema debe permitir al cliente canjear sus puntos acumulados por descuentos en su cuota mensual, a razón de 1 punto = B/.0.10 de descuento. El canje se realiza al momento del cobro y el descuento se aplica directamente sobre el monto a pagar. |
| **Prioridad** | ☐ Obligatorio &nbsp;&nbsp; ☑ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Equipo JAAR / Estrategia de fidelización |
| **Etapa del Proyecto** | Implementación – Nuevas funcionalidades |
| **Observación** | El valor del punto (B/.0.10) debe ser configurable (ver RF-021). Debe existir un límite máximo de descuento por mes (ej. no más del 50% de la cuota). El canje debe reflejarse en el recibo y en el historial de puntos del cliente. |

---

## FICHA DE REQUISITO — RF-021

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-021 |
| **Nombre** | Configuración Admin de Comisiones y Puntos |
| **Descripción** | El sistema debe proporcionar un panel de configuración exclusivo para administradores donde se puedan ajustar: monto de la comisión por cobro, porcentaje de distribución de la comisión (devs/cobrador), puntos otorgados por cada acción premiada, valor monetario de cada punto, límites de canje y reglas de expiración de puntos. |
| **Prioridad** | ☑ Obligatorio &nbsp;&nbsp; ☐ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Modelo de negocio JAAR Digital / Administrador |
| **Etapa del Proyecto** | Implementación – Nuevas funcionalidades |
| **Observación** | Los cambios en la configuración deben aplicarse a partir de la fecha de modificación (no retroactivamente). Se debe mantener un log de auditoría de cada cambio realizado en la configuración con fecha, usuario y valores anteriores/nuevos. |

---

## FICHA DE REQUISITO — RF-022

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-022 |
| **Nombre** | Puntaje de Riesgo por Hogar |
| **Descripción** | El sistema debe calcular un puntaje de riesgo de morosidad para cada hogar en una escala de 0 a 100 mediante analítica basada en inteligencia artificial. El cálculo considera variables como: historial de pagos, frecuencia de atrasos, meses consecutivos en mora, asistencia a jornales, antigüedad como cliente y patrones estacionales de pago. |
| **Prioridad** | ☐ Obligatorio &nbsp;&nbsp; ☑ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Equipo de desarrollo / Analítica de datos |
| **Etapa del Proyecto** | Implementación – Fase IA |
| **Observación** | El puntaje es informativo y se muestra al administrador y cobrador. No debe generar acciones automáticas sobre el cliente (no cortes automáticos por puntaje alto). El modelo de IA debe recalcularse periódicamente (sugerido: semanalmente). Un puntaje cercano a 0 indica bajo riesgo; cercano a 100 indica alto riesgo. |

---

## FICHA DE REQUISITO — RF-023

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-023 |
| **Nombre** | Ruta Inteligente de Cobro |
| **Descripción** | El sistema debe generar una ruta optimizada de cobro para el cobrador, priorizando los hogares según su puntaje de riesgo (RF-022) y agrupándolos por sector geográfico. La ruta sugiere el orden de visitas para maximizar la recaudación y minimizar el desplazamiento. |
| **Prioridad** | ☐ Obligatorio &nbsp;&nbsp; ☑ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Cobrador de campo / Equipo de desarrollo |
| **Etapa del Proyecto** | Implementación – Fase IA |
| **Observación** | La ruta es una sugerencia; el cobrador puede modificar el orden manualmente. Se debe considerar la información de sectores/barrios de la comunidad. Integración futura con mapas (Google Maps / OpenStreetMap) para visualización geográfica. |

---

## FICHA DE REQUISITO — RF-024

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-024 |
| **Nombre** | Predicción de Morosidad |
| **Descripción** | El sistema debe generar predicciones sobre la probabilidad de morosidad futura a nivel individual (por hogar) y agregado (por comunidad). Debe mostrar insights como: hogares con alta probabilidad de caer en mora el próximo mes, tendencias de recaudo mensual y estacionalidad de la morosidad. |
| **Prioridad** | ☐ Obligatorio &nbsp;&nbsp; ☑ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Equipo de desarrollo / Analítica de datos |
| **Etapa del Proyecto** | Implementación – Fase IA |
| **Observación** | Las predicciones son puramente informativas (insights), no generan ajustes automáticos en tarifas, estados de pago ni acciones de corte. El administrador utiliza estos datos para tomar decisiones preventivas (ej. contactar a clientes en riesgo antes de que caigan en mora). |

---

## FICHA DE REQUISITO — RF-025

| Campo | Detalle |
|-------|---------|
| **Proyecto** | JAAR Digital · Cuentas Claras |
| **Fecha** | 13/05/2026 |
| **Ingeniero de Requisitos** | Equipo JAAR |
| **ID** | RF-025 |
| **Nombre** | Detección de Anomalías en Recaudo |
| **Descripción** | El sistema debe detectar automáticamente anomalías en los patrones de recaudo, tales como: caídas inusuales en la recaudación de un sector, pagos duplicados, montos inconsistentes, cobradores con actividad fuera de patrón y variaciones significativas respecto al promedio histórico. Las anomalías detectadas deben notificarse al administrador. |
| **Prioridad** | ☐ Obligatorio &nbsp;&nbsp; ☑ Deseado |
| **Tipo** | ☑ RF &nbsp;&nbsp; ☐ RNF |
| **Fuente de Información** | Equipo de desarrollo / Analítica de datos |
| **Etapa del Proyecto** | Implementación – Fase IA |
| **Observación** | La detección de anomalías es una herramienta de auditoría y transparencia. No bloquea transacciones automáticamente, solo genera alertas. El umbral de sensibilidad para considerar algo como anomalía debe ser configurable. Ayuda a prevenir errores y fraudes en el proceso de cobro. |

---

*Documento elaborado bajo metodología de Ingeniería de Requisitos (Sommerville, 2002)*
*Sistema: JAAR Digital · Cuentas Claras — Versión 2.0*
