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
export class AllowService {
  constructor(private http: HttpClient) {}

  /**
   * @description: すべてのアプリを取得
   * @return: リクエストの結果
   */
  getAllows(): Promise<any> {
    return this.http
      .get('allow/level/allows', {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
