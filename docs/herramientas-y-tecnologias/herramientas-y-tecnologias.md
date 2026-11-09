# Herramientas y tecnologías

## 1. Resumen

El proyecto usa **TypeScript de extremo a extremo** dentro de un **monorepo** gestionado con pnpm. Esto permite compartir tipos, enumeraciones y reglas de negocio entre el frontend y el backend sin duplicar código. Todo se ejecuta en contenedores con Docker Compose y el trabajo se organiza con Scrum.

**Cómo leer las columnas de estado:**

| Estado | Significado |
|---|---|
| **Definida** | El equipo la acordó como parte del stack |
| **Planificada (vN)** | Se usará en la versión indicada; v1 no la necesita |
| **Verificada** | Se comprobó con una prueba real (se indica cuál) |

## 2. Lenguaje y entorno de ejecución

| Tecnología | Versión | Estado | Propósito |
|---|---|---|---|
| **TypeScript** | 5.x | Definida | Tipado estático en frontend, backend y paquete `@nexo/shared`, con modo estricto |
| **Node.js** | 22 (imagen Alpine en Docker) | Definida | Ejecución del servidor y de las herramientas de construcción |
| **pnpm** (con workspaces) | Se fija con `packageManager` | Definida | Gestión del monorepo: `apps/frontend`, `apps/backend` y `packages/shared` |

## 3. Frontend (vista)

Aplicación web de página única con enfoque móvil primero y alto contraste para usarse en exteriores.

| Tecnología | Estado | Propósito |
|---|---|---|
| **React** | Definida | Interfaz basada en componentes y estado de las pantallas |
| **Tailwind CSS v4** | Definida | Estilos utilitarios con la paleta del proyecto |
| **Vite** | Definida | Servidor de desarrollo y empaquetado (puerto 5173) |
| **React Router** | Definida | Navegación entre pantallas y rutas protegidas |
| **`fetch` nativo** | Definida | Consumo de la API con un envoltorio propio (`apps/frontend/src/api.ts`); en v1 no hace falta Axios ni TanStack Query |
| **Leaflet + OpenStreetMap** | Planificada (v2) | Mapa para seleccionar la ubicación del huerto (HU-010), sin clave de API. En v1 se usa la ubicación del navegador o coordenadas manuales |
| **Nunito Variable** | Definida | Única familia tipográfica, incluida en la app con `@fontsource-variable/nunito`. Detalle en `apps/frontend/DESIGN.md` |
| **Lucide** | Definida | Iconos de línea (`lucide-react`) |
| **Recursos SVG propios** | Definida | v1: logo, favicon y 7 etapas del huerto virtual; la luna se dibuja en código (`Luna.tsx`). v3: 3 niveles y 6 insignias |

## 4. Backend (controlador y servicio)

Servidor que expone la API REST bajo el prefijo `/api` en el puerto 3000.

| Tecnología | Estado | Propósito |
|---|---|---|
| **NestJS** | Definida | Estructura modular con controladores, servicios, inyección de dependencias y guards |
| **JWT** (JSON Web Tokens) | Definida | Autenticación sin estado (`Authorization: Bearer <JWT>`) y control de roles |
| **bcrypt** | Definida | Cifrado (hash) de contraseñas en el registro y el inicio de sesión |
| **class-validator** | Definida | Validación de los DTO de entrada |
| **Swagger (OpenAPI)** | Definida | Documentación interactiva de la API en `/api/docs`; es el contrato entre frontend y backend |

## 5. Base de datos y persistencia

| Tecnología | Versión | Estado | Propósito |
|---|---|---|---|
| **PostgreSQL** | 16 (Alpine) | Definida | Base de datos relacional (puerto 5432) |
| **Prisma ORM** | 6.x (validado con 6.19) | Definida| Modelo de datos, migraciones versionadas y cliente tipado. **Se fija la versión 6**: Prisma 7 ya no admite `url` dentro del schema |
| **Volumen `uploads`** | Volumen de Docker | Planificada (v2) | Almacenamiento en disco de fotos (JPG y PNG, hasta 5 MB) y videos (MP4, hasta 50 MB) |

## 6. Dominio compartido y calidad

