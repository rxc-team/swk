/*
 * @Description: LOGO
 * @Author: RXC 呉見華
 * @Date: 2019-04-22 10:19:55
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-08-17 14:13:16
 */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-logo',
  template: `
    <a [routerLink]="['/home']">
      <div
        [ngStyle]="{ width: width - 20 + 'px' }"
        [ngClass]="{
          'logo-horizontal': width === 200,
          'logo-vertical': width !== 200
        }"
      ></div>
    </a>
  `,
  styleUrls: ['header-logo.component.less']
})
export class HeaderLogoComponent {
  // 宽度
  @Input() width: number;
  constructor() {}
}
