import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Fab } from '@/components/fab';
import { PomodoroStrip } from '@/components/pomodoro-strip';
import { TaskRow } from '@/components/task-row';
import { useActiveSession } from '@/hooks/use-active-session';
import { getTasksByDate, updateTask, useDb } from '@/lib/db';
import { type Task } from '@/lib/types';

function formatDate(): { dayOfWeek: string; fullDate: string } {
  const now = new Date();
  const dow = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const full = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return { dayOfWeek: dow, fullDate: full };
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;

    const aOverdue =
      !a.isCompleted && a.dueDate && new Date(a.dueDate) < new Date(getTodayDateString());
    const bOverdue =
      !b.isCompleted && b.dueDate && new Date(b.dueDate) < new Date(getTodayDateString());
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

    if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
    if (a.dueTime) return -1;
    if (b.dueTime) return 1;
    return 0;
  });
}

export default function TodayScreen() {
  const { dayOfWeek, fullDate } = formatDate();
  const db = useDb();
  const { activeSession } = useActiveSession();

  const [tasks, setTasks] = useState<Task[]>([]);
  const todayDate = getTodayDateString();

  useFocusEffect(
    useCallback(() => {
      getTasksByDate(db, todayDate).then(setTasks);
    }, [db, todayDate]),
  );

  const handleToggle = useCallback(
    async (task: Task) => {
      const updated = await updateTask(db, task.id, { isCompleted: !task.isCompleted });
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)).filter((t) => t.dueDate === todayDate),
      );
    },
    [db, todayDate],
  );

  const handleAddPress = useCallback(() => {
    // Placeholder — will open Task Detail sheet in Phase 5
  }, []);

  const incomplete = tasks.filter((t) => !t.isCompleted);
  const sorted = sortTasks(tasks);

  const activeProgress =
    activeSession && activeSession.session.durationSeconds > 0
      ? 1 - activeSession.session.remainingSeconds / activeSession.session.durationSeconds
      : 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.dayOfWeek}>{dayOfWeek}</Text>
            <Text style={styles.date}>{fullDate}</Text>

            {activeSession && (
              <PomodoroStrip
                task={activeSession.task}
                remainingTime={activeSession.remainingTime}
                progress={activeProgress}
                onPress={() => router.navigate('/(tabs)/timer')}
              />
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>
                TODAY — {incomplete.length} TASK{incomplete.length !== 1 ? 'S' : ''}
              </Text>
              <View style={styles.sectionRule} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tasks for today.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            onToggle={() => handleToggle(item)}
            onPress={() => {
              // Placeholder — will open Task Detail sheet in Phase 5
            }}
          />
        )}
      />

      <Fab onPress={handleAddPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  dayOfWeek: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    letterSpacing: 2,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 60,
  },
  date: {
    ...Typography.heading1,
    color: Colors.light.ink,
    paddingHorizontal: Spacing.screenHorizontal,
    marginTop: 4,
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: 8,
  },
  sectionLabel: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    letterSpacing: 1,
  },
  sectionRule: {
    height: 1,
    backgroundColor: Colors.light.ruledLine,
    marginTop: 8,
  },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    fontStyle: 'italic',
    color: Colors.light.inkFaded,
  },
});
