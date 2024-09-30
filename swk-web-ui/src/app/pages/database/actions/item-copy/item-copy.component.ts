/*
 * @Description: 数据拷贝新规控制器
 * @Author: RXC 廖云江
 * @Date: 2019-12-18 17:15:42
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-07-20 13:59:18
 */
import { format } from 'date-fns';
import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService, FieldService, FileService, UserService } from '@api';
import { CommonService, I18NService, SelectItem } from '@core';

@Component({
  selector: 'app-item-copy',
  templateUrl: './item-copy.component.html',
  styleUrls: ['./item-copy.component.less']
})
export class ItemCopyComponent implements OnInit {
  // 数据定义
  controlArray: any[] = [];
  fieldsInfo: any[] = [];
  userList = [];
  loading = false;

  save = false;
  ots: { [key: string]: any[] } = {};
  nts: { [key: string]: any[] } = {};

  fileUrlMap: { [key: string]: string } = {};
  fileUrls: string[] = [];

  // 构造函数
  constructor(
    private db: DatabaseService,
    public field: FieldService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private file: FileService,
    private location: Location,
    private i18n: I18NService,
    private common: CommonService,
    private message: NzMessageService
  ) { }

  async ngOnInit() {
    this.loading = true;
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const itemId = this.route.snapshot.paramMap.get('i_id');
    const jobs = [
      this.userService.getUsers({ invalid: 'true' }),
      this.field.getFields(datastoreId),
      this.db.getItem(datastoreId, itemId, 'true')
    ];

    await forkJoin(jobs)
      .toPromise()
      .then(async (data: any[]) => {
        if (data) {
          const usersData = data[0];
          const fieldsData = data[1];
          const itemData = data[2];
          this.fieldsInfo = fieldsData

          if (usersData) {
            const userList: Array<SelectItem> = [];
            usersData.forEach(user => {
              userList.push({ label: user.user_name, value: user.user_id });
            });
            this.userList = userList;
          } else {
            this.userList = [];
          }
          let fields = [];
          if (fieldsData) {
            fields = fieldsData.filter(f => !f.as_title);
          }

          let items = [];
          if (itemData) {
            items = itemData.items;
          }

          this.getFileUrls(fields, items);

          for (let index = 0; index < this.fileUrls.length; index++) {
            const url = this.fileUrls[index];
            await this.file.copyPublicDataFile(url).then((f: any) => {
              if (f) {
                this.fileUrlMap[url] = f.copy_file_name;
              }
            });
          }

          // 设置数据
          this.setItems(fields, items);
        }
      });

    this.loading = false;
  }

  /**
   * @description: 复制文件字段数据文件集合
   */
  getFileUrls(fields: any[], items: any) {
    this.fileUrls = [];
    if (fields && fields.filter(f => f.field_type === 'file').length > 0) {
      fields.forEach(f => {
        if (items.hasOwnProperty(f.field_id)) {
          if (f.field_type === 'file') {
            items[f.field_id].forEach((file: { url: string; name: string }) => {
              this.fileUrls = [...this.fileUrls, file.url];
            });
          }
        }
      });
    }
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
                  uid: this.fileUrlMap[file.url],
                  url: this.fileUrlMap[file.url],
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
            case 'autonum':
            case 'function':
              value = '';
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
              value: format(new Date(), 'yyyy-MM-dd') + ' ' + value
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
            is_check_image: f.is_check_image,
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
      this.message.success(this.i18n.translateLang('common.message.success.S_004'));
      const datastoreId = this.route.snapshot.paramMap.get('d_id');
      this.router.navigateByUrl(`/datastores/${datastoreId}/list`);
    }
  }
}
