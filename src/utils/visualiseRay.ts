import * as THREE from 'three';

export const visualizeRay = (
  rayOrigin: THREE.Vector3,
  rayDirection: THREE.Vector3,
  scene: THREE.Scene,
  length = 100,
  color = 0xff0000
) => {
  const material = new THREE.LineBasicMaterial({ color: color });

  // The raycaster.ray.origin is the start point, and raycaster.ray.direction is the direction.
  // We extend the direction from the origin to visualize the ray.

  const endPoint = new THREE.Vector3().addVectors(
    rayOrigin,
    rayDirection.clone().multiplyScalar(length)
  );

  const geometry = new THREE.BufferGeometry().setFromPoints([
    rayOrigin,
    endPoint,
  ]);

  const line = new THREE.Line(geometry, material);
  line.name = 'debug ray';
  line.layers.set(1);
  scene.add(line);

  // Return the line object in case you want to remove or modify it later
  return line;
};
