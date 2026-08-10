import { create } from 'zustand';
import { useStore as useZustandStore } from 'zustand';
import { temporal } from 'zundo';
import { defaultSettings, type SettingsState } from '../app/settings/settingsTypes';

export type AssetType = 'sofa' | 'lamp' | 'plant' | 'table' | 'chair' | 'rug' | 'door' | 'window' | 'vent';
export type RoomType = 'room' | 'living-room' | 'washroom' | 'kitchen';
export type WallSide = 'back' | 'left';

export interface RoomDimensions {
  length: string;
  width: string;
  height: string;
  unit: string;
}

export interface SceneObject {
  id: string;
  type: AssetType;
  position: [number, number, number];
  rotationY: number;
  color: string;
  metalness: number;
  roughness: number;
  wall?: WallSide;
  wallOffset?: number;
}

export type LightingMood = 'cozy' | 'bright' | 'dramatic' | 'neutral';
export type FloorMaterial = 'wood' | 'tile' | 'carpet';
export type Surface = 'matte' | 'satin' | 'glossy';

export const SURFACE_TO_MATERIAL: Record<Surface, { metalness: number; roughness: number }> = {
  matte: { metalness: 0, roughness: 1 },
  satin: { metalness: 0.1, roughness: 0.45 },
  glossy: { metalness: 0.7, roughness: 0.15 },
};

export const isWallItem = (type: AssetType): boolean => type === 'door' || type === 'window' || type === 'vent';

const FOOTPRINT_RADIUS: Record<AssetType, number> = {
  sofa: 0.7,
  lamp: 0.25,
  plant: 0.35,
  table: 0.45,
  chair: 0.35,
  rug: 0.6,
  door: 0,
  window: 0,
  vent: 0,
};

function computeOverlaps(objects: SceneObject[]): string[] {
  const overlapping = new Set<string>();
  for (let i = 0; i < objects.length; i += 1) {
    for (let j = i + 1; j < objects.length; j += 1) {
      const a = objects[i];
      const b = objects[j];
      if (isWallItem(a.type) || isWallItem(b.type)) continue;
      if (a.type === 'rug' || b.type === 'rug') continue;
      const dx = a.position[0] - b.position[0];
      const dz = a.position[2] - b.position[2];
      const minDist = FOOTPRINT_RADIUS[a.type] + FOOTPRINT_RADIUS[b.type];
      if (dx * dx + dz * dz < minDist * minDist) {
        overlapping.add(a.id);
        overlapping.add(b.id);
      }
    }
  }
  return Array.from(overlapping);
}

interface StoreState {
  // Scene contents
  objects: SceneObject[];
  selectedId: string | null;
  overlappingIds: string[];
  addObject: (type: AssetType) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  moveObject: (id: string, position: [number, number, number]) => void;
  rotateObject: (id: string, rotationY: number) => void;
  setObjectColor: (id: string, color: string) => void;
  setObjectSurface: (id: string, surface: Surface) => void;
  setWallSide: (id: string, wall: WallSide) => void;
  setWallOffset: (id: string, offset: number) => void;
  resetLayout: () => void;

  // Room appearance (driven by AI or manual controls)
  wallColor: string;
  floorMaterial: FloorMaterial;
  lightingMood: LightingMood;
  setWallColor: (color: string) => void;
  setFloorMaterial: (material: FloorMaterial) => void;
  setLightingMood: (mood: LightingMood) => void;

  // Shared room context for AI responses
  selectedRoom: RoomType;
  setSelectedRoom: (room: RoomType) => void;
  roomDimensions: RoomDimensions;
  setRoomDimensions: (dimensions: Partial<RoomDimensions>) => void;

  // AI suggestion result from the uploaded photo
  suggestion: {
    wallColor?: string;
    floorMaterial?: FloorMaterial;
    moodTags?: string[];
    suggestedFurniture?: string[];
  } | null;
  setSuggestion: (s: StoreState['suggestion']) => void;

  // Settings
  settings: SettingsState;
  updateSettings: (settings: Partial<SettingsState>) => void;
  resetSettings: () => void;

  // Project
  projectName: string;
  setProjectName: (name: string) => void;
}

