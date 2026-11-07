---
name: Nexo
description: App cálida para huertos medicinales comunitarios, guiada por la luna y los saberes andinos.
colors:
  primary-50: "#eaf4ee"
  primary-100: "#d3e9db"
  primary-600: "#1f7a4d"
  primary-700: "#186340"
  primary-800: "#134d32"
  tierra-50: "#fbf6ee"
  tierra-100: "#f4ebdd"
  tierra-300: "#e2d3bd"
  luna-600: "#5b5348"
  luna-800: "#2a241d"
  aviso-100: "#fdf0d5"
  aviso-800: "#7a3b0c"
  error-100: "#fde4e1"
  error-800: "#9b1c1c"
  exito-100: "#dcf3e4"
  exito-800: "#14532d"
  info-100: "#e4eefb"
  info-800: "#1e3a8a"
  caliente: "#b42318"
  oro: "#c98a12"
typography:
  display:
    fontFamily: "'Nunito Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.11
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Nunito Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Nunito Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Nunito Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "'Nunito Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
  caption:
    fontFamily: "'Nunito Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
rounded:
  casilla: "0.375rem"
  campo: "0.75rem"
  boton: "1rem"
  tarjeta: "1.25rem"
  barra: "1.5rem"
  full: "9999px"
spacing:
  xs: "0.375rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary-600}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.boton}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-700}"
  button-primary-disabled:
    backgroundColor: "{colors.tierra-300}"
    textColor: "{colors.luna-600}"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.luna-800}"
    typography: "{typography.label}"
    rounded: "{rounded.boton}"
    padding: "0 24px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.tierra-100}"
  button-text:
    textColor: "{colors.primary-700}"
    typography: "{typography.label}"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.luna-800}"
    rounded: "{rounded.campo}"
    padding: "8px 16px"
    height: "48px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.tarjeta}"
    padding: "20px"
  chip-cualidad:
    backgroundColor: "{colors.tierra-100}"
    textColor: "{colors.luna-800}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  nav-item-active:
    backgroundColor: "{colors.primary-50}"
    textColor: "{colors.primary-700}"
    rounded: "{rounded.boton}"
  nav-item-action:
    backgroundColor: "{colors.primary-600}"
    textColor: "#ffffff"
    rounded: "{rounded.boton}"
  option-card-selected:
    backgroundColor: "{colors.primary-50}"
    rounded: "{rounded.boton}"
    padding: "16px"
  toast:
    backgroundColor: "{colors.luna-800}"
    textColor: "#ffffff"
    rounded: "{rounded.boton}"
    padding: "12px 20px"
---

# Design System: Nexo

## Overview

**Creative North Star: "La chakra en la palma de la mano"**

Nexo es una app de consumo cálida para usar en el huerto, con el teléfono en una mano y a pleno sol. El suelo de cada pantalla es un fondo de tierra clara teñida (`tierra-50`), sobre el que descansan tarjetas blancas de esquinas suaves. La tinta es café oscuro cálido (`luna-800`), nunca un gris pizarra frío. Todo el sistema gira en torno a una sola decisión: el único color saturado de la pantalla es algo que se puede presionar.

La densidad es baja y generosa: textos de cuerpo a 17 px, objetivos táctiles de 48 px, una columna de tarjetas separadas por 24 px. La jerarquía la da el peso de una sola familia redondeada (Nunito), no el cambio de tipografía. Los iconos son de línea (Lucide) y siempre acompañan una etiqueta en español sencillo. Lo que se toca responde con un resorte suave al presionar, y la firma del sistema es el **brotar**: la planta salta a su nueva etapa en el huerto virtual después de registrar una actividad.

El sistema rechaza explícitamente la plantilla de jardinería con cabecera verde e icono de hoja, y el tablero de tarjetas de estadísticas. Los avisos no llevan franja lateral de acento.

**Key Characteristics:**
- Fondo de tierra teñida, tarjetas blancas de 20 px de radio con sombra ambiental cálida.
- Un solo color de acción (verde chakra), reservado para lo presionable y su estado activo.
- Tinta y secundario cálidos; ningún gris frío.
- Una familia tipográfica (Nunito Variable); jerarquía por peso 400 / 700 / 800 / 900.
- Iconos Lucide de línea con un solo trazo de 2.25 (regla `svg.lucide` en `styles.css`), siempre con texto; el color nunca es la única señal.
- Resorte al presionar y la animación «brotar» como firma.

## Colors

Una paleta de tierra y café cálido con un único verde saturado que señala lo que se puede tocar.

