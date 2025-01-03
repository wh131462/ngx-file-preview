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
    <div class="word-container">
      <div class="toolbar">
        <div class="left-controls">
          <button class="tool-btn" (click)="zoomOut()" [disabled]="scale <= MIN_SCALE">
            <preview-icon [themeMode]="themeMode" name="zoom-out"></preview-icon>
          </button>
          <span class="zoom-text" (click)="resetZoom()" title="点击重置缩放">
            {{ (scale * 100).toFixed(0) }}%
          </span>
          <button class="tool-btn" (click)="zoomIn()" [disabled]="scale >= MAX_SCALE">
            <preview-icon [themeMode]="themeMode" name="zoom-in"></preview-icon>
          </button>
        </div>
        <div class="right-controls">
          <button class="tool-btn" (click)="toggleFullscreen()">
            <preview-icon [themeMode]="themeMode" name="fullscreen"></preview-icon>
          </button>
        </div>
      </div>

      <div class="preview-container"
           #previewContainer
           (wheel)="handleWheel($event)"
           (pointerdown)="startDrag($event)"
           (pointermove)="onDrag($event)"
           (pointerup)="stopDrag($event)"
           [class.dragging]="isDragging">
        <div class="content-wrapper">
          <div #content
               class="preview-content"
               [style.transform]="'scale(' + scale + ')'">
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `,
  styleUrls: ["../../styles/_theme.scss","word-preview.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WordPreviewComponent extends PreviewBaseComponent implements OnChanges {
  @ViewChild('content') content!: ElementRef<HTMLDivElement>;
  @ViewChild('previewContainer') previewContainer!: ElementRef<HTMLDivElement>;

  // 缩放相关常量
  protected readonly MIN_SCALE = 0.25;
  protected readonly MAX_SCALE = 4;
  protected readonly SCALE_STEP = 0.1;
  protected readonly DEFAULT_SCALE = 1;

  // 状态
  protected scale = 1;
  protected isDragging = false;

  // 拖拽相关
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;
  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['file']) {
      this.loadDocument();
    }
  }

  private async loadDocument() {
    if (!this.file?.url) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      const response = await fetch(this.file.url);
      const arrayBuffer = await response.arrayBuffer();

      await renderAsync(arrayBuffer, this.content.nativeElement, undefined, {
        className: 'docx-content',
        inWrapper: false,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        useBase64URL: true,
      });

      this.onLoadComplete();
    } catch (error) {
      this.handleError(error);
    }

    this.cdr.markForCheck();
  }

  handleWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 1 : -1;
      if (delta > 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
  }

  startDrag(event: PointerEvent) {
    if (event.button !== 0) return;

    this.isDragging = true;
    const container = this.previewContainer.nativeElement;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;

    container.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  onDrag(event: PointerEvent) {
    if (!this.isDragging) return;

    const container = this.previewContainer.nativeElement;
    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    container.scrollLeft = this.scrollLeft - deltaX;
    container.scrollTop = this.scrollTop - deltaY;
  }

  stopDrag(event: PointerEvent) {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.previewContainer.nativeElement.releasePointerCapture(event.pointerId);
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
    if (this.content?.nativeElement && this.previewContainer?.nativeElement) {
      const container = this.previewContainer.nativeElement;
      const rect = container.getBoundingClientRect();

      // 获取当前滚动中心点
      const centerX = (container.scrollLeft + rect.width / 2) / this.scale;
      const centerY = (container.scrollTop + rect.height / 2) / this.scale;

      // 更新缩放
      this.content.nativeElement.style.transform = `scale(${this.scale})`;
      this.content.nativeElement.style.transformOrigin = 'top left';

      // 调整滚动位置，确保视图保持缩放中心一致
      requestAnimationFrame(() => {
        container.scrollLeft = centerX * this.scale - rect.width / 2;
        container.scrollTop = centerY * this.scale - rect.height / 2;
      });
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

