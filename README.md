# NGX File Preview [![版本](https://img.shields.io/npm/v/@eternalheart/ngx-file-preview?color=a1b858&label=)](https://www.npmjs.com/package/@eternalheart/ngx-file-preview) [![下载量](https://img.shields.io/npm/dm/@eternalheart/ngx-file-preview?color=50a36f&label=)](https://www.npmjs.com/package/@eternalheart/ngx-file-preview) [![playground](https://img.shields.io/static/v1?label=&message=playground&color=1e8a7a)](https://wh131462.github.io/ngx-file-preview/) [![github](https://img.shields.io/github/stars/wh131462/ngx-file-preview?style=social)](https://github.com/wh131462/ngx-file-preview)

[中文](./README_CN.md) · **English**

**NGX File Preview** is a powerful Angular file preview component library that supports previewing a wide variety of file formats and offers flexible customization options, providing an efficient and user-friendly solution for developers.

## Preview Examples

### Default List View

![Default List View](assets/readme/default-list.png)

### Custom Template (Example, fully customizable)

![Custom Template](assets/readme/custom-template.png)

### Preview Effects for Different File Types

| File Type | Preview Effect                                                                                                                        |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------|
| Image     | ![Image Preview-dark](assets/readme/image-preview-dark.png) ![Image Preview-light](assets/readme/image-preview-light.png)             |
| Video     | ![Video Preview-dark](assets/readme/video-preview-dark.png) ![Video Preview-light](assets/readme/video-preview-light.png)             |
| Audio     | ![Audio Preview-dark](assets/readme/audio-preview-dark.png) ![Audio Preview-light](assets/readme/audio-preview-light.png)             |
| PPT       | ![PPT Preview-dark](assets/readme/ppt-preview-dark.png) ![PPT Preview-light](assets/readme/ppt-preview-light.png)                     |
| Word      | ![Word Preview-dark](assets/readme/word-preview-dark.png) ![Word Preview-light](assets/readme/word-preview-light.png)                 |
| Excel     | ![Excel Preview-dark](assets/readme/excel-preview-dark.png) ![Excel Preview-light](assets/readme/excel-preview-light.png)             |
| Text      | ![Text Preview-dark](assets/readme/text-preview-dark.png) ![Text Preview-light](assets/readme/text-preview-light.png)                 |
| Markdown  | ![Markdown Preview-dark](assets/readme/markdown-preview-dark.png) ![Markdown Preview-light](assets/readme/markdown-preview-light.png) |
| Zip       | ![Zip Preview-dark](assets/readme/zip-preview-dark.png) ![Zip Preview-light](assets/readme/zip-preview-light.png)                     |
| Unknown   | ![Unknown Preview-dark](assets/readme/unknown-preview-dark.png) ![Unknown Preview-light](assets/readme/unknown-preview-light.png)     |

## Features

- **Support for Multiple File Formats**: Fully compatible with image, PDF, PPT, Word, Excel, text, markdown, audio, video, and many other common file types.
- **Intuitive User Experience**: Provides clear indicators for unknown file types and supports user-friendly interactions for different file formats.
- **Dark Mode and Light Mode**: Adapts to various use cases with visual preferences for both dark and light modes, including auto mode switching.
- **Flexible Usage**: Supports both directive-based and component-based usage, offering flexibility to meet different development requirements.
- **Lightweight Design**: Optimized for performance and easy integration into any project, ensuring smooth and efficient operation.
- **Keyboard Shortcut Support**: Increases efficiency by allowing easy navigation and closing of the preview with keyboard shortcuts.
- **Internationalization Support**: Built-in i18n support with easy language pack registration and switching capabilities.

## Installation

```bash
npm install @eternalheart/ngx-file-preview --save docx-preview hls.js pptx-preview xlsx ngx-extended-pdf-viewer markdown-it highlight.js
```

## Internationalization (i18n)

### Language Configuration

You can specify the language when using the directive:

```html
<div [ngxFilePreview]="file" lang="en">Click to preview</div>
```

### Register New Language Pack

