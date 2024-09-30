import { addDays, format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatastoreService, Schedule, ScheduleService, ValidationService } from '@api';
import { I18NService, TokenStorageService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.less']
})
export class ScheduleFormComponent implements OnInit {
  form: FormGroup;
  status = 'add';
  datastoreList = [];
  datastoreId = '';
  isSmall = false;

  constructor(
    private tokenService: TokenStorageService,
    private schedule: ScheduleService,
    private message: NzMessageService,
    private i18n: I18NService,
    private location: Location,
    private event: NgEventBus,
    private fb: FormBuilder,
    private ar: ActivatedRoute,
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
    const timezone = this.tokenService.getUserTimeZone();
    this.form = this.fb.group({
      scheduleName: ['', [Validators.required]],
      runType: [`now`, [Validators.required]],
      spec: [`TZ=${timezone} 0 0 * * ?`, [Validators.required]],
      startTime: [null, [Validators.required, this.timeCompareValidator]],
      endTime: [null, [Validators.required]],
      scheduleType: [null, [Validators.required]]
    });
  }

  /**
   * @description: パスワード更新確認
   */
  validateEndTime(): void {
    setTimeout(() => this.form.controls.startTime.updateValueAndValidity());
  }

  /**
   * @description: 验证开始日期必须大于结束日期
   */
  timeCompareValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    if (!control.value || !this.form.get('endTime').value) {
      return null;
    }

    const start = format(control.value, 'yyyy-MM-dd');
    const end = format(this.form.get('endTime').value, 'yyyy-MM-dd');

    if (start && end) {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      if (startTime >= endTime) {
        return { compare: true };
      }
      return null;
    }
  };

  ngOnInit(): void {
    const isBackup = this.ar.snapshot.queryParamMap.get('backup') ? true : false;
    if (isBackup) {
      this.form.get('scheduleType').reset({ value: 'db-backup', disabled: true });
    }
    const now = new Date();
    this.form.get('startTime').setValue(now);
    const next = addDays(now, 1);
    this.form.get('endTime').setValue(next);
  }

  runTypeChange(val: string) {
    if (val === 'now') {
      const now = new Date();
      this.form.get('startTime').setValue(now);
      const next = addDays(now, 1);
      this.form.get('endTime').setValue(next);
    } else {
      this.form.get('startTime').setValue(null);
      this.form.get('endTime').setValue(null);
    }
  }

  /**
   * @description: 提交添加用户的信息
   */
  submitForm = ($event: any) => {
    const scheduleParams: any = {};

    const params: Schedule = {
      schedule_name: this.form.get('scheduleName').value,
      spec: this.form.get('spec').value.toString(),
      multi: 0,
      retry_times: 1,
      retry_interval: 1000,
      start_time: format(this.form.get('startTime').value, 'yyyy-MM-dd'),
      end_time: format(this.form.get('endTime').value, 'yyyy-MM-dd'),
      schedule_type: this.form.get('scheduleType').value,
      run_now: this.form.get('runType').value === 'now',
      params: scheduleParams
    };

    if (this.status === 'add') {
      // 通过调用服务添加任务计划
      this.schedule.createSchedule(params).then(async res => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.event.cast('schedule:refresh');
        this.location.back();
      });
    }
  };

  back() {
    this.location.back();
  }
}
