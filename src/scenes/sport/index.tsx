// Estilo "sport": minimal deportivo-tech. Una pista de atletismo en perspectiva que se recorre
// por la calle 4, con luces de ritmo rojas que van por delante, arcos de cronometraje en cada
// estación con su número pintado en la pista y vallas de líneas finas. Sin brillos (sin bloom).

import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  makeTextTexture,
  useFontReady,
  useLayoutVersion,
  useReadySignal,
  useScrollState,
  type SceneProps,
} from '@/components/three/shared';

const D = 14;
const BG = '#0a0a0a';
const RED = '#e0263f';
const WHITE = '#f5f5f2';
const TRACK_Y = -1.7;
const LANE = 1.22;
const LANES = 8;
const HALF = (LANE * LANES) / 2;
const CAM_X = -HALF + LANE * 3.5; // centro de la calle 4

export default function SportScene({ quality, onReady }: SceneProps) {
  useLayoutVersion();
  const st = useScrollState();
  useReadySignal(onReady);
  const length = st.frameCount * D + 240;

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 16, 120]} />
      <ambientLight intensity={0.6} />
      <CameraRig />
      <Track length={length} />
      <PacerLights length={length} />
      <Infield length={length} quality={quality} />
      <StationMarks />
      <Hurdles />
    </>
  );
}

// ---- Cámara: a la altura de un corredor, con un ligero balanceo al moverse ----------------

function CameraRig() {
  const st = useScrollState();
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(0, TRACK_Y, -20), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const stride = useRef(0);
  useFrame((state, delta) => {
    const speed = Math.min(1, Math.abs(st.velocity) / 28);
    stride.current += delta * (2 + speed * 9);
    const bob = Math.abs(Math.sin(stride.current * 2)) * 0.05 * (0.3 + speed);
    const x = CAM_X + st.pointer.x * 0.25;
    const y = TRACK_Y + 1.35 + bob + st.pointer.y * 0.1;
    target.set(x, y, 6 - st.g * D);
    easing.damp3(state.camera.position, target, 0.14, delta);
    lookTarget.set(x + 1.1, TRACK_Y + 0.75, state.camera.position.z - 22);
    easing.damp3(look, lookTarget, 0.2, delta);
    state.camera.lookAt(look);
  });
  return null;
}

// ---- Pista ---------------------------------------------------------------------------------

const trackVertex = /* glsl */ `
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const trackFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uLine;
  uniform vec3 uRed;
  uniform float uHalf;
  uniform float uLane;
  varying vec3 vWorld;
  #include <fog_pars_fragment>

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float lineAt(float x, float center, float width) {
    float d = abs(x - center);
    float w = fwidth(x) * 1.2;
    return 1.0 - smoothstep(width - w, width + w, d);
  }

  void main() {
    float x = vWorld.x;
    float z = vWorld.z;
    vec3 col = uBase;
    // grano del tartán
    col += (hash(floor(vWorld.xz * 60.0)) - 0.5) * 0.018;

    float inside = step(-uHalf, x) * step(x, uHalf);
    // líneas de calle
    float lines = 0.0;
    for (int i = 1; i < 8; i++) {
      lines = max(lines, lineAt(x, -uHalf + float(i) * uLane, 0.025));
    }
    // Más suaves cerca de la cámara, donde pasan por debajo del texto.
    float near = smoothstep(1.5, 12.0, distance(vWorld.xz, cameraPosition.xz));
    col = mix(col, uLine * 0.62, lines * inside * mix(0.3, 1.0, near));
    // bordes: interior rojo, exterior blanco
    col = mix(col, uRed, lineAt(x, -uHalf, 0.05));
    col = mix(col, uLine, lineAt(x, uHalf, 0.04));
    // marcas cada 10 m en el borde interior
    float tick = (1.0 - step(0.14, fract(z / 10.0))) * step(-uHalf - 0.55, x) * step(x, -uHalf - 0.12);
    col = mix(col, uLine * 0.6, tick);
    // fuera de la pista: más oscuro
    col *= mix(0.55, 1.0, inside);
    // salida en z = 0
    col = mix(col, uLine, (1.0 - step(0.1, abs(z + 0.0))) * inside);

    gl_FragColor = vec4(col, 1.0);
    #include <fog_fragment>
  }
`;

