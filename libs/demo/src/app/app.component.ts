import {Component} from '@angular/core';
import {
  PreviewDirective,
  PreviewEvent,
  PreviewFile,
  PreviewListComponent,
  ThemeIconComponent,
  ThemeMode,
  version
} from '@eternalheart/ngx-file-preview';
import {NgForOf, NgIf} from "@angular/common";
import {HighlightCodeDirective} from "./highlight.directive";
import {ApiTableComponent} from "./api-table.component";
import {NzTabsModule} from "ng-zorro-antd/tabs";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PreviewDirective, PreviewListComponent, NgForOf, NgIf, HighlightCodeDirective, ThemeIconComponent, ApiTableComponent, NzTabsModule],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  version = version;
  files: (Partial<PreviewFile> | File)[] = [];
  isDragging = false;
  currentLang: 'zh' | 'en' = 'zh';

  sourceCodeVisible = false;
  sourceCode = '';

  // 页面文本的多语言配置
  i18nText = {
    zh: {
      uploadText: '点击或者拖拽文件至此开始预览',
      directiveTab: '指令预览模式',
      componentTab: '组件预览模式',
      basicUsage: '基础用法',
      i18nDemo: '国际化',
      defaultTemplate: '默认模板',
      customTemplate: '自定义模板',
      viewSourceCode: '查看源码',
      previewButton: '预览',
      sourceCodeTitle: '源码'
    },
    en: {
      uploadText: 'Click or drag files here to preview',
      directiveTab: 'Directive Preview Mode',
      componentTab: 'Component Preview Mode',
      basicUsage: 'Basic Usage',
      i18nDemo: 'Internationalization',
      defaultTemplate: 'Default Template',
      customTemplate: 'Custom Template',
      viewSourceCode: 'View Source Code',
      previewButton: 'Preview',
      sourceCodeTitle: 'Source Code'
    }
  };

  directiveTheme: ThemeMode = "light";
  directiveI18nTheme: ThemeMode = "dark";

  // API文档数据
  directiveApiItems = {
    zh: [
      {name: 'ngxFilePreview', description: '需要预览的文件列表', type: 'PreviewFile[] | File[]', default: '[]'},
      {name: 'themeMode', description: '主题模式', type: '"light" | "dark" | "auto"', default: '"light"'},
      {name: 'lang', description: '国际化语言', type: '"zh" | "en"', default: '"zh"'},
      {name: 'previewEvent', description: '预览事件回调', type: 'EventEmitter<PreviewEvent>', default: '-'}
    ],
    en: [
      {name: 'ngxFilePreview', description: 'Files to preview', type: 'PreviewFile[] | File[]', default: '[]'},
      {name: 'themeMode', description: 'Theme mode', type: '"light" | "dark" | "auto"', default: '"light"'},
      {name: 'lang', description: 'Language', type: '"zh" | "en"', default: '"zh"'},
      {name: 'previewEvent', description: 'Preview event callback', type: 'EventEmitter<PreviewEvent>', default: '-'}
    ]
  };

  componentApiItems = {
    zh: [
      {name: 'files', description: '需要预览的文件列表', type: 'PreviewFile[] | File[]', default: '[]'},
      {name: 'themeMode', description: '主题模式', type: '"light" | "dark" | "auto"', default: '"light"'},
      {name: 'lang', description: '国际化语言', type: '"zh" | "en"', default: '"zh"'},
      {
        name: 'autoConfig',
        description: '自动切换主题配置',
        type: '{ dark: { start: number, end: number } }',
        default: '-'
      },
      {name: 'itemTemplate', description: '自定义列表项模板', type: 'TemplateRef', default: '-'}
    ],
    en: [
      {name: 'files', description: 'Files to preview', type: 'PreviewFile[] | File[]', default: '[]'},
      {name: 'themeMode', description: 'Theme mode', type: '"light" | "dark" | "auto"', default: '"light"'},
      {name: 'lang', description: 'Language', type: '"zh" | "en"', default: '"zh"'},
      {
        name: 'autoConfig',
        description: 'Auto theme switch config',
        type: '{ dark: { start: number, end: number } }',
        default: '-'
      },
      {name: 'itemTemplate', description: 'Custom list item template', type: 'TemplateRef', default: '-'}
    ]
  };

  constructor(private messageService: NzMessageService) {
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && Array.isArray(this.files)) {
      this.files = [...this.files, ...Array.from(input.files)]
    }
  }

  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }

  deleteFile(i: number) {
    if (Array.isArray(this.files)) {
      this.files.splice(i, 1);
      this.files = [...this.files]
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault()
    if (Array.isArray(this.files)) {
      this.files = [...this.files, ...Array.from(event.dataTransfer?.files || [])];
      this.isDragging = false;
    }
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
        <ngx-preview-list
          [files]="files"
          themeMode="auto"
          [autoConfig]="{dark: { start: 18, end: 6 }}"
        ></ngx-preview-list>
      `;
    } else if (type === 'custom') {
      code = `
        <ngx-preview-list [files]="files" themeMode="light">
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
        </ngx-preview-list>
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
      this.messageService.create('error', event.message ?? "");
    }
  }

  changeDirectiveTheme() {
    this.directiveTheme = this.directiveTheme === 'light' ? 'dark' : 'light';
  }

  changeDirectiveI18nTheme() {
    this.directiveI18nTheme = this.directiveI18nTheme === 'light' ? 'dark' : 'light';
  }

  changeThemeForList(list: PreviewListComponent) {
    list.themeMode = list.themeMode === 'light' ? 'dark' : 'light';
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
    // 更新所有使用了lang属性的组件
    this.directiveI18nTheme = this.directiveI18nTheme; // 触发变更检测
  }
}
