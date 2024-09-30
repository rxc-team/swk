import { NzMessageService } from 'ng-zorro-antd/message';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, ValidationService } from '@api';
import { I18NService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.less']
})
export class PasswordResetComponent implements OnInit {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private userService: UserService,
    private validationService: ValidationService,
    private message: NzMessageService
  ) {
    this.validateForm = this.fb.group({
      newPassword: ['', [Validators.required, NfValidators.password]],
      confirm: ['', [this.confirmValidator]]
    });
  }

  // 全局类型
  validateForm: FormGroup;
  token = '';
  validTokenMsg = '';

  /**
   * @description: 画面初始化处理
   */
  async ngOnInit(): Promise<void> {
    // 初期値设定
    this.token = this.route.snapshot.paramMap.get('token');
    // token验证
    await this.validationService.validationToken(this.token).then((r: any) => {
      if (r) {
        if (r.code === '') {
          this.validTokenMsg = '';
        } else if (r.code === 'nullTokenErr') {
          this.validTokenMsg = 'common.message.error.E_012';
        } else if (r.code === 'parseTokenErr') {
          this.validTokenMsg = 'common.message.error.E_013';
        } else if (r.code === 'expiredTokenErr') {
          this.validTokenMsg = 'common.message.error.E_014';
        } else {
          this.validTokenMsg = 'common.message.error.E_007';
        }
      } else {
        this.validTokenMsg = 'common.message.error.E_007';
      }
    });
    if (this.validTokenMsg === '') {
      this.validateForm.reset();
    }
  }

  /**
   * @description: パスワード更新確認
   */
  validateConfirmPassword(): void {
    setTimeout(() => this.validateForm.controls.confirm.updateValueAndValidity());
  }

  /**
   * @description: 新パスワード確認
   */
  confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.newPassword.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  /**
   * @description: サブミット
   */
  submitPasswordForm = ($event: any, value: any) => {
    $event.preventDefault();
    // tslint:disable-next-line: forin
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    const newPassword = this.validateForm.controls.newPassword.value;
    this.userService.setNewPassword(this.token, newPassword).then((r: any) => {
      if (r) {
        if (r.code === 'nullTokenErr') {
          // 空令牌
          this.message.error(this.i18n.translateLang('common.message.error.E_012'));
          return;
        }
        if (r.code === 'parseTokenErr') {
          // 无效令牌
          this.message.error(this.i18n.translateLang('common.message.error.E_013'));
          return;
        }
        if (r.code === 'expiredTokenErr') {
          // 过期令牌
          this.message.error(this.i18n.translateLang('common.message.error.E_014'));
          return;
        }
        this.message.success(this.i18n.translateLang('common.message.success.S_014'));
        this.router.navigate(['/login']);
      } else {
        // 新密码设置失败
        this.message.error(this.i18n.translateLang('common.message.error.E_011'));
      }
    });
  };
}
