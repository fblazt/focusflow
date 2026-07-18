import { View, type ViewProps } from 'react-native';

import { Colors, type ColorToken } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  bg?: ColorToken;
};

export function ThemedView({ style, bg = 'background', ...otherProps }: ThemedViewProps) {
  return <View style={[{ backgroundColor: Colors.light[bg] }, style]} {...otherProps} />;
}
