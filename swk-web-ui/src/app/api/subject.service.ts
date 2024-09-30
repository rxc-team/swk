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
export class SubjectService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取科目
   * @return: 返回后台数据
   */
  getSubjects(assetsType?: string): Promise<any> {
    const query = {
      assets_type: assetsType ? assetsType : ''
    };

    return this.http
      .get(`subject/subjects`, {
        params: query,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 获取分录
   * @return: 返回后台数据
   */
  updateSubject(
    key: string,
    param: {
      assets_type: string;
      subject_name: string;
    }
  ): Promise<any> {
    return this.http
      .put(`subject/subjects/${key}`, param, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
