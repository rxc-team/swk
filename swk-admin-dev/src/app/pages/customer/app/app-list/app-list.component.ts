/*
 * @Description: 应用一览Controller
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-11-25 15:49:04
 */
import { format } from 'date-fns';
import * as _ from 'lodash';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
// 第三方
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
// angular框架库
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// 自定义
import { AppService, BackupService, CustomerService, LanguageService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.less']
})
export class AppListComponent implements OnInit {
  cols = [
    {
      title: 'page.application.name',
      width: '200px'
    },
    {
      title: 'page.application.status',
      width: '100px'
    },
    {
      title: 'page.application.startDate',
      width: '100px'
    },
    {
      title: 'page.application.endDate',
      width: '100px'
    },
    {
      title: 'page.application.template',
      width: '180px'
    },
    {
      title: 'page.application.copyFrom',
      width: '180px'
    },
    {
      title: 'page.application.followApp',
      width: '180px'
    },
    {
      title: 'common.text.createdDate',
      width: '150px'
    },
    {
      title: 'common.text.updateDate'
    }
  ];

  listOfDataDisplay = [];
  customerSelectData = [];
  customerData = [];
  selectData = [];
  selectDataOfValid = [];
  selectDataOfInvalid = [];
  loading = false;
  seachForm: FormGroup;
  selectAll = false;
  currentAppStatus = '';

  today = new Date();
  startValue: Date | null = null;
  endValue: Date | null = null;
  backupSelectData: any[] = [];

