/*
 * @Description: LOGO
 * @Author: RXC 呉見華
 * @Date: 2019-04-22 10:19:55
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-21 10:55:25
 */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-logo',
  template: `
    <a [routerLink]="['/home']">
      <div [ngStyle]="{ width: width + 'px' }" style="display: inline-block;">
        <img
          [src]="logoUrl ? logoUrl : 'assets/themes/default/image/logo/logo.horizontal.svg'"
          style="padding:4px;"
          width="100%"
          height="50"
        />
      </div>
    </a>
  `
})
export class HeaderLogoComponent {
  // 宽度
  @Input() width: number;
  @Input() logoUrl: string;
  constructor() {}
}
