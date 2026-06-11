/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Texto
    textPrimary: '#14142b',
    textSecondary: '#5f5f74',
    // Superfícies
    canvas: '#f7f8fd',
    surface: '#ffffff',
    border: '#e8e8f5',
    // Acento
    accent: '#aa3bff',
    accentDeep: '#4f33c7',
    accentBg: 'rgba(170, 59, 255, 0.10)',
    // Semânticas
    positive: '#0c7c4f',
    negative: '#c81f1f',
    // Tabs e ícones
    tint: '#4f33c7',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#4f33c7',
  },
  dark: {
    textPrimary: '#ECEDEE',
    textSecondary: '#9BA1A6',
    canvas: '#0f0f1a',
    surface: '#1a1a2e',
    border: '#2a2a3e',
    accent: '#aa3bff',
    accentDeep: '#7c5ce8',
    accentBg: 'rgba(170, 59, 255, 0.15)',
    positive: '#2ecc8a',
    negative: '#ff6b6b',
    tint: '#7c5ce8',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#7c5ce8',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
}

export const Layout = {
  screenPadding: 28,
  screenBottomPadding: 112,
  modalPadding: 28,
}

export const Radius = {
  sm: 8, md: 12, lg: 18, xl: 24, full: 999,
}

export const Typography = {
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h1:      { fontSize: 22, fontWeight: '700' as const },
  h2:      { fontSize: 18, fontWeight: '700' as const },
  h3:      { fontSize: 15, fontWeight: '700' as const },
  body:    { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label:   { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.08 },
}
