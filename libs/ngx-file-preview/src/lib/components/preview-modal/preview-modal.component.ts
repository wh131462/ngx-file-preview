import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  HostListener
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewService} from '../../services/preview.service';
import {ImagePreviewComponent} from '../image-preview/image-preview.component';
import {VideoPreviewComponent} from '../video-preview/video-preview.component';
import {PdfPreviewComponent} from '../pdf-preview/pdf-preview.component';
import {TextPreviewComponent} from '../text-preview/text-preview.component';
import {ArchivePreviewComponent} from '../archive-preview/archive-preview.component';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {WordPreviewComponent} from '../word-preview/word-preview.component';
import {ExcelPreviewComponent} from '../excel-preview/excel-preview.component';
import {PptPreviewComponent} from '../ppt-preview/ppt-preview.component';
import {Subscription} from 'rxjs';
import {PreviewFile} from '../../types/preview.types';
import {AudioPreviewComponent} from "../audio-preview/audio-preview.component";
import {UnknownPreviewComponent} from "../unknown-preview/unknown-preview";

@Component({
  selector: 'ngx-file-preview-modal',
  standalone: true,
  imports: [
    CommonModule,
    ImagePreviewComponent,
    VideoPreviewComponent,
    PdfPreviewComponent,
    TextPreviewComponent,
    ArchivePreviewComponent,
    PreviewIconComponent,
    WordPreviewComponent,
    ExcelPreviewComponent,
    PptPreviewComponent,
    AudioPreviewComponent,
    UnknownPreviewComponent
  ],
  template: `
    <div class="preview-modal-overlay" *ngIf="isVisible" (click)="close()">
      <div class="preview-modal-content"
           (click)="$event.stopPropagation()"
           (mousemove)="handleMouseMove()"
           (mouseleave)="hideControls()">
        <div class="preview-modal-header" [class.has-multiple]="hasMultipleFiles">
          <div class="header-left">
            <span class="file-name">{{ currentFile?.name }}</span>
            <span class="file-index" *ngIf="hasMultipleFiles">{{ getCurrentFileInfo() }}</span>
          </div>
          <div class="header-right">
            <preview-icon name="close" (click)="close()"></preview-icon>
          </div>
        </div>

        <div class="preview-modal-body">
          <button class="nav-button prev"
                  *ngIf="canShowPrevious()"
                  [class.visible]="isControlsVisible"
                  (click)="previous()">
            <preview-icon [size]="36" name="previous"></preview-icon>
          </button>

          <div class="preview-content">
            <ng-container [ngSwitch]="currentFile?.type">
              <fp-image-preview
                *ngSwitchCase="'image'"
                [file]="currentFile!"
              ></fp-image-preview>

              <fp-video-preview
                *ngSwitchCase="'video'"
                [file]="currentFile!"
              ></fp-video-preview>

              <fp-pdf-preview
                *ngSwitchCase="'pdf'"
                [file]="currentFile!"
              ></fp-pdf-preview>

              <fp-word-preview
                *ngSwitchCase="'word'"
                [file]="currentFile!"
              ></fp-word-preview>

              <fp-excel-preview
                *ngSwitchCase="'excel'"
                [file]="currentFile!"
              ></fp-excel-preview>

              <fp-ppt-preview
                *ngSwitchCase="'ppt'"
                [file]="currentFile!"
              ></fp-ppt-preview>

              <fp-text-preview
                *ngSwitchCase="'txt'"
                [file]="currentFile!"
              ></fp-text-preview>

              <fp-archive-preview
                *ngSwitchCase="'zip'"
                [file]="currentFile!"
              ></fp-archive-preview>

              <fp-audio-preview
                *ngSwitchCase="'audio'"
                [file]="currentFile!"
              ></fp-audio-preview>

              <fp-unknown-preview
                *ngSwitchCase="'unknown'"
                [file]="currentFile!">
              </fp-unknown-preview>
            </ng-container>
          </div>

          <button class="nav-button next"
                  *ngIf="canShowNext()"
                  [class.visible]="isControlsVisible"
                  (click)="next()">
            <preview-icon [size]="36" name="next"></preview-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .preview-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .preview-modal-content {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .preview-modal-header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 44px;
      padding: 0 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      z-index: 10;
      opacity: 0.8;
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .file-name {
          font-size: 14px;
          font-weight: 500;
          max-width: 500px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: rgba(255, 255, 255, 0.9);
        }

        .file-index {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
      }

      .header-right preview-icon {
        width: 20px;
        height: 20px;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: white;
          transform: scale(1.1);
        }
      }
    }

    .preview-modal-body {
      flex: 1;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
      margin-top: 44px;
    }

    .preview-content {
      flex: 1;
      height: 100%;
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      padding: 8px;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      z-index: 5;
      transition: all 0.3s;
      opacity: 0;
      pointer-events: none;

      &.visible {
        opacity: 0.8;
        pointer-events: auto;
      }

      &:hover {
        color: white;
        transform: translateY(-50%) scale(1.1);
      }

      &.prev {
        left: 16px;
      }

      &.next {
        right: 16px;
      }

      preview-icon {
        display: block;
        filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.3));
      }
    }

    body:has(.preview-modal-overlay) {
      overflow: hidden;
    }

    :host ::ng-deep {
      fp-image-preview,
      fp-video-preview,
      fp-pdf-preview,
      fp-word-preview,
      fp-excel-preview,
      fp-ppt-preview,
      fp-text-preview,
      fp-archive-preview,
      fp-audio-preview,
      fp-unknown-preview {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PreviewModalComponent implements OnInit, OnDestroy {
  isVisible = false;
  currentFile?: PreviewFile;
  private subscription?: Subscription;
  private state$ = this.previewService.previewState$;
  isControlsVisible = true;
  private controlsTimeout?: number;
  private readonly HIDE_DELAY = 2000;

  constructor(
    private previewService: PreviewService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.subscription = this.state$.subscribe(state => {
      this.isVisible = state.isVisible;
      this.currentFile = state.currentFile;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    if (this.controlsTimeout) {
      window.clearTimeout(this.controlsTimeout);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowLeft':
        this.previous();
        break;
      case 'ArrowRight':
        this.next();
        break;
    }
  }

  close() {
    this.previewService.close();
  }

  previous() {
    this.previewService.previous();
  }

  next() {
    this.previewService.next();
  }

  canShowPrevious(): boolean {
    const state = this.previewService.previewStateSubject.getValue();
    return state.currentIndex > 0;
  }

  canShowNext(): boolean {
    const state = this.previewService.previewStateSubject.getValue();
    return state.currentIndex < state.files.length - 1;
  }

  getCurrentFileInfo(): string {
    const state = this.previewService.previewStateSubject.getValue();
    return `${state.currentIndex + 1} / ${state.files.length}`;
  }

  get hasMultipleFiles(): boolean {
    const state = this.previewService.previewStateSubject.getValue();
    return (state.files?.length || 0) > 1;
  }

  handleMouseMove() {
    this.isControlsVisible = true;
    this.cdr.markForCheck();

    if (this.controlsTimeout) {
      window.clearTimeout(this.controlsTimeout);
    }

    this.controlsTimeout = window.setTimeout(() => {
      this.hideControls();
    }, this.HIDE_DELAY);
  }

  hideControls() {
    this.isControlsVisible = false;
    this.cdr.markForCheck();

    if (this.controlsTimeout) {
      window.clearTimeout(this.controlsTimeout);
    }
  }
}
