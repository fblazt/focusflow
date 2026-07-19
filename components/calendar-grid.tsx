import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { type DayCell } from '@/hooks/use-calendar';

interface CalendarGridProps {
  year: number;
  monthName: string;
  dayNames: string[];
  rows: DayCell[][];
  selectedDate: string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: string) => void;
}

export function CalendarGrid({
  year,
  monthName,
  dayNames,
  rows,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: CalendarGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} hitSlop={8} style={styles.navButton}>
          <Text style={styles.navArrow}>{'<'}</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.monthName}>{monthName}</Text>
          <Text style={styles.year}>{year}</Text>
        </View>
        <Pressable onPress={onNextMonth} hitSlop={8} style={styles.navButton}>
          <Text style={styles.navArrow}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.dayHeaderRow}>
        {dayNames.map((d) => (
          <View key={d} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.gridRow}>
            {row.map((cell, cellIdx) => {
              const isSelected = cell.date === selectedDate;
              const isLast = cellIdx === row.length - 1;
              return (
                <Pressable
                  key={cell.date}
                  style={[styles.cell, isLast && styles.cellLast, cell.isToday && styles.cellToday]}
                  onPress={() => onSelectDate(cell.date)}
                >
                  {isSelected && <View style={styles.selectedOverlay} />}
                  <Text
                    style={[
                      styles.cellText,
                      cell.isToday && styles.cellTextToday,
                      !cell.isCurrentMonth && styles.cellTextMuted,
                      cell.isPast && !cell.isToday && styles.cellTextPast,
                    ]}
                  >
                    {cell.day}
                  </Text>
                  {cell.hasTasks && <View style={[styles.dot, cell.isToday && styles.dotToday]} />}
                </Pressable>
              );
            })}
            <View style={styles.gridRowBorder} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenHorizontal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  monthName: {
    ...Typography.heading1,
    color: Colors.light.ink,
  },
  year: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
  },
  navButton: {
    padding: 4,
  },
  navArrow: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    fontSize: 18,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    ...Typography.caption,
    color: Colors.light.inkMuted,
  },
  grid: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.light.ruledLine,
  },
  gridRow: {
    position: 'relative',
    flexDirection: 'row',
  },
  gridRowBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: Colors.light.ruledLine,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 44,
    borderRightWidth: 0.5,
    borderRightColor: Colors.light.ruledLine,
  },
  cellLast: {
    borderRightWidth: 0,
  },
  cellToday: {
    backgroundColor: Colors.light.accent,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
    borderColor: Colors.light.borderDark,
    pointerEvents: 'none',
  },
  cellText: {
    ...Typography.bodySmall,
    color: Colors.light.ink,
    fontFamily: Typography.metadata.fontFamily,
  },
  cellTextToday: {
    color: '#F5F0E8',
    fontFamily: Typography.metadata.fontFamily,
  },
  cellTextMuted: {
    color: Colors.light.inkDisabled,
  },
  cellTextPast: {
    color: Colors.light.inkDisabled,
  },
  dot: {
    width: 5,
    height: 5,
    backgroundColor: Colors.light.accent,
    marginTop: 3,
  },
  dotToday: {
    backgroundColor: '#F5F0E8',
  },
});
