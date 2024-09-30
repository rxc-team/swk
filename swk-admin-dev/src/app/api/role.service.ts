/*
 * @Description: 角色管理服务
 * @Author: RXC 廖欣星
 * @Date: 2019-04-28 16:55:32
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 11:08:43
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private url = 'role/roles';
  private phydelurl = 'role/phydel/roles';
  private recoverurl = 'role/recover/roles';
  private clearWhitelistUrl = 'role/whitelistClear/roles';

  constructor(private http: HttpClient) {}

  /**
   * @description:获取所有的角色
   * @return: 返回所有的角色信息
   */
  getRoles(data?: { roleId?: any; roleName?: any; description?: any; invalidatedIn?: any }): Promise<any> {
    const params = {};
    if (data && data.roleId) {
      params['role_id'] = data.roleId;
    }
    if (data && data.roleName) {
      params['role_name'] = data.roleName;
    }
    if (data && data.description) {
      params['description'] = data.description;
    }
    if (data && data.invalidatedIn) {
      params['invalidated_in'] = data.invalidatedIn;
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
   * @description: 角色名称唯一性检查
   * @return: 返回角色验证信息
   */
  roleNameAsyncValidator(id: string, name: string, invalidatedIn: string): Promise<any> {
    const params = {};
    params['id'] = id;
    params['name'] = name;
    params['invalidated_in'] = invalidatedIn;

    return this.http
      .post(`validation/rolename`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过角色id获取角色
   * @param roleID string
   * @return: 返回角色信息
   */
  getRoleByID(roleID: string): Promise<any> {
    return this.http
      .get(`${this.url}/${roleID}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加一个角色
   * @param params any
   * @return: 返回后台角色数据
   */
  post(params: any): Promise<any> {
    return this.http
      .post(this.url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过角色id更新角色信息
   * @param params any
   * @param roleID string
   * @return: 返回角色信息
   */
  put(roleID: string, params: any): Promise<any> {
    return this.http
      .put(`${this.url}/${roleID}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /*
   * @description: 删除选中角色
   * @param roles string[]
   * @return: 返回后台数据
   */
  deleteSelectRoles(roles: string[]): Promise<any> {
    const params = {
      role_id_list: roles
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
   * @description: 物理删除选中角色
   * @param roles string[]
   * @return: 返回后台数据
   */
  harddeleteSelectRoles(roles: string[]): Promise<any> {
    const params = {
      role_id_list: roles
    };
    return this.http
      .delete(`${this.phydelurl}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 角色情報恢复
   * @param string[] 选中角色集合
   * @return: リクエストの結果
   */
  recoverRoles(roleIdList: string[]): Promise<any> {
    return this.http
      .put(
        `${this.recoverurl}`,
        { role_id_list: roleIdList },
        {
          headers: {
            token: 'true'
          }
        }
      )
      .toPromise();
  }

  /**
   * @description: 清空白名单
   * @param string 公司域名
   * @param string 客户ID
   * @param string 客户名
   * @return: リクエストの結果
   */
  whitelistClear(db: string, domain: string): Promise<any> {
    return this.http
      .put(`${this.clearWhitelistUrl}`, null, {
        params: {
          database: db,
          domain: domain
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
