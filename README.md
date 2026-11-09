# Nexo · Huertos medicinales comunitarios

Aplicación web educativa y gamificada del Ministerio de Salud Pública (MSP) del Ecuador para que las comunidades, desde una sola persona hasta un barrio entero, creen huertos medicinales, aprendan los saberes ancestrales y entreguen plantas secas a la población.

- **Público (sin cuenta):** solicita un huerto, ve el mapa, la ficha y el huerto virtual de cada huerto, el ranking, las estadísticas por provincia, el catálogo de plantas, los 13 pasos del huerto con el calendario lunar y el foro.
- **Responsable del huerto:** registra a sus voluntarios (sin cuenta), elige plantas del catálogo según la altitud y registra cada paso del ciclo después de hacerlo, con quién trabajó, cuántas horas y fotos o videos reales.
- **Técnico del MSP:** aprueba huertos (la clave llega por correo), valida evidencias (así se otorgan los puntos), administra el catálogo, aprueba niveles por experiencia, mantiene el registro centralizado y modera el foro.
- **Administrador del sistema:** respaldos, estado de la base de datos y cuentas de técnicos.

El modelo sale de la reunión con el MSP del 06/11/2026: [docs/reunion-msp-2026-11-06.md](docs/reunion-msp-2026-11-06.md).

Proyecto de la materia **Calidad de Software**. Estado y pendientes: [docs/bitacora.md](docs/bitacora.md).

## Ejecutar con Docker (recomendado)

**Guía paso a paso para cualquier persona, con solución de problemas: [docs/como-ejecutar.md](docs/como-ejecutar.md).**

Resumen. Requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) abierto.

1. Copia la configuración de ejemplo:

   ```bash
   cp .env.example .env
   ```

2. Levanta todo:

   ```bash
   docker compose up --build
   ```

3. Abre:
   - Aplicación: <http://localhost:5173>
   - Correos enviados (claves temporales), bandeja de Mailpit: <http://localhost:8025>
   - Documentación de la API (Swagger): <http://localhost:3000/api/docs>

Cuentas de demostración (solo desarrollo), todas con la contraseña `DEMO_PASSWORD` de `.env.example`:

| Rol | Correo |
|---|---|
| Responsable de huerto | `demo@nexo.test` |
| Técnico del MSP | `tecnico@nexo.test` |
| Administrador del sistema | `admin@nexo.test` |

Para detener: `docker compose down`. Para borrar también la base de datos: `docker compose down -v`.

## Desarrollo local sin Docker para el frontend

Requisitos: Node.js 22 y pnpm (`corepack enable`).

```bash
pnpm install
docker compose up -d nexo-db nexo-backend
pnpm --filter frontend dev
```

## Pruebas

| Qué | Comando | Requiere |
|---|---|---|
| Reglas de dominio (pasos, validaciones, puntos, niveles, ranking, cédula) | `pnpm --filter @nexo/shared test` | Nada |
| Tipos en todo el monorepo | `pnpm typecheck` | Nada |
| Estilo y reglas de accesibilidad del código (ESLint) | `pnpm lint` | Nada |
| API de punta a punta | `pnpm --filter backend test:e2e` | `docker compose up` |
| Flujos de los cuatro roles en móvil y escritorio + accesibilidad (axe, WCAG 2.1 AA) | `pnpm e2e` | `docker compose up` y `pnpm exec playwright install chromium` |

GitHub Actions ejecuta todo en cada pull request ([.github/workflows/ci.yml](.github/workflows/ci.yml)).

## Diseño

| Qué | Dónde |
|---|---|
| Interfaces en Figma: variables, componentes y pantallas | [Nexo — MVP v1](https://www.figma.com/design/5lN9PIqZZV9XJsqGy1yaiI) |
| Sistema de diseño (colores, tipografía, componentes, reglas) | [apps/frontend/DESIGN.md](apps/frontend/DESIGN.md) |
| Capturas de la app real en móvil y escritorio | [docs/capturas/](docs/capturas/) |

El archivo de Figma está en el equipo del autor del repositorio. Si el enlace no te abre, pide acceso desde la misma página de Figma. Las capturas de `docs/capturas/` muestran las mismas pantallas y no requieren cuenta.

## Calidad

- [Historias de usuario](docs/historias-de-usuario/historias-de-usuario.md) ([Word](docs/historias-de-usuario/historias-de-usuario.docx)): HU-001 a HU-052.
- [Casos de prueba](docs/casos-de-prueba/casos-de-prueba.md) ([Word](docs/casos-de-prueba/casos-de-prueba.docx)): 66 unitarias, 13 de API y 8 de interfaz automáticas, y 18 casos documentados con la plantilla de la materia. Los .docx se regeneran con `python docs/generar-docx.py`.
- [Informe de calidad](docs/informe/informe.md): modelo ISO/IEC 25010, resultados de Lighthouse y defectos encontrados.
- [CHANGELOG](CHANGELOG.md) y [bitácora](docs/bitacora.md).

## Estructura

```
apps/backend     API REST NestJS + Prisma (PostgreSQL)
apps/frontend    SPA React + Vite + Tailwind
packages/shared  @nexo/shared: reglas de dominio compartidas y probadas
docs/            historias de usuario, arquitectura, diseño y bitácora
e2e/             pruebas Playwright
```

## Versiones

| Versión | Contenido |
|---|---|
| v1.0.0 (MVP) | Registro con consentimiento de datos, comunidad, huerto, plantas, 4 actividades, puntos, huerto virtual, recomendación lunar |
| v2.0.0 | Modelo acordado con el MSP: solicitud y aprobación de huertos, voluntarios sin cuenta, catálogo por altitud, 13 pasos secuenciales con evidencia, puntos por hora validados por el MSP, niveles, misiones, rankings, parte pública, foro, bodega, producción y administración |

## Licencia

[MIT](LICENSE).
