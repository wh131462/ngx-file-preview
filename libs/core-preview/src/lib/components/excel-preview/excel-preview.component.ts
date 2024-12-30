import { Component, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewBaseComponent } from '../base/preview-base.component';
import { PreviewIconComponent } from "../preview-icon/preview-icon.component";
import { PreviewService } from '../../services/preview.service';

@Component({
  selector: 'core-excel-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="preview-container excel-preview">
      <div class="preview-wrapper" [style.transform]="'scale(' + zoom + ')'">
        <iframe
          #previewFrame
          *ngIf="!isLoading"
          [src]="getPreviewUrl()"
          frameborder="0"
          width="100%"
          height="100%"
          (load)="onLoadComplete()"
          (error)="handleError($event)"
        ></iframe>
      </div>

      <div class="loading-wrapper" *ngIf="isLoading">
        <span class="loading-icon">⌛</span>
      </div>

      <div class="toolbar" *ngIf="!isLoading">
        <button class="tool-button" (click)="zoomIn()" [disabled]="zoom >= maxZoom">
          <preview-icon name="zoom-in"></preview-icon>
        </button>
        <button class="tool-button" (click)="zoomOut()" [disabled]="zoom <= minZoom">
          <preview-icon name="zoom-out"></preview-icon>
        </button>
        <button class="tool-button" (click)="resetZoom()" [disabled]="zoom === 1">
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
    .excel-preview {
      background: #fff;

      iframe {
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        background: white;
        border-radius: 4px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcelPreviewComponent extends PreviewBaseComponent {
  @ViewChild('previewFrame') previewFrame?: ElementRef<HTMLIFrameElement>;

  protected readonly minZoom = 0.25;
  protected readonly maxZoom = 3;
  private readonly zoomStep = 0.25;
  zoom = 1;

  constructor(private previewService: PreviewService) {
    super();
  }

  getPreviewUrl() {
    // 使用 Office Online Viewer 或其他文档预览服务
    const url = new URL('https://view.officeapps.live.com/op/embed.aspx');
    url.searchParams.set('src', encodeURIComponent(this.file.url));
    url.searchParams.set('wdAllowInteractivity', 'True');  // 允许交互
    url.searchParams.set('wdHideGridlines', 'True');       // 隐藏网格线
    url.searchParams.set('wdHideHeaders', 'True');         // 隐藏表头
    url.searchParams.set('wdDownloadButton', 'True');      // 显示下载按钮
    url.searchParams.set('wdPrint', 'True');              // 允许打印
    return url.toString();
  }

  zoomIn() {
    if (this.zoom < this.maxZoom) {
      this.zoom = Math.min(this.maxZoom, this.zoom + this.zoomStep);
      this.updateZoom();
    }
  }

  zoomOut() {
    if (this.zoom > this.minZoom) {
      this.zoom = Math.max(this.minZoom, this.zoom - this.zoomStep);
      this.updateZoom();
    }
  }

  resetZoom() {
    this.zoom = 1;
    this.updateZoom();
  }

  private updateZoom() {
    // 通知 PreviewService 更新缩放状态
    this.previewService.previewStateSubject.next({
      ...this.previewService.previewStateSubject.getValue(),
      zoom: this.zoom
    });
  }

  download() {
    // 如果文件URL是可直接下载的
    if (this.file.url) {
      const link = document.createElement('a');
      link.href = this.file.url;
      link.download = this.file.name;
      link.target = '_blank';
      link.click();
    }
  }

  override onLoadComplete() {
    super.onLoadComplete();
    // 加载完成后的额外处理
    this.setupFrameInteractions();
  }

  private setupFrameInteractions() {
    if (this.previewFrame?.nativeElement) {
      const frame = this.previewFrame.nativeElement;

      // 监听滚轮事件实现缩放
      frame.addEventListener('wheel', (e: WheelEvent) => {
        if (e.ctrlKey) {
          e.preventDefault();
          if (e.deltaY < 0) {
            this.zoomIn();
          } else {
            this.zoomOut();
          }
        }
      }, { passive: false });

      // 可以添加其他交互，如双击单元格全屏显示等
    }
  }

  // 清理工作
  ngOnDestroy() {
    if (this.previewFrame?.nativeElement) {
      // 移除事件监听器
      this.previewFrame.nativeElement.remove();
    }
  }
}
