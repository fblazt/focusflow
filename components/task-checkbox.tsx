import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

const CHECKBOX_SIZE = 24;

interface TaskCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

export function TaskCheckbox({ checked, onToggle }: TaskCheckboxProps) {
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 300 });
  }, [checked, progress]);

  const checkboxStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [Colors.light.border, Colors.light.accent],
    ),
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.3, 1],
      ['transparent', `${Colors.light.accent}20`, Colors.light.accent],
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Pressable onPress={onToggle} hitSlop={8}>
      <Animated.View style={[styles.checkbox, checkboxStyle]}>
        <Animated.Text style={[styles.checkmark, checkStyle]}>✓</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 14,
    color: Colors.light.background,
    fontFamily: 'Lora',
    lineHeight: 16,
  },
});
