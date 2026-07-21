import { create } from 'zustand';
import { defaultSettings, type SettingsState } from '../app/settings/settingsTypes';

export type AssetType = 'sofa' | 'lamp' | 'plant' | 'table' | 'chair' | 'rug';

export interface SceneObject {
  id: string;
  type: AssetType;
  position: [number, number, number];
  rotationY: number;
  color: string;
}

export type LightingMood = 'cozy' | 'bright' | 'dramatic' | 'neutral';
export type FloorMaterial = 'wood' | 'tile' | 'carpet';

interface StoreState {
  // Scene contents
  objects: SceneObject[];
  selectedId: string | null;
  addObject: (type: AssetType) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  moveObject: (id: string, position: [number, number, number]) => void;
  rotateObject: (id: string, rotationY: number) => void;

  // Room appearance (driven by AI or manual controls)
  wallColor: string;
  floorMaterial: FloorMaterial;
  lightingMood: LightingMood;
  setWallColor: (color: string) => void;
  setFloorMaterial: (material: FloorMaterial) => void;
  setLightingMood: (mood: LightingMood) => void;

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
}

const ASSET_DEFAULT_COLORS: Record<AssetType, string> = {
  sofa: '#a3785c',
  lamp: '#f2d16b',
  plant: '#3f7d4e',
  table: '#8a6b4f',
  chair: '#6b6f8a',
  rug: '#c9a06b',
};

let idCounter = 0;

export const useStore = create<StoreState>((set) => ({
  objects: [],
  selectedId: null,

  addObject: (type) =>
    set((state) => {
      const id = `obj-${idCounter++}`;
      const newObj: SceneObject = {
        id,
        type,
        position: [Math.random() * 2 - 1, 0, Math.random() * 2 - 1],
        rotationY: 0,
        color: ASSET_DEFAULT_COLORS[type],
      };
      return { objects: [...state.objects, newObj], selectedId: id };
    }),

  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((o) => o.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  selectObject: (id) => set({ selectedId: id }),

  moveObject: (id, position) =>
    set((state) => ({
      objects: state.objects.map((o) => (o.id === id ? { ...o, position } : o)),
    })),

  rotateObject: (id, rotationY) =>
    set((state) => ({
      objects: state.objects.map((o) => (o.id === id ? { ...o, rotationY } : o)),
    })),

  wallColor: '#e8e1d5',
  floorMaterial: 'wood',
  lightingMood: 'neutral',
  setWallColor: (color) => set({ wallColor: color }),
  setFloorMaterial: (material) => set({ floorMaterial: material }),
  setLightingMood: (mood) => set({ lightingMood: mood }),

  suggestion: null,
  setSuggestion: (s) => set({ suggestion: s }),

  settings: defaultSettings,
  updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
  resetSettings: () => set({ settings: defaultSettings }),
}));
