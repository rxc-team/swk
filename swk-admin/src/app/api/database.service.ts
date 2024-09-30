/*
 * @Description: database服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-07 11:03:36
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-26 09:58:12
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface Condition {
  field_id: string;
  field_type: string;
  search_value: string | number | boolean;
  operator: string;
  condition_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  // 设置全局url
  private url = 'item/datastores';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取database的所有数据
   * @return: 返回后台数据
   */

  getItems(
    datastore_id: string,
    params: {
      condition_list: Condition[];
      condition_type: string;
      page_index: number;
      page_size: number;
      sort_key?: string;
      sort_value?: string;
    }
  ): Promise<any> {
    return this.http
      .post(`${this.url}/${datastore_id}/items/search`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
