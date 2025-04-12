import { Component, Input } from '@angular/core';
import {NgForOf} from "@angular/common";

interface TableHeaders {
  property: string;
  description: string;
  type: string;
  default: string;
}

@Component({
  selector: 'app-api-table',
  standalone: true,
  template: `
    <div class="api-table">
      <h2>{{ title }}</h2>
      <table>
        <thead>
        <tr>
          <th>{{ headers[lang].property }}</th>
          <th>{{ headers[lang].description }}</th>
          <th>{{ headers[lang].type }}</th>
          <th>{{ headers[lang].default }}</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let item of apiItems">
          <td>{{ item.name }}</td>
          <td>{{ item.description }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.default }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  `,
  imports: [
    NgForOf
  ],
  styles: [`
    .api-table {
      margin: 24px 0;

      h2 {
        font-size: 20px;
        margin-bottom: 16px;
        color: #333;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        background: #fff;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        overflow: hidden;
      }

      th, td {
        padding: 16px;
        text-align: left;
        border-bottom: 1px solid #f0f0f0;
      }

      th {
        background: #fafafa;
        font-weight: 500;
        color: #333;
      }

      td {
        color: #666;
      }

      tr:last-child td {
        border-bottom: none;
      }
    }
  `]
})
export class ApiTableComponent {
  @Input() title: string = '';
  @Input() lang: 'zh' | 'en' = 'zh';
  @Input() apiItems: Array<{
    name: string;
    description: string;
    type: string;
    default: string;
  }> = [];

  headers: Record<'zh' | 'en', TableHeaders> = {
    zh: {
      property: '属性/事件',
      description: '说明',
      type: '类型',
      default: '默认值'
    },
    en: {
      property: 'Property/Event',
      description: 'Description',
      type: 'Type',
      default: 'Default'
    }
  };
}
