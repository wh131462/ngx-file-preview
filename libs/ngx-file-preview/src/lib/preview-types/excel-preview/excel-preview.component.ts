import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BasePreviewComponent} from '../base-preview/base-preview.component';
import {PreviewIconComponent} from '../../components/preview-icon/preview-icon.component';
import * as XLSX from 'xlsx';
import {FileReaderResponse} from "../../workers/file-reader.worker";

interface TableData {
  headers: string[];
  rows: any[][];
}

@Component({
  selector: 'ngx-excel-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="excel-container" #container>
      <div class="toolbar">
        <div class="left-controls">
          <button class="tool-btn" (click)="zoomOut()">
            <preview-icon [themeMode]="themeMode" name="zoom-out"></preview-icon>
          </button>
          <span class="zoom-text" (click)="resetZoom()" title="点击重置缩放">
            {{ (scale * 100).toFixed(0) }}%
          </span>
          <button class="tool-btn" (click)="zoomIn()">
            <preview-icon [themeMode]="themeMode" name="zoom-in"></preview-icon>
          </button>
        </div>
        <div class="sheet-controls" *ngIf="sheets.length > 0">
          <button class="sheet-btn"
                  *ngFor="let sheet of sheets"
                  [class.active]="currentSheet === sheet"
                  (click)="switchSheet(sheet)">
            {{ sheet }}
          </button>
        </div>
        <div class="right-controls">
          <button class="tool-btn" (click)="toggleFullscreen()">
            <preview-icon [themeMode]="themeMode" name="fullscreen"></preview-icon>
          </button>
        </div>
      </div>

      <div class="preview-container">
        <div class="preview-content">
          <div class="table-wrapper"
               #tableWrapper
               (mousedown)="startDrag($event)"
               (wheel)="handleWheel($event)"
               [class.dragging]="isDragging"
               [style.transform]="'scale(' + scale + ')'">
            <table *ngIf="tableData">
              <colgroup>
                <col class="row-header-col">
                <col *ngFor="let header of tableData.headers" class="data-col">
                <col *ngFor="let i of extraColumns" class="data-col">
              </colgroup>
              <thead>
              <tr>
                <th class="corner-cell"></th>
                <th *ngFor="let header of tableData.headers; let i = index">
                  {{ getColumnName(i) }}
                </th>
                <th *ngFor="let i of extraColumns;let j=index" class="empty-column">
                  {{ getColumnName(tableData.headers.length + j) }}
                </th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let row of visibleRows; let rowIndex = index">
                <td class="row-header">{{ getRowNumber(rowIndex) }}</td>
                <td *ngFor="let cell of row; let colIndex = index"
                    [class.empty-cell]="!cell && cell !== 0">
                  {{ cell }}
                </td>
                <td *ngFor="let i of extraColumns" class="empty-cell"></td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["../../styles/_theme.scss", "excel-preview.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcelPreviewComponent extends BasePreviewComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  @ViewChild('tableWrapper') tableWrapper!: ElementRef<HTMLDivElement>;

  scale = 1;
  sheets: string[] = [];
  currentSheet = '';
  tableData: TableData = {headers: [], rows: []};
  displayRows: any[][] = [];
  extraRows = 100; // 增加额外显示的空行数
  extraColumns = Array(5).fill(0);
  visibleRows: any[][] = [];

  private workbook?: XLSX.WorkBook;
  private readonly SCALE_STEP = 0.1;
  private readonly MAX_SCALE = 3;
  private readonly MIN_SCALE = 0.1;

  isDragging = false;
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;
  private mouseMoveListener?: (e: MouseEvent) => void;
  private mouseUpListener?: (e: MouseEvent) => void;

  private readonly DEFAULT_SCALE = 1;
  private keydownListener?: (e: KeyboardEvent) => void;

  get totalColumns(): number[] {
    const total = (this.tableData.headers.length + this.extraColumns.length) || 0;
    return Array(total).fill(0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['file'] && this.file) {
      this.loadFile();
    }
  }

  ngAfterViewInit() {
    this.setupDragListeners();
    this.setupKeyboardListeners();
  }

  ngOnDestroy() {
    this.removeDragListeners();
    this.removeKeyboardListeners();
  }

  protected override async handleFileContent(content: FileReaderResponse) {
    const {data} = content
    this.workbook = XLSX.read(data, {type: 'array'});
    this.sheets = this.workbook.SheetNames;
    if (this.sheets.length > 0) {
      await this.switchSheet(this.sheets[0]);
    }
  }

  private setupDragListeners() {
    this.mouseMoveListener = (e: MouseEvent) => this.onDrag(e);
    this.mouseUpListener = () => this.stopDrag();

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
  }

  private removeDragListeners() {
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
    }
    if (this.mouseUpListener) {
      document.removeEventListener('mouseup', this.mouseUpListener);
    }
  }

  startDrag(e: MouseEvent) {
    // 如果点击的是滚动条，不启动拖动
    const wrapper = this.tableWrapper.nativeElement;
    const rect = wrapper.getBoundingClientRect();
    const isClickOnScrollbarX = e.clientY > (rect.bottom - 12);
    const isClickOnScrollbarY = e.clientX > (rect.right - 12);

    if (isClickOnScrollbarX || isClickOnScrollbarY) {
      return;
    }

    this.isDragging = true;
    this.startX = e.pageX - wrapper.offsetLeft;
    this.startY = e.pageY - wrapper.offsetTop;
    this.scrollLeft = wrapper.scrollLeft;
    this.scrollTop = wrapper.scrollTop;
  }

  private onDrag(e: MouseEvent) {
    if (!this.isDragging) return;

    e.preventDefault();
    const wrapper = this.tableWrapper.nativeElement;
    const x = e.pageX - wrapper.offsetLeft;
    const y = e.pageY - wrapper.offsetTop;
    const walkX = (x - this.startX) * 1.5; // 增加一些移动速度
    const walkY = (y - this.startY) * 1.5;

    wrapper.scrollLeft = this.scrollLeft - walkX;
    wrapper.scrollTop = this.scrollTop - walkY;
  }

  private stopDrag() {
    this.isDragging = false;
  }

  async switchSheet(sheetName: string) {
    if (!this.workbook) return;

    try {
      const worksheet = this.workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, {header: 1});

      // 确保所有行的长度一致
      const maxLength = Math.max(...jsonData.map((row: any[]) => row?.length || 0), 0);
      this.displayRows = jsonData.map((row: any[]) => {
        const paddedRow = Array.isArray(row) ? [...row] : [];
        while (paddedRow.length < maxLength) {
          paddedRow.push(null);
        }
        return paddedRow;
      });

      // 添加额外的空行
      const emptyRows = Array(this.extraRows).fill(0).map(() => Array(maxLength).fill(null));
      this.visibleRows = [...this.displayRows, ...emptyRows];

      this.tableData = {
        headers: Array(maxLength).fill(''),
        rows: this.displayRows
      };

      this.currentSheet = sheetName;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('切换工作表失败:', error);
    }
  }

  zoomIn() {
    if (this.scale < this.MAX_SCALE) {
      this.scale = Math.min(this.MAX_SCALE, this.scale + this.SCALE_STEP);
      this.applyZoom();
    }
  }

  zoomOut() {
    if (this.scale > this.MIN_SCALE) {
      this.scale = Math.max(this.MIN_SCALE, this.scale - this.SCALE_STEP);
      this.applyZoom();
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  getColumnName(index: number): string {
    let name = '';
    let num = index;

    do {
      name = String.fromCharCode(65 + (num % 26)) + name;
      num = Math.floor(num / 26) - 1;
    } while (num >= 0);

    return name;
  }

  getRowNumber(index: number): number {
    return index + 1;
  }

  handleWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY || event.detail || 0;

      if (delta < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
  }

  private applyZoom() {
    if (this.tableWrapper) {
      const wrapper = this.tableWrapper.nativeElement;

      // 保存当前滚动位置的相对百分比
      const scrollLeftPercent = wrapper.scrollLeft / (wrapper.scrollWidth - wrapper.clientWidth);
      const scrollTopPercent = wrapper.scrollTop / (wrapper.scrollHeight - wrapper.clientHeight);

      // 应用缩放
      wrapper.style.transform = `scale(${this.scale})`;

      // 在下一个事件循环中恢复滚动位置
      setTimeout(() => {
        wrapper.scrollLeft = scrollLeftPercent * (wrapper.scrollWidth - wrapper.clientWidth);
        wrapper.scrollTop = scrollTopPercent * (wrapper.scrollHeight - wrapper.clientHeight);
      });
    }
    this.cdr.markForCheck();
  }

  private setupKeyboardListeners() {
    this.keydownListener = (e: KeyboardEvent) => {
      // 按下 Ctrl/Command + 0 重置缩放
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        this.resetZoom();
      }
    };

    document.addEventListener('keydown', this.keydownListener);
  }

  private removeKeyboardListeners() {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }

  resetZoom() {
    this.scale = this.DEFAULT_SCALE;
    this.applyZoom();
  }
}
