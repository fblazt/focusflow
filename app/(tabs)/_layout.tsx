import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';
import { FontFamily } from '@/constants/typography';

const TAB_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'home',
  tasks: 'check-square',
  timer: 'clock',
  calendar: 'calendar',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  tasks: 'Tasks',
  timer: 'Timer',
  calendar: 'Calendar',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const iconName = TAB_ICONS[route.name] ?? 'circle';
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.light.accent,
        tabBarInactiveTintColor: Colors.light.inkMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabel: TAB_LABELS[route.name] ?? route.name,
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="timer" />
      <Tabs.Screen name="calendar" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.light.background,
    borderTopWidth: 1.5,
    borderTopColor: Colors.light.border,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    shadowColor: 'transparent',
    elevation: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontFamily: FontFamily.mono,
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
});
