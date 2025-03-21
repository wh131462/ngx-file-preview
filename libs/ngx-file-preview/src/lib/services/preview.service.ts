import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector
} from '@angular/core';
import {PreviewFile, PreviewOptions} from '../types/preview.types';
import {BehaviorSubject} from 'rxjs';
import {PreviewModalComponent} from '../components';
import {ThemeService} from "./theme.service";

export const INITIAL_PREVIEW_STATE = {
  isVisible: false,
  currentIndex: 0,
  files: []
}

export interface PreviewState {
  isVisible: boolean;
  currentFile?: PreviewFile;
  currentIndex: number;
  files: PreviewFile[];
}

@Injectable()
export class PreviewService {
  // region 服务管理
  /**
   * 初始化 需要将所有service注入到modal
   */
  private injector!: Injector;
  private envInjector!: EnvironmentInjector;
  private appRef = inject(ApplicationRef)

  init(injector: Injector, envInjector: EnvironmentInjector) {
    this.envInjector = envInjector;
    this.injector = injector;
  }

  // endregion
  // region 状态管理
  readonly stateSubject = new BehaviorSubject<PreviewState>(INITIAL_PREVIEW_STATE);

  get state() {
    return this.stateSubject.getValue();
  }

  getStateObservable() {
    return this.stateSubject.asObservable();
  }

  previous() {
    const state = this.state;
    const newIndex = Math.max(0, state.currentIndex - 1);
    this.updatePreviewState(true, state.files, newIndex);
  }

  next() {
    const state = this.state;
    const newIndex = Math.min(state.files.length - 1, state.currentIndex + 1);
    this.updatePreviewState(true, state.files, newIndex);
  }

  private updatePreviewState(isVisible: boolean, files: PreviewFile[], index: number) {
    const currentFile = files[index];
    this.stateSubject.next({
      isVisible,
      currentFile,
      currentIndex: index,
      files
    });
  }

  // endregion
  // region Modal管理
  private modalRef?: ComponentRef<PreviewModalComponent>;

  open(options: PreviewOptions) {
    const {files, index = 0} = options;
    if (this.modalRef) {
      this.updatePreviewState(true, files, index);
      return;
    }
    try {
      this.modalRef = createComponent(PreviewModalComponent, {
        environmentInjector: this.envInjector,
        elementInjector: this.injector,
      });
      Object.assign(this.modalRef.instance, options)
      this.injector.get(ThemeService).bindElement(this.modalRef.location.nativeElement)
      document.body.appendChild(this.modalRef.location.nativeElement);
      this.modalRef.changeDetectorRef.detectChanges();
      this.updatePreviewState(true, files, index);
      this.appRef.attachView(this.modalRef.hostView);
    } catch (error) {
      console.error('Error creating preview-list modal:', error);
      this.cleanupModal();
    }
  }

  close() {
    if (document.fullscreenElement) {
      document?.exitFullscreen();
    }
    this.updatePreviewState(false, [], 0);
    this.cleanupModal();
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

  // endregion
}
