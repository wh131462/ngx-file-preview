import {
  Component,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
  ViewContainerRef
} from "@angular/core";
import {PreviewService} from "../services";

@Directive({ selector: '[tooltip]' ,standalone: true})
export class TooltipDirective implements OnDestroy {
  @Input('tooltip') content!: string;
  @Input() delay: number = 500;

  private tooltip!: HTMLElement;
  private showTimeout?: any;
  private hideTimeout?: any;
  private positions = ['top', 'bottom', 'left', 'right'];
  private currentPosition = 'top';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private viewContainer: ViewContainerRef,
    private previewService:PreviewService
  ) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.clearTimers();
    this.showTimeout = setTimeout(() => this.show(), this.delay);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.clearTimers();
    this.hideTimeout = setTimeout(() => this.hide(), 100);
  }

  private show() {
    if(!this.content)return;
    if (!this.tooltip) {
      // 动态创建组件
      const factory = this.viewContainer.createComponent(TooltipComponent);
      this.tooltip = factory.location.nativeElement;
      factory.instance.content = this.content;
      // 立即显示内容
      this.renderer.addClass(this.tooltip, 'visible');
      this.previewService.modalElement?.querySelector('.nfp-modal__overlay').appendChild(this.tooltip);
      factory.changeDetectorRef.detectChanges()
    }

    // 计算最佳位置
    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 检查每个位置的可用空间
    const spaces: Record<string, number> = {
      top: hostRect.top,
      bottom: viewportHeight - (hostRect.bottom),
      left: hostRect.left,
      right: viewportWidth - (hostRect.right)
    };

    // 找到最佳位置
    this.currentPosition = this.positions.reduce((best, current) =>
      spaces[current] > spaces[best] ? current : best
    );

    // 根据位置设置样式类
    this.positions.forEach(pos => this.renderer.removeClass(this.tooltip, pos));
    this.renderer.addClass(this.tooltip, this.currentPosition);

    // 根据位置计算坐标
    let top, left;
    switch(this.currentPosition) {
      case 'top':
        top = hostRect.top - tooltipRect.height - 8;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = hostRect.bottom + 8;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.right + 8;
        break;
    }

    // 确保tooltip不超出视口
    top = Math.max(8, Math.min(viewportHeight - tooltipRect.height - 8, top));
    left = Math.max(8, Math.min(viewportWidth - tooltipRect.width - 8, left));

    this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
  }

  private hide() {
    if (this.tooltip) {
      this.renderer.removeClass(this.tooltip, 'visible');
      setTimeout(() => {
        this.viewContainer.clear()
        this.tooltip = null!
      }, 300); // 增加动画时间
    }
  }

  private clearTimers() {
    clearTimeout(this.showTimeout);
    clearTimeout(this.hideTimeout);
  }

  ngOnDestroy() {
    this.viewContainer.clear();
  }
}
@Component({
  selector: 'ngx-file-tooltip',
  template: `{{ content }}`,
  standalone: true,
  styles: [`
    :host {
      position: absolute;
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      font-size: 14px;
      padding: 6px 8px;
      border-radius: 2px;
      box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
      max-width: 250px;
      min-height: 24px;
      word-wrap: break-word;
      z-index: 999;
      pointer-events: none;
      opacity: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: scale(0.8);
      transform-origin: center;
      transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
    }

    :host.visible {
      opacity: 1;
      transform: scale(1);
    }

    :host::after {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border: 5px solid transparent;
    }

    :host.top::after {
      border-top-color: rgba(0, 0, 0, 0.85);
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
    }

    :host.bottom::after {
      border-bottom-color: rgba(0, 0, 0, 0.85);
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
    }

    :host.left::after {
      border-left-color: rgba(0, 0, 0, 0.85);
      right: -10px;
      top: 50%;
      transform: translateY(-50%);
    }

    :host.right::after {
      border-right-color: rgba(0, 0, 0, 0.85);
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
    }
  `]
})
export class TooltipComponent {
  @Input() content: string = "";
}
