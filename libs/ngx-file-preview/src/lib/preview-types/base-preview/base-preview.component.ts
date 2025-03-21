import {ChangeDetectorRef, Directive, inject, Input} from '@angular/core';
import {AutoThemeConfig, PreviewFile, ThemeMode} from '../../types';
import {FileReaderService} from "../../services";
import {firstValueFrom} from "rxjs";
import {FileReaderResponse} from "../../workers";

@Directive({
  standalone: true,
})
export abstract class BasePreviewComponent {
  @Input() file!: PreviewFile;
  @Input({transform: (value: ThemeMode | null): ThemeMode => value!}) themeMode!: ThemeMode;
  @Input() autoThemeConfig?: AutoThemeConfig;

  protected isLoading = false;
  protected fileReader = inject(FileReaderService);
  protected cdr = inject(ChangeDetectorRef);

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
    this.isLoading = true;
    this.cdr.markForCheck();
  }

  protected stopLoading() {
    this.isLoading = false;
    this.cdr.markForCheck();
  }
}
