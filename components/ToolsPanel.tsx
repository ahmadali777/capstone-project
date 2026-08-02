'use client';

import { useMemo, useState } from 'react';
import { useStore, type AssetType } from '@/store/useStore';

type RoomType = 'room' | 'living-room' | 'washroom' | 'kitchen';

type RoomCatalog = {
  id: RoomType;
  label: string;
  items: { type: AssetType; label: string; emoji: string }[];
};

const ROOM_CATALOG: RoomCatalog[] = [
  {
    id: 'room',
    label: 'Room',
    items: [
      { type: 'sofa', label: 'Sofa', emoji: '🛋️' },
      { type: 'chair', label: 'Chair', emoji: '🪑' },
      { type: 'table', label: 'Table', emoji: '🟤' },
      { type: 'lamp', label: 'Lamp', emoji: '💡' },
      { type: 'plant', label: 'Plant', emoji: '🪴' },
      { type: 'rug', label: 'Rug', emoji: '🟫' },
    ],
  },
  {
    id: 'living-room',
    label: 'Living Room',
    items: [
      { type: 'sofa', label: 'Sofa', emoji: '🛋️' },
      { type: 'chair', label: 'Accent Chair', emoji: '🪑' },
      { type: 'table', label: 'Coffee Table', emoji: '🟤' },
      { type: 'lamp', label: 'Floor Lamp', emoji: '💡' },
      { type: 'plant', label: 'Indoor Plant', emoji: '🪴' },
      { type: 'rug', label: 'Area Rug', emoji: '🟫' },
    ],
  },
  {
    id: 'washroom',
    label: 'Washroom',
    items: [
      { type: 'table', label: 'Vanity', emoji: '🪞' },
      { type: 'chair', label: 'Stool', emoji: '🪑' },
      { type: 'lamp', label: 'Mirror Light', emoji: '💡' },
      { type: 'plant', label: 'Small Plant', emoji: '🪴' },
      { type: 'rug', label: 'Bath Mat', emoji: '🧺' },
      { type: 'sofa', label: 'Bench', emoji: '🛋️' },
    ],
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    items: [
      { type: 'table', label: 'Dining Table', emoji: '🪑' },
      { type: 'chair', label: 'Dining Chair', emoji: '🪑' },
      { type: 'lamp', label: 'Pendant Light', emoji: '💡' },
      { type: 'plant', label: 'Herb Pot', emoji: '🪴' },
      { type: 'rug', label: 'Runner Rug', emoji: '🟫' },
      { type: 'sofa', label: 'Breakfast Bench', emoji: '🛋️' },
    ],
  },
];

const UNIT_OPTIONS = ['ft', 'm', 'cm', 'in'];

export default function ToolsPanel() {
  const { addObject, selectedId, removeObject } = useStore();
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('room');
  const [unit, setUnit] = useState('ft');
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });

  const activeCatalog = useMemo(
    () => ROOM_CATALOG.find((room) => room.id === selectedRoom) ?? ROOM_CATALOG[0],
    [selectedRoom],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="shrink-0 border-b border-neutral-200 p-4">
        <h2 className="mb-2 font-semibold text-neutral-800">1. Choose your space</h2>
        <select
          value={selectedRoom}
          onChange={(event) => setSelectedRoom(event.target.value as RoomType)}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        >
          {ROOM_CATALOG.map((room) => (
            <option key={room.id} value={room.id}>
              {room.label}
            </option>
          ))}
        </select>
      </div>

      <div className="shrink-0 border-b border-neutral-200 p-4">
        <h2 className="mb-2 font-semibold text-neutral-800">2. Room dimensions</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Length"
            value={dimensions.length}
            onChange={(event) => setDimensions((current) => ({ ...current, length: event.target.value }))}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Width"
            value={dimensions.width}
            onChange={(event) => setDimensions((current) => ({ ...current, width: event.target.value }))}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Height"
            value={dimensions.height}
            onChange={(event) => setDimensions((current) => ({ ...current, height: event.target.value }))}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <select
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            {UNIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-2 font-semibold text-neutral-800">3. Suggested items</h2>
        <p className="mb-3 text-xs text-neutral-500">
          Items for {activeCatalog.label.toLowerCase()} are shown below.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {activeCatalog.items.map((asset) => (
            <button
              key={asset.type + asset.label}
              onClick={() => addObject(asset.type)}
              className="flex flex-col items-center gap-1 rounded border border-neutral-200 p-2 text-xs hover:bg-neutral-50"
            >
              <span className="text-xl">{asset.emoji}</span>
              {asset.label}
            </button>
          ))}
        </div>
        {selectedId && (
          <button
            onClick={() => removeObject(selectedId)}
            className="mt-4 text-xs text-red-600 underline"
          >
            Delete selected item
          </button>
        )}
      </div>
    </div>
  );
}
