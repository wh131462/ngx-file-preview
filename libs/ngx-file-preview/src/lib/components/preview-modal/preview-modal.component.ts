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
      <div class="preview-modal-content" (click)="$event.stopPropagation()">
        <div class="preview-modal-content-header" [class.has-multiple]="hasMultipleFiles">
          <div class="header-left" *ngIf="hasMultipleFiles">
            <span class="file-name">{{ currentFile?.name }}</span>
            <span class="file-index">{{ getCurrentFileInfo() }}</span>
          </div>
          <div class="header-right">
            <preview-icon name="close" (click)="close()"></preview-icon>
          </div>
        </div>

        <div class="preview-modal-content-content">
          <div class="nav-button prev"
               *ngIf="canShowPrevious()"
               (click)="previous()">
            <preview-icon name="previous"></preview-icon>
          </div>

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

          <div class="nav-button next"
               *ngIf="canShowNext()"
               (click)="next()">
            <preview-icon [size]="24" name="next"></preview-icon>
          </div>
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
      background: rgba(0, 0, 0, 0.85);
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

    .preview-modal-content-header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      padding: 0 24px;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      &.has-multiple {
        justify-content: space-between;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(8px);
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
          z-index: 1;


          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .preview-modal-content-content {
      flex: 1;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.3s;

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

    body:has(.preview-modal-overlay) {
      overflow: hidden;
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
}
