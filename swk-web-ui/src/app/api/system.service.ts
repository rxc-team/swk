/*
 * @Description: app服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 11:12:56
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-05-20 09:11:25
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取系统更新状态
   */
  getStatus(): Promise<any> {
    return this.http.get('/system/api/v1/release').toPromise();
  }

  /**
   * @description: 获取系统更新提示情报
   */
  getInfo(): Promise<any> {
    return this.http.get('/system/api/v1/config').toPromise();
  }
}
