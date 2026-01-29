import { TextStyle } from 'react-native';

// Шрифт Geometria - будет загружен через expo-font
// На первом этапе используем системные шрифты с похожими весами
export const fontFamilies = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;

export const typography = {
  h1: {
    fontFamily: fontFamilies.bold,
    fontSize: 41,
    lineHeight: 49,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  h2: {
    fontFamily: fontFamilies.bold,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  h3: {
    fontFamily: fontFamilies.medium,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  button: {
    fontFamily: fontFamilies.medium,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  buttonSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  caption: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  captionSmall: {
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
} as const;

export type Typography = typeof typography;
