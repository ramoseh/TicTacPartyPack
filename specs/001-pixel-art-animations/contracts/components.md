# UI Contract: componentes y hooks pixel

**Feature**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

Contratos de la interfaz pública (props y comportamiento observable). Las firmas son
orientativas en TypeScript; la implementación concreta se decide en `/speckit-implement`.

## Reglas comunes

- Toda animación usa `useNativeDriver: Platform.OS !== 'web'` y se detiene (`stop()`) en
  el cleanup del `useEffect` o al desmontar (FR-023).
- Todo componente animado consulta `useReducedMotion()` y aplica su fallback estático.
- Medidas visuales en múltiplos de `PIXEL_UNIT`; colores solo de `palette`.
- Texto siempre vía i18n; etiquetas accesibles conservadas o añadidas.

## Helpers puros (`theme/animation.ts`, `theme/backgrounds.ts`)

| Función                                                                                                                                   | Contrato                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stepsEasing(n: number): (t: number) => number`                                                                                           | Devuelve `floor(t·n)/n`, con `t=1 → 1`. `n ≥ 1`.                                                                                                   |
| `buildFrameInterpolation(frames: number[], cols: number, w: number, h: number)`                                                           | Devuelve `{ inputRange, translateX, translateY }` en escalón: para el índice `i` en `[i, i+1)` la salida es constante y corresponde a `frames[i]`. |
| `getIntegerScale(base: number, maxDp: number): number`                                                                                    | `max(1, floor(maxDp / base))`: dp por píxel de sprite, siempre entero.                                                                             |
| `blockThresholds(cols: number, rows: number, seed: number): number[]`                                                                     | Un umbral en `[0,1)` por bloque, determinista para la misma semilla, todos distintos por paso.                                                     |
| `resolveBackground(id: string \| null): BackgroundId`                                                                                     | `id` válido → `id`; en otro caso `'default'`.                                                                                                      |
| `deriveBombVisualState(isActive: boolean, isExploded: boolean, explodeClipEnded: boolean): BombVisualState`                               | `isExploded` → `exploded` si `explodeClipEnded`, si no `exploding`; si no, `isActive` → `armed`; si no `idle`.                                     |
| `transitionReducer(phase: TransitionPhase, event: 'navigate' \| 'coverEnd' \| 'pathChange' \| 'revealEnd' \| 'timeout'): TransitionPhase` | Implementa el diagrama de `TransitionPhase`; eventos no válidos en una fase devuelven la misma fase.                                               |

## `useReducedMotion(): boolean`

- Valor inicial de `AccessibilityInfo.isReduceMotionEnabled()`; `false` hasta resolver.
- Se suscribe a `reduceMotionChanged` y se desuscribe al desmontar.

## `useSpriteClip(clip: AnimationClip, playing: boolean, onEnd?: () => void)`

- Devuelve un `Animated.Value` de índice de fotograma; la interpolación usa
  `extrapolate: 'clamp'` para que el valor final (`frames.length`) muestre el último fotograma.
- `playing=true`: reproduce a `clip.fps`; si `loop`, en bucle; si no, llama `onEnd` una vez
  al terminar y, si `holdLast`, queda en el último fotograma.
- `playing=false` o reducir movimiento: valor fijo en `clip.reducedFrame`; `onEnd` se llama
  inmediatamente si el clip no es en bucle.
- Cambiar `clip` reinicia en el fotograma 0.

## `<PixelSprite>`

```ts
type PixelSpriteProps = {
  clip: AnimationClip;
  playing?: boolean; // default true
  scale?: number; // dp por píxel de sprite; default getIntegerScale(...)
  onEnd?: () => void;
  accessibilityLabel?: string; // si se omite, accessible={false}
  style?: StyleProp<ViewStyle>;
};
```

- Renderiza una ventana `frameWidth·scale × frameHeight·scale` con `overflow: hidden` y la
  hoja completa desplazada según `buildFrameInterpolation`.
- En web aplica `image-rendering: pixelated`.

## `<Bomb>` (contrato existente preservado)

```ts
type BombProps = { isActive: boolean; isExploded?: boolean };
```

- Props sin cambios para no tocar la lógica de `app/game/index.tsx`.
- Implementa `BombVisualState` de [data-model.md](../data-model.md#bombvisualstate-máquina-de-estados).
- Nuevo callback opcional `onExplosionPeak?: () => void` para que la pantalla de juego
  dispare el destello y el temblor de pantalla en el fotograma de máxima explosión.

## `<PixelButton>`

```ts
type PixelButtonProps = {
  label: string; // ya traducido
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary' | 'ghost';
  icon?: PixelIconName;
  disabled?: boolean;
  size?: 'md' | 'lg';
  accessibilityLabel?: string; // default = label
};
```

- `accessibilityRole="button"`, `accessibilityState={{ disabled }}`.
- Presionado: `translateY = PIXEL_UNIT`, sin sombra; soltado: posición y sombra originales.
  Sin interpolación (FR-009). `disabled`: paleta atenuada, sin efecto de pulsación.

## `<PixelPanel>`

```ts
type PixelPanelProps = {
  children: ReactNode;
  tone?: 'light' | 'dark'; // light = tarjeta de reto, dark = config/ajustes
  dashed?: boolean; // placeholder de reto
  shadow?: boolean; // default true
  style?: StyleProp<ViewStyle>;
};
```

- Borde de `PIXEL_UNIT` con esquinas escalonadas; sombra sólida desplazada `PIXEL_UNIT`.

## `<PixelToggle>`

```ts
type PixelToggleProps = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  accessibilityLabel: string;
};
```

- `accessibilityRole="switch"`, `accessibilityState={{ checked: value }}`.
- El indicador se desplaza en 2 pasos (`stepsEasing(2)`, ≈120 ms); instantáneo con
  reducir movimiento.

## `<PixelText>`

```ts
type PixelTextProps = TextProps & {
  variant?: 'title' | 'heading' | 'body' | 'caption';
  blink?: boolean; // parpadeo 2 Hz (FR-017); desactivado con reducir movimiento
};
```

- `title`/`heading` → fuente `title`; `body`/`caption` → fuente `body`.
- No acepta pesos (`fontWeight` se ignora).

## `<PixelIcon>`

```ts
type PixelIconName =
  | 'back'
  | 'help'
  | 'settings'
  | 'check'
  | 'dice'
  | 'bomb'
  | 'boom'
  | 'coin'
  | 'rps'
  | 'chain'
  | 'eyes'
  | 'abc';
