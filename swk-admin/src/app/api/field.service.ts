/*
 * @Description: 字段管理服务
 * @Author: RXC 廖欣星
 * @Date: 2019-06-12 16:32:12
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-04-08 16:37:25
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { objFormat } from '@shared/string/string';

// 第三方类库

export interface FieldSearchParam {
  field_name: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  // 设置全局变量url，url
  private url = 'field/datastores/${d_id}/fields';
  private fieldUrl = 'field/fields';
  private phydelUrl = 'field/phydel/datastores/${d_id}/fields';
  private recoverUrl = 'field/recover/fields';
  private sequenceUrl = 'field/current/sequence/value';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取所有的字段
   * @return: 返回后台数据
   */
  getFields(
    datastoreId: string,
    param?: {
      field_name?: string;
      field_type?: string;
      is_required?: string;
      is_fixed?: string;
      as_title?: string;
      invalidatedIn?: string;
    }
  ): Promise<any> {
    const params = {};
    if (param && param.field_name) {
      params['field_name'] = param.field_name;
    }
    if (param && param.field_type) {
      params['field_type'] = param.field_type;
    }
    if (param && param.is_required) {
      params['is_required'] = param.is_required;
    }
    if (param && param.is_fixed) {
      params['is_fixed'] = param.is_fixed;
    }
    if (param && param.as_title) {
      params['as_title'] = param.as_title;
    }
    if (param && param.invalidatedIn) {
      params['invalidated_in'] = param.invalidatedIn;
    }

    return this.http
      .get(objFormat(this.url, { d_id: datastoreId }), {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加字段
   * @return: 返回后台数据
   */
  addField(datastoreId: string, params: any): Promise<any> {
    return this.http
      .post(objFormat(this.url, { d_id: datastoreId }), params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 验证函数是否正确
   * @return: 返回后台数据
   */
  verifyFunc(params: any): Promise<any> {
    return this.http
      .post('field/func/verify', params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过字段id获取字段
   * @return: 返回后台数据
   */
  getFieldByID(datastoreId: string, fieldId: string): Promise<any> {
    return this.http
      .get(`${this.fieldUrl}/${fieldId}`, {
        params: {
          datastore_id: datastoreId
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 字段ID唯一性检查
   * @return: 返回后台数据
   */
  fieldIDAsyncValidator(datastoreId: string, fieldId: string): Promise<any> {
    const params = {};
    params['datastore_id'] = datastoreId;
    params['field_id'] = fieldId;
    return this.http
      .post(`validation/field`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过字段id更新字段
   * @return: 返回后台数据
   */
  updateField(fieldId: string, fields: any): Promise<any> {
    return this.http
      .put(`${this.fieldUrl}/${fieldId}`, fields, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 删除选中的字段
   * @return: 返回后台数据
   */
  deleteSelectFields(datastoreId: string, fieldIds: string[]): Promise<any> {
    const params = {
      field_id_list: fieldIds,
      datastore_id: datastoreId
    };
    return this.http
      .delete(this.fieldUrl, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 物理删除选中的字段
   * @return: 返回后台数据
   */
  hardDeleteSelectFields(datastoreId: string, fieldIds: string[]): Promise<any> {
    const params = {
      field_id_list: fieldIds
    };
    return this.http
      .delete(`${objFormat(this.phydelUrl, { d_id: datastoreId })}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 字段情報恢复
   * @param string[] 选中字段集合
   * @return: リクエストの結果
   */
  recoverFields(datastoreId: string, fieldIdList: string[]): Promise<any> {
    return this.http
      .put(
        `${this.recoverUrl}`,
        { datastore_id: datastoreId, field_id_list: fieldIdList },
        {
          headers: {
            token: 'true'
          }
        }
      )
      .toPromise();
  }
}
