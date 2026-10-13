// Isla React con el canvas 3D. Solo se monta en modo `full` y si hay WebGL.
// Cada estilo es un chunk aparte (import dinámico): el visitante solo descarga el suyo.
// Al cambiar de estilo, el <Canvas> se vuelve a montar (key) y se liberan todos los recursos.

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, lazy, useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { THEMES, type ThemeId } from '@/config/site';
import type { Quality, SceneProps } from './shared';

type SceneModule = { default: ComponentType<SceneProps> };

const SCENES: Record<ThemeId, () => Promise<SceneModule>> = {
  space: () => import('@/scenes/space'),
  sport: () => import('@/scenes/sport'),
  glass: () => import('@/scenes/glass'),
  grid: () => import('@/scenes/grid'),
  supercar: () => import('@/scenes/supercar'),
};

/** Antialias nativo solo donde no hay posprocesado (el compositor ya hace MSAA). */
const NATIVE_AA: Record<ThemeId, boolean> = {
  space: false,
  sport: true,
  glass: false,
  grid: false,
  supercar: false,
};

const root = () => document.documentElement;

function readTheme(): ThemeId {
  const t = root().dataset.theme as ThemeId | undefined;
  return t && (THEMES as readonly string[]).includes(t) ? t : 'space';
}

function readActive(): boolean {
  return root().dataset.motion === 'full';
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function initialQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  return coarse || weak ? 'low' : 'high';
}

export default function Experience() {
  const [theme, setTheme] = useState<ThemeId>(readTheme);
  const [active, setActive] = useState(readActive);
  const [webgl] = useState(hasWebGL);
  const [quality, setQuality] = useState<Quality>(initialQuality);
  const [ready, setReady] = useState(false);
  // El 3D arranca cuando la página ya ha cargado y el navegador está libre: el texto aparece
  // al instante y el hilo principal queda despejado para la primera interacción.
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const idle = (cb: () => void) => {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(cb, { timeout: 1200 });
      } else {
        setTimeout(cb, 200);
      }
    };
    const arm = () => idle(() => setArmed(true));
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
    return () => window.removeEventListener('load', arm);
  }, []);

  useEffect(() => {
    const onTheme = () => {
      setReady(false);
      setTheme(readTheme());
    };
    const onMotion = () => setActive(readActive());
    window.addEventListener('aa:theme', onTheme);
    window.addEventListener('aa:motion', onMotion);
    return () => {
      window.removeEventListener('aa:theme', onTheme);
      window.removeEventListener('aa:motion', onMotion);
    };
  }, []);

  const Scene = useMemo(() => lazy(SCENES[theme]), [theme]);
  const onReady = useCallback(() => setReady(true), []);

  if (!active || !webgl || !armed) return null;

  return (
    <div className="experience" aria-hidden="true" data-ready={ready ? '' : undefined}>
      <Canvas
        key={theme}
        dpr={[1, quality === 'high' ? 1.75 : 1.25]}
        gl={{
          antialias: NATIVE_AA[theme],
          alpha: false,
          stencil: false,
          powerPreference: 'high-performance',
        }}
        camera={{ fov: 55, near: 0.1, far: 900, position: [0, 0, 6] }}
      >
        <PerformanceMonitor flipflops={2} onDecline={() => setQuality('low')} />
        <Suspense fallback={null}>
          <Scene quality={quality} onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
