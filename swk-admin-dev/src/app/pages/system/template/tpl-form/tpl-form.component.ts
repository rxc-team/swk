/*
 * @Description: 模板Controller
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-08-25 16:31:38
 */
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService, BackupService, CustomerService } from '@api';
import { I18NService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-tpl-form',
  templateUrl: './tpl-form.component.html',
  styleUrls: ['./tpl-form.component.less']
})
export class TplFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private router: Router,
    private cs: CustomerService,
    private as: AppService,
    private bs: BackupService,
    private location: Location,
    private event: NgEventBus,
    private message: NzMessageService,
    private bps: NzBreakpointService
  ) {
    bps
      .subscribe({
        xs: '480px',
        sm: '768px',
        md: '992px',
        lg: '1200px',
        xl: '1600px',
        xxl: '1600px'
      })
      .subscribe(data => {
        if (data === 'sm' || data === 'xs') {
          this.isSmall = true;
        } else {
          this.isSmall = false;
        }
      });
    this.form = this.fb.group({
      backupName: ['', [Validators.required], [this.backupNameAsyncValidator]],
      customerId: ['', [Validators.required]],
      appId: ['', [Validators.required]],
      appType: ['', []],
      hasData: [false, []]
    });
  }

  form: FormGroup;

  // 判断迁移元用，默认是添加
  status = 'add';
  disable = true;
  customerSelect = [];
  appSelect = [];
  isSmall = false;

  appTypeSelect = [
    {
      label: 'page.template.check',
      value: ''
    },
    {
      label: 'page.template.rent',
      value: 'rent'
    }
  ];

  /**
   * @description: 画面初期化処理
   */
  async ngOnInit() {
    await this.init();
    const backupId = this.route.snapshot.paramMap.get('id');
    if (backupId) {
      this.status = 'edit';
      this.getBackupInfo(backupId);
    }
  }

  async init() {
    await this.cs.getCustomers().then((data: any[]) => {
      if (data) {
        this.customerSelect = data;
      } else {
        this.customerSelect = [];
      }
    });
  }

  change(id: string) {
    // 重置app选项
    this.form.controls.appId.reset();
    // 获取app列表数据
    this.as
      .getApps({ customerId: id })
      .then((data: any[]) => {
        if (data) {
          this.appSelect = data;
        } else {
          this.appSelect = [];
        }
      })
      .finally(() => {
        this.disable = false;
      });
  }

  /**
   * @description: 模板情报取得
   */
  getBackupInfo(id: string) {
    this.bs.getBackupById(id).then((data: any) => {
      if (data) {
        this.form.controls.backupName.setValue(data.backup_name);
        this.form.controls.customerId.setValue(data.customer_id);
        this.form.controls.appId.setValue(data.app_id);
        this.form.controls.appType.setValue(data.app_type);
        this.form.controls.hasData.setValue(data.has_data);
      }
    });
  }

  /**
   * @description: 提交表单
   */
  async submitForm() {
    const params = {
      backup_name: this.form.controls.backupName.value,
      customer_id: this.form.controls.customerId.value,
      app_id: this.form.controls.appId.value,
      app_type: this.form.controls.appType.value,
      has_data: this.form.controls.hasData.value,
      backup_type: 'template'
    };

    await this.bs.addBackup(params).then(() => {
      this.message.success(this.i18n.translateLang('common.message.success.S_001'));
    });
    this.event.cast('tpl:refresh');
    this.location.back();
  }

  /**
   * @description: 模板名称唯一性检查
   */
  backupNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const id = this.route.snapshot.paramMap.get('id');
      this.bs.backupNameAsyncValidator({ backupName: control.value }).then((data: boolean) => {
        if (!data) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 重置表单事件
   */
  reset() {
    this.form.reset();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getBackupInfo(id);
    }
  }

  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
  }
}
