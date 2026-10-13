// Motor del viaje 3D (solo en modo `full`).
//
// Cada estación (<section data-station>) tiene N pantallas (<div data-frame>). En modo 3D la
// estación mide (suma de tramos + 100vh) y su escenario es sticky. Cada pantalla recorre un tramo
// de scroll en tres fases: entra desde el fondo (ENTER), se queda (HOLD + lo que sobresalga si es
// más alta que la pantalla) y pasa de largo hacia la cámara (EXIT).
//
// El motor publica en scroll-store el progreso continuo `g` (pantalla) y `s` (estación), que
// usan las escenas 3D para mover la cámara.

import Lenis from 'lenis';
import { scrollStore, type StationInfo } from './scroll-store';

const ENTER = 0.42; // en alturas de pantalla
const HOLD = 0.36;
const EXIT = 0.42;
const OVERLAP = 0.55; // cuánto se solapa cada estación con la anterior (tramo "vacío" de viaje)
const Z_FAR = -720;
const Z_NEAR = 440;
const FRAME_PAD_TOP = 12; // + --header-h (igual que el CSS de .frame)
const FRAME_PAD_BOTTOM = 56;

interface FrameRec {
  el: HTMLElement;
  inner: HTMLElement;
  station: number;
  index: number;
  start: number;
  enter: number;
  hold: number;
  exit: number;
  len: number;
  overflow: number;
  holdStart: number;
  center: number;
  key: string;
}

interface StationRec {
  el: HTMLElement;
  id: string;
  label: string;
  top: number;
  sticky: number;
  frames: FrameRec[];
}

const root = document.documentElement;
const store = scrollStore.state;
let lenis: Lenis | null = null;
let stations: StationRec[] = [];
let frames: FrameRec[] = [];
let vh = window.innerHeight;
let lastWidth = window.innerWidth;
let enabled = false;
let resizeTimer = 0;
let smoothVelocity = 0;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const wantsFull = () => root.dataset.motion === 'full';

function headerHeight(): number {
  return parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 64;
}

function stageHeight(): number {
  const stage = document.querySelector<HTMLElement>('.station__stage');
  return stage?.clientHeight || window.innerHeight;
}

// --------------------------------------------------------------------------------------------
// Medidas
// --------------------------------------------------------------------------------------------

function measure(): void {
  const stationEls = [...document.querySelectorAll<HTMLElement>('[data-station]')];
  // 1) Escrituras: alturas a cero (una sola invalidación del layout).
  stationEls.forEach((el) => {
    el.style.height = '';
    el.style.marginTop = '';
  });
  // 2) Lecturas: todas las alturas de una vez (un único cálculo de layout).
  vh = stageHeight();
  const avail = vh - (headerHeight() + FRAME_PAD_TOP) - FRAME_PAD_BOTTOM;
  const frameEls = stationEls.map((el) => [...el.querySelectorAll<HTMLElement>('[data-frame]')]);
  const heights = frameEls.map((list) =>
    list.map((fe) => (fe.querySelector<HTMLElement>('.frame__inner') ?? fe).offsetHeight),
  );

  // 3) Cálculo de tramos (sin tocar el DOM).
  stations = [];
  frames = [];
  stationEls.forEach((el, si) => {
    const rec: StationRec = {
      el,
      id: el.dataset.station ?? '',
      label: el.dataset.label ?? '',
      top: 0,
      sticky: 0,
      frames: [],
    };
    let offset = 0;
    frameEls[si].forEach((fe, fi) => {
      const overflow = Math.max(0, Math.ceil(heights[si][fi] - avail));
      const first = si === 0 && fi === 0 && fe.hasAttribute('data-start-visible');
      const last = si === stationEls.length - 1 && fi === frameEls[si].length - 1;
      const enter = first ? 0 : ENTER * vh;
      const hold = HOLD * vh + overflow;
      const exit = last ? 0 : EXIT * vh;
      const f: FrameRec = {
        el: fe,
        inner: fe.querySelector<HTMLElement>('.frame__inner') ?? fe,
        station: si,
        index: frames.length,
        start: offset,
        enter,
        hold,
        exit,
        len: enter + hold + exit,
        overflow,
        holdStart: 0,
        center: 0,
        key: '',
      };
      offset += f.len;
      rec.frames.push(f);
      frames.push(f);
    });
    rec.sticky = offset;
    stations.push(rec);
  });

  // 4) Escrituras: clases y alturas.
  for (const rec of stations) {
    for (const f of rec.frames) f.el.classList.toggle('frame--tall', f.overflow > 0);
    rec.el.style.height = `${Math.round(rec.sticky + vh)}px`;
  }
  stations.forEach((rec, si) => {
    if (si > 0) rec.el.style.marginTop = `${Math.round(-OVERLAP * vh)}px`;
  });

  // 5) Lecturas: posiciones finales.
  const sy = window.scrollY;
  for (const rec of stations) {
    rec.top = rec.el.getBoundingClientRect().top + sy;
    for (const f of rec.frames) {
      f.holdStart = rec.top + f.start + f.enter;
      f.center = f.holdStart + f.hold / 2;
    }
  }

  const infos: StationInfo[] = stations.map((r) => ({
    id: r.id,
    label: r.label,
    firstFrame: r.frames[0]?.index ?? 0,
    frameCount: r.frames.length,
  }));
  store.stations = infos;
  store.frameCount = Math.max(1, frames.length);
  store.frameStation = frames.map((f) => f.station);
  store.layoutVersion++;
  scrollStore.notify();
}

