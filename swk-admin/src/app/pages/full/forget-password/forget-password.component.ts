import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CaptchaService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.less']
})
export class ForgetPasswordComponent implements OnInit {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private captchaService: CaptchaService,
    private i18n: I18NService,
    private message: NzMessageService
  ) {
    this.initCaptcha();
  }

  // 全局类型
  validateForm: FormGroup;

  captchaImage = '';
  captchaId = '';
  get loginId() {
    return this.validateForm.controls.loginId;
  }
  get email() {
    return this.validateForm.controls.email;
  }
  get captcha() {
    return this.validateForm.controls.captcha;
  }

  countTime = 120; // 倒计时
  start;

  reset() {
    // 清空表单验证信息
    this.validateForm.reset();
    this.initCaptcha();
  }

  // 确认邮箱,若是邮箱存在且验证过,即发送密码重置邮件
  submitForm(): void {
    // 发送密码重置邮件
    this.authService.userPasswordReset(this.loginId.value, this.email.value).then((r: any) => {
      if (r) {
        if (r.code === 'nofound') {
          // 邮箱不存在
          this.message.warning(this.i18n.translateLang('common.message.warning.W_009'));
          return;
        }
        if (r.code === 'unverified') {
          // 邮箱未验证
          this.message.warning(this.i18n.translateLang('common.message.warning.W_010'));
          return;
        }
        if (r.code === 'nomatch') {
          // 邮箱不匹配
          this.message.error(this.i18n.translateLang('common.message.warning.W_014'));
          return;
        }
        if (r.code === 'createTokenErr') {
          // 临时令牌生成错误
          this.message.error(this.i18n.translateLang('common.message.error.E_031'));
          return;
        }
        // 密码重置邮件发送成功
        this.message.success(this.i18n.translateLang('common.message.success.S_014'));
        this.router.navigate(['/login']);
      } else {
        // 密码重置邮件发送失败
        this.message.error(this.i18n.translateLang('common.message.error.E_034'));
      }
    });
  }

  /**
   * @description: 画面初始化处理
   */
  ngOnInit(): void {
    this.validateForm = this.fb.group({
      loginId: ['', [Validators.required, Validators.email]],
      email: ['', [Validators.required, Validators.email]],
      captcha: ['', [Validators.required], [this.captchaAsyncValidator]]
    });
  }

  /**
   * @description: 调用服务获取验证码
   */
  initCaptcha() {
    this.captchaService.getCaptcha().then(res => {
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
      this.captchaService.verifyCaptcha(this.captchaId, control.value).then((res: boolean) => {
        if (res) {
          observer.next(null);
        } else {
          observer.next({ error: true, captcha: true });
        }
        observer.complete();
      });
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
