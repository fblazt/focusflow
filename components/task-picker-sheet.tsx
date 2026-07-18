import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Spacing } from '@/constants/theme';
import { FontFamily, Typography } from '@/constants/typography';
import { getTasks, useDb } from '@/lib/db';
import { type Task } from '@/lib/types';

interface TaskPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (task: Task) => void;
  selectedId?: string | null;
}

const DISMISS_THRESHOLD = 80;

export function TaskPickerSheet({ visible, onClose, onSelect, selectedId }: TaskPickerSheetProps) {
  const db = useDb();
  const [tasks, setTasks] = useState<Task[]>([]);
  const translateY = useSharedValue(600);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      getTasks(db).then(setTasks);
      translateY.value = 600;
      backdropOpacity.value = 0;
      translateY.value = withTiming(0, { duration: 350 });
      backdropOpacity.value = withTiming(1, { duration: 350 });
    }
  }, [visible, translateY, backdropOpacity]);

  const doClose = () => {
    onClose();
  };

  const dismiss = () => {
    translateY.value = withTiming(600, { duration: 250 });
    backdropOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) runOnJS(doClose)();
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY * 0.5);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > 500) {
        translateY.value = withTiming(600, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
          if (finished) runOnJS(doClose)();
        });
      } else {
        translateY.value = withTiming(0, { duration: 250 });
        backdropOpacity.value = withTiming(1, { duration: 250 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.backdropPress} onPress={dismiss} />
      </Animated.View>
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <GestureDetector gesture={pan}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>
        <Text style={styles.header}>LINK A TASK</Text>
        <View style={styles.rule} />
        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          {tasks.map((task) => {
            const selected = task.id === selectedId;
            return (
              <Pressable
                key={task.id}
                style={[styles.row, selected && styles.rowSelected]}
                onPress={() => onSelect(task)}
              >
                <Text
                  style={[styles.rowName, selected && styles.rowNameSelected]}
                  numberOfLines={1}
                >
                  {task.name}
                </Text>
                {task.dueDate && (
                  <Text style={styles.rowMeta}>
                    {task.isCompleted
                      ? 'done'
                      : new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                  </Text>
                )}
              </Pressable>
            );
          })}
          {tasks.length === 0 && <Text style={styles.empty}>No tasks yet.</Text>}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 25, 23, 0.35)',
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    maxHeight: '70%',
    paddingBottom: 32,
    borderTopWidth: 1.5,
    borderTopColor: Colors.light.border,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
  },
  header: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    letterSpacing: 2,
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: 8,
    fontFamily: FontFamily.mono,
  },
  rule: {
    height: 1.5,
    backgroundColor: Colors.light.border,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: Spacing.screenHorizontal,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.ruledLine,
    minHeight: 50,
  },
  rowSelected: {
    borderBottomColor: Colors.light.accent,
  },
  rowName: {
    ...Typography.body,
    color: Colors.light.ink,
    flex: 1,
    marginRight: 8,
  },
  rowNameSelected: {
    color: Colors.light.accent,
    fontStyle: 'italic',
  },
  rowMeta: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    fontFamily: FontFamily.mono,
  },
  empty: {
    ...Typography.body,
    fontStyle: 'italic',
    color: Colors.light.inkFaded,
    paddingVertical: 24,
    textAlign: 'center',
  },
});
