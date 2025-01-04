import {Component} from '@angular/core';
import {PreviewComponent, PreviewDirective, PreviewIconComponent,PreviewEvent} from '@eternalheart/ngx-file-preview';
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PreviewDirective, PreviewComponent, PreviewIconComponent, NgForOf, NgIf],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  files: File[] = []; // 文件列表
  isDragging = false;

  sourceCodeVisible = false;
  sourceCode = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files = [...this.files, ...Array.from(input.files)]
    }
  }

  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }

  deleteFile(i: number) {
    this.files.splice(i, 1);
    this.files = [...this.files]
  }

  onDrop(event: DragEvent) {
    event.preventDefault()
    this.files = [...this.files, ...Array.from(event.dataTransfer?.files || [])];
    this.isDragging = false;
  }

  setDragging(isDragging: boolean, e: DragEvent) {
    e.preventDefault()
    this.isDragging = isDragging;
  }


  // 显示源码
  showSourceCode(type: string) {
    let code = '';
    if (type === 'directive') {
      code = `
        <div class="directive" [ngxFilePreview]="files" themeMode="light">点击预览文件</div>
      `;
    } else if (type === 'component') {
      code = `
        <ngx-file-preview
          [files]="files"
          themeMode="auto"
          [autoConfig]="{dark: { start: 18, end: 6 }}"
        ></ngx-file-preview>
      `;
    } else if (type === 'custom') {
      code = `
        <ngx-file-preview [files]="files" themeMode="light">
          <ng-template
            #itemTemplate
            let-file
            let-index="index"
            let-isActive="isActive"
            let-select="select"
            let-preview="preview"
          >
            <div class="custom-file-item" [class.active]="isActive" (click)="select()">
              <div class="custom-icon">
                <preview-icon [svg]="file.type" [size]="'32px'"></preview-icon>
              </div>
              <div class="custom-info">
                <h3>{{ file.name }}</h3>
                <p>
                  <span>{{ file.type }}</span>
                  <span>{{ formatFileSize(file.size) }}</span>
                </p>
              </div>
              <button class="custom-preview-btn" (click)="preview()">
                预览
              </button>
            </div>
          </ng-template>
        </ngx-file-preview>
      `;
    }

    this.sourceCode = code;
    this.sourceCodeVisible = true;
  }

  // 关闭源码弹窗
  closeSourceCode() {
    this.sourceCodeVisible = false;
  }

  handleError(event: PreviewEvent) {
    if (event.type === 'error') {
      alert(event.message)
    }
  }
}
