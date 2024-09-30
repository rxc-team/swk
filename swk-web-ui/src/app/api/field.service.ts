/*
 * @Description: 字段服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 11:47:58
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2021-01-21 13:52:03
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { objFormat } from '@shared/string/string';

// 第三方类库

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  // 设置全局url
  private url = 'field/datastores/${d_id}/fields';
  private appFieldsUrl = 'field/app/fields';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取App所有的字段
   * @return: 返回后台数据
   */
  getAppFields(fieldType?: string, lookupDatastoreId?: string): Promise<any> {
    const params = {
      needRole: 'true'
    };

    if (fieldType) {
      params['field_type'] = fieldType;
    }
    if (lookupDatastoreId) {
      params['lookup_datastore_id'] = lookupDatastoreId;
    }

    return this.http
      .get(this.appFieldsUrl, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 获取所有的字段
   * @return: 返回后台数据
   */
  getFields(datastoreId: string): Promise<any> {
    const params = {
      needRole: 'true'
    };

    return this.http
      .get(objFormat(this.url, { d_id: datastoreId }), {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

}
