import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewFile } from '../../types/preview.types';
import { PreviewIconComponent } from '../preview-icon/preview-icon.component';

interface ArchiveInfo {
  size: string;
  type: string;
  lastModified?: string;
}

@Component({
  selector: 'core-archive-preview',
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
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .archive-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #1a1a1a;
    }

    .archive-info {
      display: flex;
      align-items: center;
      gap: 20px;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;

      .icon {
        font-size: 48px;
        color: #666;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        border-radius: 8px;
      }

      .details {
        flex: 1;

        h2 {
          margin: 0 0 10px 0;
          font-size: 20px;
          color: #333;
          word-break: break-all;
        }

        .meta {
          display: flex;
          flex-direction: column;
          gap: 5px;
          color: #666;
          font-size: 14px;
        }
      }
    }
  `],
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
}
