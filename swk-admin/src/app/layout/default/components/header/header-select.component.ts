/*
 * @Description: 选择app
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 14:39:30
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-21 10:56:48
 */

import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TokenStorageService } from '@core';

@Component({
  selector: 'app-header-select',
  templateUrl: './header-select.component.html',
  styleUrls: ['./header-select.component.less']
})
export class HeaderSelectComponent {
  // APP改变事件
  @Output() appChange: EventEmitter<any> = new EventEmitter();
  // 所有app选项
  @Input() apps: any[];

  currentApp = '';

  constructor(private bs: NzBreakpointService, private eventBus: NgEventBus, private tokenService: TokenStorageService) {
    this.currentApp = this.tokenService.getUserApp();

    eventBus.on('refresh:app').subscribe((appId: string) => {
      this.currentApp = appId;
      this.appChange.emit(appId);
    });

    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'xs') {
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });
  }

  isSmall = false;
  /**
   * @description: App改变事件
   * @param string 更改的appID
   */
  async change(value: string) {
    this.currentApp = value;
    await this.tokenService.updateUser({ current_app: value });
    this.appChange.emit(value);
  }
}
