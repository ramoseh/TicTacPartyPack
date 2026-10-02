# Feature Specification: Animaciones y estilo visual pixel art

**Feature Branch**: `001-pixel-art-animations`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "Mejorar las animaciones del proyecto con un estilo más pixel art. Alcance: bomba (tick, mecha, explosión), transiciones entre pantallas, botones / UI (pulsaciones, menús), retos (ChallengeDisplay, CoinFlip), tipografía pixel (fuente bitmap) y fondos."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Bomba pixel art animada por frames (Priority: P1)

Durante una partida, el grupo ve una bomba dibujada en pixel art. En reposo la mecha
chisporrotea suavemente; al activarla, la mecha arde, la bomba tiembla a saltos de
"píxel" y, al explotar, se reproduce una explosión fotograma a fotograma con un
destello de pantalla breve y un temblor, terminando en una nube de humo.

**Why this priority**: la bomba es el elemento central y más visible del juego; por sí
sola transmite el cambio de estilo y es la animación que más impacto tiene en la emoción
de la partida.

**Independent Test**: iniciar una ronda en la pantalla de juego, esperar a la explosión y verificar
los tres estados (reposo, activa, explotada) solo con el nuevo arte, sin tocar el resto
de pantallas.

**Acceptance Scenarios**:

1. **Given** una ronda sin iniciar, **When** el jugador está en la pantalla de juego,
   **Then** la bomba pixel art se muestra con una animación de reposo de mecha en bucle.
2. **Given** la bomba en reposo, **When** el jugador inicia la ronda, **Then** la mecha
   pasa a animación de "ardiendo" y la bomba tiembla con desplazamientos discretos (sin
   movimiento suave).
3. **Given** la bomba activa, **When** se agota el tiempo, **Then** se reproduce una
   explosión por fotogramas, un destello de pantalla (máx. 2 destellos) y un temblor de
   pantalla, y la escena queda en el fotograma final de humo hasta la siguiente ronda.
4. **Given** la bomba explotada, **When** el jugador inicia una nueva ronda, **Then** la
   bomba vuelve al estado de reposo sin restos de la animación anterior.

---

### User Story 2 - Identidad visual pixel en toda la interfaz (Priority: P2)

Al abrir la app, todas las pantallas (inicio, configuración, juego, ajustes) usan
tipografía pixel, paneles y botones de bordes rectos "escalonados", sombras sólidas sin
difuminado, una paleta de colores limitada, iconos pixel en lugar de emojis/iconos
vectoriales y un fondo pixel art. Los botones se "hunden" un píxel al pulsarlos y los
interruptores/menús desplegables se mueven a saltos.

**Why this priority**: sin una UI coherente, la bomba pixel art desentonaría; es lo que
convierte el cambio en un estilo de producto y no en un elemento aislado.

**Independent Test**: navegar por las 4 pantallas y el modal de instrucciones y
comprobar con la checklist visual que no quedan esquinas redondeadas, sombras borrosas,
emojis decorativos ni tipografía del sistema.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla, **When** se muestra, **Then** todo el texto usa la
   tipografía pixel y los acentos/ñ/¿/¡ se ven correctamente en español e inglés.
2. **Given** un botón, **When** el jugador lo mantiene pulsado, **Then** el botón se
   desplaza hacia abajo exactamente un "píxel de diseño" y su sombra sólida desaparece;
   al soltar vuelve a su posición en un solo paso.
3. **Given** el interruptor de un mini-juego en modo personalizado, **When** se pulsa,
   **Then** el indicador se desplaza en pasos discretos (no en un deslizamiento suave).
4. **Given** el selector de fondo en ajustes, **When** se abre, **Then** se listan los
   fondos pixel disponibles y al elegir uno se aplica de inmediato y se recuerda tras
   reiniciar la app.

---

### User Story 3 - Retos con animaciones pixel (Priority: P3)

Cuando aparece un nuevo reto, la tarjeta entra con una animación escalonada ("pop" en
2-3 pasos). En "Lanzar moneda" se ve una moneda pixel girando por fotogramas que se
detiene en el fotograma de cara o cruz. Los textos de espera parpadean en estilo arcade
("PRESS START") en lugar de desvanecerse.

**Why this priority**: refuerza el estilo durante el juego, pero la partida es jugable
sin ello.

**Independent Test**: en modo personalizado activar solo "Lanzar moneda" y otro mini-juego
de texto; verificar la entrada de la tarjeta, el giro de la moneda y el parpadeo.

**Acceptance Scenarios**:

1. **Given** un reto nuevo, **When** se muestra, **Then** la tarjeta aparece en como
   máximo 3 pasos discretos de escala/opacidad y en menos de 300 ms.
2. **Given** el reto de moneda, **When** el jugador lanza, **Then** la moneda gira por
   fotogramas y termina en el fotograma que corresponde al resultado mostrado.
3. **Given** un texto de estado "lanzando…", **When** está visible, **Then** parpadea
   encendido/apagado a un ritmo ≤ 2 veces por segundo.

