# Documento de Requerimientos y Arquitectura de Software

***Proyecto: SIMAP Digital · Cuentas Claras 💧***

***Fecha: 14/07/2026***

***Integrantes: Equipo de Desarrollo JAAR Digital***

## Tabla de contenido

1. Propósito
2. Alcance del producto / Software
3. Referencias
4. Funcionalidades del producto
5. Visión General
6. Clases y características de usuarios
7. Entorno operativo
8. Requerimientos funcionales
9. Reglas de negocio
10. Requerimientos de interfaces externas
11. Requerimientos no funcionales
12. Otros requerimientos
13. Posicionamiento
14. Descripción de Stakeholders y Usuarios
15. Descripción Global del Producto
16. Características Secundarias
17. Restricciones
18. Precedencia y Prioridad
19. Otros Requisitos del Producto
20. MODELO CASOS DE USO
21. Modelo de Arquitectura de Análisis
22. Modelo de base de datos
23. Correspondencia de necesidades de actores y Casos de Uso
24. ACTORES Y SUS RESPONSABILIDADES
25. MODELO DE ANÁLISIS
26. ANÁLISIS DE RELACIONES ENTRE MODULOS
27. MODELO OSSIM
28. DOCUMENTACIÓN DE LA ARQUITECTURA
29. Vistas
Glosario
Historial de Versiones
Información del Proyecto
Aprobaciones

---

# 1. Propósito

El propósito de este documento es definir de forma meticulosa y exhaustiva la especificación de requerimientos y la arquitectura de software del sistema **SIMAP Digital · Cuentas Claras**. Este documento describe todos los módulos operativos, financieros y de inteligencia artificial de la Plataforma Web Progresiva (PWA) Offline-First diseñada para la modernización de las Juntas Administradoras de Acueductos Rurales (JAAR) en la República de Panamá.

# 2. Alcance del producto / Software

**SIMAP Digital** es un sistema integral tecnológico que sustituye el registro manual tradicional en cuadernos por un libro mayor digital.
- **Propósito:** Optimizar y transparentar la administración contable (cobro de tarifas de agua) y la gestión de jornales (trabajo comunitario) en zonas sin conexión a internet.
- **Beneficios:** Garantiza el pleno cumplimiento del Decreto Ejecutivo N° 1839 del Ministerio de Salud (MINSA). Mitiga la desconfianza local mediante la rendición sistemática de cuentas. Reduce la morosidad utilizando gamificación (puntos por pago puntual) y herramientas analíticas (Ruta IA).
- **Objetivos:** Digitalizar la contabilidad rural, asegurar operatividad en áreas sin conectividad (Offline-First), sistematizar el control de jornales, y automatizar la rendición de cuentas (PDF/Excel) ante el MINSA.

# 3. Referencias

1. Decreto Ejecutivo N° 1839 del 5 de diciembre de 2014 (MINSA, Panamá).
2. Documento: *JAAR_Digital_Propuesta_Final.md*.
3. Documento: *casos_de_uso_v2.md*.
4. Documento: *diagrama_er.md*.
5. Documentación de Dexie.js (IndexedDB wrapper) y Supabase (BaaS).

# 4. Funcionalidades del producto

1. Registro y Autenticación Multi-Rol.
2. Cobranza Offline-First (Pagos Estándar, Parciales, Adelantados y Diarios).
3. Sincronización Automática (IndexedDB a Supabase).
4. Gestión y Registro de Jornales Comunitarios y Multas.
5. Motor de Gamificación (Puntos por pagos y asistencia, canjeables por descuentos).
6. Split de Comisiones automático para cobradores.
7. Inteligencia Artificial (Ruta IA, predicción de morosidad y cálculo de riesgo).
8. Reportes Oficiales MINSA (PDF y XLSX).

# 5. Visión General

El resto del documento presenta las reglas de negocio, características detalladas de los usuarios, la lista estructurada de requerimientos funcionales y no funcionales, así como el modelado de datos (ER), diagramas de casos de uso y la arquitectura del sistema basada en vistas lógicas y físicas (Modelo 4+1).

# 6. Clases y características de usuarios

