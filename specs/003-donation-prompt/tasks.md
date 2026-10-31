# Tasks: Aviso no intrusivo para apoyar al creador

**Input**: Design documents from `/specs/003-donation-prompt/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/donation-prompt.md

**Tests**: Incluidos porque la constitución exige tests unitarios para lógica pura nueva. Escribir primero los tests y comprobar que fallan antes de implementar.

**Organización**: tareas agrupadas por historia de usuario para que cada una sea implementable y verificable por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1, US2 o US3
- Las rutas son relativas a la raíz del repositorio

## Phase 1: Setup (infraestructura compartida)

**Purpose**: Configuración y textos que necesitan todas las historias.

- [x] T001 [P] Crear `constants/donation.ts` con `DONATION_URL` vacía, `DONATION_ROUNDS_TARGET = 10`, `DONATION_AUTO_HIDE_MS = 15000` y un helper `isDonationConfigured()` que solo acepte URLs `https://`.
- [x] T002 [P] Añadir las claves `donation.message`, `donation.action`, `donation.dismiss`, `donation.close` y `donation.error` en `locales/es.json` y `locales/en.json`, con los textos del contrato.
- [x] T003 Confirmar que no se añaden dependencias nuevas y que `constants/` y `locales/` siguen el formato/orden existente.

---

## Phase 2: Foundational (prerrequisitos bloqueantes)

**Purpose**: Estado puro y persistencia que ambas historias principales necesitan.

**⚠️ CRITICAL**: ninguna historia puede darse por terminada sin esta fase.

- [x] T004 [P] Escribir tests que fallen en `__tests__/donationPrompt.test.ts` para `sanitizeDonationProgress` y `shouldShowDonationPrompt`: valores válidos, faltantes, `'abc'`, negativos, fraccionarios, `'true'`/`'false'`, umbral 9/10 y bandera ya mostrada.
- [x] T005 Implementar en `store/donationPrompt.ts` las funciones puras `sanitizeDonationProgress` y `shouldShowDonationPrompt` hasta que T004 pase.
- [x] T006 Ampliar `__tests__/donationPrompt.test.ts` con un mock de AsyncStorage para `recordCompletedRound`, `markDonationPromptShown`, escrituras serializadas y fallback en memoria cuando el almacenamiento falla.
- [x] T007 Implementar en `store/donationPrompt.ts` la lectura/escritura de `donationRoundsCompleted` y `donationPromptShown`, la cola de escrituras y el fallback en memoria, sin propagar errores a la UI.
- [x] T008 Ejecutar `npm test -- donationPrompt` y comprobar que los tests de estado pasan antes de tocar la pantalla.

**Checkpoint**: el progreso se puede contar, sanear y persistir de forma aislada.

---

## Phase 3: User Story 1 - Aparece tras 10 rondas y permite donar (Priority: P1) 🎯 MVP

**Goal**: mostrar la tarjeta una vez alcanzado el umbral y abrir Ko-fi desde ella.

**Independent Test**: desde un estado limpio, completar 10 rondas con el botón de simulación; la tarjeta aparece, "Donar" abre la página y "Ahora no" la cierra sin bloquear la siguiente ronda.

### Implementación de US1

