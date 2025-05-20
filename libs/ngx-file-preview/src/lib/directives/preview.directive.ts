import {
  Directive,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import {FileReaderService, PreviewService, ThemeService} from '../services';
import {AutoThemeConfig, PreviewEvent, PreviewFileInput, ThemeMode} from '../types';
import {PreviewUtils} from '../utils';


/**
 * 所有依赖服务 都是指令级别的
 * directive -> modal -> preview
 */
@Directive({
  selector: '[ngxFilePreview]',
  standalone: true,
  providers: [PreviewService, ThemeService, FileReaderService]
})
export class PreviewDirective implements OnDestroy {
  @Input('ngxFilePreview') fileInput: PreviewFileInput;
  @Input() previewIndex = 0;
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


  @Input() doubleClick: boolean = false;

  t(key: string, ...args: (string | number)[]) {
    return this.previewService?.getLangParser()?.t(key, ...args);
  }

  constructor(private previewService: PreviewService,private themeService: ThemeService, private injector: Injector, private envInjector: EnvironmentInjector) {
    this.previewService.init(this.injector, this.envInjector);
  }

  @HostListener('click',['$event'])
  onClick(e:MouseEvent) {
    e.preventDefault()
    e.stopImmediatePropagation();
    if (!this.doubleClick) {
      this.clickHandler();
    }
  }

  @HostListener('dblclick', ['$event'])
  handleDoubleClick(e: MouseEvent) {
    e.preventDefault()
    e.stopImmediatePropagation();
    if (this.doubleClick) {
      this.clickHandler();
    }
  }

  private clickHandler():void {
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
