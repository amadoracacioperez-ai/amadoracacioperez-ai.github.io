// Configuración global de la web. Al conectar un dominio propio, cambia `url`
// (y `site` en astro.config.mjs).

export const LOCALES = ['en', 'fr', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const THEMES = ['space', 'sport', 'glass', 'grid', 'supercar'] as const;
export type ThemeId = (typeof THEMES)[number];

/**
 * Estilos que los visitantes pueden ver. Los demás se guardan en el código, pero ni `?theme=` ni
 * localStorage los aplican. El selector `?preview` solo aparece si hay más de uno.
 * Para volver a comparar estilos, añádelos aquí.
 */
export const ACTIVE_THEMES: readonly ThemeId[] = ['space'];

export const SITE = {
  url: 'https://amadoracacioperez-ai.github.io',
  name: 'Amador Acacio',
  /** Estilo visual por defecto. Tiene que estar en ACTIVE_THEMES. */
  defaultTheme: 'space' as ThemeId,
  email: { user: 'amadoracacioperez', domain: 'gmail.com' },
  linkedin: 'https://www.linkedin.com/in/amador-acacio-perez',
  github: 'https://github.com/amadoracacioperez-ai',
  cv: '/cv/Amador_Acacio_CV_EN.pdf',
  ogImage: '/og/og-image.png',
} as const;

/** Colores de muestra de cada estilo para el selector `?preview`. */
export const THEME_SWATCHES: Record<ThemeId, [string, string, string]> = {
  space: ['#05060A', '#5EEAD4', '#8B5CF6'],
  sport: ['#0A0A0A', '#F5F5F2', '#C8102E'],
  glass: ['#111214', '#C9D1D9', '#7DD3FC'],
  grid: ['#07010F', '#FF2BD6', '#22D3EE'],
  supercar: ['#050505', '#FF5F1F', '#F2F2F2'],
};

/** Color de fondo de cada estilo (meta theme-color y fondo antes de cargar el CSS). */
export const THEME_BG: Record<ThemeId, string> = {
  space: '#05060A',
  sport: '#0A0A0A',
  glass: '#111214',
  grid: '#07010F',
  supercar: '#050505',
};
