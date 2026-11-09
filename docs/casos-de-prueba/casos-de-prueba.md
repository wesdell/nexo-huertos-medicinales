# Casos de prueba · v2.0.0

Casos de prueba de la versión 2.0.0 de Nexo, que integra el modelo acordado con el MSP el 06/11/2026. Cada caso remite a una historia de usuario de [historias-de-usuario.md](../historias-de-usuario/historias-de-usuario.md). Los casos siguen la plantilla de la materia (ID, título, descripción, procedimiento, resultados esperados y ejecuciones) y también están en [casos-de-prueba.docx](casos-de-prueba.docx).

## Cómo ejecutarlas

| Nivel | Herramienta | Comando | Casos |
| --- | --- | --- | --- |
| Unitarias (reglas de dominio) | Vitest | `pnpm --filter @nexo/shared test` | 66 |
| API de punta a punta | `node:test` + `fetch` contra la API en Docker (lee los correos en Mailpit) | `pnpm --filter backend test:e2e` | 13 |
| Interfaz de punta a punta + accesibilidad | Playwright + axe-core (WCAG 2.1 AA) | `pnpm e2e` | 4 flujos × 2 vistas (móvil 412 px y escritorio 1440 px) |
| Estáticas | TypeScript estricto y ESLint con `jsx-a11y` | `pnpm typecheck` y `pnpm lint` | — |

Las pruebas de API y de interfaz necesitan la aplicación corriendo con los datos demo (`docker compose up --build -d --wait`).

**Última ejecución:** 09/11/2026 sobre `docker compose up --build`: 66/66 unitarias, 13/13 de API y 8/8 de interfaz, sin violaciones serias ni críticas de axe.

## Casos

### P-001 · Solicitud de huerto con datos inválidos

- **HU:** HU-037
- **Nivel:** API y e2e
- **Descripción:** Se espera que la solicitud pública rechace datos inválidos y explique cada campo, sin guardar nada.
- **Procedimiento:**
  1. Abrir «Solicitar huerto» sin iniciar sesión.
  2. Escribir la cédula 1234567890 y el celular 022345678.
  3. Elegir el tipo «En tierra» y no marcar la política de datos.
  4. Pulsar «Enviar solicitud».
- **Resultados esperados:** Se muestra un resumen de errores con la cédula inválida, el celular que debe empezar con 09, la ubicación faltante y el consentimiento; no se crea la solicitud.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · Respuesta 400 con los campos `cedula`, `celular` y `aceptaPrivacidad`; en pantalla, resumen de errores con el foco.

### P-002 · Solicitud de huerto válida y duplicada

- **HU:** HU-037
- **Nivel:** API
- **Descripción:** Se espera que una solicitud válida quede pendiente y que la misma cédula no pueda tener dos solicitudes pendientes.
- **Procedimiento:**
  1. Enviar una solicitud con cédula válida, ubicación en Pichincha, altitud 300 m, subtipo «Surcos» y la política aceptada.
  2. Enviar la misma solicitud otra vez.
- **Resultados esperados:** La primera responde 201 y queda pendiente; la segunda responde 409 «Ya tienes una solicitud pendiente».
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · 201 y luego 409.

### P-003 · Aprobación con clave temporal por correo

