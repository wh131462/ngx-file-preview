import {Component, CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ThemeMode} from "../../types/theme.types";

@Component({
  selector: "preview-icon",
  template: `
    <ng-container *ngIf="name">
      <i class="fp-font-icon NGX-FILE-PREVIEW" [class]="'nfp-'+name"
         [style.width]="size" [style.font-size]="size"
         [style.color]="color ? color: (themeMode=='light'?'#333333':'#FFFFFF')"></i>
    </ng-container>
    <ng-container *ngIf="svg">
      <svg class="fp-svg-icon" [style.width]="size" [style.height]="size" aria-hidden="true">
        <use [attr.xlink:href]="'#nfp-' + svg">"></use>
      </svg>
    </ng-container>
  `,
  styles: [`:host {
    display: inline-block;
    line-height: 0;

    .fp-svg-icon {
      width: 1em;
      height: 1em;
      vertical-align: -0.15em;
      fill: currentColor;
      overflow: hidden;
    }

    .fp-font-icon {
      color: #FFFFFF;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      aspect-ratio: 1;
      overflow: hidden;
    }
  }
  `],
  imports: [CommonModule],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class PreviewIconComponent {
  @Input() name: string = "";
  @Input() svg: string = "";
  @Input({transform: (v: any) => typeof v === 'number' ? `${v}px` : v}) size: number | string = '16px';
  @Input() color?: string;
  @Input() themeMode?: ThemeMode | null;
}
