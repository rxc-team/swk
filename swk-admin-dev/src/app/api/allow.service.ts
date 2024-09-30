/*
 * @Description: 許可管理サービス
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
export class AllowService {
  constructor(private http: HttpClient) {}

  /**
   * @description: すべての許可を取得
   * @return: リクエストの結果
   */
  getAllows(param: { allow_type?: string; object_type?: string }): Promise<any> {
    const params = {};

    if (param.allow_type) {
      params['allow_type'] = param.allow_type;
    }
    if (param.object_type) {
      params['object_type'] = param.object_type;
    }

    return this.http
      .get('allow/allows', {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 許可IDにより許可取得
   * @return: リクエストの結果
   */
  getAllowById(id: string): Promise<any> {
    return this.http
      .get(`allow/allows/${id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 許可新規
   * @param any パラメータ
   * @return: リクエストの結果
   */
  addAllow(params: { allow_name: string; allow_type: string; object_type: string; actions: any[] }): Promise<any> {
    return this.http
      .post('allow/allows', params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 許可更新
   * @param any 許可
   * @param string 許可ID
   * @return: リクエストの結果
   */
  updateAllow(id: string, params: { allow_name: string; allow_type: string; object_type: string; actions: any[] }): Promise<any> {
    return this.http
      .put(`allow/allows/${id}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 硬删除多个许可
   * @param string 許可ID集合
   * @return: リクエストの結果
   */
  deleteAllows(allows: string[]): Promise<any> {
    const params = {
      allow_ids: allows
    };
    return this.http
      .delete(`allow/allows`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
