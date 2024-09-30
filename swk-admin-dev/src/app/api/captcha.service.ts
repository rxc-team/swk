/*
 * @Description: キャプチャサービス
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-06-18 14:09:18
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// デコレータ
@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  Url = 'captcha';

  constructor(private http: HttpClient) {}

  /**
   * @description: キャプチャの取得
   * @return: リクエストの結果
   */
  getCaptcha(): Promise<any> {
    return this.http.get(this.Url).toPromise();
  }

  /**
   * @description: キャプチャの検証
   * string ID
   * string 値
   * @return: リクエストの結果
   */
  verifyCaptcha(id: string, value: string): Promise<any> {
    const params = {
      id: id,
      verify_value: value
    };

    return this.http.post(this.Url, params).toPromise();
  }
}
