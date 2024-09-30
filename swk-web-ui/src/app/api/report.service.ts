/*
 * @Description: 报表服务管理
 * @Author: RXC 呉見華
 * @Date: 2019-07-31 17:47:21
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:24:49
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Condition } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  // 设置全局url
  private url = 'report/reports';
  private urlPrs = 'item/datastores';

  constructor(private http: HttpClient) { }

  /**
   * @description: 获取所有的报表
   * @return: 返回后台数据
   */
  getReports(): Promise<any> {
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
   * @description: 通过ID获取报表信息
   * @return: 返回后台数据
   */
  getReportByID(reportId: string): Promise<any> {
    return this.http
      .get(`${this.url}/${reportId}`, {
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
      condition_list: Condition[];
      condition_type: string;
      page_index: number;
      page_size: number;
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
   * @description: 通过id获取报表
   * @return: 返回后台数据
   */
  download(
    id: string,
    jobId: string,
    fileType: string,
    encoding: string,
    conditions: {
      condition_list: Condition[];
      condition_type: string;
    }
  ): Promise<any> {
    const params = {
      job_id: jobId,
      file_type: fileType,
      char_encoding: encoding
    };
    return this.http
      .post(`${this.url}/${id}/download`, conditions, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: csv下载租赁物件本金返还预计表数据
   * @return: 返回后台数据
   */
  downloadPrsCsv(
    datastore_id: string,
    jobId: string,
    params: {
      item_condition: {
        condition_list: Condition[];
        condition_type: string;
      };
    }
  ): Promise<any> {
    return this.http
      .post(`${this.urlPrs}/${datastore_id}/prs/download`, params, {
        params: {
          job_id: jobId
        },
        headers: {
          token: 'true'
        },
        responseType: 'blob'
      })
      .toPromise();
  }
}
