import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from '@api';
import { I18NService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-mail-setting',
  templateUrl: './mail-setting.component.html',
  styleUrls: ['./mail-setting.component.less']
})
export class MailSettingComponent implements OnInit {
  mailConfigForm: FormGroup;
  status = '';
  configID = '';
  isSmall = false;

  constructor(
    private configService: ConfigService,
    private message: NzMessageService,
    private i18n: I18NService,
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
    this.mailConfigForm = new FormGroup({
      mail: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      host: new FormControl('', Validators.required),
      port: new FormControl('', [Validators.required, NfValidators.halfNumber]),
      ssl: new FormControl('', Validators.required)
    });
  }

  get mail() {
    return this.mailConfigForm.controls.mail.value;
  }
  get password() {
    return this.mailConfigForm.controls.password.value;
  }
  get host() {
    return this.mailConfigForm.controls.host.value;
  }
  get port() {
    return this.mailConfigForm.controls.port.value;
  }
  get ssl() {
    return this.mailConfigForm.controls.ssl.value;
  }

  /**
   * @description: 画面初期化
   */
  async ngOnInit() {
    await this.configService.getConfig().then((data: any) => {
      if (data.config_id) {
        let ssl = true;
        ssl = data.ssl === 'true' ? true : false;
        this.status = 'edit';
        this.configID = data.config_id;
        this.mailConfigForm.controls.mail.setValue(data.mail);
        this.mailConfigForm.controls.password.setValue(data.password);
        this.mailConfigForm.controls.host.setValue(data.host);
        this.mailConfigForm.controls.port.setValue(data.port);
        this.mailConfigForm.controls.ssl.setValue(ssl);
      } else {
        this.status = 'add';
      }
    });
  }

  // 提交表单
  async submitUserForm(event) {
    event.preventDefault();
    // tslint:disable-next-line: forin
    for (const key in this.mailConfigForm.controls) {
      this.mailConfigForm.controls[key].markAsDirty();
      this.mailConfigForm.controls[key].updateValueAndValidity();
    }

    if (this.status === 'edit') {
      // 更新邮箱设置
      await this.configService
        .updateConfig(
          {
            mail: this.mail,
            password: this.password,
            host: this.host,
            port: this.port,
            ssl: this.ssl ? 'true' : 'false'
          },
          this.configID
        )
        .then(() => {
          this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        });
    } else {
      // 新建邮箱设置
      await this.configService
        .addConfig({
          mail: this.mail,
          password: this.password,
          host: this.host,
          port: this.port,
          ssl: this.ssl ? 'true' : 'false'
        })
        .then(() => {
          this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        });
    }
  }
}
