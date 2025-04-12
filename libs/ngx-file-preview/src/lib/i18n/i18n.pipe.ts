import {Optional, Pipe} from "@angular/core";
import {PreviewService} from "../services";

@Pipe({
  name: 'i18n',
  standalone: true
})
export class I18nPipe {
  constructor(private previewService: PreviewService) {
  }
  transform(key: string, ...args:any[]): string {
    const parser = this.previewService.getLangParser();
    return parser.t(key,...args);
  }
}
