import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewFile} from '../../types/preview.types';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';

@Component({
  selector: 'core-video-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="video-container" [class.pip-mode]="isPiPMode">
      <video #videoElement
             [src]="file.url"
             (timeupdate)="onTimeUpdate()"
             (loadedmetadata)="onMetadataLoaded()"
             (click)="togglePlay()">
      </video>

      <div class="controls" [class.visible]="isControlsVisible" (mouseover)="showControls()"
           (mouseleave)="hideControls()">
        <!-- 进度条 -->
        <div class="progress-bar" (click)="seek($event)">
          <div class="progress" [style.width.%]="progress"></div>
        </div>

        <div class="bottom-controls">
          <!-- 左侧控制按钮 -->
          <div class="left-controls">
            <button (click)="togglePlay()">
              <preview-icon [color]="'#FFFFFF'" [name]="isPlaying ? 'pause' : 'play'"></preview-icon>
            </button>
            <button (click)="back15s()">
              <preview-icon [color]="'#FFFFFF'" name="back15s"></preview-icon>
            </button>
            <button (click)="forward15s()">
              <preview-icon [color]="'#FFFFFF'" name="forward15s"></preview-icon>
            </button>
            <span class="time">
              {{ currentTime | number:'1.0-0' }} / {{ duration | number:'1.0-0' }}
            </span>
          </div>

          <!-- 右侧控制按钮 -->
          <div class="right-controls">
            <!-- 亮度控制 -->
            <div class="control-group">
              <button (click)="toggleBrightnessControl()">
                <preview-icon [name]="'lightness'"></preview-icon>
              </button>
              <div class="slider-container" *ngIf="showBrightnessControl">
                <input type="range"
                       min="0"
                       max="200"
                       [value]="brightness"
                       (input)="adjustBrightness($event)">
              </div>
            </div>

            <!-- 音量控制 -->
            <div class="control-group">
              <button (click)="toggleVolumeControl()">
                <preview-icon [name]="isMuted? 'mute' : 'volume'"></preview-icon>
              </button>
              <div class="slider-container" *ngIf="showVolumeControl">
                <input type="range"
                       min="0"
                       max="100"
                       [value]="volume * 100"
                       (input)="adjustVolume($event)">
              </div>
            </div>

            <button (click)="togglePip()">
              <preview-icon name="pip"></preview-icon>
            </button>
            <button (click)="toggleFullscreen()">
              <preview-icon name="fullscreen"></preview-icon>
            </button>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
     :host{
        display: block;
        width: 100%;
        height: 100%;
    }
    .video-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: black;
      position: relative;
    }

    .pip-mode {
      width: 400px;
      height: 225px;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      padding: 20px;
      opacity: 0;
      transition: opacity 0.3s;

      &.visible {
        opacity: 1;
      }
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      cursor: pointer;
      margin-bottom: 10px;

      .progress {
        height: 100%;
        background: #ff0000;
      }
    }

    .bottom-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .left-controls, .right-controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    button {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .time {
      color: white;
      font-size: 14px;
    }

    .control-group {
      position: relative;

      .slider-container {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        padding: 10px;
        border-radius: 4px;

        input {
          width: 100px;
          -webkit-appearance: none;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          outline: none;

          &::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            cursor: pointer;
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPreviewComponent {
  @Input() file!: PreviewFile;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progress = 0;
  volume = 1;
  brightness = 100;
  isPiPMode = false;
  isControlsVisible = true;
  showVolumeControl = false;
  showBrightnessControl = false;
  controlsTimeout: any;
  isMuted = false;

  constructor(private cdr: ChangeDetectorRef) {
  }

  // 播放控制
  togglePlay() {
    if (this.videoElement.nativeElement.paused) {
      this.videoElement.nativeElement.play();
      this.isPlaying = true;
    } else {
      this.videoElement.nativeElement.pause();
      this.isPlaying = false;
    }
    this.cdr.markForCheck();
  }

  // 快进快退
  skip(seconds: number) {
    this.videoElement.nativeElement.currentTime += seconds;
  }

  // 进度更新
  onTimeUpdate() {
    const video = this.videoElement.nativeElement;
    this.currentTime = video.currentTime;
    this.progress = (video.currentTime / video.duration) * 100;
    this.cdr.markForCheck();
  }

  // 元数据加载完成
  onMetadataLoaded() {
    this.duration = this.videoElement.nativeElement.duration;
    this.cdr.markForCheck();
  }

  // 跳转播放
  seek(event: MouseEvent) {
    const video = this.videoElement.nativeElement;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  }

  // 音量控制
  toggleVolumeControl() {
    this.showVolumeControl = !this.showVolumeControl;
    this.showBrightnessControl = false;
    this.cdr.markForCheck();
  }

  adjustVolume(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.volume = value / 100;
    this.videoElement.nativeElement.volume = this.volume;
  }

  // 亮度控制
  toggleBrightnessControl() {
    this.showBrightnessControl = !this.showBrightnessControl;
    this.showVolumeControl = false;
    this.cdr.markForCheck();
  }

  adjustBrightness(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.brightness = value;
    this.videoElement.nativeElement.style.filter = `brightness(${value}%)`;
  }

  // 画中画模式
  async togglePip() {
    if (!document.pictureInPictureElement) {
      try {
        await this.videoElement.nativeElement.requestPictureInPicture();
        this.isPiPMode = true;
      } catch (error) {
        console.error('画中画模式不支持:', error);
      }
    } else {
      await document.exitPictureInPicture();
      this.isPiPMode = false;
    }
    this.cdr.markForCheck();
  }

  // 全屏模式
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.videoElement.nativeElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // 控制栏显示/隐藏
  showControls() {
    this.isControlsVisible = true;
    clearTimeout(this.controlsTimeout);
  }

  hideControls() {
    this.controlsTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.isControlsVisible = false;
        this.cdr.markForCheck();
      }
    }, 2000);
  }

  // 静音控制
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.videoElement.nativeElement.muted = this.isMuted;
  }

  // 后退15秒
  back15s() {
    this.videoElement.nativeElement.currentTime -= 15;
  }

  // 前进15秒
  forward15s() {
    this.videoElement.nativeElement.currentTime += 15;
  }
}
