'use client';

import { Component, type ReactNode, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

class SofaErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function SofaGlb({ color, metalness, roughness }: { color: string; metalness: number; roughness: number }) {
  const { scene } = useGLTF('/models/sofa.glb');
  const copy = useMemo(() => scene.clone(true), [scene]);
  const bounds = useMemo(() => new THREE.Box3().setFromObject(copy), [copy]);
  const size = useMemo(() => bounds.getSize(new THREE.Vector3()), [bounds]);
  const scale = useMemo(() => 6.8 / Math.max(size.x, size.z, 0.001), [size]);

  copy.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mesh.material) {
        const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        if (material instanceof THREE.MeshStandardMaterial) {
          material.color.set(color);
          material.metalness = metalness;
          material.roughness = roughness;
        }
      }
    }
  });

  return (
    <group scale={scale}>
      <primitive object={copy} />
    </group>
  );
}

function ProceduralSofa({ color, metalness, roughness }: { color: string; metalness: number; roughness: number }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[7.0, 0.6, 3.8]} />
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[0, 1.15, -1.85]} castShadow>
        <boxGeometry args={[7.0, 0.95, 0.6]} />
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[-3.12, 0.75, 0]} castShadow>
        <boxGeometry args={[0.75, 1.4, 4.2]} />
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[3.12, 0.75, 0]} castShadow>
        <boxGeometry args={[0.75, 1.4, 4.2]} />
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[-1.7, 1.12, -0.3]}>
        <boxGeometry args={[3.15, 0.32, 3.1]} />
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[1.7, 1.12, -0.3]}>
        <boxGeometry args={[3.15, 0.32, 3.1]} />
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      </mesh>
    </group>
  );
}

export default function SofaModel({ color, metalness, roughness }: { color: string; metalness: number; roughness: number }) {
  return (
    <SofaErrorBoundary fallback={<ProceduralSofa color={color} metalness={metalness} roughness={roughness} />}>
      <SofaGlb color={color} metalness={metalness} roughness={roughness} />
    </SofaErrorBoundary>
  );
}
