import {ChangeDetectorRef, Directive, inject, Input} from '@angular/core';
import {PreviewFile} from '../../types/preview.types';
import {AutoThemeConfig, ThemeMode} from "../../types/theme.types";
import {FileReaderService} from "../../services";
import {firstValueFrom} from "rxjs";
import {FileReaderResponse} from "../../workers/file-reader.worker";

@Directive()
export abstract class PreviewBaseComponent {
  @Input() file!: PreviewFile;
  @Input({transform: (value: ThemeMode | null): ThemeMode => value!}) themeMode!: ThemeMode;
  @Input() autoThemeConfig?: AutoThemeConfig;

  protected isLoading = false;
  protected fileReader = inject(FileReaderService);
  protected cdr = inject(ChangeDetectorRef);

  protected async loadFile(fileType?: 'arraybuffer' | 'text' | 'json'): Promise<void> {
    console.log("file", this.file)
    if (!this.file) return;
    this.isLoading = true;
    try {
      const content = await firstValueFrom(this.fileReader.readFile(this.file,fileType));
      this.handleFileContent(content);
    } catch (error) {
      console.error('Failed to read file:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges()
    }
  }

  protected abstract handleFileContent(content: FileReaderResponse): void;
}
