/*
 * @Description: 数据类型表单控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-06-17 17:11:48
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2021-01-14 13:42:02
 */
import { format } from 'date-fns';
import { cloneDeep } from 'lodash';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';

import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { DatastoreService, FieldService, FileService, ItemService, OptionService, UserService, ValidationService } from '@api';
import { FileUtilService, I18NService } from '@core';

@Component({
  selector: 'app-datatype-form',
  templateUrl: './datatype-form.component.html',
  styleUrls: ['./datatype-form.component.less']
})
export class DatatypeFormComponent implements OnInit, AfterViewInit {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    public item: ItemService,
    private route: ActivatedRoute,
    public field: FieldService,
    private message: NzMessageService,
    private option: OptionService,
    private http: HttpClient,
    private file: FileService,
    private ds: DatastoreService,
    private fileUtil: FileUtilService,
    private validation: ValidationService,
    private bs: NzBreakpointService,
    private i18n: I18NService,
    private user: UserService
  ) {
    this.validateForm = this.fb.group({});
    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'xs' || data === 'sm') {
        this.layout = 'vertical';
      } else {
        this.layout = 'horizontal';
      }
    });
  }

  validateForm: FormGroup;

  @Input() submitBtn = 'common.button.submit';
  @Input() updateBtn = 'common.button.update';
  @Input() cancelBtn = 'common.button.cancel';
  @Input() isUpdate = true;

  // look台账显示
  isVisible = false;

  @Input() controlArray: any[] = [];
  @Input() fieldsInfo: any[] = [];
  //@Input() userList: any[];

  @Output() nxSubmit: EventEmitter<any> = new EventEmitter();
  @Output() nxCancel: EventEmitter<any> = new EventEmitter();
  @Output() nxChange: EventEmitter<any> = new EventEmitter();

  // 全局变量
  dataSet: any[] = [];
  items: any[] = [];
  fields: any[] = [];
  pageIndex = 1;
  pageSize = 30;
  total = 1;
  lookupDatastoreId: string;
  lookField = '';
  lookRealtionFields = {};
  relations = [];
  previewImage: string | undefined = '';
  previewVisible = false;
  userOptions: { [key: string]: any[] } = {};
  options: { [key: string]: any[] } = {};
  selectControl: any = {};
  oldControls = [];
  layout = 'horizontal';

  uniqueFields = [];

  //字段宽度
  fieldWidth = "width:120px;"

  ots: { [key: string]: any[] } = {};
  nts: { [key: string]: any[] } = {};

  /**
   * @description: 画面初期化处理
   */
  async ngOnInit() {
    if (this.isUpdate) {
      this.oldControls = cloneDeep(this.controlArray);
    }

    this.controlArray.forEach(control => {
      const validators: ValidatorFn[] = [];
      const asyncValidators: AsyncValidatorFn[] = [];
      if (control.field_type === 'file') {
        if (this.isUpdate) {
          this.ots[control.field_id] = control.value.map((item: any) => item.url);
        } else {
          this.ots[control.field_id] = [];
        }
        this.nts[control.field_id] = control.value.map((item: any) => item.url);
      }
      // 添加必须check
      if (control.is_required) {
        validators.push(Validators.required);
      }

      const ctl = new FormControl(control.value, { validators: validators, asyncValidators: [] });
      this.validateForm.addControl(control.field_id, ctl);

      /* if (control.field_type === 'text' || control.field_type === 'textarea') {
        asyncValidators.push(this.validSpecialChar);
        setTimeout(() => {
          this.validateForm.get(control.field_id).addAsyncValidators(asyncValidators);
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

    //const fields = await this.field.getFields(datastoreId);

    this.uniqueFields = [];
    const ds = await this.ds.getDatastoreByID(datastoreId);
    if (ds) {
      if (ds.field_width) {
        this.fieldWidth = "width:" + ds.field_width + "px;"
      }
      this.relations = ds.relations;

      if (ds.unique_fields && this.fieldsInfo) {
        ds.unique_fields.forEach(f => {
          const fList = f.split(',');
          this.uniqueFields.push(fList.map(fs => this.fieldsInfo.find(fd => fd.field_id === fs)));
        });
      }
    }
  }

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   this.controlArray.forEach(control => {
    //     this.selectControl = control;
    //     this.validateForm.get(control.field_id).markAsDirty();
    //     this.validateForm.get(control.field_id).updateValueAndValidity();
    //   });
    //   const first = this.controlArray[0];
    //   this.selectControl = first;
    //   const focusables = ['input', 'select', 'textarea'];
    //   const form = document.querySelector('form');
    //   const input: HTMLElement = form.querySelector(focusables.join(','));
    //   if (input) {
    //     input.focus();
    //   }
    // }, 50);
  }

  noblur(field: any) {
    this.validation.validSpecialChar(JSON.stringify(this.validateForm.get(field.field_id).value)).then((res: boolean) => {
      const control = this.validateForm.get(field.field_id);

      // 在控制器上添加一个自定义验证器
      control.setValidators((control: AbstractControl) => {
        if (!res) {
          // 返回一个错误对象
          return { unvalidSpecial: true };
        }
        if (field.is_required && field.value == "") {
          return { required: true };
        }
        // 如果满足条件，返回 null 表示验证通过
        return null;
      });

      // 更新控制器的验证状态
      control.updateValueAndValidity();
    });
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

    if (this.validateForm.invalid) {
      return;
    }

    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const itemId = this.route.snapshot.paramMap.get('i_id');
    const param: { items: any } = {
      items: {}
    };

    this.controlArray.forEach(element => {
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
          element.value = this.validateForm.get(element.field_id).value;
          item = {
            data_type: element.field_type,
            value: element.value ? element.value.toString() : ''
          };
          break;
        case 'options':
          element.value = this.validateForm.get(element.field_id).value;
          item = {
            data_type: element.field_type,
            value: element.value ? element.value.toString() : ''
          };
          break;
        case 'switch':
          element.value = this.validateForm.get(element.field_id).value;
          item = {
            data_type: element.field_type,
            value: element.value ? element.value.toString() : 'false'
          };
          break;
        case 'user':
          element.value = this.validateForm.get(element.field_id).value;
          item = {
            data_type: element.field_type,
            value: element.value ? element.value.toString() : ''
          };
          break;
        case 'date':
          element.value = this.validateForm.get(element.field_id).value;
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
          element.value = this.validateForm.get(element.field_id).value;
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
          element.value = this.validateForm.get(element.field_id).value;

          if (element.value) {
            const result = element.value.split(' : ');
            item = {
              data_type: element.field_type,
              value: result[0]
            };
            break;
          }

          item = {
            data_type: element.field_type,
            value: element.value
          };
          break;

        default:
          element.value = this.validateForm.get(element.field_id).value;
          item = {
            data_type: element.field_type,
            value: element.value
          };
      }

      param.items[element.field_id] = item;
    });

    if (this.isUpdate) {
      const wfId = this.route.snapshot.queryParamMap.get('wf_id');
      if (wfId) {
        this.item.update(datastoreId, itemId, param, wfId).then(res => {
          this.nxSubmit.emit();
        });
        return;
      }
      this.item.update(datastoreId, itemId, param).then(res => {
        this.nxSubmit.emit();
      });
    } else {
      this.item.insert(datastoreId, param).then(res => {
        this.nxSubmit.emit(res);
      });
    }
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
    formData.append('d_id', this.route.snapshot.paramMap.get('d_id'));
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
    formData.append('d_id', this.route.snapshot.paramMap.get('d_id'));
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

  handleDownload = (file: NzUploadFile) => {
    const fielName = file.name;
    const url = file.url;
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = fielName;
    document.body.appendChild(link);
    link.click();
  };

  /**
   * @description: 上传文件
   */
  handleChange(fid: string, { file, fileList }): void {
    const status = file.status;
    if (status !== 'uploading') {
    }
    // 文件上传成功
    if (status === 'done') {
      // 设置文件url
      fileList[fileList.length - 1].url = file.response.url;
      file.url = file.response.url;
      // 当前文件项新状态
      this.nts[fid] = fileList.map(item => item.url);
      // 上传成功消息
      this.message.success(this.i18n.translateLang('common.message.success.S_006'));
    } else if (status === 'removed') {
      // 初期文件信息
      const ofs = this.ots[fid];
      // 成功删除文件项后删除minio文件(数据尚未更新保留初期文件信息)
      const isOrigin = ofs.filter(f => f === file.url).length > 0;
      if (!isOrigin) {
        // 删除文件项目若非初期文件则立即删除其minio储存文件
        this.file.deletePublicDataFile(file.url).then((res: any) => { });
      }
      // 当前文件项新状态
      this.nts[fid] = fileList.map(item => item.url);
    } else if (status === 'error') {
      this.message.error(this.i18n.translateLang('common.message.error.E_006'));
    }

    this.nxChange.emit({ ots: this.ots, nts: this.nts });
  }

  cancel(event) {
    this.nxCancel.emit();
  }

  /**
   * @description: 打开关联台账数据选择画面
   */
  openModal(event: Event, control: any, index: number): void {
    if (event instanceof KeyboardEvent) {
      const ev = event as KeyboardEvent;
      if (ev.key === 'Enter') {
        this.selectControl = control;

        this.lookupDatastoreId = control.lookup_datastore_id;
        this.lookField = control.lookup_field_id;
        this.lookRealtionFields = {};
        this.relations.forEach(rat => {
          for (const key in rat.fields) {
            if (Object.prototype.hasOwnProperty.call(rat.fields, key)) {
              const fs = rat.fields[key];
              if (control.field_id === fs && key === control.lookup_field_id) {
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

      return;
    }

    this.selectControl = control;

    this.lookupDatastoreId = control.lookup_datastore_id;
    this.lookField = control.lookup_field_id;
    this.lookRealtionFields = {};

    if (this.relations) {
      this.relations.forEach(rat => {
        for (const key in rat.fields) {
          if (Object.prototype.hasOwnProperty.call(rat.fields, key)) {
            const fs = rat.fields[key];
            if (control.field_id === fs && key === control.lookup_field_id) {
              this.lookRealtionFields = rat.fields;
            }
          }
        }
      });
    }

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
        this.validateForm.get(fs).setValue(value);
        this.validateForm.get(fs).markAsDirty();
      }
    }

    this.isVisible = false;
  }

  /**
   * @description: 唯一性check
   */
  async uniqueValidator(uniqueFields: any[]) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    const ctls: AbstractControl[] = [];

    let eqCount = 0;
    const conditions = [];
    const keys = [];
    uniqueFields.forEach(u => {
      // 旧值
      const oldVal = this.oldControls.find(c => c.field_id === u.field_id);
      // 新值
      const newVal = this.validateForm.get(u.field_id);
      if (oldVal && newVal && oldVal.value === newVal.value) {
        eqCount++;
      }
      if (u.field_type != 'autonum') {
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
      }
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

  // 显示用户输入的值
  show(field: any) {
    this.selectControl = field;
    if (field.field_type === 'text' || field.field_type === 'textarea') {
      field.value = this.validateForm.get(field.field_id).value;
    }
  }
}
