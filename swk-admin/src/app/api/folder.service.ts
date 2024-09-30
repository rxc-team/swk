/*
 * @Description: 文件夹服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 15:22:10
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:49:49
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
   * @description: 添加文件夹
   */
  addFolder(data: { folder_name: string; folder_dir: string }): Promise<any> {
    return this.http
      .post(this.url, data, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 文件夹名称唯一性检查
   */
  folderNameDuplicated(name: string): Promise<any> {
    const params = {};
    params['name'] = name;
    return this.http
      .post(`validation/foldername`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description:  获取文件夹
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
