import { format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { Observable, Observer } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BackupService, Schedule, ScheduleService, UserService } from '@api';
import { CommonService, FileUtilService, I18NService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-backup-list',
  templateUrl: './backup-list.component.html',
  styleUrls: ['./backup-list.component.less']
})
export class BackupListComponent implements OnInit {
  cols = [
    {
      title: 'page.backup.backUpName',
      width: '200px'
    },
    {
      title: 'page.backup.fileSize',
      width: '120px'
    },
    {
      title: 'common.text.createdBy',
      width: '120px'
    },
    {
      title: 'common.text.createdDate',
      width: '150px'
    },
    {
      title: 'page.backup.dataDownload',
      width: '200px'
    }
  ];

  showFileSelect = false;
  zipFileList: File[] = [];

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

  weeks = [
    { label: this.i18n.translateLang('page.schedule.text.monday'), value: '1', checked: false },
    { label: this.i18n.translateLang('page.schedule.text.tuesday'), value: '2', checked: false },
    { label: this.i18n.translateLang('page.schedule.text.wednesday'), value: '3', checked: false },
    { label: this.i18n.translateLang('page.schedule.text.thursday'), value: '4', checked: false },
    { label: this.i18n.translateLang('page.schedule.text.friday'), value: '5', checked: false },
    { label: this.i18n.translateLang('page.schedule.text.saturday'), value: '6', checked: false },
    { label: this.i18n.translateLang('page.schedule.text.sunday'), value: '0', checked: false }
  ];

  confirmModal: NzModalRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private common: CommonService,
    private modal: NzModalService,
    private schedule: ScheduleService,
    private backup: BackupService,
    private user: UserService,
    private event: NgEventBus,
    private i18n: I18NService,
    private bs: NzBreakpointService,
    private fileUtil: FileUtilService,
    private message: NzMessageService
  ) {
    this.event.on('schedule:refresh').subscribe(() => {
      this.search();
    });
    this.seachForm = this.fb.group({
      backupName: ['', []]
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

  parserCron(spec: string) {
    const result = {
      type: '',
      week: '',
      time: '',
      tips: ''
    };
    if (spec) {
      const crons = spec.split(' ');
      console.log(crons);
      const minutes = crons[0];
      const hour = crons[1];
      const dayOfMonth = crons[2];
      const day = crons[3];
      const weekOfMonth = crons[4];

      const time = `${hour.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      const label_run = this.i18n.translateLang('page.schedule.text.run');
      const label_day = this.i18n.translateLang('page.schedule.text.day');
      const label_dayEach = this.i18n.translateLang('page.schedule.text.dayEach');
      const label_weekEach = this.i18n.translateLang('page.schedule.text.weekEach');
      const label_month = this.i18n.translateLang('page.schedule.text.month');

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
    const backupName = this.seachForm.controls.backupName.value;

    this.backup.getBackups({ backupName }).then((data: any) => {
      if (data) {
        this.listData = data;
        this.total = data.length;
      } else {
        this.listData = [];
      }
    });
    this.selectData = [];
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
    this.router.navigate(['schedule/add'], { queryParams: { backup: true } });
  }

  /**
   * @description: 删除选择中应用
   */
  deleteAll(): void {
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.backup_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selBackupHardDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selBackupHardDelContent')}`,
      nzOnOk: () =>
        this.backup.hardDeleteBackups(params).then(res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.search();
        })
    });
  }

  downloadFile(backupfielName: string, path: string, dataKbn: string) {
    /* get the file name */
    let f = `${backupfielName}_${format(new Date(), 'yyyyMMddHHmmss')}.zip`;
    if (dataKbn === '2') {
      f = 'filedata_' + f;
    }
    const url = path;
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = f;
    document.body.appendChild(link);
    link.click();
  }

  restore() {
    const scheduleParams: any = {
      backup_id: this.selectData[0].backup_id
    };

    const params: Schedule = {
      schedule_name: 'db restore',
      spec: '',
      multi: 0,
      retry_times: 1,
      retry_interval: 1000,
      start_time: format(new Date(), 'yyyy-MM-dd'),
      end_time: format(new Date(), 'yyyy-MM-dd'),
      schedule_type: 'db-restore',
      run_now: true,
      params: scheduleParams
    };

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.recoverTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.recoverContent')}`,
      nzOnOk: () =>
        // 通过调用服务
        this.schedule.createSchedule(params).then(res => {
          if (res && res.schedule_id) {
            this.message.success(this.i18n.translateLang('common.message.success.S_005'));
          }
        })
    });
  }

  cancel() {
    // 上传文件初期化
    this.zipFileList = [];
    this.showFileSelect = false;
  }

  // 备份文件上传前
  beforeUpload = (file: File) => {
    return new Observable((observer: Observer<boolean>) => {
      // 上传文件类型限制
      if (!(file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
        this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
        observer.complete();
        return;
      }
      // 上传文件大小限制
      // const isLt5M = this.fileUtil.checkSize(file.size);
      // if (!isLt5M) {
      //   this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
      //   observer.complete();
      //   return;
      // }
      // 一次上传文件大小个数限制
      if (this.zipFileList && this.zipFileList.length >= 1) {
        this.message.error(this.i18n.translateLang('common.validator.singleFileUpload'));
        return;
      }

      this.zipFileList = this.zipFileList.concat(file);
      return;
    });
  };

  /**
   * @description: 本地恢复数据库
   */
  localRestore() {
    const formData = new FormData();
    formData.append('zipFile', this.zipFileList[0] as any);
    // 调用服务通过本地备份文件恢复DB
    this.schedule.createScheduleByLocal(formData).then(res => {
      if (res && res.schedule_id) {
        // this.selectData = [];
        this.message.success(this.i18n.translateLang('common.message.success.S_005'));
      }
    });
    // 上传文件初期化
    this.zipFileList = [];
    this.showFileSelect = false;
  }

  /**
   * @description: 刷新
   */
  refresh() {
    this.init();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
