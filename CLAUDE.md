# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server (Expo)
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

All start commands use `node -r ./polyfill.js` to load array polyfills (`toReversed`, `toSorted`, `toSpliced`, `with`) required by the React 19 / React Native environment before starting Expo.

Tests use Jest (`jest-expo`) and live in `__tests__/`; run `npm test`. `npm run validate` runs typecheck, lint and format check.

## Architecture

This is a React Native party game app built with Expo (SDK 54), using the **file-based routing** of Expo Router v6. The app uses the new React Native architecture (`newArchEnabled: true`).

### Routing / Screens (`app/`)

Expo Router maps the file system to navigation routes:

- `app/_layout.tsx` - Root layout; wraps the entire app with `SafeAreaProvider`, `SettingsProvider`, `NavigationReady`, and `BackgroundWrapper`, then renders a `<Stack>` with no headers and fade animations.
- `app/index.tsx` - Home screen (mode selection entry point).
- `app/game/config.tsx` - Game configuration screen; lets the user pick a mode (`classic`, `custom`, `simple`) and, in custom mode, toggle individual `GameType`s. Navigates to `/game` passing URL params (`simpleMode`, `allowedTypes`).
- `app/game/index.tsx` - Active game screen; reads URL params to determine mode, drives the bomb timer (random duration between `minTime`–`maxTime` seconds), calls `getRandomGame()` to get the current challenge, and manages the full game loop (idle → active → exploded → next round).
- `app/settings/index.tsx` - Settings screen for timer ranges and background image.

### Game Logic (`games/` + `services/gameRouter.ts`)

Each file in `games/` exports a single prompt-generation function (e.g. `getRandomSyllable`, `getRPSPrompt`). These are pure functions — no side effects, no state.

`services/gameRouter.ts` is the central dispatcher:

- Exports the `GameType` enum (one value per mini-game) and the `GameChallenge` / `GameConfig` interfaces.
- `getRandomGame(lang, config)` picks a random `GameType` (filtered by `config.allowedTypes` if provided), calls the corresponding game module, and returns a `GameChallenge` with `{ type, prompt, instruction }`.
- The `instruction` field is an i18n key (e.g. `'game.instruction.starts_with'`), not a translated string.

### State Management (`store/SettingsContext.tsx`)

A single React Context (`SettingsContext`) holds all user-configurable settings:

- `minTime` / `maxTime` — bomb timer range in seconds
- `guessMax`, `multiplyMin`, `multiplyMax`, `forbiddenLetterMax` — per-game parameters
- `backgroundImage` — selected background key

All setters auto-persist to `AsyncStorage` immediately. There is also a `saveSettings()` function that validates and saves all fields at once (used by the settings screen).

Consume with the `useSettings()` hook.

### Styling

NativeWind v4 is used for Tailwind-based styling in React Native. Tailwind classes are applied via `className` props. The `tailwind.config.js` scans `app/**` and `components/**`. The global CSS entry is `global.css`, imported in `_layout.tsx`.

When mixing Tailwind classes with dynamic inline styles, use `style={{}}` for values that can't be expressed as static class names (e.g. computed colors, opacity values).

### Pixel-art UI & animation

- **Theme** (`theme/pixel.ts`): 16-color `palette` (mirrored as `px-*` colors in `tailwind.config.js`, kept in sync by `__tests__/theme.test.ts`), `PIXEL_UNIT = 4` dp (every border/shadow/offset is a multiple), `fonts` (Press Start 2P for titles, Pixelify Sans for body) and `timings`.
- **Kit** (`components/pixel/`): `PixelText`, `PixelButton`, `PixelPanel`, `PixelToggle`, `PixelIcon`, `PixelSprite`, `PixelTransitionOverlay`. Use these instead of rounded corners, blurred shadows, emojis or vector icons.
- **Animations** use RN `Animated` with the native driver (`useNativeDriver: Platform.OS !== 'web'`) and always step: sprites are frame-indexed via `useSpriteClip` + `buildFrameInterpolation`; UI motion uses `stepsEasing(n)` (`theme/animation.ts`). Stop animations in effect cleanups.
- **Reduced motion**: every animated component must check `useReducedMotion()` and fall back to a static key frame.
- **Navigation**: the `Stack` uses `animation: 'none'`; navigate with `usePixelNavigation()` (`push`/`replace`/`back`) so the block transition plays.
- **Art pipeline**: 1x pixel art is generated from code by `scripts/generate-pixel-art.js` into `assets/pixel-src/export/`, then `scripts/build-sprites.js` upscales it with nearest-neighbor into `assets/sprites`, `assets/icons` and `assets/backgrounds` (max 2048 px). Run `npm run art` (both) or `npm run sprites` (upscale only, e.g. after replacing exports with hand-made art). Register sheets/clips/icons in `theme/sprites.ts` and backgrounds in `theme/backgrounds.ts`. Third-party assets go in `assets/LICENSES.md`.

### Internationalization (`i18n.ts`, `locales/`)

i18next + react-i18next. Language is auto-detected from device locale via `expo-localization`, with Spanish (`es`) as the default and fallback. Only `en` and `es` are supported.

Translation keys follow this structure:

- `game.instruction.*` — challenge instructions shown during gameplay
- `instructions.<GameType>.*` — per-game instruction modal content
- `config.*` — game configuration screen labels

When adding a new game, add translation keys to **both** `locales/en.json` and `locales/es.json`.

### Audio (`services/SoundManager.ts`)

A singleton object wrapping `expo-av`. Loads `assets/sounds/tick.mp3` (looping during active bomb) and `assets/sounds/explode.mp3` (on explosion). Call `SoundManager.unload()` on screen unmount.

### Adding a New Mini-Game

1. Create `games/<gameName>.ts` with a prompt-generation function.
2. Add a new value to the `GameType` enum in `services/gameRouter.ts`.
3. Add a `case` in `getRandomGame()` that calls your function and returns a `GameChallenge`.
4. Add translation keys for `game.instruction.<key>` and `instructions.<GameType>.*` in both locale files.
5. If the game needs a custom display (beyond text prompt), add a component and handle it in `components/ChallengeDisplay.tsx`.
