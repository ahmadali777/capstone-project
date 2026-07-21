'use client';

import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';

// Three.js needs the browser, so load the Scene with SSR disabled
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });

export default function Home() {
  return (
    <main className="flex h-screen w-screen">
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur rounded px-3 py-2 text-sm">
          <p className="font-semibold">SpatialStager AI</p>
          <p className="text-neutral-500 text-xs">Drag to orbit · click an item to select and move it</p>
        </div>
        <Scene />
      </div>
      <Sidebar />
    </main>
  );
}
