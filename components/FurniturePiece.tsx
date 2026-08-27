'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore, isWallItem, SceneObject, type AssetType, type WallSide } from '@/store/useStore';
import SofaModel from './SofaModel';

export const WALL_EPS = 0.02;

export const WALL_ITEM_DIMS: Record<string, { width: number; height: number; halfWidth: number; fixedY: number }> = {
  door: { width: 0.9, height: 2.05, halfWidth: 0.45, fixedY: 1.05 },
  window: { width: 1.1, height: 1, halfWidth: 0.55, fixedY: 1.4 },
  vent: { width: 0.35, height: 0.18, halfWidth: 0.175, fixedY: 0 },
  painting: { width: 0.8, height: 0.6, halfWidth: 0.4, fixedY: 1.5 },
  mirror: { width: 0.6, height: 0.9, halfWidth: 0.3, fixedY: 1.5 },
  'wall-shelf': { width: 0.8, height: 0.05, halfWidth: 0.4, fixedY: 1.3 },
  clock: { width: 0.35, height: 0.35, halfWidth: 0.175, fixedY: 1.7 },
  'tv-mount': { width: 1.1, height: 0.65, halfWidth: 0.55, fixedY: 1.4 },
};

export function clampWallOffset(type: AssetType, wall: WallSide | undefined, raw: number, halfLength: number, halfWidth: number) {
  const dims = WALL_ITEM_DIMS[type];
  if (!dims) return raw;
  const margin = dims.halfWidth;
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
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
            <meshStandardMaterial color="#444" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <coneGeometry args={[0.25, 0.35, 16, 1, true]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );
    case 'plant':
      return (
        <group>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.2, 0.15, 0.4, 12]} />
            <meshStandardMaterial color="#7a5a3a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'table':
      return (
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.08, 24]} />
          <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
        </mesh>
      );
    case 'chair':
      return (
        <group>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.45, 0.08, 0.45]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.55, -0.2]}>
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
          <mesh position={[0, 0, -0.035]}>
            <boxGeometry args={[0.94, 2.09, 0.03]} />
            <meshStandardMaterial color="#2f2a26" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0]}>
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
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[1.1, 1.0, 0.03]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[1.0, 0.9]} />
            <meshStandardMaterial color="#bfe3f5" transparent opacity={0.45} metalness={0.1} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[1.0, 0.05, 0.03]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.05, 0.9, 0.03]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'vent':
      return (
        <group>
          <mesh position={[0, 0, -0.015]}>
            <boxGeometry args={[0.35, 0.18, 0.02]} />
            <meshStandardMaterial color="#5b5b5b" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.05, 0.01]}>
            <boxGeometry args={[0.3, 0.03, 0.025]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.3, 0.03, 0.025]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, -0.05, 0.01]}>
            <boxGeometry args={[0.3, 0.03, 0.025]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'bookshelf':
      return (
        <group>
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[0.9, 1.5, 0.35]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          {[0.25, 0.6, 0.95, 1.3].map((y) => (
            <mesh key={y} position={[0, y, 0.02]}>
              <boxGeometry args={[0.82, 0.03, 0.32]} />
              <meshStandardMaterial color="#5a3a1a" metalness={metalness} roughness={roughness} />
            </mesh>
          ))}
          {[0.42, 0.77, 1.12].map((y) => (
            <mesh key={y} position={[0, y, 0.02]}>
              <boxGeometry args={[0.04, 0.3, 0.3]} />
              <meshStandardMaterial color="#5a3a1a" metalness={metalness} roughness={roughness} />
            </mesh>
          ))}
        </group>
      );
    case 'tv-stand':
      return (
        <group>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1.2, 0.5, 0.4]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.6, -0.05]}>
            <boxGeometry args={[0.04, 0.55, 0.3]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.88, -0.05]}>
            <boxGeometry args={[0.9, 0.5, 0.03]} />
            <meshStandardMaterial color="#111" metalness={0.9} roughness={0.05} emissive="#112233" emissiveIntensity={0.3} />
          </mesh>
        </group>
      );
    case 'cabinet':
      return (
        <group>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.8, 0.9, 0.4]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[0.8, 0.1, 0.42]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[-0.15, 0.45, 0.21]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#c9a06b" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.15, 0.45, 0.21]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#c9a06b" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );
    case 'bed':
      return (
        <group>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.4, 0.4, 2]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.45, -0.85]}>
            <boxGeometry args={[1.4, 0.5, 0.12]} />
            <meshStandardMaterial color="#5a3a1a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.5, 0.1]}>
            <boxGeometry args={[1.3, 0.15, 1.6]} />
            <meshStandardMaterial color="#e8e0d3" metalness={0} roughness={0.9} />
          </mesh>
          <mesh position={[-0.45, 0.58, -0.2]}>
            <boxGeometry args={[0.5, 0.08, 0.6]} />
            <meshStandardMaterial color="#f5f0e8" metalness={0} roughness={0.95} />
          </mesh>
          <mesh position={[0.45, 0.58, -0.2]}>
            <boxGeometry args={[0.5, 0.08, 0.6]} />
            <meshStandardMaterial color="#f5f0e8" metalness={0} roughness={0.95} />
          </mesh>
        </group>
      );
    case 'desk':
      return (
        <group>
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[1.0, 0.05, 0.5]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          {[[-0.45, 0.19, -0.2], [0.45, 0.19, -0.2], [-0.45, 0.19, 0.2], [0.45, 0.19, 0.2]].map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <boxGeometry args={[0.04, 0.38, 0.04]} />
              <meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      );
    case 'painting':
      return (
        <group>
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[0.84, 0.64, 0.03]} />
            <meshStandardMaterial color="#3a2a1a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.7, 0.5]} />
            <meshStandardMaterial color={color} metalness={0.1} roughness={0.8} />
          </mesh>
        </group>
      );
    case 'mirror':
      return (
        <group>
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[0.64, 0.94, 0.03]} />
            <meshStandardMaterial color="#8a7a6a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[0.54, 0.84]} />
            <meshStandardMaterial color="#d0e8f0" metalness={0.95} roughness={0.05} envMapIntensity={1.5} />
          </mesh>
        </group>
      );
    case 'wall-shelf':
      return (
        <group>
          <mesh position={[0, 0, -0.06]}>
            <boxGeometry args={[0.04, 0.04, 0.14]} />
            <meshStandardMaterial color="#5a3a1a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.8, 0.04, 0.18]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'clock':
      return (
        <group>
          <mesh position={[0, 0, -0.02]}>
            <cylinderGeometry args={[0.17, 0.17, 0.04, 24]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <cylinderGeometry args={[0.14, 0.14, 0.01, 24]} />
            <meshStandardMaterial color="#f5f0e8" metalness={0} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.06, 0.015]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.01, 0.08, 0.005]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0.03, 0, 0.015]} rotation={[0, 0, -Math.PI / 2]}>
            <boxGeometry args={[0.008, 0.05, 0.005]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      );
    case 'tv-mount':
      return (
        <group>
          <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[1.14, 0.69, 0.04]} />
            <meshStandardMaterial color="#2a2a2a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.0, 0.6]} />
            <meshStandardMaterial color="#111" metalness={0.9} roughness={0.05} emissive="#0a1520" emissiveIntensity={0.5} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

