import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DatastoreService, LanguageService, ReportService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.less']
})
export class ReportListComponent implements OnInit {
  cols = [
    {
      title: 'page.report.reportName',
      width: '120px'
    },
    {
      title: 'page.report.outDatastore',
      width: '120px'
    },
    {
      title: 'page.report.grouping',
      width: '150px'
    },
    {
      title: 'common.text.createdAt',
      width: '150px'
    },
    {
      title: 'common.text.createdBy',
      width: '120px'
    },
    {
      title: 'common.text.updateAt',
      width: '150px'
    },
    {
      title: 'common.text.updatedBy'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private ds: ReportService,
    private db: DatastoreService,
    private modal: NzModalService,
    private i18n: I18NService,
    private ls: LanguageService,
    private event: NgEventBus,
    private bs: NzBreakpointService
  ) {
    this.event.on('report:refresh').subscribe(() => {
      this.search();
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

  // 检索表单
  seachForm: FormGroup;
  reports: any[] = [];
  selectData: any[] = [];
  datestoreSelect = [];
  lookupDatastores = [];
  selectAll = false;
  confirmModal: NzModalRef;

  isSmall = false;
  isZoomFlg = false;

  total = 0;
  index = 1;
  size = 100;

  ngOnInit() {
    this.seachForm = this.fb.group({
      datastoreID: [null, []]
    });
    this.init();
  }

  async init() {
    await this.getSelectData();
    this.search();
  }

  /**
   * @description: 获取台账数据
   */
  async getSelectData() {
    await this.db.getDatastores().then((data: any[]) => {
      if (data) {
        this.datestoreSelect = data;
      } else {
        this.datestoreSelect = [];
      }
    });
  }

  /**
   * @description: 根据台账ID获取台账名称
   */
  getDatastoreName(datastore_id) {
    const datastore = this.datestoreSelect.find(f => f.datastore_id === datastore_id);
    return datastore ? datastore.datastore_name : '';
  }

  /**
   * @description 检索
   */
  search() {
    const datastoreID = this.seachForm.get('datastoreID').value;
    this.ds.getReports(datastoreID).then((data: any[]) => {
      if (data) {
        this.reports = data;
      } else {
        this.reports = [];
      }
    });
  }

  /**
   * @description: 跳转更新画面
   */
  fowardToInfo(reportId: string) {
    const url = `/report/edit/${reportId}`;
    this.router.navigate([url]);
  }

  /**
   * @description: 跳转登录画面
   */
  fowardToAdd() {
    const url = `/report/add`;
    this.router.navigate([url]);
  }

  /**
   * @description: 全选
   */
  checkAll(event) {
    this.reports.forEach(f => (f.checked = event));
    this.selectData = this.reports.filter(d => d.checked === true);
  }

  /**
   * @description: 物理删除报表数据
   */
  hardDeleteReports() {
    const reportList = [];
    // 选择删除报表数据
    this.selectData.forEach(d => {
      reportList.push(d.report_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.reportDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.reportDelContent')}`,
      nzOnOk: async () => {
        // 调用服务删除报表数据&相关联的仪表盘数据
        await this.ds.hardDeleteReports(reportList);
        this.selectData = [];
        this.message.success(this.i18n.translateLang('common.message.success.S_003'));
        this.search();
      }
    });
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.reports.filter(d => d.checked === true);

    if (this.selectData.length === this.reports.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 刷新
   */
  refresh() {
    this.init();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
