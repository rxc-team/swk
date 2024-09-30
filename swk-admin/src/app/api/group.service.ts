/*
 * @Description: 组管理服务
 * @Author: RXC 廖欣星
 * @Date: 2019-05-24 13:51:56
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:51:35
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private Url = 'group/groups';
  private phydelUrl = 'group/phydel/groups';

  constructor(private http: HttpClient) {}

  /**
   * @description: 查询所有的用户组
   * @param groupName string
   * @return: 返回后台数据
   */
  getGroups(groupName?: string): Promise<any> {
    const params = {};
    if (groupName) {
      params['group_name'] = groupName;
    }
    return this.http
      .get(this.Url, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过用户组ID，获取单个用户组
   * @param gid string
   * @return: 返回后台数据
   */
  getGroupById(gid: string): Promise<any> {
    return this.http
      .get(`${this.Url}/${gid}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加用户组
   * @param params any
   * @return: 返回后台数据
   */
  addGroup(params: any): Promise<any> {
    return this.http
      .post(this.Url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过用户组ID,更新单个用户组信息
   * @param gid string
   * @param params any
   * @return: 返回后台数据
   */
  updateGroup(gid: string, params: any): Promise<any> {
    return this.http
      .put(`${this.Url}/${gid}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 物理删除选中组
   * @param groups string[]
   * @return: 返回后台数据
   */
  hardDeleteSelectGroups(groups: string[]): Promise<any> {
    const params = {
      group_id_list: groups
    };
    return this.http
      .delete(`${this.phydelUrl}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
