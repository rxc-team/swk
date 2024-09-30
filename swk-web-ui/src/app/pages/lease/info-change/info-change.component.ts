import { format } from 'date-fns';
import { toInteger, cloneDeep } from 'lodash';
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
import { AppService, DatastoreService, FieldService, ItemService, OptionService, UserService, ValidationService } from '@api';
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

@Component({
  selector: 'app-info-change',
  templateUrl: './info-change.component.html',
  styleUrls: ['./info-change.component.less']
})
export class InfoChangeComponent implements OnInit {
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
  payLoading = false;
  oldControls = [];
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
  // 处理月度
  handleMonth = '';
  // 期首年月
  kishuym = '';
  // 最新的变更时间
  lastHenkouymd = '';

  scroll = { x: '1150px', y: '300px' };

  constructor(
    private fb: FormBuilder,
    private fileUtil: FileUtilService,
    private message: NzMessageService,
    private tokenService: TokenStorageService,
    public item: ItemService,
    public ds: DatastoreService,
    private appService: AppService,
    private validation: ValidationService,
    private field: FieldService,
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

    this.controlArray.forEach(control => {
      switch (control.field_id) {
        case 'keiyakuno':
        case 'leasekaishacd':
        case 'keiyakuymd':
        case 'leasestymd':
        case 'leasekikan':
        case 'assetlife':
        case 'torihikikbn':
          // 必须字段
          control.is_required = true;
          control.disabled = true;
          break;
        case 'henkouymd':
        case 'bunruicd':
        case 'keiyakunm':
        case 'shisannm':
        case 'segmentcd':
          // 必须字段
          control.is_required = true;
          control.disabled = false;
          break;
        case 'paymentstymd':
        case 'paymentcycle':
        case 'paymentday':
        case 'paymentleasefee':
        case 'paymentcounts':
        case 'rishiritsu':
          // 必须字段
          control.is_required = true;
          control.disabled = true;
          break;
        case 'locationcd':
        case 'locationhosoku':
        case 'ky_niniLd02cd':
        case 'ky_niniLd03cd':
        case 'biko1':
        case 'biko2':
        case 'cancellationrightoption':
          // 其他租赁相关字段
          control.is_required = false;
          control.disabled = false;
          break;
        case 'residualValue':
        case 'paymentsAtOrPrior':
        case 'incentivesAtOrPrior':
        case 'initialDirectCosts':
        case 'restorationCosts':
        case 'extentionOption':
        case 'optionToPurchase':
        case 'usecancellationoption': // 登录不显示
        case 'kaiyakuymd': // 登录不显示
        case 'status': // 状态不显示
        case 'actkbn': // 操作不显示
        case 'expiresyokyakukbn': // リース満了償却区分不显示
        case 'leaseexpireymd': // 租赁满了日不显示
        case 'lease_type': // 租赁类型不显示
        case 'kaiyakusongaikin':
        case 'cancellationrightoption':
        case 'percentage':
          // 其他租赁相关字段
          control.is_required = false;
          control.disabled = true;
          break;
        default:
          control.disabled = false;
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
    this.oldControls = cloneDeep(this.controlArray);

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

  // 变更时间判断
  disabledDate = (d: Date) => {
    const ym = format(d, 'yyyy-MM');
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
    const leasestymd = format(this.form.controls.leasestymd.value, 'yyyy-MM');
    if (ym < leasestymd) {
      return true;
    }

    if (this.lastHenkouymd) {
      // 变更后日期
      const changeym = format(new Date(this.lastHenkouymd), 'yyyy-MM');
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
        const ymd = format(d, 'yyyy-MM-dd');
        if (ymd < changeymd) {
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

    this.item.modifyContract(datastoreId, itemId, param).then(res => {
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

  /**
   * @description: 唯一性check
   */
  async uniqueValidator(uniqueFields: any[]) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    const ctls: AbstractControl[] = [];

    const conditions = [];
    const keys = [];
    let eqCount = 0;
    uniqueFields.forEach(u => {
      // 旧值
      const oldVal = this.oldControls.find(c => c.field_id === u.field_id);
      // 新值
      const newVal = this.form.get(u.field_id);
      if (oldVal && newVal && oldVal.value === newVal.value) {
        eqCount++;
      }
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
    // 如果全部相等，表示没有变更，直接返回
    if (eqCount === uniqueFields.length) {
      return;
    }

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
}
