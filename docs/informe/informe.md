# Informe de calidad · Nexo v1.0.0 (MVP)

**Proyecto:** Nexo, huertos medicinales comunitarios guiados por la luna y los saberes ancestrales
**Versión evaluada:** v1.0.0 (MVP)
**Fecha de corte:** 06/11/2026
**Materia:** Calidad de Software

## 1. Resumen

La v1.0.0 cubre el recorrido mínimo de un voluntario:

1. Se registra con consentimiento de datos.
2. Crea su comunidad y registra el huerto y sus plantas.
3. Consulta la recomendación lunar del día.
4. Registra las cuatro actividades básicas: preparación de la tierra, siembra, riego y cosecha.
5. Ve avanzar su huerto virtual y sus puntos.

Resultado de las mediciones:

- **Pruebas automáticas:** 44 casos (29 unitarios, 13 de API y 2 de interfaz en móvil y escritorio), todos en verde en local y en GitHub Actions.
- **Accesibilidad:** cero violaciones serias o críticas con axe (WCAG 2.1 AA) y 100 en Lighthouse en las 7 pantallas, tanto en móvil como en escritorio.
- **Defectos:** se encontraron 11 grupos de defectos durante el desarrollo, la prueba manual y una auditoría externa; todos están corregidos.

El detalle de cada caso está en [casos-de-prueba.md](../casos-de-prueba/casos-de-prueba.md).

## 2. Alcance

| Incluido en v1.0.0 | Historias |
| --- | --- |
| Registro, inicio y cierre de sesión | HU-001, HU-002 |
| Consentimiento de datos personales (LOPDP) | HU-036 |
| Crear comunidad (el creador es responsable) | HU-004 |
| Ubicar el huerto por provincia y parroquia | HU-010 |
| Registrar plantas medicinales | HU-014 |
| Huerto virtual con 7 etapas | HU-016 |
| Fase lunar y recomendación del día | HU-017 |
| Preparación de la tierra, siembra, riego y cosecha | HU-018, HU-021, HU-023, HU-025 |
| Puntos por actividad con bono por seguir la luna | HU-030 |

El resto de las historias (mapa, calendario, fotos, foro, insignias, misiones, ranking y otras) queda planificado para v2.0.0 y v3.0.0 en la [bitácora](../bitacora.md).

## 3. Modelo de calidad

Se tomó como referencia la norma ISO/IEC 25010. Para cada característica se fijó una meta medible y la forma de verificarla.

| Característica | Meta | Cómo se verifica | Resultado |
| --- | --- | --- | --- |
| Adecuación funcional | Cada criterio de aceptación de las HU de v1 tiene al menos un caso de prueba | Matriz de [casos de prueba](../casos-de-prueba/casos-de-prueba.md) | Cumple: 33 casos automáticos y 14 manuales |
| Corrección de las reglas | Las reglas lunares, de validación y de puntos viven en un solo lugar y tienen pruebas | Paquete `@nexo/shared`, que usan tanto la API como la interfaz; Vitest | Cumple: 29/29 |
| Usabilidad | Una actividad se registra en menos de un minuto; los errores dicen qué corregir; las advertencias no bloquean | Prueba manual y prueba de punta a punta | Cumple |
| Accesibilidad | WCAG 2.1 AA y Lighthouse ≥ 90 | axe en cada pantalla del flujo; Lighthouse en 7 pantallas × 2 formatos; recorrido con teclado | Cumple: 0 violaciones; Lighthouse 100 en las 14 mediciones |
| Compatibilidad (responsive) | Funciona desde 360 px hasta escritorio | Playwright en Pixel 7 (412 px) y 1440 px; revisión a 390, 800 y 1440 px | Cumple |
| Eficiencia de desempeño | Lighthouse ≥ 90 en rendimiento | Lighthouse | Cumple: 94–100 |
| Fiabilidad | El sistema arranca limpio y valida en el servidor | Healthchecks de Docker; validación con class-validator; pruebas de API | Cumple |
| Seguridad | Contraseñas cifradas; mensajes de error que no revelan cuentas; rutas protegidas | bcrypt, JWT, pruebas CP-04 y CP-05 | Cumple |
| Mantenibilidad | TypeScript estricto, formato uniforme, lint y CI en cada cambio | `pnpm typecheck`, `pnpm lint` (con `jsx-a11y`), Prettier, GitHub Actions | Cumple |
| Portabilidad | Cualquiera lo corre con un comando | `docker compose up --build`; [guía para ejecutarlo](../como-ejecutar.md) | Cumple; verificado en CI sobre una máquina nueva |

## 4. Resultados de las pruebas

| Nivel | Herramienta | Casos | Resultado |
| --- | --- | --- | --- |
| Unitarias de dominio | Vitest | 29 | 29 pasan |
| API de punta a punta | `node:test` contra Docker | 13 | 13 pasan |
| Interfaz de punta a punta + accesibilidad | Playwright + axe-core | 2 (móvil y escritorio) | 2 pasan, 0 violaciones serias o críticas |
| Manuales | Navegador, teclado, Lighthouse | 14 | 14 pasan (4 después de corregir defectos) |

