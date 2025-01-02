import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ContentChild, TemplateRef, ViewChildren, QueryList, ElementRef, AfterViewInit, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewFile, PreviewTypeEnum, PreviewType} from '../../types/preview.types';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {PreviewDirective} from "../../directives/preview.directive";
import {PreviewUtils} from "../../utils/preview.utils";
import { ThemeService } from '../../services/theme.service';
import { ThemeMode, AutoThemeConfig } from '../../types/theme.types';

@Component({
  selector: 'ngx-file-preview',
  standalone: true,
  imports: [
    CommonModule,
    PreviewIconComponent,
    PreviewDirective
  ],
  template: `
    <div class="preview-list">
      <!-- 隐藏的预览触发器 -->
      <div *ngIf="itemTemplate" style="display: none">
        <div *ngFor="let file of files; let i = index"
             [ngxFilePreview]="file"
             [themeMode]="themeMode"
             [attr.data-index]="i"
             #previewTrigger>
        </div>
      </div>
      <ng-content></ng-content>
      <div class="file-list-header">
        <span>文件列表</span>
        <span class="file-count">共 {{ files?.length || 0 }} 个文件</span>
      </div>
      <div class="file-list">
        <ng-container *ngFor="let file of files; let i = index">
          <!-- 使用自定义模板 -->
          <ng-container *ngIf="itemTemplate; else defaultTemplate">
            <ng-container
              [ngTemplateOutlet]="itemTemplate"
              [ngTemplateOutletContext]="{
                $implicit: file,
                index: i,
                isActive: i === index,
                themeMode: themeMode,
                preview: triggerPreview.bind(this,i)
              }"
            ></ng-container>
          </ng-container>

          <!-- 默认模板 -->
          <ng-template #defaultTemplate>
            <div class="file-item"
                 (click)="index=i"
                 [ngxFilePreview]="file"
                 [themeMode]="themeMode"
                 [class.active]="i === index">
              <span class="file-icon">
                <preview-icon [size]="40" [svg]="file.type"></preview-icon>
              </span>
              <div class="file-info">
                <div class="file-main-info">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
                <div class="file-sub-info">
                  <span class="file-type">{{ PreviewTypeEnum[file.type] }}</span>
                  <span class="file-date" *ngIf="file.lastModified">
                    {{ formatDate(file.lastModified) }}
                  </span>
                </div>
              </div>
            </div>
          </ng-template>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: [
    '../../styles/_theme.scss',
    'preview.component.scss'
  ],
  providers: [ThemeService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewComponent implements OnInit {
  @Input() files?: PreviewFile[];
  @Input() index = 0;
  @Input() themeMode: ThemeMode = 'auto';
  @Input() autoConfig?: AutoThemeConfig;
  @Output() fileSelect = new EventEmitter<PreviewFile>();

  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChildren('previewTrigger') previewTriggers!: QueryList<ElementRef>;

  protected readonly PreviewTypeEnum = PreviewTypeEnum;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.setMode(this.themeMode);
    if (this.themeMode === 'auto' && this.autoConfig) {
      this.themeService.setAutoConfig(this.autoConfig);
    }
  }

  triggerPreview(index: number) {
    if (this.files?.[index]) {
      this.fileSelect.emit(this.files[index]);
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
