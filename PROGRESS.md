# PROGRESS: web personal de Amador Acacio

Archivo de contexto entre chats. **Léelo al empezar y actualízalo al terminar cada tanda.**
Las instrucciones del proyecto están en [AGENTS.md](AGENTS.md) (`CLAUDE.md` apunta a él).

## Estado actual (2026-10-15)

- **Primera versión completa**: las 5 escenas 3D, 3 idiomas, el contenido verificado, SEO y la
  verificación. El repositorio está en GitHub:
  https://github.com/amadoracacioperez-ai/amadoracacioperez-ai.github.io
- **Publicada en https://amadoracacioperez-ai.github.io**. Desde el 2026-10-15 se **despliega sola con
  GitHub Actions** en cada push a `main` (ver "Despliegue"). Las 21 pruebas de comportamiento pasan
  también en la web en vivo.
- **2026-10-15: contenido de Amador incorporado** (logros deportivos, cambios en los proyectos y la bio).
  Ver la bitácora.
- **Estilo elegido: `space`** (2026-10-15). Es el único visible. Los otros 4 se guardan en el código sin
  mostrarse.
- **Web terminada** (Amador, 2026-10-15: "dejémosla así"). Se queda tal cual está publicada. Las dudas
  de "Pendiente de Amador" son opcionales; mientras no diga otra cosa, todo sigue como está: las fichas del
  maratón y del Ironman, The Million Business Game y Adultopedia sin su papel.

## Decisiones fijadas (2026-10-13)

- **Objetivo:** web personal profesional para adjuntar a candidaturas (sobre todo en Francia) y servir de
  portfolio. Recoge los logros profesionales y deportivos.
- **Repo:** `amadoracacioperez-ai/amadoracacioperez-ai.github.io`, público, en la cuenta personal.
  URL: https://amadoracacioperez-ai.github.io. El dominio propio llegará más adelante
  ([docs/DOMINIO.md](docs/DOMINIO.md)).
- **Idiomas:** EN por defecto en `/`, FR en `/fr/` y ES en `/es/`.
- **Estilos:** hay 5 en el código. **Amador eligió `space` el 2026-10-15** y es el único activo:
  - `space` (viaje espacial; **activo**);
  - `sport` (pista de atletismo; guardado);
  - `glass` (cristal y cromo; guardado);
  - `grid` (cyber-grid synthwave; guardado);
  - `supercar` (superdeportivo en una autopista nocturna; guardado).

  Los visitantes solo ven los de `ACTIVE_THEMES` en `src/config/site.ts`. `?theme=` y localStorage
  ignoran los demás, y el selector `?preview` solo aparece si hay más de uno activo. Para volver a
  comparar estilos, se añaden a esa lista.
- **Stack:** Astro 7 (estático), React 19 y React Three Fiber 9, drei 10, postprocessing 3, Lenis 1.3,
  Tailwind 4 y TypeScript 6. Las fuentes se alojan en la propia web con Fontsource.
- **Motor de scroll propio** (`src/lib/motion.ts`), sin GSAP:
  - Lenis más un tramo por pantalla: entra desde el fondo, se queda y pasa de largo.
  - Las pantallas altas se desplazan solas durante la fase en la que se quedan.
  - El motor publica `g` (pantalla) y `s` (estación) en `scroll-store.ts`.
- **El coche de `supercar` está hecho con código** (`src/scenes/supercar/Car.tsx`), sin modelos de
  terceros, así que no hay licencias. Si algún día se quiere un modelo real, tiene que ser CC0 y sin marca.
- **Portfolio:** 12 proyectos (actualizado el 2026-10-15), agrupados así:
  - **IA:** AURA Email, CVGENERATOR, Generador de fotos IA, Editor de Reels IA, Cerebro digital y
    La pizarra de Warren (analizador de acciones, en desarrollo);
  - **Apps y juegos:** Adultopedia (la única en la App Store), Detox, Ojo y The Million Business Game;
  - **Web y negocio:** Technosanic (software de facturación) y Olaloom.
  - Fuera, por decisión de Amador: XPAND. El bot de swing trading se descartó en el repo WARRENBUFFET
    y lo sustituye el analizador.
  - Adultopedia está en `~/Projects/adulting-uncomplicated`. La cuenta de Apple Developer es la de
    Alejandro Muntañola: la ficha no dice el papel de Amador hasta que lo confirme.
  - **Olaloom sin enlace a la tienda** (decisión de Amador).
- **Contenido:** solo datos verificados de `CVGENERATOR/perfil/perfil_maestro.yaml` (las reglas están
  en AGENTS.md) y lo que Amador confirme en el chat.
- **Deporte (confirmado por Amador el 2026-10-15):** jugador semiprofesional de baloncesto en la cantera
  del Real Madrid hasta los 16 años, Maratón de Madrid en 3:29 e Ironman 70.3 en 4 h 56 min. **Se quita
  la ficha de árbitro** (también de la bio).
- **CV descargable:** `public/cv/Amador_Acacio_CV_EN.pdf`, copia del CV base en inglés del CVGENERATOR.
  **Incluye el teléfono y se deja así** (Amador lo confirmó el 2026-10-15).
- **Sin foto** (decisión de Amador).
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
8. [x] **GitHub:** el repositorio está creado y la web se despliega con Actions en cada push a `main`.

