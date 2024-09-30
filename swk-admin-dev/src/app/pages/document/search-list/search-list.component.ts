import { Buffer } from 'buffer';
import { saveAs as save } from 'file-saver';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FileService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.less']
})
export class SearchListComponent implements OnInit {
  @Input() fo = 'public';
  @Input() write = false;
  @Input() delete = false;

  files = [];
  form: FormGroup;

  cols = [
    {
      title: 'page.document.fileName',
      width: '200px'
    },
    {
      title: 'page.document.fileSize',
      width: '100px'
    },
    {
      title: 'page.document.fileType',
      width: '300px'
    },
    {
      title: 'page.document.action'
    }
  ];

  constructor(
    private file: FileService,
    private router: Router,
    private modal: NzModalService,
    private message: NzMessageService,
    private i18n: I18NService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      seachValue: [null, []]
    });

    this.search();
  }

  async search() {
    await this.file.getFiles(this.fo).then((data: any[]) => {
      if (data) {
        this.files = data;
      } else {
        this.files = [];
      }
    });
  }

  /**
   * @description: 跳转到上传文件页面
   */
  gotoUpload(id: string) {
    this.router.navigate([`/document/folder/` + id + `/add`]);
  }

  /**
   * @description: 调用服务下载单个文件
   */
  async downloadFile(file_id: string) {
    await this.file.downFileByID(file_id, this.fo, { database: 'system' }).then((data: any) => {
      const blob = new Blob([Buffer.from(data.file_data, 'base64')]);
      save(blob, data.file.file_name);
    });
  }

  async fileSearch(value) {
    await this.search();
    this.files = this.files.filter(f => f.file_name.match(value));
  }

  /**
   * @description: 通过文件夹ID和文件ID，调用服务删除文件夹文件
   */
  deleteFile(file_id: string): void {
    this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.deleteTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.deleteContent')}`,
      nzOnOk: () =>
        this.file.deleteFile(this.fo, file_id).then(async res => {
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
