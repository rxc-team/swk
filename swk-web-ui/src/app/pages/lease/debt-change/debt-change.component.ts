import { addMonths, format, getDaysInMonth, setDate } from 'date-fns';
import { toInteger } from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { forkJoin, Observable, Observer } from 'rxjs';

import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppService, DatabaseService, DatastoreService, ItemService, OptionService, UserService, ValidationService } from '@api';
import { FileUtilService, I18NService, TokenStorageService } from '@core';

interface Field {
  field_id: string;
  field_type: string;
  is_required: boolean;
  unique: boolean;
  label: string;
  minLength: number;
  maxLength: number;
  minValue: number;
  maxValue: number;
  precision: number;
  lookup_app_id: string;
  lookup_datastore_id: string;
  lookup_field_id: string;
  user_group_id: string;
  is_image: boolean;
  option_id: string;
  display_order: number;
  placeholder: string;
  disabled: boolean;
  value: any;
}

interface Payment {
  leasekaishacd?: any;
  keiyakuno?: string;
  paymentcount?: number;
  paymentType?: string;
  paymentymd?: string;
  paymentleasefee?: number;
  paymentleasefeehendo?: number;
  incentives?: number;
  sonotafee?: number;
  kaiyakuson?: number;
  fixed?: boolean;
  infixed?: boolean;
}

interface Lease {
  no?: number;
  interest?: number;
  repayment?: number;
  balance?: number;
  present?: number;
  paymentymd?: string;
  leasekaishacd?: any;
  keiyakuno?: string;
}
interface RePayment {
  no?: number;
  boka?: number;
  endboka?: number;
  rhensai?: number;
  rrisoku?: number;
  syokyaku?: number;
  syokyakuymd?: string;
  leasekaishacd?: any;
  keiyakuno?: string;
}
interface DebtCanChangeParam {
  paymentcounts: number;
  rishiritsu: number;
  leasekikan: number;
  residualValue: number;
  extentionOption: number;
  optionToPurchase: number;
  percentage: number;
  kaiyakuymd: string;
  henkouymd: string;
}

@Component({
  selector: 'app-debt-change',
  templateUrl: './debt-change.component.html',
  styleUrls: ['./debt-change.component.less']
})
export class DebtChangeComponent implements OnInit {
  @Input() controlArray: any[] = [];
  @Input() userList: any[];

  @Output() nxSubmit: EventEmitter<any> = new EventEmitter();
  @Output() nxCancel: EventEmitter<any> = new EventEmitter();

  form: FormGroup;
  // 字段属性
  fieldMap: Map<string, Field> = new Map();
  // 其他字段，不在契约默认自动内的
  otherControls: any[] = [];

  // look台账显示
  isVisible = false;
  lookupDatastoreId: string;
  lookField = '';
  lookRealtionFields = {};
  relations = [];
  previewImage: string | undefined = '';
  previewVisible = false;
  userOptions: { [key: string]: any[] } = {};
  options: { [key: string]: any[] } = {};
  selectControl: Field;
  lookupItem: any;
  loading = false;
  computeVisible = false;
  payLoading = false;

  // 分页使用-当前页
  paymentPageIndex = 1;
  // 分页使用-每页显示条数
  paymentPageSize = 50;
  // 分页使用-总的条数
  paymentTotal = 1;
  // 分页使用-当前页
  repaymentPageIndex = 1;
  // 分页使用-每页显示条数
  repaymentPageSize = 50;
  // 分页使用-总的条数
  repaymentTotal = 1;
  // 处理月度
  handleMonth = '';
  // 期首年月
  kishuym = '';
  // 最新的变更时间
  lastHenkouymd = '';

  // 支付数据
  payData: Payment[] = [];
  repayData: RePayment[] = [];
  leaseData: Lease[] = [];
  // 临时数据生成的ID
  templateId = '';
  paymentDatastore = '';
  computeResult;

  initParam: DebtCanChangeParam;
  payDataBk: Payment[] = [];

  scroll = { x: '1150px', y: '300px' };

  constructor(
    private fb: FormBuilder,
    private fileUtil: FileUtilService,
    private message: NzMessageService,
    private tokenService: TokenStorageService,
    public item: ItemService,
    public dbs: DatabaseService,
    public ds: DatastoreService,
    private validation: ValidationService,
    private appService: AppService,
    private http: HttpClient,
    private i18n: I18NService,
    private user: UserService,
    private option: OptionService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({});
  }

  async ngOnInit() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    this.ds.getDatastoreByID(datastoreId).then(data => {
      if (data) {
        this.relations = data.relations;
      }
    });

