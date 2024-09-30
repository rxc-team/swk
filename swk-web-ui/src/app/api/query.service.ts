/*
 * @Description: 快捷方式服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-06-13 11:11:38
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-07-31 14:00:04
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  // 设置全局url
  private url = 'query/queries';

  constructor(private http: HttpClient) {}

  /**
   * @description: 通过app_id获取所有的快捷方式
   * @return: 返回后台数据
   */
  getQueries(): Promise<any> {
    return this.http
      .get(this.url, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 快捷方式名称唯一性检查
   * @return: 返回后台数据
   */
  queryNameAsyncValidator(queryName: string): Promise<any> {
    const params = {};
    params['name'] = queryName;
    return this.http
      .post(`validation/queryname`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过id获取快捷方式
   * @return: 返回后台数据
   */
  getQueryById(id: string): Promise<any> {
    return this.http
      .get(`${this.url}/${id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 通过id删除快捷方式
   * @return: 返回后台数据
   */
  deleteQuery(id: string): Promise<any> {
    return this.http
      .delete(`${this.url}/${id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 添加快捷方式
   * @return: 返回后台数据
   */
  addQuery(params: {
    datastore_id: string;
    query_name: string;
    description: string;
    conditions: any[];
    fields: string[];
    condition_type: string;
  }): Promise<any> {
    return this.http
      .post(this.url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
