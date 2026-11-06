export type ThemeMode = 'dark' | 'light';

export interface ThemePalette {
  mode: ThemeMode;
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfacePressed: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  statusOkBg: string;
  statusOkText: string;
  statusErrorBg: string;
  statusErrorText: string;
  focusRing: string;
}

export const PALETTES: Record<ThemeMode, ThemePalette> = {
  dark: {
    mode: 'dark',
    background: '#0D1117',
    surface: '#161B22',
    surfaceSecondary: '#21262D',
    surfacePressed: '#30363D',
    border: '#7D8590',
    borderStrong: '#F0F6FC',
    textPrimary: '#F0F6FC',
    textSecondary: '#B1BAC4',
    accent: '#FF6B35',
    accentText: '#0D1117',
    statusOkBg: '#122D1F',
    statusOkText: '#7EE787',
    statusErrorBg: '#3D1418',
    statusErrorText: '#FFA198',
    focusRing: '#FF6B35',
  },
  light: {
    mode: 'light',
    background: '#F6F8FA',
    surface: '#FFFFFF',
    surfaceSecondary: '#EAECEF',
    surfacePressed: '#D0D7DE',
    border: '#57606A',
    borderStrong: '#0D1117',
    textPrimary: '#0D1117',
    textSecondary: '#3D444D',
    accent: '#C23B00',
    accentText: '#FFFFFF',
    statusOkBg: '#DAFBE1',
    statusOkText: '#116329',
    statusErrorBg: '#FFEBE9',
    statusErrorText: '#A40E26',
    focusRing: '#C23B00',
  },
};

