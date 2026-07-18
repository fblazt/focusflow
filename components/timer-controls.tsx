import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

type IconName = 'rotate-ccw' | 'play' | 'pause' | 'rotate-cw';

interface TimerControlsProps {
  status: 'idle' | 'running' | 'paused';
  onReset: () => void;
  onToggle: () => void; // play/pause
  onSkip: () => void;
}

export function TimerControls({ status, onReset, onToggle, onSkip }: TimerControlsProps) {
  const isRunning = status === 'running';
  const playIcon: IconName = isRunning ? 'pause' : 'play';

  return (
    <View style={styles.row}>
      <ControlButton icon="rotate-ccw" size={52} onPress={onReset} />
      <ControlButton icon={playIcon} size={68} primary={isRunning} onPress={onToggle} />
      <ControlButton icon="rotate-cw" size={52} onPress={onSkip} />
    </View>
  );
}

function ControlButton({
  icon,
  size,
  primary,
  onPress,
}: {
  icon: IconName;
  size: number;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: 3,
          borderWidth: primary ? 2 : 1.5,
          borderColor: primary ? Colors.light.borderDark : Colors.light.border,
          backgroundColor: primary
            ? pressed
              ? Colors.light.surfacePressed
              : Colors.light.accent
            : Colors.light.background,
        },
      ]}
    >
      <Feather
        name={icon}
        size={size * 0.32}
        color={primary ? Colors.light.background : Colors.light.ink}
        strokeWidth={2}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
