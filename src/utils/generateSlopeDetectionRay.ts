import { Vector3, Raycaster, Scene, Euler } from 'three';
import { visualizeRay } from './visualiseRay';

/**
 * Casts a ray forward from the character at a downward angle to detect slopes.
 *
 * @param {Vector3} position - The current position of the character.
 * @param {Vector3} forwardDirection - The forward direction vector of the character.
 * @param {THREE.Scene} scene - The Three.js scene containing the terrain and other objects.
 * @param {number} downAngleDegrees - The angle in degrees to tilt the ray downward.
 * @param {number} distance - The distance the ray should cover.
 * @returns {THREE.Intersection | null} - The intersection data if the ray hits an object; null otherwise.
 */
export const generateSlopeDetectionRay = (
  raycaster: Raycaster,
  position: Vector3,
  forwardDirection: Vector3,
  scene: Scene,
  downAngleDegrees = 45,
  distance = 5
) => {
  // Clone the forward direction to avoid modifying the original
  const forwardDownwardDirection = forwardDirection.clone();
  // Create a new vector that represents the forward direction at a downward angle
  const downwardAngle = -downAngleDegrees * (Math.PI / 180); // Convert degrees to radians

  // Use Euler angles to rotate the forward direction vector downwards
  // We clone the forward direction to avoid mutating the original vector
  forwardDownwardDirection.y += downwardAngle;

  // Create a raycaster with the adjusted direction
  raycaster.set(position, forwardDownwardDirection.normalize());
  (raycaster.near = 0), (raycaster.far = distance);

  // Perform the raycast operation against all objects in the scene
  const intersects = raycaster.intersectObjects(scene.children, true);

  // Return the first intersection found, or null if no intersections
  return intersects.length > 0 ? intersects[0] : null;
};
