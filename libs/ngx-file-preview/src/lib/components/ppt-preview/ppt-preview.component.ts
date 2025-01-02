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
    <div class="ppt-container" #container>
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

      <div class="preview-container"
           #previewContainer
           (wheel)="handleWheel($event)"
           (mousedown)="startDrag($event)"
           [class.dragging]="isDragging">
        <div class="content-wrapper">
          <div #content class="preview-content"></div>
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
      position: relative;
      cursor: default;
      background: #1a1a1a;

      &.dragging {
        cursor: grab;
        user-select: none;

        * {
          cursor: grab !important;
          user-select: none;
          pointer-events: none;
        }
      }

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

    .content-wrapper {
      min-width: 100%;
      min-height: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .preview-content {
      border-radius: 2px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      transform-origin: center top;
      width: fit-content;
      height: fit-content;

      ::ng-deep {
        .pptx-preview-wrapper {
          width: 100% !important;
          height: 100% !important;
          scrollbar-width: none;
        }

        img {
          user-drag: none;
          -webkit-user-drag: none;
          user-select: none;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          pointer-events: none;
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
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    :host(.fullscreen) {
      .ppt-container {
        border-radius: 0;
      }

      .preview-container {
        background: #1a1a1a;
      }
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

  isDragging = false;
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;
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
  }

  ngOnDestroy() {
    this.removeDragListeners();
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
    // 如果是从按钮或其他控件开始拖动，不处理
    if (e.target instanceof HTMLButtonElement ||
        e.target instanceof HTMLInputElement ||
        (e.target as HTMLElement).closest('.toolbar')) {
      return;
    }

    const container = this.previewContainer.nativeElement;
    const rect = container.getBoundingClientRect();

    // 检查是否点击在滚动条上
    const isClickOnScrollbarX = e.clientY > (rect.bottom - 12);
    const isClickOnScrollbarY = e.clientX > (rect.right - 12);
    if (isClickOnScrollbarX || isClickOnScrollbarY) {
      return;
    }

    this.isDragging = true;
    this.startX = e.pageX - container.offsetLeft;
    this.startY = e.pageY - container.offsetTop;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;

    // 添加临时的全局样式
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grab';
  }

  private onDrag(e: MouseEvent) {
    if (!this.isDragging) return;

    e.preventDefault();
    const container = this.previewContainer.nativeElement;

    // 计算移动距离
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    const walkX = (x - this.startX) * 1.5;
    const walkY = (y - this.startY) * 1.5;

    // 检查是否有可滚动区域
    const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
    const hasVerticalScroll = container.scrollHeight > container.clientHeight;

    requestAnimationFrame(() => {
      // 只在有可滚动区域的方向上应用滚动
      if (hasHorizontalScroll) {
        container.scrollLeft = this.scrollLeft - walkX;
      }
      if (hasVerticalScroll) {
        container.scrollTop = this.scrollTop - walkY;
      }
    });
  }

  private stopDrag() {
    if (!this.isDragging) return;

    this.isDragging = false;

    // 移除临时的全局样式
    document.body.style.removeProperty('user-select');
    document.body.style.removeProperty('cursor');

    // 移除可能的选中内容
    window.getSelection()?.removeAllRanges();
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

      // 获取容器尺寸
      const container = this.previewContainer.nativeElement;
      const { width } = container.getBoundingClientRect();

      // 初始化预览器
      this.pptxPreviewer = init(this.content.nativeElement, {
        width: Math.min(1200, width - 40), // 最大宽度1200px
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
      const wrapper:HTMLElement = this.content.nativeElement.querySelector('.pptx-preview-wrapper')!;
      if (wrapper) {
        wrapper.style.transform = `scale(${this.scale})`;
        wrapper.style.transformOrigin = 'center top';
      }
    }
    this.cdr.markForCheck();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.body.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  private disableNativeDragAndSelect() {
    if (this.content) {
      const element = this.content.nativeElement;

      // 禁用原生拖动
      element.addEventListener('dragstart', (e: Event) => {
        e.preventDefault();
      });

      // 禁用文本选择
      element.addEventListener('selectstart', (e: Event) => {
        if (this.isDragging) {
          e.preventDefault();
        }
      });
    }
  }
}
