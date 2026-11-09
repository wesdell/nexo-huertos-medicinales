# Historias de usuario

## Resumen de módulos

| Módulo | Historias |
| --- | --- |
| 1. Registro | HU-001 a HU-003 |
| 2. Comunidades | HU-004 a HU-009 |
| 3. Huerto | HU-010 a HU-016 |
| 4. Actividades | HU-017 a HU-029 |
| 5. Puntos | HU-030 a HU-035 |
| 6. Protección de datos | HU-036 |
| 7. Modelo acordado con el MSP | HU-037 a HU-052 |

## Estado en v2.0.0

La reunión con el MSP del 06/11/2026 cambió el modelo de cuentas. Las historias de v1 que suponían que cada voluntario tiene cuenta quedan **reemplazadas** por las del módulo 7; el resto está implementado.

| HU | Estado en v2.0.0 |
| --- | --- |
| HU-001, HU-004 | Reemplazadas por HU-037 (solicitud) y HU-038 (aprobación): ya no hay auto-registro ni comunidades libres |
| HU-002 | Implementada: ingreso de responsables, técnicos y administradores; cierre de sesión |
| HU-003, HU-005 | Reemplazadas por HU-050: los datos de contacto los mantiene el MSP en el registro centralizado |
| HU-006, HU-007 | Reemplazadas por HU-040 (voluntarios sin cuenta) y HU-049 (ficha pública) |
| HU-008, HU-009 | Implementadas: foro público con categorías, respuestas, reglas, reportes y moderación del técnico del MSP |
| HU-010 a HU-013 | Implementadas: georreferenciación en mapa (HU-037), subtipos, cerca, área, suelo, agua y abono |
| HU-014 | Reemplazada por HU-042 y HU-043: catálogo global del MSP |
| HU-015 | Implementada: bodega con herramientas, material de siembra y abonos |
| HU-016 | Implementada: huerto virtual por ciclo (espejo digital) |
| HU-017 | Implementada, con calendario lunar mensual (HU-052) |
| HU-018 a HU-027 | Implementadas como los 13 pasos secuenciales de HU-044 |
| HU-028 | Implementada: evidencia obligatoria (HU-044) e historia visual pública |
| HU-029 | Implementada como la línea de tiempo de cada ciclo |
| HU-030 | Reemplazada por HU-045: puntos por hora validada |
| HU-031, HU-032 | Implementadas: 10 misiones con su insignia |
| HU-033 | Reemplazada por HU-047 (niveles automáticos) y HU-041 (nivel por experiencia); talentos certificados por participaciones |
| HU-034 | Implementada en «Misiones y puntos» y en la ficha de cada voluntario |
| HU-035 | Reemplazada por HU-048: ranking por tipo normalizado |
| HU-036 | Implementada: el consentimiento se acepta al solicitar el huerto |
| HU-037 a HU-052 | Implementadas en v2.0.0 |

## 1. REGISTRO

### HU-001 · Registrar cuenta de voluntario

**Prioridad:** Alta · **Estimación:** 15 horas

**Historia de usuario**

> **Como** persona interesada en participar en huertos medicinales comunitarios **quiero** registrarme ingresando mi nombre, correo, contraseña, fecha de nacimiento y género, **para** tener una cuenta de voluntario y poder integrarme a una comunidad de siembra.

**Criterios de aceptación**

- **Registro exitoso:** **Dada** una persona sin cuenta, **cuando** completa nombre, correo con formato válido, contraseña válida, fecha de nacimiento y género y confirma el registro, **entonces** el sistema crea la cuenta y muestra un mensaje de confirmación. *[ESCENARIO IDEAL]*
- **Datos obligatorios incompletos:** **Dada** una persona en el formulario de registro, **cuando** deja vacío el nombre, el correo, la contraseña, la fecha de nacimiento o el género y confirma, **entonces** el sistema no crea la cuenta e indica qué campos faltan. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Correo inválido:** **Dada** una persona en el formulario, **cuando** ingresa un correo con formato inválido, **entonces** el sistema no crea la cuenta e indica el formato esperado. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Correo ya registrado:** **Dada** una persona que ingresa un correo que ya tiene una cuenta, **cuando** confirma el registro, **entonces** el sistema no crea la cuenta e informa que ese correo ya está registrado. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Contraseña inválida:** **Dada** una persona que ingresa una contraseña de menos de 8 caracteres, **cuando** confirma el registro, **entonces** el sistema no crea la cuenta e indica la longitud mínima. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Fecha de nacimiento inválida:** **Dada** una persona en el formulario, **cuando** ingresa una fecha de nacimiento futura o con formato inválido, **entonces** el sistema rechaza el dato y muestra el formato esperado.

**Tareas de implementación**

- Diseñar el modelo de datos del voluntario: nombre, correo, contraseña cifrada, fecha de nacimiento y género (1 hora)
- Diseñar la interfaz del formulario de registro (1 hora)
- Implementar el formulario con campos de nombre, correo, contraseña, selector de fecha y selector de género (2 horas)
- Codificar el método que crea la cuenta y guarda al voluntario en la base de datos (2 horas)
- Codificar el cifrado de la contraseña antes de guardarla (1 hora)
- Codificar la validación de campos obligatorios, con un mensaje que indique cuáles faltan (1 hora)
- Codificar la validación del formato del correo y de que no esté repetido (1,5 horas)
- Codificar la validación de la contraseña: mínimo de 8 caracteres (1 hora)
- Codificar la validación de la fecha de nacimiento: formato correcto y no futura (1 hora)
- Codificar el mensaje de confirmación del registro exitoso (0,5 horas)
- Probar con datos válidos, campos vacíos, correo inválido o repetido, contraseña corta y fechas inválidas (2 horas)
- Depurar el código (1 hora)

### HU-002 · Iniciar y cerrar sesión

**Prioridad:** Alta · **Estimación:** 12 horas

**Historia de usuario**

> **Como** voluntario registrado **quiero** iniciar y cerrar sesión con mis credenciales, **para** acceder de forma segura a mi comunidad, mi huerto y mi progreso.

**Criterios de aceptación**

- **Inicio de sesión exitoso:** **Dado** un voluntario con cuenta registrada, **cuando** ingresa sus credenciales correctas como el correo y contraseña, **entonces** el sistema abre su sesión y lo lleva a la pantalla principal. *[ESCENARIO IDEAL]*
- **Cierre de sesión:** **Dado** un voluntario con sesión activa, **cuando** selecciona cerrar sesión, **entonces** el sistema termina la sesión y vuelve a la pantalla de inicio de sesión. *[ESCENARIO IDEAL]*
- **Credenciales incorrectas:** **Dado** un voluntario en la pantalla de inicio de sesión, **cuando** ingresa credenciales que no coinciden con ninguna cuenta, **entonces** el sistema no abre la sesión y muestra un mensaje de error sin indicar cuál dato falló. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Campos vacíos:** **Dado** un voluntario en la pantalla de inicio de sesión, **cuando** deja vacío algún campo y confirma, **entonces** el sistema indica qué campo falta. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Acceso sin sesión:** **Dada** una persona sin sesión activa, **cuando** intenta abrir una pantalla que requiere cuenta, **entonces** el sistema la redirige al inicio de sesión. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar la interfaz de inicio de sesión (1 hora)
- Implementar el formulario con los campos de correo y contraseña (1,5 horas)
- Codificar el método que verifica las credenciales contra la cuenta registrada (2 horas)
- Codificar la creación de la sesión y la redirección a la pantalla principal (2 horas)
- Codificar la validación de campos vacíos (1 hora)
- Codificar el mensaje de error genérico para credenciales incorrectas (1 hora)
- Codificar el cierre de sesión (1,5 horas)
- Codificar la restricción de acceso a pantallas protegidas sin sesión (1 hora)
- Probar con credenciales válidas, inválidas, campos vacíos y acceso sin sesión (1 hora)

### HU-003 · Actualizar datos personales del voluntario

**Prioridad:** Media · **Estimación:** 8 horas

**Historia de usuario**

> **Como** voluntario registrado **quiero** actualizar mi nombre, fecha de nacimiento y género, **para** mantener mi información personal correcta.

**Criterios de aceptación**

- **Actualización exitosa:** **Dado** un voluntario con sesión activa, **cuando** modifica sus datos personales con valores válidos y guarda, **entonces** el sistema guarda los cambios y los muestra actualizados en su perfil. *[ESCENARIO IDEAL]*
- **Datos inválidos:** **Dado** un voluntario editando su perfil, **cuando** guarda con un campo obligatorio vacío o una fecha inválida, **entonces** el sistema no guarda los cambios e indica el error. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Campos gestionados por el sistema:** **Dado** un voluntario editando su perfil, **cuando** intenta modificar su nivel de experiencia o sus talentos certificados, **entonces** el sistema no ofrece esos campos como editables, porque se actualizan por el progreso (ver HU-033). *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar la pantalla de perfil con campos editables y campos de solo lectura (1 hora)
- Implementar la interfaz de edición precargada con los datos actuales del voluntario (1,5 horas)
- Codificar el método que actualiza nombre, fecha de nacimiento y género (1,5 horas)
- Codificar las validaciones de campos obligatorios y de fecha de nacimiento (1 hora)
- Marcar el nivel de experiencia y los talentos certificados como solo lectura en la interfaz y en el servicio (1 hora)
- Probar edición válida, edición inválida e intento de modificar campos de solo lectura (1,5 horas)
- Depurar el código (0,5 horas)

## 2. COMUNIDADES

### HU-004 · Registrar comunidad de siembra

**Prioridad:** Alta · **Estimación:** 12 horas

**Historia de usuario**

> **Como** voluntario **quiero** registrar una comunidad de siembra con su nombre y los datos de contacto del responsable, **para** participar en el proyecto de huertos medicinales como comunidad (una persona, familia, condominio o barrio).

**Criterios de aceptación**

- **Registro exitoso:** **Dado** un voluntario con sesión activa, **cuando** ingresa el nombre de la comunidad y la información de contacto del responsable y confirma, **entonces** el sistema crea la comunidad y la muestra con su información. *[ESCENARIO IDEAL]*
- **Datos obligatorios incompletos:** **Dado** un voluntario en el formulario de comunidad, **cuando** deja vacío el nombre o los datos de contacto y confirma, **entonces** el sistema no crea la comunidad e indica los campos faltantes. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Comunidad de una sola persona:** **Dado** un voluntario que participa solo, **cuando** registra una comunidad cuyo nombre corresponde a una sola persona, **entonces** el sistema la acepta como comunidad válida. *[ESCENARIO IDEAL]*
- **Contacto inválido:** **Dado** un voluntario en el formulario, **cuando** ingresa un teléfono o un correo con formato inválido, **entonces** el sistema no crea la comunidad e indica el formato esperado. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el modelo de datos de la comunidad: nombre e información de contacto del responsable (1 hora)
- Diseñar la interfaz del formulario de comunidad (1 hora)
- Implementar la interfaz del formulario con campos de nombre y contacto del responsable (2 horas)
- Codificar el método que crea la comunidad y registra al voluntario como responsable y primer miembro (2 horas)
- Codificar la validación de campos obligatorios: nombre y al menos un dato de contacto (1 hora)
- Codificar la validación del formato del teléfono y del correo (1 hora)
- Permitir comunidades de una sola persona, sin exigir un mínimo de miembros (1 hora)
- Probar con comunidad individual, familiar o de barrio, y con datos inválidos (2 horas)
- Depurar el código (1 hora)

### HU-005 · Actualizar información de la comunidad

**Prioridad:** Media · **Estimación:** 8 horas

**Historia de usuario**

> **Como** responsable de una comunidad **quiero** actualizar el nombre y la información de contacto de mi comunidad, **para** mantener vigentes los datos de la comunidad.

**Criterios de aceptación**

