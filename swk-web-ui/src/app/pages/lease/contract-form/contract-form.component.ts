import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';

import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatastoreService, FieldService, ItemService, OptionService, UserService, ValidationService } from '@api';
import { CommonService, FileUtilService, I18NService } from '@core';

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
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.less']
})
export class ContractFormComponent implements OnInit {
  form: FormGroup;

  @Input() controlArray: any[] = [];
  @Input() userList: any[];

  @Output() nxSubmit: EventEmitter<any> = new EventEmitter();
  @Output() nxCancel: EventEmitter<any> = new EventEmitter();

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
  computeVisible = false;
  userOptions: { [key: string]: any[] } = {};
  options: { [key: string]: any[] } = {};
  selectControl: Field;
  lookupItem: any;
  loading = false;
  payLoading = false;

  uniqueFields = [];

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

  scroll = { x: '1150px', y: '300px' };

  payData: Payment[] = [];

  repayData: RePayment[] = [];

  leaseData: Lease[] = [];
  // 临时数据生成的ID
  templateId = '';
  // 租赁类型
  leaseType = '';
  // 原始取得价值
  kisyuboka = 0;

  constructor(
    private fb: FormBuilder,
    private fileUtil: FileUtilService,
    private message: NzMessageService,
    private common: CommonService,
    public item: ItemService,
    private field: FieldService,
    private ds: DatastoreService,
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
    this.controlArray.forEach(control => {
      switch (control.field_id) {
        case 'leasekaishacd':
        case 'keiyakuno':
        case 'keiyakuymd':
        case 'leasestymd':
        case 'leasekikan':
        case 'bunruicd':
        case 'keiyakunm':
        case 'shisannm':
        case 'segmentcd':
        case 'paymentstymd':
        case 'paymentcycle':
        case 'paymentday':
        case 'paymentleasefee':
        case 'paymentcounts':
        case 'rishiritsu':
        case 'torihikikbn':
        case 'assetlife':
          // 必须字段
          control.is_required = true;
          break;
        case 'henkouymd': // 登录不显示
        case 'locationcd':
        case 'locationhosoku':
        case 'ky_niniLd02cd':
        case 'ky_niniLd03cd':
        case 'residualValue':
        case 'paymentsAtOrPrior':
        case 'incentivesAtOrPrior':
        case 'initialDirectCosts':
        case 'restorationCosts':
        case 'extentionOption':
        case 'optionToPurchase':
        case 'usecancellationoption': // 登录不显示
        case 'kaiyakuymd': // 登录不显示
        case 'kaiyakusongaikin':
        case 'biko1':
        case 'biko2':
        case 'percentage':
        case 'status': // 状态不显示
        case 'actkbn': // 操作不显示
        case 'expiresyokyakukbn': // リース満了償却区分不显示
        case 'leaseexpireymd': // 租赁满了日不显示
        case 'lease_type': // 租赁类型不显示
        case 'cancellationrightoption':
          // 其他租赁相关字段
          control.is_required = false;
          break;
        default:
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

      // 关联check1 [「リース開始日」が「契約開始日」以降となる]
      if (control.field_id === 'leasestymd') {
        validators.push(this.leasestymdValidator);
      }
      // 关联check2 [初回支払はリース開始日以降となる]
      if (control.field_id === 'paymentstymd') {
        validators.push(this.paymentstymdValidator);
      }
      // 前払リース料 + リース・インセンティブ(前払) 不能为负数
      if (control.field_id === 'incentivesAtOrPrior') {
        validators.push(this.prepaidValidator);
      }

      const ctl = new FormControl(control.value, { validators: validators, asyncValidators: asyncValidators });
      this.form.addControl(control.field_id, ctl);

      if (!control.value && control.field_id === 'paymentcycle') {
        this.form.get('paymentcycle').setValue('1');
      }
      if (!control.value && control.field_id === 'paymentday') {
        this.form.get('paymentday').setValue('31');
      }

      /* if (control.field_type === 'text' || control.field_type === 'textarea') {
        asyncValidators.push(this.validSpecialChar);
        setTimeout(() => {
          this.form.get(control.field_id).addAsyncValidators(asyncValidators);
        }, 1000);
      } */

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
    });

    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    const fields = await this.field.getFields(datastoreId);

    this.uniqueFields = [];

    const ds = await this.ds.getDatastoreByID(datastoreId);
    if (ds) {
      this.relations = ds.relations;

      if (ds.unique_fields && fields) {
        ds.unique_fields.forEach(f => {
          const fList = f.split(',');
          this.uniqueFields.push(fList.map(fs => fields.find(fd => fd.field_id === fs)));
        });
      }
    }
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
   * @description: 计算
   */
  generateTable() {
    this.payLoading = true;
    // 初始化变量
    this.payData = [];

    // 支付情报参数-- 支付开始日
    const paymentstymd = this.form.get('paymentstymd').value || new Date();
    // 支付情报参数-- 支付回数
    const paymentcounts = this.form.get('paymentcounts').value || 24;
    // 支付情报参数-- 残价保证额
    const residualValue = this.form.get('residualValue').value || 0;
    // 支付情报参数-- 支付金额
    const paymentleasefee = this.form.get('paymentleasefee').value || 0;
    // 支付情报参数-- 购入行使权金额
    const optionToPurchase = this.form.get('optionToPurchase').value || 0;
    // 支付情报参数-- 支付周期
    const paymentcycle = this.form.get('paymentcycle').value || 1;
    // 支付情报参数-- 支付日
    const paymentday = this.form.get('paymentday').value || 31;
    // 利息偿还情报参数-- 延长租赁期间
    const extentionOption = this.form.get('extentionOption').value || 0;
    // 交于后台计算生成支付table数据
    const params: any = {
      paymentstymd: paymentstymd,
      paymentcycle: Number(paymentcycle),
      paymentday: Number(paymentday),
      paymentcounts: paymentcounts,
      residualValue: residualValue,
      paymentleasefee: paymentleasefee,
      optionToPurchase: optionToPurchase,
      extentionOption: extentionOption
    };
    this.item.generatePay(params).then((data: any[]) => {
      if (data) {
        this.payData = data;
      } else {
        this.payData = [];
      }
      this.payLoading = false;
    });
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
    // 利息偿还情报参数--租赁开始日
    const leasestymd = this.form.get('leasestymd').value;
    // 利息偿还情报参数-- 解约赔偿金
    // const kaiyakusongaikin = this.form.get('kaiyakusongaikin').value || 0;
    // 利息偿还情报参数-- 解約行使権オプション
    const cancellationrightoption = this.form.get('cancellationrightoption').value;
    // 利息偿还情报参数-- 租赁期间
    const leasekikan = this.form.get('leasekikan').value || 0;
    // 利息偿还情报参数-- 前払リース料
    const paymentsAtOrPrior = this.form.get('paymentsAtOrPrior').value || 0;
    // 利息偿还情报参数-- リース・インセンティブ（前払）
    const incentivesAtOrPrior = this.form.get('incentivesAtOrPrior').value || 0;
    // 利息偿还情报参数-- 当初直接費用
    const initialDirectCosts = this.form.get('initialDirectCosts').value || 0;
    // 利息偿还情报参数-- 原状回復コスト
    const restorationCosts = this.form.get('restorationCosts').value || 0;
    // 利息偿还情报参数-- 延长租赁期间
    const extentionOption = this.form.get('extentionOption').value || 0;
    // 利息偿还情报参数-- 耐用年限
    const assetlife = this.form.get('assetlife').value || 0;
    // 利息偿还情报参数-- 取引判定区分
    const torihikikbn = this.form.get('torihikikbn').value;

    this.payData.forEach(p => {
      p.paymentymd = format(new Date(p.paymentymd), 'yyyy-MM-dd');
    });

    const params: any = {
      residualValue: residualValue,
      rishiritsu: rishiritsu,
      leasestymd: leasestymd,
      cancellationrightoption: cancellationrightoption,
      leasekikan: leasekikan,
      extentionOption: extentionOption,
      paymentsAtOrPrior: paymentsAtOrPrior,
      incentivesAtOrPrior: incentivesAtOrPrior,
      initialDirectCosts: initialDirectCosts,
      restorationCosts: restorationCosts,
      assetlife: assetlife,
      torihikikbn: torihikikbn,
      payments: this.payData
    };
    await this.item.computeLeaserepay(params).then(data => {
      if (data) {
        this.templateId = data.template_id;
        this.leaseType = data.lease_type;
        this.kisyuboka = data.kisyuboka;
      }
    });
    if (this.templateId) {
      if (this.leaseType === 'normal_lease') {
        await this.searchRepayment(true);
        await this.searchPaymentInterest(true);
      } else {
        // 短期少额的场合,利息偿还情报清空
        this.repayData = [];
        this.repaymentTotal = 0;
        this.leaseData = [];
        this.paymentTotal = 0;
      }
    } else {
      // 延迟关闭窗口，防止闪屏
      setTimeout(() => {
        this.computeVisible = false;
      }, 1000);
    }

    this.loading = false;
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
    // 组合验证
    for (let index = 0; index < this.uniqueFields.length; index++) {
      const fs = this.uniqueFields[index];
      await this.uniqueValidator(fs);
    }

    if (this.form.invalid) {
      return;
    }

    const datastoreId = this.route.snapshot.paramMap.get('d_id');
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
    // 将租赁类型数据传入
    param.items['lease_type'] = {
      data_type: 'options',
      value: this.leaseType
    };
    // 将原始取得价值数据传入
    param.items['kisyuboka'] = {
      data_type: 'number',
      value: this.kisyuboka.toString()
    };

    // 基本台账信息登录
    this.item.insert(datastoreId, param).then(res => {
      this.nxSubmit.emit(res);
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

  cancelComputView(): void {
    this.item.deleteTempData(this.templateId).then(() => {
      this.computeVisible = false;
    });
  }

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

  /**
   * @description: 唯一性check
   */
  async uniqueValidator(uniqueFields: any[]) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    const ctls: AbstractControl[] = [];

    const conditions = [];
    const keys = [];
    uniqueFields.forEach(u => {
      // 新值
      const newVal = this.form.get(u.field_id);
      const cd: any = {
        field_id: u.field_id,
        field_type: u.field_type,
        search_value: this.getValue(u.field_type, newVal),
        operator: '=',
        is_dynamic: true,
        condition_type: ''
      };

      conditions.push(cd);

      keys.push(this.i18n.translateLang(u.field_name));

      ctls.push(newVal);
    });

    const res = await this.validation.validationItemUnique(datastoreId, conditions);
    if (res) {
      ctls.forEach(c => {
        c.setErrors(null);
      });
    } else {
      ctls.forEach(c => {
        c.setErrors({ error: true, duplicated: true });
      });

      this.message.error(this.i18n.translateLang('common.validator.duplicated', { field: keys.toString() }));
    }
  }

  getValue(fieldType: string, control: AbstractControl) {
    switch (fieldType) {
      case 'text':
      case 'textarea':
        return control.value;
      case 'lookup':
        return control.value;
      case 'user':
      case 'number':
      case 'options':
      case 'autonum':
        return control.value ? control.value.toString() : '';
      case 'switch':
        return control.value ? 'true' : 'false';
      case 'date':
        if (control.value) {
          return format(new Date(control.value), 'yyyy-MM-dd');
        }
        return '';
      case 'time':
        if (control.value) {
          return format(new Date(control.value), 'HH:mm:ss');
        }
        return '';
      default:
        return '';
    }
  }

  keiyakuymdChange(): void {
    setTimeout(() => this.form.get('leasestymd').updateValueAndValidity());
  }

  leasestymdChange(): void {
    // 初期値はリース開始年月日と同じ年月日を自動編集する
    this.form.get('paymentstymd').setValue(this.form.get('leasestymd').value);
    setTimeout(() => this.form.get('paymentstymd').updateValueAndValidity());
  }

  residualValueChange(value): void {
    // 初期値はリース開始年月日と同じ年月日を自動編集する
    setTimeout(() => {
      if (value) {
        this.form.get('optionToPurchase').reset({ value: 0, disabled: true });
        return;
      }

      if (this.form.get('torihikikbn').value === '2') {
        this.form.get('optionToPurchase').reset({ value: 0, disabled: true });
        return;
      }

      if (this.form.get('optionToPurchase').disabled) {
        this.form.get('optionToPurchase').reset({ value: 0, disabled: false });
        return;
      }
    });
  }
  optionToPurchaseChange(value): void {
    // 初期値はリース開始年月日と同じ年月日を自動編集する
    setTimeout(() => {
      if (value) {
        this.form.get('residualValue').reset({ value: 0, disabled: true });
        return;
      }

      if (this.form.get('residualValue').disabled) {
        this.form.get('residualValue').reset({ value: 0, disabled: false });
        return;
      }
    });
  }
  torihikikbnChange(value): void {
    // 初期値はリース開始年月日と同じ年月日を自動編集する
    setTimeout(() => {
      if (value === '2') {
        this.form.get('optionToPurchase').reset({ value: 0, disabled: true });
        return;
      }

      this.form.get('optionToPurchase').reset({ value: 0, disabled: false });
      return;
    });
  }
  /**
   * @description: 「リース開始日」が「契約開始日」以降となる
   */
  leasestymdValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    if (!control.value || !this.form.get('keiyakuymd').value) {
      return null;
    }

    const leasestymd = format(control.value, 'yyyy-MM-dd');
    const keiyakuymd = format(this.form.get('keiyakuymd').value, 'yyyy-MM-dd');

    if (leasestymd && keiyakuymd) {
      const leasestTime = new Date(leasestymd).getTime();
      const keiyakuTime = new Date(keiyakuymd).getTime();
      if (leasestTime < keiyakuTime) {
        return { compare: true };
      }
      return null;
    }
  };
  /**
   * @description: 前払リース料 + リース・インセンティブ(前払) 不能为负数
   */
  prepaidValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    let incentivesAtOrPrior = 0;
    let paymentsAtOrPrior = 0;
    if (control.value) {
      incentivesAtOrPrior = control.value;
    }
    if (this.form.get('paymentsAtOrPrior')) {
      if (this.form.get('paymentsAtOrPrior').value) {
        paymentsAtOrPrior = this.form.get('paymentsAtOrPrior').value;
      }
    }
    if (incentivesAtOrPrior + paymentsAtOrPrior < 0) {
      return { negative: true };
    }

    return null;
  };

  paymentsAtOrPriorChange(): void {
    this.form.get('incentivesAtOrPrior').markAsTouched();
    setTimeout(() => this.form.get('incentivesAtOrPrior').updateValueAndValidity());
  }

  /**
   * @description: 初回支払はリース開始日以降となる
   */
  paymentstymdValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    if (!control.value || !this.form.get('leasestymd').value) {
      return null;
    }

    const paymentstymd = format(control.value, 'yyyy-MM-dd');
    const leasestymd = format(this.form.get('leasestymd').value, 'yyyy-MM-dd');

    if (leasestymd && paymentstymd) {
      const paymentstTime = new Date(paymentstymd).getTime();
      const leasestTime = new Date(leasestymd).getTime();
      if (paymentstTime < leasestTime) {
        return { compare: true };
      }
      return null;
    }
  };
}
