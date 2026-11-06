# Nexo · Huertos medicinales comunitarios

Aplicación web que une saberes ancestrales e innovación digital para que comunidades, desde una sola persona hasta un barrio entero, cultiven huertos medicinales. Registras tu huerto, sus plantas y las actividades (preparación, siembra, riego, cosecha) y ves un huerto virtual que refleja el real, con recomendaciones según la fase lunar.

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
   - Documentación de la API (Swagger): <http://localhost:3000/api/docs>

Cuenta de demostración (solo desarrollo): los valores `DEMO_EMAIL` y `DEMO_PASSWORD` de `.env.example`.

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
| Reglas de dominio (fase lunar, validaciones, puntos, huerto virtual) | `pnpm --filter @nexo/shared test` | Nada |
| Tipos en todo el monorepo | `pnpm typecheck` | Nada |
| API de punta a punta | `pnpm --filter backend test:e2e` | `docker compose up` |
| Flujo completo en móvil y escritorio + accesibilidad (axe, WCAG 2.1 AA) | `pnpm e2e` | `docker compose up` y `pnpm exec playwright install chromium` |

GitHub Actions ejecuta todo en cada pull request ([.github/workflows/ci.yml](.github/workflows/ci.yml)).

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
| v2.0.0 | Mapa, calendario lunar, fotos, ranking, actividades restantes |
| v3.0.0 | Foro, insignias, misiones, bodega, notificaciones |
