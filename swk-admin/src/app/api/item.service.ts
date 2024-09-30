/*
 * @Description: 字段服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 16:31:32
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:56:04
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// 第三方类库
import { objFormat } from '@shared/string/string';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  // 设置全局url
  private url = 'item/datastores/${d_id}/items';
  private resetUrl = 'item/apps/${app_id}/inventory/reset';

  constructor(private http: HttpClient) { }

  /**
   * @description: 盘点台账盘点数据盘点状态重置
   * @return: 返回后台数据
   */
  resetInventoryItems(appId: string): Promise<any> {
    return this.http
      .patch(`${objFormat(this.resetUrl, { app_id: appId })}`, {}, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 更新所有者
   * @return: 返回后台数据
   */
  changeOwner(datastoreId: string, params: { old_owner: string; new_owner: string }): Promise<any> {
    return this.http
      .patch(`${objFormat(this.url, { d_id: datastoreId })}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 获取database的所有数据
   * @return: 返回后台数据
   */
  getItems(
    datastore_id: string,
    params: {
      condition_list: any[];
      condition_type: string;
      page_index: number;
      page_size: number;
      sort_key?: string;
      sort_value?: string;
    },
    access_key?: string[]
  ): Promise<any> {
    return this.http
      .post(`${objFormat(this.url, { d_id: datastore_id })}/search`, params, {
        params: {
          access_key: access_key
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
