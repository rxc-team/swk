/*
 * @Description: 仪表盘服务管理
 * @Author: RXC 呉見華
 * @Date: 2019-07-31 17:47:21
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:17:22
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // 设置全局url
  private url = 'dashboard/dashboards';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取所有的图表
   * @return: 返回后台数据
   */
  getDashboards(): Promise<any> {
    const params = {
      needRole: 'true'
    };
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
  getDashboardData(id: string): Promise<any> {
    return this.http
      .get(`${this.url}/${id}/data`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
