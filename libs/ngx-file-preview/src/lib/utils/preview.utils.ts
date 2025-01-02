import { PreviewFile, PreviewType } from '../types/preview.types';

export class PreviewUtils {
  private static readonly VIDEO_EXTENSIONS = [
    'mp4', 'webm', 'ogg', 'mov', 'm3u8', 'm3u', 'ts',
    'avi', 'wmv', 'flv', 'mkv', '3gp'
  ];

  static getFileName(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const segments = pathname.split('/');
      return segments[segments.length - 1] || '未知文件';
    } catch {
      const segments = url.split('/');
      return segments[segments.length - 1] || '未知文件';
    }
  }

  static detectFileType(url: string): PreviewType {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    return this.getTypeByExtension(extension);
  }

  static getTypeByExtension(extension: string): PreviewType {
    const typeMap: Record<string, PreviewType> = {
      // 图片格式
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image',
      bmp: 'image', webp: 'image', svg: 'image',

      // 音频格式
      mp3: 'audio', wav: 'audio', ogg: 'audio', aac: 'audio', m4a: 'audio',

      // 视频格式
      mp4: 'video', webm: 'video', mov: 'video', avi: 'video',

      // PDF格式
      pdf: 'pdf',

      // Word文档
      doc: 'word', docx: 'word', rtf: 'word',

      // Excel文档
      xls: 'excel', xlsx: 'excel', csv: 'excel',

      // PPT文档
      ppt: 'ppt', pptx: 'ppt',

      // 文本文件
      txt: 'txt', json: 'txt', xml: 'txt', md: 'txt',
      js: 'txt', ts: 'txt', html: 'txt', css: 'txt',
      java: 'txt', py: 'txt', php: 'txt', c: 'txt',
      cpp: 'txt', h: 'txt', hpp: 'txt', sql: 'txt',
      sh: 'txt', yaml: 'txt', yml: 'txt',

      // 压缩包格式
      zip: 'zip', rar: 'zip', '7z': 'zip',
      tar: 'zip', gz: 'zip', bz2: 'zip'
    };

    return typeMap[extension] || 'unknown';
  }

  static normalizeFiles(input: string | PreviewFile | (string | PreviewFile)[]): PreviewFile[] {
    if (Array.isArray(input)) {
      return input.map(item => this.normalizeFile(item));
    }
    return [this.normalizeFile(input)];
  }

  static formatFileSize(bytes?: number): string {
    if (bytes === undefined || bytes === null) return '未知大小';
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
  }

  static normalizeFile(input: string | PreviewFile): PreviewFile {
    if (typeof input !== 'string') {
      return input;
    }

    const url = input;
    const name = this.getFileName(url);
    const type = this.detectFileType(url);

    return { url, name, type };
  }

  static getPreviewType(filename: string): PreviewType {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    if (this.VIDEO_EXTENSIONS.includes(ext) || filename.includes('video/') || 
        filename.includes('application/x-mpegURL') || filename.includes('application/vnd.apple.mpegurl')) {
      return 'video';
    }

    return this.getTypeByExtension(ext);
  }

  static getFileType(file: File): PreviewType {
    // 首先检查 MIME 类型
    const mimeType = file.type.toLowerCase();
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    
    // 检查文件扩展名
    const extension = file.name.split('.').pop()?.toLowerCase();
    return this.getFileTypeFromExtension(extension);
  }

  static getFileTypeFromUrl(url: string): PreviewType {
    try {
      const extension = url.split('.').pop()?.toLowerCase();
      return this.getFileTypeFromExtension(extension);
    } catch {
      return 'unknown';
    }
  }

  private static getFileTypeFromExtension(extension?: string): PreviewType {
    if (!extension) return 'unknown';

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return 'image';
      case 'mp4':
      case 'webm':
      case 'ogg':
        return 'video';
      case 'mp3':
      case 'wav':
        return 'audio';
      case 'pdf':
        return 'pdf';
      case 'ppt':
      case 'pptx':
        return 'ppt';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'txt':
      case 'md':
        return 'txt';
      case 'zip':
      case 'rar':
      case '7z':
        return 'zip';
      default:
        return 'unknown';
    }
  }
}
