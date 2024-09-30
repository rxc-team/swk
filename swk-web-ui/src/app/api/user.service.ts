/*
 * @Description: 用户服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 13:09:08
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-15 15:47:40
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // 设置全局变量
  private url = 'user/users';
  private activeUrl = 'active/mail';
  private urlRelated = 'user/related/users';
  private urlCheckAction = 'user/check/actions';
  private urlNewPassword = 'new/password';

  constructor(private http: HttpClient) {}

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
      .get(this.urlRelated, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 根据条件获取所有用户
   * @return: 返回后台数据
   */
  getUsers(param?: { group?: string; invalid?: string }): Promise<any> {
    const params = {};
    if (param && param.group) {
      params['group'] = param.group;
    }
    if (param && param.invalid) {
      params['invalidated_in'] = param.invalid;
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
   * @description: 获取用户临时数据管理菜单&台账数据清空按钮显示控制权限
   * @return: 返回后台数据
   */
  checkAction(actionKey: string, datastoreId: string): Promise<any> {
    const params = {
      datastore_id: datastoreId
    };
    return this.http
      .get(`${this.urlCheckAction}/${actionKey}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过用户id/email获取用户信息
   * @param type string
   * @param user_id string
   * @return: 返回后台用户信息
   */
  getUserByID(param: { type: string; user_id: string }): Promise<any> {
    const params = {};
    if (param && param.type) {
      params['type'] = param.type;
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
   * @description: 通过用户id更新用户信息
   * @return: 返回后台数据
   */
  updateUser(user: any, id: string, param?: { realUpdate?: string }): Promise<any> {
    const pm = {};
    if (param && param.realUpdate) {
      pm['real_update'] = param.realUpdate;
    }
    return this.http
      .put(`${this.url}/${id}`, user, {
        params: pm,
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
