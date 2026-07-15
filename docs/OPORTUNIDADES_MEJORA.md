# SIMAP Digital · Oportunidades de Mejora

**Documento de análisis técnico y funcional**  
**Versión:** 1.0 · **Fecha:** 2026-07-03  
**Aplicación:** SIMAP Digital · Cuentas Claras 💧  
**Stack:** React 19 + Vite 8 + Dexie (IndexedDB) + Supabase + jsPDF/xlsx

---

## 1. Resumen Ejecutivo

SIMAP Digital es un MVP funcional con una arquitectura offline-first bien intencionada, pensada para comunidades rurales de Panamá con conectividad intermitente. Sin embargo, antes de considerarla lista para producción presenta **deuda técnica considerable**, **bugs críticos**, **desfase entre el modelo local y el modelo en Supabase**, y **flujos visuales que pueden optimizarse** para cobradores y vecinos.

Este documento clasifica las oportunidades en tres ejes:

1. **Mejoras lógicas / funcionales** — corrección de bugs, integridad de datos, seguridad, sincronización y calidad de código.
2. **Mejoras visuales / de UX** — sistema de diseño, accesibilidad, flujos móviles, feedback al usuario y consistencia de interfaz.
3. **Nuevas funcionalidades** — capacidades que amplían el valor del sistema para SIMAP, cobradores, juntas y entes de control (MINSA).

Cada ítem incluye, cuando aplica, el archivo o módulo afectado, el impacto y una recomendación concreta de implementación.

---

## 2. Mejoras Lógicas y Funcionales

### 2.1 Bugs críticos a corregir de inmediato

| # | Problema | Ubicación | Impacto | Recomendación |
|---|----------|-----------|---------|---------------|
| 1 | `generateId()` siempre retorna `'__'` | `src/utils/formatters.js:140` | Todos los registros de `gastos`, `jornales` y `foro` obtienen el mismo ID, provocando errores de clave duplicada en IndexedDB y pérdida de datos. | Reescribir `generateId()` usando `crypto.randomUUID()`, `Date.now()` + contador, o importar `nanoid`. Validar unicidad antes de insertar. |
| 2 | Filtro de mes en `CobrosPage` no filtra | `src/pages/CobrosPage.jsx:78-84` | El selector de mes es puramente decorativo; el cobrador no puede enfocar una fecha de cobro. | Aplicar `filtroMes` en la función `filtered` comparando el mes/año del saldo o último pago. |
| 3 | Puntos siempre muestran `0` | `src/pages/CobrosPage.jsx:53` | La gamificación no se percibe en el flujo de cobro; los vecinos no ven incentivos. | Integrar `puntosService.getPuntos(clienteId)` en vez del stub. |
| 4 | `recoverByHouse` usa `sector` como si fuera casa | `src/services/authService.js:104` | La recuperación de usuario por número de casa devuelve resultados incorrectos. | Cambiar a `eq('casa', casa)` o crear índice compuesto `sector + casa`. |
| 5 | `registerJunta` no vincula admin con junta | `src/services/authService.js` (registro) | Crea la junta y el usuario admin como entidades independientes; luego no se sabe quién administra qué. | Insertar `admin_id` en la tabla `juntas` o `junta_id` en `profiles`. |
| 6 | `ConfigPage` guarda `cuotaDiaria` pero el motor usa `cuotaMensual` | `src/pages/ConfigPage.jsx` vs `src/services/pagosService.js` | La configuración de cuota no afecta los cálculos reales de deuda. | Unificar nomenclatura y campos; usar `cuotaMensual` como fuente de verdad y mostrar equivalente diario calculado. |
| 7 | Credenciales del README no coinciden con Supabase | `README.md` vs `supabase/seed_roles.sql` | Un usuario que prueba la app con `admin`/`admin123` no puede iniciar sesión. | Actualizar README o crear un script de seed que genere usuarios con los emails y contraseñas documentados. |

### 2.2 Integridad de datos y sincronización offline-first

La arquitectura propone Dexie (local) + Supabase (nube), pero hay desfases importantes.

