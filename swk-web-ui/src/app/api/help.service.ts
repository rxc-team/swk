import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelpService {
  private Url = 'help/helps';

  constructor(private http: HttpClient) {}

  /**
   * @description: 查询所有help
   * @return: 返回后台数据
   */
  getHelps(param?: { title?: string; type?: string; tag?: string; lang_cd?: string }): Promise<any> {
    if (!param) {
      return this.http
        .get(this.Url, {
          headers: {
            token: 'true'
          }
        })
        .toPromise();
    }

    const params = {};
    if (param.type) {
      params['type'] = param.type;
    }
    if (param.tag) {
      params['tag'] = param.tag;
    }
    if (param.lang_cd) {
      params['lang_cd'] = param.lang_cd;
    }

    if (param.title) {
      params['title'] = param.title;
    }
    return this.http
      .get(this.Url, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过ID获取help
   * @return: リクエストの結果
   */
  getHelpByID(id: string) {
    return this.http
      .get(`${this.Url}/${id}`, {
        params: {},
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
