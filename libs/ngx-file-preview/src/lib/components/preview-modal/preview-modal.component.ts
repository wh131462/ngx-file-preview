import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewService } from '../../services/preview.service';
import { ImagePreviewComponent } from '../image-preview/image-preview.component';
import { VideoPreviewComponent } from '../video-preview/video-preview.component';
import { PdfPreviewComponent } from '../pdf-preview/pdf-preview.component';
import { TextPreviewComponent } from '../text-preview/text-preview.component';
import { ArchivePreviewComponent } from '../archive-preview/archive-preview.component';
import { PreviewIconComponent } from '../preview-icon/preview-icon.component';
import { WordPreviewComponent } from '../word-preview/word-preview.component';
import { ExcelPreviewComponent } from '../excel-preview/excel-preview.component';
import { PptPreviewComponent } from '../ppt-preview/ppt-preview.component';

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
    PptPreviewComponent
  ],
  template: `
    <div class="preview-modal" *ngIf="isVisible">
      <div class="preview-header" [class.has-multiple]="hasMultipleFiles">
        <div class="header-left" *ngIf="hasMultipleFiles">
          <span class="file-name">{{ currentFile?.name }}</span>
          <span class="file-index">{{ getCurrentFileInfo() }}</span>
        </div>
        <div class="header-right">
          <preview-icon name="close" (click)="close()"></preview-icon>
        </div>
      </div>

      <div class="preview-content">
        <div class="nav-button prev"
             *ngIf="canShowPrevious()"
             (click)="previous()">
          <preview-icon name="previous"></preview-icon>
        </div>

        <ng-container [ngSwitch]="currentFile?.type">
          <core-image-preview
            *ngSwitchCase="'image'"
            [file]="currentFile!"
          ></core-image-preview>

          <core-video-preview
            *ngSwitchCase="'video'"
            [file]="currentFile!"
          ></core-video-preview>

          <core-pdf-preview
            *ngSwitchCase="'pdf'"
            [file]="currentFile!"
          ></core-pdf-preview>

          <core-word-preview
            *ngSwitchCase="'word'"
            [file]="currentFile!"
          ></core-word-preview>

          <core-excel-preview
            *ngSwitchCase="'excel'"
            [file]="currentFile!"
          ></core-excel-preview>

          <core-ppt-preview
            *ngSwitchCase="'ppt'"
            [file]="currentFile!"
          ></core-ppt-preview>

          <core-text-preview
            *ngSwitchCase="'txt'"
            [file]="currentFile!"
          ></core-text-preview>

          <core-archive-preview
            *ngSwitchCase="'zip'"
            [file]="currentFile!"
          ></core-archive-preview>

          <div *ngSwitchCase="'audio'" class="audio-preview">
            <audio controls [src]="currentFile!.url"></audio>
          </div>

          <div *ngSwitchCase="'unknown'" class="unknown-preview">
            <div class="unknown-message">
              <preview-icon name="unknown"></preview-icon>
              <p>暂不支持该文件类型的预览</p>
            </div>
          </div>
        </ng-container>

        <div class="nav-button next"
             *ngIf="canShowNext()"
             (click)="next()">
          <preview-icon [size]="24" name="next"></preview-icon>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-modal {
      position: fixed;
      top: 0;
      left: 0;
      width:  100%;
      height:  100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }

    .preview-header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      padding: 0 24px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      z-index: 1;

      &.has-multiple {
        justify-content: space-between;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(8px);
      }

      &:not(.has-multiple) {
        background: none;
        pointer-events: none;

        .header-right {
          pointer-events: auto;
        }
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;

        .file-name {
          font-size: 16px;
          font-weight: 500;
        }

        .file-index {
          font-size: 14px;
          opacity: 0.7;
        }
      }

      .header-right {
        display: flex;
        align-items: center;

        preview-icon {
          width: 24px;
          height: 24px;
          color: white;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;

          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .preview-content {
      flex: 1;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 0;
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      color: white;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      z-index: 2;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      &.prev {
        left: 24px;
      }

      &.next {
        right: 24px;
      }
    }

    .action-button {
      background: transparent;
      border: none;
      color: white;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      span {
        font-size: 16px;
        line-height: 1;
      }
    }

    .unknown-preview {
      color: white;
      text-align: center;

      .unknown-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
    }

    .audio-preview {
      padding: 24px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewModalComponent {
  currentState = this.previewService.previewStateSubject;

  get isVisible() {
    return this.currentState.getValue().isVisible;
  }

  get currentFile() {
    return this.currentState.getValue().currentFile;
  }

  constructor(
    private previewService: PreviewService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentState.subscribe(() => {
      this.cdr.markForCheck();
    });
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
    return this.currentState.getValue().currentIndex > 0;
  }

  canShowNext(): boolean {
    return this.currentState.getValue().currentIndex < this.currentState.getValue().files.length - 1;
  }

  getCurrentFileInfo(): string {
    const state = this.previewService.previewStateSubject.getValue();
    return `${state.currentIndex + 1} / ${state.files.length}`;
  }

  get hasMultipleFiles(): boolean {
    return (this.previewService.previewStateSubject.getValue().files?.length || 0) > 1;
  }
}
