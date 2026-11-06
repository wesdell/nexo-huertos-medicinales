# Arquitectura

## 1. Visión general

**Arquitectura Cliente-Servidor desacoplada (SPA + API REST)** con backend modular en capas, dentro de un monorepo en contenedores Docker Compose.

Tres principios guían el diseño:

1. **Las reglas del dominio viven en `@nexo/shared`** — validación de actividades, fase lunar, gamificación, huerto virtual y ranking. Backend y frontend consumen el mismo paquete; el backend es la autoridad.
2. **Advertir, confirmar y guardar** — las actividades fuera de la práctica recomendada generan advertencias que el usuario confirma; los errores de datos sí bloquean.
3. **Lo derivado no se guarda** — el huerto virtual, el progreso de misiones y el ranking se calculan al consultar.

## 2. Diagrama de contenedores

```mermaid
flowchart LR
    U["Usuario<br/>voluntario, miembro,<br/>responsable o moderador"]

    subgraph DOCKER["Docker Compose (red interna)"]
        FE["Frontend (Vista)<br/>React + Tailwind<br/>:5173"]
        BE["Backend (Controlador + Modelo)<br/>NestJS API REST<br/>:3000, prefijo /api"]
        DB[("PostgreSQL<br/>:5432")]
        FS[/"Volumen uploads<br/>fotos y videos"/]
    end

    SH["@nexo/shared<br/>enums y reglas de dominio"]

    U -->|HTTPS| FE
    FE -->|"JSON + JWT"| BE
    BE -->|"Prisma (SQL)"| DB
    BE -->|"lee y escribe archivos"| FS
    FE -. "usa" .-> SH
    BE -. "usa" .-> SH
```

## 3. Arquitectura modular en capas

Cada módulo de NestJS aplica tres capas internas:  
**Controlador** (rutas HTTP, DTOs, guards)  
**Servicio** (lógica de negocio, reglas del dominio, transacciones)  
**Acceso a datos** (`PrismaService`). Los controladores nunca acceden directamente a la base de datos.

```mermaid
flowchart TB
    subgraph NEST["apps/backend (NestJS)"]
        AUTH["auth<br/>HU-001, HU-002"]
        USU["usuarios<br/>HU-003, HU-034"]
        COM["comunidades<br/>membresías<br/>HU-004 a HU-007"]
        GEO["geografia<br/>provincias y parroquias<br/>HU-010"]
        HUE["huertos<br/>HU-010 a HU-013, HU-016"]
        PLA["plantas<br/>HU-014"]
        BOD["bodega<br/>HU-015"]
        LUN["calendario-lunar<br/>HU-017"]
        ACT["actividades<br/>HU-018 a HU-027, HU-029"]
        ARC["archivos<br/>HU-014, HU-028"]
        GAM["gamificacion<br/>HU-030 a HU-033, HU-035"]
        FOR["foro<br/>HU-008, HU-009"]
        PRI["prisma<br/>PrismaService global"]
    end

    COM --> USU
    HUE --> COM
    HUE --> GEO
    PLA --> HUE
    BOD --> HUE
    ACT --> HUE
    ACT --> PLA
    ACT --> LUN
    ACT --> ARC
    ACT --> GAM
    GAM --> USU
    GAM --> COM
    FOR --> USU
    ACT --> PRI
    GAM --> PRI
    COM --> PRI
```

| Módulo | Responsabilidad |
|---|---|
| `auth` | Registro, inicio y cierre de sesión; JWT; guards de rol y pertenencia |
| `usuarios` | Perfil editable; nivel y talentos de solo lectura; progreso personal |
| `comunidades` | Crear y editar comunidad; membresías; ficha con ranking |
| `geografia` | Catálogo de provincias (con región) y parroquias |
| `huertos` | Ubicación, diseño, cerca, recursos y huerto virtual derivado |
| `plantas` | Plantas del huerto con información botánica y fotos |
| `bodega` | Tres espacios: herramientas, semillas/plántulas y abonos |
| `calendario-lunar` | Fase de una fecha o de un mes; actividades recomendadas por fase |
| `actividades` | Un solo servicio para los 13 tipos: valida, guarda, adjunta archivos y dispara gamificación |
| `archivos` | Validación y almacenamiento de fotos y videos |
| `gamificacion` | Puntos, insignias, misiones, talentos, niveles y ranking |
| `foro` | Aportes y moderación |

## 4. Modelo de datos

El esquema completo está definido en `apps/backend/prisma/schema.prisma`.

