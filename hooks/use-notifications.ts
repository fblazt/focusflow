import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';

import { checkNotificationPermission, ensureNotificationPermission } from '@/lib/notifications';

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const refreshPermission = useCallback(async () => {
    const granted = await checkNotificationPermission();
    setHasPermission(granted);
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await ensureNotificationPermission();
    setHasPermission(granted);
    return granted;
  }, []);

  useEffect(() => {
    refreshPermission();
  }, [refreshPermission]);

  // Listen for settings changes while the hook is active.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      refreshPermission();
    });
    return () => sub.remove();
  }, [refreshPermission]);

  return {
    hasPermission,
    requestPermission,
    refreshPermission,
  };
}
