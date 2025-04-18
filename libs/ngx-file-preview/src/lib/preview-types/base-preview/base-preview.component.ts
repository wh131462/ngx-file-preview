import {ChangeDetectorRef, Directive, inject, Input} from '@angular/core';
import {AutoThemeConfig, PreviewFile, ThemeMode} from '../../types';
import {FileReaderResponse, FileReaderService, PreviewService} from "../../services";
import {firstValueFrom} from "rxjs";

@Directive({
  standalone: true,
})
export abstract class BasePreviewComponent {
  @Input() file!: PreviewFile;
  @Input({transform: (value: ThemeMode | null): ThemeMode => value!}) themeMode!: ThemeMode;
  @Input() autoThemeConfig?: AutoThemeConfig;

  protected fileReader = inject(FileReaderService);
  protected previewService = inject(PreviewService);
  protected cdr = inject(ChangeDetectorRef);

  get isLoading() {
    return this.previewService.getLoadingObservable();
  }

  t(key: string, ...args: (string | number)[]) {
    return this.previewService?.getLangParser()?.t(key, ...args);
  }

  protected async loadFile(fileType?: 'arraybuffer' | 'text' | 'json'): Promise<void> {
    if (!this.file) return;
    this.startLoading();
    try {
      const content = await firstValueFrom(this.fileReader.readFile(this.file, fileType));
      await this.handleFileContent(content);
    } catch (error) {
      console.error('Failed to read file:', error);
    } finally {
      this.stopLoading();
    }
  }

  protected abstract handleFileContent(content: FileReaderResponse): Promise<any>;

  protected startLoading() {
    this.previewService.setLoading(true)
    this.cdr.markForCheck();
  }

  protected stopLoading() {
    this.previewService.setLoading(false)
    this.cdr.markForCheck();
  }
}