type PixelIconProps = { name: PixelIconName; size?: number; accessibilityLabel?: string };
```

- Sustituye emojis decorativos, los emojis de los retos y los `Feather` de `app/game/index.tsx`.

## `<PixelTransitionOverlay>` + `usePixelNavigation()`

```ts
function usePixelNavigation(): {
  push: (href: Href) => void;
  replace: (href: Href) => void;
  back: () => void;
  isTransitioning: boolean;
};
```

- Montado una vez en `app/_layout.tsx` por encima del `Stack` (que usa `animation: 'none'`).
- Implementa `TransitionPhase` de [data-model.md](../data-model.md#transitionphase-máquina-de-estados).
- `push/replace/back` ignorados si `isTransitioning` (FR-019).
- Duración total ≤ 400 ms (FR-018/SC-004); timeout de seguridad ≥ 1 s vuelve a `idle`.
- Con reducir movimiento: navegación directa sin overlay.

## `<GameInstructions>` (contrato existente preservado)

- Props sin cambios. `Modal animationType="none"`; el contenido aparece con 3 pasos de
  escala (`stepsEasing(3)`, ≈180 ms) y se cierra con la secuencia inversa antes de
  llamar a `onClose`.

## `<ChallengeDisplay>` / `<CoinFlipChallenge>` (contratos existentes preservados)

- `ChallengeDisplay`: props sin cambios; cuando cambian `prompt`/`type` (o pasa de
  `isPlaceholder` a reto), entrada escalonada ≤ 3 pasos y < 300 ms (FR-015). Para
  `RockPaperScissors`, `WordChain` y `LookAway` muestra `PixelIcon` (`rps`, `chain`,
  `eyes`) en lugar del prompt; para `Alphabet` muestra `PixelIcon abc` + la categoría
  (research R11).
- `CoinFlipChallenge`: props sin cambios (`isActive`, `isExploded`); al lanzar, `coinSpin`
  durante ~2 s y termina en `coinHeads` o `coinTails` según el resultado ya calculado
  (FR-016); texto "lanzando…" con `PixelText blink`.
