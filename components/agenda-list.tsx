import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { isOverdue } from '@/lib/overdue';
import { type Task } from '@/lib/types';

function formatTime(time: string | null): string {
  if (!time) return 'no time set';
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h ?? 0, m ?? 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getMarkColor(task: Task): string {
  if (isOverdue(task)) return Colors.light.danger;
  if (task.dueTime) return Colors.light.accent;
  return Colors.light.inkMuted;
}

interface AgendaListProps {
  dateLabel: string;
  tasks: Task[];
  onTaskPress: (task: Task) => void;
}

export function AgendaList({ dateLabel, tasks, onTaskPress }: AgendaListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.dateLabel}>{dateLabel}</Text>

      {tasks.length === 0 ? (
        <Text style={styles.emptyText}>No entries for this day.</Text>
      ) : (
        tasks.map((task) => (
          <Pressable
            key={task.id}
            style={styles.row}
            onPress={() => onTaskPress(task)}
            android_ripple={{ color: Colors.light.surfacePressed }}
          >
            <View style={[styles.mark, { backgroundColor: getMarkColor(task) }]} />
            <View style={styles.content}>
              <Text
                style={[
                  styles.taskName,
                  task.isCompleted && styles.taskCompleted,
                  isOverdue(task) && styles.taskOverdue,
                ]}
                numberOfLines={2}
              >
                {task.name}
              </Text>
              <Text style={[styles.taskTime, isOverdue(task) && styles.taskOverdue]}>
                {formatTime(task.dueTime)}
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginBottom: 16,
  },
  dateLabel: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.ruledLine,
    borderStyle: 'dashed',
  },
  mark: {
    width: 8,
    height: 8,
    marginTop: 6,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  taskName: {
    ...Typography.body,
    color: Colors.light.ink,
  },
  taskCompleted: {
    color: Colors.light.inkDisabled,
    textDecorationLine: 'line-through',
  },
  taskOverdue: {
    color: Colors.light.danger,
  },
  taskTime: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    marginTop: 4,
  },
  emptyText: {
    ...Typography.body,
    fontStyle: 'italic',
    color: Colors.light.inkFaded,
    paddingVertical: 20,
  },
});
