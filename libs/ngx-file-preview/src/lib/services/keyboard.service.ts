import { Injectable, OnDestroy } from '@angular/core';
import { Subject, fromEvent, takeUntil, filter } from 'rxjs';
import { PreviewService, PreviewState, INITIAL_PREVIEW_STATE } from './preview.service';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private currentState: PreviewState = INITIAL_PREVIEW_STATE;

  constructor(private previewService: PreviewService) {
    this.initKeyboardListeners();
  }

  private initKeyboardListeners() {
    this.previewService.previewState$.subscribe(state => {
      this.currentState = state;
    });

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.currentState.isVisible)
      )
      .subscribe(event => {
        switch (event.key) {
          case 'Escape':
            this.previewService.close();
            break;
          case 'ArrowLeft':
            if (!event.ctrlKey) this.previewService.previous();
            break;
          case 'ArrowRight':
            if (!event.ctrlKey) this.previewService.next();
            break;
          case '+':
          case '=':
            if (event.ctrlKey) {
              event.preventDefault();
              this.previewService.zoom(1);
            }
            break;
          case '-':
            if (event.ctrlKey) {
              event.preventDefault();
              this.previewService.zoom(-1);
            }
            break;
          case '0':
            if (event.ctrlKey) {
              event.preventDefault();
              this.previewService.resetZoom();
            }
            break;
          case 'f':
            if (event.ctrlKey) {
              event.preventDefault();
              this.previewService.toggleFullscreen();
            }
            break;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 