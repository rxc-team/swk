import { format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TaskService, UserService } from '@api';
import { CommonService, I18NService, SpinnerService } from '@core';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.less']
})
export class JobListComponent implements OnInit {
  cols = [
    {
      title: 'page.job.user',
      width: '100px'
    },
    {
      title: 'page.job.jobID',
      width: '180px'
    },
    {
      title: 'page.job.jobName',
      width: '200px'
    },
    {
      title: 'page.job.jobOrigin',
      width: '120px'
    },
    {
      title: 'page.job.status',
      width: '90px'
    },
    {
      title: 'page.job.startTime',
      width: '150px'
    },
    {
      title: 'page.job.endTime',
      width: '150px'
    },
    {
      title: 'page.job.download'
    }
  ];

  listData: any[] = [];

  position = 'horizontal';

  index = 1;
  size = 100;
  total = 0;
  userList = [];

  expandSet = new Set<string>();
  onExpandChange(id: string): void {
    if (this.expandSet.has(id)) {
      this.expandSet.delete(id);
    } else {
      this.expandSet.add(id);
    }
  }

  constructor(
    private fb: FormBuilder,
    private eventBus: NgEventBus,
    private common: CommonService,
    private http: HttpClient,
    private task: TaskService,
    private i18n: I18NService,
    private us: UserService,
    private message: NzMessageService,
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
        this.position = 'vertical';
      } else {
        this.position = 'horizontal';
      }
    });
  }

  /**
   * @description: 画面初期化処理
   */
  ngOnInit() {
    // this.us.getUsers().then((data: any[]) => {
    //   if (data) {
    //     this.userList = data;
    //   } else {
    //     this.userList = [];
    //   }
    // });

    this.search();
  }

  /**
   * @description: 应用一览数据取得
   */
  async search() {
    this.listData = [];
    await this.task.getTaskHistories(this.index.toString(), this.size.toString()).then((data: any) => {
      if (data) {
        const hs = data.histories;
        if (hs) {
          hs.forEach(h => {
            const msgs = h.message;
            const newMsgs = new Set<string>();
            if (msgs) {
              msgs.forEach(s => {
                newMsgs.add(s);
              });
              h.message = Array.from(newMsgs);
            }
          });
        }
        this.listData = hs;
        this.total = data.total;
      } else {
        this.listData = [];
      }
    });
  }

  /**
   * @description: 下载履历
   */
  async downlaodTaskHistory() {
    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;
    await this.task.downloadTaskHistory(jobId).then(data => {
      this.message.info(this.i18n.translateLang('common.message.info.I_002'));
    });
  }

  /**
   * @description: 下载日志
   */
  downloadErrorLog(e: Event, path: string) {
    this.http
      .get(path, {
        responseType: 'blob'
      })
      .subscribe((data: Blob) => {
        /* get the file name */
        const fielName = this.getFileName('log', '.txt');

        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = fielName;
        document.body.appendChild(link);
        link.click();
      });
    e.stopPropagation();
  }

  /**
   * @description: 下载文件
   */
  downloadFile(e: Event, path: string, fileName: string, type: string) {
    const url = path;
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    if (type === 'log-download' || type === 'th-download') {
      /* get the file name */
      const fielName = this.getFileName('log', '.log');
      link.download = fielName;
      document.body.appendChild(link);
      link.click();
      return;
    }

    if (type === 'db-backup') {
      /* get the file name */
      const fielName = this.getFileName('DB-BACKUP', '.zip');
      link.download = fielName;
      document.body.appendChild(link);
      link.click();

      return;
    }

    /* get the file name */
    let csvFielName = '';
    if (fileName && fileName !== '-') {
      csvFielName = this.getFileName(this.i18n.translateLang(fileName), '.csv');
    } else {
      csvFielName = this.getFileName(fileName, '.csv');
    }
    link.download = csvFielName;
    document.body.appendChild(link);
    link.click();
  }

  /**
   * @description: 取得出力文件名称
   */
  getFileName(fileName?: string, suffix?: string) {
    return (fileName ? fileName : 'test') + '_' + format(new Date(), 'yyyyMMddHHmmss') + (suffix ? suffix : '.csv');
  }

  /**
   * @description: 取得出力文件名称
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
