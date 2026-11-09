# Bitácora del proyecto

Registro vivo de lo hecho y lo pendiente. Se actualiza en cada push. Se trabaja en ramas cortas con PR hacia `main`; al hacer merge se borra la rama.

## Versiones

| Versión | Fecha objetivo | Estado |
|---|---|---|
| **v1.0.0 — MVP** | 10/11/2026 | Publicada el 06/11/2026 ([release](https://github.com/wesdell/nexo-huertos-medicinales/releases/tag/v1.0.0)) |
| v2.0.0 | Por definir | Pendiente |
| v3.0.0 | Por definir | Pendiente |

## v1.0.0 — MVP

Objetivo: flujo mínimo de punta a punta, ejecutable con `docker compose up --build`, con foco en calidad (usabilidad, accesibilidad WCAG AA, responsive, pruebas y CI).

### Alcance

| Funcionalidad | HU | Estado |
|---|---|---|
| Base del monorepo (pnpm, TypeScript, Docker Compose, CI) | — | Hecho |
| Reglas de dominio en `@nexo/shared` con pruebas | 016, 017, 018, 021, 023, 025, 030 | Hecho |
| Interfaces en Figma de las pantallas v1 | Parcial | [Nexo — MVP v1](https://www.figma.com/design/5lN9PIqZZV9XJsqGy1yaiI): variables, estilos, componentes y 6 pantallas móvil (390). Falta escritorio (1440): se agotó el cupo de llamadas MCP del plan Starter |
| Registro con consentimiento de protección de datos (LOPDP) | 001, 036 (nueva) | Hecho |
| Inicio y cierre de sesión | 002 | Hecho |
| Crear comunidad (el creador queda como responsable) | 004 | Hecho |
| Registrar huerto básico: nombre, provincia, parroquia y coordenadas (GPS del navegador o manual) | 010 (parcial) | Hecho |
| Registrar plantas (sin fotos) | 014 (parcial) | Hecho |
| Registrar actividad: preparación de tierra, siembra, riego y cosecha, con errores y advertencias | 018, 021, 023, 025 | Hecho |
| Puntos por actividad y bono por seguir la recomendación | 030 | Hecho |
| Huerto virtual (etapas 0 a 6 y porcentaje de progreso) | 016 | Hecho |
| Inicio con recomendación del día según la fase lunar | 017 (parcial) | Hecho |
| Consejos ancestrales (orientación al Este, cercas vivas) como texto de ayuda | — | Hecho |
| Pruebas: reglas de dominio, API, flujo e2e con revisión de accesibilidad (axe) | — | Hecho: 29 + 13 + 2; Lighthouse 100 en accesibilidad |
| Prueba manual, casos de prueba e informe de calidad | — | Hecho: `docs/casos-de-prueba/`, `docs/informe/` |
| README, CHANGELOG y release v1.0.0 en GitHub | — | Hecho |

### Simplificaciones conscientes de v1
- Parroquias: solo cabeceras provinciales; el catálogo completo del INEC llega en v2.
- Siembra: no exige ritual previo (el ritual de siembra entra en v2).
- Sin fotos ni videos; sin mapa interactivo.

## v2.0.0 — Pendiente
- Mapa Leaflet/OpenStreetMap y georreferenciación del huerto (HU-010 completa).
- Diseño, cerca y recursos del huerto (HU-011, HU-012, HU-013).
- Calendario lunar mensual (HU-017 completa).
- Fotos de plantas y archivos de actividades (HU-014 completa, HU-028). Con el secado y el empaquetado, el huerto virtual alcanza sus etapas 5 y 6 (ya dibujadas en v1).
- Actividades restantes: estructura, rituales, señalética, cuidados, baño, limpieza, secado, empaquetado (HU-019, 020, 022, 024, 026, 027).
- Ranking de comunidades (HU-035), perfil (HU-003), editar comunidad y miembros (HU-005 a HU-007).
- Catálogo completo de parroquias del INEC.

## v3.0.0 — Pendiente
- Foro de prácticas y saberes y moderación (HU-008, HU-009).
- Insignias, misiones y retos, talentos y niveles (HU-031 a HU-034).
- Bodega y almacenaje (HU-015), historia visual de la planta (pantalla que reúne los archivos de HU-028).
- Calendario de actividades (HU-029).
- Notificaciones (correo o push) de actividades recomendadas.

## Registro de avances

| Fecha | Qué se hizo |
|---|---|
| 05/11/2026 | Revisión del repositorio: al día con `origin/main` (6c5b552); solo documentación y `schema.prisma`, sin código. Se definió el alcance de v1, v2 y v3. Se inició la base del monorepo. |
| 05/11/2026 | `@nexo/shared`: fase lunar (1900–2100), recomendación del día, consejos ancestrales, validación de las 4 actividades de v1, puntos (HU-030) y huerto virtual (HU-016). 29 pruebas en verde, incluida la sincronía de enums con `schema.prisma`. |
| 05/11/2026 | Backend NestJS + Prisma (migración inicial con consentimiento LOPDP, seed de 24 provincias y cuenta demo), frontend React + Tailwind con las 8 pantallas de v1, Docker Compose funcionando (`docker compose up --build`). 13 pruebas de API de punta a punta en verde. |
| 05/11/2026 | Prueba e2e con Playwright (móvil y escritorio) + revisión de accesibilidad axe WCAG 2.1 AA sin violaciones serias. Encontró y corrigió un error: tras crear la comunidad se volvía a Inicio en vez de ir a Mi huerto. |
| 06/11/2026 | Sistema de diseño elegido: «App cálida de consumo» (fondo cálido, tarjetas blancas, verde solo para acciones, Nunito local, iconos Lucide, logo y favicon propios). Rediseño de las 8 pantallas; e2e + axe en verde; capturas en `docs/capturas/`. |
| 06/11/2026 | Revisión de diseño cerrada (2 rondas): la planta muestra su etapa anterior y brota a la nueva; la línea del bono tiene tamaño de texto normal. `apps/frontend/DESIGN.md` documenta el sistema. Figma: tokens como variables, componentes (Botón, Campo, Selector, NavItem, BarraInferior, MenúLateral, MosaicoActividad, Luna, etapas) y 6 pantallas móvil. |
| 06/11/2026 | Cierre del MVP. En la prueba manual con teclado y Lighthouse se corrigieron 5 defectos: foco del diálogo, concordancia de mensajes, enlace «Saltar al contenido», botón partido en tableta y `robots.txt`. También un solo trazo para los iconos y sombras cálidas en lo flotante. Se agregaron HU-036, los casos de prueba (33 automáticos y 14 manuales), el informe de calidad y el CHANGELOG. Release v1.0.0. Pendiente: pantallas de escritorio en Figma (cupo del plan Starter). |
| 09/11/2026 | Revisión de una auditoría externa de inconsistencias. Se corrigieron: `pnpm test` (el frontend tenía Vitest sin pruebas) y `pnpm lint` (faltaba `eslint.config.mjs`; ahora corre en CI con reglas de accesibilidad); se quitó un endpoint sin uso (`GET /huertos/:id/actividades`); la contraseña mínima vive en `@nexo/shared`. Documentos alineados con lo construido: `diseno.md` apunta a `DESIGN.md` como fuente única y su inventario indica la versión de cada pantalla; `arquitectura.md` muestra el estado de cada módulo en v1; `herramientas-y-tecnologias.md` sin estados «por confirmar»; `DESIGN.md` y `PRODUCT.md` traducidos al español; licencia MIT. Hallazgos descartados por no ser ciertos: `.env` no está en el repositorio (solo `.env.example`) y no existe `seed-plantas.js`. |
| 09/11/2026 | Revisión de la asignación de la v1 contra lo entregado. Se agrega `docs/dominio/dominio.md` (estudio de los lineamientos del MSP y cómo se reflejan en la app, punto 3 de la asignación). Los 14 casos manuales pasan al formato de la plantilla de la asignatura (P-001 a P-014), con fecha, responsable, resultado obtenido, veredicto y capturas; los casos que fallaron muestran su ejecución reprobada y la aprobada tras la corrección. |
