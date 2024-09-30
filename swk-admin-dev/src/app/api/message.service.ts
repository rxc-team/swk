import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private url = 'message/messages';

  constructor(private http: HttpClient) {}

  addMessage(
    params: {
      sender: string;
      content: string;
      domain: string;
      msg_type: string;
      code?: string;
      link?: string;
      status: string;
      end_time?: string;
    },
    sendType: string
  ): Promise<any> {
    const query = {
      sendType: sendType
    };

    return this.http
      .post(this.url, params, {
        params: query,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: すべてのアプリを取得
   * @return: リクエストの結果
   */
  getMessages(param?: {
    recipient?: string;
    domain?: string;
    status?: string;
    msgType?: string;
    limit?: number;
    skip?: number;
  }): Promise<any> {
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
    if (param && param.skip) {
      params['skip'] = param.skip;
    }
    if (param && param.msgType) {
      params['msg_type'] = param.msgType;
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
