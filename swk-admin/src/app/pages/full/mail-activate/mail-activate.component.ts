import { NzMessageService } from 'ng-zorro-antd/message';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, UserService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-mail-activate',
  templateUrl: './mail-activate.component.html',
  styleUrls: ['./mail-activate.component.less']
})
export class MailActivateComponent implements OnInit {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private message: NzMessageService
  ) {}

  // 全局类型
  validateForm: FormGroup;

  get loginId() {
    return this.validateForm.controls.loginId;
  }

  get email() {
    return this.validateForm.controls.email;
  }

  reset() {
    this.validateForm.reset();
  }

  // 激活用户通知邮箱
  submitForm(): void {
    this.userService.activeMail(this.loginId.value, this.email.value).then((re: any) => {
      if (re) {
        this.message.success(this.i18n.translateLang('common.message.success.S_012'));
        this.router.navigate(['/login']);
      } else {
        // 用户通知邮箱激活失败
        this.message.error(this.i18n.translateLang('common.message.warning.E_022'));
      }
    });
  }

  /**
   * @description: 画面初始化处理
   */
  ngOnInit(): void {
    this.validateForm = this.fb.group({
      loginId: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
      email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email])
    });

    // 初期値设定
    const loginId = this.route.snapshot.paramMap.get('loginId');
    const email = this.route.snapshot.queryParamMap.get('email');
    this.loginId.setValue(loginId);
    this.email.setValue(email);
  }
}
