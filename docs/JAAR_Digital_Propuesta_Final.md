# PROPUESTA DE PROYECTO: JAAR DIGITAL

**Sistema de Gestión y Fiscalización Tecnológica para Juntas Administradoras de Acueductos Rurales en la República de Panamá**

* **Preparado para:** Comunidades Rurales, Gobiernos Locales e Inspectores del Ministerio de Salud (MINSA)
* **Ámbito Geográfico:** República de Panamá (Regiones Rurales e Indígenas)
* **Normativa de Referencia:** Decreto Ejecutivo N° 1839 del 5 de diciembre de 2014 (MINSA)
* **Fecha:** Junio 2026

---

## 1. Nombre del Proyecto
El proyecto se denomina formalmente:
**JAAR Digital · Cuentas Claras 💧**

**Descripción resumida:** Plataforma Web Progresiva (PWA) con arquitectura de funcionamiento sin conexión (Offline-First) diseñada específicamente para la modernización contable, la administración operativa de los trabajos comunitarios (jornales) y la rendición periódica de informes ante el Ministerio de Salud (MINSA) en comunidades rurales del istmo panameño.

---

## 2. Objetivos del Proyecto

### 2.1 Objetivo General
Desarrollar e implementar una plataforma tecnológica autoinstalable (PWA) de tipo Offline-First para optimizar y transparentar la administración contable, financiera y de mano de obra comunitaria en las Juntas Administradoras de Acueductos Rurales (JAAR) de Panamá, garantizando el pleno cumplimiento del Decreto Ejecutivo N° 1839 del MINSA y mitigando la desconfianza local mediante la rendición sistemática de cuentas.

### 2.2 Objetivos Específicos
* **Digitalizar la Contabilidad Rural:** Sustituir el registro tradicional manual en cuadernos y libretas físicas de contabilidad por un libro mayor digital de ingresos (tarifas básicas de agua, cuotas extraordinarias y multas) y egresos (mantenimiento técnico, repuestos de bombas, cloro e insumos de potabilización).
* **Asegurar Operatividad en Áreas Sin Conectividad:** Diseñar y construir el software bajo el principio de "Offline-First", permitiendo que los cobradores y tesoreros comunitarios operen el sistema sin señal móvil ni internet, guardando los datos en la memoria local del navegador (localStorage) y sincronizándose de forma transparente al detectar una conexión estable.
* **Sistematizar el Control de Jornales Comunitarios:** Crear un módulo interactivo para registrar de forma rigurosa la participación obligatoria de los miembros de la comunidad en el mantenimiento físico del acueducto (limpieza de desarenadores, tomas de agua, tendido de tuberías), regulando el registro de sustitutos familiares y la aplicación automática de multas por inasistencia.
* **Automatizar la Rendición de Cuentas ante el MINSA:** Integrar plantillas de exportación digital (PDF y Microsoft Excel) que estructuren automáticamente la información en los formatos y esquemas de informes trimestrales y anuales establecidos por la Dirección del Sub-Sector de Agua Potable y Alcantarillados Sanitarios (DISAPAS) del MINSA.
* **Mitigar la Morosidad mediante Incentivos:** Implementar un tablero de visualización semafórica de deudas (Al Día, Moroso, Para Corte) junto a un modelo innovador de acumulación de puntos (por pago puntual, participación en jornales y adelantos) que los vecinos puedan canjear por pequeños descuentos controlados en sus tarifas del servicio.
* **Optimizar la Cobranza Presencial con Analítica Básica:** Incorporar herramientas de apoyo operativo al cobrador, incluyendo el cálculo de un "Índice de Riesgo de Morosidad" por hogar y la propuesta de una ruta inteligente de visitas físicas estructurada geográficamente para maximizar los niveles de recaudo.

---

## 3. Justificación y Necesidades

### 3.1 Contexto y Magnitud del Suministro de Agua Rural en Panamá
En Panamá, el Instituto de Acueductos y Alcantarillados Nacionales (IDAAN) posee una infraestructura concentrada en capitales de provincia y áreas de alta densidad urbana. Por ende, la cobertura de agua en los sectores rurales, montañosos y comarcales recae directamente sobre la autogestión comunitaria.

Este sistema de autogestión opera bajo la figura de las **Juntas Administradoras de Acueductos Rurales (JAAR)**. De acuerdo con datos de la Dirección de Saneamiento Rural del Ministerio de Salud (MINSA):
* Más de **677,000 personas** (aproximadamente el 30% de la población total de la República de Panamá) obtienen el agua potable a través de acueductos gestionados por las JAAR.
* Existen aproximadamente **5,000 acueductos comunitarios** construidos en el país.
* Un total de **3,682 JAAR cuentan con personería jurídica activa** registrada formalmente ante el MINSA, convirtiéndolas en los entes legalmente autorizados para la administración del recurso.

