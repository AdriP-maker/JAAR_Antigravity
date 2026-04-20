# Diagrama de Estados — JAAR Digital

Sistema de gestión comunitaria de agua potable para la Junta de Acueducto Rural y Riego (JAAR) de Caballero.

---

## 1. Estado de Cuenta de Usuario (Registro & Auth)

```mermaid
stateDiagram-v2
    direction LR
    [*] --> FormularioRegistro : Visitante abre registro.html

    FormularioRegistro --> ValidandoDatos : Click "Registrar"
    ValidandoDatos --> FormularioRegistro : ❌ Campos vacíos o\nusuario duplicado
    ValidandoDatos --> Pendiente : ✅ Datos válidos\n(guardado en localStorage)

    Pendiente --> Activo     : Admin aprueba ✅
    Pendiente --> Rechazado  : Admin rechaza ❌

    Activo --> Suspendido    : Admin suspende ⏸
    Suspendido --> Activo    : Admin re-aprueba ✅
    Rechazado  --> Activo    : Admin re-aprueba ✅

    Activo     --> [*]       : Login exitoso →\nredirige según rol
    Pendiente  --> [*]       : Intento de login\n→ bloqueado
    Rechazado  --> [*]       : Intento de login\n→ bloqueado
    Suspendido --> [*]       : Intento de login\n→ bloqueado
```

---

## 2. Flujo de Sesión (Login / Guard)

```mermaid
stateDiagram-v2
    direction TB
    [*] --> PáginaLogin : Cualquier URL sin sesión

    PáginaLogin --> ValidandoCredenciales : Ingresa usuario + clave
    ValidandoCredenciales --> PáginaLogin : ❌ Usuario/clave incorrectos\n(animación shake)
    ValidandoCredenciales --> EstadoCuenta : Credenciales OK

    EstadoCuenta --> PáginaLogin : Estado ≠ activo\n(pendiente / rechazado / suspendido)
    EstadoCuenta --> RedirecciónRol : Estado = activo

    RedirecciónRol --> PanelAdmin    : rol = admin → admin.html
    RedirecciónRol --> PanelCobrador : rol = cobrador → index.html
    RedirecciónRol --> PanelMINSA   : rol = minsa → reporte.html
    RedirecciónRol --> PanelCliente  : rol = cliente → historial.html

    PanelAdmin    --> PáginaLogin : Logout 🚪
    PanelCobrador --> PáginaLogin : Logout 🚪
    PanelMINSA   --> PáginaLogin : Logout 🚪
    PanelCliente  --> PáginaLogin : Logout 🚪

    note right of RedirecciónRol
        Auth.guard() verifica también
        que cada rol solo acceda
        a sus páginas permitidas.
        Cualquier acceso no autorizado
        redirige al destino correcto.
    end note
```

---

## 3. Estado de Pago de Vecino (Ciclo de Deuda)

```mermaid
stateDiagram-v2
    direction LR
    [*] --> AlDía : Vecino registrado /\nMes pagado correctamente

    AlDía   --> Moroso : Pasa 1 mes sin pagar\n(mesesSinPagar ≥ 1)
    Moroso  --> Moroso : Pasa otro mes sin pagar\n(mesesSinPagar ≥ 2)
    Moroso  --> Corte  : 3 o más meses sin pagar\n(mesesSinPagar ≥ 3)
    Corte   --> AlDía  : Cobrador registra cobro ✅\n(pagadoEsteMes = true,\nmesesSinPagar = 0)
    Moroso  --> AlDía  : Cobrador registra cobro ✅
    AlDía   --> AlDía  : Nuevo período,\nya pagó este mes

    note right of Corte
        Badge: 🔴 Corte
        Botón "Cobrar $3.00" visible.
        Al pagar: estado → AlDía
    end note
    note right of Moroso
        Badge: ⚠️ Moroso
        Botón "Cobrar $3.00" visible.
    end note
    note right of AlDía
        Badge: ✅ Al Día
        Botón "Pagado" (deshabilitado)
    end note
```

---

## 4. Ciclo de Vida de un Cobro (Offline-First)

```mermaid
stateDiagram-v2
    direction LR
    [*] --> PendienteLocal : Cobrador registra cobro\n(registrarCobro)\n→ guardado en localStorage

    PendienteLocal --> EnSincronización : Click "Sincronizar ☁️"\ny hay conexión a internet

    EnSincronización --> Sincronizado : Simulación exitosa\n(2 seg de espera)\n→ cola vaciada
    EnSincronización --> PendienteLocal : Sin conexión\n→ permanece pendiente

    Sincronizado --> [*] : Registro confirmado\nen nube (Supabase)

    note left of PendienteLocal
        Guardado en:
        - jaar_pending_payments
        - jaar_pagos
        Contador visible en UI
    end note
    note right of EnSincronización
        syncBtn muestra "⏳ Conectando..."
        Clase CSS: loading
    end note
```