- **Actualización exitosa:** **Dado** un responsable con sesión activa, **cuando** modifica los datos de su comunidad con valores válidos y guarda, **entonces** el sistema guarda los cambios y los muestra actualizados. *[ESCENARIO IDEAL]*
- **Datos inválidos:** **Dado** un responsable editando su comunidad, **cuando** guarda con un campo obligatorio vacío, **entonces** el sistema no guarda e indica el error. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Sin permiso:** **Dado** un usuario que no es responsable de la comunidad, **cuando** intenta editar su información, **entonces** el sistema no permite la edición. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Ranking no editable:** **Dado** un responsable editando su comunidad, **cuando** revisa los campos editables, **entonces** el lugar en el ranking no es editable, porque lo define el sistema (ver HU-035). *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar la pantalla de edición de la comunidad (1 hora)
- Implementar la interfaz de edición precargada con los datos actuales (1,5 horas)
- Codificar el método que actualiza el nombre y la información de contacto (1,5 horas)
- Codificar la validación de campos obligatorios (1 hora)
- Codificar el control de permisos para que solo el responsable pueda editar (1,5 horas)
- Mostrar el lugar en el ranking como campo no editable (0,5 horas)
- Probar con responsable, usuario sin permiso y datos inválidos (1 hora)

### HU-006 · Agregar voluntarios como miembros de la comunidad

**Prioridad:** Alta · **Estimación:** 14 horas

**Historia de usuario**

> **Como** responsable de una comunidad **quiero** incorporar a voluntarios registrados como miembros de mi comunidad, **para** que sus acciones en el huerto cuenten para el progreso de la comunidad.

**Criterios de aceptación**

- **Incorporación exitosa:** **Dado** un responsable y un voluntario registrado, **cuando** el responsable lo agrega a la comunidad, **entonces** el voluntario aparece en la lista de miembros con su nombre, nivel de experiencia (aprendiz, oficial o maestro) y talentos certificados. *[ESCENARIO IDEAL]*
- **Voluntario no registrado:** **Dado** un responsable, **cuando** intenta agregar a una persona que no tiene cuenta, **entonces** el sistema no la agrega e informa que primero debe registrarse (HU-001). *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Miembro ya existente:** **Dado** un voluntario que ya es miembro de la comunidad, **cuando** el responsable intenta agregarlo de nuevo, **entonces** el sistema evita el duplicado e informa que ya es miembro. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el flujo de incorporación de miembros por solicitud (1,5 horas)
- Diseñar la interfaz de búsqueda y selección de voluntarios registrados (1 hora)
- Implementar la interfaz de búsqueda y de agregado de miembros (2 horas)
- Crear la relación voluntario–comunidad en la base de datos (2 horas)
- Codificar el método que agrega al miembro con su nivel inicial (2 horas)
- Codificar la validación de que el voluntario exista (1 hora)
- Codificar la validación de miembro duplicado en la misma comunidad (1 hora)
- Codificar el listado de miembros con nombre, nivel de experiencia y talentos certificados (1,5 horas)
- Probar con voluntarios registrados, no registrados y ya miembros (1,5 horas)
- Depurar el código (0,5 horas)

### HU-007 · Consultar la información de una comunidad

**Prioridad:** Media · **Estimación:** 8 horas

**Historia de usuario**

> **Como** voluntario **quiero** consultar la información de una comunidad de siembra, **para** conocer su responsable, sus miembros y su lugar en el ranking.

**Criterios de aceptación**

- **Consulta exitosa:** **Dado** un usuario con sesión activa, **cuando** abre la ficha de una comunidad, **entonces** el sistema muestra su nombre, lugar en el ranking, información de contacto del responsable y la lista de miembros con nombre, nivel y talentos certificados. *[ESCENARIO IDEAL]*
- **Comunidad sin miembros adicionales:** **Dada** una comunidad recién creada, **cuando** el usuario abre su ficha, **entonces** el sistema muestra la información disponible sin errores. *[ESCENARIO IDEAL]*
- **Comunidad inexistente:** **Dado** un usuario que accede a una comunidad que no existe, **cuando** abre su ficha, **entonces** el sistema muestra un mensaje de que la comunidad no fue encontrada. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar la ficha de la comunidad (1 hora)
- Implementar la interfaz de la ficha con nombre, ranking, contacto del responsable y tabla de miembros (2 horas)
- Codificar la consulta de la comunidad con sus miembros (2 horas)
- Codificar el mensaje de comunidad no encontrada (1 hora)
- Codificar la visualización de una comunidad sin miembros adicionales (0,5 horas)
- Probar con comunidades con y sin miembros y con identificador inexistente (1,5 horas)

### HU-008 · Participar en el foro de prácticas y saberes

**Prioridad:** Media · **Estimación:** 16 horas

**Historia de usuario**

> **Como** voluntario **quiero** publicar y leer aportes en un foro sobre el cultivo y uso de plantas medicinales, **para** compartir y aprender prácticas, saberes y sentires con otras comunidades.

**Criterios de aceptación**

- **Publicación exitosa:** **Dado** un voluntario con sesión activa, **cuando** escribe un aporte válido y lo publica, **entonces** el aporte aparece en el foro con su autor. *[ESCENARIO IDEAL]*
- **Consulta de aportes:** **Dado** un usuario con sesión activa, **cuando** abre el foro, **entonces** el sistema muestra los aportes publicados. *[ESCENARIO IDEAL]*
- **Reglas visibles:** **Dado** un usuario en el foro, **cuando** accede a él, **entonces** el sistema muestra las reglas de participación. *[ESCENARIO IDEAL]*
- **Aporte vacío:** **Dado** un voluntario en el foro, **cuando** intenta publicar sin contenido, **entonces** el sistema no publica e indica que el aporte no puede estar vacío. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Foro sin aportes:** **Dado** un foro sin aportes, **cuando** un usuario lo abre, **entonces** el sistema muestra un mensaje que invita a publicar el primero. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el modelo de datos del aporte: autor, contenido y fecha de publicación (1 hora)
- Diseñar la pantalla del foro: listado de aportes, formulario de publicación y reglas (1,5 horas)
- Implementar la vista del listado de aportes (2,5 horas)
- Implementar el formulario de publicación (2 horas)
- Codificar el método que guarda el aporte con su autor y fecha (2 horas)
- Codificar la consulta de aportes visibles, ordenados por fecha (2 horas)
- Codificar la validación de aporte vacío, con mensaje de error (1 hora)
- Implementar la sección visible de reglas de participación (1,5 horas)
- Probar publicación, consulta y aporte vacío (2 horas)
- Depurar el código (0,5 horas)

### HU-009 · Moderar el foro

**Prioridad:** Media · **Estimación:** 10 horas

**Historia de usuario**

> **Como** moderador del foro **quiero** retirar los aportes que incumplan las reglas de participación, **para** mantener un espacio respetuoso de intercambio de saberes.

**Criterios de aceptación**

- **Retiro de aporte:** **Dado** un aporte que incumple las reglas de participación, **cuando** el moderador lo retira, **entonces** el aporte deja de mostrarse a los demás usuarios. *[ESCENARIO IDEAL]*
- **Sin permiso de moderación:** **Dado** un usuario sin rol de moderador, **cuando** intenta retirar un aporte ajeno, **entonces** el sistema no se lo permite. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar la opción de retirar aporte en la vista del moderador (1 hora)
- Codificar el rol de moderador en el modelo de usuarios (2 horas)
- Codificar el método que marca el aporte como retirado y lo oculta a los demás usuarios (2 horas)
- Implementar el botón de retirar, visible solo para el moderador (1,5 horas)
- Codificar el control de permisos en el servidor (1,5 horas)
- Probar con moderador y con usuarios sin permiso (1,5 horas)
- Depurar el código (0,5 horas)

## 3. HUERTO

### HU-010 · Registrar la ubicación geográfica del huerto

**Prioridad:** Alta · **Estimación:** 14 horas

**Historia de usuario**

> **Como** responsable de una comunidad **quiero** registrar y actualizar la provincia, parroquia, dirección y georreferenciación de mi huerto real, **para** ubicar el huerto de mi comunidad en el proyecto.

**Criterios de aceptación**

- **Registro exitoso:** **Dado** un responsable con una comunidad, **cuando** ingresa provincia, parroquia, dirección y georreferenciación válidas y guarda, **entonces** el sistema guarda la ubicación y la muestra en el huerto. *[ESCENARIO IDEAL]*
- **Actualización:** **Dado** un huerto con ubicación registrada, **cuando** el responsable modifica algún dato válido y guarda, **entonces** el sistema muestra la ubicación actualizada. *[ESCENARIO IDEAL]*
- **Georreferenciación inválida:** **Dado** un responsable en el formulario, **cuando** ingresa coordenadas o selección en el mapa con formato inválido, **entonces** el sistema no guarda e indica el formato esperado. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Datos obligatorios incompletos:** **Dado** un responsable en el formulario, **cuando** deja vacío un campo obligatorio que son la provincia, la parroquia o las coordenadas, **entonces** el sistema no guarda e indica el campo faltante. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el modelo de datos de ubicación: provincia, parroquia, dirección (opcional), latitud y longitud (1 hora)
- Crear el catálogo de provincias y parroquias del Ecuador (2 horas)
- Diseñar la interfaz del formulario de ubicación (1 hora)
- Implementar el formulario con listas dependientes provincia → parroquia (2 horas)
- Implementar los campos de latitud y longitud y el botón «Usar mi ubicación actual», con la solicitud de permiso al usuario (2,5 horas)
- Codificar el guardado y la actualización de la ubicación del huerto (1 hora)
- Codificar la validación del formato y del rango de las coordenadas (1,5 horas)
- Codificar la validación de campos obligatorios (provincia, parroquia y coordenadas) y la dirección opcional (0,5 horas)
- Codificar el mensaje y la alternativa de ingreso manual cuando se deniega el permiso de ubicación (1 hora)
- Probar con ubicaciones válidas, coordenadas inválidas, campos vacíos y permiso denegado (1,5 horas)

### HU-011 · Registrar el diseño del huerto

**Prioridad:** Alta · **Estimación:** 12 horas

**Historia de usuario**

> **Como** responsable de una comunidad **quiero** registrar y actualizar el diseño de mi huerto (en tierra, vertical, colgante o en piso), **para** reflejar cómo está construido el huerto real.

**Criterios de aceptación**

- **Registro exitoso:** **Dado** un responsable con un huerto, **cuando** selecciona un diseño y su variante y guarda, **entonces** el sistema guarda el diseño. Las opciones son: en tierra (surcos, camadas, camellones, terrazas), vertical (paredes), colgante (techos) y en piso (maceteros, botellas, llantas en patio, terraza, gradas, balcones, filos de ventana). *[ESCENARIO IDEAL]*
- **Diseño combinado:** **Dado** un huerto que combina más de un diseño, **cuando** el responsable selecciona varios tipos, cada uno con su variante, y guarda, **entonces** el sistema guarda todos y los muestra en el huerto. *[ESCENARIO IDEAL]*
- **Sin selección:** **Dado** un responsable en el formulario, **cuando** guarda sin elegir ningún diseño, **entonces** el sistema no guarda e indica que debe elegir al menos uno. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Diseño sin variante:** **Dado** un responsable que marca un tipo de diseño, **cuando** guarda sin elegir ninguna de sus variantes, **entonces** el sistema no guarda e indica que debe elegir al menos una variante de ese diseño. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el modelo de datos del diseño del huerto: tipo y variante (1 hora)
- Crear el catálogo de tipos y variantes: en tierra (surcos, camadas, camellones, terrazas), vertical, colgante y en piso (1,5 horas)
- Diseñar la pantalla de selección de diseño (1 hora)
- Implementar la selección de tipo con variantes que dependen del tipo elegido (2,5 horas)
- Codificar el guardado y la actualización del diseño (2 horas)
- Codificar la validación de al menos una selección (1 hora)
- Codificar el guardado de más de un diseño por huerto (1 hora)
- Probar cada tipo de diseño y el guardado sin selección (1,5 horas)
- Depurar el código (0,5 horas)

