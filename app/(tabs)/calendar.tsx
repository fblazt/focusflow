import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { AgendaList } from '@/components/agenda-list';
import { CalendarGrid } from '@/components/calendar-grid';
import { TaskDetailSheet } from '@/components/task-detail-sheet';
import { useCalendar } from '@/hooks/use-calendar';
import { getTasks, useDb } from '@/lib/db';
import { type Task } from '@/lib/types';

export default function CalendarScreen() {
  const db = useDb();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const {
    year,
    monthName,
    dayNames,
    rows,
    selectedDate,
    selectedTasks,
    agendaDateLabel,
    goToPrevMonth,
    goToNextMonth,
    selectDate,
  } = useCalendar(tasks);

  const refreshTasks = useCallback(() => {
    getTasks(db).then(setTasks);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refreshTasks();
    }, [refreshTasks]),
  );

  const handleTaskPress = useCallback((task: Task) => {
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

  return (
    <View style={styles.container}>
      <CalendarGrid
        year={year}
        monthName={monthName}
        dayNames={dayNames}
        rows={rows}
        selectedDate={selectedDate}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onSelectDate={selectDate}
      />

      <ScrollView style={styles.agendaScroll} contentContainerStyle={styles.agendaContent}>
        <AgendaList
          dateLabel={agendaDateLabel}
          tasks={selectedTasks}
          onTaskPress={handleTaskPress}
        />
      </ScrollView>

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
    backgroundColor: '#F5F0E8',
  },
  agendaScroll: {
    flex: 1,
  },
  agendaContent: {
    paddingBottom: 100,
  },
});
