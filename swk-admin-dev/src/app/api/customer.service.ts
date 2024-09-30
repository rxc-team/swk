/*
 * @Description: 会社管理サービス
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 13:11:21
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// デコレータ
@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private url = 'customer/customers';
  private phydelUrl = 'customer/phydel/customers';
  private recoverUrl = 'customer/recover/customers';

  constructor(private http: HttpClient) {}

  /**
   * @description: すべての会社の取得
   * @return: リクエストの結果
   */
  getCustomers(customerName?, invalidatedIn?: string): Promise<any> {
    const params = {};
    if (customerName) {
      params['customer_name'] = customerName;
    }
    if (invalidatedIn) {
      params['invalidated_in'] = invalidatedIn;
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
   * @description: 客户名称、域名唯一性检查
   * @return: リクエストの結果
   */
  customerAsyncValidator(customerID, customerValue, type: string): Promise<any> {
    const params = {};
    params['id'] = customerID;
    params['value'] = customerValue;
    params['type'] = type;

    return this.http
      .post(`validation/customer`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 会社新規追加
   * @return: リクエストの結果
   */
  addCustomer(customer: any): Promise<any> {
    return this.http
      .post(this.url, customer, {
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
   * @description: 会社削除
   * @param string[] 会社ID
   * @return: リクエストの結果
   */
  deleteSelectCustomers(customers: string[]): Promise<any> {
    const params = {
      customer_id_list: customers
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

  /**
   * @description: 会社削除
   * @param string[] 会社ID
   * @return: リクエストの結果
   */
  hardDeleteSelectCustomers(customers: string[]): Promise<any> {
    const params = {
      customer_id_list: customers
    };
    return this.http
      .delete(`${this.phydelUrl}`, {
        params: params,
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
  getCustomerByID(id: string, section?: string): Promise<any> {
    const query = {};
    if (section) {
      query['section'] = section;
    }

    return this.http
      .get(`${this.url}/${id}`, {
        params: query,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 会社情報恢复
   * @param string[] 选中会社集合
   * @return: リクエストの結果
   */
  recoverCustomers(CustomerIdList: string[]): Promise<any> {
    return this.http
      .put(
        `${this.recoverUrl}`,
        { customer_id_list: CustomerIdList },
        {
          headers: {
            token: 'true'
          }
        }
      )
      .toPromise();
  }
}
