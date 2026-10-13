// Estilo "supercar": un superdeportivo conceptual recorre una autopista nocturna al ritmo del
// scroll. Ciudad iluminada a los lados, farolas, tráfico, pórticos con un panel LED por estación
// y una cámara de persecución que cambia de ángulo en cada sección.

import { Environment, Lightformer } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { easing } from 'maath';
import { BlendFunction } from 'postprocessing';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  makeTextTexture,
  seeded,
  smoothstep,
  useAspect,
  useFontReady,
  useLayoutVersion,
  useReadySignal,
  useScrollState,
  type Quality,
  type SceneProps,
} from '@/components/three/shared';
import { Car, WHEEL_RADIUS } from './Car';

const D = 14;
const BG = '#06060a';
const LANE_X = 1.9; // nuestro carril
const ROAD_HALF = 7.6;

export default function SupercarScene({ quality, onReady }: SceneProps) {
  useLayoutVersion();
  const st = useScrollState();
  useReadySignal(onReady);
  const length = st.frameCount * D + 420;

  return (
    <>
      <color attach="background" args={[BG]} />
      <fogExp2 attach="fog" args={[BG, 0.0145]} />
      <NightEnvironment />
      <hemisphereLight args={['#8fa3c7', '#0a0a0c', 0.18]} />
      <Road length={length} />
      <StreetLights length={length} quality={quality} />
      <City length={length} count={quality === 'high' ? 220 : 120} />
      <Traffic count={quality === 'high' ? 22 : 12} />
      <Gantries />
      <Driving />
      <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
        <Bloom mipmapBlur intensity={1.25} luminanceThreshold={0.3} luminanceSmoothing={0.25} radius={0.7} />
        <Noise premultiply blendFunction={BlendFunction.ADD} opacity={0.25} />
        <Vignette offset={0.2} darkness={0.82} />
      </EffectComposer>
    </>
  );
}

// ---- Reflejos nocturnos para la pintura (cubemap generado una vez) --------------------------

function NightEnvironment() {
  return (
    <Environment resolution={128} frames={1}>
      <color attach="background" args={['#05060a']} />
      <Lightformer form="rect" intensity={2.4} color="#ffb766" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[2, 30, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#7fb2ff" position={[-8, 2, 0]} rotation-y={Math.PI / 2} scale={[30, 0.6, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#ff6a2b" position={[8, 1, 0]} rotation-y={-Math.PI / 2} scale={[30, 0.4, 1]} />
      <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 2, -10]} scale={2} />
    </Environment>
  );
}

// ---- Coche + cámara de persecución ---------------------------------------------------------

/** Posición de la cámara (relativa al coche) y punto al que mira, por estación. */
const SHOTS: { pos: [number, number, number]; look: [number, number, number] }[] = [
  { pos: [-4.8, 1.75, 7.2], look: [-1.9, 0.55, -3] }, // hero: tres cuartos trasero
  { pos: [-7.2, 1.15, 1.4], look: [-2.6, 0.55, -0.6] }, // lateral
  { pos: [-3.4, 3.6, 9.2], look: [-1.9, 0.3, -7] }, // persecución alta
  { pos: [-5.6, 0.95, -6.2], look: [-1.4, 0.6, 1.2] }, // tres cuartos delantero
  { pos: [-2.6, 1.25, 7.8], look: [-1.3, 0.75, -4.5] }, // trasera baja
  { pos: [-8.2, 2.4, 3.4], look: [-2.2, 0.5, -1.8] }, // lateral amplio
];

