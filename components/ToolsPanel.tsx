'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, PaintBucket, RotateCcw, Trash2, Undo2, Redo2, AlertTriangle, DoorOpen, AppWindow, Fan } from 'lucide-react';
import {
  isWallItem,
  useStore,
  useTemporalStore,
  type AssetType,
  type Surface,
  SURFACE_TO_MATERIAL,
} from '@/store/useStore';
import type { FloorMaterial, LightingMood, WallSide } from '@/store/useStore';
import ExportControls from './ExportControls';

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

const WALL_PAINTS = [
  { name: 'Ivory', value: '#f5f1e8' },
  { name: 'Bone', value: '#e8e1d5' },
  { name: 'Sage', value: '#b5c4b1' },
  { name: 'Slate', value: '#a9b7c9' },
  { name: 'Blue Grey', value: '#6d7a8f' },
  { name: 'Dusty Rose', value: '#c9a9a6' },
  { name: 'Oatmeal', value: '#d9c7b8' },
  { name: 'Linen', value: '#f2e2b8' },
];

const PIECE_COLORS = [
  '#a3785c',
  '#6b6f8a',
  '#3f7d4e',
  '#f2d16b',
  '#c9a06b',
  '#8a6b4f',
  '#d97b6c',
  '#4a5f7a',
  '#2f3e34',
  '#e8e0d3',
];

const FLOOR_OPTIONS: { id: FloorMaterial; label: string; swatch: string }[] = [
  { id: 'wood', label: 'Wood', swatch: '#b98a5b' },
  { id: 'tile', label: 'Tile', swatch: '#d9d3c7' },
  { id: 'carpet', label: 'Carpet', swatch: '#8c7a6b' },
];

const MOOD_OPTIONS: { id: LightingMood; label: string }[] = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'bright', label: 'Bright' },
  { id: 'cozy', label: 'Cozy' },
  { id: 'dramatic', label: 'Dramatic' },
];

const SURFACE_OPTIONS: { id: Surface; label: string }[] = [
  { id: 'matte', label: 'Matte' },
  { id: 'satin', label: 'Satin' },
  { id: 'glossy', label: 'Glossy' },
];

const WALL_CATALOG: { type: AssetType; label: string; Icon: typeof DoorOpen }[] = [
  { type: 'door', label: 'Door', Icon: DoorOpen },
  { type: 'window', label: 'Window', Icon: AppWindow },
  { type: 'vent', label: 'Vent', Icon: Fan },
];

