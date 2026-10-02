# Research: Animaciones y estilo visual pixel art

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-02

Cada sección resuelve un "NEEDS CLARIFICATION" o una elección tecnológica del
_Technical Context_ del plan.

## R1. Motor de animación por fotogramas

- **Decision**: Usar la API `Animated` de React Native (ya usada en `Bomb.tsx` y
  `CoinFlipChallenge.tsx`) con `useNativeDriver` (excepto web). Un único `Animated.Value`
  representa el índice de fotograma; `interpolate` con rangos de entrada "en escalón"
  (`[0, 0.999, 1, 1.999, …]`) produce `translateX/translateY` constantes por fotograma
  dentro de una ventana con `overflow: hidden` sobre la hoja de sprites. Para
  desplazamientos/escalas (temblor, "pop") se usa `Animated.timing` con un easing
  cuantizado `steps(n) = t => Math.floor(t * n) / n`.
- **Rationale**: cero dependencias nuevas (principio V). Con el driver nativo,
  `Animated.timing` precalcula los valores en JS y los envía a nativo, así que el easing
  cuantizado e `interpolate` funcionan en el hilo de UI sin re-render de React por
  fotograma (principio IV). Se integra con el patrón actual (refs + `useEffect` +
  `stop()` en cleanup).
- **Alternatives considered**:
  - `react-native-reanimated` 4 (incluido en SDK 54): más potente, pero añade
    dependencia + plugin de Babel (`react-native-worklets`) para algo que `Animated`
    cubre. Se reconsiderará solo si QA detecta tirones (SC-002).
  - `setInterval` + `useState` del índice de fotograma: simple, pero re-renderiza y
    depende del hilo JS (tirones si JS está ocupado).
  - Lottie / Rive: orientados a vectores; no aportan nada al pixel art y añaden peso.
  - `@shopify/react-native-skia`: filtrado nearest-neighbor real, pero dependencia
    pesada (~6 MB) y reescritura de componentes; rechazado por V y SC-007.

## R2. Nitidez del pixel art (sin suavizado)

- **Decision**: Arte fuente a resolución nativa (p. ej. bomba 32×32 px) y **exportado
  pre-escalado con nearest-neighbor** mediante un script Node con `sharp`
  (`kernel: 'nearest'`, ya en `devDependencies`) a un factor entero alto (×8 a ×12) para
  que en el dispositivo predomine la reducción, no la ampliación. En pantalla, el tamaño
  de render es `baseSize × escala` (dp por píxel de sprite, siempre entero), calculado
  por un helper puro `getIntegerScale(baseSize, maxDp)`. En web se añade `image-rendering: pixelated` (clase arbitraria de
  NativeWind `[image-rendering:pixelated]`; verificar en quickstart).
- **Rationale**: `Image` de RN en Android/iOS no expone el modo de filtrado; ampliar una
  imagen pequeña con bilinear la difumina. Con assets ya grandes y de bordes duros, el
  remuestreo residual es imperceptible. Mantiene una única fuente de verdad (arte 1×) y
  un paso de build reproducible.
- **Alternatives considered**: Skia (ver R1); `expo-image` (tampoco ofrece
  nearest-neighbor); escalar a mano en el editor (no reproducible, errores humanos).
- **Constraint derivada**: cada hoja exportada ≤ 2048×2048 px (límite seguro de textura
  en Android); hojas en rejilla (filas×columnas) cuando no quepan en tira.

## R3. Tipografía pixel

- **Decision**: Dos fuentes OFL de Google Fonts vía `expo-font` + paquetes
  `@expo-google-fonts/*`:
  - **Press Start 2P** para títulos, estado de la bomba y prompts grandes.
  - **Pixelify Sans** (o **VT323** como alternativa) para texto de cuerpo e
    instrucciones, más legible en párrafos.
    Se cargan en `app/_layout.tsx` con `useFonts` y la puerta existente
    `NavigationReady` espera también a las fuentes (mostrando el cargador pixel), sin añadir
    `expo-splash-screen`. Se registran en `tailwind.config.js` como
    `font-pixel` y `font-pixel-body`.
- **Rationale**: licencia OFL apta para uso comercial (FR-024); cobertura Latin-1 que
  incluye á é í ó ú ü ñ ¿ ¡ (FR-007, principio II) — **verificar** con la pantalla de
  prueba de glifos del quickstart. Las fuentes pixel tienen un único peso: las clases
  `font-black`/`font-bold` se eliminan (no deben generar "faux bold").
- **Alternatives considered**: fuente bitmap propia en sprite (sin soporte de
  `adjustsFontSizeToFit`, accesibilidad peor); Silkscreen (solo mayúsculas legibles en
  tamaños pequeños); una única fuente (Press Start 2P es demasiado ancha para párrafos).

