/*
 * @Description: 登录控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-05-21 13:29:54
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-12-28 16:02:08
 */

import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, Observer } from 'rxjs';

import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CaptchaService } from '@api';
import { I18NService, ThemeService, TokenStorageService } from '@core';
import { NfValidators } from '@shared';

import { SecondCheckComponent } from '../second-check/second-check.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit, OnDestroy {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private i18n: I18NService,
    private captchaService: CaptchaService,
    private themeService: ThemeService,
    private tokenService: TokenStorageService,
    private modal: NzModalService,
    private ngZone: NgZone,
    private eventBus: NgEventBus,
    private message: NzMessageService
  ) {
    this.initCaptcha();
    // 监听添加菜单事件
    this.loginSubscription = eventBus.on('login:error').subscribe(() => {
      this.reset();
    });

    // 监听添加菜单事件
    this.invalidSubscription = eventBus.on('userInvalid:error').subscribe(() => {
      // 验证为非管理员，转到登录画面
      this.message.warning(this.i18n.translateLang('common.message.warning.W_003'));
      // 清空表单验证信息
      this.validateForm.reset();
      this.initCaptcha();
    });

    // 监听登录二次验证
    this.checkSubscription = this.eventBus.on('secondCheck:true').subscribe((res: any) => {
      // 打開pop
      const modalScondCheck = this.modal.create({
        nzTitle: this.i18n.translateLang('menu.secondCheckLable'),
        nzMaskClosable: false,
        nzClosable: false,
        nzComponentParams: {
          isValid: res.is_valid_app,
          user: res.user
        },
        nzContent: SecondCheckComponent,
        nzFooter: [
          {
            label: this.i18n.translateLang('common.button.ok'),
            onClick: componentInstance => {
              componentInstance.submitForm();
              modalScondCheck.close();
            }
          },
          {
            label: this.i18n.translateLang('common.button.cancel'),
            onClick: () => {
              modalScondCheck.close();
            }
          }
        ]
      });
    });

    this.eventBus.on('login:ok').subscribe((user: any) => {
      if (user.theme) {
        this.themeService.changeTheme(user.theme);
      } else {
        // 重置主题
        this.themeService.changeTheme('default');
      }
      this.i18n.switchLanguage(user.language);
      // 转到主页
      this.ngZone.run(() => this.router.navigate(['/home']));
    });
  }

  get email() {
    return this.validateForm.controls.email;
  }
  get password() {
    return this.validateForm.controls.password;
  }
  get captcha() {
    return this.validateForm.controls.captcha;
  }

  loginSubscription;
  invalidSubscription;
  checkSubscription;
  // 全局类型
  validateForm: FormGroup;
  passwordVisible = false;
  captchaImage = '';
  captchaId = '';

  countTime = 120; // 倒计时
  start;

  ngOnDestroy(): void {
    if (this.checkSubscription) {
      this.checkSubscription.unsubscribe();
    }
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
    if (this.invalidSubscription) {
      this.invalidSubscription.unsubscribe();
    }
  }

  reset() {
    // 清空表单验证信息
    this.validateForm.reset();
    this.initCaptcha();
  }

  // 登录
  submitForm(): void {
    const token = this.tokenService.getToken();
    if (token) {
      const email = this.tokenService.getUserEmail();
      if (email && email !== this.email.value) {
        this.message.error(this.i18n.translateLang('common.message.warning.W_007', { id: email }));
        return;
      }
    }

    this.auth.login(this.email.value, this.password.value).then((res: any) => {
      if (res && res.status === 2) {
        this.eventBus.cast('login:error', 'login error');
      } else {
        // 判断是否为管理员
        if (res && res.user_flg && res.user_flg === 1) {
          let app = '';
          if (res.user.current_app) {
            app = res.user.current_app;
          } else {
            app = res.user.apps[0];
          }

          const userInfo = {
            id: res.user.user_id,
            name: res.user.user_name,
            avatar: res.user.avatar,
            email: res.user.email,
            notice_email: res.user.notice_email,
            current_app: app,
            signature: res.user.signature,
            roles: res.user.roles,
            apps: res.user.apps,
            language: res.user.language,
            theme: res.user.theme,
            domain: res.user.domain,
            logo: res.user.logo,
            customer_name: res.user.customer_name,
            customer_id: res.user.customer_id,
            timezone: res.user.timezone ? res.user.timezone : '210'
          };

          this.tokenService.saveToken(res.access_token);
          this.tokenService.saveRefreshToken(res.refresh_token);
          this.tokenService.saveUser(userInfo);

          if (res.is_second_check) {
            this.eventBus.cast('secondCheck:true', res);
            return;
          }

          if (res.is_valid_app) {
            this.eventBus.cast('login:ok', res.user);
          } else {
            this.eventBus.cast('currentApp:invalid', 'currentApp invalid');
          }
        } else {
          this.eventBus.cast('userInvalid:error', 'user invalid');
        }
      }
    });
  }

  /**
   * @description: 画面初始化处理
   */
  ngOnInit(): void {
    this.validateForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, NfValidators.password]],
        captcha: ['', [Validators.required], [this.captchaAsyncValidator]]
      },
      { updateOn: 'change' }
    );
  }

  /**
   * @description: 调用服务获取验证码
   */
  async initCaptcha() {
    await this.captchaService.getCaptcha().then(res => {
      this.captchaImage = res.image;
      this.captchaId = res.captcha_id;
    });
    this.timer();
  }

  /**
   * @description: 验证码check
   */
  captchaAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      if (control.value.length < 6) {
        return;
      } else {
        this.captchaService.verifyCaptcha(this.captchaId, control.value).then((res: boolean) => {
          if (res) {
            observer.next(null);
          } else {
            observer.next({ error: true, captcha: true });
          }
          observer.complete();
        });
      }
    });

  /**
   * @description: 有效验证码定时器
   */
  timer() {
    this.countTime = 120;
    if (this.start) {
      this.validateForm.get('captcha').reset();
      clearInterval(this.start); // 清除计时器
    }
    this.start = setInterval(() => {
      // 间歇调用计时器，间隔为1000ms
      if (this.countTime > 0) {
        this.countTime--;
      } else {
        this.validateForm.get('captcha').reset();
        clearInterval(this.start); // 清除计时器
      }
    }, 1000);
  }
}