- [x] T009 [US1] Crear `components/DonationPrompt.tsx` con `visible` y `onClose`, usando `PixelPanel`, `PixelText` y botones pequeños; sin `Modal`, sin fondo oscuro y con `pointerEvents` limitado a la tarjeta. Renderizarlo en una capa estable fuera del `Animated.View` que aplica la sacudida.
- [x] T010 [US1] Añadir a `components/DonationPrompt.tsx` el temporizador de `DONATION_AUTO_HIDE_MS` con limpieza al ocultar/desmontar, el estado de error inline y la omisión de animación cuando `useReducedMotion()` está activo.
- [x] T011 [US1] Implementar en `components/DonationPrompt.tsx` la apertura del enlace: comprobar `navigator.onLine` y usar `window.open(..., '_blank', 'noopener,noreferrer')` en web sin inspeccionar su retorno; usar `Linking.openURL` en nativo y mostrar `donation.error` solo si está offline en web o si `Linking.openURL` rechaza en nativo.
- [x] T012 [US1] Integrar en `app/game/index.tsx` una llamada a `recordCompletedRound()` desde `handleExplosion`; capturar un token de ronda antes de la llamada y comprobarlo antes de mostrar. Si se alcanza el umbral, la URL está configurada y no se mostró antes, persistir `markDonationPromptShown()` y hacer visible la tarjeta solo si el token sigue vigente.
- [x] T013 [US1] Renderizar `DonationPrompt` en `app/game/index.tsx` por encima del botón de siguiente ronda, sin alterar `isActive`, `isExploded`, `roundKey`, el desafío ni el temporizador de la bomba.
- [x] T014 [US1] Ocultar la tarjeta en `handleNewRound` e `igniteBomb` y comprobar que la siguiente ronda se inicia con un solo toque.
- [ ] T015 [US1] Ejecutar la validación manual de US1 en web: 10 rondas, aparición única, "Donar" en pestaña nueva y "Ahora no" sin bloquear.

**Checkpoint**: el recorrido principal funciona y es demostrable por sí solo.

---

## Phase 4: User Story 2 - El aviso no vuelve a aparecer (Priority: P2)

**Goal**: garantizar que la invitación sea realmente de una sola vez.

**Independent Test**: mostrar el aviso, cerrarlo, recargar y completar 20 rondas; no debe reaparecer.

### Implementación de US2

- [x] T016 [US2] Verificar en `app/game/index.tsx` que `markDonationPromptShown()` se ejecuta antes de `setShowDonationPrompt(true)` y que un fallo de persistencia no impide mostrar la tarjeta en la sesión actual.
- [x] T017 [US2] Añadir a `__tests__/donationPrompt.test.ts` el caso de transición `promptShown: false → true` y comprobar que `shouldShowDonationPrompt` devuelve `false` después.
- [ ] T018 [US2] Validar manualmente en web: mostrar, cerrar, recargar, completar 20 rondas y confirmar que no reaparece; repetir cerrando la pestaña en lugar de pulsar "Ahora no".
- [x] T019 [US2] Validar el caso de datos corruptos (`donationRoundsCompleted = 'abc'`, `donationPromptShown = 'quizá'`) y confirmar que el aviso vuelve a estar disponible sin crash.

**Checkpoint**: la invitación no se repite y el almacenamiento corrupto degrada correctamente.

---

## Phase 5: User Story 3 - El aviso no interrumpe la partida (Priority: P3)

**Goal**: respetar el ritmo, el modal de reglas, el movimiento reducido y la accesibilidad.

**Independent Test**: provocar el aviso con el modal abierto, con movimiento reducido y con lector de pantalla; comprobar que no bloquea y que se anuncia de forma educada.

### Implementación de US3

- [x] T020 [US3] Añadir en `app/game/index.tsx` el estado `pending` para diferir el aviso cuando `showInstructions` está abierto; mostrarlo al cerrar el modal solo si el token sigue vigente y cancelarlo si se inicia otra ronda o se enciende otra bomba.
- [x] T021 [US3] Revisar `components/DonationPrompt.tsx` para que no atraiga el foco, use `accessibilityLiveRegion="polite"` en Android/web, llame a `AccessibilityInfo.announceForAccessibility` en iOS, y use etiquetas explícitas y botones con `accessibilityRole="button"`.
- [ ] T022 [US3] Validar en web y nativo: modal de reglas, reducir movimiento, auto-ocultado a 15 s, viewport 320×568, lector de pantalla (VoiceOver/TalkBack/NVDA) y que la tarjeta permanece estable durante la sacudida de la explosión.
- [ ] T023 [US3] Validar el escenario sin conexión: pulsar "Donar" offline, ver el error inline y confirmar que el juego sigue funcionando.

**Checkpoint**: el aviso es usable, accesible y no rompe la fluidez.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: documentación, build y validación final.

