/*
 * @Description: 报表服务管理
 * @Author: RXC 呉見華
 * @Date: 2019-07-31 17:47:21
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-06-10 09:39:10
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  // 设置全局url
  private url = 'report/reports';
  private phydelurl = 'report/phydel/reports';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取所有的报表
   * @return: 返回后台数据
   */
  getReports(datastoreID?: any): Promise<any> {
    const params = {};
    // 检索条件
    if (datastoreID) {
      params['datastore_id'] = datastoreID;
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
   * @description: 通过id获取报表
   * @return: 返回后台数据
   */
  getReportById(id: string): Promise<any> {
    return this.http
      .get(`${this.url}/${id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过id获取报表
   * @return: 返回后台数据
   */
  getReportData(
    id: string,
    params: {
      condition_type: string;
      page_index?: number;
      page_size?: number;
    }
  ): Promise<any> {
    return this.http
      .post(`${this.url}/${id}/data`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过id获取报表
   * @return: 返回后台数据
   */
  genReportData(id: string): Promise<any> {
    return this.http
      .post(`report/gen/reports/${id}/data`, null, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过ID删除多个报表
   * @return: 返回后台数据
   */
  hardDeleteReports(reports: string[]): Promise<any> {
    const params = {
      report_id_list: reports
    };
    return this.http
      .delete(`${this.phydelurl}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 添加报表
   * @return: 返回后台数据
   */
  addReport(params: {
    datastore_id: string;
    report_name: string;
    display_order: number;
    is_use_group: boolean;
    report_conditions: Array<{
      field_id: string;
      field_type: string;
      search_value: any;
      operator: string;
      is_dynamic: boolean;
      condition_type: string;
    }>;
    group_info?: {
      group_keys: Array<{
        is_lookup: boolean;
        field_id: string;
        datastore_id?: string;
        data_type: string;
        alias_name: string;
        sort: string;
      }>;
      aggre_keys: Array<{
        field_id: string;
        aggre_type: string;
        data_type: string;
        alias_name: string;
        sort: string;
      }>;
      show_count: boolean;
    };
    select_key_infos?: Array<{
      is_lookup: boolean;
      field_id: string;
      datastore_id: string;
      data_type: string;
      alias_name: string;
      sort: string;
    }>;
  }): Promise<any> {
    return this.http
      .post(this.url, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 修改报表
   * @return: 返回后台数据
   */
  updateReport(
    reportId: string,
    params: {
      datastore_id: string;
      report_name: string;
      display_order: string;
      is_use_group: string;
      report_conditions: Array<{
        field_id: string;
        field_type: string;
        search_value: any;
        operator: string;
        is_dynamic: boolean;
        condition_type: string;
      }>;
      group_info?: {
        group_keys: Array<{
          is_lookup: boolean;
          field_id: string;
          datastore_id?: string;
          data_type: string;
          alias_name: string;
          sort: string;
        }>;
        aggre_keys: Array<{
          field_id: string;
          aggre_type: string;
          data_type: string;
          alias_name: string;
          sort: string;
        }>;
        show_count: boolean;
      };
      select_key_infos?: Array<{
        is_lookup: boolean;
        field_id: string;
        datastore_id: string;
        data_type: string;
        alias_name: string;
        sort: string;
      }>;
    }
  ): Promise<any> {
    return this.http
      .put(`${this.url}/${reportId}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
