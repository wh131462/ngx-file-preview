import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewBaseComponent} from '../base/preview-base.component';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {renderAsync} from 'docx-preview';

@Component({
  selector: 'fp-word-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="word-container" #container>
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

      <div class="preview-container" (wheel)="handleWheel($event)">
        <div #content class="preview-content" [style.transform]="'scale(' + scale + ')'">
        </div>
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

    .word-container {
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
      background: #262626;
      display: flex;
      justify-content: center;
      padding: 20px;

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
      background: white;
      border-radius: 2px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      transform-origin: center center;
      width: 816px;
      min-height: 1056px;
      margin: auto;

      :host ::ng-deep {
        font-family: 'Calibri', 'Arial', sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #333;

        h1, h2, h3, h4, h5, h6 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 500;
          color: #000;
        }

        h1 { font-size: 24pt; }
        h2 { font-size: 18pt; }
        h3 { font-size: 14pt; }
        h4 { font-size: 12pt; }

        p {
          margin: 0 0 8pt;
          text-align: justify;
        }

        ul, ol {
          margin: 0 0 8pt 40px;
          padding: 0;
        }

        img {
          max-width: 100%;
          height: auto;
          margin: 8pt 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12pt 0;

          td, th {
            border: 1px solid #d1d1d1;
            padding: 6pt 8pt;
            vertical-align: top;
          }

          th {
            background: #f8f8f8;
            font-weight: bold;
          }

          tr:nth-child(even) {
            background: #fafafa;
          }
        }

        a {
          color: #0563c1;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }

        blockquote {
          margin: 12pt 0;
          padding: 8pt 16pt;
          border-left: 4px solid #e0e0e0;
          background: #f8f8f8;
          font-style: italic;
        }

        pre, code {
          font-family: 'Consolas', monospace;
          background: #f5f5f5;
          padding: 2pt 4pt;
          border-radius: 2px;
        }

        pre {
          padding: 8pt 12pt;
          margin: 12pt 0;
          overflow-x: auto;
        }
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
export class WordPreviewComponent extends PreviewBaseComponent implements OnChanges {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  @ViewChild('content') content!: ElementRef<HTMLDivElement>;

  scale = 1;
  private readonly SCALE_STEP = 0.1;
  private readonly MAX_SCALE = 3;
  private readonly MIN_SCALE = 0.1;
  private readonly DEFAULT_SCALE = 1;
  private keydownListener?: (e: KeyboardEvent) => void;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['file'] && this.file) {
      this.handleFile();
    }
  }

  ngOnInit() {
    this.setupKeyboardListeners();
  }

  ngOnDestroy() {
    this.removeKeyboardListeners();
  }

  private setupKeyboardListeners() {
    this.keydownListener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        this.resetZoom();
      }
    };
    
    document.addEventListener('keydown', this.keydownListener);
  }

  private removeKeyboardListeners() {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }

  handleWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY || event.detail || 0;
      
      if (delta < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
  }

  async handleFile() {
    this.isLoading = true;
    try {
      const response = await fetch(this.file.url);
      const arrayBuffer = await response.arrayBuffer();

      await renderAsync(arrayBuffer, this.content.nativeElement, this.content.nativeElement, {
        className: 'docx-preview',
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
      const container = this.content.nativeElement.parentElement;
      if (container) {
        const scrollLeftPercent = container.scrollLeft / (container.scrollWidth - container.clientWidth);
        const scrollTopPercent = container.scrollTop / (container.scrollHeight - container.clientHeight);
        
        this.content.nativeElement.style.transform = `scale(${this.scale})`;
        
        setTimeout(() => {
          container.scrollLeft = scrollLeftPercent * (container.scrollWidth - container.clientWidth);
          container.scrollTop = scrollTopPercent * (container.scrollHeight - container.clientHeight);
        });
      }
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