- [x] T024 [P] Documentar en `README.md` cómo configurar `DONATION_URL`, que el aviso es único y que sin URL la feature queda dormida.
- [x] T025 Ejecutar `npm run validate`, `npm test` y `npm run build:web`; corregir cualquier warning nuevo.
- [ ] T026 Ejecutar el [quickstart.md](./quickstart.md) completo en web/PWA y registrar el resultado; repetir en Android/iOS si hay dispositivos disponibles.
- [x] T027 Revisar que no se modificaron `games/`, `services/gameRouter.ts`, el service worker ni las claves de ajustes existentes.
- [x] T028 Actualizar las casillas de `specs/003-donation-prompt/tasks.md` al completar cada tarea y reportar el estado sin crear commit salvo permiso explícito.

---

## Phase 7: Acceso discreto desde Inicio

**Purpose**: acceso permanente y no intrusivo, además del aviso único de la partida.

- [x] T029 [P] Extraer a `services/donationLink.ts` la apertura de la URL con dependencias inyectables, conservando la comprobación HTTPS, `navigator.onLine` y la pestaña nueva en web.
- [x] T030 Crear `components/DonationIconButton.tsx`: moneda de 32 px con resplandor, texto «Apoyar el proyecto» / «Support the project», objetivo táctil de 48 px, esquina superior derecha, visible solo con URL configurada y sin UI de error.
- [x] T031 Integrar el icono en `app/index.tsx` sin alterar el layout de Jugar, Configuración ni el botón de instalar PWA.
- [x] T032 [P] Añadir `__tests__/donationLink.test.ts` para URL dormida, web online/offline, fallo de pestaña, nativo correcto y nativo rechazado.
- [x] T033 Actualizar `spec.md` y `README.md` para reflejar el acceso desde Inicio.

**Checkpoint**: el icono aparece solo con URL configurada y abre la misma página externa que el aviso.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: puede empezar de inmediato.
- **Foundational (Phase 2)**: depende de T001-T003; bloquea US1, US2 y US3.
- **US1 (Phase 3)**: depende de Phase 2; es el MVP.
- **US2 (Phase 4)**: depende de US1 para poder mostrar el aviso; sus tests de estado pueden empezar antes.
- **US3 (Phase 5)**: depende de US1; el diferimiento del modal depende de T012-T013.
- **Polish (Phase 6)**: depende de las historias que se quieran entregar.

### User Story Dependencies

- **US1 (P1)**: sin dependencias de otras historias; entrega el valor principal.
- **US2 (P2)**: se apoya en la persistencia de US1, pero su lógica de bandera se puede probar de forma aislada.
- **US3 (P3)**: se apoya en la tarjeta de US1; no cambia el modelo de datos.

### Within Each User Story

- Tests de lógica antes de la implementación (T004-T008).
- Componente antes de la integración en la pantalla (T009-T011 antes de T012-T014).
- Integración antes de la validación manual.
- Cada historia termina con su validación independiente.

### Parallel Opportunities

- T001 y T002 pueden ejecutarse en paralelo.
- T004 y T006 son tests del mismo archivo; mantenerlos secuenciales para evitar conflictos.
- T009-T011 son el mismo componente; secuenciales.
- T020-T023 tocan el mismo componente/pantalla; secuenciales.
- T024 (README) puede ejecutarse en paralelo con las validaciones manuales.

---

## Implementation Strategy

### MVP First (US1)

1. Completar Phase 1 y Phase 2.
2. Implementar T009-T014.
3. Validar T015.
4. Demostrar el aviso y la donación sin depender de US2/US3.

### Incremental Delivery

1. US1: aviso y enlace.
2. US2: una sola aparición persistente.
3. US3: diferimiento, accesibilidad y no intrusión.
4. Polish: documentación, build y quickstart.

### Notas

- No crear commit sin permiso explícito.
- La URL real de Ko-fi es una dependencia externa; hasta tenerla, usar una URL HTTPS temporal solo para pruebas y no dejarla en el código final.
- Si aparece complejidad oculta (por ejemplo, coordinación entre pestañas o tests de componente), detener y reevaluar el alcance antes de añadir dependencias.
