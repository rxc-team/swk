/*
 * @Description: 共通服务管理
 * @Author: RXC 呉見華
 * @Date: 2019-04-15 11:51:28
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-06-18 13:32:40
 */
import { format, getTime, parse } from 'date-fns';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { DatastoreService } from '@api';
import { environment } from '@env/environment';

import { TokenStorageService } from './token.service';

export interface SelectItem {
  label: string;
  value: string;
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class CommonService {
  constructor(private datastoreService: DatastoreService, private tokenService: TokenStorageService) {}

  /**
   * @description: 获取台账的名称
   * @return: 返回台账名称
   */
  async getDsName(datastoreId: string) {
    const dsList: Array<SelectItem> = [];
    // 获取台账数据
    await this.datastoreService.getDatastores().then((data: any[]) => {
      if (data) {
        data.forEach(async ds => {
          dsList.push({ label: ds.datastore_name, value: ds.datastore_id });
        });
      }
    });
    for (let index = 0; index < dsList.length; index++) {
      const element = dsList[index];
      if (element.value === datastoreId) {
        return element.label;
      }
    }
    return '';
  }

  formatDate(value: any, fs?: string): string {
    const timezone = Number(this.tokenService.getUserTimeZone().substring(15));
    // 目标时区时间 = 本地时区时间 + 本地时区时差 - 目标时区时差
    const date = parse(value.slice(0, 19), 'yyyy-MM-dd HH:mm:ss', new Date());
    const time = getTime(date) - timezone * 60 * 60 * 1000;

    return format(time, fs);
  }

  /**
   * @description: 根据快照获取URL地址
   * @param ActivatedRouteSnapshot 路由
   * @return: URL地址
   */
  getUrl(route: ActivatedRouteSnapshot): string {
    let next = this.getTruthRoute(route);
    const segments = [];
    while (next) {
      segments.push(next.url.join('/'));
      next = next.parent;
    }
    const url =
      '/' +
      segments
        .filter(i => i)
        .reverse()
        .join('/');
    return url;
  }

  /**
   * @description: 获取下一个子路由
   * @param ActivatedRouteSnapshot 路由
   * @return: 返回下一个子路由
   */
  getTruthRoute(route: ActivatedRouteSnapshot) {
    let next = route;
    while (next.firstChild) {
      next = next.firstChild;
    }
    return next;
  }
}
