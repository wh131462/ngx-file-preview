import { AfterViewInit, Directive, ElementRef, Input, OnChanges } from '@angular/core';
import hljs from 'highlight.js';
import 'highlightjs-line-numbers.js';

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

    constructor(private readonly el: ElementRef) {}

    ngAfterViewInit(): void {
        this.highlight();
    }

    ngOnChanges(): void {
        this.highlight();
    }

    private highlight(): void {
        const element = this.el.nativeElement as HTMLElement;

        // 清理旧内容
        element.textContent = this.code || element.textContent || '';

        // 重置语言样式
        this.cleanLanguageClass(element);

        // 设置语言类
        this.setLanguageClass(element);

        // 执行高亮
        hljs.highlightElement(element);

        // 添加行号（仅在首次或内容变化时）
        this.handleLineNumbers(element);
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

    private handleLineNumbers(element: HTMLElement): void {
        if (this.lineNumbersEnabled) {
            // 先移除已有行号（如果存在）
            if (element.closest('.hljs-line-numbers')) {
                (hljs as any).lineNumbersBlock(element, true); // 第二个参数true表示强制刷新
            } else {
                (hljs as any).lineNumbersBlock(element);
            }
        }
    }
}
