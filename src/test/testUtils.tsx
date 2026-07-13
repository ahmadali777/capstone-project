import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import settingsReducer from '../features/settings/settingsSlice';
import { defaultSettings } from '../features/settings/settingsTypes';

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedSettings = defaultSettings,
  }: {
    preloadedSettings?: typeof defaultSettings;
  } = {},
) {
  const store = configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: {
      settings: preloadedSettings,
    },
  });

  return {
    store,
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>,
    ),
  };
}
