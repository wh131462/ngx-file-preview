import {Pipe} from "@angular/core";
import {PreviewUtils} from "../utils";

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe {
  transform(size: number|undefined): string {
    return PreviewUtils.formatFileSize(size);
  }
}
