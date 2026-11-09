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
| Bandeja de correos de prueba (Mailpit) | <http://localhost:8025> |
| Documentación de la API (Swagger) | <http://localhost:3000/api/docs> |

La parte pública no necesita cuenta. Para entrar a los paneles usa las **cuentas de demostración** de tu archivo `.env`, todas con la contraseña `DEMO_PASSWORD`:

| Rol | Correo |
|---|---|
| Responsable del «Huerto Sumak Kawsay» | `demo@nexo.test` |
| Técnico del MSP | `tecnico@nexo.test` |
| Administrador del sistema | `admin@nexo.test` |

Los datos demo incluyen 8 huertos en 8 provincias, 28 plantas del catálogo, ciclos en distintos pasos, evidencias por validar, solicitudes pendientes y aportes en el foro.

### Recorrido sugerido para la presentación

1. Sin iniciar sesión: portada, mapa, ranking, estadísticas, saberes y «Solicitar huerto» (envía una solicitud).
2. Ingresa como técnico: en «Solicitudes» aprueba la tuya; abre <http://localhost:8025> y copia la contraseña temporal del correo.
3. Ingresa con ese correo: el sistema pide cambiar la contraseña. Agrega voluntarios, elige plantas (prueba una de otra altitud), empieza un ciclo y registra la preparación de la tierra con horas y una foto.
4. Vuelve como técnico: en «Evidencias» apruébala (los puntos llegan) o recházala para ver la segunda oportunidad.
5. Revisa el ranking, la ficha pública del huerto y, como administrador, descarga un respaldo.

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
| La cuenta demo no entra | Cambiaste `.env` después de crear la base, o vienes de la v1 | Ejecuta `docker compose down -v` y luego `docker compose up --build` |
| No llega el correo con la contraseña | Mailpit no está corriendo | Revisa <http://localhost:8025>; ejecuta `docker compose up -d nexo-mail` |
| `port is already allocated` en 8025 o 1025 | Otro Mailpit o servidor de correo local | Detén ese programa y repite el paso 4 |

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
