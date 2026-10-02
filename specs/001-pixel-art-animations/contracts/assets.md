# Asset Contract: hojas de sprites, iconos y fondos

**Feature**: [spec.md](../spec.md) | **Research**: [R2, R8](../research.md)

## Pipeline

```text
assets/pixel-src/*.aseprite          (fuente editable, versionada)
        │  export manual 1× (Aseprite: File > Export Sprite Sheet)
        ▼
assets/pixel-src/export/<id>.png     (PNG 1×, paleta del tema)
assets/pixel-src/export/<id>.json    (opcional: metadatos Aseprite)
        │  npm run sprites  →  node scripts/build-sprites.js
        ▼
assets/sprites/<id>.png              (hoja pre-escalada ×exportScale, nearest)
assets/icons/<name>.png
assets/backgrounds/<id>.png
```

- `scripts/build-sprites.js` lee una tabla `{ id, exportScale, dest }`, aplica
  `sharp(...).resize({ width: w*k, height: h*k, kernel: 'nearest' })` y **falla** si alguna
  dimensión resultante supera 2048 px.
- Los PNG generados se versionan (Metro los empaqueta con `require`); el script es
  idempotente.

## Formato de hoja

| Regla                     | Valor                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------- |
| Disposición               | rejilla izquierda→derecha, arriba→abajo; sin padding ni márgenes                      |
| Tamaño de fotograma 1×    | bomba 32×32, explosión 64×64, moneda 16×16, iconos 16×16, cargador 16×16              |
| Paleta                    | solo colores de `theme/pixel.ts` + transparencia total (sin alfa parcial / antialias) |
| Formato                   | PNG-8 indexado si es posible (`sharp().png({ palette: true })`)                       |
| Dimensión máxima generada | 2048×2048 px                                                                          |
| Nombre                    | `camelCase` igual al `SpriteId` de `theme/sprites.ts`                                 |

## Inventario requerido

| SpriteId             | Fotogramas           | Uso                                                                       | Historia |
| -------------------- | -------------------- | ------------------------------------------------------------------------- | -------- |
| `bombIdle`           | 4                    | bomba en reposo (chispa)                                                  | US1      |
| `bombArmed`          | 4                    | mecha ardiendo                                                            | US1      |
| `explosion`          | 8–10                 | explosión + último fotograma de humo                                      | US1      |
| `coin`               | 8 giro + cara + cruz | reto moneda                                                               | US3      |
| `loader`             | 4                    | `NavigationReady`                                                         | US2      |
| `bgStars` (opcional) | 2–4                  | capa animada del fondo                                                    | US2      |
| iconos               | 1 c/u                | `back`, `help`, `settings`, `check`, `dice`, `bomb`, `boom`, `coin`       | US2      |
| iconos de reto       | 1 c/u                | `rps` (32×16, piedra-papel-tijera), `chain`, `eyes`, `abc` (16×16)        | US2      |
| fondo `default`      | 1                    | fondo pixel por defecto (vertical, ratio ~9:19.5, se recorta con `cover`) | US2      |
| fondo `city`         | 1                    | segundo fondo pixel seleccionable (mismo formato que `default`)           | US2      |

Fondos: arte 1× a 180×390 px exportado ×5 (900×1950, dentro del límite de 2048 px) para
cubrir teléfonos y tablets con `resizeMode="cover"`; se acepta el recorte lateral en
tablets y un reescalado residual leve (fondo, no elemento protagonista).

## Licencias

Cada asset de terceros se registra en `assets/LICENSES.md` con: nombre, autor, URL de
origen, licencia (debe permitir uso comercial: CC0, CC-BY, OFL…) y atribución requerida
(FR-024). Fuentes: Press Start 2P y Pixelify Sans (OFL 1.1).
