# Arquitectura y Diseño: JAAR Digital

Este documento describe la arquitectura, las decisiones de diseño y el funcionamiento funcional de la plataforma **JAAR Digital**, un sistema de gestión, cobranza, auditoría y gamificación creado específicamente para las Juntas Administradoras de Acueductos Rurales de Panamá.

## 1. El Problema a Resolver
Las Juntas de Acueductos Rurales a menudo gestionan sus cobros y membresías en cuadernos de papel. Cuando un cobrador va de casa en casa para recaudar el pago del agua, usualmente se encuentra en áreas rurales **donde no hay cobertura de internet ni señal celular**. Adicionalmente, el MINSA (Ministerio de Salud) exige reportes de transparencia y es crucial mantener un historial inmutable para evitar irregularidades.

## 2. La Solución: Arquitectura Offline-First
JAAR Digital está diseñado bajo el paradigma **Offline-First (Primero sin conexión)**.
Esto significa que la aplicación web funciona exactamente igual tenga o no internet. 

*   **Tecnología Base:** Utilizamos `IndexedDB` a través de la librería `Dexie.js`.
*   **Almacenamiento Local:** Todos los catálogos (usuarios, histórico de pagos, gastos, reglas del acueducto) residen de forma persistente en el navegador del dispositivo del cobrador.
*   **Sincronización:** Cuando el dispositivo detecta conexión a internet (usando eventos de red y el hook `useOnline`), permite subir los registros pendientes (Pending Sync) hacia un servidor centralizado en la nube.

## 3. Seguridad y Sistema de Roles
La plataforma contiene 5 roles con flujos estrictamente separados definidos en `src/utils/constants.js` y protegidos mediante `authService.js`:

1.  **Administrador Global (`admin`):** 
    *   Control total. Puede registrar usuarios, modificar reglas, ver auditoría profunda, registrar ingresos/egresos y gestionar el foro.
2.  **Cobrador en Campo (`cobrador`):**
    *   Diseñado para el dispositivo móvil. Su interfaz (`CobrosPage`) está orientada a buscar vecinos, verificar si están morosos o al día, y procesar pagos rápidos, además de leer sugerencias de la IA.
3.  **Auditor del MINSA (`minsa`):**
    *   Un usuario de Solo Lectura. Accede a las páginas de Reportes, donde descarga los libros de cálculo en Excel (`xlsx`) y constancias en PDF (`jspdf`) con fines regulatorios.
4.  **Soporte Técnico / Desarrollador (`dev`):**
    *   Rol técnico con acceso exclusivo al Panel de Auditoría (`AdminPage -> Logs de Auditoría`). No puede ver los reportes financieros ni modificar datos de usuarios, protegiendo así la privacidad de los vecinos.
5.  **Usuario / Vecino (`cliente`):**
    *   Su número de cédula o ID es su acceso. Puede ver su historial de pagos, sus puntos de recompensa, notificaciones enviadas por la junta y avisos generales.

## 4. Módulos Core del Sistema

### 4.1. Módulo de Cobros y Recibos (`pagosService.js`)
Calcula inteligentemente si un vecino está "Al día", en estado "Moroso" o en riesgo de "Corte". Genera comprobantes de pago cifrando con hash criptográfico SHA-256 (del lado del cliente) los archivos PDF/Imágenes que se suban para asegurar la integridad de las facturas (anti-alteraciones).

### 4.2. Motor de Puntos / Gamificación (`puntosService.js`)
Para incentivar el buen comportamiento, el sistema otorga puntos automáticos:
*   **Puntualidad:** +5 puntos al pagar su cuota a tiempo.
*   **Adelantos:** +10 puntos extra por mes pagado por adelantado.
*   **Recompensa:** Al acumular puntos, el vecino puede solicitar canjearlos como un descuento monetario en su próximo pago directamente en el `CobroModal.jsx`.

### 4.3. Inteligencia Artificial (Sugerencias)
Cuando un cobrador va a visitar a un vecino, puede pulsar el botón "Ruta IA". El sistema evalúa si el vecino es cumplido o moroso y redacta una sugerencia de diálogo empático. El cobrador puede enviarle este mensaje directamente al "Dashboard" del cliente.

### 4.4. Auditoría y Soft-Delete
Ningún usuario puede ser borrado físicamente del sistema por seguridad. En su lugar, existe un flag `estado: 'inactivo'`. Cada acción crítica (creación, edición, borrado) se registra en la tabla `db.auditoria` indicando fecha, responsable (user_id) y afectado (afectado_id).

## 5. Diseño e Interfaz
El diseño emplea colores sobrios (verde esmeralda, azul profundo) con fondos blancos o grises oscuros dependiendo de la preferencia del sistema (`ThemeContext`). Se emplean estilos *Glassmorphism* (efectos de cristal traslúcido) para un aspecto gubernamental/institucional pero moderno y *Premium*.
