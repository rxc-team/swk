/*
 * @Description: 进程服务
 * @Author: RXC 陳平
 * @Date: 2020-06-23 16:35:47
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-17 17:59:35
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取所有进程
   * @return: 返回后台数据
   */
  getProcesses(userId: string): Promise<any> {
    return this.http
      .get(`process/processes/${userId}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 获取所有节点
   * @return: 返回后台数据
   */
  getNodes(): Promise<any> {
    return this.http
      .get(`process/node`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
