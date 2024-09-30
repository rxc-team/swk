/*
 * @Description: ユーザサービス
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-15 15:42:57
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// デコレータ
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = 'user/users';
  private activeUrl = 'active/mail';
  private recoverurl = 'user/recover/users';
  private unlockurl = 'user/unlock/users';
  private defaultUrl = 'user/default/user';
  private urlNewPassword = 'new/password';

  constructor(private http: HttpClient) {}

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
  usereAsyncValidator(userID: string, value: string, type: string): Promise<any> {
    const params = {};
    params['value'] = value;
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
   * @description: 根据条件获取用户
   * @param string ユーザID
   * @return: 返回后台数据
   */
  getUserByID(id: string): Promise<any> {
    return this.http
      .get(`${this.url}/${id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 根据条件获取默认管理员用户
   * @param string ユーザID
   * @return: 返回后台数据
   */
  getDefaultUser(type: string, database: string): Promise<any> {
    return this.http
      .get(`${this.defaultUrl}`, {
        params: { type: type, database: database },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: ユーザ情報更新
   * @param any ユーザ情報
   * @param string ユーザID
   * @return: リクエストの結果
   */
  updateUser(user: any, id: string): Promise<any> {
    return this.http
      .put(`${this.url}/${id}`, user, {
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
  unlockUsers(userIdList: string[], db: string): Promise<any> {
    return this.http
      .put(
        `${this.unlockurl}`,
        { user_id_list: userIdList },
        {
          params: { database: db },
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
}
