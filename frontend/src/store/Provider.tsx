'use client';

import React, { useRef, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { makeStore, AppStore } from './index';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { loginSuccess } from '../features/auth/slice';

// Create a theme configuration that plays nicely with Tailwind CSS (Admin theme uses Indigo/Violet)
const theme = createTheme({
  cssVariables: true, // Enables CSS variables support in MUI
  palette: {
    primary: {
      main: '#4f46e5', // Tailwind's indigo-600
    },
    secondary: {
      main: '#8b5cf6', // Tailwind's violet-500
    },
    background: {
      default: '#fafafa', // Tailwind's zinc-50
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), sans-serif',
  },
});

export function ClientAuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('zs_user');
        const storedToken = localStorage.getItem('zs_token');
        if (storedUser && storedToken) {
          const parsed = JSON.parse(storedUser);
          if (parsed) {
            dispatch(loginSuccess({
              user: parsed,
              token: storedToken
            }));
          }
        }
      } catch (e) {
        console.error('Failed to restore admin auth session', e);
      }
    }
  }, [dispatch]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <ClientAuthInitializer />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
