'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { AdaptiveDpr, OrbitControls } from '@react-three/drei';
import { ScanLine, Sparkles, Undo2, Redo2, Trash2, RotateCw } from 'lucide-react';
import * as THREE from 'three';
import { useStore, useTemporalStore, LightingMood, FloorMaterial, WallTexture, roomDims, orbitControlsRef, canvasRef, type WallSide } from '@/store/useStore';
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

const WALL_TEXTURE_COLORS: Record<WallTexture, string> = {
  none: '',
  brick: '#b5654a',
  'wood-panel': '#9a7a5a',
  wallpaper: '#d4c4b0',
  tile: '#e0d8cc',
};

function Room({ onWallClick }: { onWallClick?: (side: WallSide) => void }) {
  const { wallColor, floorMaterial, objects, roomDimensions, wallTexture, ceilingVisible, ceilingColor, selectedWall } = useStore();
  const { camera, gl, scene } = useThree();
  const floorColor = FLOOR_COLORS[floorMaterial];
  const textureColor = WALL_TEXTURE_COLORS[wallTexture];
  const frontRaycaster = useRef(new THREE.Raycaster());
  const ndc = useRef(new THREE.Vector2());
  const dims = useMemo(
    () => roomDims({ length: roomDimensions.length, width: roomDimensions.width, height: roomDimensions.height }),
    [roomDimensions.length, roomDimensions.width, roomDimensions.height],
  );

  const wallMaterial = useCallback(
    (_side: WallSide) => {
      if (wallTexture === 'none') return <meshStandardMaterial color={wallColor} />;
      return (
        <>
          <meshStandardMaterial color={wallColor} />
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color={textureColor} transparent opacity={0.25} />
          </mesh>
        </>
      );
    },
    [wallColor, wallTexture, textureColor],
  );

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[dims.length, dims.width]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* Back wall */}
      <mesh
        position={[0, dims.height / 2, -dims.width / 2]}
        onClick={(e) => { e.stopPropagation(); onWallClick?.('back'); }}
      >
        <planeGeometry args={[dims.length, dims.height]} />
        {wallMaterial('back')}
      </mesh>
      {selectedWall === 'back' && (
        <mesh position={[0, dims.height / 2, -dims.width / 2 + 0.01]}>
          <planeGeometry args={[dims.length, dims.height]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} />
        </mesh>
      )}

      {/* Left wall */}
      <mesh
        position={[-dims.length / 2, dims.height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={(e) => { e.stopPropagation(); onWallClick?.('left'); }}
      >
        <planeGeometry args={[dims.width, dims.height]} />
        {wallMaterial('left')}
      </mesh>
      {selectedWall === 'left' && (
        <mesh position={[-dims.length / 2 + 0.01, dims.height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[dims.width, dims.height]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} />
        </mesh>
      )}

      {/* Right wall */}
      <mesh
        position={[dims.length / 2, dims.height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={(e) => { e.stopPropagation(); onWallClick?.('right'); }}
      >
        <planeGeometry args={[dims.width, dims.height]} />
        {wallMaterial('right')}
      </mesh>
      {selectedWall === 'right' && (
        <mesh position={[dims.length / 2 - 0.01, dims.height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[dims.width, dims.height]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} />
        </mesh>
      )}

      {/* Front wall (view wall — translucent, same colour, click-through to items) */}
      <mesh
        position={[0, dims.height / 2, dims.width / 2]}
        rotation={[0, Math.PI, 0]}
        userData={{ isWall: true }}
        onClick={(e) => {
          e.stopPropagation();
          const ev = e.nativeEvent as PointerEvent;
          const rect = gl.domElement.getBoundingClientRect();
          ndc.current.set(
            ((ev.clientX - rect.left) / rect.width) * 2 - 1,
            -((ev.clientY - rect.top) / rect.height) * 2 + 1,
          );
          frontRaycaster.current.setFromCamera(ndc.current, camera);
          const hits = frontRaycaster.current.intersectObjects(scene.children, true);
          for (const hit of hits) {
            let node: THREE.Object3D | null = hit.object;
            while (node) {
              const fId = node.userData?.furnitureId;
              if (typeof fId === 'string') {
                useStore.getState().selectObject(fId);
                return;
              }
              node = node.parent;
            }
          }
          onWallClick?.('front');
        }}
      >
        <planeGeometry args={[dims.length, dims.height]} />
        <meshStandardMaterial color={wallColor} transparent opacity={0.12} />
      </mesh>
      {selectedWall === 'front' && (
        <mesh position={[0, dims.height / 2, dims.width / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[dims.length, dims.height]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} />
        </mesh>
      )}

      {/* Ceiling */}
      {ceilingVisible && (
        <mesh position={[0, dims.height, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[dims.length, dims.width]} />
          <meshStandardMaterial color={ceilingColor} side={THREE.BackSide} />
        </mesh>
      )}

      {/* Ceiling light fixture */}
      {ceilingVisible && (
        <group position={[0, dims.height - 0.05, 0]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.2, 0.08, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.18, 0.02, 0.12, 16]} />
            <meshStandardMaterial color="#fff8e8" emissive="#fff0d0" emissiveIntensity={0.6} transparent opacity={0.85} />
          </mesh>
        </group>
      )}

      {objects.map((obj) => (
        <Suspense key={obj.id} fallback={null}>
          <FurniturePiece obj={obj} />
        </Suspense>
      ))}
    </group>
  );
}

function DPadBtn({ label, onDown }: { label: string; onDown: () => void }) {
  return (
    <button
      type="button"
      onPointerDown={(e) => { e.preventDefault(); onDown(); }}
      className="flex items-center justify-center rounded bg-white/90 border border-neutral-300 text-lg font-bold text-neutral-700 active:bg-blue-100 active:text-blue-700 select-none shadow-sm"
    >
      {label}
    </button>
  );
}

export default function Scene() {
  const { lightingMood, setSelectedWall, selectedWall, selectedId, moveObjectByDirection, removeObject, objects, rotateObject, setObjectRotationZ, roomDimensions } = useStore();
  const { undo, redo, pastStates, futureStates } = useTemporalStore();
  const mood = MOOD_SETTINGS[lightingMood];
  const [autoRotate, setAutoRotate] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const controlsRef = useRef<any>(null);

  const dims = useMemo(
    () => roomDims({ length: roomDimensions.length, width: roomDimensions.width, height: roomDimensions.height }),
    [roomDimensions.length, roomDimensions.width, roomDimensions.height],
  );
  const cameraDistance = useMemo(() => Math.max(dims.length, dims.width, 4) * 1.45, [dims.length, dims.width]);
  const cameraPosition = useMemo(() => [0, dims.height * 0.5, cameraDistance] as [number, number, number], [dims.height, cameraDistance]);
  const cameraTarget = useMemo(() => [0, dims.height * 0.38, 0] as [number, number, number], [dims.height]);
  const maxOrbitDistance = useMemo(() => Math.max(dims.length, dims.width) * 2, [dims.length, dims.width]);

  useEffect(() => {
    if (controlsRef.current) orbitControlsRef.current = controlsRef.current;
    return () => {
      orbitControlsRef.current = null;
    };
  }, []);

  useEffect(() => {
    const check = () => setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const currentId = useStore.getState().selectedId;
      if (!currentId) return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); moveObjectByDirection(currentId, 'left'); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); moveObjectByDirection(currentId, 'right'); }
      else if (e.key === 'ArrowUp')    { e.preventDefault(); moveObjectByDirection(currentId, 'up'); }
      else if (e.key === 'ArrowDown')  { e.preventDefault(); moveObjectByDirection(currentId, 'down'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moveObjectByDirection]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z') { e.preventDefault(); undo(); }
      else if (mod && e.key === 'y') { e.preventDefault(); redo(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        removeObject(selectedId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, undo, redo, removeObject]);

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
        dpr={caps.lowPower ? [1, 1] : [1, 1.75]}
        gl={{ antialias: !caps.lowPower, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
        camera={{ position: cameraPosition, fov: 45 }}
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
        />
        <Room onWallClick={(side) => {
          setSelectedWall(selectedWall === side ? null : side);
        }} />
        <OrbitControls
          ref={controlsRef}
          target={cameraTarget}
          minPolarAngle={0.4}
          maxPolarAngle={1.3}
          minDistance={5}
          maxDistance={maxOrbitDistance}
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
          onClick={() => undo()}
          disabled={pastStates.length === 0}
          className="rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => redo()}
          disabled={futureStates.length === 0}
          className="rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>
        {selectedId && (() => {
          const obj = objects.find((o) => o.id === selectedId);
          if (!obj) return null;
          const onWall = obj.wall != null;
          const newRotationY = obj.rotationY + Math.PI / 2;
          return (
            <>
              <button
                type="button"
                onClick={() => onWall ? setObjectRotationZ(selectedId, (obj.rotationZ ?? 0) >= Math.PI / 2 - 0.001 ? 0 : Math.PI / 2) : rotateObject(selectedId, newRotationY)}
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                title={onWall ? 'Rotate item (vertical/horizontal)' : 'Rotate item 90°'}
              >
                <RotateCw className="h-3.5 w-3.5" />
                Rotate
              </button>
              <button
                type="button"
                onClick={() => removeObject(selectedId)}
                className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                title="Delete (Del)"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </>
          );
        })()}
        <div className="mx-1 h-4 w-px bg-neutral-300" />
        {selectedId && (() => {
          const obj = objects.find((o) => o.id === selectedId);
          if (!obj) return null;
          return (
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-medium text-emerald-700 capitalize">
              {obj.type.replace('-', ' ')}{obj.wall ? ` · ${obj.wall} wall` : ''} — selected
            </span>
          );
        })()}
        {selectedWall && !selectedId && (
          <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-medium text-blue-700 capitalize">
            {selectedWall} wall selected
          </span>
        )}
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
              controlsRef.current.object.position.set(0, dims.height * 0.5, cameraDistance);
              controlsRef.current.target.set(0, dims.height * 0.38, 0);
              controlsRef.current.update();
            }
          }}
          className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
        >
          <ScanLine className="mr-1 inline-flex h-3.5 w-3.5" />
          Recenter
        </button>
      </div>

      {isMobile && selectedId && (
        <div className="absolute bottom-20 right-4 z-10 grid grid-cols-3 grid-rows-3 gap-1" style={{ width: 144, height: 144 }}>
          <div />
          <DPadBtn label="↑" onDown={() => moveObjectByDirection(selectedId, 'up')} />
          <div />
          <DPadBtn label="←" onDown={() => moveObjectByDirection(selectedId, 'left')} />
          <div className="flex items-center justify-center rounded bg-neutral-200 text-[10px] font-bold text-neutral-500">MOVE</div>
          <DPadBtn label="→" onDown={() => moveObjectByDirection(selectedId, 'right')} />
          <div />
          <DPadBtn label="↓" onDown={() => moveObjectByDirection(selectedId, 'down')} />
          <div />
        </div>
      )}
    </div>
  );
}
