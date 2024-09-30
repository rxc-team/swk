import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatastoreService, FieldService, ValidationService } from '@api';
import { I18NService } from '@core';

export interface Item {
  datastore_id: string;
  field_id: string;
  field_type: string;
  value: string;
  status?: string;
}

@Component({
  selector: 'app-generate-master-setting',
  templateUrl: './generate-master-setting.component.html',
  styleUrls: ['./generate-master-setting.component.less']
})
export class GenerateMasterSettingComponent implements OnInit {
  @Input() lookupDatastoreId = '';
  @Input() lookupFieldId = '';
  @Input() disabled = false;

  detailCols = [
    {
      title: 'page.option.optionSubName',
      width: '200px'
    },
    {
      title: 'page.option.optionValue',
      width: '180px'
    },
    {
      title: 'page.option.operate'
    }
  ];

  datastores = [];
  fields = [];

  // 新规表单
  form: FormGroup;
  // 是否添加新的选项组
  isSmall = false;

  // 构造函数
  constructor(
    private fs: FieldService,
    private ds: DatastoreService,
    private fb: FormBuilder,
    private location: Location,
    private event: NgEventBus,
    private i18n: I18NService,
    private vs: ValidationService,
    private modal: NzModalService,
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

  /**
   * @description: 画面初始化
   */
  ngOnInit() {
    this.form = this.fb.group({
      lookupDatastoreId: [null, [Validators.required]],
      lookupFieldId: [null, [Validators.required]]
    });

    this.init();
  }

  /**
   * @description: 初始化处理
   */
  async init() {
    await this.ds.getDatastores().then(data => {
      if (data) {
        this.datastores = data;
      } else {
        this.datastores = [];
      }
    });

    if (this.lookupDatastoreId) {
      this.getForm('lookupDatastoreId').setValue(this.lookupDatastoreId);
    }
    if (this.lookupFieldId) {
      this.getForm('lookupFieldId').setValue(this.lookupFieldId);
    }

    if (this.disabled) {
      this.form.disable();
    }
  }

  getForm(formName: string) {
    return this.form.controls[formName];
  }

  /**
   * 生成随机的 UUID
   */
  genUUID(randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now())
      .toString(36)
      .substring(0, 3);
  }

  /**
   * @description: 取消选项添加，返回上级
   */
  cancel() {
    this.location.back();
  }

  /**
   * @description: 调用服务改变datastore
   */
  async datastoreChange(datastoreId: string) {
    if (datastoreId) {
      await this.fs.getFields(datastoreId).then((data: any[]) => {
        if (data) {
          this.fields = data.filter(f => f.field_type === 'text' && !f.as_title && f.is_required);
          this.form.controls.lookupFieldId.reset();
        } else {
          this.fields = [];
          this.form.controls.lookupFieldId.reset();
        }
      });
    }
  }
}
