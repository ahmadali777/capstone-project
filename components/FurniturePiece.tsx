'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useStore, isWallItem, SceneObject, type AssetType, type WallSide, orbitControlsRef } from '@/store/useStore';
import SofaModel from './SofaModel';

const WALL_EPS = 0.02;

const WALL_ITEM_DIMS: Record<'door' | 'window' | 'vent', { width: number; height: number; halfWidth: number; fixedY: number }> = {
  door: { width: 0.9, height: 2.05, halfWidth: 0.45, fixedY: 1.05 },
  window: { width: 1.1, height: 1, halfWidth: 0.55, fixedY: 1.4 },
  vent: { width: 0.35, height: 0.18, halfWidth: 0.175, fixedY: 0 },
};

function clampWallOffset(type: AssetType, wall: WallSide | undefined, raw: number, halfLength: number, halfWidth: number) {
  const margin = WALL_ITEM_DIMS[type as 'door' | 'window' | 'vent'].halfWidth;
  const max = (wall === 'left' ? halfWidth : halfLength) - margin;
  return Math.min(max, Math.max(-max, raw));
}

function ShapeForType({ type, color, metalness, roughness }: { type: SceneObject['type']; color: string; metalness: number; roughness: number }) {
  switch (type) {
    case 'sofa':
      return <SofaModel color={color} metalness={metalness} roughness={roughness} />;
    case 'lamp':
      return (
        <group>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
            <meshStandardMaterial color="#444" metalness={metalness} roughness={roughness} />
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
            <meshStandardMaterial color="#7a5a3a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'table':
      return (
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.08, 24]} />
          <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
        </mesh>
      );
    case 'chair':
      return (
        <group>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.45, 0.08, 0.45]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.55, -0.2]} castShadow>
            <boxGeometry args={[0.45, 0.5, 0.08]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'rug':
      return (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 1.1]} />
          <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
        </mesh>
      );
    case 'door':
      return (
        <group>
          <mesh position={[0, 0, -0.035]} castShadow>
            <boxGeometry args={[0.94, 2.09, 0.03]} />
            <meshStandardMaterial color="#2f2a26" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.84, 1.99, 0.04]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0.28, -0.6, 0.04]}>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial color="#c9a06b" metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'window':
      return (
        <group>
          <mesh position={[0, 0, -0.02]} castShadow>
            <boxGeometry args={[1.1, 1.0, 0.03]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[1.0, 0.9]} />
            <meshStandardMaterial color="#bfe3f5" transparent opacity={0.45} metalness={0.1} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.02]} castShadow>
            <boxGeometry args={[1.0, 0.05, 0.03]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.02]} castShadow>
            <boxGeometry args={[0.05, 0.9, 0.03]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'vent':
      return (
        <group>
          <mesh position={[0, 0, -0.015]} castShadow>
            <boxGeometry args={[0.35, 0.18, 0.02]} />
            <meshStandardMaterial color="#5b5b5b" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.05, 0.01]} castShadow>
            <boxGeometry args={[0.3, 0.03, 0.025]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.01]} castShadow>
            <boxGeometry args={[0.3, 0.03, 0.025]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, -0.05, 0.01]} castShadow>
            <boxGeometry args={[0.3, 0.03, 0.025]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

export default function FurniturePiece({ obj }: { obj: SceneObject }) {
  const draggingRef = useRef(false);
  const checkpointedRef = useRef(false);
  const { selectedId, selectObject, moveObject, setWallOffset, roomDimensions, overlappingIds } = useStore();
  const { camera, gl } = useThree();
  const isSelected = selectedId === obj.id;
  const isOverlapping = overlappingIds.includes(obj.id);
  const wallItem = isWallItem(obj.type);
  const objType = obj.type;
  const wallSide = obj.wall ?? 'back';

  const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const dims = useMemo(() => {
    const length = Math.max(2, Number.parseFloat(roomDimensions.length) || 5);
    const width = Math.max(2, Number.parseFloat(roomDimensions.width) || 4);
    const height = Math.max(2, Number.parseFloat(roomDimensions.height) || 3);
    return { length, width, height, halfLength: length / 2, halfWidth: width / 2 };
  }, [roomDimensions.length, roomDimensions.width, roomDimensions.height]);
  const halfLength = dims.halfLength;
  const halfWidth = dims.halfWidth;
  const wallPlanes = useMemo(
    () => ({
      back: new THREE.Plane(new THREE.Vector3(0, 0, 1), dims.halfWidth),
      left: new THREE.Plane(new THREE.Vector3(1, 0, 0), dims.halfLength),
    }),
    [dims.halfWidth, dims.halfLength],
  );

  const worldPosition = useMemo(() => {
    if (wallItem) {
      const side = obj.wall ?? 'back';
      const offset = obj.wallOffset ?? 0;
      const y = obj.type === 'vent' ? dims.height - 0.3 : WALL_ITEM_DIMS[obj.type as 'door' | 'window' | 'vent'].fixedY;
      return side === 'back'
        ? ([offset, y, -dims.halfWidth + WALL_EPS] as [number, number, number])
        : ([-dims.halfLength + WALL_EPS, y, offset] as [number, number, number]);
    }
    return obj.position;
  }, [wallItem, obj.type, obj.wall, obj.wallOffset, obj.position, dims.height, dims.halfLength, dims.halfWidth]);

  const worldRotation = useMemo(() => {
    if (wallItem) {
      return (obj.wall ?? 'back') === 'left' ? ([0, Math.PI / 2, 0] as [number, number, number]) : ([0, 0, 0] as [number, number, number]);
    }
    return [0, obj.rotationY, 0] as [number, number, number];
  }, [wallItem, obj.wall, obj.rotationY]);

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const hit = new THREE.Vector3();

    const onPointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const bounds = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);

      if (wallItem) {
        const plane = wallSide === 'left' ? wallPlanes.left : wallPlanes.back;
        if (raycaster.ray.intersectPlane(plane, hit)) {
          if (!checkpointedRef.current) {
            checkpointedRef.current = true;
            const current = useStore.getState().objects.find((o) => o.id === obj.id);
            if (current) setWallOffset(current.id, current.wallOffset ?? 0);
            useStore.temporal.getState().pause();
          }
          const raw = wallSide === 'left' ? hit.z : hit.x;
          setWallOffset(obj.id, clampWallOffset(objType, wallSide, raw, halfLength, halfWidth));
        }
        return;
      }

      if (raycaster.ray.intersectPlane(floorPlane, hit)) {
        if (!checkpointedRef.current) {
          checkpointedRef.current = true;
          const current = useStore.getState().objects.find((o) => o.id === obj.id);
          if (current) moveObject(current.id, current.position);
          useStore.temporal.getState().pause();
        }
        const x = Math.min(halfLength - 0.3, Math.max(-halfLength + 0.3, hit.x));
        const z = Math.min(halfWidth - 0.3, Math.max(-halfWidth + 0.3, hit.z));
        moveObject(obj.id, [x, 0, z]);
      }
    };

    const endDrag = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (checkpointedRef.current) {
        checkpointedRef.current = false;
        useStore.temporal.getState().resume();
      }
      if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      useStore.temporal.getState().resume();
    };
  }, [camera, gl, floorPlane, wallPlanes, halfLength, halfWidth, moveObject, setWallOffset, obj.id, objType, wallSide, wallItem]);

  return (
    <group
      position={worldPosition}
      rotation={worldRotation}
      onClick={(e) => {
        e.stopPropagation();
        selectObject(obj.id);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        draggingRef.current = true;
        checkpointedRef.current = false;
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
        selectObject(obj.id);
      }}
    >
      <ShapeForType type={obj.type} color={obj.color} metalness={obj.metalness} roughness={obj.roughness} />
      {wallItem ? (
        isSelected && (
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[WALL_ITEM_DIMS[obj.type as 'door' | 'window' | 'vent'].width + 0.12, WALL_ITEM_DIMS[obj.type as 'door' | 'window' | 'vent'].height + 0.12]} />
            <meshBasicMaterial color="#93c5fd" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        )
      ) : (
        (isSelected || isOverlapping) && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.55, 32]} />
            <meshBasicMaterial color={isOverlapping ? '#ef4444' : '#3b82f6'} />
          </mesh>
        )
      )}
    </group>
  );
}
