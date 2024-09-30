/*
 * @Descripttion:
 * @Author: Rxc 陳平
 * @Date: 2020-06-02 13:26:11
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-23 13:34:15
 */
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService, BackupService, CustomerService } from '@api';

@Component({
  selector: 'app-tpl-info',
  templateUrl: './tpl-info.component.html',
  styleUrls: ['./tpl-info.component.less']
})
export class TplInfoComponent implements OnInit {
  cols = [
    {
      title: 'page.template.objectType',
      width: '200px'
    },
    {
      title: 'page.template.objectName',
      width: '300px'
    },
    {
      title: 'page.template.dataCount'
    }
  ];

  constructor(private as: AppService, private bs: BackupService, private cs: CustomerService, private route: ActivatedRoute) {}

  tplData: any = { copy_info_list: [] };
  customerSelect = [];
  appSelect = [];

  async ngOnInit() {
    await this.init();
    const backupId = this.route.snapshot.paramMap.get('id');
    this.getBackupInfo(backupId);
  }

  async init() {
    await this.cs.getCustomers().then((data: any[]) => {
      if (data) {
        this.customerSelect = data;
      } else {
        this.customerSelect = [];
      }
    });
    // 获取app列表数据
    this.as.getApps().then((data: any[]) => {
      if (data) {
        this.appSelect = data;
      } else {
        this.appSelect = [];
      }
    });
  }

  /**
   * @description: 模板情报取得
   */
  getBackupInfo(id: string) {
    this.bs.getBackupById(id).then((data: any) => {
      if (data) {
        this.tplData = data;
      } else {
        this.tplData = {};
      }
    });
  }

  getAppName(id: string) {
    const app = this.appSelect.find(a => a.app_id === id);
    if (app) {
      return app.app_name;
    }
    return '';
  }

  getCustomerName(id: string) {
    const customer = this.customerSelect.find(c => c.customer_id === id);
    if (customer) {
      return customer.customer_name;
    }
    return '';
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
