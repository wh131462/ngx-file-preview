import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PreviewFile } from '../../types/preview.types';
import { PreviewIconComponent } from '../preview-icon/preview-icon.component';

@Component({
  selector: 'fp-text-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="text-container">
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
          <button class="tool-btn" (click)="toggleWrap()">
            <preview-icon [name]="isWrapped ? 'nowrap' : 'wrap'"></preview-icon>
          </button>
        </div>
        <div class="right-controls">
          <button class="tool-btn" (click)="toggleFullscreen()">
            <preview-icon name="fullscreen"></preview-icon>
          </button>
        </div>
      </div>

      <div class="content-container" 
           [class.wrap]="isWrapped"
           (wheel)="handleWheel($event)">
        <div class="content-wrapper" [class.wrap]="isWrapped">
          <pre [style.transform]="'scale(' + scale + ')'"
               [style.transform-origin]="'left top'"
               [class.wrap]="isWrapped">{{ content }}</pre>
        </div>
        <div class="loading-overlay" *ngIf="isLoading">
          <div class="spinner"></div>
          <span>加载中...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .text-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #1e1e1e;
      color: #d4d4d4;
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

    .content-container {
      flex: 1;
      overflow: auto;
      position: relative;
      background: #1e1e1e;

      &.wrap {
        overflow-x: hidden;
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
      min-width: min-content;

      &.wrap {
        min-width: 100%;
        width: 100%;
      }
    }

    pre {
      margin: 0;
      font-family: 'Consolas', 'Monaco', monospace;
      white-space: pre;
      tab-size: 4;
      -moz-tab-size: 4;
      transform-origin: left top;
      background: #1e1e1e;
      text-align: left;
      display: inline-block;
      min-width: 100%;

      &.wrap {
        white-space: pre-wrap;
        word-wrap: break-word;
        width: 100%;
        display: block;
      }
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(30,30,30,0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #333;
        border-top: 4px solid #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      span {
        color: #fff;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextPreviewComponent implements OnInit, OnDestroy {
  @Input() file!: PreviewFile;

  content = '';
  isLoading = true;
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
  ) {}

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
        this.http.get(this.file.url, { responseType: 'text' })
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
