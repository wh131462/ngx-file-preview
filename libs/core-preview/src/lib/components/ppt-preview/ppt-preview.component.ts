import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewBaseComponent } from '../base/preview-base.component';
import {PreviewIconComponent} from "../preview-icon/preview-icon.component";

@Component({
  selector: 'core-ppt-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="preview-container ppt-preview">
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
        <button class="tool-button" (click)="previousSlide()">
          <preview-icon name="previous"></preview-icon>
        </button>
        <button class="tool-button" (click)="nextSlide()">
          <preview-icon name="next"></preview-icon>
        </button>
        <button class="tool-button" (click)="startSlideshow()">
          <preview-icon name="slide-show"></preview-icon>
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
    .ppt-preview {
      background: #1a1a1a;

      iframe {
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PptPreviewComponent extends PreviewBaseComponent {
  getPreviewUrl() {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(this.file.url)}`;
  }

  previousSlide() {
    // 实现上一页功能
  }

  nextSlide() {
    // 实现下一页功能
  }

  startSlideshow() {
    // 开始放映
  }

  download() {
    window.open(this.file.url, '_blank');
  }
}
