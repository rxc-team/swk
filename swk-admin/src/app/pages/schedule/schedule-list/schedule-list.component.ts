import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Schedule, ScheduleService, UserService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.less']
})
export class ScheduleListComponent implements OnInit {
  cols = [
    {
      title: 'page.schedule.status',
      width: '80px'
    },
    {
      title: 'page.schedule.scheduleName',
      width: '200px'
    },
    {
      title: 'page.schedule.scheduleType',
      width: '120px'
    },
    {
      title: 'page.schedule.scheduleKind',
      width: '150px'
    },
    {
      title: 'common.text.startDate',
      width: '120px'
    },
    {
      title: 'common.text.endDate',
      width: '120px'
    },
    {
      title: 'page.schedule.cycle',
      width: '80px'
    },
    {
      title: 'page.schedule.week',
      width: '120px'
    },
    {
      title: 'page.schedule.time',
      width: '180px'
    },
    {
      title: 'page.schedule.message'
    }
  ];

  listData: Schedule[] = [];
  userList = [];
  selectData = [];
  seachForm: FormGroup;
  selectAll = false;

  isSmall = false;
  isZoomFlg = false;

  index = 1;
  size = 100;
  total = 0;

  loading = false;

  weeks = [
    { label: this.i18n.translateLang('page.schedule.monday'), value: '1', checked: false },
    { label: this.i18n.translateLang('page.schedule.tuesday'), value: '2', checked: false },
    { label: this.i18n.translateLang('page.schedule.wednesday'), value: '3', checked: false },
    { label: this.i18n.translateLang('page.schedule.thursday'), value: '4', checked: false },
    { label: this.i18n.translateLang('page.schedule.friday'), value: '5', checked: false },
    { label: this.i18n.translateLang('page.schedule.saturday'), value: '6', checked: false },
    { label: this.i18n.translateLang('page.schedule.sunday'), value: '0', checked: false }
  ];

  confirmModal: NzModalRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modal: NzModalService,
    private schedule: ScheduleService,
    private user: UserService,
    private i18n: I18NService,
    private event: NgEventBus,
    private bs: NzBreakpointService,
    private message: NzMessageService
  ) {
    this.event.on('schedule:refresh').subscribe(() => {
      this.search();
    });

    this.seachForm = this.fb.group({
      userId: ['', []]
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

  /**
   * @description: 画面初期化処理
   */
  ngOnInit() {
    this.init();
  }

  init() {
    this.user.getUsers().then((data: any[]) => {
      if (data) {
        this.userList = data;
      } else {
        this.userList = [];
      }
    });

    this.search();
  }

  getScheduleTypeName(value: string) {
    let res = '';
    if (value === 'db-backup') {
      return 'page.schedule.dbBackUp';
    }
    return res;
  }

  parserCron(spec: string) {
    const result = {
      type: '',
      week: '',
      time: '',
      tips: ''
    };
    if (spec) {
      const crons = spec.split(' ');
      const timezone = crons[0].replace('TZ=', '');
      const minutes = crons[1];
      const hour = crons[2];
      const dayOfMonth = crons[3];
      const day = crons[4];
      const weekOfMonth = crons[5];

      const time = `${hour.padStart(2, '0')}:${minutes.padStart(2, '0')} (${timezone})`;
      const label_run = this.i18n.translateLang('page.schedule.run');
      const label_day = this.i18n.translateLang('page.schedule.day');
      const label_dayEach = this.i18n.translateLang('page.schedule.dayEach');
      const label_weekEach = this.i18n.translateLang('page.schedule.weekEach');
      const label_month = this.i18n.translateLang('page.schedule.monthEach');

      if (dayOfMonth === '*' && day === '*' && weekOfMonth === '?') {
        result.type = 'day';
        result.time = `${time}`;
        result.week = '-';
        result.tips = `${label_dayEach}${time}${label_run}`;

        return result;
      }

      if (dayOfMonth === '?' && day === '*') {
        const wks = weekOfMonth.split(',');
        const weekTips = wks.map(w => this.weeks.find(s => s.value === w)).map(v => v.label);

        result.type = 'week';
        result.time = `${time}`;
        result.week = `${weekTips.join(',')}`;
        result.tips = `${label_weekEach}${weekTips.join(',')}${time}${label_run}`;
        return result;
      }

      if (weekOfMonth === '?' && day === '*') {
        result.type = 'month';
        result.time = `${time}`;
        result.week = '-';
        result.tips = `${label_month}${dayOfMonth}${label_day}${time}${label_run}`;
        return result;
      }
    }
  }

  /**
   * @description: 应用一览数据取得
   */
  search() {
    this.loading = true;
    const userId = this.seachForm.controls.userId.value;

    this.schedule.getSchedules(userId, this.index.toString(), this.size.toString()).then((data: any) => {
      if (data && data.total > 0) {
        this.listData = data.schedules;

        this.listData.forEach(s => {
          const result = this.parserCron(s.spec);
          s.type = result.type;
          s.week = result.week;
          s.time = result.time;
          s.tips = result.tips;
        });

        this.total = data.total;
      } else {
        this.listData = [];
        this.total = 0;
      }
    });
    this.selectData = [];
    this.loading = false;
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
    this.listData.forEach(f => (f.checked = event));
    this.selectData = this.listData.filter(d => d.checked === true);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.listData.filter(d => d.checked === true);

    if (this.selectData.length === this.listData.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 跳转到APP添加页面
   */
  foward() {
    this.router.navigate(['schedule/add']);
  }

  /**
   * @description: 刷新
   */
  refresh() {
    this.init();
  }

  /**
   * @description: 删除选择中应用
   */
  deleteAll(): void {
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.schedule_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selSheduleHardDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selSheduleHardDelContent')}`,
      nzOnOk: () =>
        this.schedule.deleteSchedule(params).then(res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.search();
        })
    });
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
