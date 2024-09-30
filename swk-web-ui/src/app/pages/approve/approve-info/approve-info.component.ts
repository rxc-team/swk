import {
    CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridType
} from 'angular-gridster2';
import * as _ from 'lodash';
import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { forkJoin } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApproveService, UserService, WorkflowService } from '@api';
import { I18NService, SelectItem, TokenStorageService } from '@core';

@Component({
  selector: 'app-approve-info',
  templateUrl: './approve-info.component.html',
  styleUrls: ['./approve-info.component.less']
})
export class ApproveInfoComponent implements OnInit {
  // 构造函数
  constructor(
    private wf: WorkflowService,
    private as: ApproveService,
    private tokenService: TokenStorageService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private event: NgEventBus,
    private userService: UserService,
    private local: Location,
    private i18n: I18NService
  ) {}

  // 数据定义
  // 动态数据
  listData: Array<GridsterItem> = [];
  itemInfo: any = {};
  // 动态部分设置信息
  options: GridsterConfig;
  comment: '';
  // 所有字段
  fields = [];
  nodes = [];
  process = [];
  status = 0;
  currentNode;
  history = [];
  height = 350;
  // 共通数据
  userList = [];
  confirmModal: NzModalRef;

  /**
   * @description: 画面初期化处理
   */
  ngOnInit() {
    this.options = {
      displayGrid: DisplayGrid.OnDragAndResize,
      gridType: GridType.VerticalFixed,
      compactType: CompactType.CompactUp,
      mobileBreakpoint: 640,
      keepFixedHeightInMobile: true,
      fixedRowHeight: 32,
      minCols: 1,
      maxCols: 4,
      minRows: 10,
      maxRows: 500,
      margin: 8,
      pushItems: true,
      draggable: {
        enabled: false
      },
      resizable: {
        enabled: false
      }
    };

    this.init();
  }

  getIndex(nodes: any[], current: string) {
    return nodes.findIndex(f => f.node_id === current);
  }

  /**
   * @description: 画面event事件，画面初始化
   */
  async init() {
    const exId = this.route.snapshot.paramMap.get('ex_id');
    const datastoreId = this.route.snapshot.queryParamMap.get('datastoreId');
    const jobs = [this.userService.getUsers({ invalid: 'true' }), this.as.getItem(exId, datastoreId)];

    await forkJoin(jobs)
      .toPromise()
      .then(async (data: any[]) => {
        if (data) {
          const usersData = data[0];
          const approvesData = data[1];

          if (usersData) {
            const userList: Array<SelectItem> = [];
            usersData.forEach(user => {
              userList.push({ label: user.user_name, value: user.user_id, icon: user.avatar });
            });
            this.userList = userList;
          } else {
            this.userList = [];
          }

          if (approvesData) {
            this.fields = approvesData.fields;

            if (approvesData.history && Object.keys(approvesData.history).length > 0) {
              this.setUpdateItems(
                approvesData.fields,
                approvesData.change_fields,
                approvesData.items,
                approvesData.history,
                approvesData.datastore_id
              );
            } else {
              this.setItems(approvesData.fields, approvesData.items, approvesData.datastore_id);
            }
            this.nodes = approvesData.nodes;
            this.process = approvesData.process;
            this.currentNode = approvesData.status.current_node;
            this.status = approvesData.status.approve_status;
            this.itemInfo = approvesData;
          }
        }
      });
  }

  setValue(f, data) {
    if (f.field_type === 'autonum' || f.field_type === 'function') {
      return 'common.text.autoCalculate';
    }

    if (!data) {
      return '';
    }

    let value;

    switch (f.field_type) {
      case 'file':
        value = [];
        data.forEach((file: { url: string; name: string }) => {
          value.push({
            url: file.url,
            name: file.name
          });
        });
        break;

      case 'date':
        value = data === '0001-01-01' ? '' : data;
        break;
      default:
        value = data;
        break;
    }

    return value;
  }

