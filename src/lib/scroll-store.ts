// Estado del scroll compartido entre el motor (motion.ts) y las escenas 3D (React).
// Se guarda en globalThis para que haya una única instancia aunque Vite separe los bundles.
// Las escenas lo leen en cada frame (useFrame) sin re-renderizar React.

export interface StationInfo {
  id: string;
  label: string;
  /** Índice global de su primera pantalla. */
  firstFrame: number;
  frameCount: number;
}

export interface ScrollState {
  /** El motor 3D está activo (modo `full`). */
  active: boolean;
  /** Scroll en px y progreso global 0..1. */
  y: number;
  progress: number;
  /** Velocidad del scroll (px por frame, con signo) y suavizada. */
  velocity: number;
  /** Índice continuo de pantalla (0..frameCount-1) y de estación (0..stations-1). */
  g: number;
  s: number;
  /** Estación actual (la de la pantalla más cercana). */
  station: number;
  frameCount: number;
  stations: StationInfo[];
  /** Estación de cada pantalla (índice global → índice de estación). */
  frameStation: number[];
  /** Ratón normalizado (-1..1). */
  pointer: { x: number; y: number };
  /** Cambia cada vez que se recalcula el layout. */
  layoutVersion: number;
}

type Listener = () => void;

export interface ScrollStore {
  state: ScrollState;
  subscribe(fn: Listener): () => void;
  notify(): void;
}

function createStore(): ScrollStore {
  const state: ScrollState = {
    active: false,
    y: 0,
    progress: 0,
    velocity: 0,
    g: 0,
    s: 0,
    station: 0,
    frameCount: 1,
    stations: [],
    frameStation: [0],
    pointer: { x: 0, y: 0 },
    layoutVersion: 0,
  };
  const listeners = new Set<Listener>();
  return {
    state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    notify() {
      listeners.forEach((fn) => fn());
    },
  };
}

const KEY = '__aaScrollStore';
const g = globalThis as unknown as Record<string, ScrollStore | undefined>;
export const scrollStore: ScrollStore = g[KEY] ?? (g[KEY] = createStore());