---

## 5. Estado de Conectividad de Red

```mermaid
stateDiagram-v2
    direction LR
    [*] --> DetectandoRed : App carga

    DetectandoRed --> Online  : navigator.onLine = true
    DetectandoRed --> Offline : navigator.onLine = false

    Online  --> Offline : Evento 'offline'\n(se pierde conexión)
    Offline --> Online  : Evento 'online'\n(regresa conexión)

    Online  --> Online  : Sincronización\ndisponible ✅
    Offline --> Offline : Solo operación\nlocal ⚡

    note right of Online
        Badge: "Conectado" 🟢
        Permite: forceSync()
    end note
    note right of Offline
        Badge: "Sin Conexión" 🔴
        Cobros guardados localmente.
        Sync bloqueado.
    end note
```

---

## 6a. Jornal Comunitario — Registro por Cobrador

```mermaid
stateDiagram-v2
    direction TB
    [*] --> FormJornal : Cobrador abre jornales.html

    FormJornal --> SeleccionaAsistencia : Elige vecino + tarea

    SeleccionaAsistencia --> PanelAsistió : Asistencia = "Sí"
    SeleccionaAsistencia --> PanelNoAsistió : Asistencia = "No"

    PanelAsistió --> TipoAsistente : Indica horas
    TipoAsistente --> JornalPersonal    : Quién = "Personal"
    TipoAsistente --> JornalSustituto   : Quién = "Sustituto"\n→ requiere nombre

    JornalPersonal  --> JornalGuardado : Click "Guardar" ✅
    JornalSustituto --> JornalGuardado : Click "Guardar" ✅

    PanelNoAsistió --> MultaAplicada : Indica monto multa
    MultaAplicada  --> JornalGuardado : Click "Guardar" ✅

    JornalGuardado --> [*] : Registro en localStorage\n(jaar_jornales)\nToast de confirmación

    note right of JornalSustituto
        Estado especial:
        se muestra campo extra
        para nombre del sustituto.
    end note
    note right of MultaAplicada
        Badge: 🔴 Faltó (-$multa)
        Visible en historial
    end note
```

---

## 6b. Jornal Comunitario — Confirmación por Cliente (RF-11)

```mermaid
stateDiagram-v2
    direction TB
    [*] --> VistaJornalesCliente : Cliente abre historial.html\n(sección jornales programados)

    VistaJornalesCliente --> JornalPendienteRespuesta : Jornal programado\nsin respuesta del vecino

    JornalPendienteRespuesta --> ConfirmandoAsistencia : Cliente selecciona respuesta

    ConfirmandoAsistencia --> AceptaPersonal    : "Asistiré personalmente"
    ConfirmandoAsistencia --> AceptaSustituto   : "Mando un sustituto"\n→ requiere nombre
    ConfirmandoAsistencia --> Rechaza           : "No asistiré"

    AceptaPersonal  --> RespuestaGuardada : Confirma ✅\nfecha + hora registradas
    AceptaSustituto --> RespuestaGuardada : Confirma ✅\nnombre sustituto + fecha + hora
    Rechaza         --> RespuestaGuardada : Confirma ❌\nfecha + hora registradas

    RespuestaGuardada --> [*] : Guardado en localStorage\n(jaar_jornales_respuestas)\nCobrador puede ver la respuesta

    note right of JornalPendienteRespuesta
        Estado inicial de todo jornal
        programado visible al cliente.
        Cobrador lo crea desde 6a.
    end note
    note right of AceptaSustituto
        Campo adicional:
        nombre del sustituto.
        Similar al flujo del Cobrador.
    end note
    note right of RespuestaGuardada
        Registra: respuesta, fecha,
        hora y nombre de sustituto
        si aplica (RF-11.3).
    end note
```

---

## 7. Panel de Administración — Estado de Usuarios

```mermaid
stateDiagram-v2
    direction LR
    [*] --> SecciónPendientes : Admin abre admin.html

    SecciónPendientes --> AprobandoUsuario  : Admin click "✅ Aprobar"
    SecciónPendientes --> RechazandoUsuario : Admin click "❌ Rechazar"\n(+ confirmación)

    AprobandoUsuario  --> SecciónActivos    : estado → 'activo'
    RechazandoUsuario --> SecciónInactivos  : estado → 'rechazado'

    SecciónActivos --> SuspendidoAdmin  : Admin click "⏸ Suspender"
    SecciónActivos --> ResetearClave    : Admin click "🔑 Reset Clave"\n(prompt nueva clave)

    SuspendidoAdmin --> SecciónInactivos : estado → 'suspendido'
    ResetearClave   --> SecciónActivos   : Clave actualizada en localStorage

    SecciónInactivos --> AprobandoUsuario : Admin click "✅ Aprobar"\n(re-activar cuenta)
    AprobandoUsuario --> SecciónActivos   : estado → 'activo'

    note right of SecciónActivos
        Muestra: suspender + reset clave
    end note
    note right of SecciónPendientes
        Muestra: aprobar + rechazar
    end note
    note right of SecciónInactivos
        Muestra: solo "re-aprobar"
    end note
```

