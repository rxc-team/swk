/*
 * @Description: 组服务管理
 * @Author: RXC 呉見華
 * @Date: 2019-05-23 16:33:41
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-09-04 14:10:02
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private url = 'group/groups';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取组记录
   */
  getGroups(): Promise<any> {
    return this.http
      .get(this.url, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
