/*
 * @Description: 履历服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-07 11:03:36
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:21:37
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 分页获取履历数据
   * @return: 返回后台数据
   */
  getHistories(param: {
    datastoreId: string;
    itemId?: string;
    historyType?: string;
    fieldId?: string;
    createdFrom?: string;
    createdTo?: string;
    oldValue?: string;
    newValue?: string;
    pageIndex: number;
    pageSize: number;
  }): Promise<any> {
    const params = {
      page_index: param.pageIndex.toString(),
      page_size: param.pageSize.toString()
    };

    if (param.itemId) {
      params['item_id'] = param.itemId;
    }
    if (param.historyType) {
      params['history_type'] = param.historyType;
    }
    if (param.fieldId) {
      params['field_id'] = param.fieldId;
    }
    if (param.createdFrom) {
      params['created_from'] = param.createdFrom;
    }
    if (param.createdTo) {
      params['created_to'] = param.createdTo;
    }
    if (param.oldValue) {
      params['old_value'] = param.oldValue;
    }
    if (param.newValue) {
      params['new_value'] = param.newValue;
    }

    return this.http
      .get(`history/datastores/${param.datastoreId}/histories`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 获取最新的10条履历数据
   * @return: 返回后台数据
   */
  getLastHistories(param: { datastoreId: string; itemId: string }): Promise<any> {
    const params = {
      item_id: param.itemId
    };
    return this.http
      .get(`history/last/datastores/${param.datastoreId}/histories`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 获取最新的10条履历数据
   * @return: 返回后台数据
   */
  getHistory(datastoreId: string, historyId: string): Promise<any> {
    return this.http
      .get(`history/datastores/${datastoreId}/histories/${historyId}/`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 分页获取履历数据
   * @return: 返回后台数据
   */
  download(param: {
    datastoreId: string;
    itemId?: string;
    historyType?: string;
    fieldId?: string;
    createdFrom?: string;
    createdTo?: string;
    oldValue?: string;
    newValue?: string;
    jobId: string;
  }): Promise<any> {
    const params = {
      job_id: param.jobId
    };

    if (param.itemId) {
      params['item_id'] = param.itemId;
    }
    if (param.historyType) {
      params['history_type'] = param.historyType;
    }
    if (param.fieldId) {
      params['field_id'] = param.fieldId;
    }
    if (param.createdFrom) {
      params['created_from'] = param.createdFrom;
    }
    if (param.createdTo) {
      params['created_to'] = param.createdTo;
    }
    if (param.oldValue) {
      params['old_value'] = param.oldValue;
    }
    if (param.newValue) {
      params['new_value'] = param.newValue;
    }

    return this.http
      .get(`history/datastores/${param.datastoreId}/download`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