### 3.2 Necesidad Regulatoria: El Decreto Ejecutivo N° 1839
El funcionamiento de las JAAR está regulado por el **Decreto Ejecutivo N° 1839 del 5 de diciembre de 2014**, dictado por el MINSA. Este decreto establece directrices claras e insoslayables:
* Las JAAR son organismos de interés público y comunitario encargados de la administración, operación y mantenimiento del acueducto rural, bajo la rectoría técnica del MINSA.
* Las juntas directivas de las JAAR tienen la obligación legal de llevar registros financieros claros y verificables de toda su actividad económica y operativa.
* Deben rendir un **informe financiero consolidado de forma trimestral** ante los inspectores de Saneamiento Ambiental de la Región de Salud respectiva del MINSA.

La inobservancia de estas normativas pone en riesgo la personería jurídica de la JAAR, lo que imposibilita la firma de contratos con el Estado, la recepción de partidas presupuestarias gubernamentales para reparaciones de gran envergadura y la legitimidad en el cobro de la tarifa.

### 3.3 Necesidades Operativas y Contables No Resueltas
Actualmente, las directivas de las JAAR se enfrentan a desafíos severos en su cotidianidad:
1. **Vulnerabilidad de los Registros Manuales:** Los cobros y gastos se anotan en cuadernos escolares, libretas de facturas básicas o bitácoras. Estos soportes físicos son susceptibles al deterioro por humedad, pérdida accidental por incendios, o tachaduras que dificultan la auditoría y provocan desconfianza entre los vecinos en las Asambleas Generales de la comunidad.
2. **Brecha Digital y Falta de Conectividad a Internet:** Muchas comunidades de provincias como Darién, Veraguas, Herrera, Los Santos, Coclé y las comarcas indígenas Ngäbe-Buglé carecen de señal de telefonía celular o cobertura de internet fluida. Por ende, los sistemas tradicionales de facturación electrónica o software basados 100% en la nube (SaaS) son inutilizables para los cobradores que realizan visitas de puerta en puerta.
3. **Morosidad Recurrente e Insostenibilidad Financiera:** Sin un sistema automatizado de alertas de retraso de pago (clasificación visual entre moroso leve y alerta de corte de servicio), los cobradores pierden control del histórico de pagos de los usuarios. Esto resulta en morosidades prolongadas que debilitan el fondo común necesario para comprar cloro gaseoso o en pastillas (indispensable para evitar epidemias de origen hídrico) y pagar el consumo eléctrico de las bombas sumergibles.
4. **Falta de Registro del Trabajo Comunitario (Jornales):** El acueducto rural requiere mantenimiento manual (limpieza de desarenadores en la toma de agua, cambio de tuberías rotas por deslaves). La asamblea comunitaria exige que cada hogar done una cantidad de horas de trabajo ("jornales" o "fainas") o, en su defecto, envíe a un sustituto o pague una multa establecida (generalmente de B/. 15.00 en comunidades del interior). Registrar esto a mano genera disputas permanentes sobre quién cumplió con el aporte físico a la comunidad.

**JAAR Digital** responde directamente a estas necesidades combinando tecnologías modernas con una lógica de uso sumamente simplificada que no requiere hardware costoso ni conectividad continua.

---

## 4. Pequeño Estudio de Mercado

### 4.1 Segmentación y Mercado Potencial
El mercado para una solución de gestión de acueductos rurales en Panamá se segmenta de la siguiente manera:

| Categoría de Segmento | Tamaño Estimado (Panamá) | Características Operativas y Contables |
|---|---|---|
| **JAAR Consolidadas / Periurbanas** (Ej. Sectores de La Chorrera, Capira, Arraiján, David) | Aprox. 800 juntas | Poseen tarifas mensuales de B/. 5.00 a B/. 10.00. Tienen acceso regular a energía eléctrica y conectividad celular de datos. Cuentan con oficinas comunitarias y computadoras básicas. |
| **JAAR de Subsistencia Rural** (Ej. Interior de Coclé, Veraguas, Herrera, Los Santos) | Aprox. 2,200 juntas | Tarifas de agua bajas (B/. 1.00 a B/. 3.00 mensuales). El cobrador recauda el dinero en efectivo recorriendo la comunidad casa por casa. Conectividad móvil intermitente o inexistente en los hogares. |
| **Comunidades Comarcales / Aisladas** (Ej. Comarca Ngäbe-Buglé, Darién profundo) | Aprox. 682 juntas | Acueductos por gravedad en su mayoría. Poca circulación de efectivo, alta dependencia de los jornales comunitarios. Conectividad nula. El tesorero debe viajar periódicamente a centros urbanos. |

