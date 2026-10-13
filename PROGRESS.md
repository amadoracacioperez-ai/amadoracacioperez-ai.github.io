# PROGRESS: web personal de Amador Acacio

Archivo de contexto entre chats. **Léelo al empezar y actualízalo al terminar cada tanda.**
Las instrucciones del proyecto están en [AGENTS.md](AGENTS.md) (`CLAUDE.md` apunta a él).

## Estado actual

- **Fase:** 1 de 8, la base del proyecto (en curso).
- **Siguiente paso:** terminar la base (config y documentación) y hacer el primer commit. Después,
  contenido e i18n.

## Decisiones fijadas (2026-10-13)

- **Objetivo:** web personal profesional para adjuntar a candidaturas (sobre todo en Francia) y servir de
  portfolio. Recoge los logros profesionales y deportivos.
- **Repo:** `amadoracacioperez-ai/amadoracacioperez-ai.github.io`, público, en la cuenta personal de GitHub.
  URL: https://amadoracacioperez-ai.github.io. El dominio propio llegará más adelante.
- **Idiomas:** EN por defecto en `/`, FR en `/fr/` y ES en `/es/`.
- **Estilos:** se construyen 5 para que Amador elija uno: `space` (viaje espacial, por defecto), `sport`
  (minimal deportivo-tech), `glass` (cristal y cromo), `grid` (cyber-grid) y `supercar` (superdeportivo
  en una autopista nocturna). Se comparan con `?preview`.
- **Stack:** Astro 7 (estático), React Three Fiber, drei y postprocessing, Lenis y Tailwind v4. Las
  fuentes se alojan en la web con Fontsource.
- **Motor de scroll:** es propio (Lenis más un mapeo de estaciones y pantallas, en `src/lib/motion.ts`),
  sin GSAP, para que pese menos.
- **Portfolio:** 11 proyectos de `~/PROYECTOS`, agrupados así:
  - **IA:** AURA Email, CVGENERATOR, Generador de fotos IA, Editor de Reels IA y el bot de trading
    WARRENBUFFET;
  - **Apps y juegos:** Detox, Ojo y The Million Business Game;
  - **Web y negocio:** Olaloom, XPAND y Technosanic.
- **Contenido:** solo datos verificados de `CVGENERATOR/perfil/perfil_maestro.yaml` (ver las reglas en
  AGENTS.md).
- **CV descargable:** `CVGENERATOR/perfil/base/CV_Amador_Acacio_EN.pdf`, copiado a `public/cv/`. Incluye
  el teléfono; Amador no se opuso en el plan.

## Plan por fases

1. [ ] **Base:** Astro, dependencias, configuración, AGENTS.md, PROGRESS.md, README y `git init`.
2. [ ] **Contenido e i18n:** esquemas, perfil, textos de la interfaz y YAML en EN, FR y ES.
3. [ ] **Maquetación HTML:** maqueta plana, cabecera y secciones, y los tokens de los 5 estilos.
4. [ ] **Motor 3D:** scroll, estaciones, canvas, vista rápida y selector `?preview`.
5. [ ] **Escenas:** space, sport, grid, glass y supercar.
6. [ ] **SEO y extras:** OG, favicon, robots.txt, CV y docs/DOMINIO.md.
7. [ ] **Verificación local:** check, build, capturas con Playwright y Lighthouse.
8. [ ] **GitHub:** crear el repo, subirlo y publicar en Pages.

## Pendiente de Amador

1. Logros deportivos y objetivos: deporte, marcas, fechas y competiciones. Saber también si se enlaza su
   Instagram.
2. Elegir el estilo después de verlos en `?preview`.
3. Foto profesional (opcional).
4. Nombres y enlaces de las apps publicadas, y su papel en XPAND y en Technosanic.
5. Confirmar si el CV descargable puede llevar el teléfono.
6. Ejecutar una vez en la terminal: `gh auth switch -u amadoracacioperez-ai && gh auth refresh -h github.com -s workflow`.
   Activa el despliegue automático con GitHub Actions.

## Bitácora

- **2026-10-13:**
  - Plan aprobado.
  - Proyecto creado con create-astro 5.2.6 (Astro 7.3.8).
  - Dependencias instaladas: React 19.3, three 0.186, R3F 9.8, drei 10.7, postprocessing 3.2,
    Lenis 1.3, Tailwind 4.3 y TypeScript 6 (`@astrojs/check` aún no admite TS 7).
  - Aviso EBADENGINE de undici (pide Node ≥ 22.19; tenemos 22.16). Viene de `unifont` y no se usa.
