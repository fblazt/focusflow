import { useEffect, useMemo, useState } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { FontFamily, Typography } from '@/constants/typography';

interface TimerRingProps {
  progress: number; // 0..1 fraction elapsed (0 = full time, 1 = done)
  timeLabel: string; // e.g. "13:22"
  size?: number;
}

const STROKE_WIDTH = 3;
const PROGRESS_WIDTH = 2.5;
const TICK_MS = 100;

export function TimerRing({ progress, timeLabel, size = 260 }: TimerRingProps) {
  const radius = (size - Math.max(STROKE_WIDTH, PROGRESS_WIDTH)) / 2;
  const circumference = 2 * Math.PI * radius;

  const [displayedProgress, setDisplayedProgress] = useState(progress);

  useEffect(() => {
    const diff = Math.abs(displayedProgress - progress);
    if (diff < 0.001) return;

    const step = (progress - displayedProgress) / 10;
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      if (frame >= 10) {
        setDisplayedProgress(progress);
        clearInterval(interval);
      } else {
        setDisplayedProgress((prev) => prev + step);
      }
    }, TICK_MS / 10);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const arcLength = useMemo(
    () => circumference * displayedProgress,
    [circumference, displayedProgress],
  );

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.light.border}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray="16 14"
          fill="none"
          strokeLinecap="round"
        />
        {displayedProgress > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.light.accent}
            strokeWidth={PROGRESS_WIDTH}
            strokeDasharray={`${arcLength}, ${circumference}`}
            strokeDashoffset={0}
            fill="none"
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      <View style={styles.center}>
        <Text style={styles.time}>{timeLabel}</Text>
        <Text style={styles.remainingLabel}>remaining</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  time: {
    fontSize: 52,
    lineHeight: 60,
    fontFamily: FontFamily.mono,
    color: Colors.light.ink,
    textAlign: 'center',
    minWidth: 130,
    fontVariant: ['tabular-nums'],
  },
  remainingLabel: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    letterSpacing: 2,
    marginTop: 4,
  },
});
