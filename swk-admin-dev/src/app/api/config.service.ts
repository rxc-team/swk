import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// デコレータ
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private url = 'config/configs';
  private getUrl = 'config/configs/config';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取配置
   * @return: request结果
   */
  getConfig(): Promise<any> {
    return this.http
      .get(this.getUrl, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 追加配置
   * @return: request结果
   */
  addConfig(config: any): Promise<any> {
    return this.http
      .post(this.url, config, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 更新配置
   * @param any 配置情報
   * @param string 配置ID
   * @return: request结果
   */
  updateConfig(config: any, id: string): Promise<any> {
    return this.http
      .put(`${this.url}/${id}`, config, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
