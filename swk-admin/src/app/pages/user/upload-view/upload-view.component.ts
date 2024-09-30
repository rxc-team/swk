import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';

import { Component, OnInit } from '@angular/core';
import { UserService } from '@api';
import { FileUtilService, I18NService } from '@core';

@Component({
  selector: 'app-upload-view',
  templateUrl: './upload-view.component.html',
  styleUrls: ['./upload-view.component.less']
})
export class UploadViewComponent implements OnInit {
  fileList: NzUploadFile[] = [];

  encoding = 'utf-8';
  visible = false;
  mailverify = '1';

  constructor(
    private userService: UserService,
    private message: NzMessageService,
    private i18n: I18NService,
    private fileUtil: FileUtilService
  ) { }

  ngOnInit(): void { }

  show() {
    this.visible = true;
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
    return false;
  };

  /**
   * @description: 上传文件
   */
  handleUpload(): void {
    const formData = new FormData();

    formData.append('encoding', this.encoding);
    formData.append('mailverify', this.mailverify);

    // 上传文件类型限制
    const file = this.fileList[0];

    // 上传文件
    formData.append('file', file as any);
    this.fileList = [];
    // 调用服务上传文件信息
    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;

    formData.append('job_id', jobId);

    this.userService.importCSV(formData).then(async res => {
      if (res && res.msg) {
        this.message.error(res.msg);
      } else {
        this.message.info(this.i18n.translateLang('common.message.info.I_001'));
      }
    });
  }
}