### HU-012 · Registrar el tipo de cerca de seguridad

**Prioridad:** Media · **Estimación:** 8 horas

**Historia de usuario**

> **Como** responsable de una comunidad **quiero** registrar y actualizar el tipo de cerca de seguridad de mi huerto, **para** documentar cómo está protegido el huerto real.

**Criterios de aceptación**

- **Registro exitoso:** **Dado** un responsable con un huerto, **cuando** elige un tipo de cerca y guarda, **entonces** el sistema guarda el tipo seleccionado. Los tipos son: cerca viva (higuerilla, floripondio, agave, lavanda o árboles frutales como naranjas, capulíes, tocte y guabo), cerca con material natural (caña guadua, bahareque, tapial), verja con material reciclado (tablas, botellas de plástico, neumáticos), cerca con material metálico (alambre de púas) y cerramiento con material convencional (piedra, ladrillo, bloque). *[ESCENARIO IDEAL]*
- **Sin selección:** **Dado** un responsable en el formulario, **cuando** guarda sin elegir un tipo de cerca, **entonces** el sistema no guarda e indica que debe elegir uno. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Crear el catálogo de tipos de cerca con sus materiales o especies (1,5 horas)
- Diseñar la pantalla de selección de cerca (0,5 horas)
- Implementar la selección del tipo de cerca y su material o especie (1,5 horas)
- Codificar el guardado y la actualización del tipo de cerca (1,5 horas)
- Codificar la validación de selección obligatoria (0,5 horas)
- Probar los cinco tipos de cerca y el guardado sin selección (1,5 horas)
- Depurar el código (1 hora)

### HU-013 · Registrar el área, suelo, agua de riego y abono del huerto

**Prioridad:** Media · **Estimación:** 12 horas

**Historia de usuario**

> **Como** responsable de una comunidad **quiero** registrar y actualizar el área total, el tipo de suelo, el tipo de agua **para** riego y el tipo de abono natural de mi huerto, para describir los recursos con que cuenta el huerto real.

**Criterios de aceptación**

- **Registro exitoso:** **Dado** un responsable con un huerto, **cuando** ingresa un área total mayor que cero (en metros cuadrados), elige un tipo de suelo (arcilloso, limoso, arenoso, margoso, gredoso o pantanoso), un tipo de agua de riego (río, canal, por goteo, etc.) y un tipo de abono natural (barbecho, restos vegetales, hoja o compost) y guarda, **entonces** el sistema guarda los datos. *[ESCENARIO IDEAL]*
- **Área inválida:** **Dado** un responsable en el formulario, **cuando** ingresa un área vacía, cero, negativa o no numérica, **entonces** el sistema no guarda e indica que debe ingresar un valor numérico positivo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Datos obligatorios incompletos:** **Dado** un responsable en el formulario, **cuando** deja sin elegir suelo, agua o abono, **entonces** el sistema no guarda e indica cuál falta. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Crear los catálogos de tipo de suelo, de agua de riego y de abono natural (1,5 horas)
- Diseñar el formulario de área, suelo, agua y abono (1 hora)
- Implementar el formulario con campo de área en metros cuadrados y listas de selección (2 horas)
- Codificar el guardado y la actualización de los datos (2 horas)
- Codificar la validación del área: numérica y mayor que cero (1,5 horas)
- Codificar la validación de selección de suelo, agua y tipo de abono (1 hora)
- Probar con áreas válidas, cero, negativas y no numéricas, y con listas sin elegir (2 horas)
- Depurar el código (1 hora)

### HU-014 · Registrar las plantas medicinales del huerto

**Prioridad:** Alta · **Estimación:** 20 horas

**Historia de usuario**

> **Como** responsable de una comunidad **quiero** registrar y actualizar las plantas medicinales de mi huerto con su información botánica y de uso, **para** documentar qué plantas se cultivan y poder registrar actividades sobre ellas.

**Criterios de aceptación**

- **Registro exitoso:** **Dado** un responsable con un huerto, **cuando** ingresa nombre científico, nombre común, otros nombres, familia botánica, altitud, distribución geográfica (provincias), ciclo (corto o largo), cualidad (caliente o fría), usos medicinales y fotografías, y guarda, **entonces** el sistema agrega la planta al huerto. *[ESCENARIO IDEAL]*
- **Actualización:** **Dada** una planta registrada, **cuando** el responsable modifica sus datos y guarda, **entonces** el sistema muestra la información actualizada. *[ESCENARIO IDEAL]*
- **Datos obligatorios incompletos:** **Dado** un responsable en el formulario, **cuando** deja vacío el nombre común, el ciclo, la cualidad o los usos medicinales, **entonces** el sistema no guarda e indica los campos faltantes. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Fotografía inválida:** **Dado** un responsable adjuntando una fotografía, **cuando** el archivo no cumple el formato o tamaño admitido debe ser JPG o PNG, pesa más de 5 MB, o ya hay al menos 5 fotografías de la planta, **entonces** el sistema lo rechaza e indica el motivo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el modelo de datos de la planta con todos sus campos botánicos y de uso (1,5 horas)
- Crear los catálogos de ciclo (corto o largo), cualidad (caliente o fría) y provincias (1,5 horas)
- Diseñar la interfaz del formulario de planta y la carga de fotografías (1,5 horas)
- Implementar el formulario con los campos de nombre científico, nombre común, otros nombres, familia, altitud, distribución, ciclo, cualidad y usos (3 horas)
- Implementar la carga de varias fotografías con vista previa (3 horas)
- Codificar el almacenamiento de las fotografías y su asociación a la planta (2 horas)
- Codificar el guardado y la actualización de la planta (2 horas)
- Codificar el listado de plantas del huerto (1,5 horas)
- Codificar la validación de campos obligatorios (cuáles: Por definir) (1 hora)
- Codificar la validación de formato y tamaño de las fotografías (límites: Por definir) (1 hora)
- Probar con datos completos, incompletos y fotografías válidas e inválidas (2 horas)

### HU-015 · Registrar el espacio de bodega

**Prioridad:** Media · **Estimación:** 12 horas

**Historia de usuario**

> **Como** responsable de una comunidad **quiero** registrar y actualizar los espacios de bodega del huerto, **para** documentar dónde se guardan las herramientas, las semillas y los abonos.

**Criterios de aceptación**

- **Registro exitoso:** **Dado** un responsable con un huerto, **cuando** registra uno o más de los tres espacios de bodega (herramientas e implementos como pala, azadón, rastrillo y regadera; semillas, estacas, esquejes y plántulas; abonos orgánicos y compost) con la descripción del lugar y, opcionalmente, lo que se guarda allí, y guarda, **entonces** el sistema guarda cada espacio con sus datos. *[ESCENARIO IDEAL]*
- **Actualización:** **Dado** un espacio de bodega registrado, **cuando** el responsable modifica sus datos y guarda, **entonces** el sistema muestra la información actualizada. *[ESCENARIO IDEAL]*
- **Datos inválidos:** **Dado** un responsable en el formulario, **cuando** guarda un espacio sin la descripción del lugar, **entonces** el sistema no guarda ese espacio e indica que debe describir dónde está. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Huerto sin bodega:** **Dado** un huerto que no tiene ningún espacio de bodega registrado, **cuando** el responsable abre la sección de bodega, **entonces** el sistema muestra un mensaje de que aún no hay espacios registrados, sin errores. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el modelo de datos de bodega: tres espacios (herramientas, semillas y plántulas, abonos) y su descripción (1 hora)
- Diseñar la pantalla de bodega con sus tres espacios (1 hora)
- Implementar la pantalla con las tres secciones (2,5 horas)
- Codificar el guardado de cada espacio de bodega (2 horas)
- Codificar la actualización de un espacio de bodega (1,5 horas)
- Codificar la validación de la descripción del lugar, que es obligatoria (1 hora)
- Probar el registro y la actualización de los tres espacios (2 horas)
- Depurar el código (1 hora)

### HU-016 · Consultar el huerto virtual de la comunidad

**Prioridad:** Alta · **Estimación:** 24 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** ver un huerto virtual que refleje el progreso de mi huerto real, **para** recibir retroalimentación visual inmediata de las acciones que registro.

**Criterios de aceptación**

- **Progreso reflejado:** **Dada** una comunidad con actividades registradas, **cuando** un miembro abre el huerto virtual, **entonces** el sistema muestra una planta por cada planta del huerto, en la etapa más avanzada que tenga registrada (tierra preparada, sembrada, en cuidado, cosechada, en secado o empaquetada), y el porcentaje de progreso del huerto, calculado como el promedio del avance de sus plantas. *[ESCENARIO IDEAL]*
- **Actualización tras registro:** **Dado** un miembro que registra una actividad completada, **cuando** vuelve al huerto virtual, **entonces** la planta correspondiente avanza a su nueva etapa y el porcentaje de progreso se actualiza. *[ESCENARIO IDEAL]*
- **Tierra preparada:** **Dado** un huerto con la preparación de la tierra registrada y plantas aún sin siembra, **cuando** el miembro abre el huerto virtual, **entonces** todas las plantas se muestran en la primera etapa. *[ESCENARIO IDEAL]*
- **Huerto sin actividades:** **Dada** una comunidad sin actividades registradas, **cuando** un miembro abre el huerto virtual, **entonces** el sistema muestra el estado inicial sin errores. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Huerto sin plantas registradas:** **Dada** una comunidad sin plantas medicinales registradas, **cuando** un miembro abre el huerto virtual, **entonces** el sistema muestra la parcela vacía con un mensaje que indica que debe registrar plantas. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar las reglas que relacionan actividades registradas con elementos del huerto virtual (3 horas)
- Diseñar la representación visual del huerto virtual: estado inicial y estados de progreso (3 horas)
- Crear los recursos gráficos del huerto virtual (plantas, parcelas, estados) (3 horas)
- Implementar la vista del huerto virtual con una planta por cada planta registrada y la barra de progreso (5 horas)
- Codificar el cálculo de la etapa más avanzada de cada planta y del porcentaje del huerto (4 horas)
- Codificar la actualización de la vista al registrar una nueva actividad (2 horas)
- Codificar el estado inicial para comunidades sin actividades (1 hora)
- Probar con distintos niveles de progreso (2 horas)
- Depurar el código (1 hora)

## 4. ACTIVIDADES

### HU-017 · Consultar la fase lunar y las actividades recomendadas

**Prioridad:** Alta · **Estimación:** 20 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** conocer la fase lunar de una fecha y las actividades agrícolas recomendadas **para** esa fase, para planificar mis actividades según el calendario lunar y los conocimientos ancestrales.

**Criterios de aceptación**

- **Consulta de fase:** **Dada** una fecha, **cuando** el miembro consulta el calendario lunar, **entonces** el sistema muestra la fase lunar y sus actividades recomendadas: luna oscura (retirar maleza y preparar la tierra), luna creciente o llena (ritual y siembra; cosecha de hojas, flores y frutos) y cuarto menguante (cosecha de semillas y raíces). *[ESCENARIO IDEAL]*
- **Fase no disponible:** **Dada** una fecha para la cual no se puede determinar la fase, **cuando** el miembro la consulta, **entonces** el sistema informa que la fase no está disponible. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Definir la fuente de datos de las fases lunares (servicio externo o tabla precalculada) (2 horas)
- Diseñar el algoritmo que determina la fase lunar de una fecha (2 horas)
- Codificar el método que devuelve la fase lunar de una fecha (4 horas)
- Crear la tabla que relaciona cada fase con sus actividades recomendadas (1,5 horas)
- Diseñar la interfaz del calendario lunar (1,5 horas)
- Implementar el calendario mostrando la fase de cada día (4 horas)
- Implementar el panel de actividades recomendadas según la fase seleccionada (2 horas)
- Codificar el mensaje para fechas sin fase disponible (1 hora)
- Probar con fechas de cada fase lunar (1,5 horas)
- Depurar el código (0,5 horas)

