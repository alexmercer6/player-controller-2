import { RefObject } from 'react';
import { isColliding } from './isColliding';
import { Group } from 'three';

export const handleGroundCollision = (
  collisionObject: ReturnType<typeof isColliding>,
  object: RefObject<Group>,
  objectHeight: number
) => {
  if (!collisionObject) return;
  let overlapY = objectHeight - collisionObject.distance;

  if (collisionObject.distance > 0 && object.current) {
    object.current.position.y += overlapY;
  }
};
