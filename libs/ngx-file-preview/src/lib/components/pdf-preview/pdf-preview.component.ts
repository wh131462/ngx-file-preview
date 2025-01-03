import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {PreviewBaseComponent} from "../base/preview-base.component";

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
            <preview-icon [themeMode]="themeMode" name="zoom-out"></preview-icon>
          </div>
          <span>{{ (zoom * 100).toFixed(0) }}%</span>
          <div class="control" (click)="zoomIn()">
            <preview-icon [themeMode]="themeMode" name="zoom-in"></preview-icon>
          </div>
        </div>

        <div class="right-controls">
          <div class="control" (click)="rotate(-90)">
            <preview-icon [themeMode]="themeMode"  name="rotate-90"></preview-icon>
          </div>
          <div class="control" (click)="rotate(90)">
            <preview-icon [themeMode]="themeMode"  name="rotate90"></preview-icon>
          </div>
          <div class="control" (click)="resetZoom()">
            <preview-icon [themeMode]="themeMode"  name="reset"></preview-icon>
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
  styleUrls: ["../../styles/_theme.scss", "./pdf-preview.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfPreviewComponent extends PreviewBaseComponent {
  zoom = 1;
  rotation = 0;
  currentPage = 1;
  totalPages = 0;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

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
