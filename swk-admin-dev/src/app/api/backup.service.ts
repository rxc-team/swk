/*
 * @Description: 会社管理サービス
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 13:11:21
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// デコレータ
@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private url = 'backup/backups';
  private phydelUrl = 'backup/phydel/backups';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取备份一览
   * @return: リクエストの結果
   */
  getDbBackups(param?: { backupName?: string; customerId?: string }): Promise<any> {
    const params = {
      backup_type: 'database'
    };
    if (param && param.backupName) {
      params['backup_name'] = param.backupName;
    }
    if (param && param.customerId) {
      params['customer_id'] = param.customerId;
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
   * @description: 获取备份一览
   * @return: リクエストの結果
   */
  getBackups(param?: { backupName?: string; customerId?: string }): Promise<any> {
    const params = {
      backup_type: 'template'
    };
    if (param && param.backupName) {
      params['backup_name'] = param.backupName;
    }
    if (param && param.customerId) {
      params['customer_id'] = param.customerId;
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
   * @description: 模板名称唯一性检查
   * @return: リクエストの結果
   */
  backupNameAsyncValidator(param: { backupName: string }): Promise<any> {
    const params = {};
    params['name'] = param.backupName;
    return this.http
      .post(`validation/backupname`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 根据ID获取备份
   * @return: リクエストの結果
   */
  getBackupById(backupId: string): Promise<any> {
    return this.http
      .get(`${this.url}/${backupId}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加备份
   * @return: リクエストの結果
   */
  addBackup(backup: any): Promise<any> {
    return this.http
      .post(this.url, backup, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 删除备份
   * @param string[] 备份ID
   * @return: リクエストの結果
   */
  hardDeleteBackups(backups: string[]): Promise<any> {
    const params = {
      backup_id_list: backups
    };
    return this.http
      .delete(`${this.phydelUrl}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
