import { z } from 'zod';

export const settingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be 50 characters or fewer'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  bio: z
    .string()
    .trim()
    .max(200, 'Bio must be 200 characters or fewer'),
  theme: z.enum(['light', 'dark'], {
    required_error: 'Select a theme',
  }),
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
