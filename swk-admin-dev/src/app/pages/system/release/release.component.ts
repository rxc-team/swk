import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-release',
  templateUrl: './release.component.html',
  styleUrls: ['./release.component.less']
})
export class ReleaseComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private system: SystemService,
    private message: NzMessageService,
    private bs: NzBreakpointService
  ) {
    this.form = this.fb.group({
      status: ['', [Validators.required]],
      ip_list: [null, []],
      maint_summary: [null, []],
      maint_period: [null, []],
      maint_remark: [null, []]
    });

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

  form: FormGroup;

  isSmall = false;

  /**
   * @description: 画面初期化処理
   */
  ngOnInit(): void {
    this.system.getStatus().then((data: any) => {
      if (data) {
        console.log(data);
        this.form.get('status').setValue(data.status === 'true' ? true : false);
        this.form.get('ip_list').setValue(data.ip_list);
        this.form.get('maint_summary').setValue(data.maint_summary);
        this.form.get('maint_period').setValue(data.maint_period);
        this.form.get('maint_remark').setValue(data.maint_remark);
      }
    });
  }

  /**
   * @description: 提交表单
   */
  submitForm(): void {
    // tslint:disable-next-line: forin
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (this.form.invalid) {
      return;
    }

    const params = {
      status: this.form.get('status').value.toString(),
      ip_list: this.form.get('ip_list').value,
      maint_summary: this.form.get('maint_summary').value,
      maint_period: this.form.get('maint_period').value,
      maint_remark: this.form.get('maint_remark').value
    };

    this.system.updateStatus(params).then(() => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    });
  }
}
