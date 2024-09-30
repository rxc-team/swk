import { format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-login-list',
  templateUrl: './login-list.component.html',
  styleUrls: ['./login-list.component.less']
})
export class LoginListComponent implements OnInit {
  cols = [
    {
      title: 'page.logger.login.id',
      width: '200px'
    },
    {
      title: 'page.logger.login.ip',
      width: '100px'
    },
    {
      title: 'page.logger.login.status',
      width: '100px'
    },
    {
      title: 'page.logger.login.time',
      width: '150px'
    },
    {
      title: 'page.logger.login.msg'
    }
  ];

  constructor(
    private log: LoggerService,
    private eventBus: NgEventBus,
    private i18n: I18NService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.seachForm = this.fb.group({
      loginName: ['', [Validators.email]],
      loginStatus: ['', []],
      startTime: ['', []],
      endTime: ['', []]
    });
  }

  displayData = [];

  seachForm: FormGroup;

  loading = false;

  // 当前页面index
  pageIndex = 1;
  // 当前页面展示数据条数
  pageSize = 30;
  // 总的条数
  total = 0;

  ngOnInit() {
    this.search();
  }

  /**
   * @description: 検索
   */
  search(): void {
    this.loading = true;
    this.displayData = [];

    let startTime = '';
    if (this.seachForm.controls.startTime.value) {
      startTime = format(new Date(this.seachForm.controls.startTime.value), 'yyyy-MM-dd');
    }
    let endTime = '';
    if (this.seachForm.controls.endTime.value) {
      endTime = format(new Date(this.seachForm.controls.endTime.value), 'yyyy-MM-dd');
    }

    const params = {
      level: this.seachForm.controls.loginStatus.value,
      user_id: this.seachForm.controls.loginName.value,
      start_time: startTime,
      end_time: endTime,
      log_type: 'login',
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    };
    this.log.getLogList(params).then((data: any) => {
      if (data && data.total > 0) {
        this.displayData = data.loggers;
        this.total = data.total;
      } else {
        this.displayData = [];
        this.total = 0;
      }
      this.loading = false;
    });
  }

  reSearch() {
    this.pageSize = 30;
    this.pageIndex = 1;
    this.search();
  }
  /**
   * @description: 表单重置
   */
  resetForm(): void {
    this.seachForm.reset();
  }

  /**
   * @description: 下载日志
   */
  downloadLog() {
    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;
    let startTime = '';
    if (this.seachForm.controls.startTime.value) {
      startTime = format(new Date(this.seachForm.controls.startTime.value), 'yyyy-MM-dd');
    }
    let endTime = '';
    if (this.seachForm.controls.endTime.value) {
      endTime = format(new Date(this.seachForm.controls.endTime.value), 'yyyy-MM-dd');
    }

    const params = {
      level: this.seachForm.controls.loginStatus.value,
      user_id: this.seachForm.controls.loginName.value,
      start_time: startTime,
      end_time: endTime,
      log_type: 'login'
    };

    this.log.getLogs(jobId, params).then(() => {
      this.message.info(this.i18n.translateLang('common.message.info.I_002'));
    });
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    this.seachForm.reset();
    this.pageSize = 30;
    this.pageIndex = 1;
    this.search();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
