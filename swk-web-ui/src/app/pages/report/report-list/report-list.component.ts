/*
 * @Description: list
 * @Author: RXC 廖云江
 * @Date: 2019-09-02 09:06:57
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2021-01-08 10:17:50
 */
import { format, getTime, parse } from 'date-fns';
import * as _ from 'lodash';
import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { forkJoin } from 'rxjs';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService, FieldService, OptionService, ReportService, UserService, DatastoreService } from '@api';
import { I18NService, SelectItem, TokenStorageService } from '@core';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.less']
})
export class ReportListComponent implements OnInit, OnDestroy {
  // 检索表单
  validateForm: FormGroup;
  // 检索条件类型（true-and/false-or）
  conditionType = true;
  // 检索条件数据
  conditions: any = [];
  // 搜索可用字段
  searchFields: any[] = [];
  // 检索使用-选项数组
  optionArray: Map<string, any[]> = new Map();
  // 检索使用-用户数组
  userArray: Map<string, any[]> = new Map();
  // 检索使用-选中检索字段数组
  controlArray: Array<{
    id: number;
    field_id: any;
    field_type: any;
    lookup_datastore_id?: any;
    lookup_field_id?: any;
    prefix?: string;
    display_digits?: string;
    operator: any;
    is_dynamic: boolean;
    search_value: string | number | boolean;
    condition_type: any;
  }> = [];

  // 关联数据用
  isLookupVisible = false;
  lookupDatastoreId = '';
  lookField = '';
  lookIndex = 0;
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

  // 报表数据
  dataSet: any[] = [];
  // 报表
  reportData: any[] = [];
  // 表格头
  header: any[] = [];
  // 字段
  fields: any = {};
  lookupFields = {};
  // 加载flag
  update = false;
  // 报表名
  reportName: string;

  lastUpdateTime = '';
  // 唯一性字段
  uniqueFields = [];

  scroll = { x: '1000px', y: '300px' };

  // 当前页
  pageIndex = 1;
  // 当前页件数
  pageSize = 30;
  // 总数
  total = 0;
  // 画面展示总数
  showTotal = 10000;

  reportFields = [];

  // 共通数据
  userList = [];
  optionMap: Map<string, Array<SelectItem>> = new Map();
  isVisible = false
  encoding = 'sjis';

  //局部刷新
  loading = false
  //首次进入
  searchFirst = true

  // 固定字段
  fixedFields = [
    {
      field_id: 'created_at',
      datastore_id: '',
      field_name: 'common.text.createAt',
      alias_name: 'created_at',
      field_type: 'datetime',
      is_dynamic: false,
      unique: false
    },
    {
      field_id: 'created_by',
      datastore_id: '',
      field_name: 'common.text.createdBy',
      alias_name: 'created_by',
      field_type: 'user',
      is_dynamic: false,
      unique: false
    },
    {
      field_id: 'updated_at',
      datastore_id: '',
      field_name: 'common.text.updateAt',
      alias_name: 'updated_at',
      field_type: 'datetime',
      is_dynamic: false,
      unique: false
    },
    {
      field_id: 'updated_by',
      datastore_id: '',
      field_name: 'common.text.updatedBy',
      alias_name: 'updated_by',
      field_type: 'user',
      is_dynamic: false,
      unique: false
    },
    {
      field_id: 'checked_at',
      datastore_id: '',
      field_name: 'common.text.checkedAt',
      alias_name: 'checked_at',
      field_type: 'datetime',
      is_dynamic: false,
      unique: false
    },
    {
      field_id: 'checked_by',
      datastore_id: '',
      field_name: 'common.text.checkedBy',
      alias_name: 'checked_by',
      field_type: 'user',
      is_dynamic: false,
      unique: false
    },
    {
      field_id: 'check_type',
      datastore_id: '',
      field_name: 'common.text.checkType',
      alias_name: 'check_type',
      field_type: 'type',
      is_dynamic: false,
      unique: false
    },
    {
      field_id: 'check_status',
      datastore_id: '',
      field_name: 'common.text.checkStatus',
      alias_name: 'check_status',
      field_type: 'check',
      is_dynamic: false,
      unique: false
    },
    {
      field_id: 'label_time',
      datastore_id: '',
      field_name: 'common.text.labelTime',
      alias_name: 'label_time',
      field_type: 'datetime',
      is_dynamic: false,
      unique: false
    }
  ];

