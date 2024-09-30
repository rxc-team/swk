import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelpService {
  private url = 'help/helps';

  constructor(private http: HttpClient) {}

  /**
   * @description: すべてのアプリを取得
   * @return: リクエストの結果
   */
  getHelps(param?: { title?: string; type?: string; tag?: string; lang_cd?: string }): Promise<any> {
    const params = {
      is_dev: 'true'
    };
    if (param && param.type) {
      params['type'] = param.type;
    }
    if (param && param.tag) {
      params['tag'] = param.tag;
    }
    if (param && param.lang_cd) {
      params['lang_cd'] = param.lang_cd;
    }
    if (param && param.title) {
      params['title'] = param.title;
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
   * @description: 帮助文章名称唯一性检查
   * @return: リクエストの結果
   */
  helpNameAsyncValidator(helpID, helpName: string): Promise<any> {
    const params = {};
    params['id'] = helpID;
    params['name'] = helpName;
    return this.http
      .post(`validation/helpname`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: アプリIDによりアプリ取得
   * @return: リクエストの結果
   */
  getHelpByID(id: string): Promise<any> {
    return this.http
      .get(`${this.url}/${id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: アプリ tags取得
   * @return: リクエストの結果
   */
  getHelpTags(): Promise<any> {
    return this.http
      .get('help/tags', {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: アプリ新規
   * @param any パラメータ
   * @return: リクエストの結果
   */
  creatHelp(params: any): Promise<any> {
    return this.http
      .post(this.url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: アプリ更新
   * @param any アプリ
   * @param string アプリID
   * @return: リクエストの結果
   */
  updateHelp(id: string, params): Promise<any> {
    return this.http
      .put(`${this.url}/${id}`, params, {
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
  hardDeleteSelectHelps(helps: string[]): Promise<any> {
    const params = {
      help_id_list: helps
    };
    return this.http
      .delete(`${this.url}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