## Despliegue

- **GitHub Actions** (`.github/workflows/deploy.yml`, activo desde el 2026-10-15). Cada push a `main`
  construye la web (`withastro/action`) y la publica en Pages (`build_type=workflow`). También se puede
  lanzar a mano desde la pestaña Actions. Para seguir una ejecución:
  `GH_TOKEN=$(gh auth token -u amadoracacioperez-ai) gh run list -R amadoracacioperez-ai/amadoracacioperez-ai.github.io -L 3`.
- El token de la cuenta personal ya tiene el permiso `workflow`. Se pidió con el flujo de dispositivo de
  `gh auth refresh`, que exige que la cuenta personal esté activa.
- La rama `gh-pages` (el despliegue a mano de antes) ya no se usa. Se puede borrar cuando Amador quiera.
- **Cuentas de `gh`:** la activa suele ser la de la agencia (`xylagenciamarketingdeportivo-prog`). Se
  vuelve a dejar activa después de cualquier cambio.
  - En los comandos `gh` se usa `GH_TOKEN=$(gh auth token -u amadoracacioperez-ai)`.
  - El ayudante de credenciales de `gh` solo responde con la cuenta **activa**. Para hacer
    `git push` sin cambiarla, se pasa un ayudante de un solo uso:
    ```bash
    git -c credential.helper= -c 'credential.helper=!f() { test "$1" = get && echo "username=amadoracacioperez-ai" && echo "password=$(gh auth token -h github.com -u amadoracacioperez-ai)"; }; f' push origin main
    ```
  - Si la cuenta personal está activa (`gh auth switch -u amadoracacioperez-ai`), basta con
    `git push`.

## Pendiente de Amador (opcional)

1. **Fichas del maratón y del Ironman:** decir si se quedan en Hitos, ahora que la bio ya no los nombra.
2. **Datos opcionales del deporte:** el año del Maratón de Madrid, y la carrera y el año del Ironman 70.3
   (van en `period` de cada ficha). Los **objetivos** siguen sin datos: la sección no aparece. Falta
   saber si se enlaza su Instagram.
3. **The Million Business Game:** confirmar si se queda. Amador dijo "deja Detox, Ojo y Adultopedia" y no
   lo nombró; de momento sigue publicada.
4. **Adultopedia:** su papel (por ejemplo, cofundador), si quiere que se diga en la ficha.
5. Revisar los textos: bio, fichas de proyectos y traducciones FR y ES.

Resuelto el 2026-10-15: estilo (`space`), despliegue automático, teléfono en el CV (se deja), foto (no), apps, Technosanic,
Olaloom (sin enlace), XPAND (fuera) y logros deportivos.

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
  - Pages desde `gh-pages`. El primer build automático desde `main` falló, como era de esperar (Jekyll
    sobre el código fuente); se cambió la fuente a `gh-pages`. La web en vivo devuelve 200 en `/`,
    `/fr/`, `/es/`, CV, OG, sitemap y robots.txt, y 404 en lo demás.
  - **space:** nebulosas con máscara radial (antes se veía el borde recto del sprite).
  - Workflow de Actions preparado en la rama local `ci/github-actions`, sin subir (falta el permiso
    `workflow`).
- **2026-10-15 (contenido de Amador):**
  - Deporte: fuera la ficha de árbitro. Entran la cantera del Real Madrid (semiprofesional hasta los 16),
    el Maratón de Madrid (3:29) y el Ironman 70.3 (4 h 56 min). También se cambia la frase de la bio.
  - Proyectos:
    - entran Adultopedia, con su enlace a la App Store comprobado en la API de iTunes y adultopedia.app;
    - entra Cerebro digital;
    - el bot de swing trading se cambia por La pizarra de Warren;
    - sale XPAND;
    - se reordenan los grupos.
  - `astro check` sin errores y el build correcto. Capturas de Hitos y Proyectos en EN y ES revisadas, sin
    errores de consola.
  - Bio: la frase del deporte la redactó Amador. Dice: «jugué al baloncesto como semiprofesional en la
    cantera del Real Madrid hasta los 16 años y ahora soy triatleta amateur y aficionado a cualquier
    deporte de resistencia». Va traducida a EN y FR.
  - Despliegue automático:
    - Amador autorizó el permiso `workflow` con el código de dispositivo.
    - Pages pasa a `build_type=workflow` y se integra `ci/github-actions` en `main`.
    - La primera ejecución (build y deploy) termina bien. La web en vivo devuelve 200 en `/`, `/fr/`,
      `/es/`, CV, OG, sitemap y robots.txt, y 404 en lo demás.
    - Se vuelve a dejar activa la cuenta de `gh` de la agencia.
  - Estilo: Amador deja `space` como único estilo y quiere guardar los demás sin que se vean.
    - Nueva lista `ACTIVE_THEMES` en `src/config/site.ts`, que usan el arranque, `Experience.tsx`,
      `site-ui.ts` y `ThemePicker`. Con un solo estilo no se pinta el selector ni se activa `?preview`.
    - Prueba en Chrome: con `?theme=grid&preview` y con `grid` guardado en localStorage se ve `space`,
      no aparece el selector, la tecla 3 no cambia nada y solo se descarga la escena `space`, sin errores.
    - AGENTS.md y README actualizados.
  - Amador da la web por terminada y la deja como está.
