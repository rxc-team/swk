/*
 * @Description: 仪表盘设置页面
 * @Author: RXC 呉見華
 * @Date: 2019-08-26 15:22:09
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-08-25 11:38:57
 */

import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService, ReportService, ValidationService } from '@api';
import { I18NService } from '@core';

import { AreaChartComponent } from '../chart/area-chart/area-chart.component';
import { BarChartComponent } from '../chart/bar-chart/bar-chart.component';
import { ColumnChartComponent } from '../chart/column-chart/column-chart.component';
import { HistogramChartComponent } from '../chart/histogram-chart/histogram-chart.component';
import { LineChartComponent } from '../chart/line-chart/line-chart.component';
import { PieChartComponent } from '../chart/pie-chart/pie-chart.component';
import { PointChartComponent } from '../chart/point-chart/point-chart.component';
import { RadarChartComponent } from '../chart/radar-chart/radar-chart.component';

@Component({
  selector: 'app-dashboard-form',
  templateUrl: './dashboard-form.component.html',
  styleUrls: ['./dashboard-form.component.less']
})
export class DashboardFormComponent implements OnInit, OnDestroy {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dashboard: DashboardService,
    private report: ReportService,
    private router: Router,
    private modal: NzModalService,
    private location: Location,
    private validation: ValidationService,
    private i18n: I18NService,
    private eventBus: NgEventBus,
    private message: NzMessageService,
    private bs: NzBreakpointService
  ) {
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

  // 全局类型
  // 状态区分
  status = 'add';
  isSmall = false;
  // 表单
  dashboardForm: FormGroup;
  // 报表选项
  groupReportOptions = [];
  // 报表选项
  listReportOptions = [];
  // 仪表盘类型选项
  dashboardOptions = [
    {
      name: 'page.dashboard.lineChart',
      icon: 'line-chart',
      value: 'line'
    },
    {
      name: 'page.dashboard.barChart',
      icon: 'bar-chart',
      value: 'bar'
    },
    {
      name: 'page.dashboard.pieChart',
      icon: 'pie-chart',
      value: 'pie'
    }
  ];
  // 仪表盘类型选项
  dashboardOptions1 = [
    {
      icon: 'column.png',
      value: 'column'
    },
    {
      icon: 'bar.png',
      value: 'bar'
    },
    {
      icon: 'pie.png',
      value: 'pie'
    },
    {
      icon: 'line.png',
      value: 'line'
    },
    {
      icon: 'area.png',
      value: 'area'
    },
    {
      icon: 'histogram.png',
      value: 'histogram'
    },
    {
      icon: 'radar.png',
      value: 'radar'
    },
    {
      icon: 'point.png',
      value: 'point'
    }
  ];

  // 点图类型选项
  rangeTypeOptions = [
    {
      label: 'page.dashboard.auto',
      value: 'auto'
    },
    {
      label: 'page.dashboard.fiexdNumber',
      value: 'count'
    },
    {
      label: 'page.dashboard.customize',
      value: 'custom'
    }
  ];

  // 点图类型选项
  stackedTypeOptions = [
    {
      label: 'page.dashboard.Stacked',
      value: true,
      disabled: false
    },
    {
      label: 'page.dashboard.noStack',
      value: false,
      disabled: false
    }
  ];
  groupTypeOptions = [
    {
      label: 'page.dashboard.group',
      value: true,
      disabled: false
    },
    {
      label: 'page.dashboard.noGroup',
      value: false,
      disabled: false
    }
  ];
  smoothTypeOptions = [
    {
      label: 'page.dashboard.curve',
      value: true,
      disabled: false
    },
    {
      label: 'page.dashboard.beeline',
      value: false,
      disabled: false
    }
  ];
  percentTypeOptions = [
    {
      label: 'page.dashboard.percentStacked',
      value: true,
      disabled: false
    },
    {
      label: 'page.dashboard.noStack',
      value: false,
      disabled: false
    }
  ];

  // x轴字段
  gFields: Array<{ fieldId: string; aliasName: string; dataType: string; disabled?: boolean }> = [];
  // x轴字段
  xFields: Array<{ fieldId: string; aliasName: string; dataType: string; disabled?: boolean }> = [];
  // y轴字段
  yFields: Array<{ fieldId: string; aliasName: string; dataType: string; disabled?: boolean }> = [];

  gFieldRequired = false;

  // 固定字段
  fixedFields = [
    {
      field_name: 'common.text.createdAt',
      alias_name: 'created_at'
    },
    {
      field_name: 'common.text.createdBy',
      alias_name: 'created_by'
    },
    {
      field_name: 'common.text.updateAt',
      alias_name: 'updated_at'
    },
    {
      field_name: 'common.text.updatedBy',
      alias_name: 'updated_by'
    },
    {
      field_name: 'common.text.checkedAt',
      alias_name: 'checked_at'
    },
    {
      field_name: 'common.text.checkedBy',
      alias_name: 'checked_by'
    },
    {
      field_name: 'common.text.checkType',
      alias_name: 'check_type'
    },
    {
      field_name: 'common.text.checkStatus',
      alias_name: 'check_status'
    }
  ];

  select(item) {
    // 重置某些选项
    this.getForm('reportId').reset();
    this.getForm('gFieldId').reset();
    this.getForm('xFieldId').reset();
    this.getForm('yFieldId').reset();
    this.gFields = [];
    this.xFields = [];
    this.yFields = [];
    // 重新赋值
    this.getForm('dashboardType').setValue(item);

    if (item === 'radar' || item === 'point') {
      this.gFieldRequired = true;
    } else {
      this.gFieldRequired = false;
    }

    if (item === 'bar') {
      this.getForm('scrollbar').get('type').setValue('vertical');
    }
    if (item === 'column') {
      this.getForm('scrollbar').get('type').setValue('horizontal');
    }
  }

  ngOnInit() {
    // form表单验证
    this.dashboardForm = this.fb.group({
      dashboardName: ['', [Validators.required], [this.dashboardNameAsyncValidator]],
      reportId: [null, [Validators.required]],
      dashboardType: ['column', [Validators.required]],
      gFieldId: [null, []],
      xFieldId: [null, [Validators.required]],
      yFieldId: [null, [Validators.required]],
      xRange: [[0.1, 0.9], [Validators.required]],
      yRange: [[0, 1], [Validators.required]],
      tickType: ['auto', [Validators.required]],
      ticks: [null, []],
      tickCount: [0, []],
      limitInPlot: [false, []],
      stepType: ['', []],
      isStack: [false, []],
      isPercent: [false, []],
      isGroup: [false, []],
      smooth: [false, []],
      minBarWidth: [10, []],
      maxBarWidth: [10, []],
      binWidth: [20, []],
      radius: [1, []],
      innerRadius: [0, []],
      startAngle: [1, []],
      endAngle: [3, []],
      slider: this.fb.group({
        start: [0, []],
        end: [1, []],
        height: [10, []]
      }),
      scrollbar: this.fb.group({
        type: ['', []],
        width: [10, []],
        height: [10, []],
        categorySize: [50, []]
      })
    });

    this.init();
  }

  ngOnDestroy(): void {}

  gFieldChange(field: string) {
    const dType = this.getForm('dashboardType').value;
    if (dType === 'line' || dType === 'area' || dType === 'bar' || dType === 'column') {
      this.xFields.forEach(f => {
        if (f.fieldId === field) {
          f.disabled = true;
        } else {
          f.disabled = false;
        }
      });
    }
  }

  xFieldChange(field: string) {
    const dType = this.getForm('dashboardType').value;
    if (dType === 'line' || dType === 'area' || dType === 'bar' || dType === 'column') {
      this.gFields.forEach(f => {
        if (f.fieldId === field) {
          f.disabled = true;
        } else {
          f.disabled = false;
        }
      });
    }
    if (dType === 'radar' || dType === 'point') {
      this.yFields.forEach(f => {
        if (f.fieldId === field) {
          f.disabled = true;
        } else {
          f.disabled = false;
        }
      });
    }
  }

  yFieldChange(field: string) {
    const dType = this.getForm('dashboardType').value;
    if (dType === 'radar' || dType === 'point') {
      this.xFields.forEach(f => {
        if (f.fieldId === field) {
          f.disabled = true;
        } else {
          f.disabled = false;
        }
      });
    }
  }

  stepTypeChange(tp: string) {
    if (tp) {
      this.getForm('smooth').setValue(false);
      this.getForm('isStack').setValue(false);
      this.stackedTypeOptions.forEach(f => (f.disabled = true));
      this.smoothTypeOptions.forEach(f => (f.disabled = true));
    } else {
      this.stackedTypeOptions.forEach(f => (f.disabled = false));
      this.smoothTypeOptions.forEach(f => (f.disabled = false));
    }
  }
  percentChange(tp: boolean) {
    if (tp) {
      this.getForm('isStack').setValue(true);
      this.getForm('isGroup').setValue(false);
      this.stackedTypeOptions.forEach(f => (f.disabled = true));
      this.groupTypeOptions.forEach(f => (f.disabled = true));
    } else {
      this.stackedTypeOptions.forEach(f => (f.disabled = false));
      this.groupTypeOptions.forEach(f => (f.disabled = false));
    }
  }

  stackChange(tp: boolean) {
    if (tp) {
      this.getForm('isGroup').setValue(false);
      this.groupTypeOptions.forEach(f => (f.disabled = true));
    } else {
      this.groupTypeOptions.forEach(f => (f.disabled = false));
    }
  }

  groupChange(tp: boolean) {
    if (tp) {
      this.getForm('isStack').setValue(false);
      this.getForm('isPercent').setValue(false);
      this.stackedTypeOptions.forEach(f => (f.disabled = true));
      this.percentTypeOptions.forEach(f => (f.disabled = true));
    } else {
      this.stackedTypeOptions.forEach(f => (f.disabled = false));
      this.percentTypeOptions.forEach(f => (f.disabled = false));
    }
  }

  /**
   * @description: 预览
   */
  show() {
    let ticks = [];
    if (this.getForm('tickType').value === 'custom') {
      ticks = this.getForm('ticks').value.split(',');
    }

    if (this.getForm('dashboardType').value === 'line') {
      const modal: NzModalRef = this.modal.create({
        nzTitle: this.getForm('dashboardName').value,
        nzContent: LineChartComponent,
        nzMask: false,
        nzComponentParams: {
          reportId: this.getForm('reportId').value,
          gField: this.getForm('gFieldId').value,
          xField: this.getForm('xFieldId').value,
          yField: this.getForm('yFieldId').value,
          xRange: this.getForm('xRange').value,
          yRange: this.getForm('yRange').value,
          tickType: this.getForm('tickType').value,
          ticks: ticks,
          tickCount: this.getForm('tickCount').value,
          limitInPlot: this.getForm('limitInPlot').value,
          smooth: this.getForm('smooth').value,
          stepType: this.getForm('stepType').value,
          isStack: this.getForm('isStack').value,
          slider: this.getForm('slider').value
        },
        nzFooter: null,
        nzOnCancel: () => {
          modal.destroy();
        }
      });
    }

    if (this.getForm('dashboardType').value === 'area') {
      const modal: NzModalRef = this.modal.create({
        nzTitle: this.getForm('dashboardName').value,
        nzContent: AreaChartComponent,
        nzMask: false,
        nzComponentParams: {
          reportId: this.getForm('reportId').value,
          gField: this.getForm('gFieldId').value,
          xField: this.getForm('xFieldId').value,
          yField: this.getForm('yFieldId').value,
          xRange: this.getForm('xRange').value,
          yRange: this.getForm('yRange').value,
          tickType: this.getForm('tickType').value,
          ticks: ticks,
          tickCount: this.getForm('tickCount').value,
          limitInPlot: this.getForm('limitInPlot').value,
          smooth: this.getForm('smooth').value,
          isPercent: this.getForm('isPercent').value,
          isStack: this.getForm('isStack').value,
          slider: this.getForm('slider').value
        },
        nzFooter: null,
        nzOnCancel: () => {
          modal.destroy();
        }
      });
    }
    if (this.getForm('dashboardType').value === 'bar') {
      const modal: NzModalRef = this.modal.create({
        nzTitle: this.getForm('dashboardName').value,
        nzContent: BarChartComponent,
        nzMask: false,
        nzComponentParams: {
          reportId: this.getForm('reportId').value,
          gField: this.getForm('gFieldId').value,
          xField: this.getForm('xFieldId').value,
          yField: this.getForm('yFieldId').value,
          xRange: this.getForm('xRange').value,
          yRange: this.getForm('yRange').value,
          tickType: this.getForm('tickType').value,
          ticks: ticks,
          tickCount: this.getForm('tickCount').value,
          limitInPlot: this.getForm('limitInPlot').value,
          isStack: this.getForm('isStack').value,
          isPercent: this.getForm('isPercent').value,
          isGroup: this.getForm('isGroup').value,
          minBarWidth: this.getForm('minBarWidth').value,
          maxBarWidth: this.getForm('maxBarWidth').value,
          scrollbar: this.getForm('scrollbar').value
        },
        nzFooter: null,
        nzOnCancel: () => {
          modal.destroy();
        }
      });
    }
    if (this.getForm('dashboardType').value === 'column') {
      const modal: NzModalRef = this.modal.create({
        nzTitle: this.getForm('dashboardName').value,
        nzContent: ColumnChartComponent,
        nzMask: false,
        nzComponentParams: {
          reportId: this.getForm('reportId').value,
          gField: this.getForm('gFieldId').value,
          xField: this.getForm('xFieldId').value,
          yField: this.getForm('yFieldId').value,
          xRange: this.getForm('xRange').value,
          yRange: this.getForm('yRange').value,
          tickType: this.getForm('tickType').value,
          ticks: ticks,
          tickCount: this.getForm('tickCount').value,
          limitInPlot: this.getForm('limitInPlot').value,
          isStack: this.getForm('isStack').value,
          isPercent: this.getForm('isPercent').value,
          isGroup: this.getForm('isGroup').value,
          minColumnWidth: this.getForm('minBarWidth').value,
          maxColumnWidth: this.getForm('maxBarWidth').value,
          scrollbar: this.getForm('scrollbar').value
        },
        nzFooter: null,
        nzOnCancel: () => {
          modal.destroy();
        }
      });
    }
    if (this.getForm('dashboardType').value === 'histogram') {
      const modal: NzModalRef = this.modal.create({
        nzTitle: this.getForm('dashboardName').value,
        nzContent: HistogramChartComponent,
        nzMask: false,
        nzComponentParams: {
          reportId: this.getForm('reportId').value,
          gField: this.getForm('gFieldId').value,
          xField: this.getForm('xFieldId').value,
          yField: this.getForm('yFieldId').value,
          xRange: this.getForm('xRange').value,
          yRange: this.getForm('yRange').value,
          tickType: this.getForm('tickType').value,
          ticks: ticks,
          tickCount: this.getForm('tickCount').value,
          limitInPlot: this.getForm('limitInPlot').value,
          binWidth: this.getForm('binWidth').value
        },
        nzFooter: null,
        nzOnCancel: () => {
          modal.destroy();
        }
      });
    }
    if (this.getForm('dashboardType').value === 'pie') {
      const modal: NzModalRef = this.modal.create({
        nzTitle: this.getForm('dashboardName').value,
        nzContent: PieChartComponent,
        nzMask: false,
        nzComponentParams: {
          reportId: this.getForm('reportId').value,
          gField: this.getForm('gFieldId').value,
          xField: this.getForm('xFieldId').value,
          yField: this.getForm('yFieldId').value,
          limitInPlot: this.getForm('limitInPlot').value,
          radius: this.getForm('radius').value,
          innerRadius: this.getForm('innerRadius').value,
          startAngle: this.getForm('startAngle').value,
          endAngle: this.getForm('endAngle').value
        },
        nzFooter: null,
        nzOnCancel: () => {
          modal.destroy();
        }
      });
    }
    if (this.getForm('dashboardType').value === 'radar') {
      const modal: NzModalRef = this.modal.create({
        nzTitle: this.getForm('dashboardName').value,
        nzContent: RadarChartComponent,
        nzMask: false,
        nzComponentParams: {
          reportId: this.getForm('reportId').value,
          gField: this.getForm('gFieldId').value,
          xField: this.getForm('xFieldId').value,
          yField: this.getForm('yFieldId').value,
          limitInPlot: this.getForm('limitInPlot').value,
          radius: this.getForm('radius').value,
          startAngle: this.getForm('startAngle').value,
          endAngle: this.getForm('endAngle').value
        },
        nzFooter: null,
        nzOnCancel: () => {
          modal.destroy();
        }
      });
    }
    if (this.getForm('dashboardType').value === 'point') {
      const modal: NzModalRef = this.modal.create({
        nzTitle: this.getForm('dashboardName').value,
        nzContent: PointChartComponent,
        nzMask: false,
        nzComponentParams: {
          reportId: this.getForm('reportId').value,
          gField: this.getForm('gFieldId').value,
          xField: this.getForm('xFieldId').value,
          yField: this.getForm('yFieldId').value,
          limitInPlot: this.getForm('limitInPlot').value
        },
        nzFooter: null,
        nzOnCancel: () => {
          modal.destroy();
        }
      });
    }
  }

  /**
   * @description: 初始化页面
   */
  async init() {
    // 数据加载符...
    const dashboardId = this.route.snapshot.paramMap.get('id');
    if (dashboardId) {
      this.status = 'edit';
      // 并行获取数据
      forkJoin([this.report.getReports(), this.dashboard.getDashboardById(dashboardId)])
        .toPromise()
        .then(async (data: any[]) => {
          if (data) {
            const reportsData = data[0];
            const dashData = data[1];

            // 报表数据
            if (reportsData) {
              this.groupReportOptions = reportsData.filter(r => r.is_use_group);
              this.listReportOptions = reportsData.filter(r => !r.is_use_group);
            } else {
              this.groupReportOptions = [];
              this.listReportOptions = [];
            }

            // 仪表盘数据
            if (dashData) {
              this.getForm('reportId').setValue(dashData.report_id);
              // 根据report ID获取X和Y轴字段
              await this.report.getReportById(dashData.report_id).then(rpData => {
                if (rpData) {
                  // 变更报表，重新获取X和Y轴字段
                  this.gFields = [];
                  this.xFields = [];
                  this.yFields = [];

                  if (rpData.group_info) {
                    if (rpData.group_info.group_keys) {
                      rpData.group_info.group_keys.forEach(group => {
                        this.gFields.push({
                          fieldId: group.field_id,
                          aliasName: group.alias_name,
                          dataType: group.data_type
                        });
                        this.xFields.push({
                          fieldId: group.field_id,
                          aliasName: group.alias_name,
                          dataType: group.data_type
                        });
                      });
                    }
                    if (rpData.group_info.aggre_keys) {
                      rpData.group_info.aggre_keys.forEach(group => {
                        this.yFields.push({
                          fieldId: group.field_id,
                          aliasName: group.alias_name,
                          dataType: group.data_type
                        });
                      });
                    }

                    if (rpData.group_info.show_count) {
                      this.yFields.push({
                        fieldId: 'count',
                        aliasName: this.i18n.translateLang('page.dashboard.count'),
                        dataType: 'number'
                      });
                    }
                  }
                  if (rpData.select_key_infos) {
                    rpData.select_key_infos.forEach(key => {
                      if (key.data_type === 'number') {
                        this.xFields.push({
                          fieldId: key.field_id,
                          aliasName: key.alias_name,
                          dataType: key.data_type
                        });
                        this.yFields.push({
                          fieldId: key.field_id,
                          aliasName: key.alias_name,
                          dataType: key.data_type
                        });
                      } else {
                        this.gFields.push({
                          fieldId: key.field_id,
                          aliasName: key.alias_name,
                          dataType: key.data_type
                        });
                      }
                    });
                  }
                }
              });
              // 画面设定初期值
              this.getForm('dashboardName').setValue(this.i18n.translateLang(dashData.dashboard_name));
              this.getForm('dashboardName').setAsyncValidators(this.dashboardNameAsyncValidator);
              this.getForm('dashboardType').setValue(dashData.dashboard_type);
              this.getForm('gFieldId').setValue(dashData.g_field_id);
              this.getForm('xFieldId').setValue(dashData.x_field_id);
              this.getForm('yFieldId').setValue(dashData.y_field_id);
              this.getForm('xRange').setValue(dashData.x_range);
              this.getForm('yRange').setValue(dashData.y_range);
              this.getForm('tickType').setValue(dashData.tick_type);
              if (dashData.ticks) {
                this.getForm('ticks').setValue(dashData.ticks.join(','));
              }
              this.getForm('tickCount').setValue(dashData.tick_count);

              this.getForm('limitInPlot').setValue(dashData.limit_in_plot);
              this.getForm('stepType').setValue(dashData.step_type);
              this.getForm('isStack').setValue(dashData.is_stack);
              this.getForm('isPercent').setValue(dashData.is_percent);
              this.getForm('isGroup').setValue(dashData.is_group);
              this.getForm('smooth').setValue(dashData.smooth);
              this.getForm('minBarWidth').setValue(dashData.min_bar_width);
              this.getForm('maxBarWidth').setValue(dashData.max_bar_width);
              this.getForm('radius').setValue(dashData.radius);
              this.getForm('innerRadius').setValue(dashData.inner_radius);
              this.getForm('startAngle').setValue(dashData.start_angle);
              this.getForm('endAngle').setValue(dashData.end_angle);
              this.getForm('slider').get('start').setValue(dashData.slider.start);
              this.getForm('slider').get('end').setValue(dashData.slider.end);
              this.getForm('slider').get('height').setValue(dashData.slider.height);
              this.getForm('scrollbar').get('type').setValue(dashData.scrollbar.type);
              this.getForm('scrollbar').get('width').setValue(dashData.scrollbar.width);
              this.getForm('scrollbar').get('height').setValue(dashData.scrollbar.height);
              this.getForm('scrollbar').get('categorySize').setValue(dashData.scrollbar.category_size);
            } else {
              this.message.warning(this.i18n.translateLang('common.message.warning.W_002'));
              this.location.back();
            }
          }
        });
    } else {
      await this.report.getReports().then((data: any[]) => {
        if (data) {
          this.groupReportOptions = data.filter(r => r.is_use_group);
          this.listReportOptions = data.filter(r => !r.is_use_group);
        } else {
          this.groupReportOptions = [];
          this.listReportOptions = [];
        }
      });
    }
  }

  /**
   * @description: 获取表单元素
   * @param string 元素名称
   */
  getForm(formName: string) {
    return this.dashboardForm.controls[formName];
  }

  /**
   * @description: 仪表盘名称唯一性检查
   */
  dashboardNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const dashId = this.route.snapshot.paramMap.get('id');
      this.validation.validationUnique('dashboards', control.value, { change_id: dashId }).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 报表改变事件
   * @param string 报表ID
   */
  reportChange(reportId: string) {
    if (reportId) {
      this.report.getReportById(reportId).then(data => {
        if (data) {
          // 变更报表，重新获取X和Y轴字段
          this.getForm('gFieldId').reset();
          this.getForm('xFieldId').reset();
          this.getForm('yFieldId').reset();
          this.gFields = [];
          this.xFields = [];
          this.yFields = [];

          if (data.group_info) {
            if (data.group_info.group_keys) {
              data.group_info.group_keys.forEach(group => {
                this.gFields.push({
                  fieldId: group.field_id,
                  aliasName: group.alias_name,
                  dataType: group.data_type
                });
                this.xFields.push({
                  fieldId: group.field_id,
                  aliasName: group.alias_name,
                  dataType: group.data_type
                });
              });
            }
            if (data.group_info.aggre_keys) {
              data.group_info.aggre_keys.forEach(group => {
                this.yFields.push({
                  fieldId: group.field_id,
                  aliasName: group.alias_name,
                  dataType: group.data_type
                });
              });
            }

            if (data.group_info.show_count) {
              this.yFields.push({
                fieldId: 'count',
                aliasName: this.i18n.translateLang('page.dashboard.count'),
                dataType: 'number'
              });
            }
          }
          if (data.select_key_infos) {
            data.select_key_infos.forEach(key => {
              if (key.data_type === 'number') {
                this.xFields.push({
                  fieldId: key.field_id,
                  aliasName: key.alias_name,
                  dataType: key.data_type
                });
                this.yFields.push({
                  fieldId: key.field_id,
                  aliasName: key.alias_name,
                  dataType: key.data_type
                });
              } else {
                this.gFields.push({
                  fieldId: key.field_id,
                  aliasName: key.alias_name,
                  dataType: key.data_type
                });
              }
            });
          }
        }
      });
    }
  }

  /**
   * @description: 提交表单事件
   */
  submitForm = ($event: any, value: any) => {
    let ticks: number[] = [];
    if (this.getForm('tickType').value === 'custom') {
      ticks = this.getForm('ticks').value.split(',');

      ticks = ticks.map(v => Number(v));
    }

    // 编辑form表单数据
    const params = {
      dashboard_name: this.getForm('dashboardName').value,
      report_id: this.getForm('reportId').value,
      dashboard_type: this.getForm('dashboardType').value,
      x_range: this.getForm('xRange').value,
      y_range: this.getForm('yRange').value,
      tick_type: this.getForm('tickType').value,
      ticks: ticks,
      tick_count: this.getForm('tickCount').value || 5,
      g_field_id: this.getForm('gFieldId').value,
      x_field_id: this.getForm('xFieldId').value,
      y_field_id: this.getForm('yFieldId').value,

      limit_in_plot: this.getForm('limitInPlot').value,
      step_type: this.getForm('stepType').value,
      is_stack: this.getForm('isStack').value,
      is_percent: this.getForm('isPercent').value,
      is_group: this.getForm('isGroup').value,
      smooth: this.getForm('smooth').value,
      min_bar_width: this.getForm('minBarWidth').value,
      max_bar_width: this.getForm('maxBarWidth').value,
      radius: this.getForm('radius').value,
      inner_radius: this.getForm('innerRadius').value,
      start_angle: this.getForm('startAngle').value,
      end_angle: this.getForm('endAngle').value,
      slider: {
        start: this.getForm('slider').get('start').value,
        end: this.getForm('slider').get('end').value,
        height: this.getForm('slider').get('height').value
      },
      scrollbar: {
        type: this.getForm('scrollbar').get('type').value,
        width: this.getForm('scrollbar').get('width').value,
        height: this.getForm('scrollbar').get('height').value,
        category_size: this.getForm('scrollbar').get('categorySize').value
      }
    };

    if (this.status === 'add') {
      // 调用服务添加仪表盘数据
      this.dashboard.addDashboard(params).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.eventBus.cast('dashboard:refresh');
        this.location.back();
      });
    } else {
      // 通过路由获取仪表盘ID
      const dashboardId = this.route.snapshot.paramMap.get('id');
      // 调用服务更新仪表盘数据
      this.dashboard.updateDashboard(dashboardId, params).then(async res => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.eventBus.cast('dashboard:refresh');
        this.location.back();
      });
    }
  };

  reset() {
    this.dashboardForm.reset();
  }

  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
  }
}
