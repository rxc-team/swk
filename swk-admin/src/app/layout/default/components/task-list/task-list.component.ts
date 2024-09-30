import { format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TaskService } from '@api';
import { I18NService } from '@core';

export interface Job {
  job_id: string;
  job_name: string;
  origin: string;
  show_progress: boolean;
  progress: number;
  start_time: Date;
  end_time: Date;
  message: string;
  file: any;
  error_file: any;
  task_type: string;
  steps: string[];
  current_step: string;
  total?: number;
  insert?: number;
  update?: number;
}

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.less'],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          right: '320px'
        })
      ),
      state(
        'closed',
        style({
          right: '0px'
        })
      ),
      transition('* => closed', [animate('0.4s ease')]),
      transition('* => open', [animate('0.3s cubic-bezier(0.9, 0, 0.3, 0.7)')])
    ])
  ]
})
export class TaskListComponent implements OnInit {
  visible = false;

  runtimeJobs: Job[] = [];

  index = 1;
  size = 5;
  total = 0;

  constructor(
    private eventBus: NgEventBus,
    private http: HttpClient,
    private i18n: I18NService,
    private task: TaskService,
    private message: NzMessageService
  ) {
    this.eventBus.on('refresh-job').subscribe((msg: any) => {
      const job = JSON.parse(msg.content);
      let ojob: Job = this.runtimeJobs.find(j => j.job_id === job.job_id);
      if (ojob) {
        ojob = Object.assign(ojob, job);
      } else {
        this.runtimeJobs = [job, ...this.runtimeJobs];
        this.total++;
      }
    });
  }

  ngOnInit() {
    this.search();
  }

  search() {
    this.task.getTasks(this.index.toString(), this.size.toString()).then((data: any) => {
      if (data) {
        this.runtimeJobs = data.tasks;
        this.total = data.total;
      } else {
        this.runtimeJobs = [];
        this.total = 0;
      }
    });
  }

  open(): void {
    this.search();
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  clear(jobId: string) {
    const job = this.runtimeJobs.find(j => j.job_id === jobId);
    if (job) {
      const errFile = job.error_file ? job.error_file.name : '';
      const file = job.file ? job.file.name : '';

      // 判斷任務是否正在進行中,不許刪除進行中任務
      if (job.current_step != 'end' && !job.error_file.url) {
        this.message.info('Cannot delete the task in progress');
      } else {
        this.task.deleteTask(jobId, errFile, file).then(() => {
          this.search();
        });
      }
    }
  }

  downloadLog(jobId: string) {
    const job = this.runtimeJobs.find(j => j.job_id === jobId);
    if (job) {
      /* get the file name */
      const fielName = this.getFileName('log', '.txt');
      const url = job.error_file.url;
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = fielName;
      document.body.appendChild(link);
      link.click();
    }
  }

  downloadCsvFile(jobId: string) {
    const job = this.runtimeJobs.find(j => j.job_id === jobId);
    if (job) {
      const url = job.file.url;
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      if (job.task_type === 'log-download' || job.task_type === 'th-download') {
        /* get the file name */
        const fielName = this.getFileName('log', '.log');

        link.download = fielName;
        document.body.appendChild(link);
        link.click();
        return;
      }

      if (job.task_type === 'db-backup') {
        /* get the file name */
        const fielName = this.getFileName('DB-BACKUP', '.zip');
        link.download = fielName;
        document.body.appendChild(link);
        link.click();
        return;
      }

      if (job.task_type === 'ds-pdf-generation') {
        /* get the file name */
        let originName = 'DATASTORE-PDF-PRINT';
        if (job.origin && job.origin !== '-') {
          originName = this.i18n.translateLang(job.origin);
        }
        const fielName = this.getFileName(originName, '.pdf');
        link.download = fielName;
        document.body.appendChild(link);
        link.click();
        return;
      }

      if (job.task_type === 'rp-xlsx-download') {
        /* get the file name */
        let originName = 'DATASTORE-PDF-PRINT';
        if (job.origin && job.origin !== '-') {
          originName = this.i18n.translateLang(job.origin);
        }
        const fielName = this.getFileName(originName, '.xlsx');
        link.download = fielName;
        document.body.appendChild(link);
        link.click();
        return;
      }

      if (job.task_type === 'user-csv-download') {
        const fielName = this.getFileName('User', '.csv');
        link.download = fielName;
        document.body.appendChild(link);
        link.click();
        return;
      }

      /* get the file name */
      let csvFielName = '';
      if (job.origin !== '-') {
        csvFielName = this.getFileName(this.i18n.translateLang(job.origin), '.csv');
      } else {
        csvFielName = this.getFileName(job.origin, '.csv');
      }

      link.download = csvFielName;
      document.body.appendChild(link);
      link.click();
    }
  }

  /**
   * @description: 取得出力文件名称
   */
  getFileName(fileName?: string, suffix?: string) {
    return (fileName ? fileName : 'test') + '_' + format(new Date(), 'yyyyMMddHHmmss') + (suffix ? suffix : '.csv');
  }
}
