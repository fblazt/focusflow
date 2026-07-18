import { Colors, type ColorToken } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export function useThemeColor(props: { light?: string; dark?: string }, colorName: ColorToken) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[theme][colorName];
}
