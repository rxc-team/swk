/*
 * @Description: 字段服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 16:31:32
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:23:07
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取任务一览
   * @return: 返回后台数据
   */
  getScriptList(): Promise<any> {
    return this.http
      .get(`script/scripts`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 执行任务
   * @return: 返回后台数据
   */
  execScript(sid: String): Promise<any> {
    return this.http
      .post(
        `script/scripts/${sid}`,
        {},
        {
          headers: {
            token: 'true'
          }
        }
      )
      .toPromise();
  }
  /**
   * @description: 执行任务
   * @return: 返回后台数据
   */
  run(data): Promise<any> {
    return this.http
      .post(`script/run`, data, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