export const ASSET_DEFAULT_COLORS: Record<AssetType, string> = {
  sofa: '#a3785c',
  lamp: '#f2d16b',
  plant: '#3f7d4e',
  table: '#8a6b4f',
  chair: '#6b6f8a',
  rug: '#c9a06b',
  door: '#8a6b4f',
  window: '#9db8c4',
  vent: '#b9b9b9',
};

export const ROOM_PRESETS: Record<RoomType, { length: number; width: number; height: number }> = {
  room: { length: 5, width: 4, height: 3 },
  'living-room': { length: 6, width: 4.5, height: 3 },
  washroom: { length: 2.6, width: 2, height: 2.6 },
  kitchen: { length: 4, width: 3, height: 2.8 },
};

let idCounter = 0;

const STARTER_LAYOUT: SceneObject[] = [
  { id: 'starter-sofa', type: 'sofa', position: [-0.75, 0, -0.75], rotationY: 0, color: '#a3785c', metalness: 0, roughness: 1 },
  { id: 'starter-rug', type: 'rug', position: [0, 0, 0.45], rotationY: 0, color: '#c9a06b', metalness: 0, roughness: 1 },
  { id: 'starter-table', type: 'table', position: [0, 0, 0.3], rotationY: 0, color: '#8a6b4f', metalness: 0, roughness: 0.45 },
  { id: 'starter-plant', type: 'plant', position: [1.7, 0, -1.15], rotationY: 0, color: '#3f7d4e', metalness: 0, roughness: 1 },
];

export const orbitControlsRef: { current: any } = { current: null };
export const canvasRef: { current: HTMLCanvasElement | null } = { current: null };

export const useStore = create<StoreState>()(
  temporal(
    (set) => ({
      objects: STARTER_LAYOUT,
      selectedId: null,
      overlappingIds: computeOverlaps(STARTER_LAYOUT),

      addObject: (type) =>
        set((state) => {
          const id = `obj-${idCounter++}`;
          if (isWallItem(type)) {
            const newObj: SceneObject = {
              id,
              type,
              position: [0, 0, 0],
              rotationY: 0,
              wall: 'back',
              wallOffset: 0,
              color: ASSET_DEFAULT_COLORS[type],
              metalness: 0,
              roughness: 1,
            };
            const objects = [...state.objects, newObj];
            return { objects, selectedId: id, overlappingIds: computeOverlaps(objects) };
          }
          const preset = ROOM_PRESETS[state.selectedRoom];
          const newObj: SceneObject = {
            id,
            type,
            position: [Math.random() * (preset.length - 1.6) - (preset.length - 1.6) / 2, 0, Math.random() * (preset.width - 1.6) - (preset.width - 1.6) / 2],
            rotationY: 0,
            color: ASSET_DEFAULT_COLORS[type],
            metalness: 0,
            roughness: 1,
          };
          const objects = [...state.objects, newObj];
          return { objects, selectedId: id, overlappingIds: computeOverlaps(objects) };
        }),

      removeObject: (id) =>
        set((state) => {
          const objects = state.objects.filter((o) => o.id !== id);
          return {
            objects,
            selectedId: state.selectedId === id ? null : state.selectedId,
            overlappingIds: computeOverlaps(objects),
          };
        }),

      selectObject: (id) => set({ selectedId: id }),

      moveObject: (id, position) =>
        set((state) => {
          const objects = state.objects.map((o) => (o.id === id ? { ...o, position } : o));
          return { objects, overlappingIds: computeOverlaps(objects) };
        }),

      rotateObject: (id, rotationY) =>
        set((state) => ({
          objects: state.objects.map((o) => (o.id === id ? { ...o, rotationY } : o)),
        })),

      setObjectColor: (id, color) =>
        set((state) => ({
          objects: state.objects.map((o) => (o.id === id ? { ...o, color } : o)),
        })),

      setObjectSurface: (id, surface) => {
        const { metalness, roughness } = SURFACE_TO_MATERIAL[surface];
        return set((state) => ({
          objects: state.objects.map((o) => (o.id === id ? { ...o, metalness, roughness } : o)),
        }));
      },

      setWallSide: (id, wall) =>
        set((state) => ({
          objects: state.objects.map((o) => (o.id === id ? { ...o, wall } : o)),
        })),

      setWallOffset: (id, offset) =>
        set((state) => ({
          objects: state.objects.map((o) => (o.id === id ? { ...o, wallOffset: offset } : o)),
        })),

      resetLayout: () => {
        const objects = STARTER_LAYOUT.map((object) => ({ ...object, position: [...object.position] as SceneObject['position'] }));
        return set({ objects, overlappingIds: computeOverlaps(objects), selectedId: null });
      },

      wallColor: '#e8e1d5',
      floorMaterial: 'wood',
      lightingMood: 'neutral',
      setWallColor: (color) => set({ wallColor: color }),
      setFloorMaterial: (material) => set({ floorMaterial: material }),
      setLightingMood: (mood) => set({ lightingMood: mood }),

      selectedRoom: 'room',
      setSelectedRoom: (room) =>
        set((state) => {
          const preset = ROOM_PRESETS[room];
          return {
            selectedRoom: room,
            roomDimensions: {
              ...state.roomDimensions,
              length: String(preset.length),
              width: String(preset.width),
              height: String(preset.height),
            },
          };
        }),
      roomDimensions: {
        length: String(ROOM_PRESETS.room.length),
        width: String(ROOM_PRESETS.room.width),
        height: String(ROOM_PRESETS.room.height),
        unit: 'ft',
      },
      setRoomDimensions: (dimensions) =>
        set((state) => ({
          roomDimensions: {
            ...state.roomDimensions,
            ...dimensions,
          },
        })),

      suggestion: null,
      setSuggestion: (s) => set({ suggestion: s }),

      settings: defaultSettings,
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      resetSettings: () => set({ settings: defaultSettings }),

      projectName: 'My Design',
      setProjectName: (name) => set({ projectName: name }),
    }),
    {
      partialize: (state) => ({
        objects: state.objects,
        overlappingIds: state.overlappingIds,
      }),
      equality: (past, current) => past.objects === current.objects,
      limit: 30,
    },
  ),
);