### HU-018 · Registrar la preparación de la tierra

**Prioridad:** Alta · **Estimación:** 14 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** registrar la preparación de la tierra de mi huerto (retiro de maleza, esparcido, abono orgánico opcional y remoción), **para** documentar la actividad y avanzar en el progreso del huerto.

**Criterios de aceptación**

- **Registro exitoso:** **Dado** un miembro con huerto, **cuando** registra la fecha, el retiro de maleza en día soleado, el esparcido de la maleza desmenuzada, el uso opcional de abono orgánico y la remoción con azadón o pala, **entonces** el sistema guarda la actividad con la fase lunar de esa fecha y la espera de 15 días para la fertilización. *[ESCENARIO IDEAL]*
- **Fecha fuera de luna oscura:** **Dada** una fecha que no corresponde a luna oscura, **cuando** el miembro registra la preparación, **entonces** el sistema muestra una advertencia que indica que la fase recomendada es luna oscura y permite confirmar y guardar la actividad de todas formas. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Datos incompletos:** **Dado** un miembro en el formulario, **cuando** omite la fecha o alguno de los pasos de retiro de maleza, esparcido o remoción, **entonces** el sistema no guarda e indica los campos faltantes. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el modelo de datos de la preparación de la tierra: fecha, fase lunar, retiro y esparcido de maleza, abono opcional, remoción y fin de espera (1,5 horas)
- Diseñar la interfaz del formulario de preparación de la tierra (1 hora)
- Implementar el formulario con casillas de cada paso, opción de abono y selector de fecha (2,5 horas)
- Codificar el guardado de la actividad con la fase lunar de la fecha (2 horas)
- Codificar el cálculo de la fecha en que termina la espera de 15 días (1,5 horas)
- Codificar la validación de campos obligatorios (1 hora)
- Codificar la validación de luna oscura, con mensaje de la fase recomendada y la confirmación del usuario para guardar (1,5 horas)
- Probar con fechas dentro y fuera de luna oscura con la confirmación de la advertencia y con datos incompletos (2 horas)
- Depurar el código (1 hora)

### HU-019 · Registrar la elaboración de surcos, terrazas, camadas o camellones

**Prioridad:** Media · **Estimación:** 10 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** registrar la elaboración de surcos, terrazas, camadas o camellones, **para** documentar la estructura de siembra de mi huerto.

**Criterios de aceptación**

- **Registro exitoso:** **Dado** un huerto con diseño en tierra, **cuando** el miembro registra la fecha y el tipo de estructura elaborada, **entonces** el sistema guarda la actividad. *[ESCENARIO IDEAL]*
- **Espera de 15 días pendiente:** **Dada** una preparación de la tierra registrada hace menos de 15 días, **cuando** el miembro registra esta actividad, **entonces** el sistema muestra una advertencia de que aún no concluye el periodo de fertilización y permite confirmar y guardar de todas formas. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Sin preparación registrada:** **Dado** un huerto sin preparación de la tierra registrada, **cuando** el miembro registra esta actividad, **entonces** el sistema muestra una advertencia de que primero se recomienda registrar la preparación de la tierra y permite confirmar y guardar de todas formas. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Diseño no aplicable:** **Dado** un huerto cuyo diseño no es en tierra, **cuando** el miembro intenta registrar esta actividad, **entonces** el sistema informa que no aplica a su diseño. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el formulario de elaboración de surcos, terrazas, camadas o camellones (1 hora)
- Implementar el formulario con selector de tipo de estructura y fecha (2 horas)
- Codificar el guardado de la actividad (1,5 horas)
- Codificar la validación del periodo de espera de 15 días tras la preparación de la tierra (2 horas)
- Codificar la validación de que el diseño del huerto sea en tierra (1,5 horas)
- Probar los cuatro tipos de estructura y los casos de espera pendiente y diseño no aplicable (1,5 horas)
- Depurar el código (0,5 horas)

### HU-020 · Registrar el ritual de siembra

**Prioridad:** Media · **Estimación:** 8 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** registrar el ritual de siembra realizado a la salida del sol, **para** documentar el conocimiento ancestral asociado a la siembra.

**Criterios de aceptación**

- **Registro exitoso:** **Dado** un miembro con huerto, **cuando** registra fecha y hora del ritual en fase de luna creciente o llena, **entonces** el sistema guarda la actividad con su fase lunar. *[ESCENARIO IDEAL]*
- **Fase no recomendada:** **Dada** una fecha que no es de luna creciente ni llena, **cuando** el miembro registra el ritual, **entonces** el sistema muestra una advertencia de que la fase recomendada es luna creciente o llena y permite confirmar y guardar la actividad de todas formas. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Datos incompletos:** **Dado** un miembro en el formulario, **cuando** omite fecha u hora, **entonces** el sistema no guarda e indica los campos faltantes. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el formulario del ritual de siembra (0,5 horas)
- Implementar el formulario con fecha y hora (1,5 horas)
- Codificar el guardado del ritual con la fase lunar de la fecha (1,5 horas)
- Codificar la advertencia de fase lunar, con el mensaje de la fase recomendada y la confirmación del usuario para guardar (1,5 horas)
- Codificar la validación de fecha y hora obligatorias (1 hora)
- Probar con fechas dentro y fuera de la fase recomendada (1,5 horas)
- Depurar el código (0,5 horas)

### HU-021 · Registrar la siembra de una planta medicinal

**Prioridad:** Alta · **Estimación:** 16 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** registrar la siembra de una planta medicinal con su técnica y tipo de siembra, **para** documentar el inicio del cultivo y avanzar en el progreso del huerto.

**Criterios de aceptación**

- **Registro exitoso:** **Dada** una planta registrada en el huerto (HU-014), **cuando** el miembro registra fecha, hora (8:00 a. m. posterior al ritual), técnica (surcos, andenes o terrazas, camellones) y tipo de siembra (semillas, estacas, esquejes o plántulas), **entonces** el sistema guarda la siembra y la asocia a la planta. *[ESCENARIO IDEAL]*
- **Ritual previo no registrado:** **Dada** una siembra sin un ritual de siembra registrado el mismo día con una hora anterior, **cuando** el miembro la registra, **entonces** el sistema muestra una advertencia de que la siembra se realiza después del ritual y permite confirmar y guardar. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Planta no registrada:** **Dado** un miembro que elige una planta que no está en el huerto, **cuando** intenta registrar la siembra, **entonces** el sistema indica que primero debe registrar la planta. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Datos incompletos:** **Dado** un miembro en el formulario, **cuando** omite técnica o tipo de siembra, **entonces** el sistema no guarda e indica los campos faltantes. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el modelo de datos de la siembra: planta, fecha, hora, técnica y tipo de siembra (1 hora)
- Diseñar la interfaz del formulario de siembra (1 hora)
- Implementar el formulario con selector de planta del huerto, técnica y tipo de siembra (3 horas)
- Codificar el guardado de la siembra y su asociación a la planta (2,5 horas)
- Crear las listas de técnicas (surcos, andenes o terrazas, camellones) y tipos de siembra (semillas, estacas, esquejes, plántulas) (1 hora)
- Codificar la validación de que la planta esté registrada en el huerto (1,5 horas)
- Codificar la advertencia de ritual previo: buscar un ritual del mismo día con hora anterior y pedir confirmación si no existe (2 horas)
- Codificar la validación de campos obligatorios: planta, fecha, hora, técnica y tipo de siembra (1 hora)
- Probar las combinaciones de técnica y tipo, planta no registrada y falta de ritual (2 horas)
- Depurar el código (1 hora)

### HU-022 · Registrar la colocación de señalética

**Prioridad:** Media · **Estimación:** 8 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** registrar la señalética de una planta con su nombre, usos y color, **para** documentar la identificación de las plantas del huerto.

**Criterios de aceptación**

- **Registro exitoso:** **Dada** una planta sembrada, **cuando** el miembro registra la señalética con nombres, usos y color correspondiente (rojo si la planta es caliente; verde o blanco si es fría), **entonces** el sistema guarda la actividad. *[ESCENARIO IDEAL]*
- **Color incoherente:** **Dada** una planta fría, **cuando** el miembro registra color rojo (o una planta caliente con verde o blanco), **entonces** el sistema rechaza el dato e indica el color correspondiente. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el formulario de señalética (1 hora)
- Implementar el formulario con nombres, usos y color (1,5 horas)
- Codificar el guardado de la señalética asociada a la planta (1,5 horas)
- Codificar la regla de color según la cualidad: rojo para plantas calientes, verde o blanco para frías (2 horas)
- Codificar la validación de campos obligatorios (0,5 horas)
- Probar con plantas calientes y frías, con colores correctos e incorrectos (1,5 horas)

### HU-023 · Registrar cuidados de crecimiento y riego

**Prioridad:** Alta · **Estimación:** 12 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** registrar el deshierbe, replante, aporque y riego de las plantas, **para** documentar el cuidado del huerto y sumar progreso.

**Criterios de aceptación**

- **Registro de cuidado:** **Dado** un huerto con plantas sembradas, **cuando** el miembro registra deshierbe, replante o aporque con su fecha, **entonces** el sistema guarda la actividad. *[ESCENARIO IDEAL]*
- **Registro de riego:** **Dado** un huerto con plantas sembradas, **cuando** el miembro registra un riego con agua de riego, manguera o regadera de aluminio y su fecha, **entonces** el sistema guarda la actividad. *[ESCENARIO IDEAL]*
- **Método no admitido:** **Dado** un miembro registrando un riego, **cuando** revisa los métodos disponibles, **entonces** el aspersor no figura como opción, porque no se utiliza. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Datos incompletos:** **Dado** un miembro en el formulario, **cuando** omite fecha o tipo de cuidado, **entonces** el sistema no guarda e indica los campos faltantes. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar los formularios de cuidados de crecimiento y de riego (1 hora)
- Implementar el formulario de deshierbe, replante y aporque (1,5 horas)
- Implementar el formulario de riego con los métodos agua de riego, manguera y regadera de aluminio (1,5 horas)
- Codificar el guardado de los cuidados de crecimiento (1,5 horas)
- Codificar el guardado del riego (1,5 horas)
- Excluir el aspersor del catálogo de métodos de riego (0,5 horas)
- Codificar la validación de campos obligatorios (1 hora)
- Codificar la validación de que la planta esté sembrada (1 hora)
- Probar cada tipo de cuidado y cada método de riego (2 horas)
- Depurar el código (0,5 horas)

### HU-024 · Registrar el baño previo y el ritual de gratitud antes de la cosecha

**Prioridad:** Media · **Estimación:** 12 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** registrar el baño de las plantas (dos días antes de la cosecha) y el ritual de gratitud al amanecer, **para** documentar la preparación de la cosecha según los conocimientos ancestrales.

**Criterios de aceptación**

