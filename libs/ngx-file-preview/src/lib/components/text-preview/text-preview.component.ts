import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PreviewFile } from '../../types/preview.types';
import { PreviewIconComponent } from '../preview-icon/preview-icon.component';

@Component({
  selector: 'core-text-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="text-container">
      <div class="toolbar">
        <div class="left-controls">
          <span class="filename">{{ file.name }}</span>
        </div>
        <div class="right-controls">
          <button (click)="toggleWrap()">
            <preview-icon [name]="isWrapped ? 'nowrap' : 'wrap'"></preview-icon>
          </button>
          <button (click)="adjustFontSize(1)">
            <preview-icon name="zoom-in"></preview-icon>
          </button>
          <button (click)="adjustFontSize(-1)">
            <preview-icon name="zoom-out"></preview-icon>
          </button>
          <button (click)="toggleFullscreen()">
            <preview-icon name="fullscreen"></preview-icon>
          </button>
        </div>
      </div>

      <div class="content-container" [class.wrap]="isWrapped">
        <pre [style.font-size.px]="fontSize">{{ content }}</pre>
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
    }

    .toolbar {
      height: 50px;
      background: #2c2c2c;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      padding-right: 64px;
      border-bottom: 1px solid #404040;

      .filename {
        font-size: 14px;
        opacity: 0.8;
      }

      .right-controls {
        display: flex;
        gap: 10px;

        button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.3);
          }

          &:active {
            transform: scale(0.95);
          }

          preview-icon {
            width: 16px;
            height: 16px;
          }
        }
      }
    }

    .content-container {
      flex: 1;
      overflow: auto;
      position: relative;
      padding: 20px;

      pre {
        margin: 0;
        font-family: 'Consolas', 'Monaco', monospace;
        white-space: pre;
        tab-size: 4;
        -moz-tab-size: 4;

        &.wrap {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      }

      &.wrap pre {
        white-space: pre-wrap;
        word-wrap: break-word;
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
  fontSize = 14;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadContent();
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

  adjustFontSize(delta: number) {
    this.fontSize = Math.min(Math.max(this.fontSize + delta, 10), 24);
    this.cdr.markForCheck();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  ngOnDestroy() {
    // 清理工作
  }
}
