import { ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, Suspense } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { FontFamily } from '@/constants/typography';
import { useFonts } from '@/hooks/use-fonts';
import { migrateDbIfNeeded, seedIfEmpty } from '@/lib/db';

SplashScreen.preventAutoHideAsync();

const InkTheme: Theme = {
  dark: false,
  colors: {
    primary: Colors.light.accent,
    background: Colors.light.background,
    card: Colors.light.background,
    text: Colors.light.ink,
    border: Colors.light.border,
    notification: Colors.light.danger,
  },
  fonts: {
    regular: { fontFamily: FontFamily.serif, fontWeight: '400' as const },
    medium: { fontFamily: FontFamily.serifBold, fontWeight: '600' as const },
    bold: { fontFamily: FontFamily.serifBold, fontWeight: '600' as const },
    heavy: { fontFamily: FontFamily.serifBold, fontWeight: '600' as const },
  },
};

function AppContent() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const { loaded, error } = useFonts();

  const onLayoutRootView = useCallback(() => {
    if (loaded || error) {
      SplashScreen.hide();
    }
  }, [loaded, error]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={InkTheme}>
      <SQLiteProvider databaseName="focusflow.db" onInit={initDb} useSuspense>
        <Suspense fallback={<View style={{ flex: 1, backgroundColor: Colors.light.background }} />}>
          <AppContent />
        </Suspense>
      </SQLiteProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

async function initDb(db: import('expo-sqlite').SQLiteDatabase) {
  await migrateDbIfNeeded(db);
  await seedIfEmpty(db);
}
