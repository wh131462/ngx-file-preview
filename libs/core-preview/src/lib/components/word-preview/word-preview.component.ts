import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewBaseComponent } from '../base/preview-base.component';
import {PreviewIconComponent} from "../preview-icon/preview-icon.component";

@Component({
  selector: 'core-word-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="preview-container word-preview">
      <iframe
        *ngIf="!isLoading"
        [src]="getPreviewUrl()"
        frameborder="0"
        width="100%"
        height="100%"
        (load)="onLoadComplete()"
        (error)="handleError($event)"
      ></iframe>

      <div class="loading-wrapper" *ngIf="isLoading">
        <span class="loading-icon">⌛</span>
      </div>

      <div class="toolbar">
        <button class="tool-button" (click)="zoomIn()">
          <preview-icon name="zoom-in"></preview-icon>
        </button>
        <button class="tool-button" (click)="zoomOut()">
          <preview-icon name="zoom-out"></preview-icon>
        </button>
        <button class="tool-button" (click)="resetZoom()">
          <preview-icon name="reset"></preview-icon>
        </button>
        <button class="tool-button" (click)="download()">
          <preview-icon svg="download"></preview-icon>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['../../styles/_preview-base.scss'],
  styles: [`
     :host{
        display: block;
        width: 100%;
        height: 100%;
    }
    .word-preview {
      width: 100%;
      height: 100%;
      background: #fff;

      iframe {
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WordPreviewComponent extends PreviewBaseComponent {
  getPreviewUrl() {
    // 使用 Office Online Viewer 或其他文档预览服务
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(this.file.url)}`;
  }

  zoomIn() {
    // 实现放大功能
  }

  zoomOut() {
    // 实现缩小功能
  }

  resetZoom() {
    // 重置缩放
  }

  download() {
    // 下载文件
    window.open(this.file.url, '_blank');
  }
}
