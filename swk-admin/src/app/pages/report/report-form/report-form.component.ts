/*
 * @Description: 报表设置
 * @Author: RXC 呉見華
 * @Date: 2019-08-23 10:33:30
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2021-01-20 13:55:33
 */

import { format } from 'date-fns';
import * as _ from 'lodash';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { forkJoin, Observable, Observer, of } from 'rxjs';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
    AppService, DashboardService, DatastoreService, FieldService, OptionService, ReportService,
    UserService, ValidationService
} from '@api';
import { I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.less']
})
export class ReportFormComponent implements OnInit, OnDestroy {
  colsWithGroup = [
    {
      title: 'page.report.no',
      width: '40px'
    },
    {
      title: 'page.report.fieldDatastore',
      width: '120px'
    },
    {
      title: 'page.report.fieldName',
      width: '120px'
    },
    {
      title: 'page.report.fieldType',
      width: '100px'
    },
    {
      title: 'page.report.fieldSort',
      width: '80px'
    },
    {
      title: 'page.report.fieldAggre',
      width: '60px'
    },
    {
      title: 'page.report.fieldAlias',
      width: '120px'
    },
    {
      title: 'page.report.operate',
      width: '140px'
    }
  ];

  // 表单
  validateForm: FormGroup;
  // 画面区分flag
  status = 'add';
  // 台账
  datastores: any[] = [];
  // 台账的检索字段
  searchFields: any[] = [];
  selectedFields: any[] = [];

  // 检索使用-当前选择的检索字段数组
  controlArray: Array<{
    id: number;
    field_id: any;
    field_type: any;
    lookup_datastore_id?: string;
    lookup_field_id?: string;
    prefix?: string;
    display_digits?: number;
    status?: string;
    operator: any;
    search_value: string | number | boolean | string[];
    condition_type: any;
    is_dynamic: boolean;
  }> = [];

  // 检索使用-选项数组
  optionArray: Map<string, any[]> = new Map();
  // 检索使用-用户数组
  userArray: Map<string, any[]> = new Map();
  // 出力报表字段选择的台账
  selectDatastoreID = '';

  // 已选择字段
  selectField: any = {
    field_id: '',
    datastore_id: '',
    field_name: 'page.report.fieldSelect',
    alias_name: '',
    field_type: 'text',
    is_dynamic: false,
    unique: false
  };

  // 关联台账
  isLookupVisible = false;
  lookupDatastoreId = '';
  lookField = '';
  lookIndex = 0;

  confirmModal: NzModalRef;
  loading = false;
  isSmall = false;

  // 字段属性设置
  showFieldSetting = false;
  isLeaseSystem = false;
  selectedIndex = 0;

  // 固定字段
  fixedFields = [
    {
      field_id: 'created_at',
      datastore_id: '',
      field_name: 'common.text.createdAt',
      alias_name: 'created_at',
      field_type: 'datetime',
      option_id: '',
      is_dynamic: false
    },
    {
      field_id: 'created_by',
      datastore_id: '',
      field_name: 'common.text.createdBy',
      alias_name: 'created_by',
      field_type: 'user',
      option_id: '',
      is_dynamic: false
    },
    {
      field_id: 'updated_at',
      datastore_id: '',
      field_name: 'common.text.updateAt',
      alias_name: 'updated_at',
      field_type: 'datetime',
      option_id: '',
      is_dynamic: false
    },
    {
      field_id: 'updated_by',
      datastore_id: '',
      field_name: 'common.text.updatedBy',
      alias_name: 'updated_by',
      field_type: 'user',
      option_id: '',
      is_dynamic: false
    },
    {
      field_id: 'checked_at',
      datastore_id: '',
      field_name: 'common.text.checkedAt',
      alias_name: 'checked_at',
      field_type: 'datetime',
      option_id: '',
      is_dynamic: false
    },
    {
      field_id: 'checked_by',
      datastore_id: '',
      field_name: 'common.text.checkedBy',
      alias_name: 'checked_by',
      field_type: 'user',
      option_id: '',
      is_dynamic: false
    },
    {
      field_id: 'check_type',
      datastore_id: '',
      field_name: 'common.text.checkType',
      alias_name: 'check_type',
      field_type: 'type',
      option_id: '',
      is_dynamic: false
    },
    {
      field_id: 'check_status',
      datastore_id: '',
      field_name: 'common.text.checkStatus',
      alias_name: 'check_status',
      field_type: 'check',
      option_id: '',
      is_dynamic: false
    },
    {
      field_id: 'label_time',
      datastore_id: '',
      field_name: 'common.text.labelTime',
      alias_name: 'label_time',
      field_type: 'datetime',
      option_id: '',
      is_dynamic: false
    }
  ];

