# Phase 1 Data Model: Aviso no intrusivo para apoyar al creador

**Feature**: [spec.md](./spec.md)  
**Investigación**: [research.md](./research.md)

No cambian las reglas de juego ni el esquema de ajustes. Los conceptos nuevos son un progreso local mínimo, una configuración de compilación y un estado efímero de la tarjeta.

## DonationProgress

Progreso local y anónimo de la persona jugadora.

| Campo             | Tipo    | Reglas                                                               |
| ----------------- | ------- | -------------------------------------------------------------------- |
| `roundsCompleted` | integer | Entero seguro `>= 0`. Cada explosión lo incrementa en 1.             |
| `promptShown`     | boolean | `false` hasta que la tarjeta se hace visible; después pasa a `true`. |

**Persistencia**:

| Clave de almacenamiento   | Valor esperado                 | Fallback si falta o es inválida |
| ------------------------- | ------------------------------ | ------------------------------- |
| `donationRoundsCompleted` | Entero no negativo serializado | `0`                             |
| `donationPromptShown`     | `'true'` o `'false'`           | `false`                         |

**Reglas de saneamiento**:

- Un valor no numérico, fraccionario, negativo o no finito en `roundsCompleted` degrada a `0`.
- Un valor distinto de `'true'` en `promptShown` degrada a `false`.
- Un fallo de lectura no borra ni sobrescribe datos; se usa el estado en memoria.
- Un fallo de escritura no se propaga a la UI; se conserva el estado en memoria.

**Invariantes**:

- `roundsCompleted` nunca disminuye dentro de una misma instalación.
- `promptShown` solo transiciona de `false` a `true`, nunca al revés.
- Si `promptShown` es `true`, la tarjeta no puede volver a mostrarse aunque `roundsCompleted` siga creciendo.
- Borrar los datos del sitio reinicia ambos valores; es el único camino soportado para volver a ver el aviso.

## DonationConfig

Configuración de compilación; no es editable por la persona jugadora.

| Campo          | Tipo   | Regla                                                                                      |
| -------------- | ------ | ------------------------------------------------------------------------------------------ |
| `url`          | string | Vacía o una URL absoluta `https://`. Si está vacía o no es HTTPS, la feature está dormida. |
| `roundsTarget` | number | `10`. Entero positivo.                                                                     |
| `autoHideMs`   | number | `15000`. Entero positivo; debe limpiarse al ocultar o desmontar.                           |

**Invariantes**:

- La app nunca construye la URL a partir de datos del usuario.
- La app no procesa pagos ni recibe parámetros de retorno de Ko-fi.
- Cambiar `roundsTarget` no reinicia el progreso ya guardado.

## DonationPromptView

Estado efímero de la tarjeta, propiedad de la pantalla de juego.

| Campo        | Tipo    | Regla                                                                                                                 |
| ------------ | ------- | --------------------------------------------------------------------------------------------------------------------- |
| `pending`    | boolean | `true` cuando se alcanzó el hito pero el modal de reglas sigue abierto.                                               |
| `visible`    | boolean | `true` solo si el aviso está configurado, no se mostró antes, la ronda terminó y no hay modal.                        |
| `error`      | boolean | `true` cuando el enlace no se puede abrir; se limpia al ocultar la tarjeta.                                           |
| `roundToken` | number  | Identifica la explosión que originó el aviso; una respuesta asíncrona solo puede mostrarlo si el token sigue vigente. |

**Capa de renderizado**: la tarjeta vive en una capa estable fuera del `Animated.View` que aplica la sacudida de la explosión; no forma parte del árbol que se transforma.

**Transiciones**:

1. `idle` → `pending`: la explosión alcanza el umbral y el modal de reglas está abierto; se guarda el token de esa ronda.
2. `pending` → `visible`: se cierra el modal de reglas, el token sigue vigente y se persiste `promptShown = true` antes de pintar.
3. `idle` → `visible`: la explosión alcanza el umbral, no hay modal abierto, el token sigue vigente y se persiste `promptShown = true` antes de pintar.
4. `visible` → `hidden`: donar, "Ahora no", iniciar la siguiente ronda o transcurrir 15 s.
5. `pending` → `cancelled`: se inicia la siguiente ronda o se enciende otra bomba antes de cerrar el modal; el token deja de ser válido.
6. `idle`/`pending` → `cancelled`: una respuesta asíncrona llega con un token que ya no corresponde a la ronda actual; no se muestra nada.
7. `visible` → `error`: el enlace no se puede abrir; la tarjeta sigue visible con el mensaje de error hasta que se cierre o se agote el auto-ocultado.

**Precedencia de condiciones para mostrar**:

```text
configurada(url)
  && !promptShown
  && roundsCompleted >= roundsTarget
  && explosión ocurrida
  && !modalDeReglasAbierto
  && tokenDeRondaVigente
```

Todas las condiciones son obligatorias. Si cualquiera falla, la tarjeta permanece oculta y no se modifica el progreso salvo el conteo de la ronda.

## Relación con entidades existentes

- **Ronda**: no es una entidad persistida; se deriva del evento de explosión de la bomba.
- **Ajustes**: no se relacionan con este modelo. Las siete claves existentes no cambian.
- **Service worker/PWA**: no se ve afectado; el aviso es código del bundle y no añade recursos estáticos.