### Primary
- **Verde chakra** (`primary-600`): fondo del botón primario, del destino «Registrar» en la navegación, borde de la opción elegida, casillas y radios marcados, cursor y `accent-color`. Contraste con blanco 5.4:1.
- **Verde chakra hondo** (`primary-700`): hover del botón primario; texto de enlaces y botones de texto; icono y texto del destino activo.
- **Verde raíz** (`primary-800`): campo del logotipo de Nexo. Es identidad de marca, no acción; no se usa en la interfaz fuera del logo.
- **Brote claro** (`primary-50`): fondo del destino activo en la navegación y de la opción elegida en un grupo de tarjetas.
- **Brote** (`primary-100`): resaltado de selección de texto (`::selection`).

### Secondary
- **Oro de foco** (`oro`): exclusivo para el anillo de foco visible (3 px, separado 2 px). No decora nada más.

### Tertiary
- **Ají** (`caliente`): solo el icono de sol de la cualidad «Caliente» de una planta.

### Neutral
- **Tierra clara** (`tierra-50`): fondo de toda la app y de la ficha de usuario en el menú lateral.
- **Tierra** (`tierra-100`): superficies hundidas dentro de una tarjeta (nota de fase lunar, chips), pista de la barra de progreso, esqueletos de carga, hover de botones secundarios y del menú, fondo de campos deshabilitados.
- **Arcilla** (`tierra-300`): borde de campos en reposo, borde del menú lateral, fondo del botón primario deshabilitado, barra de desplazamiento.
- **Tinta secundaria** (`luna-600`): texto de apoyo, ayudas de campo, placeholders, iconos neutros, destinos inactivos, borde de campos en hover y de casillas. Contraste sobre el fondo 7.2:1.
- **Tinta cálida** (`luna-800`): texto principal, borde del botón secundario, relleno de la barra de progreso, fondo del toast, sombra de la luna. Contraste sobre el fondo 14:1.

### Estados
Cada estado es un par fondo claro / texto oscuro y siempre lleva icono y texto: **éxito** (`exito-100` / `exito-800`), **aviso** (`aviso-100` / `aviso-800`), **error** (`error-100` / `error-800`, también borde de campos inválidos), **información** (`info-100` / `info-800`; `info-800` también colorea el copo de la cualidad «Fría»).

### Named Rules
**The Lo Que Se Toca Rule.** El verde chakra saturado (`primary-600` / `primary-700`) aparece solo en elementos presionables: botones, enlaces, destinos de navegación, opciones y casillas. Una barra de progreso, un número o un título nunca son verdes; el progreso se pinta en tinta cálida.

**The Tierra Cálida Rule.** Todo neutro sale de la familia `tierra` / `luna`. Ningún gris frío (slate, zinc, gray), ni en texto ni en bordes ni en sombras; las sombras se tiñen con la tinta `rgb(42 36 29 / …)`.

**The Oro Es Foco Rule.** El oro marca dónde está el foco del teclado y nada más.

## Typography

**Display Font:** Nunito Variable (con Segoe UI, system-ui, sans-serif)
**Body Font:** Nunito Variable (con Segoe UI, system-ui, sans-serif)

**Character:** Una humanista redondeada, amable y muy legible al sol; el mismo trazo sirve para el saludo grande y para la etiqueta de un formulario largo.

### Hierarchy
- **Display** (800, 1.875rem en móvil → 2.25rem desde 640 px, interlineado ajustado, tracking -0.025em, `text-balance`): título de cada pantalla («Hola, Ana», «Huerto virtual», «Registrar actividad»).
- **Headline** (800, 1.5rem → 1.875rem): la fase de la luna en la tarjeta «Hoy» de Inicio.
- **Title** (800, 1.25rem): títulos de tarjeta, leyendas de fieldset, título de diálogo y de estado vacío. El título de «Saberes de nuestros mayores» baja a 1.125rem.
- **Body** (400, 1.0625rem, interlineado 1.625): todo el texto corrido; la recomendación lunar sube a 1.125rem. Párrafos de estado vacío limitados a `max-w-prose`.
- **Label** (700, 1rem): texto de botones y campos. Las etiquetas de campo, nombres de planta y la ficha de usuario usan el tamaño de cuerpo en 700.
- **Caption** (400–700, 0.875rem): ayudas de campo, mensajes de error (600), chips (700), etapa de cada planta. Las etiquetas de la barra inferior bajan a 0.75rem en 700.
- **Marca** (900, 1.5rem, tracking -0.025em): solo la palabra «Nexo» junto al logo.

### Named Rules
**The Una Familia Rule.** Una sola familia; la jerarquía la hacen el peso (400 / 700 / 800 / 900) y el tamaño. Sin versalitas, sin mayúsculas sostenidas, sin rótulos sobre los títulos.

**The Número Tabular Rule.** Puntos y porcentajes usan cifras tabulares para que no bailen al cambiar.

## Layout

