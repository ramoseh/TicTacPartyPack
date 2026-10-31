# Feature Specification: Aviso no intrusivo para apoyar al creador

**Feature Branch**: `003-donation-prompt`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Después de 10 rondas de juego, mostrar un pequeño popup no intrusivo para donar al creador. Debe aparecer una sola vez, no bloquear la partida y abrir una página de Ko-fi."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Aparece tras 10 rondas y permite donar (Priority: P1)

Una persona lleva un rato jugando. Al terminar su décima ronda, aparece una tarjeta pequeña que le invita a apoyar al creador con una donación voluntaria. Puede donar o cerrar el aviso sin perder el hilo de la partida.

**Why this priority**: Es el objetivo central de la feature. Sin este recorrido no existe forma de descubrir la donación desde el juego.

**Independent Test**: Completar 10 rondas desde un estado limpio y comprobar que la tarjeta aparece una vez, que el botón de donar abre la página configurada y que la siguiente ronda puede iniciarse con un toque.

**Acceptance Scenarios**:

1. **Given** 9 rondas completadas y el aviso nunca mostrado, **When** la bomba explota en la décima ronda, **Then** aparece una tarjeta compacta con el mensaje de apoyo y las acciones "Donar" y "Ahora no", sin fondo oscuro ni bloqueo del resto de la pantalla.
2. **Given** la tarjeta visible y conexión a internet, **When** la persona pulsa "Donar", **Then** se abre la página de Ko-fi configurada en el navegador externo y la tarjeta se oculta.
3. **Given** la tarjeta visible, **When** la persona pulsa "Ahora no", **Then** la tarjeta se oculta y la partida sigue disponible.
4. **Given** la tarjeta visible, **When** la persona inicia la siguiente ronda, **Then** la tarjeta desaparece y la ronda comienza sin pasos adicionales.

---

### User Story 2 - El aviso no vuelve a aparecer (Priority: P2)

Después de ver o cerrar el aviso, la persona sigue jugando sin que la invitación se repita en esa sesión ni en sesiones posteriores.

**Why this priority**: Evita que una invitación voluntaria se convierta en una molestia recurrente y protege la experiencia de juego.

**Independent Test**: Mostrar el aviso, cerrarlo, recargar la aplicación, completar 20 rondas más y verificar que no reaparece.

**Acceptance Scenarios**:

1. **Given** el aviso ya se mostró y se cerró, **When** la persona recarga la aplicación o vuelve a abrirla, **Then** el aviso no aparece aunque complete más rondas.
2. **Given** el aviso ya se mostró y la persona pulsó "Donar", **When** vuelve a jugar, **Then** el aviso tampoco reaparece.
3. **Given** el aviso se mostró y se ocultó automáticamente, **When** la persona sigue jugando, **Then** no vuelve a aparecer.

---

### User Story 3 - El aviso no interrumpe la partida (Priority: P3)

La invitación respeta el ritmo del juego: solo aparece cuando una ronda ya terminó, no tapa el botón para continuar, no atrapa el foco y se adapta a personas que reducen el movimiento o usan lector de pantalla.

**Why this priority**: La app es un juego de fiesta en tiempo real; un aviso mal colocado rompería la fluidez y la accesibilidad.

**Independent Test**: Provocar el aviso con el modal de reglas abierto, con movimiento reducido activo y con lector de pantalla; comprobar que no bloquea, que se anuncia de forma educada y que desaparece al continuar.

**Acceptance Scenarios**:

1. **Given** el modal de reglas abierto, **When** la bomba explota en la ronda 10, **Then** el aviso espera a que se cierre el modal antes de mostrarse.
2. **Given** la preferencia de reducir movimiento activa, **When** aparece el aviso, **Then** no hay animación de deslizamiento y el contenido aparece de inmediato.
3. **Given** un lector de pantalla activo, **When** aparece el aviso, **Then** se anuncia como una región educada, sin robar el foco ni interrumpir la lectura en curso.
4. **Given** el aviso visible, **When** transcurren 15 segundos sin interacción, **Then** se oculta solo y no vuelve a mostrarse.
5. **Given** el aviso visible, **When** la persona pulsa "Donar" sin conexión, **Then** la tarjeta muestra un mensaje breve de error y el juego sigue funcionando.

### Edge Cases