| # | Problema | Ubicación | Impacto | Recomendación |
|---|----------|-----------|---------|---------------|
| 8 | `syncService` no trae el campo `monto` de pagos | `src/services/syncService.js` | `ReportePage` y `ComisionesPage` muestran totales en cero o fallan al calcular comisiones. | Alinear el esquema de Supabase (`pagos.monto`) con el objeto usado en el frontend; agregar migración si es necesario. |
| 9 | Tabla `saldos` en Supabase solo guarda `estado` | `supabase/migrations/00001_init.sql` | Dexie espera `cuotaTotal`, `pagado`, `saldo`, `pagosIds`. La sincronización pierde el detalle financiero. | Ampliar la tabla `saldos` con los campos numéricos o derivarlos de una vista/materialized view. |
| 10 | Tabla `foro` carece de `titulo` | Esquema Supabase vs `src/pages/ForoPage.jsx` | Las publicaciones se guardan con título vacío o fallan al sincronizar. | Agregar columna `titulo` a la tabla `foro` y actualizar el seed. |
| 11 | Tabla `archivos` no almacena el blob | Esquema Supabase vs `src/services/db.js` | Solo se guardan metadatos; la foto/evidencia se pierde al cambiar de dispositivo. | Usar Supabase Storage para blobs o, si son pequeños, campo `bytea`/`text` base64 con límite de tamaño. |
| 12 | Sincronización bidireccional simulada | `src/components/layout/Header.jsx:52` | El botón de sincronización solo espera 2 segundos y limpia `pendingSync` sin enviar nada. | Invocar `syncService.pushToSupabase()` real; implementar cola de cambios (`changes`/`pendingSync`) con reintentos y manejo de conflictos. |
| 13 | Chat solo local | `src/services/chatService.js` | Los mensajes no llegan al otro usuario si cambia de dispositivo o si el cobrador y vecino no comparten la misma DB local. | Sincronizar mensajes con la tabla `mensajes` de Supabase; usar Realtime para notificaciones instantáneas cuando haya conexión. |
| 14 | No hay mecanismo de resolución de conflictos | General | Si un cobrador y otro editan el mismo pago offline, el último en sincronizar sobrescribe al otro. | Implementar vector clock, timestamps de edición o campo `version` por registro; mostrar diálogo de conflicto al usuario. |
| 15 | PWA sin Service Worker | `src/main.jsx` (registro comentado) | La app no funciona sin red ni se instala como aplicación. | Crear un SW con Workbox o Vite PWA que cachee shell, assets y datos críticos de IndexedDB. |

### 2.3 Autenticación, autorización y seguridad

| # | Problema | Ubicación | Impacto | Recomendación |
|---|----------|-----------|---------|---------------|
| 16 | Contraseñas en texto plano en constantes | `src/utils/constants.js:61-67` | Exposición de credenciales demo en el bundle; riesgo de seguridad. | Eliminar `SYSTEM_USERS` del frontend; mover credenciales demo a variables de entorno de desarrollo o seed seguro. |
| 17 | RLS permisivo en tablas críticas | `supabase/migrations/00001_init.sql` | Cualquier usuario autenticado puede leer/escribir pagos, saldos, gastos, usuarios y config. | Definir políticas RLS por rol (`admin`, `cobrador`, `cliente`, `minsa`) usando `auth.uid()` y columnas `user_id`/`rol`. |
| 18 | Auditoría usa `'admin_global'` hardcodeado | `src/pages/AdminPage.jsx:72`, `src/components/cobros/CobroModal.jsx:106` | Los logs de auditoría no reflejan al usuario real que ejecutó la acción. | Usar `authService.getCurrentUser().id` como responsable de cada transacción. |
| 19 | Uso de `window.confirm`/`window.prompt` | Varios módulos | Bloquean el hilo principal y rompen la experiencia móvil/PWA. | Reemplazar por modales propios (`Modal`/`ConfirmDialog`) del design system. |
| 20 | Sesión guardada en `sessionStorage` | `src/services/authService.js` | Se pierde al cerrar la pestaña; dificulta el uso diario en campo. | Evaluar `localStorage` con refresco de token de Supabase, o mantener `sessionStorage` solo en entornos compartidos con advertencia. |
| 21 | Sin límite de intentos de login | `src/pages/LoginPage.jsx` | Posible fuerza bruta contra credenciales. | Implementar rate limiting en Supabase o captcha (hCaptcha) y mensajes de error genéricos. |
| 22 | Sin validación de email/rol en registro | `src/pages/RegisterPage.jsx` | Un usuario puede intentar registrarse como admin. | Validar en frontend y backend (RLS/functions) que solo se permitan roles `cliente` y `cobrador` por registro público. |

