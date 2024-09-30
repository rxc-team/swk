/*
 * @Description: 字段服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 16:31:32
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-06-23 16:35:47
 */

import { Job } from 'app/layout/default/components/task-list/task-list.component';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取任务一览
   * @return: 返回后台数据
   */
  getTasks(index: string, size: string): Promise<any> {
    return this.http
      .get(`task/tasks`, {
        params: {
          page_index: index,
          page_size: size
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 获取任务履历
   * @return: 返回后台数据
   */
  getTaskHistories(index: string, size: string): Promise<any> {
    return this.http
      .get(`task/histories`, {
        params: {
          page_index: index,
          page_size: size,
          isAdmin: 'true'
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 通过ID获取任务
   * @return: 返回后台数据
   */
  getTaskByID(jobId: string): Promise<any> {
    return this.http
      .get(`task/tasks/${jobId}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 创建任务
   * @return: 返回后台数据
   */
  createTask(param: Job): Promise<any> {
    return this.http
      .post(`task/tasks`, param, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 删除任务
   * @return: 返回后台数据
   */
  deleteTask(jobId: string, errFile: string, file: string): Promise<any> {
    return this.http
      .delete(`task/tasks/${jobId}`, {
        params: {
          error_file: errFile,
          file: file
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: csv下载数据
   * @return: 返回后台数据
   */
  downloadTaskHistory(jobId: string): Promise<any> {
    return this.http
      .get(`task/histories/download`, {
        params: {
          job_id: jobId
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