export default function FurniturePiece({ obj }: { obj: SceneObject }) {
  const { selectedId, selectObject, roomDimensions, windowCoverings } = useStore();
  const isSelected = selectedId === obj.id;
  const wallItem = isWallItem(obj.type);

  const dims = useMemo(() => {
    const length = Math.max(2, Number.parseFloat(roomDimensions.length) || 5);
    const width = Math.max(2, Number.parseFloat(roomDimensions.width) || 4);
    const height = Math.max(2, Number.parseFloat(roomDimensions.height) || 3);
    return { length, width, height, halfLength: length / 2, halfWidth: width / 2 };
  }, [roomDimensions.length, roomDimensions.width, roomDimensions.height]);

  const worldPosition = useMemo(() => {
    if (wallItem) {
      const side = obj.wall ?? 'back';
      const offset = obj.wallOffset ?? 0;
      const vOffset = obj.wallVerticalOffset ?? 0;
      const itemDims = WALL_ITEM_DIMS[obj.type];
      const baseY = itemDims ? (obj.type === 'vent' ? dims.height - 0.3 : itemDims.fixedY) : 1;
      const y = baseY + vOffset;
      switch (side) {
        case 'left':  return ([-dims.halfLength + WALL_EPS, y, offset] as [number, number, number]);
        case 'right': return ([dims.halfLength - WALL_EPS, y, offset] as [number, number, number]);
        case 'front': return ([offset, y, dims.halfWidth - WALL_EPS] as [number, number, number]);
        default:      return ([offset, y, -dims.halfWidth + WALL_EPS] as [number, number, number]);
      }
    }
    return obj.position;
  }, [wallItem, obj.type, obj.wall, obj.wallOffset, obj.wallVerticalOffset, obj.position, dims.height, dims.halfLength, dims.halfWidth]);

  const worldRotation = useMemo(() => {
    if (wallItem) {
      switch (obj.wall ?? 'back') {
        case 'left':  return [0, Math.PI / 2, 0] as [number, number, number];
        case 'right': return [0, -Math.PI / 2, 0] as [number, number, number];
        case 'front': return [0, Math.PI, 0] as [number, number, number];
        default:      return [0, 0, 0] as [number, number, number];
      }
    }
    return [0, obj.rotationY, 0] as [number, number, number];
  }, [wallItem, obj.wall, obj.rotationY]);

  return (
    <group
      position={worldPosition}
      rotation={worldRotation}
      userData={{ furnitureId: obj.id, isFurniture: true }}
      onClick={(e) => {
        e.stopPropagation();
        selectObject(obj.id);
      }}
    >
      <group rotation={wallItem ? ([0, 0, obj.rotationZ ?? 0] as [number, number, number]) : ([0, 0, 0] as [number, number, number])}>
        <ShapeForType type={obj.type} color={obj.color} metalness={obj.metalness} roughness={obj.roughness} />
        {obj.type === 'window' && windowCoverings && (
          <group>
            <mesh position={[-0.58, 0.15, 0.04]}>
              <boxGeometry args={[0.12, 1.1, 0.02]} />
              <meshStandardMaterial color="#b8a898" metalness={0} roughness={0.9} />
            </mesh>
            <mesh position={[0.58, 0.15, 0.04]}>
              <boxGeometry args={[0.12, 1.1, 0.02]} />
              <meshStandardMaterial color="#b8a898" metalness={0} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.68, 0.04]}>
              <boxGeometry args={[1.2, 0.05, 0.03]} />
              <meshStandardMaterial color="#8a7a6a" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        )}
        {wallItem ? (
          isSelected && (
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[(WALL_ITEM_DIMS[obj.type]?.width ?? 0.8) + 0.12, (WALL_ITEM_DIMS[obj.type]?.height ?? 0.6) + 0.12]} />
              <meshBasicMaterial color="#93c5fd" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
          )
        ) : (
          isSelected && (
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.5, 0.55, 32]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
          )
        )}
      </group>
    </group>
  );
}
