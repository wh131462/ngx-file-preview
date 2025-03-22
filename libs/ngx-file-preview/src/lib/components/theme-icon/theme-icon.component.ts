import {Component, Input} from '@angular/core';
import { ThemeMode } from '../../types';

@Component({
  selector: 'ngx-theme-icon',
  standalone: true,
  imports: [],
  templateUrl: './theme-icon.component.html',
  styleUrl: './theme-icon.component.scss'
})
export class ThemeIconComponent {
  @Input() themeMode: ThemeMode|null = 'auto'
}
