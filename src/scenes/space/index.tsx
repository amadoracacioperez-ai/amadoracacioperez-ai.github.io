// Estilo "space": viaje espacial. Estrellas, nebulosas, anillos de luz que se atraviesan en cada
// pantalla, un núcleo de energía en el hero y un planeta al final (contacto).

import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { easing } from 'maath';
import { BlendFunction } from 'postprocessing';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  seeded,
  smoothstep,
  useAspect,
  useLayoutVersion,
  useReadySignal,
  useScrollState,
  type SceneProps,
} from '@/components/three/shared';

const D = 14; // distancia entre pantallas en -Z
const BG = '#05060a';
const CYAN = new THREE.Color('#5eead4');
const VIOLET = new THREE.Color('#8b5cf6');

export default function SpaceScene({ quality, onReady }: SceneProps) {
  useLayoutVersion();
  const st = useScrollState();
  const length = st.frameCount * D + 180;
  useReadySignal(onReady);

  return (
    <>
      <color attach="background" args={[BG]} />
      <fogExp2 attach="fog" args={[BG, 0.012]} />
      <CameraRig />
      <Starfield count={quality === 'high' ? 9000 : 3800} length={length} />
      <WarpStreaks count={quality === 'high' ? 260 : 120} />
      <Nebulae length={length} />
      <Rings />
      <EnergyCore />
      <Planet z={-(st.frameCount - 1) * D - 70} />
      <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
        <Bloom
          mipmapBlur
          intensity={1.1}
          luminanceThreshold={0.16}
          luminanceSmoothing={0.25}
          radius={0.72}
        />
        <Noise premultiply blendFunction={BlendFunction.ADD} opacity={0.32} />
        <Vignette offset={0.22} darkness={0.78} />
      </EffectComposer>
    </>
  );
}

// ---- Cámara ---------------------------------------------------------------------------------

function CameraRig() {
  const st = useScrollState();
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(0, 0, -20), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    const g = st.g;
    const x = -0.9 + Math.sin(g * 0.55) * 0.7 + st.pointer.x * 0.35;
    const y = 0.15 + Math.cos(g * 0.43) * 0.35 + st.pointer.y * 0.22;
    target.set(x, y, 6 - g * D);
    easing.damp3(state.camera.position, target, 0.16, delta);
    lookTarget.set(x * 0.3 + 0.7, y * 0.25, state.camera.position.z - 24);
    easing.damp3(look, lookTarget, 0.22, delta);
    state.camera.lookAt(look);
    state.camera.rotateZ(Math.sin(g * 0.35) * 0.035 - st.pointer.x * 0.02);
  });
  return null;
}

// ---- Estrellas -----------------------------------------------------------------------------

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uWarp;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float depth = -mv.z;
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.8 + aPhase * 0.3) + aPhase * 6.0);
    vAlpha = twinkle * smoothstep(0.4, 5.0, depth) * (1.0 - smoothstep(170.0, 290.0, depth));
    vColor = aColor;
    gl_PointSize = aSize * uPixelRatio * (210.0 / max(depth, 0.1)) * (1.0 + uWarp * 0.5);
    gl_Position = projectionMatrix * mv;
  }
`;

const starFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float a = pow(core, 2.4) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * (0.8 + core * 1.4), a);
  }
`;

function Starfield({ count, length }: { count: number; length: number }) {
  const st = useScrollState();
  const geometry = useMemo(() => {
    const rnd = seeded(7);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = 2.6 + Math.pow(rnd(), 0.55) * 78;
      const a = rnd() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r * 0.72;
      pos[i * 3 + 2] = 24 - rnd() * (length + 60);
      const k = rnd();
      c.set(k < 0.72 ? '#ffffff' : k < 0.86 ? '#7ff5e1' : '#b49cff');
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = 0.35 + Math.pow(rnd(), 3.2) * 2.8;
      phase[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    return g;
  }, [count, length]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uWarp: { value: 0 },
        },
        vertexShader: starVertex,
        fragmentShader: starFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uWarp.value = Math.min(1, Math.abs(st.velocity) / 40);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

// ---- Estelas de velocidad ------------------------------------------------------------------

function WarpStreaks({ count }: { count: number }) {
  const st = useScrollState();
  const camera = useThree((s) => s.camera);
  const streaks = useMemo(() => {
    const rnd = seeded(11);
    return Array.from({ length: count }, () => {
      const r = 2.2 + rnd() * 16;
      const a = rnd() * Math.PI * 2;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.75, z: -rnd() * 90, tint: rnd() };
    });
  }, [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 6), 3));
    const colors = new Float32Array(count * 6);
    const c = new THREE.Color();
    streaks.forEach((s, i) => {
      c.copy(s.tint < 0.5 ? CYAN : VIOLET).multiplyScalar(1.6);
      colors.set([c.r, c.g, c.b, 0, 0, 0], i * 6);
    });
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count, streaks]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const speed = Math.min(1, Math.abs(st.velocity) / 32);
    material.opacity = THREE.MathUtils.lerp(material.opacity, speed * 0.85, 0.12);
    if (material.opacity < 0.01) return;
    const pos = geometry.attributes.position.array as Float32Array;
    const dir = st.velocity >= 0 ? 1 : -1;
    const len = 0.6 + speed * 16;
    const camZ = camera.position.z;
    for (let i = 0; i < count; i++) {
      const s = streaks[i];
      s.z += delta * (18 + speed * 170) * dir;
      if (s.z > 6) s.z -= 96;
      if (s.z < -90) s.z += 96;
      const z = camZ + s.z;
      pos[i * 6] = s.x;
      pos[i * 6 + 1] = s.y;
      pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = s.x;
      pos[i * 6 + 4] = s.y;
      pos[i * 6 + 5] = z - len * dir;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return <lineSegments geometry={geometry} material={material} frustumCulled={false} />;
}

