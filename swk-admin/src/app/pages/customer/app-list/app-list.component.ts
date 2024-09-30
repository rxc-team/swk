import { addDays, differenceInCalendarDays, format, parse } from 'date-fns';
import * as _ from 'lodash';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { forkJoin } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NfValidators } from '../../../shared/validate/nf-validators';
import { Router } from '@angular/router';
import { ApproveService, AppService, DatastoreService, ItemService, LanguageService, WorkflowService } from '@api';
import { I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.less']
})
export class AppListComponent implements OnInit {
  cols = [
    {
      title: 'page.systemSetting.appName',
      width: '120px'
    },
    {
      title: 'page.systemSetting.copyFrom',
      width: '120px'
    },
    {
      title: 'common.text.createdDate',
      width: '150px'
    },
    {
      title: 'page.systemSetting.validPeriod',
      width: '250px'
    },
    {
      title: 'page.systemSetting.remark',
      width: '180px'
    },
    {
      title: 'page.systemSetting.action'
    }
  ];

  customerId = '';
  domain = '';

  listOfDataDisplay = [];
  customerSelectData = [];
  customerData = [];
  selectData = [];
  selectDataOfValid = [];
  selectDataOfInvalid = [];
  loading = false;
  seachForm: FormGroup;

  validateForm: FormGroup;
  showConfig = false;
  currentAppType = '';
  currentAppId = '';

  selectAll = false;
  currentAppStatus = '';

  today = new Date();
  startValue: Date | null = null;
  endValue: Date | null = null;
  backupSelectData: any[] = [];

