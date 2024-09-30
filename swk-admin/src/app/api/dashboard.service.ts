/*
 * @Description: 仪表盘服务管理
 * @Author: RXC 呉見華
 * @Date: 2019-07-31 17:47:21
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-06-11 11:57:11
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // 设置全局url
  private url = 'dashboard/dashboards';
  private phydelurl = 'dashboard/phydel/dashboards';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取所有的图表
   * @return: 返回后台数据
   */
  getDashboards(reportId?: any): Promise<any> {
    const params = {};
    if (reportId) {
      params['report_id'] = reportId;
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
   * @description: 通过id获取图表
   * @return: 返回后台数据
   */
  getDashboardById(id: string): Promise<any> {
    return this.http
      .get(`${this.url}/${id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加图表
   * @return: 返回后台数据
   */
  addDashboard(params: {
    report_id: string;
    dashboard_name: string;
    dashboard_type: string;
    x_field_id: string;
    y_field_id: string;
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
   * @description: 修改图表
   * @return: 返回后台数据
   */
  updateDashboard(
    dashboardId: string,
    params: {
      report_id: string;
      dashboard_name: string;
      dashboard_type: string;
      x_field_id: string;
      y_field_id: string;
    }
  ): Promise<any> {
    return this.http
      .put(`${this.url}/${dashboardId}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 物理删除多个仪表盘
   * @param dashboards string[]
   * @return: 返回后台数据
   */
  hardDeleteDashboards(dashboard: string[]): Promise<any> {
    const params = {
      dashboard_id_list: dashboard
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
}
