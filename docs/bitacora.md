# Bitácora del proyecto

Registro vivo de lo hecho y lo pendiente. Se actualiza en cada push. Rama de trabajo actual: `claude/huerto-virtual-mvp-figma-2421dc` (PR hacia `main`).

## Versiones

| Versión | Fecha objetivo | Estado |
|---|---|---|
| **v1.0.0 — MVP** | 10/11/2026 | En curso |
| v2.0.0 | Por definir | Pendiente |
| v3.0.0 | Por definir | Pendiente |

## v1.0.0 — MVP

Objetivo: flujo mínimo de punta a punta, ejecutable con `docker compose up --build`, con foco en calidad (usabilidad, accesibilidad WCAG AA, responsive, pruebas y CI).

### Alcance

| Funcionalidad | HU | Estado |
|---|---|---|
| Base del monorepo (pnpm, TypeScript, Docker Compose, CI) | — | Hecho salvo CI |
| Reglas de dominio en `@nexo/shared` con pruebas | 016, 017, 018, 021, 023, 025, 030 | Hecho |
| Interfaces en Figma de las pantallas v1 | — | Esperando conexión de Figma MCP |
| Registro con consentimiento de protección de datos (LOPDP) | 001, 036 (nueva) | Hecho |
| Inicio y cierre de sesión | 002 | Hecho |
| Crear comunidad (el creador queda como responsable) | 004 | Hecho |
| Registrar huerto básico: nombre, provincia, parroquia y coordenadas (GPS del navegador o manual) | 010 (parcial) | Hecho |
| Registrar plantas (sin fotos) | 014 (parcial) | Hecho |
| Registrar actividad: preparación de tierra, siembra, riego y cosecha, con errores y advertencias | 018, 021, 023, 025 | Hecho |
| Puntos por actividad y bono por seguir la recomendación | 030 | Hecho |
| Huerto virtual (etapas 0 a 4 y porcentaje de progreso) | 016 | Hecho |
| Inicio con recomendación del día según la fase lunar | 017 (parcial) | Hecho |
| Consejos ancestrales (orientación al Este, cercas vivas) como texto de ayuda | — | Hecho |
| Pruebas: reglas de dominio, API, flujo e2e con revisión de accesibilidad (axe) | — | Pendiente |
| README, CHANGELOG y release v1.0.0 en GitHub | — | Pendiente |

### Simplificaciones conscientes de v1
- Parroquias: solo cabeceras provinciales; el catálogo completo del INEC llega en v2.
- Siembra: no exige ritual previo (el ritual de siembra entra en v2).
- Sin fotos ni videos; sin mapa interactivo.

## v2.0.0 — Pendiente
- Mapa Leaflet/OpenStreetMap y georreferenciación del huerto (HU-010 completa).
- Diseño, cerca y recursos del huerto (HU-011, HU-012, HU-013).
- Calendario lunar mensual (HU-017 completa).
- Fotos de plantas y archivos de actividades (HU-014 completa, HU-028).
- Actividades restantes: estructura, rituales, señalética, cuidados, baño, limpieza, secado, empaquetado (HU-019, 020, 022, 024, 026, 027).
- Huerto virtual etapas 5 y 6.
- Ranking de comunidades (HU-035), perfil (HU-003), editar comunidad y miembros (HU-005 a HU-007).
- Catálogo completo de parroquias del INEC.

## v3.0.0 — Pendiente
- Foro de prácticas y saberes y moderación (HU-008, HU-009).
- Insignias, misiones y retos, talentos y niveles (HU-031 a HU-034).
- Bodega y almacenaje (HU-015), historia visual de la planta (HU-028).
- Calendario de actividades (HU-029).
- Notificaciones (correo o push) de actividades recomendadas.

## Registro de avances

| Fecha | Qué se hizo |
|---|---|
| 05/11/2026 | Revisión del repositorio: al día con `origin/main` (6c5b552); solo documentación y `schema.prisma`, sin código. Se definió el alcance de v1, v2 y v3. Se inició la base del monorepo. |
| 05/11/2026 | `@nexo/shared`: fase lunar (1900–2100), recomendación del día, consejos ancestrales, validación de las 4 actividades de v1, puntos (HU-030) y huerto virtual (HU-016). 29 pruebas en verde, incluida la sincronía de enums con `schema.prisma`. |
| 05/11/2026 | Backend NestJS + Prisma (migración inicial con consentimiento LOPDP, seed de 24 provincias y cuenta demo), frontend React + Tailwind con las 8 pantallas de v1, Docker Compose funcionando (`docker compose up --build`). 13 pruebas de API de punta a punta en verde. |
| 05/11/2026 | Prueba e2e con Playwright (móvil y escritorio) + revisión de accesibilidad axe WCAG 2.1 AA sin violaciones serias. Encontró y corrigió un error: tras crear la comunidad se volvía a Inicio en vez de ir a Mi huerto. |
