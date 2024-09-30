/*
 * @Description: 基本設定画面コントローラー
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-15 15:57:28
 */

import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FileService, UserService } from '@api';
import { FileUtilService, I18NService, TimeZoneService, TokenStorageService } from '@core';
import { Select, Store } from '@ngxs/store';

@Component({
  selector: 'app-base-setting',
  templateUrl: './base-setting.component.html',
  styleUrls: ['./base-setting.component.less']
})
export class BaseSettingComponent implements OnInit {
  userForm: FormGroup;
  fileList = [];
  userID = '';
  avatar = '';
  initavatar = '';
  save = false;
  timezones = [];
  supportFile = [];
  noticeEmailStatus = '';
  initNoticeEmail = '';
  initNoticeEmailStatus = '';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private http: HttpClient,
    private timeService: TimeZoneService,
    private tokenService: TokenStorageService,
    private userService: UserService,
    private message: NzMessageService,
    private i18n: I18NService,
    private fileUtil: FileUtilService,
    private file: FileService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
      // noticeEmail: ['', [Validators.email, Validators.required]],
      noticeEmail: ['', [Validators.email]],
      name: ['', [Validators.required]],
      timezone: ['', [Validators.required]],
      signature: ['', []]
    });

    this.supportFile = fileUtil.getSupportTypes(true);
  }
  get name() {
    return this.userForm.controls.name.value;
  }
  get signature() {
    return this.userForm.controls.signature.value;
  }
  get timezone() {
    return this.userForm.controls.timezone.value;
  }
  get noticeEmail() {
    return this.userForm.controls.noticeEmail.value;
  }
  get email() {
    return this.userForm.controls.email.value;
  }
  /**
   * @description: 画面初期化
   */
  async ngOnInit() {
    this.userID = this.tokenService.getUserId();

    await this.timeService.getTimeZones().then((data: any[]) => {
      if (data) {
        this.timezones = data;
      } else {
        this.timezones = [];
      }
    });

    this.userService.getUserByID({ type: '0', user_id: this.userID }).then(data => {
      if (data) {
        this.userForm.controls.email.setValue(data.email);
        this.userForm.controls.noticeEmail.setValue(data.notice_email);
        this.userForm.controls.name.setValue(data.user_name);
        this.userForm.controls.signature.setValue(data.signature);
        this.userForm.controls.timezone.setValue(data.timezone);
        this.avatar = data.avatar;
        this.initavatar = data.avatar;

        // 通知邮箱状态判断
        if (data.notice_email && data.notice_email_status === 'UnVerified') {
          this.noticeEmailStatus = 'UnVerified';
        } else if (data.notice_email && data.notice_email_status === 'Verifying') {
          this.noticeEmailStatus = 'Verifying';
        } else if (data.notice_email && data.notice_email_status === 'Verified') {
          this.noticeEmailStatus = 'Verified';
        } else {
          this.noticeEmailStatus = '';
        }

        // 初期通知邮箱状态
        this.initNoticeEmail = data.notice_email;
        this.initNoticeEmailStatus = this.noticeEmailStatus;
      }
    });
  }

  // 通知邮件变更
  ngModelChange(mail: string) {
    if (this.userForm.controls.noticeEmail.valid) {
      if (this.initNoticeEmail !== mail && mail !== '') {
        this.noticeEmailStatus = 'UnVerified';
      } else {
        this.noticeEmailStatus = this.initNoticeEmailStatus;
      }
    } else {
      this.noticeEmailStatus = '';
    }
  }

  // 通知邮件更新
  async noticeEmailUp() {
    await this.userService
      .updateUser(
        {
          email: this.email,
          notice_email: this.noticeEmail,
          notice_email_status: 'Verifying'
        },
        this.userID
      )
      .then(() => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        // 更新成功，重新加载页面
        this.ngOnInit();
      });
  }

  // サブミット
  async submitUserForm(event) {
    event.preventDefault();
    // tslint:disable-next-line: forin
    for (const key in this.userForm.controls) {
      this.userForm.controls[key].markAsDirty();
      this.userForm.controls[key].updateValueAndValidity();
    }

    const change = {
      user_name: this.name,
      // notice_email: this.noticeEmail,
      // notice_email_status: this.noticeEmailStatus === 'Verifying' ? '' : this.noticeEmailStatus,
      signature: this.signature,
      timezone: this.timezone,
      avatar: this.avatar
    };

    await this.userService.updateUser(change, this.userID).then(() => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    });

    await this.tokenService.updateUser(change);

    this.save = true;
    this.router.navigate(['/home']);
  }

  getZoneName(item) {
    const store = JSON.parse(window.localStorage.getItem('@@STATE'));
    const langCd = store.user.userInfo.language;

    switch (langCd) {
      case 'zh-CN':
        return item.zh + item.offset_zh;
      case 'ja-JP':
        return item.jp + item.offset_jp;
      case 'en-US':
        return item.en + item.offset_en;
      default:
        break;
    }
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
      if (this.avatar && this.avatar !== this.initavatar) {
        this.file.deletePublicHeaderFile(this.avatar).then((res: any) => {});
      }
      this.avatar = url;
      fileList = [];
      this.fileList = [];
      this.message.success(this.i18n.translateLang('common.message.success.S_006'));
    } else if (status === 'error') {
      this.message.error(this.i18n.translateLang('common.message.error.E_006'));
    }
  }

  // 图片上传前
  beforeUploadPic = (file: NzUploadFile, fileList: NzUploadFile[]): boolean => {
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
}
