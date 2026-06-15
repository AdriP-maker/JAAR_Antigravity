# Especificación de Requisitos y Escenarios de Uso

## 1. Roles de Usuario

| Rol | Descripción | Acceso Principal |
|---|---|---|
| **Administrador** | Gestiona cuentas de usuarios, aprueba registros y resetea contraseñas | `/admin` |
| **Cobrador / Tesorero** | Registra pagos, gastos y jornales. Opera en modo offline. | `/`, `/jornales`, `/gastos` |
| **Inspector MINSA** | Solo lectura. Visualiza y descarga reportes trimestrales. | `/reporte` |
| **Cliente / Vecino** | Ve su historial personal de pagos y lee avisos del foro. | `/historial`, `/foro` |

---

## 2. Requisitos Funcionales

- **RF-01** Gestión de Usuarios: Registro con aprobación por admin, suspensión y reseteo de contraseñas.
- **RF-02** Registro de Cobros (Offline/Online): Registrar cuotas mensuales con indicador de sincronización.
- **RF-03** Control de Caja y Gastos: Registrar egresos con descripción y monto.
- **RF-04** Control de Jornales: Registro de asistencia, sustitutos, horas y multas por inasistencia.
- **RF-05** Foro de Avisos: Publicación de fechas de cobro y trabajo comunitario (solo Cobrador/Admin).
- **RF-06** Historial del Cliente: Vista personal de estado de pagos y horas donadas.
- **RF-07** Reportes MINSA: Generación con filtros por fecha y tipo, exportación PDF y Excel (.xlsx).
- **RF-08** Sincronización Automática: Cola local que se envía a Supabase al recuperar conexión.
- **RF-09** Filtros en Cobros: La pantalla principal permite filtrar vecinos por mes (enero–diciembre) y por estado de pago.
- **RF-10** Estados de Pago en Cobros: Cada vecino muestra visualmente su estado — **Activo/Al Día**, **Moroso** (1–2 meses sin pagar) o **Para Corte** (3+ meses sin pagar).
- **RF-11** Confirmación de Jornal por el Cliente: Los vecinos pueden ver los jornales programados por la directiva y confirmar si asistirán o no, quedando el registro en el sistema.

---

## 3. Escenarios Críticos de Uso

### Escenario 1: Cobro en Zona Sin Internet
**Contexto:** El cobrador visita el sector sin señal celular. El vecino paga su cuota unificada de $3.00.

1. El cobrador abre el Portal Web en su navegador (funciona sin internet).
2. Registra el pago → se guarda en `IndexedDB` con estado `pendiente`.
3. La app muestra el indicador **"Sin Red"** en la cabecera.
4. Al llegar a una zona con señal, presiona **"Sincronizar"** → los datos suben a Supabase.

---

### Escenario 2: Jornal con Sustituto
**Contexto:** La vecina Ana no puede asistir a la jornada y manda a su hijo Carlos.

1. El cobrador entra a `/jornales`.
2. Selecciona a Ana como miembro, marca **"Sí asiste"** → **"Mandó a un sustituto"**.
3. Aparece el campo **"Nombre del Sustituto"** → escribe "Carlos García".
4. Indica las horas trabajadas → guarda.
5. El historial muestra: `"Ana García — Sustituto: Carlos García — 4 Hrs"`.

---

### Escenario 3: Inasistencia con Multa
**Contexto:** El vecino Pedro no asistió a la jornada obligatoria.

1. Cobrador selecciona a Pedro → marca **"No asiste"**.
2. Aparece panel rojo con campo de multa (por defecto $15.00).
3. Al guardar, el registro queda como: `"Pedro Sánchez — Faltó (-$15.00)"`.
4. El reporte MINSA refleja esta multa en el período correspondiente.

---

### Escenario 4: Inspector MINSA descarga Reporte
**Contexto:** Fin de trimestre, el inspector necesita el informe.

1. Entra con usuario `minsa` → va directamente a `/reporte`.
2. Configura filtros: **Desde:** enero 2026, **Hasta:** marzo 2026.
3. Marca solo **Ingresos** y **Egresos** (desactiva Jornales).
4. Presiona **"Aplicar Filtros"** → la tabla se actualiza en tiempo real.
5. Presiona **"📥 Exportar Excel"** → descarga `Reporte_SIMAP_2026-03-31.xlsx` con 4 hojas.

---

### Escenario 5: Nuevo Vecino Solicita Acceso
**Contexto:** El nuevo vecino de la Casa-12 quiere acceder al sistema.

