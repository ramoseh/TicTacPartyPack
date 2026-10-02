# Quickstart: validar animaciones y estilo pixel art

**Feature**: [spec.md](./spec.md) | **Contracts**: [components](./contracts/components.md), [assets](./contracts/assets.md)

Guía de validación end-to-end. No contiene implementación.

## Prerrequisitos

- Node ≥ 18, dependencias instaladas (`npm install`).
- Dependencias de la feature instaladas con
  `npx expo install expo-font @expo-google-fonts/press-start-2p @expo-google-fonts/pixelify-sans`.
- Emulador Android con densidad no entera (p. ej. Pixel 7, DPR 2.625), simulador iOS y
  navegador para web.
- Línea base de tamaño: anotar el tamaño del bundle actual antes de empezar
  (`npx expo export --platform android` y medir `dist/`).
  **Medido 2026-10-02**: 10 432 KB (JS `_expo/` 4 360 KB + `assets/` 6 068 KB).
  **Tras la feature**: 4 792 KB (JS 4 008 KB + assets 780 KB) → −5 640 KB (SC-007 ✅).

## 1. Calidad automática

```bash
npm run sprites      # regenera hojas; debe terminar sin errores de tamaño > 2048 px
npm run validate     # typecheck + lint + format
npm test             # incluye animation, sprites y background tests
```

**Esperado**: todo en verde. Tests clave:

- `stepsEasing(4)` devuelve solo `{0, .25, .5, .75, 1}`.
- `buildFrameInterpolation` produce salida constante dentro de cada fotograma.
- `getIntegerScale(32, 200)` = 6; `getIntegerScale(64, 10)` = 1 (nunca < 1).
- `resolveBackground('inexistente')` = `'default'`.
- Ninguna hoja del manifiesto excede 2048 px ni referencia fotogramas fuera de rango.

## 2. Arrancar

```bash
npm run android   # / npm run ios / npm run web
```

## 3. Escenarios por historia

### US1 — Bomba (P1)

1. Inicio → Jugar → modo clásico → pantalla de juego.
   **Esperado**: bomba pixel con chispa en bucle (≈8 fps), sin bordes borrosos (también en
   web: inspeccionar que la imagen tiene `image-rendering: pixelated`).
2. Pulsar iniciar. **Esperado**: mecha ardiendo + temblor a saltos en < 100 ms (SC-003).
3. Ajustes con `minTime = maxTime = 3` para acelerar; esperar la explosión.
   **Esperado**: explosión por fotogramas, 2 destellos máx., temblor de pantalla ≤ 500 ms,
   queda humo fijo.
4. Nueva ronda. **Esperado**: bomba en reposo, sin restos.
5. Repetir 10 rondas seguidas con el monitor de rendimiento de Expo abierto en el
   dispositivo de referencia (Google Pixel 6a o equivalente).
   **Esperado**: UI ≥ 55 fps sin tirones perceptibles (SC-002).

### US2 — Identidad visual (P2)

1. Recorrer Inicio, Configuración (los 3 modos), Juego, Ajustes y modal de instrucciones
   y marcar la checklist:
   - [ ] sin esquinas redondeadas ni sombras difuminadas
   - [ ] todo texto en fuente pixel
   - [ ] sin emojis decorativos ni iconos vectoriales (incluidos los retos de piedra-papel-
         tijera, cadena de palabras, ¡no mires allá! y abecedario)
   - [ ] colores solo de la paleta
2. Mantener pulsado un botón. **Esperado**: baja 1 unidad y pierde la sombra; al soltar
   vuelve en un paso.
3. Modo personalizado → togglear un mini-juego. **Esperado**: indicador en 2 pasos.
4. Ajustes → Fondo → elegir `city` → cerrar la app → abrir.
   **Esperado**: se mantiene el fondo elegido; volver a `default` funciona igual.
5. **Prueba de glifos** (SC-006): cambiar idioma del dispositivo a español y a inglés;
   revisar instrucciones de todos los mini-juegos. Buscar: `á é í ó ú ü ñ ¿ ¡`.
   **Esperado**: ningún glifo ausente (cuadros/tofu).
6. Forzar fondo inválido (web, donde AsyncStorage usa `localStorage`): en la consola
   ejecutar `localStorage.setItem('backgroundImage', 'xyz')` y recargar. **Esperado**:
   fondo por defecto.

### US3 — Retos (P3)

1. Modo personalizado con solo "Lanzar moneda" + "Sílabas".
2. Siguiente reto varias veces. **Esperado**: tarjeta aparece en ≤ 3 pasos, < 300 ms.
3. En moneda, lanzar. **Esperado**: giro por fotogramas que termina en la cara/cruz que
   indica el texto; "lanzando…" parpadea (≤ 2 Hz).

### US4 — Transiciones (P4)

1. Inicio → Configuración → Juego → atrás (botón de la app) → atrás (gesto/botón del
   sistema) → Ajustes. **Esperado**: transición de bloques en cada cambio; pantalla
   destino interactiva en ≤ 400 ms (SC-004).
2. Pulsar "Jugar" 5 veces muy rápido. **Esperado**: una sola navegación, sin overlay
   congelado.
3. Abrir/cerrar instrucciones. **Esperado**: pop escalonado de entrada y salida.
4. iOS: volver con el gesto de deslizar desde el borde en Configuración y Ajustes.
   **Esperado**: el gesto completa la navegación y se reproduce el reveal de bloques;
   si no es fiable, aplicar el plan B de research R4.

### US5 — Reducir movimiento (P5)

1. Activar reducir movimiento (iOS: Accesibilidad › Movimiento; Android: Accesibilidad ›
   Quitar animaciones; Web: emular `prefers-reduced-motion: reduce` en DevTools).
2. Repetir US1–US4. **Esperado**: sin temblores, destellos, transiciones de bloques ni
   bucles; fotogramas clave estáticos; partida completable (SC-005).
3. Desactivar la opción con la app abierta y volver. **Esperado**: animaciones activas
   sin reiniciar.

## 4. Casos límite

- Salir del juego durante la explosión y durante el giro de la moneda: sin warnings en
  consola ni sonido residual.
- Pulsar "siguiente" / "nueva ronda" repetidamente mientras se reproduce la explosión:
  la bomba siempre acaba en el estado que corresponde a la partida (reposo tras nueva
  ronda), sin fotogramas de explosión residuales.
- Prompt más largo disponible (categorías) en un teléfono pequeño (iPhone SE): texto
  ajustado sin cortarse.
- iPad / tablet Android: sprites nítidos y centrados.

## 5. Presupuestos finales

- Tamaño del bundle: `npx expo export --platform android`; diferencia ≤ 5 MB respecto a
  la línea base (SC-007).
- Licencias: `assets/LICENSES.md` lista todos los assets de terceros y fuentes (FR-024).
- Prueba con jugadores (SC-008): ≥ 5 personas, encuesta de 2 preguntas (¿estilo
  retro/pixel? ¿explosión más impactante que antes?), objetivo ≥ 80% sí.
