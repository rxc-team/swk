/*
 * @Description: 登录服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-21 13:31:40
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2021-02-05 09:25:49
 */
// 第三方类库
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // 设置全局loginURL
  private loginUrl = 'login';
  private refreshUrl = 'refresh/token';
  private passwordResetUrl = 'password/reset';

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
   * @description: 用户登录
   * @return: 返回后台数据
   */
  refreshToken(refresh_token): Observable<any> {
    const body = {
      refresh_token: refresh_token
    };
    return this.http.post(this.refreshUrl, body);
  }
}
