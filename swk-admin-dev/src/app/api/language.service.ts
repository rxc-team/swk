/*
 * @Description: 言語サービス
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-06-18 12:02:06
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// デコレータ
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private url = 'language/languages';

  constructor(private http: HttpClient) {}

  /**
   * @description: データバース表示言語取得
   * @param string 言語コード
   * @return: リクエストの結果
   */
  getLanguageData(langCd: string, domain: string): Promise<any> {
    const params = {
      lang_cd: langCd,
      domain: domain
    };
    return this.http
      .get(`${this.url}/search`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