```mermaid
erDiagram
    PROVINCIA ||--o{ PARROQUIA : "contiene"
    PROVINCIA ||--o{ HUERTO : "ubica"
    PARROQUIA ||--o{ HUERTO : "ubica"
    USUARIO ||--o{ MEMBRESIA : "participa"
    COMUNIDAD ||--o{ MEMBRESIA : "agrupa"
    COMUNIDAD ||--o{ HUERTO : "posee"
    USUARIO ||--o{ TALENTO_MIEMBRO : "certifica"
    USUARIO ||--o{ INSIGNIA_MIEMBRO : "gana"
    USUARIO ||--o{ MISION_MIEMBRO : "completa"
    USUARIO ||--o{ ACTIVIDAD : "registra"
    USUARIO ||--o{ MOVIMIENTO_PUNTOS : "acumula"
    COMUNIDAD ||--o{ MOVIMIENTO_PUNTOS : "acumula"
    USUARIO ||--o{ APORTE : "escribe"
    HUERTO ||--o{ HUERTO_DISENO : "combina"
    HUERTO ||--o{ BODEGA_ESPACIO : "tiene"
    HUERTO ||--o{ PLANTA : "cultiva"
    HUERTO ||--o{ ACTIVIDAD : "recibe"
    PLANTA ||--o{ FOTO_PLANTA : "muestra"
    PLANTA ||--o{ ACTIVIDAD : "involucra"
    PLANTA ||--o{ PAQUETE : "produce"
    ACTIVIDAD ||--o{ ARCHIVO_ACTIVIDAD : "adjunta"
    ACTIVIDAD ||--o| PAQUETE : "genera"
    ACTIVIDAD ||--o{ MOVIMIENTO_PUNTOS : "otorga"

    USUARIO {
        uuid id PK
        string email
        enum rol
        enum nivel
        int puntos
    }
    COMUNIDAD {
        uuid id PK
        string nombre
        int puntosTotales
        datetime ultimoCambioPuntos
    }
    MEMBRESIA {
        uuid usuarioId PK
        uuid comunidadId PK
        boolean esResponsable
    }
    HUERTO {
        uuid id PK
        decimal latitud
        decimal longitud
        decimal areaM2
        enum tipoSuelo
    }
    PLANTA {
        uuid id PK
        string nombreComun
        enum ciclo
        enum cualidad
    }
    ACTIVIDAD {
        uuid id PK
        enum tipo
        date fecha
        string hora
        enum faseLunar
        json detalle
        string_array advertencias
    }
    MOVIMIENTO_PUNTOS {
        uuid id PK
        int puntos
        string motivo
    }
```

Decisiones de datos relevantes:

- **`esResponsable` en membresía**, no un rol global. El único rol global adicional es `MODERADOR`.
- **Una sola tabla `ACTIVIDAD`** para los 13 tipos; lo específico de cada una va en `detalle` (JSON). Las advertencias confirmadas se guardan en `advertencias[]`.
- **`MovimientoPuntos`** es el libro de auditoría; `Usuario.puntos` y `Comunidad.puntosTotales` son cachés actualizados en la misma transacción.
- **Catálogos en código** (`@nexo/shared`): insignias, misiones y talentos. La base solo guarda lo ya logrado por cada miembro.
- **`fecha`** es `@db.Date` local Ecuador y **`hora`** es texto `HH:mm`, para evitar errores de zona horaria.

## 5. Flujo de comunicación entre capas: registrar actividad

El mismo endpoint y flujo sirven para los 13 tipos de actividades. Si existen advertencias sin confirmar, el servidor solicita confirmación antes de persistir la transacción:

```mermaid
sequenceDiagram
    actor M as Miembro
    participant FE as Vista (React)
    participant API as Controlador (NestJS)
    participant SV as Servicio (NestJS)
    participant DOM as Dominio (@nexo/shared)
    participant DB as Base de Datos (PostgreSQL)

    M->>FE: Completa el formulario del tipo de actividad
    FE->>API: POST /api/huertos/{id}/actividades
    API->>API: JwtGuard y verificación de pertenencia a la comunidad
    API->>SV: registrar(datos, usuario)
    SV->>DB: Lee contexto (diseños, planta, última preparación, rituales del día)
    SV->>DOM: validarActividad(entrada, contexto)
    DOM-->>SV: errores, advertencias, fase lunar
    alt Hay errores de validación
        SV-->>FE: Rechaza la petición con la lista de errores
    else Hay advertencias sin confirmar
        SV-->>FE: Devuelve las advertencias preventivas
        FE-->>M: Diálogo: confirmar y guardar de todas formas
        M->>FE: Confirma
        FE->>API: Reenvía con confirmarAdvertencias = true
    end
    SV->>DB: BEGIN
    SV->>DB: INSERT actividad (con advertencias confirmadas)
    SV->>DB: INSERT paquete si es EMPAQUETADO
    SV->>SV: Ejecuta pipeline de gamificación
    SV->>DB: COMMIT
    SV-->>FE: Confirma registro con puntos, nivel y logros nuevos
    FE-->>M: Mensaje de felicitación y huerto virtual actualizado
```

