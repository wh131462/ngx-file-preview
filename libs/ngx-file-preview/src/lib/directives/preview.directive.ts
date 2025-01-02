import { Directive, Input, HostListener } from '@angular/core';
import { PreviewService } from '../services/preview.service';
import { PreviewFile, PreviewType } from '../types/preview.types';
import { PreviewUtils } from '../utils/preview.utils';
import { ThemeService } from '../services/theme.service';
import { ThemeMode, AutoThemeConfig } from '../types/theme.types';

@Directive({
  selector: '[ngxFilePreview]',
  standalone: true,
})
export class PreviewDirective {
  @Input('ngxFilePreview') fileInput: string | File | PreviewFile | (string | File | PreviewFile)[] | undefined;
  @Input() previewIndex = 0;
  @Input() themeMode: ThemeMode = 'auto';
  @Input() autoConfig?: AutoThemeConfig;

  constructor(private previewService: PreviewService) {}

  @HostListener('click')
  onClick() {
    if (!this.fileInput) return;
    console.log("file", this.themeMode)
    const files = this.normalizeFiles(this.fileInput);
    if (files.length > 0) {
      this.previewService.open({
        files,
        index: this.previewIndex,
        themeMode: this.themeMode,
        autoThemeConfig: this.autoConfig
      });
    }
  }

  private normalizeFiles(input: string | File | PreviewFile | (string | File | PreviewFile)[]): PreviewFile[] {
    // 转换为数组
    const inputArray = Array.isArray(input) ? input : [input];

    return inputArray.map(item => this.normalizeFile(item));
  }

  private normalizeFile(input: string | File | PreviewFile): PreviewFile {
    // 如果已经是 PreviewFile 类型，直接返回
    if (this.isPreviewFile(input)) {
      return input;
    }

    // 如果是 File 对象
    if (input instanceof File) {
      return {
        url: URL.createObjectURL(input),
        name: input.name,
        type: PreviewUtils.getFileType(input),
        size: input.size,
        lastModified: input.lastModified
      };
    }

    // 如果是字符串 URL
    if (typeof input === 'string') {
      return {
        url: input,
        name: this.getFileNameFromUrl(input),
        type: PreviewUtils.getFileTypeFromUrl(input)
      };
    }

    throw new Error('Invalid file input');
  }

  private isPreviewFile(input: any): input is PreviewFile {
    return typeof input === 'object' &&
           'url' in input &&
           'name' in input &&
           'type' in input;
  }

  private getFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop();
      return fileName || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  ngOnDestroy() {
    // 清理由 createObjectURL 创建的 URL
    if (this.fileInput instanceof File) {
      URL.revokeObjectURL(this.normalizeFile(this.fileInput).url);
    } else if (Array.isArray(this.fileInput)) {
      this.fileInput.forEach(item => {
        if (item instanceof File) {
          URL.revokeObjectURL(this.normalizeFile(item).url);
        }
      });
    }
  }
}
