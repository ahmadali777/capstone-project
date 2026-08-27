import { create } from 'zustand';
import { useStore as useZustandStore } from 'zustand';
import { temporal } from 'zundo';
import { defaultSettings, type SettingsState } from '../app/settings/settingsTypes';

export type AssetType =
  | 'sofa' | 'lamp' | 'plant' | 'table' | 'chair' | 'rug'
  | 'bookshelf' | 'tv-stand' | 'cabinet' | 'bed' | 'desk'
  | 'door' | 'window' | 'vent'
  | 'painting' | 'mirror' | 'wall-shelf' | 'clock' | 'tv-mount';
export type RoomType = 'room' | 'living-room' | 'washroom' | 'kitchen';
export type WallSide = 'back' | 'left' | 'right' | 'front';
export type WallTexture = 'none' | 'brick' | 'wood-panel' | 'wallpaper' | 'tile';

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
  wallVerticalOffset?: number;
  rotationZ?: number;
}

export type LightingMood = 'cozy' | 'bright' | 'dramatic' | 'neutral';
export type FloorMaterial = 'wood' | 'tile' | 'carpet';
export type Surface = 'matte' | 'satin' | 'glossy';

export const SURFACE_TO_MATERIAL: Record<Surface, { metalness: number; roughness: number }> = {
  matte: { metalness: 0, roughness: 1 },
  satin: { metalness: 0.1, roughness: 0.45 },
  glossy: { metalness: 0.7, roughness: 0.15 },
};

export const isWallItem = (type: AssetType): boolean =>
  type === 'door' || type === 'window' || type === 'vent' ||
  type === 'painting' || type === 'mirror' || type === 'wall-shelf' || type === 'clock' || type === 'tv-mount';

export const isDecorativeItem = (type: AssetType): boolean =>
  type === 'painting' || type === 'mirror' || type === 'wall-shelf' || type === 'clock' || type === 'tv-mount';

export const MOVE_STEP = 0.1;
export type MoveDirection = 'left' | 'right' | 'up' | 'down';

export const WALL_ITEM_HALF_WIDTH: Record<string, number> = {
  door: 0.45,
  window: 0.55,
  vent: 0.175,
  painting: 0.4,
  mirror: 0.3,
  'wall-shelf': 0.4,
  clock: 0.175,
  'tv-mount': 0.55,
};

export const FOOTPRINT_HALF: Record<AssetType, { rx: number; rz: number }> = {
  sofa: { rx: 0.7, rz: 0.6 },
  lamp: { rx: 0.25, rz: 0.25 },
  plant: { rx: 0.35, rz: 0.35 },
  table: { rx: 0.4, rz: 0.4 },
  chair: { rx: 0.25, rz: 0.35 },
  rug: { rx: 0.8, rz: 0.55 },
  bookshelf: { rx: 0.45, rz: 0.2 },
  'tv-stand': { rx: 0.6, rz: 0.25 },
  cabinet: { rx: 0.4, rz: 0.25 },
  bed: { rx: 0.7, rz: 1.0 },
  desk: { rx: 0.5, rz: 0.28 },
  door: { rx: 0, rz: 0 },
  window: { rx: 0, rz: 0 },
  vent: { rx: 0, rz: 0 },
  painting: { rx: 0, rz: 0 },
  mirror: { rx: 0, rz: 0 },
  'wall-shelf': { rx: 0, rz: 0 },
  clock: { rx: 0, rz: 0 },
  'tv-mount': { rx: 0, rz: 0 },
};

function clampFloorPosition(x: number, z: number, rotationY: number, type: AssetType, halfLength: number, halfWidth: number): [number, number] {
  const fp = FOOTPRINT_HALF[type] ?? { rx: 0.3, rz: 0.3 };
  const cs = Math.abs(Math.cos(rotationY));
  const sn = Math.abs(Math.sin(rotationY));
  const effX = fp.rx * cs + fp.rz * sn;
  const effZ = fp.rx * sn + fp.rz * cs;
  const maxX = Math.max(0, halfLength - effX);
  const maxZ = Math.max(0, halfWidth - effZ);
  return [Math.min(maxX, Math.max(-maxX, x)), Math.min(maxZ, Math.max(-maxZ, z))];
}