---

### User Story 4 - Transiciones entre pantallas pixeladas (Priority: P4)

Al navegar entre pantallas (incluido el botón "atrás" del sistema), la pantalla se cubre
y descubre con un efecto de bloques/píxeles en lugar de un fundido suave. El modal de
instrucciones aparece y desaparece con la misma estética.

**Why this priority**: es pulido visual; aporta coherencia pero no afecta a la jugabilidad.

**Independent Test**: navegar Inicio → Configuración → Juego → atrás → Ajustes y abrir
/cerrar el modal de instrucciones, comprobando el efecto en cada cambio.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla, **When** el jugador navega a otra (botón de la app o
   gesto/botón atrás del sistema), **Then** se reproduce la transición de bloques y la
   nueva pantalla queda interactiva en ≤ 400 ms.
2. **Given** una transición en curso, **When** el jugador pulsa repetidamente, **Then**
   no se apilan navegaciones duplicadas ni la transición queda congelada a medias.
3. **Given** la pantalla de juego, **When** se abre el modal de instrucciones, **Then**
   aparece con una animación pixel escalonada y se cierra igual.

---

### User Story 5 - Respeto a "reducir movimiento" (Priority: P5)

Un jugador con la opción del sistema "reducir movimiento" activada ve el mismo estilo
pixel, pero sin temblores, sin transiciones de bloques, sin bucles de fondo y con la
explosión representada por un único fotograma clave y sin destello.

**Why this priority**: requisito de accesibilidad exigido por la constitución (IV);
se sitúa al final porque depende de que existan las animaciones anteriores.

**Independent Test**: activar "reducir movimiento" en el dispositivo y repetir los tests
de las historias 1-4.

**Acceptance Scenarios**:

1. **Given** reducir movimiento activado, **When** la bomba está activa, **Then** no
   tiembla y la mecha muestra un fotograma estático o un parpadeo lento.
2. **Given** reducir movimiento activado, **When** la bomba explota, **Then** se muestra
   el fotograma final de explosión sin destello ni temblor de pantalla.
3. **Given** el jugador cambia la preferencia del sistema con la app abierta, **When**
   vuelve a la app, **Then** el comportamiento se adapta sin reiniciar.

---

### Edge Cases

- El jugador sale de la pantalla de juego durante la explosión o el giro de la moneda:
  las animaciones y sonidos se detienen sin errores ni fugas.
- Pulsar "siguiente"/"nueva ronda" repetidamente mientras se reproduce la explosión:
  la bomba siempre termina en un estado coherente con el estado del juego.
- Palabras muy largas en el reto con una tipografía pixel más ancha: el texto se ajusta
  dentro de la tarjeta sin cortarse.
- Pantallas de densidades distintas (teléfonos, tablets, web): el arte se escala en
  múltiplos enteros y los píxeles se ven nítidos (sin difuminado apreciable).
- Un valor de fondo guardado previamente que ya no existe: se aplica el fondo por defecto.
- Dispositivos de gama baja o en ahorro de batería: las animaciones no bloquean la
  interacción ni retrasan el temporizador de la bomba.
- Navegación del sistema "atrás" durante una transición en curso.

## Requirements _(mandatory)_

### Functional Requirements

**Principios de movimiento**

- **FR-001**: Las animaciones de sprites (bomba, explosión, moneda, cargador, fondo) MUST
  avanzar en fotogramas discretos a una cadencia de entre 8 y 15 fotogramas por segundo.
  Las micro-animaciones de interfaz (transiciones, interruptores, modal, entrada de
  retos, temblores) MUST avanzar en como máximo 6 pasos discretos, sin interpolaciones
  suaves.
- **FR-002**: Todo desplazamiento, borde y sombra MUST ser múltiplo de una unidad de
  "píxel de diseño" común.
- **FR-003**: El arte pixel MUST mostrarse escalado a múltiplos enteros y sin suavizado
  apreciable en iOS, Android y Web.

**Bomba (US1)**

- **FR-004**: La bomba MUST tener cuatro estados visuales: reposo (bucle de mecha),
  activa (mecha ardiendo + temblor discreto), explotando (secuencia única de fotogramas)
  y explotada (fotograma final de humo persistente).
- **FR-005**: La explosión MUST acompañarse de un destello de pantalla (máx. 2 destellos)
  y un temblor de pantalla escalonado de duración ≤ 500 ms.
- **FR-006**: El estado visual de la bomba MUST derivarse exclusivamente del estado de la
  partida, de modo que reiniciar la ronda restablezca siempre el reposo.

**Interfaz (US2)**

- **FR-007**: Todo el texto de la app MUST usar una tipografía pixel con cobertura completa
  de los caracteres del español y del inglés.
- **FR-008**: Botones, paneles, tarjetas, pestañas, interruptores, desplegables y
  campos de texto MUST usar bordes rectos con esquinas escalonadas y sombras sólidas.
- **FR-009**: Al pulsar un botón, MUST hundirse una unidad de píxel en un solo paso y
  recuperarse en un solo paso al soltar.
