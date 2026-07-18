import * as SQLite from 'expo-sqlite';
import { type NewTask, type Task, type TaskUpdate, type TimerSession } from './types';

export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');

  if (result && result.user_version >= DATABASE_VERSION) {
    return;
  }

  await db.execAsync(`
    PRAGMA journal_mode = 'wal';
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      dueDate TEXT,
      dueTime TEXT,
      priority TEXT NOT NULL DEFAULT 'none',
      notes TEXT,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      completedAt TEXT,
      list TEXT NOT NULL DEFAULT 'today',
      reminderEnabled INTEGER NOT NULL DEFAULT 0,
      sessionCount INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS timer_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      taskId TEXT,
      mode TEXT NOT NULL DEFAULT 'work',
      durationSeconds INTEGER NOT NULL DEFAULT 1500,
      status TEXT NOT NULL DEFAULT 'completed',
      remainingSeconds INTEGER NOT NULL DEFAULT 0,
      startedAt TEXT,
      completedAt TEXT
    );
    PRAGMA user_version = ${DATABASE_VERSION};
  `);
}

export async function seedIfEmpty(db: SQLite.SQLiteDatabase) {
  const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks');
  if (count && count.count > 0) return;

  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0] ?? '';
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] ?? '';
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0] ?? '';
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] ?? '';

  const tasks: NewTask[] = [
    {
      name: 'Design review',
      dueDate: today,
      dueTime: '15:00',
      priority: 'high',
      notes: null,
      list: 'today',
      reminderEnabled: false,
    },
    {
      name: 'Grocery shopping',
      dueDate: today,
      dueTime: null,
      priority: 'none',
      notes: 'Milk, eggs, bread, avocados',
      list: 'today',
      reminderEnabled: false,
    },
    {
      name: 'Morning pages',
      dueDate: today,
      dueTime: null,
      priority: 'none',
      notes: null,
      list: 'today',
      isCompleted: true,
      completedAt: now,
      reminderEnabled: false,
    },
    {
      name: 'Call dentist',
      dueDate: today,
      dueTime: '11:30',
      priority: 'medium',
      notes: 'Ask about teeth whitening',
      list: 'today',
      reminderEnabled: false,
    },
    {
      name: 'Submit quarterly report',
      dueDate: yesterday,
      dueTime: '17:00',
      priority: 'high',
      notes: null,
      list: 'today',
      reminderEnabled: false,
    },
    {
      name: 'Update portfolio site',
      dueDate: tomorrow,
      dueTime: null,
      priority: 'medium',
      notes: 'Add recent projects',
      list: 'upcoming',
      reminderEnabled: false,
    },
    {
      name: 'Read chapter 5',
      dueDate: nextWeek,
      dueTime: null,
      priority: 'none',
      notes: null,
      list: 'upcoming',
      reminderEnabled: false,
    },
    {
      name: 'Plan weekend trip',
      dueDate: null,
      dueTime: null,
      priority: 'none',
      notes: 'Check train schedules',
      list: 'someday',
      reminderEnabled: false,
    },
    {
      name: 'Organize desk drawer',
      dueDate: null,
      dueTime: null,
      priority: 'none',
      notes: null,
      list: 'someday',
      reminderEnabled: false,
    },
    {
      name: 'Fix bike chain',
      dueDate: null,
      dueTime: null,
      priority: 'medium',
      notes: 'Order new chain if needed',
      list: 'someday',
      reminderEnabled: false,
    },
  ];

  for (const task of tasks) {
    await db.runAsync(
      `INSERT INTO tasks (id, name, dueDate, dueTime, priority, notes, isCompleted, completedAt, list, reminderEnabled, sessionCount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      generateId(),
      task.name,
      task.dueDate,
      task.dueTime,
      task.priority,
      task.notes ?? null,
      task.isCompleted ? 1 : 0,
      task.completedAt ?? null,
      task.list,
      task.reminderEnabled ? 1 : 0,
      task.sessionCount ?? 0,
      now,
      now,
    );
  }
}

let counter = BigInt(Date.now());

function generateId(): string {
  counter += 1n;
  return counter.toString(36);
}

export function mapRowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    name: row.name as string,
    dueDate: (row.dueDate as string) || null,
    dueTime: (row.dueTime as string) || null,
    priority: (row.priority as Task['priority']) || 'none',
    notes: (row.notes as string) || null,
    isCompleted: Boolean(row.isCompleted),
    completedAt: (row.completedAt as string) || null,
    list: (row.list as Task['list']) || 'today',
    reminderEnabled: Boolean(row.reminderEnabled),
    sessionCount: (row.sessionCount as number) || 0,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

export function mapRowToSession(row: Record<string, unknown>): TimerSession {
  return {
    id: row.id as string,
    taskId: (row.taskId as string) || null,
    mode: (row.mode as TimerSession['mode']) || 'work',
    durationSeconds: (row.durationSeconds as number) || 1500,
    status: (row.status as TimerSession['status']) || 'completed',
    remainingSeconds: (row.remainingSeconds as number) || 0,
    startedAt: (row.startedAt as string) || null,
    completedAt: (row.completedAt as string) || null,
  };
}

export function useDb() {
  return SQLite.useSQLiteContext();
}

export async function getTasks(db: SQLite.SQLiteDatabase): Promise<Task[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM tasks ORDER BY dueDate ASC, createdAt DESC',
  );
  return rows.map(mapRowToTask);
}

export async function getTask(db: SQLite.SQLiteDatabase, id: string): Promise<Task | null> {
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM tasks WHERE id = ?',
    id,
  );
  return row ? mapRowToTask(row) : null;
}

export async function createTask(db: SQLite.SQLiteDatabase, data: NewTask): Promise<Task> {
  const now = new Date().toISOString();
  const id = data.id ?? generateId();
  await db.runAsync(
    `INSERT INTO tasks (id, name, dueDate, dueTime, priority, notes, isCompleted, completedAt, list, reminderEnabled, sessionCount, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    data.name,
    data.dueDate ?? null,
    data.dueTime ?? null,
    data.priority ?? 'none',
    data.notes ?? null,
    data.isCompleted ? 1 : 0,
    data.completedAt ?? null,
    data.list ?? 'today',
    data.reminderEnabled ? 1 : 0,
    data.sessionCount ?? 0,
    now,
    now,
  );
  const task = await getTask(db, id);
  if (!task) throw new Error('Failed to create task');
  return task;
}

export async function updateTask(
  db: SQLite.SQLiteDatabase,
  id: string,
  data: TaskUpdate,
): Promise<Task> {
  const now = new Date().toISOString();
  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  const fields: [keyof TaskUpdate, string][] = [
    ['name', 'name'],
    ['dueDate', 'dueDate'],
    ['dueTime', 'dueTime'],
    ['priority', 'priority'],
    ['notes', 'notes'],
    ['list', 'list'],
    ['reminderEnabled', 'reminderEnabled'],
  ];

  for (const [key, col] of fields) {
    if (key in data) {
      const val = data[key];
      sets.push(`${col} = ?`);
      values.push(
        key === 'reminderEnabled' ? (val ? 1 : 0) : ((val as string | number | null) ?? null),
      );
    }
  }

  if ('isCompleted' in data && data.isCompleted !== undefined) {
    sets.push('isCompleted = ?');
    values.push(data.isCompleted ? 1 : 0);
    if (data.isCompleted) {
      sets.push('completedAt = ?');
      values.push(now);
    } else {
      sets.push('completedAt = NULL');
    }
  }

  if ('sessionCount' in data && data.sessionCount !== undefined) {
    sets.push('sessionCount = ?');
    values.push(data.sessionCount);
  }

  if (sets.length === 0) {
    const task = await getTask(db, id);
    if (!task) throw new Error('Task not found');
    return task;
  }

  sets.push('updatedAt = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, ...values);

  const task = await getTask(db, id);
  if (!task) throw new Error('Task not found after update');
  return task;
}

export async function deleteTask(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM tasks WHERE id = ?', id);
}

export async function getTasksByDate(db: SQLite.SQLiteDatabase, date: string): Promise<Task[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM tasks WHERE dueDate = ? ORDER BY dueTime ASC, createdAt DESC',
    date,
  );
  return rows.map(mapRowToTask);
}

export async function getTasksByList(db: SQLite.SQLiteDatabase, list: string): Promise<Task[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM tasks WHERE list = ? ORDER BY dueDate ASC, createdAt DESC',
    list,
  );
  return rows.map(mapRowToTask);
}

