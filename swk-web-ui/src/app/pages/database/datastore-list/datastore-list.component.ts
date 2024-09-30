/*
 * @Description: 台账列表控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-06-17 13:13:58
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2021-01-19 14:18:40
 */

import { format } from 'date-fns';
import * as _ from 'lodash';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import * as XLSX from 'xlsx';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService, ItemService, ReportService, UserService } from '@api';
import { I18NService, TokenStorageService, AclService } from '@core';
import { OptionPipe, UserPipe } from '@shared';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-datastore-list',
  templateUrl: './datastore-list.component.html',
  styleUrls: ['./datastore-list.component.less'],
  providers: [UserPipe, OptionPipe],
})
export class DatastoreListComponent implements OnInit, OnDestroy {
  constructor(
    private db: DatabaseService,
    private rp: ReportService,
    private item: ItemService,
    private message: NzMessageService,
    private modal: NzModalService,
    private route: ActivatedRoute,
    private tokenService: TokenStorageService,
    private i18n: I18NService,
    private bs: NzBreakpointService,
    private router: Router,
    private acl: AclService,
    private user: UserService,
  ) {
    this.route.data.pipe(take(1)).subscribe((data: { listData: any }) => {
      this.fields = data.listData.fields;
      /* this.qrFields = data.listData.qrFields; */
      /* this.qrConnector = data.listData.qrConnector; */
      this.printFields = data.listData.fields.filter(f => f.field_type !== 'file');
      /* this.apiKey = data.listData.apiKey; */
      /* this.canCheck = data.listData.canCheck; */
    });

    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'sm' || data === 'xs' || data === 'md' || data === 'lg') {
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });
  }

  // 数据定义
  isSmall = false;
  // 一览数据 { unChange : true, 'items':[]}
  dataSet: any[] = [];
  // 文件出力使用标题
  header: any[] = [];
  // 出力CSV文件名称
  outCsvFileName = '';
  // 台账字段
  fields: any[] = [];
  // 打印字段
  printFields: any[] = [];
  // 打印的 QR 字段
  qrFields: any[] = [];
  // 打印的 QR 字段连接符
  qrConnector = '';
  // 一览显示台账字段
  displayFields: any[] = [];
  // 台账数据
  items: any[] = [];
  // 分页使用-当前页
  pageIndex = 1;
  // 分页使用-每页显示条数
  pageSize = 50;
  // 分页使用-总的条数
  total = 1;
  // 排序值（升序，降序，不排序）
  sorts: Array<{ sort_key: string; sort_value: string }> = [];
  tableWidth = 60;
  pages = [];
  isZoomFlg = false;
  viewInit = true;
  apiKey = '';
  // 是否执行
  canRun = true;
  canCheck = false;
  // 是否选中
  checked = false;
  indeterminate = false;
  // 选中的记录id
  setOfChecked = new Set<string>();
  // 是否拥有批量删除权限
  isClear = true;
  loading = false;
  timezone: '';

  // 检索条件
  conditionParam = {
    condition_list: [],
    condition_type: 'and'
  };

  confirmModal: NzModalRef;

  /**
   * @description: 画面初始化处理
   */
  ngOnInit() {
    const datastore = this.route.snapshot.paramMap.get('d_id');
    this.isClear = this.acl.checkAction(datastore, 'batch_delete');
    this.searchDatabaseItems();
  }

  /**
   * @description: 画面销毁处理
   */
  ngOnDestroy() { }

  /**
   * @description: 直接从服务器上下载csv文件
   * @return: csv文件
   */
  async onlineDownloadCsv() {
    const params = {
      item_condition: Object.assign(this.conditionParam, {
        sorts: this.sorts
      })
    };

    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;

    await this.db.downloadCsv(datastoreId, jobId, params).then(data => {
      this.message.info(this.i18n.translateLang('common.message.info.I_002'));
    });
  }

  /**
   * @description: 下载本金返还预计表csv
   * @return: csv文件
   */
  async onlineDownloadPrsCsv() {
    const params = {
      item_condition: this.conditionParam
    };

    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;

    await this.rp.downloadPrsCsv(datastoreId, jobId, params).then(data => {
      this.message.info(this.i18n.translateLang('common.message.info.I_002'));
    });
  }

  /**
   * @description: 下载为CSV文件
   */
  async downloadCSV() {
    // 数据
    const csvItems = [];
    // 表头
    const headers = ['ID'];
    const apikeyHeaders = ['id'];
    // 追加深度克隆，防止影响画面内容
    let fields = JSON.parse(JSON.stringify(this.fields));
    // 删除文件字段
    fields = fields.filter(f => f.field_type !== 'file');
    // 重新排序，保证顺序性
    fields = _.orderBy(fields, ['display_order'], ['asc']);

    this.items.forEach((dt, index) => {
      const item: any[] = [];
      // 添加第一行的itemId数据
      item.push(dt.item_id);
      // 循环字段添加数据
      fields.forEach(fl => {
        // 第一次循环的时候添加表头数据
        if (index === 0) {
          headers.push(this.i18n.translateLang(fl.field_name));
          apikeyHeaders.push(fl.field_id);
        }
        // 判断数据中是否包含该字段，有则获取数据，无则添加空值
        if (dt.items.hasOwnProperty(fl.field_id)) {
          let value = '';
          switch (fl.field_type) {
            case 'text':
            case 'textarea':
            case 'number':
              if (dt.items[fl.field_id]) {
                value = dt.items[fl.field_id].value;
              }
              break;
            case 'autonum':
              if (dt.items[fl.field_id]) {
                value = dt.items[fl.field_id].value;
              }
              break;
            case 'date':
            case 'datetime':
              if (dt.items[fl.field_id]) {
                value = dt.items[fl.field_id].value === '0001-01-01' ? '' : dt.items[fl.field_id].value;
              }
              break;
            case 'time':
              if (dt.items[fl.field_id]) {
                value = dt.items[fl.field_id].value;
              }
              break;
            case 'user':
              if (dt.items[fl.field_id]) {
                const v: string = dt.items[fl.field_id].value;
                value = JSON.parse(v).join(',');
              }
              break;
            case 'switch':
              if (dt.items[fl.field_id] !== '') {
                value = dt.items[fl.field_id].value;
              }
              break;
            case 'options':
              if (dt.items[fl.field_id]) {
                value = dt.items[fl.field_id].value ? this.i18n.translateLang(dt.items[fl.field_id].value) : '';
              }
              break;
            case 'lookup':
              value = dt.items[fl.field_id].value;
              break;
            default:
              value = dt.items[fl.field_id].value;
              break;
          }
          item.push(value);
        } else {
          item.push('');
        }
      });

      // 第一次循环的时候添加表头数据
      if (index === 0) {
        csvItems.push(headers);
        csvItems.push(apikeyHeaders);
      }

      // 将一行的数据添加到集合中
      csvItems.push(item);
    });

    // 当数据为空的时候，只下载表头
    if (this.items.length === 0) {
      fields.forEach(fl => {
        headers.push(this.i18n.translateLang(fl.field_name));
        apikeyHeaders.push(fl.field_id);
      });

      csvItems.push(headers);
      csvItems.push(apikeyHeaders);
    }

    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(csvItems);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* get the file name */
    await this.getOutCsvFileName();

    /* save to file */
    XLSX.writeFile(wb, this.outCsvFileName);
  }

  /**
   * @description: 取得出力CSV文件名称
   */
  async getOutCsvFileName(fileName?: string, suffix?: string) {
    if (fileName) {
      this.outCsvFileName = fileName + '_' + format(new Date(), 'yyyyMMddHHmmss') + (suffix ? suffix : '.csv');
      return;
    }

    /* get the file name */
    this.outCsvFileName = '';
    const currentApp = this.tokenService.getUserApp();
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const mojititle = `${this.i18n.translateLang(`apps.${currentApp}.datastores.${datastoreId}`)}`;
    this.outCsvFileName = mojititle + '_' + format(new Date(), 'yyyyMMddHHmmss') + '.csv';
  }

  /**
   * @description: 排序
   */
  onQueryParamsChange(params: NzTableQueryParams) {
    const { sort } = params;
    const currentSort = sort.filter(item => item.value !== null);

    this.sorts = currentSort.map(s => {
      return { sort_key: s.key, sort_value: s.value };
    });

    if (!this.viewInit) {
      this.searchDatabaseItems();
    }
  }

  /**
   * @description: 检索条件变更事件
   */
  queryChange(param) {
    this.conditionParam = param;
  }

  /**
   * @description: 查询关联台账的数据
   */
  async searchDatabaseItems(reset: boolean = false) {
    this.loading = true
    // 页面条数变更回到第一页
    if (reset) {
      this.pageIndex = 1;
    }

    const userId = this.tokenService.getUserId();
    forkJoin([this.user.getUserByID({ type: '0', user_id: userId })])
      .toPromise()
      .then((data: any[]) => {
        this.timezone = data[0].timezone
      })

    const params = Object.assign(this.conditionParam, {
      page_index: this.pageIndex,
      page_size: this.pageSize,
      sorts: this.sorts,
      timezone: this.timezone
    });

    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    await this.db.getItems(datastoreId, params).then((data: any) => {
      if (data && data.items_list) {
        this.items = data.items_list;
        this.total = data.total;
      } else {
        this.items = [];
        this.total = 0;
      }
    });
    // 清空上一步选中的数据
    this.allChecked(false);
    this.generateTableData();

    setTimeout(() => {
      this.viewInit = false;
    }, 2000);
    this.loading = false
  }

  /**
   * @description: 跳转到详细画面
   */
  goTo(item_id: string) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const url = `/datastores/${datastoreId}/items/${item_id}`;
    this.router.navigate([url]);
  }

  /**
   * @description: 清空台账数据
   */
  clear() {
    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.clearTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.clearContent')}`,
      nzOnOk: () => {
        const datastoreId = this.route.snapshot.paramMap.get('d_id');
        // 判断台账是否有数据正在审批，如果有就不清空(status=1表示未审批)
        this.item.findUnApproveItems(datastoreId, '2').then((res: any) => {
          if (res === 0) {
            this.item.clear(datastoreId).then(() => {
              this.message.success(this.i18n.translateLang('common.message.success.S_003'));
              this.searchDatabaseItems(true);
            });
          } else {
            this.message.warning(this.i18n.translateLang('common.message.warning.W_006'));
          }
        });
      }
    });
  }
  /**
   * @description: 删除选中的台账数据
   */
  clearSelected() {
    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.clearTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.clearContent')}`,
      nzOnOk: () => {
        const datastoreId = this.route.snapshot.paramMap.get('d_id');
        const itemIDSet = Array.from(this.setOfChecked);
        this.item.clearSelected(datastoreId, itemIDSet).then(() => {
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.searchDatabaseItems(true);
        });
      }
    });
  }

  async printList() {
    if (this.canRun) {
      this.canRun = false;
    } else {
      return;
    }

    setTimeout(() => {
      this.canRun = true;
    }, 1000);

    const params = Object.assign(this.conditionParam, {
      sorts: this.sorts
    });
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    // 500件限制检查
    await this.db.getItems(datastoreId, params).then(async (data: any) => {
      if (data && data.total) {
        const total: number = data.total;
        if (total > 500) {
          this.message.warning(this.i18n.translateLang('common.message.warning.W_009'));
        } else {
          // 打印PDF
          await this.db.printList(datastoreId, params).then(() => {
            this.message.info(this.i18n.translateLang('common.message.info.I_002'));
          });
        }
      }
    });
  }

  /**
   * @description: 添加数据
   */
  add() {
    this.apiKey = localStorage.getItem("apiKey")
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    if (this.apiKey === 'keiyakudaicho') {
      const url = `/lease/datastores/${datastoreId}/add`;
      this.router.navigate([url]);
    } else {
      const url = `/datastores/${datastoreId}/add`;
      this.router.navigate([url]);
    }
  }

  /**
   * @description: 生成table数据
   */
  async generateTableData() {
    this.dataSet = [];
    this.header = [];
    this.tableWidth = 60;

    this.fields = _.orderBy(this.fields, ['display_order'], ['asc']);

    // 显示字段
    this.displayFields = this.fields;

    const fieldName: string[] = [];
    fieldName.push('id');
    this.fields.forEach(fl => {
      if (fl.field_type !== 'file') {
        fieldName.push(`${this.i18n.translateLang(fl.field_name)}`);
      }
      this.tableWidth += fl.width;
    });

    this.header.push(fieldName);

    this.items.forEach((dt, index) => {
      const row: any[] = [];
      const unChangeFlg = false;
      row.push({
        data_type: 'item_id',
        value: dt.item_id
      });
      row.push({
        data_type: 'index',
        value: (this.pageIndex - 1) * this.pageSize + index + 1
      });
      this.displayFields.forEach(fl => {
        let isAdd = false;
        // tslint:disable-next-line: forin
        for (const key in dt.items) {
          if (fl.field_id === key) {
            let value;
            switch (fl.field_type) {
              case 'text':
              case 'textarea':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'number':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'function':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'autonum':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'date':
              case 'datetime':
                if (dt.items[key]) {
                  const v = dt.items[key].value === '0001-01-01' ? '' : dt.items[key].value;
                  value = {
                    data_type: fl.field_type,
                    value: v
                  };
                }
                break;
              case 'time':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'user':
                if (dt.items[key]) {
                  const v: string = dt.items[key].value;
                  value = {
                    data_type: dt.items[key].data_type,
                    value: JSON.parse(v.slice(0, v.length))
                  };
                }
                break;
              case 'file':
                if (dt.items[key]) {
                  const v: string = dt.items[key].value;
                  value = {
                    data_type: dt.items[key].data_type,
                    value: JSON.parse(v.slice(0, v.length))
                  };
                }
                break;
              case 'switch':
                if (dt.items[key] !== '') {
                  value = dt.items[key];
                }
                break;
              case 'options':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'lookup':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              default:
                value = dt.items[key];
                break;
            }
            row.push(value);

            isAdd = true;
          }
        }
        if (!isAdd) {
          row.push(``);
        }
      });
      this.dataSet = [...this.dataSet, { unChange: unChangeFlg, items: row }];
    });
    this.clearAllChecked();
    this.pages = new Array(Math.ceil(this.dataSet.length / 10));
  }

  /**
   * @description: 跳转到履历画面
   */
  showHistory() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    this.router.navigateByUrl(`/datastores/${datastoreId}/history`);
  }
  /**
   * @description: 跳转到履历画面
   */
  showCheckHistory() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    this.router.navigateByUrl(`/datastores/${datastoreId}/checkHistory`);
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    this.searchDatabaseItems(true);
  }
  /**
   * @description: 全选
   */
  allChecked(value: boolean): void {
    this.dataSet.forEach(item => this.updateCheckedSet(item.items[0].value, value));
  }
  /**
   * @description: 更改选中状态
   */
  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.setOfChecked.add(id);
    } else {
      this.setOfChecked.delete(id);
    }
  }
  /**
   * @description: 清空选中状态
   */
  clearAllChecked(): void {
    if (this.dataSet.length > 0) {
      this.checked = this.dataSet.every(item => this.setOfChecked.has(item.items[0].value));
      this.indeterminate = this.dataSet.some(item => this.setOfChecked.has(item.items[0].value)) && !this.checked;
    }
  }
}
