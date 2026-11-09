# Casos de prueba · v1.0.0 (MVP)

Este documento lista los casos de prueba de la versión 1.0.0 de Nexo. Cada caso remite a una historia de usuario (HU) de [historias-de-usuario.md](../historias-de-usuario/historias-de-usuario.md). Los casos automáticos se ejecutan en cada cambio con GitHub Actions; los manuales se ejecutaron el 06/11/2026 sobre `docker compose up --build`.

## Cómo ejecutarlas

| Nivel | Herramienta | Comando | Casos |
| --- | --- | --- | --- |
| Unitarias (reglas de dominio) | Vitest | `pnpm --filter @nexo/shared test` | 29 |
| API de punta a punta | `node:test` + `fetch` contra la API en Docker | `pnpm --filter backend test:e2e` | 13 |
| Interfaz de punta a punta + accesibilidad | Playwright + axe-core (WCAG 2.1 AA) | `pnpm e2e` | 2 (móvil 412 px y escritorio 1440 px) |
| Manuales | Navegador, teclado y Lighthouse 12 | Ver la sección «Casos manuales» | 14 |

Las pruebas de API y de interfaz necesitan la aplicación corriendo (`docker compose up --build -d --wait`).

## Casos automáticos

Última ejecución: 09/11/2026, responsable GitHub Actions (CI de `main`, todos los casos en verde). Cada pull request vuelve a ejecutarlos.

### Registro, sesión y protección de datos

| ID | HU | Caso | Datos o pasos | Resultado esperado | Nivel | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| CP-01 | HU-036 | Registro sin aceptar la política | Registro con `aceptaPrivacidad: false` | 400; error en el campo `aceptaPrivacidad`; no se crea la cuenta | API | Pasa |
| CP-02 | HU-001 | Contraseña corta | Contraseña de 5 caracteres | 400 con el mínimo de 8 caracteres | API | Pasa |
| CP-03 | HU-001 | Registro válido y correo repetido | Mismo correo dos veces | 201 la primera vez; 409 «ya registrado» la segunda | API | Pasa |
| CP-04 | HU-002 | Credenciales incorrectas y correctas | Contraseña errónea, luego la correcta | 401 con mensaje genérico; luego 200 con token | API | Pasa |
| CP-05 | HU-002 | Ruta protegida sin sesión | `GET /api/auth/yo` sin token | 401 | API | Pasa |

### Comunidad, huerto y plantas

| ID | HU | Caso | Datos o pasos | Resultado esperado | Nivel | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| CP-06 | HU-004, HU-010 | Crear comunidad y huerto | Comunidad nueva; huerto con una parroquia de otra provincia y luego con una válida | El creador queda como responsable; parroquia ajena: 400; parroquia válida: 201 | API | Pasa |
| CP-07 | HU-014 | Registrar planta | Manzanilla, ciclo corto, fría, usos | 201; aparece en el huerto | API | Pasa |

### Fase lunar y actividades

