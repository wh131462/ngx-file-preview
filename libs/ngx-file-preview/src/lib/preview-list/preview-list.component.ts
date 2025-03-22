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
import {AutoThemeConfig, PreviewEvent, PreviewFile, PreviewFileInput, PreviewTypeEnum, ThemeMode} from '../types';
import {PreviewIconComponent} from '../components';
import {PreviewDirective} from "../directives";
import {PreviewUtils} from "../utils";
import {ThemeService} from '../services';
import {timestamp} from "rxjs";

@Component({
  selector: 'ngx-preview-list',
  standalone: true,
  imports: [
    CommonModule,
    PreviewIconComponent,
    PreviewDirective
  ],
  providers: [ThemeService],
  templateUrl: 'preview-list.component.html',
  styleUrls: [
    '../styles/_theme.scss',
    'preview-list.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PreviewListComponent {

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
  @Output() previewEvent = new EventEmitter<PreviewEvent>();

  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChildren('previewTrigger') previewTriggers!: QueryList<ElementRef>;

  protected readonly PreviewTypeEnum = PreviewTypeEnum;

  constructor(private themeService: ThemeService, private elementRef: ElementRef) {
    this.themeService.bindElement(this.elementRef.nativeElement);
  }

  triggerSelect(index: number) {
    this.index = index;
    this.previewEvent.emit({type: 'select', event: this.files[index]});
  }

  triggerPreview(index: number) {
    if (this.files?.[index]) {
      // 手动触发隐藏元素的点击事件
      const triggerElement = this.previewTriggers.get(index)?.nativeElement;
      if (triggerElement) {
        triggerElement.click();
      }
    }
  }

  formatFileSize(size?: number): string {
    return PreviewUtils.formatFileSize(size);
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }
}
