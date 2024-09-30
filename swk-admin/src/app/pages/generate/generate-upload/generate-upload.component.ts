import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenService } from '@api';
import { FileUtilService, I18NService } from '@core';

import { StepService } from '../step.service';

@Component({
  selector: 'app-generate-upload',
  templateUrl: './generate-upload.component.html',
  styleUrls: ['./generate-upload.component.less']
})
export class GenerateUploadComponent implements OnInit {
  fileList: NzUploadFile[] = [];

  csvHeader: string[] = [];
  csvData: string[][] = [];

  encoding = 'UTF-8';
  comma = ',';
  comment = '#';

  index = 1;
  size = 30;
  total = 0;

  constructor(
    private fileUtil: FileUtilService,
    private message: NzMessageService,
    private i18n: I18NService,
    private sts: StepService,
    private router: Router,
    private gs: GenService
  ) {}

  ngOnInit(): void {
    this.search();
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    // 上传文件类型限制
    const isSupportFileType = this.fileUtil.checkSupport(file.type, false);

    if (!isSupportFileType) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
      this.fileList = [];
      return false;
    }

    // 上传文件大小限制
    const isLt5M = this.fileUtil.checkSize(file.size);
    if (!isLt5M) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
      this.fileList = [];
      return false;
    }

    // 一次上传文件大小个数限制
    if (this.fileList && this.fileList.length >= 1) {
      this.message.error(this.i18n.translateLang('common.validator.singleFileUpload'));
      this.fileList = [];
      return false;
    }

    this.fileList = this.fileList.concat(file);

    this.handleUpload();
    return false;
  };

  /**
   * @description: 上传文件
   */
  async handleUpload() {
    const formData = new FormData();

    formData.append('encoding', this.encoding);
    formData.append('comma', this.comma);
    formData.append('comment', this.comment);

    // 上传文件类型限制
    const file = this.fileList[0];

    // 上传文件
    formData.append('file', file as any);
    this.fileList = [];

    await this.gs.upload(formData);
    this.message.info(this.i18n.translateLang('common.message.success.S_006'));
    this.search();
  }

  search() {
    this.gs.getRowData(this.index, this.size).then(data => {
      if (data) {
        this.csvHeader = data.header;
        this.csvData = data.data;
        this.total = data.total;
      } else {
        this.csvHeader = [];
        this.csvData = [];
        this.total = 0;
      }
    });
  }

  async clear() {
    await this.gs.complete();
    this.router.navigate(['generate']);
  }

  next() {
    this.sts.next();
  }
}
