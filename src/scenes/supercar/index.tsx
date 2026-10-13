// Provisional: la escena "supercar" se construye en la fase 5.
import { useReadySignal, type SceneProps } from '@/components/three/shared';

export default function Scene({ onReady }: SceneProps) {
  useReadySignal(onReady);
  return <color attach="background" args={['#050505']} />;
}
