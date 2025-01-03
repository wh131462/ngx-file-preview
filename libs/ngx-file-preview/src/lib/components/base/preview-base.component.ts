import { Directive, Input } from '@angular/core';
import { PreviewFile } from '../../types/preview.types';
import {AutoThemeConfig, ThemeMode} from "../../types/theme.types";

@Directive()
export abstract class PreviewBaseComponent {
  @Input() file!: PreviewFile;
  @Input() themeMode!: ThemeMode;
  @Input() autoThemeConfig?: AutoThemeConfig;

  protected isLoading = true;

  protected handleError(error: any) {
    console.error('Preview error:', error);
    this.isLoading = false;
  }

  protected onLoadComplete() {
    this.isLoading = false;
  }
}
