# WorkshopControlBar -- historial de versiones

## 2.7.3 -- 2026-10-30

- Manifest: sbcRequired true (needs WorkshopService); side bar keeps the group names

## 2.7.2 -- 2026-10-29

- Phone layout: 44 px touch targets in the section bars (family css), camera and Jog panels fit the screen

## 2.7.1 -- 2026-10-29

- State chips with an icon: the icon carries the color and there is no dot (family.css); chosen chip tinted

## 2.7.0 -- 2026-10-29

- No on-screen keyboard on text and number fields of a computer with a mouse (inputmode none)

## 2.6.30 -- 2026-10-28

- Design family: final shared styles

## 2.6.29 -- 2026-10-28

- Design family: the board tiles are neutral cards with a gray icon (no tinted fill, no colored icon box), the machine state is dot and word, the group filters are wf-cat chips

## 2.6.28 -- 2026-10-28

- Minimalist design: neutral setup strip in the bar panel

## 2.6.27 -- 2026-10-28

- Risk dialogs get their colored side bar back; one type scale (Roboto in the panels, no half sizes)

## 2.6.26 -- 2026-10-28

- Closed look and make room helpers

## 2.6.25 -- 2026-10-28

- Live job stop wording covers any program that streams a job

## 2.6.24 -- 2026-10-28

- A view opened from the bar starts at the top of the page

## 2.6.23 -- 2026-10-28

- Closing and opening the bar no longer re-lays out the whole page per frame (no margin animation)

## 2.6.22 -- 2026-10-28

- Fix state legend and arrow state broken by the rail pie

## 2.6.21 -- 2026-10-28

- Without making room the closed bar becomes the arrow

## 2.6.20 -- 2026-10-28

- Rail state dot animates like the open bar and the Lights page

## 2.6.19 -- 2026-10-28

- Make-room strip uses the page background instead of grey

## 2.6.18 -- 2026-10-27

- Plan warnings in words, risk dialogs in DWC style, mesh point selection, link to Machine modes

## 2.6.17 -- 2026-10-27

- Side bar no longer makes the page jump when a shorter section is chosen; start-up chip as in every page (header, same wording)

## 2.6.16 -- 2026-10-26

- Run-time guard: the 3.6 build refuses to start on a host with window.DWC and the 3.7 build outside DWC 3.7.x (visible warning); shipped as a strict per-line zip (dwcVersion 3.6 / 3.7)

## 2.6.15 -- 2026-10-26

- DWC 3.7: the state at the top of the open bar (state headline, status lights and legend) and the plugin data readers of the shared code (motion owner, live job, active risk) now work: DWC 3.7 keeps the data of a plugin as a Map, which every direct `plugin.data.key` read missed, so they were always empty there. Vision reads its live job and internal processes the same way.
- A page framed inside another page that already has the control bar (a reduced preview of the demo) no longer shows a second bar; the framed one steps aside.

## 2.6.14 -- 2026-10-26

- Universal zip: the DWC 3.6 side is now built with the official 3.6 pipeline, so its i18n catalogs are registered and the menu captions show names instead of raw plugins.* keys.

## 2.6.13 -- 2026-10-26

- Fixes from the universal QA and the real-machine session: leftovers removed when the last JS plugin stops; 'Make room for the bar' on by default and not applied when DWC's three columns would be squeezed; friendly text for button-read transport errors; confirmation dialogs always say what is confirmed (plugin start/stop explains the web server restart); Shut down now / Restart everything need two presses with a 1.5 s arming delay

## 2.6.12 -- 2026-10-24

- Start-up assistant: active lines highlighted, single-step way back, dark select options; Lights time picker and defaults; Vision relay message; Printing FFF switch; Mesh handles above the points

## 2.6.11 -- 2026-10-24

- Start-up card reports its pending count to the service (machine setup list)

## 2.6.10 -- 2026-10-24

- Start-up assistant: the system service paints the light (default); generic lighton.g and lightoff.g as examples

