// Estilo "grid": cyber-grid holográfica. Suelo de rejilla infinito, sol de neón en el horizonte,
// montañas wireframe a los lados, monolitos con etiquetas holográficas en cada estación y
// partículas de datos. Bloom, aberración cromática y scanlines sutiles.

import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Scanline,
  Vignette,
} from '@react-three/postprocessing';
import { easing } from 'maath';
import { BlendFunction } from 'postprocessing';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  makeTextTexture,
  seeded,
  useFontReady,
  useLayoutVersion,
  useReadySignal,
  useScrollState,
  type SceneProps,
} from '@/components/three/shared';

const D = 14;
const FLOOR_Y = -2;
const BG = '#07010f';
const HORIZON = new THREE.Color('#2a0a3d');
const MAGENTA = new THREE.Color('#ff2bd6');
const CYAN = new THREE.Color('#22d3ee');

export default function GridScene({ quality, onReady }: SceneProps) {
  useLayoutVersion();
  const st = useScrollState();
  useReadySignal(onReady);
  const length = st.frameCount * D + 320;

  return (
    <>
      <color attach="background" args={[BG]} />
      <CameraRig />
      <SkyGlow />
      <Sun />
      <GridFloor />
      <Mountains length={length} side={-1} />
      <Mountains length={length} side={1} />
      <Monoliths />
      <DataParticles count={quality === 'high' ? 1600 : 700} length={length} />
      <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
        <Bloom mipmapBlur intensity={1.25} luminanceThreshold={0.14} luminanceSmoothing={0.3} radius={0.68} />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0011, 0.0007)}
          radialModulation
          modulationOffset={0.35}
        />
        <Scanline blendFunction={BlendFunction.OVERLAY} density={1.4} opacity={0.08} />
        <Vignette offset={0.2} darkness={0.8} />
      </EffectComposer>
    </>
  );
}

// ---- Cámara ---------------------------------------------------------------------------------

function CameraRig() {
  const st = useScrollState();
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(0, 0, -30), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const roll = useRef(0);
  useFrame((state, delta) => {
    const g = st.g;
    const x = -0.6 + Math.sin(g * 0.42) * 1.1 + st.pointer.x * 0.4;
    const y = FLOOR_Y + 1.75 + Math.sin(g * 0.3) * 0.25 + st.pointer.y * 0.2;
    target.set(x, y, 6 - g * D);
    easing.damp3(state.camera.position, target, 0.16, delta);
    lookTarget.set(x * 0.4 + 1.2, y + 0.9, state.camera.position.z - 30);
    easing.damp3(look, lookTarget, 0.25, delta);
    state.camera.lookAt(look);
    easing.damp(roll, 'current', Math.cos(g * 0.42) * -0.06 - st.pointer.x * 0.03, 0.3, delta);
    state.camera.rotateZ(roll.current);
  });
  return null;
}

// ---- Cielo y sol -----------------------------------------------------------------------------

