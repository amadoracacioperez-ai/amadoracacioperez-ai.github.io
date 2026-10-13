// Provisional: la escena "sport" se construye en la fase 5.
import { useReadySignal, type SceneProps } from '@/components/three/shared';

export default function Scene({ onReady }: SceneProps) {
  useReadySignal(onReady);
  return <color attach="background" args={['#0a0a0a']} />;
}
