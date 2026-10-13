# PROGRESS: web personal de Amador Acacio

Archivo de contexto entre chats. **Léelo al empezar y actualízalo al terminar cada tanda.**
Las instrucciones del proyecto están en [AGENTS.md](AGENTS.md) (`CLAUDE.md` apunta a él).

## Estado actual (2026-10-13)

- **Primera versión completa**: las 5 escenas 3D, 3 idiomas, el contenido verificado, SEO y la
  verificación. El repositorio está en GitHub:
  https://github.com/amadoracacioperez-ai/amadoracacioperez-ai.github.io
- **Publicación:** ver "Despliegue" más abajo (rama `gh-pages` provisional hasta activar GitHub
  Actions).
- **Siguiente paso:**
  1. Amador elige estilo en `https://amadoracacioperez-ai.github.io/?preview`.
  2. Amador pasa sus logros deportivos y sus objetivos.
  3. Amador ejecuta el comando del permiso `workflow` para activar el despliegue automático.

## Decisiones fijadas (2026-10-13)

- **Objetivo:** web personal profesional para adjuntar a candidaturas (sobre todo en Francia) y servir de
  portfolio. Recoge los logros profesionales y deportivos.
- **Repo:** `amadoracacioperez-ai/amadoracacioperez-ai.github.io`, público, en la cuenta personal.
  URL: https://amadoracacioperez-ai.github.io. El dominio propio llegará más adelante
  ([docs/DOMINIO.md](docs/DOMINIO.md)).
- **Idiomas:** EN por defecto en `/`, FR en `/fr/` y ES en `/es/`.
- **Estilos:** hay 5 para que Amador elija uno:
  - `space` (viaje espacial, el estilo por defecto por ahora);
  - `sport` (pista de atletismo);
  - `glass` (cristal y cromo);
  - `grid` (cyber-grid synthwave);
  - `supercar` (superdeportivo en una autopista nocturna).

  Se comparan con `?preview` (selector flotante; las teclas 1–5 también cambian de estilo). Cuando
  elija, se cambia `defaultTheme` en `src/config/site.ts`.
- **Stack:** Astro 7 (estático), React 19 y React Three Fiber 9, drei 10, postprocessing 3, Lenis 1.3,
  Tailwind 4 y TypeScript 6. Las fuentes se alojan en la propia web con Fontsource.
- **Motor de scroll propio** (`src/lib/motion.ts`), sin GSAP:
  - Lenis más un tramo por pantalla: entra desde el fondo, se queda y pasa de largo.
  - Las pantallas altas se desplazan solas durante la fase en la que se quedan.
  - El motor publica `g` (pantalla) y `s` (estación) en `scroll-store.ts`.
- **El coche de `supercar` está hecho con código** (`src/scenes/supercar/Car.tsx`), sin modelos de
  terceros, así que no hay licencias. Si algún día se quiere un modelo real, tiene que ser CC0 y sin marca.
- **Portfolio:** 11 proyectos de `~/PROYECTOS`, agrupados así:
  - **IA:** AURA Email, CVGENERATOR, Generador de fotos IA, Editor de Reels IA y el bot de swing trading;
  - **Apps y juegos:** Detox, Ojo y The Million Business Game;
  - **Web y negocio:** XPAND, Technosanic y Olaloom.
- **Contenido:** solo datos verificados de `CVGENERATOR/perfil/perfil_maestro.yaml` (las reglas están
  en AGENTS.md).
- **CV descargable:** `public/cv/Amador_Acacio_CV_EN.pdf`, copia del CV base en inglés del CVGENERATOR.
  **Incluye el teléfono.** Amador no se opuso en el plan; hay que volver a confirmarlo con él.
- **Rojo del estilo sport:** pasa de #C8102E a #E0263F para que el texto pequeño tenga contraste AA.

## Plan por fases

1. [x] **Base:** Astro, dependencias, configuración, AGENTS.md, PROGRESS.md, README y `git init`.
2. [x] **Contenido e i18n:** esquemas Zod 4, perfil, textos de la interfaz y YAML en EN, FR y ES.
3. [x] **Maquetación HTML:** maqueta plana (sin JS, vista rápida, movimiento reducido), cabecera,
   secciones y los tokens de los 5 estilos.
4. [x] **Motor 3D:** isla React del canvas, carga dinámica por estilo, calidad adaptativa y
   selector `?preview`.
5. [x] **Escenas:** space, sport, grid, glass y supercar.
6. [x] **SEO y extras:** Open Graph, JSON-LD, hreflang, sitemap, favicon, robots.txt, CV y
   docs/DOMINIO.md.
7. [x] **Verificación:**
   - `astro check` sin errores y el build correcto;
   - 21 pruebas de comportamiento en verde (3D, vista rápida, movimiento reducido, sin JS, selector y
     cambio de estilo en vivo, navegación, idioma que conserva la sección, foco con teclado y email);
   - capturas de los 5 estilos en escritorio y en móvil;
   - Lighthouse en escritorio: 99 de rendimiento, 100 de accesibilidad, 100 de buenas prácticas y 100
     de SEO;
   - Lighthouse en móvil: 86 de rendimiento y 100 en las otras tres.
