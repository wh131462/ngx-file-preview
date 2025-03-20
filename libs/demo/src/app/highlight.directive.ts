import {AfterViewInit, Directive, ElementRef, Input, OnChanges} from '@angular/core';
import hljs from 'highlight.js';
import {DomSanitizer} from "@angular/platform-browser";

@Directive({
    selector: '[highlight]',
    standalone: true
})
export class HighlightCodeDirective implements AfterViewInit, OnChanges {
    // 接收代码内容输入
    @Input('highlight') code?: string;
    // 接收语言类型输入
    @Input() language?: string = 'html';
    @Input() lineNumbersEnabled = true;
    private currentLanguageClass?: string;

    constructor(private readonly el: ElementRef) {
    }

    ngAfterViewInit(): void {
        this.highlight();
    }

    ngOnChanges(): void {
        this.highlight();
    }

    private highlight(): void {
        const element = this.el.nativeElement as HTMLElement;
        element.removeAttribute('data-highlighted')
        // 清理旧内容
        element.textContent = this.code || element.textContent || '' ;
        // 重置语言样式
        this.cleanLanguageClass(element);
        // 设置语言类
        this.setLanguageClass(element);
        // 执行高亮
        hljs.highlightElement(element);
    }

    private cleanLanguageClass(element: HTMLElement): void {
        if (this.currentLanguageClass) {
            element.classList.remove(this.currentLanguageClass);
            this.currentLanguageClass = undefined;
        }
    }

    private setLanguageClass(element: HTMLElement): void {
        if (this.language) {
            this.currentLanguageClass = `language-${this.language}`;
            element.classList.add(this.currentLanguageClass);
        }
    }
}
