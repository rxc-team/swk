import { format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogService } from '@api';
import { I18NService } from '@core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-operate-list',
  templateUrl: './operate-list.component.html',
  styleUrls: ['./operate-list.component.less']
})
export class OperateListComponent implements OnInit {
  cols = [
    {
      title: 'page.logger.action.user',
      width: '200px'
    },
    {
      title: 'page.logger.action.ip',
      width: '150px'
    },
    {
      title: 'page.logger.action.time',
      width: '150px'
    },
    {
      title: 'page.logger.action.name',
      width: '200px'
    },
    {
      title: 'page.logger.action.msg'
    }
  ];

  constructor(
    private log: LogService,
    private eventBus: NgEventBus,
    private i18n: I18NService,
    private ts: TranslateService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.seachForm = this.fb.group({
      operater: ['', [Validators.email]],
      startTime: ['', []],
      endTime: ['', []]
    });

    this.ts.onLangChange.subscribe(() => {
      this.reSearch();
    });
  }

  displayData = [];

  seachForm: FormGroup;

  loading = false;

  // 当前页面index
  pageIndex = 1;
  // 当前页面展示数据条数
  pageSize = 100;
  // 总的条数
  total = 0;

  ngOnInit() {
    this.search();
  }

  reSearch() {
    this.pageSize = 100;
    this.pageIndex = 1;
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
      level: 'info',
      user_id: this.seachForm.controls.operater.value,
      start_time: startTime,
      end_time: endTime,
      log_type: 'micro',
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

  /**
   * @description: 表单重置
   */
  resetForm(): void {
    this.seachForm.reset();
  }

  /**
   * @description: 跳转到
   */
  goToDetail(helpId: string) {
    // const info = `/help/update/${helpId}`;
    // this.router.navigate([info]);
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
      level: 'info',
      user_id: this.seachForm.controls.operater.value,
      start_time: startTime,
      end_time: endTime,
      log_type: 'micro'
    };

    this.log.getLogs(jobId, params).then(() => {
      this.message.info(this.i18n.translateLang('common.message.info.I_002'));
    });
  }

  /**
   * @description: 刷新
   */
  refresh() {
    this.search();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
