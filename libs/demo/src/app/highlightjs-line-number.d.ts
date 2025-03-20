import 'highlight.js';

declare module 'highlight.js' {
  interface HLJSApi {
    lineNumbersBlock(element: HTMLElement, forceRefresh?: boolean): void;
  }
}