  isSmall = false;
  isZoomFlg = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private appService: AppService,
    private modal: NzModalService,
    private i18n: I18NService,
    private tokenService: TokenStorageService,
    private as: ApproveService,
    private ws: WorkflowService,
    private ds: DatastoreService,
    private item: ItemService,
    private languageService: LanguageService,
    private bs: NzBreakpointService,
    private message: NzMessageService
  ) {
    this.seachForm = this.fb.group({
      appName: ['', []],
      domain: [null, []],
      invalidatedIn: [null, []],
      appStatus: ['', []],
      startTime: ['', []],
      endTime: ['', []]
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

  /**
   * @description: 画面初期化処理
   */
  ngOnInit() {
    this.validateForm = this.fb.group({
      shortLeases: ['', []],
      minorBaseAmount: ['', []],
      kishuYm: [{ value: '', disabled: true }, [Validators.required]],
      syoriYm: [{ value: '', disabled: true }, [Validators.required]],
      checkStartDate: ['', [Validators.required]],
      setSpecial: ['', [NfValidators.validSpecial]]
    });
    this.init();
  }

  async init() {
    const user = this.tokenService.getUser();
    this.customerId = user.customer_id;
    this.domain = user.domain;

    await this.search();
  }

  /**
   * @description: 应用一览数据取得
   */
  async search() {
    const params = {
      customerId: this.customerId,
      domain: this.domain
    };

    await this.appService.getApps(params).then((data: any) => {
      if (data) {
        data.forEach(a => {
          const valid_date = this.getValidDays(a.end_time);
          a.valid_date = valid_date;
        });
        this.listOfDataDisplay = data;
      } else {
        this.listOfDataDisplay = [];
      }
    });
    this.selectData = [];
  }

  /**
   * @description: 获取有效天数
   */
  getValidDays(endTime: string): number {
    const startDate = new Date();
    const endDateFomart = parse(endTime, 'yyyy-MM-dd', new Date());
    const endDateAdd = format(addDays(endDateFomart, 1), 'yyyy-MM-dd');
    const endDateValid = parse(endDateAdd, 'yyyy-MM-dd', new Date());
    return differenceInCalendarDays(endDateValid, startDate);
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
    this.listOfDataDisplay.forEach(f => {
      if (f.copy_from) {
        f.checked = event;
      }
    });
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);

    if (this.selectData.length === this.listOfDataDisplay.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 跳转到APP添加页面
   */
  foward() {
    this.router.navigate(['/customer/setting/copy']);
  }

  /**
   * @description: 跳转到APP添加页面
   */
  getAppName(appId: string) {
    const app = this.listOfDataDisplay.find(a => a.app_id === appId);
    if (app) {
      return app.app_name;
    }

    return '';
  }

  /**
   * @description: 彻底删除选择中应用
   */
  hardDeleteAll(): void {
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.app_id + '_' + d.domain);
    });

    this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selAppHardDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selAppHardDelContent')}`,
      nzOnOk: () =>
        this.appService.hardDeleteSelectApps(this.customerId, params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          await this.search();
        })
    });
  }

  /**
   * @description: 刷新
   */
  refresh() {
    this.init();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }

  /**
   * @description: 提交表单
   */

  async submitForm(): Promise<void> {

    if (this.currentAppType !== 'rent' && this.currentAppType !== 'check') {
      this.showConfig = false;
      return;
    }
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    const configs = {};
    const minorBaseAmount = this.validateForm.controls.minorBaseAmount.value;
    const shortLeases = this.validateForm.controls.shortLeases.value;
    if (this.currentAppType === 'rent') {
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
    } else {
      configs['check_start_date'] = format(this.validateForm.controls.checkStartDate.value, 'yyyy-MM-dd');
    }

    configs['special'] = this.validateForm.controls.setSpecial.value;

    // 更新app配置
    await this.appService.modifyAppConfigs(this.currentAppId, configs);

    this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    this.showConfig = false;

    if (this.currentAppType === 'check') {
      this.item.resetInventoryItems(this.currentAppId);
    }

  }

  /**
   * @description: 显示app参数设置模态框，获取app的config信息
   */
  async getAppConfigs(appid: string, appType: string): Promise<void> {
    this.showConfig = true;
    this.currentAppId = appid;
    this.currentAppType = appType;
    this.validateForm.reset();

    // 盘点app判断
    if (appType !== 'rent') {
      await this.ds.getDatastores({ appID: appid }).then((data: any[]) => {
        for (let index = 0; index < data.length; index++) {
          const element = data[index];
          if (element.can_check) {
            this.currentAppType = 'check';
            break;
          }
        }
      });
    }

    // 验证整理
    if (this.currentAppType === 'rent') {
      this.validateForm.controls.kishuYm.setValidators(Validators.required);
      this.validateForm.controls.syoriYm.setValidators(Validators.required);
      this.validateForm.controls.setSpecial.setValidators(NfValidators.validSpecial);
      this.validateForm.controls.checkStartDate.clearValidators();
    }
    if (this.currentAppType === 'check') {
      this.validateForm.controls.kishuYm.clearValidators();
      this.validateForm.controls.syoriYm.clearValidators();
      this.validateForm.controls.setSpecial.setValidators(NfValidators.validSpecial);
      this.validateForm.controls.checkStartDate.setValidators(Validators.required);
    }
    this.validateForm.controls.kishuYm.updateValueAndValidity();
    this.validateForm.controls.syoriYm.updateValueAndValidity();
    this.validateForm.controls.checkStartDate.updateValueAndValidity();
    this.validateForm.controls.setSpecial.updateValueAndValidity();

    // 当前参数取得和加载
    this.appService.getAppByID(appid, this.customerId).then((data: any) => {
      if (data && data.configs) {
        if (this.currentAppType === 'rent') {
          if (data.configs.short_leases) {
            this.validateForm.controls.shortLeases.setValue(data.configs.short_leases);
          }
          if (data.configs.minor_base_amount) {
            this.validateForm.controls.minorBaseAmount.setValue(data.configs.minor_base_amount);
          }
          if (data.configs.kishu_ym) {
            this.validateForm.controls.kishuYm.setValue(data.configs.kishu_ym);
          }
          if (data.configs.syori_ym) {
            this.validateForm.controls.syoriYm.setValue(data.configs.syori_ym);
          }
          if (data.configs.special) {
            this.validateForm.controls.setSpecial.setValue(data.configs.special);
          }
          return;
        }
        if (this.currentAppType === 'check') {
          if (data.configs.special) {
            this.validateForm.controls.setSpecial.setValue(data.configs.special);
          }
          if (data.configs.check_start_date != '' && data.configs.check_start_date != null) {
            this.validateForm.controls.checkStartDate.setValue(new Date(data.configs.check_start_date));
          }
        }
      }
    });

  }

  /**
   * @description: 下一月度相关处理
   */
  async nextMonth(): Promise<void> {
    let wfList = [];
    await this.ws.getWorkflows().then((data: any) => {
      if (data) {
        wfList = data;
      } else {
        wfList = [];
      }
    });

    const checkJobs = wfList.map(w => this.as.getItems({ wf_id: w.wf_id, status: '1' }));
    let hasError = false;
    await forkJoin(checkJobs)
      .toPromise()
      .then((data: any[]) => {
        if (data && data.length > 0) {
          data.forEach(d => {
            if (d && d.total && d.total > 0) {
              hasError = true;
            }
          });
        }
      });

    if (hasError) {
      this.message.warning(this.i18n.translateLang('common.message.warning.W_014'));
      return;
    }

    const syoriYm = this.validateForm.controls.syoriYm.value;
    const oldDate = new Date(syoriYm);
    const newDate = oldDate.setMonth(oldDate.getMonth() + 1);
    const value = format(newDate, 'yyyy-MM');

    this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.nextMonthTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.nextMonthContent')}`,
      nzOnOk: () =>
        // 通过调用服务
        this.appService.nextMonth(this.currentAppId, value).then((data: any[]) => {
          this.validateForm.controls.syoriYm.setValue(value);
          this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        })
    });
  }
}