// ---- Nebulosas -----------------------------------------------------------------------------

function makeNebulaTexture(seed: number): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const rnd = seeded(seed);
  for (let i = 0; i < 9; i++) {
    const x = size * (0.3 + rnd() * 0.4);
    const y = size * (0.3 + rnd() * 0.4);
    const r = size * (0.18 + rnd() * 0.32);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${0.22 + rnd() * 0.2})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Nebulae({ length }: { length: number }) {
  const textures = useMemo(() => [makeNebulaTexture(3), makeNebulaTexture(8)], []);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);
  const items = useMemo(() => {
    const rnd = seeded(5);
    return Array.from({ length: 12 }, () => {
      const side = rnd() < 0.5 ? -1 : 1;
      const scale = 50 + rnd() * 70;
      // Lejos del recorrido de la cámara para que nunca la atraviesen.
      return {
        position: [side * (scale / 2 + 12 + rnd() * 30), (rnd() - 0.4) * 40, -rnd() * length] as [
          number,
          number,
          number,
        ],
        scale,
        color: rnd() < 0.5 ? '#2fd4bd' : '#7c4dff',
        opacity: 0.12 + rnd() * 0.12,
        rotation: rnd() * Math.PI * 2,
        tex: rnd() < 0.5 ? 0 : 1,
      };
    });
  }, [length]);
  return (
    <>
      {items.map((n, i) => (
        <sprite key={i} position={n.position} scale={[n.scale, n.scale, 1]}>
          <spriteMaterial
            map={textures[n.tex]}
            color={n.color}
            opacity={n.opacity}
            rotation={n.rotation}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </sprite>
      ))}
    </>
  );
}

// ---- Anillos de luz ------------------------------------------------------------------------

function Rings() {
  useLayoutVersion();
  const st = useScrollState();
  const firsts = new Map(st.stations.map((s, i) => [s.firstFrame, i]));
  const rings = [];
  // Sin anillo en la última pantalla: el destino es el planeta.
  for (let k = 1; k < st.frameCount - 1; k++) {
    const stationIndex = st.frameStation[k] ?? 0;
    const isStation = firsts.has(k);
    rings.push(
      <Ring
        key={k}
        z={-k * D - 6}
        isStation={isStation}
        color={stationIndex % 2 === 0 ? VIOLET : CYAN}
        tilt={((k * 37) % 9) * 0.04 - 0.16}
      />,
    );
  }
  return <>{rings}</>;
}

function Ring({
  z,
  isStation,
  color,
  tilt,
}: {
  z: number;
  isStation: boolean;
  color: THREE.Color;
  tilt: number;
}) {
  const group = useRef<THREE.Group>(null);
  const mats = useRef<THREE.MeshBasicMaterial[]>([]);
  const base = useMemo(() => color.clone().multiplyScalar(isStation ? 1.7 : 1.15), [color, isStation]);
  const radius = isStation ? 4.6 : 3.4;
  const ticks = useMemo(
    () =>
      isStation
        ? Array.from({ length: 36 }, (_, i) => {
            const a = (i / 36) * Math.PI * 2;
            return { x: Math.cos(a) * radius * 1.16, y: Math.sin(a) * radius * 1.16, a };
          })
        : [],
    [isStation, radius],
  );
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.z += delta * (isStation ? 0.06 : -0.04);
    const dist = Math.abs(state.camera.position.z - z);
    const boost = 1 + 0.7 * smoothstep(24, 3, dist);
    for (const m of mats.current) m.color.copy(base).multiplyScalar(boost);
  });
  const setMat = (i: number) => (m: THREE.MeshBasicMaterial | null) => {
    if (m) mats.current[i] = m;
  };
  return (
    <group position={[0.9, 0, z]} rotation={[tilt * 0.5, tilt, 0]}>
      <group ref={group}>
        <mesh>
          <torusGeometry args={[radius, isStation ? 0.035 : 0.018, 12, 220]} />
          <meshBasicMaterial ref={setMat(0)} toneMapped={false} />
        </mesh>
        {isStation && (
          <>
            <mesh>
              <torusGeometry args={[radius * 1.06, 0.012, 8, 220]} />
              <meshBasicMaterial ref={setMat(1)} toneMapped={false} transparent opacity={0.5} />
            </mesh>
            {ticks.map((t, i) => (
              <mesh key={i} position={[t.x, t.y, 0]} rotation={[0, 0, t.a]}>
                <boxGeometry args={[i % 3 === 0 ? 0.42 : 0.18, 0.025, 0.025]} />
                <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.7} />
              </mesh>
            ))}
          </>
        )}
      </group>
    </group>
  );
}

