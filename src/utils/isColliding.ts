import { Object3D, Raycaster, Vector3 } from 'three';

interface isCollidingProps {
  direction: Vector3;
  raycaster: Raycaster;
  rayStartPosition: Vector3;
  collisionDistance: number;
  intersectObjects: Object3D[];
}
export const isColliding = ({
  direction,
  raycaster,
  rayStartPosition,
  collisionDistance,
  intersectObjects,
}: isCollidingProps) => {
  raycaster.set(rayStartPosition, direction.normalize());
  const intersections = raycaster.intersectObjects(intersectObjects, true);
  return intersections.length > 0 &&
    intersections[0].distance <= collisionDistance
    ? intersections[0]
    : null;
};