function Driving() {
  const st = useScrollState();
  const aspect = useAspect();
  const car = useRef<THREE.Group>(null);
  const carZ = useRef(0);
  const lastZ = useRef(0);
  const wheelAngle = useRef(0);
  const speed = useRef(0);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const headlight = useRef<THREE.SpotLight>(null);
  const headTarget = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    // El coche avanza con el scroll (suavizado para que acelere y frene).
    easing.damp(carZ, 'current', -st.g * D, 0.35, dt);
    const z = carZ.current;
    const dz = lastZ.current - z;
    lastZ.current = z;
    speed.current = THREE.MathUtils.lerp(speed.current, dz / Math.max(dt, 1e-3), 0.1);
    wheelAngle.current -= dz / WHEEL_RADIUS;

    const g = car.current;
    if (g) {
      g.position.set(LANE_X, 0, z);
      // cabeceo con la aceleración
      g.rotation.x = THREE.MathUtils.clamp(-speed.current * 0.0016, -0.03, 0.03);
      g.children.forEach((child) => {
        if (child.name === 'wheel') child.rotation.x = wheelAngle.current;
      });
    }

    // Plano de cámara según la estación (transición al final de cada una).
    const s = st.s;
    const i = Math.floor(s);
    const f = smoothstep(0.55, 1.0, s - i);
    const a = SHOTS[i % SHOTS.length];
    const b = SHOTS[(i + 1) % SHOTS.length];
    tmpA.set(...a.pos).lerp(tmpB.set(...b.pos), f);
    const narrow = aspect < 0.9 ? 1.35 : 1;
    pos.set(LANE_X + tmpA.x * narrow + st.pointer.x * 0.4, tmpA.y + st.pointer.y * 0.2, z + tmpA.z * narrow);
    tmpA.set(...a.look).lerp(tmpB.set(...b.look), f);
    lookTarget.set(LANE_X + tmpA.x * (aspect < 0.9 ? 0.3 : 1), tmpA.y, z + tmpA.z);
    easing.damp3(state.camera.position, pos, 0.28, dt);
    easing.damp3(look, lookTarget, 0.22, dt);
    state.camera.lookAt(look);

    if (headlight.current) {
      headlight.current.position.set(LANE_X, 0.6, z - 2.2);
      headTarget.position.set(LANE_X, 0, z - 14);
      headTarget.updateMatrixWorld();
    }
  });

  return (
    <>
      <Car ref={car} />
      <spotLight
        ref={headlight}
        target={headTarget}
        color="#e6f2ff"
        intensity={45}
        distance={38}
        angle={0.5}
        penumbra={0.7}
        decay={1.6}
      />
      <primitive object={headTarget} />
    </>
  );
}

// ---- Carretera -----------------------------------------------------------------------------

function Road({ length }: { length: number }) {
  const dashes = useMemo(() => {
    const per = Math.ceil(length / 9);
    const geo = new THREE.PlaneGeometry(0.14, 3.2);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: '#8d8d8d' });
    const mesh = new THREE.InstancedMesh(geo, mat, per * 2);
    const m = new THREE.Matrix4();
    let n = 0;
    for (let i = 0; i < per; i++) {
      for (const x of [-3.8, 3.8]) {
        m.makeTranslation(x, 0.012, 30 - i * 9);
        mesh.setMatrixAt(n++, m);
      }
    }
    return mesh;
  }, [length]);
  useEffect(
    () => () => {
      dashes.geometry.dispose();
      (dashes.material as THREE.Material).dispose();
      dashes.dispose();
    },
    [dashes],
  );
  const zc = -length / 2 + 60;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zc]}>
        <planeGeometry args={[ROAD_HALF * 2 + 1, length + 120]} />
        <meshStandardMaterial color="#101014" roughness={0.62} metalness={0.25} envMapIntensity={0.4} />
      </mesh>
      {/* arcén y terreno */}
      {[-1, 1].map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * (ROAD_HALF + 40), -0.02, zc]}>
          <planeGeometry args={[80, length + 120]} />
          <meshStandardMaterial color="#09090b" roughness={1} />
        </mesh>
      ))}
      <primitive object={dashes} />
      {/* líneas continuas: bordes y doble central */}
      {[-ROAD_HALF, ROAD_HALF, -0.12, 0.12].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.011, zc]}>
          <planeGeometry args={[0.1, length + 120]} />
          <meshBasicMaterial color={Math.abs(x) < 1 ? '#a67c2e' : '#8f8f8f'} />
        </mesh>
      ))}
      {/* biondas */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (ROAD_HALF + 0.9), 0.55, zc]}>
          <boxGeometry args={[0.12, 0.22, length + 120]} />
          <meshStandardMaterial color="#2a2b30" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
    </>
  );
}

// ---- Farolas con charcos de luz --------------------------------------------------------------

