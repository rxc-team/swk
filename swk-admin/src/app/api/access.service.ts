import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  private url = 'ace/access';
  private phydelurl = 'ace/phydel/access';
  private recoverurl = 'ace/recover/access';

  constructor(private http: HttpClient) {}

  /**
   * @description:获取所有的Access
   * @return: 返回所有的Access信息
   */
  getAccess(data?: { roleId?: string; groupId?: string }): Promise<any> {
    const params = {};
    if (data && data.roleId) {
      params['role_id'] = data.roleId;
    }
    if (data && data.groupId) {
      params['group_id'] = data.groupId;
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
   * @description: 通过Accessid获取Access
   * @param accessID string
   * @return: 返回Access信息
   */
  getAccessByID(accessID: string): Promise<any> {
    return this.http
      .get(`${this.url}/${accessID}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加一个Access
   * @param params any
   * @return: 返回后台Access数据
   */
  addAccess(params: any): Promise<any> {
    return this.http
      .post(this.url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /*
   * @description: 删除选中Access
   * @param accesss string[]
   * @return: 返回后台数据
   */
  deleteSelectAccess(accessList: string[]): Promise<any> {
    const params = {
      access_list: accessList
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
   * @description: 物理删除选中Access
   * @param accesss string[]
   * @return: 返回后台数据
   */
  harddeleteSelectAccess(accessList: string[]): Promise<any> {
    const params = {
      access_list: accessList
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
}
