/*
 * @Description: 文件夹服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 15:22:10
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:21:21
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private url = 'folder/folders';

  constructor(private http: HttpClient) {}


  /**
   * @description: 获取文件夹
   */
  getFolders(): Promise<any> {
    return this.http
      .get(this.url, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
