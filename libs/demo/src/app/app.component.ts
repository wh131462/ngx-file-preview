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
      sourceCodeTitle: '源码',
      triggerDemo: '触发方式演示',
      clickTrigger: '点击触发',
      clickPreview: '点击此处预览文件',
      contextmenuTrigger: '右键菜单触发',
      contextmenuPreview: '右键点击此处预览文件',
      dblclickTrigger: '双击触发',
      dblclickPreview: '双击此处预览文件',
      longpressTrigger: '长按触发 (800ms)',
      longpressPreview: '长按此处预览文件',
      hoverTrigger: '悬停触发 (500ms)',
      hoverPreview: '将鼠标悬停在此处预览文件',
      keydownTrigger: '按键触发 (Enter)',
      keydownPreview: '聚焦此处并按Enter键预览文件',
      combineTrigger: '组合触发 (点击+右键+悬停)',
      combinePreview: '可以通过点击、右键或悬停预览文件',
      copyCode: '复制代码',
      copySuccess: '复制成功'
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
      sourceCodeTitle: 'Source Code',
      triggerDemo: 'Trigger Demo',
      clickTrigger: 'Click Trigger',
      clickPreview: 'Click here to preview files',
      contextmenuTrigger: 'Context Menu Trigger',
      contextmenuPreview: 'Right click here to preview files',
      dblclickTrigger: 'Double Click Trigger',
      dblclickPreview: 'Double click here to preview files',
      longpressTrigger: 'Long Press Trigger (800ms)',
      longpressPreview: 'Long press here to preview files',
      hoverTrigger: 'Hover Trigger (500ms)',
      hoverPreview: 'Hover here to preview files',
      keydownTrigger: 'Keydown Trigger (Enter)',
      keydownPreview: 'Focus here and press Enter to preview files',
      combineTrigger: 'Combined Trigger (Click+Right Click+Hover)',
      combinePreview: 'Click, right click or hover to preview files',
      copyCode: 'Copy Code',
      copySuccess: 'Copied Successfully'
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
      {name: 'trigger', description: '触发预览的方式，支持click,contextmenu,dblclick,longpress:duration,hover:delay,keydown:key', type: 'string', default: '"click"'},
      {name: 'previewEvent', description: '预览事件回调', type: 'EventEmitter<PreviewEvent>', default: '-'}
    ],
    en: [
      {name: 'ngxFilePreview', description: 'Files to preview', type: 'PreviewFile[] | File[]', default: '[]'},
      {name: 'themeMode', description: 'Theme mode', type: '"light" | "dark" | "auto"', default: '"light"'},
      {name: 'lang', description: 'Language', type: '"zh" | "en"', default: '"zh"'},
      {name: 'trigger', description: 'Preview trigger method, supports click,contextmenu,dblclick,longpress:duration,hover:delay,keydown:key', type: 'string', default: '"click"'},
      {name: 'previewEvent', description: 'Preview event callback', type: 'EventEmitter<PreviewEvent>', default: '-'}
    ]
  };

  componentApiItems = {
    zh: [
      {name: 'files', description: '需要预览的文件列表', type: 'PreviewFile[] | File[]', default: '[]'},
      {name: 'themeMode', description: '主题模式', type: '"light" | "dark" | "auto"', default: '"light"'},
      {name: 'lang', description: '国际化语言', type: '"zh" | "en"', default: '"zh"'},
      {name: 'trigger', description: '触发预览的方式，支持click,contextmenu,dblclick,longpress:duration,hover:delay,keydown:key', type: 'string', default: '"click"'},
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
<div class="directive" 
     [ngxFilePreview]="files" 
     [themeMode]="directiveTheme" 
     (previewEvent)="handleError($event)">
  点击预览文件
</div>`;
    } else if (type === 'component') {
      code = `
<ngx-preview-list
  [files]="files"
  themeMode="auto"
  [autoConfig]="{dark: { start: 18, end: 6 }}"
></ngx-preview-list>`;
    } else if (type === 'custom') {
      code = `
<ngx-preview-list [files]="files" themeMode="light" [lang]="'en'">
  <ng-template
    #itemTemplate
    let-file
    let-index="index"
    let-type="type"
    let-isActive="isActive"
    let-select="select"
    let-preview="preview"
  >
    <div class="custom-file-item" [class.active]="isActive" (click)="select()">
      <div class="custom-info">
        <h3>{{ file.name }}</h3>
        <p>
          <span>{{ type }}</span>
          <span>{{ formatFileSize(file.size) }}</span>
        </p>
      </div>
      <button class="custom-preview-btn" (click)="preview()">
        预览
      </button>
    </div>
  </ng-template>
</ngx-preview-list>`;
    } else if (type === 'click') {
      code = `
<div class="directive" 
     [ngxFilePreview]="files" 
     [themeMode]="directiveTheme" 
     trigger="click">
  点击此处预览文件
</div>`;
    } else if (type === 'contextmenu') {
      code = `
<div class="directive" 
     [ngxFilePreview]="files" 
     [themeMode]="directiveTheme" 
     trigger="contextmenu">
  右键点击此处预览文件
</div>`;
    } else if (type === 'dblclick') {
      code = `
<div class="directive" 
     [ngxFilePreview]="files" 
     [themeMode]="directiveTheme" 
     trigger="dblclick">
  双击此处预览文件
</div>`;
    } else if (type === 'longpress') {
      code = `
<div class="directive" 
     [ngxFilePreview]="files" 
     [themeMode]="directiveTheme" 
     trigger="longpress:800">
  长按此处预览文件
</div>`;
    } else if (type === 'hover') {
      code = `
<div class="directive" 
     [ngxFilePreview]="files" 
     [themeMode]="directiveTheme" 
     trigger="hover:500">
  将鼠标悬停在此处预览文件
</div>`;
    } else if (type === 'keydown') {
      code = `
<div class="directive" 
     [ngxFilePreview]="files" 
     [themeMode]="directiveTheme" 
     trigger="keydown:Enter" 
     tabindex="0">
  聚焦此处并按Enter键预览文件
</div>`;
    } else if (type === 'combine') {
      code = `
<div class="directive" 
     [ngxFilePreview]="files" 
     [themeMode]="directiveTheme" 
     trigger="click,contextmenu,hover:500">
  可以通过点击、右键或悬停预览文件
</div>`;
    } else if (type === 'i18n') {
      code = `
<div class="directive" 
     [ngxFilePreview]="files" 
     [themeMode]="directiveI18nTheme" 
     [lang]="'en'" 
     (previewEvent)="handleError($event)">
  点击预览文件(English)
</div>`;
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

  copySourceCode() {
    navigator.clipboard.writeText(this.sourceCode).then(() => {
      this.messageService.success(this.i18nText[this.currentLang].copySuccess);
    });
  }
}
