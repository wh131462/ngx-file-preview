import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewEncapsulation
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
import {Observable, Subscription} from 'rxjs';
import {PreviewFile} from '../../types/preview.types';
import {AudioPreviewComponent} from "../audio-preview/audio-preview.component";
import {UnknownPreviewComponent} from "../unknown-preview/unknown-preview.component";
import {ThemeService} from '../../services/theme.service';
import {AutoThemeConfig, ThemeMode} from "../../types/theme.types";
import {PreviewBaseComponent} from '../base/preview-base.component';

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
  providers: [ThemeService],
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
            <div class="theme-toggle" (click)="toggleTheme()">
              <svg *ngIf="(theme$|async)=='light'" width="20px" height="20px" viewBox="0 0 24 24">
                <path fill="currentColor"
                      d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
              </svg>
              <svg *ngIf="(theme$|async)=='dark'" width="20px" height="20px" viewBox="0 0 24 24">
                <path fill="currentColor"
                      d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9s9-4.03 9-9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26a5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
              </svg>
            </div>
            <preview-icon name="close" [themeMode]="theme$|async" (click)="close()"></preview-icon>
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
  styleUrls: [
    '../../styles/_theme.scss',
    'preview-modal.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PreviewModalComponent extends PreviewBaseComponent implements OnInit, OnDestroy {
  @Input() themeMode: ThemeMode = 'auto';
  @Input() autoThemeConfig?: AutoThemeConfig;

  isVisible = false;
  currentFile?: PreviewFile;
  private subscription?: Subscription;
  private state$ = this.previewService.previewState$;
  isControlsVisible = true;
  private controlsTimeout?: number;
  private readonly HIDE_DELAY = 2000;
  theme$!: Observable<'dark' | 'light'>;

  constructor(
    private previewService: PreviewService,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService,
  ) {
    super();
  }

  ngOnInit() {
    this.subscription = this.state$.subscribe(state => {
      this.isVisible = state.isVisible;
      this.currentFile = state.currentFile;
      this.cdr.markForCheck();
    });

    this.themeService.setMode(this.themeMode);
    this.theme$ = this.themeService.currentTheme$
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    if (this.controlsTimeout) {
      window.clearTimeout(this.controlsTimeout);
    }
    if (window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      prefersDark.removeEventListener('change', () => {
      });
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

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
