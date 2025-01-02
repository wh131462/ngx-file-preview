import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewBaseComponent } from '../base/preview-base.component';
import { PreviewIconComponent } from '../preview-icon/preview-icon.component';
import { init } from 'pptx-preview';

@Component({
  selector: 'fp-ppt-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="ppt-container">
      <div class="toolbar">
        <div class="left-controls">
          <button class="tool-btn" (click)="zoomOut()">
            <preview-icon name="zoom-out"></preview-icon>
          </button>
          <span class="zoom-text" (click)="resetZoom()" title="点击重置缩放">
            {{ (scale * 100).toFixed(0) }}%
          </span>
          <button class="tool-btn" (click)="zoomIn()">
            <preview-icon name="zoom-in"></preview-icon>
          </button>
        </div>
        <div class="right-controls">
          <button class="tool-btn" (click)="toggleFullscreen()">
            <preview-icon name="fullscreen"></preview-icon>
          </button>
        </div>
      </div>

      <div class="preview-container" #previewContainer>
        <div #content class="preview-content"></div>
      </div>

      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ppt-container {
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      overflow: hidden;
    }

    .toolbar {
      height: 48px;
      min-height: 48px;
      background: #262626;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 52px 0 16px;
      border-bottom: 1px solid #303030;
      gap: 16px;
    }

    .left-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview-container {
      flex: 1;
      overflow: auto;
      display: flex;
      justify-content: center;

      &::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }

      &::-webkit-scrollbar-track {
        background: #1a1a1a;
      }

      &::-webkit-scrollbar-thumb {
        background: #404040;
        border: 2px solid #1a1a1a;
        border-radius: 6px;

        &:hover {
          background: #505050;
        }
      }
    }

    .preview-content {
      border-radius: 2px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      ::ng-deep .pptx-preview-wrapper{
        width: 100% !important;
        height: 100% !important;
        scrollbar-width: none;
      }
    }

    .tool-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      width: 32px;
      height: 32px;
      padding: 0;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: #303030;
        color: #177ddc;
      }
    }

    .zoom-text {
      color: rgba(255, 255, 255, 0.85);
      font-size: 13px;
      min-width: 48px;
      text-align: center;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;

      &:hover {
        background: #303030;
        color: #177ddc;
      }
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(26, 26, 26, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #262626;
      border-top-color: #177ddc;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PptPreviewComponent extends PreviewBaseComponent {
  @ViewChild('content') content!: ElementRef<HTMLDivElement>;
  @ViewChild('previewContainer') previewContainer!: ElementRef<HTMLDivElement>;

  private pptxPreviewer: any;
  scale = 1;
  private readonly SCALE_STEP = 0.1;
  private readonly MAX_SCALE = 3;
  private readonly MIN_SCALE = 0.1;
  private readonly DEFAULT_SCALE = 1;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['file'] && this.file) {
      this.handleFile();
    }
  }

  async handleFile() {
    this.isLoading = true;
    try {
      const response = await fetch(this.file.url);
      const arrayBuffer = await response.arrayBuffer();

      // 获取容器尺寸
      const container = this.previewContainer.nativeElement;
      const { width } = container.getBoundingClientRect();

      // 初始化预览器
      this.pptxPreviewer = init(this.content.nativeElement, {
        width: width - 40, // 减去padding
        height: (width - 40) * 0.5625 // 16:9 比例
      });

      // 预览PPT
      await this.pptxPreviewer.preview(arrayBuffer);
    } catch (error) {
      console.error('PPT预览失败:', error);
      this.handleError(error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  zoomIn() {
    if (this.scale < this.MAX_SCALE) {
      this.scale = Math.min(this.MAX_SCALE, this.scale + this.SCALE_STEP);
      this.applyZoom();
    }
  }

  zoomOut() {
    if (this.scale > this.MIN_SCALE) {
      this.scale = Math.max(this.MIN_SCALE, this.scale - this.SCALE_STEP);
      this.applyZoom();
    }
  }

  resetZoom() {
    this.scale = this.DEFAULT_SCALE;
    this.applyZoom();
  }

  private applyZoom() {
    if (this.content) {
      this.content.nativeElement.style.transform = `scale(${this.scale})`;
      this.content.nativeElement.style.transformOrigin = 'center top';
    }
    this.cdr.markForCheck();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}