## 2.6.9 -- 2026-10-24

- Live stop on the bar can be hidden from the bar settings

## 2.6.8 -- 2026-10-24

- Live stop button uses the same style as the other bar buttons

## 2.6.7 -- 2026-10-23

- One sign-in for every tab (token in localStorage)

## 2.6.6 -- 2026-10-23

- Live stop strip always visible on the bar

## 2.6.5 -- 2026-10-23

- Compact live job strip in the bar; page header treats an expired session as sign in; numeric PIN field

## 2.6.4 -- 2026-10-23

- Safe stop; no support for older versions; numeric PIN field

## 2.6.3 -- 2026-10-23

- Safe stop redesigned; power macros: progress message without OK modal

## 2.6.2 -- 2026-10-23

- Safe stop button: solid amber when usable, outline when off

## 2.6.1 -- 2026-10-22

- Safe stop strip always visible on the bar (off without a live job)

## 2.6.0 -- 2026-10-22

- Safe stop of the live job on the bar

## 2.5.16 -- 2026-10-22

- Arrow-to-circle animation plays even with reduced motion set by the OS

## 2.5.15 -- 2026-10-22

- Arrow-to-circle animation: target read after the bar slides in

## 2.5.14 -- 2026-10-22

- Arrow-to-circle animation also in rail mode

## 2.5.13 -- 2026-10-22

- Round status indicator uses the arrow layer; arrow turns into the circle on opening

## 2.5.12 -- 2026-10-22

- Pin on every side bar, thin scrollbars, one sign-in dialog

## 2.5.11 -- 2026-10-22

- Pin on every side bar, thin scrollbars everywhere

## 2.5.10 -- 2026-10-22

- Sign-in never opens by itself; keyboard only on touch

## 2.5.9 -- 2026-10-22

- Fix names, values and catalog markers the English rename left behind

## 2.5.8 -- 2026-10-22

- Camera images that cannot load say why

## 2.5.7 -- 2026-10-22

- Sessions made clear: not-signed-in chip, sign-in on visitor 403, refusal toast

## 2.5.6 -- 2026-10-22

- Sign-in dialog focus and kiosk keyboard helper; Jog blocked touches explained

## 2.5.5 -- 2026-10-22

- Kiosk keyboard helper call, sign-in dialog font

## 2.5.4 -- 2026-10-22

- Jog and bars tell why an action is blocked and ask for the session; Jog loses the Machine pointer sections

## 2.5.3 -- 2026-10-22

- Sign-in dialog redesign and on-screen keyboard; single floating panel for power actions; risk bar on one line; Jog gear and scrollbar; side tabs transition

## 2.5.2 -- 2026-10-21

- PIN sign enters by itself when the PIN has the length that worked last time

## 2.5.1 -- 2026-10-21

- Page routes in English with redirects from the old ones, localStorage keys migrated to English

## 2.5.0 -- 2026-10-21

- By role (F3-J): the camera relay and timelapse, the phone notifications and the mirror of the status LEDs are for technician and admin (Camera, Activity and Lights own them); the operator keeps the buttons, the state, STOP, shut down when finished and the timer. Shut down now and Restart everything are the admin's and ask motion.ask (class power) first
- The camera relay is read every 30 s (was 10 s) and only by a browser that can see it
- 10-sidebar.js split into builders (18), painters (19) and actions (19); createSidebar 439 -> 73 lines, no behavior change (bar trace)

## 2.4.0 -- 2026-10-21

- English migration: texts through the catalog, no in-browser translator, interfaces per part

## 2.3.1 -- 2026-10-20

- English names: remaining values, ids, theme panels and the Vision backend keys (fixes a mismatch with the page)

## 2.3.0 -- 2026-10-20

- All the code, data keys and enum values are in English; stored data is converted by the one-off migration script

## 2.2.8 -- 2026-10-18

- Internal: local names in English (no visible change)