### 2.4 Calidad de código, testing y mantenibilidad

| # | Problema | Ubicación | Impacto | Recomendación |
|---|----------|-----------|---------|---------------|
| 23 | Lint rojo con 38 problemas | `npm run lint` | 33 errores y 5 warnings; bloquea CI/CD limpio. | Corregir `setState` dentro de `useEffect`, dependencias de hooks, variables no usadas y exportaciones de componentes. |
| 24 | Funciones usadas antes de declarar | `CobroModal.jsx`, `HistorialPage.jsx` | Dificulta lectura y puede causar bugs de closure. | Reordenar funciones o extraer helpers a archivos `utils`. |
| 25 | Código duplicado en generación de meses | `src/utils/formatters.js` vs `src/services/pagosService.js` | Mantenimiento costoso y riesgo de inconsistencias. | Crear un único helper `dateUtils.js` con `generarMeses`, `esPagoPuntual`, `diffMeses`, etc. |
| 26 | Configuración de comisiones duplicada | `db.config` + `updateComisionesConfig` | Fuentes de verdad divergentes. | Centralizar en `db.config` y usar siempre el servicio `comisionesService`. |
| 27 | Sin tests unitarios ni de integración | Proyecto completo | Regresiones frecuentes al modificar lógica de pagos/saldos. | Agregar Vitest + React Testing Library; priorizar tests de `pagosService`, `formatters`, `authService` y componentes críticos (`CobroModal`). |
| 28 | Sin CI de calidad | `.github/workflows/deploy.yml` | El deploy puede publicar código con errores de lint o build. | Agregar pasos de `npm ci`, `npm run lint` y `npm run build` antes del despliegue; considerar preview deployments de Vercel. |
| 29 | Documentación de diagramas genera errores de ESLint | `docs/diagramas de actividad/generate_diagrams.js`, `docs/fix_diagrams.js` | `npm run lint` falla por archivos de documentación. | Excluir `docs/` de ESLint en `eslint.config.js` o mover scripts de documentación a una carpeta `scripts/` con su propio config. |
| 30 | Uso de React Router `HashRouter` | `src/App.jsx` | URLs con `#`; peor SEO y analytics; limita deep linking. | Evaluar migración a `BrowserRouter` con rewrites en Vercel/GitHub Pages. |
| 31 | `canvas` como devDependency sin uso claro | `package.json` | Aumenta tamaño de instalación y builds. | Verificar si es necesario para jsPDF en Node; si no, remover. |
| 32 | Variables de entorno desactualizadas | `.env.example` | Menciona OpenAI/Claude que no se usan. | Actualizar `.env.example` con las variables reales (Supabase URL/anon key) y documentar opcionales (AI API key). |

---

## 3. Mejoras Visuales y de Experiencia de Usuario (UX)

### 3.1 Sistema de diseño y consistencia visual

| # | Oportunidad | Archivos / área | Recomendación |
|---|-------------|-----------------|---------------|
| 33 | Unificar componentes UI | `src/components/ui/*`, `src/pages/*.css` | Hoy cada página/componente tiene CSS propio. Crear un design system con tokens de color, espaciado, tipografía y componentes base (`Button`, `Input`, `Card`, `Badge`, `Modal`) que se usen en todas las páginas. |
| 34 | Documentar tokens de diseño | `src/index.css` | Extraer variables como `--radius-sm`, `--spacing-md`, `--shadow-card` a una guía visual (`docs/UI_GUIDE.md`) para mantener coherencia en futuras pantallas. |
| 35 | Estandarizar estados de carga | Varios | Reemplazar textos "Cargando..." dispersos por `Skeleton` components consistentes (shimmer ya existe en CSS). |
| 36 | Estandarizar estados vacíos | Varios | Reutilizar `<EmptyState>` en todas las listas vacías con ilustración, título y acción principal. |
| 37 | Mejorar contraste y accesibilidad | `src/index.css` | Verificar ratios WCAG AA; ajustar colores de texto sobre fondos glassmorphism; no depender solo del color para estados de riesgo (agregar iconos/etiquetas). |

