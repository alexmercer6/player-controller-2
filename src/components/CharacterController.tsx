import { OrbitControls, useKeyboardControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

import {
  Box3,
  Mesh,
  Quaternion,
  Raycaster,
  TextureLoader,
  Vector3,
} from 'three';
import { OrbitControls as OrbitControlsType } from 'three-stdlib';
import { isColliding } from '../utils/isColliding';
import {
  collisionDistance,
  gravity,
  jumpVelocity,
  playerMovementSpeed,
} from '../constants/constants';
import { visualizeRay } from '../utils/visualiseRay';
import { generateRayDirections } from '../utils/generateSemiCircleDirections';
import { generateVerticalRays } from '../utils/generateVerticalRays';
import { Model } from './Model';

export const Controls = {
  forward: 'forward',
  back: 'back',
  left: 'left',
  right: 'right',
  jump: 'jump',
  leftPunch: 'left punch',
  rightPunch: 'right punch',
};

export const CharacterController = () => {
  const JUMP_FORCE = 1;
  const MOVEMENT_SPEED = 0.3;
  const MAX_VEL = 3;
  const RUN_VEL = 1;
  const jumpPressed = useKeyboardControls((state) => state[Controls.jump]);
  const leftPressed = useKeyboardControls((state) => state[Controls.left]);
  const rightPressed = useKeyboardControls((state) => state[Controls.right]);
  const backPressed = useKeyboardControls((state) => state[Controls.back]);
  const forwardPressed = useKeyboardControls(
    (state) => state[Controls.forward]
  );
  const { camera } = useThree();
  camera.layers.enable(1);

  const character = useRef<Mesh>(null);
  const velocity = useRef<number>(0);
  const isJumping = useRef<boolean>(false);
  const isMouseDown = useRef<boolean>(false);
  const controlsRef = useRef<OrbitControlsType>(null);
  const bboxRef = useRef<Mesh>(null);

  const target = new Vector3(0, 0, 0);
  const direction = new Vector3();
  const backward = new Vector3();
  const left = new Vector3();
  const right = new Vector3();
  const up = new Vector3(0, 1, 0);
  const downward = new Vector3(0, -1, 0);
  const currentQuat = new Quaternion();

  const verticalRayOrigin = new Vector3();

  let currentPosition = new Vector3();
  let currentLookAt = new Vector3();

  const raycaster = new Raycaster();
  raycaster.layers.disable(1);

  const { scene } = useThree();

  const calculateOffset = (
    { position, rotation }: { position: Vector3; rotation: Quaternion },
    x: number,
    y: number,
    z: number
  ) => {
    const offSet = new Vector3(x, y, z);
    offSet.applyQuaternion(rotation);
    offSet.add(position);
    return offSet;
  };

  window.addEventListener('mousedown', () => {
    isMouseDown.current = true;
  });

  window.addEventListener('mouseup', () => {
    isMouseDown.current = false;
  });

  const characterDimensions = useMemo(() => {
    if (character.current) {
      let boundingBox = new Box3().setFromObject(character.current);
      let height = boundingBox.max.y - boundingBox.min.y;
      let radius =
        Math.max(
          boundingBox.max.x - boundingBox.min.x,
          boundingBox.max.z - boundingBox.min.z
        ) / 2;
      return { radius, height };
    }
    return null;
  }, [character.current]);

  useFrame(({ camera }, delta) => {
    if (character.current) {
      if (bboxRef.current) {
        bboxRef.current.position.set(
          character.current.position.x,
          character.current.position.y,
          character.current.position.z
        );
      }
      character.current.getWorldDirection(direction);
      backward.copy(direction).negate();
      left.crossVectors(direction, up).negate();
      right.crossVectors(direction, up);

      // const canMoveBackward = !isColliding({
      //   direction,
      //   raycaster,
      //   rayStartPosition: character.current.position,
      //   collisionDistance,
      //   intersectObjects: scene.children,
      // });
      // const canMoveLeft = !isColliding({
      //   direction,
      //   raycaster,
      //   rayStartPosition: character.current.position,
      //   collisionDistance,
      //   intersectObjects: scene.children,
      // });
      // const canMoveRight = !isColliding({
      //   direction,
      //   raycaster,
      //   rayStartPosition: character.current.position,
      //   collisionDistance,
      //   intersectObjects: scene.children,
      // });

      // const canMoveUp = !isColliding({
      //   direction: up,
      //   raycaster,
      //   rayStartPosition: character.current.position,
      //   collisionDistance,
      //   intersectObjects: scene.children,
      // });

      const isOnGround = isColliding({
        direction: downward,
        raycaster,
        rayStartPosition: character.current.position,
        collisionDistance,
        intersectObjects: scene.children.filter(
          (e) => e.name !== 'Character' && e.name !== 'Model'
        ),
      });
      if (!isOnGround) {
        // visualizeRay(character.current.position, downward, scene);
        // Update velocity and position for gravity
        const newVelocity = velocity.current - gravity * 0.02; // Gravity effect
        character.current.position.y += newVelocity * 0.02; // Update position
        velocity.current = newVelocity;
      }
      if (jumpPressed && !isJumping.current) {
        isJumping.current = true;
        velocity.current = jumpVelocity;
        // isOnFloor.current = false;
      }

      if (rightPressed) {
        character.current.rotateY(-0.05);
      }
      if (leftPressed) {
        character.current.rotateY(0.05);
      }
      if (backPressed) {
        const backwardDirectionRays = generateRayDirections(direction, 10, 160);
        const vert = generateVerticalRays(
          direction,
          characterDimensions?.height ?? 0,
          4
        );

        const canMoveBackwardsHorizontal = backwardDirectionRays.map(
          (rayDirection) => {
            if (character.current) {
              return !isColliding({
                direction: rayDirection,
                raycaster,
                rayStartPosition: character.current.position,
                collisionDistance: characterDimensions?.radius ?? 0,
                intersectObjects: scene.children,
              });
            }
            return false;
          }
        );

        const canMoveBackwardsVertical = vert.map((e) => {
          if (character.current) {
            const rayStartPosition = verticalRayOrigin.set(
              character.current.position.x,
              character.current.position.y + e.height,
              character.current.position.z
            );
            // visualizeRay(rayStartPosition, e.direction, scene, 1);
            return !isColliding({
              direction: e.direction,
              raycaster,
              rayStartPosition,
              collisionDistance: characterDimensions?.radius ?? 0,
              intersectObjects: scene.children.filter(
                (e) => e.name !== 'Character' && e.name !== 'Model'
              ),
            });
          }
          return false;
        });

        if (
          [...canMoveBackwardsVertical, ...canMoveBackwardsHorizontal].every(
            (e) => e
          )
        ) {
          direction.set(0, 0, -playerMovementSpeed);
          character.current.translateOnAxis(direction, 0.1);
        }
      }
      if (forwardPressed) {
        const forwardDirectionRays = generateRayDirections(direction, 10, 160);
        const vert = generateVerticalRays(
          direction,
          characterDimensions?.height ?? 0,
          4
        );

        const canMoveForwardHorizontal = forwardDirectionRays.map(
          (rayDirection) => {
            if (character.current) {
              // visualizeRay(character.current.position, rayDirection, scene, 1);
              return !isColliding({
                direction: rayDirection,
                raycaster,
                rayStartPosition: character.current.position,
                collisionDistance: characterDimensions?.radius ?? 0,
                intersectObjects: scene.children.filter(
                  (e) => e.name !== 'Character' && e.name !== 'Model'
                ),
              });
            }
            return false;
          }
        );

        const canMoveForwardVertical = vert.map((e) => {
          if (character.current) {
            const rayStartPosition = verticalRayOrigin.set(
              character.current.position.x,
              character.current.position.y + e.height,
              character.current.position.z
            );
            // visualizeRay(rayStartPosition, e.direction, scene, 1);
            return !isColliding({
              direction: e.direction,
              raycaster,
              rayStartPosition,
              collisionDistance: characterDimensions?.radius ?? 0,
              intersectObjects: scene.children.filter(
                (e) => e.name !== 'Character'
              ),
            });
          }
          return false;
        });

        if (
          canMoveForwardHorizontal.every((e) => Boolean(e)) &&
          canMoveForwardVertical.every((e) => Boolean(e))
        ) {
          direction.set(0, 0, playerMovementSpeed);
          character.current.translateOnAxis(direction, 0.1);
        }
      }

      if (isJumping.current) {
        // Update velocity and position for gravity
        const newVelocity = velocity.current - gravity * 0.02; // Gravity effect
        character.current.position.y += newVelocity * 0.02; // Update position

        // Ground contact
        if (isOnGround && characterDimensions) {
          const collisionNormal = isOnGround.normal?.clone();
          const collisionObjectPositionY =
            isOnGround.point.y -
            (character.current.position.y - characterDimensions.height / 2);
          let overlapY =
            characterDimensions.height / 2 - Math.abs(collisionObjectPositionY);
          collisionNormal?.multiplyScalar(overlapY);
          if (collisionNormal) {
            console.debug('before', character.current.position, isOnGround);
            character.current.position.y += collisionNormal.y;
            console.debug('after', character.current.position, isOnGround);
          }

          isJumping.current = false;
        }

        velocity.current = newVelocity;
      }

      // const delta = clock.getDelta();
      // moveModel(keyboard, activeModel);

      // camera.position.copy(character.current.position).add(cameraOffset);
      // camera.lookAt(character.current.position);

      character.current.getWorldPosition(target);

      character.current.getWorldQuaternion(currentQuat);

      let cameraPositionOffset = calculateOffset(
        {
          position: target,
          rotation: currentQuat,
        },
        0,
        6,
        -15
      );
      let cameraFocusOffset = calculateOffset(
        {
          position: target,
          rotation: currentQuat,
        },
        0,
        1,
        2
      );
      // const t = 1.0 - Math.pow(0.0025, delta);
      if (controlsRef.current && isMouseDown.current) {
        controlsRef.current.target.lerp(character.current.position, 0.5);
        controlsRef.current.update();
      }
      if (!isMouseDown.current) {
        currentPosition.copy(cameraPositionOffset);

        currentLookAt.copy(cameraFocusOffset);

        camera.position.lerp(currentPosition, 0.5);

        camera.lookAt(currentLookAt);
        camera.updateProjectionMatrix();
      }

      // character.current.getWorldPosition(target);
      // camera.position.set(target.x, target.y + 5, target.z + 15);
      // camera.lookAt(target);
    }
  });

  return (
    <>
      <OrbitControls
        makeDefault={true}
        ref={controlsRef}
      />
      <mesh
        ref={character}
        position={[0, 10, 0]}
        castShadow
        name="Character"
        visible={false}
      >
        <capsuleGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial
          color={'skyblue'}
          wireframe
        />
      </mesh>
      <Model
        // currentAnimation="CharacterArmature|Idle"
        controllerPosition={character.current?.position}
        controllerRotation={character.current?.rotation}
        props={{ scale: 0.5 }}
      />
    </>
  );
};
