/*
 * @Description: 言語サービス
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:23:37
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
  getLanguageData(langCd: string): Promise<any> {
    const params = {
      lang_cd: langCd
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
