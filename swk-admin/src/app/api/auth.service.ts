/*
 * @Description: 登录管理服务
 * @Author: RXC 廖欣星
 * @Date: 2019-05-21 13:29:26
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-08-27 13:50:01
 */

import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // 设置全局loginURL
  private loginUrl = 'login';
  private refreshUrl = 'refresh/token';
  private passwordResetUrl = 'password/reset';
  private SelectedPasswordResetUrl = 'password/reset/selected';

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
  userPasswordReset(loginId: string, noticeEmail: string): Promise<any> {
    const params = {
      login_id: loginId,
      notice_email: noticeEmail
    };

    return this.http.post(this.passwordResetUrl, params).toPromise();
  }
  /**
   * @description: 重置选中用户密码
   * @return: 返回后台数据
   */
  userSelectedPasswordReset(params: any[]): Promise<any> {
    return this.http.post(this.SelectedPasswordResetUrl, params).toPromise();
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
