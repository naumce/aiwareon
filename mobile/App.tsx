import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { RootNavigator } from './src/navigation';
import { useAuthStore } from './src/stores/authStore';
import { ThemeProvider, useTheme } from './src/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { config } from './src/config';

// Initialize Sentry
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    tracesSampleRate: 0.2,
    enabled: !__DEV__,
  });
}

function AppContent() {
  const { initialize } = useAuthStore();
  const { isDark } = useTheme();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default config.sentry.dsn ? Sentry.wrap(App) : App;