function Swatch({
  color,
  label,
  selected,
  onClick,
}: {
  color: string;
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={`${label} ${selected ? '(selected)' : ''}`}
      aria-pressed={selected}
      className={`h-8 w-8 rounded-full border-2 transition ${
        selected ? 'border-neutral-900 ring-2 ring-neutral-900/20' : 'border-neutral-200 hover:scale-110'
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

export default function ToolsPanel() {
  const {
    addObject,
    selectedId,
    removeObject,
    selectedRoom,
    setSelectedRoom,
    roomDimensions,
    setRoomDimensions,
    wallColor,
    setWallColor,
    floorMaterial,
    setFloorMaterial,
    lightingMood,
    setLightingMood,
    objects,
    overlappingIds,
    setObjectColor,
    setObjectSurface,
    rotateObject,
    setWallSide,
    resetLayout,
  } = useStore();
  const { undo, redo, pastStates, futureStates } = useTemporalStore();
  const [unit, setUnit] = useState(roomDimensions.unit);

  const activeCatalog = useMemo(
    () => ROOM_CATALOG.find((room) => room.id === selectedRoom) ?? ROOM_CATALOG[0],
    [selectedRoom],
  );
  const selected = objects.find((obj) => obj.id === selectedId) ?? null;
  const selectedSurface =
    selected == null
      ? null
      : (SURFACE_OPTIONS.find(
          (s) => SURFACE_TO_MATERIAL[s.id].metalness === selected.metalness && SURFACE_TO_MATERIAL[s.id].roughness === selected.roughness,
        )?.id ?? 'satin');

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto">
        <ExportControls />
        {/* 1. Space */}
        <div className="border-b border-neutral-200 p-4">
          <h2 className="mb-2 font-semibold text-neutral-800">1. Space</h2>
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
          <div className="mt-3 grid grid-cols-3 gap-2">
            <label className="block text-xs text-neutral-500">
              Length
              <input
                type="number"
                min="1"
                value={roomDimensions.length}
                onChange={(event) => setRoomDimensions({ length: event.target.value })}
                className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block text-xs text-neutral-500">
              Width
              <input
                type="number"
                min="1"
                value={roomDimensions.width}
                onChange={(event) => setRoomDimensions({ width: event.target.value })}
                className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block text-xs text-neutral-500">
              Height
              <input
                type="number"
                min="1"
                value={roomDimensions.height}
                onChange={(event) => setRoomDimensions({ height: event.target.value })}
                className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <select
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className="mt-2 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            {UNIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Paint, floor, lighting */}
        <div className="border-b border-neutral-200 p-4">
          <h2 className="mb-2 font-semibold text-neutral-800">2. Paint &amp; finishes</h2>
          <p className="mb-2 flex items-center gap-1 text-xs text-neutral-500">
            <PaintBucket className="h-3.5 w-3.5" /> Wall paint
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {WALL_PAINTS.map((paint) => (
              <Swatch
                key={paint.value}
                color={paint.value}
                label={paint.name}
                selected={wallColor === paint.value}
                onClick={() => setWallColor(paint.value)}
              />
            ))}
          </div>
          <p className="mb-2 text-xs text-neutral-500">Floor</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {FLOOR_OPTIONS.map((floor) => (
              <button
                key={floor.id}
                type="button"
                onClick={() => setFloorMaterial(floor.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  floorMaterial === floor.id
                    ? 'border-neutral-800 bg-neutral-800 text-white'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: floor.swatch }} />
                {floor.label}
              </button>
            ))}
          </div>
          <p className="mb-2 text-xs text-neutral-500">Lighting</p>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.id}
                type="button"
                onClick={() => setLightingMood(mood.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  lightingMood === mood.id
                    ? 'border-neutral-800 bg-neutral-800 text-white'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {mood.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Furniture */}
        <div className="border-b border-neutral-200 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-semibold text-neutral-800">3. Furniture</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => undo()}
                disabled={pastStates.length === 0}
                className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
              >
                <Undo2 className="h-3.5 w-3.5" /> Undo
              </button>
              <button
                type="button"
                onClick={() => redo()}
                disabled={futureStates.length === 0}
                className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
              >
                <Redo2 className="h-3.5 w-3.5" /> Redo
              </button>
              <button type="button" onClick={resetLayout} className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900">
                <RotateCcw className="h-3.5 w-3.5" /> Reset layout
              </button>
            </div>
          </div>
          <p className="mb-3 text-xs text-neutral-500">
            Tap an item to add it to the {activeCatalog.label.toLowerCase()}. Tap it in the scene to select it.
          </p>
          {overlappingIds.length > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {overlappingIds.length} item{overlappingIds.length > 1 ? 's are' : ' is'} overlapping — drag to adjust.
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {activeCatalog.items.map((asset) => (
              <button
                key={asset.type + asset.label}
                type="button"
                onClick={() => addObject(asset.type)}
                className="flex flex-col items-center gap-1 rounded border border-neutral-200 p-2 text-xs hover:bg-neutral-50"
              >
                <span className="text-xl">{asset.emoji}</span>
                {asset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Doors, windows & vents */}
        <div className="border-b border-neutral-200 p-4">
          <h2 className="mb-2 font-semibold text-neutral-800">4. Doors, windows &amp; vents</h2>
          <p className="mb-3 text-xs text-neutral-500">
            Wall items snap to a wall. Drag one along the wall to position it, or pick which wall below.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {WALL_CATALOG.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => addObject(item.type)}
                className="flex flex-col items-center gap-1 rounded border border-neutral-200 p-2 text-xs hover:bg-neutral-50"
              >
                <item.Icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Selected piece configurator */}
        {selected && (
          <div className="border-b border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-800">5. Selected piece</h2>
              <button
                type="button"
                onClick={() => removeObject(selected.id)}
                className="flex items-center gap-1 text-xs text-red-600 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
            <p className="mb-2 text-xs text-neutral-500">Colour</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {PIECE_COLORS.map((color) => (
                <Swatch
                  key={color}
                  color={color}
                  label={color}
                  selected={selected.color === color}
                  onClick={() => setObjectColor(selected.id, color)}
                />
              ))}
            </div>
            <p className="mb-2 text-xs text-neutral-500">Finish</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {SURFACE_OPTIONS.map((surface) => (
                <button
                  key={surface.id}
                  type="button"
                  onClick={() => setObjectSurface(selected.id, surface.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selectedSurface === surface.id
                      ? 'border-neutral-800 bg-neutral-800 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {surface.label}
                </button>
              ))}
            </div>
            {isWallItem(selected.type) ? (
              <>
                <p className="mb-2 text-xs text-neutral-500">Which wall</p>
                <div className="flex gap-2">
                  {(['back', 'left'] as WallSide[]).map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setWallSide(selected.id, side)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        (selected.wall ?? 'back') === side
                          ? 'border-neutral-800 bg-neutral-800 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {side === 'back' ? 'Back' : 'Left'}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-neutral-500">Tip: drag the piece along the wall to reposition it.</p>
              </>
            ) : (
              <>
                <p className="mb-2 text-xs text-neutral-500">Rotate</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => rotateObject(selected.id, selected.rotationY - Math.PI / 6)}
                    className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Left
                  </button>
                  <button
                    type="button"
                    onClick={() => rotateObject(selected.id, selected.rotationY + Math.PI / 6)}
                    className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                  >
                    Right <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-3 text-xs text-neutral-500">Tip: drag the piece across the floor to reposition it.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
