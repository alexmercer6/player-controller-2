import { OrbitControls } from '@react-three/drei';
import { Ground } from './Ground';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { Environment } from '@react-three/drei';
import { Model } from './Model';
import { CharacterController } from './CharacterController';
import { Color, DirectionalLight, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';

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
      <mesh
        position={[0, 0.8, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
      <mesh
        position={[0, 2, 3]}
        receiveShadow
        castShadow
      >
        <boxGeometry />
        <meshStandardMaterial
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>

      <Ground />
    </>
  );
};

export default Experience;
