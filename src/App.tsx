import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei';
import { Suspense, useMemo } from 'react';

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
  attack1 = 'attack one',
  attack2 = 'attack two',
  roll = 'roll',
}

function App() {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
      { name: Controls.left, keys: ['ArrowLeft', 'KeyQ'] },
      { name: Controls.right, keys: ['ArrowRight', 'KeyE'] },
      { name: Controls.jump, keys: ['Space'] },
      { name: Controls.attack1, keys: ['KeyR'] },
      { name: Controls.attack2, keys: ['KeyF'] },
      { name: Controls.roll, keys: ['KeyC'] },
    ],
    []
  );
  return (
    <KeyboardControls map={map}>
      <Suspense>
        <Canvas
          shadows="soft"
          camera={{ position: [0, 5, 200], fov: 30 }}
        >
          <color
            attach="background"
            args={['skyblue']}
          />
          <Experience />
        </Canvas>
      </Suspense>
    </KeyboardControls>
  );
}

export default App;
