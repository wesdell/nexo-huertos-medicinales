# Changelog

Todos los cambios importantes de Nexo se registran aquí. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [versionado semántico](https://semver.org/lang/es/).

## [1.0.0] · 2026-11-06

Primera versión: el MVP para la entrega del 10/11/2026.

### Agregado

- **Cuenta y datos personales.** Registro de voluntarios con consentimiento expreso del tratamiento de datos según la LOPDP (HU-001, HU-036), inicio y cierre de sesión con JWT (HU-002) y página de política de privacidad.
- **Comunidad y huerto.** Crear una comunidad, cuyo creador queda como responsable (HU-004). Registrar el huerto por provincia y parroquia, con 24 provincias y sus cabeceras parroquiales (HU-010). Registrar plantas medicinales con su ciclo, cualidad caliente o fría y usos (HU-014).
- **Calendario lunar.** Fase lunar del día con su recomendación, dibujada como se ve la luna desde Ecuador (HU-017), y consejos de los saberes ancestrales.
- **Actividades.** Registro de preparación de la tierra, siembra, riego y cosecha (HU-018, HU-021, HU-023, HU-025). Los errores bloquean el registro. Las advertencias del calendario ancestral se pueden corregir o confirmar.
- **Puntos.** Puntos por actividad, con 5 de bono por seguir la recomendación y sin repetir puntos el mismo día (HU-030).
- **Huerto virtual.** Siete etapas ilustradas y avance del huerto. La planta trabajada «brota» de su etapa anterior a la nueva (HU-016).
- **Interfaz.** Sistema de diseño «App cálida de consumo»: Nunito, iconos Lucide, logo y favicon propios, barra inferior en móvil y menú lateral en escritorio. Documentado en `apps/frontend/DESIGN.md` y en Figma.
- **Ejecución.** Docker Compose con PostgreSQL 16, API NestJS y frontend React. Al arrancar se aplican las migraciones y se carga una cuenta demo.
- **Calidad.**
  - 29 pruebas unitarias de dominio, 13 pruebas de API de punta a punta y pruebas de Playwright en móvil y escritorio con axe (WCAG 2.1 AA).
  - Lighthouse: 100 en accesibilidad en todas las pantallas.
  - CI en GitHub Actions.
- **Documentación.** Guía de ejecución, bitácora de versiones, casos de prueba, informe de calidad y HU-036.

### Corregido

- Tras crear la comunidad, la app ahora lleva a Mi huerto en vez de volver a Inicio.
- El diálogo de advertencias abre con el foco en «Corregir» y lo devuelve al formulario al cerrarse.
- Los mensajes de campo obligatorio respetan el género y el número («La contraseña es obligatoria»).
- El enlace «Saltar al contenido» se ve completo al enfocarlo.
- El botón «Registrar actividad» de la tarjeta Hoy ya no se parte en tabletas.

[1.0.0]: https://github.com/wesdell/nexo-huertos-medicinales/releases/tag/v1.0.0
