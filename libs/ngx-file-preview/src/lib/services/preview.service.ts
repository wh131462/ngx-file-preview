import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PreviewFile, PreviewOptions } from '../types/preview.types';

export interface PreviewState {
  isVisible: boolean;
  currentFile?: PreviewFile;
  files: PreviewFile[];
  currentIndex: number;
  zoom: number;
}

export const INITIAL_PREVIEW_STATE: PreviewState = {
  isVisible: false,
  files: [],
  currentIndex: 0,
  zoom: 1
};

@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  previewStateSubject = new BehaviorSubject<PreviewState>(INITIAL_PREVIEW_STATE);
  previewState$ = this.previewStateSubject.asObservable();

  open(options: PreviewOptions) {
    const { files, index = 0 } = options;
    
    // 确保文件数组有效
    if (!files || files.length === 0) {
      console.warn('No files provided for preview');
      return;
    }

    // 更新预览状态
    this.previewStateSubject.next({
      isVisible: true,
      currentFile: files[index],
      files,
      currentIndex: index,
      zoom: 1
    });
  }

  close() {
    // 检查是否处于全屏状态
    if (document.fullscreenElement) {
      // 退出全屏
      document.exitFullscreen().then(() => {
        this.updatePreviewState(false);
      }).catch(err => {
        console.error('退出全屏失败:', err);
        // 即使退出全屏失败，也要关闭预览
        this.updatePreviewState(false);
      });
    } else {
      this.updatePreviewState(false);
    }
  }

  private updatePreviewState(isVisible: boolean) {
    const state = this.previewStateSubject.getValue();
    this.previewStateSubject.next({
      ...state,
      isVisible,
      zoom: 1
    });
  }

  next() {
    const state = this.previewStateSubject.getValue();
    if (state.currentIndex < state.files.length - 1) {
      this.updateCurrentFile(state.currentIndex + 1);
    }
  }

  previous() {
    const state = this.previewStateSubject.getValue();
    if (state.currentIndex > 0) {
      this.updateCurrentFile(state.currentIndex - 1);
    }
  }

  zoom(delta: number) {
    const state = this.previewStateSubject.getValue();
    const newZoom = Math.max(0.1, Math.min(5, state.zoom * (delta > 0 ? 1.1 : 0.9)));

    this.previewStateSubject.next({
      ...state,
      zoom: newZoom
    });
  }

  resetZoom() {
    const state = this.previewStateSubject.getValue();
    this.previewStateSubject.next({
      ...state,
      zoom: 1
    });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  private updateCurrentFile(index: number) {
    const state = this.previewStateSubject.getValue();
    this.previewStateSubject.next({
      ...state,
      currentFile: state.files[index],
      currentIndex: index,
      zoom: 1 // 重置缩放
    });
  }
}
