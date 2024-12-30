import {Component} from '@angular/core';
import {PreviewDirective,PreviewIconComponent,PreviewFile,PreviewComponent,PreviewTypeEnum,PreviewUtils} from 'ngx-file-preview';
import { PreviewModalComponent } from 'ngx-file-preview';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PreviewDirective,PreviewComponent,PreviewIconComponent,PreviewModalComponent],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  files:PreviewFile[] = [
    {
      url: '/assets/1732008765928_capture.png',
      type: 'image',
      name: '图片1',
      size: 1024576, // 1MB
      lastModified: Date.now()
    },
    {
      url: '/assets/啵啵鱼-87.78.pdf',
      type: 'pdf',
      name: '文档',
      size: 2048576, // 2MB
      lastModified: Date.now() - 86400000 // 一天前
    },
    {
      url: '/assets/努力拒绝精神内耗.pptx',
      type: 'ppt',
      name: '文档'
    },
    {
      url: '/assets/secret.txt',
      type: 'txt',
      name: '文档'
    },
    {
      url: '/assets/王浩的快速会议-2024-12-11-14-34-30-20241211143434.webm',
      type: 'video',
      name: '视频'
    }
    // ... 其他文件
  ];
  protected readonly PreviewTypeEnum:any = PreviewTypeEnum;

  formatFileSize(size?: number): string {
    return PreviewUtils.formatFileSize(size);
  }
}
