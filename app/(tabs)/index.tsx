import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { Typography } from '@/constants/typography';

function formatDate(): { dayOfWeek: string; fullDate: string } {
  const now = new Date();
  const dow = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const full = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return { dayOfWeek: dow, fullDate: full };
}

export default function TodayScreen() {
  const { dayOfWeek, fullDate } = formatDate();

  return (
    <View style={styles.container}>
      <Text style={styles.dayOfWeek}>{dayOfWeek}</Text>
      <Text style={styles.date}>{fullDate}</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Today&apos;s tasks will appear here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 22,
    paddingTop: 60,
  },
  dayOfWeek: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  date: {
    ...Typography.heading1,
    color: Colors.light.ink,
    marginTop: 4,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...Typography.bodySmall,
    color: Colors.light.inkMuted,
  },
});
