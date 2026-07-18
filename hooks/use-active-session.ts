import { useCallback, useEffect, useState } from 'react';

import { getActiveSession, getTask, useDb } from '@/lib/db';
import { type Task, type TimerSession } from '@/lib/types';

interface ActiveSessionState {
  session: TimerSession;
  task: Task | null;
  remainingTime: string;
}

export function useActiveSession(): {
  activeSession: ActiveSessionState | null;
  refresh: () => void;
} {
  const db = useDb();
  const [state, setState] = useState<ActiveSessionState | null>(null);

  const refresh = useCallback(() => {
    getActiveSession(db).then((session) => {
      if (!session) {
        setState(null);
        return;
      }

      const elapsed = session.startedAt
        ? Math.max(0, Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000))
        : 0;
      const remaining = Math.max(0, session.durationSeconds - elapsed);

      if (session.taskId) {
        getTask(db, session.taskId).then((task) => {
          setState({
            session: { ...session, remainingSeconds: remaining },
            task,
            remainingTime: formatTime(remaining),
          });
        });
      } else {
        setState({
          session: { ...session, remainingSeconds: remaining },
          task: null,
          remainingTime: formatTime(remaining),
        });
      }
    });
  }, [db]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { activeSession: state, refresh };
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
