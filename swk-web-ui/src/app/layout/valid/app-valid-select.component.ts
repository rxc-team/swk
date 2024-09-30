/*
 * @Description: valid app select
 * @Author: RXC 廖云江
 * @Date: 2020-04-23 16:44:40
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-05-20 09:23:56
 */
import { differenceInCalendarDays, format, parse } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';

import { Component, OnInit } from '@angular/core';
import { AppService } from '@api';
import { TokenStorageService } from '@core';

@Component({
  selector: 'app-valid-select',
  templateUrl: './app-valid-select.component.html',
  styles: [
    `
      [nz-radio] {
        display: block;
      }
    `
  ]
})
export class AppValidSelectComponent implements OnInit {
  selectedAppId = '';

  style = {
    display: 'block',
    height: '30px',
    lineHeight: '30px'
  };

  // APP使用剩余日数表示关联变量
  today = new Date();

  // 所有app选项
  appsOption: any[] = [];

  constructor(private tokenService: TokenStorageService, private appService: AppService, private eventBus: NgEventBus) {}
  ngOnInit(): void {
    this.getAppsOption();
  }

  /**
   * @description: 当前登录用户的APP选项
   */
  async getAppsOption() {
    await this.appService.getUserApps().then((data: any[]) => {
      if (data) {
        this.appsOption = data;
        this.appsOption.forEach(app => {
          const endDate = new Date(app.end_time).getTime();
          const nowDate = new Date(format(new Date(), 'yyyy-MM-dd')).getTime();
          if (nowDate > endDate) {
            app['isValid'] = false;
          } else {
            app['isValid'] = true;
          }
        });
      } else {
        this.appsOption = [];
      }
    });
  }

  /**
   * @description: 获取有效天数
   */
  getValidDays(startTime: any, endTime: string): number {
    const startDate = parse(startTime, 'yyyy-MM-dd', new Date());
    const endDate = parse(endTime, 'yyyy-MM-dd', new Date());
    return differenceInCalendarDays(endDate, startDate);
  }

  /**
   * @description: App改变事件
   * @param string 更改的appID
   */
  async change() {
    await this.tokenService.updateUser({ current_app: this.selectedAppId });
    this.eventBus.cast('refresh:app', this.selectedAppId);
  }

  logout() {
    this.tokenService.signOut('app');
  }
}
