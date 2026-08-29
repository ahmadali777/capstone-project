'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore, isWallItem, roomDims, SceneObject, type AssetType, type WallSide } from '@/store/useStore';
import SofaModel from './SofaModel';

export const WALL_EPS = 0.02;

export const WALL_ITEM_DIMS: Record<string, { width: number; height: number; halfWidth: number; fixedY: number }> = {
  door: { width: 3.0, height: 6.8, halfWidth: 1.5, fixedY: 3.4 },
  window: { width: 4.0, height: 4.0, halfWidth: 2.0, fixedY: 4.5 },
  vent: { width: 1.4, height: 0.7, halfWidth: 0.7, fixedY: 0 },
  painting: { width: 3.0, height: 2.5, halfWidth: 1.5, fixedY: 4.5 },
  mirror: { width: 2.5, height: 3.5, halfWidth: 1.25, fixedY: 4.5 },
  'wall-shelf': { width: 3.5, height: 0.16, halfWidth: 1.75, fixedY: 5.0 },
  clock: { width: 1.8, height: 1.8, halfWidth: 0.9, fixedY: 5.5 },
  'tv-mount': { width: 5.0, height: 3.0, halfWidth: 2.5, fixedY: 4.5 },
};

export function clampWallOffset(type: AssetType, wall: WallSide | undefined, raw: number, halfLength: number, halfWidth: number) {
  const dims = WALL_ITEM_DIMS[type];
  if (!dims) return raw;
  const margin = dims.halfWidth;
  const max = (wall === 'left' ? halfWidth : halfLength) - margin;
  return Math.min(max, Math.max(-max, raw));
}

const BOOK_COLORS = ['#8a4a3a', '#3f5a8a', '#4a7a4a', '#c9a06b', '#6b5a8a', '#7a5a3a'];
const BOOK_POSITIONS = [
  { x: -1.05, h: 0.5 },
  { x: -0.68, h: 0.62 },
  { x: -0.3, h: 0.46 },
  { x: 0.1, h: 0.58 },
  { x: 0.5, h: 0.5 },
  { x: 0.9, h: 0.6 },
];