## 6. Diagrama de despliegue

```mermaid
flowchart TB
    subgraph HOST["Equipo del desarrollador o servidor"]
        subgraph NET["Red interna de Docker Compose"]
            C1["nexo-frontend<br/>node:22-alpine, Vite<br/>puerto 5173"]
            C2["nexo-backend<br/>node:22-alpine, NestJS<br/>puerto 3000"]
            C3["nexo-db<br/>postgres:16-alpine<br/>puerto 5432"]
        end
        V1[("volumen pgdata")]
        V2[("volumen uploads")]
    end
    NAV["Navegador"] -->|":5173"| C1
    NAV -->|":3000/api"| C2
    C2 -->|"DATABASE_URL"| C3
    C3 --- V1
    C2 --- V2
```

## 7. Roles y permisos

Todos los permisos se verifican en el servidor mediante guards en la capa de Controlador:

| Funcionalidad | Sin sesión | Voluntario | Miembro | Responsable | Moderador |
|---|:-:|:-:|:-:|:-:|:-:|
| Registrarse e iniciar sesión (HU-001, 002) | ✔ | | | | |
| Editar mis datos personales (HU-003) | | ✔ | ✔ | ✔ | ✔ |
| Crear comunidad (HU-004) | | ✔ | | | |
| Consultar comunidades y ranking (HU-007, 035) | | ✔ | ✔ | ✔ | ✔ |
| Editar comunidad y agregar miembros (HU-005, 006) | | | | ✔ | |
| Registrar huerto, plantas y bodega (HU-010 a 015) | | | | ✔ | |
| Ver huerto virtual y calendario (HU-016, 029) | | | ✔ | ✔ | |
| Registrar actividades y archivos (HU-018 a 028) | | | ✔ | ✔ | |
| Consultar fase lunar (HU-017) | | ✔ | ✔ | ✔ | ✔ |
| Ver progreso, insignias y misiones (HU-031 a 034) | | ✔ | ✔ | ✔ | ✔ |
| Publicar y leer en el foro (HU-008) | | ✔ | ✔ | ✔ | ✔ |
| Retirar aportes del foro (HU-009) | | | | | ✔ |

## 8. Decisiones de arquitectura

| # | Decisión | Motivo |
|---|---|---|
| D1 | SPA + API REST desacoplada | Stack acordado; permite trabajo en paralelo entre frontend y backend en cada Sprint |
| D2 | TypeScript en todo el proyecto | Tipos compartidos y reducción de errores de contrato entre capas |
| D3 | NestJS modular en capas | Módulos alineados al dominio con guards y DTOs integrados |
| D4 | Prisma 6 con PostgreSQL | Migraciones versionadas y cliente tipado |
| D5 | Reglas en `@nexo/shared` con pruebas | Una sola fuente de verdad para frontend y backend |
| D6 | Un endpoint y tabla para los 13 tipos de actividad | Estructura compartida; se agrega un formulario por tipo en cada incremento sin crear nuevos módulos |
| D7 | Fase lunar por algoritmo (1900–2100) | Sin dependencia de internet ni claves externas; precisión ±1 día |
| D8 | JWT con guards de rol y pertenencia | Integración directa y sin estado con React |
| D9 | Error bloquea; advertencia se confirma | Coherente con las historias HU-018 a 027 |
| D10 | Huerto virtual, misiones y ranking derivados | Nunca se desincronizan de la realidad registrada |
| D11 | Libro de puntos con totales en caché | Auditable y recalculable dentro de la misma transacción |
| D12 | Catálogos de insignias, misiones y talentos en código | Versionados y probados sin requerir pantallas de administración |
| D13 | Fecha local como `Date` y hora como texto `HH:mm` | Evita desfases de zona horaria (Ecuador UTC−5) |
| D14 | Monorepo con pnpm y Docker Compose | Entorno estandarizado y reproducible para todo el equipo |