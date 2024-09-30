import { format } from 'date-fns';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService, CustomerService, ValidationService } from '@api';
import { I18NService, TokenStorageService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-app-copy',
  templateUrl: './app-copy.component.html',
  styleUrls: ['./app-copy.component.less']
})
export class AppCopyComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private appService: AppService,
    private i18n: I18NService,
    private message: NzMessageService,
    private tokenService: TokenStorageService,
    private location: Location,
    private validation: ValidationService,
    private router: Router,
    private bs: NzBreakpointService,
    private customer: CustomerService
  ) {
    this.validateForm = this.fb.group({
      appName: [null, [Validators.required, NfValidators.validName], [this.appNameAsyncValidator]],
      copyFrom: [null, [Validators.required], [this.copyFromAsyncValidator]],
      followApp: [null, [Validators.required]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      remarks: [null, []],
      shortLeases: ['12', []],
      minorBaseAmount: ['5000', []],
      kishuYm: ['', [Validators.required]],
      syoriYm: ['', [Validators.required]],
      setSpecial: ['', [NfValidators.validSpecial]],
      checkStartDate: [null, []],
      withData: [false, []],
      withFile: [false, []]
    });

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

  customerId = '';
  domain = '';
  isSmall = false;
  validateForm: FormGroup;
  appSelectData: any[] = [];
  selectAppType = '';
  uniqueFields: any[] = [];
  followApp = 'false';

  /**
   * @description: 画面初期化処理
   */
  ngOnInit(): void {
    const user = this.tokenService.getUser();
    this.customerId = user.customer_id;
    this.domain = user.domain;
    this.validateForm.controls.startTime.setValue(new Date());
    this.validateForm.controls.startTime.markAsDirty();
    this.validateForm.controls.followApp.disable();
    this.validateForm.controls.withFile.disable();

    this.appService.getApps({ customerId: this.customerId, domain: this.domain }).then((data: any) => {
      if (data) {
        this.appSelectData = data;
      } else {
        this.appSelectData = [];
      }
    });
  }

  /**
   * @description: 刷新验证
   */
  validateEndTime(): void {
    setTimeout(() => this.validateForm.controls.startTime.updateValueAndValidity());
  }
  /**
   * @description: 更改使用时间
   */
  changeTime(value: any): void {
    var copyAppID = this.validateForm.get('copyFrom').value;
    this.followApp = value;
    if (copyAppID) {
      var app: any;
      app = this.appSelectData.find(a => a.app_id === copyAppID);
      if (value === 'true') {
        this.validateForm.controls.endTime.setValue(app.end_time);
      } else {
        var now = new Date();
        var newEndTime = now.setDate(now.getDate() + 30);
        var oldEndTime = new Date(app.end_time).getTime();
        if (newEndTime > oldEndTime) {
          this.validateForm.controls.endTime.setValue(app.end_time);
        } else {
          this.validateForm.controls.endTime.setValue(format(newEndTime, 'yyyy-MM-dd'));
        }
      }
    }
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
        return { compare: true };
      }

      return null;
    }
  };

  /**
   * @description: 应用名称唯一性检查
   */
  appNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.validation.validationUnique('appName', control.value).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 应用下属唯一性字段数值空值重复检查
   */
  copyFromAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.validation.valueUniqueValidation(control.value).then((res: string[]) => {
        if (res && res.length) {
          this.uniqueFields = [];
          res.forEach(r => {
            const infos = r.split('.');
            if (infos.length === 4) {
              const appId = infos[0];
              const datastoreId = infos[1];
              const fieldId = infos[2];
              const num = infos[3];
              const datastoreName = 'apps.' + appId + '.datastores.' + datastoreId;
              const fieldName = 'apps.' + appId + '.fields.' + datastoreId + '_' + fieldId;

              this.uniqueFields = [
                ...this.uniqueFields,
                {
                  datastore_name: datastoreName,
                  field_name: fieldName,
                  num: num
                }
              ];
            }
          });
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
    }
    if (this.selectAppType === 'check') {
      configs['check_start_date'] = format(this.validateForm.controls.checkStartDate.value, 'yyyy-MM-dd');
    }

    configs['special'] = this.validateForm.controls.setSpecial.value;

    const params = {
      app_name: this.validateForm.controls.appName.value,
      domain: this.domain,
      database: this.customerId,
      copy_from: this.validateForm.controls.copyFrom.value,
      app_type: this.selectAppType,
      remarks: this.validateForm.controls.remarks.value,
      with_data: this.validateForm.controls.withData.value,
      with_file: this.validateForm.controls.withFile.value,
      configs: configs
    };
    params['follow_app'] = this.followApp;
    params['start_time'] = format(this.validateForm.controls.startTime.value, 'yyyy-MM-dd');
    params['end_time'] = this.validateForm.controls.endTime.value;
    if (this.followApp == 'true') {
      var selectApp = this.appSelectData.find(data => data.app_id == params.copy_from);
      params['is_trial'] = selectApp.is_trial;
    } else {
      params['is_trial'] = true;
    }

    this.appService.creatApp(params).then(async () => {
      this.message.success(this.i18n.translateLang('common.message.success.S_001'));
      this.location.back();
    });
  }

  /**
   * @description: 重置表单事件
   */
  reset() {
    this.validateForm.reset();
  }
  /**
   * @description: 携带数据变化
   */
  change(value: boolean) {
    if (value) {
      this.validateForm.controls.withFile.enable();
    } else {
      this.validateForm.controls.withFile.setValue(false);
      this.validateForm.controls.withFile.disable();
    }
  }
  /**
   * @description: app 复制源变化
   */
  appChange(appId: string) {
    this.validateForm.controls.kishuYm.setValidators([]);
    this.validateForm.controls.syoriYm.setValidators([]);
    this.validateForm.controls.kishuYm.reset();
    this.validateForm.controls.syoriYm.reset();
    if (appId) {
      const app = this.appSelectData.find(a => a.app_id === appId);
      this.validateForm.controls.followApp.enable();
      if (app.configs.special) {
        this.validateForm.controls.setSpecial.setValue(app.configs.special);
      }
      this.validateForm.controls.withData.setValue(false);
      this.change(false);
      this.validateForm.controls.followApp.setValue('false');
      this.changeTime('false');
      if (app.app_type) {
        this.selectAppType = app.app_type;
      } else {
        this.selectAppType = 'check';
      }
      if (this.selectAppType === 'rent') {
        this.validateForm.controls.kishuYm.setValidators([Validators.required]);
        this.validateForm.controls.syoriYm.setValidators([Validators.required]);
        if (app.configs.syori_ym) {
          this.validateForm.controls.syoriYm.setValue(new Date(app.configs.syori_ym));
        }
        if (app.configs.kishu_ym) {
          this.validateForm.controls.kishuYm.setValue(app.configs.kishu_ym);
        }
      }
      if (this.selectAppType === 'check') {
        if (app.configs.check_start_date) {
          this.validateForm.controls.checkStartDate.setValue(new Date(app.configs.check_start_date));
        }
      }
    } else {
      this.validateForm.controls.withData.setValue(false);
      this.change(false);
      this.selectAppType = '';
      this.validateForm.controls.followApp.disable();
    }
  }

  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
  }
}
