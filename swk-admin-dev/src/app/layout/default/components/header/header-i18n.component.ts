/*
 * @Description: 语言切换
 * @Author: RXC 呉見華
 * @Date: 2019-08-05 17:48:24
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-06 17:30:38
 */

import { Component, Input } from '@angular/core';
import { I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-header-i18n',
  template: `
    <li nz-submenu *ngIf="nxShowText" style="width:120px">
      <span title>
        <i nz-icon nzType="global"></i>
      </span>
      <ul nz-menu>
        <li nz-menu-item *ngFor="let item of langs" [nzSelected]="item.code === currentLangCd" (click)="change(item.code)">
          <span role="img" [attr.aria-label]="item.text" class="pr-xs">
            {{ item.abbr }}
          </span>
          {{ item.text }}
        </li>
      </ul>
    </li>
    <span
      *ngIf="!nxShowText"
      class="menu"
      [style.width]="'41px'"
      nz-popover
      nzType="primary"
      nzPopoverPlacement="bottom"
      nzPopoverTrigger="hover"
      [nzPopoverTitle]="null"
      [nzPopoverContent]="langList"
    >
      <i nz-icon nzType="global"></i>
    </span>
    <ng-template #langList>
      <ul nz-menu>
        <li nz-menu-item *ngFor="let item of langs" [nzSelected]="item.code === currentLangCd" (click)="change(item.code)">
          <span role="img" [attr.aria-label]="item.text" class="pr-xs">{{ item.abbr }}</span>
          {{ item.text }}
        </li>
      </ul>
    </ng-template>
  `,
  styleUrls: ['header-i18n.component.less'],
  styles: [
    `
      :host .nx-header-menu .ant-menu-inline,
      .ant-menu-vertical,
      .ant-menu-vertical-left {
        border-right: none;
      }

      ::ng-deep .ant-popover-inner-content {
        padding: 0;
      }
    `
  ]
})
export class HeaderI18nComponent {
  @Input() nxShowText = false;

  currentLangCd = '';

  constructor(private i18n: I18NService, private tokenService: TokenStorageService) {
    this.currentLangCd = tokenService.getUserLang();
  }

  /**
   * @description: 获取当前语言列表
   */
  get langs() {
    return this.i18n.getLangs();
  }

  /**
   * @description: 语言切换
   */
  change(lang: string) {
    this.currentLangCd = lang;
    this.i18n.switchLanguage(lang);
  }
}
