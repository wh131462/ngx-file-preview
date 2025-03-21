import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewBaseComponent} from '../base/preview-base.component';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import {SafeUrl} from '@angular/platform-browser';
import {FileReaderResponse} from "../../workers/file-reader.worker";

@Component({
  selector: 'fp-audio-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="audio-container">
      <audio #audioPlayer
             [src]="file.url"
             (loadeddata)="onAudioLoad()"
             (timeupdate)="onTimeUpdate()">
      </audio>

      <div class="audio-player">
        <!-- 封面图 -->
        <div class="cover">
          <ng-container *ngIf="coverUrl; else defaultCover">
            <img [src]="coverUrl" alt="album cover">
          </ng-container>
          <ng-template #defaultCover>
            <preview-icon [themeMode]="themeMode" name="music" [size]="48"></preview-icon>
          </ng-template>
        </div>

        <!-- 控制区域 -->
        <div class="controls">
          <!-- 文件信息 -->
          <div class="info">
            <span class="filename">{{ file.name }}</span>
          </div>

          <!-- 播放控制 -->
          <div class="player-controls">
            <div class="main-controls">
              <button class="control-btn" (click)="togglePlay()">
                <preview-icon [themeMode]="themeMode" [name]="isPlaying ? 'pause' : 'play'" [size]="24"></preview-icon>
              </button>
            </div>

            <div class="progress-area">
              <span class="time current">{{ formatTime(currentTime) }}</span>
              <div class="progress-bar" (mousedown)="startDragging($event)">
                <div class="progress-bg"></div>
                <div class="progress" [style.width.%]="progress">
                  <div class="progress-handle"></div>
                </div>
              </div>
              <span class="time duration">{{ formatTime(duration) }}</span>
            </div>
          </div>

          <!-- 辅助控制 -->
          <div class="extra-controls">
            <!-- 倍速控制 -->
            <div class="speed-control"
                 (mouseenter)="showSpeedControl = true"
                 (mouseleave)="showSpeedControl = false">
              <button class="text-btn">
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

            <!-- 音量控制 -->
            <div class="volume-control"
                 (mouseenter)="showVolumeControl = true"
                 (mouseleave)="showVolumeControl = false">
              <button class="control-btn" (click)="cycleVolume()">
                <preview-icon [themeMode]="themeMode" [name]="getVolumeIcon()"></preview-icon>
              </button>
              <div class="slider-container" *ngIf="showVolumeControl">
                <input type="range"
                       min="0"
                       max="100"
                       [value]="volume * 100"
                       (input)="adjustVolume($event)">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../styles/_theme.scss', './audio-preview.component.scss'],
})
export class AudioPreviewComponent extends PreviewBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  coverUrl: SafeUrl | null = null;

  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progress = 0;
  volume = 1;
  previousVolume = 1;
  isDragging = false;
  showVolumeControl = false;
  showSpeedControl = false;
  playbackSpeed = 1;
  playbackSpeeds = [0.75, 1, 1.5, 2.0, 3.0, 5.0];

  private playHandler = () => {
    this.isPlaying = true;
    this.cdr.markForCheck();
  };

  private pauseHandler = () => {
    this.isPlaying = false;
    this.cdr.markForCheck();
  };

  private endedHandler = () => {
    this.isPlaying = false;
    this.cdr.markForCheck();
  };

  ngOnInit() {
    this.isLoading = true;
    this.loadCover();
    this.cdr.markForCheck();
  }

  private async loadCover() {
    try {
      // 如果文件对象中已经有封面URL，直接使用
      if (this.file.coverUrl) {
        this.coverUrl = this.file.coverUrl;
        return;
      }
      // 如果没有封面，使用默认图标
      this.coverUrl = null;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('加载封面失败:', error);
      this.coverUrl = null;
      this.cdr.markForCheck();
    }
  }

  ngAfterViewInit() {
    // 在视图初始化后设置事件监听
    const audio = this.audioPlayer.nativeElement;
    audio.addEventListener('play', this.playHandler);
    audio.addEventListener('pause', this.pauseHandler);
    audio.addEventListener('ended', this.endedHandler);
  }

  onAudioLoad() {
    this.isLoading = false;
    this.duration = this.audioPlayer.nativeElement.duration;
    this.cdr.markForCheck();
  }

  onTimeUpdate() {
    if (!this.isDragging) {
      const audio = this.audioPlayer.nativeElement;
      this.currentTime = audio.currentTime;
      this.progress = (audio.currentTime / audio.duration) * 100;
      this.cdr.markForCheck();
    }
  }

  async togglePlay() {
    const audio = this.audioPlayer.nativeElement;
    try {
      if (this.isPlaying) {
        await audio.pause();
      } else {
        // 在播放前重置音频时间（如果已经结束）
        if (audio.ended) {
          audio.currentTime = 0;
        }
        await audio.play();
      }
    } catch (error) {
      console.error('播放控制错误:', error);
    }
    // 状态会通过事件监听器自动更新
  }

  // 进度条控制
  startDragging(event: MouseEvent) {
    this.isDragging = true;
    this.seek(event);
    document.addEventListener('mousemove', this.onGlobalDrag);
    document.addEventListener('mouseup', this.stopDragging);
  }

  private seek(event: MouseEvent) {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    if (pos >= 0 && pos <= 1) {
      const audio = this.audioPlayer.nativeElement;
      audio.currentTime = pos * audio.duration;
      this.progress = pos * 100;
      this.cdr.markForCheck();
    }
  }

  private onGlobalDrag = (event: MouseEvent) => {
    if (this.isDragging) {
      const progressBar = this.audioPlayer.nativeElement.parentElement?.querySelector('.progress-bar');
      if (progressBar) {
        const rect = progressBar.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const audio = this.audioPlayer.nativeElement;
        audio.currentTime = pos * audio.duration;
        this.progress = pos * 100;
        this.cdr.markForCheck();
      }
    }
  }

  stopDragging = () => {
    if (this.isDragging) {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onGlobalDrag);
      document.removeEventListener('mouseup', this.stopDragging);
    }
  }

  // 音量控制
  cycleVolume() {
    if (this.volume > 0) {
      this.previousVolume = this.volume;
      this.volume = 0;
    } else {
      this.volume = this.previousVolume;
    }
    this.audioPlayer.nativeElement.volume = this.volume;
    this.cdr.markForCheck();
  }

  adjustVolume(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.volume = value / 100;
    if (this.volume > 0) {
      this.previousVolume = this.volume;
    }
    this.audioPlayer.nativeElement.volume = this.volume;
    this.cdr.markForCheck();
  }

  getVolumeIcon(): string {
    if (this.volume === 0) return 'mute';
    return 'volume';
  }

  // 倍速控制
  setPlaybackSpeed(speed: number) {
    this.playbackSpeed = speed;
    this.audioPlayer.nativeElement.playbackRate = speed;
    this.showSpeedControl = false;
    this.cdr.markForCheck();
  }

  formatTime(seconds: number): string {
    if (!seconds) return '00:00';

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return [minutes, secs]
      .map(val => val.toString().padStart(2, '0'))
      .join(':');
  }

  ngOnDestroy() {
    if (this.audioPlayer?.nativeElement) {
      const audio = this.audioPlayer.nativeElement;
      audio.removeEventListener('play', this.playHandler);
      audio.removeEventListener('pause', this.pauseHandler);
      audio.removeEventListener('ended', this.endedHandler);
    }
    this.stopDragging();
  }

  protected override async handleFileContent(content: FileReaderResponse) {
  }
}
