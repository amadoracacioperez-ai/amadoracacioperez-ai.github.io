import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/config/site';
import { ui, type UiKey } from './ui';

export type Localized = Record<Locale, string>;
export type Text = string | Localized;

export const LOCALE_LABEL: Record<Locale, string> = { en: 'EN', fr: 'FR', es: 'ES' };
export const LOCALE_NAME: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
};
export const OG_LOCALE: Record<Locale, string> = { en: 'en_US', fr: 'fr_FR', es: 'es_ES' };

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Devuelve la función t() para un idioma. */
export function useTranslations(lang: Locale) {
  return (key: UiKey): string => ui[lang][key] ?? ui[DEFAULT_LOCALE][key];
}

/** Resuelve un texto que puede ser fijo (string) o traducido ({ en, fr, es }). */
export function tx(value: Text, lang: Locale): string {
  return typeof value === 'string' ? value : (value[lang] ?? value[DEFAULT_LOCALE]);
}

/** Ruta de una página en un idioma: '/' → '/', '/fr/', '/es/'. */
export function localePath(lang: Locale, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === DEFAULT_LOCALE) return clean;
  return `/${lang}${clean}`;
}

/** '2024-01' | '2024' → año. Sin fin → la etiqueta de "actualidad". */
export function formatPeriod(start: string, end: string | undefined, presentLabel: string): string {
  const from = start.slice(0, 4);
  const to = end ? end.slice(0, 4) : presentLabel;
  return from === to ? from : `${from} – ${to}`;
}
