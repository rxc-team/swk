import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';

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

@Component({
  selector: 'app-expire',
  templateUrl: './expire.component.html',
  styleUrls: ['./expire.component.less']
})
export class ExpireComponent implements OnInit {
  @Input() isUpdate = true;
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

  scroll = { x: '1150px', y: '300px' };

  constructor(
    private fb: FormBuilder,
    private fileUtil: FileUtilService,
    private message: NzMessageService,
    private tokenService: TokenStorageService,
    public item: ItemService,
    public dbs: DatabaseService,
    public ds: DatastoreService,
    private appService: AppService,
    private validation: ValidationService,
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
        case 'paymentcounts':
        case 'rishiritsu':
        case 'leasekikan':
        case 'assetlife':
          // 必须字段
          control.is_required = true;
          control.disabled = true;
          break;
        // 其他租赁相关字段
        case 'residualValue':
        case 'optionToPurchase':
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
        case 'extentionOption':
        case 'kaiyakuymd':
        case 'usecancellationoption': // 登录不显示
        case 'kaiyakusongaikin':
        case 'cancellationrightoption':
          control.is_required = false;
          control.disabled = true;
          break;
        case 'percentage':
        case 'status': // 状态不显示
        case 'actkbn': // 操作不显示
        case 'leaseexpireymd': // 租赁满了日不显示
        case 'lease_type': // 租赁类型不显示
          control.is_required = false;
          control.disabled = true;
          break;
        case 'henkouymd':
        case 'expiresyokyakukbn':
          control.is_required = true;
          control.disabled = false;
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
        const ctl = new FormControl({ value: null, disabled: control.disabled }, { validators, asyncValidators });
        this.form.addControl(control.field_id, ctl);
      } else if (control.field_id === 'kaiyakuymd') {
        const ctl = new FormControl({ value: null, disabled: control.disabled }, { validators, asyncValidators });
        this.form.addControl(control.field_id, ctl);
      } else {
        const ctl = new FormControl({ value: control.value, disabled: control.disabled }, { validators, asyncValidators });
        this.form.addControl(control.field_id, ctl);
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
    this.appService.getAppByID(currentApp, db).then(res => {
      // 查询处理月度
      if (res && res.configs.syori_ym) {
        this.handleMonth = format(new Date(res.configs.syori_ym), 'yyyy-MM');
      } else {
        this.handleMonth = '';
      }
      // 查询期首年月
      if (res && res.configs.kishu_ym) {
        this.kishuym = res.configs.kishu_ym;
      } else {
        this.kishuym = '';
      }
    });
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
  /*  validSpecialChar = (control: FormControl) => {
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

  // 滿了畫面變更年月日(即滿了日)檢查
  disabledDate = (d: Date) => {
    const ym = format(d, 'yyyy-MM');
    const ymd = format(d, 'yyyy-MM-dd');
    // 變更年月日(即滿了日) <= 処理月度
    if (ym > this.handleMonth) {
      return true;
    }
    // 變更年月日(即滿了日) >= 満了預定日付
    const lexymd = format(new Date(this.form.get('leaseexpireymd').value), 'yyyy-MM-dd');
    return ymd < lexymd;
  };

  /**
   * @description: 合同到期
   */
  async compute() {
    this.computeVisible = true;
    this.loading = true;
    // 契约番号
    const keiyakuno = this.form.get('keiyakuno').value;
    // 変更年月日
    const henkouymd = this.form.get('henkouymd').value;
    // リース満了償却区分
    const expiresyokyakukbn = this.form.get('expiresyokyakukbn').value;
    // 取引判定区分
    const torihikikbn = this.form.get('torihikikbn').value;

    // 满了预算
    const params: any = {
      keiyakuno,
      henkouymd,
      expiresyokyakukbn,
      torihikikbn
    };
    await this.item.computeLeaserepay(params, 'expire').then(data => {
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
    }
    this.loading = false;
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
   * @description: 关闭计算画面
   */
  cancelComputView(): void {
    if (this.templateId) {
      this.item.deleteTempData(this.templateId).then(() => {
        this.computeVisible = false;
      });
    } else {
      this.computeVisible = false;
    }
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

  // /**
  //  * @description: 反映关联台账画面选择的数据
  //  */
  // reflect(item: any) {
  //   const fd = this.fieldMap.get(item.index);

  //   const value = item.value.items[fd.lookup_field_id].value;

  //   const ctl = this.controlArray.find(c => c.field_id === item.index);
  //   if (ctl) {
  //     ctl.value = value;
  //   }

  //   this.form.get(fd.field_id).setValue(value);
  //   this.form.get(fd.field_id).markAsDirty();
  //   this.isVisible = false;
  // }

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

    this.item.contractExpire(datastoreId, itemId, param).then(() => {
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
    // console.log(fileList);
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
}
