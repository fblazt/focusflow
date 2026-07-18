import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { FontFamily, Typography } from '@/constants/typography';

const LINE_HEIGHT = 30;

export function NotesTextarea({ style, ...rest }: TextInputProps) {
  const [height, setHeight] = useState(120);
  const lineCount = useMemo(() => Math.ceil(height / LINE_HEIGHT) + 1, [height]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setHeight(h);
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {Array.from({ length: lineCount }).map((_, i) => (
        <View key={i} style={[styles.line, { top: (i + 1) * LINE_HEIGHT - 1 }]} />
      ))}
      <TextInput
        style={[styles.input, { minHeight: LINE_HEIGHT * 4 }, style]}
        placeholderTextColor={Colors.light.inkFaded}
        multiline
        textAlignVertical="top"
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.light.ruledLine,
    opacity: 0.4,
  },
  input: {
    ...Typography.body,
    fontFamily: FontFamily.serif,
    color: Colors.light.ink,
    lineHeight: LINE_HEIGHT,
    paddingTop: 4,
    paddingBottom: 8,
  },
});
