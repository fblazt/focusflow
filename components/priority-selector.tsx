import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { FontFamily, Typography } from '@/constants/typography';
import type { Priority } from '@/lib/types';

const OPTIONS: { key: Priority; label: string }[] = [
  { key: 'none', label: 'NONE' },
  { key: 'medium', label: 'MED' },
  { key: 'high', label: 'HIGH' },
];

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            style={[styles.stamp, active && styles.stampActive]}
            onPress={() => onChange(opt.key)}
          >
            <Text style={[styles.stampText, active && styles.stampTextActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  stamp: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  stampActive: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.accent,
  },
  stampText: {
    ...Typography.metadata,
    fontFamily: FontFamily.mono,
    color: Colors.light.inkMuted,
    letterSpacing: 1,
  },
  stampTextActive: {
    color: Colors.light.background,
  },
});
