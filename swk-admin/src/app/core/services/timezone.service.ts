/*
 * @Description: 主题服务
 * @Author: RXC 呉見華
 * @Date: 2019-04-22 10:19:55
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-09-10 09:21:10
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimeZoneService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取时区
   * @return: 时区列表
   */
  getTimeZones() {
    return this.http.get('assets/timezone/zone.json').toPromise();
  }
}