| ID | HU | Caso | Datos o pasos | Resultado esperado | Nivel | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| CP-08 | HU-017 | Fase lunar conocida | Fechas de lunas nuevas y llenas publicadas | Devuelve la fase correcta | Unitaria | Pasa |
| CP-09 | HU-017 | Fecha fuera de rango o inválida | 1899-12-31, 2101-01-01, 2024-02-30, «08/04/2024» | Devuelve «no disponible» sin fallar | Unitaria | Pasa |
| CP-10 | HU-017 | Recomendación del día | Cada una de las 4 fases | Texto de recomendación de la fase | Unitaria | Pasa |
| CP-11 | HU-018 | Preparación en luna nueva | Todos los campos marcados | Sin errores ni advertencias | Unitaria | Pasa |
| CP-12 | HU-018 | Preparación fuera de luna nueva | Fecha en luna llena | Advertencia que se puede confirmar | Unitaria | Pasa |
| CP-13 | HU-018 | Preparación incompleta | Sin pasos marcados | Error en cada campo faltante | Unitaria | Pasa |
| CP-14 | HU-018 | Fecha futura | Mañana | Error de fecha | Unitaria | Pasa |
| CP-15 | HU-021 | Siembra de planta no registrada | `plantaId` ajeno al huerto | Error | Unitaria | Pasa |
| CP-16 | HU-021 | Siembra sin técnica ni tipo | Campos vacíos | Un error por campo | Unitaria | Pasa |
| CP-17 | HU-023 | Riego con aspersor y sin siembra previa | Método aspersor; planta sin sembrar | Aspersor no admitido; exige siembra previa | Unitaria | Pasa |
| CP-18 | HU-025 | Cosecha de raíces en luna llena antes de las 8:00 | Raíz, luna llena, 06:30 | Dos advertencias (fase y hora) | Unitaria | Pasa |
| CP-19 | HU-025 | Cosecha de planta sin siembra | Planta sin siembra registrada | Error | Unitaria | Pasa |
| CP-20 | — | Tipo de actividad no habilitado en v1 | Secado (tipo de v2) | Error en el campo `tipo` | Unitaria | Pasa |
| CP-21 | HU-018, HU-030 | Actividad incompleta enviada a la API | Preparación sin campos | 400; no suma puntos | API | Pasa |
| CP-22 | HU-021 | Siembra fuera de fase | Primero sin confirmar, luego confirmada | 409 con advertencias; confirmada: 201 sin bono | API | Pasa |

### Puntos y huerto virtual

| ID | HU | Caso | Datos o pasos | Resultado esperado | Nivel | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| CP-23 | HU-030 | Cálculo de puntos | Con y sin advertencias, repetida | Base + 5 de bono; sin bono con advertencias; 0 si se repite el mismo día | Unitaria | Pasa |
| CP-24 | HU-018, HU-030 | Preparación en luna nueva vía API | Actividad válida | Suma base + bono al voluntario y a la comunidad | API | Pasa |
| CP-25 | HU-030 | Repetir la actividad el mismo día | Misma actividad y planta | Se guarda; no suma puntos | API | Pasa |
| CP-26 | HU-016 | Huerto sin plantas | Lista vacía | Progreso 0 | Unitaria | Pasa |
| CP-27 | HU-016 | Huerto sin actividades | Plantas sin actividades | Todas en la etapa inicial | Unitaria y API | Pasa |
| CP-28 | HU-016 | Avance de etapas | Preparación general y riego | Preparación lleva todas a la etapa 1; el riego solo avanza las sembradas | Unitaria | Pasa |
| CP-29 | HU-016 | La etapa no retrocede | Preparación después de una siembra | La planta sigue en la etapa 2 | Unitaria | Pasa |
| CP-30 | HU-016 | Huerto virtual tras sembrar | Siembra confirmada | La planta pasa a «Sembrada» y los puntos se acumulan | API | Pasa |
| CP-31 | — | Enumeraciones sincronizadas | Compara `enums.ts` con `schema.prisma` | Mismos valores | Unitaria | Pasa |

### Interfaz de punta a punta

| ID | HU | Caso | Pasos | Resultado esperado | Nivel | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| CP-32 | HU-001, 002, 004, 010, 014, 016, 018, 036 | Flujo completo en móvil | Registro con consentimiento → comunidad → huerto → planta → preparación de la tierra → huerto virtual → cerrar sesión | Cada paso navega a la pantalla esperada; axe sin violaciones serias o críticas en cada pantalla | E2E + axe | Pasa |
| CP-33 | Mismas | Flujo completo en escritorio | Igual que CP-32 a 1440 px | Igual que CP-32 | E2E + axe | Pasa |

## Casos manuales

Los casos manuales siguen la plantilla de casos de prueba de la asignatura: identificador, título, descripción, procedimiento, resultados esperados y una fila por cada ejecución, con su fecha, responsable, resultado obtenido, veredicto y capturas. Cuando un caso falló, se corrigió el defecto y se volvió a ejecutar, las dos ejecuciones quedan registradas.

