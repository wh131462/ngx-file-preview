export type ThemeMode = 'light' | 'dark' | 'auto';

export interface AutoThemeConfig {
  dark: { 
    start: number; // 暗黑模式开始时间（24小时制）
    end: number;   // 暗黑模式结束时间
  };
} 