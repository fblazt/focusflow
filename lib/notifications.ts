import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import type { Task } from './types';

export const CHANNEL_TASK_REMINDER = 'focusflow-task-reminders';
export const CHANNEL_TIMER = 'focusflow-timer';

const REMINDER_PREFIX = 'focusflow-reminder-';

function reminderId(taskId: string): string {
  return `${REMINDER_PREFIX}${taskId}`;
}

// Configure how notifications appear when the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_TIMER, {
    name: 'Timer',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync(CHANNEL_TASK_REMINDER, {
    name: 'Task Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const request = await Notifications.requestPermissionsAsync();
  return request.granted;
}

export async function checkNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted;
}

function parseTriggerTime(dueDate: string, dueTime: string): Date {
  const d = new Date(dueDate + 'T' + dueTime + ':00');
  return d;
}

export async function scheduleTaskReminder(task: Task): Promise<void> {
  if (!task.dueDate || !task.dueTime || !task.reminderEnabled) return;

  const triggerDate = parseTriggerTime(task.dueDate, task.dueTime);
  const now = new Date();
  if (triggerDate <= now) return;

  await Notifications.scheduleNotificationAsync({
    identifier: reminderId(task.id),
    content: {
      title: task.name,
      body: formatReminderBody(task.dueTime),
      sound: true,
      data: { taskId: task.id },
    },
    trigger: {
      date: triggerDate,
      channelId: CHANNEL_TASK_REMINDER,
    } as Notifications.DateTriggerInput,
  });
}

export async function cancelTaskReminder(taskId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(reminderId(taskId));
}

export async function rescheduleTaskReminder(task: Task): Promise<void> {
  await cancelTaskReminder(task.id);
  await scheduleTaskReminder(task);
}

function formatReminderBody(time: string): string {
  const [h, m] = time.split(':').map(Number);
  if (h === undefined || m === undefined) return time;
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
