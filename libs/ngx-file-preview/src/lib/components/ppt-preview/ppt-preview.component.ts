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
import {init} from 'pptx-preview';

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
            <preview-icon [themeMode]="themeMode"  name="zoom-in"></preview-icon>
          </button>
        </div>
        <div class="right-controls">
          <button class="tool-btn" (click)="toggleFullscreen()">
            <preview-icon [themeMode]="themeMode"  name="fullscreen"></preview-icon>
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
  styleUrls: ["../../styles/_theme.scss", "ppt-preview.component.scss"],
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
      const {width} = container.getBoundingClientRect();

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
      const wrapper: HTMLElement = this.content.nativeElement.querySelector('.pptx-preview-wrapper')!;
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
