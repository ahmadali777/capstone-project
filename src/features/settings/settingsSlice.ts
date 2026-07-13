import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { defaultSettings, type SettingsState } from './settingsTypes';

const STORAGE_KEY = 'capstone-settings';

function loadSettingsFromStorage(): SettingsState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultSettings;
    }

    const parsed = JSON.parse(stored) as Partial<SettingsState>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

function saveSettingsToStorage(settings: SettingsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

const initialState: SettingsState = loadSettingsFromStorage();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<SettingsState>) => {
      Object.assign(state, action.payload);
      saveSettingsToStorage(state);
    },
    resetSettings: () => {
      saveSettingsToStorage(defaultSettings);
      return defaultSettings;
    },
  },
});

export const { updateSettings, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
