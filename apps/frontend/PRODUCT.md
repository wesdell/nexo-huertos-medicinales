# Producto

<!-- impeccable:product-schema 1 -->

## Plataforma

web

## Usuarios

Comunidades de huertos mixtas del Ecuador: voluntarios de barrios urbanos y de comunidades rurales, de edades variadas y muchos con poca experiencia digital. Usan la app en el teléfono, al aire libre, en el huerto, a menudo bajo sol fuerte y con las manos ocupadas o sucias. Una comunidad puede ser una sola persona o un barrio entero.

## Propósito del producto

Motivar a las personas a empezar y mantener huertos medicinales uniendo los saberes ancestrales (calendario lunar, rituales, cualidad caliente o fría de las plantas, cercas vivas, orientación al Este) con herramientas digitales. Los usuarios registran su huerto real, sus plantas y sus actividades (preparación de la tierra, siembra, riego, cosecha) y ven un «huerto espejo» virtual que refleja el real. Éxito: las comunidades siguen registrando actividades y su huerto virtual avanza.

## Posicionamiento

No es un registro genérico de jardinería: cada recomendación viene de la práctica ancestral andina (fase lunar por actividad, cosecha después del rocío, rituales), y la app advierte con suavidad en lugar de bloquear («guardar de todas formas»). El huerto virtual es el espejo del huerto real de la comunidad.

## Contexto de uso

- Recorrido principal: abrir la app en el huerto → ver la recomendación del día según la fase lunar → registrar una actividad → ver los puntos y el avance del huerto virtual.
- Roles: voluntario, miembro de la comunidad, responsable de la comunidad (crea la comunidad, el huerto y las plantas) y moderador (v3).
- Idioma: español (Ecuador). Las fechas se muestran como dd/mm/aaaa.
- Se evalúa como proyecto universitario de la materia Calidad de Software: se califican la usabilidad, la accesibilidad, el comportamiento responsive y la evidencia de pruebas.
- Versiones: v1.0.0 MVP (publicada el 06/11/2026), luego v2.0.0 y v3.0.0 (ver `docs/bitacora.md`).

## Capacidades y restricciones

- v1: registro con consentimiento de datos personales (LOPDP Ecuador), inicio de sesión, crear comunidad, registrar el huerto (provincia, parroquia y coordenadas), plantas, 4 tipos de actividad con errores frente a advertencias confirmables, puntos, huerto virtual con 7 etapas (0 a 6), recomendación lunar del día y consejos ancestrales.
- Stack fijo: SPA con React + Vite + Tailwind v4, API NestJS, PostgreSQL y Docker Compose.
- Las versiones siguientes suman mapa, foro, insignias, misiones, ranking y fotos.

## Compromisos de marca

- Nombre: **Nexo**. Obligatorio.
- Logo y favicon propios: un brote de dos hojas sobre una línea de tierra en un cuadro verde raíz (`apps/frontend/public/logo.svg`).
- El sistema de diseño vigente es `apps/frontend/DESIGN.md`; `docs/arquitectura-y-diseno/diseno.md` lo resume y remite a él.

## Evidencia disponible

- Historias de usuario HU-001 a HU-036 en `docs/historias-de-usuario/`.
- No existen testimonios reales, organizaciones aliadas, fotos ni métricas; no se inventan.

## Principios del producto

1. Hecha para el huerto: se usa con una mano, se lee al aire libre y tiene objetivos táctiles grandes.
2. Advertir, nunca regañar: las recomendaciones ancestrales son consejos con «guardar de todas formas».
3. La pantalla refleja la tierra: cada acción registrada muestra un avance visible.
4. Reconocer el saber: los puntos y las etapas celebran el cuidado, con sobriedad.
5. Cada estado cuenta: los estados vacío, de error y de carga están diseñados.

## Accesibilidad e inclusión

WCAG 2.1 AA como mínimo (se califica). Para baja alfabetización digital: español sencillo, etiquetas de texto junto a los iconos, el color nunca es la única señal, se respeta el movimiento reducido y hay alto contraste para la luz del sol.