Entorno: Chromium sobre `docker compose up --build`, con la cuenta demo de `.env.example`. El identificador anterior de cada caso (CM-xx) se conserva entre paréntesis para no romper las referencias del [informe de calidad](../informe/informe.md).

### P-001 · Enlace «Saltar al contenido» (CM-01)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que una persona que navega solo con el teclado pueda saltar el menú e ir directo al contenido de la pantalla. |
| Procedimiento | 1. Abrir la aplicación e iniciar sesión.<br>2. En Inicio, pulsar la tecla Tab una vez.<br>3. Pulsar Enter sobre el enlace que aparece. |
| Resultados esperados | Aparece el enlace «Saltar al contenido» visible arriba a la izquierda y, al pulsar Enter, el foco pasa al contenido principal. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | El enlace aparecía pegado al borde, sin relleno, y era difícil de leer (defecto D-07). | Reprobado | — |
| 06/11/2026 | Sebastián Guerrero | El enlace aparece con relleno y sombra, se lee bien y lleva al contenido. | Aprobado | — |

### P-002 · Foco visible (CM-02)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que siempre se vea qué elemento está seleccionado al navegar con el teclado. |
| Procedimiento | 1. Abrir cada una de las 8 pantallas.<br>2. Recorrer todos los elementos con la tecla Tab. |
| Resultados esperados | Cada botón, enlace o campo enfocado muestra un anillo dorado de 3 px. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | El anillo dorado aparece en todos los elementos de las 8 pantallas. | Aprobado | — |

### P-003 · Resumen de errores del formulario (CM-03)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que, si se envía un formulario incompleto, la persona sepa qué datos faltan y que los mensajes estén bien redactados. |
| Procedimiento | 1. Abrir la pantalla de inicio de sesión.<br>2. Dejar el correo y la contraseña vacíos.<br>3. Pulsar «Entrar». |
| Resultados esperados | El foco va al resumen «Revisa estos datos» y cada campo muestra su error con una redacción correcta. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | Se mostraba «La contraseña es obligatorio»: el mensaje no concordaba en género (defecto D-06). | Reprobado | — |
| 06/11/2026 | Sebastián Guerrero | Se muestra «La contraseña es obligatoria» y el foco va al resumen de errores. | Aprobado | [login-movil.png](../capturas/login-movil.png) |

### P-004 · Iniciar sesión con la tecla Enter (CM-04)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que se pueda iniciar sesión sin usar el ratón. |
| Procedimiento | 1. Abrir la pantalla de inicio de sesión.<br>2. Escribir el correo y la contraseña de la cuenta demo.<br>3. Pulsar Enter. |
| Resultados esperados | Se abre la sesión y se muestra la pantalla de Inicio. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | La sesión se abre y aparece Inicio con la recomendación del día. | Aprobado | [inicio-escritorio.png](../capturas/inicio-escritorio.png) |

### P-005 · Foco del diálogo de advertencias (CM-05)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que, cuando la app advierte que una actividad está fuera de la fase lunar recomendada, la acción que queda seleccionada sea la segura. |
| Procedimiento | 1. Ir a «Registrar».<br>2. Elegir «Siembra» y una fecha en luna nueva.<br>3. Completar los campos y pulsar «Guardar actividad». |
| Resultados esperados | Se abre el diálogo de advertencias con el foco en «Corregir». |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | El foco quedaba en «Guardar de todas formas»: con un Enter se guardaba sin querer (defecto D-05). | Reprobado | — |
| 06/11/2026 | Sebastián Guerrero | El diálogo se abre con el foco en «Corregir». | Aprobado | [actividad-movil.png](../capturas/actividad-movil.png) |