- La URL de donación todavía no está configurada: el aviso no se muestra y el juego funciona con normalidad.
- El almacenamiento local no está disponible o contiene datos corruptos: el juego sigue funcionando; el conteo puede continuar en memoria durante la sesión actual y el aviso se muestra como máximo una vez.
- La persona completa la ronda 10 en modo Solo Bomba: también cuenta como ronda completada.
- La persona usa el botón de simulación de explosión: cuenta como ronda completada.
- La persona inicia una nueva ronda antes de que el aviso termine de aparecer: el aviso se cancela y no se muestra en ese momento.
- Hay dos pestañas abiertas en web: cada pestaña puede mostrar el aviso como máximo una vez; no se garantiza coordinación entre pestañas.
- La persona borra los datos del sitio: el progreso se reinicia y el aviso puede volver a aparecer tras 10 rondas.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema MUST contar una ronda completada cada vez que la bomba explota, tanto en modo normal como en Solo Bomba, incluida la explosión simulada.
- **FR-002**: El sistema MUST acumular las rondas completadas entre sesiones y conservar si el aviso ya se mostró.
- **FR-003**: El sistema MUST mostrar el aviso cuando el conteo acumulado alcance 10 rondas y el aviso no se haya mostrado antes.
- **FR-004**: El aviso MUST ser una tarjeta compacta sin fondo modal, sin bloquear el resto de la pantalla y sin atrapar el foco.
- **FR-005**: El aviso MUST aparecer únicamente después de una explosión; si el modal de reglas está abierto, MUST esperar a que se cierre.
- **FR-006**: El aviso MUST ocultarse al pulsar "Donar", al pulsar "Ahora no", al iniciar la siguiente ronda o al transcurrir 15 segundos.
- **FR-007**: El botón "Donar" MUST abrir la página de Ko-fi configurada en el navegador externo de la plataforma.
- **FR-008**: Si el enlace no se puede abrir, el aviso MUST mostrar un mensaje breve de error sin interrumpir el juego.
- **FR-009**: Si la URL de donación no está configurada o no es HTTPS, el aviso MUST permanecer oculto.
- **FR-010**: Todo texto visible del aviso MUST existir en español e inglés.
- **FR-011**: El aviso MUST respetar la preferencia de reducir movimiento y anunciarse mediante una región accesible educada, con etiquetas claras en sus acciones.
- **FR-012**: Un fallo de almacenamiento MUST NOT impedir jugar ni provocar un crash; el aviso es una mejora best-effort.
- **FR-013**: El sistema MUST NOT enviar datos a un backend, usar analytics ni intentar verificar si la donación se completó.
- **FR-014**: El sistema MUST marcar el aviso como mostrado en cuanto aparece, para que no vuelva a mostrarse aunque la persona no interactúe con él.
- **FR-015**: Inicio MUST mostrar un icono discreto y permanente para donar cuando la URL esté configurada, sin UI de error si la apertura falla; con la URL vacía MUST permanecer oculto.

### Key Entities

- **Progreso de donación**: representa cuántas rondas completadas lleva la persona y si el aviso ya se mostró. Se conserva localmente; no contiene datos personales.
- **Configuración de donación**: URL de Ko-fi, umbral de rondas y duración antes de ocultarse. La URL es un valor de compilación, no una preferencia editable por la persona.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: En 10 de 10 ejecuciones de prueba desde un estado limpio, el aviso aparece exactamente una vez al completar la décima ronda.
- **SC-002**: En 10 de 10 recargas posteriores a haber mostrado el aviso, este no vuelve a aparecer aunque se completen 20 rondas más.
- **SC-003**: La persona puede iniciar la siguiente ronda con un solo toque mientras el aviso está visible, sin cerrarlo primero.
- **SC-004**: Con conexión, pulsar "Donar" abre la página configurada en menos de 2 segundos.
- **SC-005**: Con almacenamiento corrupto o no disponible, 10 de 10 partidas de prueba siguen siendo jugables y no se produce ningún crash.
- **SC-006**: El 100 % de los textos visibles del aviso están disponibles en español e inglés.

## Assumptions

- El umbral es de 10 rondas completadas y el aviso se muestra una sola vez en la vida del progreso local.
- La donación es voluntaria, sin recompensas, contenido desbloqueable ni reconocimiento dentro de la app.
- La plataforma elegida es Ko-fi; la URL se añadirá cuando el creador cree su página.
- Mientras la URL no exista, la feature queda dormida y no se muestra ningún aviso.
- El aviso solo vive en la pantalla de juego; Inicio añade únicamente un icono discreto y permanente, y Ajustes no añade ningún acceso.
- La app solo abre la página externa: no procesa pagos ni conoce el resultado de la donación.
- El conteo es acumulado y no se reinicia al cambiar de modo o de idioma.
- El aviso se oculta automáticamente a los 15 segundos para no quedarse sobre la pantalla indefinidamente.
