import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {PreviewFile} from "../types";

interface FileReaderResponse {
  type: 'success' | 'error';
  data?: ArrayBuffer;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileReaderService {
  private worker: Worker;
  private responseSubject = new Subject<FileReaderResponse>();

  constructor() {
    this.worker = new Worker(
      new URL('../workers/file-reader.worker', import.meta.url),
      {type: 'module'}
    );

    this.worker.onmessage = ({data}: MessageEvent<FileReaderResponse>) => {
      this.responseSubject.next(data);
    };

    this.worker.onerror = (error) => {
      this.responseSubject.next({
        type: 'error',
        error: error.message
      });
    };
  }

  readFile(file: PreviewFile, fileType: 'arraybuffer' | 'text' | 'json' = 'arraybuffer'): Observable<FileReaderResponse> {
    this.worker.postMessage({
      type: 'readFile',
      url: file.url,
      fileType
    });
    return this.responseSubject.asObservable();
  }

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}
