import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardService, LanguageService, ReportService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.less']
})
export class DashboardListComponent implements OnInit {
  cols = [
    {
      title: 'page.dashboard.dashboardName',
      width: '120px'
    },
    {
      title: 'page.dashboard.report',
      width: '120px'
    },
    {
      title: 'page.dashboard.dashboardType',
      width: '120px'
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
    private dbs: DashboardService,
    private re: ReportService,
    private modal: NzModalService,
    private i18n: I18NService,
    private ls: LanguageService,
    private event: NgEventBus,
    private bs: NzBreakpointService
  ) {
    this.event.on('dashboard:refresh').subscribe(() => {
      this.init();
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
  dashboard: any[] = [];
  selectData: any[] = [];
  reportSelect = [];
  selectAll = false;
  confirmModal: NzModalRef;

  isSmall = false;
  isZoomFlg = false;

  // 仪表盘类型选项
  chartType = [
    {
      name: 'page.dashboard.lineChart',
      value: 'line'
    },
    {
      name: 'page.dashboard.areaChart',
      value: 'area'
    },
    {
      name: 'page.dashboard.columnChart',
      value: 'column'
    },
    {
      name: 'page.dashboard.histogramChart',
      value: 'histogram'
    },
    {
      name: 'page.dashboard.barChart',
      value: 'bar'
    },
    {
      name: 'page.dashboard.scatterChart',
      value: 'point'
    },
    {
      name: 'page.dashboard.radarChart',
      value: 'radar'
    },
    {
      name: 'page.dashboard.pieChart',
      value: 'pie'
    }
  ];

  // 分页参数
  total = 0;
  index = 1;
  size = 100;

  ngOnInit() {
    // 表单验证
    this.seachForm = this.fb.group({
      reportId: [null, []]
    });
    this.init();
  }

  async init() {
    await this.getSelectData();
    this.search();
  }
  /**
   * @description: 获取报表数据
   */
  async getSelectData() {
    await this.re.getReports().then((data: any[]) => {
      if (data) {
        this.reportSelect = data;
      } else {
        this.reportSelect = [];
      }
    });
  }

  /**
   * @description: 根据reportId查找报表名称
   */
  getReportName(reportId) {
    const report = this.reportSelect.find(f => f.report_id === reportId);
    return report ? report.report_name : '';
  }

  /**
   * @description: 查找图表类型
   */
  getChartType(dashboardType) {
    const chart = this.chartType.find(c => c.value === dashboardType);
    return chart ? chart.name : '';
  }

  /**
   * @description 检索
   */
  search() {
    const reportId = this.seachForm.get('reportId').value;
    this.dbs.getDashboards(reportId).then((data: any[]) => {
      if (data) {
        this.dashboard = data;
      } else {
        this.dashboard = [];
      }
    });
  }

  /**
   * @description 跳转更新页面
   */
  fowardToInfo(dashboardId: string) {
    const url = `/dashboard/edit/${dashboardId}`;
    this.router.navigate([url]);
  }

  /**
   * @description 跳转登录页面
   */
  fowardToAdd() {
    const url = `/dashboard/add`;
    this.router.navigate([url]);
  }

  /**
   * @description: 全选
   */
  checkAll(event) {
    this.dashboard.forEach(f => (f.checked = event));
    this.selectData = this.dashboard.filter(d => d.checked === true);
  }
  /**
   * @description 物理删除仪表盘数据
   */
  hardDelete() {
    const dashboardList = [];
    this.selectData.forEach(d => {
      dashboardList.push(d.dashboard_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.dashboardDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.dashboardDelContent')}`,
      nzOnOk: async () => {
        // 物理删除台账&台账字段&台账数据&关联报表&关联仪表盘&相关多语言项(台账名称，字段名称，报表名称，仪表盘名称)
        await this.dbs.hardDeleteDashboards(dashboardList);
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
    this.selectData = this.dashboard.filter(d => d.checked === true);
    if (this.selectData.length === this.dashboard.length) {
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
