# Implementation Plan: Aviso no intrusivo para apoyar al creador

**Branch**: `003-donation-prompt` | **Date**: 2026-10-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-donation-prompt/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Añadir una invitación voluntaria a donar que aparece una sola vez al completar 10 rondas. El aviso será una tarjeta compacta superpuesta en la pantalla de juego, sin `Modal`, sin fondo oscuro y sin bloquear la interacción. Se apoya en el flujo existente de explosión de la bomba: cada explosión cuenta como ronda completada y se persiste en AsyncStorage junto con una bandera de "ya mostrado". El botón abre la página de Ko-fi en el navegador externo; en web se usa una pestaña nueva para no abandonar la partida. La URL queda como valor de compilación vacío hasta que el creador cree su página; mientras tanto la feature permanece dormida. No se añaden dependencias ni backend.

El aviso se dibuja en una capa estable fuera de la transformación de sacudida de la pantalla, para que la explosión no lo desplace. La decisión de mostrarlo se toma con el estado síncrono de la ronda y un token de ronda, de modo que una escritura asíncrona en almacenamiento no pueda hacerlo aparecer después de iniciar la siguiente ronda.

## Technical Context

**Language/Version**: TypeScript ~5.9 (strict), React 19.1, React Native 0.81.5, Expo SDK 54, Expo Router ~6.0.21

**Primary Dependencies**: `@react-native-async-storage/async-storage` 2.2, `expo-linking` ~8.0.11, `react-i18next` ^16.5, NativeWind ^4.2, componentes `PixelPanel`/`PixelText`/`PixelButton` existentes. **Sin dependencias nuevas.**

**Storage**: AsyncStorage existente (localStorage en web). Dos claves nuevas e independientes: `donationRoundsCompleted` (entero no negativo serializado) y `donationPromptShown` (`'true'`/`'false'`). No se modifican las siete claves de ajustes ni su esquema.

**Testing**: Jest 29 + `jest-expo`; tests unitarios de saneamiento, umbral y transición de "mostrado". Validación manual en web/PWA y regresión nativa iOS/Android según [quickstart.md](./quickstart.md). Sin Playwright ni nueva toolchain E2E.

**Target Platform**: iOS, Android y Web/PWA. El enlace externo se abre con `Linking.openURL` en nativo y con una pestaña nueva en web; en web se comprueba `navigator.onLine` antes de abrir y no se usa el retorno de `window.open` como señal de éxito. La diferencia está acotada y justificada.

**Project Type**: aplicación universal Expo mobile + web estática/PWA, un solo proyecto.

**Performance Goals**: el aviso se renderiza como máximo una vez por instalación; no debe añadir trabajo durante una bomba activa; la escritura en almacenamiento ocurre después de la explosión y no bloquea la animación ni el temporizador; el temporizador de auto-ocultado se limpia al desmontar.

**Constraints**: sin backend, analytics, pagos dentro de la app ni verificación de donaciones; URL únicamente HTTPS; feature dormida si la URL está vacía; aviso no modal y de una sola aparición; textos en español e inglés; respetar reducir movimiento; no crear commit sin permiso explícito.

**Scale/Scope**: 1 pantalla de juego, 2 modos de juego, 2 idiomas, 2 claves de almacenamiento, 1 componente visual nuevo y 1 helper de estado. Sin cambios en `games/`, `gameRouter` ni en el service worker.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principio                             | Evaluación pre-research                                                        | Evaluación post-diseño                                                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Lógica de juego pura               | PASS: no se toca `games/` ni `gameRouter`.                                     | PASS: el conteo vive en `store/donationPrompt.ts` como helper puro con tests; la pantalla solo dispara el evento de explosión.                                                                                       |
| II. Paridad i18n (es/en)              | Condicionado a añadir claves en ambos idiomas.                                 | PASS: mensaje, acciones y error se añaden a `locales/es.json` y `locales/en.json`; no hay texto hardcodeado.                                                                                                         |
| III. Paridad multiplataforma          | Condicionado a justificar la apertura externa.                                 | PASS: `Linking.openURL` en iOS/Android y pestaña nueva en web; el resto del comportamiento es compartido. La diferencia está acotada a `Platform.OS === 'web'`.                                                      |
| IV. Fluidez y accesibilidad           | Condicionado a no interrumpir la partida y respetar reducir movimiento.        | PASS: sin `Modal`, sin foco atrapado, región `polite` en Android/web y `AccessibilityInfo.announceForAccessibility` en iOS; animación omitida con reducir movimiento, auto-ocultado a los 15 s y limpieza del timer. |
| V. Simplicidad y dependencias mínimas | PASS: se reutilizan AsyncStorage, Expo Linking y componentes pixel existentes. | PASS: cero dependencias nuevas; una tarjeta y un helper acotado; se descarta una librería de toasts y un contexto global.                                                                                            |
| Quality gates                         | Mantener `npm run validate`, `npm test` y el build web.                        | PASS: se añaden tests unitarios y se ejecutan `npm run validate`, `npm test`, `npm run build:web` y el quickstart manual.                                                                                            |

