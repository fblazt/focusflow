import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { Fab } from '@/components/fab';
import { TaskDetailSheet } from '@/components/task-detail-sheet';
import { TaskSection } from '@/components/task-section';
import { SwipeableTaskRow } from '@/components/swipeable-task-row';
import { getTasksByList, deleteTask, updateTask, useDb, createSession } from '@/lib/db';
import { type Task, type TaskList } from '@/lib/types';

const TABS: { key: TaskList; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'someday', label: 'Someday' },
];

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

function isOverdue(task: Task, today: string): boolean {
  if (task.isCompleted || !task.dueDate) return false;
  return task.dueDate < today;
}

export default function TasksScreen() {
  const db = useDb();
  const today = getTodayDateString();
  const [activeTab, setActiveTab] = useState<TaskList>('today');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [collapsed, setCollapsed] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const refreshTasks = useCallback(() => {
    getTasksByList(db, activeTab).then(setTasks);
  }, [db, activeTab]);

  useFocusEffect(
    useCallback(() => {
      refreshTasks();
    }, [refreshTasks]),
  );

  const { openCount, overdueCount, overdueTasks, incompleteTasks, completedTasks } = useMemo(() => {
    const open = tasks.filter((t) => !t.isCompleted);
    const overdue = open.filter((t) => isOverdue(t, today));
    const incomplete = open.filter((t) => !isOverdue(t, today));
    const completed = tasks.filter((t) => t.isCompleted);
    return {
      openCount: open.length,
      overdueCount: overdue.length,
      overdueTasks: overdue,
      incompleteTasks: incomplete,
      completedTasks: completed,
    };
  }, [tasks, today]);

  const handleToggle = useCallback(
    async (task: Task) => {
      const updated = await updateTask(db, task.id, { isCompleted: !task.isCompleted });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    },
    [db],
  );

  const handleDelete = useCallback(
    (task: Task) => {
      Alert.alert('Delete entry', `Remove "${task.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(db, task.id);
            setTasks((prev) => prev.filter((t) => t.id !== task.id));
          },
        },
      ]);
    },
    [db],
  );

  const handleFocus = useCallback(
    async (task: Task) => {
      await createSession(db, {
        taskId: task.id,
        mode: 'work',
        durationSeconds: 1500,
        status: 'running',
        remainingSeconds: 1500,
        startedAt: new Date().toISOString(),
      });
      router.navigate('/(tabs)/timer');
    },
    [db],
  );

  const handleAddPress = useCallback(() => {
    setSelectedTask(null);
    setSheetVisible(true);
  }, []);

  const handlePressRow = useCallback((task: Task) => {
    setSelectedTask(task);
    setSheetVisible(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetVisible(false);
    setSelectedTask(null);
  }, []);

  const handleSheetSaved = useCallback(() => {
    refreshTasks();
  }, [refreshTasks]);

  const renderItem = useCallback(
    (task: Task) => (
      <SwipeableTaskRow
        task={task}
        onToggle={() => handleToggle(task)}
        onPress={() => handlePressRow(task)}
        onDelete={handleDelete}
        onFocus={handleFocus}
      />
    ),
    [handleToggle, handlePressRow, handleDelete, handleFocus],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.count}>
          {openCount} open · {overdueCount} overdue
        </Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable key={tab.key} style={styles.tab} onPress={() => setActiveTab(tab.key)}>
              <Text
                style={[
                  Typography.metadata,
                  styles.tabLabel,
                  active ? styles.tabActive : styles.tabInactive,
                ]}
              >
                {tab.label}
              </Text>
              {active && <View style={styles.tabUnderline} />}
            </Pressable>
          );
        })}
        <View style={styles.tabRule} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {overdueTasks.length > 0 && (
          <TaskSection label="OVERDUE" variant="overdue">
            {overdueTasks.map((task) => (
              <View key={task.id}>{renderItem(task)}</View>
            ))}
          </TaskSection>
        )}

        <TaskSection label="TODAY">
          {incompleteTasks.length > 0 ? (
            incompleteTasks.map((task) => <View key={task.id}>{renderItem(task)}</View>)
          ) : (
            <Text style={styles.emptyText}>No tasks here.</Text>
          )}
        </TaskSection>

        {completedTasks.length > 0 && (
          <TaskSection
            label={`DONE TODAY (${completedTasks.length})`}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
          >
            {completedTasks.map((task) => (
              <View key={task.id}>{renderItem(task)}</View>
            ))}
          </TaskSection>
        )}
      </ScrollView>

      <Fab onPress={handleAddPress} />

      <TaskDetailSheet
        visible={sheetVisible}
        task={selectedTask}
        onClose={handleSheetClose}
        onSaved={handleSheetSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 60,
  },
  title: {
    ...Typography.heading1,
    color: Colors.light.ink,
  },
  count: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingHorizontal: Spacing.screenHorizontal,
  },
  tab: {
    marginRight: 24,
    paddingBottom: 8,
  },
  tabLabel: {
    letterSpacing: 1,
  },
  tabActive: {
    color: Colors.light.accent,
    fontWeight: '600',
  },
  tabInactive: {
    color: Colors.light.inkMuted,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.light.accent,
  },
  tabRule: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: Colors.light.border,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyText: {
    ...Typography.body,
    fontStyle: 'italic',
    color: Colors.light.inkFaded,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingVertical: 16,
  },
});
