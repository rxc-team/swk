/*
 * @Description: 会社一览Controller
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-11-24 16:45:18
 */
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.less']
})
export class CustomerListComponent implements OnInit {
  cols = [
    {
      title: 'page.customer.name',
      width: '180px'
    },
    {
      title: 'page.customer.domain',
      width: '120px'
    },
    {
      title: 'common.text.createdDate',
      width: '150px'
    },
    {
      title: 'common.text.updateDate',
      width: '150px'
    },
    {
      title: 'page.customer.applications'
    }
  ];

  constructor(
    private customer: CustomerService,
    private message: NzMessageService,
    private router: Router,
    private modal: NzModalService,
    private i18n: I18NService,
    private event: NgEventBus,
    private bs: NzBreakpointService,
    private fb: FormBuilder
  ) {
    this.event.on('customer:refresh').subscribe(() => {
      this.search();
    });
    this.seachForm = this.fb.group({
      customerName: ['', []],
      invalidatedIn: [null, []]
    });

    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'sm' || data === 'xs') {
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });
  }

  displayData = [];
  selectData = [];
  selectDataOfValid = [];
  selectDataOfInvalid = [];
  selectAll = false;
  appsSelect: any[] = [];

  seachForm: FormGroup;

  loading = false;
  isOkLoading = false;

  isSmall = false;
  isZoomFlg = false;

  confirmModal: NzModalRef;

  /**
   * @description: 画面初期化処理
   */
  ngOnInit() {
    this.search();
  }

  /**
   * @description: 全选
   */
  checkAll(event) {
    this.displayData.forEach(f => (f.checked = event));
    this.selectData = this.displayData.filter(d => d.checked === true);
    this.selectDataOfValid = this.displayData.filter(d => d.checked === true && d.deleted_by === '');
    this.selectDataOfInvalid = this.displayData.filter(d => d.checked === true && d.deleted_by !== '');
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.displayData.filter(d => d.checked === true);
    this.selectDataOfValid = this.displayData.filter(d => d.checked === true && d.deleted_by === '');
    this.selectDataOfInvalid = this.displayData.filter(d => d.checked === true && d.deleted_by !== '');

    if (this.selectData.length === this.displayData.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 検索
   */
  search(): void {
    this.loading = true;
    this.displayData = [];
    this.customer.getCustomers(this.seachForm.controls.customerName.value, this.seachForm.controls.invalidatedIn.value).then((res: any) => {
      if (res) {
        this.displayData = res;
      } else {
        this.displayData = [];
      }
      this.loading = false;
    });
    this.selectData = [];
    this.selectDataOfValid = [];
    this.selectDataOfInvalid = [];
  }

  /**
   * @description: 删除选中顾客
   */
  deleteAll(): void {
    const params = [];
    this.selectDataOfValid.forEach(d => {
      params.push(d.customer_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.invalidTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.invalidContent')}`,
      nzOnOk: () =>
        this.customer.deleteSelectCustomers(params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_008'));
          this.search();
        })
    });
  }

  /**
   * @description: 彻底删除选中顾客
   */
  hardDeleteAll(): void {
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.customer_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.deleteTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.deleteContent')}`,
      nzOnOk: () =>
        this.customer.hardDeleteSelectCustomers(params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.search();
        })
    });
  }

  /**
   * @description: 表单重置
   */
  resetForm(): void {
    this.seachForm.reset();
  }

  /**
   * @description: 跳转到客户详细页面
   */
  goToDetail(customerId: string) {
    const info = `/customer/${customerId}/info`;
    this.router.navigate([info]);
  }

  /**
   * @description: 跳转到客户添加页面
   */
  foward() {
    this.router.navigate(['/customer/add']);
  }
  /**
   * @description: 跳转到客户添加页面
   */
  fowardAppList(customerId: string) {
    this.router.navigate([`/customer/${customerId}/apps/list`]);
  }

  /**
   * @description: 恢复选中的无效化顾客记录
   */
  recover(): void {
    const params = [];
    this.selectDataOfInvalid.forEach(d => {
      params.push(d.customer_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.recoverTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.recoverContent')}`,
      nzOnOk: () =>
        this.customer.recoverCustomers(params).then(async res => {
          this.selectAll = false;
          this.seachForm.reset();
          this.message.success(this.i18n.translateLang('common.message.success.S_005'));
          this.search();
        })
    });
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    this.seachForm.reset();
    this.search();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