- **FR-010**: Los emojis decorativos (🎲 💣 🪙 💥), los emojis que se muestran como reto
  (✊ ✋ ✌️, 🔗, 👀, 🔤) y los iconos de navegación (atrás, ayuda) MUST sustituirse por
  iconos pixel art equivalentes con la misma etiqueta accesible.
- **FR-011**: La interfaz MUST usar una paleta de colores limitada y definida
  centralmente (máximo 16 colores).
- **FR-012**: Al menos dos fondos pixel art MUST estar disponibles, uno de ellos como
  fondo por defecto; el selector de fondo MUST listarlos.
- **FR-013**: Un valor de fondo persistido desconocido MUST resolverse al fondo por
  defecto.
- **FR-014**: El indicador de carga inicial MUST mostrarse con estética pixel.

**Retos (US3)**

- **FR-015**: Cada reto nuevo MUST aparecer con una animación de entrada escalonada de
  ≤ 3 pasos y < 300 ms.
- **FR-016**: El lanzamiento de moneda MUST reproducir un giro por fotogramas que termine
  en el fotograma correspondiente al resultado.
- **FR-017**: Los textos de espera MUST parpadear (encendido/apagado) a ≤ 2 Hz en lugar de
  desvanecerse.

**Transiciones (US4)**

- **FR-018**: Toda navegación entre pantallas, incluida la del botón/gesto "atrás" del
  sistema, MUST mostrar una transición pixel de bloques de duración total ≤ 400 ms.
- **FR-019**: Mientras una transición está en curso, MUST ignorarse nuevas navegaciones
  iniciadas desde la app.
- **FR-020**: El modal de instrucciones MUST abrirse y cerrarse con animación pixel
  escalonada.

**Accesibilidad y robustez (US5)**

- **FR-021**: Con "reducir movimiento" activado en el sistema, MUST desactivarse temblores,
  destellos, transiciones de bloques y bucles decorativos, mostrando fotogramas clave
  estáticos; el cambio de preferencia MUST aplicarse sin reiniciar la app.
- **FR-022**: Las animaciones MUST NOT producir más de 3 destellos por segundo.
- **FR-023**: Las animaciones MUST detenerse y liberarse al salir de la pantalla y MUST NOT
  retrasar el temporizador ni la respuesta a pulsaciones.
- **FR-024**: Todos los assets de terceros MUST tener licencia que permita uso comercial,
  documentada en el repositorio.

### Key Entities

- **Hoja de sprites**: imagen con los fotogramas de un elemento animado (bomba, explosión,
  moneda, iconos, fondo); tiene tamaño de fotograma, número de fotogramas y escala base.
- **Clip de animación**: secuencia de fotogramas de una hoja con cadencia, si se repite y
  si se queda en el último fotograma.
- **Tema pixel**: paleta limitada, unidad de píxel de diseño y tipografías.
- **Opción de fondo**: identificador persistido, imagen y capa animada opcional.
- **Preferencia de movimiento**: completa o reducida, derivada del sistema.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de las pantallas (4) y del modal de instrucciones superan la
  checklist visual pixel (sin esquinas redondeadas, sombras borrosas, emojis decorativos
  ni tipografía del sistema).
- **SC-002**: En un dispositivo Android de gama media de referencia (Google Pixel 6a o
  equivalente), ninguna animación presenta tirones perceptibles durante 10 rondas
  consecutivas.
- **SC-003**: La bomba empieza su animación de "activa" en menos de 100 ms desde que se
  pulsa iniciar.
- **SC-004**: Toda transición entre pantallas deja la pantalla destino interactiva en
  ≤ 400 ms.
- **SC-005**: Con "reducir movimiento" activado, 0 animaciones de temblor, destello o
  transición de bloques y el 100% del flujo de juego sigue siendo completable.
- **SC-006**: 0 glifos ausentes al recorrer todos los textos en español e inglés.
- **SC-007**: El tamaño del paquete de la app no crece más de 5 MB respecto a la versión
  actual.
- **SC-008**: En una prueba con al menos 5 jugadores, ≥ 80% describe el estilo como
  "retro/pixel" y considera la explosión más impactante que la versión actual.

## Assumptions

- El estilo pixel sustituye al actual; no se mantiene un "modo clásico" seleccionable.
- El arte pixel (bomba, explosión, humo, moneda, iconos, fondos, cargador) lo produce el
  equipo o se obtiene de packs con licencia comercial (p. ej. CC0); su creación se trata
  como dependencia del plan.
- La tipografía pixel es de licencia abierta (p. ej. OFL) e incluida con la app.
- Los sonidos actuales (tick y explosión) se mantienen; un rediseño "chiptune" queda
  fuera de alcance.
- No se añaden vibraciones/hápticos en esta feature.
- La preferencia de movimiento se toma solo del sistema operativo; no se añade un ajuste
  propio en la app.
- La lógica de juego (reglas y generación de retos) no cambia.
