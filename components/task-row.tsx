import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { type Task } from '@/lib/types';
import { TaskCheckbox } from './task-checkbox';

function formatTime(time: string | null): string | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h ?? 0, m ?? 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function isOverdue(task: Task): boolean {
  if (task.isCompleted || !task.dueDate) return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}

interface TaskRowProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
}

export function TaskRow({ task, onToggle, onPress }: TaskRowProps) {
  const isChecked = task.isCompleted;
  const overdue = isOverdue(task);
  const timeStr = formatTime(task.dueTime);

  const checkboxProgress = useSharedValue(isChecked ? 1 : 0);
  const strikethroughProgress = useSharedValue(isChecked ? 1 : 0);
  const textFadeProgress = useSharedValue(isChecked ? 1 : 0);

  useEffect(() => {
    if (isChecked) {
      checkboxProgress.value = 1;
      strikethroughProgress.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 300 }),
        withTiming(1, { duration: 200 }),
      );
      textFadeProgress.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 200 }),
      );
    } else {
      checkboxProgress.value = withTiming(0, { duration: 200 });
      strikethroughProgress.value = withTiming(0, { duration: 200 });
      textFadeProgress.value = withTiming(0, { duration: 200 });
    }
  }, [isChecked, checkboxProgress, strikethroughProgress, textFadeProgress]);

  const nameColor = overdue ? Colors.light.danger : Colors.light.ink;

  const nameStyle = useAnimatedStyle(() => ({
    color: interpolateColor(textFadeProgress.value, [0, 1], [nameColor, Colors.light.inkDisabled]),
  }));

  const strikethroughStyle = useAnimatedStyle(() => ({
    width: `${strikethroughProgress.value * 100}%`,
  }));

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      android_ripple={{ color: Colors.light.surfacePressed }}
    >
      <TaskCheckbox checked={isChecked} onToggle={onToggle} />
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Animated.Text
            style={[styles.name, nameStyle, overdue && styles.overdue]}
            numberOfLines={2}
          >
            {task.name}
          </Animated.Text>
          <View style={styles.nameUnderline}>
            <Animated.View style={[styles.strikethrough, strikethroughStyle]} />
          </View>
        </View>
        {timeStr && (
          <Animated.Text style={[styles.time, nameStyle, overdue && styles.overdue]}>
            {timeStr}
          </Animated.Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 22,
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.ruledLine,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    position: 'relative',
  },
  name: {
    ...Typography.body,
    color: Colors.light.ink,
  },
  nameUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  strikethrough: {
    height: 1.5,
    backgroundColor: Colors.light.inkDisabled,
    position: 'absolute',
    top: Typography.body.lineHeight / 2 - 1,
    left: 0,
  },
  time: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    marginTop: 4,
  },
  overdue: {
    color: Colors.light.danger,
  },
});
