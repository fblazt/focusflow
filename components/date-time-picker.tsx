import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { Colors } from '@/constants/theme';
import { FontFamily, Typography } from '@/constants/typography';

interface DateTimePickerFieldProps {
  date: string | null;
  time: string | null;
  reminderEnabled: boolean;
  onDateChange: (date: string | null) => void;
  onTimeChange: (time: string | null) => void;
  onReminderChange: (enabled: boolean) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  if (h === undefined || m === undefined) return timeStr;
  const d = new Date();
  d.setHours(h, m);
  return d
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(' ', '');
}

export function DateTimePickerField({
  date,
  time,
  reminderEnabled,
  onDateChange,
  onTimeChange,
  onReminderChange,
}: DateTimePickerFieldProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      onDateChange(selectedDate.toISOString().split('T')[0] ?? null);
    }
  };

  const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedDate) {
      const h = selectedDate.getHours().toString().padStart(2, '0');
      const m = selectedDate.getMinutes().toString().padStart(2, '0');
      onTimeChange(`${h}:${m}`);
    }
  };

  const pickerDate = date ? new Date(date + 'T00:00:00') : new Date();
  const pickerTime = (() => {
    if (!time) return new Date();
    const [h, m] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h ?? 0, m ?? 0, 0, 0);
    return d;
  })();

  return (
    <View>
      <View style={styles.row}>
        <Pressable style={styles.field} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.icon}>▦</Text>
          <Text style={[styles.value, !date && styles.placeholder]}>
            {date ? formatDate(date) : 'Date'}
          </Text>
        </Pressable>
        {date && (
          <Pressable style={styles.clearBtn} onPress={() => onDateChange(null)}>
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        )}

        <View style={styles.divider} />

        <Pressable style={styles.field} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.icon}>◷</Text>
          <Text style={[styles.value, !time && styles.placeholder]}>
            {time ? formatTime(time) : 'Time'}
          </Text>
        </Pressable>
        {time && (
          <Pressable style={styles.clearBtn} onPress={() => onTimeChange(null)}>
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        )}
      </View>

      {time && (
        <Pressable style={styles.reminder} onPress={() => onReminderChange(!reminderEnabled)}>
          <View style={[styles.reminderBox, reminderEnabled && styles.reminderBoxActive]}>
            {reminderEnabled && <Text style={styles.reminderCheck}>✓</Text>}
          </View>
          <Text style={styles.reminderLabel}>Remind me</Text>
        </Pressable>
      )}

      {showDatePicker && (
        <DateTimePicker value={pickerDate} mode="date" onChange={handleDateChange} />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={pickerTime}
          mode="time"
          is24Hour={false}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.light.border,
    marginHorizontal: 12,
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignSelf: 'center',
  },
  clearText: {
    ...Typography.metadata,
    color: Colors.light.inkMuted,
    fontSize: 18,
  },
  icon: {
    fontSize: 15,
    color: Colors.light.inkMuted,
    marginRight: 8,
  },
  value: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.mono,
    color: Colors.light.ink,
  },
  placeholder: {
    color: Colors.light.inkFaded,
    fontStyle: 'italic',
    fontFamily: FontFamily.serif,
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 4,
  },
  reminderBox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBoxActive: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.accent,
  },
  reminderCheck: {
    color: Colors.light.background,
    fontSize: 11,
  },
  reminderLabel: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.serif,
    color: Colors.light.inkMuted,
    fontStyle: 'italic',
  },
});
