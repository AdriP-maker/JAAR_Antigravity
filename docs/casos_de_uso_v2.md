# Casos de Uso — JAAR Digital · Cuentas Claras v2.0

**Escenarios de uso para las nuevas funcionalidades: Pagos Flexibles, Comisiones y Puntos, e Inteligencia Artificial**

> Documento de especificacion de casos de uso para el sistema de gestion de acueducto rural JAAR Digital.
> Cada caso de uso describe un escenario concreto de interaccion entre actores y el sistema.

---

## 0. Funcionalidades Base

---

### CU-01: Inicio de Sesión

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Admin / Cobrador / Cliente / MINSA |
| **Precondiciones** | El usuario tiene una cuenta aprobada en el sistema. El dispositivo tiene el navegador abierto en la pantalla de login. |
| **Postcondiciones** | El usuario accede a su vista correspondiente según su rol. La sesión queda activa en `localStorage` (`jaar_role`, `jaar_user`). |

**Flujo Principal:**
1. El usuario abre la aplicación y ve la pantalla de Login.
2. Ingresa su nombre de usuario y contraseña.
3. Presiona "Ingresar".
4. El sistema valida las credenciales contra `jaar_usuarios`.
5. El sistema guarda el rol y el usuario en `localStorage`.
6. El sistema redirige al usuario a su pantalla principal según el rol: `index.html` (cobrador), `admin.html` (admin), `historial.html` (cliente), `reporte.html` (minsa).

**Flujos Alternos:**
- FA-1: Si las credenciales son incorrectas, el sistema muestra "Usuario o contraseña incorrectos" y no redirige.
- FA-2: Si la cuenta está en estado "pendiente", el sistema muestra "Tu cuenta aún está pendiente de aprobación por el administrador."
- FA-3: Si la cuenta está "suspendida", el sistema muestra "Tu cuenta ha sido suspendida. Contacta al administrador."

---

### CU-02: Registro de Nuevo Vecino

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Vecino (futuro cliente) |
| **Precondiciones** | El vecino tiene acceso a la URL de la aplicación. La pantalla de registro (`registro.html`) está disponible. |
| **Postcondiciones** | Se crea una solicitud de cuenta con estado "pendiente". El administrador recibe la solicitud visible en `admin.html`. |

**Flujo Principal:**
1. El vecino abre la pantalla de registro.
2. Ingresa sus datos: nombre completo, número de casa, sector, contraseña.
3. Presiona "Solicitar Acceso".
4. El sistema valida que el número de casa no esté duplicado.
5. El sistema crea el registro en `jaar_usuarios` con estado `pendiente` y rol `cliente`.
6. El sistema muestra: "Tu solicitud fue enviada. El administrador te dará acceso pronto."

**Flujos Alternos:**
- FA-1: Si el número de casa ya existe en el padrón, el sistema muestra "Ya existe una cuenta para esa casa. Contacta al administrador si tienes problemas para acceder."
- FA-2: Si algún campo está vacío, el sistema muestra la validación correspondiente sin enviar la solicitud.

---

### CU-03: Aprobación / Rechazo de Vecino por Admin

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Admin |
| **Precondiciones** | El admin ha iniciado sesión. Existe al menos una solicitud en estado "pendiente" en `admin.html`. |
| **Postcondiciones** | La cuenta del vecino cambia a "activo" (aprobado) o "rechazado". Si es aprobado, el vecino puede iniciar sesión. |

**Flujo Principal:**
1. El admin accede a `admin.html` y ve la lista de solicitudes pendientes.
2. Revisa el nombre, casa y sector del solicitante.
3. Presiona "✅ Aprobar".
4. El sistema cambia el estado del usuario a `activo` en `jaar_usuarios`.
5. El sistema mueve al usuario de la lista "Pendientes" a "Activos".
6. El vecino ya puede iniciar sesión con sus credenciales.

**Flujos Alternos:**
- FA-1: El admin presiona "❌ Rechazar" → el estado cambia a `rechazado` y el vecino no puede iniciar sesión.
- FA-2: El admin presiona "🚫 Suspender" sobre un usuario activo → el estado cambia a `suspendido` y se bloquea el acceso inmediatamente.
- FA-3: El admin resetea la contraseña de un usuario activo → el sistema asigna la contraseña por defecto `1234` y notifica al cobrador para que informe al vecino.

---

### CU-04: Registro de Jornal Comunitario

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesión. Se ha realizado un jornal comunitario. Los vecinos participantes están registrados en el padrón. |
| **Postcondiciones** | Se registra la asistencia o inasistencia de cada vecino. Si asistió, se acumulan horas y se otorgan puntos. Si no asistió, se registra la multa correspondiente. |

**Flujo Principal:**
1. El cobrador accede a `jornales.html`.
2. Selecciona el vecino participante del padrón.
3. Indica la tarea realizada y la fecha del jornal.
4. Indica si el vecino asistió o no.
5. Si asistió, ingresa las horas trabajadas (y opcionalmente si fue mediante sustituto).
6. Si no asistió, el sistema aplica la multa configurada.
7. El sistema guarda el registro en `jaar_jornales`.
8. El sistema otorga los puntos correspondientes: 8 pts (asistencia personal), 3 pts (sustituto), 0 pts (inasistencia).
9. El sistema muestra confirmación: "Jornal registrado para [vecino]."

