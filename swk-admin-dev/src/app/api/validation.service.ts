/*
 * @Description: 后台验证服务
 * @Author: RXC 呉見華
 * @Date: 2019-09-26 13:18:28
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-10-29 17:00:25
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private tokenUrl = 'validation/token';
  private passwordUrl = 'validation/password';
  private uniqueUrl = 'validation/unique';

  constructor(private http: HttpClient) {}

  /**
   * @description: 验证令牌
   * @return: 返回后台数据
   */
  validationToken(token: string): Promise<any> {
    const params = {
      token: token
    };

    return this.http.post(this.tokenUrl, params).toPromise();
  }

  /**
   * @description: 验证密码
   * @return: 返回后台数据
   */
  validationPassword(data: { email: string; password: string }): Promise<any> {
    return this.http
      .post(this.passwordUrl, data, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 验证多语言项目的唯一性
   * @return: 返回后台数据
   */
  validationUnique(object_key: string, name: string, options?: { prefix?: string; change_id?: string; domain?: string }): Promise<any> {
    const params = {
      object_key: object_key,
      name: name
    };
    if (options && options.prefix) {
      params['prefix'] = options.prefix;
    }
    if (options && options.change_id) {
      params['change_id'] = options.change_id;
    }
    if (options && options.domain) {
      params['domain'] = options.domain;
    }
    return this.http
      .post(this.uniqueUrl, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
