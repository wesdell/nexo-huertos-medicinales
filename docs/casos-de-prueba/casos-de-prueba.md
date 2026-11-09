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

Ejecutados el 06/11/2026 en Chromium, con la cuenta demo de `.env.example`.

| ID | Característica | Caso | Pasos | Resultado esperado | Resultado |
| --- | --- | --- | --- | --- | --- |
| CM-01 | Accesibilidad | Enlace «Saltar al contenido» | Cargar Inicio y pulsar Tab | Aparece el enlace visible arriba a la izquierda; Enter lleva al contenido | Pasa tras corregir D-07 |
| CM-02 | Accesibilidad | Foco visible | Recorrer cada pantalla con Tab | Anillo dorado de 3 px en cada elemento enfocado | Pasa |
| CM-03 | Usabilidad | Resumen de errores | Enviar el inicio de sesión vacío | El foco va al resumen «Revisa estos datos»; cada campo muestra su error | Pasa tras corregir D-06 |
| CM-04 | Usabilidad | Iniciar sesión con Enter | Escribir correo y contraseña y pulsar Enter | Se abre la sesión y se muestra Inicio | Pasa |
| CM-05 | Accesibilidad | Foco del diálogo de advertencias | Registrar una siembra en luna nueva | El diálogo se abre con el foco en «Corregir» (acción segura) | Pasa tras corregir D-05 |
| CM-06 | Accesibilidad | Cerrar el diálogo con Escape | Pulsar Escape con el diálogo abierto | El diálogo se cierra y el foco vuelve a «Guardar actividad» | Pasa tras corregir D-05 |
| CM-07 | Funcional | Confirmar la advertencia | «Guardar de todas formas» | Se guarda sin bono y el toast indica los puntos | Pasa |
| CM-08 | Usabilidad | Firma «brotar» | Guardar una siembra | En el huerto virtual, la planta muestra su etapa anterior y brota a la nueva una sola vez | Pasa |
| CM-09 | Responsive | Móvil 390 px | Recorrer las 8 pantallas | Sin desplazamiento horizontal; barra inferior al alcance del pulgar | Pasa |
| CM-10 | Responsive | Tableta 800 px | Inicio | El botón «Registrar actividad» se lee en una línea | Pasa tras corregir D-08 |
| CM-11 | Responsive | Escritorio 1440 px | Recorrer las 8 pantallas | Menú lateral fijo y columna de contenido de 768 px | Pasa |
| CM-12 | Rendimiento, accesibilidad, buenas prácticas | Lighthouse en 7 pantallas, móvil y escritorio | Ver el [informe de calidad](../informe/informe.md#lighthouse) | Accesibilidad ≥ 90 | Pasa (100 en las 14 mediciones) |
| CM-13 | Fiabilidad | Consola sin errores inesperados | Recorrer el flujo con la consola abierta | Solo respuestas 400/409 esperadas por validación | Pasa |
| CM-14 | Portabilidad | Arranque en limpio | El job `e2e` de GitHub Actions levanta `docker compose up --build` en una máquina nueva | Migraciones, datos semilla y cuenta demo listos sin pasos extra | Pasa (CI del PR #3) |

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
