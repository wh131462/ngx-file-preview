import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PreviewFile } from '../../types/preview.types';
import { PreviewIconComponent } from '../preview-icon/preview-icon.component';

@Component({
  selector: 'fp-unknown-preview',
  standalone: true,
  imports: [CommonModule, PdfViewerModule, PreviewIconComponent],
  template: `
    <div class="unknown-preview">
      <div class="unknown-message">
        <preview-icon [size]="72" svg="unknown"></preview-icon>
        <p>{{ file.name }}</p>
        <p>暂不支持该文件类型的预览</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
    }

    .unknown-preview {
      color: white;
      text-align: center;
      padding: 24px;

      .unknown-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
    }

  `],
})
export class UnknownPreviewComponent {
  @Input() file!: PreviewFile;
}
