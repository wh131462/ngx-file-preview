import {ChangeDetectionStrategy, Component, SimpleChanges} from '@angular/core';
import {NgIf} from "@angular/common";
import {BasePreviewComponent} from "../base-preview/base-preview.component";
import {MarkdownPipe} from "./markdown.pipe";
import {PreviewIconComponent} from '../../components';
import {FileReaderResponse} from "../../services";

@Component({
  selector: 'ngx-markdown-preview',
  standalone: true,
  imports: [
    NgIf,
    PreviewIconComponent,
    MarkdownPipe
  ],
  templateUrl: './markdown-preview.component.html',
  styleUrls: ['../../styles/_theme.scss', './markdown-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownPreviewComponent extends BasePreviewComponent {
  content: string = "";
  scale = 1;

  private readonly SCALE_STEP = 0.1;
  private readonly MAX_SCALE = 3;
  private readonly MIN_SCALE = 0.1;
  private readonly DEFAULT_SCALE = 1;

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['file'] && this.file) {
      this.loadFile("text").then(() => {
      });
    }
  }

  protected override async handleFileContent(content: FileReaderResponse): Promise<any> {
    const {text = ""} = content;
    this.content = text;
  }

  zoomIn() {
    if (this.scale < this.MAX_SCALE) {
      this.scale = Math.min(this.MAX_SCALE, this.scale + this.SCALE_STEP);
      this.cdr.markForCheck();
    }
  }

  zoomOut() {
    if (this.scale > this.MIN_SCALE) {
      this.scale = Math.max(this.MIN_SCALE, this.scale - this.SCALE_STEP);
      this.cdr.markForCheck();

    }
  }

  resetZoom() {
    this.scale = this.DEFAULT_SCALE;
    this.cdr.markForCheck();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}
