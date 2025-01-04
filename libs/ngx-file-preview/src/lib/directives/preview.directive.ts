import {Directive, HostListener, Input} from '@angular/core';
import {PreviewService} from '../services/preview.service';
import {PreviewFileInput} from '../types/preview.types';
import {PreviewUtils} from '../utils/preview.utils';
import {AutoThemeConfig, ThemeMode} from '../types/theme.types';

@Directive({
  selector: '[ngxFilePreview]',
  standalone: true,
})
export class PreviewDirective {
  @Input('ngxFilePreview') fileInput: PreviewFileInput;
  @Input() previewIndex = 0;
  @Input() themeMode: ThemeMode = 'auto';
  @Input() autoConfig?: AutoThemeConfig;

  constructor(private previewService: PreviewService) {
  }

  @HostListener('click')
  onClick() {
    if (!this.fileInput) return;
    const files = PreviewUtils.normalizeFiles(this.fileInput);
    if (files.length > 0) {
      this.previewService.open({
        files,
        index: this.previewIndex,
        themeMode: this.themeMode,
        autoThemeConfig: this.autoConfig
      });
    }
  }


  ngOnDestroy() {
    // 清理由 createObjectURL 创建的 URL
    if (this.fileInput instanceof File) {
      URL.revokeObjectURL(PreviewUtils.normalizeFile(this.fileInput).url);
    } else if (Array.isArray(this.fileInput)) {
      this.fileInput.forEach(item => {
        if (item instanceof File) {
          URL.revokeObjectURL(PreviewUtils.normalizeFile(item).url);
        }
      });
    }
  }
}
