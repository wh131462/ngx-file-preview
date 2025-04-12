import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import { PreviewIconComponent} from '../../components';
import {FileReaderResponse} from "../../services";
import {BasePreviewComponent} from "../base-preview/base-preview.component";
import {I18nPipe} from "../../i18n/i18n.pipe";

@Component({
  selector: 'ngx-unknown-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent, I18nPipe],
  template: `
    <div class="unknown-preview">
      <div class="unknown-message">
        <preview-icon [themeMode]="themeMode" [size]="72" svg="unknown"></preview-icon>
        <p>{{ file.name }}</p>
        <p>{{'unknownFileTips'|i18n}}</p>
      </div>
    </div>
  `,
  styleUrls: ['../../styles/_theme.scss', 'unknown-preview.component.scss'],
})
export class UnknownPreviewComponent extends BasePreviewComponent {
  protected override async handleFileContent(content: FileReaderResponse) {
  }
}
