import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {PreviewBaseComponent} from "../base/preview-base.component";

@Component({
  selector: 'fp-text-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="text-container">
      <div class="toolbar">
        <div class="left-controls">
          <button class="tool-btn" (click)="zoomOut()">
            <preview-icon [themeMode]="themeMode" name="zoom-out"></preview-icon>
          </button>
          <span class="zoom-text" (click)="resetZoom()" title="点击重置缩放">
            {{ (scale * 100).toFixed(0) }}%
          </span>
          <button class="tool-btn" (click)="zoomIn()">
            <preview-icon [themeMode]="themeMode" name="zoom-in"></preview-icon>
          </button>
          <button class="tool-btn" (click)="toggleWrap()">
            <preview-icon [themeMode]="themeMode" [name]="isWrapped ? 'nowrap' : 'wrap'"></preview-icon>
          </button>
        </div>
        <div class="right-controls">
          <button class="tool-btn" (click)="toggleFullscreen()">
            <preview-icon [themeMode]="themeMode" name="fullscreen"></preview-icon>
          </button>
        </div>
      </div>

      <div class="content-container"
           [class.wrap]="isWrapped"
           (wheel)="handleWheel($event)">
        <div class="content-wrapper" [class.wrap]="isWrapped">
          <pre [style.transform]="'scale(' + scale + ')'"
               [style.transform-origin]="'left top'"
          >{{ content }}</pre>
        </div>
        <div class="loading-overlay" *ngIf="isLoading">
          <div class="spinner"></div>
          <span>加载中...</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../styles/_theme.scss', './text-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextPreviewComponent extends PreviewBaseComponent implements OnInit, OnDestroy {

  content = '';
  isWrapped = false;
  scale = 1;

  private readonly SCALE_STEP = 0.1;
  private readonly MAX_SCALE = 3;
  private readonly MIN_SCALE = 0.1;
  private readonly DEFAULT_SCALE = 1;
  private keydownListener?: (e: KeyboardEvent) => void;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.loadContent();
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
    this.cdr.markForCheck();
  }

  private async loadContent() {
    try {
      this.isLoading = true;
      this.cdr.markForCheck();

      const response = await firstValueFrom(
        this.http.get(this.file.url, {responseType: 'text'})
      );

      this.content = response || '文件内容为空';
    } catch (error) {
      this.content = '文件加载失败';
      console.error('Failed to load text file:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  toggleWrap() {
    this.isWrapped = !this.isWrapped;
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