interface StoreState {
  // Scene contents
  objects: SceneObject[];
  selectedId: string | null;
  selectedWall: WallSide | null;
  addObject: (type: AssetType) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  setSelectedWall: (wall: WallSide | null) => void;
  moveObject: (id: string, position: [number, number, number]) => void;
  moveObjectByDelta: (id: string, dx: number, dy: number, dz: number) => void;
  moveObjectByDirection: (id: string, dir: MoveDirection) => void;
  rotateObject: (id: string, rotationY: number) => void;
  setObjectRotationZ: (id: string, rotationZ: number) => void;
  setObjectColor: (id: string, color: string) => void;
  setObjectSurface: (id: string, surface: Surface) => void;
  setWallSide: (id: string, wall: WallSide) => void;
  setWallOffset: (id: string, offset: number) => void;
  moveToWall: (id: string, wall: WallSide) => void;
  moveToFloor: (id: string) => void;
  resetLayout: () => void;

  // Room appearance (driven by AI or manual controls)
  wallColor: string;
  floorMaterial: FloorMaterial;
  lightingMood: LightingMood;
  wallTexture: WallTexture;
  ceilingVisible: boolean;
  ceilingColor: string;
  windowCoverings: boolean;
  setWallColor: (color: string) => void;
  setFloorMaterial: (material: FloorMaterial) => void;
  setLightingMood: (mood: LightingMood) => void;
  setWallTexture: (texture: WallTexture) => void;
  setCeilingVisible: (visible: boolean) => void;
  setCeilingColor: (color: string) => void;
  setWindowCoverings: (enabled: boolean) => void;

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
  bookshelf: '#6b4226',
  'tv-stand': '#3a3a3a',
  cabinet: '#7a5a3a',
  bed: '#c9b8a8',
  desk: '#8a7560',
  door: '#8a6b4f',
  window: '#9db8c4',
  vent: '#b9b9b9',
  painting: '#d4a574',
  mirror: '#c0d8e8',
  'wall-shelf': '#8a6b4f',
  clock: '#4a4a4a',
  'tv-mount': '#1a1a1a',
};

export const ROOM_PRESETS: Record<RoomType, { length: number; width: number; height: number }> = {
  room: { length: 5, width: 4, height: 3 },
  'living-room': { length: 6, width: 4.5, height: 3 },
  washroom: { length: 2.6, width: 2, height: 2.6 },
  kitchen: { length: 4, width: 3, height: 2.8 },
};

let idCounter = 0;