  constructor(
    private fb: FormBuilder,
    private report: ReportService,
    private route: ActivatedRoute,
    private router: Router,
    private i18n: I18NService,
    private translate: TranslateService,
    private option: OptionService,
    private user: UserService,
    private tokenService: TokenStorageService,
    private field: FieldService,
    private eventBus: NgEventBus,
    private message: NzMessageService,
    private db: DatabaseService,
    private ds: DatastoreService
  ) {
    this.validateForm = this.fb.group({
      inputValue: [null, []]
    });
  }

  /**
   * @description: 画面初始化
   */
  ngOnInit(): void {
    this.loading = true
    const reportId = this.route.snapshot.paramMap.get('r_id');

    this.addField();
    //this.getSearchFields(reportId);

    this.translate.onLangChange.subscribe(() => {
      this.buildData();
    });
    this.route.data.subscribe(async (data: { listData: any }) => {
      this.pageIndex = 1;
      this.pageSize = 30;
      await this.report
        .getReportData(reportId, {
          condition_list: this.conditions,
          condition_type: this.conditionType ? 'and' : 'or',
          page_index: this.pageIndex,
          page_size: this.pageSize
        })
        .then(rpData => {
          if (rpData) {
            this.reportData = rpData.item_data;
            this.fields = rpData.fields;
            this.total = rpData.total;
            if (rpData.total < this.showTotal) {
              this.showTotal = rpData.total;
            }
            this.reportName = rpData.report_name;
          } else {
            this.reportData = [];
            this.fields = [];
            this.total = 0;
            this.reportName = 'common.text.unnamed';
          }
        });
      const optFields = [];
      for (const key in this.fields) {
        if (Object.prototype.hasOwnProperty.call(this.fields, key)) {
          const element = this.fields[key];
          if (element.data_type === 'options') {
            optFields.push(Object.assign(element, { field_id: key }));
          }
        }
      }

      if (optFields && optFields.length > 0) {
        const ojobs = optFields.map(f => this.option.getOptionsByCode(f.option_id, 'true'));
        await forkJoin(ojobs)
          .toPromise()
          .then((opts: any[]) => {
            if (opts) {
              optFields.forEach((f, index) => {
                const optionList: Array<SelectItem> = [];
                const optionsData = opts[index];
                optionsData.forEach((option: { option_label: any; option_value: any }) => {
                  optionList.push({ label: option.option_label, value: option.option_value });
                });

                this.optionMap.set(f.field_id, optionList);
              });
            }
          });
      }

      const datastores: Set<string> = new Set();
      // tslint:disable-next-line: forin
      for (const key in this.fields) {
        const field = this.fields[key];
        if (field.data_type === 'lookup') {
          datastores.add(field.datastore_id);
        }
      }

      const datastoreList = Array.from(datastores);

      await forkJoin(
        datastoreList.map(datastoreId => {
          return this.field.getFields(datastoreId);
        })
      )
        .toPromise()
        .then((fsData: any[]) => {
          if (fsData) {
            fsData.forEach(fs => {
              if (fs && fs.length > 0) {
                this.lookupFields[fs[0].datastore_id] = fs.filter((f: { field_type: string }) => f.field_type === 'lookup');
              }
            });
          }
        });

      this.userList = data.listData.users;
      this.buildData();
      this.loading = false
    });
  }

