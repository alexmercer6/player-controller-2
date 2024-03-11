import { OrbitControls, useKeyboardControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { RefObject, useMemo, useRef } from 'react';

import {
  Box3,
  Group,
  MathUtils,
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
  maxSlopeAngle,
  playerRunSpeed,
  playerTurnSpeed,
} from '../constants/constants';
import { visualizeRay } from '../utils/visualiseRay';
import { generateRayDirections } from '../utils/generateSemiCircleDirections';
import { generateVerticalRays } from '../utils/generateVerticalRays';
import { Model } from './Model';
import { CharacterAnimation } from '../animations/CharacterAnimations';
import { useGame } from '../store/useGame';
import { generateSlopeDetectionRay } from '../utils/generateSlopeDetectionRay';
import { getSlopeAngle } from '../utils/getSlopeAngle';
import { handleGroundCollision } from '../utils/handleGroundCollision';
import { handleMovement } from '../utils/handleMovement';

export const Controls = {
  forward: 'forward',
  back: 'back',
  left: 'left',
  right: 'right',
  jump: 'jump',
  attackOne: 'attack one',
  attackTwo: 'attack two',
  roll: 'roll',
  cameraFollow: 'cameraFollow',
};

export const CharacterController = () => {
  const JUMP_FORCE = 1;
  const MOVEMENT_SPEED = 0.3;
  const MAX_VEL = 3;
  const RUN_VEL = 1;

  // Animation change functions
  const idleAnimation = useGame((state) => state.idle);
  const walkAnimation = useGame((state) => state.walk);
  const runAnimation = useGame((state) => state.run);
  const jumpAnimation = useGame((state) => state.jump);
  const jumpIdleAnimation = useGame((state) => state.jumpIdle);
  const fallAnimation = useGame((state) => state.fall);
  const action1Animation = useGame((state) => state.action1);
  const action2Animation = useGame((state) => state.action2);
  const action3Animation = useGame((state) => state.action3);
  const action4Animation = useGame((state) => state.action4);

  const jumpPressed = useKeyboardControls((state) => state[Controls.jump]);
  const leftPressed = useKeyboardControls((state) => state[Controls.left]);
  const rightPressed = useKeyboardControls((state) => state[Controls.right]);
  const backPressed = useKeyboardControls((state) => state[Controls.back]);
  const forwardPressed = useKeyboardControls(
    (state) => state[Controls.forward]
  );
  const attackOnePressed = useKeyboardControls(
    (state) => state[Controls.attackOne]
  );
  const attackTwoPressed = useKeyboardControls(
    (state) => state[Controls.attackTwo]
  );
  const rollPressed = useKeyboardControls((state) => state[Controls.roll]);
  const cameraFollowPressed = useKeyboardControls(
    (state) => state[Controls.cameraFollow]
  );
  const { camera, scene } = useThree();
  camera.layers.enable(1);

  const character = useRef<Group>(null);
  const velocity = useRef<number>(0);
  const isJumping = useRef<boolean>(false);
  const isCameraFollow = useRef<boolean>(true);
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
  const characterFeetPosition = new Vector3();
  const intialCameraPosition = new Vector3(0, 15, 0);

  const verticalRayOrigin = new Vector3();

  let currentPosition = new Vector3();
  let currentLookAt = new Vector3();

  const raycaster = new Raycaster();
  raycaster.layers.disable(1);

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

  window.addEventListener('keypress', (e) => {
    if (cameraFollowPressed) isCameraFollow.current = !isCameraFollow.current;
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

  const applyGravity = (deltaTime: number, object: RefObject<Group>) => {
    if (object.current) {
      // const newVelocity = velocity.current - gravity * 0.02 * deltaTime; // Gravity effect
      // character.current.position.y += newVelocity * 0.02 * deltaTime; // Update position
      // velocity.current = newVelocity;

      velocity.current -= gravity * deltaTime;

      // Update the character's position based on the new velocity.
      // Position change due to velocity should also consider deltaTime to be frame rate independent.
      // Here, you multiply the velocity by deltaTime to calculate the displacement.
      object.current.position.y += velocity.current * deltaTime;
    }
  };

  useFrame(({ camera }, delta) => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isCameraFollow.current;
    }
    const deltaTime = delta;
    if (character.current) {
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

      const upBlocked = isColliding({
        direction: up,
        raycaster,
        rayStartPosition: character.current.position,
        collisionDistance,
        intersectObjects: scene.children,
      });

      if (upBlocked) {
        velocity.current = 0;
      }
      if (attackOnePressed && action1Animation) {
        action1Animation();
      }

      if (attackTwoPressed && action2Animation) {
        action2Animation();
      }

      if (rollPressed && action3Animation) {
        action3Animation();
        direction.set(0, 0, playerRunSpeed * deltaTime);
        // character.current.position.add(direction);
        character.current.translateOnAxis(direction, 0.1);
      }

      const isOnGround = isColliding({
        direction: downward,
        raycaster,
        rayStartPosition: character.current.position,
        collisionDistance: characterDimensions?.height
          ? characterDimensions?.height
          : collisionDistance,
        intersectObjects: scene.children,
      });
      if (isOnGround) {
        velocity.current = 0;
        if (
          isOnGround.object.name === 'Moving platform' &&
          !forwardPressed &&
          characterDimensions
        ) {
          character.current.position.set(
            isOnGround.object.position.x,
            isOnGround.point.y + characterDimensions.height,
            isOnGround.object.position.z
          );
        }
      }

      if (!isOnGround && !forwardPressed) {
        applyGravity(deltaTime, character);
      }
      if (jumpPressed && !isJumping.current) {
        isJumping.current = true;

        velocity.current = jumpVelocity;
      }

      if (rightPressed) {
        character.current.rotateY(-playerTurnSpeed * deltaTime);
      }
      if (leftPressed) {
        character.current.rotateY(playerTurnSpeed * deltaTime);
      }
      if (backPressed && characterDimensions) {
        handleMovement({
          raycaster,
          object: character,
          direction,
          scene,
          characterDimensions,
          characterFeetPosition,
          downward,
          deltaTime,
          applyGravity,
          collisionObject: isOnGround,
          jumpPressed,
          verticalRayOrigin,
          move: { x: 0, y: 0, z: -playerRunSpeed * deltaTime },
        });
      }
      if (forwardPressed && characterDimensions) {
        if (runAnimation) runAnimation();
        handleMovement({
          raycaster,
          object: character,
          direction,
          scene,
          characterDimensions,
          characterFeetPosition,
          downward,
          deltaTime,
          applyGravity,
          collisionObject: isOnGround,
          jumpPressed,
          verticalRayOrigin,
          move: { x: 0, y: 0, z: playerRunSpeed * deltaTime },
        });
        // const slopeDetectionRay = generateSlopeDetectionRay(
        //   raycaster,
        //   character.current.position,
        //   direction,
        //   scene
        // );
        // const forwardDirectionRays = generateRayDirections(direction, 10, 160);
        // const vert = generateVerticalRays(
        //   direction,
        //   characterDimensions?.height ?? 0,
        //   2
        // );

        // const canMoveForwardHorizontal = forwardDirectionRays.map(
        //   (rayDirection) => {
        //     if (character.current) {
        //       // visualizeRay(character.current.position, rayDirection, scene, 1);
        //       return !isColliding({
        //         direction: rayDirection,
        //         raycaster,
        //         rayStartPosition: character.current.position,
        //         collisionDistance: characterDimensions?.radius ?? 0,
        //         intersectObjects: scene.children,
        //       });
        //     }
        //     return false;
        //   }
        // );

        // const canMoveForwardVertical = vert.map((e) => {
        //   if (character.current) {
        //     const rayStartPosition = verticalRayOrigin.set(
        //       character.current.position.x,
        //       character.current.position.y + e.height,
        //       character.current.position.z
        //     );
        //     // visualizeRay(rayStartPosition, e.direction, scene, 1);
        //     const forwardCollision = isColliding({
        //       direction: e.direction,
        //       raycaster,
        //       rayStartPosition,
        //       collisionDistance: characterDimensions?.radius ?? 0,
        //       intersectObjects: scene.children,
        //     });
        //     const slopeAngle = getSlopeAngle(
        //       forwardCollision?.distance,
        //       slopeDetectionRay?.distance
        //     );
        //     if (!slopeAngle) return true;
        //     return slopeAngle < maxSlopeAngle;
        //   }
        //   return false;
        // });

        // if (
        //   canMoveForwardHorizontal.every((e) => Boolean(e)) &&
        //   canMoveForwardVertical.every((e) => Boolean(e)) &&
        //   characterDimensions?.height
        // ) {
        //   if (isOnGround) {
        //     handleGroundCollision(
        //       isOnGround,
        //       character,
        //       characterDimensions.height
        //     );
        //   } else {
        //     characterFeetPosition.set(
        //       character.current.position.x,
        //       character.current.position.y - characterDimensions.height,
        //       character.current.position.z
        //     );
        //     const isCloseToGround = isColliding({
        //       direction: downward,
        //       raycaster,
        //       rayStartPosition: characterFeetPosition,
        //       collisionDistance: 0.5,
        //       intersectObjects: scene.children,
        //     });

        //     if (isCloseToGround && !jumpPressed) {
        //       character.current.position.y =
        //         isCloseToGround.point.y + characterDimensions.height;
        //     } else {
        //       applyGravity(deltaTime, character);
        //     }
        //   }

        //   direction.set(0, 0, playerRunSpeed * deltaTime);
        //   character.current.translateOnAxis(direction, 0.1);
        // }
      }

      if (isJumping.current) {
        applyGravity(deltaTime, character);

        if (isOnGround && characterDimensions?.height) {
          handleGroundCollision(
            isOnGround,
            character,
            characterDimensions.height
          );
          isJumping.current = false;
        }
      }

      if (
        !forwardPressed &&
        !backPressed &&
        !leftPressed &&
        !rightPressed &&
        !jumpPressed &&
        idleAnimation
      ) {
        idleAnimation();
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
      // if (controlsRef.current && isMouseDown.current) {
      //   controlsRef.current.target.lerp(character.current.position, 0.5);
      //   controlsRef.current.update();
      // }
      if (isCameraFollow.current) {
        currentPosition.copy(cameraPositionOffset);

        currentLookAt.copy(cameraFocusOffset);

        // currentPosition should represent your desired camera position, including the offset
        // currentLookAt should represent the point where you want the camera to look at

        // Set camera X and Z directly for snappy movement
        camera.position.x = currentPosition.x;
        camera.position.z = currentPosition.z;

        // Only use lerp for the Y-axis for smooth vertical movement
        camera.position.y = MathUtils.lerp(
          camera.position.y,
          currentPosition.y,
          0.02
        );

        // camera.position.lerp(currentPosition, 0.08);

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
      {/* <mesh
        // ref={character}
        position={[0, 10, 0]}
        castShadow
        name="Character"
        visible={true}
      >
        <capsuleGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial
          color={'skyblue'}
          wireframe
        />
      </mesh> */}
      <group
        ref={character}
        position={[0, 10, 0]}
      >
        <Model
          // currentAnimation="CharacterArmature|Idle"
          controllerPosition={character.current?.position}
          controllerRotation={character.current?.rotation}
          props={{ scale: 0.5 }}
        />
      </group>
    </>
  );
};
