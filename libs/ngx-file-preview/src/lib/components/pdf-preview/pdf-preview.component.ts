import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PreviewFile } from '../../types/preview.types';
import { PreviewIconComponent } from '../preview-icon/preview-icon.component';

@Component({
  selector: 'fp-pdf-preview',
  standalone: true,
  imports: [CommonModule, PdfViewerModule, PreviewIconComponent],
  template: `
    <div class="pdf-container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="left-controls">
          <div class="control" (click)="zoomOut()">
            <preview-icon name="zoom-out"></preview-icon>
          </div>
          <span>{{ (zoom * 100).toFixed(0) }}%</span>
          <div class="control" (click)="zoomIn()">
            <preview-icon name="zoom-in"></preview-icon>
          </div>
        </div>

        <div class="right-controls">
          <div class="control" (click)="rotate(-90)">
            <preview-icon name="rotate-90"></preview-icon>
          </div>
          <div class="control" (click)="rotate(90)">
            <preview-icon name="rotate90"></preview-icon>
          </div>
          <div class="control" (click)="resetZoom()">
            <preview-icon name="reset"></preview-icon>
          </div>
        </div>
      </div>
      <!-- PDF查看器 -->
      <div class="viewer-container" #viewerContainer>
        <pdf-viewer
          [src]="file.url"
          [rotation]="rotation"
          [zoom]="zoom"
          [page]="currentPage"
          [show-all]="false"
          (after-load-complete)="onPdfLoaded($event)"
          (page-rendered)="pageRendered()"
          [render-text]="true"
          [original-size]="false"
          style="width: 100%; height: 100%;"
        ></pdf-viewer>
      </div>
    </div>
  `,
  styles: [`
    :host{
        display: block;
        width: 100%;
        height: 100%;
    }
    .pdf-container {
      width:  100%;
      height:  100%;
      display: flex;
      flex-direction: column;
      background: #525659;
    }

    .toolbar {
      height: 50px;
      background: #2c2c2c;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      color: white;
      user-select: none;

      .left-controls,
      .right-controls {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .control {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

    }

    .viewer-container {
      flex: 1;
      overflow: auto;
      position: relative;

      ::ng-deep {
        .page {
          margin: 10px auto;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfPreviewComponent {
  @Input() file!: PreviewFile;

  zoom = 1;
  rotation = 0;
  currentPage = 1;
  totalPages = 0;
  isLoading = true;

  constructor(private cdr: ChangeDetectorRef) {}

  onPdfLoaded(pdf: any) {
    this.totalPages = pdf.numPages;
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  pageRendered() {
    // 页面渲染完成后的回调
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  // 缩放控制
  zoomIn() {
    this.zoom = Math.min(this.zoom * 1.2, 3);
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom / 1.2, 0.5);
  }

  resetZoom() {
    this.zoom = 1;
  }

  // 页面导航
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.isLoading = true;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.isLoading = true;
    }
  }

  // 旋转控制
  rotate(degrees: number) {
    this.rotation = (this.rotation + degrees) % 360;
  }

  // 全屏控制
  toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}
