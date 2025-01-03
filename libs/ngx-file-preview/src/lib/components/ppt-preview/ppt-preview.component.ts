import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewBaseComponent} from '../base/preview-base.component';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {init} from "pptx-preview";

@Component({
  selector: 'fp-ppt-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="ppt-container" #container>
      <div class="toolbar">
        <div class="left-controls">
          <button class="tool-btn" (click)="zoomOut()">
            <preview-icon name="zoom-out" [themeMode]="themeMode"></preview-icon>
          </button>
          <span class="zoom-text" (click)="resetZoom()" title="点击重置缩放">
            {{ (scale * 100).toFixed(0) }}%
          </span>
          <button class="tool-btn" (click)="zoomIn()">
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
           (mousedown)="startDrag($event)"
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
  styleUrls: ["../../styles/_theme.scss", "ppt-preview.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PptPreviewComponent extends PreviewBaseComponent {
  @ViewChild('content') content!: ElementRef<HTMLDivElement>;
  @ViewChild('previewContainer') previewContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  private pptxPreviewer: any;
  scale = 1;
  private readonly SCALE_STEP = 0.1;
  private readonly MAX_SCALE = 3;
  private readonly MIN_SCALE = 0.1;
  private readonly DEFAULT_SCALE = 1;

  isDragging = false;
  private startX = 0;
  private startY = 0;
  private startScrollLeft = 0;
  private startScrollTop = 0;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private mouseMoveListener?: (e: MouseEvent) => void;
  private mouseUpListener?: (e: MouseEvent) => void;

  constructor(private cdr: ChangeDetectorRef, private elementRef: ElementRef) {
    super();
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['file'] && this.file) {
      this.handleFile();
    }
  }

  ngAfterViewInit() {
    this.setupDragListeners();
    this.disableNativeDragAndSelect();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    this.removeDragListeners();
  }

  private setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      if (this.pptxPreviewer) {
        this.updatePreviewSize();
      }
    });
    resizeObserver.observe(this.container.nativeElement);
  }

  private updatePreviewSize() {
    const container = this.previewContainer.nativeElement;
    const {width} = container.getBoundingClientRect();
    if (this.pptxPreviewer) {
      this.pptxPreviewer.resize(Math.min(1200, width));
    }
  }

  private setupDragListeners() {
    this.mouseMoveListener = (e: MouseEvent) => this.onDrag(e);
    this.mouseUpListener = () => this.stopDrag();

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
  }

  private removeDragListeners() {
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
    }
    if (this.mouseUpListener) {
      document.removeEventListener('mouseup', this.mouseUpListener);
    }
  }

  startDrag(e: MouseEvent) {
    if (e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      (e.target as HTMLElement).closest('.toolbar')) {
      return;
    }

    const container = this.previewContainer.nativeElement;
    const rect = container.getBoundingClientRect();

    const isClickOnScrollbarX = e.clientY > (rect.bottom - 12);
    const isClickOnScrollbarY = e.clientX > (rect.right - 12);
    if (isClickOnScrollbarX || isClickOnScrollbarY) {
      return;
    }

    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.startScrollLeft = container.scrollLeft;
    this.startScrollTop = container.scrollTop;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  }

  private onDrag(e: MouseEvent) {
    if (!this.isDragging) return;

    e.preventDefault();
    const container = this.previewContainer.nativeElement;

    const deltaX = e.clientX - this.lastMouseX;
    const deltaY = e.clientY - this.lastMouseY;

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    requestAnimationFrame(() => {
      container.scrollLeft -= deltaX;
      container.scrollTop -= deltaY;
    });
  }

  private stopDrag() {
    if (!this.isDragging) return;

    this.isDragging = false;
    document.body.style.removeProperty('user-select');
    document.body.style.removeProperty('cursor');
    window.getSelection()?.removeAllRanges();
  }

  handleWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY || event.detail || 0;

      const rect = this.previewContainer.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const oldScale = this.scale;
      if (delta < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }

      if (oldScale !== this.scale) {
        this.adjustScroll(x, y, oldScale);
      }
    }
  }

  private adjustScroll(x: number, y: number, oldScale: number) {
    const container = this.previewContainer.nativeElement;
    const scaleChange = this.scale / oldScale;

    const newX = x * scaleChange;
    const newY = y * scaleChange;

    container.scrollLeft += (newX - x);
    container.scrollTop += (newY - y);
  }

  async handleFile() {
    this.isLoading = true;
    try {
      const response = await fetch(this.file.url);
      const arrayBuffer = await response.arrayBuffer();

      const container = this.previewContainer.nativeElement;
      const {width} = container.getBoundingClientRect();

      this.pptxPreviewer = init(this.content.nativeElement, {
        width: Math.min(1200, width),
      });

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
      this.cdr.markForCheck();
    }
  }

  zoomOut() {
    if (this.scale > this.MIN_SCALE) {
      this.scale = Math.max(this.MIN_SCALE, this.scale - this.SCALE_STEP);
      this.cdr.markForCheck();
    }
  }

  resetZoom() {
    this.scale = this.DEFAULT_SCALE;
    this.cdr.markForCheck();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.elementRef.nativeElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  private disableNativeDragAndSelect() {
    if (this.content) {
      const element = this.content.nativeElement;
      element.addEventListener('dragstart', (e: Event) => e.preventDefault());
      element.addEventListener('selectstart', (e: Event) => {
        if (this.isDragging) {
          e.preventDefault();
        }
      });
    }
  }
}
