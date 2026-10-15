// Interacciones de la interfaz: vista rápida, selector de estilo (?preview), email y enlaces de
// idioma que conservan la sección actual.

import { ACTIVE_THEMES, type ThemeId } from '@/config/site';
import { currentStationId, setMotion } from './motion';

const root = document.documentElement;

function store(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* almacenamiento no disponible: no pasa nada */
  }
}

// ---- Vista rápida ---------------------------------------------------------------------------

function syncViewToggles(): void {
  const flat = root.dataset.motion === 'flat';
  document.querySelectorAll('[data-view-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(flat));
  });
}

document.querySelectorAll<HTMLButtonElement>('[data-view-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const next = root.dataset.motion === 'flat' ? 'full' : 'flat';
    store('aa-view', next === 'flat' ? 'quick' : 'full');
    btn.closest('details')?.removeAttribute('open');
    setMotion(next);
    syncViewToggles();
  });
});
syncViewToggles();

// ---- Selector de estilo ---------------------------------------------------------------------

function setTheme(theme: ThemeId): void {
  if (root.dataset.theme === theme) return;
  root.dataset.theme = theme;
  store('aa-theme', theme);
  syncThemeButtons();
  window.dispatchEvent(new CustomEvent('aa:theme', { detail: { theme } }));
}

function syncThemeButtons(): void {
  document.querySelectorAll<HTMLElement>('[data-theme-choice]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.themeChoice === root.dataset.theme));
  });
}

document.querySelectorAll<HTMLElement>('[data-theme-choice]').forEach((btn) => {
  btn.addEventListener('click', () => setTheme(btn.dataset.themeChoice as ThemeId));
});
syncThemeButtons();

const picker = document.querySelector<HTMLElement>('[data-theme-picker]');
picker?.querySelector('[data-theme-picker-toggle]')?.addEventListener('click', (e) => {
  const btn = e.currentTarget as HTMLElement;
  const collapsed = picker.toggleAttribute('data-collapsed');
  btn.setAttribute('aria-expanded', String(!collapsed));
  btn.textContent = collapsed ? '+' : '–';
});

window.addEventListener('keydown', (e) => {
  if (!root.hasAttribute('data-preview') || e.metaKey || e.ctrlKey || e.altKey) return;
  const el = e.target as HTMLElement | null;
  if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
  const n = Number(e.key);
  if (n >= 1 && n <= ACTIVE_THEMES.length) setTheme(ACTIVE_THEMES[n - 1]);
});

// ---- Email (se monta en el navegador para evitar bots) ---------------------------------------

document.querySelectorAll<HTMLAnchorElement>('[data-email-user]').forEach((a) => {
  const address = `${a.dataset.emailUser}@${a.dataset.emailDomain}`;
  a.href = `mailto:${address}`;
  const text = a.querySelector('[data-email-text]');
  if (text) text.textContent = address;
});

// ---- Idioma: conservar la sección al cambiar ----------------------------------------------

document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]').forEach((a) => {
  a.addEventListener('click', () => {
    const id = currentStationId();
    const base = a.href.split('#')[0];
    a.href = id && id !== 'hero' ? `${base}#${id}` : base;
  });
});
