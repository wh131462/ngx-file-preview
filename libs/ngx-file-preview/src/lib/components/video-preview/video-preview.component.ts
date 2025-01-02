import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit, Input
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewBaseComponent} from '../base/preview-base.component';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import Hls from 'hls.js';
import {PreviewFile} from '../../types/preview.types';

@Component({
  selector: 'fp-video-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="video-container" #videoContainer [class.pip-mode]="isPiPMode">
      <video #videoPlayer
             (loadeddata)="onVideoLoad()"
             (error)="handleError($event)"
             (timeupdate)="onTimeUpdate()"
             (ended)="onVideoEnded()"
             (pause)="onVideoPause()"
             (click)="togglePlay()">
      </video>

      <div class="controls" [class.visible]="isControlsVisible" (mouseover)="showControls()"
           (mouseleave)="hideControls()">
        <!-- 进度条 -->
        <div class="progress-bar"
             (mousedown)="startDragging($event)">
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
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </span>
          </div>

          <!-- 右侧控制按钮 -->
          <div class="right-controls">
            <!-- 倍速控制 -->
            <div class="speed-control"
                 (mouseenter)="showSpeedControl = true"
                 (mouseleave)="showSpeedControl = false">
              <button>
                {{ playbackSpeed }}x
              </button>
              <div class="speed-options" *ngIf="showSpeedControl">
                <button *ngFor="let speed of playbackSpeeds"
                        (click)="setPlaybackSpeed(speed)"
                        [class.active]="playbackSpeed === speed">
                  {{ speed }}x
                </button>
              </div>
            </div>

            <!-- 亮度控制 -->
            <div class="control-group"
                 (mouseenter)="showBrightnessControl = true"
                 (mouseleave)="showBrightnessControl = false">
              <button (click)="cycleBrightness()">
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
            <div class="control-group"
                 (mouseenter)="showVolumeControl = true"
                 (mouseleave)="showVolumeControl = false">
              <button (click)="cycleVolume()">
                <preview-icon [name]="getVolumeIcon()"></preview-icon>
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
  styleUrls: ["../../styles/_theme.scss","video-preview.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPreviewComponent extends PreviewBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;
  private hls?: Hls;
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progress = 0;
  volume = 1;
  previousVolume = 1;
  brightness = 100;
  isPiPMode = false;
  isControlsVisible = true;
  showVolumeControl = false;
  showBrightnessControl = false;
  controlsTimeout: any;
  isMuted = false;
  playbackSpeed = 1;
  playbackSpeeds = [0.75, 1, 1.5, 2.0, 3.0, 5.0];
  showSpeedControl = false;
  isDragging = false;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.cdr.markForCheck();
  }

  ngAfterViewInit() {
    this.setupVideo();
  }

  onVideoLoad() {
    this.isLoading = false;
    this.duration = this.videoPlayer.nativeElement.duration;
    this.cdr.markForCheck();
  }

  private setupVideo() {
    const video = this.videoPlayer.nativeElement;
    const url = this.file.url;

    if (this.isHLSVideo(url)) {
      this.setupHLS(video, url);
    } else {
      // 对于普通视频，直接设置 src
      video.src = url;
    }
  }

  // 播放控制
  togglePlay() {
    const video = this.videoPlayer.nativeElement;
    if (video.paused) {
      video.play().then(() => {
        this.isPlaying = true;
        this.cdr.markForCheck();
      }).catch((error) => {
        console.error('播放失败:', error);
        this.isPlaying = false;
        this.cdr.markForCheck();
      });
    } else {
      video.pause();
      this.isPlaying = false;
      this.cdr.markForCheck();
    }
  }

  private isHLSVideo(url: string): boolean {
    return url.toLowerCase().includes('.m3u8') ||
      url.includes('application/x-mpegURL') ||
      url.includes('application/vnd.apple.mpegurl');
  }

  // 进度更新
  onTimeUpdate() {
    const video = this.videoPlayer.nativeElement;
    this.currentTime = video.currentTime;
    this.progress = (video.currentTime / video.duration) * 100;
  }

  adjustVolume(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.volume = value / 100;
    this.isMuted = this.volume === 0;
    if (this.volume > 0) {
      this.previousVolume = this.volume;
    }
    this.videoPlayer.nativeElement.volume = this.volume;
    this.cdr.markForCheck();
  }
  adjustBrightness(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.brightness = value;
    this.videoPlayer.nativeElement.style.filter = `brightness(${this.brightness}%)`;
    this.cdr.markForCheck();
  }

  // 画中画模式
  async togglePip() {
    if (!document.pictureInPictureElement) {
      try {
        await this.videoPlayer.nativeElement.requestPictureInPicture();
        this.isPiPMode = true;
      } catch (error) {
        console.error('画中画模式不支持:', error);
      }
    } else {
      await document.exitPictureInPicture();
      this.isPiPMode = false;
    }
  }

  private setupHLS(video: HTMLVideoElement, url: string) {
    if (Hls.isSupported()) {
      this.hls = new Hls({
        debug: false,
        enableWorker: true,
        // 添加一些 HLS 配置以确保更好的兼容性
        capLevelToPlayerSize: true,
        startLevel: -1,
        abrMaxWithRealBitrate: true
      });

      this.hls.loadSource(url);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // 清单解析完成后，尝试播放
        video.play().catch(() => {
          console.log('Autoplay prevented');
        });
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS error:', data);
          this.handleError(new Error('视频加载失败'));
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari 原生支持
      video.src = url;
    }
  }
  toggleFullscreen() {
    const video = this.videoContainer.nativeElement;
    if (!document.fullscreenElement) {
      video.requestFullscreen();
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

  // 后退15秒
  back15s() {
    this.videoPlayer.nativeElement.currentTime -= 15;
  }

  // 前进15秒
  forward15s() {
    this.videoPlayer.nativeElement.currentTime += 15;
  }

  ngOnDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
  }

  // 跳转播放
  seek(event: MouseEvent) {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    if (pos >= 0 && pos <= 1) { // 确保在有效范围内
      const video = this.videoPlayer.nativeElement;
      video.currentTime = pos * video.duration;
      this.progress = pos * 100;
      this.cdr.markForCheck();
    }
  }

  // 进度条拖动
  startDragging(event: MouseEvent) {
    this.isDragging = true;
    this.seek(event);
    // 添加全局鼠标事件监听
    document.addEventListener('mousemove', this.onGlobalDrag);
    document.addEventListener('mouseup', this.stopDragging);
  }

  private onGlobalDrag = (event: MouseEvent) => {
    if (this.isDragging) {
      const progressBar = this.videoPlayer.nativeElement.parentElement?.querySelector('.progress-bar');
      if (progressBar) {
        const rect = progressBar.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const video = this.videoPlayer.nativeElement;
        video.currentTime = pos * video.duration;
        this.progress = pos * 100;
        this.cdr.markForCheck();
      }
    }
  }

  stopDragging = () => {
    if (this.isDragging) {
      this.isDragging = false;
      // 移除全局事件监听
      document.removeEventListener('mousemove', this.onGlobalDrag);
      document.removeEventListener('mouseup', this.stopDragging);
    }
  }

  // 音量控制
  cycleVolume() {
    if (this.volume > 0) {
      this.previousVolume = this.volume;
      this.volume = 0;
      this.isMuted = true;
    } else {
      this.volume = this.previousVolume;
      this.isMuted = false;
    }
    this.videoPlayer.nativeElement.volume = this.volume;
    this.cdr.markForCheck();
  }

  getVolumeIcon(): string {
    if (this.volume === 0) return 'mute';
    return 'volume';
  }

  // 亮度控制
  cycleBrightness() {
    const levels = [0, 100,200];
    const currentIndex = levels.indexOf(this.brightness);
    const nextIndex = (currentIndex + 1) % levels.length;
    this.brightness = levels[nextIndex];
    this.videoPlayer.nativeElement.style.filter = `brightness(${this.brightness}%)`;
    this.cdr.markForCheck();
  }

  // 倍速控制
  toggleSpeedControl() {
    this.showSpeedControl = !this.showSpeedControl;
    this.showVolumeControl = false;
    this.showBrightnessControl = false;
    this.cdr.markForCheck();
  }

  setPlaybackSpeed(speed: number) {
    this.playbackSpeed = speed;
    this.videoPlayer.nativeElement.playbackRate = speed;
    this.showSpeedControl = false;
    this.cdr.markForCheck();
  }

  formatTime(seconds: number): string {
    if (!seconds) return '00:00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return [hours, minutes, secs]
      .map(val => val.toString().padStart(2, '0'))
      .join(':');
  }

  onVideoEnded() {
    this.isPlaying = false;
    this.cdr.markForCheck();
  }

  onVideoPause() {
    this.isPlaying = false;
    this.cdr.markForCheck();
  }
}