function SkyGlow() {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTop: { value: new THREE.Color(BG) }, uHorizon: { value: HORIZON } },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uHorizon;
          varying vec3 vDir;
          void main() {
            float h = vDir.y;
            float glow = exp(-abs(h - 0.02) * 9.0);
            vec3 col = mix(uTop, uHorizon, glow);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame((state) => ref.current?.position.copy(state.camera.position));
  return (
    <mesh ref={ref} material={material} renderOrder={-1}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  );
}

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vec2 p = vUv - 0.5;
            float r = length(p);
            float disc = 1.0 - smoothstep(0.49, 0.5, r);
            float y = vUv.y;
            // franjas horizontales en la mitad inferior (cada vez más anchas)
            float band = fract(y * 16.0 + uTime * 0.08);
            float cut = step(y, 0.48) * step(band, mix(0.65, 0.05, y / 0.48));
            vec3 top = vec3(1.0, 0.72, 0.22);
            vec3 bottom = vec3(0.95, 0.08, 0.62);
            vec3 col = mix(bottom, top, smoothstep(0.15, 0.95, y)) * 0.92;
            float a = disc * (1.0 - cut);
            gl_FragColor = vec4(col, a);
          }
        `,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    ref.current?.position.set(26, 24, state.camera.position.z - 260);
  });
  return (
    <mesh ref={ref} material={material}>
      <planeGeometry args={[80, 80]} />
    </mesh>
  );
}

// ---- Suelo de rejilla -------------------------------------------------------------------------

function GridFloor() {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uLine: { value: MAGENTA.clone().multiplyScalar(1.3) },
          uPath: { value: CYAN.clone() },
          uHorizon: { value: HORIZON },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vWorld = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uLine;
          uniform vec3 uPath;
          uniform vec3 uHorizon;
          varying vec3 vWorld;
          float gridLine(vec2 coord) {
            vec2 g = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
            return 1.0 - min(min(g.x, g.y), 1.0);
          }
          void main() {
            vec2 c = vWorld.xz / 2.0;
            float minor = gridLine(c);
            float major = gridLine(c / 5.0);
            float dist = distance(vWorld.xz, cameraPosition.xz);
            float fade = 1.0 - smoothstep(30.0, 170.0, dist);
            vec3 col = uLine * (minor * 0.45 + major * 1.0) * fade;
            // "carril" cian bajo la cámara
            float lane = 1.0 - smoothstep(0.0, 2.6, abs(vWorld.x + 0.4));
            col += uPath * lane * 0.06;
            col = mix(col, uHorizon * 0.6, smoothstep(90.0, 190.0, dist));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
        toneMapped: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame((state) => {
    if (ref.current) ref.current.position.z = state.camera.position.z - 150;
  });
  return (
    <mesh ref={ref} material={material} rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]}>
      <planeGeometry args={[520, 420]} />
    </mesh>
  );
}

// ---- Montañas wireframe ------------------------------------------------------------------------

function Mountains({ length, side }: { length: number; side: -1 | 1 }) {
  const geometry = useMemo(() => {
    const width = 70;
    const segX = 28;
    const segZ = Math.ceil(length / 5);
    const g = new THREE.PlaneGeometry(width, length, segX, segZ);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const rnd = seeded(side > 0 ? 31 : 17);
    const jitter = Array.from({ length: pos.count }, () => rnd());
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i); // -35..35
      const z = pos.getZ(i);
      const d = (x * side + width / 2) / width; // 0 junto al recorrido, 1 lejos
      const ridge =
        (Math.sin(z * 0.06 + d * 4.1) * 0.5 + 0.5) * (Math.sin(z * 0.017 + d * 2.3 + side) * 0.5 + 0.5);
      const h = Math.pow(d, 1.6) * (6 + ridge * 22) + jitter[i] * 1.2 * d;
      pos.setY(i, h);
    }
    g.computeVertexNormals();
    return g;
  }, [length, side]);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: (side > 0 ? MAGENTA : CYAN).clone().multiplyScalar(0.9),
        wireframe: true,
        transparent: true,
        opacity: 0.32,
        fog: false,
      }),
    [side],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[side * (12 + 35), FLOOR_Y - 0.05, -length / 2 + 60]}
    />
  );
}

// ---- Monolitos con etiqueta holográfica ---------------------------------------------------

function Monoliths() {
  useLayoutVersion();
  const st = useScrollState();
  const fontReady = useFontReady('700 120px "Chakra Petch"');
  return (
    <>
      {st.stations.slice(1).map((s, i) => (
        <Monolith
          key={s.id}
          z={6 - s.firstFrame * D - 20}
          number={String(i + 1).padStart(2, '0')}
          label={s.label.toUpperCase()}
          fontReady={fontReady}
          flip={i % 2 === 1}
        />
      ))}
    </>
  );
}

function Monolith({
  z,
  number,
  label,
  fontReady,
  flip,
}: {
  z: number;
  number: string;
  label: string;
  fontReady: boolean;
  flip: boolean;
}) {
  const scan = useRef<THREE.Mesh>(null);
  const edges = useMemo(() => {
    const box = new THREE.BoxGeometry(2.2, 12, 2.2);
    const e = new THREE.EdgesGeometry(box);
    box.dispose();
    return e;
  }, []);
  const small = useMemo(() => {
    const box = new THREE.BoxGeometry(1.4, 7, 1.4);
    const e = new THREE.EdgesGeometry(box);
    box.dispose();
    return e;
  }, []);
  const texture = useMemo(
    () =>
      fontReady
        ? makeTextTexture([`// ${number}`, label], {
            font: '700 120px "Chakra Petch"',
            color: '#c9f6ff',
            glow: 'rgba(34,211,238,0.9)',
            width: 1024,
            height: 384,
            align: 'left',
            letterSpacing: '8px',
          })
        : null,
    [fontReady, number, label],
  );
  useEffect(() => () => edges.dispose(), [edges]);
  useEffect(() => () => small.dispose(), [small]);
  useEffect(() => () => texture?.dispose(), [texture]);
  useFrame((state) => {
    if (scan.current) scan.current.position.y = FLOOR_Y + 6 + Math.sin(state.clock.elapsedTime * 0.9 + z) * 5.5;
  });
  const x = flip ? 10.5 : 8.5;
  return (
    <group position={[0, 0, z]}>
      <lineSegments geometry={edges} position={[x, FLOOR_Y + 6, 0]}>
        <lineBasicMaterial color={CYAN.clone().multiplyScalar(2)} toneMapped={false} />
      </lineSegments>
      <mesh ref={scan} position={[x, FLOOR_Y + 6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshBasicMaterial
          color={CYAN.clone().multiplyScalar(1.6)}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={small} position={[-11, FLOOR_Y + 3.5, -6]}>
        <lineBasicMaterial color={MAGENTA.clone().multiplyScalar(2)} toneMapped={false} />
      </lineSegments>
      {texture && (
        <mesh position={[x - 4.2, FLOOR_Y + 4.8, 1.5]} rotation={[0, -0.4, 0]}>
          <planeGeometry args={[6.4, 2.4]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

// ---- Partículas de datos ---------------------------------------------------------------------

function DataParticles({ count, length }: { count: number; length: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const rnd = seeded(77);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 60;
      pos[i * 3 + 1] = FLOOR_Y + rnd() * 18;
      pos[i * 3 + 2] = 20 - rnd() * length;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, length]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] += delta * 0.35;
      if (arr[i] > FLOOR_Y + 18) arr[i] = FLOOR_Y;
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        color={CYAN.clone().multiplyScalar(1.4)}
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