**Flujos Alternos:**
- FA-1: Si el vecino ya tiene un jornal registrado para esa fecha, el sistema muestra aviso y solicita confirmación antes de duplicar.
- FA-2: Si la conexión se pierde al guardar, el registro se almacena en caché local y se sincroniza al recuperar la red.

---

### CU-05: Registro de Gasto / Egreso

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesión. Existe un gasto o compra que registrar para la JAAR. |
| **Postcondiciones** | El gasto queda registrado en `jaar_gastos` con fecha, descripción y monto. Aparece en los reportes de egresos. |

**Flujo Principal:**
1. El cobrador accede a `gastos.html`.
2. Ingresa el monto del gasto, la descripción y la fecha.
3. Presiona "Registrar Gasto".
4. El sistema valida que el monto sea mayor a cero y que la descripción no esté vacía.
5. El sistema guarda el registro en `jaar_gastos`.
6. El sistema muestra la confirmación: "Gasto guardado offline."

**Flujos Alternos:**
- FA-1: Si el monto es cero o negativo, el sistema muestra "El monto debe ser mayor a B/.0.00."
- FA-2: Si el dispositivo está sin conexión, el registro se guarda localmente. Al recuperar la red se sincroniza con el servidor.

---

## 1. Pagos Flexibles

---

### CU-06: Pago Mensual Estandar

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesion en el sistema. El hogar existe en el padron de clientes y tiene un mes pendiente de pago. La tarifa mensual vigente es B/.3.00. |
| **Postcondiciones** | Se crea un registro de pago por B/.3.00 asociado al hogar y al mes correspondiente. El saldo del hogar se actualiza (deuda reducida o saldo en cero). Se otorgan los puntos base al hogar. El estado del mes queda como "pagado". |

**Flujo Principal:**
1. El cobrador selecciona el hogar en la lista de cobros.
2. El sistema muestra la informacion del hogar: nombre del titular, meses pendientes y saldo total.
3. El cobrador selecciona el mes a cobrar y presiona "Registrar Pago".
4. El sistema muestra el monto estandar de B/.3.00 como valor por defecto.
5. El cobrador confirma el monto y el metodo de registro (efectivo).
6. El sistema crea el registro de pago con fecha, monto, mes cubierto y referencia al cobrador.
7. El sistema actualiza el libro mayor de saldos del hogar.
8. El sistema otorga los puntos base (2 puntos por pago basico) al hogar.
9. El sistema muestra confirmacion: "Pago de B/.3.00 registrado para [mes/anio]. Puntos otorgados: 2."

**Flujos Alternos:**
- FA-1: Si el hogar no tiene meses pendientes, el sistema muestra "Este hogar esta al dia" y no permite registrar un pago duplicado.
- FA-2: Si ocurre un error de conexion al guardar, el sistema almacena el pago en cache local y lo sincroniza cuando se restablezca la conexion.

---

### CU-07: Pago Parcial

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesion. El hogar tiene al menos un mes pendiente de pago con un saldo de B/.3.00 (o el remanente de un pago parcial previo). |
| **Postcondiciones** | Se registra el pago parcial por el monto indicado. El saldo restante del mes queda reflejado. El estado del mes se marca como "parcial". Cuando se complete el saldo total, el estado cambia a "pagado". |

**Flujo Principal:**
1. El cobrador selecciona el hogar y el mes pendiente.
2. El sistema muestra el saldo pendiente para ese mes (por ejemplo, B/.3.00 si no ha pagado nada, o B/.1.50 si ya hizo un abono).
3. El cobrador ingresa el monto que el vecino puede pagar: B/.1.50.
4. El sistema valida que el monto sea mayor a B/.0.00 y menor o igual al saldo pendiente.
5. El sistema registra el pago parcial con el monto de B/.1.50.
6. El sistema calcula el saldo restante: B/.3.00 - B/.1.50 = B/.1.50.
7. El estado del mes se actualiza a "parcial" y se muestra el saldo pendiente.
8. El sistema muestra confirmacion: "Abono de B/.1.50 registrado. Saldo pendiente para [mes]: B/.1.50."

**Flujos Alternos:**
- FA-1: Si el cobrador ingresa un monto igual al saldo pendiente, el sistema trata el pago como completo y marca el mes como "pagado" (equivale a CU-06).
- FA-2: Si el cobrador intenta ingresar un monto mayor al saldo pendiente, el sistema muestra "El monto excede el saldo pendiente de B/.X.XX" y no permite el registro.
- FA-3: Cuando el vecino regresa a pagar el remanente (B/.1.50), el cobrador repite el flujo. Al completar el saldo total del mes, el estado cambia automaticamente de "parcial" a "pagado" y se otorgan los puntos base.

---

### CU-08: Pago Anticipado de Varios Meses

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesion. El hogar esta al dia o tiene meses pendientes que seran cubiertos junto con meses futuros. |
| **Postcondiciones** | Se crean registros de pago individuales para cada uno de los meses cubiertos. Se otorgan puntos base por cada mes y puntos bonus por pago consolidado (10 puntos adicionales por cada mes extra mas alla del primero). El saldo del hogar refleja los meses cubiertos. |

