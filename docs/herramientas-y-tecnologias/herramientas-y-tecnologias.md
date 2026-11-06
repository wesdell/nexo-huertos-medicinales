# Herramientas y tecnologías 

## 1. Resumen

El proyecto usa **TypeScript de extremo a extremo** dentro de un **monorepo** gestionado con pnpm. Esto permite compartir tipos, enumeraciones y reglas de negocio entre el frontend y el backend sin duplicar código. Todo se ejecuta en contenedores con Docker Compose y el trabajo se organiza con Scrum.

**Cómo leer las columnas de estado:**

| Estado | Significado |
|---|---|
| **Definida** | El equipo la acordó como parte del stack |
| **Por confirmar** | La propuso el equipo de desarrollo y falta que el equipo la confirme |
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
| **Vite** | Por confirmar | Servidor de desarrollo y empaquetado (puerto 5173) |
| **React Router** | Por confirmar | Navegación entre pantallas y rutas protegidas por rol |
| **Axios o TanStack Query** | Por confirmar | Consumo de la API y manejo de estados de carga y error |
| **Leaflet + OpenStreetMap** | Por confirmar | Mapa para seleccionar la ubicación del huerto (HU-010), sin clave de API |
| **Fraunces e Inter** | Por confirmar | Tipografías de títulos y de cuerpo, con fuentes del sistema como alternativa |
| **Recursos SVG propios** | Definida. | 20 recursos: 7 de etapa del huerto virtual (estado inicial y 6 etapas), 3 niveles, 6 insignias y 4 fases lunares |

## 4. Backend (controlador y servicio)

Servidor que expone la API REST bajo el prefijo `/api` en el puerto 3000.

| Tecnología | Estado | Propósito |
|---|---|---|
| **NestJS** | Definida | Estructura modular con controladores, servicios, inyección de dependencias y guards |
| **JWT** (JSON Web Tokens) | Por confirmar | Autenticación sin estado (`Authorization: Bearer <JWT>`) y control de roles |
| **bcrypt** | Por confirmar | Cifrado (hash) de contraseñas en el registro y el inicio de sesión |
| **class-validator** | Por confirmar | Validación de los DTO de entrada |
| **Swagger (OpenAPI)** | Por confirmar | Documentación interactiva de la API en `/api/docs`; es el contrato entre frontend y backend |

## 5. Base de datos y persistencia

| Tecnología | Versión | Estado | Propósito |
|---|---|---|---|
| **PostgreSQL** | 16 (Alpine) | Definida | Base de datos relacional (puerto 5432) |
| **Prisma ORM** | 6.x (validado con 6.19) | Definida| Modelo de datos, migraciones versionadas y cliente tipado. **Se fija la versión 6**: Prisma 7 ya no admite `url` dentro del schema |
| **Volumen `uploads`** | Volumen de Docker | Definida | Almacenamiento en disco de fotos (JPG y PNG, hasta 5 MB) y videos (MP4, hasta 50 MB) |

## 6. Dominio compartido y calidad

| Componente | Estado | Propósito |
|---|---|---|
| **`@nexo/shared`** | Definida | Librería interna con las reglas de negocio puras: validación de las 13 actividades (errores y advertencias), fase lunar, caducidad por región, puntos, niveles, insignias, misiones, talentos, huerto virtual, ranking y límites de archivos |
| **Fase lunar por algoritmo** | Definida| Cálculo propio (mes sinódico medio) válido de 1900 a 2100, con precisión de ±1 día. No depende de internet ni de librerías externas |
| **Pruebas automáticas**  | Definida | Verifican las reglas de las historias de usuario y comprueban que los enums de Prisma y de TypeScript estén sincronizados |
| **Pruebas del backend y del frontend** | Por definir | Aún no hay herramienta elegida (NestJS y Vite suelen traer Jest y Vitest, respectivamente) |
| **ESLint y Prettier** | Por confirmar | Estilo de código común en todo el monorepo |

## 7. Infraestructura y despliegue

| Herramienta | Estado | Propósito |
|---|---|---|
| **Docker y Docker Compose** | Definida. El archivo `docker-compose.yml` es válido, pero **no se probó** levantando los contenedores | Tres servicios (`nexo-frontend`, `nexo-backend`, `nexo-db`), sus volúmenes (`pgdata` y `uploads`) y una red interna |
| **Corepack** | Por confirmar | Activa la versión de pnpm fijada en el proyecto |

**Servicios y puertos**

| Servicio | Imagen base | Puerto |
|---|---|:-:|
| `nexo-frontend` | `node:22-alpine` | 5173 |
| `nexo-backend` | `node:22-alpine` | 3000 |
| `nexo-db` | `postgres:16-alpine` | 5432 |

## 8. Gestión del trabajo (Scrum), colaboración y diseño

| Herramienta | Estado | Uso |
|---|---|---|
| **Scrum** | Definida | Marco de trabajo: base mínima (Sprint 0) e incrementos sucesivos (ver `arquitectura.md`, sección 2) |
| **Git y GitHub** | Definida | Control de versiones con ramas `main`, `develop` y `feature/*`, y pull requests hacia `develop` |
| **Nombres en GitHub**  | Por confirmar | Identificación del equipo y del proyecto |
| **Tablero de tareas** | Por confirmar | Backlog del producto, sprints y seguimiento de errores |
| **Postman o Swagger UI** | Por confirmar | Pruebas manuales de la API |
| **Figma** | Por confirmar | Wireframes y prototipos de alta fidelidad |
| **Mermaid** | Definida. **Verificada**: todos los diagramas validan | Diagramas de contenedores, módulos, entidad-relación, secuencia, despliegue y navegación |
| **Markdown y Word** | Definida | Documentación en `docs/` y plantilla del informe |
| **Claude (Anthropic)** | Definida | Asistente de IA generativa para planificación, revisión y borradores de documentación |

## 9. Estructura del repositorio

```
nexo-huertos-medicinales/
├── README.md
├── package.json              scripts del monorepo
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── docker-compose.yml
├── .env.example
├── apps/
│   ├── backend/              NestJS + Prisma (prisma/schema.prisma)
│   └── frontend/             React + Tailwind
├── packages/
│   └── shared/               @nexo/shared: enums y reglas de dominio
└── docs/
    ├── historias-de-usuario/
    ├── herramientas-y-tecnologias/
    ├── arquitectura-y-diseno/   arquitectura, diseño, API, tokens.css y assets
    ├── casos-de-prueba/
    └── informe/
```

## 10. Comandos esenciales

| Para… | Comando |
|---|---|
| Instalar dependencias | `pnpm install` |
| Probar las reglas del dominio | `pnpm --filter @nexo/shared test` |
| Levantar todo | `docker compose up --build` |
| Detener y limpiar | `docker compose down` |
| Sincronizar el esquema sin migraciones (desarrollo) | `pnpm --filter backend exec prisma db push` |
| Crear una migración | `pnpm db:migrate -- --name <nombre>` |

## 11. Alternativas descartadas

| Alternativa | Motivo |
|---|---|
| Prisma 7 | Ya no admite `url` dentro del schema, y el esquema del proyecto está escrito para Prisma 6 |
| TypeORM | Prisma ofrece migraciones y cliente tipado con menos configuración |
| API astronómica externa para la fase lunar | Evita depender de internet y de claves; la precisión de ±1 día basta para el calendario agrícola |
| Sesiones en el servidor | JWT se integra de forma más directa con una SPA |
| Almacenamiento de archivos en la nube | Innecesario en la versión 1; se usa un volumen local |
| Repositorios separados para frontend y backend | El monorepo permite compartir `@nexo/shared` y mantener un solo entorno |

