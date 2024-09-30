/*
 * @Description: ユーザ認証サービス
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-08-07 11:17:47
 */
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // 设置全局loginURL
  private loginUrl = 'login';
  private refreshUrl = 'refresh/token';
  private passwordResetUrl = 'admin/password/reset';

  constructor(private http: HttpClient) {}

  /**
   * @description: 用户登录
   * @return: 返回后台数据
   */
  login(email: string, password: string): Promise<any> {
    const params = {
      email: email,
      password: password
    };
    return this.http.post(this.loginUrl, params).toPromise();
  }

  /**
   * @description: 重置用户密码
   * @return: 返回后台数据
   */
  userPasswordReset(customerID: string): Promise<any> {
    const params = {
      customer_id: customerID
    };

    return this.http.post(this.passwordResetUrl, params).toPromise();
  }

  /**
   * @description: 用户登录
   * @return: 返回后台数据
   */
  refreshToken(refresh_token): Observable<any> {
    const body = {
      refresh_token: refresh_token
    };
    return this.http.post(this.refreshUrl, body);
  }

  /**
   * @description: 设置token
   */
  setToken(params: { access_token: string; refresh_token: string }) {
    localStorage.setItem('access_token', params.access_token);
    localStorage.setItem('refresh_token', params.refresh_token);
  }

  /**
   * @description: 清除token
   */
  clearToken() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * @description: 获取token
   * @return: 返回后台数据
   */
  getToken(): { access_token: string; refresh_token: string } {
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
    return {
      access_token: access_token,
      refresh_token: refresh_token
    };
  }

  /**
   * @description: 判断是否登录
   * @return: 返回登录结果
   */
  isLogin(): boolean {
    const token = this.getToken();
    if (token.access_token && token.refresh_token) {
      return true;
    }
    return false;
  }
}
