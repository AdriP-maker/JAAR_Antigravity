# Especificación de Requisitos y Escenarios de Uso

## 1. Roles de Usuario

| Rol | Descripción | Acceso Principal |
|---|---|---|
| **Administrador** | Gestiona cuentas de usuarios, aprueba registros y resetea contraseñas | `admin.html` |
| **Cobrador / Tesorero** | Registra pagos, gastos y jornales. Opera en modo offline. | `index.html`, `jornales.html`, `gastos.html` |
| **Inspector MINSA** | Solo lectura. Visualiza y descarga reportes trimestrales. | `reporte.html` |
| **Cliente / Vecino** | Ve su historial personal de pagos y lee avisos del foro. | `historial.html`, `foro.html` |

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
2. Registra el pago → se guarda en `localStorage` con estado `pendiente`.
3. La app muestra el indicador **"Sin Red"** en la cabecera.
4. Al llegar a una zona con señal, presiona **"Sincronizar"** → los datos suben a Supabase.

---

### Escenario 2: Jornal con Sustituto
**Contexto:** La vecina Ana no puede asistir a la jornada y manda a su hijo Carlos.

1. El cobrador entra a `jornales.html`.
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

1. Entra con usuario `minsa` → va directamente a `reporte.html`.
2. Configura filtros: **Desde:** enero 2026, **Hasta:** marzo 2026.
3. Marca solo **Ingresos** y **Egresos** (desactiva Jornales).
4. Presiona **"Aplicar Filtros"** → la tabla se actualiza en tiempo real.
5. Presiona **"📥 Exportar Excel"** → descarga `Reporte_JAAR_2026-03-31.xlsx` con 4 hojas.

---

### Escenario 5: Nuevo Vecino Solicita Acceso
**Contexto:** El nuevo vecino de la Casa-12 quiere acceder al sistema.

1. Abre `registro.html` (público, sin login).
2. Llena: Nombre, Número de Casa, Usuario deseado, Contraseña.
3. El administrador entra a `admin.html` → ve la solicitud en "Pendientes".
4. Presiona ✅ **Aprobar** → el vecino ya puede iniciar sesión.

---

## 4. Requisitos No Funcionales

| Requisito | Descripción |
|---|---|
| **Offline** | La app debe funcionar completamente sin internet para cobros y jornales. |
| **Portabilidad** | Compatible con cualquier navegador moderno sin instalación. |
| **Seguridad** | Rutas protegidas por roles — redirección automática si el rol no coincide. |
| **Privacidad** | El cliente solo ve su propio historial, no el de otros vecinos. |
| **Exportación** | Los reportes deben poder generarse en PDF y Excel sin conexión. |
