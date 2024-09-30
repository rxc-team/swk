/*
 * @Description: 字段服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 16:31:32
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2021-02-08 17:23:34
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { objFormat } from '@shared/string/string';

import { Condition } from './database.service';

// 第三方类库

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  // 设置全局url
  private url = 'datastores/${d_id}/items';
  private urlSelected = 'datastores/${d_id}/items/selected';
  private urlCheck = 'datastores/${d_id}/check/items';
  private urlGenerate = 'generate/pay';
  private urlCompute = 'compute/leaserepay';
  private urlTemplate = '/template/templates';

  constructor(private http: HttpClient) {}

  /**
   * @description: 分页获取计算数据数据
   * @return: 返回后台数据
   */
  getComputeInfo(param: { datastoreKey: string; templateId: string; pageIndex: number; pageSize: number }): Promise<any> {
    const params = {
      datastore_key: param.datastoreKey,
      template_id: param.templateId,
      page_index: param.pageIndex.toString(),
      page_size: param.pageSize.toString()
    };
    return this.http
      .get(`${this.urlTemplate}`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 根据item_id更新数据
   * @return: 返回后台数据
   */
  update(datastoreId: string, itemId: string, params: { items?: any; owners?: any }, wfId?: string): Promise<any> {
    const query = {};
    if (wfId) {
      query['wf_id'] = wfId;
    }

    return this.http
      .put(`item/${objFormat(this.url, { d_id: datastoreId })}/${itemId}`, params, {
        params: query,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 根据item_id契约情报更新
   * @return: 返回后台数据
   */
  modifyContract(datastoreId: string, itemId: string, params: { items?: any; owners?: any }, wfId?: string): Promise<any> {
    const query = {};
    if (wfId) {
      query['wf_id'] = wfId;
    }

    return this.http
      .put(`item/${objFormat(this.url, { d_id: datastoreId })}/${itemId}/contract`, params, {
        params: query,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 根据item_id债务变更
   * @return: 返回后台数据
   */
  changeDebt(datastoreId: string, itemId: string, params: { items?: any; owners?: any }, wfId?: string): Promise<any> {
    const query = {};
    if (wfId) {
      query['wf_id'] = wfId;
    }

    return this.http
      .put(`item/${objFormat(this.url, { d_id: datastoreId })}/${itemId}/debt`, params, {
        params: query,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 根据item_id更新合同状态为complete
   * @return: 返回后台数据
   */
  contractExpire(datastoreId: string, itemId: string, params: { items?: any; owners?: any }, wfId?: string): Promise<any> {
    const query = {};
    if (wfId) {
      query['wf_id'] = wfId;
    }

    return this.http
      .put(`item/${objFormat(this.url, { d_id: datastoreId })}/${itemId}/contractExpire`, params, {
        params: query,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 根据item_id中途解约
   * @return: 返回后台数据
   */
  terminateContract(datastoreId: string, itemId: string, params: { items?: any; owners?: any }, wfId?: string): Promise<any> {
    const query = {};
    if (wfId) {
      query['wf_id'] = wfId;
    }

    return this.http
      .put(`item/${objFormat(this.url, { d_id: datastoreId })}/${itemId}/terminate`, params, {
        params: query,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加一条数据
   * @return: 返回后台数据
   */
  insert(
    datastoreId: string,
    params: {
      items: any;
      keiyakuno?: string;
    }
  ): Promise<any> {
    const ps = {
      items: params.items
    };
    if (params.keiyakuno) {
      ps['keiyakuno'] = params.keiyakuno;
    }
    return this.http
      .post(`item/${objFormat(this.url, { d_id: datastoreId })}`, ps, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 导入数据
   * @return: 返回后台数据
   */
  importCSV(
    datastoreId: string, // 台账ID
    type: string, // data/image
    params: FormData,
    wfId?: string
  ): Promise<any> {
    const queryParams = { type: type };
    if (wfId) {
      queryParams['wf_id'] = wfId;
    }
    return this.http
      .post(`item/import/csv/${objFormat(this.url, { d_id: datastoreId })}`, params, {
        params: queryParams,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 批量盘点
   * @return: 返回后台数据
   */
  importCheckItems(
    datastoreId: string, // 台账ID
    params: FormData
  ): Promise<any> {
    return this.http
      .post(`item/import/csv/${objFormat(this.urlCheck, { d_id: datastoreId })}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 导入数据
   * @return: 返回后台数据
   */
  importImage(
    datastoreId: string, // 台账ID
    type: string, // data/image
    params: FormData,
    wfId?: string
  ): Promise<any> {
    const queryParams = { type: type };
    if (wfId) {
      queryParams['wf_id'] = wfId;
    }
    return this.http
      .post(`item/import/image/${objFormat(this.url, { d_id: datastoreId })}`, params, {
        params: queryParams,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过DatastoreID&ItemID删除台账数据
   * @return: 返回后台数据
   */
  delete(datastoreID, itemID: string): Promise<any> {
    const url = `item/${objFormat(this.url, { d_id: datastoreID })}/${itemID}`;
    return this.http
      .delete(url, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 清空删除台账数据
   * @return: 返回后台数据
   */
  clear(datastoreID: string): Promise<any> {
    const url = `item/clear/${objFormat(this.url, { d_id: datastoreID })}`;
    return this.http
      .delete(url, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 清空删除台账数据
   * @return: 返回后台数据
   */
  clearSelected(datastoreID: string, itemSelected: string[]): Promise<any> {
    const url = `item/clear/${objFormat(this.urlSelected, { d_id: datastoreID })}`;
    var params = {};
    params = {
      itemelected: itemSelected
    };

    return this.http
      .delete(url, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 打印出力时间
   * @return: 返回后台数据
   */
  print(datastoreId: string, items: string[]) {
    return this.http
      .put(
        `item/changeLabel/datastores/${datastoreId}/items`,
        { item_id_list: items },
        {
          headers: {
            token: 'true'
          }
        }
      )
      .toPromise();
  }
  /**
   * @description: 变更所有者
   * @return: 返回后台数据
   */
  changeSelectOwners(
    datastoreId: string,
    params: {
      condition_list: Condition[];
      condition_type: string;
      owner: string;
    }
  ) {
    return this.http
      .post(`item/datastores/${datastoreId}/items/owners`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 变更单条数据所有者
   * @return: 返回后台数据
   */
  changeItemOwner(itemID: string, datastoreId: string, owner: string) {
    const params = {
      item_id: itemID,
      datastore_id: datastoreId,
      owner: owner
    };
    return this.http
      .post(`item/datastores/${datastoreId}/item/owner`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 查询台账未审批数据件数
   * @return: 返回后台数据
   */
  findUnApproveItems(datastoreId: string, status: string) {
    const params = {
      status: status
    };
    return this.http
      .get(`item/datastores/${datastoreId}/unApprove`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 计算生成支付数据
   * @return: 返回后台数据
   */
  generatePay(params: any): Promise<any> {
    return this.http
      .post(`item/${this.urlGenerate}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 计算利息和偿还数据
   * @return: 返回后台数据
   */
  computeLeaserepay(params: any, section?: string): Promise<any> {
    if (section) {
      const query = { section: section };
      return this.http
        .post(`item/${this.urlCompute}`, params, {
          params: query,
          headers: {
            token: 'true'
          }
        })
        .toPromise();
    }
    return this.http
      .post(`item/${this.urlCompute}`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 取消契约登录
   * @return: 返回后台数据
   */
  deleteTempData(templateId: string): Promise<any> {
    return this.http
      .delete(`template/templates/${templateId}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
