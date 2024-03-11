import { RefObject } from 'react';
import { Group, Raycaster, Scene, Vector3 } from 'three';
import { generateSlopeDetectionRay } from './generateSlopeDetectionRay';
import { generateRayDirections } from './generateSemiCircleDirections';
import { generateVerticalRays } from './generateVerticalRays';
import { isColliding } from './isColliding';
import { getSlopeAngle } from './getSlopeAngle';
import { maxSlopeAngle } from '../constants/constants';
import { handleGroundCollision } from './handleGroundCollision';

interface HandleMovement {
  raycaster: Raycaster;
  object: RefObject<Group>;
  direction: Vector3;
  downward: Vector3;
  verticalRayOrigin: Vector3;
  characterFeetPosition: Vector3;
  scene: Scene;
  characterDimensions: { height: number; radius: number };
  deltaTime: number;
  applyGravity: (deltaTime: number, object: RefObject<Group>) => void;
  jumpPressed: boolean;
  collisionObject: ReturnType<typeof isColliding>;
  move: { x: number; y: number; z: number };
}

export const handleMovement = ({
  raycaster,
  applyGravity,
  characterDimensions,
  characterFeetPosition,
  collisionObject,
  deltaTime,
  direction,
  downward,
  jumpPressed,
  object,
  scene,
  verticalRayOrigin,
  move,
}: HandleMovement) => {
  if (!object.current || !characterDimensions) return;
  const slopeDetectionRay = generateSlopeDetectionRay(
    raycaster,
    object.current.position,
    direction,
    scene
  );
  const horizontalDirectionDirectionRays = generateRayDirections(
    direction,
    10,
    160
  );
  const verticalRays = generateVerticalRays(
    direction,
    characterDimensions.height ?? 0,
    2
  );

  const canMoveHorizontal = horizontalDirectionDirectionRays.map(
    (rayDirection) => {
      if (object.current) {
        return !isColliding({
          direction: rayDirection,
          raycaster,
          rayStartPosition: object.current.position,
          collisionDistance: characterDimensions.radius ?? 0,
          intersectObjects: scene.children,
        });
      }
      return false;
    }
  );

  const canMoveVertical = verticalRays.map((e) => {
    if (object.current) {
      const rayStartPosition = verticalRayOrigin.set(
        object.current.position.x,
        object.current.position.y + e.height,
        object.current.position.z
      );
      const collision = isColliding({
        direction: e.direction,
        raycaster,
        rayStartPosition,
        collisionDistance: characterDimensions?.radius ?? 0,
        intersectObjects: scene.children,
      });
      const slopeAngle = getSlopeAngle(
        collision?.distance,
        slopeDetectionRay?.distance
      );
      if (!slopeAngle) return true;
      return slopeAngle < maxSlopeAngle;
    }
    return false;
  });

  if (
    canMoveHorizontal.every((e) => Boolean(e)) &&
    canMoveVertical.every((e) => Boolean(e))
  ) {
    if (collisionObject) {
      handleGroundCollision(
        collisionObject,
        object,
        characterDimensions.height
      );
    } else {
      characterFeetPosition.set(
        object.current.position.x,
        object.current.position.y - characterDimensions.height,
        object.current.position.z
      );
      const isCloseToGround = isColliding({
        direction: downward,
        raycaster,
        rayStartPosition: characterFeetPosition,
        collisionDistance: 0.5,
        intersectObjects: scene.children,
      });

      if (isCloseToGround && !jumpPressed) {
        object.current.position.y =
          isCloseToGround.point.y + characterDimensions.height;
      } else {
        applyGravity(deltaTime, object);
      }
    }

    setDirection({ x: move.x, y: move.y, z: move.z, direction });
    object.current.translateOnAxis(direction, 0.1);
  }
};

export const setDirection = ({
  x,
  y,
  z,
  direction,
}: {
  x: number;
  y: number;
  z: number;
  direction: Vector3;
}) => {
  direction.set(x, y, z);
};
