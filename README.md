# NGX File Preview

一个功能强大的 Angular 文件预览组件库,支持多种文件格式的预览,提供灵活的自定义选项。

## 特性

- 🎯 支持多种文件格式预览 (图片、PDF、PPT、Word、文本、视频等)
- 🎨 提供默认样式,也支持完全自定义
- 💪 支持指令和组件两种使用方式
- 🚀 轻量级,易于集成
- 📱 响应式设计,支持移动端
- ⌨️ 支持键盘快捷操作

## 安装
```bash
npm install ngx-file-preview --save
```
## 字体文件导入

为了确保组件库中的图标和字体样式正常显示，请在 `angular.json` 文件中进行必要的配置。以下是一个示例：

在 `angular.json` 文件中，找到 `styles` 数组，并添加字体文件路径,在 `scripts` 数组中添加颜色字体文件脚本路径：
```json
"styles": [
  "node_modules/ngx-file-preview/assets/icon/font/iconfont.css",
],
"scripts": [
  "node_modules/ngx-file-preview/assets/icon/color/iconfont.js"
]
```


## 使用方法

### 1. 指令方式
```typescript
import { PreviewDirective } from 'ngx-file-preview';
@Component({
imports: [PreviewDirective]
})
```
```html
<div [corePreview]="files">预览文件</div>
```

### 2. 组件方式
```typescript
import { PreviewComponent } from 'ngx-file-preview';
@Component({
imports: [PreviewComponent]
})
```
```html
<!-- 使用默认模板 -->
<ngx-file-preview [files]="files"></ngx-file-preview>
<!-- 使用自定义模板 -->
<ngx-file-preview [files]="files">
<ng-template #itemTemplate let-file let-index="index">
<!-- 自定义文件项模板 -->
</ng-template>
</ngx-file-preview>
```


## 文件配置
```typescript
interface PreviewFile {
url: string; // 文件URL
type: PreviewType; // 文件类型
name: string; // 文件名
size?: number; // 文件大小
lastModified?: number;// 最后修改时间
}
```

支持的文件类型:
- image (图片)
- pdf 
- ppt
- word
- txt (文本)
- video (视频)
- excel
- audio
- zip
- other

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

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目!

## License

MIT