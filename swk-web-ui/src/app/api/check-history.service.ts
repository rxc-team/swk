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
export class CheckHistoryService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 分页获取履历数据
   * @return: 返回后台数据
   */
  getHistories(param: {
    datastoreId: string;
    itemId?: string;
    checkType?: string;
    checkStartDate?: string;
    checkedAtFrom?: string;
    checkedAtTo?: string;
    checkedBy?: string;
    pageIndex: number;
    pageSize: number;
  }): Promise<any> {
    const body = {
      item_id: param.itemId ? param.itemId : '',
      check_type: param.checkType ? param.checkType : '',
      check_start_date: param.checkStartDate ? param.checkStartDate : '',
      checked_at_from: param.checkedAtFrom ? param.checkedAtFrom : '',
      checked_at_to: param.checkedAtTo ? param.checkedAtTo : '',
      checked_by: param.checkedBy ? param.checkedBy : '',
      page_index: param.pageIndex,
      page_size: param.pageSize
    };

    return this.http
      .post(`checkhistory/datastores/${param.datastoreId}/histories`, body, {
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
    checkType?: string;
    checkStartDate?: string;
    checkedAtFrom?: string;
    checkedAtTo?: string;
    checkedBy?: string;
    jobId: string;
  }): Promise<any> {
    const body = {
      item_id: param.itemId ? param.itemId : '',
      check_type: param.checkType ? param.checkType : '',
      check_start_date: param.checkStartDate ? param.checkStartDate : '',
      checked_at_from: param.checkedAtFrom ? param.checkedAtFrom : '',
      checked_at_to: param.checkedAtTo ? param.checkedAtTo : '',
      checked_by: param.checkedBy ? param.checkedBy : '',
      job_id: param.jobId
    };
    const queryParams = {
      job_id: param.jobId
    };
    return this.http
      .post(`checkhistory/datastores/${param.datastoreId}/download`, body, {
        params: queryParams,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
