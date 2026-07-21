'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { useStore, SceneObject } from '@/store/useStore';

/**
 * NOTE FOR LATER: these are simple primitive shapes (boxes/cylinders/cones)
 * standing in for real furniture so the app works with zero external assets.
 * To upgrade to real 3D models: drop .glb files in /public/models and swap
 * the <mesh> blocks below for <primitive object={useGLTF('/models/sofa.glb').scene} />
 */
function ShapeForType({ type, color }: { type: SceneObject['type']; color: string }) {
  switch (type) {
    case 'sofa':
      return (
        <group>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.4, 0.5, 0.6]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.55, -0.25]} castShadow>
            <boxGeometry args={[1.4, 0.5, 0.15]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case 'lamp':
      return (
        <group>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
            <meshStandardMaterial color="#444" />
          </mesh>
          <mesh position={[0, 1.05, 0]} castShadow>
            <coneGeometry args={[0.25, 0.35, 16, 1, true]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );
    case 'plant':
      return (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.15, 0.4, 12]} />
            <meshStandardMaterial color="#7a5a3a" />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case 'table':
      return (
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.08, 24]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    case 'chair':
      return (
        <group>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.45, 0.08, 0.45]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.55, -0.2]} castShadow>
            <boxGeometry args={[0.45, 0.5, 0.08]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case 'rug':
      return (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 1.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    default:
      return null;
  }
}

export default function FurniturePiece({ obj }: { obj: SceneObject }) {
  const meshRef = useRef<THREE.Group>(null);
  const { selectedId, selectObject, moveObject, rotateObject } = useStore();
  const isSelected = selectedId === obj.id;

  return (
    <>
      <group
        ref={meshRef}
        position={obj.position}
        rotation={[0, obj.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          selectObject(obj.id);
        }}
      >
        <ShapeForType type={obj.type} color={obj.color} />
        {isSelected && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.55, 32]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        )}
      </group>
      {isSelected && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          mode="translate"
          onObjectChange={() => {
            if (!meshRef.current) return;
            const p = meshRef.current.position;
            moveObject(obj.id, [p.x, 0, p.z]);
          }}
        />
      )}
    </>
  );
}
