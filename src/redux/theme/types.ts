export const TOGGLE_THEME = 'TOGGLE_THEME';

export interface ThemeState {
  mode: 'light' | 'dark';
}

interface ToggleThemeAction {
  type: typeof TOGGLE_THEME;
}

export type ThemeActionTypes = ToggleThemeAction;
