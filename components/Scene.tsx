'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore, LightingMood, FloorMaterial } from '@/store/useStore';
import FurniturePiece from './FurniturePiece';

const FLOOR_COLORS: Record<FloorMaterial, string> = {
  wood: '#b98a5b',
  tile: '#d9d3c7',
  carpet: '#8c7a6b',
};

const MOOD_SETTINGS: Record<LightingMood, { intensity: number; color: string; ambient: number }> = {
  cozy: { intensity: 0.8, color: '#ffb87a', ambient: 0.5 },
  bright: { intensity: 1.4, color: '#ffffff', ambient: 0.9 },
  dramatic: { intensity: 0.5, color: '#8aa0ff', ambient: 0.25 },
  neutral: { intensity: 1.0, color: '#ffffff', ambient: 0.6 },
};

function Room() {
  const { wallColor, floorMaterial, objects } = useStore();
  const floorColor = FLOOR_COLORS[floorMaterial];

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, -3]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-3, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {objects.map((obj) => (
        <FurniturePiece key={obj.id} obj={obj} />
      ))}
    </group>
  );
}

export default function Scene() {
  const { lightingMood, selectObject } = useStore();
  const mood = MOOD_SETTINGS[lightingMood];

  return (
    <Canvas
      shadows
      camera={{ position: [5, 4, 5], fov: 45 }}
      onPointerMissed={() => selectObject(null)}
      className="!bg-neutral-100"
    >
      <ambientLight intensity={mood.ambient} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={mood.intensity}
        color={mood.color}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Room />
      <OrbitControls
        minPolarAngle={0.4}
        maxPolarAngle={1.3}
        minDistance={4}
        maxDistance={12}
      />
    </Canvas>
  );
}
