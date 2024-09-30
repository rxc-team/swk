import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelpTypeService {
  private url = 'type/types';

  constructor(private http: HttpClient) {}

  getTypes(param?: { typeName?: string; show?: string; lang_cd?: string }): Promise<any> {
    const params = {
      is_dev: 'true'
    };
    if (param && param.typeName) {
      params['type_name'] = param.typeName;
    }
    if (param && param.show) {
      params['show'] = param.show;
    }

    if (param && param.lang_cd) {
      params['lang_cd'] = param.lang_cd;
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
  // 类别名唯一性检查
  typeNameAsyncValidator(typeID, typeName: string): Promise<any> {
    const params = {};
    params['id'] = typeID;
    params['name'] = typeName;

    return this.http
      .post(`validation/typename`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  getTypeByID(id: string): Promise<any> {
    return this.http
      .get(`${this.url}/${id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 新規helpType
   * @param any HelpType
   * @return: リクエストの結果
   */
  creatType(params: any): Promise<any> {
    return this.http
      .post(this.url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 更新helpType
   * @param any HelpType
   * @param string TypeID
   * @return: リクエストの結果
   */
  updateType(id: string, params): Promise<any> {
    return this.http
      .put(`${this.url}/${id}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /*
   * @description: 刪除helpType
   * @param string[] 選中的helpTypeId
   * @return: リクエストの結果
   */
  deleteSelectTypes(types: string[]): Promise<any> {
    const params = {
      type_id_list: types
    };
    return this.http
      .delete(this.url, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
