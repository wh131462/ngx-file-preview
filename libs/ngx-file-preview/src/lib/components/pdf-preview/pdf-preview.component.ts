import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {PreviewBaseComponent} from "../base/preview-base.component";
import {FileReaderResponse} from "../../workers/file-reader.worker";

@Component({
  selector: 'fp-pdf-preview',
  standalone: true,
  imports: [CommonModule, NgxExtendedPdfViewerModule, PreviewIconComponent],
  template: `
    <div class="pdf-container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="left-controls">
          <div class="control" (click)="zoomOut()">
            <preview-icon [themeMode]="themeMode" name="zoom-out"></preview-icon>
          </div>
          <span (click)="resetZoom()">{{ zoom }}%</span>
          <div class="control" (click)="zoomIn()">
            <preview-icon [themeMode]="themeMode" name="zoom-in"></preview-icon>
          </div>
        </div>

        <div class="right-controls">
          <div class="control" (click)="rotate(-90)">
            <preview-icon [themeMode]="themeMode" name="rotate-90"></preview-icon>
          </div>
          <div class="control" (click)="rotate(90)">
            <preview-icon [themeMode]="themeMode" name="rotate90"></preview-icon>
          </div>
          <div class="control" (click)="reset()">
            <preview-icon [themeMode]="themeMode" name="reset"></preview-icon>
          </div>
        </div>
      </div>
      <!-- PDF查看器 -->
      <div class="viewer-container" #viewerContainer>
        <div *ngIf="isLoading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>
        <ngx-extended-pdf-viewer
          [class.hidden]="isLoading"
          [src]="file.url"
          [rotation]="rotation"
          [zoom]="zoom"
          (zoomChange)="onZoomChange($event)"
          [page]="currentPage"
          [backgroundColor]="'rgba(0,0,0,0)'"
          [showSidebarButton]="false"
          [textLayer]="true"
          [showToolbar]="false"
          [showTextEditor]="false"
          [showHandToolButton]="false"
          [showFindButton]="false"
          [showPagingButtons]="false"
          [showZoomButtons]="false"
          [showPresentationModeButton]="false"
          [showOpenFileButton]="false"
          [showPrintButton]="false"
          [showDownloadButton]="false"
          [showSecondaryToolbarButton]="false"
          [showRotateButton]="false"
          [showSpreadButton]="false"
          [showPropertiesButton]="false"
          (pagesLoaded)="onPdfLoaded($event)"
          (pageRendered)="pageRendered()"
          style="width: 100%; height: 100%;"
        ></ngx-extended-pdf-viewer>
      </div>
    </div>
  `,
  styleUrls: ["../../styles/_theme.scss", "./pdf-preview.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfPreviewComponent extends PreviewBaseComponent {
  zoom: any = 100;
  rotation: 0 | 90 | 180 | 270 = 0;
  currentPage = 1;
  totalPages = 0;
  @ViewChild(NgxExtendedPdfViewerComponent) pdfViewer!: NgxExtendedPdfViewerComponent;

  protected override handleFileContent(content: FileReaderResponse) {}

  onPdfLoaded(pdf: any) {
    this.totalPages = pdf.pagesCount;
    this.zoom = "auto"
    setTimeout(()=>{
      this.zoom = this.pdfViewer.zoom;
    })
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  pageRendered() {
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  zoomIn() {
    this.zoom = Math.floor(Math.min(this.zoom * 1.2, 300));
  }

  zoomOut() {
    this.zoom = Math.floor(Math.max(this.zoom / 1.2, 10));
  }

  resetZoom() {
    this.zoom = 100;
  }

  reset() {
    this.resetZoom();
    this.rotation = 0;
  }

  rotate(degrees: number) {
    this.rotation = (this.rotation + degrees + 360) % 360 as 0 | 90 | 180 | 270;
  }

  onZoomChange($event: string | number) {
    this.zoom = Math.floor(Number($event))
  }
}
