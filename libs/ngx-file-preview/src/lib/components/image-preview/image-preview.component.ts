import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewBaseComponent} from '../base/preview-base.component';
import {PreviewIconComponent} from "../preview-icon/preview-icon.component";

@Component({
  selector: 'fp-image-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="image-preview"
         (mousedown)="startDrag($event)"
         (mousemove)="onDrag($event)"
         (mouseup)="stopDrag()"
         (mouseleave)="stopDrag()"
         (wheel)="handleWheel($event)">
      <div class="image-wrapper"
           #imageWrapper
           [style]="transformStyle"
           [class.is-moving]="isDragging">
        <img #previewImage
             [src]="file.url"
             [style.display]="isLoading ? 'none' : 'block'"
             (load)="onImageLoad()"
             (error)="handleError($event)"
             alt="preview"/>
      </div>

      <div class="image-info" *ngIf="!isLoading">
        <span class="filename">{{ file.name }}</span>
        <span class="dimensions">{{ imageWidth }} × {{ imageHeight }}</span>
      </div>

      <div class="toolbar" *ngIf="!isLoading">
        <div class="tool-group">
          <div class="control" (click)="zoomOut()" [class.disabled]="zoom <= minZoom">
            <preview-icon [themeMode]="themeMode"  name="zoom-out"></preview-icon>
          </div>
          <span class="zoom-text">{{ (zoom * 100).toFixed(0) }}%</span>
          <div class="control" (click)="zoomIn()" [class.disabled]="zoom >= maxZoom">
            <preview-icon [themeMode]="themeMode"  name="zoom-in"></preview-icon>
          </div>
        </div>

        <div class="divider"></div>

        <div class="tool-group">
          <div class="control" (click)="rotate(-90)">
            <preview-icon  [themeMode]="themeMode"  name="rotate-90"></preview-icon>
          </div>
          <div class="control" (click)="rotate(90)">
            <preview-icon [themeMode]="themeMode"  name="rotate90"></preview-icon>
          </div>
        </div>

        <div class="divider"></div>

        <div class="tool-group">
          <div class="control" (click)="resetView()">
            <preview-icon [themeMode]="themeMode"  name="reset"></preview-icon>
          </div>
          <div class="control" (click)="download()">
            <preview-icon [themeMode]="themeMode"  name="download"></preview-icon>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: [
    './image-preview.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagePreviewComponent extends PreviewBaseComponent implements AfterViewInit {
  @ViewChild('imageWrapper') imageWrapper?: ElementRef<HTMLDivElement>;
  @ViewChild('previewImage') previewImage?: ElementRef<HTMLImageElement>;

  protected readonly minZoom = 0.1;
  protected readonly maxZoom = 5;
  private readonly zoomStep = 0.1;

  zoom = 1;
  rotation = 0;
  translateX = 0;
  translateY = 0;
  isDragging = false;
  imageWidth = 0;
  imageHeight = 0;
  transformStyle = '';

  private dragStartX = 0;
  private dragStartY = 0;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit() {
    this.updateTransformStyle();
  }

  private updateTransformStyle() {
    const transform = `translate(-50%, -50%)
                      translate(${this.translateX}px, ${this.translateY}px)
                      scale(${this.zoom})
                      rotate(${this.rotation}deg)`;

    const transition = this.isDragging ? 'none' : 'transform 0.3s ease';
    this.transformStyle = `transform: ${transform}; transition: ${transition};`;
    this.cdr.markForCheck();
  }

  handleWheel(event: WheelEvent) {
    event.preventDefault();
    if (!this.imageWrapper?.nativeElement) return;

    const delta = event.deltaY < 0 ? 1 : -1;
    const zoomFactor = 1 + (delta * this.zoomStep);
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomFactor));

    if (newZoom !== this.zoom) {
      const scale = newZoom / this.zoom;
      this.translateX = this.translateX * scale;
      this.translateY = this.translateY * scale;
      this.zoom = newZoom;
      this.updateTransformStyle();
    }
  }

  startDrag(event: MouseEvent) {
    if (event.button !== 0) return;
    this.isDragging = true;
    this.dragStartX = event.clientX - this.translateX;
    this.dragStartY = event.clientY - this.translateY;
    this.updateTransformStyle();
  }

  onDrag(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();

    this.translateX = event.clientX - this.dragStartX;
    this.translateY = event.clientY - this.dragStartY;
    this.updateTransformStyle();
  }

  stopDrag() {
    this.isDragging = false;
    this.updateTransformStyle();
  }

  zoomIn() {
    const newZoom = Math.min(this.maxZoom, this.zoom * (1 + this.zoomStep));
    if (newZoom !== this.zoom) {
      const scale = newZoom / this.zoom;
      this.translateX = this.translateX * scale;
      this.translateY = this.translateY * scale;
      this.zoom = newZoom;
      this.updateTransformStyle();
    }
  }

  zoomOut() {
    const newZoom = Math.max(this.minZoom, this.zoom / (1 + this.zoomStep));
    if (newZoom !== this.zoom) {
      const scale = newZoom / this.zoom;
      this.translateX = this.translateX * scale;
      this.translateY = this.translateY * scale;
      this.zoom = newZoom;
      this.updateTransformStyle();
    }
  }

  rotate(angle: number) {
    this.rotation += angle;

    if (this.imageWidth && this.imageHeight && this.imageWrapper?.nativeElement) {
      const wrapper = this.imageWrapper.nativeElement;
      const wrapperWidth = wrapper.clientWidth;
      const wrapperHeight = wrapper.clientHeight;

      const displayRotation = Math.abs(this.rotation % 360);
      const rad = (displayRotation % 180) * Math.PI / 180;
      const rotatedWidth = Math.abs(this.imageWidth * Math.cos(rad) + this.imageHeight * Math.sin(rad));
      const rotatedHeight = Math.abs(this.imageWidth * Math.sin(rad) + this.imageHeight * Math.cos(rad));

      const scaleX = wrapperWidth / rotatedWidth;
      const scaleY = wrapperHeight / rotatedHeight;
      const newZoom = Math.min(scaleX, scaleY) * 0.9;

      this.zoom = newZoom;
      this.translateX = 0;
      this.translateY = 0;
    }

    this.updateTransformStyle();
  }

  resetView() {
    this.zoom = 1;
    this.rotation = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.centerImage();
  }

  onImageLoad() {
    super.onLoadComplete();
    if (this.previewImage?.nativeElement) {
      const image = this.previewImage.nativeElement;
      this.imageWidth = image.naturalWidth;
      this.imageHeight = image.naturalHeight;
      this.centerImage();
    }
  }

  private centerImage() {
    if (!this.imageWrapper?.nativeElement || !this.previewImage?.nativeElement) return;

    const wrapper = this.imageWrapper.nativeElement;
    const image = this.previewImage.nativeElement;

    const wrapperRatio = wrapper.clientWidth / wrapper.clientHeight;
    const imageRatio = image.naturalWidth / image.naturalHeight;

    if (wrapperRatio > imageRatio) {
      this.zoom = (wrapper.clientHeight * 0.9) / image.naturalHeight;
    } else {
      this.zoom = (wrapper.clientWidth * 0.9) / image.naturalWidth;
    }
    this.zoom||=1;

    this.translateX = 0;
    this.translateY = 0;

    this.updateTransformStyle();
  }

  download() {
    if (!this.file?.url) return;

    const link = document.createElement('a');
    link.href = this.file.url;
    link.download = this.file.name || 'image';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    if (this.isExternalUrl(this.file.url)) {
      const image = this.previewImage?.nativeElement;
      if (!image) return;

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(image, 0, 0);

      try {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      } catch (error) {
        console.error('Failed to download image:', error);
        window.open(this.file.url, '_blank');
      }
    } else {
      link.click();
    }
  }

  private isExternalUrl(url: string): boolean {
    try {
      const currentOrigin = window.location.origin;
      const urlOrigin = new URL(url, window.location.href).origin;
      return currentOrigin !== urlOrigin;
    } catch {
      return true;
    }
  }
}