### 3.2 Navegación y flujos mobile-first

| # | Oportunidad | Archivos / área | Recomendación |
|---|-------------|-----------------|---------------|
| 38 | BottomNav dinámico por rol | `src/components/layout/BottomNav.jsx` | Mostrar solo ítems relevantes al rol; agrupar acciones secundarias en un menú "Más". |
| 39 | Breadcrumbs y título de página | General | Agregar breadcrumbs en desktop y header contextual en móvil para saber en qué módulo se está. |
| 40 | Redirección post-login inteligente | `src/App.jsx` | Si un cobrador entra directo a `/admin`, mostrar mensaje amigable y botón "Volver a mis cobros" en vez de 404 genérico. |
| 41 | Pull-to-refresh nativo | Páginas de listas | Implementar gesto de pull en listas de cobros, historial y chat para recargar datos. |
| 42 | Modales optimizados para móvil | `src/components/cobros/CobroModal.jsx` | En pantallas pequeños los modales deben ocupar casi toda la altura y tener botón de cierre grande; evitar scroll interno doble. |
| 43 | Atajos de teclado para cobradores | `CobrosPage` | Permitir `Enter` para cobrar, flechas para navegar vecinos, y búsqueda `/` para agilizar recaudo en laptop. |

### 3.3 Feedback, microinteracciones y accesibilidad

| # | Oportunidad | Archivos / área | Recomendación |
|---|-------------|-----------------|---------------|
| 44 | Toast system más expresivo | `src/context/ToastContext.jsx` | Diferenciar success / error / warning con iconos y colores; soportar acciones de deshacer (undo) en pagos recién creados. |
| 45 | Sonidos hápticos opcionales | Cobro exitoso, error | Agregar sonido corto y vibración (`navigator.vibrate`) al registrar un pago, útil en campo con pantalla bajo el sol. |
| 46 | Tooltips informativos | KPIs, badges de riesgo | Explicar qué significa "Alto riesgo", "Puntual", "Deuda acumulada" al mantener presionado o con ícono ⓘ. |
| 47 | Focus visible y navegación por teclado | General | Mejorar outlines de foco; asegurar que todos los botones sean alcanzables con `Tab`. |
| 48 | Textos adaptados al usuario rural | General | Usar lenguaje claro: "Puesta al día" en vez de "Regularización", "Cuota mensual" en vez de "Tarifa base". |
| 49 | Modo alto contraste / tamaño de fuente | `ThemeContext` | Agregar opción de accesibilidad para usuarios con baja visión. |

### 3.4 Dashboards, reportes y visualización

| # | Oportunidad | Archivos / área | Recomendación |
|---|-------------|-----------------|---------------|
| 50 | KPIs accionables en CobrosPage | `src/pages/CobrosPage.jsx` | Transformar los KPIs en tarjetas clickeables que filtren la lista (ej: "Morosos" filtra solo deudores). |
| 51 | Gráficas en ReportePage | `src/pages/ReportePage.jsx` | Agregar gráficas de barras/lineas (Recharts o Chart.js) de recaudación mensual, morosidad y comparación por sector. |
| 52 | Exportación con formato institucional | `src/pages/ReportePage.jsx` | Plantillas PDF/Excel con logo de la junta, fecha, firma digital y folio; permitir previsualización antes de descargar. |
| 53 | Mapa geográfico real | `src/pages/MapaPage.jsx` | Integrar Leaflet/Mapbox con coordenadas GPS de sectores/casas; colorear por recaudación y mostrar ruta de cobro. |
| 54 | Indicadores de riesgo visuales | `KPIGrid`, `UserCard` | Usar semáforo + iconografía (🔴🟡🟢) y gráficos de progreso de pago por vecino. |

---

## 4. Nuevas Funcionalidades

### 4.1 Cobranza y pagos

