# Phase 0 Research: Aviso no intrusivo para apoyar al creador

**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

No quedan incógnitas de implementación (`NEEDS CLARIFICATION`). Las decisiones de producto ya fueron aprobadas: Ko-fi, una sola aparición, umbral de 10 rondas y aviso no intrusivo.

## Decisión 1: una ronda se completa cuando explota la bomba

**Decisión**: incrementar el contador únicamente en `handleExplosion`, el punto que ya usan tanto el temporizador como el botón de simulación para cerrar una ronda.

**Rationale**: es el único evento que representa una ronda terminada. `handleNewRound` solo prepara el siguiente reto y puede pulsarse sin haber jugado; contarlo inflaría el progreso. El modo Solo Bomba usa el mismo camino, así que también cuenta sin lógica duplicada.

**Alternativas consideradas**:

- Contar al pulsar "Nuevo Desafío": descartado porque permite saltar rondas sin jugar.
- Contar al encender la bomba: descartado porque una ronda abandonada a mitad no se completó.
- Contador separado por modo: descartado por complejidad y porque el aviso es global.

## Decisión 2: persistir el progreso en AsyncStorage con dos claves nuevas

**Decisión**: usar `donationRoundsCompleted` y `donationPromptShown` como claves independientes, con saneamiento al leer y escritura serializada desde un módulo dedicado.

**Rationale**: AsyncStorage ya es la solución del proyecto y funciona en iOS, Android y web. Claves separadas permiten entender y limpiar el estado sin tocar los ajustes existentes. Un módulo dedicado mantiene la lógica fuera de la pantalla y facilita tests puros.

**Alternativas consideradas**:

- Añadirlo a `SettingsContext`: descartado porque no es una preferencia del usuario y obligaría a re-renderizar a todos los consumidores de ajustes.
- Un contexto nuevo: descartado por YAGNI; solo lo usa una pantalla.
- Guardar en `localStorage` directamente: descartado porque rompe la paridad con nativo.

## Decisión 3: el aviso se marca como mostrado en cuanto aparece

**Decisión**: persistir `donationPromptShown = true` justo antes de hacer visible la tarjeta, sin esperar a que la persona interactúe.

**Rationale**: cumple el requisito de "una sola vez" incluso si la persona cierra la app, ignora el aviso o se oculta automáticamente. Evita convertirse en una molestia recurrente.

**Alternativas consideradas**:

- Marcar solo al pulsar "Donar" o "Ahora no": descartado porque un cierre de app o un auto-ocultado dejaría el aviso pendiente para siempre.
- Reintentar hasta que haya interacción: descartado por intrusivo.

## Decisión 4: tarjeta absoluta, no `Modal`

**Decisión**: renderizar una tarjeta compacta posicionada por encima del botón de siguiente ronda, en una capa estable fuera de la transformación de sacudida de la pantalla, con `pointerEvents` limitado a su área, sin fondo oscuro ni trampa de foco.

**Rationale**: `Modal` bloquea la interacción y en web puede atrapar el foco; el requisito pide un aviso no intrusivo. Una tarjeta absoluta permite seguir viendo la pantalla y empezar la siguiente ronda con un toque. Si se renderizara dentro del `Animated.View` que tiembla con la explosión, el aviso se desplazaría y podría provocar un toque equivocado.

**Alternativas consideradas**:

- `Modal` transparente: descartado por bloqueo y foco.
- Librería de toasts: descartada por dependencia nueva y poca personalización pixel.
- Banner a pantalla completa: descartado por intrusivo.
- Tarjeta dentro del contenedor que tiembla: descartada porque la sacudida mueve el aviso.

## Decisión 5: abrir Ko-fi fuera de la app

**Decisión**: en iOS/Android usar `Linking.openURL`; en web comprobar `navigator.onLine` y abrir con `window.open(url, '_blank', 'noopener,noreferrer')`. No se usa el valor de retorno de `window.open` para decidir si hubo éxito.

**Rationale**: `expo-linking` en web navega la pestaña actual (`window.location`), lo que abandonaría la partida. `window.open` conserva el juego en la pestaña original y funciona dentro del gesto de pulsación. Con `noopener`, el navegador devuelve `null` aunque la pestaña se abra correctamente; inspeccionar ese valor produciría un falso error. En web, la comprobación de conexión permite mostrar el mensaje inline antes de abrir; en nativo, el error solo se muestra si `Linking.openURL` rechaza, porque el navegador externo puede seguir abriéndose sin conexión y mostrar su propia página de error.

**Alternativas consideradas**:

- `Linking.openURL` en todas las plataformas: descartado en web porque sustituye la partida.
- Usar el retorno de `window.open` con `noopener`: descartado por falsos negativos.
- WebView interna: descartada por complejidad, cookies y políticas de tiendas.
- Iframe: descartado porque Ko-fi y la mayoría de páginas bloquean el embebido.

## Decisión 6: URL como constante de compilación, vacía hasta crear Ko-fi

**Decisión**: declarar `DONATION_URL` en `constants/donation.ts` con valor vacío y un comentario para pegar la URL de Ko-fi. La feature solo se activa si la URL empieza por `https://`.

