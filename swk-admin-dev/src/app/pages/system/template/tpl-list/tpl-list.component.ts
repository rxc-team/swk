import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService, BackupService, CustomerService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-tpl-list',
  templateUrl: './tpl-list.component.html',
  styleUrls: ['./tpl-list.component.less']
})
export class TplListComponent implements OnInit {
  cols = [
    {
      title: 'page.template.tplName',
      width: '180px'
    },
    {
      title: 'page.template.customer',
      width: '180px'
    },
    {
      title: 'page.template.application',
      width: '180px'
    },
    {
      title: 'page.template.applicationType',
      width: '150px'
    },
    {
      title: 'page.template.createdTime',
      width: '150px'
    },
    {
      title: 'page.template.hasData'
    }
  ];
  constructor(
    private as: AppService,
    private bs: BackupService,
    private cs: CustomerService,
    private message: NzMessageService,
    private router: Router,
    private modal: NzModalService,
    private i18n: I18NService,
    private nbs: NzBreakpointService,
    private event: NgEventBus,
    private fb: FormBuilder
  ) {
    this.event.on('tpl:refresh').subscribe(() => {
      this.search();
    });
    this.seachForm = this.fb.group({
      customerId: ['', []],
      backupName: ['', []]
    });

    nbs
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

  displayData = [];
  selectData = [];
  selectAll = false;
  isSmall = false;
  isZoomFlg = false;
  customerSelect: any[] = [];
  appSelect: any[] = [];

  seachForm: FormGroup;

  loading = false;
  isOkLoading = false;

  confirmModal: NzModalRef;

  /**
   * @description: 画面初期化処理
   */
  async ngOnInit() {
    await this.init();
    await this.search();
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
   * @description: 全选
   */
  checkAll(event) {
    this.displayData.forEach(f => (f.checked = event));
    this.selectData = this.displayData.filter(d => d.checked === true);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.displayData.filter(d => d.checked === true);

    if (this.selectData.length === this.displayData.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 検索
   */
  async search() {
    this.loading = true;
    this.displayData = [];

    const params = {
      customerId: this.seachForm.controls.customerId.value,
      backupName: this.seachForm.controls.backupName.value
    };

    await this.bs.getBackups(params).then((res: any) => {
      this.loading = false;
      if (res) {
        this.displayData = res;
      }
    });
    this.selectData = [];
  }

  /**
   * @description: 彻底删除选中顾客
   */
  hardDeleteAll(): void {
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.backup_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.deleteTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.deleteContent')}`,
      nzOnOk: () =>
        this.bs.hardDeleteBackups(params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.search();
        })
    });
  }

  /**
   * @description: 跳转到客户详细页面
   */
  goDetailPage(backupId: string) {
    const info = `/system/template/${backupId}/info`;
    this.router.navigate([info]);
  }

  /**
   * @description: 跳转到客户添加页面
   */
  goAddPage() {
    this.router.navigate(['/system/template/add']);
  }

  getAppName(id: string) {
    const app = this.appSelect.find(a => a.app_id === id);
    if (app) {
      return app.app_name;
    }
    return 'Not found';
  }

  getCustomerName(id: string) {
    const customer = this.customerSelect.find(c => c.customer_id === id);
    if (customer) {
      return customer.customer_name;
    }
    return 'Not found';
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    this.seachForm.reset();
    await this.init();
    await this.search();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