1. **Administrador Global (`admin`):** Control total de finanzas, tarifas, auditoría, revisión del tablero de métricas IA y gestión (aprobación/rechazo) de usuarios.
2. **Cobrador en Campo (`cobrador`):** Registra pagos y jornales de forma offline, recibe comisiones automáticas, utiliza "Ruta Inteligente" de la IA para priorizar cobros.
3. **Auditor MINSA (`minsa`):** Acceso de solo lectura para extraer reportes oficiales de ingresos, egresos y jornales.
4. **Cliente / Vecino (`cliente`):** Visualiza su estado de riesgo en lenguaje amigable, verifica puntos acumulados por gamificación, revisa su historial y confirma asistencia a jornales.
5. **Soporte Técnico (`dev`):** Lectura del log de auditoría del sistema para depuración (sin acceso a modificación de finanzas).

# 7. Entorno operativo

- **Arquitectura:** PWA (Progressive Web App) alojada en la nube (ej. Vercel o GitHub Pages) con arquitectura Offline-First.
- **Cliente Web/Móvil:** React 18, Vite, compatible con navegadores modernos (Chrome, Firefox, Safari) en dispositivos móviles de gama media/baja.
- **Base de Datos Local:** IndexedDB manejada mediante Dexie.js (capacidad de hasta 10,000 registros).
- **Base de Datos Remota:** PostgreSQL a través de Supabase.

# 8. Requerimientos funcionales

## 8.1. Gestión de Usuarios y Accesos
- **RF-01.1:** El sistema debe registrar vecinos como "pendientes" hasta su aprobación por el Administrador.
- **RF-01.2:** El sistema debe manejar 5 roles estrictos (`admin`, `cobrador`, `minsa`, `cliente`, `dev`).

## 8.2. Pagos Flexibles y Offline
- **RF-02.1:** El sistema debe registrar pagos estándar ($3.00), parciales, anticipados y diarios, almacenándolos localmente si no hay red.
- **RF-02.2:** El sistema debe calcular automáticamente el estado del vecino (Activo, Moroso, Para Corte) basándose en meses de atraso.

## 8.3. Comisiones y Recompensas (Gamificación)
- **RF-03.1:** El sistema debe otorgar puntos (ej. 5 por puntualidad, 8 por jornal personal) a los clientes.
- **RF-03.2:** El sistema debe permitir canjear puntos (ej. 1 pt = $0.10) en futuros cobros.
- **RF-03.3:** El sistema debe calcular el "Split de Comisiones" para el cobrador (ej. 40% del monto base de comisión) de forma atómica.

## 8.4. Inteligencia Artificial y Análisis
- **RF-04.1:** El módulo de IA debe asignar un Puntaje de Riesgo (0-100) a cada hogar.
- **RF-04.2:** El sistema debe generar una "Ruta Inteligente" que reordene la lista de visitas del cobrador priorizando riesgo y proximidad geográfica.
- **RF-04.3:** El sistema debe predecir y alertar hogares que caerán en morosidad mediante análisis Z-Score de la tasa de recaudo.

## 8.5. Reportes MINSA y Gastos
- **RF-05.1:** Exportación trimestral de ingresos, egresos y jornales a PDF (`jspdf`) y Excel (`xlsx`).

# 9. Reglas de negocio

- **RN-01:** La sincronización hacia Supabase debe priorizar el Timestamp local. En caso de conflicto de red, el registro local marcado como 'pendiente' sobreescribe el remoto si su marca de tiempo es mayor.
- **RN-02:** Las multas por inasistencia a un jornal ($15.00) se aplican automáticamente a la cuenta del vecino si no asiste y no envía sustituto.
- **RN-03:** El porcentaje del split de comisión del cobrador nunca puede afectar el monto bruto que entra a la caja de la JAAR; se calcula como un incentivo separado sobre un fondo asignado o un recargo de conveniencia.
- **RN-04:** Un cliente en estado "Para Corte" (3+ meses de morosidad) solo retorna a "Activo" a través de una operación de "Puesta al Día" completa.

# 10. Requerimientos de interfaces externas

## 10.1. Interfaces de usuario
- **Diseño Mobile-First:** Botones de gran tamaño para facilitar la operación en campo bajo alta luminosidad (sol directo).
- **Semáforo de Estados:** Colores estandarizados para morosidad (Verde=Bajo Riesgo, Amarillo=Medio, Naranja=Alto, Rojo=Crítico).
- **CSS Variables:** Soporte para Dark/Light Mode y tipografía clara.

## 10.2. Interfaces de hardware
- (Opcional a futuro) Compatibilidad con API Web Bluetooth para impresoras térmicas de recibos POS.

