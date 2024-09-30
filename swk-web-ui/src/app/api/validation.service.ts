/*
 * @Description: 后台验证服务
 * @Author: RXC 呉見華
 * @Date: 2019-09-26 13:18:28
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-10-09 14:54:16
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { objFormat } from '@shared/string/string';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private tokenUrl = 'validation/token';
  private passwordUrl = 'validation/password';
  private uniueUrl = 'validation/datastores/${d_id}/items/unique';
  private workflowExistUrl = 'validation/datastores/${d_id}/mappings/${m_id}';
  private validSpecialChartUrl = 'validation/specialchar';

  constructor(private http: HttpClient) {}

  /**
   * @description: 验证令牌
   * @return: 返回后台数据
   */
  validationToken(token: string): Promise<any> {
    const params = {
      token: token
    };

    return this.http.post(this.tokenUrl, params).toPromise();
  }

  /**
   * @description: 验证密码
   * @return: 返回后台数据
   */
  validationPassword(data: { email: string; password: string }): Promise<any> {
    return this.http
      .post(this.passwordUrl, data, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 获取database的所有数据
   * @return: 返回后台数据
   */

  validationItemUnique(datastoreId: string, condition_list: any[]): Promise<any> {
    const params = {
      condition_list: condition_list,
      condition_type: 'and'
    };

    return this.http
      .post(`${objFormat(this.uniueUrl, { d_id: datastoreId })}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 验证特殊字符
   * @return: 返回后台数据
   */

  validSpecialChar(value: string): Promise<any> {
    const params = {
      special: value
    };

    return this.http
      .post(this.validSpecialChartUrl, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 验证映射是否有流程
   * @return: 返回后台数据
   */

  validationWorkflowExist(datastoreId: string, mappingId: string): Promise<any> {
    return this.http
      .get(`${objFormat(this.workflowExistUrl, { d_id: datastoreId, m_id: mappingId })}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
