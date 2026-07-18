import { useEffect, useRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { FontFamily, Typography } from '@/constants/typography';

interface InkInputProps extends TextInputProps {
  autoFocus?: boolean;
}

export function InkInput({ style, autoFocus, ...rest }: InkInputProps) {
  const ref = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      setTimeout(() => ref.current?.focus(), 100);
    }
  }, [autoFocus]);

  return (
    <TextInput
      ref={ref}
      style={[styles.input, style]}
      placeholderTextColor={Colors.light.inkFaded}
      returnKeyType="done"
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...Typography.heading2,
    fontFamily: FontFamily.serif,
    fontWeight: '400',
    color: Colors.light.ink,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.light.borderDark,
    paddingBottom: 8,
  },
});
