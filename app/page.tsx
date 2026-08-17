'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageSquareText, PanelsLeftBottom } from 'lucide-react';
import ToolsPanel from '@/components/ToolsPanel';
import ChatPanel from '@/components/chat/ChatPanel';
import { restoreDesignLocally, saveDesignLocally, useStore } from '@/store/useStore';

// Three.js needs the browser, so load the Scene with SSR disabled
const Scene = dynamic(() => import('@/components/Scene'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-neutral-100" aria-label="Loading 3D room preview" />,
});

export default function Home() {
  const [showTools, setShowTools] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const objects = useStore((s) => s.objects);
  const roomDimensions = useStore((s) => s.roomDimensions);

  useEffect(() => {
    restoreDesignLocally();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveDesignLocally(), 1000);
    return () => clearTimeout(timer);
  }, [objects, roomDimensions]);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-neutral-50">
      <nav className="relative flex flex-col border-r border-neutral-200 bg-white" aria-label="Tools">
        <button
          type="button"
          onClick={() => setShowTools((value) => !value)}
          className="flex h-12 w-12 items-center justify-center border-b border-neutral-200 text-neutral-700 transition hover:bg-neutral-100"
          aria-label="Toggle tools panel"
        >
          <PanelsLeftBottom className="h-5 w-5" />
        </button>
        {showTools && (
          <>
            <div
              className="fixed inset-0 z-20 bg-black/30 md:hidden"
              onClick={() => setShowTools(false)}
              aria-hidden="true"
            />
            <div className="flex-1 min-h-0 w-80 max-w-[85vw] overflow-hidden border-r border-neutral-200 bg-white max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-30 max-md:shadow-xl">
              <ToolsPanel />
            </div>
          </>
        )}
      </nav>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative h-full min-h-0">
          <header className="absolute left-4 top-4 z-10 rounded bg-white/80 px-3 py-2 text-sm backdrop-blur">
            <h1 className="font-semibold text-base m-0 p-0">SpatialStager AI</h1>
            <p className="text-xs text-neutral-600">Drag to orbit · click an item to select and move it</p>
          </header>
          <Scene />
        </div>
      </section>

      <aside className="relative flex flex-col border-l border-neutral-200 bg-white" aria-label="Chat">
        <button
          type="button"
          onClick={() => setShowChat((value) => !value)}
          className="flex h-12 w-12 items-center justify-center border-b border-neutral-200 text-neutral-700 transition hover:bg-neutral-100"
          aria-label="Toggle chat panel"
        >
          <MessageSquareText className="h-5 w-5" />
        </button>
        {showChat && (
          <>
            <div
              className="fixed inset-0 z-20 bg-black/30 md:hidden"
              onClick={() => setShowChat(false)}
              aria-hidden="true"
            />
            <div className="flex min-h-0 w-96 max-w-[85vw] flex-1 flex-col overflow-hidden border-l border-neutral-200 bg-white max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-30 max-md:shadow-xl">
              <div className="shrink-0 border-b border-neutral-200 p-4">
              </div>
              <div className="min-h-0 flex-1 overflow-hidden p-4">
                <ChatPanel className="h-full" />
              </div>
            </div>
          </>
        )}
      </aside>
    </main>
  );
}
