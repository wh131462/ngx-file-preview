import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewIconComponent} from '../../components/preview-icon/preview-icon.component';
import {BasePreviewComponent} from "../base-preview/base-preview.component";
import {FileReaderResponse} from "../../services";
import {I18nPipe} from "../../i18n";

@Component({
  selector: 'ngx-archive-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent, I18nPipe],
  template: `
    <div class="archive-container">
      <div class="archive-info">
        <div class="icon">
          <preview-icon [themeMode]="themeMode" [svg]="'zip'" [size]="48"></preview-icon>
        </div>
        <div class="details">
          <h2>{{ file.name }}</h2>
          <div class="meta">
            <span>{{ 'zip.type'|i18n }}: {{ getArchiveType() }}</span>
            <span>{{ 'zip.size'|i18n }}: {{ formatFileSize(file.size) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["../../styles/_theme.scss", "archive-preview.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchivePreviewComponent extends BasePreviewComponent {
  getArchiveType(): string {
    const extension = this.file.name.split('.').pop()?.toLowerCase();
    const that = this;
    const types: { [key: string]: string } = ['zip', 'rar', '7z', 'tar', 'gz'].reduce((ts, key) => Object.assign(ts, {
      [key]: that.t('zip.types.' + key)
    }), {});
    console.log("types", types, this.t("zip.types.zip"))
    return types[extension || ''] || this.t('zip.types.unknown');
  }

  protected override async handleFileContent(content: FileReaderResponse) {
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return this.t('zip.unknownSize');

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

}
