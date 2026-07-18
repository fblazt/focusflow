import { Text, type TextProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { FontFamily, Typography, type TypeToken } from '@/constants/typography';

export type ThemedTextProps = TextProps & {
  type?: TypeToken | 'defaultSemiBold' | 'link';
};

export function ThemedText({ style, type = 'body', ...rest }: ThemedTextProps) {
  const typeStyle = (() => {
    if (type === 'defaultSemiBold')
      return { ...Typography.body, fontFamily: FontFamily.serifBold, fontWeight: '600' as const };
    if (type === 'link')
      return {
        ...Typography.body,
        color: Colors.light.accent,
        textDecorationLine: 'underline' as const,
      };
    return Typography[type as TypeToken] ?? Typography.body;
  })();

  return <Text style={[{ color: Colors.light.ink }, typeStyle, style]} {...rest} />;
}