### P-006 · Cerrar el diálogo con Escape (CM-06)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que el diálogo de advertencias se pueda cerrar con el teclado sin perder el lugar en la pantalla. |
| Procedimiento | 1. Repetir los pasos de P-005 hasta abrir el diálogo.<br>2. Pulsar Escape. |
| Resultados esperados | El diálogo se cierra y el foco vuelve al botón «Guardar actividad». |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | El diálogo se cerraba, pero el foco se perdía al inicio de la página (defecto D-05). | Reprobado | — |
| 06/11/2026 | Sebastián Guerrero | El diálogo se cierra y el foco vuelve a «Guardar actividad». | Aprobado | — |

### P-007 · Confirmar una advertencia (CM-07)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que una persona pueda guardar una actividad fuera de la fase recomendada si así lo decide, sin recibir el bono de puntos. |
| Procedimiento | 1. Repetir los pasos de P-005 hasta abrir el diálogo.<br>2. Pulsar «Guardar de todas formas». |
| Resultados esperados | La actividad se guarda sin bono y un aviso indica los puntos obtenidos. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | La actividad se guarda y el aviso muestra solo los puntos base. | Aprobado | — |

### P-008 · La planta «brota» en el huerto virtual (CM-08)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que el huerto virtual muestre el avance de la planta después de registrar una actividad real. |
| Procedimiento | 1. Registrar una siembra de una planta del huerto.<br>2. Ir a «Huerto virtual». |
| Resultados esperados | La planta muestra su etapa anterior y brota a «Sembrada» una sola vez. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | La planta brota a «Sembrada» y la animación no se repite al volver a la pantalla. | Aprobado | [huerto-virtual-movil.png](../capturas/huerto-virtual-movil.png) |

### P-009 · Pantallas en celular de 390 px (CM-09)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que la aplicación se use con comodidad en un celular. |
| Procedimiento | 1. Ajustar el navegador a 390 px de ancho.<br>2. Recorrer las 8 pantallas. |
| Resultados esperados | No hay desplazamiento horizontal y la barra de navegación queda abajo, al alcance del pulgar. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | Las 8 pantallas se ven completas y la barra inferior funciona. | Aprobado | [inicio-movil.png](../capturas/inicio-movil.png), [huerto-movil.png](../capturas/huerto-movil.png), [registro-movil.png](../capturas/registro-movil.png) |

### P-010 · Pantalla de Inicio en tableta de 800 px (CM-10)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que los botones se lean bien en una tableta. |
| Procedimiento | 1. Ajustar el navegador a 800 px de ancho.<br>2. Abrir Inicio. |
| Resultados esperados | El botón «Registrar actividad» se lee en una sola línea. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | El texto del botón se partía en dos líneas (defecto D-08). | Reprobado | — |
| 06/11/2026 | Sebastián Guerrero | El botón se lee en una sola línea. | Aprobado | — |

### P-011 · Pantallas en escritorio de 1440 px (CM-11)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que la aplicación se adapte a una pantalla grande. |
| Procedimiento | 1. Ajustar el navegador a 1440 px de ancho.<br>2. Recorrer las 8 pantallas. |
| Resultados esperados | El menú aparece fijo a la izquierda y el contenido queda en una columna de 768 px. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | El menú lateral y la columna de contenido se muestran como se esperaba. | Aprobado | [huerto-escritorio.png](../capturas/huerto-escritorio.png), [huerto-virtual-escritorio.png](../capturas/huerto-virtual-escritorio.png) |

