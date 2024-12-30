import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ContentChild, TemplateRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewFile, PreviewTypeEnum} from '../../types/preview.types';
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
                preview: previewFile.bind(this)
              }"
            ></ng-container>
          </ng-container>

          <!-- 默认模板 -->
          <ng-template #defaultTemplate>
            <div class="file-item"
                 (click)="index=i"
                 [corePreview]="file"
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
export class PreviewComponent {
  @Input() files?: PreviewFile[];
  @Input() index = 0;
  @Output() fileSelect = new EventEmitter<PreviewFile>();

  // 接收自定义模板
  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;

  protected readonly PreviewTypeEnum = PreviewTypeEnum;

  constructor(private previewService: PreviewService) {}

  formatFileSize(size?: number): string {
    return PreviewUtils.formatFileSize(size);
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  previewFile(file: PreviewFile, index: number) {
    this.fileSelect.emit(file);
    this.previewService.open({files: this.files || [], index});
  }
}
