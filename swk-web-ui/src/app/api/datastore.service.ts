/*
 * @Description: datastore服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 15:22:10
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:17:43
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {
  // 设置全局url
  private url = 'datastore/datastores';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取所有的datastore
   * @return: 返回后台接口数据
   */
  getDatastores(param?: { showInMenu: string }): Promise<any> {
    const params = {
      needRole: 'true'
    };
    if (param && param.showInMenu) {
      params['show_in_menu'] = param.showInMenu;
    }
    return this.http
      .get(this.url, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 根据id获取台账信息
   *  @return: 返回后台接口数据
   */
  getDatastoreByID(datastoresId: string): Promise<any> {
    return this.http
      .get(`${this.url}/${datastoresId}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 根据apikey获取台账信息
   *  @return: 返回后台接口数据
   */
  getDatastoreByKey(apiKey: string): Promise<any> {
    return this.http
      .get(`datastore/key/datastores/${apiKey}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