export const useTemporalStore = () => useZustandStore(useStore.temporal);

const DESIGN_STORAGE_KEY = 'spatialstager-design';

export function exportDesign(): string {
  const { projectName, objects, wallColor, floorMaterial, lightingMood, selectedRoom, roomDimensions } = useStore.getState();
  return JSON.stringify({
    projectName,
    objects,
    wallColor,
    floorMaterial,
    lightingMood,
    selectedRoom,
    roomDimensions,
  });
}

export function importDesign(json: string): void {
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    const objects = data.objects;
    if (!Array.isArray(objects)) throw new Error('Missing objects array');

    const rooms: RoomType[] = ['room', 'living-room', 'washroom', 'kitchen'];
    const floors: FloorMaterial[] = ['wood', 'tile', 'carpet'];
    const moods: LightingMood[] = ['cozy', 'bright', 'dramatic', 'neutral'];

    useStore.setState({
      projectName: typeof data.projectName === 'string' ? data.projectName : 'My Design',
      objects: objects as SceneObject[],
      overlappingIds: computeOverlaps(objects as SceneObject[]),
      selectedId: null,
      wallColor: typeof data.wallColor === 'string' ? data.wallColor : '#e8e1d5',
      floorMaterial: floors.includes(data.floorMaterial as FloorMaterial) ? (data.floorMaterial as FloorMaterial) : 'wood',
      lightingMood: moods.includes(data.lightingMood as LightingMood) ? (data.lightingMood as LightingMood) : 'neutral',
      selectedRoom: rooms.includes(data.selectedRoom as RoomType) ? (data.selectedRoom as RoomType) : 'room',
      roomDimensions: {
        length: '5',
        width: '4',
        height: '3',
        unit: 'ft',
        ...(data.roomDimensions && typeof data.roomDimensions === 'object' ? (data.roomDimensions as Partial<RoomDimensions>) : {}),
      },
    });
  } catch {
    alert('That design file could not be loaded — it may be invalid.');
  }
}

export function saveDesignLocally(): void {
  try {
    localStorage.setItem(DESIGN_STORAGE_KEY, exportDesign());
  } catch {
    // localStorage unavailable — nothing to do for a local-only tool
  }
}

export function restoreDesignLocally(): void {
  try {
    const raw = localStorage.getItem(DESIGN_STORAGE_KEY);
    if (raw) importDesign(raw);
  } catch {
    // no stored design
  }
}