## 10.3. Interfaces de software
- Supabase SDK (`@supabase/supabase-js`) para autenticación y persistencia de datos.

## 10.4. Interfaces de comunicación
- Uso intensivo de `Service Workers` para interceptar peticiones de red y cachear archivos estáticos (JS, CSS) e imágenes, permitiendo que el PWA se instale en la pantalla de inicio del dispositivo.

# 11. Requerimientos no funcionales

- **RNF-01 (Offline):** La aplicación debe funcionar ininterrumpidamente sin conexión; operaciones locales CRUD en Dexie.js deben tomar < 500ms.
- **RNF-02 (Rendimiento):** El TTI (Time To Interactive) de la aplicación debe ser inferior a 3 segundos en conexiones 3G.
- **RNF-03 (Seguridad):** Uso estricto de Row Level Security (RLS) en Supabase para impedir que los cobradores manipulen el libro mayor de otros cobradores o las finanzas históricas.
- **RNF-04 (Privacidad):** Un vecino (`cliente`) bajo ninguna circunstancia puede acceder a las deudas o puntajes de riesgo de otros vecinos.

# 12. Otros requerimientos

- Los datos (exportaciones XLSX/PDF) deben generarse al lado del cliente (Client-Side Generation) para evitar carga en el servidor y permitir generación offline.

# 13. Posicionamiento 

## 13.1 Oportunidad de Negocio 
Aproximadamente 3,682 JAAR legalmente constituidas en Panamá manejan finanzas en libretas susceptibles a pérdida, humedad y fraudes, generando desconfianza comunitaria.
## 13.2 Sentencia que define el problema 
La falta de conectividad en zonas rurales imposibilita el uso de ERPs modernos, y el registro manual genera morosidad prolongada y penalizaciones por parte del MINSA ante la falta de reportes claros.
## 13.3 Sentencia que define la posición del Producto 
Para las Juntas de Acueductos Rurales (JAAR) e instituciones públicas (MIDES, MINSA), **SIMAP Digital** es la única Plataforma Web Offline-First que asegura recaudo eficiente con IA, fomenta la puntualidad mediante puntos, y garantiza la auditoría estatal instantánea.

# 14. Descripción de Stakeholders y Usuarios 

## 14.1 Resumen de Stakeholders 
- MINSA (DISAPAS): Ente regulador. Exige informes trimestrales.
- Directiva JAAR: Responsables legales. Necesitan liquidez para comprar cloro y reparar bombas.
- Patrocinadores / RSE: Empresas mineras/constructoras que pueden donar el sistema.
## 14.2 Resumen de Usuarios 
- Cobradores, Tesoreros, Inspectores Estatales y Vecinos.
## 14.3 Entorno de usuario 
Caminos rurales, clima tropical, escasa energía eléctrica y dispositivos con conectividad intermitente (EDGE/3G).
## 14.4 Perfil de los Stakeholders 
Líderes comunitarios con baja literacidad digital; exigen interfaces directas (con emojis o iconografía explícita).

# 15. Descripción Global del Producto 

## 15.1 Perspectiva del producto 
Es una aplicación independiente (SPA PWA) acoplada a un modelo de Backend as a Service (Supabase) que entra en acción solo cuando la red es detectada por el Service Worker.

# 16. Características Secundarias 
## 16.1 Foro de Avisos
Módulo donde la directiva informa cortes de agua, mantenimientos, o asambleas.
## 16.2 Módulo Dev/Auditoría
Logs inmutables de todo lo que ocurre en el sistema para trazabilidad técnica.

# 17. Restricciones 
- **Económicas:** Se usan Free Tiers (Vercel, Supabase gratuito) para que el sistema sea viable sin cobros de licenciamiento mensual altos a comunidades de subsistencia.
- **Memoria:** IndexedDB en iOS Safari tiene cuotas de memoria estrictas, limitando el almacenamiento de blobs grandes.

# 18. Precedencia y Prioridad 
1. Capa Offline (Dexie.js) y Módulo de Cobros Flexibles.
2. Sincronizador Bidireccional Supabase.
3. Reportes JS PDF y SheetJS.
4. Módulo "Ruta IA" y Gamificación.

# 19. Otros Requisitos del Producto 
- Estándares del Formato Contable MINSA.

# 20. MODELO CASOS DE USO 

