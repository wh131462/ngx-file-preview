# NGX File Preview

一个功能强大的 Angular 文件预览组件库，支持多种文件格式的预览，提供灵活的自定义选项。

## 预览效果

### 默认列表视图
![默认列表视图](assets/readme/default-list.png)

### 自定义模板(仅示例,可自由定义)
![自定义模板](assets/readme/custom-template.png)

### 各类型文件预览效果

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

🎯 支持多种文件格式预览：全面兼容图片、PDF、PPT、Word、文本、视频等常见文件类型。
👬🏻 友好的交互体验：提示未知文件类型，对不同的文件类型提供友好的交互操作。
🎨 暗黑模式与浅色模式：满足不同使用场景的视觉需求。
💪 多样化使用方式：同时支持指令式和组件式调用，灵活适配开发需求。
🚀 轻量化设计：高效性能，轻松集成到各类项目中。
⌨️ 键盘快捷操作支持：提升操作效率，让使用更加顺畅。

## 安装
```bash
npm install @eternalheart/ngx-file-preview --save docx-preview hls.js ng2-pdf-viewer pptx-preview xlsx
```

## 配置

### 1. 字体图标配置

在 `angular.json` 文件中添加必要的样式和脚本：

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
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

在需要使用的模块中导入相关组件：

```typescript
import { 
  PreviewDirective, 
  PreviewComponent, 
  PreviewModalComponent 
} from '@eternalheart/ngx-file-preview';

@Component({
  // ... 其他配置
  imports: [
    PreviewDirective,
    PreviewComponent,
  ]
})
```

## 使用方法

### 1. 指令方式

最简单的使用方式，直接在元素上添加指令：

```typescript
import {PreviewDirective,PreviewEvent} from '@eternalheart/ngx-file-preview';

@Component({
  imports: [PreviewDirective],
  template: `
    <!--可以通过themeMode指定组件显示暗黑模式/浅色模式 默认按时间自动切换模式 也可以在预览页面内切换模式 -->
    <!--浅色模式-->
    <div [ngxFilePreview]="file" themeMode="light">点击预览单个文件</div>
    <!--暗黑模式-->
    <div [ngxFilePreview]="file" themeMode="dark" (previewEvent)="handlePreviewEvent($event)">点击预览单个文件</div>
    <!--自动切换主题(可以自定义切换暗黑模式的时间段)-->
    <div [ngxFilePreview]="file" themeMode="auto" [autoConfig]="{dark: {
    start: 19,
    end: 7
  }}">点击预览单个文件</div>
    <!--预览文件列表-->
    <div [ngxFilePreview]="files">点击预览多个文件</div>
  `
})
export class YourComponent {
  // 支持多种文件传入的方式
  // 1. 单个文件或者文件列表都支持
  // 2. 列表或者文件的类型支持:文件地址/文件对象/标准PreviewFile对象
  file: PreviewFile = {
    name: 'example.jpg',
    type: 'image',
    url: 'path/to/file.jpg'
  };
 
  files: PreviewFile[] = [
    // ... 文件数组
  ];

  handlePreviewEvent(event: PreviewEvent) {
    const {type, message, event:targetEvent} = event;
    if(type==="error"){
      // 一些报错提示会以error事件传递出来,如非法操作
      console.log(message);
    }
    if(type==="select"){
      // 选中事件会以select事件传出,event(当前别名targetEvent)是对应的文件对象
      // 注意: 可能和传入的原文件或者对象不同 返回的对象类型为PreviewFile
      console.log(targetEvent);
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
    <!--主题切换与指令的设置方式相同-->
    <ngx-file-preview 
      [files]="files"
      (fileSelect)="onFileSelect($event)">
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

### PreviewFile 接口
```typescript
interface PreviewFile {
  url: string;          // 文件URL
  type: PreviewType;    // 文件类型
  name: string;         // 文件名
  size?: number;        // 文件大小（可选）
  lastModified?: number;// 最后修改时间（可选）
  coverUrl?: string;    // 封面图URL（视频/音频可用，可选）
}
```

### 支持的文件类型 (PreviewType)
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

预览模式下支持以下快捷键：

- `←` 上一个文件
- `→` 下一个文件
- `Esc` 关闭预览

## 开发指南

1. 克隆项目
```bash
git clone https://github.com/wh131462/ngx-file-preview.git
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run start
```

4. 构建库
```bash
npm run build
```

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

## License

MIT

## 鸣谢

本项目使用了以下优秀的开源项目：

### 文档预览
- [docx-preview](https://github.com/VolodymyrBaydalka/docx-preview) - Word文档预览
- [pptx-preview](https://github.com/SheetJS/sheetjs) - PPT演示文稿预览
- [xlsx](https://github.com/SheetJS/sheetjs) - Excel表格预览
- [ng2-pdf-viewer](https://github.com/VadimDez/ng2-pdf-viewer) - PDF文档预览

### 媒体播放
- [hls.js](https://github.com/video-dev/hls.js/) - HLS视频流播放支持

感谢这些项目的贡献者们为开源社区作出的贡献！

## 依赖说明

```json
{
  "dependencies": {
    "docx-preview": "^0.3.3",
    "hls.js": "^1.4.12",
    "ng2-pdf-viewer": "^10.0.0",
    "pptx-preview": "^1.0.1",
    "xlsx": "^0.18.5"
  }
}
```

这些依赖项需要在安装 ngx-file-preview 的时候同步安装。如果您的项目中已经包含了某些依赖，可以根据需要手动管理版本。
