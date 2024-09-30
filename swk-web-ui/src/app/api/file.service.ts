/*
 * @Description: 文件服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 15:22:10
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-08-17 16:16:04
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取文件
   * @param string 检索类型
   * @param any 检索条件
   */
  getFiles(fo: string, param?: { fileName?: string; contentType?: string; folderId?: string }): Promise<any> {
    const params = {};
    if (param && param.fileName) {
      params['file_name'] = param.fileName;
    }
    if (param && param.contentType) {
      params['content_type'] = param.contentType;
    }
    if (param && param.folderId) {
      params['folder_id'] = param.folderId;
    }

    return this.http
      .get(`file/folders/${fo}/files`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description:文件名称唯一性检查
   * @param string 检索类型
   * @param any 检索条件
   */
  fileNameDuplicated(fo: string, fileName: string): Promise<any> {
    const params = {};
    params['file_name'] = fileName;
    params['folder_id'] = fo;

    return this.http
      .post(`validation/filename`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 下载单个文件
   * @param string 文件ID
   */
  downFileByID(fileID: string, fo: string, param?: { database?: string }): Promise<any> {
    const pm = {};
    if (param && param.database) {
      pm['database'] = param.database;
    }
    return this.http
      .get(`file/download/folders/${fo}/files/${fileID}`, {
        params: pm,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 上传文件
   */
  uploadFile(fo: string, form: FormData): Promise<any> {
    return this.http
      .post(`file/folders/${fo}/upload`, form, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 删除文件
   */
  deleteFile(fo: string, file_id: string): Promise<any> {
    return this.http
      .delete(`file/folders/${fo}/files/${file_id}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: @description: 删除头像或LOGO文件
   */
  deletePublicHeaderFile(fileName: string): Promise<any> {
    return this.http
      .delete(`file/public/header/file`, {
        params: {
          file_name: fileName
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: @description: 删除文件类型字段文件
   */
  deletePublicDataFile(fileName: string): Promise<any> {
    return this.http
      .delete(`file/public/data/file`, {
        params: {
          file_name: fileName
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: @description: 拷贝文件类型字段数据文件
   */
  copyPublicDataFile(fileName: string): Promise<any> {
    return this.http
      .get(`file/public/data/file/copy`, {
        params: {
          file_name: fileName
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: @description: 删除多个文件类型字段数据的文件
   */
  deletePublicDataFiles(fileNames: string[]): Promise<any> {
    return this.http
      .delete(`file/public/data/files`, {
        params: {
          file_name_list: fileNames
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