## 20.1 Definición de Actores 
- **Admin:** Configura reglas de puntos (Split), aprueba vecinos, revisa tablero de recaudo.
- **Cobrador:** Registra cobros (normales, parciales, Puesta al Día), jornales, canjea puntos, usa Ruta Inteligente.
- **Cliente:** Verifica estado de riesgo en "lenguaje amigable", ve sus puntos, confirma asistencia.
- **Sistema (IA):** Detecta anomalías, predice morosidad, asigna puntajes de riesgo.

## 20.2 Diagrama de Actores 

[Inserte aquí la imagen del diagrama]

### 20.2.1. Casos de Uso (Extracto)
- **CU-06:** Pago Mensual Estándar.
- **CU-07:** Pago Parcial.
- **CU-11:** Cobrador Registra Pago y Recibe Comisión Automática.
- **CU-16:** Vecino Canjea Puntos por Descuento.
- **CU-19:** Cobrador Activa "Ruta Inteligente".
- **CU-20:** Sistema Predice Hogares que Caerán en Morosidad.
- **CU-23:** Cliente Ve su Estado de Riesgo en Lenguaje Amigable.

### 20.2.2. Identificación de Casos de Uso 
El Sistema de IA incluye (<<include>>) la evaluación del historial del cliente de forma automatizada y el Cobrador usa el reordenamiento a voluntad.

### 20.2.3. Diagrama de casos de uso 

[Inserte aquí la imagen del diagrama]

# 21. Modelo de Arquitectura de Análisis 

## 21.1. Diagrama de Arquitectura de Análisis 

[Inserte aquí la imagen del diagrama]

## 21.2. Clases de Análisis 
Patrón Repository en React. Todos los componentes interactúan con servicios asíncronos (`PaymentService`, `SyncService`) que deciden si guardar en la RAM, en IndexedDB o intentar escribir directamente en la DB en Supabase.

## 21.3. Identificación de clases de Análisis 
Se dividen en fronteras (UI), control (Context API / Custom Hooks) y entidad (IndexedDB Collections).

### 21.3.1. Diagrama de Secuencia 

[Inserte aquí la imagen del diagrama]

### 21.3.2. Diagramas de Colaboración 

[Inserte aquí la imagen del diagrama]

# 22. Modelo de base de datos 

## 22.1. Modelo Conceptual 

[Inserte aquí la imagen del diagrama]

Entidades Core: `USUARIO`, `MIEMBRO`, `PAGO`, `JORNADA`, `JORNAL_ASISTENCIA`, `GASTO`, `CATEGORIA_GASTO`, `SINCRONIZACION_COLA`.

## 22.2. Modelo Lógico y Físico 
- **PAGO:** `id_pago (PK)`, `id_miembro (FK)`, `monto (decimal)`, `mes (int)`, `anio (int)`, `estado_sincronizacion (string)`.
- **JORNAL_ASISTENCIA:** `id_asistencia`, `id_jornada`, `asistio (boolean)`, `nombre_sustituto`, `monto_multa`.
- **SINCRONIZACION_COLA:** `id_cola`, `tipo_operacion`, `tabla_destino`, `json datos`, `estado`.
*Los triggers de PostgreSQL (Supabase) actualizan las vistas materializadas como `vista_estado_miembros`.*

## 22.3. Modelo Físico 

[Inserte aquí la imagen del diagrama]

# 23. Correspondencia de necesidades de actores y Casos de Uso 

## 23.1. Matriz de trazabilidad
- **Cobrador en el barro:** Necesita no bloquear la app guardando datos -> Uso de IndexedDB con guardado optimista.
- **Dirigente JAAR:** Necesita detectar por qué bajó la recaudación -> CU-22 (Anomalías detectadas por IA).

# 24. ACTORES Y SUS RESPONSABILIDADES 
El **Cobrador** es responsable absoluto de la fidelidad del dinero en efectivo que lleva consigo y de realizar el Split de Comisión. El **Administrador** responde legalmente ante el **Auditor MINSA**.

# 25. MODELO DE ANÁLISIS 
Los Context Providers en React (`AuthContext`) manejan el estado global del rol de usuario y el estado de la conexión a red del navegador (`window.navigator.onLine`), inyectando dependencias al Component Tree.

## 25.1. Diagrama de Clases (Modelo de Objetos) 

[Inserte aquí la imagen del diagrama]

## 25.2. Identificación de clases (entidad, frontera y control) 
Descrito previamente.

## 25.3. Diagramas de Interacción 

