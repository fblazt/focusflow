import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Colors, Spacing } from '@/constants/theme';
import { Typography } from '@/constants/typography';

interface TaskSectionProps {
  label: string;
  variant?: 'default' | 'overdue';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  children: React.ReactNode;
}

export function TaskSection({
  label,
  variant = 'default',
  collapsed,
  onToggleCollapse,
  children,
}: TaskSectionProps) {
  const isOverdue = variant === 'overdue';

  return (
    <View style={styles.section}>
      <Pressable style={styles.header} onPress={onToggleCollapse} disabled={!onToggleCollapse}>
        <Text
          style={[
            Typography.metadata,
            styles.label,
            isOverdue ? styles.overdueLabel : styles.defaultLabel,
          ]}
        >
          {label}
        </Text>
        {onToggleCollapse && (
          <Feather
            name={collapsed ? 'chevron-down' : 'chevron-up'}
            size={16}
            color={isOverdue ? Colors.light.danger : Colors.light.inkMuted}
          />
        )}
      </Pressable>
      <View style={isOverdue ? styles.overdueRule : styles.rule} />
      {!collapsed && children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.sectionGap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: 8,
  },
  label: {
    letterSpacing: 1,
  },
  defaultLabel: {
    color: Colors.light.inkMuted,
  },
  overdueLabel: {
    color: Colors.light.danger,
  },
  rule: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  overdueRule: {
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.danger,
    borderStyle: 'dashed',
  },
});