---

## 8a. Navegación por Módulos — Rol Cobrador

```mermaid
stateDiagram-v2
    direction TB
    [*] --> index_html : Login exitoso (rol = cobrador)

    index_html    --> jornales_html : Nav → ⛏️ Jornales
    index_html    --> gastos_html   : Nav → 🧾 Gastos
    index_html    --> foro_html     : Nav → 💬 Foro\n(puede publicar avisos ✍️)
    index_html    --> reporte_html  : Nav → 📊 MINSA

    jornales_html --> index_html    : Nav → 💧 Cobros
    jornales_html --> gastos_html   : Nav → 🧾 Gastos
    jornales_html --> foro_html     : Nav → 💬 Foro
    jornales_html --> reporte_html  : Nav → 📊 MINSA

    gastos_html   --> index_html    : Nav → 💧 Cobros
    foro_html     --> index_html    : Nav → 💧 Cobros
    reporte_html  --> index_html    : Nav → 💧 Cobros

    index_html    --> login_html    : 🚪 Logout
    jornales_html --> login_html    : 🚪 Logout
    gastos_html   --> login_html    : 🚪 Logout
    foro_html     --> login_html    : 🚪 Logout
    reporte_html  --> login_html    : 🚪 Logout
```

---

## 8b. Navegación por Módulos — Rol Cliente

```mermaid
stateDiagram-v2
    direction TB
    [*] --> historial_html : Login exitoso (rol = cliente)

    historial_html --> foro_html      : Nav → 💬 Avisos\n(solo lectura)
    historial_html --> jornales_html  : Sección jornales programados\n(confirmar asistencia RF-11)

    foro_html      --> historial_html : Nav → 👤 Mi Cuenta
    jornales_html  --> historial_html : Vuelve a Mi Cuenta

    historial_html --> login_html     : 🚪 Logout
    foro_html      --> login_html     : 🚪 Logout

    note right of historial_html
        Muestra:
        - Estado de pagos del vecino
        - Horas trabajadas (RF-06)
        - Acceso a jornales programados
    end note
    note right of foro_html
        Solo lectura.
        No puede publicar avisos.
        Solo Cobrador puede hacerlo.
    end note
    note right of jornales_html
        Vista restringida al cliente:
        solo ve jornales programados
        y puede confirmar su respuesta.
        No accede al formulario del Cobrador.
    end note
```

---

## 9. Resumen de Estados Globales del Sistema

| Dominio | Estados posibles | Quién actúa |
|---|---|---|
| **Cuenta de usuario** | `pendiente` → `activo` / `rechazado` / `suspendido` | Admin |
| **Sesión** | Sin sesión → Autenticado (por rol) → Cerrada | Todos |
| **Vecino / Pago** | `Al Día` → `Moroso` → `Corte` → `Al Día` | Cobrador |
| **Cobro offline** | `registrado local` → `en sincronización` → `sincronizado` | Cobrador |
| **Red** | `online` ↔ `offline` | Sistema (automático) |
| **Jornal (registro)** | `asistió (personal/sustituto)` / `no asistió (multa)` → `guardado` | Cobrador |
| **Jornal (confirmación)** | `pendiente respuesta` → `acepta` / `sustituto` / `rechaza` → `guardado` | Cliente |
| **Foro / Aviso** | `redactado` → `publicado` (solo lectura para clientes y MINSA) | Solo Cobrador |
| **Gasto** | `registrado` → `guardado en localStorage` → `visible en reporte` | Cobrador |
| **Rol de acceso** | `admin` / `cobrador` / `minsa` / `cliente` | Sistema |

---

> **Notas de implementación:**
> - Toda la persistencia es en `localStorage` (Offline-First).
> - La sincronización con Supabase está simulada (2 seg de delay mock).
> - El guard de rutas (`Auth.guard()`) protege cada página según rol activo.
> - Los "estados" de vecinos se calculan dinámicamente (`calcularEstado()` en `app.js`), no se almacenan explícitamente.
> - **RF-05**: Solo el Cobrador puede publicar en el Foro. Admin no tiene acceso a `foro.html`.
> - **RF-06**: El historial del cliente debe mostrar horas trabajadas además del estado de pagos.
> - **RF-11**: El cliente puede confirmar asistencia, informar sustituto o rechazar un jornal programado (diagrama 6b).
