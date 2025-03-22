import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit, ViewEncapsulation
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewService, ThemeService} from '../../services';
import {
  ArchivePreviewComponent,
  AudioPreviewComponent,
  ExcelPreviewComponent,
  ImagePreviewComponent, MarkdownPreviewComponent,
  PdfPreviewComponent,
  PptPreviewComponent,
  TextPreviewComponent,
  UnknownPreviewComponent,
  VideoPreviewComponent,
  WordPreviewComponent
} from '../../preview-types';
import {PreviewIconComponent} from '../preview-icon';
import {Observable, Subscription} from 'rxjs';
import {AutoThemeConfig, PreviewFile, ThemeMode} from '../../types';
import {ThemeIconComponent} from "../theme-icon/theme-icon.component";

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
    UnknownPreviewComponent,
    MarkdownPreviewComponent,
    ThemeIconComponent
  ],
  templateUrl: 'preview-modal.component.html',
  styleUrls: [
    '../../styles/_theme.scss',
    'preview-modal.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PreviewModalComponent implements OnInit, OnDestroy {
  @Input() file!: PreviewFile;
  @Input({transform: (value: ThemeMode | null): ThemeMode => value!}) themeMode!: ThemeMode;
  @Input() autoThemeConfig?: AutoThemeConfig;

  isVisible = false;
  currentFile?: PreviewFile;
  private state$ = this.previewService.getStateObservable();
  isControlsVisible = true;
  private controlsTimeout?: number;
  private readonly HIDE_DELAY = 2000;
  theme$!: Observable<ThemeMode>;
  private subscription?: Subscription;

  constructor(private cdr: ChangeDetectorRef, private themeService: ThemeService, private previewService: PreviewService) {
  }

  ngOnInit() {
    this.subscription = this.state$.subscribe(state => {
      this.isVisible = state.isVisible;
      this.currentFile = state.currentFile;
      this.cdr.markForCheck();
    });

    this.themeService.setMode(this.themeMode);
    this.theme$ = this.themeService.getThemeObservable()
    this.subscription.add(this.theme$.subscribe(theme => this.themeMode = theme))
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
    const state = this.previewService.state;
    return state.currentIndex > 0;
  }

  canShowNext(): boolean {
    const state = this.previewService.state;
    return state.currentIndex < state.files.length - 1;
  }

  getCurrentFileInfo(): string {
    const state = this.previewService.state;
    return `${state.currentIndex + 1} / ${state.files.length}`;
  }

  get hasMultipleFiles(): boolean {
    const state = this.previewService.state;
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
