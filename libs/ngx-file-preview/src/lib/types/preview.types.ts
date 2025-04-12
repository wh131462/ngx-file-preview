import {AutoThemeConfig, ThemeMode} from "./theme.types";

export type  PreviewFileInput = string | File | Partial<PreviewFile> | (string | File | Partial<PreviewFile>)[] | undefined

export interface PreviewFile {
  url: string;
  name: string;
  type: PreviewType;
  size?: number;
  lastModified?: number;
  coverUrl?: string;
}

export type PreviewType = 'image' | 'audio' | 'video' | 'pdf' | 'ppt' | 'word' | 'excel' | 'markdown'| 'txt' | 'zip' | 'unknown';

export interface PreviewOptions {
  files: PreviewFile[];
  index?: number;
  themeMode?: ThemeMode;
  autoThemeConfig?: AutoThemeConfig;
}

// 预览产生的事件
export interface PreviewEvent {
  type: 'error'|'select';
  message?: string; // 如果error有消息
  event?: any;//其他对应的事件返回消息体
}
