// Superdeportivo conceptual generado por código (sin modelos externos ni licencias):
// carrocería extruida a partir del perfil lateral, cúpula de cristal tintado, ruedas con aro
// luminoso, barras de luz delante y detrás y luz bajo el coche.

import { forwardRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

export const WHEEL_RADIUS = 0.36;
const WHEELBASE = 2.76;
const TRACK = 1.72;
const BODY_WIDTH = 1.86;

/** Perfil lateral de la carrocería (x = largo, delante en +x; y = alto). */
function bodyShape(): THREE.Shape {
  const s = new THREE.Shape();
  const arch = (cx: number, from: number, to: number, pts: THREE.Vector2[]) => {
    const r = 0.44;
    const cy = WHEEL_RADIUS;
    for (let i = 0; i <= 14; i++) {
      const a = from + ((to - from) * i) / 14;
      pts.push(new THREE.Vector2(cx + Math.cos(a) * r, Math.max(0.2, cy + Math.sin(a) * r)));
    }
  };
  const front = WHEELBASE / 2;
  const rear = -WHEELBASE / 2;
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(-2.3, 0.3), // paragolpes trasero
    new THREE.Vector2(-2.36, 0.56),
    new THREE.Vector2(-2.3, 0.8), // labio del alerón
    new THREE.Vector2(-1.6, 0.86),
    new THREE.Vector2(-0.4, 0.86),
    new THREE.Vector2(0.95, 0.84), // línea de cintura
    new THREE.Vector2(1.55, 0.74),
    new THREE.Vector2(2.08, 0.6), // capó
    new THREE.Vector2(2.34, 0.46), // morro
    new THREE.Vector2(2.36, 0.3),
    new THREE.Vector2(2.2, 0.2), // splitter
  ];
  // bajos de delante hacia atrás, con los pasos de rueda
  arch(front, 0, Math.PI, pts);
  arch(rear, 0, Math.PI, pts);
  pts.push(new THREE.Vector2(-2.12, 0.2));
  s.setFromPoints(pts);
  return s;
}

function canopyShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.setFromPoints([
    new THREE.Vector2(-1.35, 0.84),
    new THREE.Vector2(-0.62, 1.1),
    new THREE.Vector2(0.18, 1.15),
    new THREE.Vector2(0.72, 1.02),
    new THREE.Vector2(1.26, 0.8),
  ]);
  return s;
}

function extrude(shape: THREE.Shape, depth: number, bevel: number): THREE.ExtrudeGeometry {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.6,
    bevelSegments: 4,
    curveSegments: 12,
  });
  g.translate(0, 0, -depth / 2);
  g.rotateY(Math.PI / 2); // delante (+x) → -z
  g.computeVertexNormals();
  return g;
}

export interface CarHandles {
  wheels: THREE.Group[];
}

