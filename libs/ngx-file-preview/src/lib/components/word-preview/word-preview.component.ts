import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewBaseComponent} from '../base/preview-base.component';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {renderAsync} from 'docx-preview';

@Component({
  selector: 'core-word-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="word-container">
      <div class="toolbar">
        <div class="left-controls">
          <button class="tool-btn" (click)="zoomOut()">
            <preview-icon name="zoom-out"></preview-icon>
          </button>
          <span class="zoom-text">{{ (scale * 100).toFixed(0) }}%</span>
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

      <div #container class="preview-container">
        <div #content class="preview-content" [style.transform]="'scale(' + scale + ')'">
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .word-container {
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      display: flex;
      flex-direction: column;
    }

    .toolbar {
      height: 48px;
      background: rgba(26, 26, 26, 0.9);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      z-index: 1;
    }

    .left-controls, .right-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tool-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      padding: 8px;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #177ddc;
      }
    }

    .zoom-text {
      color: rgba(255, 255, 255, 0.85);
      font-size: 14px;
      min-width: 48px;
      text-align: center;
    }

    .preview-container {
      flex: 1;
      overflow: auto;
      padding: 20px;
      display: flex;
      justify-content: center;
    }

    .preview-content {
      background: white;
      padding: 40px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      transform-origin: top center;
      max-width: 800px;
      width: 100%;
      min-height: 1000px;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(26, 26, 26, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid transparent;
      border-top-color: #177ddc;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WordPreviewComponent extends PreviewBaseComponent {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  @ViewChild('content') content!: ElementRef<HTMLDivElement>;

  scale = 1;
  private readonly SCALE_STEP = 0.1;
  private readonly MAX_SCALE = 3;
  private readonly MIN_SCALE = 0.1;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  async handleFile() {
    this.isLoading = true;
    try {
      const response = await fetch(this.file.url);
      const arrayBuffer = await response.arrayBuffer();

      await renderAsync(arrayBuffer, this.content.nativeElement, this.content.nativeElement, {
        className: 'docx-viewer',
        inWrapper: false,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        useBase64URL: true,
      });
    } catch (error) {
      console.error('Word文件预览失败:', error);
      this.handleError(error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  zoomIn() {
    if (this.scale < this.MAX_SCALE) {
      this.scale += this.SCALE_STEP;
      this.cdr.markForCheck();
    }
  }

  zoomOut() {
    if (this.scale > this.MIN_SCALE) {
      this.scale -= this.SCALE_STEP;
      this.cdr.markForCheck();
    }
  }

  toggleFullscreen() {
    const elem = this.container.nativeElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}
