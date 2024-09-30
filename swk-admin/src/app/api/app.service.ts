/*
 * @Description: APP管理服务
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 15:16:28
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-04-23 13:11:07
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private Url = 'app/user/apps';
  private appUrl = 'app/apps';
  private phydelUrl = 'app/phydel/apps';
  private recoverUrl = 'app/recover/apps';

  constructor(private http: HttpClient) {}

  /**
   * @description: すべてのアプリを取得
   * @return: リクエストの結果
   */
  getApps(param?: {
    customerId: string;
    appName?: string;
    domain?: string;
    invalidatedIn?: string;
    isTrial?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<any> {
    if (!param) {
      return this.http
        .get(this.appUrl, {
          headers: {
            token: 'true'
          }
        })
        .toPromise();
    }

    const params = {
      database: param.customerId
    };
    if (param.appName) {
      params['app_name'] = param.appName;
    }
    if (param.domain) {
      params['domain'] = param.domain;
    }
    if (param.invalidatedIn) {
      params['invalidated_in'] = param.invalidatedIn;
    }

    if (param.isTrial) {
      params['is_trial'] = param.isTrial;
    }
    if (param.startTime) {
      params['start_time'] = param.startTime;
    }
    if (param.endTime) {
      params['end_time'] = param.endTime;
    }
    return this.http
      .get(this.appUrl, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 查询当前登录用户的所有APP
   * @return: 返回后台数据
   */
  getUserApps(): Promise<any> {
    return this.http
      .get(this.Url, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: アプリIDによりアプリ取得
   * @return: リクエストの結果
   */
  getAppByID(id: string, db: string): Promise<any> {
    return this.http
      .get(`${this.appUrl}/${id}`, {
        params: {
          database: db
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: アプリIDでアプリ設定を更新
   * @return: リクエストの結果
   */
  modifyAppConfigs(id: string, configs: any): Promise<any> {
    const params = {
      app_id: id,
      configs: configs
    };
    return this.http
      .put(`${this.appUrl}/${id}/configs`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: アプリ新規
   * @param any パラメータ
   * @return: リクエストの結果
   */
  creatApp(params: any, configs?: any): Promise<any> {
    return this.http
      .post(this.appUrl, params, {
        params: configs,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: アプリ削除
   * @param string[] アプリID
   * @return: リクエストの結果
   */
  hardDeleteSelectApps(database: string, apps: string[]): Promise<any> {
    const params = {
      app_id_list: apps,
      database: database
    };
    return this.http
      .delete(`${this.phydelUrl}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 下一月度处理
   */
  nextMonth(appID: string, value: string): Promise<any> {
    const params = {};
    if (appID) {
      params['app_id'] = appID;
    }
    if (value) {
      params['value'] = value;
    }
    return this.http
      .put(
        this.appUrl + '/nextMonth',
        {},
        {
          params: params,
          headers: {
            token: 'true'
          }
        }
      )
      .toPromise();
  }
}
