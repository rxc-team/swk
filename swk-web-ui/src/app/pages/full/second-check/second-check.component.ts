/*
 * @Descripttion:
 * @Author: Rxc 陳平
 * @Date: 2020-07-31 16:31:20
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2021-01-07 17:59:25
 */

import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaptchaService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-second-check',
  template: `
    <div style="padding: 8px 8px;">
      <div style="height:40px;">
        <form nz-form [formGroup]="validateForm">
          <nz-form-item>
            <nz-form-label nzRequired="true">
              {{ 'page.login.captcha' | translate }}
            </nz-form-label>
            <nz-form-control nzSpan="12" [nzErrorTip]="captcha">
              <nz-input-group>
                <input nz-input formControlName="captcha" [placeholder]="'page.login.captcha' | translate" minlength="6" />
              </nz-input-group>
              <ng-template #captcha let-control>
                <ng-container *ngIf="control.hasError('required')">
                  {{ 'page.login.validator.captchaRequired' | translate }}
                </ng-container>
              </ng-template>
            </nz-form-control>
            <nz-form-control nzSpan="5">
              <div style="display: inline-block;width: 120px; color:dodgerblue" *ngIf="countTime !== 0">
                <span *ngIf="countTime > 0" style="display: inline-block;width: 30px;margin-left: 12px;">{{ countTime }}s</span>
              </div>
              <div style="display: inline-block;width: 120px;font-size: 12px;" *ngIf="countTime === 0">
                <span style="color: red;margin-left: 12px;">{{ 'page.home.expired' | translate }}</span>
              </div>
            </nz-form-control>
          </nz-form-item>
        </form>
      </div>
    </div>
  `
})
export class SecondCheckComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private eventBus: NgEventBus,
    private captchaService: CaptchaService,
    private i18n: I18NService,
    private message: NzMessageService
  ) {}

  @Input() isValid = false;
  @Input() user: any;

  // 二次验证码
  captchaValue: string;
  captchaID: string;
  // 全局类型
  validateForm: FormGroup;
  countTime = 120; // 倒计时
  start;

  /**
   * @description: 画面初始化处理
   */
  ngOnInit(): void {
    this.validateForm = this.fb.group({
      captcha: ['', [Validators.required]]
    });

    // 发送验证码邮件
    this.captchaService.getSecondCaptcha(this.user.customer_id, this.user.user_id, this.user.email, this.user.notice_email).then(res => {
      if (res) {
        this.captchaID = res.captcha_id;
        this.timer();
      } else {
        // 无法发送验证码
        this.message.error(this.i18n.translateLang('common.message.error.E_023'));
      }
    });
  }

  /**
   * @description: 提交验证
   */
  submitForm() {
    this.captchaValue = this.validateForm.controls.captcha.value;
    this.captchaService.VerifySecondCaptcha(this.captchaID, this.captchaValue).then((res: boolean) => {
      if (res) {
        if (this.isValid) {
          this.eventBus.cast('login:ok', this.user);
        } else {
          this.eventBus.cast('currentApp:invalid', 'currentApp invalid');
        }
      } else {
        // 登录验证失败
        this.message.error(this.i18n.translateLang('common.message.error.E_014'));
      }
    });
  }

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
