import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { useFrame } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    Wizard001: THREE.SkinnedMesh;
    Face: THREE.Mesh;
    ShoulderPadL: THREE.Mesh;
    Wizard_Staff: THREE.Mesh;
    ShoulderPadR: THREE.Mesh;
    Pouch: THREE.Mesh;
    Root: THREE.Bone;
  };
  materials: {
    Wizard_Texture: THREE.MeshStandardMaterial;
  };
};

type ActionName =
  | 'CharacterArmature|Death'
  | 'CharacterArmature|Idle_Attacking'
  | 'CharacterArmature|Idle'
  | 'CharacterArmature|Idle_Weapon'
  | 'CharacterArmature|PickUp'
  | 'CharacterArmature|Punch'
  | 'CharacterArmature|RecieveHit_2'
  | 'CharacterArmature|RecieveHit'
  | 'CharacterArmature|Roll'
  | 'CharacterArmature|Run'
  | 'CharacterArmature|Run_Weapon'
  | 'CharacterArmature|Spell1'
  | 'CharacterArmature|Spell2'
  | 'CharacterArmature|Staff_Attack'
  | 'CharacterArmature|Walk';
type GLTFActions = Record<ActionName, THREE.AnimationAction>;

export function Model({
  controllerPosition,
  controllerRotation,
  props,
}: {
  controllerPosition?: THREE.Vector3;
  controllerRotation?: THREE.Euler;
  props?: JSX.IntrinsicElements['group'];
}) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF(
    '/Wizard-new-origin.glb'
  ) as GLTFResult;
  const { actions: t } = useAnimations(animations, group);
  const actions = t as GLTFActions;
  useEffect(() => {
    actions['CharacterArmature|Walk']?.reset().fadeIn(0.03).play();

    return () => {
      actions['CharacterArmature|Death']?.reset().fadeOut(0.3);
    };
  }, []);

  useEffect(() => {
    if (group.current) {
      group.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.name === 'Wizard_Staff') {
            //TODO: Create interactions
          }
          child.castShadow = true;
          child.layers.set(1); // Assigns the model to layer 1
        }
      });
    }
  }, [group.current]);

  useFrame(() => {
    if (group.current && controllerPosition && controllerRotation) {
      group.current.position.set(
        controllerPosition.x,
        controllerPosition.y,
        controllerPosition.z
      );
      group.current.rotation.set(
        controllerRotation.x,
        controllerRotation.y,
        controllerRotation.z
      );
    }
  });

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
    >
      <group name="Scene">
        <group name="RootNode">
          <group
            name="CharacterArmature"
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <skinnedMesh
              name="Wizard001"
              geometry={nodes.Wizard001.geometry}
              material={materials.Wizard_Texture}
              skeleton={nodes.Wizard001.skeleton}
            />
            <primitive object={nodes.Root} />
          </group>
          <group
            name="Wizard"
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload('/Wizard-new-origin.glb');