function ShapeForType({ type, color, metalness, roughness }: { type: SceneObject['type']; color: string; metalness: number; roughness: number }) {
  switch (type) {
    case 'sofa':
      return <SofaModel color={color} metalness={metalness} roughness={roughness} />;
    case 'lamp':
      return (
        <group>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.36, 0.44, 0.16, 16]} />
            <meshStandardMaterial color="#444" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 1.65, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 3.1, 10]} />
            <meshStandardMaterial color="#444" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 3.35, 0]}>
            <cylinderGeometry args={[0.4, 0.68, 0.8, 20, 1, true]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );
    case 'plant':
      return (
        <group>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.7, 0.55, 1.2, 14]} />
            <meshStandardMaterial color="#7a5a3a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 2.0, 0]}>
            <sphereGeometry args={[1.4, 14, 14]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'table':
      return (
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.16, 28]} />
          <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
        </mesh>
      );
    case 'chair':
      return (
        <group>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[1.9, 0.14, 1.9]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 1.6, -0.85]}>
            <boxGeometry args={[1.9, 1.3, 0.14]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'rug':
      return (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8, 6]} />
          <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
        </mesh>
      );
    case 'door':
      return (
        <group>
          <mesh position={[0, 0, -0.12]}>
            <boxGeometry args={[3.1, 6.9, 0.1]} />
            <meshStandardMaterial color="#2f2a26" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.8, 6.6, 0.15]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0.85, -2.1, 0.16]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#c9a06b" metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'window':
      return (
        <group>
          <mesh position={[0, 0, -0.06]}>
            <boxGeometry args={[4.2, 4.0, 0.08]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[3.8, 3.6]} />
            <meshStandardMaterial color="#bfe3f5" transparent opacity={0.45} metalness={0.1} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[3.6, 0.18, 0.06]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.18, 3.6, 0.06]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'vent':
      return (
        <group>
          <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[1.4, 0.7, 0.06]} />
            <meshStandardMaterial color="#5b5b5b" metalness={metalness} roughness={roughness} />
          </mesh>
          {[-0.24, 0, 0.24].map((dy) => (
            <mesh key={dy} position={[0, dy, 0.02]}>
              <boxGeometry args={[1.2, 0.12, 0.05]} />
              <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
            </mesh>
          ))}
        </group>
      );
    case 'bookshelf':
      return (
        <group>
          <mesh position={[0, 2.3, 0]}>
            <boxGeometry args={[3.0, 4.6, 1.0]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 2.3, -0.44]}>
            <boxGeometry args={[2.78, 4.42, 0.04]} />
            <meshStandardMaterial color="#3a2a1a" metalness={metalness} roughness={roughness} />
          </mesh>
          {[[-1.45, 2.3, 0], [1.45, 2.3, 0]].map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <boxGeometry args={[0.14, 4.6, 1.0]} />
              <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
            </mesh>
          ))}
          <mesh position={[0, 4.55, 0]}>
            <boxGeometry args={[3.12, 0.16, 1.08]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[3.0, 0.24, 1.0]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          {[1.15, 2.3, 3.45].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[2.78, 0.14, 0.96]} />
              <meshStandardMaterial color="#5a3a1a" metalness={metalness} roughness={roughness} />
            </mesh>
          ))}
          {[1.15, 2.3, 3.45].map((shelfY, sj) =>
            BOOK_POSITIONS.map((book, bi) => (
              <mesh key={`${sj}-${bi}`} position={[book.x, shelfY + 0.07 + book.h / 2, 0]}>
                <boxGeometry args={[0.26, book.h, 0.62]} />
                <meshStandardMaterial color={BOOK_COLORS[(sj * 3 + bi) % BOOK_COLORS.length]} metalness={0} roughness={0.8} />
              </mesh>
            )),
          )}
        </group>
      );
    case 'tv-stand':
      return (
        <group>
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[6.0, 1.9, 1.4]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.95, -0.08]}>
            <boxGeometry args={[5.8, 1.7, 0.12]} />
            <meshStandardMaterial color="#3a2a1a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 3.2, -0.2]}>
            <boxGeometry args={[5.2, 3.0, 0.12]} />
            <meshStandardMaterial color="#111" metalness={0.9} roughness={0.05} emissive="#0a1520" emissiveIntensity={0.5} />
          </mesh>
        </group>
      );
    case 'cabinet':
      return (
        <group>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[5.5, 0.24, 1.8]} />
            <meshStandardMaterial color="#3a2a1a" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 2.4, 0]}>
            <boxGeometry args={[5.4, 4.4, 1.7]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[-1.35, 2.45, 0.78]}>
            <boxGeometry args={[2.6, 4.1, 0.12]} />
            <meshStandardMaterial color={color} metalness={0.15} roughness={0.5} />
          </mesh>
          <mesh position={[1.35, 2.45, 0.78]}>
            <boxGeometry args={[2.6, 4.1, 0.12]} />
            <meshStandardMaterial color={color} metalness={0.15} roughness={0.5} />
          </mesh>
          <mesh position={[-0.12, 2.45, 0.88]}>
            <boxGeometry args={[0.06, 0.5, 0.06]} />
            <meshStandardMaterial color="#c9a06b" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.12, 2.45, 0.88]}>
            <boxGeometry args={[0.06, 0.5, 0.06]} />
            <meshStandardMaterial color="#c9a06b" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 4.56, 0]}>
            <boxGeometry args={[5.72, 0.18, 1.94]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'bed':
      return (
        <group>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[5.2, 1.2, 6.6]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 1.25, 0]}>
            <boxGeometry args={[5.0, 0.55, 6.4]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 1.5, -3.15]}>
            <boxGeometry args={[5.2, 2.0, 0.45]} />
            <meshStandardMaterial color="#5a3a1a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[-1.4, 1.85, -0.55]}>
            <boxGeometry args={[1.9, 0.25, 2.4]} />
            <meshStandardMaterial color="#f2ece2" metalness={0} roughness={0.95} />
          </mesh>
          <mesh position={[1.4, 1.85, -0.55]}>
            <boxGeometry args={[1.9, 0.25, 2.4]} />
            <meshStandardMaterial color="#f2ece2" metalness={0} roughness={0.95} />
          </mesh>
        </group>
      );
    case 'desk':
      return (
        <group>
          <mesh position={[0, 2.4, 0]}>
            <boxGeometry args={[5.0, 0.15, 2.4]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          {[[-2.3, 1.2, -1.05], [2.3, 1.2, -1.05], [-2.3, 1.2, 1.05], [2.3, 1.2, 1.05]].map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <boxGeometry args={[0.1, 2.4, 0.1]} />
              <meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      );
    case 'painting':
      return (
        <group>
          <mesh position={[0, 0, -0.06]}>
            <boxGeometry args={[3.2, 2.7, 0.08]} />
            <meshStandardMaterial color="#3a2a1a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2.9, 2.4]} />
            <meshStandardMaterial color={color} metalness={0.1} roughness={0.8} />
          </mesh>
        </group>
      );
    case 'mirror':
      return (
        <group>
          <mesh position={[0, 0, -0.06]}>
            <boxGeometry args={[2.7, 3.7, 0.1]} />
            <meshStandardMaterial color="#8a7a6a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[2.4, 3.4]} />
            <meshStandardMaterial color="#d0e8f0" metalness={0.95} roughness={0.05} envMapIntensity={1.5} />
          </mesh>
        </group>
      );
    case 'wall-shelf':
      return (
        <group>
          <mesh position={[0, 0, -0.12]}>
            <boxGeometry args={[0.1, 0.1, 0.24]} />
            <meshStandardMaterial color="#5a3a1a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[3.5, 0.12, 0.7]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    case 'clock':
      return (
        <group>
          <mesh position={[0, 0, -0.05]}>
            <cylinderGeometry args={[0.8, 0.8, 0.14, 40]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <cylinderGeometry args={[0.68, 0.68, 0.04, 40]} />
            <meshStandardMaterial color="#f5f0e8" metalness={0} roughness={0.9} />
          </mesh>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.sin(a) * 0.56, Math.cos(a) * 0.56, 0.045]}>
                <boxGeometry args={[0.05, 0.15, 0.015]} />
                <meshStandardMaterial color="#4a4a4a" />
              </mesh>
            );
          })}
          <mesh position={[0, 0, 0.055]} rotation={[0, 0, 5.236]}>
            <boxGeometry args={[0.09, 0.46, 0.02]} />
            <meshStandardMaterial color="#2e2e2e" />
          </mesh>
          <mesh position={[0, 0, 0.062]} rotation={[0, 0, 1.047]}>
            <boxGeometry args={[0.06, 0.62, 0.017]} />
            <meshStandardMaterial color="#2e2e2e" />
          </mesh>
          <mesh position={[0, 0, 0.07]}>
            <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
            <meshStandardMaterial color="#c9a06b" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );
    case 'tv-mount':
      return (
        <group>
          <mesh position={[0, 0, -0.08]}>
            <boxGeometry args={[5.2, 3.1, 0.1]} />
            <meshStandardMaterial color="#2a2a2a" metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[5.0, 3.0]} />
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
    const { length, width, height } = roomDims({ length: roomDimensions.length, width: roomDimensions.width, height: roomDimensions.height });
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
            <mesh position={[-2.05, 0.6, 0.1]}>
              <boxGeometry args={[0.35, 4.4, 0.05]} />
              <meshStandardMaterial color="#b8a898" metalness={0} roughness={0.9} />
            </mesh>
            <mesh position={[2.05, 0.6, 0.1]}>
              <boxGeometry args={[0.35, 4.4, 0.05]} />
              <meshStandardMaterial color="#b8a898" metalness={0} roughness={0.9} />
            </mesh>
            <mesh position={[0, 2.2, 0.1]}>
              <boxGeometry args={[4.6, 0.15, 0.06]} />
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
