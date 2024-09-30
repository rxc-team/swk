/*
 * @Description: 字段服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 16:31:32
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-08-26 13:52:34
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Schedule {
  schedule_id?: string;
  schedule_name: string;
  entry_id?: number;
  spec: string;
  multi: number;
  retry_times: number;
  retry_interval: number;
  start_time: string;
  end_time: string;
  schedule_type: string;
  run_now: boolean;
  params: Map<string, string>;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  checked?: boolean;
  type?: string;
  time?: string;
  week?: string;
  tips?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取任务计划一览
   * @return: 返回后台数据
   */
  getSchedules(userId: string, index: string, size: string): Promise<any> {
    const params = {
      run_now: 'false',
      page_index: index,
      page_size: size
    };
    if (userId) {
      params['user_id'] = userId;
    }

    return this.http
      .get(`schedule/schedules`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 创建任务计划
   * @return: 返回后台数据
   */
  createSchedule(param: Schedule): Promise<any> {
    return this.http
      .post(`schedule/schedules`, param, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 创建任务计划
   * @return: 返回后台数据
   */
  createScheduleByLocal(params: FormData): Promise<any> {
    return this.http
      .post(`schedule/schedules/local`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 删除任务计划
   * @return: 返回后台数据
   */
  deleteSchedule(scheduleIds: string[]): Promise<any> {
    return this.http
      .delete(`schedule/schedules`, {
        params: {
          schedule_ids: scheduleIds
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