## R4. Transiciones entre pantallas

- **Decision**: Configurar el `Stack` de `app/_layout.tsx` con `animation: 'none'` y
  montar un `PixelTransitionOverlay` global (por encima del `Stack`, `pointerEvents`
  controlado) con una rejilla de ~6×12 bloques. Un único `Animated.Value` (0→1) y una
  interpolación por bloque con umbral escalonado (orden en diagonal/aleatorio con
  semilla fija) controla la opacidad, todo con driver nativo.
  - **Reveal** (≈200 ms): se dispara al cambiar `usePathname()`, cubre también el
    "atrás" del sistema (FR-018).
  - **Cover** (≈200 ms): solo en navegaciones iniciadas desde la app mediante un hook
    `usePixelNavigation()` que envuelve `router.push/replace/back`, cubre → navega →
    el reveal ocurre por el cambio de ruta. Mientras `phase !== 'idle'` se ignoran nuevas
    navegaciones (FR-019).
  - **Gesto atrás en iOS**: se mantiene `gestureEnabled` (expectativa del usuario). Con
    `animation: 'none'` el gesto no muestra arrastre interactivo; al completarse cambia
    el pathname y se reproduce el reveal. Se verifica en el quickstart; **plan B** si el
    gesto no se completa de forma fiable: `animation: 'fade'` con `animationDuration`
    mínima solo en iOS, manteniendo el reveal de bloques encima.
  - La máquina de fases se implementa como reducer puro `transitionReducer(phase, event)`
    en `theme/animation.ts` (testeable, ver R10).
- **Rationale**: las animaciones nativas del stack (`fade`, `slide_*`) no permiten
  efectos de bloques. Un overlay único evita tocar cada pantalla y respeta el presupuesto
  de 400 ms (SC-004). ~72 vistas con opacidad nativa son asumibles en gama media.
- **Alternatives considered**: hoja de sprites a pantalla completa (escalado no entero en
  cada dispositivo → difuminado); `react-navigation` `cardStyleInterpolator` (solo JS
  stack, no native-stack); animar cada pantalla al montarse (duplica lógica, no cubre
  la salida).

## R5. Botones, paneles y controles pixel

- **Decision**: Componentes de presentación en `components/pixel/`:
  `PixelButton`, `PixelPanel`, `PixelToggle`, `PixelText`, `PixelIcon`. Bordes con
  "esquinas escalonadas" construidos con 4 vistas de borde insertadas una unidad
  (`PIXEL_UNIT`) desde las esquinas (deja la esquina vacía, efecto notch) y sombra sólida
  como vista desplazada `PIXEL_UNIT` sin blur. Pulsación con `Pressable`: estado
  `pressed` → `translateY: PIXEL_UNIT` y oculta la sombra (sin animación, un paso; FR-009).
  `PixelToggle` mueve el indicador en 2 pasos con easing cuantizado (≈120 ms).
- **Rationale**: los `border-radius`, `shadow*` y `elevation` actuales son la principal
  señal "no pixel". Componentes reutilizables evitan duplicar clases en 4 pantallas y
  2 modales (no es abstracción de un solo uso: >10 usos).
- **Alternatives considered**: 9-slice con imagen de borde (requiere `ImageBackground`
  con `capInsets`, solo iOS); `borderStyle` CSS (no hay borde escalonado nativo).

## R6. Preferencia "reducir movimiento"

- **Decision**: Hook `useReducedMotion()` en `hooks/` basado en
  `AccessibilityInfo.isReduceMotionEnabled()` + suscripción
  `addEventListener('reduceMotionChanged')` (soportado en iOS, Android y RN Web vía
  `prefers-reduced-motion`). Los componentes animados reciben/consultan el valor y
  sustituyen bucles por un fotograma clave estático; el overlay de transición se omite.
- **Rationale**: API nativa, sin dependencias, reactiva sin reiniciar (FR-021).
- **Alternatives considered**: `useReducedMotion` de Reanimated (dependencia nueva);
  ajuste propio en Settings (descartado en Assumptions de la spec).

## R7. Paleta y unidad de píxel

- **Decision**: Paleta propia de 16 colores derivada de la marca actual (navy `#0F0F1B`,
  rojos de la bomba, naranjas, azules de acción, grises) definida en
  `theme/pixel.ts` y espejada en `tailwind.config.js` (`colors.px.*`).
  `PIXEL_UNIT = 4` dp; todas las medidas de bordes, sombras y desplazamientos son
  múltiplos de ella (FR-002, FR-011).
- **Rationale**: conserva la identidad de marca dentro de la restricción pixel; un único
  origen para JS (`style`) y clases Tailwind.
