import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { FontFamily } from '@/constants/typography';
import { type Task } from '@/lib/types';
import { TaskRow } from './task-row';

interface SwipeableTaskRowProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
  onDelete: (task: Task) => void;
  onFocus: (task: Task) => void;
}

function DeleteAction({
  progress,
  onPress,
}: {
  progress: SharedValue<number>;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
  return (
    <Reanimated.View style={[styles.leftAction, style]}>
      <RectButton style={styles.deleteButton} onPress={onPress}>
        <Text style={styles.deleteText}>Delete</Text>
      </RectButton>
    </Reanimated.View>
  );
}

function FocusAction({
  progress,
  onPress,
}: {
  progress: SharedValue<number>;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
  return (
    <Reanimated.View style={[styles.rightAction, style]}>
      <RectButton style={styles.focusButton} onPress={onPress}>
        <Text style={styles.focusText}>Start focus</Text>
      </RectButton>
    </Reanimated.View>
  );
}

export function SwipeableTaskRow({
  task,
  onToggle,
  onPress,
  onDelete,
  onFocus,
}: SwipeableTaskRowProps) {
  const swipeableRef = useRef<React.ElementRef<typeof Swipeable>>(null);

  const close = useCallback(() => {
    swipeableRef.current?.close();
  }, []);

  const renderLeftActions = useCallback(
    (progress: SharedValue<number>) => (
      <DeleteAction
        progress={progress}
        onPress={() => {
          close();
          onDelete(task);
        }}
      />
    ),
    [close, onDelete, task],
  );

  const renderRightActions = useCallback(
    (progress: SharedValue<number>) => (
      <FocusAction
        progress={progress}
        onPress={() => {
          close();
          onFocus(task);
        }}
      />
    ),
    [close, onFocus, task],
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
    >
      <View style={styles.rowWrapper}>
        <TaskRow task={task} onToggle={onToggle} onPress={onPress} />
      </View>
    </Swipeable>
  );
}

const ACTION_WIDTH = 96;

const styles = StyleSheet.create({
  rowWrapper: {
    backgroundColor: Colors.light.background,
  },
  leftAction: {
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: Colors.light.danger,
    backgroundColor: Colors.light.background,
  },
  deleteText: {
    fontFamily: FontFamily.mono,
    fontSize: 13,
    color: Colors.light.danger,
    letterSpacing: 1,
  },
  rightAction: {
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusButton: {
    flex: 1,
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.accent,
  },
  focusText: {
    fontFamily: FontFamily.mono,
    fontSize: 13,
    color: Colors.light.background,
    letterSpacing: 1,
  },
});
