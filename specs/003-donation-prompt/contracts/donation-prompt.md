# Contrato: aviso de donación

**Feature**: [spec.md](../spec.md)  
**Modelo**: [data-model.md](../data-model.md)

Este contrato fija las interfaces entre la pantalla de juego, el estado persistido, el componente visual y el enlace externo.

## 1. Contrato del componente `DonationPrompt`

| Propiedad | Tipo         | Obligatoria | Regla                                                                    |
| --------- | ------------ | ----------- | ------------------------------------------------------------------------ |
| `visible` | `boolean`    | Sí          | Solo se renderiza la tarjeta cuando es `true`.                           |
| `onClose` | `() => void` | Sí          | Se invoca al pulsar "Ahora no", al donar o al agotarse el auto-ocultado. |

**Comportamiento**:

- No usa `Modal`, no crea fondo de pantalla completa ni atrapa el foco.
- Se renderiza en una capa estable fuera del `Animated.View` que aplica la sacudida de la explosión; no se mueve con el temblor de la pantalla.
- Se posiciona por encima del botón de siguiente ronda y no intercepta toques fuera de su área.
- Al montarse con `visible = true`, inicia un temporizador de `DonationConfig.autoHideMs`; lo limpia al ocultarse o desmontarse.
- El botón "Donar" intenta abrir `DonationConfig.url`; si no se puede, muestra un texto de error dentro de la tarjeta y no llama a `onClose`.
- El botón "Ahora no" llama a `onClose` sin intentar abrir nada.
- Si la URL no está configurada, el componente no se renderiza aunque `visible` sea `true`.

**Accesibilidad**:

- La tarjeta expone `accessibilityLiveRegion="polite"` en Android/web y un `accessibilityRole` adecuado.
- En iOS, al hacerse visible, llama a `AccessibilityInfo.announceForAccessibility` con el mensaje; VoiceOver no respeta las regiones live de Android.
- El mensaje y los botones tienen etiquetas explícitas; los botones usan `accessibilityRole="button"`.
- No se mueve el foco al aparecer.
- Con `useReducedMotion()` activo, no hay animación de entrada; el contenido aparece de inmediato.
- El texto de error se anuncia como parte de la misma región, sin `alert` agresivo.

**Texto** (claves i18n, ambos idiomas):

| Clave              | Español                                           | Inglés                                            |
| ------------------ | ------------------------------------------------- | ------------------------------------------------- |
| `donation.message` | `¿Te gusta el juego? Invítame un café`            | `Enjoying the game? Buy me a coffee`              |
| `donation.action`  | `Donar`                                           | `Donate`                                          |
| `donation.dismiss` | `Ahora no`                                        | `Not now`                                         |
| `donation.close`   | `Cerrar`                                          | `Close`                                           |
| `donation.error`   | `No se pudo abrir el enlace. Revisa tu conexión.` | `Could not open the link. Check your connection.` |

## 2. Contrato de estado y persistencia

**Módulo**: `store/donationPrompt.ts`

| Operación                       | Entrada                          | Salida / efecto                                                                                          |
| ------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `sanitizeDonationProgress(raw)` | Valores crudos de almacenamiento | `DonationProgress` válido; aplica los fallbacks de `data-model.md`.                                      |
| `loadDonationProgress()`        | Ninguna                          | Lee una vez, sanea y deja el estado en memoria; es idempotente.                                          |
| `shouldShowDonationPrompt(p)`   | `DonationProgress`               | `true` solo si `roundsCompleted >= 10` y `promptShown === false`.                                        |
| `recordCompletedRound()`        | Ninguna                          | Carga si hace falta, incrementa el contador, programa la persistencia y devuelve el progreso resultante. |
| `markDonationPromptShown()`     | Ninguna                          | Persiste `promptShown = true`; no lanza si el almacenamiento falla.                                      |

**Garantías**:

- Las operaciones de escritura se serializan para que dos explosiones consecutivas no pierdan incrementos.
- La lectura se hace una vez y se mantiene un estado en memoria; si el almacenamiento falla, el estado en memoria sigue siendo la fuente durante la sesión.
- `recordCompletedRound()` no decide si se muestra la tarjeta; solo actualiza el progreso. La decisión de mostrar corresponde a la pantalla, que comprueba la configuración de URL y el token de ronda.
- `markDonationPromptShown()` debe completarse (o fallar silenciosamente) antes de hacer visible la tarjeta.
- Como `recordCompletedRound()` es asíncrono, la pantalla captura el token de la ronda antes de llamarlo y descarta el resultado si el token ya cambió.

## 3. Contrato del enlace externo

| Plataforma  | Mecanismo                                           | Resultado esperado                                                 |
| ----------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| Web/PWA     | `window.open(url, '_blank', 'noopener,noreferrer')` | Pestaña nueva; la partida permanece en la pestaña original.        |
| iOS/Android | `Linking.openURL(url)`                              | Navegador externo o app compatible; la app queda en segundo plano. |

**Reglas**:

- Solo se aceptan URLs absolutas que empiecen por `https://`.
- La apertura se ejecuta directamente en el manejador de pulsación para no ser bloqueada como popup.
- En web, se comprueba `navigator.onLine` antes de abrir; si está offline, se muestra `donation.error` sin intentar la pestaña.
- En web no se usa el valor de retorno de `window.open` como señal de éxito: con `noopener` puede ser `null` aunque la pestaña se abra.
- En nativo, se muestra `donation.error` solo si `Linking.openURL` rechaza; si el navegador externo se abre sin conexión, muestra su propia página de error.
- No se añaden parámetros de seguimiento, identificadores de usuario ni datos de la partida.

## 4. Contrato de integración en la pantalla de juego

| Evento existente        | Acción nueva                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `handleExplosion()`     | Capturar el token de la ronda, llamar a `recordCompletedRound()`; si se cumple el umbral y el token sigue vigente, mostrar o encolar. |
| Cierre de instrucciones | Si hay aviso pendiente y el token sigue vigente, mostrarlo y persistir `promptShown`.                                                 |
| `handleNewRound()`      | Invalidar el token, ocultar y cancelar cualquier aviso visible o pendiente.                                                           |
| `igniteBomb()`          | Invalidar el token y ocultar cualquier aviso visible antes de empezar la siguiente bomba.                                             |
| Desmontaje              | Invalidar el token, limpiar el temporizador del aviso y cualquier actualización pendiente.                                            |

**Reglas**:

- El aviso nunca se muestra mientras la bomba está activa.
- El aviso se renderiza en una capa estable fuera del contenedor que tiembla con la explosión.
- El aviso no altera `isActive`, `isExploded`, `roundKey`, el desafío actual ni el temporizador de la bomba.
- Si el aviso está visible, el botón de siguiente ronda sigue recibiendo toques.
- Una respuesta asíncrona de `recordCompletedRound()` o `markDonationPromptShown()` que llegue con un token invalidado se descarta sin cambiar la UI.
- La pantalla no persiste ni interpreta el resultado de la donación.

## 5. Fuera de contrato

- Crear o configurar la página de Ko-fi.
- Verificar pagos, importes o identidad de la persona donante.
- Añadir analítica, cookies o llamadas de red propias.
- Mostrar el aviso en Inicio, Ajustes o Configuración de partida.
- Repetir el aviso tras la primera aparición.
