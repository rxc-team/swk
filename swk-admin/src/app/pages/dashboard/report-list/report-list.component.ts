import { format, getTime, parse } from 'date-fns';
import * as _ from 'lodash';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { map } from 'rxjs/operators';

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '@api';
import { I18NService, TokenStorageService } from '@core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.less']
})
export class ReportListComponent implements OnInit, OnChanges {
  // 报表 ID
  @Input() reportId: string;

  // 报表数据
  dataSet: any[] = [];
  // 报表
  reportData: any[] = [];
  // 表格头
  header: any[] = [];
  // 字段
  fields: any = {};
  // 加载flag
  loading = false;
  // 加载flag
  update = false;
  // 报表名
  reportName: string;

  lastUpdateTime = '';

  scroll = { x: '1000px', y: '300px' };

  // 当前页
  pageIndex = 1;
  // 当前页件数
  pageSize = 100;
  // 总数
  total = 0;

  reportFields = [];

  // 固定字段
  fixedFields = [
    {
      field_id: 'created_at',
      datastore_id: '',
      field_name: 'common.text.createdAt',
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
      field_type: 'user',
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
    private report: ReportService,
    private tokenService: TokenStorageService,
    private i18n: I18NService,
    private translate: TranslateService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.search();
  }

  /**
   * @description: 画面初始化
   */
  ngOnInit(): void {
    this.pageIndex = 1;
    this.pageSize = 100;

    this.translate.onLangChange.subscribe(() => {
      this.buildData();
    });
  }

  /**
   * @description: 检索数据
   */
  async search() {
    if (this.reportId) {
      this.loading = true;
      await this.report
        .getReportData(this.reportId, {
          condition_type: 'and',
          page_index: this.pageIndex,
          page_size: this.pageSize
        })
        .then((rpData: any) => {
          if (rpData) {
            this.reportData = rpData.item_data;
            this.fields = rpData.fields;
            this.total = rpData.total;
            this.reportName = rpData.report_name;
          } else {
            this.reportData = [];
            this.fields = [];
            this.total = 0;
            this.reportName = 'common.text.unnamed';
          }
        });

      await this.buildData();
    }
  }

  /**
   * @description: 编辑报表数据
   */
  async buildData() {
    this.header = [];
    this.dataSet = [];
    this.reportFields = [];
    let hasCount = false;

    // 编辑报表header部数据
    // tslint:disable-next-line:forin
    for (const key in this.fields) {
      const field = this.fields[key];
      const f = this.fields[key];
      f.field_id = key;

      this.reportFields.push(f);
      if (field.alias_name === 'count') {
        hasCount = true;
      } else {
        if (field.is_dynamic) {
          this.header.push({
            name: field.alias_name,
            width: '100px',
            order: field.order
          });
        } else {
          const item = this.fixedFields.find(fl => fl.alias_name === field.alias_name);
          console.log(item);
          this.header.push({
            name: this.i18n.translateLang(item.field_name),
            width: '100px',
            order: field.order
          });
        }
      }
    }
    if (hasCount) {
      this.header.push({
        name: this.i18n.translateLang('page.dashboard.count'),
        width: '100px',
        order: 1000
      });
    }

    this.header = _.sortBy(this.header, 'order');
    this.reportFields = _.sortBy(this.reportFields, 'order');

    this.scroll.x = this.fields.length * 100 + 'px';

    // 编辑报表header部以外数据
    this.dataSet = this.buildItemsData();

    this.loading = false;
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
              const value = {
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
                if (dt[field.field_id] === '0') {
                  row.push({
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
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.header = this.header.map(e => (e.name === col ? { ...e, width: `${width}px` } : e));
  }

  /**
   * 刷新数据
   */
  genReportData() {
    this.update = true;
    this.report.genReportData(this.reportId).then(() => {
      this.search().then(() => {
        this.update = false;
      });
    });
  }
}
