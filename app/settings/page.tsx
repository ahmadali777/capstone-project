'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStore } from '../../store/useStore';
import {
  settingsSchema,
  type SettingsFormValues,
} from './settingsSchema';

function SettingsPage() {
  const { settings: savedSettings, updateSettings, resetSettings } = useStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: savedSettings,
    mode: 'onBlur',
  });

  const bioValue = watch('bio') ?? '';

  useEffect(() => {
    reset(savedSettings);
  }, [reset, savedSettings]);

  useEffect(() => {
    if (!showSuccess) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  const onSubmit = async (values: SettingsFormValues) => {
    // Simulate backend save with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateSettings(values);
    reset(values);
    setShowSuccess(true);
  };

  const handleReset = () => {
    resetSettings();
    setShowSuccess(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your profile and notification preferences.
        </p>
      </header>

      <form
        className="space-y-8 divide-y divide-gray-200"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {showSuccess && (
          <div className="rounded-md bg-green-50 p-4" role="status">
            <p className="text-sm font-medium text-green-800">
              Settings saved successfully.
            </p>
          </div>
        )}

        <section className="pt-8" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="text-xl font-medium text-gray-900 mb-6">
            Profile
          </h2>

          <div className="space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2" htmlFor="displayName">
                Display name
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  className={`block w-full max-w-lg rounded-md shadow-sm sm:text-sm ${
                    errors.displayName 
                      ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  aria-invalid={Boolean(errors.displayName)}
                  aria-describedby={errors.displayName ? 'displayName-error' : undefined}
                  {...register('displayName')}
                />
                {errors.displayName && (
                  <p id="displayName-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.displayName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2" htmlFor="email">
                Email address
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full max-w-lg rounded-md shadow-sm sm:text-sm ${
                    errors.email 
                      ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2" htmlFor="bio">
                Bio
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <textarea
                  id="bio"
                  rows={3}
                  className={`block w-full max-w-lg rounded-md shadow-sm sm:text-sm ${
                    errors.bio 
                      ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  aria-invalid={Boolean(errors.bio)}
                  aria-describedby="bio-hint bio-error"
                  {...register('bio')}
                />
                <p id="bio-hint" className="mt-2 text-sm text-gray-500">
                  {bioValue.length}/200 characters
                </p>
                {errors.bio && (
                  <p id="bio-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.bio.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="pt-8" aria-labelledby="appearance-heading">
          <h2 id="appearance-heading" className="text-xl font-medium text-gray-900 mb-6">
            Appearance
          </h2>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
            <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2" htmlFor="theme">
              Theme
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <select
                id="theme"
                className={`block w-full max-w-xs rounded-md shadow-sm sm:text-sm ${
                  errors.theme 
                    ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                aria-invalid={Boolean(errors.theme)}
                aria-describedby={errors.theme ? 'theme-error' : undefined}
                {...register('theme')}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              {errors.theme && (
                <p id="theme-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.theme.message}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="pt-8" aria-labelledby="notifications-heading">
          <h2 id="notifications-heading" className="text-xl font-medium text-gray-900 mb-6">
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="emailNotifications"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  {...register('emailNotifications')}
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label className="font-medium text-gray-900" htmlFor="emailNotifications">
                  Email notifications
                </label>
                <p className="text-gray-500">
                  Receive updates about account activity and security alerts.
                </p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="marketingEmails"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  {...register('marketingEmails')}
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label className="font-medium text-gray-900" htmlFor="marketingEmails">
                  Marketing emails
                </label>
                <p className="text-gray-500">
                  Get product news, tips, and occasional promotional offers.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-8 flex justify-end gap-x-4">
          <button
            type="button"
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={handleReset}
          >
            Reset to defaults
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!isDirty || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPage;
