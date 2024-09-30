import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private url = 'log/logs';

  constructor(private http: HttpClient) {}

  getLogs(
    jobId: string,
    param?: {
      user_id?: string;
      client_ip?: string;
      level?: string;
      app_name?: string;
      log_type?: string;
      start_time?: string;
      end_time?: string;
    }
  ): Promise<any> {
    const params = {
      is_dev: 'true',
      job_id: jobId
    };
    if (param && param.user_id) {
      params['user_id'] = param.user_id;
    }
    if (param && param.client_ip) {
      params['client_ip'] = param.client_ip;
    }
    if (param && param.level) {
      params['level'] = param.level;
    }
    if (param && param.app_name) {
      params['app_name'] = param.app_name;
    }
    if (param && param.log_type) {
      params['log_type'] = param.log_type;
    }
    if (param && param.start_time) {
      params['start_time'] = param.start_time;
    }
    if (param && param.end_time) {
      params['end_time'] = param.end_time;
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
   * @description: 获取日志
   * @return: リクエストの結果
   */
  getLogList(param?: {
    user_id?: string;
    client_ip?: string;
    level?: string;
    app_name?: string;
    log_type?: string;
    start_time?: string;
    end_time?: string;
    pageIndex: number;
    pageSize: number;
  }): Promise<any> {
    const params = {
      is_dev: 'true',
      page_index: param.pageIndex.toString(),
      page_size: param.pageSize.toString()
    };
    if (param && param.user_id) {
      params['user_id'] = param.user_id;
    }
    if (param && param.client_ip) {
      params['client_ip'] = param.client_ip;
    }
    if (param && param.level) {
      params['level'] = param.level;
    }
    if (param && param.app_name) {
      params['app_name'] = param.app_name;
    }
    if (param && param.log_type) {
      params['log_type'] = param.log_type;
    }
    if (param && param.start_time) {
      params['start_time'] = param.start_time;
    }
    if (param && param.end_time) {
      params['end_time'] = param.end_time;
    }
    return this.http
      .get('log/loggers', {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
