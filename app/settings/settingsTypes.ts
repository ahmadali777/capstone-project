export type Theme = 'light' | 'dark';

export interface SettingsState {
  displayName: string;
  email: string;
  bio: string;
  theme: Theme;
  emailNotifications: boolean;
  marketingEmails: boolean;
}

export const defaultSettings: SettingsState = {
  displayName: '',
  email: '',
  bio: '',
  theme: 'light',
  emailNotifications: true,
  marketingEmails: false,
};