export async function createSession(
  db: SQLite.SQLiteDatabase,
  data: Partial<TimerSession> & { mode?: string; durationSeconds?: number },
): Promise<TimerSession> {
  const id = generateId();
  const session: TimerSession = {
    id,
    taskId: data.taskId ?? null,
    mode: (data.mode as TimerSession['mode']) ?? 'work',
    durationSeconds: data.durationSeconds ?? 1500,
    status: data.status ?? 'running',
    remainingSeconds: data.remainingSeconds ?? data.durationSeconds ?? 1500,
    startedAt: data.startedAt ?? null,
    completedAt: data.completedAt ?? null,
  };

  await db.runAsync(
    `INSERT INTO timer_sessions (id, taskId, mode, durationSeconds, status, remainingSeconds, startedAt, completedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    session.id,
    session.taskId,
    session.mode,
    session.durationSeconds,
    session.status,
    session.remainingSeconds,
    session.startedAt,
    session.completedAt,
  );

  return session;
}

export async function updateSession(
  db: SQLite.SQLiteDatabase,
  id: string,
  data: Partial<Omit<TimerSession, 'id'>>,
): Promise<TimerSession> {
  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  const fields: (keyof Omit<TimerSession, 'id'>)[] = [
    'taskId',
    'mode',
    'durationSeconds',
    'status',
    'remainingSeconds',
  ];
  for (const col of fields) {
    if (col in data) {
      sets.push(`${col} = ?`);
      values.push(data[col] ?? null);
    }
  }

  if ('startedAt' in data) {
    sets.push('startedAt = ?');
    values.push(data.startedAt ?? null);
  }
  if ('completedAt' in data) {
    sets.push('completedAt = ?');
    values.push(data.completedAt ?? null);
  }

  if (sets.length === 0) return (await getSession(db, id))!;

  values.push(id);
  await db.runAsync(`UPDATE timer_sessions SET ${sets.join(', ')} WHERE id = ?`, ...values);

  const session = await getSession(db, id);
  if (!session) throw new Error('Session not found after update');
  return session;
}

export async function getSession(
  db: SQLite.SQLiteDatabase,
  id: string,
): Promise<TimerSession | null> {
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM timer_sessions WHERE id = ?',
    id,
  );
  return row ? mapRowToSession(row) : null;
}

export async function getActiveSession(db: SQLite.SQLiteDatabase): Promise<TimerSession | null> {
  const row = await db.getFirstAsync<Record<string, unknown>>(
    "SELECT * FROM timer_sessions WHERE status IN ('running', 'paused') ORDER BY startedAt DESC LIMIT 1",
  );
  return row ? mapRowToSession(row) : null;
}

export async function getSessionCount(db: SQLite.SQLiteDatabase, taskId: string): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM timer_sessions WHERE taskId = ? AND status = 'completed'",
    taskId,
  );
  return row?.count ?? 0;
}
