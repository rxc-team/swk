/*
 * @Description: 选项服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 10:55:38
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:24:24
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OptionService {
  // 设置全局url
  Url = 'options';

  constructor(private http: HttpClient) {}


  /**
   * @description: 通过code获取option
   * @return: 返回后台数据
   */
  getOptionsByCode(code: string, invalidated_in?: string): Promise<any> {
    const params = {
      invalidated_in: invalidated_in ? invalidated_in : ''
    };
    return this.http
      .get(`option/${this.Url}/${code}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