    this.controlArray.forEach(control => {
      switch (control.field_id) {
        case 'keiyakuno':
        case 'leasekaishacd':
        case 'keiyakuymd':
        case 'leasestymd':
        case 'bunruicd':
        case 'keiyakunm':
        case 'shisannm':
        case 'segmentcd':
        case 'torihikikbn':
        case 'paymentstymd':
        case 'paymentcycle':
        case 'paymentday':
        case 'paymentleasefee':
        case 'assetlife':
          // 必须字段
          control.is_required = true;
          control.disabled = true;
          break;
        case 'paymentcounts':
        case 'rishiritsu':
        case 'leasekikan':
        case 'henkouymd':
        case 'percentage':
          // 必须字段
          control.is_required = true;
          control.disabled = false;
          break;
        case 'residualValue':
        case 'extentionOption':
        case 'optionToPurchase':
        case 'kaiyakuymd':
          // 其他租赁相关字段
          control.is_required = false;
          control.disabled = false;
          break;
        case 'locationcd':
        case 'locationhosoku':
        case 'ky_niniLd02cd':
        case 'ky_niniLd03cd':
        case 'biko1':
        case 'biko2':
        case 'paymentsAtOrPrior':
        case 'incentivesAtOrPrior':
        case 'initialDirectCosts':
        case 'restorationCosts':
        case 'usecancellationoption':
        case 'cancellationrightoption':
        case 'status': // 状态不显示
        case 'actkbn': // 操作不显示
        case 'expiresyokyakukbn': // リース満了償却区分不显示
        case 'leaseexpireymd': // 租赁满了日不显示
        case 'lease_type': // 租赁类型不显示
        case 'kaiyakusongaikin':
          // 其他租赁相关字段
          control.is_required = false;
          control.disabled = true;
          break;
        default:
          control.disabled = true;
          this.otherControls.push(control);
          break;
      }

      this.fieldMap.set(control.field_id, control);

      const validators: ValidatorFn[] = [];
      const asyncValidators: AsyncValidatorFn[] = [];
      // 添加必须check
      if (control.is_required) {
        validators.push(Validators.required);
      }

      if (control.field_id === 'henkouymd') {
        this.lastHenkouymd = control.value;
        const ctl = new FormControl(
          { value: null, disabled: control.disabled },
          { validators: validators, asyncValidators: asyncValidators }
        );
        this.form.addControl(control.field_id, ctl);
      } else if (control.field_id === 'kaiyakuymd') {
        const ctl = new FormControl(
          { value: null, disabled: control.disabled },
          { validators: validators, asyncValidators: asyncValidators }
        );
        this.form.addControl(control.field_id, ctl);
      } else {
        const ctl = new FormControl(
          { value: control.value, disabled: control.disabled },
          { validators: validators, asyncValidators: asyncValidators }
        );
        this.form.addControl(control.field_id, ctl);

        if (control.field_id === 'percentage') {
          this.form.get('percentage').setValue(1);
        }

        if (control.field_id === 'residualValue') {
          this.residualValueChange(control.value);
        }
        if (control.field_id === 'extentionOption') {
          this.optionToPurchaseChange(control.value);
        }

        if (control.field_type === 'options') {
          this.option.getOptionsByCode(control.option_id, 'true').then(res => {
            this.options[control.option_id] = res;
          });
        }

        if (control.field_type === 'user') {
          this.user.getRelatedUsers(control.user_group_id, 'true').then((users: any[]) => {
            this.userOptions[control.user_group_id] = users;
          });
        }
      }

      /* if (control.field_type === 'text' || control.field_type === 'textarea') {
        asyncValidators.push(this.validSpecialChar);
        setTimeout(() => {
          this.form.get(control.field_id).addAsyncValidators(asyncValidators);
        }, 1000);
      } */
    });

    const us = this.tokenService.getUser();
    const currentApp = us.current_app;
    const db = us.customer_id;

    const jobs = [this.appService.getAppByID(currentApp, db), this.ds.getDatastoreByKey('paymentStatus')];

    await forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const appData = data[0];
          const dsData = data[1];

          if (appData && appData.configs.syori_ym) {
            this.handleMonth = format(new Date(appData.configs.syori_ym), 'yyyy-MM');
          } else {
            this.handleMonth = '';
          }

          if (appData && appData.configs.kishu_ym) {
            this.kishuym = appData.configs.kishu_ym;
          } else {
            this.kishuym = '';
          }

