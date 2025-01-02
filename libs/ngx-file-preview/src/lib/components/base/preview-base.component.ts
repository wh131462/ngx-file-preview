import { Directive, Input } from '@angular/core';
import { PreviewFile } from '../../types/preview.types';

@Directive()
export abstract class PreviewBaseComponent {
  @Input() file!: PreviewFile;

  protected isLoading = true;

  protected handleError(error: any) {
    console.error('Preview error:', error);
    this.isLoading = false;
  }

  protected onLoadComplete() {
    this.isLoading = false;
  }
}
