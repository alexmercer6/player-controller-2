import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';

export const MovingPlatform = () => {
  const platform = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (platform.current) {
      platform.current.position.y = 4 + Math.sin(clock.elapsedTime * 1) * 2;
    }
  });
  return (
    <mesh
      name="Moving platform"
      ref={platform}
      position={[2, 2, 20]}
    >
      <boxGeometry args={[2, 0.1, 2]} />
      <meshStandardMaterial />
    </mesh>
  );
};