**Rationale**: no hay backend ni panel de administración. Una constante es suficiente, evita variables de entorno adicionales y permite que el aviso quede dormido sin romper el juego. Cuando el creador tenga la página, solo cambia un archivo y reconstruye.

**Alternativas consideradas**:

- Variable `EXPO_PUBLIC_*`: viable, pero añade configuración de build para un único valor que cambia rara vez.
- URL remota: descartada por requerir backend.
- URL editable en Ajustes: descartada porque el usuario final no debe configurar la donación.

## Decisión 7: fallback en memoria si AsyncStorage falla

**Decisión**: el módulo mantiene el último estado conocido en memoria; si la lectura o escritura falla, el conteo continúa durante la sesión y el aviso puede mostrarse como máximo una vez. Los errores se registran con `console.warn` y no se propagan a la UI.

**Rationale**: el aviso es una mejora, no una dependencia funcional. La constitución exige que valores desconocidos degraden a un valor válido y que el juego siga siendo jugable.

**Alternativas consideradas**:

- Bloquear el juego si falla el almacenamiento: descartado.
- No mostrar nunca el aviso si falla: válido, pero pierde la oportunidad en la sesión actual sin necesidad.

## Decisión 8: auto-ocultado a los 15 segundos

**Decisión**: la tarjeta se oculta sola a los 15 s, además de hacerlo al donar, cerrar o iniciar la siguiente ronda.

**Rationale**: mantiene el aviso "no intrusivo" incluso si la persona no interactúa. 15 s es suficiente para leer dos líneas y decidir. El temporizador se limpia al ocultar o desmontar.

**Alternativas consideradas**:

- Sin auto-ocultado: descartado porque la tarjeta podría quedarse durante toda la sesión.
- 5 s: demasiado corto para leer y decidir.
- 30 s: demasiado largo para un aviso que no debe molestar.

## Decisión 9: tests unitarios puros y validación manual

**Decisión**: probar con Jest el saneamiento, el umbral, la transición a "mostrado" y el fallback en memoria; validar la UI y el enlace manualmente en web/PWA y nativo.

**Rationale**: la lógica crítica es pura y barata de testear. El proyecto no tiene infraestructura de tests de componentes ni E2E, y añadirla violaría el principio de dependencias mínimas. El quickstart cubre los escenarios visuales, de accesibilidad y de red.

**Alternativas consideradas**:

- Playwright: descartado por nueva toolchain y por el alcance acotado.
- Tests de componente con React Native Testing Library: descartado por dependencia nueva; el componente es principalmente presentacional.

## Decisión 10: diferir el aviso si el modal de reglas está abierto

**Decisión**: si la explosión ocurre mientras `showInstructions` es verdadero, guardar el aviso como pendiente y mostrarlo al cerrar el modal; si la persona inicia otra ronda antes, cancelarlo.

**Rationale**: evita apilar dos capas y respeta la lectura de reglas. La ronda ya terminó, así que el aviso sigue siendo contextual.

**Alternativas consideradas**:

- Mostrarlo encima del modal: descartado por solapamiento y foco.
- Perderlo para siempre: descartado porque el usuario ya alcanzó el hito y merece la oportunidad.

## Decisión 11: anuncio accesible por plataforma

**Decisión**: usar `accessibilityLiveRegion="polite"` en Android y web, y `AccessibilityInfo.announceForAccessibility` en iOS al hacer visible la tarjeta. En todas las plataformas, mantener etiquetas explícitas y no mover el foco.

**Rationale**: `accessibilityLiveRegion` es una API de Android y React Native Web la aproxima con ARIA, pero VoiceOver en iOS no la respeta. Para cumplir la paridad de accesibilidad de la constitución, iOS necesita un anuncio explícito. No se usa un rol de alerta porque el aviso no debe interrumpir la lectura en curso.

**Alternativas consideradas**:

- Solo `accessibilityLiveRegion`: descartado porque VoiceOver no anuncia el aviso.
- `accessibilityRole="alert"`: descartado por ser más intrusivo y no ofrecer el tono "polite".
- Mover el foco a la tarjeta: descartado porque interrumpe y puede desorientar.

## Decisión 12: decisión síncrona con token de ronda

**Decisión**: incrementar el contador y decidir si se muestra el aviso con el estado en memoria de la ronda actual; la persistencia se hace de forma asíncrona. La pantalla conserva un token de ronda y solo hace visible el aviso si el token sigue correspondiendo a la explosión que lo originó.

**Rationale**: `recordCompletedRound()` es asíncrono y una escritura lenta podría resolver después de que la persona pulse "Siguiente Ronda". Sin una guarda, el aviso aparecería en la ronda nueva, incumpliendo "solo después de una explosión". El token también cancela el aviso si se enciende otra bomba o se desmonta la pantalla.

**Alternativas consideradas**:

- Esperar la escritura antes de decidir: descartado porque introduce latencia y el mismo problema si la persona continúa.
- No persistir hasta el cierre de la app: descartado porque se perdería el progreso si la app se cierra.
- Usar solo `isExploded`: insuficiente si la siguiente ronda vuelve a explotar rápido; el token identifica la ronda concreta.
