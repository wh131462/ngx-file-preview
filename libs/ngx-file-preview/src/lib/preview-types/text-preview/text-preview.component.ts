import {ChangeDetectionStrategy, Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewIconComponent} from '../../components';
import {BasePreviewComponent} from "../base-preview/base-preview.component";
import {FileReaderResponse} from "../../services";
import {I18nPipe} from "../../i18n/i18n.pipe";
import {TooltipDirective} from "../../directives";

@Component({
  selector: 'ngx-text-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent, I18nPipe, TooltipDirective],
  template: `
    <div class="text-container">
      <div class="toolbar">
        <div class="left-controls">
          <button class="tool-btn" (click)="zoomOut()">
            <preview-icon [themeMode]="themeMode" name="zoom-out" [tooltip]="'preview.toolbar.zoomOut'|i18n"></preview-icon>
          </button>
          <span class="zoom-text" (click)="resetZoom()" [tooltip]="'preview.toolbar.resetZoom'|i18n">
            {{ (scale * 100).toFixed(0) }}%
          </span>
          <button class="tool-btn" (click)="zoomIn()">
            <preview-icon [themeMode]="themeMode" name="zoom-in" [tooltip]="'preview.toolbar.zoomIn'|i18n"></preview-icon>
          </button>
          <button class="tool-btn" (click)="toggleWrap()">
            <preview-icon [themeMode]="themeMode" [name]="isWrapped ? 'nowrap' : 'wrap'" [tooltip]="(isWrapped ? 'preview.toolbar.nowrap' : 'preview.toolbar.wrap')|i18n"></preview-icon>
          </button>
        </div>
        <div class="right-controls">
          <button class="tool-btn" (click)="toggleFullscreen()">
            <preview-icon [themeMode]="themeMode" name="fullscreen" [tooltip]="'preview.toolbar.fullscreen'|i18n"></preview-icon>
          </button>
        </div>
      </div>

      <div class="content-container"
           [class.wrap]="isWrapped"
           (wheel)="handleWheel($event)">
        <div class="content-wrapper" [style]="'--scale:'+scale" [class.wrap]="isWrapped">
          <pre
            [style.transform-origin]="'left top'"
            [class.wrap]="isWrapped"
          >{{ content }}</pre>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../styles/_theme.scss', './text-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextPreviewComponent extends BasePreviewComponent implements OnInit, OnDestroy, OnChanges {
  content = '';
  isWrapped = false;
  scale = 1;

  private readonly SCALE_STEP = 0.1;
  private readonly MAX_SCALE = 3;
  private readonly MIN_SCALE = 0.1;
  private readonly DEFAULT_SCALE = 1;
  private keydownListener?: (e: KeyboardEvent) => void;

  ngOnInit() {
    this.setupKeyboardListeners();
  }

  ngOnDestroy() {
    this.removeKeyboardListeners();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['file']) {
      this.loadFile('text')
    }
  }

  protected override async handleFileContent(content: FileReaderResponse) {
    if (content.error) {
      this.content = '文件加载失败:' + content.error;
    } else {
      this.content = content.text || '文件内容为空';
    }
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