export const Car = forwardRef<THREE.Group, { paint?: string }>(function Car(
  { paint = '#ff5a1f' },
  ref,
) {
  const parts = useMemo(() => {
    const body = extrude(bodyShape(), BODY_WIDTH - 0.24, 0.12);
    const canopy = extrude(canopyShape(), 1.28, 0.1);
    const tire = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, 0.3, 36);
    tire.rotateZ(Math.PI / 2);
    const rim = new THREE.CylinderGeometry(0.26, 0.26, 0.31, 24);
    rim.rotateZ(Math.PI / 2);
    const ring = new THREE.TorusGeometry(0.255, 0.012, 8, 48);
    ring.rotateY(Math.PI / 2);
    const spoke = new THREE.BoxGeometry(0.32, 0.03, 0.5);
    const glow = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const ctx = c.getContext('2d')!;
      const gr = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,0.9)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, 128, 128);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    return { body, canopy, tire, rim, ring, spoke, glow };
  }, []);

  const mats = useMemo(
    () => ({
      paint: new THREE.MeshPhysicalMaterial({
        color: paint,
        metalness: 0.6,
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.4,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#07090d',
        metalness: 0.4,
        roughness: 0.05,
        clearcoat: 1,
        envMapIntensity: 2.2,
      }),
      carbon: new THREE.MeshStandardMaterial({ color: '#0d0d10', metalness: 0.5, roughness: 0.45 }),
      tire: new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.9 }),
      rim: new THREE.MeshStandardMaterial({ color: '#1c1d22', metalness: 0.9, roughness: 0.25 }),
      ring: new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff6a2b').multiplyScalar(2.2), toneMapped: false }),
      front: new THREE.MeshBasicMaterial({ color: new THREE.Color('#e8f6ff').multiplyScalar(3), toneMapped: false }),
      rear: new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff2a10').multiplyScalar(3), toneMapped: false }),
      under: new THREE.MeshBasicMaterial({
        map: parts.glow,
        color: '#ff5a1f',
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    }),
    [paint, parts.glow],
  );

  useEffect(
    () => () => {
      Object.values(parts).forEach((p) => p.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [parts, mats],
  );

  const wheelPos: [number, number, number][] = [
    [TRACK / 2, WHEEL_RADIUS, -WHEELBASE / 2],
    [-TRACK / 2, WHEEL_RADIUS, -WHEELBASE / 2],
    [TRACK / 2, WHEEL_RADIUS, WHEELBASE / 2],
    [-TRACK / 2, WHEEL_RADIUS, WHEELBASE / 2],
  ];

  return (
    <group ref={ref}>
      <group name="body">
        <mesh geometry={parts.body} material={mats.paint} />
        <mesh geometry={parts.canopy} material={mats.glass} />
        {/* alerón */}
        <mesh material={mats.carbon} position={[0, 0.98, 2.12]}>
          <boxGeometry args={[1.9, 0.04, 0.32]} />
        </mesh>
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} material={mats.carbon} position={[x, 0.9, 2.12]}>
            <boxGeometry args={[0.05, 0.14, 0.12]} />
          </mesh>
        ))}
        {/* difusor y faldones */}
        <mesh material={mats.carbon} position={[0, 0.24, 1.95]}>
          <boxGeometry args={[1.7, 0.08, 0.5]} />
        </mesh>
        {[-1, 1].map((sx) => (
          <mesh key={sx} material={mats.carbon} position={[(sx * BODY_WIDTH) / 2, 0.25, 0]}>
            <boxGeometry args={[0.06, 0.1, 2.0]} />
          </mesh>
        ))}
        {/* luces */}
        <mesh material={mats.front} position={[0, 0.56, -2.24]}>
          <boxGeometry args={[1.5, 0.03, 0.05]} />
        </mesh>
        {[-0.7, 0.7].map((x) => (
          <mesh key={x} material={mats.front} position={[x, 0.5, -2.22]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]}>
            <boxGeometry args={[0.32, 0.025, 0.05]} />
          </mesh>
        ))}
        <mesh material={mats.rear} position={[0, 0.72, 2.37]}>
          <boxGeometry args={[1.74, 0.05, 0.03]} />
        </mesh>
        {[-1, 1].map((sx) => (
          <mesh key={sx} material={mats.ring} position={[(sx * (BODY_WIDTH + 0.02)) / 2, 0.36, 0]}>
            <boxGeometry args={[0.01, 0.015, 1.6]} />
          </mesh>
        ))}
      </group>
      {wheelPos.map((p, i) => (
        <group key={i} position={p} name="wheel">
          <mesh geometry={parts.tire} material={mats.tire} />
          <mesh geometry={parts.rim} material={mats.rim} />
          <mesh geometry={parts.ring} material={mats.ring} position={[p[0] > 0 ? 0.16 : -0.16, 0, 0]} />
          {[0, 1, 2].map((k) => (
            <mesh
              key={k}
              geometry={parts.spoke}
              material={mats.rim}
              position={[p[0] > 0 ? 0.12 : -0.12, 0, 0]}
              rotation={[(k * Math.PI) / 3, 0, 0]}
              scale={[0.2, 1, 1]}
            />
          ))}
        </group>
      ))}
      <mesh material={mats.under} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[3.4, 6.2]} />
      </mesh>
    </group>
  );
});
