/*
 * @Description: datastore管理服务
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 09:38:28
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-12-17 16:51:16
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {
  // 设置全局url
  private url = 'datastore/datastores';
  private phydelurl = 'datastore/phydel/datastores';

  constructor(private http: HttpClient) {}
  /**
   * @description: 获取所有的datastore
   * @return: 返回后台接口数据
   */
  getDatastores(param?: { appID?: string; datastoreName?: string; apiKey?: string; canCheck?: string; showInMenu?: string }): Promise<any> {
    const params = {};
    if (param && param.appID) {
      params['app_id'] = param.appID;
    }
    if (param && param.datastoreName) {
      params['datastore_name'] = param.datastoreName;
    }
    if (param && param.apiKey) {
      params['api_key'] = param.apiKey;
    }
    if (param && param.canCheck) {
      params['can_check'] = param.canCheck;
    }
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
   * @description: 台账apiKey唯一性检查
   * @return: 返回后台接口数据
   */
  datastoreIDAsyncValidator(param: { appID?: string; apiKey: string }): Promise<any> {
    const params = {};
    if (param && param.appID) {
      params['app_id'] = param.appID;
    }
    if (param && param.apiKey) {
      params['api_key'] = param.apiKey;
    }
    return this.http
      .post(`validation/datastoreapikey`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 根据id删除datastore
   * @return: 返回后台接口数据
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
   * @description: 添加一个datastore
   * @return: 返回后台接口数据
   */
  addDatastore(params: any): Promise<any> {
    return this.http
      .post(this.url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加一个datastore
   * @return: 返回后台接口数据
   */
  addUniqueKey(datastoresId: string, params: any): Promise<any> {
    return this.http
      .post(`datastore/datastores/${datastoresId}/unique`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加一个datastore
   * @return: 返回后台接口数据
   */
  getRelations(datastoresId: string): Promise<any> {
    return this.http
      .get(`datastore/datastores/${datastoresId}/relation`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加一个datastore
   * @return: 返回后台接口数据
   */
  addRelation(datastoresId: string, params: any): Promise<any> {
    return this.http
      .post(`datastore/datastores/${datastoresId}/relation`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 更新datastore
   * @return: 返回后台接口数据
   */
  updateDatastore(datastoresId: string, params: any): Promise<any> {
    return this.http
      .put(`${this.url}/${datastoresId}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 更新datastore菜单排序顺序
   * @return: 返回后台接口数据
   */
  updateDatastoreSort(params: any): Promise<any> {
    return this.http
      .put(`${this.url}/sort`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 物理删除多个台账
   * @param reports string[]
   * @return: 返回后台数据
   */
  harddeleteSelectDatastores(datastores: string[]): Promise<any> {
    const params = {
      datastore_id_list: datastores
    };
    return this.http
      .delete(`${this.phydelurl}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加一个datastore
   * @return: 返回后台接口数据
   */
  deleteUniqueKey(datastoresId: string, unique: string): Promise<any> {
    return this.http
      .delete(`datastore/datastores/${datastoresId}/unique/${unique}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  0;
  /**
   * @description: 添加一个datastore
   * @return: 返回后台接口数据
   */
  deleteRelation(datastoresId: string, relationId: string): Promise<any> {
    return this.http
      .delete(`datastore/datastores/${datastoresId}/relation/${relationId}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
