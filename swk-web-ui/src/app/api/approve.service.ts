/*
 * @Description: 临时资产登录管理服务
 * @Author: RXC 廖云江
 * @Date: 2019-09-18 14:55:55
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 11:11:21
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Condition } from '@api';

// デコレータ
@Injectable({
  providedIn: 'root'
})
export class ApproveService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取审批数据
   * @return: 返回后台数据
   */
  getItems(
    params: { wf_id: string },
    body: {
      datastore_id: string;
      condition_list: Condition[];
      condition_type: string;
      search_type: string;
      status: number;
      page_index?: number;
      page_size?: number;
    }
  ): Promise<any> {
    return this.http
      .post(`approve/approves`, body, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 审批日志下载
   * @return: 返回后台数据
   */
  logDownload(
    params: { wf_id: string },
    body: {
      datastore_id: string;
      condition_list: Condition[];
      condition_type: string;
      search_type: string;
      status: number;
      page_index?: number;
      page_size?: number;
    }
  ): Promise<any> {
    return this.http
      .post(`approve/approves/log/download`, body, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 获取一条审批数据
   * @param string 台账数据ID
   * @return: 返回后台数据
   */
  getItem(exID: string, dsID: string): Promise<any> {
    return this.http
      .get(`approve/approves/${exID}`, {
        params: {
          datastore_id: dsID
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 删除审批数据
   * @param string 台账数据ID
   */
  deleteItems(items: string[]): Promise<any> {
    return this.http
      .delete(`approve/approves`, {
        params: {
          items: items
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
