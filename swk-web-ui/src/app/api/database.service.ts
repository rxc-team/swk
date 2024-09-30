/*
 * @Description: database服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-07 11:03:36
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:17:31
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Condition {
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

  constructor(private http: HttpClient) { }

  /**
   * @description: 获取database的所有数据
   * @return: 返回后台数据
   */
  getItems(
    datastore_id: string,
    params: {
      condition_list: Condition[];
      condition_type: string;
      page_index?: number;
      page_size?: number;
      sorts?: Array<{ sort_key: string; sort_value: string }>;
      timezone?: string;
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
  /**
   * @description: 获取database的所有数据
   * @return: 返回后台数据
   */
  printList(
    datastore_id: string,
    params: {
      condition_list: Condition[];
      condition_type: string;
      sorts?: Array<{ sort_key: string; sort_value: string }>;
    }
  ): Promise<any> {
    return this.http
      .post(`item/datastores/${datastore_id}/items/print`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: csv下载数据
   * @return: 返回后台数据
   */

  downloadCsv(
    datastore_id: string,
    jobId: string,
    params: {
      item_condition: {
        condition_list: Condition[];
        condition_type: string;
        sorts?: Array<{ sort_key: string; sort_value: string }>;
      };
    }
  ): Promise<any> {
    return this.http
      .post(`${this.url}/${datastore_id}/items/download`, params, {
        params: {
          job_id: jobId
        },
        headers: {
          token: 'true'
        },
        responseType: 'blob'
      })
      .toPromise();
  }
  /**
   * @description: csv下载数据
   * @return: 返回后台数据
   */

  mappingDownload(
    datastore_id: string,
    jobId: string,
    params: {
      item_condition: {
        condition_list: Condition[];
        condition_type: string;
        sorts?: Array<{ sort_key: string; sort_value: string }>;
      };
    },
    mappingId: string,
    encoding: string
  ): Promise<any> {
    return this.http
      .post(`mapping/datastores/${datastore_id}/download`, params, {
        params: {
          job_id: jobId,
          mapping_id: mappingId,
          download_encoding: encoding
        },
        headers: {
          token: 'true'
        },
        responseType: 'blob'
      })
      .toPromise();
  }

  /**
   * @description: 获取database的一条数据
   * @return: 返回后台数据
   */
  getItem(datastore_id: string, item_id: string, isOrigin: string = 'false'): Promise<any> {
    const params = {
      is_origin: isOrigin
    };
    return this.http
      .get(`${this.url}/${datastore_id}/items/${item_id}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
