/*
 * @Description: mapping管理服务
 * @Author: RXC 吴见华
 * @Date: 2020-04-17 09:38:28
 * @LastEditors: RXC 吴见华
 * @LastEditTime: 2020-04-17 15:08:50
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MappingService {
  // 设置全局url
  private url = 'datastore/datastores';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取台账mapping
   * @return: 返回后台接口数据
   */
  getMapping(datastoreID: string, mappingID: string): Promise<any> {
    return this.http
      .get(`${this.url}/${datastoreID}/mappings/${mappingID}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加台账mapping
   * @return: 返回后台接口数据
   */
  addMapping(datastoresId: string, param: any): Promise<any> {
    return this.http
      .post(`${this.url}/${datastoresId}/mappings`, param, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 修改台账的mapping
   * @return: 返回后台接口数据
   */
  updateMapping(datastoresId: string, mappingID: string, param: any): Promise<any> {
    return this.http
      .put(`${this.url}/${datastoresId}/mappings/${mappingID}`, param, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 删除台账的mapping
   * @return: 返回后台接口数据
   */
  deleteMapping(datastoresId: string, mappingID: string): Promise<any> {
    return this.http
      .delete(`${this.url}/${datastoresId}/mappings/${mappingID}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
