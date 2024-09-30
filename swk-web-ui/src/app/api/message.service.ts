import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private url = 'message/messages';
  private updateUrl = 'message/messages/update';

  constructor(private http: HttpClient) {}

  /**
   * @description: すべてのアプリを取得
   * @return: リクエストの結果
   */
  getMessages(param?: { recipient?: string; domain?: string; status?: string; limit?: number }): Promise<any> {
    const params = {};
    if (param && param.domain) {
      params['domain'] = param.domain;
    }
    if (param && param.recipient) {
      params['recipient'] = param.recipient;
    }
    if (param && param.status) {
      params['status'] = param.status;
    }

    if (param && param.limit) {
      params['limit'] = param.limit;
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
   * @description: 最新のシステムニュースを入手する
   * @return: リクエストの結果
   */
  getUpdateMessage(): Promise<any> {
    const params = {};
    params['now_time'] = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    return this.http
      .get(this.updateUrl, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 改变为已读状态
   * @param string アプリID
   * @return: リクエストの結果
   */
  changeStatus(id: string): Promise<any> {
    return this.http
      .patch(`${this.url}/${id}`, null, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: アプリ削除
   * @param string アプリID
   * @return: リクエストの結果
   */
  deleteMessageById(id: string): Promise<any> {
    return this.http
      .delete(`${this.url}/${id}`, {
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
  deleteSelectMessages(): Promise<any> {
    return this.http
      .delete(`${this.url}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
