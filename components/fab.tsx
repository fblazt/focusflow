import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/theme';

const FAB_SIZE = 48;

interface FabProps {
  onPress: () => void;
}

export function Fab({ onPress }: FabProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      onPress={onPress}
      android_ripple={{ color: Colors.light.surfacePressed, borderless: false }}
    >
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 22,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: 4,
    backgroundColor: Colors.light.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: Colors.light.inkAlt,
  },
  icon: {
    fontSize: 24,
    color: Colors.light.background,
    fontFamily: 'IBM Plex Mono',
    lineHeight: 28,
  },
});
