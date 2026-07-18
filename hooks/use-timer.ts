import { useCallback, useEffect, useRef, useState } from 'react';

import { useDb, getActiveSession, createSession, updateSession, getTask } from '@/lib/db';
import { type Task, type TimerMode } from '@/lib/types';
import {
  type TimerRuntime,
  cancelCompletionNotification,
  computeRemaining,
  initialRuntime,
  isComplete,
  pause as enginePause,
  play as enginePlay,
  reset as engineReset,
  runtimeFromSession,
  scheduleCompletionNotification,
  setMode as engineSetMode,
  setTask as engineSetTask,
  skip as engineSkip,
} from '@/lib/timer-engine';

export function useTimer() {
  const db = useDb();
  const [runtime, setRuntime] = useState<TimerRuntime>(() => initialRuntime('work'));
  const [linkedTask, setLinkedTask] = useState<Task | null>(null);
  const [tick, setTick] = useState(0);
  const runtimeRef = useRef(runtime);
  runtimeRef.current = runtime;

  const persist = useCallback(
    async (rt: TimerRuntime): Promise<string> => {
      if (rt.status === 'idle') return '';
      const status = rt.status === 'running' ? 'running' : 'paused';
      if (!rt.sessionId) {
        const session = await createSession(db, {
          taskId: rt.taskId,
          mode: rt.mode,
          durationSeconds: rt.durationSeconds,
          status,
          remainingSeconds: rt.remainingSeconds,
          startedAt:
            rt.status === 'running'
              ? new Date(rt.endTime! - rt.remainingSeconds * 1000).toISOString()
              : new Date().toISOString(),
        });
        return session.id;
      }
      const existing = await getActiveSession(db);
      const id = rt.sessionId;
      const startedAt =
        rt.status === 'running'
          ? new Date(rt.endTime! - rt.remainingSeconds * 1000).toISOString()
          : (existing?.startedAt ?? new Date().toISOString());
      await updateSession(db, id, {
        taskId: rt.taskId,
        mode: rt.mode,
        durationSeconds: rt.durationSeconds,
        status,
        remainingSeconds: rt.remainingSeconds,
        startedAt,
      });
      return id;
    },
    [db],
  );

  const refreshLinkedTask = useCallback(
    async (taskId: string | null) => {
      if (!taskId) {
        setLinkedTask(null);
        return;
      }
      const task = await getTask(db, taskId);
      setLinkedTask(task);
    },
    [db],
  );

  // Reconcile from DB on focus (handles backgrounding / cold start).
  const reconcile = useCallback(async () => {
    const session = await getActiveSession(db);
    if (session) {
      const rt = runtimeFromSession(session);
      setRuntime(rt);
      await refreshLinkedTask(rt.taskId);
    }
  }, [db, refreshLinkedTask]);

  // One-time restore on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      const session = await getActiveSession(db);
      if (!session || !active) return;
      const rt = runtimeFromSession(session);
      setRuntime(rt);
      await refreshLinkedTask(rt.taskId);
    })();
    return () => {
      active = false;
    };
  }, [db, refreshLinkedTask]);

  // 1s tick for smooth display + completion detection.
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const rt = runtimeRef.current;
    if (!isComplete(rt)) return;
    // Fire completion: persist finished session + increment task count + notify.
    let cancelled = false;
    (async () => {
      const sessionId = rt.sessionId ?? (await persist(rt));
      if (cancelled) return;
      await updateSession(db, sessionId, {
        status: 'completed',
        remainingSeconds: 0,
        completedAt: new Date().toISOString(),
      });
      if (rt.taskId) {
        const task = await getTask(db, rt.taskId);
        if (task) await incrementSessionCount(db, rt.taskId, task.sessionCount);
        await refreshLinkedTask(rt.taskId);
      }
      await cancelCompletionNotification(sessionId);
      setRuntime((prev) => ({
        ...prev,
        status: 'idle',
        remainingSeconds: prev.durationSeconds,
        endTime: null,
      }));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const handlePlay = useCallback(async () => {
    const now = Date.now();
    const next = enginePlay(runtimeRef.current, now);
    setRuntime(next);
    const sessionId = await persist(next);
    const finalRt: TimerRuntime = { ...next, sessionId: sessionId || null };
    setRuntime(finalRt);
    if (next.status === 'running' && next.endTime) {
      await scheduleCompletionNotification(
        sessionId,
        next.mode,
        next.endTime,
        linkedTask?.name ?? null,
      );
    }
  }, [db, linkedTask, persist]);

  const handlePause = useCallback(async () => {
    const next = enginePause(runtimeRef.current);
    setRuntime(next);
    const sessionId = await persist(next);
    if (sessionId) await cancelCompletionNotification(sessionId);
  }, [db, persist]);

  const handleReset = useCallback(async () => {
    const next = engineReset(runtimeRef.current);
    const sessionId = runtimeRef.current.sessionId;
    setRuntime(next);
    if (sessionId) {
      await cancelCompletionNotification(sessionId);
      // Clear the persisted session so Today strip hides.
      await updateSession(db, sessionId, { status: 'completed', remainingSeconds: 0 });
    }
  }, [db, persist]);

  const handleSkip = useCallback(async () => {
    const rt = runtimeRef.current;
    if (rt.status !== 'running' && rt.status !== 'paused') {
      // Nothing to skip.
      return;
    }
    const now = Date.now();
    const next = engineSkip(rt);
    setRuntime(next);
    const sessionId = rt.sessionId ?? (await persist(next));
    await updateSession(db, sessionId, {
      status: 'completed',
      remainingSeconds: 0,
      completedAt: new Date().toISOString(),
    });
    if (rt.taskId) {
      const task = await getTask(db, rt.taskId);
      if (task) await incrementSessionCount(db, rt.taskId, task.sessionCount);
      await refreshLinkedTask(rt.taskId);
    }
    await cancelCompletionNotification(sessionId);
    setRuntime((prev) => ({
      ...prev,
      status: 'idle',
      remainingSeconds: prev.durationSeconds,
      endTime: null,
    }));
  }, [db, persist]);

  const handleSetMode = useCallback(
    async (mode: TimerMode) => {
      const sessionId = runtimeRef.current.sessionId;
      const next = engineSetMode(runtimeRef.current, mode);
      setRuntime(next);
      if (sessionId) {
        await cancelCompletionNotification(sessionId);
        await updateSession(db, sessionId, { status: 'completed', remainingSeconds: 0 });
      }
    },
    [db, persist],
  );

  const handleLinkTask = useCallback(
    async (task: Task | null) => {
      const next = engineSetTask(runtimeRef.current, task?.id ?? null);
      setRuntime(next);
      await refreshLinkedTask(task?.id ?? null);
      // Only persist the link if a session already exists (i.e. timer has been
      // started at least once). Linking alone does not create an active session.
      const sessionId = runtimeRef.current.sessionId;
      if (sessionId) {
        await updateSession(db, sessionId, { taskId: task?.id ?? null });
      }
    },
    [db, refreshLinkedTask],
  );

  const remaining = computeRemaining(runtimeRef.current);

  // Re-sync linked task name if it changed underneath us.
  useEffect(() => {
    if (runtime.taskId && !linkedTask) refreshLinkedTask(runtime.taskId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime.taskId]);

  return {
    runtime,
    remaining,
    linkedTask,
    play: handlePlay,
    pause: handlePause,
    reset: handleReset,
    skip: handleSkip,
    setMode: handleSetMode,
    linkTask: handleLinkTask,
    reconcile,
  };
}

async function incrementSessionCount(
  db: import('expo-sqlite').SQLiteDatabase,
  taskId: string,
  current: number,
): Promise<void> {
  const { updateTask } = await import('@/lib/db');
  await updateTask(db, taskId, { sessionCount: current + 1 });
}
