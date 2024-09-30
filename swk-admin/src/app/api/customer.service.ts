/*
 * @Description: 会社管理サービス
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2021-02-05 09:24:43
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// デコレータ
@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private url = 'customer/customers';

  constructor(private http: HttpClient) {}

  /**
   * @description: 客户名称唯一性检查
   * @return: リクエストの結果
   */
  customerNameAsyncValidator(customerName, customerID, invalidatedIn?: string): Promise<any> {
    const params = {};
    params['name'] = customerName;
    params['id'] = customerID;
    if (invalidatedIn) {
      params['invalidated_in'] = invalidatedIn;
    }

    return this.http
      .post(`validation/customer`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 会社情報更新
   * @param any 会社情報
   * @param string 会社ID
   * @return: リクエストの結果
   */
  updateCustomer(customer: any, id: string): Promise<any> {
    return this.http
      .put(`${this.url}/${id}`, customer, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 会社IDより会社取得
   * @param string 会社ID
   * @return: リクエストの結果
   */
  getCustomerByID(id: string): Promise<any> {
    return this.http
      .get(`${this.url}/${id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
