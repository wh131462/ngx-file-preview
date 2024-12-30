import { Directive, Input, HostListener } from '@angular/core';
import { PreviewService } from '../services/preview.service';
import { PreviewFile, PreviewType } from '../types/preview.types';
import { PreviewUtils } from '../utils/preview.utils';

@Directive({
  selector: '[corePreview]',
  standalone: true
})
export class PreviewDirective {
  @Input('corePreview') file!: string | PreviewFile | (string | PreviewFile)[];
  @Input() previewType?: PreviewType;
  @Input() previewIndex: number = 0;

  constructor(private previewService: PreviewService) {}

  @HostListener('click')
  onClick() {
    const files = PreviewUtils.normalizeFiles(this.file);
    console.log("预览文件", files)
    this.previewService.open({
      files,
      index: this.previewIndex
    });
  }
}
