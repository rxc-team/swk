import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { forkJoin } from 'rxjs';

import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BackupService, ScheduleService } from '@api';
import { CommonService, I18NService } from '@core';

@Component({
  selector: 'app-buckup-info',
  templateUrl: './buckup-info.component.html',
  styleUrls: ['./buckup-info.component.less']
})
export class BuckupInfoComponent implements OnInit {
  cols = [
    {
      title: 'page.backup.backupFileSize',
      width: '120px'
    },
    {
      title: 'page.backup.backupCreatedTime',
      width: '150px'
    },
    {
      title: 'page.backup.action',
      width: '200px'
    }
  ];

  isSmall = false;
  loading = false;

  backupInfo;
  backupClearInfo;
  backupList = [];

  weeks = [
    { label: this.i18n.translateLang('page.backup.monday'), value: '1' },
    { label: this.i18n.translateLang('page.backup.tuesday'), value: '2' },
    { label: this.i18n.translateLang('page.backup.wednesday'), value: '3' },
    { label: this.i18n.translateLang('page.backup.thursday'), value: '4' },
    { label: this.i18n.translateLang('page.backup.friday'), value: '5' },
    { label: this.i18n.translateLang('page.backup.saturday'), value: '6' },
    { label: this.i18n.translateLang('page.backup.sunday'), value: '0' }
  ];

  constructor(
    private http: HttpClient,
    private common: CommonService,
    private i18n: I18NService,
    private location: Location,
    private ss: ScheduleService,
    private bks: BackupService,
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
  }

  ngOnInit(): void {
    this.search();
  }

  search() {
    this.loading = true;
    const jobs = [this.ss.getSchedules('db-backup'), this.ss.getSchedules('db-backup-clean'), this.bks.getDbBackups()];

    forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const backup = data[0];
          const backupClear = data[1];
          const backupData = data[2];

          if (backup) {
            this.backupInfo = backup;
          }
          if (backupClear) {
            this.backupClearInfo = backupClear;
          }
          if (backupData) {
            this.backupList = backupData;
          }
        }
      })
      .finally(() => {
        this.loading = false;
      });
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
      const label_run = this.i18n.translateLang('page.backup.run');
      const label_day = this.i18n.translateLang('page.backup.day');
      const label_dayEach = this.i18n.translateLang('page.backup.dayEach');
      const label_weekEach = this.i18n.translateLang('page.backup.weekEach');
      const label_month = this.i18n.translateLang('page.backup.monthEach');

      if (dayOfMonth === '*' && day === '*' && weekOfMonth === '?') {
        result.type = label_dayEach;
        result.time = `${time}`;
        result.week = '-';
        result.tips = `${label_dayEach}${time}${label_run}`;

        return result;
      }

      if (dayOfMonth === '?' && day === '*') {
        const wks = weekOfMonth.split(',');
        const weekTips = wks.map(w => this.weeks.find(s => s.value === w)).map(v => v.label);

        result.type = label_weekEach;
        result.time = `${time}`;
        result.week = `${weekTips.join(',')}`;
        result.tips = `${label_weekEach}${weekTips.join(',')}${time}${label_run}`;
        return result;
      }

      if (weekOfMonth === '?' && day === '*') {
        result.type = label_month;
        result.time = `${time}`;
        result.week = '-';
        result.tips = `${label_month}${dayOfMonth}${label_day}${time}${label_run}`;
        return result;
      }
    }
  }

  downloadFile(backupfielName: string, path: string) {
    /* get the file name */
    const f = `${backupfielName}_${format(new Date(), 'yyyyMMddHHmmss')}.zip`;
    const url = path;
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = f;
    document.body.appendChild(link);
    link.click();
  }

  changeStatus(sid: String, status: string) {
    this.ss.updateSchedule(sid, status === '1' ? '0' : '1').then(() => {
      this.search();
    });
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }

  back() {
    this.location.back();
  }
}