  /**
   * @description: 设置中间动态部分数据
   */
  setUpdateItems(fields: any[], approveFields: any[], items: Object, history: Object, datastoreId: string) {
    if (fields) {
      fields.forEach(f => {
        const aField = approveFields.find(af => af.field_id === f.field_id && !af.as_title);

        if (aField) {
          if (items.hasOwnProperty(f.field_id)) {
            let hasChange = false;
            let value = this.setValue(f, items[f.field_id]);
            let oldValue;
            // 判断字段存在
            if (f.field_type !== 'autonum' && f.field_type !== 'function') {
              if (history.hasOwnProperty(f.field_id)) {
                oldValue = this.setValue(f, history[f.field_id]);
                hasChange = value !== oldValue;
              } else {
                oldValue = '';
                hasChange = value !== oldValue;
              }
            }

            if (f.field_type === 'user') {
              value = _.sortBy(value);
              oldValue = _.sortBy(oldValue);

              hasChange = JSON.stringify(value) !== JSON.stringify(oldValue);
            }
            if (f.field_type === 'file') {
              value = _.sortBy(value, ['url']);
              oldValue = _.sortBy(oldValue, ['url']);

              hasChange = JSON.stringify(value) !== JSON.stringify(oldValue);
            }

            const it: GridsterItem = {
              cols: f.cols ? f.cols : 1,
              rows: f.rows ? (hasChange ? f.rows * 2 : f.rows) : 1,
              y: f.y ? f.y * 2 : 0,
              x: f.x ? f.x : 0,
              field_id: f.field_id,
              is_required: f.is_required,
              app_id: f.lookup_app_id,
              datastore_id: datastoreId,
              lookup_datastore_id: f.lookup_datastore_id,
              lookup_field_id: f.lookup_field_id,
              type: f.field_type,
              display_order: f.display_order,
              as_title: f.as_title,
              image: f.is_image,
              name: f.field_name,
              isApproveField: true,
              hasChange: hasChange,
              value: value,
              oldValue: oldValue
            };

            const line = (f.rows + f.y) * 40;
            if (line > this.height) {
              this.height = line;
            }

            this.listData.push(it);
          } else {
            let value = '';
            let oldValue = '';
            switch (f.field_type) {
              case 'autonum':
              case 'function':
                value = 'common.text.autoCalculate';
                break;
              default:
                // 判断字段存在
                if (history.hasOwnProperty(f.field_id)) {
                  oldValue = this.setValue(f, history[f.field_id]);
                } else {
                  oldValue = '';
                }

                break;
            }

            const it: GridsterItem = {
              cols: f.cols ? f.cols : 1,
              rows: f.rows ? f.rows : 1,
              y: f.y ? f.y : 0,
              x: f.x ? f.x : 0,
              is_required: f.is_required,
              field_id: f.field_id,
              app_id: f.lookup_app_id,
              datastore_id: datastoreId,
              lookup_datastore_id: f.lookup_datastore_id,
              lookup_field_id: f.lookup_field_id,
              type: f.field_type,
              name: f.field_name,
              display_order: f.display_order,
              as_title: f.as_title,
              image: f.is_image,
              isApproveField: true,
              hasChange: value !== oldValue,
              value: value,
              oldValue: oldValue
            };
            const line = (it.rows + f.y) * 40;
            if (line > this.height) {
              this.height = line;
            }
            this.listData.push(it);
          }
        } else {
          if (history.hasOwnProperty(f.field_id)) {
            let value = this.setValue(f, history[f.field_id]);

            if (f.field_type === 'user') {
              value = _.sortBy(value);
            }
            if (f.field_type === 'file') {
              value = _.sortBy(value, ['url']);
            }

            const it: GridsterItem = {
              cols: f.cols ? f.cols : 1,
              rows: f.rows ? f.rows : 1,
              y: f.y ? f.y * 2 : 0,
              x: f.x ? f.x : 0,
              field_id: f.field_id,
              is_required: f.is_required,
              app_id: f.lookup_app_id,
              datastore_id: datastoreId,
              lookup_datastore_id: f.lookup_datastore_id,
              lookup_field_id: f.lookup_field_id,
              type: f.field_type,
              display_order: f.display_order,
              as_title: f.as_title,
              image: f.is_image,
              name: f.field_name,
              isApproveField: aField ? true : false,
              hasChange: false,
              value: value
            };

            const line = (f.rows + f.y) * 40;
            if (line > this.height) {
              this.height = line;
            }

            this.listData.push(it);
          } else {
            let value;
            switch (f.field_type) {
              case 'autonum':
              case 'function':
                value = 'common.text.autoCalculate';
                break;
              default:
                value = '';
                break;
            }

            const it: GridsterItem = {
              cols: f.cols ? f.cols : 1,
              rows: f.rows ? f.rows : 1,
              y: f.y ? f.y : 0,
              x: f.x ? f.x : 0,
              is_required: f.is_required,
              field_id: f.field_id,
              app_id: f.lookup_app_id,
              datastore_id: datastoreId,
              lookup_datastore_id: f.lookup_datastore_id,
              lookup_field_id: f.lookup_field_id,
              type: f.field_type,
              name: f.field_name,
              display_order: f.display_order,
              as_title: f.as_title,
              image: f.is_image,
              isApproveField: false,
              hasChange: false,
              value: value
            };
            const line = (it.rows + f.y) * 40;
            if (line > this.height) {
              this.height = line;
            }
            this.listData.push(it);
          }
        }
      });
    }

    this.listData = _.orderBy(this.listData, ['display_order'], ['asc']);
  }
  /**
   * @description: 设置中间动态部分数据
   */
  setItems(fields: any[], items: Object, datastoreId: string) {
    if (fields) {
      fields.forEach(f => {
        let exist = false;
        for (const key in items) {
          if (key === f.field_id) {
            const it: GridsterItem = {
              cols: f.cols ? f.cols : 1,
              rows: f.rows ? f.rows : 1,
              y: f.y ? f.y : 0,
              x: f.x ? f.x : 0,
              field_id: key,
              app_id: f.lookup_app_id,
              datastore_id: datastoreId,
              lookup_datastore_id: f.lookup_datastore_id,
              lookup_field_id: f.lookup_field_id,
              type: f.field_type,
              display_order: f.display_order,
              as_title: f.as_title,
              image: f.is_image,
              name: f.field_name,
              isApproveField: true,
              value: this.setValue(f, items[key])
            };

            const line = (it.rows + it.y) * 40;
            if (line > this.height) {
              this.height = line;
            }

            this.listData.push(it);

            exist = true;
          }
        }
        if (!exist) {
          let value;
          switch (f.field_type) {
            case 'text':
            case 'textarea':
            case 'number':
              value = '';
              break;
            case 'autonum':
            case 'function':
              value = 'common.text.autoCalculate';
              break;
            case 'date':
              value = null;
              break;
            case 'time':
              value = null;
              break;
            case 'user':
            case 'file':
              value = [];
              break;
            case 'switch':
              value = false;
              break;
            case 'options':
              value = null;
              break;
            default:
              value = '';
              break;
          }

          const it: GridsterItem = {
            cols: f.cols ? f.cols : 1,
            rows: f.rows ? f.rows : 1,
            y: f.y ? f.y : 0,
            x: f.x ? f.x : 0,
            field_id: f.field_id,
            app_id: f.lookup_app_id,
            datastore_id: datastoreId,
            lookup_datastore_id: f.lookup_datastore_id,
            lookup_field_id: f.lookup_field_id,
            type: f.field_type,
            name: f.field_name,
            display_order: f.display_order,
            as_title: f.as_title,
            image: f.is_image,
            isApproveField: true,
            value: value
          };

          const line = (it.rows + it.y) * 40;
          if (line > this.height) {
            this.height = line;
          }

          this.listData.push(it);
        }
      });
    }

    this.listData = _.orderBy(this.listData, ['display_order'], ['asc']);
  }

  checkDisable(current: string) {
    if (this.status !== 1) {
      return true;
    }

    const userId = this.tokenService.getUserId();
    const processList: any[] = this.process.filter(p => p.current_node === current);
    let result = true;
    processList.forEach(proc => {
      if (proc.user_id === userId && proc.status !== 1 && proc.status !== 2) {
        result = false;
      }
    });
    return result;
  }

  /**
   * @description: 承认
   */
  admit(exId: string) {
    console.log(exId);
    this.wf.admit(exId, this.comment).then(res => {
      if (res === null) {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
      }
      this.event.cast('approve:refresh');
      this.local.back();
    });
  }
  /**
   * @description: 拒绝
   */
  dismiss(exId: string) {
    this.wf.dismiss(exId, this.comment).then(() => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
      this.event.cast('approve:refresh');
      this.local.back();
    });
  }
}
