export const colorTokens = {
  primary: '#18052E',
  secondary: '#2D1B45',
  accent: '#E2354D',
  lightGray: '#E5E7EB',
  medGray: '#9CA3AF',
  darkGray: '#374151',
  // These semantic colors are inferred from the swatches in the provided UI kit.
  danger: '#FF1F1F',
  success: '#83A96A',
  warning: '#C59D2D',
  white: '#FFFFFF',
} as const;

export const fontFamilyTokens = {
  montserrat: 'Montserrat_400Regular',
  montserratBold: 'Montserrat_700Bold',
  nunito: 'NunitoSans_400Regular',
  nunitoSemibold: 'NunitoSans_600SemiBold',
  heading: 'Montserrat_700Bold',
  body: 'NunitoSans_400Regular',
  bodySemibold: 'NunitoSans_600SemiBold',
} as const;

export const typographyTokens = {
  display: {
    fontFamily: fontFamilyTokens.heading,
    fontSize: 32,
    lineHeight: 40,
  },
  title: {
    fontFamily: fontFamilyTokens.heading,
    fontSize: 24,
    lineHeight: 32,
  },
  body: {
    fontFamily: fontFamilyTokens.body,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: fontFamilyTokens.body,
    fontSize: 12,
    lineHeight: 16,
  },
} as const;

export const themeTokens = {
  colors: colorTokens,
  fontFamily: fontFamilyTokens,
  typography: typographyTokens,
} as const;

export type ColorToken = keyof typeof colorTokens;
export type FontFamilyToken = keyof typeof fontFamilyTokens;
export type TypographyToken = keyof typeof typographyTokens;