  checkTypes = [
    {
      label: 'common.text.visuallycheck',
      value: 'Visual'
    },
    {
      label: 'common.text.imagecheck',
      value: 'Image'
    },
    {
      label: 'common.text.barcodecheck',
      value: 'Scan'
    }
  ];

  checkStatuss = [
    {
      label: 'common.text.checkWait',
      value: '0'
    },
    {
      label: 'common.text.checkOver',
      value: '1'
    }
  ];

  outputFields = [];

  constructor(
    private fb: FormBuilder,
    private db: DatastoreService,
    private option: OptionService,
    private field: FieldService,
    private i18n: I18NService,
    private route: ActivatedRoute,
    private report: ReportService,
    private tokenService: TokenStorageService,
    private message: NzMessageService,
    private validation: ValidationService,
    private user: UserService,
    private location: Location,
    private modal: NzModalService,
    private dashboard: DashboardService,
    private event: NgEventBus,
    private app: AppService,
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

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.selectedFields, event.previousIndex, event.currentIndex);
    this.selectedFields.forEach((n, i) => {
      const node = i + 1;
      n.order = node;
    });
  }

  showField(i) {
    if (i.disabled) {
      return;
    }
    this.selectField = i;
    this.showFieldSetting = true;
  }

  editField(i) {
    this.selectField = i;
    this.showFieldSetting = true;
  }

  async ngOnInit() {
    // 表单验证
    this.validateForm = this.fb.group({
      reportName: [null, [Validators.required], [this.reportNameAsyncValidator]],
      datastoreID: [null, [Validators.required]],
      conditionType: ['and', [Validators.required]],
      useGroup: [null],
      showCount: [null]
    });

    this.init();
  }

  ngOnDestroy(): void {}

  async init() {
    // 重置数据
    this.selectedFields = [];
    // 获取台账
    await this.getDatastores();
    // 系统类型判断
    await this.systemType();

    const reportId = this.route.snapshot.paramMap.get('id');
    if (reportId) {
      this.status = 'edit';
      // 获取报表信息
      await this.getReportInfo(reportId);
    }
  }

  /**
   * @description: 报表名称唯一性检查
   */
  reportNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const reportID = this.route.snapshot.paramMap.get('id');
      this.validation.validationUnique('reports', control.value, { change_id: reportID }).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 获取报表信息
   * @param string 报表ID
   */
  async getReportInfo(reportId: string) {
    // 报表信息
    let reportInfo: any;
    let fields = [];

    // 获取报表信息
    await this.report.getReportById(reportId).then((data: any) => {
      if (data) {
        reportInfo = data;
      } else {
        reportInfo = {};
      }
    });

    // 获取字段信息
    await this.field.getFields(reportInfo.datastore_id).then((data: any[]) => {
      if (data) {
        // 检索条件字段取得
        this.searchFields = this.deepClone(data.filter(f => f.field_type !== 'function'));
        this.searchFields.forEach(f => (f.is_dynamic = true));
        const fixedFields = JSON.parse(JSON.stringify(this.fixedFields));
        this.searchFields.push(...fixedFields);

        fields = data;
      } else {
        fields = [];
      }
    });

    // 设置出力字段
    await this.setReportField(fields, reportInfo.datastore_id);

    // 设置画面字段
    this.selectDatastoreID = reportInfo.datastore_id;
    this.getForm('reportName').setValue(this.i18n.translateLang(reportInfo.report_name));
    this.getForm('reportName').setAsyncValidators(this.reportNameAsyncValidator);
    this.getForm('datastoreID').setValue(reportInfo.datastore_id);
    this.getForm('conditionType').setValue(reportInfo.condition_type);
    this.getForm('useGroup').setValue(reportInfo.is_use_group);

    // 设置条件
    if (reportInfo.report_conditions) {
      this.controlArray = reportInfo.report_conditions;
      this.controlArray.forEach(c => {
        if (c.field_type === 'lookup') {
          const field = this.searchFields.find(f => f.field_id === c.field_id);
          if (field) {
            c.lookup_datastore_id = field.lookup_datastore_id;
            c.lookup_field_id = field.lookup_field_id;
          }
        }
        if (c.field_type === 'autonum') {
          const field = this.searchFields.find(f => f.field_id === c.field_id);
          if (field) {
            c.prefix = field.prefix;
            c.display_digits = field.display_digits;
          }
        }
        if (c.operator === 'in') {
          if (c.search_value) {
            c.search_value = c.search_value.toString().split(',');
          }
        }
        if (c.field_type === 'switch') {
          c.search_value = c.search_value === 'true' ? true : false;
        }
        if (c.field_type === 'date' || c.field_type === 'datetime') {
          if (c.search_value === 'handleMonth' || c.search_value === 'now') {
            c.status = 'system';
          } else {
            c.status = 'none';
          }
        }

        this.fieldChange(c.field_id, c, true);
      });
    } else {
      this.controlArray = [];
      this.addField();
    }

    // 设置报表出力内容
    if (reportInfo.is_use_group) {
      // 是否显示件数
      this.getForm('showCount').setValue(reportInfo.group_info.show_count);
      this.selectedFields = [];
      // 添加group字段
      if (reportInfo.group_info.group_keys) {
        reportInfo.group_info.group_keys.forEach(field => {
          if (field.is_dynamic) {
            // 查看当前台账的字段
            const item = this.outputFields.find(f => f.field_id === field.field_id && f.datastore_id === field.datastore_id && !f.submenu);
            if (item) {
              item['is_lookup'] = field.is_lookup;
              item['sort'] = field.sort;
              item['alias_name'] = field.alias_name;
              item['datastore_id'] = field.datastore_id;
              item['is_dynamic'] = true;
              item['order'] = field.order;
              item['unique'] = field.unique;
              item['option_id'] = field.option_id;

              item.disabled = true;
              this.selectedFields = [...this.selectedFields, item];
            } else {
              // 再查看当前台账的关联字段
              for (let index = 0; index < this.outputFields.length; index++) {
                const f = this.outputFields[index];
                if (f.children) {
                  const children = f.children;
                  const ofs = children.find(of => of.field_id === field.field_id && of.datastore_id === field.datastore_id);
                  if (ofs) {
                    ofs['is_lookup'] = field.is_lookup;
                    ofs['sort'] = field.sort;
                    ofs['alias_name'] = field.alias_name;
                    ofs['datastore_id'] = field.datastore_id;
                    ofs['is_dynamic'] = true;
                    ofs['order'] = field.order;
                    ofs['unique'] = field.unique;
                    ofs['option_id'] = field.option_id;

                    ofs.disabled = true;
                    this.selectedFields = [...this.selectedFields, ofs];
                    break;
                  }
                }
              }
            }
          } else {
            const item = this.outputFields.find(f => f.field_id === field.field_id && f.datastore_id === field.datastore_id && !f.submenu);
            if (item) {
              item['sort'] = field.sort;
              item['alias_name'] = field.alias_name;
              item['is_dynamic'] = false;
              item['datastore_id'] = field.datastore_id;
              item['order'] = field.order;
              item['unique'] = false;
              item['option_id'] = field.option_id;
              item.disabled = true;
              this.selectedFields.push(item);
            }
          }
        });
      }
      // 添加aggre字段
      if (reportInfo.group_info.aggre_keys) {
        reportInfo.group_info.aggre_keys.forEach(field => {
          // 查看当前台账的字段
          const item = this.outputFields.find(f => f.field_id === field.field_id && f.datastore_id === field.datastore_id && !f.submenu);
          if (item) {
            item['is_lookup'] = field.is_lookup;
            item['sort'] = field.sort;
            item['alias_name'] = field.alias_name;
            item['datastore_id'] = field.datastore_id;
            item['order'] = field.order;
            item['option_id'] = field.option_id;
            if (item.field_type === 'number' || item.return_type === 'number') {
              item.aggre_type = field.aggre_type;
            }
            item.disabled = true;
            this.selectedFields = [...this.selectedFields, item];
          } else {
            // 再查看当前台账的关联字段
            for (let index = 0; index < this.outputFields.length; index++) {
              const f = this.outputFields[index];
              if (f.children) {
                const children = f.children;
                const ofs = children.find(of => of.field_id === field.field_id && of.datastore_id === field.datastore_id);
                if (ofs) {
                  ofs['is_lookup'] = field.is_lookup;
                  ofs['sort'] = field.sort;
                  ofs['alias_name'] = field.alias_name;
                  ofs['datastore_id'] = field.datastore_id;
                  ofs['order'] = field.order;
                  ofs['option_id'] = field.option_id;
                  if (ofs.field_type === 'number' || ofs.return_type === 'number') {
                    ofs.aggre_type = field.aggre_type;
                  }

                  ofs.disabled = true;
                  this.selectedFields = [...this.selectedFields, ofs];
                  break;
                }
              }
            }
          }
        });
      }
    } else {
      this.selectedFields = [];
      // 不集计的场合，直接添加字段
      if (reportInfo.select_key_infos) {
        reportInfo.select_key_infos.forEach(field => {
          if (field.is_dynamic) {
            // 查看当前台账的字段
            const item = this.outputFields.find(f => f.field_id === field.field_id && f.datastore_id === field.datastore_id && !f.submenu);
            if (item) {
              item['sort'] = field.sort;
              item['alias_name'] = field.alias_name;
              item['is_dynamic'] = field.is_dynamic;
              item['datastore_id'] = field.datastore_id;
              item['order'] = field.order;
              item['unique'] = field.unique;
              item['option_id'] = field.option_id;

              item.disabled = true;
              this.selectedFields = [...this.selectedFields, item];
            } else {
              // 再查看当前台账的关联字段
              for (let index = 0; index < this.outputFields.length; index++) {
                const f = this.outputFields[index];
                if (f.children) {
                  const children = f.children;
                  const ofs = children.find(of => of.field_id === field.field_id && of.datastore_id === field.datastore_id);
                  if (ofs) {
                    ofs['sort'] = field.sort;
                    ofs['alias_name'] = field.alias_name;
                    ofs['is_dynamic'] = field.is_dynamic;
                    ofs['datastore_id'] = field.datastore_id;
                    ofs['order'] = field.order;
                    ofs['unique'] = field.unique;
                    ofs['option_id'] = field.option_id;

                    ofs.disabled = true;
                    this.selectedFields = [...this.selectedFields, ofs];
                    break;
                  }
                }
              }
            }
          } else {
            const item = this.outputFields.find(f => f.field_id === field.field_id && f.datastore_id === field.datastore_id && !f.submenu);
            if (item) {
              item['sort'] = field.sort;
              item['alias_name'] = field.alias_name;
              item['is_dynamic'] = false;
              item['datastore_id'] = field.datastore_id;
              item['order'] = field.order;
              item['unique'] = false;
              item['option_id'] = field.option_id;
              item.disabled = true;
              this.selectedFields.push(item);
            }
          }
        });
      }
    }

    this.selectedFields = _.sortBy(this.selectedFields, 'order');
  }

  async systemType() {
    // 获取当前user情报
    const user = this.tokenService.getUser();
    await this.app.getAppByID(user.current_app, user.customer_id).then(data => {
      if (data) {
        if (data.app_type === 'rent') {
          this.isLeaseSystem = true;
        }
      }
    });
  }

  /**
   * 日期处理
   */
  openChange(open, f) {
    if (open === 'system') {
      const sfs = this.controlArray.find(c => c.field_id === f);
      if (sfs) {
        sfs.search_value = '';
      }
      return;
    }

    const fs = this.controlArray.find(c => c.field_id === f);
    if (fs) {
      fs.search_value = null;
    }
    return;
  }

  /**
   * @description: 提交表单数据
   */
  async submitForm() {
    let controls = JSON.parse(JSON.stringify(this.controlArray));
    controls = controls.filter(f => f.field_id);
    controls.forEach(f => {
      if (f.operator === 'in') {
        f.search_value = f.search_value.join(',');
      }
      if (f.field_type === 'switch') {
        f.search_value = f.search_value ? 'true' : 'false';
      }

      if (f.field_type === 'date' || f.field_type === 'datetime') {
        if (f.search_value !== 'handleMonth' && f.search_value !== 'now') {
          f.search_value = format(new Date(f.search_value), 'yyyy-MM-dd');
        } else {
          f.search_value = f.search_value.toString();
        }
      }

      if (f.search_value) {
        f.search_value = f.search_value.toString();
      } else {
        f.search_value = '';
      }
    });

    // 获取固定字段信息
    const useGroup = this.getForm('useGroup').value;
    const datastoreID = this.getForm('datastoreID').value;

    // 集计的场合
    if (useGroup) {
      const group_keys = [];
      const aggre_keys = [];
      this.selectedFields.forEach(f => {
        if ((f.field_type === 'number' || f.return_type === 'number') && f.aggre_type) {
          if (f.datastore_id === datastoreID) {
            aggre_keys.push({
              is_lookup: false,
              field_id: f.field_id,
              aggre_type: f.aggre_type,
              data_type: f.return_type || f.field_type,
              datastore_id: f.datastore_id,
              alias_name: f.alias_name,
              sort: f.sort,
              order: f.order,
              option_id: f.option_id
            });
          } else {
            aggre_keys.push({
              is_lookup: true,
              field_id: f.field_id,
              aggre_type: f.aggre_type,
              data_type: f.return_type || f.field_type,
              datastore_id: f.datastore_id,
              alias_name: f.alias_name,
              sort: f.sort,
              order: f.order,
              option_id: f.option_id
            });
          }
        } else {
          if (f.datastore_id === datastoreID) {
            group_keys.push({
              is_lookup: false,
              field_id: f.field_id,
              datastore_id: f.datastore_id,
              data_type: f.return_type || f.field_type,
              alias_name: f.alias_name,
              sort: f.sort,
              is_dynamic: f.is_dynamic,
              unique: f.unique,
              order: f.order,
              option_id: f.option_id
            });
          } else {
            group_keys.push({
              is_lookup: true,
              field_id: f.field_id,
              datastore_id: f.datastore_id,
              data_type: f.return_type || f.field_type,
              alias_name: f.alias_name,
              sort: f.sort,
              is_dynamic: f.is_dynamic,
              unique: f.unique,
              order: f.order,
              option_id: f.option_id
            });
          }
        }
      });

      if (aggre_keys.length > 0 && group_keys.length === 0) {
        this.message.error(this.i18n.translateLang('common.message.error.E_020'));
        return;
      }

      // 新规的场合
      if (this.status === 'add') {
        const params = {
          datastore_id: this.getForm('datastoreID').value,
          report_name: this.getForm('reportName').value,
          display_order: 1,
          is_use_group: this.getForm('useGroup').value,
          report_conditions: controls,
          condition_type: this.getForm('conditionType').value,
          select_key_infos: [],
          group_info: {
            group_keys: group_keys,
            aggre_keys: aggre_keys,
            show_count: this.getForm('showCount').value
          }
        };
        this.report.addReport(params).then(async data => {
          this.message.success(this.i18n.translateLang('common.message.success.S_001'));
          this.event.cast('report:refresh');
          this.location.back();
        });
      } else {
        // 改修的场合
        const params = {
          datastore_id: this.getForm('datastoreID').value,
          report_name: this.getForm('reportName').value,
          display_order: '1',
          is_use_group: this.getForm('useGroup').value.toString(),
          report_conditions: controls,
          condition_type: this.getForm('conditionType').value,
          select_key_infos: [],
          group_info: {
            group_keys: group_keys,
            aggre_keys: aggre_keys,
            show_count: this.getForm('showCount').value
          }
        };
        const reportId = this.route.snapshot.paramMap.get('id');
        await this.dashboard.getDashboards(reportId).then((data: any[]) => {
          if (data) {
            const dashboardNames = [];
            const dashboardIdList = [];
            data.forEach(d => {
              dashboardIdList.push(d.dashboard_id);
              dashboardNames.push(this.i18n.translateLang(d.dashboard_name));
            });

            this.confirmModal = this.modal.confirm({
              nzTitle: `${this.i18n.translateLang('common.message.confirm.selReportUpTitle')}`,
              nzContent: `${this.i18n.translateLang('common.message.confirm.selReportUpContent', { dashboards: dashboardNames })}`,
              nzOnOk: () =>
                this.report.updateReport(reportId, params).then(async () => {
                  this.message.success(this.i18n.translateLang('common.message.success.S_002'));
                  this.dashboard.hardDeleteDashboards(dashboardIdList).then(async res => {
                    this.message.success(this.i18n.translateLang('common.message.success.S_003'));
                  });
                  this.event.cast('report:refresh');
                  this.event.cast('dashboard:refresh');
                  this.location.back();
                })
            });
          } else {
            this.report.updateReport(reportId, params).then(async () => {
              this.message.success(this.i18n.translateLang('common.message.success.S_002'));
              this.event.cast('report:refresh');
              this.event.cast('dashboard:refresh');
              this.location.back();
            });
          }
        });
      }
    } else {
      // 不集计的场合
      const select_key_infos = [];
      this.selectedFields.forEach(f => {
        if (f.datastore_id === datastoreID) {
          select_key_infos.push({
            is_lookup: false,
            field_id: f.field_id,
            datastore_id: f.datastore_id,
            data_type: f.return_type || f.field_type,
            alias_name: f.alias_name,
            sort: f.sort,
            is_dynamic: f.is_dynamic,
            unique: f.unique,
            order: f.order,
            option_id: f.option_id
          });
        } else {
          select_key_infos.push({
            is_lookup: true,
            field_id: f.field_id,
            datastore_id: f.datastore_id,
            data_type: f.return_type || f.field_type,
            alias_name: f.alias_name,
            sort: f.sort,
            is_dynamic: f.is_dynamic,
            unique: f.unique,
            order: f.order,
            option_id: f.option_id
          });
        }
      });
      // 新规的场合
      if (this.status === 'add') {
        const params = {
          datastore_id: this.getForm('datastoreID').value,
          report_name: this.getForm('reportName').value,
          display_order: 1,
          is_use_group: this.getForm('useGroup').value ? true : false,
          report_conditions: controls,
          condition_type: this.getForm('conditionType').value,
          group_info: {
            group_keys: [],
            aggre_keys: [],
            show_count: false
          },
          select_key_infos: select_key_infos
        };
        this.report.addReport(params).then(async data => {
          await this.i18n.updateDynamicLangData();
          this.message.success(this.i18n.translateLang('common.message.success.S_001'));
          this.event.cast('report:refresh');
          this.location.back();
        });
      } else {
        // 改修的场合
        const params = {
          datastore_id: this.getForm('datastoreID').value,
          report_name: this.getForm('reportName').value,
          display_order: '1',
          is_use_group: this.getForm('useGroup').value ? 'true' : 'false',
          report_conditions: controls,
          condition_type: this.getForm('conditionType').value,
          group_info: {
            group_keys: [],
            aggre_keys: [],
            show_count: false
          },
          select_key_infos: select_key_infos
        };
        const reportId = this.route.snapshot.paramMap.get('id');
        await this.dashboard.getDashboards(reportId).then((data: any[]) => {
          if (data) {
            const dashboardNames = [];
            const dashboardIdList = [];
            data.forEach(d => {
              dashboardIdList.push(d.dashboard_id);
              dashboardNames.push(this.i18n.translateLang(d.dashboard_name));
            });

            this.confirmModal = this.modal.confirm({
              nzTitle: `${this.i18n.translateLang('common.message.confirm.selReportUpTitle')}`,
              nzContent: `${this.i18n.translateLang('common.message.confirm.selReportUpContent', { dashboards: dashboardNames })}`,
              nzOnOk: () =>
                this.report.updateReport(reportId, params).then(async () => {
                  this.message.success(this.i18n.translateLang('common.message.success.S_002'));
                  this.dashboard.hardDeleteDashboards(dashboardIdList).then(async res => {
                    this.message.success(this.i18n.translateLang('common.message.success.S_003'));
                  });
                  this.event.cast('report:refresh');
                  this.event.cast('report:refresh');
                  this.location.back();
                })
            });
          } else {
            this.report.updateReport(reportId, params).then(async () => {
              this.message.success(this.i18n.translateLang('common.message.success.S_002'));
              this.event.cast('report:refresh');
              this.event.cast('dashboard:refresh');
              this.location.back();
            });
          }
        });
      }
    }
  }

  /**
   * @description: 获取表单字段
   * @param string 表单字段名
   * @return: 表单字段
   */
  getForm(formName: string) {
    return this.validateForm.controls[formName];
  }

  /**
   * @description: 获取台账数据
   */
  async getDatastores() {
    await this.db.getDatastores().then((data: any[]) => {
      if (data) {
        this.datastores = data;
      } else {
        this.datastores = [];
      }
    });
  }

  /**
   * 台账发生改变事件
   * @param datastoreID 台账ID
   */
  async datastoreChange(datastoreID: string) {
    if (datastoreID && this.selectDatastoreID !== datastoreID) {
      // 出力字段清空
      this.searchFields = [];
      this.outputFields = [];
      this.selectedFields = [];
      // 检索条件初始化
      this.controlArray = [];
      this.controlArray.push({
        id: 1,
        field_id: '',
        field_type: '',
        operator: '',
        search_value: null,
        condition_type: '',
        is_dynamic: true
      });
      this.selectDatastoreID = datastoreID;
      await this.field.getFields(datastoreID).then((data: any[]) => {
        if (data) {
          // 检索条件字段取得
          this.searchFields = this.deepClone(data.filter(f => f.field_type !== 'function'));
          this.searchFields.forEach(f => (f.is_dynamic = true));
          const fixedFields = JSON.parse(JSON.stringify(this.fixedFields));
          this.searchFields.push(...fixedFields);

          // 设置 output 字段
          this.setReportField(data, datastoreID);

          this.controlArray.forEach(c => {
            this.fieldChange(c.field_id, c, true);
          });
        }
      });
    }
  }

  /**
   * @description: 设置报表字段
   * @param any 字段信息
   * @param string 台账ID
   */
  async setReportField(data: any[], datastoreID: string) {
    // 追加深度克隆，防止影响画面内容
    const fields = this.deepClone(data);

    const ds = this.datastores.find(d => d.datastore_id === datastoreID);
    const lookupFields = [];
    if (ds && ds.relations) {
      for (let index = 0; index < ds.relations.length; index++) {
        const rat = ds.relations[index];
        const d = this.datastores.find(d => d.datastore_id === rat.datastore_id);

        const ofield = {
          field_id: rat.relation_id,
          field_name: d.datastore_name,
          submenu: true,
          children: [],
          created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        };

        await this.field.getFields(rat.datastore_id).then(data => {
          if (data) {
            const children = data.filter(f => f.field_type !== 'file' && f.field_type !== 'function' && !f.as_title);
            children.forEach(f => {
              f.field_id = `${rat.relation_id}#${f.field_id}`;
              f.alias_name = this.i18n.translateLang(f.field_name);
              if (f.field_type === 'number' || f.return_type === 'number') {
                f.aggre_type = 'sum';
              }
              f.is_lookup = true;
              f.is_dynamic = true;
            });

            ofield.children = children;
          }
        });

        lookupFields.push(ofield);
      }
    }

    this.outputFields = fields.filter(f => f.field_type !== 'file' && !f.as_title);

    // const lookupFields = this.deepClone(this.outputFields.filter(f => f.field_type === 'lookup'));

    // const jobs = lookupFields.map(f => this.field.getFields(f.lookup_datastore_id));

    // await forkJoin(jobs)
    //   .toPromise()
    //   .then((fdata: any[]) => {
    //     if (fdata) {
    //       fdata.forEach((fs: any[], index: number) => {
    //         const ofield = lookupFields[index];

    //         const children = fs.filter(f => f.field_type !== 'file' && f.field_type !== 'function' && !f.as_title);
    //         children.forEach(f => {
    //           f.field_id = `${ofield.field_id}#${f.field_id}`;
    //           f.alias_name = this.i18n.translateLang(f.field_name);
    //           if (f.field_type === 'number' || f.return_type === 'number') {
    //             f.aggre_type = 'sum';
    //           }
    //           f.is_lookup = true;
    //           f.is_dynamic = true;
    //         });
    //         // 暂时取消掉关联台账的非动态字段的显示
    //         // const ofixed: any[] = this.deepClone(this.fixedFields);
    //         // ofixed.forEach(of => {
    //         //   of.datastore_id = ofield.lookup_datastore_id;
    //         //   of.is_lookup = true;
    //         // });
    //         // fs.push(...ofixed);
    //         ofield.submenu = true;
    //         ofield.children = children;
    //       });
    //     }
    //   });

    this.outputFields.forEach(f => {
      f.alias_name = this.i18n.translateLang(f.field_name);
      if (f.field_type === 'number' || f.return_type === 'number') {
        f.aggre_type = 'sum';
      }
      f.is_dynamic = true;
    });

    this.outputFields = [...lookupFields, ...this.outputFields];

    const fixed: any[] = this.deepClone(this.fixedFields);
    fixed.forEach(f => {
      f.datastore_id = datastoreID;
    });
    this.outputFields.push(...fixed);
  }

  deepClone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * @description: 获取台账名称
   * @param string 台账ID
   * @return: 台账名称
   */
  getDatastoreName(datastoreID: string): string {
    if (datastoreID) {
      const datastore = this.datastores.find(d => d.datastore_id === datastoreID);
      if (datastore) {
        return datastore.datastore_name;
      }
      return '';
    }
    return '';
  }

  /**
   * @description: 添加更新删除已选字段
   * @param boolean 删除或者是添加更新
   * @param string 字段ID
   */
  delete(fieldID: string, datastoreID: string) {
    const fs = this.outputFields.find(f => f.field_id === fieldID && f.datastore_id === datastoreID && !f.submenu);
    if (fs) {
      this.selectedFields = this.selectedFields.filter(f => !(f.field_id === fieldID && f.datastore_id === datastoreID));
      fs.disabled = false;
    }

    this.outputFields.forEach(f => {
      if (f.children) {
        const children = f.children;

        const ofs = children.find(of => of.field_id === fieldID && of.datastore_id === datastoreID);
        if (ofs) {
          this.selectedFields = this.selectedFields.filter(sf => !(sf.field_id === fieldID && sf.datastore_id === datastoreID));
          ofs.disabled = false;
        }
      }
    });

    this.selectedFields.forEach((n, i) => {
      const node = i + 1;
      n.order = node;
    });
  }

  /**
   * @description: 添加更新删除已选字段
   * @param boolean 删除或者是添加更新
   * @param string 字段ID
   */
  save(fieldID: string, datastoreID: string) {
    this.showFieldSetting = false;
    // 如果已经存在，直接返回
    if (this.selectedFields.find(f => f.field_id === fieldID && f.datastore_id === datastoreID)) {
      return;
    }

    // 先查看当前台账的字段
    const fs = this.outputFields.find(f => f.field_id === fieldID && f.datastore_id === datastoreID && !f.submenu);
    if (fs) {
      fs.order = this.getOrder();
      this.selectedFields = [...this.selectedFields, fs];
      fs.disabled = true;
      this.resetField();
      return;
    }

    // 再查看当前台账的关联字段
    this.outputFields.forEach(f => {
      if (f.children) {
        const children = f.children;

        const ofs = children.find(of => of.field_id === fieldID && of.datastore_id === datastoreID);
        if (ofs) {
          ofs.order = this.getOrder();
          this.selectedFields = [...this.selectedFields, ofs];
          ofs.disabled = true;
          this.resetField();
          return;
        }
      }
    });
  }

  /**
   * 获取排序
   * @returns 返回排序
   */
  getOrder() {
    if (this.selectedFields.length === 0) {
      return 1;
    }

    let order = this.selectedFields[0].order;
    for (let i = 0; i < this.selectedFields.length - 1; i++) {
      order = order < this.selectedFields[i + 1].order ? this.selectedFields[i + 1].order : order;
    }
    return order + 1;
  }

  /**
   * 重置弹窗框的内容
   */
  resetField() {
    // 重新初始化选择字段
    this.selectField = {
      field_id: '',
      datastore_id: '',
      field_name: 'page.report.fieldSelect',
      alias_name: '',
      field_type: 'text',
      is_dynamic: true,
      unique: false,
      option_id: ''
    };
  }

  /**
   * @description: 添加检索字段
   */
  addField(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }
    const id = this.controlArray.length > 0 ? this.controlArray[this.controlArray.length - 1].id + 1 : 0;

    const control = {
      id,
      field_id: '',
      field_type: '',
      operator: '',
      search_value: null,
      condition_type: '',
      is_dynamic: true
    };
    this.controlArray.push(control);
  }

  /**
   * @description: 删除检索字段
   */
  removeField(
    i: {
      id: number;
      field_id: string;
      field_type: string;
      lookup_datastore_id?: string;
      lookup_field_id?: string;
      operator: string;
      search_value: string | number | boolean;
      condition_type: string;
      is_dynamic: boolean;
    },
    e: MouseEvent
  ): void {
    e.preventDefault();
    if (this.controlArray.length > 1) {
      const index = this.controlArray.indexOf(i);
      this.controlArray.splice(index, 1);
    } else {
      const index = this.controlArray.indexOf(i);
      this.controlArray.splice(index, 1);
      this.addField();
    }

    this.searchFields.forEach(f => {
      if (this.controlArray.filter(c => c.field_id === f.field_id).length > 0) {
        f.disabled = true;
      } else {
        f.disabled = false;
      }
    });
  }

  /**
   * @description: 检索字段变更事件
   */
  fieldChange(event: string, control: any, init: boolean) {
    if (event) {
      const selectField = this.searchFields.find(f => f.field_id === event);

      if (!init) {
        if (selectField.field_type === 'function') {
          control.field_type = selectField.return_type;
        } else {
          control.field_type = selectField.field_type;
        }
        control.is_dynamic = selectField.is_dynamic;
        control.operator = '=';

        if (control.field_type === 'time') {
          control.search_value = null;
        } else if (control.field_type === 'lookup') {
          control.lookup_datastore_id = selectField.lookup_datastore_id;
          control.lookup_field_id = selectField.lookup_field_id;
          control.search_value = '';
        } else {
          control.search_value = '';
        }
      }

      if (selectField.field_type === 'options') {
        this.option.getOptionsByCode(selectField.option_id).then(res => {
          this.optionArray[control.field_id] = res;
        });
      }

      if (selectField.field_type === 'user') {
        if (selectField.is_dynamic) {
          this.user.getRelatedUsers(selectField.user_group_id, 'true').then(res => {
            this.userArray[control.field_id] = res;
          });
        } else {
          this.user.getUsers().then(res => {
            this.userArray[control.field_id] = res;
          });
        }
      }

      if (selectField.field_type === 'autonum') {
        control.prefix = selectField.prefix;
        control.display_digits = selectField.display_digits;
      }
      if (selectField.field_type === 'date' || selectField.field_type === 'datetime') {
        control.status = control.status ? control.status : 'none';
      }
    }
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.colsWithGroup = this.colsWithGroup.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }

  /**
   * @description: 取消当前操作，返回上一级
   */
  cancel() {
    this.location.back();
  }

  async openLookupModal(index: number, datastoreId: string, fieldId: string) {
    this.lookIndex = index;
    this.lookupDatastoreId = datastoreId;
    this.lookField = fieldId;
    this.isLookupVisible = true;
  }

  hidde() {
    this.isLookupVisible = false;
  }

  reflect(item: any) {
    const ctl = this.controlArray[item.index];
    this.controlArray[item.index].search_value = item.value.items[ctl.lookup_field_id].value;
    this.isLookupVisible = false;
  }
}
