import { Box } from '@react-three/drei';
import React, { useEffect, useRef } from 'react';
import {
  BoxGeometry,
  Mesh,
  RepeatWrapping,
  TextureLoader,
  sRGBEncoding,
} from 'three';

export const Ground = () => {
  const ground = useRef<Mesh>(null);
  const loader = new TextureLoader();
  const floorTexture = loader.load('/textures/floor.png');
  floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
  floorTexture.repeat.set(100, 100);
  // floorTexture.anisotropy = 16;
  // floorTexture.encoding = sRGBEncoding;

  return (
    <mesh
      userData={{ ground: true }}
      ref={ground}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1, 0]}
      receiveShadow={true}
      name="Ground"
    >
      <planeGeometry args={[100, 100, 100]} />
      <meshStandardMaterial
        clipShadows={false}
        map={floorTexture}
      />
    </mesh>
  );
};
