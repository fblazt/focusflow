import * as Notifications from 'expo-notifications';

import { type TimerMode, type TimerSession } from './types';

export const WORK_DURATION = 25 * 60;
export const BREAK_DURATION = 5 * 60;

export const DURATIONS: Record<TimerMode, number> = {
  work: WORK_DURATION,
  break: BREAK_DURATION,
};

const NOTIFICATION_ID_PREFIX = 'focusflow-timer-';

// A live timer derives its remaining seconds from wall-clock time so it survives
// app backgrounding without drift. We track an absolute endTime (ms epoch).
// While paused, endTime is null and remainingSeconds is frozen.

export interface TimerRuntime {
  mode: TimerMode;
  status: 'idle' | 'running' | 'paused';
  durationSeconds: number;
  remainingSeconds: number;
  endTime: number | null; // ms epoch when running
  startedAt: string | null;
  sessionId: string | null;
  taskId: string | null;
}

export function initialRuntime(mode: TimerMode = 'work'): TimerRuntime {
  const duration = DURATIONS[mode];
  return {
    mode,
    status: 'idle',
    durationSeconds: duration,
    remainingSeconds: duration,
    endTime: null,
    startedAt: null,
    sessionId: null,
    taskId: null,
  };
}

// Recompute remaining from wall clock. Returns clamped remaining seconds.
export function computeRemaining(rt: TimerRuntime, now: number = Date.now()): number {
  if (rt.status === 'running' && rt.endTime !== null) {
    const rem = Math.round((rt.endTime - now) / 1000);
    return Math.max(0, Math.min(rt.durationSeconds, rem));
  }
  return Math.max(0, Math.min(rt.durationSeconds, rt.remainingSeconds));
}

export function isComplete(rt: TimerRuntime, now: number = Date.now()): boolean {
  return rt.status === 'running' && rt.endTime !== null && now >= rt.endTime;
}

export function play(rt: TimerRuntime, now: number = Date.now()): TimerRuntime {
  if (rt.status === 'running') return rt;
  const remaining = computeRemaining(rt, now);
  if (remaining <= 0) return rt;
  return {
    ...rt,
    status: 'running',
    startedAt: rt.startedAt ?? new Date(now).toISOString(),
    endTime: now + remaining * 1000,
    remainingSeconds: remaining,
  };
}

export function pause(rt: TimerRuntime, now: number = Date.now()): TimerRuntime {
  if (rt.status !== 'running') return rt;
  const remaining = computeRemaining(rt, now);
  return {
    ...rt,
    status: 'paused',
    endTime: null,
    remainingSeconds: remaining,
  };
}

export function reset(rt: TimerRuntime): TimerRuntime {
  return {
    ...rt,
    status: 'idle',
    endTime: null,
    remainingSeconds: rt.durationSeconds,
    startedAt: null,
  };
}

// Switch mode: resets the timer to the new mode's full duration.
export function setMode(rt: TimerRuntime, mode: TimerMode): TimerRuntime {
  const duration = DURATIONS[mode];
  return {
    ...rt,
    mode,
    status: 'idle',
    endTime: null,
    durationSeconds: duration,
    remainingSeconds: duration,
    startedAt: null,
  };
}

// Skip to completion: jump remaining to 0 while running.
export function skip(rt: TimerRuntime): TimerRuntime {
  return { ...rt, remainingSeconds: 0, endTime: rt.endTime ? Date.now() : rt.endTime };
}

export function setTask(rt: TimerRuntime, taskId: string | null): TimerRuntime {
  return { ...rt, taskId };
}

// Map a persisted DB session back into runtime state on foreground.
export function runtimeFromSession(session: TimerSession, now: number = Date.now()): TimerRuntime {
  const duration = session.durationSeconds;
  if (session.status === 'running' || session.status === 'paused') {
    const remaining =
      session.status === 'running' && session.startedAt
        ? Math.max(0, duration - Math.floor((now - new Date(session.startedAt).getTime()) / 1000))
        : session.remainingSeconds;
    const running = session.status === 'running' && remaining > 0;
    return {
      mode: session.mode,
      status: running ? 'running' : 'paused',
      durationSeconds: duration,
      remainingSeconds: remaining,
      endTime: running && session.startedAt ? now + remaining * 1000 : null,
      startedAt: session.startedAt,
      sessionId: session.id,
      taskId: session.taskId,
    };
  }
  return initialRuntime(session.mode);
}

function notificationId(sessionId: string): string {
  return `${NOTIFICATION_ID_PREFIX}${sessionId}`;
}

export async function scheduleCompletionNotification(
  sessionId: string,
  mode: TimerMode,
  endMs: number,
  taskName: string | null,
): Promise<void> {
  const title = mode === 'work' ? 'Focus session complete' : 'Break over';
  const body =
    mode === 'work'
      ? taskName
        ? `Nice work on "${taskName}.`
        : 'Nice work. Take a breather.'
      : 'Back to it.';
  await Notifications.scheduleNotificationAsync({
    identifier: notificationId(sessionId),
    content: { title, body, sound: true },
    trigger: { type: 'date', date: new Date(endMs) } as Notifications.DateTriggerInput,
  });
}

export async function cancelCompletionNotification(sessionId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId(sessionId));
}
