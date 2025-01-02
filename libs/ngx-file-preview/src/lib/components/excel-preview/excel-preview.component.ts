import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PreviewBaseComponent} from '../base/preview-base.component';
import {PreviewIconComponent} from '../preview-icon/preview-icon.component';
import * as XLSX from 'xlsx';

interface TableData {
  headers: string[];
  rows: any[][];
}

@Component({
  selector: 'fp-excel-preview',
  standalone: true,
  imports: [CommonModule, PreviewIconComponent],
  template: `
    <div class="excel-container" #container>
      <div class="toolbar">
        <div class="left-controls">
          <button class="tool-btn" (click)="zoomOut()">
            <preview-icon name="zoom-out"></preview-icon>
          </button>
          <span class="zoom-text" (click)="resetZoom()" title="点击重置缩放">
            {{ (scale * 100).toFixed(0) }}%
          </span>
          <button class="tool-btn" (click)="zoomIn()">
            <preview-icon name="zoom-in"></preview-icon>
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
            <preview-icon name="fullscreen"></preview-icon>
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
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .excel-container {
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      overflow: hidden;
    }

    .toolbar {
      height: 48px;
      min-height: 48px;
      background: #262626;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 52px 0 16px;
      border-bottom: 1px solid #303030;
      gap: 16px;
    }

    .left-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sheet-controls {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 1px;
      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .sheet-btn {
      background: #1a1a1a;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      padding: 6px 16px;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      height: 32px;
      display: flex;
      align-items: center;
      position: relative;

      &:hover {
        background: #303030;
      }

      &.active {
        background: #262626;
        color: #177ddc;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #177ddc;
        }
      }
    }

    .preview-container {
      flex: 1;
      position: relative;
      background: #262626;
      display: flex;
      height: 100%;
      flex-direction: column;
    }

    .preview-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #262626;
      overflow: hidden;

      .table-wrapper {
        width: 100%;
        height: 100%;
        overflow: auto;
        cursor: default;
        transform-origin: 0 0;

        &.dragging {
          cursor: grab;
          user-select: none;

          * {
            cursor: grab;
            user-select: none;
          }
        }

        &::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        &::-webkit-scrollbar-track {
          background: #1a1a1a;
        }

        &::-webkit-scrollbar-thumb {
          background: #404040;
          border: 2px solid #1a1a1a;
          border-radius: 6px;

          &:hover {
            background: #505050;
          }
        }
      }

      table {
        border-collapse: collapse;
        table-layout: fixed;
        background: #262626;
        color: rgba(255, 255, 255, 0.85);
        user-select: none;
        width: max-content;
        min-width: 100%;

        .row-header-col {
          width: 50px;
          min-width: 50px;
        }

        .data-col {
          width: 120px;
          min-width: 120px;
        }

        thead {
          position: sticky;
          top: -1px;
          z-index: 2;
          background: #262626;
          margin-bottom: -1px;
        }

        tbody {
          background: #262626;
        }

        th, td {
          height: 24px;
          padding: 4px 8px;
          border: 1px solid #404040;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        th {
          background: #303030;
          font-weight: 500;
          text-align: center;
          border-bottom: 2px solid #404040;
          color: rgba(255, 255, 255, 0.95);
        }

        .corner-cell {
          position: sticky;
          left: 0;
          z-index: 3;
          background: #262626;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
        }

        .row-header {
          position: sticky;
          left: 0;
          background: #303030;
          text-align: center;
          font-weight: 500;
          z-index: 1;
          border-right: 2px solid #404040;
          color: rgba(255, 255, 255, 0.95);
        }

        td {
          background: #262626;
          text-align: left;

          &.empty-cell {
            color: transparent;
          }
        }

        tbody tr:hover {
          td {
            background: #303030;

            &.empty-cell {
              background: #2a2a2a;
            }

            &.row-header {
              background: #404040;
            }
          }
        }
      }

      &::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }

      &::-webkit-scrollbar-track {
        background: #1a1a1a;
      }

      &::-webkit-scrollbar-thumb {
        background: #404040;
        border: 2px solid #1a1a1a;
        border-radius: 6px;

        &:hover {
          background: #505050;
        }
      }
    }

    .tool-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      width: 32px;
      height: 32px;
      padding: 0;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: #303030;
        color: #177ddc;
      }
    }

    .zoom-text {
      color: rgba(255, 255, 255, 0.85);
      font-size: 13px;
      min-width: 48px;
      text-align: center;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      
      &:hover {
        background: #303030;
        color: #177ddc;
      }
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(26, 26, 26, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #262626;
      border-top-color: #177ddc;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcelPreviewComponent extends PreviewBaseComponent implements OnChanges, AfterViewInit, OnDestroy {
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

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['file'] && this.file) {
      this.handleFile();
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

  async handleFile() {
    this.isLoading = true;
    try {
      const response = await fetch(this.file.url);
      console.log("response", response);
      const arrayBuffer = await response.arrayBuffer();

      this.workbook = XLSX.read(arrayBuffer, {type: 'array'});
      this.sheets = this.workbook.SheetNames;

      if (this.sheets.length > 0) {
        await this.switchSheet(this.sheets[0]);
      }
    } catch (error) {
      console.error('Excel文件预览失败:', error);
      this.handleError(error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
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
      this.handleError(error);
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
