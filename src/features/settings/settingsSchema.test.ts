import { describe, expect, it } from 'vitest';
import { settingsSchema } from './settingsSchema';

describe('settingsSchema', () => {
  describe('displayName validation', () => {
    it('should reject empty string', () => {
      const result = settingsSchema.safeParse({
        displayName: '',
        email: 'test@example.com',
        bio: '',
        theme: 'light',
        emailNotifications: true,
        marketingEmails: false,
      });
      expect(result.success).toBe(false);
    });

    it('should reject display name shorter than 3 characters', () => {
      const result = settingsSchema.safeParse({
        displayName: 'ab',
        email: 'test@example.com',
        bio: '',
        theme: 'light',
        emailNotifications: true,
        marketingEmails: false,
      });
      expect(result.success).toBe(false);
    });

    it('should reject display name longer than 20 characters', () => {
      const result = settingsSchema.safeParse({
        displayName: 'abcdefghijklmnopqrstuv',
        email: 'test@example.com',
        bio: '',
        theme: 'light',
        emailNotifications: true,
        marketingEmails: false,
      });
      expect(result.success).toBe(false);
    });

    it('should reject display name with non-alphanumeric characters', () => {
      const result = settingsSchema.safeParse({
        displayName: 'user!',
        email: 'test@example.com',
        bio: '',
        theme: 'light',
        emailNotifications: true,
        marketingEmails: false,
      });
      expect(result.success).toBe(false);
    });

    it('should reject display name with SQL injection attempts', () => {
      const result = settingsSchema.safeParse({
        displayName: "' OR 1=1 --",
        email: 'test@example.com',
        bio: '',
        theme: 'light',
        emailNotifications: true,
        marketingEmails: false,
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid alphanumeric display name (3-20 chars)', () => {
      const result = settingsSchema.safeParse({
        displayName: 'ValidUser123',
        email: 'test@example.com',
        bio: '',
        theme: 'light',
        emailNotifications: true,
        marketingEmails: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('email validation', () => {
    it('should reject empty string', () => {
      const result = settingsSchema.safeParse({
        displayName: 'ValidUser',
        email: '',
        bio: '',
        theme: 'light',
        emailNotifications: true,
        marketingEmails: false,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        'user@',
        '@example.com',
        'user@.com',
        'user@example.',
      ];
      invalidEmails.forEach((email) => {
        const result = settingsSchema.safeParse({
          displayName: 'ValidUser',
          email,
          bio: '',
          theme: 'light',
          emailNotifications: true,
          marketingEmails: false,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.co.uk',
        'user123@example-domain.com',
      ];
      validEmails.forEach((email) => {
        const result = settingsSchema.safeParse({
          displayName: 'ValidUser',
          email,
          bio: '',
          theme: 'light',
          emailNotifications: true,
          marketingEmails: false,
        });
        expect(result.success).toBe(true);
      });
    });
  });
});
