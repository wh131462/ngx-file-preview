import {
  Directive,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FileReaderService, PreviewService, ThemeService } from '../services';
import { AutoThemeConfig, PreviewEvent, PreviewFileInput, ThemeMode } from '../types';
import { PreviewUtils } from '../utils';
import { fromEvent, merge, Subject, timer } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Directive({
  selector: '[ngxFilePreview]',
  standalone: true,
  providers: [PreviewService, ThemeService, FileReaderService]
})
export class PreviewDirective implements OnInit, OnDestroy {
  @Input('ngxFilePreview') fileInput: PreviewFileInput;
  @Input() previewIndex = 0;
  @Input() trigger = 'click'; // 默认触发方式
  private _themeMode: ThemeMode = 'auto';
  @Input()
  get themeMode(): ThemeMode {
    return this._themeMode;
  }

  set themeMode(value: ThemeMode) {
    this._themeMode = value;
    this.themeService.setMode(this.themeMode);
    if (this.themeMode === 'auto' && this.autoConfig) {
      this.themeService.setAutoConfig(this.autoConfig);
    }
  }
  @Input() autoConfig?: AutoThemeConfig;
  private _lang:string = 'zh';
  @Input()
  get lang(): string {
    return this._lang;
  }

  set lang(value: string) {
    this._lang = value;
    this.previewService.setLang(value);
  }
  @Output() previewEvent = new EventEmitter<PreviewEvent>();

  t(key: string, ...args: (string | number)[]) {
    return this.previewService?.getLangParser()?.t(key, ...args);
  }

  private destroy$ = new Subject<void>();
  private element: HTMLElement;
  private longPressTimer: any;
  private isLongPressing = false;

  constructor(
    private previewService: PreviewService,
    private themeService: ThemeService,
    private injector: Injector,
    private envInjector: EnvironmentInjector,
    private elementRef: ElementRef
  ) {
    this.previewService.init(this.injector, this.envInjector);
    this.element = this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.setupTriggers();
  }

  private setupTriggers() {
    const triggers = this.trigger.split(',').map(t => t.trim());
    const observables = triggers.map(trigger => {
      const [eventName, param] = trigger.split(':');
      
      switch(eventName) {
        case 'click':
          return fromEvent(this.element, 'click');
        case 'contextmenu':
          return fromEvent(this.element, 'contextmenu').pipe(
            tap(e => e.preventDefault())
          );
        case 'dblclick':
          return fromEvent(this.element, 'dblclick');
        case 'longpress':
          const duration = parseInt(param) || 800;
          return fromEvent<MouseEvent>(this.element, 'mousedown').pipe(
            switchMap(() => timer(duration).pipe(
              takeUntil(fromEvent(document, 'mouseup'))
            ))
          );
        case 'hover':
          const delay = parseInt(param) || 500;
          return fromEvent(this.element, 'mouseenter').pipe(
            switchMap(() => timer(delay).pipe(
              takeUntil(fromEvent(this.element, 'mouseleave'))
            ))
          );
        case 'keydown':
          return fromEvent<KeyboardEvent>(this.element, 'keydown').pipe(
            filter(e => !param || e.key === param)
          );
        default:
          return fromEvent(this.element, 'click');
      }
    });

    merge(...observables)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.preview());
  }

  private preview() {
    if (!this.fileInput) return;
    const files = PreviewUtils.normalizeFiles(this.fileInput);
    if (files.length > 0) {
      this.previewService.open({
        files,
        index: this.previewIndex,
        themeMode: this.themeMode,
        autoThemeConfig: this.autoConfig
      });
    } else {
      this.previewEvent.emit({type: 'error', message: this.t('preview.error.noFiles')})
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // 清理由 createObjectURL 创建的 URL
    if (this.fileInput instanceof File) {
      URL.revokeObjectURL(PreviewUtils.normalizeFile(this.fileInput).url);
    } else if (Array.isArray(this.fileInput)) {
      this.fileInput.forEach(item => {
        if (item instanceof File) {
          URL.revokeObjectURL(PreviewUtils.normalizeFile(item).url);
        }
      });
    }
  }
}