**Flujo Principal:**
1. El cobrador selecciona el hogar.
2. El cobrador indica que el vecino desea pagar 6 meses por adelantado.
3. El sistema calcula el monto total: 6 meses x B/.3.00 = B/.18.00.
4. El sistema muestra el desglose: meses que se cubriran (por ejemplo, julio a diciembre 2026) y el total a cobrar.
5. El cobrador confirma el pago de B/.18.00.
6. El sistema crea 6 registros de pago individuales, uno por cada mes.
7. El sistema otorga puntos base por cada mes (6 x 2 = 12 puntos).
8. El sistema otorga puntos bonus por pago consolidado: 10 puntos por cada mes extra (5 meses extra x 10 = 50 puntos bonus).
9. El sistema muestra confirmacion: "Pago anticipado de B/.18.00 registrado (6 meses). Puntos otorgados: 62 (12 base + 50 bonus)."

**Flujos Alternos:**
- FA-1: Si el hogar tiene meses pendientes (deuda), el sistema primero cubre los meses atrasados y luego los meses futuros. Se informa al cobrador cuales meses quedaron cubiertos.
- FA-2: Si el vecino desea pagar un numero de meses que excede el anio en curso, el sistema permite registrar pagos para meses del siguiente anio.

---

### CU-09: Puesta al Dia

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesion. El hogar esta en estado "moroso" con 3 o mas meses de deuda acumulada. |
| **Postcondiciones** | Todos los meses pendientes quedan marcados como "pagado". El estado del hogar cambia de "moroso" a "activo". Se otorgan puntos base y bonus por pago consolidado. |

**Flujo Principal:**
1. El cobrador selecciona el hogar moroso.
2. El sistema muestra el detalle de la deuda: 3 meses pendientes (por ejemplo, abril, mayo y junio) por un total de B/.9.00.
3. El cobrador selecciona la opcion "Puesta al Dia" para liquidar toda la deuda.
4. El sistema muestra el resumen: "Se liquidaran 3 meses pendientes por B/.9.00. El hogar pasara a estado activo."
5. El cobrador confirma el pago de B/.9.00.
6. El sistema crea registros de pago para cada uno de los 3 meses pendientes.
7. El sistema actualiza el estado del hogar de "moroso" a "activo".
8. El sistema otorga puntos base (3 x 2 = 6 puntos) y bonus por pago consolidado (2 meses extra x 10 = 20 puntos bonus).
9. El sistema muestra confirmacion: "Puesta al dia completada. Deuda liquidada: B/.9.00 (3 meses). Estado: Activo. Puntos otorgados: 26."

**Flujos Alternos:**
- FA-1: Si el hogar estaba en estado "corte" (servicio suspendido), ademas de liquidar la deuda, el sistema genera una solicitud de reconexion y notifica al administrador.
- FA-2: Si el vecino solo puede pagar parte de la deuda (por ejemplo, 2 de 3 meses), el cobrador registra los meses que se pagan y el hogar permanece en estado "moroso" hasta liquidar el total.

---

### CU-10: Pago Diario

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesion. El hogar corresponde a un jornalero con modalidad de pago diario. La tarifa diaria se calcula como cuotaMensual / 30 = B/.3.00 / 30 = B/.0.10 por dia. |
| **Postcondiciones** | Se registra el pago diario acumulado. Si el total de pagos diarios del mes alcanza B/.3.00, el mes se marca como "pagado". De lo contrario, se mantiene como "parcial" con el saldo restante. |

**Flujo Principal:**
1. El cobrador selecciona el hogar del jornalero.
2. El sistema muestra la modalidad de pago: "Diario" y la tarifa de B/.0.10/dia.
3. El cobrador ingresa la cantidad de dias que el vecino desea pagar: 15 dias.
4. El sistema calcula el monto: 15 x B/.0.10 = B/.1.50.
5. El cobrador confirma el pago de B/.1.50.
6. El sistema registra el pago con detalle de dias cubiertos (por ejemplo, dia 1 al 15 del mes).
7. El sistema actualiza el acumulado del mes: B/.1.50 de B/.3.00 pagados.
8. El estado del mes se marca como "parcial" con saldo pendiente de B/.1.50.
9. El sistema muestra confirmacion: "Pago diario registrado: 15 dias (B/.1.50). Dias restantes del mes: 15. Saldo pendiente: B/.1.50."

**Flujos Alternos:**
- FA-1: Si con el pago actual el acumulado alcanza o supera B/.3.00, el mes se marca como "pagado" y se otorgan los puntos base correspondientes.
- FA-2: Si el jornalero paga un solo dia (B/.0.10), el sistema registra el micro-pago y actualiza el acumulado.
- FA-3: Si el jornalero desea pagar dias de un mes futuro habiendo completado el mes actual, el sistema aplica el excedente al siguiente mes.

---

## 2. Comisiones y Recompensas

---

### CU-11: Cobrador Registra Pago y Recibe Comision Automatica

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesion. Existe una configuracion activa de comisiones con un monto por defecto de B/.1.00 por cada pago estandar de B/.3.00. El split de comision esta configurado (por defecto: 60% desarrolladores / 40% cobrador). |
| **Postcondiciones** | Se registra el pago del hogar. Se crea automaticamente un registro de comision asociado al pago. La comision se distribuye segun el split vigente: B/.0.60 para desarrolladores y B/.0.40 para el cobrador. Ambos registros (pago y comision) se crean de forma atomica. |