### P-012 · Medición con Lighthouse (CM-12)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera medir el rendimiento, la accesibilidad, las buenas prácticas y el SEO de la aplicación. |
| Procedimiento | 1. Abrir las herramientas del navegador en cada una de las 7 pantallas.<br>2. Ejecutar Lighthouse en modo móvil y en modo escritorio. |
| Resultados esperados | Accesibilidad de 90 o más en todas las mediciones. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | Accesibilidad 100 en las 14 mediciones, pero SEO 92 por falta de `robots.txt` (defecto D-09). | Reprobado | — |
| 06/11/2026 | Sebastián Guerrero | Accesibilidad 100 en las 14 mediciones y SEO corregido. Detalle en el [informe de calidad](../informe/informe.md#lighthouse). | Aprobado | — |

### P-013 · Consola sin errores inesperados (CM-13)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que la aplicación no genere errores ocultos mientras se usa. |
| Procedimiento | 1. Abrir la consola del navegador.<br>2. Recorrer el flujo completo: registro, comunidad, huerto, planta, actividad y huerto virtual. |
| Resultados esperados | Solo aparecen las respuestas 400 y 409 esperadas por las validaciones. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | Sebastián Guerrero | Solo aparecen las respuestas 400 y 409 de las validaciones. | Aprobado | — |

### P-014 · Arranque en una máquina limpia (CM-14)

| Campo | Detalle |
| --- | --- |
| Descripción | Se espera comprobar que cualquier persona pueda levantar la aplicación con un solo comando, sin pasos extra. |
| Procedimiento | 1. En una máquina nueva, clonar el repositorio.<br>2. Copiar `.env.example` como `.env`.<br>3. Ejecutar `docker compose up --build`. |
| Resultados esperados | La base de datos, los datos iniciales y la cuenta demo quedan listos sin pasos adicionales. |

| Fecha | Responsable | Resultados obtenidos | Veredicto | Capturas |
| --- | --- | --- | --- | --- |
| 06/11/2026 | GitHub Actions | La aplicación arranca completa en el job `e2e` del PR #3. | Aprobado | — |

## Defectos encontrados

| ID | Encontrado por | Defecto | Severidad | Corrección |
| --- | --- | --- | --- | --- |
| D-01 | E2E (CP-32) | Al crear la comunidad, la app volvía a Inicio en lugar de llevar a Mi huerto | Media | Se navega antes de recargar la sesión |
| D-02 | CI local | El backend quedaba «unhealthy» en Docker | Alta | Healthcheck con `127.0.0.1` y `start_period` |
| D-03 | Capturas | Fechas en formato de EE. UU. | Baja | Navegador con idioma `es-EC` |
| D-04 | Revisión de diseño | 10 hallazgos de jerarquía, color y movimiento (tarjeta «Hoy», chips, filas de plantas, firma «brotar», entre otros) | Media | Corregidos en dos rondas; ver `apps/frontend/DESIGN.md` |
| D-05 | CM-05, CM-06 | El diálogo enfocaba «Guardar de todas formas» y al cerrarlo el foco se perdía | Media | Foco inicial en «Corregir» y retorno a «Guardar actividad» |
| D-06 | CM-03 | «La contraseña es obligatorio» y «Los usos medicinales es obligatorio» | Baja | Mensajes con concordancia de género y número |
| D-07 | CM-01 | El enlace «Saltar al contenido» aparecía sin relleno | Baja | Relleno y sombra al enfocarse |
| D-08 | CM-10 | El botón de la tarjeta «Hoy» se partía en dos líneas en tableta | Baja | Botón en fila solo desde 1024 px |
| D-09 | CM-12 | SEO 92 por falta de `robots.txt` | Baja | Se agrega `public/robots.txt` |
| D-10 | Auditoría externa (09/11) | `pnpm test` fallaba: el frontend tenía Vitest configurado sin ninguna prueba | Baja | Se quita Vitest del frontend; las pruebas de interfaz son las de Playwright |
| D-11 | Auditoría externa (09/11) | `pnpm lint` fallaba: ESLint estaba instalado sin archivo de configuración | Baja | Se agrega `eslint.config.mjs` con reglas de accesibilidad (`jsx-a11y`) y se ejecuta en CI |

## Pendiente conocido

- Inicio en móvil obtiene 94 en rendimiento de Lighthouse porque la tarjeta del huerto virtual aparece después de cargar los datos (desplazamiento de diseño). Se atiende en v2 con un esqueleto de carga.
- No hay pruebas con lectores de pantalla reales (NVDA, TalkBack); axe y Lighthouse cubren las reglas automáticas. Queda para v2.
