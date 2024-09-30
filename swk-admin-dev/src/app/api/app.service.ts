/*
 * @Description: アプリ管理サービス
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-04-21 09:26:23
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// デコレータ
@Injectable({
  providedIn: 'root'
})
export class AppService {
  private url = 'app/apps';
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
        .get(this.url, {
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
      .get(this.url, {
        params: params,
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
  getAppByID(database: string, id: string): Promise<any> {
    return this.http
      .get(`${this.url}/${id}`, {
        params: {
          database: database
        },
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
      .post(this.url, params, {
        params: configs,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: アプリ更新
   * @param any アプリ
   * @param string アプリID
   * @return: リクエストの結果
   */
  updateApp(id: string, params): Promise<any> {
    return this.http
      .put(`${this.url}/${id}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /*
   * @description: アプリ削除
   * @param string[] アプリID
   * @return: リクエストの結果
   */
  deleteSelectApps(database: string, apps: string[]): Promise<any> {
    const params = {
      app_id_list: apps,
      database: database
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
   * @description: APP恢复
   * @param string[] 选中APP
   * @return: リクエストの結果
   */
  recoverApps(database: string, AppIdList: string[]): Promise<any> {
    return this.http
      .put(
        `${this.recoverUrl}`,
        { app_id_list: AppIdList },
        {
          params: {
            database: database
          },
          headers: {
            token: 'true'
          }
        }
      )
      .toPromise();
  }
}