**Resultado post-diseño**: PASS. No hay violaciones que justificar ni `NEEDS CLARIFICATION` pendientes.

## Project Structure

### Documentation (this feature)

```text
specs/003-donation-prompt/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── donation-prompt.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
└── game/
    └── index.tsx                 # Dispara el conteo tras la explosión y renderiza el aviso

components/
├── DonationPrompt.tsx            # Tarjeta compacta, auto-ocultado y apertura del enlace
└── pixel/                        # PixelPanel, PixelText, PixelButton (sin cambios)

constants/
└── donation.ts                   # DONATION_URL, umbral y duración del auto-ocultado

store/
├── donationPrompt.ts             # Estado puro + persistencia en AsyncStorage
└── SettingsContext.tsx           # Sin cambios

locales/
├── es.json                       # Claves de donación
└── en.json                       # Claves de donación

__tests__/
└── donationPrompt.test.ts        # Saneamiento, umbral, una sola vez y fallback en memoria
```

**Structure Decision**: se mantiene el proyecto único existente. La configuración va en `constants/`, la lógica de estado y persistencia en `store/` (junto a `SettingsContext`), la UI en `components/` y la integración en la pantalla de juego. No se crea un contexto global porque el aviso solo lo consume una pantalla.

## Implementation Sequence

1. **Configuración y textos (US1)**: crear `constants/donation.ts` con la URL vacía, el umbral 10 y el auto-ocultado de 15 s; añadir las claves de i18n en ambos idiomas.
2. **Estado y persistencia (US1/US2)**: implementar `store/donationPrompt.ts` con saneamiento, lectura/escritura serializada, fallback en memoria y `shouldShowDonationPrompt`; escribir primero los tests unitarios.
3. **Componente visual (US1/US3)**: crear `components/DonationPrompt.tsx` con tarjeta compacta, animación opcional, cierre, error inline y apertura externa.
4. **Integración en la partida (US1/US2/US3)**: conectar `handleExplosion` con el conteo síncrono y un token de ronda, mostrar el aviso solo tras la explosión y en una capa estable fuera de la sacudida, diferirlo si el modal de reglas está abierto y ocultarlo al iniciar la siguiente ronda.
5. **Validación (US1/US2/US3)**: ejecutar quality gates, build web y quickstart manual; verificar una sola aparición, recarga, offline, modo simple, movimiento reducido, lector de pantalla en iOS/Android/web y que una ronda iniciada justo después de la explosión no reciba el aviso.

## Risks and Mitigations

| Risk                                                | Mitigation                                                                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| El aviso tapa o bloquea el botón de siguiente ronda | Tarjeta posicionada por encima del CTA, sin `Modal`, con `pointerEvents` limitado a su área y prueba en pantallas pequeñas.                    |
| El aviso se mueve con la sacudida de la explosión   | Renderizarlo en una capa estable fuera del `Animated.View` que aplica la transformación de sacudida.                                           |
| Una respuesta asíncrona muestra el aviso tarde      | Token de ronda y comprobación de `isExplodedRef` antes de hacerlo visible; `handleNewRound` e `igniteBomb` cancelan cualquier aviso pendiente. |
| El contador se corrompe o el almacenamiento falla   | Saneamiento de enteros/booleanos y fallback en memoria; un fallo de escritura nunca lanza al usuario ni impide jugar.                          |
| Dos explosiones seguidas pisan el contador          | Escrituras serializadas en el módulo; se relee el estado antes de decidir y se marca `promptShown` antes de mostrar.                           |
| El aviso reaparece tras recargar                    | La bandera `donationPromptShown` se persiste en cuanto el aviso se hace visible; el quickstart incluye recarga y 20 rondas extra.              |
| El modal de reglas queda debajo del aviso           | El aviso se encola si `showInstructions` está activo y solo se muestra al cerrarlo; iniciar ronda cancela la cola.                             |
| La URL aún no existe y se muestra un enlace roto    | `DONATION_URL` vacía mantiene la feature dormida; solo se acepta `https://`.                                                                   |
| `window.open` con `noopener` devuelve `null`        | No usar el retorno como detección de bloqueo. En web, comprobar `navigator.onLine`; en nativo, error solo si `Linking.openURL` rechaza.        |
| El enlace sustituye la partida en web               | En web se abre en pestaña nueva con `noopener,noreferrer`; en nativo se delega al navegador externo.                                           |
| El timer de auto-ocultado sobrevive al desmontaje   | `useEffect` con limpieza y cancelación al ocultar el componente.                                                                               |
| El aviso añade ruido a lectores de pantalla         | Región `polite` en Android/web, anuncio explícito en iOS, etiquetas claras, sin autofoco y sin trampa de foco.                                 |
| El build PWA se degrada                             | No se añaden assets estáticos ni se modifica el service worker; `npm run build:web` debe seguir generando el mismo número de rutas.            |

## Complexity Tracking

No hay violaciones de la constitución. No se requiere justificación adicional.