### Lighthouse

Lighthouse 12.8 en Chromium, con la cuenta demo. Las pantallas que requieren sesión se midieron con la sesión abierta.

| Pantalla | Formato | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- | --- |
| Iniciar sesión | Móvil / escritorio | 100 / 100 | 100 / 100 | 100 / 100 | 92 / 92 |
| Registro | Móvil / escritorio | 100 / 100 | 100 / 100 | 100 / 100 | 92 / 92 |
| Privacidad | Móvil / escritorio | 100 / 100 | 100 / 100 | 100 / 100 | 92 / 92 |
| Inicio | Móvil / escritorio | 94 / 100 | 100 / 100 | 100 / 100 | 92 / 92 |
| Mi huerto | Móvil / escritorio | 100 / 100 | 100 / 100 | 100 / 100 | 92 / 92 |
| Registrar actividad | Móvil / escritorio | 100 / 100 | 100 / 100 | 100 / 100 | 92 / 92 |
| Huerto virtual | Móvil / escritorio | 100 / 100 | 100 / 100 | 100 / 100 | 92 / 92 |

El SEO de 92 se debía a la falta de `robots.txt`; se agregó después de la medición (defecto D-09). El 94 de Inicio en móvil se explica en la sección 7.

## 5. Defectos

| Origen | Encontrados | Corregidos |
| --- | --- | --- |
| Prueba de interfaz de punta a punta | 1 | 1 |
| Docker y CI | 1 | 1 |
| Revisión de diseño (2 rondas) | 10 hallazgos | 10 |
| Prueba manual (teclado y Lighthouse) | 5 | 5 |
| Capturas | 1 | 1 |
| Auditoría externa de inconsistencias (09/11) | 2 | 2 |

Los defectos con más impacto en la calidad percibida fueron estos:

- **D-05:** el diálogo de advertencias ponía el foco en la acción riesgosa, «Guardar de todas formas». Un usuario de teclado podía confirmar sin leer. Ahora el foco inicial está en «Corregir» y vuelve al formulario al cerrar.
- **D-01:** después de crear la comunidad, la app no llevaba al siguiente paso. La prueba de punta a punta lo detectó antes de que llegara a un usuario.

La lista completa está en [casos-de-prueba.md](../casos-de-prueba/casos-de-prueba.md#defectos-encontrados).

## 6. Decisiones de diseño que sostienen la calidad

- **Un solo color para lo que se toca.** El verde chakra (#1F7A4D) aparece solo en botones, en el destino activo y en las opciones elegidas. El usuario aprende de inmediato qué puede presionar. El contraste del texto blanco sobre ese verde es 5.4:1.
- **Errores y advertencias distintos.** Un error bloquea y se muestra junto al campo, además de en un resumen que recibe el foco. Una advertencia del calendario ancestral no bloquea: se explica, se puede corregir o se puede confirmar sin el bono.
- **Pensada para el uso en exteriores.** Usa fondo cálido, texto de 17 px, botones de al menos 48 px y la barra de navegación al alcance del pulgar.
- **La luna como se ve desde Ecuador.** El cuarto creciente se dibuja como un «bote» iluminado abajo.
- **Reglas de dominio compartidas.** La interfaz y la API usan las mismas funciones de `@nexo/shared`, así que una advertencia nunca aparece en una y no en la otra.
- **Documentación del sistema de diseño.** Está en `apps/frontend/DESIGN.md`. Las interfaces están en Figma ([Nexo — MVP v1](https://www.figma.com/design/5lN9PIqZZV9XJsqGy1yaiI)).

## 7. Limitaciones conocidas

| Limitación | Impacto | Plan |
| --- | --- | --- |
| Inicio en móvil obtiene 94 en rendimiento: la tarjeta del huerto virtual aparece después de cargar los datos | Bajo: un leve salto visual | v2: esqueleto de carga |
| No hubo pruebas con lectores de pantalla reales (NVDA, TalkBack) | Medio: axe y Lighthouse solo cubren reglas automáticas | v2: sesión de prueba con lector de pantalla |
| No hubo pruebas con usuarios de la comunidad | Medio: la usabilidad se evaluó por heurísticas | v2: prueba con 5 voluntarios |
| La división política solo incluye las cabeceras parroquiales (24 provincias) | Bajo en el MVP | v2: DPA completa del INEC |
| Las pantallas de escritorio en Figma están incompletas por el límite del plan gratuito | Solo afecta la presentación | Completarlas al renovarse el cupo |

## 8. Cómo reproducir las mediciones

```bash
cp .env.example .env
docker compose up --build -d --wait
pnpm install
pnpm --filter @nexo/shared test
pnpm --filter backend test:e2e
pnpm exec playwright install chromium
pnpm e2e
```

Lighthouse se ejecutó con su API de Node (`lighthouse@12.8.2`), conectada al Chromium de Playwright y con la sesión demo guardada en `localStorage`.
