// Estilo "glass": cristal y cromo. Un estudio en grafito con luz de estudio generada
// (Lightformers, sin descargar HDR), suelo brillante y una escultura de vidrio o cromo por
// estación. La cámara se desliza entre ellas.

import { Environment, Float, Lightformer, MeshTransmissionMaterial, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { easing } from 'maath';
import { BlendFunction } from 'postprocessing';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import {
  useAspect,
  useLayoutVersion,
  useReadySignal,
  useScrollState,
  type Quality,
  type SceneProps,
} from '@/components/three/shared';

const D = 14;
const BG = '#111214';
const FLOOR_Y = -2.6;

export default function GlassScene({ quality, onReady }: SceneProps) {
  useLayoutVersion();
  const st = useScrollState();
  useReadySignal(onReady);
  const length = st.frameCount * D + 200;

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 22, 95]} />
      <Studio quality={quality} />
      <hemisphereLight args={['#ffffff', '#202226', 0.7]} />
      <directionalLight position={[6, 9, 4]} intensity={1.6} />
      <CameraRig />
      <Floor length={length} />
      <Sculptures quality={quality} />
      <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
        <Bloom mipmapBlur intensity={0.5} luminanceThreshold={0.82} luminanceSmoothing={0.2} />
        <Noise premultiply blendFunction={BlendFunction.ADD} opacity={0.22} />
        <Vignette offset={0.25} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

// ---- Luz de estudio (cubemap generado una vez) ----------------------------------------------

function Studio({ quality }: { quality: Quality }) {
  return (
    <Environment resolution={quality === 'high' ? 256 : 128} frames={1}>
      <color attach="background" args={['#24272c']} />
      <Lightformer form="rect" intensity={5} position={[0, 6, -6]} scale={[16, 1.6, 1]} />
      <Lightformer
        form="rect"
        intensity={3.5}
        color="#d8f1ff"
        position={[-9, 1.5, -1]}
        rotation-y={Math.PI / 2}
        scale={[12, 2.6, 1]}
      />
      <Lightformer
        form="rect"
        intensity={4}
        position={[9, 2, 1]}
        rotation-y={-Math.PI / 2}
        scale={[12, 1.6, 1]}
      />
      <Lightformer form="ring" intensity={4} position={[0, 3, 9]} scale={3.5} />
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#b9e6ff"
        position={[0, -4, 0]}
        rotation-x={Math.PI / 2}
        scale={[20, 20, 1]}
      />
    </Environment>
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
    const x = -0.7 + Math.sin(g * 0.5) * 0.5 + st.pointer.x * 0.3;
    const y = 0.45 + Math.cos(g * 0.38) * 0.3 + st.pointer.y * 0.18;
    target.set(x, y, 6 - g * D);
    easing.damp3(state.camera.position, target, 0.2, delta);
    lookTarget.set(x + 1.4, y * 0.2 - 0.1, state.camera.position.z - 18);
    easing.damp3(look, lookTarget, 0.25, delta);
    state.camera.lookAt(look);
  });
  return null;
}

// ---- Suelo brillante y barras de luz ---------------------------------------------------------

function Floor({ length }: { length: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, -length / 2 + 40]}>
      <planeGeometry args={[160, length + 80]} />
      <meshStandardMaterial color="#121316" metalness={0.55} roughness={0.32} envMapIntensity={0.6} />
    </mesh>
  );
}

// ---- Materiales ---------------------------------------------------------------------------

function useGlass() {
  const m = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f4f8ff',
        metalness: 0,
        roughness: 0.04,
        transmission: 1,
        thickness: 1.2,
        ior: 1.5,
        attenuationColor: new THREE.Color('#b9e6ff'),
        attenuationDistance: 2.5,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.4,
        specularIntensity: 1,
      }),
    [],
  );
  useEffect(() => () => m.dispose(), [m]);
  return m;
}

function useChrome(roughness = 0.06, tint = '#ffffff') {
  const m = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: tint,
        metalness: 1,
        roughness,
        envMapIntensity: 1.6,
      }),
    [roughness, tint],
  );
  useEffect(() => () => m.dispose(), [m]);
  return m;
}

// ---- Esculturas por estación ---------------------------------------------------------------

function Sculptures({ quality }: { quality: Quality }) {
  useLayoutVersion();
  const st = useScrollState();
  const aspect = useAspect();
  const narrow = aspect < 0.9;
  const x = narrow ? 1.6 : 4.8;
  const y = narrow ? -1.6 : 0.6;
  const zOf = (frame: number) => 6 - frame * D - 15;
  const kinds = st.stations.map((s) => s.id);
  return (
    <>
      {st.stations.map((s, i) => {
        const z = zOf(s.firstFrame);
        const pos: [number, number, number] = [x, y, z];
        switch (kinds[i]) {
          case 'hero':
            return <HeroKnot key={s.id} position={pos} quality={quality} />;
          case 'about':
            return <ChromeSpheres key={s.id} position={pos} />;
          case 'journey':
            return (
              <GlassPanes
                key={s.id}
                firstFrame={s.firstFrame}
                count={s.frameCount}
                x={x}
                y={y}
                zOf={zOf}
              />
            );
          case 'milestones':
            return <Trophies key={s.id} position={pos} />;
          case 'projects':
            return <CubeCluster key={s.id} position={pos} />;
          case 'contact':
            return <FinalRing key={s.id} position={[x - 0.6, y + 0.2, z + 2]} />;
          default:
            return null;
        }
      })}
    </>
  );
}

