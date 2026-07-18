import { Platform } from 'react-native';

const serif = Platform.select({ ios: 'Lora', android: 'Lora', default: 'serif' });
const serifBold = Platform.select({
  ios: 'Lora-SemiBold',
  android: 'Lora-SemiBold',
  default: 'serif',
});
const mono = Platform.select({
  ios: 'IBM Plex Mono',
  android: 'IBM Plex Mono',
  default: 'monospace',
});

export const FontFamily = {
  serif,
  serifBold,
  mono,
} as const;

export type FontRole = keyof typeof FontFamily;

export const Typography = {
  hero: {
    fontSize: 52,
    lineHeight: 60,
    fontFamily: FontFamily.serifBold,
    fontWeight: '600' as const,
  },
  heading1: {
    fontSize: 34,
    lineHeight: 44,
    fontFamily: FontFamily.serifBold,
    fontWeight: '600' as const,
  },
  heading2: {
    fontSize: 26,
    lineHeight: 34,
    fontFamily: FontFamily.serifBold,
    fontWeight: '600' as const,
  },
  body: { fontSize: 17, lineHeight: 30, fontFamily: FontFamily.serif, fontWeight: '400' as const },
  bodySmall: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: FontFamily.serif,
    fontWeight: '400' as const,
  },
  metadata: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FontFamily.mono,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: FontFamily.mono,
    fontWeight: '400' as const,
  },
} as const;

export type TypeToken = keyof typeof Typography;
