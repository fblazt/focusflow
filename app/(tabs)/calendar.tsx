import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { Typography } from '@/constants/typography';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Calendar view coming soon</Text>
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
  title: {
    ...Typography.heading1,
    color: Colors.light.ink,
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
