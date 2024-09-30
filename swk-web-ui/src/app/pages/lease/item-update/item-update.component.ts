/*
 * @Description: 数据更新控制器
 * @Author: RXC 廖云江
 * @Date: 2019-12-18 17:15:42
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-12-31 10:01:34
 */
import { format } from 'date-fns';
import * as _ from 'lodash';
import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService, FieldService, OptionService, UserService, WorkflowService } from '@api';
import { CommonService, I18NService, SelectItem } from '@core';

@Component({
  selector: 'app-item-update',
  templateUrl: './item-update.component.html',
  styleUrls: ['./item-update.component.less']
})
export class ItemUpdateComponent implements OnInit {
  // 数据定义
  controlArray: any[] = [];
  userList = [];
  loading = false;
  action = '';

  // 构造函数
  constructor(
    private db: DatabaseService,
    public field: FieldService,
    private route: ActivatedRoute,
    private location: Location,
    private event: NgEventBus,
    private userService: UserService,
    private optionService: OptionService,
    private common: CommonService,
    private i18n: I18NService,
    private wf: WorkflowService,
    private message: NzMessageService
  ) {}
  ngOnInit() {
    this.action = this.route.snapshot.queryParamMap.get('action');
    this.getDatabaseData();
  }

  /**
   * @description: 获取台账数据
   */
  async getDatabaseData() {
    this.loading = true;
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const itemId = this.route.snapshot.paramMap.get('i_id');
    const wfId = this.route.snapshot.queryParamMap.get('wf_id');
    let fields = [];
    if (wfId) {
      const jobs = [
        this.userService.getUsers({ invalid: 'true' }),
        this.field.getFields(datastoreId),
        this.db.getItem(datastoreId, itemId, 'true'),
        this.wf.getWorkflowByID(wfId)
      ];

      await forkJoin(jobs)
        .toPromise()
        .then((data: any[]) => {
          if (data) {
            const usersData = data[0];
            const fieldsData = data[1];
            const itemData = data[2];
            const wfData = data[3];

            if (usersData) {
              const userList: Array<SelectItem> = [];
              usersData.forEach(user => {
                userList.push({ label: user.user_name, value: user.user_id });
              });
              this.userList = userList;
            } else {
              this.userList = [];
            }
            let fieldList = [];
            if (wfData) {
              const workflow = wfData.workflow;
              const fs: string = workflow.params['fields'];
              if (fs) {
                fieldList = fs.split(',');
              }
            }
            if (fieldsData) {
              if (fieldList.length > 0) {
                const fs = fieldsData;
                fieldList.forEach(f => {
                  const field = fs.find(it => it.field_id === f && !it.as_title);
                  if (field) {
                    fields.push(field);
                  }
                });
              } else {
                fields = fieldsData;
              }
            } else {
              fields = [];
            }

            let items = [];
            if (itemData) {
              items = itemData.items;
            }
            // 设置数据
            this.setItems(fields, items);
          }
        });
    } else {
      const fieldList = [];
      let wfs = [];

      const jobs = [
        this.userService.getUsers({ invalid: 'true' }),
        this.field.getFields(datastoreId),
        this.db.getItem(datastoreId, itemId, 'true'),
        this.wf.getUserWorkflows(datastoreId, 'update')
      ];

      await forkJoin(jobs)
        .toPromise()
        .then((data: any[]) => {
          if (data) {
            const usersData = data[0];
            const fieldsData = data[1];
            const itemData = data[2];
            const wfData = data[3];

            if (usersData) {
              const userList: Array<SelectItem> = [];
              usersData.forEach(user => {
                userList.push({ label: user.user_name, value: user.user_id });
              });
              this.userList = userList;
            } else {
              this.userList = [];
            }
            if (wfData) {
              wfs = wfData;

              wfs.forEach(w => {
                if (w && w.is_valid) {
                  const fs: string = w.params['fields'];
                  if (fs) {
                    fieldList.push(...fs.split(','));
                  }
                }
              });

              // const w = wfs.find(d => d.params['action'] === 'update');
              // if (w && w.is_valid) {
              //   const fs: string = w.params['fields'];
              //   if (fs) {
              //     fieldList.push(...fs.split(','));
              //   }
              // }
            }

            if (fieldsData) {
              fields = fieldsData.filter(it => !it.as_title);
              fieldList.forEach(f => {
                fields = fields.filter(it => it.field_id !== f);
              });
            } else {
              fields = [];
            }

            let items = [];
            if (itemData) {
              items = itemData.items;
            }
            // 设置数据
            this.setItems(fields, items);
          }
        });
    }

    this.loading = false;
  }

