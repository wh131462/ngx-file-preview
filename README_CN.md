# NGX File Preview [![版本](https://img.shields.io/npm/v/@eternalheart/ngx-file-preview?color=a1b858&label=)](https://www.npmjs.com/package/@eternalheart/ngx-file-preview) [![下载量](https://img.shields.io/npm/dm/@eternalheart/ngx-file-preview?color=50a36f&label=)](https://www.npmjs.com/package/@eternalheart/ngx-file-preview) [![playground](https://img.shields.io/static/v1?label=&message=playground&color=1e8a7a)](https://wh131462.github.io/ngx-file-preview/) [![github](https://img.shields.io/github/stars/wh131462/ngx-file-preview?style=social)](https://github.com/wh131462/ngx-file-preview)
**中文** · [en](./README.md)

**NGX File Preview** 是一款功能强大的 Angular 文件预览组件库，支持多种常见文件格式的预览，并提供灵活的自定义选项，旨在为开发者提供高效、易用的文件预览解决方案。

## 预览效果

### 默认列表视图
![默认列表视图](assets/readme/default-list.png)

### 自定义模板（示例，可根据需要自定义）
![自定义模板](assets/readme/custom-template.png)

### 各文件类型预览效果

| 文件类型 | 预览效果                                                                                                    |
|---------|---------------------------------------------------------------------------------------------------------|
| 图片预览 | ![图片预览-dark](assets/readme/image-preview-dark.png) ![图片预览-light](assets/readme/image-preview-light.png) |
| 视频预览 | ![视频预览-dark](assets/readme/video-preview-dark.png) ![视频预览-light](assets/readme/video-preview-light.png) |
| 音频预览 | ![音频预览-dark](assets/readme/audio-preview-dark.png) ![音频预览-light](assets/readme/audio-preview-light.png) |
| PPT预览 | ![PPT预览-dark](assets/readme/ppt-preview-dark.png) ![PPT预览-light](assets/readme/ppt-preview-light.png) |
| Word预览 | ![Word预览-dark](assets/readme/word-preview-dark.png) ![Word预览-light](assets/readme/word-preview-light.png) |
| Excel预览 | ![Excel预览-dark](assets/readme/excel-preview-dark.png) ![Excel预览-light](assets/readme/excel-preview-light.png) |
| 文本预览 | ![文本预览-dark](assets/readme/text-preview-dark.png) ![文本预览-light](assets/readme/text-preview-light.png) |
| 压缩包预览 | ![压缩包预览-dark](assets/readme/zip-preview-dark.png) ![压缩包预览-light](assets/readme/zip-preview-light.png) |
| 未知类型 | ![未知类型-dark](assets/readme/unknown-preview-dark.png) ![未知类型-light](assets/readme/unknown-preview-light.png) |

## 特性

- **多文件格式支持**：全面支持图片、PDF、PPT、Word、文本、视频等常见文件类型的预览。
- **良好用户体验**：智能提示未知文件类型，并为不同文件提供直观友好的交互方式。
- **暗黑与浅色模式**：满足多种使用场景的视觉需求，支持自动模式切换。
- **灵活的使用方式**：支持指令式和组件式调用，适应不同开发需求。
- **高效性能**：轻量化设计，便于集成到各种项目中，保证高效流畅的使用体验。
- **快捷键支持**：提升用户操作效率，快捷切换文件和关闭预览界面。

## 安装

```bash
npm install @eternalheart/ngx-file-preview --save docx-preview hls.js pptx-preview xlsx ngx-extended-pdf-viewer
```

## 配置

### 1. 字体图标配置和资源

在 `angular.json` 文件中添加所需的样式,资源和脚本：

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "node_modules/ngx-extended-pdf-viewer/assets",
                "output": "assets"
              }
            ],
            "styles": [
              "node_modules/@eternalheart/ngx-file-preview/src/assets/icon/font/nfp.css"
            ],
            "scripts": [
              "node_modules/@eternalheart/ngx-file-preview/src/assets/icon/color/nfp.js"
            ]
          }
        }
      }
    }
  }
}
```

### 2. 模块导入

在需要使用该组件的模块中导入相关组件：

```typescript
import { 
  PreviewDirective, 
  PreviewComponent, 
  PreviewModalComponent 
} from '@eternalheart/ngx-file-preview';