| # | Funcionalidad | Descripción | Valor |
|---|---------------|-------------|-------|
| 55 | **Cobro con múltiples métodos de pago** | Permitir registrar un pago parcial en efectivo + transferencia/Yappy en la misma factura. | Alineado con la realidad de comunidades donde coexisten medios. |
| 56 | **Generación de recibos digitales** | Al cobrar, generar un PDF de recibo con folio, QR de verificación y datos del vecino. | Evita reclamos y da formalidad al cobro. |
| 57 | **Notificaciones de pago vencido** | Envío automático de recordatorios por SMS/WhatsApp/S correo cuando un vecino esté próximo a vencer o en riesgo de corte. | Reduce morosidad. |
| 58 | **Plan de pago / acuerdo de regularización** | Permitir acordar un plan de pagos con cuotas parciales programadas y seguimiento. | Facilita la puesta al día sin saturar al vecino. |
| 59 | **Corte y reconexión de servicio** | Registrar fechas de corte por morosidad y reconexión tras pago; generar reporte para MINSA. | Cumplimiento normativo y control operativo. |
| 60 | **Cobro por lectura de medidor** | Capturar lectura del medidor de agua y calcular consumo/cuota variable. | Modelo de cobro más justo y usado por SIMAP. |

### 4.2 Gamificación y fidelización

| # | Funcionalidad | Descripción | Valor |
|---|---------------|-------------|-------|
| 61 | **Sistema de puntos completo** | Puntos por pago puntual, asistencia a jornales, referidos, reporte de fugas. Canje por descuentos en cuota. | Incrementa cultura de pago y participación. |
| 62 | **Ranking de vecinos** | Tablero público opcional de vecinos más puntualistas/asistentes. | Motivación comunitaria. |
| 63 | **Logros y medallas** | Medallas visuales: "Puntual 6 meses", "Jornalero destacado", "Pagador ejemplar". | Reconocimiento simbólico. |
| 64 | **Programa de referidos** | Si un vecino invita a otro y este paga 3 meses, ambos ganan puntos/descuento. | Crecimiento orgánico. |

### 4.3 Inteligencia artificial y analytics

| # | Funcionalidad | Descripción | Valor |
|---|---------------|-------------|-------|
| 65 | **Ruta inteligente de cobro real** | Usar datos de morosidad, ubicación y horario para sugerir orden óptimo de visitas del día. | Ahorra tiempo al cobrador. |
| 66 | **Predicción de morosidad** | Modelo simple basado en historial para predecir qué vecinos probablemente dejen de pagar. | Intervención proactiva. |
| 67 | **Detección de anomalías** | Alertar pagos duplicados, montos inusuales o cambios bruscos de consumo. | Control y auditoría. |
| 68 | **Asistente virtual para vecinos** | Chatbot que responda cuánto debe, cuándo vence y cómo ponerse al día; puede usar la misma tabla de `mensajes`. | Reduce carga del cobrador. |
| 69 | **Integración real con IA externa** | Conectar OpenAI/Claude/Azure según `.env.example` para análisis de reportes y sugerencias de cobro. | Hace la "Ruta IA" funcional fuera de Chrome. |

### 4.4 Comunicación y comunidad

| # | Funcionalidad | Descripción | Valor |
|---|---------------|-------------|-------|
| 70 | **Chat con mensajes leídos y adjuntos** | Confirmación de lectura, envío de fotos/evidencias y notas de voz. | Comunicación más rica. |
| 71 | **Foro con categorías y avisos oficiales** | Categorías: Avisos oficiales, Jornales, Emergencias, Preguntas. Fijar posts importantes. | Mejor organización. |
| 72 | **Noticias/comunicados por sector** | Publicar avisos dirigidos a sectores específicos o a toda la junta. | Comunicación segmentada. |
| 73 | **SOS / reporte de avería** | Botón de emergencia para reportar fugas, tuberías rotas o problemas de calidad de agua con foto y GPS. | Atención rápida. |
| 74 | **Encuestas comunitarias** | Votaciones simples para decisiones de junta (horario de jornal, aprobación de gasto). | Participación democrática. |

### 4.5 Administración, auditoría y control

| # | Funcionalidad | Descripción | Valor |
|---|---------------|-------------|-------|
| 75 | **Panel de aprobaciones completo** | Flujo de aprobación de nuevos vecinos con documentos adjuntos (cédula, contrato). | Control de identidad. |
| 76 | **Gestión de roles y permisos granular** | Crear roles adicionales (`tesorero`, `presidente`, `operador_minsa`) con permisos específicos. | Adaptarse a estructuras reales de juntas. |
| 77 | **Logs de auditoría inmutables** | Guardar quién hizo qué y cuándo en tabla `auditoria` con firma de hash; no permitir borrado. | Transparencia y control. |
| 78 | **Backup y restauración de datos** | Exportar/importar toda la base local en formato JSON cifrado para respaldo o migración de dispositivo. | Resiliencia. |
| 79 | **Panel de salud del sistema** | Para rol `dev`/`admin`: estado de sincronización, tamaño de IndexedDB, errores pendientes y versión de schema. | Soporte técnico. |
| 80 | **Multidispositivo por usuario** | Permitir que un cobrador use la misma cuenta en tablet y teléfono con sincronización en tiempo real. | Flexibilidad operativa. |