- **Alternatives considered**: PICO-8 / Sweetie-16 (ajenas a la marca); sin límite de
  paleta (incumple FR-011).

## R8. Arte y licencias

- **Decision**: Sprites creados en Aseprite (fuentes `.aseprite` en `assets/pixel-src/`,
  exportados como PNG 1× a `assets/pixel-src/export/`) o tomados de packs CC0. El script
  de escalado genera los PNG finales en `assets/sprites/`, `assets/backgrounds/` e
  `assets/icons/`. Créditos/licencias en `assets/LICENSES.md`.
- **Inventario mínimo**: bomba reposo (4 fr), bomba activa (4 fr), explosión (8–10 fr,
  el último es el humo final), moneda giro (8 fr) + cara/cruz, iconos (atrás, ayuda,
  ajustes, check, dado, bomba, explosión, moneda, piedra-papel-tijera, cadena, ojos,
  abecedario), dos fondos pixel (`default` y `city`, + capa opcional de estrellas
  2–4 fr), cargador (4 fr).
- **Rationale**: FR-024 y SC-007 (≤ 5 MB); PNG indexado + pocas hojas mantiene el peso.

## R9. Cadencias y duraciones

| Elemento        | fps / duración                                           | Notas                                                             |
| --------------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| Bomba reposo    | 8 fps, bucle                                             | chispa de mecha                                                   |
| Bomba activa    | 12 fps, bucle + temblor ±1 `PIXEL_UNIT` cada 2 fr        |                                                                   |
| Explosión       | 15 fps, una vez (~600 ms) → queda en el último fr (humo) | + destello 2×80 ms, temblor de pantalla ±2 `PIXEL_UNIT`, ≤ 500 ms |
| Entrada de reto | 3 pasos / 240 ms                                         | escala 0.5 → 0.85 → 1                                             |
| Moneda          | 12 fps durante 2 s, termina en fr resultado              | sustituye `rotateY` 2880°                                         |
| Parpadeo texto  | 2 Hz (500 ms on/off)                                     | sustituye pulso de opacidad                                       |
| Transición      | cover 200 ms + reveal 200 ms                             | 4–6 pasos                                                         |
| Modal           | 3 pasos / 180 ms                                         | `animationType="none"` + animación propia                         |

- **Rationale**: 8–15 fps es la cadencia típica del pixel art para sprites (FR-001); las
  micro-animaciones de UI usan ≤ 6 pasos discretos (FR-001); destellos ≤ 2 por explosión
  cumplen FR-022.

## R10. Estrategia de pruebas

- **Decision**: Tests unitarios Jest (`jest-expo`, ya configurado) para la lógica pura:
  `buildFrameInterpolation`, `stepsEasing`, `getIntegerScale`, umbrales de bloques de la
  transición, `deriveBombVisualState`, `transitionReducer`, `resolveBackground`
  (fallback a `default`), y validación de los manifiestos
  de sprites (fotogramas dentro de la hoja, hoja ≤ 2048 px). Validación visual manual
  según [quickstart.md](./quickstart.md) en Android, iOS y Web.
- **Rationale**: principio de la constitución (lógica pura con tests); no hay
  `@testing-library/react-native` instalado y añadirlo no compensa para assets visuales.
- **Alternatives considered**: snapshot tests de componentes (frágiles ante cambios de
  arte); tests visuales con Detox/Maestro (fuera de alcance).

## R11. Emojis en los retos

- **Contexto**: varios generadores de `games/` devuelven emojis como prompt
  (`rockPaperScissors` ✊ ✋ ✌️, `wordChain` 🔗, `lookAway` 👀, `alphabet` 🔤 + categoría;
  `services/gameRouter.ts` usa `'🔗'` literal). Las fuentes pixel no tienen emojis y se
  verían con el emoji del sistema (FR-010, SC-001).
- **Decision**: `ChallengeDisplay` elige un `PixelIcon` por `GameType`
  (`RockPaperScissors → rps`, `WordChain → chain`, `LookAway → eyes`,
  `Alphabet → abc`) e ignora el prompt en los tipos que solo son icono. En `Alphabet`
  muestra el icono + la categoría; para ello `games/alphabet.ts` devuelve solo la
  categoría (se elimina `ALPHABET_ICON` del prompt). `biggerThan.ts` no está en uso y no
  se toca.
- **Rationale**: saca presentación de la lógica (principio I) sin cambiar reglas ni
  `GameChallenge`; evita parsear el prompt en la UI.
- **Alternatives considered**: partir el prompt por `\n` en la UI (frágil); eliminar
  todos los emojis de `games/` (cambio mayor sin beneficio, la UI ya los ignora).
