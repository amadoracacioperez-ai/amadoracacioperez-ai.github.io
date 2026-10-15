# Web personal de Amador Acacio

> `CLAUDE.md` es un enlace a este fichero.
> **Al empezar cualquier sesión, lee primero [PROGRESS.md](PROGRESS.md)**: estado actual, siguiente paso y decisiones.
> **Al terminar cada tanda de cambios, actualiza PROGRESS.md** (estado, bitácora y pendientes).

Web personal y portfolio de Amador Acacio: un viaje 3D al hacer scroll, futurista pero profesional, en
inglés (por defecto), francés y español. Sirve para adjuntarla a candidaturas y como portfolio de proyectos.

- Producción: https://amadoracacioperez-ai.github.io (GitHub Pages). Más adelante, dominio propio
  (guía en [docs/DOMINIO.md](docs/DOMINIO.md)).
- Repositorio: `amadoracacioperez-ai/amadoracacioperez-ai.github.io`. Es público y está en la cuenta
  **personal**, no en la de la agencia.

## Reglas de contenido (obligatorias)

1. **No se inventa nada.** Solo se usan tres fuentes:
   - `~/PROYECTOS/CVGENERATOR/perfil/perfil_maestro.yaml`, que es la fuente de verdad y solo contiene datos verificados;
   - la documentación de cada proyecto (README, PROGRESS);
   - lo que Amador confirme en el chat.

   Si falta un dato, se pregunta.
2. **Nunca se publica:**
   - el teléfono en la página;
   - la nacionalidad;
   - el grado de Teleco sin terminar ni el título "Telecom Engineer";
   - la cifra de descargas de las apps;
   - las notas del grado (media y TFG), pendientes de confirmar;
   - los datos de clientes;
   - los certificados ni los ejemplos sensibles de los proyectos.
3. **No presentar a Amador como deportista profesional ni inventar resultados deportivos.** Los logros
   deportivos y los objetivos van con `draft: true` hasta que Amador los confirme. Los borradores no se
   publican y una sección sin entradas publicadas no aparece.
4. **Cifras.** Las que se muestran salen de los datos: nº de proyectos, idiomas y países.
5. **Idiomas.** El texto base es el inglés verificado del perfil; FR y ES son traducciones fieles. En
   español, Amador usa en sus candidaturas las formas «ingeniero informático» y «consultor».

## Estructura

| Ruta | Qué hay |
|---|---|
| `src/config/site.ts` | URL, idiomas, estilos (themes), `defaultTheme`, enlaces, ruta del CV |
| `src/data/profile.ts` | Nombre, titular, bio, idiomas y competencias (traducidos) |
| `src/content/<colección>/*.yaml` | Una entrada por fichero: `experience`, `education`, `achievements`, `goals` y `projects`. Esquemas en `src/content.config.ts` |
| `src/i18n/` | Textos de la interfaz (`ui.ts`) y helpers (`utils.ts`) |
| `src/layouts/BaseLayout.astro` | `<head>`: SEO, hreflang, JSON-LD y el script de arranque del estilo y del modo |
| `src/components/sections/` | Secciones (estaciones): Hero, About, Journey, Milestones, Projects, Contact |
| `src/components/layout/` | Cabecera, selector de idioma, vista rápida, navegación por estaciones y pie |
| `src/components/three/` | Isla React del canvas 3D (`Experience.tsx`), cambio de estilo y utilidades |
| `src/scenes/<estilo>/` | Una escena 3D por estilo: `space`, `sport`, `glass`, `grid` y `supercar` |
| `src/lib/` | Motor de scroll (Lenis + mapeo de estaciones y pantallas), store del scroll y utilidades de estilo |
| `src/styles/` | `global.css` (Tailwind v4 y la base) y `themes/<estilo>.css` (tokens de cada estilo) |

### Cómo funciona el scroll 3D

- Cada sección es una **estación** con N **pantallas** (`.frame`). En modo `full`, la estación mide
  (N+1)×100svh y su escenario es `sticky`. Cada pantalla entra desde el fondo, se queda y pasa de largo.
