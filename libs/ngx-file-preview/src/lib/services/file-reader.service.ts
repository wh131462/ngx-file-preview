import {Injectable} from '@angular/core';
import {Observable, Subject, from} from 'rxjs';
import {PreviewFile} from "../types";

export interface FileReaderResponse {
  type: 'success' | 'error';
  data?: ArrayBuffer;
  text?: string;
  json?: any;
  error?: string;
}

@Injectable()
export class FileReaderService {
  private responseSubject = new Subject<FileReaderResponse>();
  private async readFileData(file: PreviewFile, fileType: 'arraybuffer' | 'text' | 'json'): Promise<FileReaderResponse> {
    try {
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: FileReaderResponse = { type: 'success' };

      switch (fileType) {
        case 'arraybuffer':
          result.data = await response.arrayBuffer();
          break;
        case 'text':
          result.text = await response.text();
          break;
        case 'json':
          const text = await response.text();
          try {
            result.json = JSON.parse(text);
          } catch (parseError: any) {
            throw new Error(`JSON parse failed: ${parseError.message}`);
          }
          break;
      }

      return result;
    } catch (error) {
      return {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  readFile(file: PreviewFile, fileType: 'arraybuffer' | 'text' | 'json' = 'arraybuffer'): Observable<FileReaderResponse> {
    return from(this.readFileData(file, fileType));
  }

  ngOnDestroy() {
    this.responseSubject.complete();
  }
}
