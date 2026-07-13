import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { resetSettings, updateSettings } from './settingsSlice';
import {
  settingsSchema,
  type SettingsFormValues,
} from './settingsSchema';
import styles from './SettingsPage.module.css';

function SettingsPage() {
  const dispatch = useAppDispatch();
  const savedSettings = useAppSelector((state) => state.settings);
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

  const onSubmit = (values: SettingsFormValues) => {
    dispatch(updateSettings(values));
    reset(values);
    setShowSuccess(true);
  };

  const handleReset = () => {
    dispatch(resetSettings());
    setShowSuccess(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>
          Manage your profile and notification preferences.
        </p>
      </header>

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {showSuccess && (
          <p className={styles.successBanner} role="status">
            Settings saved successfully.
          </p>
        )}

        <section className={styles.section} aria-labelledby="profile-heading">
          <h2 id="profile-heading" className={styles.sectionTitle}>
            Profile
          </h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="displayName">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              className={`${styles.input} ${errors.displayName ? styles.inputError : ''}`}
              aria-invalid={Boolean(errors.displayName)}
              aria-describedby={errors.displayName ? 'displayName-error' : undefined}
              {...register('displayName')}
            />
            {errors.displayName && (
              <p id="displayName-error" className={styles.error} role="alert">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className={styles.error} role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              className={`${styles.textarea} ${errors.bio ? styles.textareaError : ''}`}
              aria-invalid={Boolean(errors.bio)}
              aria-describedby="bio-hint bio-error"
              {...register('bio')}
            />
            <p id="bio-hint" className={styles.hint}>
              {bioValue.length}/200 characters
            </p>
            {errors.bio && (
              <p id="bio-error" className={styles.error} role="alert">
                {errors.bio.message}
              </p>
            )}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="appearance-heading">
          <h2 id="appearance-heading" className={styles.sectionTitle}>
            Appearance
          </h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="theme">
              Theme
            </label>
            <select
              id="theme"
              className={`${styles.select} ${errors.theme ? styles.selectError : ''}`}
              aria-invalid={Boolean(errors.theme)}
              aria-describedby={errors.theme ? 'theme-error' : undefined}
              {...register('theme')}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            {errors.theme && (
              <p id="theme-error" className={styles.error} role="alert">
                {errors.theme.message}
              </p>
            )}
          </div>
        </section>

        <section
          className={styles.section}
          aria-labelledby="notifications-heading"
        >
          <h2 id="notifications-heading" className={styles.sectionTitle}>
            Notifications
          </h2>

          <div className={styles.checkboxRow}>
            <input
              id="emailNotifications"
              type="checkbox"
              className={styles.checkbox}
              {...register('emailNotifications')}
            />
            <label className={styles.checkboxLabel} htmlFor="emailNotifications">
              <span className={styles.checkboxTitle}>Email notifications</span>
              <span className={styles.checkboxDescription}>
                Receive updates about account activity and security alerts.
              </span>
            </label>
          </div>

          <div className={styles.checkboxRow}>
            <input
              id="marketingEmails"
              type="checkbox"
              className={styles.checkbox}
              {...register('marketingEmails')}
            />
            <label className={styles.checkboxLabel} htmlFor="marketingEmails">
              <span className={styles.checkboxTitle}>Marketing emails</span>
              <span className={styles.checkboxDescription}>
                Get product news, tips, and occasional promotional offers.
              </span>
            </label>
          </div>
        </section>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={!isDirty || isSubmitting}
          >
            Save changes
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleReset}
          >
            Reset to defaults
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPage;
