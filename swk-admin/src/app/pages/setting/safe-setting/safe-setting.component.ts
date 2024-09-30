/*
 * @Description: セキュリティ設定画面コントローラー
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-15 16:04:16
 */

import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';
import { take } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserService, ValidationService } from '@api';
import { I18NService, RouteStrategyService, TokenStorageService } from '@core';
import { Select, Store } from '@ngxs/store';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-safe-setting',
  templateUrl: './safe-setting.component.html',
  styleUrls: ['./safe-setting.component.less']
})
export class SafeSettingComponent implements OnInit {
  passwordForm: FormGroup;
  userID = '';
  email = '';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private auth: AuthService,
    private tokenService: TokenStorageService,
    private validation: ValidationService,
    private message: NzMessageService,
    private i18n: I18NService,
    private userService: UserService
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required, NfValidators.password], [this.passwordAsyncValidator]],
      newPassword: ['', [Validators.required, NfValidators.password]],
      confirm: ['', [this.confirmValidator]]
    });
  }

  /**
   * @description: 画面初期化
   */
  ngOnInit() {
    const user = this.tokenService.getUser();
    this.userID = user.id;
    this.email = user.email;
  }

  /**
   * @description: サブミット
   */
  submitPasswordForm = ($event: any, value: any) => {
    $event.preventDefault();
    // tslint:disable-next-line: forin
    for (const key in this.passwordForm.controls) {
      this.passwordForm.controls[key].markAsDirty();
      this.passwordForm.controls[key].updateValueAndValidity();
    }

    this.userService
      .updateUser(
        {
          password: this.passwordForm.controls.newPassword.value,
          email: this.email
        },
        this.userID
      )
      .then(() => {
        this.message.success(this.i18n.translateLang('common.message.success.S_007'));
        this.logout();
      });
  };

  /**
   * @description: ログアウト
   */
  logout() {
    this.tokenService.signOut();
  }

  /**
   * @description: パスワード更新確認
   */
  validateConfirmPassword(): void {
    setTimeout(() => this.passwordForm.controls.confirm.updateValueAndValidity());
  }

  /**
   * @description: 旧パスワード確認
   */
  passwordAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.validation.validationPassword({ email: this.email, password: control.value }).then((res: boolean) => {
        if (res) {
          observer.next(null);
        } else {
          observer.next({ error: true, duplicated: true });
        }
        observer.complete();
      });
    });

  /**
   * @description: 新パスワード確認
   */
  confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.passwordForm.controls.newPassword.value) {
      return { confirm: true, error: true };
    }
    return {};
  };
}