**Flujo Principal:**
1. El cobrador registra un pago estandar de B/.3.00 para un hogar (flujo de CU-06, CU-07, CU-08, CU-09 o CU-10).
2. Al confirmar el pago, el sistema calcula automaticamente la comision: B/.1.00.
3. El sistema aplica el split vigente: 60% desarrolladores (B/.0.60) y 40% cobrador (B/.0.40).
4. El sistema crea el registro de comision con: fecha, monto total, porcion del cobrador, porcion de desarrolladores, referencia al pago original y al cobrador.
5. La creacion del pago y la comision ocurren en una transaccion atomica (si falla uno, se revierte el otro).
6. El sistema muestra al cobrador: "Pago registrado. Tu comision: B/.0.40."

**Flujos Alternos:**
- FA-1: Si el pago es parcial (por ejemplo, B/.1.50), la comision se calcula proporcionalmente: B/.1.00 x (B/.1.50 / B/.3.00) = B/.0.50. El split se aplica sobre B/.0.50.
- FA-2: Si el pago incluye descuento por puntos canjeados, la comision se calcula sobre el monto completo (B/.3.00), no sobre el monto pagado en efectivo.
- FA-3: Si la transaccion atomica falla, el sistema muestra un error y no registra ni el pago ni la comision, permitiendo reintentar.

---

### CU-12: Cobrador Consulta sus Ganancias Acumuladas

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesion. Existen registros de comisiones previas asociadas al cobrador. |
| **Postcondiciones** | El cobrador visualiza un resumen completo de sus ganancias. No se modifican datos. |

**Flujo Principal:**
1. El cobrador abre la pagina "comisiones.html" desde el menu principal.
2. El sistema carga los registros de comisiones del cobrador autenticado.
3. El sistema muestra un panel resumen con:
   - Total acumulado historico (todas las comisiones ganadas).
   - Total ganado en el mes actual.
   - Numero total de pagos procesados.
   - Promedio de comision por pago.
4. Debajo del resumen, el sistema muestra una tabla con desglose mensual:
   - Columnas: Mes, Cantidad de Pagos, Monto Total Cobrado, Comision Ganada.
   - Ordenada del mes mas reciente al mas antiguo.
5. El cobrador puede filtrar por rango de fechas para ver periodos especificos.

**Flujos Alternos:**
- FA-1: Si el cobrador no tiene comisiones registradas, el sistema muestra "Aun no tienes comisiones registradas. Comienza a registrar pagos para generar ingresos."
- FA-2: Si el cobrador desea exportar sus datos, puede descargar la tabla en formato CSV.

---

### CU-13: Admin Configura Split de Comisiones

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Admin (Administrador del sistema) |
| **Precondiciones** | El administrador ha iniciado sesion con permisos de administracion. Existe una configuracion de comisiones activa. |
| **Postcondiciones** | La nueva distribucion de comisiones queda guardada y activa. Se registra un log con la fecha, hora, usuario que realizo el cambio y los valores anteriores y nuevos. Los pagos futuros usan el nuevo split. Los registros historicos no se modifican. |

**Flujo Principal:**
1. El administrador abre la pagina "puntos-admin.html".
2. El sistema muestra la configuracion actual de comisiones: split 60% desarrolladores / 40% cobrador.
3. El administrador modifica los porcentajes: 65% desarrolladores / 35% cobrador.
4. El sistema valida que los porcentajes sumen 100%.
5. El administrador confirma el cambio.
6. El sistema guarda la nueva configuracion con timestamp.
7. El sistema registra en el log de auditoria: "Cambio de split: 60/40 -> 65/35 por [admin] el [fecha/hora]."
8. El sistema muestra confirmacion: "Split de comisiones actualizado. Efectivo para futuros pagos."

**Flujos Alternos:**
- FA-1: Si los porcentajes no suman 100%, el sistema muestra "Los porcentajes deben sumar 100%. Actual: [X]%." y no permite guardar.
- FA-2: Si el administrador intenta establecer el porcentaje del cobrador en 0%, el sistema muestra una advertencia: "El cobrador no recibira comision. Confirmar?" y requiere doble confirmacion.
- FA-3: El administrador puede consultar el historial de cambios de split en la seccion de auditoria.

---

### CU-14: Vecino Acumula Puntos por Pago Puntual

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Sistema (proceso automatico) |
| **Precondiciones** | Se ha registrado un pago completo para un hogar. La fecha del pago es anterior o igual al dia 15 del mes correspondiente. Las reglas de puntos estan configuradas: pago_basico = 2 puntos, pago_puntual = 5 puntos. |
| **Postcondiciones** | Se otorgan 7 puntos al hogar (2 base + 5 bonus por puntualidad). Los puntos quedan disponibles para canje futuro. Se registra el detalle de puntos otorgados con tipo y motivo. |