  confirmModal: NzModalRef;
  isSmall = false;
  isZoomFlg = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customer: CustomerService,
    private appService: AppService,
    private bs: BackupService,
    private route: ActivatedRoute,
    private modal: NzModalService,
    private i18n: I18NService,
    private languageService: LanguageService,
    private event: NgEventBus,
    private bks: NzBreakpointService,
    private message: NzMessageService
  ) {
    this.event.on('app:refresh').subscribe(() => {
      this.search();
    });
    this.seachForm = this.fb.group({
      appName: ['', []],
      domain: [null, []],
      invalidatedIn: [null, []],
      appStatus: ['', []],
      startTime: ['', []],
      endTime: ['', []]
    });

    bks
      .subscribe({
        xs: '480px',
        sm: '768px',
        md: '992px',
        lg: '1200px',
        xl: '1600px',
        xxl: '1600px'
      })
      .subscribe(data => {
        if (data === 'sm' || data === 'xs') {
          this.isSmall = true;
        } else {
          this.isSmall = false;
        }
      });
  }

  /**
   * @description: 画面初期化処理
   */
  ngOnInit() {
    this.getSelectData();
    this.getCustomerData();

    this.search();
  }

  getSelectData() {
    this.customer.getCustomers().then((data: any[]) => {
      if (data) {
        this.customerSelectData = data;
      } else {
        this.customerSelectData = [];
      }
    });
  }

  getCustomerData() {
    this.customer.getCustomers('', '1').then((data: any[]) => {
      if (data) {
        this.customerData = data;
      } else {
        this.customerData = [];
      }
    });

    this.bs.getBackups().then((res: any[]) => {
      if (res) {
        this.backupSelectData = res;
      } else {
        this.backupSelectData = [];
      }
    });
  }

  getTplName(templateId: string) {
    const tpl = this.backupSelectData.find(b => b.backup_id === templateId);
    if (tpl) {
      return tpl.backup_name;
    }
    return '';
  }
  getCopyFrom(copyFrom: string) {
    const copyApp = this.listOfDataDisplay.find(l => l.app_id === copyFrom);
    return copyApp || '';
  }
  getFollowApp(followApp: string) {
    if (followApp != '') {
      if (followApp === 'true') {
        return 'page.application.followEndTime';
      }
      if (followApp === 'false') {
        return 'page.application.monthEndTime';
      }
    }
    return '';
  }

  /**
   * @description: 应用一览数据取得
   */
  search() {
    this.loading = true;
    const appName = this.seachForm.controls.appName.value;
    const domain = this.seachForm.controls.domain.value;
    const invalidatedIn = this.seachForm.controls.invalidatedIn.value;
    const isTrial = this.seachForm.controls.appStatus.value;
    let startTime = '';
    if (this.seachForm.controls.startTime.value) {
      startTime = format(this.startValue, 'yyyy-MM-dd');
    }

    let endTime = '';
    if (this.seachForm.controls.endTime.value) {
      endTime = format(this.endValue, 'yyyy-MM-dd');
    }

    const customerId = this.route.snapshot.paramMap.get('id');

    const params = {
      customerId,
      appName,
      domain,
      invalidatedIn,
      isTrial,
      startTime,
      endTime
    };

    this.appService
      .getApps(params)
      .then((data: any) => {
        if (data) {
          this.listOfDataDisplay = data;
        } else {
          this.listOfDataDisplay = [];
        }
      })
      .finally(() => {
        this.loading = false;
      });
    this.selectData = [];
    this.selectDataOfValid = [];
    this.selectDataOfInvalid = [];
  }

  disabledStartDate = (startValue: Date): boolean => {
    if (!startValue || !this.endValue) {
      return false;
    }

    return startValue.getTime() > this.endValue.getTime();
  };

  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue || !this.startValue) {
      return false;
    }
    return endValue.getTime() <= this.startValue.getTime();
  };

  onStartChange(date: Date): void {
    this.startValue = date;
  }

  onEndChange(date: Date): void {
    this.endValue = date;
  }

  /**
   * @description: APP状态-CHANGE事件
   */
  appStatusChange(status: string) {
    this.currentAppStatus = '';

    if (status === 'trial') {
      this.currentAppStatus = 'trial';
    }

    if (status === 'formal') {
      this.currentAppStatus = 'formal';
    }
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
    this.listOfDataDisplay.forEach(f => (f.checked = event));
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
    this.selectDataOfValid = this.listOfDataDisplay.filter(d => d.checked === true && !d.deleted_by);
    this.selectDataOfInvalid = this.listOfDataDisplay.filter(d => d.checked === true && d.deleted_by);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
    this.selectDataOfValid = this.listOfDataDisplay.filter(d => d.checked === true && !d.deleted_by);
    this.selectDataOfInvalid = this.listOfDataDisplay.filter(d => d.checked === true && d.deleted_by);

    if (this.selectData.length === this.listOfDataDisplay.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 跳转到APP添加页面
   */
  foward() {
    const customerId = this.route.snapshot.paramMap.get('id');
    this.router.navigate([`/customer/${customerId}/apps/add`]);
  }

  /**
   * @description: 跳转到APP详细页面
   */
  goToDetail(appId: string) {
    const customerId = this.route.snapshot.paramMap.get('id');
    const editUrl = `/customer/${customerId}/apps/${appId}/setting`;
    this.router.navigate([editUrl]);
  }

  /**
   * @description: 删除选择中应用
   */
  deleteAll(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    const params = [];
    this.selectDataOfValid.forEach(d => {
      params.push(d.app_id + '_' + d.domain);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.invalidTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.invalidContent')}`,
      nzOnOk: () =>
        this.appService.deleteSelectApps(customerId, params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_008'));
          this.search();
        })
    });
  }

  /**
   * @description: 彻底删除选择中应用
   */
  hardDeleteAll(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.app_id + '_' + d.domain);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.deleteTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.deleteContent')}`,
      nzOnOk: () =>
        this.appService.hardDeleteSelectApps(customerId, params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.search();
        })
    });
  }

  /**
   * @description: 恢复选中的无效化APP记录
   */
  recover(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    const params = [];
    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.recoverTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.recoverContent')}`,
      nzOnOk: () => {
        // 无效app关联顾客有效性检查
        this.selectDataOfInvalid.forEach(d => {
          const validCus = this.customerSelectData.filter(selectCus => selectCus.domain === d.domain);
          if (validCus.length < 1) {
            const appName = this.i18n.translateLang(d.app_name);
            const cusName = this.customerData.filter(cus => cus.domain === d.domain)[0].customer_name;
            this.message.error(this.i18n.translateLang('common.message.error.E_009', { app: appName, customer: cusName }));
          } else {
            params.push(d.app_id + '_' + d.domain);
          }
        });
        // 恢复
        if (params.length > 0) {
          this.appService.recoverApps(customerId, params).then(async res => {
            this.selectAll = false;
            this.message.success(this.i18n.translateLang('common.message.success.S_005'));
            this.search();
          });
        }
      }
    });
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    this.seachForm.reset();
    this.getSelectData();
    this.getCustomerData();
    this.search();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
