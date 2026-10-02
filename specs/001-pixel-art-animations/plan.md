# Implementation Plan: Animaciones y estilo visual pixel art

**Branch**: `001-pixel-art-animations` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-pixel-art-animations/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Sustituir el estilo visual actual (sprites 3D, sombras difusas, esquinas redondeadas,
emojis, `fade`/`spring` suaves) por un estilo pixel art coherente en bomba, retos, UI,
tipografía, fondos y transiciones. Enfoque técnico ([research.md](./research.md)):

- Animación por fotogramas con la API `Animated` de RN y driver nativo: un `Animated.Value`
  de índice de fotograma + `interpolate` en escalón sobre hojas de sprites, y easing
  cuantizado `steps(n)` para temblores/escalas (sin dependencias nuevas de animación).
- Nitidez mediante assets pre-escalados con nearest-neighbor (`sharp`) y escala entera
  en pantalla; `image-rendering: pixelated` en web.
- Kit de componentes `components/pixel/` (botón, panel, toggle, texto, icono, sprite) con
  tema central (paleta 16 colores, `PIXEL_UNIT = 4` dp, fuentes OFL).
- Transición global de bloques como overlay sobre el `Stack` (`animation: 'none'`).
- `useReducedMotion()` para desactivar movimiento según el sistema.

## Technical Context

**Language/Version**: TypeScript ~5.9 (strict), React 19.1, React Native 0.81.5 (nueva arquitectura)

**Primary Dependencies**: Expo SDK ~54, Expo Router ~6, NativeWind ^4.2 + Tailwind ^3.3,
`Animated` de RN (existente), `expo-av` (sin cambios). **Nuevas**: `expo-font`,
`@expo-google-fonts/press-start-2p`, `@expo-google-fonts/pixelify-sans` (R3).
**Dev existente reutilizada**: `sharp` ^0.34 para el pre-escalado (R2).

**Storage**: AsyncStorage (clave existente `backgroundImage`; sin claves nuevas)

**Testing**: Jest 29 + `jest-expo` (tests en `__tests__/`) para lógica pura; validación
visual manual según [quickstart.md](./quickstart.md)

**Target Platform**: iOS, Android (edge-to-edge) y Web; solo vertical; iPad soportado

**Project Type**: mobile-app (Expo, una sola app)

**Performance Goals**: sin tirones perceptibles en Android gama media (SC-002); bomba
activa < 100 ms tras pulsar (SC-003); transición ≤ 400 ms (SC-004); 8–15 fps de sprite

**Constraints**: +≤ 5 MB de bundle (SC-007); hojas de sprites ≤ 2048×2048 px; ≤ 3
destellos/s; respetar reducir movimiento; sin cambios de reglas en `games/` ni en
`services/gameRouter.ts` (solo se retira el emoji de presentación del prompt de
`games/alphabet.ts`, ver research R11)

**Scale/Scope**: 4 pantallas + 1 modal, 7 componentes existentes a migrar, ~6 componentes
pixel nuevos, ~10 hojas de sprites/iconos, 2 fondos

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principio                     | Evaluación pre-research                                                  | Post-diseño (Phase 1)                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| I. Lógica de juego pura       | ✅ Solo capa de presentación; reglas de `games/` y `gameRouter` intactas | ✅ Los contratos no tocan `GameChallenge`; el icono del reto se resuelve en UI por `GameType` y se elimina el emoji de `alphabet.ts` (mejora el principio: saca presentación de la lógica) |
| II. Paridad i18n              | ⚠️ Fuente pixel debe cubrir áéíóúüñ¿¡ → R3                               | ✅ Fuentes OFL Latin-1 + prueba de glifos en quickstart; nuevos labels de fondo en `es`/`en`                                                                                               |
| III. Paridad multiplataforma  | ⚠️ Nitidez y driver nativo difieren en web → R1/R2                       | ✅ Pre-escalado común + `pixelated` en web; `useNativeDriver: Platform.OS !== 'web'`                                                                                                       |
| IV. Fluidez y accesibilidad   | ⚠️ Transiciones/explosión → R4/R6/R9                                     | ✅ Driver nativo, cleanup en desmontaje, `useReducedMotion`, ≤ 2 destellos                                                                                                                 |
| V. Simplicidad y deps mínimas | ⚠️ Fuentes requieren deps                                                | ✅ Solo `expo-font` + 2 paquetes de fuentes (SDK-compatibles, `npx expo install`); Reanimated/Skia/Lottie rechazados                                                                       |
| Quality gates                 | ✅ `npm run validate` + `npm test`                                       | ✅ Tests unitarios definidos en R10                                                                                                                                                        |

**Resultado**: PASS. Sin violaciones que justificar.

## Fases de implementación (orden propuesto para `/speckit-tasks`)

0. **Fundación** (bloqueante): tema (`theme/pixel.ts`, Tailwind), fuentes, `useReducedMotion`,
   helpers puros de animación + tests, script `scripts/build-sprites.js`, manifiesto de
   sprites, `PixelSprite`.
1. **US1 Bomba (P1)**: arte bomba/explosión/humo; reescritura de `components/Bomb.tsx` con
   estados visuales; destello y temblor de pantalla en `app/game/index.tsx`.