function interpolate(y: number, points: number[]): number {
  const n = points.length;
  if (!n || y <= points[0]) return 0;
  for (let i = 0; i < n - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (y < b) return i + (y - a) / Math.max(1, b - a);
  }
  return n - 1;
}

function yForFrame(g: number): number {
  if (!frames.length) return 0;
  const i = clamp(Math.floor(g), 0, frames.length - 1);
  const j = clamp(i + 1, 0, frames.length - 1);
  const fr = g - Math.floor(g);
  return frames[i].center + (frames[j].center - frames[i].center) * fr;
}

// --------------------------------------------------------------------------------------------
// Actualización por scroll
// --------------------------------------------------------------------------------------------

function apply(f: FrameRec, t: number, ty: number): void {
  const key = `${t.toFixed(3)}|${ty.toFixed(0)}`;
  if (key === f.key) return;
  f.key = key;
  const s = f.el.style;
  let z: number;
  let op: number;
  if (t <= -1) {
    z = Z_FAR;
    op = 0;
  } else if (t < 0) {
    const k = 1 + t; // 0 → 1 al acercarse
    const e = 1 - Math.pow(1 - k, 3);
    z = (1 - e) * Z_FAR;
    op = clamp(k * 1.35 - 0.2, 0, 1);
  } else if (t < 1) {
    z = t * t * t * Z_NEAR + t * 60;
    op = clamp(1 - t * 1.55, 0, 1);
  } else {
    z = Z_NEAR;
    op = 0;
  }
  s.opacity = op.toFixed(3);
  s.transform = `translate3d(0, ${ty.toFixed(1)}px, ${z.toFixed(1)}px)`;
  if (op > 0.5) f.el.setAttribute('data-active', '');
  else f.el.removeAttribute('data-active');
}

function update(y: number, velocity = 0): void {
  for (const rec of stations) {
    const local = y - rec.top;
    for (const f of rec.frames) {
      const p = local - f.start;
      let t: number;
      let ty = 0;
      if (p < 0) {
        t = f.enter === 0 ? 0 : -1;
      } else if (p < f.enter) {
        t = -1 + p / f.enter;
      } else if (p < f.enter + f.hold) {
        t = 0;
        ty = -clamp(p - f.enter - (HOLD * vh) / 2, 0, f.overflow);
      } else if (f.exit > 0 && p < f.len) {
        t = (p - f.enter - f.hold) / f.exit;
        ty = -f.overflow;
      } else {
        t = f.exit > 0 ? 1 : 0;
        ty = -f.overflow;
      }
      apply(f, t, ty);
    }
  }

  const max = Math.max(1, root.scrollHeight - window.innerHeight);
  smoothVelocity += (velocity - smoothVelocity) * 0.18;
  store.y = y;
  store.progress = clamp(y / max, 0, 1);
  store.velocity = smoothVelocity;
  store.g = interpolate(
    y,
    frames.map((f) => f.center),
  );
  store.s = interpolate(
    y,
    stations.map((r) => r.frames[0]?.center ?? r.top),
  );
  const station = frames.length ? frames[clamp(Math.round(store.g), 0, frames.length - 1)].station : 0;
  if (station !== store.station) {
    store.station = station;
    updateNav();
  }
  updateHud();
}

