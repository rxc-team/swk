/*
 * @Description: app formController
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-12-16 13:53:30
 */
import { format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService, BackupService, CustomerService, ValidationService } from '@api';
import { I18NService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-app-form',
  templateUrl: './app-form.component.html',
  styleUrls: ['./app-form.component.less']
})
export class AppFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private appService: AppService,
    private i18n: I18NService,
    private message: NzMessageService,
    private location: Location,
    private validation: ValidationService,
    private bs: BackupService,
    private router: Router,
    private event: NgEventBus,
    private customer: CustomerService,
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

    this.validateForm = this.fb.group({
      appName: [null, [Validators.required, NfValidators.validName], [this.appNameAsyncValidator]],
      templateId: [null, []],
      appStatus: [true, [Validators.required]],
      startTime: [null, [Validators.required, this.timeCompareValidator]],
      endTime: [null, [Validators.required]],
      shortLeases: ['12', []],
      minorBaseAmount: ['5000', []],
      kishuYm: ['', []],
      syoriYm: ['', []],
      setSpecial: ['', [NfValidators.validSpecial]],
      checkStartDate: [null, []]
    });
  }

  validateForm: FormGroup;
  domain = '';
  backupSelectData: any[] = [];

  // 判断迁移元用，默认是添加
  status = 'add';
  validatStatus = '';
  selectAppType = '';

  appStatusDisable = true;
  isSmall = false;

  /**
   * @description: 画面初期化処理
   */
  ngOnInit(): void {
    this.bs.getBackups().then((res: any[]) => {
      if (res) {
        this.backupSelectData = res;
      } else {
        this.backupSelectData = [];
      }
    });

    const appID = this.route.snapshot.paramMap.get('a_id');
    if (appID) {
      this.status = 'edit';
      this.getAppInfo();
    } else {
      this.appStatusDisable = false;
      this.selectAppType = 'check';
      const customerId = this.route.snapshot.paramMap.get('id');
      this.customer.getCustomerByID(customerId).then((data: any) => {
        if (data) {
          this.domain = data.domain;
        } else {
          this.domain = '';
        }
      });
    }
  }

  /**
   * @description: 应用情报取得
   */
  getAppInfo() {
    const db = this.route.snapshot.paramMap.get('id');
    const id = this.route.snapshot.paramMap.get('a_id');
    if (id) {
      this.appService.getAppByID(db, id).then(res => {
        this.domain = res.domain;
        this.validateForm.controls.appName.setValue(this.i18n.translateLang(res.app_name));
        this.validateForm.controls.templateId.setValue(res.template_id);
        this.validateForm.controls.appStatus.setValue(res.is_trial ? true : false);
        // 正式版不可变回试用
        if (res.is_trial) {
          this.appStatusDisable = false;
        }
        if (res.start_time) {
          this.validateForm.controls.startTime.setValue(new Date(res.start_time));
        }
        if (res.end_time) {
          this.validateForm.controls.endTime.setValue(new Date(res.end_time));
        }
      });
    }
  }

  /**
   * @description: パスワード更新確認
   */
  validateEndTime(): void {
    setTimeout(() => this.validateForm.controls.startTime.updateValueAndValidity());
  }

  /**
   * @description: 验证开始日期必须大于结束日期
   */
  timeCompareValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    if (!control.value || !this.validateForm.get('endTime').value) {
      return null;
    }

    const start = format(control.value, 'yyyy-MM-dd');
    const end = format(this.validateForm.get('endTime').value, 'yyyy-MM-dd');

    if (start && end) {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      if (startTime >= endTime) {
        this.validatStatus = 'error';
        return { error: true, compare: true };
      }
      this.validatStatus = '';
      return null;
    }
  };

  /**
   * @description: 应用名称唯一性检查
   */
  appNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const appID = this.route.snapshot.paramMap.get('a_id');
      this.validation.validationUnique('appName', control.value, { change_id: appID, domain: this.domain }).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 表单提交
   */
  async submitForm() {
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    const db = this.route.snapshot.paramMap.get('id');

    const template_id = this.validateForm.controls.templateId.value ? this.validateForm.controls.templateId.value : '';
    const params = {
      app_name: this.validateForm.controls.appName.value,
      domain: this.domain,
      database: db,
      template_id: template_id,
      is_trial: this.validateForm.controls.appStatus.value
    };
    if (template_id) {
      const backup = this.backupSelectData.find(b => b.backup_id === template_id);
      params['app_type'] = backup ? backup.app_type : '';
    }
    params['start_time'] = format(this.validateForm.controls.startTime.value, 'yyyy-MM-dd');
    params['end_time'] = format(this.validateForm.controls.endTime.value, 'yyyy-MM-dd');

    const id = this.route.snapshot.paramMap.get('a_id');
    if (id) {
      params['is_trial'] = this.validateForm.controls.appStatus.value.toString();
      this.appService.updateApp(id, params).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.event.cast('app:refresh');
        this.location.back();
      });
    } else {
      const configs = {};
      const minorBaseAmount = this.validateForm.controls.minorBaseAmount.value;
      const shortLeases = this.validateForm.controls.shortLeases.value;
      if (this.selectAppType === 'rent') {
        if (shortLeases) {
          configs['short_leases'] = shortLeases;
        } else {
          configs['short_leases'] = 12;
        }
        if (minorBaseAmount) {
          configs['minor_base_amount'] = minorBaseAmount;
        } else {
          configs['minor_base_amount'] = 5000;
        }

        configs['kishu_ym'] = this.validateForm.controls.kishuYm.value;
        configs['syori_ym'] = format(this.validateForm.controls.syoriYm.value, 'yyyy-MM');
        configs['special'] = this.validateForm.controls.setSpecial.value;
      } else {
        configs['special'] = this.validateForm.controls.setSpecial.value;
        configs['check_start_date'] = format(this.validateForm.controls.checkStartDate.value, 'yyyy-MM-dd');
      }
      params['configs'] = configs;
      if (!params['app_type']) {
        params['app_type'] = 'check';
      }

      this.appService.creatApp(params, configs).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.event.cast('app:refresh');
        this.location.back();
      });
    }
  }

  tplChange(v: string) {
    const backup = this.backupSelectData.find(b => b.backup_id === v);
    if (backup) {
      this.validateForm.controls.setSpecial.setValue('');
      if (backup.app_type == 'rent') {
        this.selectAppType = backup.app_type;
      } else {
        this.selectAppType = 'check';
      }
    } else {
      this.selectAppType = 'check';
    }

    // 租賃應用和非租賃應用項目控制
    if (this.selectAppType === 'rent') {
      this.validateForm.controls.kishuYm.setValidators([Validators.required]);
      this.validateForm.controls.syoriYm.setValidators([Validators.required]);
    } else {
      this.validateForm.controls.kishuYm.clearValidators();
      this.validateForm.controls.syoriYm.clearValidators();
    }
    // 刷新驗證
    this.validateForm.controls.kishuYm.updateValueAndValidity();
    this.validateForm.controls.syoriYm.updateValueAndValidity();
  }

  /**
   * @description: 重置表单事件
   */
  reset() {
    this.validateForm.reset();
    this.validatStatus = '';
    this.validateForm.controls.appStatus.setValue(true);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getAppInfo();
    }
  }

  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
  }
}