- **HU:** HU-038, HU-039
- **Nivel:** API
- **Descripción:** Se espera que al aprobar se cree el huerto y la cuenta, llegue el correo con la contraseña temporal y el sistema obligue a cambiarla.
- **Procedimiento:**
  1. Ingresar como técnico del MSP y abrir «Solicitudes».
  2. Pulsar «Aprobar huerto y responsable» en la solicitud de P-002.
  3. Abrir Mailpit (http://localhost:8025) y copiar la contraseña temporal.
  4. Ingresar con ese correo y esa contraseña.
  5. Intentar abrir el huerto; luego cambiar la contraseña por una de 5 caracteres y después por una válida.
- **Resultados esperados:** El correo llega con el usuario y la clave; el ingreso lleva a «Crea tu contraseña»; el huerto responde 403 hasta cambiarla; la clave corta se rechaza; la válida se guarda y el panel se abre.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · Correo recibido en Mailpit; 403 antes del cambio y 200 después.

### P-004 · Rechazo de solicitud con motivo

- **HU:** HU-038
- **Nivel:** API
- **Descripción:** Se espera que no se pueda rechazar sin motivo y que la solicitud quede archivada.
- **Procedimiento:**
  1. En «Solicitudes», pulsar «Rechazar» en una pendiente.
  2. Confirmar con el motivo vacío; luego escribir un motivo y confirmar.
  3. Abrir el filtro «Rechazadas».
- **Resultados esperados:** Con el motivo vacío aparece el error «Escribe el motivo»; con motivo, la solicitud pasa a Rechazadas con su motivo y la persona recibe un correo.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · Sin motivo: 400 «El motivo es obligatorio.»; con motivo: estado RECHAZADA.

### P-005 · Permisos por rol

- **HU:** HU-002, HU-051
- **Nivel:** API
- **Descripción:** Se espera que cada rol solo acceda a lo suyo.
- **Procedimiento:**
  1. Pedir `GET /api/msp/resumen` sin token.
  2. Pedir `GET /api/admin/estado` con el token del técnico.
  3. Retirar un aporte del foro con el token de un responsable.
- **Resultados esperados:** 401 sin token; 403 para el técnico en administración; 403 para el responsable al moderar.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · 401, 403 y 403.

### P-006 · Voluntario sin cuenta y nivel por experiencia

- **HU:** HU-040, HU-041
- **Nivel:** API
- **Descripción:** Se espera que el responsable registre voluntarios sin cuenta y pueda pedir un nivel mayor con justificación.
- **Procedimiento:**
  1. En «Voluntarios», pulsar «Agregar voluntario» y guardar sin nombre.
  2. Completar nombre, fecha de nacimiento y género; marcar «Tiene experiencia», elegir Oficial y justificar.
  3. Ingresar como técnico y abrir «Niveles».
- **Resultados esperados:** Sin nombre se rechaza; con datos completos el voluntario queda como Aprendiz y su solicitud aparece al técnico.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · 400 sin nombre, 201 con datos; la solicitud aparece en «Niveles».

### P-007 · Planta de otra altitud

- **HU:** HU-042
- **Nivel:** API
- **Descripción:** Se espera que el sistema advierta y permita agregar una planta fuera del rango de altitud del huerto.
- **Procedimiento:**
  1. En un huerto a 300 m, abrir «Plantas» y marcar «Mostrar también las de otra altitud».
  2. Agregar Manzanilla (1500–3500 m).
  3. Confirmar «Agregar de todas formas».
- **Resultados esperados:** Aparece «¿Estás seguro?» con el rango de la planta y la altitud del huerto; al confirmar, la planta queda en el huerto marcada como fuera de altitud.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · 409 con la advertencia `ALTITUD`; luego 201 con `fueraDeAltitud: true`.

### P-008 · Pasos en orden, evidencia obligatoria y 24 horas

- **HU:** HU-044
- **Nivel:** API
- **Descripción:** Se espera que el registro respete el orden de los pasos y las validaciones mínimas.
- **Procedimiento:**
  1. En un ciclo nuevo, registrar una siembra.
  2. Registrar la preparación de la tierra sin evidencia.
  3. Registrarla con 25 horas para un voluntario.
  4. Registrarla el 08/04/2024 (luna nueva) con 2 horas y una foto.
- **Resultados esperados:** La siembra se rechaza con 409 «Ahora corresponde: Preparación de la tierra»; sin evidencia y con 25 horas, 400 con el campo a corregir; la última se registra con bono y el siguiente paso es «Surcos, terrazas, camadas o camellones».
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · 409, 400, 400 y 201.

### P-009 · Segunda oportunidad de la evidencia

- **HU:** HU-045
- **Nivel:** API
- **Descripción:** Se espera que una evidencia rechazada pueda reenviarse una vez y valga la mitad.
- **Procedimiento:**
  1. Como técnico, rechazar la evidencia de P-008 con el motivo «La foto no muestra el huerto».
  2. Como responsable, subir una nueva foto desde «Actividades».
  3. Como técnico, aprobarla.
- **Resultados esperados:** El responsable ve el motivo y el botón para reenviar; la actividad pasa al intento 2; al aprobar, el voluntario recibe 11 puntos (2 h × 10 × 50 % × 1,1).
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · 11 puntos y 2 horas validadas para el voluntario.

### P-010 · Paso no cumplido y cosecha perdida

- **HU:** HU-046
- **Nivel:** API
- **Descripción:** Se espera que un paso saltado quede como no cumplido y que una cosecha perdida cierre el ciclo con su causa.
- **Procedimiento:**
  1. En el ciclo, pulsar «No lo hicimos» en el paso 2 y confirmar.
  2. Pulsar «Se dañó la cosecha», confirmar sin causa y luego con «Helada» y una justificación.
- **Resultados esperados:** El paso 2 queda «No cumplida» con 0 puntos y se muestra el paso 3; sin causa se pide elegirla; con causa el ciclo queda «Fallido».
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · Paso marcado como no cumplido; ciclo fallido por helada.

### P-011 · Ranking normalizado por tipo

- **HU:** HU-048
- **Nivel:** Unitaria y API
- **Descripción:** Se espera que el índice sea puntos ÷ √(voluntarios + 1) y que los empates los gane quien llegó primero.
- **Procedimiento:**
  1. Calcular el índice de 300 puntos con 8 voluntarios y de 100 puntos con 0.
  2. Consultar `GET /api/publico/ranking?tipo=EN_TIERRA` y comparar el índice de un huerto.
  3. Consultar un tipo inexistente.
- **Resultados esperados:** Ambos índices dan 100; el índice de la API coincide con la fórmula; el tipo inexistente responde 400.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · Índices iguales a la fórmula; 400 para el tipo inválido.

### P-012 · Niveles automáticos y talentos

- **HU:** HU-047
- **Nivel:** Unitaria
- **Descripción:** Se espera que el nivel suba solo según horas, tipos y ciclos, y que nunca baje.
- **Procedimiento:**
  1. Evaluar 39 h con 9 tipos, 40 h con 4 tipos, 150 h con 8 tipos sin ciclo y con un ciclo.
  2. Evaluar 0 h para alguien que ya es Oficial.
- **Resultados esperados:** Aprendiz, Oficial, Oficial y Maestro; el Oficial sin horas sigue siendo Oficial.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · Vitest en verde.

### P-013 · Validación de cada paso según los lineamientos del MSP

- **HU:** HU-044, HU-052
- **Nivel:** Unitaria
- **Descripción:** Se espera que cada paso aplique las reglas de los saberes ancestrales.
- **Procedimiento:**
  1. Señalética roja para una planta fría.
  2. Secado al sol y secado de 20 días.
  3. Empaquetado con caducidad a 13 meses.
  4. Cosecha de raíces en luna llena a las 7:00 sin baño dos días antes.
  5. Riego con aspersor.
- **Resultados esperados:** Error de color; error de lugar y advertencia de días; error de caducidad; tres advertencias (fase, rocío y baño); error de método.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · Vitest en verde.

### P-014 · Información pública sin datos personales

- **HU:** HU-049
- **Nivel:** API y e2e
- **Descripción:** Se espera que la ficha pública no exponga datos personales y que la ubicación sea aproximada.
- **Procedimiento:**
  1. Consultar `GET /api/publico/huertos/{id}` del huerto creado en P-003.
  2. Abrir la ficha en el navegador desde el ranking.
- **Resultados esperados:** No hay correo, cédula ni celular; la latitud llega redondeada a dos decimales (-0,18); la página no tiene violaciones serias de axe.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado.

### P-015 · Foro con reglas y moderación

- **HU:** HU-008, HU-009
- **Nivel:** API
- **Descripción:** Se espera que publicar exija aceptar las reglas y que el técnico pueda retirar un aporte con motivo visible.
- **Procedimiento:**
  1. Como responsable, publicar sin marcar las reglas; luego marcarlas.
  2. Reportar el aporte.
  3. Como técnico, abrir «Moderación del foro» y retirarlo con un motivo.
- **Resultados esperados:** Sin reglas, error; con reglas se publica; el reporte llega a moderación; el aporte retirado muestra «Aporte retirado por moderación» con el motivo y sin el texto original.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado.

### P-016 · Respaldo y estado del sistema

- **HU:** HU-051
- **Nivel:** API
- **Descripción:** Se espera que el administrador descargue un respaldo completo y vea el estado de la base.
- **Procedimiento:**
  1. Ingresar como administrador.
  2. Pulsar «Descargar respaldo».
- **Resultados esperados:** Se descarga `respaldo-nexo-AAAA-MM-DD-HH-MM.sql` con la cabecera «PostgreSQL database dump»; el panel muestra latencia, tamaño y filas por tabla.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado.

### P-017 · Carga masiva del catálogo

- **HU:** HU-043
- **Nivel:** API
- **Descripción:** Se espera que el CSV cree o actualice plantas y reporte las líneas con error.
- **Procedimiento:**
  1. Como técnico, abrir «Catálogo» y «Cargar CSV».
  2. Subir un archivo con una planta nueva, una existente modificada y una línea con ciclo «MEDIO».
- **Resultados esperados:** «1 plantas nuevas, 1 actualizadas» y «Línea 3: El ciclo debe ser CORTO o LARGO».
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · `POST /api/msp/plantas/importar` devolvió 1 creada, 1 actualizada y el error de la línea 3.

### P-018 · Accesibilidad y diseño adaptable

- **HU:** Todas
- **Nivel:** e2e (Playwright + axe)
- **Descripción:** Se espera que las pantallas públicas y de los tres roles cumplan WCAG 2.1 AA en móvil y escritorio.
- **Procedimiento:**
  1. Ejecutar `pnpm e2e` con la aplicación corriendo.
- **Resultados esperados:** 0 violaciones serias o críticas en 23 pantallas, en 412 px y 1440 px.
- **Ejecución:** 09/11/2026 · Equipo Nexo · Aprobado · 8/8 pruebas en verde. En la primera ejecución axe encontró un campo de archivo sin etiqueta en «Actividades»; se corrigió y se volvió a ejecutar.
