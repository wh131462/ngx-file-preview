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
  styleUrls: ["word-preview.component.scss", "../../styles/_theme.scss"],
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

