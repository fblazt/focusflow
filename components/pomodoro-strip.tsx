import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { FontFamily, Typography } from '@/constants/typography';
import { type Task } from '@/lib/types';

interface PomodoroStripProps {
  task: Task | null;
  remainingTime: string;
  progress: number;
  onPress: () => void;
}

export function PomodoroStrip({ task, remainingTime, progress, onPress }: PomodoroStripProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.label}>FOCUS</Text>
        <Text style={styles.taskName} numberOfLines={1}>
          {task?.name ?? 'Untitled session'}
        </Text>
        <Text style={styles.time}>{remainingTime}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: Colors.light.borderDark,
    backgroundColor: Colors.light.surface,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...Typography.caption,
    color: Colors.light.inkMuted,
    letterSpacing: 1.5,
    marginRight: 10,
  },
  taskName: {
    flex: 1,
    ...Typography.bodySmall,
    fontFamily: FontFamily.serif,
    color: Colors.light.ink,
    fontStyle: 'italic',
  },
  time: {
    ...Typography.metadata,
    color: Colors.light.ink,
    marginLeft: 8,
  },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.light.border,
    borderRadius: 1,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.accent,
  },
});
