import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GenService {
  constructor(private http: HttpClient) {}

  /**
   * @description:文件上传
   */
  upload(form: FormData): Promise<any> {
    return this.http
      .post(`gen/upload`, form, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description:获取导入配置
   * @return: 返回导入配置信息
   */
  getConfig(): Promise<any> {
    return this.http
      .get(`gen/config`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description:获取上传数据
   * @return: 返回数据
   */
  getRowData(index: number, size: number): Promise<any> {
    const query = {
      page_index: index.toString(),
      page_size: size.toString()
    };

    return this.http
      .get(`gen/row/data`, {
        params: query,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description:获取列数据
   * @return: 返回数据
   */
  getColumnData(col: string): Promise<any> {
    const query = {
      col: col
    };

    return this.http
      .get(`gen/column/data`, {
        params: query,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description:设置台账信息
   */
  setDatabase(data: { datastore_id?: string; api_key: string; datastore_name: string; can_check: string }): Promise<any> {
    return this.http
      .post(`gen/database/set`, data, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description:设置字段信息
   */
  setFields(data: { fields: any[] }): Promise<any> {
    return this.http
      .post(`gen/field/set`, data, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description:创建台账
   */
  createDatabase(): Promise<any> {
    return this.http
      .post(`gen/database/create`, null, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description:创建mapping
   */
  createMapping(data: any): Promise<any> {
    return this.http
      .post(`gen/mapping/create`, data, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description:完成
   */
  complete(): Promise<any> {
    return this.http
      .post(`gen/complete`, null, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