### 4.2 Análisis de la Competencia
En el contexto del mercado panameño, existen tres alternativas principales frente a JAAR Digital:
* **Sistemas Tradicionales de Papel (Libretas):** Es el competidor indirecto más fuerte. Es gratuito a nivel de adquisición, pero genera costos altísimos a largo plazo por ineficiencia en el recaudo, pérdidas de información e imposibilidad de auditoría formal.
* **Hojas de Cálculo Genéricas (Microsoft Excel / Google Sheets):** Utilizado por algunas juntas que poseen una computadora donada o un tesorero con estudios básicos. Sin embargo, no se adapta a pantallas de teléfonos móviles para el cobro en calle, no tiene capacidad offline integrada y requiere alta capacitación técnica para evitar borrar fórmulas de forma accidental.
* **Softwares de Gestión Hídrica Extranjeros o Comerciales:** Plataformas como *PayWater* u otros ERP de facturación. Sus limitantes principales en Panamá son:
  * Costos de licenciamiento mensuales o anuales en dólares que superan la capacidad de las JAAR pequeñas.
  * Requisito obligatorio de conexión permanente a internet para registrar transacciones.
  * Falta de adaptación a la legislación panameña (Decreto 1839) y ausencia total de módulos de jornales comunitarios o gestión de multas por inasistencia.

### 4.3 Ventajas Competitivas de JAAR Digital
* **Arquitectura PWA Offline-First:** Funciona directamente en cualquier smartphone a través del navegador web local. Guarda todas las transacciones sin necesidad de internet y las sincroniza automáticamente cuando el dispositivo del cobrador detecta conexión.
* **Adaptación Regulatoria Nacional:** Genera de forma nativa los archivos de reporte del MINSA, listos para descargar en Excel (.xlsx) y PDF, facilitando la auditoría técnica y financiera de DISAPAS sin realizar transcripciones manuales.
* **Módulo de Jornales Integrado:** El único sistema en el mercado que incluye la gestión del trabajo comunitario, permitiendo registrar la asistencia, el envío de sustitutos y la aplicación de multas, integrando este saldo deudor a la cuenta general del usuario.
* **Incentivos para la Sostenibilidad (Gamificación):** Reduce la morosidad mediante un sistema que otorga puntos a los clientes por pagos adelantados y asistencia a trabajos comunitarios, los cuales pueden canjearse por pequeños descuentos en la tarifa del agua.
* **Esquema de Comisiones para el Cobrador:** Incorpora un incentivo económico (split de B/. 1.00 por cobro realizado) para el cobrador local, lo que asegura que la junta directiva cuente con una persona motivada y activa realizando la recaudación.

---

## 5. Lugares donde el Proyecto podría ser Aplicado

La naturaleza del proyecto **JAAR Digital** le permite insertarse tanto en el engranaje estatal para la provisión de servicios básicos como en las cadenas de valor y responsabilidad de empresas privadas en el territorio panameño.

### 5.1 Entidades Gubernamentales (Sector Público)

#### Ministerio de Salud (MINSA) - Dirección de Sub-Sector de Agua Potable y Alcantarillados Sanitarios (DISAPAS)
> **Caso de Aplicación:** Plataforma Oficial de Supervisión e Inspección Financiera.
> El MINSA, a través de sus oficinas regionales de Saneamiento Ambiental, puede adoptar la plataforma JAAR Digital como el estándar tecnológico oficial recomendado para las 3,682 JAAR legalmente constituidas en el país. Al estandarizar el reporte digital en formato Excel, el ministerio reduce los tiempos de revisión y consolida bases de datos nacionales sobre la recaudación, inversión en cloro e infraestructura hídrica rural.

#### Juntas Comunales (Gobiernos Locales a Nivel de Corregimiento)
> **Caso de Aplicación:** Fortalecimiento institucional mediante fondos de descentralización.
> En Panamá, las Juntas Comunales administran fondos de descentralización (bajo la Ley de Descentralización y el control de la Autoridad Nacional de Descentralización). Los Representantes de Corregimiento en distritos con alta cantidad de acueductos rurales (ej. Capira, Penonomé, La Pintada, Cañazas, Bugaba) pueden financiar la implementación del sistema y proveer tablets o smartphones económicos de gama básica a las juntas locales, garantizando que el dinero público invertido en bombas o tuberías sea administrado de forma transparente.

