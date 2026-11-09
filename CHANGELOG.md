# Changelog

Todos los cambios importantes de Nexo se registran aquí. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [versionado semántico](https://semver.org/lang/es/).

## [2.0.0] · 2026-11-09

Versión completa con el modelo acordado con el MSP en la reunión del 06/11/2026.

### Cambiado (incompatible con v1)

- Ya no hay auto-registro ni comunidades libres: el público **solicita un huerto** y el **técnico del MSP** lo aprueba; la cuenta del responsable y su contraseña temporal llegan por correo y deben cambiarse en el primer ingreso (HU-037 a HU-039).
- Roles `RESPONSABLE`, `TECNICO_MSP` y `ADMIN`. Los voluntarios no tienen cuenta: los registra el responsable (HU-040).
- Las plantas pasan a un **catálogo global** del MSP filtrado por altitud (HU-042, HU-043).
- Los puntos son **por hora trabajada** y se otorgan cuando el MSP **valida la evidencia** (HU-045).
- La migración `20261109000000_modelo_msp` reemplaza las tablas de v1; los datos demo se vuelven a cargar.

### Agregado

- Parte pública: portada, mapa de huertos, ficha con espejo digital e historia visual, ranking por tipo y de producción, estadísticas por provincia, catálogo de plantas, saberes con los 13 pasos y calendario lunar mensual (HU-048, HU-049, HU-052).
- Los 13 pasos de los lineamientos del MSP en orden, con «cuándo» y «cómo», validaciones de cada paso, evidencia obligatoria, máximo 24 horas por voluntario y día (HU-044).
- Segunda oportunidad de evidencia al 50 %, pasos no cumplidos y ciclos fallidos con causa (HU-045, HU-046).
- Niveles automáticos, nivel por experiencia aprobado por el MSP, talentos certificados y 10 misiones con insignia (HU-041, HU-047).
- Técnico del MSP: bandejas de solicitudes, evidencias, plantas y niveles; carga CSV del catálogo; registro centralizado exportable; cambio de responsable; restablecer contraseña; moderación del foro (HU-050).
- Foro con categorías, respuestas, reglas, reportes y moderación (HU-008, HU-009).
- Bodega, producción con etiquetas y datos operativos del huerto (HU-011 a HU-015).
- Administrador: estado del sistema, respaldo con `pg_dump` y cuentas de técnicos (HU-051).
- Mailpit en Docker Compose para los correos de la demo.
- Historias de usuario y casos de prueba también en Word con las plantillas de la materia (`python docs/generar-docx.py`).

### Calidad

- 66 pruebas unitarias, 13 de API y 4 flujos de interfaz por rol en móvil y escritorio con axe, todas en verde.

## [Sin publicar antes de 2.0.0]

### Corregido

- `pnpm test` ya no falla: se quitó del frontend la configuración de Vitest, que no tenía pruebas.
- `pnpm lint` ya no falla: se agregó `eslint.config.mjs` (TypeScript, React Hooks y accesibilidad con `jsx-a11y`) y se ejecuta en CI.
- El mensaje de fecha inválida de la API ya no cita un formato que no acepta.
- Documentación alineada con lo construido: diseño, arquitectura, herramientas, índice de historias y bitácora.

### Cambiado

- La longitud mínima de la contraseña se define una sola vez en `@nexo/shared` (`CONTRASENA_MIN`).
- `DESIGN.md` y `PRODUCT.md` están en español.

### Eliminado

- `GET /api/huertos/:id/actividades`, que ninguna pantalla usaba; vuelve con el calendario de actividades (HU-029).

### Agregado

- Licencia MIT.

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

[2.0.0]: https://github.com/wesdell/nexo-huertos-medicinales/releases/tag/v2.0.0
[1.0.0]: https://github.com/wesdell/nexo-huertos-medicinales/releases/tag/v1.0.0
