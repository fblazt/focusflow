import { useCallback, useMemo, useState } from 'react';

import { type Task } from '@/lib/types';

export interface DayCell {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  hasTasks: boolean;
}

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getTodayStrs() {
  const today = new Date();
  return {
    dateStr: today.toISOString().split('T')[0] ?? '',
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
}

function computeDays(year: number, month: number): DayCell[] {
  const today = getTodayStrs();
  const todayStr = today.dateStr;

  const firstDay = new Date(year, month - 1, 1);
  const startingDayOfWeek = firstDay.getDay();
  const lastDayPrevMonth = new Date(year, month - 1, 0).getDate();

  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = lastDayPrevMonth - i;
    const date = toDateString(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1, d);
    cells.push({
      date,
      day: d,
      isCurrentMonth: false,
      isToday: date === todayStr,
      isPast: date < todayStr,
      hasTasks: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = toDateString(year, month, d);
    cells.push({
      date,
      day: d,
      isCurrentMonth: true,
      isToday: date === todayStr,
      isPast: date < todayStr,
      hasTasks: false,
    });
  }

  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const date = toDateString(nextYear, nextMonth, d);
      cells.push({
        date,
        day: d,
        isCurrentMonth: false,
        isToday: date === todayStr,
        isPast: date < todayStr,
        hasTasks: false,
      });
    }
  }

  return cells;
}

function rowsFromCells(cells: DayCell[]): DayCell[][] {
  const rows: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

export function useCalendar(tasks: Task[]) {
  const today = getTodayStrs();
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(today.dateStr);

  const monthName = MONTH_NAMES[month - 1] ?? '';

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (task.dueDate) {
        const existing = map.get(task.dueDate) || [];
        existing.push(task);
        map.set(task.dueDate, existing);
      }
    }
    return map;
  }, [tasks]);

  const days = useMemo(() => {
    const allCells = computeDays(year, month);
    for (const cell of allCells) {
      const dateTasks = tasksByDate.get(cell.date);
      cell.hasTasks = !!dateTasks && dateTasks.length > 0;
    }
    return allCells;
  }, [year, month, tasksByDate]);

  const rows = useMemo(() => rowsFromCells(days), [days]);

  const goToPrevMonth = useCallback(() => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const selectedTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasksByDate.get(selectedDate) ?? [];
  }, [selectedDate, tasksByDate]);

  const agendaDateLabel = useMemo(() => {
    if (!selectedDate) return '';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dayName = new Date(y!, (m ?? 1) - 1, d!).toLocaleDateString('en-US', {
      weekday: 'short',
    });
    return `${dayName.toUpperCase()}, ${MONTH_NAMES[(m ?? 1) - 1]?.toUpperCase()} ${d}`;
  }, [selectedDate]);

  return {
    year,
    month,
    monthName,
    dayNames: DAY_NAMES,
    rows,
    selectedDate,
    selectedTasks,
    agendaDateLabel,
    goToPrevMonth,
    goToNextMonth,
    selectDate,
  };
}
