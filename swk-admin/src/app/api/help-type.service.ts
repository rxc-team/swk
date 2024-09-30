import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelpTypeService {
  private Url = 'type/types';

  constructor(private http: HttpClient) {}

  /**
   * @description: 查询所有helpType
   * @return: 返回后台数据
   */
  getHelpTypes(param?: { show?: string; type_name?: string; lang_cd?: string }): Promise<any> {
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
    if (param.show) {
      params['show'] = param.show;
    }
    if (param.lang_cd) {
      params['lang_cd'] = param.lang_cd;
    }

    if (param.type_name) {
      params['type_name'] = param.type_name;
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
}
