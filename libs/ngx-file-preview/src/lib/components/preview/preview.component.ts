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
  ViewChildren
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewEvent, PreviewFile, PreviewFileInput, PreviewTypeEnum} from '../../types/preview.types';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {PreviewDirective} from "../../directives/preview.directive";
import {PreviewUtils} from "../../utils/preview.utils";
import {ThemeService} from '../../services/theme.service';
import {AutoThemeConfig, ThemeMode} from '../../types/theme.types';

@Component({
  selector: 'ngx-file-preview',
  standalone: true,
  imports: [
    CommonModule,
    PreviewIconComponent,
    PreviewDirective
  ],
  templateUrl: 'preview.component.html',
  styleUrls: [
    '../../styles/_theme.scss',
    'preview.component.scss'
  ],
  providers: [ThemeService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewComponent implements OnInit {
  private _files: PreviewFile[] = [];
  @Input()
  get files(): PreviewFile[] {
    return this._files;
  }

  set files(value: PreviewFileInput) {
    this._files = PreviewUtils.normalizeFiles(value);
  }

  @Input() index = 0;
  @Input() themeMode: ThemeMode = 'auto';
  @Input() autoConfig?: AutoThemeConfig;
  @Output() previewEvent = new EventEmitter<PreviewEvent>();

  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChildren('previewTrigger') previewTriggers!: QueryList<ElementRef>;

  protected readonly PreviewTypeEnum = PreviewTypeEnum;

  constructor(private themeService: ThemeService) {
  }

  ngOnInit() {
    this.themeService.setMode(this.themeMode);
    if (this.themeMode === 'auto' && this.autoConfig) {
      this.themeService.setAutoConfig(this.autoConfig);
    }
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