function Track({ length }: { length: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uBase: { value: new THREE.Color('#141414') },
            uLine: { value: new THREE.Color(WHITE) },
            uRed: { value: new THREE.Color(RED) },
            uHalf: { value: HALF },
            uLane: { value: LANE },
          },
        ]),
        vertexShader: trackVertex,
        fragmentShader: trackFragment,
        fog: true,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, TRACK_Y, -length / 2 + 40]}
    >
      <planeGeometry args={[48, length + 80, 1, 1]} />
    </mesh>
  );
}

// ---- Luces de ritmo (tipo Wavelight) en el bordillo interior --------------------------------

const pacerFragment = /* glsl */ `
  uniform float uBand;
  uniform float uTime;
  uniform vec3 uRed;
  varying vec3 vWorld;
  void main() {
    float cell = fract(vWorld.z / 0.5);
    float across = abs(vWorld.x - uHalfX) / 0.06;
    float led = (1.0 - smoothstep(0.18, 0.32, abs(cell - 0.5))) * (1.0 - smoothstep(0.6, 1.0, across));
    float d = vWorld.z - uBand;
    float on = smoothstep(-9.0, -6.5, d) * (1.0 - smoothstep(-1.0, 1.2, d));
    float pulse = 0.85 + 0.15 * sin(uTime * 6.0 - vWorld.z * 0.8);
    vec3 col = uRed * (0.12 + on * 1.25 * pulse);
    gl_FragColor = vec4(col, led * (0.35 + on * 0.65));
  }
`;

function PacerLights({ length }: { length: number }) {
  const st = useScrollState();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uBand: { value: 0 },
          uTime: { value: 0 },
          uRed: { value: new THREE.Color('#ff2a40') },
        },
        defines: {},
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorld = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: pacerFragment.replace('uHalfX', (-HALF - 0.32).toFixed(3)),
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    // La banda de luces va unos metros por delante de la cámara.
    const lead = 4 + Math.min(1, Math.abs(st.velocity) / 30) * 6;
    material.uniforms.uBand.value = state.camera.position.z - lead;
  });
  return (
    <mesh
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[-HALF - 0.32, TRACK_Y + 0.012, -length / 2 + 40]}
    >
      <planeGeometry args={[0.16, length + 80, 1, 1]} />
    </mesh>
  );
}

// ---- Entorno: bordillo, postes, focos ------------------------------------------------------

function Infield({ length, quality }: { length: number; quality: SceneProps['quality'] }) {
  const posts = useMemo(() => {
    const n = Math.ceil(length / 7);
    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.035, 1.1, 0.035),
      new THREE.MeshBasicMaterial({ color: '#3a3a38' }),
      n * 2,
    );
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const z = 20 - i * 7;
      m.setPosition(-HALF - 2.4, TRACK_Y + 0.55, z);
      mesh.setMatrixAt(i * 2, m);
      m.setPosition(HALF + 2.4, TRACK_Y + 0.55, z);
      mesh.setMatrixAt(i * 2 + 1, m);
    }
    return mesh;
  }, [length]);
  const towers = useMemo(() => {
    const n = Math.ceil(length / 46);
    const group = new THREE.Group();
    const poleGeo = new THREE.BoxGeometry(0.12, 16, 0.12);
    const headGeo = new THREE.BoxGeometry(2.6, 1.1, 0.12);
    const poleMat = new THREE.MeshBasicMaterial({ color: '#262624' });
    const headMat = new THREE.MeshBasicMaterial({ color: '#f5f5f2' });
    for (let i = 0; i < n; i++) {
      for (const side of [-1, 1]) {
        const z = -10 - i * 46 - (side > 0 ? 23 : 0);
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(side * (HALF + 13), TRACK_Y + 8, z);
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(side * (HALF + 13), TRACK_Y + 16.3, z);
        head.rotation.y = side * 0.4;
        group.add(pole, head);
      }
    }
    return group;
  }, [length]);
  useEffect(
    () => () => {
      posts.geometry.dispose();
      (posts.material as THREE.Material).dispose();
      posts.dispose();
      towers.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
    },
    [posts, towers],
  );
  return (
    <>
      <primitive object={posts} />
      {quality === 'high' && <primitive object={towers} />}
      {/* barandillas */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (HALF + 2.4), TRACK_Y + 1.1, -length / 2 + 40]}>
          <boxGeometry args={[0.03, 0.03, length + 80]} />
          <meshBasicMaterial color="#5a5a56" />
        </mesh>
      ))}
    </>
  );
}