| Componente | Estado | Propósito |
|---|---|---|
| **`@nexo/shared`** | Definida | Librería interna con las reglas de negocio puras. v1: enums, fase lunar y recomendación del día, consejos ancestrales, validación de 4 actividades (errores y advertencias), puntos, huerto virtual y longitud mínima de la contraseña. Después: las otras 9 actividades, caducidad por región y límites de archivos (v2); niveles, insignias, misiones, talentos y ranking (v2 y v3) |
| **Fase lunar por algoritmo** | Definida| Cálculo propio (mes sinódico medio) válido de 1900 a 2100, con precisión de ±1 día. No depende de internet ni de librerías externas |
| **Vitest** | Verificada: 29 pruebas | Pruebas unitarias de las reglas de dominio de `@nexo/shared` |
| **`node:test`** | Verificada: 13 pruebas | Pruebas de la API de punta a punta contra Docker |
| **Playwright + axe-core** | Verificada: 2 pruebas | Flujo completo en móvil y escritorio, con revisión de accesibilidad WCAG 2.1 AA |
| **Lighthouse** | Verificada | Medición de accesibilidad, rendimiento, buenas prácticas y SEO (ver `docs/informe/informe.md`) |
| **ESLint y Prettier** | Definida | Estilo común en el monorepo. ESLint incluye reglas de React Hooks y de accesibilidad (`jsx-a11y`) y se ejecuta en CI |

## 7. Infraestructura y despliegue

| Herramienta | Estado | Propósito |
|---|---|---|
| **Docker y Docker Compose** | Verificada: el CI levanta los contenedores y corre las pruebas contra ellos | Tres servicios (`nexo-frontend`, `nexo-backend`, `nexo-db`), sus volúmenes (`pgdata` y `uploads`) y una red interna |
| **Corepack** | Definida | Activa la versión de pnpm fijada en el proyecto, también en los Dockerfile |
| **GitHub Actions** | Verificada | CI en cada pull request: tipos, lint, pruebas, build y pruebas de punta a punta |

**Servicios y puertos**

| Servicio | Imagen base | Puerto |
|---|---|:-:|
| `nexo-frontend` | `node:22-alpine` | 5173 |
| `nexo-backend` | `node:22-alpine` | 3000 |
| `nexo-db` | `postgres:16-alpine` | 5432 |

## 8. Gestión del trabajo (Scrum), colaboración y diseño

| Herramienta | Estado | Uso |
|---|---|---|
| **Scrum** | Definida | Marco de trabajo en tres incrementos: v1.0.0, v2.0.0 y v3.0.0 (ver `docs/bitacora.md`) |
| **Git y GitHub** | Definida | Repositorio `wesdell/nexo-huertos-medicinales`. Solo existe `main`: cada cambio va en una rama corta con pull request hacia `main`, y la rama se borra tras el merge |
| **Bitácora** | Definida | Alcance por versión, pendientes y registro de avances en `docs/bitacora.md` |
| **Swagger UI** | Definida | Pruebas manuales de la API en `/api/docs` |
| **Figma** | Definida | Variables, componentes y pantallas: [Nexo — MVP v1](https://www.figma.com/design/5lN9PIqZZV9XJsqGy1yaiI) |
| **Mermaid** | Definida. **Verificada**: todos los diagramas validan | Diagramas de contenedores, módulos, entidad-relación, secuencia, despliegue y navegación |
| **Markdown y Word** | Definida | Documentación en `docs/` y plantilla del informe |
| **Claude (Anthropic)** | Definida | Asistente de IA generativa para planificación, revisión y borradores de documentación |

## 9. Estructura del repositorio

```
nexo-huertos-medicinales/
├── README.md, CHANGELOG.md, LICENSE
├── package.json              scripts del monorepo
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── eslint.config.mjs
├── docker-compose.yml
├── .env.example
├── .github/workflows/ci.yml
├── apps/
│   ├── backend/              NestJS + Prisma (schema, migraciones y seed)
│   └── frontend/             React + Vite + Tailwind (DESIGN.md: sistema de diseño)
├── packages/
│   └── shared/               @nexo/shared: enums y reglas de dominio
├── e2e/                      pruebas Playwright y script de capturas
└── docs/
    ├── bitacora.md, como-ejecutar.md
    ├── historias-de-usuario/
    ├── herramientas-y-tecnologias/
    ├── arquitectura-y-diseno/   arquitectura y diseño
    ├── capturas/
    ├── casos-de-prueba/
    └── informe/
```

## 10. Comandos

Los comandos para ejecutar y probar están en el [README](../../README.md#pruebas) y en la [guía para ejecutarlo](../como-ejecutar.md). Para el esquema de la base de datos:

| Para… | Comando |
|---|---|
| Crear una migración | `pnpm --filter backend db:migrate --name <nombre>` |

## 11. Alternativas descartadas

| Alternativa | Motivo |
|---|---|
| Prisma 7 | Ya no admite `url` dentro del schema, y el esquema del proyecto está escrito para Prisma 6 |
| TypeORM | Prisma ofrece migraciones y cliente tipado con menos configuración |
| API astronómica externa para la fase lunar | Evita depender de internet y de claves; la precisión de ±1 día basta para el calendario agrícola |
| Sesiones en el servidor | JWT se integra de forma más directa con una SPA |
| Almacenamiento de archivos en la nube | Innecesario en la versión 1; se usa un volumen local |
| Repositorios separados para frontend y backend | El monorepo permite compartir `@nexo/shared` y mantener un solo entorno |

