'use client';

import { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Lock, Move3D, RotateCw, ScanLine, SquareDashedMousePointer, Target } from 'lucide-react';
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      <mesh position={[0, 1.5, -3]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

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
  const [lockedAxis, setLockedAxis] = useState<'x' | 'y' | 'free'>('free');
  const [focusTarget, setFocusTarget] = useState<'wall' | 'room' | 'object'>('room');
  const controlsRef = useRef<any>(null);

  const controlButtons = useMemo(
    () => [
      { label: 'Lock view', icon: Lock, active: lockedAxis !== 'free' },
      { label: 'Lock X', icon: Move3D, active: lockedAxis === 'x' },
      { label: 'Lock Y', icon: RotateCw, active: lockedAxis === 'y' },
      { label: 'Focus wall', icon: Target, active: focusTarget === 'wall' },
      { label: 'Select item', icon: SquareDashedMousePointer, active: focusTarget === 'object' },
      { label: 'Recenter room', icon: ScanLine, active: false },
    ],
    [focusTarget, lockedAxis],
  );

  const handleControlAction = (label: string) => {
    if (label === 'Lock X') {
      setLockedAxis('x');
    } else if (label === 'Lock Y') {
      setLockedAxis('y');
    } else if (label === 'Lock view') {
      setLockedAxis('free');
    } else if (label === 'Focus wall') {
      setFocusTarget('wall');
    } else if (label === 'Select item') {
      setFocusTarget('object');
    } else if (label === 'Recenter room') {
      setLockedAxis('free');
      setFocusTarget('room');
      if (controlsRef.current) {
        controlsRef.current.object.position.set(0, 2.5, 7);
        controlsRef.current.target.set(0, 1.5, 0);
        controlsRef.current.update();
      }
    }
  };

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        camera={{ position: [0, 2.5, 7], fov: 45 }}
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
          ref={controlsRef}
          minPolarAngle={0.4}
          maxPolarAngle={1.3}
          minDistance={4}
          maxDistance={12}
          enablePan
          enableRotate
          enableZoom
        />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
        {controlButtons.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleControlAction(label)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              active
                ? 'border-neutral-800 bg-neutral-800 text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <span className="mr-1 inline-flex items-center">
              <Icon className="h-3.5 w-3.5" />
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