## 2.2.7 -- 2026-10-18

- Neutral Spanish texts

## 2.2.6 -- 2026-10-17

- Rail dot: the pie no longer depends on the shared ledEstado copy of another plugin

## 2.2.5 -- 2026-10-17

- Rail dot: fall back when shared ledEstado lacks pastel

## 2.2.4 -- 2026-10-17

- Rail dot shows the pie of active light states

## 2.2.3 -- 2026-10-17

- Machine free rule follows the movement owner settings (like Duet / release seconds)

## 2.2.2 -- 2026-10-16

- Start-up dialog: sans-serif font, dark scrollbars, and a card with a single ready row no longer repeats its name

## 2.2.1 -- 2026-10-16

- Editing a file from the start-up dialog hides the dialog and brings it back on the same step; Jog hides Home for axes the machine does not have

## 2.2.0 -- 2026-10-16

- Start-up card is now a dialog: opened from the gear panel or from a strip in Buttons (only while something is pending); one card per function (light, air, supply) with progress, state chip and a single main button; step-by-step assistant redesigned

## 2.1.19 -- 2026-10-15

- Start-up assistant (shared piece), Lights: the strip pin is chosen in Advanced (plain LED removed)

## 2.1.18 -- 2026-10-15

- Start-up card in the Buttons section: the light, air and power supply macros with their state (ready, only the example, missing); examples created once by the service; factory buttons skip macros that are only the example

## 2.1.17 -- 2026-10-15

- Spanish texts with accents and enie

## 2.1.16 -- 2026-10-14

- Hide every mention of another plugin when it is absent

## 2.1.15 -- 2026-10-14

- Effects of the state indicator run from one timer at 8 steps a second instead of CSS animations (the browser drew 60 frames a second)

## 2.1.14 -- 2026-10-14

- Side bar: message and state lines keep one line of height and the state legend always takes two rows (+N chip), so the bar does not change size

## 2.1.13 -- 2026-10-14

- State badge dot is a pie (split in zones or turns, each slice with its effect); arrow state animation, bar collapse on the touch screen

## 2.1.12 -- 2026-10-14

- Cleanup: no more lookups of the old service Id (PiCustomCodes) or mentions of the removed custom G-codes
- The dot of the state badge (top of the bar) is a pie: split in zones or taking turns as the state is configured, each slice with its effect

## 2.1.11 -- 2026-10-14

- A press outside the bar closes it with any pointer type (the Pi touch screen can report a mouse) and the click that follows is swallowed, so it no longer toggles the switch or button under the finger; on the Pi the bar folds by itself by default

## 2.1.10 -- 2026-10-14

- Own switch in Settings for the state shown on the arrow (State on the arrow), independent of the state at the top of the bar

## 2.1.9 -- 2026-10-14

- Arrow tab: the mode color stripe is added only when real states are active (not for the lighting or a state that takes the whole zone)

## 2.1.8 -- 2026-10-14

- The arrow tab follows how the states combine: one stripe per state when they split the zone, and the color changes every turn when they take turns (each with its own effect)

## 2.1.7 -- 2026-10-14

- Selecting text no longer gets cleared: the bar and the state badge only rewrite a text or an icon when it changed (they rewrote them every second)

## 2.1.6 -- 2026-10-14

- The arrow tab of the closed bar shows the state animation over its whole area (color layer behind the arrow) instead of a stripe and a dot

## 2.1.5 -- 2026-10-14

- The state text under the bar header (badge and legend) also ends in "..." and scrolls on hover or tap

## 2.1.4 -- 2026-10-14

- Status lines and card titles that do not fit the bar end in "..." and scroll on hover or tap; the full text is in the tooltip

## 2.1.3 -- 2026-10-14

- The arrow tab of the closed bar shows the state with a stripe and a dot inside it (its own look is kept and the blinking never goes below 30 %), instead of coloring and fading the whole tab

## 2.1.2 -- 2026-10-13

