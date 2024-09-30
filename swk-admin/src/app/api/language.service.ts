/*
 * @Description: 言語サービス
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-06-19 18:05:02
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
  getLanguageData(langCd: string, domain?: string): Promise<any> {
    const params = {
      lang_cd: langCd
    };
    if (domain) {
      params['domain'] = domain;
    }

    return this.http
      .get(`${this.url}/search`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加APP语言数据
   * @param string APPID
   * @param string 言語コード
   * @return: リクエストの結果
   */
  addLanguageData(appId, langCd, appName: string): Promise<any> {
    const params = {
      app_name: appName
    };
    return this.http
      .post(`language/apps/${appId}/languages/${langCd}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加APP中的语言数据
   * @param string 言語コード
   * @return: リクエストの結果
   */
  addAppLanguageData(langCd: string, params: any): Promise<any> {
    return this.http
      .post(`${this.url}/${langCd}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加共通中的语言数据
   * @param string 言語コード
   * @return: リクエストの結果
   */
  addCommonLanguageData(langCd: string, params: any): Promise<any> {
    return this.http
      .post(`language/common/languages/${langCd}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加或更新多条语言数据
   * @return: リクエストの結果
   */
  AddManyLanData(params: FormData): Promise<any> {
    return this.http
      .post(`language/import/csv`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
