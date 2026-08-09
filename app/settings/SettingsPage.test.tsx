import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import SettingsPage from '@/app/settings/page';
import { useStore } from '@/store/useStore';

function resetStore() {
  useStore.setState({
    settings: {
      displayName: '',
      email: '',
      bio: '',
      theme: 'light',
      emailNotifications: true,
      marketingEmails: false,
    },
  });
}

describe('Settings form (validated with zod + react-hook-form)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders all fields with accessible labels', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('textbox', { name: 'Display name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email address' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Bio' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Email notifications' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Marketing emails' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('rejects invalid input with role-alert error messages', async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    await user.type(screen.getByRole('textbox', { name: 'Display name' }), 'ab');
    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByText('Display name must be at least 3 characters')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
  });

  it('saves valid input and reports success', async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    await user.type(screen.getByRole('textbox', { name: 'Display name' }), 'Ahmad');
    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'ahmad@example.com');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Settings saved successfully.', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(useStore.getState().settings.displayName).toBe('Ahmad');
    expect(useStore.getState().settings.email).toBe('ahmad@example.com');
  });

  it('keeps the submit button disabled until a field changes', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('restores the defaults when Reset is pressed', async () => {
    useStore.setState({
      settings: {
        displayName: 'Ahmad',
        email: 'ahmad@example.com',
        bio: '',
        theme: 'dark',
        emailNotifications: false,
        marketingEmails: false,
      },
    });
    const user = userEvent.setup();

    render(<SettingsPage />);

    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }));

    const store = useStore.getState().settings;
    expect(store.displayName).toBe('');
    expect(store.email).toBe('');
    expect(store.theme).toBe('light');
    expect(store.emailNotifications).toBe(true);
  });
});