Una columna centrada de hasta 48rem (`max-w-3xl`) con 16 px de margen lateral en móvil y 40 px desde 768 px. Las secciones de una pantalla se apilan con 24 px de separación; dentro de una tarjeta los bloques usan 16–20 px y los grupos de controles 12 px.

**Móvil (< 768 px):** cabecera con la marca a la izquierda y los puntos a la derecha; barra inferior flotante de cuatro destinos, separada 12 px de los bordes y respetando el área segura; el contenido deja 128 px abajo para no quedar bajo la barra. «Cerrar sesión» vive al final de Inicio, lejos del pulgar.

**Escritorio (≥ 768 px):** menú lateral fijo de 288 px, blanco, con borde de arcilla; la marca arriba, los destinos con «Registrar» primero en verde, y la ficha del usuario con puntos y «Cerrar sesión» al pie.

**Rejillas:** opciones de actividad en 2 columnas; tarjetas de planta en 2 columnas y 4 desde 1024 px; campos pareados en 2 columnas desde 640 px. Los grupos de acciones se apilan en móvil (la acción principal arriba) y se alinean a la derecha en escritorio.

**Objetivos táctiles:** mínimo 44 px; botones, campos y destinos laterales 48 px; destinos de la barra inferior 56 px.

## Elevation & Depth

Profundidad ambiental y suave: las tarjetas flotan apenas sobre la tierra con una sombra doble teñida de tinta cálida. Las superficies hundidas dentro de una tarjeta no usan sombra sino el tono `tierra-100`. Solo lo que flota sobre el contenido (barra inferior, toast, diálogo) sube a sombras más amplias.

### Shadow Vocabulary
- **Tarjeta** (`box-shadow: 0 1px 2px rgb(42 36 29 / 0.05), 0 6px 16px -4px rgb(42 36 29 / 0.08)`): toda tarjeta, tarjeta de planta y estado vacío.
- **Tarjeta presionable en hover** (`box-shadow: 0 10px 24px -6px rgb(42 36 29 / 0.18)`): la tarjeta enlace «Tu huerto virtual».
- **Flotante** (`shadow-flotante`: `0 12px 36px -8px rgb(42 36 29 / 0.3)`): barra inferior, toast y diálogo, todos con la misma sombra cálida. El fondo del diálogo es tinta al 45 % (`rgb(42 36 29 / 0.45)`).

### Named Rules
**The Sombra Cálida Rule.** Toda sombra propia se tiñe con la tinta `rgb(42 36 29)`; nunca negro puro ni sombras duras desplazadas.

## Shapes

Esquinas suaves y escalonadas según el tamaño del objeto: casillas 6 px, campos 12 px, botones, avisos, opciones y toast 16 px, tarjetas y diálogo 20 px, barra inferior 24 px; chips, barra de progreso y radios en píldora o círculo. Los bordes son de 2 px cuando delimitan algo que se toca (campos, botón secundario, opciones, casillas) y de 1 px solo en la separación del menú lateral. El logo es un cuadro redondeado verde raíz con un brote de dos hojas sobre una línea de tierra; los dibujos de etapa son círculos de 120 px con la planta sobre un montículo de tierra.

## Components

### Buttons
Táctiles y francos: grandes, en negrita, con resorte al presionar.
- **Shape:** esquinas suaves (16 px), alto mínimo 48 px, 24 px de relleno lateral, icono y texto separados 8 px.
- **Primary:** verde chakra con texto blanco y sombra mínima; hover a verde chakra hondo. Deshabilitado en arcilla con tinta secundaria y sin sombra. Mientras guarda, muestra «Guardando…» y `aria-busy`.
- **Secondary:** blanco con borde de 2 px en tinta cálida y texto en tinta; hover a tierra.
- **Text:** texto verde hondo subrayado (2 px) en negrita; el subrayado pasa a verde chakra en hover.
- **Press:** escala a 0.97 en 160 ms con `cubic-bezier(0.16, 1, 0.3, 1)` (clase `presionable`), solo en elementos que se pueden tocar.

### Chips
- **Style:** píldora en tierra, texto de tinta a 0.875rem en 700, icono de 16 px a la izquierda.
- **Cualidad:** sol en ají para «Caliente», copo en azul de información para «Fría». La palabra siempre acompaña al icono.

### Cards / Containers
- **Corner Style:** 20 px (`rounded.tarjeta`).
- **Background:** blanco sobre tierra clara.
- **Shadow Strategy:** sombra «Tarjeta» (ver Elevation & Depth).
- **Border:** ninguno.
- **Internal Padding:** 20 px en móvil, 24 px desde 640 px.
- **Notas internas:** bloques hundidos en tierra con 16 px de radio y 16 px de relleno (nota de la fase lunar).

