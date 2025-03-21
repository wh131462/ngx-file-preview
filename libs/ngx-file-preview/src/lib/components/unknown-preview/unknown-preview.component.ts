import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {PreviewBaseComponent} from "../base/preview-base.component";
import {FileReaderResponse} from "../../workers/file-reader.worker";

@Component({
  selector: 'fp-unknown-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="unknown-preview">
      <div class="unknown-message">
        <preview-icon [themeMode]="themeMode" [size]="72" svg="unknown"></preview-icon>
        <p>{{ file.name }}</p>
        <p>暂不支持该文件类型的预览</p>
      </div>
    </div>
  `,
  styleUrls: ['../../styles/_theme.scss', 'unknown-preview.component.scss'],
})
export class UnknownPreviewComponent extends PreviewBaseComponent {
  protected override async handleFileContent(content: FileReaderResponse) {
  }
}
