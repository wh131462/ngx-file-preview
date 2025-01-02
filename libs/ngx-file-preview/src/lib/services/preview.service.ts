import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Type
} from '@angular/core';
import {PreviewFile, PreviewOptions} from '../types/preview.types';
import {BehaviorSubject} from 'rxjs';
import {PreviewModalComponent} from '../components/preview-modal/preview-modal.component';

export interface PreviewState {
  isVisible: boolean;
  currentFile?: PreviewFile;
  currentIndex: number;
  files: PreviewFile[];
}

@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  private modalRef?: ComponentRef<PreviewModalComponent>;
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  // 预览状态管理
  private readonly initialState: PreviewState = {
    isVisible: false,
    currentIndex: 0,
    files: []
  };

  readonly previewStateSubject = new BehaviorSubject<PreviewState>(this.initialState);
  readonly previewState$ = this.previewStateSubject.asObservable();

  open(options: PreviewOptions) {
    const {files, index = 0} = options;

    // 如果模态框已存在，更新状态即可
    if (this.modalRef) {
      this.updatePreviewState(true, files, index);
      return;
    }

    try {
      // 创建模态框组件
      this.modalRef = createComponent(PreviewModalComponent as Type<PreviewModalComponent>, {
        environmentInjector: this.injector
      });
      Object.assign(this.modalRef.instance, options)
      console.log("this.modalRef", options);
      // 将模态框添加到 body
      document.body.appendChild(this.modalRef.location.nativeElement);
      // 手动触发变更检测
      this.modalRef.changeDetectorRef.detectChanges();

      // 更新预览状态
      this.updatePreviewState(true, files, index);
      // 将组件添加到 ApplicationRef
      this.appRef.attachView(this.modalRef.hostView);
    } catch (error) {
      console.error('Error creating preview modal:', error);
      this.cleanupModal();
    }
  }

  close() {
    this.updatePreviewState(false, [], 0);
    this.cleanupModal();
  }

  previous() {
    const state = this.previewStateSubject.getValue();
    const newIndex = Math.max(0, state.currentIndex - 1);
    this.updatePreviewState(true, state.files, newIndex);
  }

  next() {
    const state = this.previewStateSubject.getValue();
    const newIndex = Math.min(state.files.length - 1, state.currentIndex + 1);
    this.updatePreviewState(true, state.files, newIndex);
  }

  private updatePreviewState(isVisible: boolean, files: PreviewFile[], index: number) {
    const currentFile = files[index];
    this.previewStateSubject.next({
      isVisible,
      currentFile,
      currentIndex: index,
      files
    });
  }

  private cleanupModal() {
    if (!this.modalRef) return;

    try {
      // 从 DOM 中移除模态框
      const element = this.modalRef.location.nativeElement;
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }

      // 从 ApplicationRef 中分离视图
      this.appRef.detachView(this.modalRef.hostView);

      // 销毁组件
      this.modalRef.destroy();
    } catch (error) {
      console.error('Error cleaning up modal:', error);
    } finally {
      this.modalRef = undefined;
    }
  }
}
