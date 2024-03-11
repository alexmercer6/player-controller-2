import { Vector3, Quaternion, MathUtils } from 'three';

/**
 *  Generate ray directions up to 360 degrees around the origin
 */
export const generateRayDirections = (
  forwardDirection: Vector3,
  numberOfRays: number,
  arcLengthDegrees: number
): Vector3[] => {
  let directions = [];
  const stepAngle = arcLengthDegrees / (numberOfRays - 1); // Divide arcLengthDegreess by the number of rays - 1 to get the angle step
  for (let i = 0; i < numberOfRays; i++) {
    const angle = -(arcLengthDegrees / 2) + stepAngle * i; // If 180 - Calculate angle from -90 to 90 degrees
    const quaternion = new Quaternion().setFromAxisAngle(
      new Vector3(0, 1, 0),
      MathUtils.degToRad(angle)
    ); // Assuming Y-up world, rotate around Y axis
    const direction = forwardDirection.clone().applyQuaternion(quaternion);
    directions.push(direction);
  }
  return directions;
};
