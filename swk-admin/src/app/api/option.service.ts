/*
 * @Description: 选项管理服务
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 10:45:46
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-08-25 14:34:49
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OptionService {
  private url = 'option/options';
  private labelUrl = 'option/label/options';
  private phydelUrl = 'option/phydel/options';
  private recoverUrl = 'option/recover/options';
  private downloadUrl = 'option/download/options';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取所有选项
   * @param optionName string
   * @param optionMemo string
   * @return: 返回后台数据
   */
  getOptions(appID?: string, optionName?: string, optionMemo?: string, invalidatedIn?: string): Promise<any> {
    const params = {};
    if (appID) {
      params['app_id'] = appID;
    }
    if (optionName) {
      params['option_name'] = optionName;
    }
    if (optionMemo) {
      params['option_memo'] = optionMemo;
    }
    if (invalidatedIn) {
      params['invalidated_in'] = invalidatedIn;
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
   * @description: 获取全部option选项值
   * @return: 返回后台数据
   */
  getAllOptionLabels(): Promise<any> {
    return this.http
      .get(`${this.labelUrl}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过选项ID获取选项
   * @param optionId string
   * @return: 返回后台数据
   */
  getOptionsByCode(optionId: string, invalidatedIn?: string): Promise<any> {
    const params = {};
    if (invalidatedIn) {
      params['invalidated_in'] = invalidatedIn;
    }
    return this.http
      .get(`${this.url}/${optionId}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 选项ID唯一性检查
   * @param optionId string
   * @return: 返回后台数据
   */
  optionValueAsyncValidator(optionId: string, optionValue: string, invalidatedIn?: string): Promise<any> {
    const params = {};
    params['id'] = optionId;
    params['value'] = optionValue;
    return this.http
      .post(`validation/option`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加选项
   * @param params any
   * @return: 返回后台选项数据
   */
  addOption(params: any): Promise<any> {
    return this.http
      .post(this.url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 删除选中选项
   * @param options string[]
   * @return: 返回后台选项数据
   */
  deleteSelectOptions(options: string[]): Promise<any> {
    const params = {
      option_id_list: options
    };
    return this.http
      .delete(this.url, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 物理删除选中选项
   * @param options string[]
   * @return: 返回后台选项数据
   */
  harddeleteSelectOptions(options: string[]): Promise<any> {
    const params = {
      option_id_list: options
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

  /**
   * @description: 通过选项ID和选项值，删除指定选项值数据
   * @param optionId any
   * @param val any
   * @return: 返回后台选项数据
   */
  deleteOptionsByCodeVal(optionId: string, val: string): Promise<any> {
    return this.http
      .delete(`${this.url}/${optionId}/values/${val}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 通过选项ID和选项值，物理删除指定选项值数据
   * @param optionId any
   * @param val any
   * @return: 返回后台选项数据
   */
  hardDeleteOptionsByCodeVal(optionId: string, val: string): Promise<any> {
    return this.http
      .delete(`${this.phydelUrl}/${optionId}/values/${val}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 通过选项ID和选项值，恢复指定选项值数据
   * @param optionId any
   * @param val any
   * @return: 返回后台选项数据
   */
  recoverOptionsByCodeVal(optionId: string, val: string): Promise<any> {
    return this.http
      .put(`${this.recoverUrl}/${optionId}/values/${val}`, null, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 选项组情報恢复
   * @param string[] 选中选项组集合
   * @return: リクエストの結果
   */
  recoverOptions(optionIdList: string[]): Promise<any> {
    return this.http
      .put(
        `${this.recoverUrl}`,
        { option_id_list: optionIdList },
        {
          headers: {
            token: 'true'
          }
        }
      )
      .toPromise();
  }
  /**
   * @description: 选项组情報恢复
   * @param string[] 选中选项组集合
   * @return: リクエストの結果
   */
  downloadCSVOptions(option_name: string, option_memo: string, invalidatedIn: string): Promise<any> {
    const params = {
      option_name: option_name,
      option_memo: option_memo,
      invalidatedIn: invalidatedIn
    };
    return this.http
      .get(`${this.downloadUrl}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
