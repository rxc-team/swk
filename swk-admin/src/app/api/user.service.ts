/*
 * @Description: 用户管理服务
 * @Author: RXC 廖欣星
 * @Date: 2019-05-24 16:57:22
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-15 15:46:02
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = 'user/users';
  private activeUrl = 'active/mail';
  private recoverurl = 'user/recover/users';
  private unlockurl = 'user/unlock/users';
  private urlNewPassword = 'new/password';
  private mailstatusurl = `user/update/users/mailstatus`;

  constructor(private http: HttpClient) { }

  /**
   * @description: 获取所有的用户
   * @param data UserSearchParam
   * @return: 返回用户信息
   */
  getUsers(data?: {
    user_name?: string;
    email?: string;
    group?: string;
    app?: string;
    role?: string;
    status?: string;
    invalidatedIn?: string;
    errorCount?: string;
  }): Promise<any> {
    const params = {};
    if (data && data.user_name) {
      params['user_name'] = data.user_name;
    }
    if (data && data.email) {
      params['email'] = data.email;
    }
    if (data && data.group) {
      params['group'] = data.group;
    }
    if (data && data.app) {
      params['app'] = data.app;
    }
    if (data && data.role) {
      params['role'] = data.role;
    }
    if (data && data.status) {
      params['status'] = data.status;
    }
    if (data && data.invalidatedIn) {
      params['invalidated_in'] = data.invalidatedIn;
    }
    if (data && data.errorCount) {
      params['error_count'] = data.errorCount;
    }
    return this.http
      .get(this.url, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 用户名称或登录ID唯一性检查
   * @param data UserSearchParam
   * @return: 返回用户信息
   */
  usereAsyncValidator(userID: string, value: string, invalidatedIn: string, type: string): Promise<any> {
    const params = {};
    params['value'] = value;
    params['invalidated_in'] = invalidatedIn;
    params['id'] = userID;
    params['type'] = type;
    return this.http
      .post(`validation/user`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 查找用户组&关联用户组的多个用户记录
   * @return: 返回后台数据
   */
  getRelatedUsers(group?: string, invalidated_in?: string): Promise<any> {
    const params = {};
    if (group) {
      params['group'] = group;
    }
    if (invalidated_in) {
      params['invalidated_in'] = invalidated_in;
    }
    return this.http
      .get('user/related/users', {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过用户id/email获取用户信息
   * @param type string}
   * @param user_id string}
   * @param email string}
   * @return: 返回后台用户信息
   */
  getUserByID(param: { type: string; user_id: string; email?: string }): Promise<any> {
    const params = {};
    if (param && param.type) {
      params['type'] = param.type;
    }
    if (param && param.email) {
      params['email'] = param.email;
    }
    return this.http
      .get(`${this.url}/${param.user_id}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 创建用户
   * @param params any
   * @return: 返回用户信息
   */
  addUser(params: any): Promise<any> {
    return this.http
      .post(this.url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过用户id更新用户信息
   * @param params any
   * @param user_id string
   * @return: 返回用户信息
   */
  updateUser(params: any, user_id: string): Promise<any> {
    return this.http
      .put(`${this.url}/${user_id}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过用户id更新用户邮箱验证信息
   * @param params any
   * @param user_id string
   * @return: 返回用户信息
   */
  updateUserMail(userIdList: string[]): Promise<any> {
    return this.http
      .put(
        `${this.mailstatusurl}`,
        { user_id_list: userIdList },
        {
          headers: {
            token: 'true'
          }
        }
      )
      .toPromise();
  }

  /**
   * @description: 通过token和新密码更新指定用户密码
   * @return: 返回后台数据
   */
  setNewPassword(token: string, newPassword: string): Promise<any> {
    const param = {
      token: token,
      new_password: newPassword
    };

    return this.http.post(`${this.urlNewPassword}`, param, {}).toPromise();
  }

  /**
   * @description: 删除选中用户
   * @param users string[]
   * @return: 返回后台数据
   */
  deleteSelectUsers(users: string[]): Promise<any> {
    const params = {
      user_id_list: users
    };
    return this.http
      .delete(this.url, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 用户情報恢复
   * @param string[] 选中用户集合
   * @return: リクエストの結果
   */
  recoverUsers(userIdList: string[]): Promise<any> {
    return this.http
      .put(
        `${this.recoverurl}`,
        { user_id_list: userIdList },
        {
          headers: {
            token: 'true'
          }
        }
      )
      .toPromise();
  }

  /**
   * @description: 用户解锁
   * @param string[] 选中用户集合
   * @return: リクエストの結果
   */
  unlockUsers(userIdList: string[]): Promise<any> {
    return this.http
      .put(
        `${this.unlockurl}`,
        { user_id_list: userIdList },
        {
          headers: {
            token: 'true'
          }
        }
      )
      .toPromise();
  }

  /**
   * @description: 激活用户通知邮箱
   * @return: 返回后台数据
   */
  activeMail(loginId: string, mail: string): Promise<any> {
    const params = {
      login_id: loginId,
      notice_email: mail
    };
    return this.http.patch(this.activeUrl, params, {}).toPromise();
  }

  /**
   * @description: 导入数据
   * @return: 返回后台数据
   */
  importCSV(params: FormData): Promise<any> {
    return this.http
      .post(`user/upload/users`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 批量下载用户
   * @param data UserSearchParam
   * @return: 返回用户信息
   */
  downloadUsers(
    job_id: string,
    data?: {
      user_name?: string;
      email?: string;
      group?: string;
      app?: string;
      role?: string;
      invalidatedIn?: string;
      errorCount?: string;
    }
  ): Promise<any> {
    const params = {
      job_id: job_id
    };
    if (data && data.user_name) {
      params['user_name'] = data.user_name;
    }
    if (data && data.email) {
      params['email'] = data.email;
    }
    if (data && data.group) {
      params['group'] = data.group;
    }
    if (data && data.app) {
      params['app'] = data.app;
    }
    if (data && data.role) {
      params['role'] = data.role;
    }
    if (data && data.invalidatedIn) {
      params['invalidated_in'] = data.invalidatedIn;
    }
    if (data && data.errorCount) {
      params['error_count'] = data.errorCount;
    }
    return this.http
      .post(`user/download/users`, null, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
