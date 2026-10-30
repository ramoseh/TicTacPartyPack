# Quickstart: validación del aviso de donación

**Feature**: [spec.md](./spec.md)  
**Contrato**: [donation-prompt](./contracts/donation-prompt.md)  
**Modelo**: [data-model.md](./data-model.md)

Esta guía valida la feature en web/PWA y en las apps nativas. El aviso no depende del service worker, pero conviene repetir la comprobación en el build de producción para descartar regresiones de la PWA.

## 1. Prerrequisitos

- Node.js y npm compatibles con Expo SDK 54.
- Chrome o Edge actual con DevTools para web/PWA.
- Para la matriz completa: emulador/dispositivo Android, simulador/dispositivo iOS y un lector de pantalla del sistema.
- Una URL HTTPS de Ko-fi. Para probar sin publicar la página, sirve cualquier URL HTTPS de prueba; no debe quedar en el código final.

## 2. Configurar la URL

Editar `constants/donation.ts` y asignar la URL real:

```ts
export const DONATION_URL = 'https://ko-fi.com/tu-usuario';
```

**Esperado**: la URL empieza por `https://`. Si se deja vacía, el aviso no aparece y el juego funciona con normalidad.

## 3. Quality gates y build

```sh
npm run validate
npm test
npm run build:web
```

**Esperado**:

1. Typecheck, ESLint y Prettier sin errores; los tests nuevos de donación pasan junto con los existentes.
2. `npm run build:web` sigue generando las mismas rutas y el precaché sin warnings.
3. No se añaden assets estáticos ni se modifica el service worker.

Servir el build:

```sh
npm run preview:web
```

Abrir `http://localhost:4173`. No usar el servidor de desarrollo para las pruebas de PWA/offline.

## 4. Preparar un estado limpio

En web, abrir DevTools → Application → Local Storage y borrar:

- `donationRoundsCompleted`
- `donationPromptShown`

En nativo, borrar los datos de la app o desinstalarla/reinstalarla.

**Esperado**: el contador vuelve a 0 y el aviso se considera no mostrado.

## 5. US1: aparición tras 10 rondas y donación

1. Abrir `/game`.
2. Completar una ronda: pulsar "Encender Bomba" y luego "¡BOMBA!" (o esperar la explosión).
3. Pulsar "Siguiente Ronda".
4. Repetir hasta completar 9 rondas.
5. Completar la décima ronda.

**Esperado**:

- Justo después de la décima explosión aparece la tarjeta con el mensaje y los botones "Donar" y "Ahora no".
- No hay fondo oscuro, no se bloquea el resto de la pantalla y el botón "Siguiente Ronda" sigue visible y pulsable.
- La tarjeta se anuncia como región educada si el lector de pantalla está activo.
- La tarjeta no se desplaza ni tiembla con la animación de la explosión.

6. Pulsar "Donar" con conexión.

**Esperado**:

- En web se abre una pestaña nueva con la página de Ko-fi; la pestaña del juego sigue abierta.
- En nativo se abre el navegador externo o la app compatible.
- La tarjeta se oculta y la partida sigue disponible.

7. Repetir desde el paso 4 con "Ahora no".

**Esperado**: la tarjeta se oculta y la siguiente ronda puede iniciarse con un toque.

## 6. US2: no vuelve a aparecer

1. Con el aviso ya mostrado y cerrado, recargar la aplicación.
2. Completar 20 rondas más.

**Esperado**: el aviso no reaparece en ninguna de las 20 rondas.

3. Repetir el escenario cerrando la app o la pestaña en lugar de pulsar "Ahora no".

**Esperado**: tampoco reaparece; la bandera se guarda en cuanto la tarjeta se hace visible.

## 7. US3: no intrusivo y accesible

### Modal de reglas abierto

1. Desde un estado limpio, completar 9 rondas.
2. Abrir "Cómo Jugar" y dejar que explote la décima bomba.
3. Cerrar el modal.

**Esperado**: el aviso aparece al cerrar el modal, no encima de él. Si se inicia otra ronda o se enciende otra bomba antes de cerrarlo, el aviso se cancela.

### Movimiento reducido

1. Activar "Reducir movimiento" en el sistema o emular `prefers-reduced-motion: reduce` en DevTools.
2. Provocar el aviso.

**Esperado**: no hay deslizamiento ni animación de entrada; el contenido aparece de inmediato.

### Auto-ocultado

1. Provocar el aviso y no tocarlo.
2. Esperar 15 segundos.

**Esperado**: la tarjeta se oculta sola y no vuelve a aparecer.

### Sin conexión

1. Provocar el aviso.
2. En DevTools → Network → Offline, pulsar "Donar".

**Esperado**: la tarjeta muestra el mensaje de error antes de intentar abrir una pestaña, no se abre una página rota y el juego sigue funcionando. Al recuperar la conexión, "Donar" vuelve a funcionar si la tarjeta sigue visible.

### Modo Solo Bomba

1. Abrir `/game?simpleMode=true`.
2. Completar 10 rondas con el botón de simulación.

**Esperado**: el aviso también aparece una vez; no se muestra el icono de ayuda, pero eso no afecta a la donación.

### Pantalla pequeña

1. Emular un viewport de 320×568 o usar un iPhone SE.
2. Provocar el aviso.

**Esperado**: la tarjeta no tapa el botón "Siguiente Ronda" ni se sale de la pantalla; los botones son pulsables.

## 8. Robustez del almacenamiento

1. En DevTools, escribir un valor corrupto:

   ```js
   localStorage.setItem('donationRoundsCompleted', 'abc');
   localStorage.setItem('donationPromptShown', 'quizá');
   ```

2. Recargar y completar 10 rondas.

**Esperado**: el contador se sanea a 0, el aviso no se considera mostrado y aparece al llegar a 10. No hay crash.

3. Bloquear el almacenamiento o simular una excepción (modo privado restrictivo/extensión) y jugar.

**Esperado**: el juego sigue siendo jugable; el aviso puede aparecer como máximo una vez en la sesión y no se produce un error visible.

## 9. Carrera entre explosión y siguiente ronda

1. Completar la novena ronda.
2. Provocar la décima explosión y pulsar inmediatamente "Siguiente Ronda" antes de que termine cualquier escritura local.

**Esperado**: el aviso no aparece sobre la nueva ronda. Si la escritura asíncrona termina tarde, su resultado se descarta mediante el token de la ronda invalidada.

## 10. Regresión

- Comprobar que los ajustes existentes siguen cargando y guardando.
- Comprobar que la PWA sigue instalándose y funcionando offline tras una carga online.
- Comprobar que el temporizador y la animación de la bomba no cambian.
- Repetir la apertura del enlace en Android, iOS y Web.

## 11. Criterio de aceptación

La feature se considera validada cuando:

- El aviso aparece exactamente una vez tras la décima ronda.
- No reaparece tras recargar ni tras 20 rondas adicionales.
- El botón "Donar" abre Ko-fi en las tres plataformas.
- El aviso no bloquea la siguiente ronda, respeta reducir movimiento y se anuncia de forma educada.
- El juego sigue funcionando con almacenamiento corrupto o sin conexión.
- `npm run validate`, `npm test` y `npm run build:web` pasan.