2. **US2 UI (P2)**: `PixelButton`, `PixelPanel`, `PixelToggle`, `PixelText`, `PixelIcon`;
   migración de `app/index.tsx`, `app/game/config.tsx`, `app/game/index.tsx`,
   `app/settings/index.tsx`, `ErrorBoundary`, `NavigationReady` (cargador pixel);
   fondo pixel + `resolveBackground` en `BackgroundWrapper`.
3. **US3 Retos (P3)**: entrada escalonada en `ChallengeDisplay`; moneda por sprites y
   parpadeo en `CoinFlipChallenge`.
4. **US4 Transiciones (P4)**: `PixelTransitionOverlay` + `usePixelNavigation`; Stack con
   `animation: 'none'`; modal de `GameInstructions` con pop escalonado.
5. **US5 Reducir movimiento (P5)**: verificación transversal de fallbacks estáticos.
6. **Pulido**: `assets/LICENSES.md`, medida de tamaño de bundle, actualizar `CLAUDE.md`
   (sección Styling/animaciones), eliminar `bomb.png`/`explosion.png` antiguos.

**Riesgos**:

| Riesgo                                  | Mitigación                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| Difuminado en Android con DPR no entero | Pre-escalado ×8–×12; validar en emulador DPR 2.625/2.75; plan B: Skia solo para `PixelSprite` |
| Overlay de transición bloquea toques    | `pointerEvents="none"` en `idle`; timeout de seguridad que fuerza `idle`                      |
| Arte no disponible a tiempo             | Placeholders 1× generados con el mismo manifiesto; el código no depende del arte final        |
| Fuente pixel ancha corta prompts largos | `adjustsFontSizeToFit` + `minimumFontScale`; Pixelify Sans para cuerpo                        |

## Project Structure

### Documentation (this feature)

```text
specs/001-pixel-art-animations/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── components.md    # Props/comportamiento de componentes y hooks pixel
│   └── assets.md        # Formato de hojas de sprites, nombres y pipeline
├── checklists/
│   └── requirements.md  # Checklist de calidad de la spec
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── _layout.tsx                 # MOD: useFonts, Stack animation 'none', <PixelTransitionOverlay/>
├── index.tsx                   # MOD: PixelButton/PixelText
├── game/config.tsx             # MOD: PixelPanel/PixelToggle/PixelIcon (sin emojis)
├── game/index.tsx              # MOD: destello + temblor de pantalla, iconos pixel, botones
└── settings/index.tsx          # MOD: paneles/desplegables pixel, lista de fondos

components/
├── Bomb.tsx                    # REWRITE: estados visuales por sprites
├── ChallengeDisplay.tsx        # MOD: PixelPanel + entrada escalonada + PixelIcon por GameType
├── CoinFlipChallenge.tsx       # REWRITE: moneda por sprites + parpadeo
├── GameInstructions.tsx        # MOD: animationType 'none' + pop escalonado
├── BackgroundWrapper.tsx       # MOD: resolveBackground + capa animada opcional
├── NavigationReady.tsx         # MOD: espera fuentes + cargador pixel
├── ErrorBoundary.tsx           # MOD: estilo pixel (sin hooks: tema estático)
└── pixel/                      # NEW
    ├── PixelSprite.tsx
    ├── PixelButton.tsx
    ├── PixelPanel.tsx
    ├── PixelToggle.tsx
    ├── PixelText.tsx
    ├── PixelIcon.tsx
    └── PixelTransitionOverlay.tsx

hooks/                          # NEW
├── useReducedMotion.ts
├── useSpriteClip.ts
└── usePixelNavigation.ts

theme/                          # NEW
├── pixel.ts                    # paleta, PIXEL_UNIT, fuentes, cadencias
├── animation.ts                # helpers puros: stepsEasing, buildFrameInterpolation, getIntegerScale, blockThresholds, deriveBombVisualState, transitionReducer
├── sprites.ts                  # manifiesto de hojas y clips (require de assets)
└── backgrounds.ts              # BackgroundOption[] + resolveBackground

assets/
├── pixel-src/                  # NEW: fuentes .aseprite + export 1×
├── sprites/                    # NEW: hojas pre-escaladas (generadas)
├── icons/                      # NEW: iconos pixel (generados)
├── backgrounds/                # MOD: default.png y city.png pixel (+ opcional bgStars)
└── LICENSES.md                 # NEW

scripts/build-sprites.js        # NEW: sharp nearest-neighbor, valida ≤ 2048 px
package.json                    # MOD: script "sprites"; deps de fuentes
tailwind.config.js              # MOD: colors.px.*, fontFamily pixel/pixel-body
locales/{es,en}.json            # MOD: etiquetas de fondos/estado de carga si aplica
games/alphabet.ts               # MOD: prompt sin emoji (solo categoría)

__tests__/
├── gameRouter.test.ts          # existente
├── animation.test.ts           # NEW
├── sprites.test.ts             # NEW: coherencia del manifiesto
├── theme.test.ts               # NEW: paleta ≤ 16 y sincronizada con tailwind.config.js
└── background.test.ts          # NEW: resolveBackground
```

**Structure Decision**: App Expo única. Se respeta la organización existente (`app/`,
`components/`, `store/`, `services/`) añadiendo `components/pixel/` para el kit visual,
`hooks/` para hooks reutilizables y `theme/` para tokens y lógica pura de animación
(testeable sin renderizar). `tailwind.config.js` ya escanea `components/**`; no hace falta
añadir `hooks/`/`theme/` al `content` porque no contienen clases.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No aplica: el Constitution Check no presenta violaciones.