### 4.6 Módulos adicionales

| # | Funcionalidad | Descripción | Valor |
|---|---------------|-------------|-------|
| 81 | **Inventario de materiales** | Control de materiales de la junta (cemento, tuberías, herramientas) y su uso en jornales/reparaciones. | Gestión integral. |
| 82 | **Calidad del agua** | Registro de lecturas de cloro, pH y turbidez con alertas si salen de rango. | Cumplimiento MINSA. |
| 83 | **Conexiones nuevas y ampliaciones** | Flujo de solicitud, presupuesto y seguimiento de nuevas conexiones de agua. | Ingresos adicionales. |
| 84 | **Multijunta / federación** | Permitir que una federación de SIMAP vea reportes agregados de varias juntas. | Escalabilidad institucional. |
| 85 | **App móvil nativa (Capacitor/Flutter)** | Empaquetar como app para Android/iOS con acceso a cámara, GPS y notificaciones push. | Mejor experiencia en campo. |

---

## 5. Roadmap de Implementación Sugerido

### Fase 1 — Estabilidad crítica (1-2 semanas)
- Corregir `generateId()` y los bugs de la sección 2.1.
- Corregir todos los errores de ESLint.
- Alinear esquema de Supabase con Dexie (pagos.monto, saldos.*, foro.titulo).
- Implementar sincronización real `pushToSupabase` con cola de cambios.
- Reforzar RLS y remover contraseñas en texto plano del bundle.

### Fase 2 — UX y confianza (2-3 semanas)
- Unificar design system y componentes UI.
- Reemplazar `window.confirm` por modales propios.
- Mejorar KPIs, reportes con gráficas y mapa geográfico real.
- Implementar recibos digitales con QR.
- Agregar tests unitarios a servicios críticos.

### Fase 3 — Funcionalidades diferenciadoras (3-4 semanas)
- Sistema completo de puntos, logros y ranking.
- Ruta inteligente de cobro y predicción de morosidad.
- Chat sincronizado con Supabase Realtime.
- Notificaciones de vencimiento y SOS/reporte de averías.

### Fase 4 — Escalamiento institucional (continuo)
- Panel de auditoría inmutable.
- Multijunta / federación.
- App móvil nativa con Capacitor.
- Integraciones con MINSA, bancos y WhatsApp Business.

---

## 6. Conclusión

SIMAP Digital tiene una base sólida y una propuesta de valor clara para la gestión comunitaria del agua en Panamá. Sin embargo, el salto de "MVP funcional" a "producto confiable para producción" requiere:

1. **Corregir primero lo que rompe:** el bug de `generateId`, la sincronización simulada y el lint rojo.
2. **Alinear datos y seguridad:** esquema Supabase vs Dexie, RLS y auditoría real.
3. **Mejorar la experiencia visual y móvil:** design system, navegación, feedback y accesibilidad.
4. **Agregar funcionalidades que generen impacto:** recibos digitales, puntos, ruta inteligente, predicción de morosidad y comunicación bidireccional.

Implementar estas mejoras en el orden propuesto permitirá entregar valor temprano mientras se construye una base técnica escalable y mantenible.

---

## 7. Referencias Rápidas

- `README.md` — Descripción general y credenciales.
- `docs/PROYECTO.md` — Arquitectura, roles y módulos.
- `src/utils/formatters.js` — Bug de `generateId()`.
- `src/services/syncService.js` — Sincronización con Supabase.
- `src/services/db.js` — Esquema local de IndexedDB.
- `supabase/migrations/00001_init.sql` — Esquema remoto de Supabase.
- `src/pages/CobrosPage.jsx` — Flujo principal de cobro.
- `src/context/AuthContext.jsx` — Sesión y roles.
- `package.json` — Scripts y dependencias.
