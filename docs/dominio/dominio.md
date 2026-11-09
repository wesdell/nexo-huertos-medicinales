# Estudio del dominio: huertos medicinales

Este documento resume lo que el equipo aprendió sobre los huertos medicinales antes de construir Nexo, y cómo ese conocimiento se refleja en la aplicación. Responde al punto 3 de la asignación de la versión 1: estudiar los lineamientos del MSP e investigar información complementaria con apoyo de IA.

## Fuentes

1. Ministerio de Salud Pública del Ecuador, *Implementación de huertos medicinales en los establecimientos de salud del primer nivel de atención. Lineamientos*, 1.ª ed., Quito: Dirección Nacional de Salud Intercultural, 2017 (85 páginas).
2. Definición del proyecto «Huertos medicinales comunitarios», ISWD652 Calidad de Software, período 2026B.
3. Taller en clase con el cliente (preguntas del equipo sobre el alcance).
4. Investigación complementaria con IA generativa (Claude, de Anthropic): resúmenes de los lineamientos, cálculo de fases lunares y buenas prácticas de accesibilidad. El equipo contrastó cada dato con las fuentes 1 y 2 antes de usarlo.

## Qué dicen los lineamientos

Los lineamientos buscan un diálogo entre la medicina ancestral de los pueblos y nacionalidades y la medicina de los establecimientos de salud. El huerto es un trabajo de la comunidad, no solo del personal de salud, y se organiza en cuatro fases.

| Fase | Contenido principal |
| --- | --- |
| I. Planificación | Comité local, espacio físico, tipo de suelo y piso climático, espacio para bodega y para secado, asamblea de socialización y reparto de roles. |
| II. Preparatoria | Cercas de seguridad, abono natural, diseño del huerto, preparación de la tierra y selección de las plantas más usadas en el lugar. |
| III. Implementación | Técnicas y tipos de siembra, rituales, tiempos según la luna, señalética, cuidados, cosecha, limpieza, secado, etiquetado, caducidad, empacado y almacenaje. |
| IV. Abastecimiento y uso | Entrega de plantas frescas o secas, indicación por el personal de salud y réplica de la experiencia. |

### Reglas que tomamos de los lineamientos

- **Todo el trabajo de la tierra sigue las fases de la luna.** La preparación, el abonado, la siembra, los cuidados y la cosecha tienen su fase recomendada.
- **Preparación de la tierra:** se retira la maleza en un día soleado y en luna oscura (nueva), se esparce desmenuzada en vez de quemarla y se dejan 15 días para que se convierta en abono.
- **Siembra:** en cuarto creciente o luna llena, después del ritual a la salida del sol. Las técnicas son surcos, andenes o terrazas y camellones; los tipos, por semillas, estacas, esquejes o plántulas.
- **Señalética:** cada planta lleva nombre en idioma local, nombre común, nombre científico, familia, uso y un color: rojo si es caliente; verde o blanco si es fría o fresca.
- **Cuidados:** deshierbe, replante y aporque. No se fumiga con ningún producto.
- **Cosecha:** después del ritual de gratitud, cuando el sol ha secado el rocío. Hojas, flores y frutos en creciente o llena; semillas y raíces en menguante. Las plantas de ciclo corto están listas en unas 6 a 8 semanas.
- **Baño:** riego uno o dos días antes de la cosecha para limpiar las plantas.
- **Secado:** a la sombra. Las hojas, flores y raíces se secan sobre papel periódico y las plantas completas se cuelgan boca abajo.
- **Empacado y caducidad:** fundas herméticas de 100 gramos, en un lugar fresco y seco. Duran 12 meses en la Sierra y 6 meses en la Costa y la Amazonía.
- **Cercas:** viva, con material natural, con material reciclado, con material metálico o con material de construcción convencional.
- **Bodega:** debe ser segura, seca y con luz natural, para herramientas, semillas, abonos y plantas empacadas.

## Cómo se refleja en Nexo v1

| Lineamiento | En la aplicación | Dónde |
| --- | --- | --- |
| Cada actividad tiene su fase lunar | La app calcula la fase de cualquier fecha sin internet y en Inicio muestra qué conviene hacer hoy | `packages/shared/src/lunar.ts` (HU-017) |
| Preparar la tierra en luna oscura | Si se registra en otra fase, la app advierte y pide confirmar; si se sigue la recomendación, suma un bono de puntos | `actividades.ts`, `puntos` (HU-018, HU-030) |
| Pasos de la preparación (retirar maleza, esparcirla, remover) | El formulario pide confirmar cada paso | HU-018 |
| Sembrar en creciente o llena, con técnica y tipo de siembra | Advertencia fuera de fase; técnica y tipo son obligatorios | HU-021 |
| Riego con regadera o manguera, no con aspersor | El aspersor no está entre las opciones y la app lo rechaza | HU-023 |
| Cosecha según la parte de la planta y después del rocío | Advertencia si se cosechan raíces en luna llena o si la hora es antes de las 8:00 | HU-025 |
| Plantas calientes y frías, de ciclo corto o largo | Cada planta registra su cualidad y su ciclo | HU-014 |
| Del huerto real al huerto virtual | Cada actividad hace avanzar el dibujo de la planta: tierra preparada, sembrada, en cuidado, cosechada; secado y empaquetado ya están dibujados para v2 | `huerto-virtual.ts` (HU-016) |
| Consejos ancestrales | Textos de ayuda sobre la orientación del huerto, las cercas vivas y la hora de cosechar | `consejos.ts` |
| El huerto es de la comunidad | Toda la información se organiza por comunidad, y quien la crea queda como responsable | HU-004 |

## Lo que queda para las siguientes versiones

Los lineamientos cubren más de lo que entra en la versión 1. Lo siguiente está planificado en la [bitácora](../bitacora.md):

- **v2:** diseño, cerca, suelo, agua y abono del huerto; rituales, señalética, cuidados, baño, limpieza, secado y empaquetado como actividades; calendario lunar del mes; fotos de las plantas.
- **v3:** bodega y almacenaje con su caducidad (6 o 12 meses según la región), historia visual de las plantas y foro para compartir saberes.

## Decisiones que tomamos al estudiar el dominio

- **Advertir en lugar de prohibir.** Los lineamientos recomiendan, pero cada comunidad tiene su realidad. Por eso, hacer una actividad fuera de la fase recomendada no se bloquea: la app advierte, la persona confirma y solo pierde el bono.
- **Fase lunar calculada en la app.** El huerto puede estar en un lugar sin buena señal, así que la fase lunar no depende de un servicio externo.
- **Respeto por la diversidad cultural.** Los lineamientos piden investigar en cada territorio los nombres y colores de la señalética. En v1 solo se usan los colores del mundo kichwa andino (rojo para caliente; verde o blanco para fresco), y los textos se escriben en un lenguaje sencillo.
- **Prácticas que la app no registra.** Los lineamientos incluyen indicaciones sobre quién puede trabajar en el huerto. La app no registra ese tipo de información personal, en línea con la protección de datos (HU-036).