@Component({
  imports: [
    PreviewDirective,
    PreviewComponent,
  ]
})
```

## 使用方法

### 1. 指令方式

最简单的使用方式：直接在元素上应用指令：

```typescript
import { PreviewDirective, PreviewEvent } from '@eternalheart/ngx-file-preview';

@Component({
  imports: [PreviewDirective],
  template: `
    <!-- 可以通过 themeMode 指定组件的显示模式（暗黑模式/浅色模式），默认按时间自动切换模式，也可以在预览页面内切换 -->
    <div [ngxFilePreview]="file" themeMode="light">点击预览单个文件</div>
    <div [ngxFilePreview]="file" themeMode="dark" (previewEvent)="handlePreviewEvent($event)">点击预览单个文件</div>
    <div [ngxFilePreview]="file" themeMode="auto" [autoConfig]="{dark: {start: 19, end: 7}}">点击预览单个文件</div>
    <div [ngxFilePreview]="files">点击预览多个文件</div>
  `
})
export class YourComponent {
  file: PreviewFile = {
    name: 'example.jpg',
    type: 'image',
    url: 'path/to/file.jpg'
  };

  files: PreviewFile[] = [
    // ... 文件数组
  ];

  handlePreviewEvent(event: PreviewEvent) {
    const { type, message, event: targetEvent } = event;
    if (type === "error") {
      console.log(message); // 处理错误事件
    }
    if (type === "select") {
      console.log(targetEvent); // 处理选择文件事件
    }
  }
}
```

### 2. 组件方式

#### 使用默认列表模板：

```typescript
import { PreviewComponent } from '@eternalheart/ngx-file-preview';

@Component({
  imports: [PreviewComponent],
  template: `
    <ngx-file-preview [files]="files" (fileSelect)="onFileSelect($event)">
    </ngx-file-preview>
  `
})
```

#### 使用自定义模板：

```typescript
@Component({
  template: `
    <ngx-file-preview [files]="files">
      <ng-template #itemTemplate 
                   let-file 
                   let-index="index"
                   let-isActive="isActive"
                   let-preview="preview">
        <div class="custom-item" 
             [class.active]="isActive"
             (click)="preview()">
          <span>{{ file.name }}</span>
          <span>{{ formatFileSize(file.size) }}</span>
        </div>
      </ng-template>
    </ngx-file-preview>
  `
})
```

## 文件配置

### `PreviewFile` 接口

```typescript
interface PreviewFile {
  url: string;          // 文件URL
  name: string;         // 文件名
  type?: PreviewType;    // 文件类型 - 非必要 会自己推断
  size?: number;        // 文件大小（可选）
  lastModified?: number;// 最后修改时间（可选）
  coverUrl?: string;    // 封面图URL（适用于视频/音频，可选）
}
```

### 支持的文件类型 (`PreviewType`)

```typescript
type PreviewType = 
  | 'image'   // 图片
  | 'pdf'     // PDF文档
  | 'ppt'     // PPT演示文稿
  | 'word'    // Word文档
  | 'txt'     // 文本文件
  | 'video'   // 视频
  | 'excel'   // Excel表格
  | 'audio'   // 音频
  | 'zip'     // 压缩包
  | 'unknown' // 未知类型
```

## 键盘快捷键

在预览模式下，支持以下快捷键：

- `←` 上一个文件
- `→` 下一个文件
- `Esc` 关闭预览

## 开发指南

1. 克隆项目：

```bash
git clone https://github.com/wh131462/ngx-file-preview.git
```

2. 安装依赖：

```bash
npm

 install
```

3. 启动开发服务器：

```bash
npm run start
```

4. 构建库：

```bash
npm run build
```

## 贡献指南

欢迎提交 [Issue](https://github.com/wh131462/ngx-file-preview/issues) 和 [Pull Request](https://github.com/wh131462/ngx-file-preview/pulls)，帮助我们改进该项目！

## License

MIT

## 鸣谢

本项目使用了以下优秀的开源项目：

- [docx-preview](https://github.com/VolodymyrBaydalka/docx-preview) - Word文档预览
- [pptx-preview](https://github.com/SheetJS/sheetjs) - PPT演示文稿预览
- [xlsx](https://github.com/SheetJS/sheetjs) - Excel表格预览
- [ngx-extended-pdf-viewer](https://github.com/stephanrauh/ngx-extended-pdf-viewer) - PDF文档预览
- [hls.js](https://github.com/video-dev/hls.js/) - HLS视频流播放支持

感谢这些项目的贡献者们为开源社区作出的贡献！
