export type TaskList = 'today' | 'upcoming' | 'someday';
export type Priority = 'none' | 'medium' | 'high';
export type TimerMode = 'work' | 'break';
export type TimerStatus = 'running' | 'paused' | 'completed';

export interface Task {
  id: string;
  name: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: Priority;
  notes: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  list: TaskList;
  reminderEnabled: boolean;
  sessionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimerSession {
  id: string;
  taskId: string | null;
  mode: TimerMode;
  durationSeconds: number;
  status: TimerStatus;
  remainingSeconds: number;
  startedAt: string | null;
  completedAt: string | null;
}

export type NewTask = Omit<
  Task,
  'id' | 'createdAt' | 'updatedAt' | 'sessionCount' | 'isCompleted' | 'completedAt'
> & {
  id?: string;
  sessionCount?: number;
  isCompleted?: boolean;
  completedAt?: string | null;
};

export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt'>>;
