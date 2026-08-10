'use client';

import { useStore, FloorMaterial } from '@/store/useStore';

const FLOOR_COLORS: Record<FloorMaterial, string> = {
  wood: '#b98a5b',
  tile: '#d9d3c7',
  carpet: '#8c7a6b',
};

const ASSET_EMOJI: Record<string, string> = {
  sofa: '🛋️',
  lamp: '💡',
  plant: '🪴',
  table: '🟤',
  chair: '🪑',
  rug: '🟫',
  door: '🚪',
  window: '🪟',
  vent: '🌀',
};

const SPOTS = [
  { x: 130, y: 175 },
  { x: 210, y: 150 },
  { x: 290, y: 190 },
  { x: 160, y: 220 },
  { x: 260, y: 235 },
  { x: 330, y: 165 },
];

export default function SceneFallback() {
  const { wallColor, floorMaterial, objects } = useStore();
  const floorColor = FLOOR_COLORS[floorMaterial];

  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 p-6">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <svg viewBox="0 0 400 300" className="block w-full" role="img" aria-label="Static room preview">
            <polygon points="0,160 400,160 400,300 0,300" fill={floorColor} />
            <polygon points="0,160 200,70 400,160 400,160" fill={wallColor} opacity={0.9} />
            <line x1="0" y1="160" x2="400" y2="160" stroke="#00000022" strokeWidth="2" />
            {objects.slice(0, 6).map((obj, i) => (
              <g key={obj.id} transform={`translate(${SPOTS[i].x} ${SPOTS[i].y})`}>
                <circle r="11" fill={obj.color} stroke="#00000022" />
                <text x="0" y="4" textAnchor="middle" fontSize="12">
                  {ASSET_EMOJI[obj.type] ?? '•'}
                </text>
              </g>
            ))}
          </svg>
          <p className="border-t border-neutral-100 bg-neutral-50 px-4 py-2 text-center text-xs text-neutral-500">
            Static preview — WebGL isn&apos;t available on this device, so the interactive 3D room is skipped.
          </p>
        </div>
      </div>
    </div>
  );
}
