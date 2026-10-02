<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Principles added: I. Lógica de juego pura, II. Paridad i18n (es/en),
  III. Paridad multiplataforma, IV. Fluidez y accesibilidad del movimiento,
  V. Simplicidad y dependencias mínimas
- Sections added: Restricciones técnicas, Flujo de desarrollo y quality gates, Governance
- Sections removed: ninguna
- Templates: plan-template.md / spec-template.md / tasks-template.md leen la constitución
  en tiempo de ejecución; no requieren cambios.
- Deferred TODOs: ninguno
-->
# TicTac PartyPack Constitution

## Core Principles

### I. Lógica de juego pura

Los generadores de retos en `games/` DEBEN ser funciones puras (sin estado, sin efectos
secundarios, sin dependencias de UI). `services/gameRouter.ts` es el único despachador.
La presentación (componentes, animaciones, assets) NO DEBE filtrarse a la lógica de juego.

*Rationale*: permite testear la lógica con Jest sin renderizar y cambiar la capa visual
sin riesgo de regresiones en las reglas.

### II. Paridad i18n (es/en)

Todo texto visible DEBE salir de i18next y existir en `locales/es.json` y `locales/en.json`.
Español es el idioma por defecto y fallback. Cualquier tipografía o asset con texto DEBE
soportar los caracteres del español (á é í ó ú ü ñ ¿ ¡).

*Rationale*: la app se publica en ambos idiomas; una clave o glifo ausente rompe la UI.

### III. Paridad multiplataforma

Toda funcionalidad DEBE comportarse de forma equivalente en iOS, Android y Web. Las
diferencias por plataforma (`Platform.OS`) DEBEN estar acotadas y justificadas (p. ej.
`useNativeDriver` en web). Orientación únicamente vertical.

*Rationale*: el juego se usa en grupo con dispositivos heterogéneos.

### IV. Fluidez y accesibilidad del movimiento

Las animaciones DEBEN ejecutarse sin tirones perceptibles en dispositivos de gama media,
preferir el driver nativo, y detenerse/liberarse al desmontar el componente. La app DEBE
respetar la preferencia del sistema de "reducir movimiento" y NO DEBE producir más de 3
destellos por segundo (WCAG 2.3.1).

*Rationale*: es un juego de fiesta en tiempo real; un frame perdido o un destello agresivo
degradan la experiencia y la accesibilidad.

### V. Simplicidad y dependencias mínimas

Se DEBE preferir lo que ya ofrecen React Native y el SDK de Expo antes de añadir
dependencias. Toda dependencia nueva DEBE ser compatible con el SDK de Expo vigente
(instalada con `npx expo install`) y estar justificada en el plan. YAGNI: sin
abstracciones para un único uso.

*Rationale*: menos superficie de mantenimiento y upgrades de SDK más sencillos.

## Restricciones técnicas

- Expo SDK 54, React Native 0.81 (nueva arquitectura), React 19, TypeScript estricto.
- Navegación con Expo Router v6 (rutas por sistema de archivos en `app/`).
- Estilos con NativeWind v4; los valores dinámicos van en `style={{}}`.
- Estado de ajustes en `store/SettingsContext.tsx`, persistido en AsyncStorage; los valores
  persistidos desconocidos DEBEN degradar a un valor por defecto válido.
- Los assets con licencia de terceros DEBEN permitir uso comercial y quedar documentados.

## Flujo de desarrollo y quality gates

- `npm run validate` (typecheck + lint + format) y `npm test` DEBEN pasar antes de mergear.
- La lógica pura nueva (helpers, cálculos de frames, mapeos) DEBE tener tests unitarios en
  `__tests__/`.
- Los cambios visuales DEBEN verificarse manualmente en al menos un dispositivo/emulador
  Android, iOS y en Web siguiendo el `quickstart.md` de la feature.
- Al añadir un mini-juego se sigue la guía de `CLAUDE.md`.

## Governance

Esta constitución prevalece sobre otras prácticas del repositorio. Las enmiendas se hacen
con `/speckit-constitution`, incluyen Sync Impact Report y siguen versionado semántico
(MAJOR: eliminación/redefinición de principios; MINOR: principio o sección nueva;
PATCH: aclaraciones). Cada plan DEBE pasar el Constitution Check; las violaciones se
justifican en *Complexity Tracking*. La guía operativa del día a día está en `CLAUDE.md`.

**Version**: 1.0.0 | **Ratified**: 2026-10-02 | **Last Amended**: 2026-10-02