// --------------------------------------------------------------------------------------------
// Navegación, HUD y foco
// --------------------------------------------------------------------------------------------

function updateNav(): void {
  const id = stations[store.station]?.id;
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach((a) => {
    if (a.dataset.nav === id) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

const hud = document.querySelector<HTMLElement>('.hud');
const hudValue = document.querySelector<HTMLElement>('[data-hud-value]');
const hudUnit = document.querySelector<HTMLElement>('[data-hud-unit]');
const hudDefaultUnit = hudUnit?.textContent ?? '';

function updateHud(): void {
  if (!hud || !hudValue || !hudUnit) return;
  const theme = root.dataset.theme;
  let value: string;
  let unit = hudDefaultUnit;
  if (theme === 'sport') {
    value = String(Math.round(store.progress * 400)).padStart(3, '0');
    unit = 'm';
  } else if (theme === 'supercar') {
    value = String(Math.round(Math.min(320, 40 + Math.abs(store.velocity) * 3.2))).padStart(3, '0');
    if (store.progress <= 0.001 && Math.abs(store.velocity) < 0.5) value = '000';
    unit = 'km/h';
  } else {
    value = String(Math.round(store.progress * 100)).padStart(3, '0');
    unit = `% · ${hudDefaultUnit}`;
  }
  if (hudValue.textContent !== value) hudValue.textContent = value;
  if (hudUnit.textContent !== unit) hudUnit.textContent = unit;
  hud.style.setProperty('--hud-progress', store.progress.toFixed(4));
}

/** Posición de scroll del inicio de la estación (su primera pantalla ya quieta). */
function stationTarget(id: string): number | null {
  if (id === 'top' || id === 'hero') return 0;
  const rec = stations.find((r) => r.id === id);
  const f = rec?.frames[0];
  return f ? f.holdStart + 2 : null;
}

export function goTo(id: string, immediate = false): boolean {
  if (!enabled) return false;
  const target = stationTarget(id);
  if (target === null) return false;
  const dist = Math.abs(target - window.scrollY);
  lenis?.scrollTo(target, {
    immediate,
    force: true,
    duration: immediate ? 0 : clamp(0.9 + dist / (vh * 7), 1, 2.8),
    easing: (x: number) => 1 - Math.pow(1 - x, 4),
  });
  return true;
}

/** Estación visible ahora mismo (en cualquiera de los dos modos). */
export function currentStationId(): string {
  if (enabled) return stations[store.station]?.id ?? 'hero';
  const els = [...document.querySelectorAll<HTMLElement>('[data-station]')];
  let id = els[0]?.dataset.station ?? 'hero';
  for (const el of els) {
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.35) id = el.dataset.station ?? id;
  }
  return id;
}

function onClick(e: MouseEvent): void {
  const target = e.target instanceof Element ? e.target : null;
  const link = target?.closest<HTMLElement>('[data-goto]');
  if (!link) return;
  const id = link.dataset.goto ?? '';
  link.closest('details')?.removeAttribute('open');
  if (enabled) {
    e.preventDefault();
    goTo(id);
    const url = id === 'top' || id === 'hero' ? location.pathname + location.search : `#${id}`;
    history.replaceState(null, '', url);
  } else {
    // Maqueta plana: desplazamiento suave nativo (instantáneo con movimiento reducido).
    e.preventDefault();
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    const target = id === 'top' || id === 'hero' ? null : document.getElementById(id);
    if (target) target.scrollIntoView({ behavior });
    else window.scrollTo({ top: 0, behavior });
    const url = target ? `#${id}` : location.pathname + location.search;
    history.replaceState(null, '', url);
  }
}

function offsetWithin(el: HTMLElement, container: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== container) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

function onFocusIn(e: FocusEvent): void {
  if (!enabled || !(e.target instanceof HTMLElement)) return;
  const frameEl = e.target.closest<HTMLElement>('[data-frame]');
  const f = frameEl ? frames.find((x) => x.el === frameEl) : undefined;
  if (!f) return;
  const avail = vh - (headerHeight() + FRAME_PAD_TOP) - FRAME_PAD_BOTTOM;
  const within = f.overflow > 0 ? clamp(offsetWithin(e.target, f.inner) - avail / 3, 0, f.overflow) : 0;
  const target = f.holdStart + (HOLD * vh) / 2 + within;
  if (Math.abs(window.scrollY - target) > 4) lenis?.scrollTo(target, { duration: 0.6, force: true });
}

function onPointer(e: PointerEvent): void {
  store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  store.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
}

// --------------------------------------------------------------------------------------------
// Ciclo de vida
// --------------------------------------------------------------------------------------------

function relayout(): void {
  if (!enabled) return;
  const g = store.g;
  measure();
  const y = g <= 0 ? Math.min(window.scrollY, frames[0]?.center ?? 0) : yForFrame(g);
  lenis?.scrollTo(y, { immediate: true, force: true });
  update(y, 0);
}

function onResize(): void {
  if (!enabled) return;
  const widthChanged = window.innerWidth !== lastWidth;
  // En móvil la barra del navegador cambia la altura al hacer scroll: no recalcular por eso.
  if (!widthChanged && Math.abs(stageHeight() - vh) < 2) return;
  lastWidth = window.innerWidth;
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(relayout, 160);
}

function enable(stationId?: string): void {
  if (enabled || !wantsFull()) return;
  enabled = true;
  root.setAttribute('data-motion-ready', '');
  measure();
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.085,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.15,
  });
  lenis.on('scroll', (l: Lenis) => update(l.scroll, l.velocity));
  store.active = true;
  const hash = location.hash.slice(1);
  const goal = stationId ?? (hash && stations.some((s) => s.id === hash) ? hash : undefined);
  if (goal) goTo(goal, true);
  update(window.scrollY, 0);
  updateNav();
  scrollStore.notify();
}