[Inserte aquí la imagen del diagrama]

# 26. ANÁLISIS DE RELACIONES ENTRE MODULOS 
- El módulo **Comisiones y Recompensas** acopla con el Módulo de **Pagos Flexibles** a través de una transacción atómica (cuando se guarda el pago, se calcula el split y se guarda la comisión de inmediato).
- El módulo **Ruta IA** es lector (Read-Only) del padrón de `MIEMBROS` y `PAGOS` para calcular Z-scores, sin mutar datos.

## 26.1. Relación de Asociación 

[Inserte aquí la imagen del diagrama]

# 27. MODELO OSSIM 
- **Información:** Los datos críticos se almacenan de forma remota en PostgreSQL con respaldos diarios provistos por Supabase.
- **Mantenimiento:** El CI/CD configurado en el `package.json` corre Vite Build y Linters, permitiendo deploys con cero tiempo de inactividad (Zero-Downtime Deploy) al hacer Push a Main.

# 28. DOCUMENTACIÓN DE LA ARQUITECTURA 
Arquitectura *Offline-First SPA*. Los flujos de sincronización funcionan en Background, utilizando un Polling o un listener de evento de reconexión. 

## 28.1. Modelo de "4+1" (diagrama de kruchten) 

[Inserte aquí la imagen del diagrama]

# 29. Vistas 

## 29.1. Vista Lógica 
Dividido en:
- `utils/` (Helpers criptográficos, formateros).
- `services/` (Data Access Layer - Dexie/Supabase).
- `components/` (UI presentacional, botones y Toasts).
- `pages/` (Vistas por rol).

### 29.1.1. Diagrama de clases 

[Inserte aquí la imagen del diagrama]

### 29.1.2. Diagrama de comunicación 

[Inserte aquí la imagen del diagrama]

## 29.2. Vista de desarrollo 
Empaquetado moderno ESM vía Vite. Dependencias clave: `dexie-react-hooks`, `jspdf`, `@supabase/supabase-js`, `xlsx`.

### 29.2.1. Diagrama de componentes 

[Inserte aquí la imagen del diagrama]

### 29.2.2. Diagrama de paquetes 

[Inserte aquí la imagen del diagrama]

## 29.3. Vista de procesos 
Flujo de Sincronización (Diagrama):
1. User acciona Guardar.
2. Si NO red -> IndexedDB -> `SINCRONIZACION_COLA` estado=Pendiente.
3. Al recuperar Red -> Evento despachado -> Worker lee cola -> POST Supabase.
4. Éxito -> Limpia Cola.

### 29.3.1. Diagrama de actividad o secuencia 

[Inserte aquí la imagen del diagrama]

## 29.4. Vista física o de despliegue 
Hosting de Assets estáticos de React en Vercel (CDN global). Base de datos en Supabase (AWS backend PostgreSQL). Dispositivos de usuario corren el runtime de JavaScript localmente.

### 29.4.1. Diagrama de despliegue 

[Inserte aquí la imagen del diagrama]

## 29.5. Escenarios 
(Vista "+1"). 
- El hilo conductor. Validar que la arquitectura física e infraestructura soporta el Caso de Uso de "Alta demanda en Telemedicina matutina" (en caso de proyectos médicos) o en nuestro caso "Sincronización masiva de fin de jornada del Cobrador".

### 29.5.1. Diagramas de caso de uso general 

[Inserte aquí la imagen del diagrama]

# Glosario
- **PWA:** Aplicación Web Progresiva.
- **Offline-First:** Patrón de diseño donde la aplicación está concebida primordialmente para funcionar sin red.
- **Jornal (Faina):** Obligación comunitaria de trabajo físico en el acueducto.
- **Z-Score:** Medida estadística utilizada por la Ruta IA para identificar caídas drásticas de recaudo.

# Historial de Versiones
| Fecha | Versión | Autor | Descripción |
|---|---|---|---|
| 14/07/2026 | 2.1 | Equipo SIMAP | Integración de etiquetas para inserción posterior de diagramas. |

# Información del Proyecto
| Atributo | Valor |
|---|---|
| Proyecto | SIMAP Digital Cuentas Claras 💧 |
| Fecha | 14/07/2026 |
| Regulador | Ministerio de Salud (MINSA) |

# Aprobaciones
| Nombre | Cargo | Organización | Firma |
|---|---|---|---|
| Directiva | Presidente | JAAR Panamá | _________________ |