// ---- Núcleo de energía (hero) --------------------------------------------------------------

const fresnelVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fresnelFragment = /* glsl */ `
  uniform vec3 uRim;
  uniform vec3 uCore;
  uniform float uPower;
  uniform float uIntensity;
  uniform float uAlpha;
  uniform float uHalo;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float d = dot(normalize(vNormal), normalize(vView));
    if (!gl_FrontFacing) d = -d;
    d = clamp(d, 0.0, 1.0);
    if (uHalo > 0.5) {
      // Halo: fuerte junto al cuerpo y transparente en el borde exterior.
      float h = pow(d, uPower);
      gl_FragColor = vec4(uRim * uIntensity * h, h * uAlpha);
      return;
    }
    float f = pow(1.0 - d, uPower);
    vec3 col = mix(uCore, uRim, f) * (0.35 + f * uIntensity);
    gl_FragColor = vec4(col, uAlpha);
  }
`;

function useFresnel(
  rim: string,
  core: string,
  power: number,
  intensity: number,
  alpha: number,
  halo = false,
) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uRim: { value: new THREE.Color(rim) },
          uCore: { value: new THREE.Color(core) },
          uPower: { value: power },
          uIntensity: { value: intensity },
          uAlpha: { value: alpha },
          uHalo: { value: halo ? 1 : 0 },
        },
        vertexShader: fresnelVertex,
        fragmentShader: fresnelFragment,
        transparent: true,
        depthWrite: !halo,
        side: halo ? THREE.BackSide : THREE.FrontSide,
        blending: halo ? THREE.AdditiveBlending : THREE.NormalBlending,
      }),
    [rim, core, power, intensity, alpha, halo],
  );
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

function EnergyCore() {
  const aspect = useAspect();
  const spin = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const inner = useFresnel('#7ff5e1', '#1d1450', 2.4, 1.5, 1);
  const halo = useFresnel('#5eead4', '#000000', 2.6, 0.9, 0.55, true);
  const orbit = useMemo(() => {
    const rnd = seeded(21);
    const n = 260;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 2.3 + rnd() * 1.4;
      const a = rnd() * Math.PI * 2;
      const h = (rnd() - 0.5) * 0.5;
      pos.set([Math.cos(a) * r, h, Math.sin(a) * r], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useEffect(() => () => orbit.dispose(), [orbit]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (spin.current) {
      spin.current.rotation.y += delta * 0.22;
      spin.current.rotation.x = Math.sin(t * 0.3) * 0.25;
    }
    if (shell.current) shell.current.scale.setScalar(1 + Math.sin(t * 1.3) * 0.025);
  });

  const narrow = aspect < 0.9;
  return (
    <group position={narrow ? [1.6, -3.1, -9] : [3.6, 0.25, -7]} scale={narrow ? 0.8 : 1}>
      <group ref={spin}>
        <mesh ref={shell}>
          <icosahedronGeometry args={[1.75, 1]} />
          <meshBasicMaterial
            color={CYAN.clone().multiplyScalar(1.5)}
            wireframe
            transparent
            opacity={0.45}
            toneMapped={false}
          />
        </mesh>
        <mesh material={inner}>
          <icosahedronGeometry args={[1.15, 6]} />
        </mesh>
        <mesh material={halo} scale={1.75}>
          <sphereGeometry args={[1.15, 48, 48]} />
        </mesh>
        <group rotation={[0.45, 0, 0.2]}>
          <points geometry={orbit}>
            <pointsMaterial
              size={0.045}
              color={'#b8fff3'}
              transparent
              opacity={0.85}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </points>
        </group>
      </group>
    </group>
  );
}

// ---- Planeta final (contacto) ---------------------------------------------------------------

function Planet({ z }: { z: number }) {
  const body = useFresnel('#5eead4', '#070a1a', 3.4, 1.1, 1);
  const atmosphere = useFresnel('#8b5cf6', '#000000', 3.2, 0.8, 0.5, true);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });
  return (
    <group ref={ref} position={[22, -12, z]}>
      <mesh material={body}>
        <sphereGeometry args={[18, 96, 96]} />
      </mesh>
      <mesh material={atmosphere} scale={1.22}>
        <sphereGeometry args={[18, 64, 64]} />
      </mesh>
    </group>
  );
}
