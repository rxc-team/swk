import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// デコレータ
@Injectable({
  providedIn: 'root'
})
export class AllowService {
  constructor(private http: HttpClient) {}

  /**
   * @description: アプリIDによりアプリ取得
   * @return: リクエストの結果
   */
  checkAllow(allow_type: string): Promise<any> {
    return this.http
      .get(`allow/check/allows`, {
        params: {
          allow_type
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
