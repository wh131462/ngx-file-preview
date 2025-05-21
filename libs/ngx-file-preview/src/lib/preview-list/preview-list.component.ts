import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AutoThemeConfig, PreviewEvent, PreviewFile, PreviewFileInput, ThemeMode} from '../types';
import {PreviewIconComponent} from '../components';
import {PreviewDirective} from "../directives";
import {PreviewUtils} from "../utils";
import {PreviewService, ThemeService} from '../services';
import {I18nPipe} from "../i18n/i18n.pipe";
import {FileSizePipe} from "./file-size.pipe";

@Component({
  selector: 'ngx-preview-list',
  standalone: true,
  imports: [
    CommonModule,
    PreviewIconComponent,
    PreviewDirective,
    I18nPipe,
    FileSizePipe
  ],
  providers: [ThemeService,PreviewService],
  templateUrl: 'preview-list.component.html',
  styleUrls: [
    '../styles/_theme.scss',
    'preview-list.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PreviewListComponent {
  @Input() trigger = 'click'; // 默认触发方式
  private _files: PreviewFile[] = [];
  @Input()
  get files(): PreviewFile[] {
    return this._files;
  }
  set files(value: PreviewFileInput) {
    this._files = PreviewUtils.normalizeFiles(value);
  }

  @Input() index = 0;
  private _themeMode: ThemeMode = 'auto';
  @Input()
  get themeMode(): ThemeMode {
    return this._themeMode;
  }
  set themeMode(value: ThemeMode) {
    this._themeMode = value;
    this.themeService.setMode(this._themeMode);
    if (this._themeMode === 'auto' && this.autoConfig) {
      this.themeService.setAutoConfig(this.autoConfig);
    }
  }
  @Input() autoConfig?: AutoThemeConfig;
  private _lang:string = 'zh'
  @Input()
  get lang(): string {
    return this._lang;
  }
  set lang(value: string) {
    this._lang = value;
    this.previewService.setLang(value)
  }
  @Output() previewEvent = new EventEmitter<PreviewEvent>();
  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChildren('previewTrigger') previewTriggers!: QueryList<ElementRef>;

  constructor(private themeService: ThemeService,public previewService:PreviewService,private elementRef: ElementRef) {
    this.themeService.bindElement(this.elementRef.nativeElement);
  }

  triggerSelect(index: number) {
    this.index = index;
    this.previewEvent.emit({type: 'select', event: this.files[index]});
  }
}
