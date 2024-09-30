/*
 * @Description: 字段服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 16:31:32
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-06-23 16:35:47
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Request {
  workflow: Workflow;
  nodes?: Node[];
}

export interface Workflow {
  wf_name: string;
  menu_name: string;
  is_valid: any;
  workflow_type: string;
  params: any;
}

export interface Node {
  node_id: string;
  wf_id?: string;
  node_type: string;
  prev_node: string;
  next_node: string;
  assignees: string[];
  act_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取任务一览
   * @return: 返回后台数据
   */
  getWorkflows(param?: { group?: string; datastore?: string; action?: string; is_valid?: string }): Promise<any> {
    const params = {};
    if (param && param.group) {
      params['group'] = param.group;
    }
    if (param && param.datastore) {
      params['datastore'] = param.datastore;
    }
    if (param && param.action) {
      params['action'] = param.action;
    }
    if (param && param.is_valid) {
      params['is_valid'] = param.is_valid;
    }

    return this.http
      .get(`workflow/workflows`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 获取任务一览
   * @return: 返回后台数据
   */
  getUserWorkflows(datastore: string, action?: string): Promise<any> {
    const params = {
      datastore
    };

    if (action) {
      params['action'] = action;
    }

    return this.http
      .get(`workflow/user/workflows`, {
        params: params,
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
  getWorkflowByID(wfId: string): Promise<any> {
    return this.http
      .get(`workflow/workflows/${wfId}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 承认
   * @return: 返回后台数据
   */
  admit(exId: string, comment: string): Promise<any> {
    const data = {
      ex_id: exId,
      comment: comment
    };
    return this.http
      .post(`workflow/admit`, data, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 拒绝
   * @return: 返回后台数据
   */
  dismiss(exId: string, comment: string): Promise<any> {
    const data = {
      ex_id: exId,
      comment: comment
    };
    return this.http
      .post(`workflow/dismiss`, data, {
        params: {
          ex_id: exId,
          comment
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
