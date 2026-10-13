# amadoracacioperez-ai.github.io

Personal website and portfolio of **Amador Acacio**, a SaaS & ERP consultant, computer engineer and builder of
apps and AI tools.

A scroll-driven 3D journey: each section is a station you fly through. The site is available in English,
French and Spanish.

**Live:** https://amadoracacioperez-ai.github.io

## Stack

- [Astro 7](https://astro.build): static output, i18n routing and typed content collections (YAML + Zod).
- [React Three Fiber](https://r3f.docs.pmnd.rs), drei and postprocessing: one lazily loaded 3D scene per
  visual theme.
- [Lenis](https://lenis.darkroom.engineering): smooth scrolling, plus a small custom engine that maps
  scroll position to stations.
- Tailwind CSS v4 and per-theme design tokens. Fonts are self-hosted with Fontsource.
- GitHub Pages, deployed with GitHub Actions.

All content is real HTML, so it stays readable, indexable and accessible. The 3D canvas is a decorative
layer. A **quick view** switch, `prefers-reduced-motion` and no-JS visitors all get a clean flat layout.

## Visual themes

There are five themes built on the same content: `space`, `sport`, `glass`, `grid` and `supercar`.

- Open the site with `?preview` to show the theme picker.
- Use `?theme=<id>` to force one.

The default theme is set in `src/config/site.ts`.

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run check     # type check
npm run build     # static build in dist/
npm run preview   # serve the build locally
```

Requires Node 22.12 or later.

## Content

All content lives in `src/content/*/` (one YAML file per entry, with `en`, `fr` and `es` texts) and in
`src/data/profile.ts`. Set `draft: true` to hide an entry. A section with no published entries is hidden
automatically.

## License

© Amador Acacio. All rights reserved: this covers the code, texts, CV and personal information.
