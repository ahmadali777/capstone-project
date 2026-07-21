import { z } from 'zod';

export const settingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(3, 'Display name must be at least 3 characters')
    .max(20, 'Display name must be 20 characters or fewer')
    .regex(/^[a-zA-Z0-9]+$/, 'Display name can only contain alphanumeric characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Enter a valid email address'),
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
