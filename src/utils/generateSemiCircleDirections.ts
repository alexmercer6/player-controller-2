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

// import { Vector3, Quaternion, MathUtils } from 'three';

// /**
//  * Generate ray directions with optional vertical spread.
//  * @param forwardDirection - The primary direction of the rays.
//  * @param numberOfRays - The total number of rays to generate.
//  * @param arcLengthDegrees - The horizontal spread of the rays in degrees.
//  * @param verticalSpreadDegrees - Optional. The vertical spread of the rays in degrees. Defaults to 0 for horizontal only.
//  * @returns An array of Vector3 objects representing the ray directions.
//  */
// export const generateRayDirections = (
//   forwardDirection: Vector3,
//   numberOfRays: number,
//   arcLengthDegrees: number,
//   verticalSpreadDegrees: number = 0 // Optional vertical spread
// ): Vector3[] => {
//   let directions = [];
//   const horizontalStepAngle = arcLengthDegrees / (numberOfRays - 1);
//   const verticalSteps =
//     verticalSpreadDegrees > 0 ? Math.ceil(numberOfRays / 2) : 1; // Decide on the number of vertical steps based on spread
//   const verticalStepAngle = verticalSpreadDegrees / (verticalSteps - 1);

//   for (let v = 0; v < verticalSteps; v++) {
//     // Calculate the vertical angle offset
//     const verticalAngle = -(verticalSpreadDegrees / 2) + verticalStepAngle * v;
//     const verticalQuaternion = new Quaternion().setFromAxisAngle(
//       forwardDirection.clone().cross(new Vector3(0, 1, 0)).normalize(), // Axis perpendicular to forward and up
//       MathUtils.degToRad(verticalAngle)
//     );

//     for (let h = 0; h < numberOfRays; h++) {
//       const angle = -(arcLengthDegrees / 2) + horizontalStepAngle * h;
//       const horizontalQuaternion = new Quaternion().setFromAxisAngle(
//         new Vector3(0, 1, 0), // Y-up world, rotate around Y axis for horizontal spread
//         MathUtils.degToRad(angle)
//       );

//       let direction = forwardDirection
//         .clone()
//         .applyQuaternion(horizontalQuaternion);
//       direction.applyQuaternion(verticalQuaternion);
//       directions.push(direction);
//     }
//   }

//   return directions;
// };