          if (dsData) {
            this.paymentDatastore = dsData.datastore_id;
          } else {
            this.paymentDatastore = '';
          }
        }
      });

    this.payLoading = true;

    if (this.paymentDatastore) {
      // 获取支付数据
      const params = {
        condition_list: [
          {
            field_id: 'keiyakuno',
            field_type: 'lookup',
            search_value: this.form.get('keiyakuno').value,
            operator: '=',
            is_dynamic: true,
            condition_type: ''
          }
        ],
        condition_type: 'and',
        page_index: 1,
        page_size: 0,
        sorts: [
          {
            sort_key: 'paymentymd',
            sort_value: 'ascend'
          }
        ]
      };
      await this.dbs.getItems(this.paymentDatastore, params).then(data => {
        if (data && data.items_list) {
          data.items_list.forEach(it => {
            const pay: Payment = {
              paymentcount: Number(it.items['paymentcount'].value),
              paymentType: it.items['paymentType'].value,
              paymentymd: it.items['paymentymd'].value,
              paymentleasefee: Number(it.items['paymentleasefee'].value),
              paymentleasefeehendo: Number(it.items['paymentleasefeehendo'].value),
              incentives: Number(it.items['incentives'].value),
              sonotafee: Number(it.items['sonotafee'].value),
              kaiyakuson: Number(it.items['kaiyakuson'].value)
            };

            const paymentymd = new Date(pay.paymentymd);
            const payYm = format(paymentymd, 'yyyy-MM');

            if (this.lastHenkouymd) {
              const henkouymd = format(new Date(this.lastHenkouymd), 'yyyy-MM');
              if (payYm <= henkouymd) {
                pay.infixed = true;
              }
            }

            if (payYm <= this.handleMonth) {
              pay.fixed = true;
            }

            if (pay.paymentType !== '支払') {
              pay.fixed = true;
            }

            this.payData = [...this.payData, pay];
          });
        }
      });
    }

    this.payDataBk = this.payData;
    this.payLoading = false;

    this.initParam = {
      paymentcounts: this.form.get('paymentcounts').value,
      rishiritsu: this.form.get('rishiritsu').value,
      leasekikan: this.form.get('leasekikan').value,
      residualValue: this.form.get('residualValue').value,
      extentionOption: this.form.get('extentionOption').value,
      optionToPurchase: this.form.get('optionToPurchase').value,
      percentage: this.form.get('percentage').value,
      kaiyakuymd: this.form.get('kaiyakuymd').value,
      henkouymd: this.form.get('henkouymd').value
    };
  }

  noblur() {
    /* this.controlArray.forEach(element => {
      this.validation.validSpecialChar(JSON.stringify(this.form.get(element.field_id).value)).then((res: boolean) => {
        const control = this.form.get(element.field_id);

        // 在控制器上添加一个自定义验证器
        control.setValidators((control: AbstractControl) => {
          if (!res) {
            // 返回一个错误对象
            return { unvalidSpecial: true };
          }
          // 如果满足条件，返回 null 表示验证通过
          return null;
        });

        // 更新控制器的验证状态
        control.updateValueAndValidity();
      });
    }); */
  }

  /**
   * @description: 特殊字符check
   */
  /* validSpecialChar = (control: FormControl) => {
    return new Observable((observer: Observer<ValidationErrors | null>) => {
      this.validation.validSpecialChar(control.value).then((res: boolean) => {
        if (res) {
          observer.next(null);
        } else {
          observer.next({ error: true, unvalidSpecial: true });
        }
        observer.complete();
      });
    });
  }; */

  addLine(index: number) {
    const preData = this.payData.slice(0, index + 1);
    const sufData = this.payData.slice(index + 1, this.payData.length);
    sufData.forEach(d => {
      d.paymentcount++;
    });
    const newLine = JSON.parse(JSON.stringify(this.payData[index]));
    newLine.paymentcount++;
    this.payData = [...preData, newLine, ...sufData];
  }

  removeLine(index: number) {
    const preData = this.payData.slice(0, index);
    const sufData = this.payData.slice(index + 1, this.payData.length);
    sufData.forEach(d => {
      d.paymentcount--;
    });
    this.payData = [...preData, ...sufData];
  }

  disabledDateK = (d: Date) => {
    const ym = format(d, 'yyyy-MM');
    const ymd = format(d, 'yyyy-MM-dd');
    // 处理月度(不含) ~ 满了
    if (ym <= this.handleMonth) {
      return true;
    }
    const expireymd = format(this.form.controls.leaseexpireymd.value, 'yyyy-MM-dd');
    if (ymd > expireymd) {
      return true;
    }
  };

  disabledDate = (d: Date) => {
    const ym = format(d, 'yyyy-MM');
    const ymd = format(d, 'yyyy-MM-dd');
    // 变更后日期
    const changeym = format(new Date(this.lastHenkouymd), 'yyyy-MM');
    // 当前期首的月份>处理年月的月份时，取上一年的期首日期
    let kishuym = '';
    if (this.handleMonth.length === 7) {
      const handleM = this.handleMonth.substring(5);
      const handleY = this.handleMonth.substring(0, 4);
      if ('0' + this.kishuym > handleM) {
        kishuym = toInteger(handleY) - 1 + '-0' + this.kishuym;
      } else {
        kishuym = handleY + '-0' + this.kishuym;
      }
    }
    // 变更年月日不能在租赁开始年月日之前
    const leasestymd = format(this.form.controls.leasestymd.value, 'yyyy-MM-dd');
    if (ymd < leasestymd) {
      return true;
    }
    // 变更年月日不能在租赁满了年月日之后
    const expireymd = format(this.form.controls.leaseexpireymd.value, 'yyyy-MM-dd');
    if (ymd > expireymd) {
      return true;
    }

    if (this.lastHenkouymd) {
      // 2.已经变更过了的，在变更过后的日期小于期首  当前期首之后~处理年月
      if (changeym < kishuym) {
        if (ym < kishuym) {
          return true;
        }
        if (ym > this.handleMonth) {
          return true;
        }
        return false;
      }
      // 3.在变更过后的日期大于期首 变更过后的日期 ~处理年月
      if (changeym > kishuym) {
        const changeymd = format(new Date(this.lastHenkouymd), 'yyyy-MM-dd');
        const cymd = format(d, 'yyyy-MM-dd');
        if (cymd < changeymd) {
          return true;
        }
        if (ym > this.handleMonth) {
          return true;
        }
        return false;
      }
    } else {
      // 1.当前期首之后~处理年月
      if (ym < kishuym) {
        return true;
      }
      if (ym > this.handleMonth) {
        return true;
      }
      return false;
    }
  };

  async generateTable() {
    this.payLoading = true;
    this.payData = [];

    // 重新检索支付数据
    const params = {
      condition_list: [
        {
          field_id: 'keiyakuno',
          field_type: 'lookup',
          search_value: this.form.get('keiyakuno').value,
          operator: '=',
          is_dynamic: true,
          condition_type: ''
        }
      ],
      condition_type: 'and',
      page_index: 1,
      page_size: 0,
      sorts: [
        {
          sort_key: 'paymentymd',
          sort_value: 'ascend'
        }
      ]
    };
    await this.dbs.getItems(this.paymentDatastore, params).then(data => {
      if (data && data.items_list) {
        data.items_list.forEach(it => {
          const pay: Payment = {
            paymentcount: Number(it.items['paymentcount'].value),
            paymentType: it.items['paymentType'].value,
            paymentymd: it.items['paymentymd'].value,
            paymentleasefee: Number(it.items['paymentleasefee'].value),
            paymentleasefeehendo: Number(it.items['paymentleasefeehendo'].value),
            incentives: Number(it.items['incentives'].value),
            sonotafee: Number(it.items['sonotafee'].value),
            kaiyakuson: Number(it.items['kaiyakuson'].value)
          };

          const paymentymd = new Date(pay.paymentymd);
          const payYm = format(paymentymd, 'yyyy-MM');
          const henkouymd = format(this.form.get('henkouymd').value, 'yyyy-MM');

          if (payYm <= henkouymd) {
            pay.infixed = true;
          }

          if (payYm <= this.handleMonth) {
            pay.fixed = true;
          }

          if (pay.paymentType !== '支払') {
            pay.fixed = true;
          }

          this.payData = [...this.payData, pay];
        });
      }
    });
    this.payLoading = false;

    // 支払サイクル
    const paymentcycle = this.form.get('paymentcycle').value || 0;
    // 支払回数
    const paymentcounts = this.form.get('paymentcounts').value || 0;
    // 支付情报参数-- 支付日
    const paymentday = this.form.get('paymentday').value || 31;
    // 残价保证额
    const residualValue = this.form.get('residualValue').value || 0;
    // 購入オプション行使価額
    const optionToPurchase = this.form.get('optionToPurchase').value || 0;

    // 取不能变更的支付回数
    let fixedCount = 0;

    this.payData.forEach(p => {
      if (p.paymentymd.slice(0, 7) < this.handleMonth) {
        fixedCount++;
      }
    });
    // 当支付回数小于固定周期的场合
    if (paymentcounts < fixedCount) {
      this.message.error(this.i18n.translateLang('page.datastore.contract.countPaymentsIllegal'));
      return;
    }

    if (residualValue > 0) {
      // 先删除可能的購入オプション行使価額
      const opay: Payment = this.payData.find(p => p.paymentType === '購入オプション行使価額');
      if (opay) {
        this.payData = this.payData.slice(0, this.payData.length - 1);
      }

      // 最后一次的支付日
      let paymentDate = new Date(this.payData[this.payData.length - 1].paymentymd);

      let pay: Payment = this.payData.find(p => p.paymentType === '残価保証額');
      if (pay) {
        pay.paymentleasefee = residualValue;
      } else {
        // 支付月份加上周期
        paymentDate = addMonths(paymentDate, paymentcycle);

        // 获取该月份的最后一天
        const lastDay = getDaysInMonth(paymentDate);
        // 判断指定的支付日是否大于最后一天
        if (paymentday > lastDay) {
          paymentDate = setDate(paymentDate, lastDay);
        } else {
          paymentDate = setDate(paymentDate, paymentday);
        }

        pay = {};
        // 支付回数
        pay.paymentcount = this.payData.length + 1;
        // 支付金额
        pay.paymentleasefee = residualValue;
        // 支付年月
        pay.paymentymd = format(paymentDate, 'yyyy-MM-dd');
        // 其他设置
        pay.paymentleasefeehendo = 0;
        pay.incentives = 0;
        pay.sonotafee = 0;
        pay.kaiyakuson = 0;
        pay.paymentType = '残価保証額';
        pay.fixed = true;

        this.payData = [...this.payData, pay];
      }

      if (paymentcounts !== this.payData.length - 1) {
        // 先去掉残価保証額
        this.payData = this.payData.slice(0, this.payData.length - 1);
        const diff = paymentcounts - this.payData.length;
        if (diff > 0) {
          // 倒数第一次的支付数据
          const lastData = this.payData[this.payData.length - 1];
          let paymentsDate = new Date(lastData.paymentymd);

          // 支付月份加上周期
          paymentsDate = addMonths(paymentsDate, paymentcycle);

          // 获取该月份的最后一天
          const lastDay = getDaysInMonth(paymentsDate);
          // 判断指定的支付日是否大于最后一天
          if (paymentday > lastDay) {
            paymentsDate = setDate(paymentsDate, lastDay);
          } else {
            paymentsDate = setDate(paymentsDate, paymentday);
          }

          for (let i = 0; i < diff; i++) {
            const p: Payment = {};
            // 支付回数
            p.paymentcount = this.payData.length + 1;
            // 支付金额
            p.paymentleasefee = lastData.paymentleasefee;
            // 支付年月
            p.paymentymd = format(paymentsDate, 'yyyy-MM-dd');
            // 其他设置
            p.paymentleasefeehendo = 0;
            p.incentives = 0;
            p.sonotafee = 0;
            p.kaiyakuson = 0;
            p.paymentType = '支払';
            p.fixed = false;

            this.payData = [...this.payData, p];

            // 支付月份加上周期
            paymentsDate = addMonths(paymentsDate, paymentcycle);

            // 获取该月份的最后一天
            const slastDay = getDaysInMonth(paymentsDate);
            // 判断指定的支付日是否大于最后一天
            if (paymentday > slastDay) {
              paymentsDate = setDate(paymentsDate, slastDay);
            } else {
              paymentsDate = setDate(paymentsDate, paymentday);
            }
          }

          // 支付回数
          pay.paymentcount = this.payData.length + 1;
          // 支付年月
          pay.paymentymd = format(paymentsDate, 'yyyy-MM-dd');
          this.payData = [...this.payData, pay];
        } else {
          this.payData = this.payData.slice(0, paymentcounts);
          // 倒数第一次的支付数据
          const lastData = this.payData[this.payData.length - 1];
          let paymentsDate = new Date(lastData.paymentymd);

          // 支付月份加上周期
          paymentsDate = addMonths(paymentsDate, paymentcycle);

          // 获取该月份的最后一天
          const lastDay = getDaysInMonth(paymentsDate);
          // 判断指定的支付日是否大于最后一天
          if (paymentday > lastDay) {
            paymentsDate = setDate(paymentsDate, lastDay);
          } else {
            paymentsDate = setDate(paymentsDate, paymentday);
          }
          // 支付回数
          pay.paymentcount = this.payData.length + 1;
          // 支付年月
          pay.paymentymd = format(paymentsDate, 'yyyy-MM-dd');
          this.payData = [...this.payData, pay];
        }
      }
      return;
    } else {
      const pay: Payment = this.payData.find(p => p.paymentType === '残価保証額');
      if (pay) {
        this.payData = this.payData.slice(0, this.payData.length - 1);
      }
    }
    if (optionToPurchase > 0) {
      // 先删除可能的残価保証額
      const rpay: Payment = this.payData.find(p => p.paymentType === '残価保証額');
      if (rpay) {
        this.payData = this.payData.slice(0, this.payData.length - 1);
      }

      // 最后一次的支付日
      let paymentDate = new Date(this.payData[this.payData.length - 1].paymentymd);

      let pay: Payment = this.payData.find(p => p.paymentType === '購入オプション行使価額');
      if (pay) {
        pay.paymentleasefee = optionToPurchase;
      } else {
        // 支付月份加上周期
        paymentDate = addMonths(paymentDate, paymentcycle);

        // 获取该月份的最后一天
        const lastDay = getDaysInMonth(paymentDate);
        // 判断指定的支付日是否大于最后一天
        if (paymentday > lastDay) {
          paymentDate = setDate(paymentDate, lastDay);
        } else {
          paymentDate = setDate(paymentDate, paymentday);
        }
        pay = {};
        // 支付回数
        pay.paymentcount = this.payData.length + 1;
        // 支付金额
        pay.paymentleasefee = optionToPurchase;
        // 支付年月
        pay.paymentymd = format(paymentDate, 'yyyy-MM-dd');
        // 其他设置
        pay.paymentleasefeehendo = 0;
        pay.incentives = 0;
        pay.sonotafee = 0;
        pay.kaiyakuson = 0;
        pay.paymentType = '購入オプション行使価額';
        pay.fixed = true;

        this.payData = [...this.payData, pay];
      }

      if (paymentcounts !== this.payData.length - 1) {
        // 先去掉購入オプション行使価額
        this.payData = this.payData.slice(0, this.payData.length - 1);

        const diff = paymentcounts - this.payData.length;
        if (diff > 0) {
          // 倒数第一次的支付数据
          const lastData = this.payData[this.payData.length - 1];
          let paymentsDate = new Date(lastData.paymentymd);

          // 支付月份加上周期
          paymentsDate = addMonths(paymentsDate, paymentcycle);

          // 获取该月份的最后一天
          const lastDay = getDaysInMonth(paymentsDate);
          // 判断指定的支付日是否大于最后一天
          if (paymentday > lastDay) {
            paymentsDate = setDate(paymentsDate, lastDay);
          } else {
            paymentsDate = setDate(paymentsDate, paymentday);
          }

          for (let i = 0; i < diff; i++) {
            const p: Payment = {};
            // 支付回数
            p.paymentcount = this.payData.length + 1;
            // 支付金额
            p.paymentleasefee = lastData.paymentleasefee;
            // 支付年月
            p.paymentymd = format(paymentsDate, 'yyyy-MM-dd');
            // 其他设置
            p.paymentleasefeehendo = 0;
            p.incentives = 0;
            p.sonotafee = 0;
            p.kaiyakuson = 0;
            p.paymentType = '支払';
            p.fixed = false;

            this.payData = [...this.payData, p];

            // 支付月份加上周期
            paymentsDate = addMonths(paymentsDate, paymentcycle);

            // 获取该月份的最后一天
            const slastDay = getDaysInMonth(paymentsDate);
            // 判断指定的支付日是否大于最后一天
            if (paymentday > slastDay) {
              paymentsDate = setDate(paymentsDate, slastDay);
            } else {
              paymentsDate = setDate(paymentsDate, paymentday);
            }
          }

          // 支付回数
          pay.paymentcount = this.payData.length + 1;
          // 支付年月
          pay.paymentymd = format(paymentsDate, 'yyyy-MM-dd');
          this.payData = [...this.payData, pay];
        } else {
          this.payData = this.payData.slice(0, paymentcounts);
          // 倒数第一次的支付数据
          const lastData = this.payData[this.payData.length - 1];
          let paymentsDate = new Date(lastData.paymentymd);

          // 支付月份加上周期
          paymentsDate = addMonths(paymentsDate, paymentcycle);

          // 获取该月份的最后一天
          const lastDay = getDaysInMonth(paymentsDate);
          // 判断指定的支付日是否大于最后一天
          if (paymentday > lastDay) {
            paymentsDate = setDate(paymentsDate, lastDay);
          } else {
            paymentsDate = setDate(paymentsDate, paymentday);
          }
          // 支付回数
          pay.paymentcount = this.payData.length + 1;
          // 支付年月
          pay.paymentymd = format(paymentsDate, 'yyyy-MM-dd');
          this.payData = [...this.payData, pay];
        }
      }
      return;
    } else {
      const pay: Payment = this.payData.find(p => p.paymentType === '購入オプション行使価額');
      if (pay) {
        this.payData = this.payData.slice(0, this.payData.length - 1);
      }
    }

    if (paymentcounts !== this.payData.length - 1) {
      const diff = paymentcounts - this.payData.length;
      if (diff > 0) {
        // 倒数第一次的支付数据
        const lastData = this.payData[this.payData.length - 1];
        let paymentsDate = new Date(lastData.paymentymd);

        // 支付月份加上周期
        paymentsDate = addMonths(paymentsDate, paymentcycle);

        // 获取该月份的最后一天
        const lastDay = getDaysInMonth(paymentsDate);
        // 判断指定的支付日是否大于最后一天
        if (paymentday > lastDay) {
          paymentsDate = setDate(paymentsDate, lastDay);
        } else {
          paymentsDate = setDate(paymentsDate, paymentday);
        }

        for (let i = 0; i < diff; i++) {
          const p: Payment = {};
          // 支付回数
          p.paymentcount = this.payData.length + 1;
          // 支付金额
          p.paymentleasefee = lastData.paymentleasefee;
          // 支付年月
          p.paymentymd = format(paymentsDate, 'yyyy-MM-dd');
          // 其他设置
          p.paymentleasefeehendo = 0;
          p.incentives = 0;
          p.sonotafee = 0;
          p.kaiyakuson = 0;
          p.paymentType = '支払';
          p.fixed = false;

          this.payData = [...this.payData, p];

          // 支付月份加上周期
          paymentsDate = addMonths(paymentsDate, paymentcycle);

          // 获取该月份的最后一天
          const slastDay = getDaysInMonth(paymentsDate);
          // 判断指定的支付日是否大于最后一天
          if (paymentday > slastDay) {
            paymentsDate = setDate(paymentsDate, slastDay);
          } else {
            paymentsDate = setDate(paymentsDate, paymentday);
          }
        }

        return;
      }

      this.payData = this.payData.slice(0, paymentcounts);
      return;
    }
  }

  async henkouymdChange() {
    await this.generateTable();
    const val = this.form.get('kaiyakuymd').value;
    if (val) {
      this.kaiyakuymdChange(val);
    }
  }

  kaiyakuymdChange(val: string) {
    if (val) {
      this.form.get('rishiritsu').reset({ value: this.initParam.rishiritsu, disabled: true });
      this.form.get('residualValue').reset({ value: this.initParam.residualValue, disabled: true });
      this.form.get('extentionOption').reset({ value: this.initParam.extentionOption, disabled: true });
      this.form.get('optionToPurchase').reset({ value: this.initParam.optionToPurchase, disabled: true });

      const lstDate = new Date(this.form.get('leasestymd').value);
      const kyaDate = new Date(this.form.get('kaiyakuymd').value);
      const realkikan = kyaDate.getUTCFullYear() * 12 + kyaDate.getUTCMonth() - lstDate.getUTCFullYear() * 12 - lstDate.getUTCMonth() + 1;
      this.form.get('leasekikan').reset({ value: realkikan, disabled: true });

      if (this.form.get('cancellationrightoption').value) {
        this.form
          .get('percentage')
          .reset({ value: realkikan / (this.initParam.leasekikan + this.initParam.extentionOption), disabled: true });
      } else {
        this.form.get('percentage').reset({ value: 1, disabled: true });
      }

      this.form.updateValueAndValidity();

      this.payData = this.payDataBk;
      const leftPayData: Payment[] = [];
      this.payData.forEach(pay => {
        if (format(new Date(pay.paymentymd), 'yyyy-MM') <= format(kyaDate, 'yyyy-MM')) {
          leftPayData.push(pay);
        }
      });
      this.payData = leftPayData;
      this.form.get('paymentcounts').reset({ value: leftPayData.length, disabled: true });
    } else {
      this.payData = this.payDataBk;
      this.form.get('paymentcounts').reset({ value: this.initParam.paymentcounts, disabled: false });
      this.form.get('rishiritsu').reset({ value: this.initParam.rishiritsu, disabled: false });
      this.form.get('residualValue').reset({ value: this.initParam.residualValue, disabled: false });
      this.form.get('extentionOption').reset({ value: this.initParam.extentionOption, disabled: false });
      this.form.get('optionToPurchase').reset({ value: this.initParam.optionToPurchase, disabled: false });
      this.form.get('percentage').reset({ value: this.initParam.percentage, disabled: false });
      this.form.get('leasekikan').reset({ value: this.initParam.leasekikan, disabled: false });
      this.form.updateValueAndValidity();
    }
  }

  /**
   * @description: 计算
   */
  async compute() {
    this.computeVisible = true;
    this.loading = true;
    // 利息偿还情报参数-- 残价保证额
    const residualValue = this.form.get('residualValue').value || 0;
    // 利息偿还情报参数-- 割引率
    const rishiritsu = this.form.get('rishiritsu').value || 0.03;
    // 利息偿还情报参数--変更年月日
    const henkouymd = this.form.get('henkouymd').value;
    // 利息偿还情报参数-- 租赁期间
    const leasekikan = this.form.get('leasekikan').value || 0;
    // 利息偿还情报参数-- 延长租赁期间
    const extentionOption = this.form.get('extentionOption').value || 0;
    // 利息偿还情报参数-- 前払リース料
    const keiyakuno = this.form.get('keiyakuno').value;
    // 利息偿还情报参数-- 耐用年限
    const assetlife = this.form.get('assetlife').value || 0;
    // 利息偿还情报参数-- 取引判定区分
    const torihikikbn = this.form.get('torihikikbn').value;
    // 利息偿还情报参数-- 百分比
    const percentage = this.form.get('percentage').value;
    // 利息偿还情报参数--租赁开始日
    const leasestymd = this.form.get('leasestymd').value;
    // 利息偿还情报参数-- 解约赔偿金
    // const kaiyakusongaikin = this.form.get('kaiyakusongaikin').value || 0;
    // 利息偿还情报参数-- 解約行使権オプション
    const cancellationrightoption = this.form.get('cancellationrightoption').value;
    // 利息偿还情报参数--解約年月日
    const kaiyakuymd = this.form.get('kaiyakuymd').value;

    this.payData.forEach(p => {
      p.paymentymd = format(new Date(p.paymentymd), 'yyyy-MM-dd');
    });

    const params: any = {
      kaiyakuymd: kaiyakuymd,
      residualValue: residualValue,
      rishiritsu: rishiritsu,
      henkouymd: henkouymd,
      leasestymd: leasestymd,
      keiyakuno: keiyakuno,
      leasekikan: leasekikan,
      extentionOption: extentionOption,
      assetlife: assetlife,
      torihikikbn: torihikikbn,
      percentage: percentage,
      cancellationrightoption: cancellationrightoption,
      payments: this.payData
    };
    await this.item.computeLeaserepay(params, 'debt').then(data => {
      if (data) {
        this.templateId = data.template_id;
        this.computeResult = data;
      } else {
        this.templateId = '';
        this.computeResult = {};
      }
    });
    if (this.templateId) {
      await this.searchRepayment(true);
      await this.searchPaymentInterest(true);
    } else {
      // 延迟关闭窗口，防止闪屏
      setTimeout(() => {
        this.computeVisible = false;
      }, 1000);
    }

    this.loading = false;
  }

  cancelComputView(): void {
    this.item.deleteTempData(this.templateId).then(() => {
      this.computeVisible = false;
    });
  }

  /**
   * @description: 查询关联台账的数据
   */
  async searchRepayment(reset: boolean) {
    // 页面条数变更回到第一页
    if (reset) {
      this.repaymentPageIndex = 1;
    }

    await this.item
      .getComputeInfo({
        datastoreKey: 'repayment',
        templateId: this.templateId,
        pageIndex: this.repaymentPageIndex,
        pageSize: this.repaymentPageSize
      })
      .then((res: any) => {
        if (res) {
          if (res.data) {
            this.repayData = res.data;
            this.repayData.forEach((repayment, index) => {
              repayment.no = (this.repaymentPageIndex - 1) * this.repaymentPageSize + index + 1;
            });
            this.repaymentTotal = res.total;
          } else {
            this.repayData = [];
            this.repaymentTotal = 0;
          }
        } else {
          this.repayData = [];
          this.repaymentTotal = 0;
        }
      });
  }

  /**
   * @description: 查询关联台账的数据
   */
  async searchPaymentInterest(reset: boolean) {
    // 页面条数变更回到第一页
    if (reset) {
      this.paymentPageIndex = 1;
    }

    await this.item
      .getComputeInfo({
        datastoreKey: 'paymentInterest',
        templateId: this.templateId,
        pageIndex: this.paymentPageIndex,
        pageSize: this.paymentPageSize
      })
      .then((res: any) => {
        if (res) {
          if (res.data) {
            this.leaseData = res.data;
            this.leaseData.forEach((lease, index) => {
              lease.no = (this.paymentPageIndex - 1) * this.paymentPageSize + index + 1;
            });
            this.paymentTotal = res.total;
          } else {
            this.leaseData = [];
            this.paymentTotal = 0;
          }
        } else {
          this.leaseData = [];
          this.paymentTotal = 0;
        }
      });
  }

  /**
   * @description: 打开关联台账数据选择画面
   */
  openModal(control: string): void {
    this.selectControl = this.fieldMap.get(control);

    this.lookupDatastoreId = this.selectControl.lookup_datastore_id;
    this.lookField = this.selectControl.lookup_field_id;

    this.relations.forEach(rat => {
      for (const key in rat.fields) {
        if (Object.prototype.hasOwnProperty.call(rat.fields, key)) {
          const fs = rat.fields[key];
          if (this.selectControl.field_id === fs && key === this.selectControl.lookup_field_id) {
            this.lookRealtionFields = rat.fields;
          }
        }
      }
    });

    if (Object.keys(this.lookRealtionFields).length === 0) {
      this.message.warning(this.i18n.translateLang('common.message.warning.W_010'));
    } else {
      this.isVisible = true;
    }
  }

  /**
   * @description: 关闭关联台账数据选择画面
   */
  close() {
    this.isVisible = false;
  }

  /**
   * @description: 反映关联台账画面选择的数据
   */
  reflect(item: any) {
    for (const key in this.lookRealtionFields) {
      if (Object.prototype.hasOwnProperty.call(this.lookRealtionFields, key)) {
        const fs = this.lookRealtionFields[key];
        const value = `${item[key].value}`;
        this.form.get(fs).setValue(value);
        this.form.get(fs).markAsDirty();
      }
    }

    this.isVisible = false;
  }

  /**
   * @description: 提交事件
   */
  async submit() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const itemId = this.route.snapshot.paramMap.get('i_id');
    const param = {
      items: {}
    };

    this.controlArray.forEach(element => {
      // tslint:disable-next-line:no-shadowed-variable
      let item = {};

      switch (element.field_type) {
        case 'file':
          const images = [];

          element.value.forEach(image => {
            images.push({
              name: image.name,
              url: image.url
            });
          });

          item = {
            data_type: element.field_type,
            value: JSON.stringify(images)
          };
          break;
        case 'number':
        case 'text':
        case 'textarea':
        case 'autonum':
        case 'function':
          element.value = this.form.get(element.field_id).value;
          item = {
            data_type: element.field_type,
            value: element.value ? element.value.toString() : ''
          };
          break;
        case 'options':
          element.value = this.form.get(element.field_id).value;
          item = {
            data_type: element.field_type,
            value: element.value ? element.value.toString() : ''
          };
          break;
        case 'switch':
          element.value = this.form.get(element.field_id).value;
          item = {
            data_type: element.field_type,
            value: element.value ? element.value.toString() : 'false'
          };
          break;
        case 'user':
          element.value = this.form.get(element.field_id).value;
          item = {
            data_type: element.field_type,
            value: element.value ? element.value.toString() : ''
          };
          break;
        case 'date':
          element.value = this.form.get(element.field_id).value;
          if (element.value) {
            item = {
              data_type: element.field_type,
              value: format(new Date(element.value), 'yyyy-MM-dd')
            };
          } else {
            item = {
              data_type: element.field_type,
              value: ''
            };
          }

          break;
        case 'time':
          element.value = this.form.get(element.field_id).value;
          if (element.value) {
            item = {
              data_type: element.field_type,
              value: format(new Date(element.value), 'HH:mm:ss')
            };
          } else {
            item = {
              data_type: element.field_type,
              value: ''
            };
          }

          break;
        case 'lookup':
          element.value = this.form.get(element.field_id).value;
          item = {
            data_type: element.field_type,
            value: element.value
          };
          break;

        default:
          element.value = this.form.get(element.field_id).value;
          item = {
            data_type: element.field_type,
            value: element.value
          };
      }

      param.items[element.field_id] = item;
    });

    // 将临时数据ID传入
    param.items['template_id'] = {
      data_type: 'text',
      value: this.templateId
    };

    const kisyuboka: number = this.computeResult.kisyuboka;
    // 将原始取得价值数据传入
    param.items['kisyuboka'] = {
      data_type: 'number',
      value: kisyuboka.toString()
    };

    this.item.changeDebt(datastoreId, itemId, param).then(res => {
      this.nxSubmit.emit();
    });
  }

  // 文件上传前
  beforeUploadFile = (file: NzUploadFile, fileList: NzUploadFile[]): boolean => {
    // 上传文件类型限制
    const isSupportFileType = this.fileUtil.checkSupport(file.type, false);
    if (!isSupportFileType) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
      return false;
    }

    // // 上传文件大小限制
    // const isLt5M = this.fileUtil.checkSize(file.size);
    // if (!isLt5M) {
    //   this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
    //   return false;
    // }
    return true;
  };

  // 图片上传前
  beforeUploadPic = (file: NzUploadFile, fileList: NzUploadFile[]): boolean => {
    // 上传文件类型限制
    const isSupportFileType = this.fileUtil.checkSupport(file.type, true);
    if (!isSupportFileType) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
      return false;
    }

    // // 上传文件大小限制
    // const isLt5M = this.fileUtil.checkSize(file.size);
    // if (!isLt5M) {
    //   this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
    //   return false;
    // }
    // console.log(fileList);
    return true;
  };

  customReq = (item: NzUploadXHRArgs) => {
    // 构建一个 FormData 对象，用于存储文件或其他参数
    const formData = new FormData();
    // tslint:disable-next-line:no-any
    formData.append('file', item.file as any);
    // tslint:disable-next-line: no-non-null-assertion
    const req = new HttpRequest('POST', item.action!, formData, {
      headers: new HttpHeaders({
        token: 'true'
      }),
      reportProgress: true,
      withCredentials: true
    });
    // 始终返回一个 `Subscription` 对象，nz-upload 会在适当时机自动取消订阅
    return this.http.request(req).subscribe(
      (event: HttpEvent<{}>) => {
        if (event.type === HttpEventType.UploadProgress) {
          // tslint:disable-next-line: no-non-null-assertion
          if (event.total! > 0) {
            // tslint:disable-next-line:no-non-null-assertion
            (event as any).percent = (event.loaded / event.total!) * 100;
          }
          // 处理上传进度条，必须指定 `percent` 属性来表示进度
          // tslint:disable-next-line: no-non-null-assertion
          item.onProgress!(event, item.file!);
        } else if (event instanceof HttpResponse) {
          // 处理成功
          // tslint:disable-next-line: no-non-null-assertion
          item.onSuccess!(event.body, item.file!, event);
        }
      },
      err => {
        // 处理失败
        // tslint:disable-next-line: no-non-null-assertion
        item.onError!(err, item.file!);
      }
    );
  };

  customReqPic = (item: NzUploadXHRArgs) => {
    // 构建一个 FormData 对象，用于存储文件或其他参数
    const formData = new FormData();
    // tslint:disable-next-line:no-any
    formData.append('file', item.file as any);
    formData.append('is_pic', 'true');
    // tslint:disable-next-line: no-non-null-assertion
    const req = new HttpRequest('POST', item.action!, formData, {
      headers: new HttpHeaders({
        token: 'true'
      }),
      reportProgress: true,
      withCredentials: true
    });
    // 始终返回一个 `Subscription` 对象，nz-upload 会在适当时机自动取消订阅
    return this.http.request(req).subscribe(
      (event: HttpEvent<{}>) => {
        if (event.type === HttpEventType.UploadProgress) {
          // tslint:disable-next-line: no-non-null-assertion
          if (event.total! > 0) {
            // tslint:disable-next-line:no-non-null-assertion
            (event as any).percent = (event.loaded / event.total!) * 100;
          }
          // 处理上传进度条，必须指定 `percent` 属性来表示进度
          // tslint:disable-next-line: no-non-null-assertion
          item.onProgress!(event, item.file!);
        } else if (event instanceof HttpResponse) {
          // 处理成功
          // tslint:disable-next-line: no-non-null-assertion
          item.onSuccess!(event.body, item.file!, event);
        }
      },
      err => {
        // 处理失败
        // tslint:disable-next-line: no-non-null-assertion
        item.onError!(err, item.file!);
      }
    );
  };

  handlePreview = (file: NzUploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  };

  /**
   * @description: 上传文件
   */
  handleChange({ file, fileList }): void {
    const status = file.status;
    if (status !== 'uploading') {
    }
    // 文件上传成功后设置url
    if (status === 'done') {
      fileList[fileList.length - 1].url = file.response.url;
      file.url = file.response.url;
      this.message.success(this.i18n.translateLang('common.message.success.S_006'));
    } else if (status === 'error') {
      this.message.error(this.i18n.translateLang('common.message.error.E_006'));
    }
  }

  residualValueChange(value): void {
    // 残価保証額制御
    setTimeout(() => {
      // 購入オプション額と一つしか入力出来ない
      if (value) {
        this.form.get('optionToPurchase').reset({ value: 0, disabled: true });
        return;
      }
      // 移転外の場合、購入オプション額は入力出来ない
      if (this.form.get('torihikikbn').value === '2') {
        this.form.get('optionToPurchase').reset({ value: 0, disabled: true });
        return;
      }
      // 購入オプション額リセット
      if (this.form.get('optionToPurchase').disabled) {
        if (!this.form.get('kaiyakuymd').value) {
          this.form.get('optionToPurchase').reset({ value: 0, disabled: false });
        }
        return;
      }
    });
  }
  optionToPurchaseChange(value): void {
    // 購入オプション額制御
    setTimeout(() => {
      // 残価保証額と一つしか入力出来ない
      if (value) {
        this.form.get('residualValue').reset({ value: 0, disabled: true });
        return;
      }
      // 残価保証額リセット
      if (this.form.get('residualValue').disabled) {
        if (!this.form.get('kaiyakuymd').value) {
          this.form.get('residualValue').reset({ value: 0, disabled: false });
        }
        return;
      }
    });
  }
}