- With the pointer away, the settings panel of the bar no longer keeps it open: it is closed and the bar folds (automatic collapse); same when tapping outside on a touch screen

## 2.1.1 -- 2026-10-13

- Nothing of the status is painted while Lights and status is stopped (arrow tab, dot and box)

## 2.1.0 -- 2026-10-13

- The arrow tab of the closed bar takes the color, effect and name of the current state; the DWC status chip is not painted any more (it is DWC's own interface)

## 2.0.3 -- 2026-10-13

- Files and macros written by the plugin are in English; bilingual risk texts

## 2.0.2 -- 2026-10-13

- Official localization completed, no Spanish text left in the sources

## 2.0.1 -- 2026-10-13

- Fix: the button editor (Editar botones) mode closes together with the bar

## 2.0.0 -- 2026-10-13

- Needs WorkshopService 2.0: calls its central API (POST /machine/WorkshopService/api) instead of the custom codes M9003 / M9010, which are gone
- Power macros (shutdown-all.g, full-reset.g, shutdown-after-job.g) call the service with 0:/sys/workshop/macros/service-call.g
- Power method, timer, power off after the job, relay and notification mute through the API
- Includes the i18n helper fix of 1.x (the helper no longer clashes with local variables named tt)


## 1.30.0 -- 2026-10-13

- Official DWC localization and build pipeline

## 1.29.1 -- 2026-10-13

- Sidebar closed rail and settings; shared updates; English texts pending

## 1.29.0 -- 2026-10-12

- Two independent settings: when closed (icon rail or arrow only) and automatic collapse on/off; removed per-page forcing; never changes DWC layout

## 1.28.0 -- 2026-10-12

- One setting: collapsible bar (yes/no), no classic style, never changes DWC layout, starts below the top bar, fixed rail on plugin pages

## 1.27.5 -- 2026-10-12

- Barra: estado desde DWC y solo con la pantalla a la vista, Fijar Cero y cambio de modo revisan el trabajo en vivo, sin nombre de programa; dwcVersion 3.6

## 1.27.4 -- 2026-10-11

- Traducciones nuevas (barra de Vision, aviso del jog sin limites)

## 1.27.3 -- 2026-10-11

- Traducciones del detalle del PID

## 1.27.2 -- 2026-10-11

- Traducciones nuevas; el traductor tambien cubre Impresion 3D, Timelapses y Servicio de la Pi

## 1.27.1 -- 2026-10-11

- Declara la dependencia de WorkshopService

## 1.27.0 -- 2026-10-11

- Colapsarse sola en todas las paginas (o nunca, o en algunas)

## 1.26.0 -- 2026-10-11

- Elegir en que paginas se colapsa sola (no solo Mesa de trabajo)

## 1.25.0 -- 2026-10-11

- Carpetas en ingles bajo 0:/sys/workshop (datos, disenos, malla, cortar por partes); arreglos de la Mesa de trabajo

## 1.24.0 -- 2026-10-11

- Id nuevo en ingles (Workshop...) y guardado seguro ante cortes de luz

## 1.23.0 -- 2026-10-11

- Id nuevo en ingles (Workshop...) y guardado seguro ante cortes de luz

# TallerBarra -- historial de versiones

## 1.22.5 -- 2026-10-10

- Compatibilidad con los Id nuevos en ingles (busca el servicio por el Id nuevo o el viejo); sin cambiar ningun Id todavia

## 1.22.4 -- 2026-10-10

- Barra Oculta con fondo opaco

## 1.22.3 -- 2026-10-10

- Traducciones del Servicio de la Pi y Salud

## 1.22.2 -- 2026-10-10

- Barra Oculta: la pestana a la izquierda del scroll solo en la pantalla de la Pi; en una PC queda en el borde como antes

## 1.22.1 -- 2026-10-10

- Barra Oculta: la pestana y la franja del borde quedan a la izquierda de la barra de scroll de DWC; pestana de 30x88 px

## 1.22.0 -- 2026-10-10

- Timelapse en la tarjeta del relay

## 1.21.1 -- 2026-10-10

- Clave de la camara compartida

## 1.21.0 -- 2026-10-10

- Estilo Oculta redisenado: inicio con el estado de la maquina, ESTA PANTALLA con un interruptor por panel, MIS BOTONES con chips por grupo, GLOBAL con Relay, Avisos y Apagado (abren su detalle con < para volver) y Apagar ahora fijo abajo

## 1.20.0 -- 2026-10-10

- Se quita el estilo Riel con panel (vuelve a Clasica); la barra Oculta tiene aspecto propio: panel flotante con esquinas redondeadas, fondo translucido, secciones con etiqueta de color y tarjetas redondeadas

## 1.19.1 -- 2026-10-10

- Barra Oculta: tambien se abre cuando el mouse llega a los ultimos 8 px de la ventana

## 1.19.0 -- 2026-10-10

- Estilo nuevo de la barra: Oculta (fuera de la pantalla; se abre al acercar el mouse al borde derecho o con la pestana azul en pantallas tactiles)

## 1.18.0 -- 2026-10-10

- Engranaje: Estilo Clasica / Riel con panel. Con Riel los iconos quedan siempre visibles contra el borde y cada uno abre a su izquierda solo su tarjeta (el mismo icono la cierra). Clasica queda por defecto

## 1.17.1 -- 2026-10-10

- La barra roja de riesgo activo y los carteles de confirmacion se ven tambien en pantalla completa

## 1.17.0 -- 2026-10-10

- La barra lateral se pliega sola al entrar a Mesa de trabajo y vuelve como estaba al salir; se puede apagar en el engranaje (Colapsarse sola en Mesa de trabajo, por pantalla)

## 1.16.5 -- 2026-10-10

- Estilo comun segun DESIGN.md (alto de botones, colores de la paleta, encabezados); traducciones

## 1.16.4 -- 2026-10-10

- Traducciones y enganche de Vision con el area de corte

## 1.16.3 -- 2026-10-10

- Los comandos de la pagina van por HTTP desde el primero (antes salian por G-code mientras cargaban los plugins) y reintentan ~15 s si el servicio se esta reiniciando

## 1.16.2 -- 2026-10-10

- Camara en vivo en el mapa de Zonas, pantalla completa y Hallar centro; estilo comun (colores de pantalla, pestanas como v-tabs, Offsets en un solo lugar)

## 1.16.1 -- 2026-10-10

- Registro de plugins: el modulo de advertencias ya no pisa window.__taller (ningun plugin JS arrancaba). Las calibraciones y ajustes guardados quedan anotados en Actividad

## 1.16.0 -- 2026-10-10

- Estandar de advertencias: lo que solo mueve pide doble toque ambar; lo que puede dañar (sondas, Z0, laser, malla, marcas) un toque y el cartel; soltar motores, cartel rojo con casilla y aviso de riesgo activo (barra roja y LEDs). Nombre visible del servicio: Servicio de la Pi

## 1.15.1 -- 2026-10-10

- Las paginas mandan sus comandos M9000/M9003/M9010 por HTTP al servicio de la Pi (sin la cola de la Duet); si el servicio no lo tiene, vuelven al G-code

## 1.15.0 -- 2026-10-10

- Apagado: botones 2x2 y 'Se apagara con' en Apagar al terminar y temporizador. Comandos M9003 en ingles; los nombres en español siguen como alias; traducciones al ingles completas

## 1.14.0 -- 2026-10-10

- Apagado: metodo Rele (salida de la Duet y valor que corta)

## 1.13.2 -- 2026-10-10

- Tema claro: barra lateral, jog, visor de camara, hojas de ajustes y cartel de confirmar siguen el tema claro de DWC (los rellenos de color no cambian); Zonas: mapa claro tambien con la camara de fondo

## 1.13.1 -- 2026-10-10

- La confirmacion de Apagar todo dice como se va a apagar (medidor o PS_ON)

## 1.13.0 -- 2026-10-10

- Apagado: Como se apaga (Automatico / Medidor / PS_ON) con casilla Apagar tambien la Pi; los textos de Apagar ahora, al terminar y el temporizador dicen exactamente que va a pasar

## 1.12.7 -- 2026-10-10

- Linea de diseno comun en el panel (colores, letra minima 10 px); avisos de riesgo: cartel Continuar/Cancelar antes de mover la maquina sola, usar la sonda, encender el laser, bajar a Z0, soltar o probar motores o reiniciar la placa

## 1.12.6 -- 2026-10-10

- Botones de modo con el color asignado a cada modo en Luces

## 1.12.5 -- 2026-10-10

- Los avisos de camara ya no hablan de la webcam de DWC (no se usa): dicen 'sin direccion de camara'

## 1.12.4 -- 2026-10-10

- Los avisos de DWC (errores, M291) ya no quedan detras de los paneles ni del mapa de Zonas

## 1.12.3 -- 2026-10-10

- Tira de LEDs: el texto dice si muestra los LEDs de estado o toda la tira (cuando la iluminacion tiene el control)

## 1.12.2 -- 2026-10-10

- LEDs arriba: la tira completa solo cuando la iluminacion tiene el control; traducciones al ingles del engranaje y las secciones propias

## 1.12.1 -- 2026-10-10

- LEDs de estado arriba: la tira completa (todas las zonas, la iluminacion tambien) sin desbordar con muchos LEDs

## 1.12.0 -- 2026-10-10

- Secciones propias: pueden quedar vacias y tener grupos de botones propios (nombre, descripcion, macro o G-code); el boton Ordenar ya no reaparece al abrir la barra (solo en el engranaje)

## 1.11.0 -- 2026-10-10

- Engranaje: secciones propias (crear, renombrar, mover tarjetas a ellas), modo compacto y tarjetas plegables; Ordenar solo desde el engranaje

## 1.10.1 -- 2026-10-10

- Temporizador: los minutos van con N (con M la Duet lo tomaba como otro comando)

## 1.10.0 -- 2026-10-10

- Apagar con temporizador (15/30 min, 1/2 h u otro; aviso 1 min antes; no corta un trabajo) y engranaje para configurar la barra en esta pantalla (que se ve, luces arriba, ordenar)

## 1.9.8 -- 2026-10-09

- LEDs de estado: se ven tambien con el automatico apagado (color de la iluminacion o apagados); barra contraida vuelve al circulo

## 1.9.7 -- 2026-10-09

- Barra contraida: los LEDs de estado como tira vertical (un punto por LED), igual que la tira de la barra abierta

## 1.9.6 -- 2026-10-09

- LEDs de estado: la tira de la barra/jog usa el mismo dibujo y color que todas las pantallas (ledEstado 'tira' + color)

## 1.9.5 -- 2026-10-09

- Reintento automatico de M9003 mientras PiCustomCodes se reinicia

## 1.9.4 -- 2026-10-09

- LEDs con poco brillo se ven encendidos; indicador redondo en la barra contraida

## 1.9.3 -- 2026-10-09

- Sin espejo de LEDs en los botones; solo la tira de arriba con su explicacion

## 1.9.2 -- 2026-10-09

- Espejo de LEDs solo arriba con la explicacion de cada color; tira vertical en la barra contraida; sin linea en los botones del riel

## 1.9.1 -- 2026-10-09

- Linea de LEDs de estado propia en el riel (no la borra el refresco de la barra)

## 1.9.0 -- 2026-10-09

- Espejo de los LEDs de estado: tira virtual bajo la cabecera, linea de color en el riel, chip de estado de DWC y botones activos con el color/animacion de la tira fisica

## 1.8.21 -- 2026-10-09

- Boton Reiniciar todo en la barra Controles (tarjeta Apagado)

## 1.8.20 -- 2026-10-09

- Boton sin respuesta: aviso a los 15 s en vez de quedar en enviado

## 1.8.19 -- 2026-10-09

- Traducciones: perfiles RS485, estadisticas del bus y tarjeta Otros servicios

## 1.8.18 -- 2026-10-09

- Traductor: pagina RS485 en ingles (diccionario + ruta, i18n v8)

## 1.8.17 -- 2026-10-09

- Traduccion: Zona activa en secciones

## 1.8.16 -- 2026-10-09

- Traduccion: borrar en Actividad

## 1.8.15 -- 2026-10-09

- Traduccion: punto del mapa

## 1.8.14 -- 2026-10-09

- Traduccion: Ir aca

## 1.8.13 -- 2026-10-09

- Traduccion: posiciones en Zonas

## 1.8.12 -- 2026-10-09

- Traduccion: pagina Salud de la Pi

## 1.8.11 -- 2026-10-09

- Traduccion: Editor laser

## 1.8.10 -- 2026-10-09

- Menos lecturas de estado a DSF (titubeo del jog con la Pi cargada)

## 1.8.9 -- 2026-10-09

- Traduccion: Hallar centro y Trabajo

## 1.8.8 -- 2026-10-08

- Traduccion: textos nuevos de Motores

## 1.8.7 -- 2026-10-08

- Traduccion: textos de la escala de los graficos

## 1.8.6 -- 2026-10-08

- Traduccion: tarjeta Zona activa, mesh y textos del backend

## 1.8.5 -- 2026-10-08

- Traduccion: paginas Vue (deteccion de ruta) y version compartida del traductor

## 1.8.4 -- 2026-10-08

- Traduccion: paginas Vue (arreglo de la deteccion de ruta)

## 1.8.3 -- 2026-10-08

- Traduccion: textos de las paginas Vue con saltos de linea

## 1.8.2 -- 2026-10-08

- Traduccion: paginas Consumo/Motores/Actividad/Servicios y menu lateral

## 1.8.1 -- 2026-10-08

- Traduccion: textos armados por partes se traducen completos

## 1.8.0 -- 2026-10-08

- Traduccion al ingles (sigue el idioma de DWC)

## 1.7.2 -- 2026-10-08

- Nombre visible en ingles

## 1.7.1 -- 2026-10-08

- Ordenar la barra: soltar ahora mueve la tarjeta/seccion

## 1.7.0 -- 2026-10-08

- Botones muestran si su funcion esta ACTIVA (luz, aire, fuente, modo...); boton Ordenar para arrastrar secciones y tarjetas de la barra

## 1.6.0 -- 2026-10-08

- Botones: desactivados bien distinguibles (gris, borde punteado, motivo), N/M activos por grupo, arrastrar para ordenar botones y grupos, modos por defecto del grupo, edicion sin desborde

## 1.5.1 -- 2026-10-08

- Editar botones responde al instante; flecha visible para plegar grupos; relay sin depender de la webcam de DWC

## 1.5.0 -- 2026-10-08

- Botones agrupados por funcion: cada grupo con icono, titulo y descripcion, plegable (por pantalla); crear/editar/ordenar/borrar grupos

## 1.4.0 -- 2026-10-08

- Botones propios (reemplazo de BtnCmd): crear/editar/ordenar/borrar desde la barra, guardados en la Pi, desactivados fuera de su modo o durante un trabajo

## 1.3.0 -- 2026-10-08

- Notificaciones al celular en la barra: estado, silenciar 1 hora / reactivar y acceso a la configuracion (Actividad)

## 1.2.0 -- 2026-10-08

- Incluye sus macros (macros/power/apagartodo.g y apagaralterminar.g) para instalarse en otra maquina

## 1.1.0 -- 2026-10-08

- Muestra las versiones de los plugins Taller; avisa a los paneles cuando esta activa (si no esta, ellos muestran su propio boton)

