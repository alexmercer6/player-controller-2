import { OrbitControls } from '@react-three/drei';
import { Ground } from './Ground';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { Environment } from '@react-three/drei';
import { Model } from './Model';
import { CharacterController } from './CharacterController';
import { Color, DirectionalLight, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { MovingPlatform } from './MovingPlatform';

const Experience = () => {
  const dirLight = useRef<DirectionalLight>(null);
  const dirLightTarget = new Vector3();

  useFrame(() => {
    if (dirLight.current) {
      dirLight.current.lookAt(dirLightTarget);
      dirLight.current.shadow.camera.left = -100;
      dirLight.current.shadow.camera.right = 100;
      dirLight.current.shadow.camera.top = 100;
      dirLight.current.shadow.camera.bottom = -100;
      dirLight.current.shadow.mapSize.x = 2048;
      dirLight.current.shadow.mapSize.y = 2048;
    }
  });
  return (
    <>
      <directionalLight
        castShadow
        position={[3.3, 1, 4]}
        intensity={0.8}
      />
      <directionalLight
        castShadow
        position={[0, 150, 0]}
        intensity={0.8}
        ref={dirLight}
      />
      <directionalLight
        castShadow
        position={[-3.3, 1, 4]}
        intensity={0.6}
      />
      <ambientLight />

      <CharacterController />
      {/* Random box */}
      <mesh
        position={[0, 0.8, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>

      <mesh
        position={[5, 7, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2, 1]} />
        <meshStandardMaterial color="purple" />
      </mesh>

      <mesh
        position={[0, 0, 30]}
        receiveShadow
        castShadow
      >
        <boxGeometry />
        <meshStandardMaterial
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>

      {/* Stairs */}
      <group position={[10, 0.5, 0]}>
        <mesh
          position={[10, -0.2, 30]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[2, 0.2, 1]} />
          <meshStandardMaterial
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
        <mesh
          position={[10, 0, 31]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[2, 0.2, 1]} />
          <meshStandardMaterial
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
        <mesh
          position={[10, 0.2, 32]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[2, 0.2, 1]} />
          <meshStandardMaterial
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
        <mesh
          position={[10, 0.4, 33]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[2, 0.2, 1]} />
          <meshStandardMaterial
            color={'grey'}
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
      </group>

      {/* Cones */}
      <mesh
        position={[0, 0, 0]}
        receiveShadow
        castShadow
      >
        <coneGeometry args={[20, 10, 10]} />
        <meshStandardMaterial
          color={'hotpink'}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>

      <mesh
        position={[20, 0, 0]}
        receiveShadow
        castShadow
      >
        <coneGeometry args={[20, 15, 10]} />
        <meshStandardMaterial
          roughness={0.1}
          metalness={0.5}
          color={'limegreen'}
        />
      </mesh>

      <mesh
        position={[40, 0, 0]}
        receiveShadow
        castShadow
      >
        <coneGeometry args={[20, 25, 10]} />
        <meshStandardMaterial
          color={'grey'}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>

      <MovingPlatform />

      <Ground />
    </>
  );
};

export default Experience;