function nextObjectId(objects: SceneObject[]): string {
  const used = new Set(objects.map((o) => o.id));
  let id = `obj-${idCounter++}`;
  while (used.has(id)) {
    id = `obj-${idCounter++}`;
  }
  return id;
}

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
      selectedWall: 'back',

      addObject: (type) =>
        set((state) => {
          const id = nextObjectId(state.objects);
          if (isWallItem(type)) {
            let wall = state.selectedWall;
            if (!wall && state.selectedId) {
              const sel = state.objects.find((o) => o.id === state.selectedId);
              if (sel?.wall) wall = sel.wall;
            }
            wall = wall ?? 'back';
            const newObj: SceneObject = {
              id,
              type,
              position: [0, 0, 0],
              rotationY: 0,
              wall,
              wallOffset: 0,
              color: ASSET_DEFAULT_COLORS[type],
              metalness: 0,
              roughness: 1,
            };
            const objects = [...state.objects, newObj];
            return { objects, selectedId: id, selectedWall: null };
          }
          const preset = ROOM_PRESETS[state.selectedRoom];
          const [x, z] = clampFloorPosition(
            Math.random() * (preset.length - 1.6) - (preset.length - 1.6) / 2,
            Math.random() * (preset.width - 1.6) - (preset.width - 1.6) / 2,
            0,
            type,
            preset.length / 2,
            preset.width / 2,
          );
          const newObj: SceneObject = {
            id,
            type,
            position: [x, 0, z],
            rotationY: 0,
            color: ASSET_DEFAULT_COLORS[type],
            metalness: 0,
            roughness: 1,
          };
          const objects = [...state.objects, newObj];
          return { objects, selectedId: id, selectedWall: null };
        }),

      removeObject: (id) =>
        set((state) => {
          const objects = state.objects.filter((o) => o.id !== id);
          return {
            objects,
            selectedId: state.selectedId === id ? null : state.selectedId,
          };
        }),

      selectObject: (id) => set({ selectedId: id, selectedWall: null }),

      setSelectedWall: (wall) =>
        set((state) => (wall ? { selectedWall: wall, selectedId: null } : { selectedWall: null })),

      moveObject: (id, position) =>
        set((state) => {
          const length = Math.max(2, Number.parseFloat(state.roomDimensions.length) || 5);
          const width = Math.max(2, Number.parseFloat(state.roomDimensions.width) || 4);
          const obj = state.objects.find((o) => o.id === id);
          if (obj && !isWallItem(obj.type)) {
            const [x, z] = clampFloorPosition(position[0], position[2], obj.rotationY, obj.type, length / 2, width / 2);
            position = [x, 0, z];
          }
          const objects = state.objects.map((o) => (o.id === id ? { ...o, position } : o));
          return { objects };
        }),

      moveObjectByDelta: (id, dx, dy, dz) =>
        set((state) => {
          const obj = state.objects.find((o) => o.id === id);
          if (!obj) return state;
          const length = Math.max(2, Number.parseFloat(state.roomDimensions.length) || 5);
          const width = Math.max(2, Number.parseFloat(state.roomDimensions.width) || 4);
          const height = Math.max(2, Number.parseFloat(state.roomDimensions.height) || 3);
          const halfLength = length / 2;
          const halfWidth = width / 2;

          if (isWallItem(obj.type)) {
            const wall = obj.wall ?? 'back';
            const prevH = obj.wallOffset ?? 0;
            const prevV = obj.wallVerticalOffset ?? 0;
            const wallLen = (wall === 'left' || wall === 'right') ? halfWidth : halfLength;
            const margin = WALL_ITEM_HALF_WIDTH[obj.type] ?? 0;
            const maxH = wallLen - margin;
            const hDelta = (wall === 'left' || wall === 'right') ? dz : dx;
            const nextH = Math.min(maxH, Math.max(-maxH, prevH + hDelta));
            const nextV = Math.min(1.0, Math.max(-1.0, prevV + dy));
            const objects = state.objects.map((o) => (o.id === id ? { ...o, wallOffset: nextH, wallVerticalOffset: nextV } : o));
            return { objects };
          }

          const prevX = obj.position[0];
          const prevZ = obj.position[2];
          const [nextX, nextZ] = clampFloorPosition(prevX + dx, prevZ + dz, obj.rotationY, obj.type, halfLength, halfWidth);
          const objects = state.objects.map((o) => (o.id === id ? { ...o, position: [nextX, 0, nextZ] as [number, number, number] } : o));
          return { objects };
        }),

      moveObjectByDirection: (id, dir) =>
        set((state) => {
          const obj = state.objects.find((o) => o.id === id);
          if (!obj) return state;
          const length = Math.max(2, Number.parseFloat(state.roomDimensions.length) || 5);
          const width = Math.max(2, Number.parseFloat(state.roomDimensions.width) || 4);
          const halfLength = length / 2;
          const halfWidth = width / 2;

          if (isWallItem(obj.type)) {
            const wall = obj.wall ?? 'back';
            const prevH = obj.wallOffset ?? 0;
            const prevV = obj.wallVerticalOffset ?? 0;
            const wallLen = (wall === 'left' || wall === 'right') ? halfWidth : halfLength;
            const margin = WALL_ITEM_HALF_WIDTH[obj.type] ?? 0;
            const maxH = Math.max(0, wallLen - margin);
            const hDelta = dir === 'left' ? -MOVE_STEP : dir === 'right' ? MOVE_STEP : 0;
            const vDelta = dir === 'up' ? MOVE_STEP : dir === 'down' ? -MOVE_STEP : 0;
            const nextH = Math.min(maxH, Math.max(-maxH, prevH + hDelta));
            const nextV = Math.min(1.0, Math.max(-1.0, prevV + vDelta));
            const objects = state.objects.map((o) => (o.id === id ? { ...o, wallOffset: nextH, wallVerticalOffset: nextV } : o));
            return { objects };
          }

          const prevX = obj.position[0];
          const prevZ = obj.position[2];
          const dx = dir === 'left' ? -MOVE_STEP : dir === 'right' ? MOVE_STEP : 0;
          const dz = dir === 'up' ? -MOVE_STEP : dir === 'down' ? MOVE_STEP : 0;
          const [nextX, nextZ] = clampFloorPosition(prevX + dx, prevZ + dz, obj.rotationY, obj.type, halfLength, halfWidth);
          const objects = state.objects.map((o) => (o.id === id ? { ...o, position: [nextX, 0, nextZ] as [number, number, number] } : o));
          return { objects };
        }),

      rotateObject: (id, rotationY) =>
        set((state) => ({
          objects: state.objects.map((o) => (o.id === id ? { ...o, rotationY } : o)),
        })),

      setObjectRotationZ: (id, rotationZ) =>
        set((state) => ({
          objects: state.objects.map((o) => (o.id === id ? { ...o, rotationZ } : o)),
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

      moveToWall: (id, wall) =>
        set((state) => {
          const length = Math.max(2, Number.parseFloat(state.roomDimensions.length) || 5);
          const width = Math.max(2, Number.parseFloat(state.roomDimensions.width) || 4);
          const halfLength = length / 2;
          const halfWidth = width / 2;
          const objects = state.objects.map((o) => {
            if (o.id !== id) return o;
            return {
              ...o,
              wall,
              wallOffset: 0,
              wallVerticalOffset: 0,
              position: [0, 0, 0] as [number, number, number],
            };
          });
          return { objects };
        }),

      moveToFloor: (id) =>
        set((state) => {
          const objects = state.objects.map((o) => {
            if (o.id !== id) return o;
            return {
              ...o,
              wall: undefined,
              wallOffset: undefined,
              wallVerticalOffset: undefined,
              position: [0, 0, 0] as [number, number, number],
            };
          });
          return { objects };
        }),

      resetLayout: () => {
        const objects = STARTER_LAYOUT.map((object) => ({ ...object, position: [...object.position] as SceneObject['position'] }));
        return set({ objects, selectedId: null });
      },

      wallColor: '#e8e1d5',
      floorMaterial: 'wood',
      lightingMood: 'neutral',
      wallTexture: 'none',
      ceilingVisible: true,
      ceilingColor: '#f5f5f5',
      windowCoverings: false,
      setWallColor: (color) => set({ wallColor: color }),
      setFloorMaterial: (material) => set({ floorMaterial: material }),
      setLightingMood: (mood) => set({ lightingMood: mood }),
      setWallTexture: (texture) => set({ wallTexture: texture }),
      setCeilingVisible: (visible) => set({ ceilingVisible: visible }),
      setCeilingColor: (color) => set({ ceilingColor: color }),
      setWindowCoverings: (enabled) => set({ windowCoverings: enabled }),

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

    const imported = objects as SceneObject[];
    idCounter = imported.reduce((max, o) => {
      const match = /^obj-(\d+)$/.exec(o.id ?? '');
      return match ? Math.max(max, Number(match[1]) + 1) : max;
    }, idCounter);
    const seenIds = new Set<string>();
    const dedupedObjects: SceneObject[] = [];
    for (const o of imported) {
      if (seenIds.has(o.id)) {
        dedupedObjects.push({ ...o, id: nextObjectId(dedupedObjects) });
      } else {
        seenIds.add(o.id);
        dedupedObjects.push(o);
      }
    }

    useStore.setState({
      projectName: typeof data.projectName === 'string' ? data.projectName : 'My Design',
      objects: dedupedObjects,
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