### Inputs / Fields
- **Style:** blanco, borde de 2 px en arcilla, 12 px de radio, 48 px de alto, texto de 1rem en tinta. Etiqueta en negrita encima; ayuda en tinta secundaria a 0.875rem entre etiqueta y campo.
- **Hover / Focus:** el borde pasa a tinta secundaria en hover y a verde chakra con foco; con teclado se suma el anillo de oro.
- **Error:** borde en `error-800` y mensaje debajo con icono de alerta; un resumen de errores al inicio del formulario recibe el foco.
- **Disabled:** fondo tierra, texto en tinta secundaria.
- **Casillas y radios:** 24 px, borde de 2 px en tinta secundaria, marcados en verde chakra con palomita blanca o punto central.
- **Selector:** igual al campo, con chevron de 20 px en tinta secundaria a la derecha.

### Navigation
- **Barra inferior (móvil):** blanca, 24 px de radio, flotante; cuatro destinos (Inicio, Mi huerto, Registrar, Huerto virtual) con icono de 24 px sobre etiqueta de 0.75rem en negrita. «Registrar» va en el tercer lugar relleno de verde chakra; el destino activo usa brote claro con texto verde hondo; los inactivos van en tinta secundaria.
- **Menú lateral (escritorio):** mismos destinos en filas de 48 px con icono de 20 px; hover a tierra con tinta cálida.
- **Saltar al contenido:** enlace oculto que aparece con el foco.

### Avisos (Banner)
Bloque de 16 px de radio y 16 px de relleno, fondo claro del estado con texto oscuro del mismo estado e icono de 20 px a la izquierda. Sin borde ni franja lateral. El error se anuncia con `role="alert"`, el resto con `role="status"`.

### Opción de actividad
Tarjeta-radio de 16 px de radio con borde de 2 px en arcilla, icono de 32 px, nombre en negrita y ayuda en caption. Elegida: borde verde chakra, fondo brote claro e icono verde hondo; el foco del radio interno se muestra en la tarjeta entera con el anillo de oro.

### Diálogo de confirmación
`<dialog>` nativo blanco de 20 px de radio, máximo 32rem, con un círculo de aviso (40 px) y el título; las acciones se apilan en móvil. Es el patrón de «guardar de todos modos»: advierte sin bloquear.

### Toast de logro
Bloque de 16 px de radio en tinta cálida con texto blanco en negrita y un brote, arriba al centro, durante 6 s (`aria-live="polite"`); entra con «aparecer» (260 ms, desde 8 px arriba).

### Brotar (firma)
Tarjeta de planta en el huerto virtual: dibujo de etapa cuadrado (máximo 144 px), nombre en negrita y «Etapa n: nombre» en caption. Tras registrar una actividad, la planta trabajada muestra 600 ms el dibujo de su etapa anterior y luego el de la nueva brota: `translateY(6px) scale(0.9)` → `translateY(-3px) scale(1.06)` al 55 % → reposo, en 520 ms con `cubic-bezier(0.16, 1, 0.3, 1)`. Ocurre una sola vez y respeta `prefers-reduced-motion`.

### Luna
Dibujo propio de la fase lunar tal como se ve en la línea ecuatorial: creciente y menguante como «bote» iluminado abajo o arriba, no de lado. Luz `#F4E3B5`, cráteres `#E7CF92`, sombra en tinta cálida. 96 px en la tarjeta «Hoy», 40 px en la nota del formulario.

## Do's and Don'ts

### Do:
- **Do** reservar `primary-600` / `primary-700` para lo que se puede presionar y su estado activo o elegido.
- **Do** pintar el progreso, los números y los títulos en tinta cálida (`luna-800`).
- **Do** acompañar cada estado, cualidad o destino con icono y texto; el color nunca va solo.
- **Do** usar tarjetas blancas de 20 px con la sombra «Tarjeta» sobre el fondo `tierra-50`, y `tierra-100` para lo hundido dentro de ellas.
- **Do** mantener objetivos táctiles de al menos 44 px (48 px en botones y campos).
- **Do** dar el resorte `presionable` (escala 0.97) solo a elementos que se tocan.
- **Do** advertir con el diálogo «guardar de todos modos» en vez de bloquear cuando la luna no acompaña.

### Don't:
- **Don't** usar el verde de acción en elementos que no se tocan: barras de progreso, cifras, encabezados o cabeceras de color.
- **Don't** introducir grises fríos (slate `#1F2937` y similares) ni sombras en negro puro.
- **Don't** usar el oro para algo distinto del anillo de foco.
- **Don't** poner franjas laterales de acento en avisos o diálogos.
- **Don't** colocar rótulos en mayúsculas sobre los títulos ni usar una segunda familia tipográfica.
- **Don't** armar tableros de tarjetas de estadísticas ni la cabecera verde con icono de hoja.
