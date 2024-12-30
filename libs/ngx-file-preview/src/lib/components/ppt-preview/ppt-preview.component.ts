import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewBaseComponent } from '../base/preview-base.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'core-ppt-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ppt-container">
      <ng-container *ngIf="previewUrl">
        <iframe
          [src]="previewUrl"
          frameborder="0"
          width="100%"
          height="100%"
          allowfullscreen>
        </iframe>
      </ng-container>
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .ppt-container {
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    iframe {
      background: white;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(26, 26, 26, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid transparent;
      border-top-color: #177ddc;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PptPreviewComponent extends PreviewBaseComponent {
  previewUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {
    super();
  }

   async handleFile() {
    this.isLoading = true;

    try {
      // 使用 Office Online Viewer 或其他在线预览服务
      const viewerUrl = this.getViewerUrl(this.file.url);
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
    } catch (error) {
      console.error('PPT预览失败:', error);
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private getViewerUrl(fileUrl: string): string {
    // 1. 如果是本地部署的预览服务
    if (fileUrl.startsWith('http://localhost') || fileUrl.startsWith('https://localhost')) {
      return `${fileUrl}?preview=true`;
    }

    // 2. 使用 Office Online Viewer
    const encodedUrl = encodeURIComponent(fileUrl);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;

    // 3. 或者使用 Google Docs Viewer
    // return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
  }
}