Register a custom language pack using `I18nUtils.register`:

```typescript
import { I18nUtils } from '@eternalheart/ngx-file-preview';

// Register a new language pack
I18nUtils.register('fr', {
  preview: {
    error: {
      noFiles: 'Aucun fichier à afficher'
    },
    toolbar: {
      zoomIn: 'Zoom avant',
      zoomOut: 'Zoom arrière'
      // ... other translations
    }
  }
  // ... more translation keys
});
```

### Using i18n Pipe(For developers)

Use the i18n pipe in templates to translate text:

```html
{{ 'preview.toolbar.zoomIn' | i18n }}
// With parameters 
// Use ${0} as a numeric placeholder in the corresponding text. The number of placeholders is unlimited, but you must pass the corresponding number of arguments when using them.
// example: list.total ==> "共${0}个文件"
{{ 'list.total' | i18n:filesCount }}
```

## Configuration

### 1. Font Icon Configuration and Resources

Add the necessary assets , styles and scripts to your `angular.json` file:

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

### 2. Module Imports

Import the required components in your Angular module:

```typescript
import {
  PreviewDirective,
  PreviewListComponent,
  PreviewModalComponent
} from '@eternalheart/ngx-file-preview';

@Component({
  imports: [
    PreviewDirective,
    PreviewListComponent,
  ]
})
```

## Usage

### 1. Directive Method

The simplest usage method: Apply the directive directly to an element:

```typescript
import {PreviewDirective, PreviewEvent} from '@eternalheart/ngx-file-preview';

@Component({
  imports: [PreviewDirective],
  template: `
    <!-- Use themeMode to specify the display mode (dark/light). By default, it automatically switches based on time, but can also be manually toggled inside the preview page -->
    <div [ngxFilePreview]="file" themeMode="light">Click to preview a single file</div>
    <div [ngxFilePreview]="file" themeMode="dark" (previewEvent)="handlePreviewEvent($event)">Click to preview a single file</div>
    <div [ngxFilePreview]="file" themeMode="auto" [autoConfig]="{dark: {start: 19, end: 7}}">Click to preview a single file</div>
    <!-- Different trigger methods -->
    <div [ngxFilePreview]="files" trigger="contextmenu">Right click to preview files</div>
    <div [ngxFilePreview]="files" trigger="dblclick">Double click to preview files</div>
    <div [ngxFilePreview]="files" trigger="longpress:800">Long press to preview files</div>
    <div [ngxFilePreview]="files" trigger="hover:500">Hover to preview files</div>
    <div [ngxFilePreview]="files" trigger="keydown:Enter" tabindex="0">Press Enter to preview files</div>
    <div [ngxFilePreview]="files" trigger="click,contextmenu,hover:500">Multiple trigger methods to preview files</div>
    <div [ngxFilePreview]="files">Click to preview multiple files</div>
  `
})
export class YourComponent {
  file: PreviewFile = {
    name: 'example.jpg',
    type: 'image',
    url: 'path/to/file.jpg'
  };

  files: PreviewFile[] = [
    // ... file array
  ];

  handlePreviewEvent(event: PreviewEvent) {
    const {type, message, event: targetEvent} = event;
    if (type === "error") {
      console.log(message); // Handle error event
    }
    if (type === "select") {
      console.log(targetEvent); // Handle file selection event
    }
  }
}
```

### 2. Component Method

#### Using the Default List Template:

```typescript
import {PreviewListComponent} from '@eternalheart/ngx-file-preview';

@Component({
  imports: [PreviewListComponent],
  template: `
    <ngx-preview-list [files]="files" (fileSelect)="onFileSelect($event)">
    </ngx-preview-list>
  `
})
```

#### Using a Custom Template:

```typescript
@Component({
  template: `
    <ngx-preview-list [files]="files">
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
    </ngx-preview-list>
  `
})
```

## File Configuration

### `PreviewFile` Interface

```typescript
interface PreviewFile {
  url: string;          // File URL
  name: string;         // File name
  type?: PreviewType;    // File type - Not nessary
  size?: number;        // File size (optional)
  lastModified?: number;// Last modified time (optional)
  coverUrl?: string;    // Cover image URL (for video/audio, optional)
}
```

