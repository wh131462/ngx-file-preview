import {Component} from '@angular/core';
import {
  PreviewDirective,
  PreviewIconComponent,
  PreviewFile,
  PreviewComponent,
  PreviewTypeEnum,
  PreviewUtils
} from 'ngx-file-preview';
import {PreviewModalComponent} from 'ngx-file-preview';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PreviewDirective, PreviewComponent, PreviewIconComponent, PreviewModalComponent],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  files: PreviewFile[] = [
    {
      name: '1_15488489006934.mp4',
      type: 'video',
      size: 1024, // 可以替换为实际文件大小
      url: 'assets/1_15488489006934.mp4'
    },
    {
      name: 'Cursor Mac Installer (241222ooktny8mh).zip',
      type: 'zip',
      size: 2048, // 可以替换为实际文件大小
      url: 'assets/Cursor Mac Installer (241222ooktny8mh).zip'
    },
    {
      name: 'Figma.dmg',
      type: 'unknown',
      size: 512, // 可以替换为实际文件大小
      url: 'assets/Figma.dmg'
    },
    {
      name: 'high_tick.mp3',
      type: 'audio',
      size: 1024, // 可以替换为实际文件大小
      url: 'assets/high_tick.mp3'
    },
    {
      name: 'logo.png',
      type: 'image',
      size: 512, // 可以替换为实际文件大小
      url: 'assets/logo.png'
    },
    {
      name: 'README.md',
      type: 'txt',
      size: 1024, // 可以替换为实际文件大小
      url: 'assets/README.md'
    },
    {
      name: '演示文稿1.pptx',
      type: 'ppt',
      size: 1024, // 可以替换为实际文件大小
      url: 'assets/演示文稿1.pptx'
    },
    {
      name: '工作簿1.xlsx',
      type: 'excel',
      size: 1024, // 可以替换为实际文件大小
      url: 'assets/工作簿1.xlsx'
    },
    {
      name: 'dsadasdasdasds.docx',
      type: 'word',
      size: 1024, // 可以替换为实际文件大小
      url: 'assets/dsadasdasdasds.docx'
    },
  ];
  protected readonly PreviewTypeEnum: any = PreviewTypeEnum;

  formatFileSize(size?: number): string {
    return PreviewUtils.formatFileSize(size);
  }
}
