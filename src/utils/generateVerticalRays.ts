import { Vector3 } from 'three';

/**
 * Generate forward-facing rays originating from different heights.
 *
 * @param forwardDirection - The forward direction for all rays.
 * @param objectHeight - The height of the object to base vertical ray origins on.
 * @param numberOfVerticalRays - The number of vertical rays to generate.
 * @returns An array of objects, each with a direction vector and an origin height for the ray.
 */
export const generateVerticalRays = (
  forwardDirection: Vector3,
  objectHeight: number,
  numberOfVerticalRays: number
) => {
  let rays = [];

  for (let i = 0; i < numberOfVerticalRays; i++) {
    // Calculate the vertical position for each ray
    // Distribute rays evenly along the height, including the bottom and top
    const height =
      -objectHeight / 2 + (objectHeight / (numberOfVerticalRays - 1)) * i;

    // All rays point in the forward direction but originate from different heights
    rays.push({ direction: forwardDirection.clone(), height });
  }

  return rays;
};
