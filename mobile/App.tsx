import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { useAuthStore } from './src/stores/authStore';
import { ThemeProvider, useTheme } from './src/theme';

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

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
