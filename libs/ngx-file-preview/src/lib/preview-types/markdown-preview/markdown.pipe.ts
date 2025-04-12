import {Pipe, PipeTransform} from '@angular/core';
import MarkdownIt from 'markdown-it';
import hljs from "highlight.js"

import {DomSanitizer} from '@angular/platform-browser';

@Pipe({name: 'markdown', standalone: true})
export class MarkdownPipe implements PipeTransform {
  private md: MarkdownIt;

  constructor(private sanitizer: DomSanitizer) {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, {language: lang}).value;
          } catch (__) {
          }
        }
        return ''; // use external default escaping
      }
    }); // 初始化 markdown-it 实例
  }

  transform(value: string): any {
    if (!value) return '';
    const html = this.md.render(value); // 解析 Markdown 为 HTML
    return this.sanitizer.bypassSecurityTrustHtml(html); // 信任 HTML 内容
  }
}
