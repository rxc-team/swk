/*
 * @Description: レベル管理サービス
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
export class LevelService {
  constructor(private http: HttpClient) {}

  /**
   * @description: すべてのレベルを取得
   * @return: リクエストの結果
   */
  getLevels(): Promise<any> {
    return this.http
      .get('level/levels', {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: レベルIDによりレベル取得
   * @return: リクエストの結果
   */
  getLevelById(id: string): Promise<any> {
    return this.http
      .get(`level/levels/${id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: レベル新規
   * @param any パラメータ
   * @return: リクエストの結果
   */
  addLevel(params: { level_name: string; allows: string[] }): Promise<any> {
    return this.http
      .post('level/levels', params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: レベル更新
   * @param any レベル
   * @param string レベルID
   * @return: リクエストの結果
   */
  updateLevel(id: string, params: { level_name: string; allows: string[] }): Promise<any> {
    return this.http
      .put(`level/levels/${id}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 硬删除多个授权等级
   * @param string レベルID集合
   * @return: リクエストの結果
   */
  deleteLevels(levels: string[]): Promise<any> {
    const params = {
      level_ids: levels
    };
    return this.http
      .delete(`level/levels`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
