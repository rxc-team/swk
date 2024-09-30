/*
 * @Description: 仪表盘服务管理
 * @Author: RXC 呉見華
 * @Date: 2019-07-31 17:47:21
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-06-11 11:57:11
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  // 设置全局url
  private url = 'print/prints';

  constructor(private http: HttpClient) {}

  /**
   * @description: 通过台账ID获取台账打印设置
   * @return: 返回后台数据
   */
  getPrintById(datastoreId: string): Promise<any> {
    return this.http
      .get(`${this.url}/${datastoreId}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加台账打印设置
   * @return: 返回后台数据
   */
  addPrint(params: {
    datastore_id: string;
    fields: any[];
    show_sign: boolean;
    sign_name1: string;
    sign_name2: string;
    show_system: boolean;
  }): Promise<any> {
    return this.http
      .post(this.url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 修改打印设置
   * @return: 返回后台数据
   */
  updatePrint(
    datastoreId: string,
    params: {
      fields: any[];
      show_sign: string;
      sign_name1: string;
      sign_name2: string;
      show_system: string;
    }
  ): Promise<any> {
    return this.http
      .put(`${this.url}/${datastoreId}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