function disable(): void {
  if (!enabled) return;
  enabled = false;
  lenis?.destroy();
  lenis = null;
  root.removeAttribute('data-motion-ready');
  document.querySelectorAll<HTMLElement>('[data-station]').forEach((el) => {
    el.style.height = '';
    el.style.marginTop = '';
  });
  document.querySelectorAll<HTMLElement>('[data-frame]').forEach((el) => {
    el.style.opacity = '';
    el.style.transform = '';
    el.classList.remove('frame--tall');
    el.removeAttribute('data-active');
  });
  stations = [];
  frames = [];
  store.active = false;
  scrollStore.notify();
}

/** Cambia entre el modo 3D y la vista rápida conservando la sección actual. */
export function setMotion(mode: 'full' | 'flat'): void {
  const id = currentStationId();
  root.dataset.motion = mode;
  if (mode === 'full') {
    enable(id);
  } else {
    disable();
    const el = id === 'hero' ? null : document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    else window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }
  window.dispatchEvent(new CustomEvent('aa:motion', { detail: { mode } }));
}

// Si la página se abrió con #seccion, el navegador puede mover el scroll durante la carga
// (ancla nativa). Hasta que la persona interactúe, se vuelve a colocar en la sección.
let initialHash = location.hash.slice(1);
let userInteracted = false;
['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((type) =>
  window.addEventListener(type, () => (userInteracted = true), { once: true, passive: true }),
);

function settleOnHash(): void {
  if (!enabled || userInteracted || !initialHash) return;
  if (stations.some((s) => s.id === initialHash)) goTo(initialHash, true);
}

function init(): void {
  document.addEventListener('click', onClick);
  document.addEventListener('focusin', onFocusIn);
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('aa:theme', () => {
    updateHud();
    // Cada estilo usa otras fuentes: al cargar, las alturas cambian.
    document.fonts?.ready.then(() => requestAnimationFrame(relayout));
  });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduce.addEventListener('change', () => {
    if (reduce.matches && enabled) setMotion('flat');
  });
  if (wantsFull()) {
    enable();
    document.fonts?.ready.then(() =>
      requestAnimationFrame(() => {
        relayout();
        settleOnHash();
      }),
    );
    window.addEventListener(
      'load',
      () =>
        requestAnimationFrame(() => {
          relayout();
          settleOnHash();
          // Último ajuste por si el ancla nativa llega más tarde.
          setTimeout(() => {
            settleOnHash();
            initialHash = '';
          }, 400);
        }),
      { once: true },
    );
  }
}

init();

// Gancho de depuración (capturas automáticas y consola).
(window as unknown as Record<string, unknown>).__aaMotion = {
  centers: () => frames.map((f) => f.center),
  scrollToY: (y: number) => {
    lenis?.scrollTo(y, { immediate: true, force: true });
    update(y, 0);
  },
  goTo,
};
