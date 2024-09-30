/*
 * @Description: 数据添加控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-06-17 16:39:42
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-07-20 13:57:47
 */
import * as _ from 'lodash';
import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService, DatastoreService, FieldService, UserService } from '@api';
import { I18NService, SelectItem, TokenStorageService } from '@core';

@Component({
  selector: 'app-item-add',
  templateUrl: './item-add.component.html',
  styleUrls: ['./item-add.component.less']
})
export class ItemAddComponent implements OnInit {
  // 数据定义
  controlArray: any[] = [];
  fieldsInfo: any[] = [];
  userList = [];
  loading = false;

  dsType = '';

  save = false;
  ots: { [key: string]: any[] } = {};
  nts: { [key: string]: any[] } = {};

  // 构造函数
  constructor(
    public field: FieldService,
    private route: ActivatedRoute,
    private location: Location,
    private event: NgEventBus,
    private i18n: I18NService,
    private app: AppService,
    private userService: UserService,
    private ds: DatastoreService,
    private tokenService: TokenStorageService,
    private message: NzMessageService
  ) { }

  async ngOnInit() {
    const us = this.tokenService.getUser();
    const currentApp = us.current_app;
    const db = us.customer_id;

    this.loading = true;
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const jobs = [
      //this.userService.getUsers({ invalid: 'true' }),
      this.field.getFields(datastoreId),
      this.ds.getDatastoreByID(datastoreId),
      this.app.getAppByID(currentApp, db)
    ];

    await forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          //const usersData = data[0];
          const fieldsData = data[0];
          const dsData = data[1];
          const appData = data[2];
          this.fieldsInfo = fieldsData

          /* if (usersData) {
            const userList: Array<SelectItem> = [];
            usersData.forEach(user => {
              userList.push({ label: user.user_name, value: user.user_id });
            });
            this.userList = userList;
          } else {
            this.userList = [];
          } */

          if (fieldsData) {
            const fields = fieldsData.filter(f => !f.as_title);
            this.controlArray = [];
            fields.forEach(f => {
              let value;
              switch (f.field_type) {
                case 'text':
                case 'textarea':
                case 'number':
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
                case 'lookup':
                  value = '';
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
                option_id: f.option_id,
                display_order: f.display_order,
                placeholder: `page.datastore.pleaseInput`,
                value: value
              };
              this.controlArray.push(control);
            });
          }

          if (appData && dsData) {
            const appType = appData.app_type;
            const dsApiKey = dsData.api_key;
            if (appType === 'rent' && dsApiKey === 'keiyakudaicho') {
              this.dsType = 'keiyaku';
            }
          }

          this.controlArray = _.orderBy(this.controlArray, ['display_order'], ['asc']);
        }
      });

    this.loading = false;
  }

  /**
   * @description: 取消处理
   */
  cancel() {
    this.location.back();
  }

  /**
   * @description: 图片切换
   */
  change(val) {
    if (val) {
      this.ots = val.ots;
      this.nts = val.nts;
    }
  }

  /**
   * @description: 提交处理
   */
  submit(value) {
    if (value) {
      this.save = true;
      this.message.success(this.i18n.translateLang('common.message.success.S_001'));
      this.event.cast('item:refresh');
      this.location.back();
    }
  }
}
