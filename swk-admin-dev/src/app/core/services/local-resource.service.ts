/*
 * @Description: 接口资源服务
 * @Author: RXC 呉見華
 * @Date: 2019-04-22 10:19:55
 * @LastEditors  : RXC 呉見華
 * @LastEditTime : 2020-01-06 17:26:10
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalResourceService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取子API接口文件
   * @return: API接口数组
   */
  getChildrenResources() {
    return this.http.get('assets/resources/children.json').toPromise();
  }
  /**
   * @description: 获取父API接口文件
   * @return: API接口数组
   */
  getParentResources() {
    return this.http.get('assets/resources/parent.json').toPromise();
  }
}
