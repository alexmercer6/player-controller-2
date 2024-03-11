import { Box } from '@react-three/drei';
import React, { useEffect, useRef } from 'react';
import {
  BoxGeometry,
  CanvasTexture,
  ClampToEdgeWrapping,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  sRGBEncoding,
} from 'three';
import { generateHeight } from '../utils/generateHeight';
import { useThree } from '@react-three/fiber';
import { generateTexture } from '../utils/generateTexture';

export const Ground = () => {
  const ground = useRef<Mesh>(null);
  const loader = new TextureLoader();
  const floorTexture = loader.load('/textures/floor.png');
  floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
  floorTexture.repeat.set(100, 100);

  const worldWidth = 60,
    worldDepth = 60,
    worldHalfWidth = worldWidth / 2,
    worldHalfDepth = worldDepth / 2;
  let texture;

  const { scene } = useThree();

  //const texture = new THREE.TextureLoader().load("img/grid.png")
  const heightMap = loader.load('/textures/Heightmap.png');
  // floorTexture.anisotropy = 16;
  // floorTexture.encoding = sRGBEncoding;

  const data = generateHeight(worldWidth, worldDepth);

  const geometry = new PlaneGeometry(
    7500,
    7500,
    worldWidth - 1,
    worldDepth - 1
  );
  geometry.rotateX(-Math.PI / 2);

  const vertices = geometry.attributes.position.array;

  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    geometry.attributes.position.array[j + 1] = data[i] * 10;
  }

  //

  const canvasTexture = generateTexture(data, worldWidth, worldDepth);
  if (!canvasTexture) return <></>;
  texture = new CanvasTexture(canvasTexture);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.colorSpace = SRGBColorSpace;

  const mesh = new Mesh(geometry, new MeshStandardMaterial({ map: texture }));

  mesh.scale.set(0.01, 0.01, 0.01);
  mesh.receiveShadow = true;

  mesh.position.y = -5;
  scene.add(mesh);

  return (
    <></>
    // <mesh
    //   userData={{ ground: true }}
    //   ref={ground}
    //   // rotation={[-Math.PI / 2, 0, 0]}
    //   // position={[0, -1, 0]}
    //   // receiveShadow={true}
    //   name="Ground"
    //   attach="geometry"
    //   geometry={geometry}
    // >
    //   {/* <boxGeometry args={[100, 100, 1, 100]} /> */}
    //   <meshStandardMaterial
    //     clipShadows={false}
    //     map={texture}
    //     // displacementMap={heightMap}
    //     // displacementScale={5}
    //   />
    // </mesh>
  );
};
