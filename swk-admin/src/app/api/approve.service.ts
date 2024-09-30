/*
 * @Description: 临时资产登录管理服务
 * @Author: RXC 廖云江
 * @Date: 2019-09-18 14:55:55
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 11:11:21
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
  getItems(params: { wf_id: string; status: string }): Promise<any> {
    return this.http
      .get(`approve/approves`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