- **Registro del baño:** **Dada** una planta sembrada, **cuando** el miembro registra el baño con su fecha, **entonces** el sistema guarda la actividad asociada a la planta y a su ciclo (corto o largo). *[ESCENARIO IDEAL]*
- **Registro del ritual de gratitud:** **Dado** un miembro con huerto, **cuando** registra fecha y hora del ritual al amanecer, **entonces** el sistema guarda la actividad. *[ESCENARIO IDEAL]*
- **Hora fuera del amanecer:** **Dado** un ritual de gratitud con una hora anterior a las 5:00 o posterior a las 7:00, **cuando** el miembro lo registra, **entonces** el sistema muestra una advertencia de que el horario recomendado es de 5:00 a 7:00 y permite confirmar y guardar de todas formas. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Planta no sembrada:** **Dado** un miembro que elige una planta sin siembra registrada, **cuando** intenta registrar el baño, **entonces** el sistema indica que primero debe registrar la siembra. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Datos incompletos:** **Dado** un miembro en el formulario del baño o del ritual, **cuando** omite la planta o la fecha (en el baño), o la fecha o la hora (en el ritual), **entonces** el sistema no guarda e indica los campos faltantes. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar los formularios del baño de plantas y del ritual de gratitud (1 hora)
- Implementar el formulario del baño con planta y fecha (1,5 horas)
- Implementar el formulario del ritual de gratitud con fecha y hora (1,5 horas)
- Codificar el guardado del baño asociado a la planta y a su ciclo (corto o largo) (2 horas)
- Codificar el guardado del ritual de gratitud (1,5 horas)
- Codificar la validación de que la planta tenga siembra registrada (1 hora)
- Codificar la advertencia de horario del ritual de 5:00 a 7:00, con la confirmación del usuario para guardar (1,5 horas)
- Probar con plantas de ciclo corto y largo, horarios válidos e inválidos, y los datos imcompletos (2 horas)

### HU-025 · Registrar la cosecha de plantas medicinales

**Prioridad:** Alta · **Estimación:** 16 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** registrar la cosecha de una planta indicando la parte cosechada, **para** documentar la cosecha de acuerdo con la fase lunar adecuada.

**Criterios de aceptación**

- **Cosecha de hojas, flores o frutos:** **Dada** una planta sembrada, **cuando** el miembro registra la cosecha de hojas, flores o frutos en fase de luna creciente o llena, **entonces** el sistema guarda la actividad. *[ESCENARIO IDEAL]*
- **Cosecha de semillas o raíces:** **Dada** una planta sembrada, **cuando** el miembro registra la cosecha de semillas o raíces en cuarto menguante, **entonces** el sistema guarda la actividad. *[ESCENARIO IDEAL]*
- **Fase incoherente con la parte cosechada:** **Dada** la cosecha de hojas, flores o frutos fuera de luna creciente o llena (o de semillas o raíces fuera de cuarto menguante), **cuando** el miembro la registra, **entonces** el sistema muestra una advertencia con la fase recomendada para esa parte de la planta y permite confirmar y guardar de todas formas. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Hora con rocío:** **Dada** una cosecha registrada antes de que se seque el rocío y el sol caliente (hora límite: 8:00), **cuando** el miembro la registra, **entonces** el sistema muestra una advertencia de que se recomienda cosechar después de que se seque el rocío, y permite confirmar y guardar de todas formas. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Planta no sembrada:** **Dado** un miembro que elige una planta sin siembra registrada, **cuando** intenta registrar la cosecha, **entonces** el sistema indica que primero debe registrar la siembra. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Datos incompletos:** **Dado** un miembro en el formulario, **cuando** omite la planta, la fecha, la hora o la parte cosechada, **entonces** el sistema no guarda e indica los campos faltantes. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar la interfaz del formulario de cosecha (1 hora)
- Implementar el formulario con planta, fecha, hora y parte cosechada (hojas, flores, frutos, semillas o raíces) (2 horas)
- Codificar el guardado de la cosecha con la fase lunar de la fecha (2,5 horas)
- Codificar la regla parte cosechada → fase: hojas, flores y frutos en creciente o llena; semillas y raíces en cuarto menguante (3 horas)
- Codificar la advertencia de hora anterior a las 8:00 por el rocío, con la confirmación del usuario para guardar (2 horas)
- Codificar las validaciones de planta sembrada y campos obligatorios (1,5 horas)
- Probar cada parte de la planta con fases correctas e incorrectas y datos incompletos (3 horas)
- Depurar el código (1 hora)

### HU-026 · Registrar la limpieza y el secado de plantas cosechadas

**Prioridad:** Media · **Estimación:** 12 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** registrar la limpieza y el secado a la sombra de las plantas cosechadas, **para** documentar el proceso de secado y su duración.

**Criterios de aceptación**

- **Registro de limpieza:** **Dada** una cosecha registrada, **cuando** el miembro registra la limpieza con su fecha, **entonces** el sistema guarda la actividad asociada a la cosecha. *[ESCENARIO IDEAL]*
- **Registro de secado:** **Dada** una cosecha registrada, **cuando** el miembro registra fecha de inicio y de fin del secado a la sombra con una duración de 10 a 15 días, **entonces** el sistema guarda la actividad. *[ESCENARIO IDEAL]*
- **Duración fuera de rango:** **Dado** un secado con duración menor a 10 o mayor a 15 días, **cuando** el miembro lo registra, **entonces** el sistema muestra una advertencia de que la duración recomendada es de 10 a 15 días y permite confirmar y guardar de todas formas. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Fechas incoherentes:** **Dado** un secado cuya fecha de fin es anterior a la de inicio, **cuando** el miembro lo registra, **entonces** el sistema no guarda e indica el error. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Sin cosecha registrada:** **Dada** una planta sin cosecha registrada, **cuando** el miembro intenta registrar su limpieza o su secado, **entonces** el sistema indica que primero debe registrar la cosecha (HU-025). *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar los formularios de limpieza y de secado (1 hora)
- Implementar el formulario de limpieza (1 hora)
- Implementar el formulario de secado con fecha de inicio y de fin (1,5 horas)
- Codificar el guardado de la limpieza asociada a la cosecha y la validación de que exista una cosecha registrada (1,5 horas)
- Codificar el guardado del secado y el cálculo de su duración en días (2 horas)
- Codificar la validación de que la fecha de fin no sea anterior a la de inicio (1 hora)
- Codificar la advertencia de duración fuera de 10 a 15 días, con la confirmación del usuario para guardar (1,5 horas)
- Probar con duraciones de 9, 10, 15 y 16 días y con fechas incoherentes (2 horas)
- Depurar el código (0,5 horas)

### HU-027 · Registrar el empaquetado, etiquetado y almacenaje

**Prioridad:** Media · **Estimación:** 16 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** registrar el empaquetado, etiquetado y almacenaje de las plantas secas, **para** documentar la información de uso y la fecha de caducidad de cada paquete.

**Criterios de aceptación**

- **Registro exitoso:** **Dada** una planta con secado registrado, **cuando** el miembro ingresa nombre, indicaciones de uso, dosificación, contraindicaciones, fecha de empaquetado, fecha de caducidad y cualidad (caliente o fría), **entonces** el sistema guarda el registro y lo asocia a la planta. *[ESCENARIO IDEAL]*
- **Caducidad en la Sierra:** **Dado** un huerto ubicado en la Sierra, **cuando** el miembro registra la fecha de caducidad, **entonces** el sistema admite hasta 12 meses desde el empaquetado para plantas almacenadas en fundas plásticas cerradas herméticamente en lugar fresco y seco. *[ESCENARIO IDEAL]*
- **Caducidad en la Costa y la Amazonía:** **Dado** un huerto ubicado en la Costa o en la Amazonía, **cuando** el miembro registra la fecha de caducidad, **entonces** el sistema admite hasta 6 meses desde el empaquetado. *[ESCENARIO IDEAL]*
- **Caducidad excedida:** **Dada** una fecha de caducidad posterior al máximo permitido para la región del huerto (Sierra: 12 meses; Costa y Amazonía: 6 meses), **cuando** el miembro la registra, **entonces** el sistema no guarda e indica el máximo permitido. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Datos incompletos:** **Dado** un miembro en el formulario, **cuando** omite un dato obligatorio de la etiqueta, **entonces** el sistema no guarda e indica los campos faltantes. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el modelo de datos del paquete: nombre, indicaciones de uso, dosificación, contraindicaciones, fechas y cualidad (1,5 horas)
- Diseñar la interfaz del formulario de empaquetado y etiquetado (1 hora)
- Implementar el formulario con todos los datos de la etiqueta (3 horas)
- Codificar el guardado del paquete asociado a la planta con secado registrado (2 horas)
- Crear la tabla de caducidad máxima por región: Sierra 12 meses, Costa y Amazonía 6 meses (1,5 horas)
- Codificar el cálculo y la validación de la fecha de caducidad según la región del huerto (3 horas)
- Codificar la validación de campos obligatorios de la etiqueta (1 hora)
- Probar con huertos de distintas regiones, caducidad excedida y datos incompletos (2 horas)
- Depurar el código (1 hora)

### HU-028 · Adjuntar fotografías y videos a las actividades

**Prioridad:** Media · **Estimación:** 16 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** adjuntar fotografías y videos a mis actividades, **para** construir la historia visual del crecimiento de las plantas.

**Criterios de aceptación**