**Flujo Principal:**
1. El sistema detecta que se ha registrado un pago completo para un hogar.
2. El sistema verifica la fecha del pago respecto al mes cubierto.
3. La fecha del pago es el dia 10 (antes del 15), por lo que califica como pago puntual.
4. El sistema otorga puntos base: 2 puntos (tipo: pago_basico).
5. El sistema otorga puntos bonus: 5 puntos (tipo: pago_puntual).
6. El sistema registra ambas transacciones de puntos con referencia al pago original.
7. El saldo de puntos del hogar se actualiza: saldo anterior + 7 = nuevo saldo.
8. El sistema anota en el registro del pago: "Puntos otorgados: 7 (2 base + 5 puntualidad)."

**Flujos Alternos:**
- FA-1: Si el pago se registra despues del dia 15, el sistema solo otorga los 2 puntos base (pago_basico). No se otorga el bonus de puntualidad.
- FA-2: Si el pago es parcial, los puntos base no se otorgan hasta que el mes quede completamente pagado. En ese momento se evalua la fecha del primer abono para determinar si aplica el bonus de puntualidad.

---

### CU-15: Vecino Acumula Puntos por Asistir a Jornal

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesion. Se ha realizado un jornal comunitario. El cobrador tiene la lista de asistencia verificada. Las reglas de puntos estan configuradas: jornal_personal = 8 puntos, jornal_sustituto = 3 puntos. |
| **Postcondiciones** | Se registra la asistencia al jornal para el hogar. Se otorgan los puntos correspondientes segun el tipo de asistencia (personal o sustituto). |

**Flujo Principal:**
1. El cobrador accede a la seccion de jornales en el sistema.
2. El cobrador selecciona el jornal realizado (fecha y descripcion).
3. El cobrador busca el hogar del vecino que asistio.
4. El cobrador indica el tipo de asistencia: "Personal" (el titular del hogar asistio en persona).
5. El sistema registra la asistencia con tipo "personal".
6. El sistema otorga 8 puntos al hogar (tipo: jornal_personal).
7. El sistema muestra confirmacion: "Asistencia registrada para [hogar]. Puntos otorgados: 8 (asistencia personal)."

**Flujos Alternos:**
- FA-1: Si el titular envio un sustituto, el cobrador selecciona "Sustituto" como tipo de asistencia. El sistema otorga 3 puntos (tipo: jornal_sustituto) en lugar de 8.
- FA-2: Si el hogar no asistio ni envio sustituto, el cobrador no registra asistencia y no se otorgan puntos.
- FA-3: Si el cobrador intenta registrar asistencia duplicada para el mismo hogar en el mismo jornal, el sistema muestra "Ya se registro asistencia para este hogar en este jornal" y no permite duplicados.

---

### CU-16: Vecino Canjea Puntos por Descuento

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador (en representacion del cliente) |
| **Precondiciones** | El cobrador ha iniciado sesion. El hogar tiene puntos disponibles suficientes para canjear (minimo 1 punto). La tasa de conversion esta configurada (por defecto: 1 punto = B/.0.10). El hogar tiene un mes pendiente de pago. |
| **Postcondiciones** | Se aplica el descuento al pago del mes. Los puntos canjeados se deducen del saldo del hogar. El pago se registra con el monto efectivamente cobrado en efectivo. La comision del cobrador se calcula sobre el monto completo (B/.3.00), no sobre el monto con descuento. |

**Flujo Principal:**
1. El cobrador selecciona el hogar para registrar un pago mensual.
2. El sistema muestra el saldo de puntos disponibles del hogar: 15 puntos.
3. El sistema calcula el descuento maximo: 15 puntos x B/.0.10 = B/.1.50.
4. El cobrador indica que el vecino desea usar sus puntos.
5. El sistema aplica el descuento: B/.3.00 - B/.1.50 = B/.1.50 a cobrar en efectivo.
6. El cobrador confirma el pago de B/.1.50 en efectivo.
7. El sistema registra el pago por B/.3.00 (monto completo) con detalle: B/.1.50 en efectivo + B/.1.50 en puntos canjeados.
8. El sistema deduce 15 puntos del saldo del hogar.
9. La comision del cobrador se calcula sobre B/.3.00 (monto completo), no sobre B/.1.50.
10. El sistema muestra confirmacion: "Pago registrado: B/.1.50 efectivo + B/.1.50 en puntos (15 pts canjeados). Saldo de puntos restante: 0."

**Flujos Alternos:**
- FA-1: Si el vecino solo desea canjear parte de sus puntos (por ejemplo, 10 de 15), el cobrador ingresa la cantidad a canjear. Descuento: 10 x B/.0.10 = B/.1.00. Cobro en efectivo: B/.2.00.
- FA-2: Si los puntos del hogar cubren el 100% del pago (30 puntos = B/.3.00), el pago se registra completamente con puntos y el cobro en efectivo es B/.0.00. La comision aun se calcula sobre B/.3.00.
- FA-3: Si el hogar no tiene puntos disponibles, la opcion de canjear no aparece y el cobro se realiza normalmente.

---

### CU-17: Admin Configura Reglas de Puntos

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Admin (Administrador del sistema) |
| **Precondiciones** | El administrador ha iniciado sesion con permisos de administracion. Existe una configuracion de puntos activa. |
| **Postcondiciones** | Los nuevos valores de puntos y tasa de conversion quedan guardados. Se registra un log de auditoria con los valores anteriores y nuevos. Los cambios aplican a transacciones futuras; los registros historicos no se modifican. |