- `src/lib/motion.ts` calcula, a partir del scroll, el progreso de cada pantalla y el progreso global
  continuo `g` (índice de pantalla) y `s` (índice de estación), y lo guarda en `scroll-store.ts`. Las
  escenas 3D lo leen en `useFrame`.
- Hay dos modos en `html[data-motion]`: `full` (3D) y `flat` (maqueta plana). `flat` se usa sin JS, con
  `prefers-reduced-motion` o con la "vista rápida". Todo el contenido tiene que leerse bien en `flat`.

### Estilos (themes)

- Hay 5 estilos en el código (`space | sport | glass | grid | supercar`), pero **solo se ven los de
  `ACTIVE_THEMES`** en `src/config/site.ts`. Ahora mismo solo está `space`, por decisión de Amador. Los
  otros se guardan sin mostrarse.
- `html[data-theme]` se elige entre los estilos activos así:
  1. `?theme=<id>`;
  2. lo guardado en localStorage;
  3. `defaultTheme` en `src/config/site.ts`, que tiene que estar en `ACTIVE_THEMES`.
- Con `?preview` aparece el selector flotante para comparar estilos, solo si hay más de uno activo. Los
  visitantes normales no lo ven.
- Cada estilo tiene sus tokens en `src/styles/themes/<id>.css` y su escena en `src/scenes/<id>/`. El canvas
  se vuelve a montar al cambiar de estilo, así se liberan todos los recursos.

## Cómo añadir contenido

- **Proyecto:** crea `src/content/projects/<id>.yaml` copiando uno existente. Los textos llevan `en`, `fr`
  y `es`. El campo `group` admite `ai`, `apps` o `web`.
- **Logro u objetivo:** crea `src/content/achievements/<id>.yaml` o `src/content/goals/<id>.yaml`. Para
  publicarlo pon `draft: false`.
- **Texto de la interfaz:** edita `src/i18n/ui.ts`, en los tres idiomas.

## Comandos

```bash
npm run dev          # servidor de desarrollo (en agentes: `npx astro dev --background`;
                     # gestionar con `npx astro dev stop|status|logs`)
npm run check        # astro check (tipos), tiene que dar 0 errores
npm run build        # build estático en dist/
npm run preview      # sirve dist/ en local
```

## Despliegue

- **GitHub Actions** (`.github/workflows/deploy.yml`) publica en Pages en cada push a `main`. Para subir
  ficheros de workflow, el token de `gh` de la cuenta personal necesita el permiso `workflow`. Se le
  añade una sola vez con
  `gh auth switch -u amadoracacioperez-ai && gh auth refresh -h github.com -s workflow`.
- **Cuentas de `gh`.** Hay varias y la activa suele ser la de la agencia. Para la cuenta personal:
  - en los comandos `gh`, usa `GH_TOKEN=$(gh auth token -u amadoracacioperez-ai) gh ...`;
  - para git, el remote ya lleva el usuario:
    `https://amadoracacioperez-ai@github.com/amadoracacioperez-ai/amadoracacioperez-ai.github.io.git`.
- Consulta PROGRESS.md para ver el estado actual del despliegue.

## Notas de Astro 7 (distinto a lo que puedas recordar)

- Las colecciones de contenido van en `src/content.config.ts` y siempre llevan loader (`glob` y `file` de
  `astro/loaders`). `z` se importa de `astro/zod` y es **Zod 4**: `z.email()`, `z.url()` y `{ error }` en
  lugar de `{ message }`. Se usa `id`, no `slug`, y `render(entry)` es una función aparte.
- `compressHTML` está puesto a `true` en la config para no pegar textos en línea (en Astro 7 el valor por
  defecto es `'jsx'`).
- El compilador en Rust es estricto: no admite etiquetas sin cerrar ni anidaciones inválidas (`<div>`
  dentro de `<p>`).
- `src/fetch.ts` está reservado: no crees ese fichero.
- Astro 7 usa Vite 8. Documentación: https://docs.astro.build
