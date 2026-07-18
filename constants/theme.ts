export const Colors = {
  light: {
    background: '#F5F0E8',
    backgroundAlt: '#EDE8DC',
    surface: '#F0EAD8',
    surfacePressed: '#E8E0CC',
    ink: '#1C1917',
    inkAlt: '#2C2420',
    inkMuted: '#7A6F65',
    inkFaded: '#8C8074',
    inkDisabled: '#A89F94',
    accent: '#2B4A6F',
    danger: '#B04030',
    border: '#C8BFB0',
    borderDark: '#1C1917',
    ruledLine: '#D8D0C0',
  },
  dark: {
    background: '#F5F0E8',
    backgroundAlt: '#EDE8DC',
    surface: '#F0EAD8',
    surfacePressed: '#E8E0CC',
    ink: '#1C1917',
    inkAlt: '#2C2420',
    inkMuted: '#7A6F65',
    inkFaded: '#8C8074',
    inkDisabled: '#A89F94',
    accent: '#2B4A6F',
    danger: '#B04030',
    border: '#C8BFB0',
    borderDark: '#1C1917',
    ruledLine: '#D8D0C0',
  },
} as const;

export type ColorToken = keyof typeof Colors.light;

export const Spacing = {
  screenHorizontal: 22,
  sectionGap: 16,
  rowMinHeight: 50,
  cardPadding: 16,
} as const;

export type SpacingToken = keyof typeof Spacing;

export const Border = {
  default: { width: 1.5, color: Colors.light.border },
  emphasis: { width: 2, color: Colors.light.borderDark },
  dashed: { width: 2, color: Colors.light.border, dashed: true },
  divider: { width: 1, color: Colors.light.ruledLine },
} as const;

export type BorderToken = keyof typeof Border;