### Supported File Types (`PreviewType`)

```typescript
type PreviewType =
  | 'image'   // Image
  | 'pdf'     // PDF Document
  | 'ppt'     // PPT Presentation
  | 'word'    // Word Document
  | 'txt'     // Text File
  | 'video'   // Video
  | 'excel'   // Excel Spreadsheet
  | 'audio'   // Audio
  | 'zip'     // Compressed File
  | 'unknown' // Unknown Type
```

## API Reference

### PreviewListComponent

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| files | PreviewFile[] | [] | List of files to preview |
| themeMode | 'light' \| 'dark' \| 'auto' | 'auto' | Theme mode for the preview |
| autoConfig | { dark: { start: number, end: number } } | { dark: { start: 19, end: 7 } } | Auto theme mode configuration |
| lang | string | 'zh' | Internationalization language setting, 'zh' and 'en' are registered by default |
| (fileSelect) | EventEmitter<PreviewFile> | - | Event emitted when a file is selected |
| (previewEvent) | EventEmitter<PreviewEvent> | - | Event emitted during preview actions |

#### Template Context Variables

| Variable | Type | Description |
|----------|------|-------------|
| file | PreviewFile | Current file object |
| index | number | Current file index |
| type | string | File type |
| isActive | boolean | Whether the current item is selected |
| select | () => void | Method to select the current file |
| preview | () => void | Method to preview the current file |

### PreviewDirective

| Selector | Property | Type | Default | Description |
|----------|----------|------|---------|-------------|
| [ngxFilePreview] | ngxFilePreview | PreviewFile \| PreviewFile[] | - | File(s) to preview |
| | themeMode | 'light' \| 'dark' \| 'auto' | 'auto' | Theme mode for the preview |
| | autoConfig | { dark: { start: number, end: number } } | { dark: { start: 19, end: 7 } } | Auto theme mode configuration |
| | lang | string | 'zh' | Internationalization language setting, 'zh' and 'en' are registered by default |
| | trigger | string | 'click' | Preview trigger method, supports click, contextmenu, dblclick, longpress:duration (e.g., longpress:800), hover:delay (e.g., hover:500), keydown:key (e.g., keydown:Enter), multiple triggers can be separated by commas |
| | (previewEvent) | EventEmitter<PreviewEvent> | - | Event emitted during preview actions |

### PreviewEvent Types

| Event Type | Description | Event Data |
|------------|-------------|-------------|
| error | Error event | { type: 'error', message: string } |
| select | File selection event | { type: 'select', event: MouseEvent } |

## Keyboard Shortcuts

In preview mode, the following shortcuts are available:

- `←` Previous file
- `→` Next file
- `Esc` Close preview

## Development Guide

1. Clone the repository:

```bash
git clone https://github.com/wh131462/ngx-file-preview.git
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run start
```

4. Build the library:

```bash
npm run build
```

## Contribution Guidelines

Feel free to submit [Issues](https://github.com/wh131462/ngx-file-preview/issues) and [Pull Requests](https://github.com/wh131462/ngx-file-preview/pulls) to help improve this project!

## License

MIT

## Acknowledgments

This project uses the following excellent open-source libraries:

- [docx-preview](https://github.com/VolodymyrBaydalka/docx-preview) - Word document preview
- [pptx-preview](https://github.com/SheetJS/sheetjs) - PPT presentation preview
- [xlsx](https://github.com/SheetJS/sheetjs) - Excel spreadsheet preview
- [ngx-extended-pdf-viewer](https://github.com/stephanrauh/ngx-extended-pdf-viewer) - PDF document preview
- [hls.js](https://github.com/video-dev/hls.js/) - HLS video stream support
- [markdown-it](https://github.com/markdown-it/markdown-it) - Markdown support
- [highlight.js](https://github.com/highlightjs/highlight.js) - The code in Markdown is highlighted by Markdown support

We appreciate the contributions from these open-source projects to the community!
