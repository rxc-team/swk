/*
 * @Description: 会社Controller
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-12-10 10:55:50
 */
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import {
    HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse
} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService, FileService, LevelService } from '@api';
import { FileUtilService, I18NService, TimeZoneService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.less']
})
export class CustomerFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private timeService: TimeZoneService,
    private ls: LevelService,
    private customer: CustomerService,
    private file: FileService,
    private location: Location,
    private event: NgEventBus,
    private http: HttpClient,
    private fileUtil: FileUtilService,
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

  validateForm: FormGroup;

  // 判断迁移元用，默认是添加
  status = 'add';
  save = false;
  logo = '';
  initLogo = '';
  supportFile = [];
  fileList = [];
  // 语言列表
  langOptions = [];
  // 时区列表
  timezones = [];
  isSmall = false;

  levels = [];

  /**
   * @description: 画面初期化処理
   */
  ngOnInit(): void {
    this.timeService.getTimeZones().then((data: any[]) => {
      if (data) {
        this.timezones = data;
      } else {
        this.timezones = [];
      }
    });
    this.ls.getLevels().then((data: any[]) => {
      if (data) {
        this.levels = data;
      } else {
        this.levels = [];
      }
    });
    this.langOptions = this.i18n.getLangs();
    this.supportFile = this.fileUtil.getSupportTypes(true);
    this.validateForm = this.fb.group({
      customerName: ['', [Validators.required], [this.customerNameAsyncValidator]],
      defaultUser: ['', [Validators.required, NfValidators.halfAlphaNumber]],
      defaultUserEmail: ['', [Validators.required, Validators.email]],
      secondCheck: [false, []],
      maxUsers: [1, [Validators.required]],
      maxSize: [1, [Validators.required]],
      maxDataSize: [1, [Validators.required]],
      timezone: ['', [Validators.required]],
      language: ['', [Validators.required]],
      level: ['', [Validators.required]],
      uploadFileSize: [5, [Validators.required]],
      domain: ['', [Validators.required, NfValidators.domain, Validators.pattern('[^A-Z]*')], [this.domainAsyncValidator]]
    });

    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.status = 'edit';
      this.getCustomerInfo();
    }
  }

  /**
   * @description: 会社情報取得
   */
  getCustomerInfo() {
    const id = this.route.snapshot.paramMap.get('id');
    this.customer.getCustomerByID(id).then(res => {
      this.validateForm.controls.customerName.setValue(res.customer_name);
      this.validateForm.controls.domain.setValue(res.domain);
      this.validateForm.controls.defaultUserEmail.setValue(res.default_user_email);
      this.validateForm.controls.secondCheck.setValue(res.second_check);
      this.validateForm.controls.defaultUser.setValue(res.default_user);
      this.validateForm.controls.timezone.setValue(res.default_timezone);
      this.validateForm.controls.language.setValue(res.default_language);
      this.validateForm.controls.maxUsers.setValue(res.max_users);
      this.validateForm.controls.maxSize.setValue(res.max_size);
      this.validateForm.controls.maxDataSize.setValue(res.max_data_size);
      this.validateForm.controls.level.setValue(res.level);
      this.validateForm.controls.uploadFileSize.setValue(res.upload_file_size);
      this.logo = res.customer_logo;
      this.initLogo = res.customer_logo;
    });
  }

  /**
   * @description: 提交表单
   */
  submitForm(): void {
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    const id = this.route.snapshot.paramMap.get('id');
    const params = {
      customer_name: this.validateForm.controls.customerName.value,
      second_check: id ? this.validateForm.controls.secondCheck.value.toString() : this.validateForm.controls.secondCheck.value,
      customer_logo: this.logo,
      default_user: this.validateForm.controls.defaultUser.value,
      default_timezone: this.validateForm.controls.timezone.value,
      default_language: this.validateForm.controls.language.value,
      domain: this.validateForm.controls.domain.value,
      max_users: this.validateForm.controls.maxUsers.value,
      max_size: this.validateForm.controls.maxSize.value,
      max_data_size: this.validateForm.controls.maxDataSize.value,
      default_user_email: this.validateForm.controls.defaultUserEmail.value,
      level: this.validateForm.controls.level.value,
      upload_file_size: this.validateForm.controls.uploadFileSize.value
    };

    if (id) {
      this.customer.updateCustomer(params, id).then(() => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.event.cast('customer:refresh');
      });
    } else {
      this.customer.addCustomer(params).then(() => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.event.cast('customer:refresh');
      });
    }
    this.save = true;
    this.location.back();
  }

  /**
   * @description: 客户名称唯一性检查
   */
  customerNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const id = this.route.snapshot.paramMap.get('id');
      this.customer.customerAsyncValidator(id, control.value, 'name').then((customer: boolean) => {
        if (!customer) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 域名唯一性检查
   */
  domainAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const id = this.route.snapshot.paramMap.get('id');
      this.customer.customerAsyncValidator(id, control.value, 'domain').then((customer: boolean) => {
        if (!customer) {
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
    this.validateForm.reset();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getCustomerInfo();
    }
  }

  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
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
      const url = file.response.url;
      // 新LOGO文件上传成功后删除变更前的LOGO文件(数据尚未更新保留初始化时的LOGO文件信息)
      if (this.logo && this.logo !== this.initLogo) {
        this.file.deletePublicHeaderFile(this.logo);
      }
      this.logo = url;
      fileList = [];
      this.fileList = [];
      this.message.success(this.i18n.translateLang('common.message.success.S_006'));
    } else if (status === 'error') {
      this.message.error(this.i18n.translateLang('common.message.error.E_006'));
    }
  }

  // 图片上传前
  beforeUploadPic = (file: NzUploadFile): boolean => {
    // 上传文件类型限制
    const isSupportFileType = this.fileUtil.checkSupport(file.type, true);
    if (!isSupportFileType) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
      return false;
    }

    // 上传文件大小限制
    const isLt5M = this.fileUtil.checkSize(file.size);
    if (!isLt5M) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
      return false;
    }
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
}