**Flujo Principal:**
1. El administrador abre la pagina "puntos-admin.html" y navega a la seccion de configuracion de reglas de puntos.
2. El sistema muestra la configuracion actual:
   - pago_basico: 2 puntos
   - pago_puntual: 5 puntos
   - jornal_personal: 8 puntos
   - jornal_sustituto: 3 puntos
   - pago_consolidado_bonus: 10 puntos por mes extra
   - Tasa de conversion: 1 punto = B/.0.10
3. El administrador modifica los valores: pago_puntual de 5 a 7 puntos y la tasa de conversion de B/.0.10 a B/.0.15 por punto.
4. El sistema valida que todos los valores sean numeros positivos.
5. El administrador confirma los cambios.
6. El sistema guarda la nueva configuracion con timestamp.
7. El sistema registra en el log de auditoria: "Cambio de reglas de puntos: pago_puntual 5->7, tasa_conversion 0.10->0.15 por [admin] el [fecha/hora]."
8. El sistema muestra confirmacion: "Reglas de puntos actualizadas. Efectivo para futuras transacciones."

**Flujos Alternos:**
- FA-1: Si el administrador ingresa un valor negativo o cero para alguna regla, el sistema muestra "Los valores de puntos deben ser numeros positivos mayores a cero." y no permite guardar.
- FA-2: Si el administrador desea desactivar temporalmente una regla (por ejemplo, no otorgar bonus de puntualidad), puede establecer el valor en 0 con una confirmacion especial.
- FA-3: El administrador puede consultar el historial de cambios en la seccion de auditoria para revisar todas las modificaciones previas.

---

## 3. Inteligencia Artificial

---

### CU-18: Cobrador Ve Puntaje de Riesgo de Cada Hogar

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesion. El modulo de IA ha calculado los puntajes de riesgo para los hogares del padron. Cada hogar tiene un puntaje de riesgo entre 0 y 100. |
| **Postcondiciones** | El cobrador visualiza el puntaje de riesgo de cada hogar con codificacion de colores. No se modifican datos. |

**Flujo Principal:**
1. El cobrador abre la vista principal de cobros.
2. El sistema carga la lista de hogares con sus datos actualizados.
3. Cada tarjeta de hogar muestra un badge de riesgo con el puntaje numerico (0-100).
4. El badge esta codificado por colores segun el nivel de riesgo:
   - **Verde (0-25):** Bajo - hogar al dia, sin riesgo.
   - **Amarillo (26-50):** Medio - algun retraso menor o patron irregular.
   - **Naranja (51-75):** Alto - multiples meses de retraso, riesgo de corte.
   - **Rojo (76-100):** Critico - deuda significativa, accion inmediata requerida.
5. El cobrador utiliza los badges para priorizar visualmente sus cobros del dia.
6. Al tocar un badge, el sistema muestra una breve explicacion del puntaje (por ejemplo, "2 meses sin pagar, historial de pagos tardia").

**Flujos Alternos:**
- FA-1: Si el modulo de IA no ha calculado el puntaje para un hogar nuevo, el badge muestra "Sin datos" en color gris.
- FA-2: Si los datos de la IA estan desactualizados (mas de 24 horas), el sistema muestra una nota: "Puntajes calculados hace [X] horas" y ofrece recalcular.

---

### CU-19: Cobrador Activa "Ruta Inteligente"

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cobrador |
| **Precondiciones** | El cobrador ha iniciado sesion. El modulo de IA ha calculado puntajes de riesgo y prioridad para los hogares. Los hogares tienen sector asignado. |
| **Postcondiciones** | La lista de hogares se reordena segun la prioridad calculada por la IA: mayor riesgo primero, agrupados por sector para eficiencia de recorrido. Cada tarjeta muestra una razon breve del orden asignado. |

**Flujo Principal:**
1. El cobrador abre la vista de cobros y ve la lista de hogares en orden alfabetico (por defecto).
2. El cobrador presiona el boton "Ruta Inteligente".
3. El sistema activa el algoritmo de priorizacion de la IA.
4. La lista de hogares se reordena aplicando los siguientes criterios:
   - Prioridad primaria: puntaje de riesgo (mayor primero).
   - Prioridad secundaria: agrupacion por sector geografico para minimizar desplazamientos.
5. Cada tarjeta de hogar muestra una razon breve generada por la IA:
   - Ejemplo: "3 meses sin pagar, riesgo de corte."
   - Ejemplo: "Pago parcial pendiente desde hace 45 dias."
   - Ejemplo: "Historial de morosidad recurrente en este trimestre."
6. El cobrador recorre la lista en el nuevo orden para realizar sus cobros de manera eficiente.

**Flujos Alternos:**
- FA-1: Si el cobrador desea volver al orden original, presiona "Orden Alfabetico" y la lista se restaura.
- FA-2: Si todos los hogares tienen riesgo bajo (verde), el sistema muestra: "Todos los hogares estan al dia. La ruta se ordena por sector para eficiencia."
- FA-3: Si hay hogares sin sector asignado, estos aparecen al final de la lista con la nota "Sector no asignado."

---

