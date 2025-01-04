import {AutoThemeConfig, ThemeMode} from "./theme.types";

export type  PreviewFileInput = string | File | PreviewFile | (string | File | PreviewFile)[] | undefined

export interface PreviewFile {
  url: string;
  name: string;
  type: PreviewType;
  size?: number;
  lastModified?: number;
  coverUrl?: string;
}

export type PreviewType = 'image' | 'audio' | 'video' | 'pdf' | 'ppt' | 'word' | 'excel' | 'txt' | 'zip' | 'unknown';

export const PreviewTypeEnum: Record<PreviewType, string> = {
  audio: "音频文件",
  excel: "Excel文档",
  image: "图片文件",
  pdf: "PDF文档",
  ppt: "PPT文档",
  txt: "文本文件",
  unknown: "未知文件",
  video: "视频文件",
  word: "WORD文档",
  zip: "压缩文件"
};

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
