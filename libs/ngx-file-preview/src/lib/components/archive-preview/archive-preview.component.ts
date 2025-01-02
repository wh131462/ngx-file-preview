import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewFile} from '../../types/preview.types';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';

@Component({
  selector: 'fp-archive-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="archive-container">
      <div class="archive-info">
        <div class="icon">
          <preview-icon [svg]="'zip'" [size]="48"></preview-icon>
        </div>
        <div class="details">
          <h2>{{ file.name }}</h2>
          <div class="meta">
            <span>类型: {{ getArchiveType() }}</span>
            <span>大小: {{ formatFileSize(file.size) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["../../styles/_theme.scss", "archive-preview.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchivePreviewComponent {
  @Input() file!: PreviewFile;

  getArchiveType(): string {
    const extension = this.file.name.split('.').pop()?.toLowerCase();
    const types: { [key: string]: string } = {
      'zip': 'ZIP 压缩文件',
      'rar': 'RAR 压缩文件',
      '7z': '7-Zip 压缩文件',
      'tar': 'TAR 归档文件',
      'gz': 'GZip 压缩文件'
    };
    return types[extension || ''] || '压缩文件';
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '未知大小';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  formatDate(date?: string): string {
    if (!date) return '未知时间';

    const formattedDate = new Date(date).toLocaleString();
    return formattedDate;
  }
}