### CU-20: Sistema Predice Hogares que Caeran en Morosidad

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Sistema (proceso automatico) |
| **Precondiciones** | El sistema tiene datos historicos de pagos de al menos 3 meses para los hogares. El modulo de prediccion esta activo y configurado. |
| **Postcondiciones** | Se genera una alerta de prediccion con la lista de hogares en riesgo de caer en morosidad, incluyendo nombre, probabilidad estimada y factores de riesgo. La alerta queda visible para el cobrador en el panel principal. |

**Flujo Principal:**
1. El sistema ejecuta el analisis predictivo al inicio de cada mes (o segun configuracion).
2. El algoritmo analiza los patrones de pago de cada hogar:
   - Frecuencia de pagos tardios.
   - Tendencia de deterioro en puntualidad.
   - Patron estacional (meses donde historicamente se atrasa).
   - Pagos parciales recurrentes.
3. El sistema identifica hogares con alta probabilidad de caer en morosidad en el mes actual.
4. El sistema genera una alerta de prediccion: "3 hogares podrian caer en morosidad este mes."
5. La alerta incluye para cada hogar:
   - Nombre del titular.
   - Probabilidad estimada (por ejemplo, 78%).
   - Factores principales (por ejemplo, "Pago tardio los ultimos 2 meses, tendencia descendente").
6. La alerta se muestra al cobrador en el panel principal al iniciar sesion.
7. El cobrador puede marcar los hogares para visita proactiva.

**Flujos Alternos:**
- FA-1: Si no se identifican hogares en riesgo, el sistema muestra: "No se detectaron hogares en riesgo de morosidad para este mes."
- FA-2: Si un hogar identificado como riesgo realiza un pago antes de la visita proactiva, el sistema actualiza la alerta automaticamente y reduce la probabilidad.
- FA-3: Si los datos historicos son insuficientes (menos de 3 meses), el sistema excluye esos hogares del analisis y lo indica: "X hogares excluidos por datos insuficientes."

---

### CU-21: Admin Revisa Tablero de Metricas de Recaudo

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Admin (Administrador del sistema) |
| **Precondiciones** | El administrador ha iniciado sesion con permisos de administracion. Existen registros de pagos en el sistema. |
| **Postcondiciones** | El administrador visualiza un tablero completo de metricas de recaudo. No se modifican datos. |

**Flujo Principal:**
1. El administrador abre el tablero de metricas (dashboard) desde el menu de administracion.
2. El sistema calcula y muestra las siguientes metricas:
   - **Tasa de recaudo mensual (%):** porcentaje de hogares que han pagado el mes actual respecto al total del padron.
   - **Dia promedio de pago:** dia del mes en que los vecinos pagan en promedio.
   - **Tendencia:** indicador visual de mejora o deterioro comparando los ultimos 3 meses (flecha hacia arriba = mejorando, flecha hacia abajo = deterioro).
   - **Desglose por sector:** tabla con tasa de recaudo por cada sector (por ejemplo, Caballero Arriba: 85%, Caballero Abajo: 62%).
   - **Alertas de anomalias:** notificaciones sobre cambios significativos detectados por la IA.
3. El administrador puede filtrar por mes, trimestre o anio.
4. El administrador puede hacer clic en un sector para ver el detalle hogar por hogar.

**Flujos Alternos:**
- FA-1: Si no hay datos para el periodo seleccionado, el sistema muestra "No hay datos de recaudo para el periodo seleccionado."
- FA-2: Si existe una anomalia activa (ver CU-22), esta se destaca en rojo en la seccion de alertas con un enlace para ver detalles.
- FA-3: El administrador puede exportar el tablero como reporte en PDF para presentar ante la junta directiva de la JAAR.

---

### CU-22: Sistema Detecta Anomalia en Recaudo

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Sistema (proceso automatico) |
| **Precondiciones** | El sistema tiene datos historicos de recaudo de al menos 6 meses. El modulo de deteccion de anomalias esta activo. Se han configurado umbrales de alerta (por defecto: z-score > 2 desviaciones estandar). |
| **Postcondiciones** | Se genera una alerta de anomalia con detalle del sector afectado, la magnitud de la desviacion y posibles causas. La alerta queda visible para el administrador. |

**Flujo Principal:**
1. El sistema ejecuta el analisis de anomalias periodicamente (diario o semanal segun configuracion).
2. Para cada sector, el sistema calcula la tasa de recaudo actual y la compara con el promedio historico.
3. El sistema aplica analisis de z-score para determinar si la desviacion es estadisticamente significativa.
4. El sistema detecta que el sector "Caballero Abajo" muestra un descenso del 40% en recaudo respecto a su promedio historico (z-score > 2).
5. El sistema genera una alerta de anomalia:
   - Sector afectado: Caballero Abajo.
   - Desviacion: -40% respecto al promedio.
   - Periodo: mes actual.
   - Posibles causas sugeridas: "Podria indicar problemas de infraestructura, situacion economica del sector o problemas comunitarios."
6. La alerta se envia al administrador y se muestra en el tablero de metricas (CU-21).
7. El administrador puede marcar la alerta como "investigada" o "resuelta" con notas.

