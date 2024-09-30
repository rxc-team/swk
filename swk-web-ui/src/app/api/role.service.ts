/*
 * @Description: 角色服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-04-28 16:55:32
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:25:44
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RoleService {
  // 设置全局url
  private roleUrl = 'role/roles';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取所有角色
   * @return: 返回后台数据
   */
  getRoles(): Promise<any> {
    const url = `${this.roleUrl}`;
    return this.http
      .get(url, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 获取的权限
   * @return: 返回后台数据
   */
  getUserAction(): Promise<any> {
    return this.http
      .get(`role/user/roles/actions`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
