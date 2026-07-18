import { useCallback, useState, useEffect, useRef } from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { FontFamily, Typography } from '@/constants/typography';
import { DateTimePickerField } from '@/components/date-time-picker';
import { InkInput } from '@/components/ink-input';
import { NotesTextarea } from '@/components/notes-textarea';
import { PrioritySelector } from '@/components/priority-selector';
import { SessionTally } from '@/components/session-tally';
import { createSession, createTask, deleteTask, updateTask, useDb } from '@/lib/db';
import { ensureNotificationPermission } from '@/lib/notifications';
import { type Priority, type Task } from '@/lib/types';

interface TaskDetailSheetProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSaved: () => void;
}

const DISMISS_THRESHOLD = 80;
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

export function TaskDetailSheet({ visible, task, onClose, onSaved }: TaskDetailSheetProps) {
  const db = useDb();
  const isEditing = task !== null;

  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('none');
  const [notes, setNotes] = useState<string>('');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const translateY = useSharedValue(600);
  const keyboardHeight = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  const initialValues = useRef({
    name: '',
    dueDate: null as string | null,
    dueTime: null as string | null,
    priority: 'none' as Priority,
    notes: '',
  });

  useEffect(() => {
    if (visible) {
      if (task) {
        setName(task.name);
        setDueDate(task.dueDate);
        setDueTime(task.dueTime);
        setPriority(task.priority);
        setNotes(task.notes ?? '');
        setReminderEnabled(task.reminderEnabled);
        initialValues.current = {
          name: task.name,
          dueDate: task.dueDate,
          dueTime: task.dueTime,
          priority: task.priority,
          notes: task.notes ?? '',
        };
      } else {
        setName('');
        setDueDate(null);
        setDueTime(null);
        setPriority('none');
        setNotes('');
        setReminderEnabled(false);
        initialValues.current = {
          name: '',
          dueDate: null,
          dueTime: null,
          priority: 'none',
          notes: '',
        };
      }

      translateY.value = 600;
      backdropOpacity.value = 0;
      keyboardHeight.value = 0;
      translateY.value = withTiming(0, { duration: 350 });
      backdropOpacity.value = withTiming(1, { duration: 350 });
    }
  }, [visible, task, translateY, backdropOpacity, keyboardHeight]);

  useEffect(() => {
    if (!visible) return;

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const offset = e.endCoordinates.height - TAB_BAR_HEIGHT;
        keyboardHeight.value = withTiming(Math.max(0, offset), { duration: 250 });
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        keyboardHeight.value = withTiming(0, { duration: 250 });
      },
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible, keyboardHeight]);

  const isDirty = useCallback(() => {
    const init = initialValues.current;
    return (
      name !== init.name ||
      dueDate !== init.dueDate ||
      dueTime !== init.dueTime ||
      priority !== init.priority ||
      notes !== init.notes
    );
  }, [name, dueDate, dueTime, priority, notes]);

  const doClose = () => {
    Keyboard.dismiss();
    keyboardHeight.value = 0;
    onClose();
  };

  const confirmDismiss = () => {
    if (isDirty()) {
      Alert.alert('Discard changes?', 'You have unsaved changes.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: doClose },
      ]);
    } else {
      doClose();
    }
  };

  const dismiss = () => {
    if (isDirty()) {
      runOnJS(confirmDismiss)();
      return;
    }
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
        runOnJS(confirmDismiss)();
      } else {
        translateY.value = withTiming(0, { duration: 250 });
        backdropOpacity.value = withTiming(1, { duration: 250 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    bottom: keyboardHeight.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    if (isEditing && task) {
      await updateTask(db, task.id, {
        name: name.trim(),
        dueDate,
        dueTime,
        priority,
        notes: notes.trim() || null,
        reminderEnabled,
      });
    } else {
      await createTask(db, {
        name: name.trim(),
        dueDate,
        dueTime,
        priority,
        notes: notes.trim() || null,
        list: 'today',
        reminderEnabled,
      });
    }

    if (reminderEnabled && dueDate && dueTime) {
      const hasPermission = await ensureNotificationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Notifications disabled',
          'Enable notifications in Settings to receive reminders.',
        );
      }
    }

    onSaved();
    onClose();
  }, [
    name,
    dueDate,
    dueTime,
    priority,
    notes,
    reminderEnabled,
    isEditing,
    task,
    db,
    onSaved,
    onClose,
  ]);

  const handleDelete = useCallback(() => {
    if (!isEditing || !task) return;
    Alert.alert('Delete entry', `Remove "${task.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(db, task.id);
          onSaved();
          onClose();
        },
      },
    ]);
  }, [isEditing, task, db, onSaved, onClose]);

  const handleStartFocus = useCallback(async () => {
    if (!isEditing || !task) return;
    await createSession(db, {
      taskId: task.id,
      mode: 'work',
      durationSeconds: 1500,
      status: 'running',
      remainingSeconds: 1500,
      startedAt: new Date().toISOString(),
    });
    onClose();
    router.navigate('/(tabs)/timer');
  }, [isEditing, task, db, onClose]);

  if (!visible) return null;

  const canSave = name.trim().length > 0;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.backdropPress} onPress={dismiss} />
      </Animated.View>
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.sheetInner}>
          <GestureDetector gesture={pan}>
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>
          <View style={styles.header}>
            <Text style={styles.headerLabel}>{isEditing ? 'EDIT ENTRY' : 'NEW ENTRY'}</Text>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={[styles.doneButton, !canSave && styles.doneButtonDisabled]}
            >
              <Text style={[styles.doneText, !canSave && styles.doneTextDisabled]}>Done</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <InkInput
              value={name}
              onChangeText={(t) => setName(t)}
              placeholder="What needs doing?"
              autoFocus={!isEditing}
              style={styles.nameInput}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Due</Text>
              <DateTimePickerField
                date={dueDate}
                time={dueTime}
                reminderEnabled={reminderEnabled}
                onDateChange={(d) => setDueDate(d)}
                onTimeChange={(t) => setDueTime(t)}
                onReminderChange={(e) => setReminderEnabled(e)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Priority</Text>
              <PrioritySelector value={priority} onChange={(p) => setPriority(p)} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <NotesTextarea
                value={notes}
                onChangeText={(t) => setNotes(t)}
                placeholder="Notes, context, links…"
              />
            </View>

            {isEditing && task && (
              <View style={styles.editActions}>
                <Pressable style={styles.startFocusButton} onPress={handleStartFocus}>
                  <Text style={styles.startFocusText}>Start focus session →</Text>
                </Pressable>

                <View style={styles.sessionSection}>
                  <Text style={styles.sessionLabel}>
                    {task.sessionCount} session{task.sessionCount !== 1 ? 's' : ''} completed
                  </Text>
                  <SessionTally count={task.sessionCount} />
                </View>

                <Pressable style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.deleteText}>delete this entry</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
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
    maxHeight: '85%',
    borderTopWidth: 1.5,
    borderTopColor: Colors.light.border,
  },
  sheetInner: {
    flex: 1,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: 8,
  },
  headerLabel: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    letterSpacing: 2,
    fontFamily: FontFamily.mono,
  },
  doneButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doneButtonDisabled: {
    opacity: 0.4,
  },
  doneText: {
    ...Typography.metadata,
    color: Colors.light.accent,
    fontWeight: '600',
    fontFamily: FontFamily.mono,
  },
  doneTextDisabled: {
    color: Colors.light.inkFaded,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 40,
  },
  nameInput: {
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    letterSpacing: 1,
    fontFamily: FontFamily.mono,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  editActions: {
    marginTop: 8,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.light.ruledLine,
  },
  startFocusButton: {
    borderWidth: 2,
    borderColor: Colors.light.borderDark,
    borderRadius: 3,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  startFocusText: {
    ...Typography.body,
    color: Colors.light.ink,
    fontFamily: FontFamily.mono,
    fontSize: 15,
  },
  sessionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sessionLabel: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    fontFamily: FontFamily.mono,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteText: {
    ...Typography.metadata,
    color: Colors.light.danger,
    fontFamily: FontFamily.mono,
  },
});