- **Adjunto exitoso:** **Dada** una actividad registrada, **cuando** el miembro adjunta una fotografía o un video válido, **entonces** el sistema lo asocia a la actividad y lo muestra en la historia visual de la planta. *[ESCENARIO IDEAL]*
- **Archivo inválido:** **Dado** un archivo con un formato distinto de JPG, PNG o MP4, o que supera el tamaño máximo, o una actividad que ya tiene 5 archivos, **cuando** el miembro intenta adjuntarlo, **entonces** el sistema lo rechaza e indica el motivo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Planta sin archivos:** **Dada** una planta cuyas actividades no tienen fotografías ni videos, **cuando** el miembro abre su historia visual, **entonces** el sistema muestra un mensaje de que aún no hay archivos, sin errores. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar la carga de archivos y la vista de historia visual por planta (1,5 horas)
- Implementar el componente de carga de fotografías y videos en el formulario de actividad (3 horas)
- Codificar el almacenamiento de los archivos (3 horas)
- Codificar la asociación del archivo con la actividad (2 horas)
- Implementar la vista de historia visual de crecimiento de la planta (3 horas)
- Codificar la validación de formato y tamaño de archivo (JPG, PNG, MP4), de tamaño (5 MB y 50 MB (1,5 horas)
- Probar con fotografías y videos válidos e inválidos (2 horas)

### HU-029 · Consultar el calendario de actividades

**Prioridad:** Media · **Estimación:** 12 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** consultar un calendario con las actividades registradas de mi huerto, **para** hacer seguimiento de lo realizado.

**Criterios de aceptación**

- **Consulta exitosa:** **Dada** una comunidad con actividades registradas, **cuando** el miembro abre el calendario, **entonces** el sistema muestra las actividades por fecha con su tipo y la planta asociada. *[ESCENARIO IDEAL]*
- **Sin actividades:** **Dada** una comunidad sin actividades, **cuando** el miembro abre el calendario, **entonces** el sistema muestra un calendario vacío con un mensaje informativo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar la vista del calendario de actividades (1 hora)
- Implementar la vista mensual del calendario (3 horas)
- Codificar la consulta de actividades por rango de fechas (2,5 horas)
- Mostrar en cada día el tipo de actividad y la planta asociada (1,5 horas)
- Codificar el estado vacío con mensaje informativo (1 hora)
- Probar con distintas cantidades de actividades (2 horas)
- Depurar el código (1 hora)

## 5. PUNTOS

### HU-030 · Obtener puntos por actividades registradas

**Prioridad:** Alta · **Estimación:** 12 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** recibir puntos al registrar actividades completadas, **para** motivarme a mantener el cuidado del huerto.

**Criterios de aceptación**

- **Puntos otorgados:** **Dado** un miembro que registra una actividad completada y válida, **cuando** el sistema guarda la actividad, **entonces** acredita al miembro los puntos que la tabla de puntos fija para ese tipo de actividad (preparación de la tierra, estructura de siembra y ritual de siembra: 10; siembra: 15; señalética, cuidados, riego y baño: 5; ritual de gratitud: 10; cosecha: 15; limpieza: 5; secado: 10; empaquetado: 15) y actualiza su total y el de su comunidad. *[ESCENARIO IDEAL]*
- **Bono por seguir la recomendación:** **Dada** una actividad registrada sin advertencias de fase lunar, hora o duración, **cuando** el sistema la guarda, **entonces** acredita 5 puntos adicionales. *[ESCENARIO IDEAL]*
- **Actividad con advertencia confirmada:** **Dada** una actividad guardada después de confirmar una advertencia, **cuando** el sistema acredita los puntos, **entonces** otorga los puntos base sin el bono. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Registro rechazado:** **Dada** una actividad cuyo registro es rechazado por datos inválidos o incompletos, **cuando** el miembro intenta guardarla, **entonces** el sistema no acredita puntos. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Actividad repetida el mismo día:** **Dado** un miembro que registra el mismo tipo de actividad sobre la misma planta el mismo día, **cuando** el sistema la guarda por segunda vez, **entonces** guarda la actividad pero no acredita puntos de nuevo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el esquema de puntos por tipo de actividad y la regla del bono (2 horas)
- Crear la tabla de configuración de puntos por actividad (1 hora)
- Codificar la acreditación de puntos al guardar una actividad válida (2,5 horas)
- Codificar la actualización del total acumulado del miembro y de su comunidad (1,5 horas)
- Codificar la regla de que el mismo tipo de actividad sobre la misma planta el mismo día da puntos una sola vez (1 hora)
- Codificar el bono de 5 puntos para actividades sin advertencias (1 hora)
- Codificar que no se acrediten puntos cuando el registro es rechazado (1,5 horas)
- Probar con cada tipo de actividad, con y sin advertencias, repetidas el mismo día y rechazadas (2 horas)

### HU-031 · Obtener insignias por hitos

**Prioridad:** Media · **Estimación:** 14 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** recibir insignias al lograr hitos, **para** que se reconozcan mis logros en el cuidado del huerto.

**Criterios de aceptación**

- **Insignia otorgada:** **Dado** un miembro que cumple la condición de una insignia del catálogo, **cuando** el sistema guarda la actividad que completa la condición, **entonces** otorga la insignia, muestra un mensaje de felicitación y la agrega a su perfil. El catálogo es: Guardián de la Semilla (3 siembras), Experto en Abono (3 preparaciones de la tierra con abono orgánico), Primera Cosecha (1 cosecha), Secador Paciente (3 secados de 10 a 15 días), Fiel al Calendario Lunar (10 actividades sin advertencias) y Memoria del Huerto (10 fotografías o videos adjuntos). *[ESCENARIO IDEAL]*
- **Insignia no repetida:** **Dado** un miembro que ya tiene una insignia, **cuando** vuelve a cumplir el hito, **entonces** el sistema no la otorga de nuevo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Condición incompleta:** **Dado** un miembro que aún no cumple todas las condiciones de una insignia, **cuando** registra una actividad, **entonces** el sistema no la otorga. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Actividades de otro miembro:** **Dada** una actividad registrada por otro miembro de la misma comunidad, **cuando** el sistema evalúa las condiciones, **entonces** no la cuenta para las insignias de quien no la registró. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Perfil sin insignias:** **Dado** un miembro sin insignias, **cuando** abre la sección de insignias de su perfil, **entonces** el sistema muestra las insignias disponibles bloqueadas, con su condición. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el catálogo de insignias y sus condiciones: Guardián de la Semilla, Experto en Abono, Primera Cosecha, Secador Paciente, Fiel al Calendario Lunar y Memoria del Huerto (2 horas)
- Crear las tablas de insignias y de insignias obtenidas por miembro (1 hora)
- Codificar la evaluación del cumplimiento de las condiciones al guardar una actividad, contando solo las del propio miembro (4 horas)
- Codificar el otorgamiento y registro de la insignia, con el mensaje de felicitación (2 horas)
- Codificar la validación para no otorgar una insignia repetida. (1,5 horas)
- Implementar la visualización de insignias en el perfil, con las no obtenidas bloqueadas y su condición (1,5 horas)
- Probar el otorgamiento de cada insignia, el caso repetido, la condición incompleta y las actividades de otro miembro (2 horas)

### HU-032 · Completar misiones o retos

**Prioridad:** Media · **Estimación:** 16 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** consultar y completar misiones o retos, **para** tener metas que guíen el trabajo del huerto.

**Criterios de aceptación**

- **Consulta de misiones:** **Dado** un miembro con sesión activa, **cuando** abre la sección de misiones, **entonces** el sistema muestra las cuatro misiones con su requisito, su recompensa y su estado (pendiente, en progreso con avance, o completada). *[ESCENARIO IDEAL]*
- **Misión completada:** **Dado** un miembro que cumple los requisitos de una misión, **cuando** el sistema guarda la actividad que completa el requisito, **entonces** marca la misión como completada, acredita su recompensa en puntos al miembro y a su comunidad, y muestra un mensaje de felicitación. *[ESCENARIO IDEAL]*
- **Misión incompleta:** **Dado** un miembro que no cumple todos los requisitos, **cuando** el sistema evalúa su progreso, **entonces** la misión permanece pendiente o en progreso y no acredita recompensa. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Misión no repetida:** **Dado** un miembro que ya completó una misión, **cuando** vuelve a cumplir sus requisitos, **entonces** el sistema no acredita la recompensa de nuevo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Actividades con advertencia:** **Dada** una actividad guardada después de confirmar una advertencia, **cuando** el sistema evalúa la misión Ciclo lunar perfecto, **entonces** no la cuenta para esa misión. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el esquema de misiones: Ciclo lunar perfecto, Del huerto al paquete, Huerto sembrado y Una semana de cuidado, con sus requisitos y recompensas (2,5 horas)
- Crear las tablas de misiones con requisito y recompensa y de progreso por miembro y misión (1,5 horas)
- Implementar la pantalla de misiones con su estado y avance (2,5 horas)
- Codificar la consulta del progreso de cada misión (2 horas)
- Codificar la evaluación del cumplimiento de requisitos al guardar una actividad, incluida la regla de las fases lunares sin advertencias y la de días seguidos (3 horas)
- Codificar la acreditación de la recompensa en puntos al miembro y a su comunidad, una sola vez por misión (1,5 horas)
- Probar cada misión completa e incompleta, el caso repetido y las actividades con advertencia (2,5 horas)
- Depurar el código (0,5 horas)

### HU-033 · Certificar talentos y ascender de nivel

**Prioridad:** Alta · **Estimación:** 20 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** que mis acciones certifiquen mis talentos y me asciendan de nivel (aprendiz, oficial, maestro), **para** ver reconocido mi avance en el conocimiento de los huertos medicinales.

**Criterios de aceptación**

- **Talento certificado:** **Dado** un miembro que cumple la condición de un talento (por ejemplo, 5 siembras para «Sembrador»), **cuando** el sistema guarda la actividad que completa la condición, **entonces** certifica el talento y lo muestra en su perfil y en la lista de miembros de su comunidad. *[ESCENARIO IDEAL]*
- **Ascenso de nivel:** **Dado** un miembro que cumple las condiciones del siguiente nivel (Oficial: 150 puntos y 2 talentos; Maestro: 500 puntos y 4 talentos), **cuando** el sistema evalúa su progreso, **entonces** lo asciende de aprendiz a oficial, o de oficial a maestro, y muestra el nuevo nivel en su perfil con un mensaje de felicitación. *[ESCENARIO IDEAL]*
- **Condiciones no cumplidas:** **Dado** un miembro que no cumple las condiciones, **cuando** el sistema evalúa su progreso, **entonces** conserva su nivel y sus talentos actuales. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Puntos sin talentos suficientes:** **Dado** un miembro que alcanza los puntos de un nivel pero no los talentos requeridos, **cuando** el sistema evalúa su progreso, **entonces** no lo asciende y conserva su nivel. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Nivel máximo:** **Dado** un miembro con nivel de maestro, **cuando** el sistema evalúa su progreso, **entonces** conserva su nivel y no intenta ascenderlo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar las reglas de certificación de los seis talentos y su cantidad requerida (3 horas)
- Diseñar las reglas de ascenso: Oficial con 150 puntos y 2 talentos, Maestro con 500 puntos y 4 talentos (2 horas)
- Crear las tablas de talentos (con su condición), de talentos certificados por miembro y de niveles (1,5 horas)
- Codificar la evaluación de las actividades registradas por el miembro para certificar talentos (4 horas)
- Codificar el ascenso de nivel con la comprobación de puntos y talentos (3,5 horas)
- Codificar la actualización del perfil y de la lista de miembros con el nivel y los talentos (1,5 horas)
- Codificar que el miembro conserve nivel y talentos si no cumple las condiciones y no pase del nivel de maestro (1,5 horas)
- Probar cada talento, cada transición de nivel, los puntos sin talentos suficientes y los casos sin cambio (3 horas)

### HU-034 · Consultar mis puntos, insignias, nivel y talentos

**Prioridad:** Media · **Estimación:** 8 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** consultar mis puntos, insignias, nivel de expertise y talentos certificados, **para** conocer mi progreso.

**Criterios de aceptación**

- **Consulta exitosa:** **Dado** un miembro con sesión activa, **cuando** abre su progreso, **entonces** el sistema muestra sus puntos acumulados, insignias, nivel y talentos certificados. *[ESCENARIO IDEAL]*
- **Avance al siguiente nivel:** **Dado** un miembro con nivel de aprendiz u oficial, **cuando** abre su progreso, **entonces** el sistema muestra cuántos puntos y cuántos talentos le faltan para el siguiente nivel. *[ESCENARIO IDEAL]*
- **Miembro sin progreso:** **Dado** un miembro sin actividades, **cuando** abre su progreso, **entonces** el sistema muestra cero puntos y sin insignias, con su nivel inicial. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar la pantalla de progreso personal (1 hora)
- Implementar la interfaz con puntos, insignias, nivel, talentos y el avance al siguiente nivel (2 horas)
- Codificar la consulta de puntos, insignias, nivel y talentos del miembro (2 horas)
- Codificar el estado inicial: cero puntos, sin insignias y nivel inicial (1 hora)
- Probar con miembros con y sin progreso (1,5 horas)
- Depurar el código (0,5 horas)

### HU-035 · Consultar el ranking de comunidades

**Prioridad:** Alta · **Estimación:** 16 horas

**Historia de usuario**

> **Como** miembro de una comunidad **quiero** consultar el ranking de los huertos medicinales participantes, **para** conocer el lugar de mi comunidad y motivarme con la competencia positiva.

**Criterios de aceptación**

- **Consulta exitosa:** **Dado** un usuario con sesión activa, **cuando** abre el ranking, **entonces** el sistema muestra las comunidades ordenadas por puntos por miembro (puntos totales entre el número de miembros), con la posición, el nombre y el puntaje de cada una, y destaca la de su comunidad. *[ESCENARIO IDEAL]*
- **Actualización:** **Dada** una comunidad que acumula nuevos puntos, **cuando** se consulta de nuevo el ranking, **entonces** su lugar refleja el cambio. *[ESCENARIO IDEAL]*
- **Empate:** **Dadas** dos comunidades con el mismo puntaje por miembro, **cuando** se muestra el ranking, **entonces** el sistema coloca primero a la que tiene más puntos totales y, si persiste el empate, a la que alcanzó ese puntaje antes. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Comunidades sin puntos:** **Dadas** comunidades sin puntos, **cuando** se muestra el ranking, **entonces** el sistema las lista al final, ordenadas por fecha de registro. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Sin comunidades:** **Dado** un sistema sin comunidades con puntos, **cuando** se abre el ranking, **entonces** el sistema muestra un mensaje informativo sin errores. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar la tabla de clasificación y la regla de cálculo: puntos totales entre el número de miembros, con sus desempates (2 horas)
- Diseñar la interfaz del ranking, con la comunidad del usuario destacada (1 hora)
- Implementar la tabla del ranking con posición, nombre y puntaje de cada comunidad, con paginación (3 horas)
- Codificar el cálculo del ranking y de la posición de cada comunidad (3 horas)
- Codificar la actualización de la posición cuando la comunidad acumula puntos (2 horas)
- Codificar las reglas de desempate y el orden de las comunidades sin puntos (1,5 horas)
- Codificar el estado vacío cuando no hay comunidades (1 hora)
- Probar con distintas cantidades de comunidades, con empates, con comunidades de una sola persona y con comunidades sin puntos (2 horas)
- Depurar el código (0,5 horas)

## 6. PROTECCIÓN DE DATOS

### HU-036 · Aceptar el tratamiento de datos personales al registrarse

**Prioridad:** Alta · **Estimación:** 6 horas

**Historia de usuario**

> **Como** persona que se registra como voluntario **quiero** conocer y aceptar de forma expresa cómo se tratarán mis datos personales, **para** decidir con información si comparto mis datos, conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador.

**Criterios de aceptación**

- **Aceptación registrada:** **Dada** una persona que completa el registro y marca la casilla de aceptación, **cuando** confirma, **entonces** el sistema crea la cuenta y guarda la fecha y hora de la aceptación y la versión de la política aceptada. *[ESCENARIO IDEAL]*
- **Política disponible antes de aceptar:** **Dada** una persona en el formulario de registro, **cuando** abre el enlace «política de privacidad», **entonces** el sistema muestra la política en una pestaña nueva sin perder lo que ya escribió en el formulario. *[ESCENARIO IDEAL]*
- **Sin aceptación:** **Dada** una persona que no marca la casilla de aceptación, **cuando** confirma el registro, **entonces** el sistema no crea la cuenta e indica junto a la casilla que debe aceptar el tratamiento de datos para continuar. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Aceptación no implícita:** **Dada** una persona que abre el formulario de registro, **cuando** lo ve por primera vez, **entonces** la casilla aparece sin marcar. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Validación en el servidor:** **Dada** una solicitud de registro que llega al servidor sin la aceptación, **cuando** el servidor la procesa, **entonces** la rechaza aunque la interfaz haya sido omitida. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Agregar al modelo del voluntario la fecha de aceptación y la versión de la política (0,5 horas)
- Redactar la página de política de privacidad: datos que se recogen, finalidad, conservación y derechos de acceso, rectificación y eliminación (1 hora)
- Implementar la casilla de aceptación con el enlace a la política, que se abre en una pestaña nueva (1 hora)
- Codificar la validación en el servidor y el guardado de la fecha y la versión (1,5 horas)
- Codificar el mensaje de error junto a la casilla (0,5 horas)
- Probar el registro con y sin aceptación, y el enlace a la política (1,5 horas)

## 7. MODELO ACORDADO CON EL MSP (v2.0.0)

Historias que nacen de la reunión con la Ing. Sandra Sánchez (MSP) del 06/11/2026. Reemplazan el auto-registro de voluntarios y la creación libre de comunidades de v1: ahora solo tienen cuenta el responsable del huerto, el técnico del MSP y el administrador; los voluntarios los registra el responsable. El detalle de cómo se integró cada punto de la reunión está en [reunion-msp-2026-11-06.md](../reunion-msp-2026-11-06.md).

### HU-037 · Solicitar crear un huerto

**Prioridad:** Alta · **Estimación:** 14 horas

**Historia de usuario**

> **Como** persona de la comunidad sin cuenta **quiero** solicitar la creación de un huerto con la ubicación georreferenciada, el tipo y los subtipos, mi nombre, cédula, correo y celular, **para** que el MSP lo registre y yo quede como responsable.

**Criterios de aceptación**

- **Solicitud válida:** **Dada** una persona en «Solicitar huerto», **cuando** marca la ubicación en el mapa (o usa el GPS), elige el tipo y de 1 a 3 subtipos, ingresa la altitud y sus datos y acepta la política de datos, **entonces** el sistema guarda la solicitud como pendiente y le informa que el MSP la contactará. *[ESCENARIO IDEAL]*
- **Datos inválidos:** **Dada** una cédula que no cumple el módulo 10, un celular que no empieza con 09, una ubicación fuera de Ecuador o un subtipo que no corresponde al tipo, **cuando** envía, **entonces** el sistema no guarda la solicitud e indica cada campo a corregir. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Solicitud duplicada:** **Dada** una cédula con una solicitud pendiente, **cuando** envía otra, **entonces** el sistema la rechaza e indica que ya hay una en revisión. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Sin consentimiento:** **Dada** una persona que no acepta la política de datos, **cuando** envía, **entonces** el sistema no guarda nada. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar el modelo `SolicitudHuerto` y su estado (1 hora)
- Implementar el formulario público con mapa Leaflet, GPS y subtipos según el tipo (4 horas)
- Codificar la validación de cédula (módulo 10), celular, coordenadas y subtipos en `@nexo/shared` (2 horas)
- Codificar el endpoint `POST /publico/solicitudes` con la regla de no duplicar (2 horas)
- Probar con datos válidos e inválidos (3 horas)
- Depurar el código (2 horas)

### HU-038 · Aprobar o rechazar una solicitud de huerto

**Prioridad:** Alta · **Estimación:** 14 horas

**Historia de usuario**

> **Como** técnico del MSP **quiero** aprobar o rechazar las solicitudes de huerto después de contactar a la persona, **para** mantener centralizado el registro de huertos y responsables que el MSP financiará.

**Criterios de aceptación**

- **Aprobación:** **Dada** una solicitud pendiente, **cuando** el técnico la aprueba, **entonces** el sistema crea el huerto y la cuenta del responsable y le envía por correo su usuario y una contraseña temporal. *[ESCENARIO IDEAL]*
- **Responsable que ya tiene cuenta:** **Dada** una solicitud con el correo de un responsable existente, **cuando** se aprueba, **entonces** el huerto se asigna a esa cuenta sin crear otra. *[ESCENARIO IDEAL]*
- **Rechazo:** **Dada** una solicitud pendiente, **cuando** el técnico la rechaza, **entonces** debe escribir el motivo, la solicitud queda archivada con él y se avisa a la persona. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Falla del correo:** **Dado** que el servidor de correo no responde, **cuando** se aprueba, **entonces** no se aprueba nada y el técnico ve un mensaje para reintentar. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Implementar la bandeja de solicitudes con filtros por estado (3 horas)
- Codificar la aprobación en una transacción: cuenta, huerto, historial y correo (3 horas)
- Configurar el envío de correo (Mailpit en desarrollo) (2 horas)
- Codificar el rechazo con motivo obligatorio (1 hora)
- Probar aprobación, cuenta existente, rechazo y falla del correo (3 horas)
- Depurar el código (2 horas)

### HU-039 · Cambiar la contraseña temporal

**Prioridad:** Alta · **Estimación:** 6 horas

**Historia de usuario**

> **Como** responsable recién aprobado **quiero** cambiar la contraseña temporal que recibí por correo, **para** que solo yo conozca mi clave.

**Criterios de aceptación**

- **Primer ingreso:** **Dada** una cuenta con clave temporal, **cuando** la persona ingresa, **entonces** el sistema la lleva a crear su contraseña y no le permite usar otras pantallas hasta hacerlo. *[ESCENARIO IDEAL]*
- **Clave inválida:** **Dada** una nueva contraseña de menos de 8 caracteres, igual a la temporal o con la actual incorrecta, **cuando** guarda, **entonces** el sistema no la cambia e indica el motivo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Codificar la marca `debeCambiarClave` y su bloqueo en el guardia de la API (2 horas)
- Implementar la pantalla de cambio de contraseña (2 horas)
- Probar (1 hora) y depurar (1 hora)

### HU-040 · Registrar voluntarios sin cuenta

**Prioridad:** Alta · **Estimación:** 12 horas

**Historia de usuario**

> **Como** responsable del huerto **quiero** agregar a los voluntarios o marcarlos como inactivos, **para** registrar quién trabaja en cada actividad sin que ellos necesiten una cuenta.

**Criterios de aceptación**

- **Agregar:** **Dado** un responsable, **cuando** ingresa nombre, fecha de nacimiento, género y (opcional) cédula, **entonces** el voluntario queda activo como Aprendiz. *[ESCENARIO IDEAL]*
- **Varios huertos:** **Dada** una cédula que ya existe en otro huerto, **cuando** la agrega, **entonces** se reutiliza el mismo voluntario, que suma puntos en ambos. *[ESCENARIO IDEAL]*
- **Inactivar:** **Dado** un voluntario activo, **cuando** el responsable lo marca inactivo, **entonces** ya no aparece para registrar horas, pero conserva su historial. No se expulsa a nadie. *[ESCENARIO IDEAL]*
- **Datos inválidos:** **Dada** una fecha de nacimiento futura, una cédula inválida o un voluntario repetido en el mismo huerto, **cuando** guarda, **entonces** el sistema lo rechaza e indica el campo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Diseñar los modelos `Voluntario` y `VoluntarioHuerto` (2 horas)
- Implementar la pantalla de voluntarios con su nivel, horas y talentos (4 horas)
- Codificar alta, reutilización por cédula e inactivación (3 horas)
- Probar (2 horas) y depurar (1 hora)

### HU-041 · Pedir que un voluntario con experiencia entre como Oficial o Maestro

**Prioridad:** Media · **Estimación:** 7 horas

**Historia de usuario**

> **Como** responsable **quiero** pedir al MSP que un voluntario con experiencia entre como Oficial o Maestro, con una justificación, **para** reconocer su saber desde el inicio.

**Criterios de aceptación**

- **Solicitud y aprobación:** **Dada** una justificación de al menos 20 caracteres, **cuando** el responsable la envía y el técnico la aprueba, **entonces** el voluntario sube a ese nivel. *[ESCENARIO IDEAL]*
- **Rechazo:** **Dada** una solicitud pendiente, **cuando** el técnico la rechaza con motivo, **entonces** el voluntario sigue como Aprendiz y el responsable ve el motivo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Nivel igual o menor:** **Dado** un voluntario que ya tiene ese nivel o uno mayor, **cuando** se pide, **entonces** el sistema lo rechaza. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Modelo `SolicitudNivel` y endpoints de solicitud y revisión (3 horas)
- Pantallas del responsable y del técnico (2 horas)
- Probar y depurar (2 horas)

### HU-042 · Elegir plantas del catálogo según la altitud

**Prioridad:** Alta · **Estimación:** 8 horas

**Historia de usuario**

> **Como** responsable **quiero** elegir las plantas de mi huerto del catálogo del MSP, filtradas por la altitud del huerto, **para** sembrar plantas medicinales que se adapten a mi lugar.

**Criterios de aceptación**

- **Planta apta:** **Dada** una planta cuyo rango de altitud incluye la del huerto, **cuando** el responsable la agrega, **entonces** queda en el huerto. *[ESCENARIO IDEAL]*
- **Otra altitud:** **Dada** una planta de otra altitud, **cuando** la agrega, **entonces** el sistema advierte «¿está seguro?» y la agrega solo si confirma. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Solo medicinales:** **Dado** el catálogo, **cuando** el responsable busca, **entonces** solo ve plantas medicinales aprobadas por el MSP. *[ESCENARIO IDEAL]*

**Tareas de implementación**

- Convertir `Planta` en catálogo global y crear `HuertoPlanta` (2 horas)
- Codificar el filtro y la advertencia de altitud (2 horas)
- Implementar la pantalla de plantas del huerto (2 horas)
- Probar y depurar (2 horas)

### HU-043 · Administrar el catálogo de plantas y las solicitudes de plantas nuevas

**Prioridad:** Alta · **Estimación:** 12 horas

**Historia de usuario**

> **Como** técnico del MSP **quiero** cargar y editar el catálogo de plantas medicinales, también con un archivo CSV, y analizar las plantas que proponen los responsables, **para** mantener un catálogo confiable.

**Criterios de aceptación**

- **Alta y edición:** **Dada** una planta con nombre común y científico, ciclo, cualidad caliente o fría y usos, **cuando** el técnico la guarda, **entonces** queda disponible en el catálogo, con foto opcional. *[ESCENARIO IDEAL]*
- **Carga CSV:** **Dado** un CSV con encabezado, **cuando** el técnico lo sube, **entonces** el sistema crea o actualiza cada planta y reporta las líneas con error sin detenerse. *[ESCENARIO IDEAL]*
- **Propuesta de un responsable:** **Dada** una propuesta con toda su información y la confirmación de que es medicinal, **cuando** el técnico la aprueba o la rechaza con motivo, **entonces** entra al catálogo o queda rechazada y el responsable ve el resultado. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Endpoints de catálogo, foto e importación CSV (4 horas)
- Pantalla del catálogo con formulario y carga (4 horas)
- Formulario «Solicitar añadir planta» del responsable (2 horas)
- Probar y depurar (2 horas)

### HU-044 · Registrar los pasos del ciclo en orden, con voluntarios, horas y evidencia

**Prioridad:** Alta · **Estimación:** 24 horas

**Historia de usuario**

> **Como** responsable **quiero** registrar cada paso de un ciclo de siembra después de hacerlo, con los voluntarios que participaron, sus horas y fotos o videos reales, **para** que el MSP lo valide y el sistema me muestre el paso siguiente con sus indicaciones.

**Criterios de aceptación**

- **Paso siguiente:** **Dado** un ciclo con el paso N registrado, **cuando** el responsable abre «Registrar», **entonces** ve el paso N+1 con cuándo y cómo hacerlo según los lineamientos del MSP. Cuidado y riego se pueden repetir entre la siembra y el baño. *[ESCENARIO IDEAL]*
- **Registro válido:** **Dados** fecha pasada, participantes con horas y al menos una evidencia, **cuando** registra, **entonces** la actividad queda pendiente de validación y el huerto virtual avanza. *[ESCENARIO IDEAL]*
- **Calendario ancestral:** **Dada** una fase lunar o una hora distinta a la recomendada, **cuando** registra, **entonces** el sistema advierte y permite confirmar; la actividad pierde el bono. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Validaciones mínimas:** **Dado** un paso fuera de orden, una fecha futura, un voluntario con más de 24 horas en el día, sin evidencia, o una señalética de color que no corresponde a la cualidad de la planta, **cuando** registra, **entonces** el sistema lo rechaza e indica la corrección. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Definir los 13 pasos con sus indicaciones en `@nexo/shared` (3 horas)
- Extender `validarActividad` a los 13 pasos y a los participantes (5 horas)
- Modelos `Ciclo`, `Participacion` y `ArchivoActividad` y subida de archivos (4 horas)
- Pantallas de actividades y de registro con subida de fotos (6 horas)
- Probar (4 horas) y depurar (2 horas)

### HU-045 · Validar evidencias y otorgar puntos

**Prioridad:** Alta · **Estimación:** 12 horas

**Historia de usuario**

> **Como** técnico del MSP **quiero** revisar las fotos y videos de cada actividad y aprobarlas o rechazarlas, **para** otorgar los puntos solo cuando la evidencia es real y del huerto correcto.

**Criterios de aceptación**

- **Aprobación:** **Dada** una evidencia válida, **cuando** el técnico la aprueba, **entonces** cada voluntario recibe 10 puntos por hora (+10 % si siguió el calendario) y se recalculan su nivel y el ranking. *[ESCENARIO IDEAL]*
- **Segunda oportunidad:** **Dada** una evidencia rechazada con motivo, **cuando** el responsable sube una nueva, **entonces** vuelve a revisión y, si se aprueba, vale el 50 %. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*
- **Sin más intentos:** **Dada** una segunda evidencia rechazada, **cuando** el responsable intenta subir otra, **entonces** el sistema no lo permite: no hay puntos, pero el ciclo sigue. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Bandeja de evidencias con visor de fotos y videos (3 horas)
- Codificar la acreditación en una transacción con el libro de puntos (3 horas)
- Codificar rechazo y reenvío con intento (2 horas)
- Probar y depurar (4 horas)

### HU-046 · Registrar un paso no cumplido o una cosecha perdida

**Prioridad:** Media · **Estimación:** 6 horas

**Historia de usuario**

> **Como** responsable **quiero** indicar que un paso no se hizo o que la cosecha se dañó, eligiendo la causa, **para** seguir con el ciclo o empezar otro sin penalizaciones fuertes.

**Criterios de aceptación**

- **Paso no cumplido:** **Dado** el paso que corresponde, **cuando** el responsable indica que no se hizo, **entonces** queda «no cumplido» con 0 puntos y se muestra el paso siguiente. *[ESCENARIO IDEAL]*
- **Cosecha perdida:** **Dado** un ciclo activo, **cuando** el responsable elige una causa (helada, sequía, plaga…) y la justifica, **entonces** el ciclo queda fallido, deja de ganar los puntos restantes y la planta puede empezar otro ciclo. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Lista de causas en `@nexo/shared` y endpoints de omitir y fracaso (2 horas)
- Diálogos en la pantalla de actividades (2 horas)
- Probar y depurar (2 horas)

### HU-047 · Subir de nivel automáticamente

**Prioridad:** Media · **Estimación:** 6 horas

**Historia de usuario**

> **Como** voluntario **quiero** subir de nivel automáticamente según mis horas y la variedad de actividades, **para** ver reconocido mi aprendizaje.

**Criterios de aceptación**

- **Ascenso:** **Dado** un Aprendiz con 40 horas validadas en 4 tipos de actividad, **cuando** el MSP aprueba su evidencia, **entonces** pasa a Oficial; con 150 horas, 8 tipos y un ciclo completo pasa a Maestro. *[ESCENARIO IDEAL]*
- **Nunca baja:** **Dado** un voluntario que entró como Oficial por experiencia, **cuando** aún no tiene horas, **entonces** conserva su nivel. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Reglas `nivelPorAvance`, `siguienteNivel` y talentos con pruebas (3 horas)
- Recalcular al acreditar y mostrar la meta en la pantalla de voluntarios (3 horas)

### HU-048 · Consultar los rankings por tipo de huerto y de producción

**Prioridad:** Alta · **Estimación:** 8 horas

**Historia de usuario**

> **Como** persona del público **quiero** ver un ranking por tipo de huerto normalizado por el número de voluntarios y otro de producción, **para** conocer qué huertos destacan.

**Criterios de aceptación**

- **Ranking por tipo:** **Dado** un tipo de huerto, **cuando** se consulta, **entonces** se ordena por puntos de los últimos 12 meses ÷ √(voluntarios activos + 1), desempatando por quien llegó primero. *[ESCENARIO IDEAL]*
- **Producción:** **Dado** el año, **cuando** se consulta, **entonces** se listan los paquetes con evidencia validada por huerto. *[ESCENARIO IDEAL]*
- **Tipo inválido:** **Dado** un tipo que no existe, **cuando** se consulta, **entonces** la API responde 400. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Fórmula `indiceRanking` y `ordenarRanking` con pruebas (2 horas)
- Endpoints de ranking y producción (2 horas)
- Pantalla de ranking (2 horas)
- Probar y depurar (2 horas)

### HU-049 · Consultar la información pública sin iniciar sesión

**Prioridad:** Alta · **Estimación:** 14 horas

**Historia de usuario**

> **Como** invitado sin cuenta **quiero** ver el mapa de huertos, la ficha de un huerto con su huerto virtual, las estadísticas por provincia y el catálogo de plantas, **para** conocer el alcance de los huertos medicinales y animarme a participar.

**Criterios de aceptación**

- **Mapa y ficha:** **Dado** un huerto activo, **cuando** el invitado lo abre, **entonces** ve su tipo, plantas, niveles de su comunidad, insignias, puesto en el ranking, historia visual y espejo digital. *[ESCENARIO IDEAL]*
- **Estadísticas:** **Dado** el público, **cuando** abre estadísticas, **entonces** ve huertos por provincia y tipo, voluntarios por nivel, plantas más cultivadas y producción por año. *[ESCENARIO IDEAL]*
- **Privacidad:** **Dado** cualquier dato público, **cuando** se muestra, **entonces** no incluye cédulas, correos ni celulares y la ubicación se redondea a unos 1 km. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Endpoints públicos (4 horas)
- Pantallas de portada, mapa, ficha y estadísticas (6 horas)
- Probar con axe y depurar (4 horas)

### HU-050 · Mantener el registro centralizado y cambiar de responsable

**Prioridad:** Media · **Estimación:** 8 horas

**Historia de usuario**

> **Como** técnico del MSP **quiero** consultar y exportar el registro de huertos, responsables y voluntarios, cambiar al responsable de un huerto y restablecer contraseñas, **para** gestionar el financiamiento.

**Criterios de aceptación**

- **Exportar:** **Dado** el registro, **cuando** el técnico exporta, **entonces** descarga un CSV con huertos, responsables y voluntarios. *[ESCENARIO IDEAL]*
- **Cambio de responsable:** **Dado** un huerto, **cuando** el técnico registra a otra persona, **entonces** queda un solo responsable a la vez, se guarda el historial y la persona recibe su acceso por correo. *[ESCENARIO IDEAL]*
- **Correo de una cuenta del MSP:** **Dado** un correo de un técnico o administrador, **cuando** se intenta usar como responsable, **entonces** el sistema lo rechaza. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Endpoints de registro, CSV, cambio de responsable y restablecer clave (4 horas)
- Pantalla de registro (2 horas)
- Probar y depurar (2 horas)

### HU-051 · Administrar el sistema

**Prioridad:** Media · **Estimación:** 6 horas

**Historia de usuario**

> **Como** administrador técnico del sistema **quiero** ver el estado de la base de datos, descargar respaldos y crear cuentas para los técnicos del MSP, **para** dar soporte a la plataforma.

**Criterios de aceptación**

- **Respaldo:** **Dado** el administrador, **cuando** pide un respaldo, **entonces** descarga un SQL completo generado con `pg_dump`. *[ESCENARIO IDEAL]*
- **Cuentas:** **Dado** un técnico nuevo, **cuando** el administrador crea su cuenta, **entonces** recibe una clave temporal por correo; el administrador no puede desactivar su propia cuenta. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Endpoints de estado, respaldo y cuentas (3 horas)
- Pantallas del administrador (2 horas)
- Probar (1 hora)

### HU-052 · Aprender los saberes ancestrales del huerto

**Prioridad:** Alta · **Estimación:** 6 horas

**Historia de usuario**

> **Como** persona interesada **quiero** consultar los 13 pasos del huerto medicinal con su momento, su técnica y su fase lunar, y el calendario lunar del mes, **para** aprender el saber ancestral antes y durante la siembra.

**Criterios de aceptación**

- **Guía:** **Dada** la página de saberes, **cuando** la abre, **entonces** ve cada paso con cuándo y cómo hacerlo según los lineamientos del MSP (2017). *[ESCENARIO IDEAL]*
- **Calendario:** **Dado** un mes, **cuando** elige un día, **entonces** ve su fase lunar y la actividad recomendada; las fechas fuera de 1900–2100 se muestran sin fase. *[ESCENARIO EXCEPCIONAL O PROBLEMÁTICO]*

**Tareas de implementación**

- Textos de los pasos y `calendarioLunar` en `@nexo/shared` (3 horas)
- Pantalla de saberes y calendario (2 horas)
- Probar (1 hora)
