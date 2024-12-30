import {
  Directive,
  Input,
  HostListener,
  ComponentRef,
  OnDestroy,
  Type,
  ViewContainerRef,
  ElementRef
} from '@angular/core';
import { PreviewService } from '../services/preview.service';
import { PreviewFile, PreviewType } from '../types/preview.types';
import { PreviewUtils } from '../utils/preview.utils';
import { PreviewModalComponent } from '../components/preview-modal/preview-modal.component';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[ngxFilePreview]',
  standalone: true
})
export class PreviewDirective implements OnDestroy {
  @Input('ngxFilePreview') file!: string | PreviewFile | (string | PreviewFile)[];
  @Input() previewType?: PreviewType;
  @Input() previewIndex: number = 0;

  private modalRef?: ComponentRef<PreviewModalComponent>;
  private subscription?: Subscription;

  constructor(
    private previewService: PreviewService,
    private container: ViewContainerRef,
    private elementRef: ElementRef
  ) {
    // 添加预览指示样式
    this.elementRef.nativeElement.style.cursor = 'pointer';
  }

  @HostListener('click')
  onClick() {
    const files = PreviewUtils.normalizeFiles(this.file);
    
    if (!files || files.length === 0) {
      console.warn('No valid files to preview');
      return;
    }

    // 如果模态框已存在，不重复创建
    if (!this.modalRef) {
      try {
        // 清除容器中可能存在的旧内容
        this.container.clear();

        // 动态创建预览模态框组件
        this.modalRef = this.container.createComponent(PreviewModalComponent as Type<PreviewModalComponent>);

        // 确保模态框显示在视图最上层
        const modalElement = this.modalRef.location.nativeElement;
        document.body.appendChild(modalElement);

        // 订阅预览状态变化
        if (!this.subscription) {
          this.subscription = this.previewService.previewState$.subscribe(state => {
            if (!state.isVisible && this.modalRef) {
              this.cleanupModal();
            }
          });
        }
      } catch (error) {
        console.error('Error creating preview modal:', error);
        this.cleanupModal();
        return;
      }
    }

    // 打开预览
    this.previewService.open({
      files,
      index: this.previewIndex
    });
  }

  private cleanupModal() {
    if (!this.modalRef) {
      return;
    }

    try {
      // 获取模态框元素
      const modalElement = this.modalRef.location.nativeElement;

      // 从 body 中移除模态框
      if (modalElement.parentElement) {
        modalElement.parentElement.removeChild(modalElement);
      }

      // 销毁组件
      this.modalRef.destroy();
      
      // 清除容器
      this.container.clear();
    } catch (error) {
      console.error('Error cleaning up modal:', error);
    } finally {
      this.modalRef = undefined;
    }
  }

  ngOnDestroy() {
    try {
      this.subscription?.unsubscribe();
      this.cleanupModal();
    } catch (error) {
      console.error('Error in ngOnDestroy:', error);
    }
  }
}
