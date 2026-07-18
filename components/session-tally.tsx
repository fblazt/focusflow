import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { FontFamily, Typography } from '@/constants/typography';

interface SessionTallyProps {
  count: number; // completed sessions on the linked task
}

// Renders tally marks grouped in fives: | | | | /  then repeat.
export function SessionTally({ count }: SessionTallyProps) {
  const groups = Math.ceil(count / 5);
  const cells = count === 0 ? 0 : Math.max(groups, 1);

  return (
    <View style={styles.container}>
      <View style={styles.marksRow}>
        {Array.from({ length: cells }).map((_, groupIndex) => (
          <TallyGroup
            key={groupIndex}
            // how many marks to draw in this group (5 except possibly the last)
            marks={Math.min(5, count - groupIndex * 5)}
          />
        ))}
      </View>
      <Text style={styles.label}>
        {count} SESSION{count === 1 ? '' : 'S'}
      </Text>
    </View>
  );
}

function TallyGroup({ marks }: { marks: number }) {
  // 5th mark is a diagonal slash across the previous four.
  const slash = marks >= 5;
  const verticals = slash ? 4 : marks;
  const stroke = Colors.light.accent;

  return (
    <Svg width={34} height={28} style={styles.group}>
      {Array.from({ length: verticals }).map((_, i) => (
        <Line
          key={i}
          x1={4 + i * 7}
          y1={2}
          x2={4 + i * 7}
          y2={26}
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
      {slash && (
        <Line x1={2} y1={26} x2={30} y2={2} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  marksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  group: {
    marginHorizontal: 2,
  },
  label: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    letterSpacing: 2,
    marginTop: 6,
    fontFamily: FontFamily.mono,
  },
});