function Spin({ children, speed = 0.2 }: { children: ReactNode; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  const st = useScrollState();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * speed + st.g * 0.5;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.7) * 0.25;
  });
  return <group ref={ref}>{children}</group>;
}

function HeroKnot({ position, quality }: { position: [number, number, number]; quality: Quality }) {
  const glass = useGlass();
  return (
    <group position={position}>
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <Spin speed={0.18}>
          {quality === 'high' ? (
            <mesh>
              <torusKnotGeometry args={[1.25, 0.42, 220, 36]} />
              <MeshTransmissionMaterial
                backside
                samples={6}
                resolution={512}
                thickness={0.9}
                roughness={0.04}
                chromaticAberration={0.08}
                anisotropy={0.25}
                distortion={0.2}
                distortionScale={0.35}
                temporalDistortion={0.06}
                ior={1.45}
                color="#eef6ff"
              />
            </mesh>
          ) : (
            <mesh material={glass}>
              <torusKnotGeometry args={[1.25, 0.42, 160, 28]} />
            </mesh>
          )}
        </Spin>
      </Float>
    </group>
  );
}

function ChromeSpheres({ position }: { position: [number, number, number] }) {
  const chrome = useChrome(0.05);
  const satin = useChrome(0.28, '#d6dde4');
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.25;
  });
  return (
    <group position={position}>
      <Float speed={1} floatIntensity={0.5}>
        <mesh material={chrome}>
          <sphereGeometry args={[1.05, 64, 64]} />
        </mesh>
        <group ref={ref}>
          <mesh material={satin} position={[1.9, 0.6, 0]}>
            <sphereGeometry args={[0.42, 48, 48]} />
          </mesh>
          <mesh material={chrome} position={[-1.5, -0.7, 0.6]}>
            <sphereGeometry args={[0.28, 48, 48]} />
          </mesh>
          <mesh material={satin} position={[0, 1.4, -1.2]}>
            <torusGeometry args={[1.8, 0.02, 12, 160]} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

function GlassPanes({
  firstFrame,
  count,
  x,
  y,
  zOf,
}: {
  firstFrame: number;
  count: number;
  x: number;
  y: number;
  zOf: (f: number) => number;
}) {
  const glass = useGlass();
  const edge = useChrome(0.12);
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const z = zOf(firstFrame + i);
        const tilt = (i % 2 === 0 ? 1 : -1) * 0.35;
        return (
          <group key={i} position={[x + (i % 2) * 0.6, y + 0.2, z]} rotation={[0, tilt, 0.08 * tilt]}>
            <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
              <RoundedBox args={[2.2, 3, 0.16]} radius={0.07} smoothness={4} material={glass} />
              <mesh material={edge} position={[0, -1.62, 0]}>
                <boxGeometry args={[2.3, 0.06, 0.06]} />
              </mesh>
            </Float>
          </group>
        );
      })}
    </>
  );
}

function Trophies({ position }: { position: [number, number, number] }) {
  const chrome = useChrome(0.05);
  const glass = useGlass();
  return (
    <group position={position}>
      <Float speed={1.1} floatIntensity={0.5}>
        <Spin speed={0.15}>
          <mesh material={glass} position={[0, 0.3, 0]}>
            <icosahedronGeometry args={[1.05, 0]} />
          </mesh>
          {[-1.6, 1.6].map((dx, i) => (
            <mesh key={i} material={chrome} position={[dx, -0.4 + i * 0.5, 0.2]}>
              <capsuleGeometry args={[0.28, 1.1 + i * 0.4, 12, 32]} />
            </mesh>
          ))}
        </Spin>
      </Float>
    </group>
  );
}

function CubeCluster({ position }: { position: [number, number, number] }) {
  const glass = useGlass();
  const chrome = useChrome(0.08);
  const cubes = useMemo(
    () => [
      { p: [0, 0, 0], s: 1.2, m: 'g' },
      { p: [1.5, 0.9, -0.6], s: 0.75, m: 'c' },
      { p: [-1.3, -0.8, 0.4], s: 0.85, m: 'g' },
      { p: [1.1, -1.1, 0.8], s: 0.5, m: 'c' },
      { p: [-0.9, 1.2, -0.9], s: 0.55, m: 'g' },
    ],
    [],
  );
  return (
    <group position={position}>
      <Float speed={1.2} floatIntensity={0.5}>
        <Spin speed={0.12}>
          {cubes.map((c, i) => (
            <RoundedBox
              key={i}
              args={[c.s, c.s, c.s]}
              radius={c.s * 0.12}
              smoothness={4}
              position={c.p as [number, number, number]}
              rotation={[i * 0.4, i * 0.7, 0]}
              material={c.m === 'g' ? glass : chrome}
            />
          ))}
        </Spin>
      </Float>
    </group>
  );
}

function FinalRing({ position }: { position: [number, number, number] }) {
  const glass = useGlass();
  const chrome = useChrome(0.04);
  return (
    <group position={position}>
      <Float speed={0.9} floatIntensity={0.4}>
        <Spin speed={0.1}>
          <mesh material={glass}>
            <torusGeometry args={[1.9, 0.38, 48, 160]} />
          </mesh>
        </Spin>
        <mesh material={chrome}>
          <sphereGeometry args={[0.7, 64, 64]} />
        </mesh>
      </Float>
    </group>
  );
}
