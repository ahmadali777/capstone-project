import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import SettingsPage from './SettingsPage';
import { renderWithProviders } from '../../test/testUtils';

describe('SettingsPage', () => {
  it('renders the settings form with default values', () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByLabelText('Display name')).toHaveValue('');
    expect(screen.getByLabelText('Email address')).toHaveValue('');
    expect(
      screen.getByRole('checkbox', { name: /Email notifications/i }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /Marketing emails/i }),
    ).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('shows validation errors for invalid input', async () => {
    const { user } = renderWithProviders(<SettingsPage />);

    await user.type(screen.getByLabelText('Display name'), 'A');
    await user.type(screen.getByLabelText('Email address'), 'not-an-email');
    await user.tab();

    expect(
      await screen.findByText('Display name must be at least 2 characters'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Enter a valid email address'),
    ).toBeInTheDocument();
  });

  it('saves valid settings to the store', async () => {
    const { user, store } = renderWithProviders(<SettingsPage />);

    await user.type(screen.getByLabelText('Display name'), 'Jane Doe');
    await user.type(screen.getByLabelText('Email address'), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(store.getState().settings).toMatchObject({
        displayName: 'Jane Doe',
        email: 'jane@example.com',
      });
    });

    expect(
      screen.getByText('Settings saved successfully.'),
    ).toBeInTheDocument();
  });

  it('resets settings to defaults', async () => {
    const { user, store } = renderWithProviders(<SettingsPage />, {
      preloadedSettings: {
        displayName: 'Jane Doe',
        email: 'jane@example.com',
        bio: 'Product designer',
        theme: 'dark',
        emailNotifications: false,
        marketingEmails: true,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }));

    expect(store.getState().settings).toEqual({
      displayName: '',
      email: '',
      bio: '',
      theme: 'light',
      emailNotifications: true,
      marketingEmails: false,
    });
  });
});