#### Ministerio de Desarrollo Social (MIDES)
> **Caso de Aplicación:** Inclusión digital y empoderamiento comunitario en zonas del Plan Colmena.
> El MIDES puede implementar el uso de JAAR Digital como parte de los proyectos de desarrollo comunitario en los corregimientos priorizados por el *Plan Colmena* (la estrategia del Estado panameño para combatir la pobreza multidimensional). El uso de la herramienta mejora la gobernanza local de los recursos naturales y capacita en competencias digitales básicas a los líderes comunitarios del interior del país.

#### Autoridad Nacional para la Innovación Gubernamental (AIG)
> **Caso de Aplicación:** Alojamiento en la nube estatal e integración en Infoplazas AIP.
> La AIG puede facilitar la infraestructura tecnológica en la Nube Computacional Gubernamental para el alojamiento seguro de la base de datos centralizada (Supabase u otra infraestructura estatal). De igual forma, puede articular las más de 300 **Infoplazas AIP** distribuidas en corregimientos rurales e indígenas de Panamá como los centros físicos de capacitación, soporte y sincronización para los administradores y cobradores de las JAAR locales.

#### Ministerio de Ambiente (MiAmbiente)
> **Caso de Aplicación:** Fiscalización de concesiones de agua rural.
> MiAmbiente, encargado de otorgar y auditar las concesiones de uso de agua en cuencas hidrográficas, puede requerir el uso del módulo operativo de JAAR Digital para asegurar que las juntas comunitarias lleven un control riguroso de la cantidad de hogares servidos, promoviendo el uso ordenado y sostenible del recurso hídrico.

### 5.2 Empresas Privadas (Sector Corporativo y de Consultoría)

#### Constructoras de Obras Hídricas y de Infraestructura
> **Caso de Aplicación:** Entrega operativa y transferencia de capacidades en licitaciones del Estado.
> Las constructoras privadas que resultan adjudicadas en las licitaciones públicas de CONADES, el IDAAN o el MINSA para la construcción de nuevos acueductos o mejoras de redes rurales (ej. empresas de ingeniería local y consorcios) tienen por obligación contractual capacitar a las directivas locales antes de transferirles la administración de la obra física. La adquisición de licencias y capacitación en **JAAR Digital** puede incluirse directamente en el pliego de cargos de la licitación como el entregable de transferencia tecnológica de la constructora hacia la comunidad.

#### Empresas del Sector Minero, Energético e Industrial (Programas de RSE)
> **Caso de Aplicación:** Proyectos de Responsabilidad Social Empresarial en zonas de influencia.
> Las grandes corporaciones industriales, mineras o de generación de energía que operan en el interior de la República de Panamá (ej. empresas eléctricas, concesiones mineras reguladas, ingenios azucareros, agroexportadoras) tienen una interacción directa con comunidades rurales adyacentes a sus operaciones. Financiar la digitalización y el soporte técnico de las JAAR locales utilizando JAAR Digital es una iniciativa de RSE de alto impacto social, que resuelve el acceso a agua segura de forma sostenible y reduce la conflictividad social comunitaria.

#### Firmas Consultoras en Gestión Ambiental y Social
> **Caso de Aplicación:** Asistencia técnica contratada por organismos multilaterales (BID, CAF, Banco Mundial).
> El Banco Interamericano de Desarrollo (BID) y el Banco Mundial financian de manera regular proyectos multimillonarios de saneamiento e higiene rural en Panamá. Las consultoras privadas contratadas para ejecutar estos componentes de gobernanza hídrica y fortalecimiento comunitario pueden integrar a JAAR Digital como la herramienta tecnológica recomendada para el éxito contable y administrativo de las juntas en el largo plazo.

#### Proveedores de Servicios de Telecomunicaciones (Tigo Panamá, Más Móvil / Cable & Wireless)
> **Caso de Aplicación:** Alianzas de conectividad y distribución de hardware.
> Las empresas de telecomunicaciones del país pueden diseñar paquetes especiales de bajo costo que incluyan smartphones prepago con la aplicación de JAAR Digital precargada para los cobradores comunitarios. Esto les permite penetrar comercialmente en zonas de difícil acceso y posicionar su marca bajo programas de valor compartido vinculados al acceso al agua potable.
