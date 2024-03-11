export const getSlopeAngle = (x: number | undefined, y: number | undefined) => {
  if (!x || !y) return null;
  // Calculate the angle in radians
  var angleRadians = Math.atan2(y, x);

  // Convert radians to degrees
  var angleDegrees = angleRadians * (180 / Math.PI);

  return angleDegrees;
};