function StreetLights({ length, quality }: { length: number; quality: Quality }) {
  const { poles, heads, pools } = useMemo(() => {
    const spacing = 26;
    const n = Math.ceil(length / spacing);
    const poleGeo = new THREE.BoxGeometry(0.16, 7.2, 0.16);
    const armGeo = new THREE.BoxGeometry(2.4, 0.1, 0.12);
    const headGeo = new THREE.BoxGeometry(1.0, 0.12, 0.36);
    const poleMat = new THREE.MeshStandardMaterial({ color: '#1b1c20', metalness: 0.7, roughness: 0.5 });
    const headMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd7a1').multiplyScalar(2.6), toneMapped: false });
    const poles = new THREE.InstancedMesh(poleGeo, poleMat, n * 2);
    const arms = new THREE.InstancedMesh(armGeo, poleMat, n * 2);
    const heads = new THREE.InstancedMesh(headGeo, headMat, n * 2);
    const poolTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const ctx = c.getContext('2d')!;
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(255,255,255,0.8)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const poolGeo = new THREE.PlaneGeometry(9, 9);
    poolGeo.rotateX(-Math.PI / 2);
    const poolMat = new THREE.MeshBasicMaterial({
      map: poolTex,
      color: '#ffb36b',
      transparent: true,
      opacity: quality === 'high' ? 0.26 : 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pools = new THREE.InstancedMesh(poolGeo, poolMat, n * 2);
    const m = new THREE.Matrix4();
    let k = 0;
    for (let i = 0; i < n; i++) {
      for (const s of [-1, 1]) {
        const z = 20 - i * spacing - (s > 0 ? spacing / 2 : 0);
        const x = s * (ROAD_HALF + 1.6);
        m.makeTranslation(x, 3.6, z);
        poles.setMatrixAt(k, m);
        m.makeTranslation(x - s * 1.2, 7.1, z);
        arms.setMatrixAt(k, m);
        m.makeTranslation(x - s * 2.2, 7.0, z);
        heads.setMatrixAt(k, m);
        m.makeTranslation(x - s * 3.2, 0.02, z);
        pools.setMatrixAt(k, m);
        k++;
      }
    }
    const group = new THREE.Group();
    group.add(poles, arms);
    return { poles: group, heads, pools };
  }, [length, quality]);
  useEffect(
    () => () => {
      [poles, heads, pools].forEach((o) =>
        o.traverse((c) => {
          if (c instanceof THREE.Mesh) {
            c.geometry.dispose();
            const mat = c.material as THREE.MeshBasicMaterial;
            mat.map?.dispose();
            mat.dispose();
          }
        }),
      );
    },
    [poles, heads, pools],
  );
  return (
    <>
      <primitive object={poles} />
      <primitive object={heads} />
      <primitive object={pools} />
    </>
  );
}

// ---- Ciudad: edificios con ventanas iluminadas (shader) ------------------------------------

const cityVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying float vSeed;
  #include <fog_pars_vertex>
  void main() {
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    vSeed = float(gl_InstanceID);
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const cityFragment = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying float vSeed;
  #include <fog_pars_fragment>
  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
  void main() {
    vec3 base = vec3(0.016, 0.018, 0.024);
    // ventanas en las caras verticales
    float vertical = 1.0 - abs(vNormalW.y);
    vec2 uv = vec2(vWorld.x + vWorld.z, vWorld.y);
    vec2 cell = floor(uv / vec2(1.3, 1.6));
    vec2 f = fract(uv / vec2(1.3, 1.6));
    float window = step(0.22, f.x) * step(f.x, 0.78) * step(0.25, f.y) * step(f.y, 0.75);
    float lit = step(0.8, hash(vec3(cell, vSeed)));
    float warm = hash(vec3(cell.yx, vSeed + 3.0));
    vec3 lightCol = mix(vec3(1.0, 0.72, 0.42), vec3(0.62, 0.78, 1.0), step(0.6, warm));
    vec3 col = base + window * lit * vertical * lightCol * 0.95;
    gl_FragColor = vec4(col, 1.0);
    #include <fog_fragment>
  }
`;

function City({ length, count }: { length: number; count: number }) {
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog]),
      vertexShader: cityVertex,
      fragmentShader: cityFragment,
      fog: true,
    });
    const im = new THREE.InstancedMesh(geo, mat, count);
    const rnd = seeded(91);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sc = new THREE.Vector3();
    const p = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const w = 6 + rnd() * 14;
      const h = 8 + Math.pow(rnd(), 1.6) * 70;
      const dd = 6 + rnd() * 16;
      p.set(side * (42 + rnd() * 120), 0, 40 - rnd() * (length + 120));
      sc.set(w, h, dd);
      m.compose(p, q, sc);
      im.setMatrixAt(i, m);
    }
    return im;
  }, [length, count]);
  useEffect(
    () => () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      mesh.dispose();
    },
    [mesh],
  );
  return <primitive object={mesh} />;
}

// ---- Tráfico: faros y pilotos que se mueven por su cuenta -----------------------------------

function Traffic({ count }: { count: number }) {
  const cars = useMemo(() => {
    const rnd = seeded(5);
    return Array.from({ length: count }, (_, i) => {
      const oncoming = i % 2 === 0;
      return {
        oncoming,
        x: oncoming ? -1.9 - (rnd() < 0.5 ? 0 : 3.8) : 5.7,
        offset: rnd() * 340,
        speed: oncoming ? 26 + rnd() * 10 : 9 + rnd() * 6,
      };
    });
  }, [count]);
  const { heads, tails } = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.28, 0.12, 0.08);
    const headMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#f2f7ff').multiplyScalar(3), toneMapped: false });
    const tailMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff2a10').multiplyScalar(2.6), toneMapped: false });
    return {
      heads: new THREE.InstancedMesh(geo, headMat, count * 2),
      tails: new THREE.InstancedMesh(geo.clone(), tailMat, count * 2),
    };
  }, [count]);
  useEffect(
    () => () => {
      [heads, tails].forEach((im) => {
        im.geometry.dispose();
        (im.material as THREE.Material).dispose();
        im.dispose();
      });
    },
    [heads, tails],
  );
  const m = useMemo(() => new THREE.Matrix4(), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const camZ = state.camera.position.z;
    let h = 0;
    let tl = 0;
    for (const c of cars) {
      // posición relativa a la cámara, en bucle
      const travel = (c.offset + t * c.speed) % 340;
      const z = c.oncoming ? camZ - 300 + travel : camZ + 30 - travel;
      for (const dx of [-0.6, 0.6]) {
        m.makeTranslation(c.x + dx, 0.62, z);
        if (c.oncoming) heads.setMatrixAt(h++, m);
        else tails.setMatrixAt(tl++, m);
      }
    }
    heads.count = h;
    tails.count = tl;
    heads.instanceMatrix.needsUpdate = true;
    tails.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <primitive object={heads} />
      <primitive object={tails} />
    </>
  );
}

// ---- Pórticos con panel LED por estación ------------------------------------------------

function Gantries() {
  useLayoutVersion();
  const st = useScrollState();
  const fontReady = useFontReady('700 120px "Sora Variable"');
  return (
    <>
      {st.stations.slice(1).map((s, i) => (
        <Gantry
          key={s.id}
          z={-s.firstFrame * D - 10}
          text={`${String(i + 1).padStart(2, '0')}  ${s.label.toUpperCase()}`}
          fontReady={fontReady}
        />
      ))}
    </>
  );
}

function Gantry({ z, text, fontReady }: { z: number; text: string; fontReady: boolean }) {
  const texture = useMemo(
    () =>
      fontReady
        ? makeTextTexture(text, {
            font: '700 120px "Sora Variable"',
            color: '#ffb547',
            glow: 'rgba(255,140,40,0.9)',
            width: 1024,
            height: 220,
            background: '#050505',
            letterSpacing: '10px',
          })
        : null,
    [fontReady, text],
  );
  useEffect(() => () => texture?.dispose(), [texture]);
  const w = ROAD_HALF * 2 + 2.4;
  return (
    <group position={[0, 0, z]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * w) / 2, 3.4, 0]}>
          <boxGeometry args={[0.3, 6.8, 0.3]} />
          <meshStandardMaterial color="#1f2024" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 6.6, 0]}>
        <boxGeometry args={[w + 0.3, 0.45, 0.45]} />
        <meshStandardMaterial color="#1f2024" metalness={0.8} roughness={0.4} />
      </mesh>
      {texture && (
        <mesh position={[LANE_X + 0.6, 5.5, 0.26]}>
          <planeGeometry args={[7.2, 1.55]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
