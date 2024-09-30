/*
 * @Description: アクション管理サービス
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
export class ActionService {
  constructor(private http: HttpClient) {}

  /**
   * @description: すべてのアクションを取得する
   * @return: リクエストの結果
   */
  getActions(param: { action_group?: string }): Promise<any> {
    const params = {};
    if (param.action_group) {
      params['action_group'] = param.action_group;
    }

    return this.http
      .get('action/actions', {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description:アクションオブジェクトとアクションキーにより一つのアクションを取得する
   * @param string アクションオブジェクト
   * @param string アクションキー
   * @return: リクエストの結果
   */
  getActionByKey(actionObject: string, actionKey: string): Promise<any> {
    return this.http
      .get(`action/objs/${actionObject}/actions/${actionKey}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: アクション新規
   * @param any パラメータ
   * @return: リクエストの結果
   */
  addAction(params: { action_key: string; action_name: any; action_group: string }): Promise<any> {
    return this.http
      .post('action/actions', params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: アクション更新
   * @param any アクション
   * @param string アクションオブジェクト
   * @param string アクションキー
   * @return: リクエストの結果
   */
  updateAction(actionObject: string, actionKey: string, params: { action_name: any; action_group: string }): Promise<any> {
    return this.http
      .put(`action/objs/${actionObject}/actions/${actionKey}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 多个アクション削除
   * @return: リクエストの結果
   */
  deleteActions(params: any): Promise<any> {
    return this.http
      .put(`action/actions`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
