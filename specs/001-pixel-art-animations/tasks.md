---
description: 'Task list for feature 001-pixel-art-animations'
---

# Tasks: Animaciones y estilo visual pixel art

**Input**: Design documents from `/specs/001-pixel-art-animations/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: La spec no pide TDD, pero la constitución exige tests unitarios para toda lógica
pura nueva (helpers de animación, manifiesto de sprites, tema, fondos). Solo se incluyen
esos tests; la validación visual es manual con [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

## Path Conventions

App Expo única en la raíz del repo: `app/`, `components/`, `components/pixel/`, `hooks/`,
`theme/`, `assets/`, `scripts/`, `__tests__/` (ver _Project Structure_ en [plan.md](./plan.md)).
Reglas comunes de [contracts/components.md](./contracts/components.md#reglas-comunes):
`useNativeDriver: Platform.OS !== 'web'`, `stop()` en cleanup, medidas múltiplo de
`PIXEL_UNIT`, colores solo de la paleta, textos vía i18n en `es` y `en`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencias, carpetas y línea base

- [x] T001 Instalar dependencias con `npx expo install expo-font @expo-google-fonts/press-start-2p @expo-google-fonts/pixelify-sans` y verificar que quedan en `package.json`
- [x] T002 [P] Crear carpetas `components/pixel/`, `hooks/`, `theme/`, `assets/pixel-src/export/`, `assets/sprites/`, `assets/icons/` y `scripts/` (con `.gitkeep` donde queden vacías)
- [x] T003 [P] Crear `assets/LICENSES.md` con la tabla (nombre, autor, URL, licencia, atribución) e incluir Press Start 2P y Pixelify Sans (OFL 1.1)
- [x] T004 Medir la línea base del bundle con `npx expo export --platform android` (tamaño de `dist/`) y anotarla en la sección "Prerrequisitos" de `specs/001-pixel-art-animations/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tema, helpers puros, pipeline de sprites, reproducción de clips, fuentes y preferencia de movimiento

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Crear `theme/pixel.ts` con `PIXEL_UNIT = 4`, `palette` (≤ 16 colores derivados de la marca: navy `#0F0F1B`, rojos, naranjas, azules, grises, blanco), `fonts` (`title: 'PressStart2P_400Regular'`, `body: 'PixelifySans_400Regular'`) y `timings` con las cadencias de research.md R9
- [x] T006 Extender `tailwind.config.js` con `theme.extend.colors.px` (mismos valores que `palette` de `theme/pixel.ts`) y `theme.extend.fontFamily` `pixel` / `pixel-body`
- [x] T007 [P] Crear `__tests__/theme.test.ts`: `palette` tiene ≤ 16 entradas hex válidas y coincide con `colors.px` de `tailwind.config.js`
- [x] T008 [P] Implementar en `theme/animation.ts` los helpers puros `stepsEasing`, `buildFrameInterpolation`, `getIntegerScale` y `blockThresholds` según [contracts/components.md](./contracts/components.md#helpers-puros-themeanimationts-themebackgroundsts)
- [x] T009 [P] Crear `__tests__/animation.test.ts`: `stepsEasing(4)` solo produce {0, .25, .5, .75, 1}; `buildFrameInterpolation` da salida constante dentro de cada fotograma y respeta filas/columnas; `getIntegerScale(32, 200) = 6` y `getIntegerScale(64, 10) = 1`; `blockThresholds` es determinista por semilla y todos los valores están en [0, 1)
- [x] T010 [P] Crear `hooks/useReducedMotion.ts` (`AccessibilityInfo.isReduceMotionEnabled()` + suscripción `reduceMotionChanged` con limpieza al desmontar; `false` hasta resolver)
- [x] T011 [P] Crear `scripts/build-sprites.js`: tabla `{ id, src, dest, exportScale }`, escala con `sharp(...).resize({ kernel: 'nearest' })` a `assets/sprites/`, `assets/icons/` o `assets/backgrounds/`, PNG con `palette: true`, y falla con código ≠ 0 si alguna dimensión > 2048 px; añadir el script `"sprites": "node scripts/build-sprites.js"` en `package.json`
- [x] T012 Crear exports 1× **provisionales** para todo el inventario de [contracts/assets.md](./contracts/assets.md#inventario-requerido) en `assets/pixel-src/export/` (bloques de color de la paleta con el número de fotograma y el tamaño/rejilla definitivos) y ejecutar `npm run sprites`
- [x] T013 Crear `theme/sprites.ts` con los tipos `SpriteId`, `SpriteSheet` y `AnimationClip` de [data-model.md](./data-model.md) y el manifiesto `sheets` (con `require` de `assets/sprites/*.png`) sin clips aún
- [x] T014 [P] Crear `__tests__/sprites.test.ts`: cada hoja cumple `columns·frameWidth·exportScale ≤ 2048` y `rows·frameHeight·exportScale ≤ 2048`, y cada clip registrado referencia una hoja existente, `frames` no vacío con índices < `frameCount`, `8 ≤ fps ≤ 15` y `reducedFrame` válido
- [x] T015 Crear `hooks/useSpriteClip.ts` según [contracts/components.md](./contracts/components.md#usespriteclipclip-animationclip-playing-boolean-onend---void) (un `Animated.Value` de índice, `Animated.timing` lineal de 0 a `frames.length` con duración `frames.length/fps` e interpolación con `extrapolate: 'clamp'`, bucle con `Animated.loop`, `onEnd` una vez, `holdLast`, fallback a `reducedFrame` con `useReducedMotion`, reinicio al cambiar de clip, `stop()` en cleanup)
- [x] T016 Crear `components/pixel/PixelSprite.tsx` (ventana `overflow: hidden` de `frameWidth·scale × frameHeight·scale`, hoja desplazada con `buildFrameInterpolation`, `scale` por defecto `getIntegerScale`, `accessible={false}` si no hay `accessibilityLabel`, clase `[image-rendering:pixelated]` en web y comprobar en el navegador que el estilo se aplica; si NativeWind no lo genera, usar `style` solo en web)
- [x] T017 [P] Crear `components/pixel/PixelText.tsx` con variantes `title`/`heading` (fuente `title`) y `body`/`caption` (fuente `body`), ignorando `fontWeight`; aceptar `adjustsFontSizeToFit`/`minimumFontScale` de `TextProps`
- [x] T018 Cargar fuentes con `useFonts` de `expo-font` en `app/_layout.tsx` y pasar `fontsLoaded` a `components/NavigationReady.tsx` para que espere también a las fuentes antes de renderizar los hijos

**Checkpoint**: `npm test` en verde; `PixelSprite` reproduce un clip provisional; fuentes cargadas

---

## Phase 3: User Story 1 - Bomba pixel art animada por frames (Priority: P1) 🎯 MVP

**Goal**: La bomba tiene los estados reposo / activa / explotando / explotada con sprites, temblor discreto, destello y temblor de pantalla.

**Independent Test**: [quickstart.md › US1](./quickstart.md#us1--bomba-p1): iniciar una ronda en la pantalla de juego, esperar la explosión y comprobar los 4 estados, nueva ronda limpia y 10 rondas sin tirones.

### Implementation for User Story 1

- [x] T019 [P] [US1] Crear el arte 1× de `bombIdle` (4 fr, 32×32), `bombArmed` (4 fr, 32×32) y `explosion` (8–10 fr, 64×64, último fotograma = humo) en `assets/pixel-src/` y exportarlo a `assets/pixel-src/export/` (o registrar en `assets/LICENSES.md` si es de terceros); ejecutar `npm run sprites`
- [x] T020 [US1] Registrar en `theme/sprites.ts` las hojas `bombIdle`, `bombArmed`, `explosion` y los clips `bombIdle` (8 fps, loop), `bombArmed` (12 fps, loop) y `bombExplode` (15 fps, una vez, `holdLast`: su último fotograma es el humo), con `reducedFrame` en cada uno
- [x] T021 [US1] Añadir `deriveBombVisualState(isActive, isExploded, explodeClipEnded)` a `theme/animation.ts` según [contracts/components.md](./contracts/components.md#helpers-puros-themeanimationts-themebackgroundsts) con sus casos en `__tests__/animation.test.ts`; después reescribir `components/Bomb.tsx` manteniendo las props `isActive` / `isExploded`: usar `deriveBombVisualState` ([data-model.md](./data-model.md#bombvisualstate-máquina-de-estados)), renderizar `PixelSprite` con el clip del estado, temblor ±1 `PIXEL_UNIT` con `stepsEasing` en `armed`, pasar a `exploded` en `onEnd` de `bombExplode`, añadir prop opcional `onExplosionPeak` (fotograma de máxima explosión), respetar `useReducedMotion` (sin temblor, salto directo a `exploded`) y tamaño con `getIntegerScale` (≈ 192–224 dp nativo, menor en web)
- [x] T022 [US1] En `app/game/index.tsx` sustituir `bg-red-900/50` por un overlay de destello (2 destellos × 80 ms con color de la paleta, `pointerEvents="none"`) y envolver el contenido en un `Animated.View` con temblor de pantalla escalonado (±2 `PIXEL_UNIT`, ≤ 500 ms), ambos disparados por `onExplosionPeak` de `Bomb` y omitidos con `useReducedMotion`
- [ ] T023 [US1] Verificar que salir de la pantalla de juego durante la explosión no deja animaciones ni warnings (cleanup en `components/Bomb.tsx` y `app/game/index.tsx`), que pulsar "siguiente"/"nueva ronda" repetidamente durante la explosión deja la bomba en el estado correcto, y validar [quickstart.md › US1](./quickstart.md#us1--bomba-p1)

**Checkpoint**: US1 funcional y demostrable de forma independiente (MVP)

---

## Phase 4: User Story 2 - Identidad visual pixel en toda la interfaz (Priority: P2)

**Goal**: Todas las pantallas y el modal usan fuente pixel, paneles/botones escalonados, sombras sólidas, iconos pixel, paleta limitada y fondo pixel.

**Independent Test**: [quickstart.md › US2](./quickstart.md#us2--identidad-visual-p2): checklist visual en las 4 pantallas + modal, pulsación de botón, toggle en 2 pasos, persistencia de fondo, prueba de glifos y fondo inválido.

### Tests for User Story 2

- [x] T024 [P] [US2] Crear `__tests__/background.test.ts`: `resolveBackground('default')` y `resolveBackground('city')` devuelven el mismo id, `'xyz'`/`''`/`null` → `'default'`

### Implementation for User Story 2

- [x] T025 [P] [US2] Crear el arte 1× de iconos (`back`, `help`, `settings`, `check`, `dice`, `bomb`, `boom`, `coin`, `chain`, `eyes`, `abc` en 16×16 y `rps` en 32×16), `loader` (4 fr) y fondos `default` y `city` (180×390 c/u, + `bgStars` opcional 2–4 fr) en `assets/pixel-src/`, exportar y ejecutar `npm run sprites` (fondos ×5 → `assets/backgrounds/default.png` y `assets/backgrounds/city.png`)
- [x] T026 [US2] Registrar en `theme/sprites.ts` el mapa de iconos `PixelIconName → source`, la hoja/clip `loader` (8 fps, loop) y, si existe, `bgStars`
- [x] T027 [P] [US2] Crear `theme/backgrounds.ts` con `BackgroundOption[]` para `default` y `city` (`id`, `labelKey: 'settings.backgrounds.<id>'`, `source`, `overlayClip?`) y `resolveBackground(id)`
- [x] T028 [P] [US2] Crear `components/pixel/PixelPanel.tsx` (tonos `light`/`dark`, `dashed`, bordes de `PIXEL_UNIT` con esquinas escalonadas mediante 4 vistas de borde insertadas, sombra sólida desplazada `PIXEL_UNIT`)
- [x] T029 [P] [US2] Crear `components/pixel/PixelButton.tsx` (variantes `primary`/`danger`/`secondary`/`ghost`, tamaños `md`/`lg`, `icon` opcional, `Pressable` con `translateY: PIXEL_UNIT` y sin sombra al pulsar, `disabled` atenuado, `accessibilityRole="button"` y `accessibilityState`)
- [x] T030 [P] [US2] Crear `components/pixel/PixelToggle.tsx` (indicador en 2 pasos con `stepsEasing(2)` ≈ 120 ms, instantáneo con `useReducedMotion`, `accessibilityRole="switch"`, `accessibilityState={{ checked }}`)
- [x] T031 [US2] Crear `components/pixel/PixelIcon.tsx` usando el mapa de iconos de `theme/sprites.ts` (tamaño en múltiplos enteros, pixelated en web)
- [x] T032 [US2] Actualizar `components/BackgroundWrapper.tsx` para usar `resolveBackground` y `theme/backgrounds.ts`, color de respaldo de la paleta y capa `overlayClip` con `PixelSprite` oculta con `useReducedMotion`
- [x] T033 [US2] Actualizar `app/settings/index.tsx`: opciones de fondo desde `theme/backgrounds.ts` con `t(labelKey)`, paneles con `PixelPanel`, desplegables/inputs con bordes y colores pixel, check con `PixelIcon name="check"`, textos con `PixelText`; añadir claves `settings.backgrounds.*` en `locales/es.json` y `locales/en.json`
- [x] T034 [US2] Sustituir el `ActivityIndicator` de `components/NavigationReady.tsx` por `PixelSprite` con el clip `loader` (fondo de la paleta)
- [x] T035 [US2] Migrar `app/index.tsx` a `PixelText` (título) y `PixelButton` (Jugar, Ajustes) manteniendo los `Link` actuales
- [x] T036 [US2] Migrar `app/game/config.tsx`: `PixelPanel` para contenedor y filas, pestañas de modo pixel, `PixelToggle` en lugar del `Switch` local, `PixelIcon` `dice`/`bomb` en lugar de 🎲/💣, `PixelButton` para empezar/volver, `PixelText` en textos
- [x] T037 [US2] Migrar `app/game/index.tsx`: `PixelIcon` `back`/`help` en lugar de `Feather` (mismas `accessibilityLabel`), `PixelButton` para iniciar/siguiente/nueva ronda/simular, `PixelText` para estado (sin `font-black`/`tracking-tighter`), insignias con bordes pixel
- [x] T038 [P] [US2] Migrar el estilo estático de `components/ChallengeDisplay.tsx`: `PixelPanel` (`light` / `dashed` para placeholder), `PixelText` con `adjustsFontSizeToFit` y `minimumFontScale` para prompts largos, letra prohibida con colores de la paleta, y `PixelIcon` por `GameType` (`RockPaperScissors → rps`, `WordChain → chain`, `LookAway → eyes` en lugar del prompt; `Alphabet → abc` + categoría) según research R11; cambiar `games/alphabet.ts` para que el prompt sea solo la categoría (sin `ALPHABET_ICON`) y confirmar que `__tests__/gameRouter.test.ts` sigue en verde
- [x] T039 [P] [US2] Migrar el estilo de `components/GameInstructions.tsx` a `PixelPanel` + `PixelText` + `PixelButton` (la animación del modal se hace en US4)
- [x] T040 [P] [US2] Migrar `components/ErrorBoundary.tsx` (componente de clase): colores de `theme/pixel.ts`, fuentes pixel vía `fontFamily`, `Image` del icono `boom` en lugar de 💥, botón con bordes rectos y sombra sólida
- [x] T041 [US2] Barrido en `app/` y `components/` (excepto `components/pixel/`): sin `rounded-*`, `shadow*`, `elevation`, `font-black`/`font-bold`, emojis (decorativos o mostrados como reto) ni `@expo/vector-icons`; validar [quickstart.md › US2](./quickstart.md#us2--identidad-visual-p2) incluida la prueba de glifos en `es`/`en`

**Checkpoint**: US1 y US2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Retos con animaciones pixel (Priority: P3)

**Goal**: Entrada escalonada de retos, moneda por sprites y texto parpadeante arcade.

**Independent Test**: [quickstart.md › US3](./quickstart.md#us3--retos-p3): modo personalizado con "Lanzar moneda" + "Sílabas", comprobar entrada de tarjeta, giro y parpadeo.

### Implementation for User Story 3

- [x] T042 [P] [US3] Crear el arte 1× de `coin` (8 fr de giro + cara + cruz, 16×16) en `assets/pixel-src/`, exportar y ejecutar `npm run sprites`
- [x] T043 [US3] Registrar en `theme/sprites.ts` la hoja `coin` y los clips `coinSpin` (12 fps, loop), `coinHeads` y `coinTails` (1 fr)
- [x] T044 [P] [US3] Añadir la prop `blink` a `components/pixel/PixelText.tsx` (encendido/apagado a 2 Hz con `Animated.loop` + `stepsEasing(1)`, desactivado con `useReducedMotion`, `stop()` en cleanup)
- [x] T045 [US3] Reescribir la animación de `components/CoinFlipChallenge.tsx` manteniendo props `isActive`/`isExploded`: `PixelSprite` `coinSpin` ~2 s que termina en `coinHeads`/`coinTails` según `result`, texto "lanzando…" con `PixelText blink`, `PixelButton` para lanzar, resultado directo con `useReducedMotion`, detener al desmontar o al explotar
- [x] T046 [US3] Añadir en `components/ChallengeDisplay.tsx` la entrada escalonada (escala 0.5 → 0.85 → 1 con `stepsEasing(3)`, 240 ms) al cambiar `prompt`/`type` o al dejar `isPlaceholder`; sin animación con `useReducedMotion`
- [ ] T047 [US3] Validar [quickstart.md › US3](./quickstart.md#us3--retos-p3) y salir del juego durante el giro sin warnings

**Checkpoint**: US1–US3 funcionan de forma independiente

---

## Phase 6: User Story 4 - Transiciones entre pantallas pixeladas (Priority: P4)

**Goal**: Transición de bloques en toda navegación (incluido "atrás" del sistema) y modal con pop escalonado.

**Independent Test**: [quickstart.md › US4](./quickstart.md#us4--transiciones-p4): Inicio → Config → Juego → atrás (app) → atrás (sistema) → Ajustes; pulsaciones rápidas; abrir/cerrar instrucciones.

### Implementation for User Story 4

- [x] T048 [US4] Añadir `transitionReducer(phase, event)` a `theme/animation.ts` según [contracts/components.md](./contracts/components.md#helpers-puros-themeanimationts-themebackgroundsts) con sus casos en `__tests__/animation.test.ts`; después crear `components/pixel/PixelTransitionOverlay.tsx`: provider + overlay absoluto con rejilla 6×12 de bloques de la paleta, un `Animated.Value` y una interpolación de opacidad por bloque con `blockThresholds` y `stepsEasing` (≤ 6 pasos); fases gestionadas con `transitionReducer` ([data-model.md](./data-model.md#transitionphase-máquina-de-estados)) (cover ≈ 200 ms, reveal ≈ 200 ms al cambiar `usePathname()`, timeout de seguridad ≥ 1 s a `idle`, `pointerEvents="none"` en `idle`); sin overlay con `useReducedMotion`
- [x] T049 [US4] Crear `hooks/usePixelNavigation.ts` (`push`/`replace`/`back` + `isTransitioning`; ignora llamadas si la fase ≠ `idle`; cover → `router.*`; navegación directa con `useReducedMotion`)
- [x] T050 [US4] En `app/_layout.tsx` cambiar el `Stack` a `animation: 'none'` y montar el provider/overlay de `PixelTransitionOverlay` dentro de `BackgroundWrapper` por encima del `Stack`
- [x] T051 [P] [US4] En `app/index.tsx` sustituir los `Link asChild` por `PixelButton` con `onPress` → `usePixelNavigation().push('/game/config' | '/settings')`
- [x] T052 [P] [US4] En `app/game/config.tsx` sustituir `router.push(...)` y `router.back()` por `usePixelNavigation()`
- [x] T053 [P] [US4] En `app/game/index.tsx` sustituir `router.back()` del manejador de volver por `usePixelNavigation().back()` (manteniendo `SoundManager.stopTick()` antes)
- [x] T054 [P] [US4] En `app/settings/index.tsx` sustituir `router.back()` por `usePixelNavigation().back()`
- [x] T055 [P] [US4] En `components/GameInstructions.tsx` usar `Modal animationType="none"` y animar el contenido con 3 pasos de escala (`stepsEasing(3)`, ≈ 180 ms) al abrir y la secuencia inversa antes de llamar a `onClose`; instantáneo con `useReducedMotion`
- [ ] T056 [US4] Validar [quickstart.md › US4](./quickstart.md#us4--transiciones-p4) en Android (botón atrás), iOS (gesto de deslizar desde el borde; si no es fiable aplicar el plan B de research R4 en `app/_layout.tsx`) y Web (botón atrás del navegador)

**Checkpoint**: US1–US4 funcionan de forma independiente

---

## Phase 7: User Story 5 - Respeto a "reducir movimiento" (Priority: P5)

**Goal**: Con "reducir movimiento" activo, mismo estilo sin temblores, destellos, transiciones ni bucles; cambio en caliente.

**Independent Test**: [quickstart.md › US5](./quickstart.md#us5--reducir-movimiento-p5): activar la opción del sistema y repetir US1–US4; desactivarla con la app abierta.

### Implementation for User Story 5

- [x] T057 [US5] Auditar el uso de `useReducedMotion` en `components/Bomb.tsx`, `app/game/index.tsx`, `components/pixel/PixelToggle.tsx`, `components/pixel/PixelText.tsx`, `components/pixel/PixelTransitionOverlay.tsx`, `components/CoinFlipChallenge.tsx`, `components/ChallengeDisplay.tsx`, `components/GameInstructions.tsx`, `components/BackgroundWrapper.tsx` y `components/NavigationReady.tsx`, y corregir cualquier fallback ausente (fotograma clave estático, sin destello)
- [x] T058 [US5] Revisar `timings` en `theme/pixel.ts` y el destello de `app/game/index.tsx` para garantizar ≤ 3 destellos/s en cualquier secuencia (incluido `PixelText blink` a 2 Hz)
- [ ] T059 [US5] Validar [quickstart.md › US5](./quickstart.md#us5--reducir-movimiento-p5) en iOS, Android y Web (`prefers-reduced-motion`), incluido el cambio en caliente

**Checkpoint**: Todas las historias funcionan de forma independiente

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Arte final, limpieza, documentación y presupuestos

- [ ] T060 Sustituir cualquier export provisional restante de T012 por el arte final en `assets/pixel-src/export/`, ejecutar `npm run sprites` y completar `assets/LICENSES.md` (FR-024)
- [x] T061 Eliminar `assets/images/bomb.png` y `assets/images/explosion.png` tras comprobar con búsqueda que no tienen referencias
- [x] T062 [P] Actualizar la sección _Styling_ de `CLAUDE.md` con el kit `components/pixel/`, `theme/`, `npm run sprites`, `useReducedMotion` y `usePixelNavigation`
- [x] T063 Medir el bundle con `npx expo export --platform android` y comprobar ≤ 5 MB sobre la línea base de T004 (SC-007)
- [x] T064 Ejecutar `npm run validate` y `npm test` y corregir fallos
- [ ] T065 Ejecutar la validación completa de [quickstart.md](./quickstart.md) (incluidos casos límite: iPhone SE, tablet, salida a mitad de animación) en Android, iOS y Web
- [ ] T066 Hacer la prueba con ≥ 5 jugadores de [quickstart.md › Presupuestos finales](./quickstart.md#5-presupuestos-finales) y registrar el resultado de SC-008

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias
- **US1–US5 (Phases 3–7)**: dependen de Foundational
- **Polish (Phase 8)**: depende de las historias que se quieran entregar

### User Story Dependencies

- **US1 (P1)**: solo Foundational; no depende de otras historias.
- **US2 (P2)**: solo Foundational. Toca `app/game/index.tsx` igual que US1 (T022 vs T037): hacerlas en secuencia si se trabaja en paralelo.
- **US3 (P3)**: Foundational. Usa `PixelButton` (T029) en T045; si US2 no está, usar un `Pressable` temporal y migrarlo luego.
- **US4 (P4)**: Foundational. T051 usa `PixelButton` (T029); los demás cambios son independientes.
- **US5 (P5)**: audita lo implementado en US1–US4; ejecutar al final.

### Within Each User Story

- Arte (exports + `npm run sprites`) → registro en `theme/sprites.ts` → componentes → integración en pantallas → validación quickstart
- Tests de lógica pura antes o junto al helper que cubren

### Parallel Opportunities

- Setup: T002, T003 en paralelo
- Foundational: T005, T008, T010, T011 en paralelo; luego T007, T009, T014, T017 en paralelo
- US1: T019 (arte) en paralelo con cualquier tarea de código de Foundational ya cerrada
- US2: T024, T025, T027, T028, T029, T030 en paralelo; luego T038, T039, T040 en paralelo
- US3: T042 y T044 en paralelo
- US4: T051–T055 en paralelo tras T048–T050
- Arte de distintas historias (T019, T025, T042) puede producirse en paralelo por un artista desde el día 1

---

## Parallel Example: User Story 2

```bash
# Kit de componentes en paralelo (ficheros distintos):
Task: "Crear components/pixel/PixelPanel.tsx"
Task: "Crear components/pixel/PixelButton.tsx"
Task: "Crear components/pixel/PixelToggle.tsx"
Task: "Crear theme/backgrounds.ts"
Task: "Crear __tests__/background.test.ts"

# Migraciones de componentes en paralelo tras el kit:
Task: "Migrar components/ChallengeDisplay.tsx"
Task: "Migrar components/GameInstructions.tsx"
Task: "Migrar components/ErrorBoundary.tsx"
```

## Parallel Example: User Story 4

```bash
# Tras T048–T050, sustituir navegación en paralelo:
Task: "app/index.tsx → usePixelNavigation().push"
Task: "app/game/config.tsx → usePixelNavigation()"
Task: "app/game/index.tsx → usePixelNavigation().back()"
Task: "app/settings/index.tsx → usePixelNavigation().back()"
Task: "components/GameInstructions.tsx → pop escalonado"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (incluye sprites provisionales: el código no espera al arte)
3. Phase 3: US1 — bomba pixel
4. **STOP and VALIDATE**: [quickstart.md › US1](./quickstart.md#us1--bomba-p1)
5. Demo con el grupo

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → bomba pixel (MVP)
3. US2 → toda la UI pixel
4. US3 → retos animados
5. US4 → transiciones
6. US5 → auditoría de accesibilidad
7. Polish → arte final, limpieza, presupuestos

---

## Notes

- [P] = ficheros distintos, sin dependencias pendientes
- `theme/sprites.ts` lo tocan T013, T020, T026, T043: secuenciales entre sí
- `app/game/index.tsx` lo tocan T022, T037, T053: secuenciales entre sí
- También secuenciales entre historias: `app/index.tsx` (T035 → T051), `app/game/config.tsx`
  (T036 → T052), `app/settings/index.tsx` (T033 → T054), `components/GameInstructions.tsx`
  (T039 → T055), `components/ChallengeDisplay.tsx` (T038 → T046), `components/pixel/PixelText.tsx`
  (T017 → T044)
- No cambiar reglas en `games/` ni `services/gameRouter.ts` (principio I); la única
  modificación permitida es retirar el emoji del prompt de `games/alphabet.ts` (T038)
- `theme/animation.ts` y `__tests__/animation.test.ts` los tocan T008/T009, T021 y T048:
  secuenciales entre sí
- Commit tras cada tarea o grupo lógico; `npm run validate` antes de cada commit (husky)