  /**
   * @description: 设置数据
   */
  setItems(fields: any[], items: any) {
    this.controlArray = [];
    if (fields) {
      fields.forEach(f => {
        if (items.hasOwnProperty(f.field_id)) {
          let value;

          switch (f.field_type) {
            case 'file':
              value = [];
              items[f.field_id].forEach((file: { url: string; name: string }) => {
                value.push({
                  uid: file.url,
                  url: file.url,
                  status: 'done',
                  name: file.name
                });
              });
              break;

            case 'date':
              const date = items[f.field_id] === '0001-01-01' ? '' : items[f.field_id];
              if (date) {
                value = new Date(date);
              } else {
                value = null;
              }
              break;
            case 'lookup':
              value = items[f.field_id];
              break;
            default:
              value = items[f.field_id];
              break;
          }

          if (f.field_type === 'time') {
            const control = {
              field_id: f.field_id,
              field_type: f.field_type,
              is_required: f.is_required,
              unique: f.unique,
              lookup_app_id: f.lookup_app_id,
              lookup_datastore_id: f.lookup_datastore_id,
              lookup_field_id: f.lookup_field_id,
              user_group_id: f.user_group_id,
              is_image: f.is_image,
              display_order: f.display_order,
              option_id: f.option_id,
              label: f.field_name,
              placeholder: `page.datastore.pleaseInput`,
              value: new Date(format(new Date(), 'yyyy-MM-dd') + ' ' + value)
            };

            this.controlArray.push(control);
          } else {
            const control = {
              field_id: f.field_id,
              field_type: f.field_type,
              is_required: f.is_required,
              unique: f.unique,
              minLength: f.min_length,
              maxLength: f.max_length,
              minValue: f.min_value,
              maxValue: f.max_value,
              precision: f.precision,
              lookup_app_id: f.lookup_app_id,
              lookup_datastore_id: f.lookup_datastore_id,
              lookup_field_id: f.lookup_field_id,
              user_group_id: f.user_group_id,
              is_image: f.is_image,
              display_order: f.display_order,
              option_id: f.option_id,
              label: f.field_name,
              placeholder: `page.datastore.pleaseInput`,
              value: value
            };

            this.controlArray.push(control);
          }
        } else {
          let value;
          switch (f.field_type) {
            case 'text':
            case 'textarea':
            case 'number':
            case 'autonum':
              value = '';
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

          const control = {
            field_id: f.field_id,
            field_type: f.field_type,
            is_required: f.is_required,
            unique: f.unique,
            label: f.field_name,
            minLength: f.min_length,
            maxLength: f.max_length,
            minValue: f.min_value,
            maxValue: f.max_value,
            precision: f.precision,
            lookup_app_id: f.lookup_app_id,
            lookup_datastore_id: f.lookup_datastore_id,
            lookup_field_id: f.lookup_field_id,
            user_group_id: f.user_group_id,
            is_image: f.is_image,
            display_order: f.display_order,
            option_id: f.option_id,
            placeholder: `page.datastore.pleaseInput`,
            value: value
          };
          this.controlArray.push(control);
        }
      });
    }

    this.controlArray = _.orderBy(this.controlArray, ['display_order'], ['asc']);
  }

  /**
   * @description: 取消处理
   */
  cancel() {
    this.location.back();
  }

  /**
   * @description: 提交处理
   */
  submit(value) {
    this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    this.event.cast('item:refresh');
    this.location.back();
  }
}
