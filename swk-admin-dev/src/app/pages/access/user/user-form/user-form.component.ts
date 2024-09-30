/*
 * @Description: 用户添加控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 15:32:08
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-15 15:53:58
 */

import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { forkJoin, Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppService, FileService, RoleService, UserService } from '@api';
import { FileUtilService, I18NService, TimeZoneService, TokenStorageService } from '@core';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.less']
})
export class UserFormComponent implements OnInit {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private i18n: I18NService,
    private roleService: RoleService,
    private location: Location,
    private event: NgEventBus,
    private route: ActivatedRoute,
    private http: HttpClient,
    private appService: AppService,
    private tokenService: TokenStorageService,
    private timeService: TimeZoneService,
    private fileUtil: FileUtilService,
    private bs: NzBreakpointService,
    private message: NzMessageService,
    private file: FileService
  ) {
    this.userForm = this.fb.group({
      user_name: ['', [Validators.required], [this.userNameAsyncValidator]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9A-Z]+[-a-z0-9A-Z._]*')], [this.emailAsyncValidator]],
      notice_email: ['', [Validators.required, Validators.email]],
      timezone: [null, [Validators.required]],
      signature: ['', []],
      language: [null, [Validators.required]],
      roles: [null, [Validators.required]]
    });
    this.supportFile = this.fileUtil.getSupportTypes(true);

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

  // 全局类型
  userForm: FormGroup;
  status = 'add';
  avatar = '';
  initavatar = '';
  save = false;
  domain = '';
  db = '';
  fileList = [];
  roleOptions: any[] = [];
  langOptions: any[] = [];
  timezones = [];
  supportFile = [];
  isSmall = false;

  /**
   * @description: 画面初期化处理
   */
  ngOnInit() {
    this.init();
  }
  /**
   * @description: 初始化处理
   */
  async init() {
    this.domain = this.tokenService.getUserDomain();

    // 获取初始数据
    forkJoin([this.timeService.getTimeZones(), this.roleService.getRoles()])
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          // 时区
          const timeData = data[0];
          if (timeData) {
            this.timezones = timeData;
          } else {
            this.timezones = [];
          }
          // 角色
          this.roleOptions = data[1];
        }
      });
    this.langOptions = this.i18n.getLangs();
    await this.getUserInfo();
  }

  /**
   * @description: 调用服务通过用户id获取用户信息
   */
  async getUserInfo() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.status = 'edit';
      await this.userService.getUserByID(id).then(res => {
        this.userForm.controls.user_name.setValue(res.user_name);
        this.userForm.controls.email.setValue(res.email.replace(`@${this.domain}`, ''));
        this.userForm.controls.notice_email.setValue(res.notice_email);
        this.userForm.controls.timezone.setValue(res.timezone);
        this.userForm.controls.signature.setValue(res.signature);
        this.userForm.controls.language.setValue(res.language);
        this.userForm.controls.roles.setValue(res.roles);
        this.avatar = res.avatar;
        this.initavatar = res.avatar;
        if (res.user_type === 2) {
          this.userForm.get('user_name').disable();
          this.userForm.get('email').disable();
          this.userForm.get('notice_email').disable();
          this.userForm.get('roles').disable();
        }
      });
    }
  }

  /**
   * @description: 用户名称唯一性检查
   */
  userNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const id = this.route.snapshot.paramMap.get('id');
      this.userService.usereAsyncValidator(id, control.value, 'name').then((user: boolean) => {
        if (!user) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 登录ID唯一性检查
   */
  emailAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const id = this.route.snapshot.paramMap.get('id');
      this.userService.usereAsyncValidator(id, control.value, 'email').then((user: boolean) => {
        if (!user) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 提交添加用户的信息
   */
  submitUserForm = async ($event: any, value: any) => {
    const params = value;
    params.email = this.userForm.get('email').value + '@' + this.domain;
    params.avatar = this.avatar;

    if (this.status === 'add') {
      // 通过调用服务添加用户
      this.userService.addUser(params).then(res => {
        this.reset();
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.event.cast('user:refresh');
        this.location.back();
      });
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      this.userService.updateUser(params, id).then(res => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.event.cast('user:refresh');
        this.location.back();
      });
    }
  };

  /**
   * @description: 重置添加用户表单
   */
  reset(): void {
    this.userForm.reset();
    this.userForm.controls.email.setValue('');
    this.avatar = '';
  }

  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
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
    return true;
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