  /**
   * @description: 画面销毁处理
   */
  ngOnDestroy() { }

  /**
   * @description: 检索数据
   */
  async search(sizeChange: boolean) {
    this.editReportConditions(true);
    const reportId = this.route.snapshot.paramMap.get('r_id');

    if (sizeChange) {
      this.pageIndex = 1;
    }

    await this.report
      .getReportData(reportId, {
        condition_list: this.conditions,
        condition_type: this.conditionType ? 'and' : 'or',
        page_index: this.pageIndex,
        page_size: this.pageSize
      })
      .then((rpData: any) => {
        if (rpData) {
          this.reportData = rpData.item_data;
          this.fields = rpData.fields;
          this.total = rpData.total;
          if (rpData.total < this.showTotal) {
            this.showTotal = rpData.total;
          }
          this.reportName = rpData.report_name;
        } else {
          this.reportData = [];
          this.fields = [];
          this.total = 0;
          this.reportName = 'common.text.unnamed';
        }
      });

    const datastores: Set<string> = new Set();
    // tslint:disable-next-line: forin
    for (const key in this.fields) {
      const field = this.fields[key];
      if (field.data_type === 'lookup') {
        datastores.add(field.datastore_id);
      }
    }

    const datastoreList = Array.from(datastores);
    this.lookupFields = [];
    await forkJoin(
      datastoreList.map(datastoreId => {
        return this.field.getFields(datastoreId);
      })
    )
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          data.forEach(fs => {
            if (fs && fs.length > 0) {
              this.lookupFields[fs[0].datastore_id] = fs.filter((f: { field_type: string }) => f.field_type === 'lookup');
            }
          });
        }
      });

    await this.buildData();
  }

  /**
   * @description: 编辑报表数据
   */
  async buildData() {
    this.header = [];
    this.dataSet = [];
    this.reportFields = [];
    let hasCount = false;

    const autoFields = [];
    for (const key in this.fields) {
      if (this.fields.hasOwnProperty(key)) {
        const field = this.fields[key];
        if (field.data_type === 'autonum') {
          autoFields.push(field);
        }
      }
    }

    const auto = [];

    await Promise.all(
      autoFields.map(f => {
        return this.field.getFields(f.datastore_id);
      })
    ).then((data: any[]) => {
      if (data) {
        data.forEach(fs => {
          if (fs && fs.length > 0) {
            auto.push(...fs.filter((f: { field_type: string }) => f.field_type === 'autonum'));
          }
        });
      }
    });

    // 从本地存储中获取当前报表标题设置
    const reportId = this.route.snapshot.paramMap.get('r_id');
    const localheader: any[] = JSON.parse(localStorage.getItem(reportId));

    // 编辑报表header部数据
    // tslint:disable-next-line:forin
    for (const key in this.fields) {
      const field = this.fields[key];
      const f = this.fields[key];
      f.field_id = key;

      if (f.data_type === 'autonum') {
        const af = auto.find(a => a.field_id === key);
        if (af) {
          f.prefix = af.prefix ? af.prefix : '';
          f.display_digits = af.display_digits;
        }
      }

      this.reportFields.push(f);
      if (field.alias_name === 'count') {
        hasCount = true;
      } else {
        if (field.is_dynamic) {
          const name = field.alias_name;
          let width = '100px';
          // 若本地存储中有该项目宽度设置则使用本地储存中该项目宽度设置
          if (localheader) {
            const oldConfig = localheader.find(l => l.name === name);
            if (oldConfig) {
              width = oldConfig.width;
            }
          }
          this.header.push({
            name: name,
            width: width,
            order: field.order
          });
        } else {
          const item = this.fixedFields.find(fl => fl.alias_name === field.alias_name);
          const name = this.i18n.translateLang(item.field_name);
          let width = '100px';
          // 若本地存储中有该项目宽度设置则使用本地储存中该项目宽度设置
          if (localheader) {
            const oldConfig = localheader.find(l => l.name === name);
            if (oldConfig) {
              width = oldConfig.width;
            }
          }
          this.header.push({
            name: name,
            width: width,
            order: field.order
          });
        }
      }
    }
    if (hasCount) {
      const name = this.i18n.translateLang('page.report.number');
      let width = '100px';
      // 若本地存储中有该项目宽度设置则使用本地储存中该项目宽度设置
      if (localheader) {
        const oldConfig = localheader.find(l => l.name === name);
        if (oldConfig) {
          width = oldConfig.width;
        }
      }
      this.header.push({
        name: name,
        width: width,
        order: 1000
      });
    }

    this.header = _.sortBy(this.header, 'order');
    this.reportFields = _.sortBy(this.reportFields, 'order');

    this.scroll.x = this.fields.length * 100 + 'px';

    // 编辑报表header部以外数据
    this.dataSet = this.buildItemsData();
  }

  /**
   * @description: 编辑报表数据(header部以外)
   */
  buildItemsData(): any[] {
    const data: any[] = [];
    if (this.reportData) {
      this.reportData.forEach((dt, index) => {
        if (index === 0) {
          this.lastUpdateTime = dt.update_time;
        }

        const row = [];
        // tslint:disable-next-line:forin
        this.reportFields.forEach(field => {
          if (field.is_dynamic) {
            if (dt.items[field.field_id]) {
              if (dt.item_id) {
                const value = {
                  item_id: dt.item_id,
                  datastore_id: field.datastore_id,
                  field_id: field.field_id,
                  is_dynamic: true,
                  unique: field.unique,
                  save_value: dt.items[field.field_id].value,
                  data_type: field.data_type,
                  value: dt.items[field.field_id].value
                };
                row.push(value);
              } else {
                const value = {
                  item_id: '',
                  datastore_id: field.datastore_id,
                  field_id: field.field_id,
                  is_dynamic: true,
                  unique: field.unique,
                  save_value: dt.items[field.field_id].value,
                  data_type: field.data_type,
                  value: dt.items[field.field_id].value
                };
                row.push(value);
              }
            } else {
              row.push(``);
            }
          } else {
            switch (field.field_id) {
              case 'created_at':
              case 'updated_at':
              case 'checked_at':
              case 'label_time':
                const value: string = dt[field.field_id];
                if (!value || value.startsWith('0001-01-01')) {
                  row.push({
                    item_id: '',
                    datastore_id: field.datastore_id,
                    field_id: field.field_id,
                    is_dynamic: false,
                    unique: field.unique,
                    save_value: value,
                    data_type: 'datetime',
                    value: ''
                  });
                } else {
                  row.push({
                    item_id: '',
                    datastore_id: field.datastore_id,
                    field_id: field.field_id,
                    is_dynamic: false,
                    unique: field.unique,
                    save_value: value,
                    data_type: 'datetime',
                    value: this.formatDate(value, 'yyyy-MM-dd HH:mm:ss')
                  });
                }
                break;
              case 'created_by':
              case 'updated_by':
              case 'checked_by':
                row.push({
                  item_id: '',
                  datastore_id: field.datastore_id,
                  field_id: field.field_id,
                  is_dynamic: false,
                  unique: field.unique,
                  save_value: dt[field.field_id],
                  data_type: 'system_user',
                  value: dt[field.field_id]
                });
                break;
              case 'check_type':
                // 目视
                if (dt[field.field_id] === 'Visual') {
                  row.push({
                    item_id: '',
                    datastore_id: field.datastore_id,
                    field_id: field.field_id,
                    is_dynamic: false,
                    unique: field.unique,
                    save_value: dt[field.field_id],
                    data_type: 'text',
                    value: this.i18n.translateLang('common.text.visuallycheck')
                  });
                  break;
                }
                // 图片
                if (dt[field.field_id] === 'Image') {
                  row.push({
                    item_id: '',
                    datastore_id: field.datastore_id,
                    field_id: field.field_id,
                    is_dynamic: false,
                    unique: field.unique,
                    save_value: dt[field.field_id],
                    data_type: 'text',
                    value: this.i18n.translateLang('common.text.imagecheck')
                  });
                  break;
                }
                // 条码
                if (dt[field.field_id] === 'Scan') {
                  row.push({
                    item_id: '',
                    datastore_id: field.datastore_id,
                    field_id: field.field_id,
                    is_dynamic: false,
                    unique: field.unique,
                    save_value: dt[field.field_id],
                    data_type: 'text',
                    value: this.i18n.translateLang('common.text.barcodecheck')
                  });
                  break;
                }

                row.push({
                  item_id: '',
                  datastore_id: field.datastore_id,
                  field_id: field.field_id,
                  is_dynamic: false,
                  unique: field.unique,
                  save_value: dt[field.field_id],
                  data_type: 'text',
                  value: ''
                });
                break;
              case 'check_status':
                // 未检查
                if (dt[field.field_id] === '0' || dt[field.field_id] === '') {
                  row.push({
                    item_id: '',
                    datastore_id: field.datastore_id,
                    field_id: field.field_id,
                    is_dynamic: false,
                    unique: field.unique,
                    save_value: dt[field.field_id],
                    data_type: 'text',
                    value: this.i18n.translateLang('common.text.checkWait')
                  });
                  break;
                }
                // 已检查
                if (dt[field.field_id] === '1') {
                  row.push({
                    item_id: '',
                    datastore_id: field.datastore_id,
                    field_id: field.field_id,
                    is_dynamic: false,
                    unique: field.unique,
                    save_value: dt[field.field_id],
                    data_type: 'text',
                    value: this.i18n.translateLang('common.text.checkOver')
                  });
                  break;
                }

                row.push({
                  item_id: '',
                  datastore_id: field.datastore_id,
                  field_id: field.field_id,
                  is_dynamic: false,
                  unique: field.unique,
                  save_value: dt[field.field_id],
                  data_type: 'text',
                  value: ''
                });
                break;

              default:
                break;
            }
          }
        });

        if (this.fields && this.fields.hasOwnProperty('count')) {
          row.push({
            data_type: 'count',
            value: dt.count
          });
        }
        data.push(row);
      });
      return data;
    }
    return data;
  }

  /**
   * @description: 格式化日期
   */
  formatDate(value: any, fs?: string): string {
    const timezone = Number(this.tokenService.getUserTimeZone().substring(15));
    // 目标时区时间 = 本地时区时间 + 本地时区时差 - 目标时区时差
    const date = parse(value.slice(0, 19), 'yyyy-MM-dd HH:mm:ss', new Date());
    const time = getTime(date) - timezone * 60 * 60 * 1000;

    return format(time, fs);
  }

  /**
   * @description: 下载为CSV文件
   */
  downloadCSV(encoding: string) {
    this.isVisible = false;
    const reportId = this.route.snapshot.paramMap.get('r_id');
    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;
    const char_encoding = encoding
    this.report
      .download(reportId, jobId, 'csv', char_encoding, {
        condition_list: this.conditions,
        condition_type: this.conditionType ? 'and' : 'or'
      })
      .then(() => {
        this.message.info(this.i18n.translateLang('common.message.info.I_002'));
      });
  }

  /**
   * @description: 下载为EXCEL文件
   */
  /* downloadEXCEL() {
    const reportId = this.route.snapshot.paramMap.get('r_id');
    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;

    this.report
      .download(reportId, jobId, 'xlsx', {
        condition_list: this.conditions,
        condition_type: this.conditionType ? 'and' : 'or'
      })
      .then(() => {
        this.message.info(this.i18n.translateLang('common.message.info.I_002'));
      });
  } */

  /**
   * @description: 跳转到详细画面(只来源于一条数据)
   */
  async goTo(col: any) {
    const conditionArray: any[] = [];
    const datastoreId = col.datastore_id;
    // 没有分组集计的报表
    const itemId = col.item_id;
    if (itemId && datastoreId) {
      const url = `/datastores/${datastoreId}/items/${itemId}`;
      this.router.navigate([url]);
      return;
    }
    // 其他情况的报表
    let field: string = col.field_id;
    const result = field.split('#');
    if (result.length > 1) {
      field = result[result.length - 1];
    }

    // 编辑单个检索条件
    const condition = {
      field_id: field,
      field_type: col.data_type,
      operator: '=',
      search_value: col.save_value,
      is_dynamic: col.is_dynamic,
      condition_type: ''
    };
    // 检索条件集合
    conditionArray.push(condition);

    // 编辑检索参数
    const searchConditionArray = JSON.parse(JSON.stringify(conditionArray.filter(f => f.field_id)));
    const params = {
      condition_list: searchConditionArray,
      condition_type: 'and',
      page_index: 0,
      page_size: 0
    };
    // 检索数据
    await this.db.getItems(datastoreId, params).then((data: any) => {
      if (data) {
        if (data.total && data.items_list) {
          if (data.total === 1) {
            if (datastoreId) {
              // 台账存在，仅来源于一条数据数据,画面迁移到数据详细
              const item_id = data.items_list[0].item_id;
              const url = `/datastores/${datastoreId}/items/${item_id}`;
              this.router.navigate([url]);
            }
          } else {
            this.message.info(this.i18n.translateLang('common.message.info.I_004'));
            return;
          }
        }
      }
    });
  }

  /**
   * @description: 获取选项名称
   */
  getOption(value: string, optionList: any[]) {
    const option = optionList.find((o: { value: any }) => o.value === value);
    if (option) {
      return this.i18n.translateLang(option.label);
    }
    return '';
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.header = this.header.map(e => (e.name === col ? { ...e, width: `${width}px` } : e));
    // 保存当前标题设置到本地存储
    const reportId = this.route.snapshot.paramMap.get('r_id');
    localStorage.setItem(reportId, JSON.stringify(this.header));
  }

  /**
   * @description: 检索字段变更事件
   */
  fieldChange(
    event: any,
    control: {
      is_dynamic: any;
      field_type: string;
      operator: string;
      search_value: any;
      lookup_datastore_id: any;
      lookup_field_id: any;
      field_id: string | number;
      prefix: any;
      display_digits: any;
    }
  ) {
    if (event) {
      const selectField = this.searchFields.find(f => f.field_id === event);
      if (selectField) {
        control.is_dynamic = selectField.is_dynamic;
        if (selectField.field_type === 'function') {
          control.field_type = selectField.return_type;
        } else {
          control.field_type = selectField.field_type;
        }

        control.operator = '=';
        control.search_value = null;

        if (selectField.field_type === 'lookup') {
          control.lookup_datastore_id = selectField.lookup_datastore_id;
          control.lookup_field_id = selectField.lookup_field_id;
        }

        if (selectField.field_type === 'options') {
          this.option.getOptionsByCode(selectField.option_id, 'true').then(res => {
            this.optionArray[control.field_id] = res;
          });
        }

        if (selectField.field_type === 'user') {
          this.user.getUsers({ group: selectField.user_group_id, invalid: 'true' }).then(res => {
            this.userArray[control.field_id] = res;
          });
        }
        if (selectField.field_type === 'autonum') {
          control.prefix = selectField.prefix;
          control.display_digits = selectField.display_digits;
        }
      }
    } else {
      control.operator = null;
      control.field_type = '';
      control.search_value = null;
    }
    // this.searchFields.forEach(f => {
    //   if (this.controlArray.filter(c => c.field_id === f.field_id).length > 0) {
    //     f.disabled = true;
    //   } else {
    //     f.disabled = false;
    //   }
    // });
  }

  /**
   * @description: 添加检索字段
   */
  addField(): void {
    const id = this.controlArray.length > 0 ? this.controlArray[this.controlArray.length - 1].id + 1 : 0;
    const control = {
      id,
      field_id: null,
      field_type: '',
      lookup_datastore_id: '',
      lookup_field_id: '',
      prefix: '',
      display_digits: null,
      operator: '',
      search_value: null,
      is_dynamic: true,
      condition_type: ''
    };
    this.controlArray.push(control);
  }

  /**
   * @description: 删除检索字段
   */
  removeField(i: {
    id: number;
    field_id: string;
    field_type: string;
    lookup_datastore_id?: string;
    lookup_field_id?: string;
    prefix?: string;
    operator: string;
    is_dynamic: boolean;
    search_value: string | number | boolean;
    condition_type: string;
  }): void {
    if (this.controlArray.length > 1) {
      this.controlArray = this.controlArray.filter(c => c.id !== i.id);
    }

    // this.searchFields.forEach(f => {
    //   if (this.controlArray.filter(c => c.field_id === f.field_id).length > 0) {
    //     f.disabled = true;
    //   } else {
    //     f.disabled = false;
    //   }
    // });
  }

  /**
   * @description: 重置事件
   */
  reset() {
    this.controlArray = [];
    this.conditions = [];
    // this.searchFields.forEach(f => {
    //   f.disabled = false;
    // });
    this.addField();
  }

  /**
   * @description: 编辑报表查询条件
   */
  async editReportConditions(reset: boolean = false) {
    // 检索条件编辑
    const searchValue = JSON.parse(JSON.stringify(this.controlArray.filter(f => f.field_id !== '')));
    searchValue.forEach(c => {
      switch (c.field_type) {
        case 'date':
        case 'datetime':
          c.search_value = format(new Date(c.search_value), 'yyyy-MM-dd');
          break;
        case 'time':
          c.search_value = format(new Date(c.search_value), 'HH:mm:ss');
          break;
        case 'number':
        case 'autonum':
        case 'switch':
          c.search_value = c.search_value == null ? null : c.search_value.toString();
          break;
        case 'lookup':
          if (c.search_value) {
            c.search_value = c.search_value;
          } else {
            c.search_value = '';
          }
          break;
        case 'user':
        case 'type':
        case 'options':
          if (c.search_value instanceof Array) {
            c.search_value = c.search_value.join(',');
          } else {
            c.search_value = c.search_value;
          }
          break;

        default:
          c.search_value = c.search_value;
          break;
      }
    });
    this.conditions = searchValue;
  }

  /**
   * @description: 获取报表出力字段和关联台账ID
   */
  async getSearchFields(reportId: string): Promise<any> {
    // 获取报表出力字段信息
    await this.report.getReportByID(reportId).then(async (data: any) => {
      // 获取报表出力台账的唯一关系
      /* await this.ds.getDatastoreByID(data.datastore_id).then(data => {
        this.uniqueFields = data.unique_fields;
      }); */

      // 关联台账ID
      const lookdsIds: string[] = [];
      if (data) {
        const rfs: any[] = [];
        if (data.is_use_group) {
          if (data.group_info.group_keys) {
            data.group_info.group_keys.forEach((k: any) => {
              rfs.push(k);
              if (k.is_lookup) {
                lookdsIds.push(k.datastore_id);
              }
            });
          }
          if (data.group_info.aggre_keys) {
            data.group_info.aggre_keys.forEach((k: any) => {
              rfs.push(k);
              if (k.is_lookup) {
                lookdsIds.push(k.datastore_id);
              }
            });
          }
        } else {
          if (data.select_key_infos) {
            data.select_key_infos.forEach((k: any) => {
              rfs.push(k);
              if (k.is_lookup) {
                lookdsIds.push(k.datastore_id);
              }
            });
          }
        }
        this.getKeyFields(data.datastore_id, rfs, lookdsIds);
      }
    });
  }

  /**
   * @description: 获取检索可用字段
   */
  async getKeyFields(datastoreId: string, keys: any[], lookdsIds: string[]): Promise<any> {
    // 获取关联台账字段信息
    /* const lfs: any[] = [];
    await forkJoin(
      lookdsIds.map(dId => {
        return this.field.getFields(dId);
      })
    )
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          data.forEach((fs: any[]) => {
            if (fs && fs.length > 0) {
              fs.forEach((f: any) => {
                if (!f.as_title) {
                  lfs.push(f);
                }
              });
            }
          });
        }
      }); */

    // 获取出力台账字段信息
    let outfs: any[] = [];
    await this.field.getFields(datastoreId).then(async (data: any[]) => {
      if (data) {
        outfs = data.filter(f => !f.as_title);
      }
    });

    // 获取检索可用字段
    keys.forEach((key: any) => {
      // 关联台账字段
      if (key.is_lookup) {
        let fvfStr = '';
        fvfStr = key.field_id;
        const fvf = fvfStr.split('#');
        if (fvf.length === 2) {
          const lf = keys.find((field: any) => field.datastore_id === key.datastore_id);
          if (lf) {
            lf.alias_name = key.alias_name;
            lf.field_id = key.field_id;
            lf.field_type = key.data_type;
            this.searchFields.push(lf);
          }
        }
      } else {
        // 出力台账字段
        if (key.is_dynamic === false) {
          const of = this.fixedFields.find((field: any) => field.field_id === key.field_id);
          if (of) {
            of.alias_name = key.alias_name;
            this.searchFields.push(of);
          }
        } else {
          const of = outfs.find((field: any) => field.datastore_id === key.datastore_id && field.field_id === key.field_id);
          if (of) {
            of.alias_name = key.alias_name;
            this.searchFields.push(of);
          }
        }
      }
    });

    this.searchFields = _.orderBy(this.searchFields, ['display_order'], ['asc']);
    this.searchFields.forEach(key => {
      if (key.is_dynamic === false) {
        key.is_dynamic = false;
      } else {
        key.is_dynamic = true;
      }
    });
    // this.searchFields.forEach(f => (f.is_dynamic = true));
  }

  /**
   * @description: 打开关联台账数据选择弹出框
   */
  async openLookupModal(index: number, datastoreId: string, fieldId: string) {
    this.lookIndex = index;
    this.lookupDatastoreId = datastoreId;
    this.lookField = fieldId;
    this.isLookupVisible = true;
  }

  /**
   * @description: 选择关联台账数据
   */
  reflect(item: any) {
    const ctl = this.controlArray[item.index];
    this.controlArray[item.index].search_value = item.value.items[ctl.lookup_field_id].value;
    this.isLookupVisible = false;
  }

  activeChange() {
    if (this.searchFirst) {
      const reportId = this.route.snapshot.paramMap.get('r_id');
      this.getSearchFields(reportId);
      this.searchFirst = false
    }
  }

  /**
   * @description: 关闭关联台账数据选择弹出框
   */
  cancel() {
    this.isLookupVisible = false;
  }

  /**
   * 刷新数据
   */
  genReportData() {
    const reportId = this.route.snapshot.paramMap.get('r_id');
    this.update = true;
    this.report.genReportData(reportId).then(data => {
      if (data && data.msg) {
        this.message.error(data.msg);
      } else {
        this.message.info(this.i18n.translateLang('common.message.info.I_003'));
        this.search(false).then(() => {
          this.update = false;
        });
      }
    });
  }

  /**
* @description: 打开数据选择画面
*/
  openModal(): void {
    this.isVisible = true;
  }

  /**
   * @description: 关闭数据选择画面
   */
  close() {
    this.isVisible = false;
  }
}
