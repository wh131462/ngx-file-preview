import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ContentChild, TemplateRef, ViewChildren, QueryList, ElementRef, AfterViewInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewFile, PreviewTypeEnum, PreviewType} from '../../types/preview.types';
import {PreviewService} from '../../services/preview.service';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {PreviewDirective} from "../../directives/preview.directive";
import {PreviewUtils} from "../../utils/preview.utils";

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
      <div style="display: none">
        <div *ngFor="let file of files; let i = index"
             [ngxFilePreview]="file"
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
                preview: triggerPreview.bind(this,i)
              }"
            ></ng-container>
          </ng-container>

          <!-- 默认模板 -->
          <ng-template #defaultTemplate>
            <div class="file-item"
                 (click)="index=i"
                 [ngxFilePreview]="file"
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
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      'Noto Sans', sans-serif;
    }

    .file-list {
      border: 1px solid #f0f0f0;
      border-radius: 2px;
      background: #fff;
    }

    .file-list-header {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .file-count {
        color: #8c8c8c;
        font-size: 14px;
      }
    }

    .file-list-content {
      max-height: 400px;
      overflow-y: auto;
    }

    .file-item {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #fafafa;
      }

      &.active {
        background-color: #e6f7ff;
      }

      .file-icon {
        font-size: 24px;
        color: #1890ff;
      }

      .file-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .file-main-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .file-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #333;
            font-size: 14px;
            font-weight: 400;
          }

          .file-size {
            flex-shrink: 0;
            color: #8c8c8c;
            font-size: 12px;
          }
        }

        .file-sub-info {
          display: flex;
          align-items: center;
          gap: 16px;

          .file-type,
          .file-date {
            color: #8c8c8c;
            font-size: 12px;
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewComponent implements AfterViewInit {
  @Input() files?: PreviewFile[];
  @Input() index = 0;
  @Output() fileSelect = new EventEmitter<PreviewFile>();

  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChildren('previewTrigger') previewTriggers!: QueryList<ElementRef>;

  protected readonly PreviewTypeEnum = PreviewTypeEnum;

  constructor(private previewService: PreviewService) {}

  ngAfterViewInit() {
    // 初始化时确保所有触发器都已创建
    this.previewTriggers.changes.subscribe(() => {
      // 触发器列表更新时的处理
    });
  }

  selectAndPreview(index: number) {
    this.index = index;
    this.triggerPreview(index);
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

  getFileTypeText(type: PreviewType): string {
    return PreviewTypeEnum[type] || PreviewTypeEnum.unknown;
  }
}
