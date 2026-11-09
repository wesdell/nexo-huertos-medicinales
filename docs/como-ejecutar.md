# Cómo ejecutar Nexo en tu computadora

Esta guía sirve para Windows, macOS y Linux. No necesitas instalar Node.js ni PostgreSQL: Docker se encarga de todo.

## 1. Instala lo necesario (una sola vez)

1. Instala **Git**: <https://git-scm.com/downloads>.
2. Instala **Docker Desktop**: <https://www.docker.com/products/docker-desktop/>.
   - En Windows, acepta activar WSL 2 si el instalador lo pide y reinicia la computadora.
3. Abre Docker Desktop y espera a que diga que está en ejecución (*Engine running*).

Para comprobarlo, abre una terminal (en Windows: PowerShell) y ejecuta:

```bash
docker compose version
```

Si muestra un número de versión, todo está listo.

## 2. Descarga el proyecto

```bash
git clone https://github.com/wesdell/nexo-huertos-medicinales.git
```

```bash
cd nexo-huertos-medicinales
```

## 3. Crea el archivo de configuración

Copia el archivo de ejemplo `.env.example` con el nombre `.env`.

- Windows (PowerShell):

  ```powershell
  Copy-Item .env.example .env
  ```

- macOS o Linux:

  ```bash
  cp .env.example .env
  ```

No hace falta cambiar nada para usarlo en tu computadora.

## 4. Levanta la aplicación

```bash
docker compose up --build
```

La primera vez tarda unos minutos porque descarga imágenes e instala dependencias. Está lista cuando la terminal deja de avanzar y aparece una línea parecida a `Local: http://localhost:5173/`.

## 5. Abre la aplicación

| Qué | Dirección |
|---|---|
| Aplicación | <http://localhost:5173> |
| Documentación de la API (Swagger) | <http://localhost:3000/api/docs> |

Para entrar sin registrarte, usa la **cuenta de demostración**: el correo y la contraseña están en tu archivo `.env` (`DEMO_EMAIL` y `DEMO_PASSWORD`). También puedes crear tu propia cuenta desde «Regístrate». La cuenta de demostración ya tiene una comunidad, un huerto y plantas de ejemplo (cargadas desde `apps/backend/prisma/seed-plantas.sample.json`).

## 6. Detén la aplicación

En la terminal donde corre, presiona `Ctrl + C`. Luego, para apagar los contenedores:

```bash
docker compose down
```

Para empezar de cero y **borrar todos los datos** (usuarios, huertos, actividades):

```bash
docker compose down -v
```

## Solución de problemas

| Problema | Causa probable | Solución |
|---|---|---|
| `Cannot connect to the Docker daemon` o `failed to connect to the docker API` | Docker Desktop no está abierto | Abre Docker Desktop, espera a *Engine running* y repite el paso 4 |
| `port is already allocated` (5173, 3000 o 5432) | Otro programa usa ese puerto, por ejemplo un PostgreSQL instalado | Cierra ese programa o detén su servicio y repite el paso 4 |
| La página no carga en <http://localhost:5173> | La aplicación aún está arrancando | Espera un minuto y recarga; revisa la terminal |
| `container nexo-huertos-nexo-backend-1 is unhealthy` | La base de datos tardó en arrancar | Ejecuta `docker compose up` otra vez |
| Cambiaste código y no ves el cambio | La imagen no se reconstruyó | Ejecuta `docker compose up --build` |
| La cuenta demo no entra | Cambiaste `.env` después de crear la base | Ejecuta `docker compose down -v` y luego `docker compose up --build` |

## Para quienes desarrollan

Requisitos adicionales: Node.js 22 y pnpm (`corepack enable`).

```bash
pnpm install
```

Los comandos de pruebas y el frontend con recarga en vivo están en el [README](../README.md#pruebas). Además:

| Para | Comando |
|---|---|
| Revisar el estilo del código | `pnpm lint` |
| Capturas de pantalla para presentar (con la app levantada) | `node e2e/capturas.mjs docs/capturas` |
