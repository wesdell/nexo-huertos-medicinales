# Reunión con la Ing. Sandra Sánchez (MSP) · 06/11/2026

Resumen de lo acordado con la clienta y cómo lo integra Nexo v2.0.0. La reunión la tuvo otro grupo del curso con la misma clienta; se tomó lo que aplica a este proyecto.

## Objetivo

El MSP quiere atender enfermedades leves con plantas medicinales y reducir el uso de medicamentos. Los huertos comunitarios producen, empaquetan y entregan gratis las plantas, y enseñan los saberes ancestrales. El alcance es educativo y busca que el huerto siga activo: **no es un sistema de trámites**.

## Trazabilidad: acuerdo → implementación

| Acuerdo de la reunión | Cómo quedó en Nexo | HU |
|---|---|---|
| Roles: técnico del MSP, responsable, invitado sin login y administrador técnico | Tres cuentas (`RESPONSABLE`, `TECNICO_MSP`, `ADMIN`) y una parte pública sin login | HU-002, HU-049, HU-051 |
| Los voluntarios no tienen cuenta; el responsable los agrega o los marca inactivos | Modelo `Voluntario` sin cuenta; «Marcar inactivo» en vez de borrar | HU-040 |
| Un huerto empieza con una persona; un responsable a la vez, que se puede cambiar | El huerto nace con su responsable; el técnico cambia de responsable y queda el historial | HU-038, HU-050 |
| De 0 a infinitos voluntarios; un voluntario puede estar en varios huertos | Relación N:M; se reconoce por cédula | HU-040 |
| Hasta 3 subtipos con el mismo grupo y responsable | `subtipos` (1 a 3) validados según el tipo | HU-037 |
| Entra como Aprendiz; con experiencia, el responsable pide Oficial o Maestro y el MSP aprueba | `SolicitudNivel` con justificación | HU-041 |
| «Solicitar crear huerto» pide lo mínimo: ubicación georreferenciada, tipo, subtipo, nombre, cédula, correo y celular | Formulario público con mapa y GPS; cédula por módulo 10 | HU-037 |
| Aprobada: usuario y contraseña inicial por correo, que debe cambiarse. Rechazada: archivada con motivo | Aprobación transaccional con correo (Mailpit en la demo) y cambio de clave obligatorio; rechazo con motivo | HU-038, HU-039 |
| Catálogo precargado y administrado por el MSP, con interfaz de carga | Catálogo global con formulario, foto y carga CSV; 28 plantas de muestra | HU-043 |
| Plantas filtradas por altitud; otra altitud solo advierte | Filtro por la altitud del huerto y diálogo «¿Estás seguro?» | HU-042 |
| Solo plantas medicinales; «Solicitar añadir planta» con toda su información | Confirmación obligatoria de que es medicinal; el MSP aprueba o rechaza | HU-043 |
| Actividades registradas después de hacerlas, en secuencia; el sistema muestra el paso N+1 con indicaciones de los lineamientos | 13 pasos de los lineamientos MSP 2017 con «cuándo» y «cómo»; fechas futuras rechazadas | HU-044, HU-052 |
| Un paso saltado no se puede impedir: queda no cumplido con 0 puntos | «No lo hicimos» marca el paso como no cumplido | HU-046 |
| Ciclos por tipo de planta; las del mismo tipo se siembran y cosechan juntas | Un ciclo activo por planta | HU-044 |
| Puntos por hora trabajada, sin importar el tipo; el responsable registra quién y cuántas horas | 10 puntos por hora y voluntario | HU-044, HU-045 |
| Los puntos se otorgan cuando el MSP valida la evidencia (fotos y videos reales, sin IA, del huerto correcto) | Bandeja de evidencias; aprobar acredita los puntos | HU-045 |
| Evidencia inválida: segunda oportunidad con menos puntos; si falla otra vez, sin puntos pero el huerto sigue | Segundo intento al 50 %; tercer intento bloqueado | HU-045 |
| Ascenso automático según reglas nuestras | Niveles automáticos que nunca bajan | HU-047 |
| Sin expulsiones; una cosecha dañada se justifica con una lista de causas y empieza otro ciclo | Ciclo fallido con causa y justificación | HU-046 |
| Varios rankings por tipo de huerto, normalizados por voluntarios | Ranking por tipo con índice normalizado | HU-048 |
| El financiamiento depende de la producción (paquetes, histórico anual) | Ranking de producción y estadísticas por año | HU-048, HU-049 |
| Validaciones mínimas (no más de 24 horas por día); principio de confianza | Tope de 24 h por voluntario y día sumando todos sus huertos | HU-044 |
| Invitado: un huerto específico o estadísticas, por ejemplo huertos por provincia | Mapa, ficha pública y estadísticas | HU-049 |
| Administrador técnico: respaldos, base de datos y soporte | Panel de estado, respaldo con `pg_dump` y cuentas de técnicos | HU-051 |
| v1: que la gente cree su huerto, siembre sus primeras plantas y aprenda el saber ancestral; foro y espejo pueden ser simples | Todo eso, y además foro moderado, espejo digital, cosecha y postcosecha | — |

## Pendientes que nos tocaban: propuesta del equipo

Están en `packages/shared/src/gamificacion.ts` y `catalogos.ts`, con pruebas, y se explican al público en «Cómo funcionan los puntos».

### Fórmula del ranking

**Índice = puntos validados de los últimos 12 meses ÷ √(voluntarios activos + 1)**

- Dividir solo entre los voluntarios favorecería a los huertos de una persona; no dividir favorecería a los grupos grandes. La raíz cuadrada equilibra ambos.
- Ejemplo: 300 puntos con 8 voluntarios y 100 puntos con 0 voluntarios dan el mismo índice, 100.
- Empate: gana quien llegó primero a su puntaje.
- Se publica aparte el ranking de producción (paquetes del año), base del financiamiento.

### Requisitos de nivel

| Nivel | Horas validadas | Tipos de actividad distintos | Ciclos completos |
|---|---|---|---|
| Aprendiz | 0 | 0 | 0 |
| Oficial | 40 | 4 | 0 |
| Maestro | 150 | 8 | 1 (hasta el empaquetado) |

Además, un talento se certifica con 3 participaciones validadas en su grupo de actividades (preparación, rituales, siembra, cuidado y riego, cosecha, secado y empaquetado).

### Puntos

- 10 puntos por hora y voluntario; +10 % si la actividad siguió el calendario lunar y los horarios de los saberes.
- Factor por intento de evidencia: 100 % el primero, 50 % el segundo, 0 después.

### Causas de fracaso de una cosecha

Helada · Sequía o falta de agua · Exceso de lluvia o inundación · Plaga · Enfermedad de la planta · Daño por animales · Descuido · Robo o daño de terceros · Otra causa (con justificación).

## Fuera de alcance

- Procesos manuales del MSP fuera del sistema (la llamada al solicitante).
- Detección automática de imágenes hechas con inteligencia artificial: la valida el técnico a mano.
- Catálogo completo de parroquias del INEC: se usan las cabeceras provinciales y algunas parroquias de ejemplo.