// ---- Arcos de cronometraje y números pintados en cada estación ----------------------------

function StationMarks() {
  useLayoutVersion();
  const st = useScrollState();
  const fontReady = useFontReady('900 200px "Archivo Variable"');
  const marks = st.stations.slice(1).map((s, i) => ({
    key: s.id,
    // El arco queda justo delante de la cámara al llegar a la estación: se ve al acercarse y
    // se cruza al empezar a leer. El número pintado está unos metros antes.
    z: 6 - s.firstFrame * D - 1,
    number: String(i + 1).padStart(2, '0'),
    label: s.label.toUpperCase(),
  }));
  return (
    <>
      {marks.map((m) => (
        <group key={m.key} position={[0, 0, m.z]}>
          <TimingGate />
          {fontReady && <TrackNumber number={m.number} label={m.label} />}
        </group>
      ))}
    </>
  );
}

function TimingGate() {
  const w = HALF * 2 + 1.2;
  return (
    <group position={[0, TRACK_Y, 0]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (w / 2), 2.1, 0]}>
          <boxGeometry args={[0.07, 4.2, 0.07]} />
          <meshBasicMaterial color={WHITE} />
        </mesh>
      ))}
      <mesh position={[0, 4.2, 0]}>
        <boxGeometry args={[w + 0.07, 0.07, 0.07]} />
        <meshBasicMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, 3.85, 0]}>
        <boxGeometry args={[w * 0.32, 0.22, 0.05]} />
        <meshBasicMaterial color={RED} />
      </mesh>
      {/* línea transversal en la pista */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[HALF * 2, 0.09]} />
        <meshBasicMaterial color={WHITE} />
      </mesh>
    </group>
  );
}

function TrackNumber({ number, label }: { number: string; label: string }) {
  const texture = useMemo(
    () =>
      makeTextTexture([number, label], {
        font: '900 200px "Archivo Variable"',
        fontStretch: 'ultra-expanded',
        color: 'rgba(245,245,242,0.92)',
        width: 1024,
        height: 512,
        letterSpacing: '6px',
      }),
    [number, label],
  );
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[LANE * 2.2, TRACK_Y + 0.008, 7]}>
      <planeGeometry args={[5.2, 2.6]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

// ---- Vallas minimalistas -------------------------------------------------------------------

function Hurdle({ x }: { x: number }) {
  const h = 0.84;
  const w = LANE * 0.86;
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: WHITE }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <group position={[x, TRACK_Y, 0]}>
      <mesh material={mat} position={[0, h, 0]}>
        <boxGeometry args={[w, 0.07, 0.02]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={mat} position={[(s * w) / 2, h / 2, 0]}>
            <boxGeometry args={[0.025, h, 0.025]} />
          </mesh>
          <mesh material={mat} position={[(s * w) / 2, 0.012, 0.22]}>
            <boxGeometry args={[0.025, 0.025, 0.5]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Hurdles() {
  useLayoutVersion();
  const st = useScrollState();
  const firsts = new Set(st.stations.map((s) => s.firstFrame));
  const rows: number[] = [];
  for (let k = 1; k < st.frameCount - 1; k++) if (!firsts.has(k)) rows.push(6 - k * D - 7);
  const lanes = [5, 6, 7];
  return (
    <>
      {rows.map((z) => (
        <group key={z} position={[0, 0, z]}>
          {lanes.map((l) => (
            <Hurdle key={l} x={-HALF + LANE * (l + 0.5)} />
          ))}
        </group>
      ))}
    </>
  );
}