**Flujos Alternos:**
- FA-1: Si no se detectan anomalias, el sistema no genera alertas y el tablero muestra "Sin anomalias detectadas."
- FA-2: Si la anomalia es positiva (aumento inusual en recaudo), el sistema genera una alerta informativa: "Recaudo inusualmente alto en [sector]. Verificar si los datos son correctos."
- FA-3: Si el administrador descarta una alerta como falso positivo, el sistema ajusta los parametros del modelo para reducir alertas similares en el futuro.

---

### CU-23: Cliente Ve su Estado de Riesgo en Lenguaje Amigable

| Campo | Detalle |
|-------|---------|
| **Actor Principal** | Cliente (vecino/usuario del servicio) |
| **Precondiciones** | El cliente ha accedido a la pagina "historial.html" con sus credenciales o codigo de hogar. El modulo de IA ha calculado el puntaje de riesgo del hogar. |
| **Postcondiciones** | El cliente visualiza un mensaje amigable y comprensible sobre el estado de su cuenta. No se muestran valores numericos tecnicos (como el puntaje en bruto). No se modifican datos. |

**Flujo Principal:**
1. El cliente abre la pagina "historial.html" desde su dispositivo.
2. El sistema carga el historial de pagos y el puntaje de riesgo del hogar.
3. El sistema traduce el puntaje numerico a un mensaje amigable segun el rango:
   - **Riesgo bajo (0-25):** "Tu cuenta esta en buen estado. Gracias por mantenerte al dia con tus pagos."
   - **Riesgo medio (26-50):** "Tu cuenta esta bien, pero recuerda pagar a tiempo para mantener tu buen historial."
   - **Riesgo alto (51-75):** "Atencion: tu cuenta podria entrar en riesgo si no se regulariza pronto. Te recomendamos ponerte al dia."
   - **Riesgo critico (76-100):** "Tu cuenta necesita atencion urgente. Comunicate con el cobrador para evitar la suspension del servicio."
4. El mensaje se muestra con un icono y color acorde al nivel de riesgo (verde, amarillo, naranja, rojo).
5. Debajo del mensaje, el sistema muestra recomendaciones personalizadas:
   - Si tiene meses pendientes: "Tienes [X] meses pendientes. Paga antes del [fecha] para evitar recargos."
   - Si tiene puntos disponibles: "Tienes [X] puntos acumulados que puedes usar como descuento en tu proximo pago."
6. El cliente tambien puede ver su historial de pagos recientes en una tabla simple.

**Flujos Alternos:**
- FA-1: Si el puntaje de riesgo no esta disponible (hogar nuevo), el sistema muestra: "Bienvenido al servicio. Aun no tenemos suficiente historial para evaluar tu cuenta."
- FA-2: Si el cliente desea mas informacion sobre como mejorar su estado, puede presionar "Consejos" y ver sugerencias como "Paga antes del dia 15 para ganar puntos extra" o "Asiste al proximo jornal comunitario para acumular puntos."
- FA-3: Si el cliente no reconoce los datos mostrados, puede reportar un error mediante un enlace de contacto con el administrador.

---

## Resumen de Casos de Uso

| Codigo | Nombre | Actor Principal | Modulo |
|--------|--------|----------------|--------|
| CU-06 | Pago Mensual Estandar | Cobrador | Pagos Flexibles |
| CU-07 | Pago Parcial | Cobrador | Pagos Flexibles |
| CU-08 | Pago Anticipado de Varios Meses | Cobrador | Pagos Flexibles |
| CU-09 | Puesta al Dia | Cobrador | Pagos Flexibles |
| CU-10 | Pago Diario | Cobrador | Pagos Flexibles |
| CU-11 | Cobrador Registra Pago y Recibe Comision Automatica | Cobrador | Comisiones y Recompensas |
| CU-12 | Cobrador Consulta sus Ganancias Acumuladas | Cobrador | Comisiones y Recompensas |
| CU-13 | Admin Configura Split de Comisiones | Admin | Comisiones y Recompensas |
| CU-14 | Vecino Acumula Puntos por Pago Puntual | Sistema | Comisiones y Recompensas |
| CU-15 | Vecino Acumula Puntos por Asistir a Jornal | Cobrador | Comisiones y Recompensas |
| CU-16 | Vecino Canjea Puntos por Descuento | Cobrador | Comisiones y Recompensas |
| CU-17 | Admin Configura Reglas de Puntos | Admin | Comisiones y Recompensas |
| CU-18 | Cobrador Ve Puntaje de Riesgo de Cada Hogar | Cobrador | Inteligencia Artificial |
| CU-19 | Cobrador Activa "Ruta Inteligente" | Cobrador | Inteligencia Artificial |
| CU-20 | Sistema Predice Hogares que Caeran en Morosidad | Sistema | Inteligencia Artificial |
| CU-21 | Admin Revisa Tablero de Metricas de Recaudo | Admin | Inteligencia Artificial |
| CU-22 | Sistema Detecta Anomalia en Recaudo | Sistema | Inteligencia Artificial |
| CU-23 | Cliente Ve su Estado de Riesgo en Lenguaje Amigable | Cliente | Inteligencia Artificial |

---

> Documento generado para el proyecto JAAR Digital - Cuentas Claras v2.0
> Sistema de gestion de acueducto rural - Piloto Caballero, Anton, Panama
