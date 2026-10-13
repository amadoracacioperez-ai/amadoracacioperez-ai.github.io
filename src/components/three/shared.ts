// Utilidades comunes de las escenas 3D.
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { scrollStore, type ScrollState } from '@/lib/scroll-store';

export type Quality = 'high' | 'low';

export interface SceneProps {
  quality: Quality;
  /** Se llama cuando la escena ya ha pintado (para el fundido de entrada del canvas). */
  onReady: () => void;
}

/** Estado vivo del scroll (leer dentro de useFrame; no provoca renders). */
export function useScrollState(): ScrollState {
  return scrollStore.state;
}

/** Vuelve a renderizar cuando cambia el layout (nº de pantallas, estaciones, etiquetas). */
export function useLayoutVersion(): number {
  return useSyncExternalStore(
    scrollStore.subscribe,
    () => scrollStore.state.layoutVersion,
    () => 0,
  );
}

/** Llama a onReady tras los dos primeros frames pintados. */
export function useReadySignal(onReady: () => void): void {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    frames.current += 1;
    if (frames.current > 2) {
      done.current = true;
      onReady();
    }
  });
}

/** Aspecto de la ventana (para separar los objetos del texto en pantallas estrechas). */
export function useAspect(): number {
  const ref = useRef(typeof window === 'undefined' ? 1.6 : window.innerWidth / window.innerHeight);
  useEffect(() => {
    const on = () => (ref.current = window.innerWidth / window.innerHeight);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return ref.current;
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Generador pseudoaleatorio determinista (mismas posiciones en cada carga). */
export function seeded(seed = 1): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Texturas generadas con canvas ---------------------------------------------------------

/** Punto de luz difuso (para sprites y halos). */
export function makeGlowTexture(size = 128, inner = 'rgba(255,255,255,1)'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export interface TextTextureOptions {
  font: string; // p. ej. '700 120px "Sora Variable"'
  color: string;
  width?: number;
  height?: number;
  align?: CanvasTextAlign;
  stroke?: string;
  strokeWidth?: number;
  glow?: string;
  background?: string;
  letterSpacing?: string;
}

/** Texto pintado en una textura (las fuentes de la web ya están cargadas en el documento). */
export function makeTextTexture(lines: string | string[], o: TextTextureOptions): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = o.width ?? 1024;
  c.height = o.height ?? 256;
  const ctx = c.getContext('2d')!;
  if (o.background) {
    ctx.fillStyle = o.background;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.font = o.font;
  ctx.textAlign = o.align ?? 'center';
  ctx.textBaseline = 'middle';
  if ('letterSpacing' in ctx && o.letterSpacing) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = o.letterSpacing;
  }
  const arr = Array.isArray(lines) ? lines : [lines];
  const x = ctx.textAlign === 'left' ? 24 : ctx.textAlign === 'right' ? c.width - 24 : c.width / 2;
  const lineH = c.height / arr.length;
  arr.forEach((line, i) => {
    const y = lineH * (i + 0.5);
    if (o.glow) {
      ctx.shadowColor = o.glow;
      ctx.shadowBlur = 28;
    }
    if (o.stroke) {
      ctx.lineWidth = o.strokeWidth ?? 3;
      ctx.strokeStyle = o.stroke;
      ctx.strokeText(line, x, y);
    }
    if (o.color !== 'transparent') {
      ctx.fillStyle = o.color;
      ctx.fillText(line, x, y);
    }
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Libera texturas creadas a mano al desmontar. */
export function useDisposable<T extends { dispose: () => void }>(items: T[]): void {
  useEffect(() => () => items.forEach((i) => i.dispose()), [items]);
}
