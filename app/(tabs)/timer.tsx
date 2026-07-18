import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { Typography } from '@/constants/typography';

export default function TimerScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Timer coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...Typography.bodySmall,
    color: Colors.light.inkMuted,
  },
});