1. Abre `/registro` (público, sin login).
2. Llena: Nombre, Número de Casa, Usuario deseado, Contraseña.
3. El administrador entra a `/admin` → ve la solicitud en "Pendientes".
4. Presiona ✅ **Aprobar** → el vecino ya puede iniciar sesión.

---

---

## 3.1 Requisitos Funcionales — Pagos Flexibles (v2.0)

- **RF-12** Pagos Parciales: El sistema debe permitir registrar pagos parciales (monto menor a la cuota mensual). El saldo restante queda pendiente y el estado se muestra como "Parcial" hasta completar la cuota del mes.
- **RF-13** Pagos Multi-Mes: El cobrador puede registrar pagos que cubran varios meses simultáneamente (ej: 6 meses = B/.18.00). Cada mes se marca como pagado individualmente en el libro mayor de saldos.
- **RF-14** Pagos Diarios: El sistema permite cobrar por día (cuota mensual ÷ 30). Los pagos diarios se acumulan como pagos parciales del mes correspondiente.
- **RF-15** Puesta al Día: El sistema calcula automáticamente la deuda total de un vecino moroso y permite cobrarla en un solo pago, actualizando todos los meses pendientes.
- **RF-16** Pagos Adelantados: Los vecinos pueden pagar meses futuros por anticipado. El sistema registra los meses cubiertos y calcula correctamente el estado de cuenta.

---

## 3.2 Requisitos Funcionales — Comisiones y Recompensas (v2.0)

- **RF-17** Comisiones por Cobro: Cada pago genera una comisión fija configurable (por defecto B/.1.00). Se reparte automáticamente: 60% desarrolladores / 40% cobrador. El split es configurable por el administrador.
- **RF-18** Dashboard de Ganancias del Cobrador: El cobrador accede a una pantalla donde visualiza su acumulado de comisiones, desglose mensual e historial de cobros realizados.
- **RF-19** Sistema de Puntos: Los vecinos acumulan puntos por: pago básico (2 pts), pago puntual antes del 15 (5 pts), pago consolidado multi-mes (10 pts/mes extra), asistencia personal a jornal (8 pts), asistencia vía sustituto (3 pts), confirmación anticipada de jornal (2 pts), trimestre sin multas (15 pts), año completo pagado (30 pts).
- **RF-20** Canje de Puntos: Los vecinos pueden canjear puntos por descuentos en su cuota (1 punto = B/.0.10). Mínimo canjeable: 10 puntos. Máximo descuento por mes: B/.1.50. La comisión se calcula sobre la tarifa completa, no sobre el monto con descuento.
- **RF-21** Configuración Admin de Incentivos: El administrador puede configurar el porcentaje del split de comisiones, los valores de puntos por acción, la tasa de canje y los apartados de cobro (Agua, Tanque Séptico, Porqueriza/Añadidos).

---

## 3.3 Requisitos Funcionales — Inteligencia Artificial (v2.0)

- **RF-22** Puntaje de Riesgo por Hogar: El sistema calcula un puntaje de riesgo (0-100) para cada hogar basado en: meses sin pagar (35%), regularidad de pago (25%), participación en jornales (20%), riesgo del sector (10%), y tendencia (10%). Niveles: bajo (0-25), medio (26-50), alto (51-75), crítico (76-100).
- **RF-23** Ruta Inteligente de Cobro: El cobrador puede activar un modo que ordena los hogares por prioridad de visita, combinando puntaje de riesgo, urgencia (próximo a corte) y agrupación geográfica por sector. La IA solo sugiere, el cobrador decide.
- **RF-24** Predicción de Morosidad: El sistema identifica hogares "activos" con probabilidad de caer en morosidad el próximo mes, basándose en tendencias históricas, factores estacionales y participación comunitaria. Muestra alertas informativas, no ajusta tarifas.
- **RF-25** Detección de Anomalías: El sistema detecta patrones atípicos en el recaudo (caídas sectoriales, picos de gastos, pagos inusuales) usando análisis estadístico (z-score) y alerta al administrador.

---

## 4. Requisitos No Funcionales

| Requisito | Descripción |
|---|---|
| **Offline** | La app debe funcionar completamente sin internet para cobros y jornales. |
| **Portabilidad** | Compatible con cualquier navegador moderno sin instalación. |
| **Seguridad** | Rutas protegidas por roles — redirección automática si el rol no coincide. |
| **Privacidad** | El cliente solo ve su propio historial, no el de otros vecinos. |
| **Exportación** | Los reportes deben poder generarse en PDF y Excel sin conexión. |
