import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { FontFamily, Typography } from '@/constants/typography';
import { TimerRing } from '@/components/timer-ring';
import { TimerControls } from '@/components/timer-controls';
import { SessionTally } from '@/components/session-tally';
import { TaskPickerSheet } from '@/components/task-picker-sheet';
import { useTimer } from '@/hooks/use-timer';
import { ensureNotificationPermission } from '@/lib/notifications';
import { DURATIONS } from '@/lib/timer-engine';
import { type TimerMode } from '@/lib/types';

function formatMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const MODES: { key: TimerMode; label: string; duration: number }[] = [
  { key: 'work', label: 'WORK', duration: DURATIONS.work },
  { key: 'break', label: 'BREAK', duration: DURATIONS.break },
];

export default function TimerScreen() {
  const { runtime, remaining, linkedTask, play, pause, reset, skip, setMode, linkTask } =
    useTimer();
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleToggle = useCallback(async () => {
    if (runtime.status === 'running') {
      await pause();
    } else {
      const granted = await ensureNotificationPermission();
      if (granted) await play();
      else await play(); // still run the timer even if notifications denied
    }
  }, [runtime.status, play, pause]);

  const progress = runtime.durationSeconds > 0 ? 1 - remaining / runtime.durationSeconds : 0;

  return (
    <View style={styles.container}>
      <View style={styles.modeToggle}>
        {MODES.map((mode, i) => {
          const active = runtime.mode === mode.key;
          return (
            <View key={mode.key} style={styles.modeWrapper}>
              <Pressable onPress={() => setMode(mode.key)}>
                <Text style={[styles.modeLabel, active ? styles.modeActive : styles.modeInactive]}>
                  {mode.label} · {formatMMSS(mode.duration)}
                </Text>
                {active && <View style={styles.modeUnderline} />}
              </Pressable>
              {i === 0 && <View style={styles.modeDivider} />}
            </View>
          );
        })}
      </View>

      <TimerRing progress={progress} timeLabel={formatMMSS(remaining)} size={264} />

      <View style={styles.linkedTask}>
        <Text style={styles.workingOn}>working on</Text>
        <Pressable onPress={() => setPickerVisible(true)}>
          {linkedTask ? (
            <View>
              <Text style={styles.taskName}>{linkedTask.name}</Text>
              <View style={styles.taskUnderline} />
            </View>
          ) : (
            <View>
              <Text style={styles.placeholder}>— tap to link a task —</Text>
              <View style={styles.taskUnderline} />
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.controls}>
        <TimerControls
          status={runtime.status}
          onReset={reset}
          onToggle={handleToggle}
          onSkip={skip}
        />
      </View>

      <View style={styles.tally}>
        <SessionTally count={linkedTask?.sessionCount ?? 0} />
      </View>

      <TaskPickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(task) => {
          linkTask(task);
          setPickerVisible(false);
        }}
        selectedId={linkedTask?.id ?? null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 40,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  modeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeLabel: {
    ...Typography.metadata,
    letterSpacing: 1,
    fontFamily: FontFamily.mono,
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  modeActive: {
    color: Colors.light.accent,
    fontWeight: '600',
  },
  modeInactive: {
    color: Colors.light.inkMuted,
  },
  modeUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: Colors.light.accent,
  },
  modeDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.light.border,
    marginHorizontal: 4,
  },
  linkedTask: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 8,
  },
  workingOn: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: FontFamily.mono,
  },
  taskName: {
    ...Typography.heading2,
    color: Colors.light.ink,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  placeholder: {
    ...Typography.body,
    color: Colors.light.inkFaded,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  taskUnderline: {
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  controls: {
    marginTop: 36,
  },
  tally: {
    marginTop: 44,
  },
});