8. [~] **GitHub:**
   - [x] el repositorio está creado y el código subido;
   - [ ] queda pendiente activar el despliegue con Actions (ver abajo).

## Despliegue

- **Ahora (provisional):** la web se sirve desde la rama `gh-pages`, que solo contiene `dist/`.
  Para volver a publicar a mano:
  ```bash
  npm run build
  S=$(mktemp -d) && cp -R dist/. "$S" && cd "$S" && git init -q -b gh-pages && git add -A \
    && git commit -qm "Deploy" && git push -f \
    https://amadoracacioperez-ai@github.com/amadoracacioperez-ai/amadoracacioperez-ai.github.io.git gh-pages
  ```
- **Definitivo (GitHub Actions):** el workflow está listo en la rama local `ci/github-actions`
  (`.github/workflows/deploy.yml`). No se ha subido porque el token de `gh` de la cuenta personal no
  tiene el permiso `workflow`. Pasos:
  1. Amador ejecuta una vez en la terminal (se abre el navegador):
     `gh auth switch -u amadoracacioperez-ai && gh auth refresh -h github.com -s workflow`
  2. Se integra la rama y se sube:
     `git merge ci/github-actions && git push origin main`.
  3. Se cambia Pages a "workflow":
     `GH_TOKEN=$(gh auth token -u amadoracacioperez-ai) gh api -X PUT repos/amadoracacioperez-ai/amadoracacioperez-ai.github.io/pages -f build_type=workflow`.
  4. Se borra la rama `gh-pages`, si se quiere.
  5. Se vuelve a dejar activa la cuenta de la agencia con
     `gh auth switch -u xylagenciamarketingdeportivo-prog`, si Amador la usa.
- **Cuentas de `gh`:** la activa suele ser la de la agencia. En los comandos se usa
  `GH_TOKEN=$(gh auth token -u amadoracacioperez-ai)`. El remote lleva el usuario en la URL, así que
  git usa la cuenta personal.

## Pendiente de Amador

1. **Elegir el estilo** en `https://amadoracacioperez-ai.github.io/?preview` (teclas 1–5 o el panel).
2. **Logros deportivos y objetivos**: deporte, marcas, fechas y competiciones. Saber también si se enlaza
   su Instagram. Para añadirlos hay plantillas en `src/content/achievements/_TEMPLATE-sports.yaml` y
   `src/content/goals/_TEMPLATE-goal.yaml`.
3. Ejecutar el **comando del permiso `workflow`** (ver Despliegue).
4. **CV con teléfono:** confirmar si se deja público o se genera una versión sin teléfono.
5. **Foto profesional** (opcional; por ejemplo de `GENERADORFOTOSIA/resultados`).
6. **Apps publicadas:** nombres y enlaces a las tiendas (las fichas de Detox y Ojo dicen "en
   desarrollo"). Su papel en **XPAND** y en **Technosanic**. Si se enlaza la tienda **Olaloom**
   (olaloom.es).
7. Revisar los textos: bio, fichas de proyectos y traducciones FR y ES.

## Ideas para después

- Capturas reales en las portadas de los proyectos (XPAND, The Million Business Game…).
- Páginas de detalle por proyecto (casos de estudio).
- CV en francés y en español generados con el CVGENERATOR.
- Analítica respetuosa con la privacidad (Plausible o Umami), si Amador la quiere.

## Bitácora

- **2026-10-13 (primera versión):**
  - Plan aprobado.
  - Proyecto creado con create-astro 5.2.6 (Astro 7.3.8).
  - Aviso EBADENGINE de undici (pide Node ≥ 22.19; tenemos 22.16). Viene de `unifont` y no se usa.
  - Contenido escrito: 6 experiencias, 2 formaciones, 6 hitos y 11 proyectos, en EN, FR y ES. En
    español se usan las formas de las candidaturas de Amador («ingeniero informático», «consultor»).
  - Maqueta y motor de scroll. El modo 3D solo se activa cuando motion.ts añade
    `data-motion-ready`; si el JS falla, se ve la maqueta plana.
  - 5 escenas 3D, revisadas con capturas en escritorio y en móvil, y ajustadas:
    - **space:** anillos a 12 unidades de la cámara y halos con fresnel corregido;
    - **sport:** arcos en la entrada de cada estación y líneas suavizadas cerca de la cámara;
    - **grid:** sol y monolitos a la derecha;
    - **glass:** luz de estudio más clara y tarjetas más opacas;
    - **supercar:** ciudad más lejana y carretera más oscura.
  - Rendimiento:
    - El 3D arranca tras `load` + `requestIdleCallback`: el bloqueo del hilo principal pasa de
      2,5 s a 80 ms.
    - `measure()` mide en fases.
  - Error corregido: al cambiar de idioma con `#seccion` se aterrizaba en Contacto. La causa era el
    scroll suave nativo y el anclaje del navegador. Ahora el modo 3D usa `overflow-anchor: none`.
  - Capturas y pruebas: scripts en el scratchpad de la sesión (playwright-core con el Chrome
    instalado: `shots.mjs` y `verify.mjs`), con el gancho `window.__aaMotion`
    (`centers`, `scrollToY`, `goTo`).
  - Repo creado en GitHub y código subido.
