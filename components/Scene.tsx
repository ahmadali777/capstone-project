'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, OrbitControls } from '@react-three/drei';
import { ScanLine, Sparkles } from 'lucide-react';
import { useStore, LightingMood, FloorMaterial, orbitControlsRef, canvasRef } from '@/store/useStore';
import FurniturePiece from './FurniturePiece';
import SceneFallback from './SceneFallback';

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
  const { wallColor, floorMaterial, objects, roomDimensions } = useStore();
  const floorColor = FLOOR_COLORS[floorMaterial];
  const dims = useMemo(
    () => ({
      length: Math.max(2, Number.parseFloat(roomDimensions.length) || 5),
      width: Math.max(2, Number.parseFloat(roomDimensions.width) || 4),
      height: Math.max(2, Number.parseFloat(roomDimensions.height) || 3),
    }),
    [roomDimensions.length, roomDimensions.width, roomDimensions.height],
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[dims.length, dims.width]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      <mesh position={[0, dims.height / 2, -dims.width / 2]} receiveShadow>
        <planeGeometry args={[dims.length, dims.height]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh position={[-dims.length / 2, dims.height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[dims.width, dims.height]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {objects.map((obj) => (
        <Suspense key={obj.id} fallback={null}>
          <FurniturePiece obj={obj} />
        </Suspense>
      ))}
    </group>
  );
}

export default function Scene() {
  const { lightingMood } = useStore();
  const mood = MOOD_SETTINGS[lightingMood];
  const [autoRotate, setAutoRotate] = useState(false);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) orbitControlsRef.current = controlsRef.current;
    return () => {
      orbitControlsRef.current = null;
    };
  }, []);

  const caps = useMemo(() => {
    if (typeof window === 'undefined') return { lowPower: false, reducedMotion: false, webgl: true };
    const nav = navigator as Navigator & { hardwareConcurrency?: number };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = (nav.hardwareConcurrency ?? 8) <= 2;
    const webgl = (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
      } catch {
        return false;
      }
    })();
    return { lowPower, reducedMotion, webgl };
  }, []);

  if (!caps.webgl || caps.lowPower || caps.reducedMotion) {
    return <SceneFallback />;
  }

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows={!caps.lowPower}
        dpr={caps.lowPower ? [1, 1] : [1, 1.75]}
        gl={{ antialias: !caps.lowPower, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
        camera={{ position: [0, 2.5, 7], fov: 45 }}
        onPointerMissed={() => useStore.getState().selectObject(null)}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
        }}
        className="!bg-neutral-100"
      >
        <AdaptiveDpr pixelated />
        <ambientLight intensity={mood.ambient} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={mood.intensity}
          color={mood.color}
          castShadow={!caps.lowPower}
          shadow-mapSize={caps.lowPower ? [512, 512] : [1024, 1024]}
        />
        <Room />
        <OrbitControls
          ref={controlsRef}
          minPolarAngle={0.4}
          maxPolarAngle={1.3}
          minDistance={4}
          maxDistance={12}
          enablePan={!caps.reducedMotion}
          enableRotate={!caps.reducedMotion}
          enableZoom={!caps.reducedMotion}
          enableDamping
          autoRotate={autoRotate && !caps.reducedMotion}
          autoRotateSpeed={1.5}
        />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={() => setAutoRotate((value) => !value)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            autoRotate
              ? 'border-neutral-800 bg-neutral-800 text-white'
              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <Sparkles className="mr-1 inline-flex h-3.5 w-3.5" />
          {autoRotate ? 'Stop rotate' : 'Auto-rotate'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (controlsRef.current) {
              controlsRef.current.object.position.set(0, 2.5, 7);
              controlsRef.current.target.set(0, 1.5, 0);
              controlsRef.current.update();
            }
          }}
          className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
        >
          <ScanLine className="mr-1 inline-flex h-3.5 w-3.5" />
          Recenter
        </button>
      </div>
    </div>
  );
}
