import { format } from 'date-fns';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzBytesPipe } from 'ng-zorro-antd/pipes';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AppService, CustomerService, FileService } from '@api';
import { FileUtilService, I18NService, TokenStorageService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.less']
})
export class SettingComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private customer: CustomerService,
    private app: AppService,
    private http: HttpClient,
    private file: FileService,
    private bs: NzBreakpointService,
    private tokenService: TokenStorageService,
    private location: Location,
    private nzBytes: NzBytesPipe,
    private fileUtil: FileUtilService,
    private message: NzMessageService
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
  logo = '';
  initLogo = '';
  save = false;
  supportFile = [];
  fileList = [];
  customerId = '';
  domain = '';
  selectIndex = 0;
  isSmall = false;

  /**
   * @description: 画面初期化処理
   */
  async ngOnInit() {
    this.supportFile = this.fileUtil.getSupportTypes(true);
    this.validateForm = this.fb.group({
      customerName: [null, [Validators.required], [this.customerNameAsyncValidator]],
      domain: [{ value: null, disabled: true }, [Validators.required, NfValidators.domain], []],
      secondCheck: [null, []],
      maxUsers: [{ value: null, disabled: true }, []],
      usedUsers: [{ value: null, disabled: true }, []],
      maxSize: [{ value: null, disabled: true }, []],
      usedSize: [{ value: null, disabled: true }, []],
      maxDataSize: [{ value: null, disabled: true }, []],
      usedDataSize: [{ value: null, disabled: true }, []]
    });

    this.getCustomerInfo();
  }

  /**
   * @description: 会社情報取得
   */
  getCustomerInfo() {
    const user = this.tokenService.getUser();
    this.customerId = user.customer_id;
    this.domain = user.domain;
    this.customer.getCustomerByID(this.customerId).then(res => {
      this.validateForm.controls.customerName.setValue(res.customer_name);
      this.validateForm.controls.domain.setValue(res.domain);
      this.validateForm.controls.secondCheck.setValue(res.second_check);
      this.logo = res.customer_logo;
      this.initLogo = res.customer_logo;
      this.validateForm.controls.maxUsers.setValue(res.max_users);
      this.validateForm.controls.usedUsers.setValue(res.used_users);
      this.validateForm.controls.maxSize.setValue(res.max_size + ' GB');
      this.validateForm.controls.usedSize.setValue(this.nzBytes.transform(res.used_size, 2, 'B', 'GB'));
      this.validateForm.controls.maxDataSize.setValue(res.max_data_size + ' GB');
      this.validateForm.controls.usedDataSize.setValue(this.nzBytes.transform(res.used_data_size, 2, 'B', 'GB'));
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

    const params = {
      customer_name: this.validateForm.controls.customerName.value,
      customer_logo: this.logo,
      second_check: this.validateForm.controls.secondCheck.value.toString(),
      domain: this.validateForm.controls.domain.value
    };

    this.customer.updateCustomer(params, this.customerId).then(() => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    });
    this.save = true;
    this.location.back();
  }

  percent(max: number, used: number) {
    return `${((used / max) * 100).toFixed(2)}%`;
  }

  percentData(max: string, used: string) {
    if (max && used) {
      max = max.slice(0, max.length - 3);
      used = used.slice(0, used.length - 3);

      const maxData = Number(max);
      const usedData = Number(used);

      return `${((usedData / maxData) * 100).toFixed(2)}%`;
    }
    return '?%';
  }

  /**
   * @description: 客户名称唯一性检查
   */
  customerNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.customer.customerNameAsyncValidator(control.value, this.customerId, '1').then((customer: boolean) => {
        if (!customer) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

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
      if (this.logo && this.logo !== this.initLogo) {
        this.file.deletePublicHeaderFile(this.logo).then((res: any) => {});
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
