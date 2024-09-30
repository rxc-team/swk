import { format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';
import * as XLSX from 'xlsx';

import { Component, Input, OnInit } from '@angular/core';
import { ItemService } from '@api';
import { FileUtilService, I18NService } from '@core';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.less']
})
export class UploadImageComponent implements OnInit {
  // 台账字段
  @Input() fields: any[] = [];
  @Input() datastoreId: string;

  // 显示文件选择对话框
  showFileSelect = false;
  encoding = 'utf-8';
  zipCharset = 'utf-8';

  // csv数据文件
  csvFileList: NzUploadFile[] = [];
  // zip图片压缩文件
  zipFileList: NzUploadFile[] = [];

  constructor(
    private eventBus: NgEventBus,
    private item: ItemService,
    private message: NzMessageService,
    private notify: NzNotificationService,
    private i18n: I18NService,
    private fileUtil: FileUtilService
  ) {}

  ngOnInit(): void {}

  show() {
    this.showFileSelect = true;
  }

  // csv数据文件上传前
  csvBeforeUpload = (file: NzUploadFile) => {
    return new Observable((observer: Observer<boolean>) => {
      // 上传文件类型限制
      if (
        !(
          file.type === 'text/csv' ||
          file.type === 'application/vnd.ms-excel' ||
          file.type === 'text/plain' ||
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel.sheet.macroEnabled.12'
        )
      ) {
        this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
        observer.complete();
        return;
      }
      // 上传文件大小限制
      const isLt5M = this.fileUtil.checkSize(file.size);
      if (!isLt5M) {
        this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
        observer.complete();
        return;
      }
      // 一次上传文件大小个数限制
      if (this.csvFileList && this.csvFileList.length >= 1) {
        this.message.error(this.i18n.translateLang('common.validator.singleFileUpload'));
        return;
      }

      this.csvFileList = this.csvFileList.concat(file);
      return;
    });
  };

  // zip图片压缩文件上传前
  zipBeforeUpload = (file: NzUploadFile) => {
    return new Observable((observer: Observer<boolean>) => {
      // 上传文件类型限制
      if (!(file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
        this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
        observer.complete();
        return;
      }
      // 上传文件大小限制
      const isLt5M = this.fileUtil.checkSize(file.size);
      if (!isLt5M) {
        this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
        observer.complete();
        return;
      }
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
   * @description: 批量上传图片文件
   */
  uploadWithFile() {
    const formData = new FormData();

    // 打开csv数据文件-检查数据合法性-字段参数获取
    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_csv(ws);
        const dataList = data.split('\n');
        if (dataList.length > 50003) {
          this.message.error(this.i18n.translateLang('common.validator.csvFileMaxLength'));
          this.csvFileList = [];
          this.zipFileList = [];
          return;
        }
        // csv数据文件字段检查
        const header = dataList[1].split(',');
        for (let index = 0; index < header.length; index++) {
          // 数据ID
          if (index === 0 && header[index] === 'id') {
            index++;
          }
          // 台账数据字段
          const h = header[index];
          const existFields = this.fields.filter(f => f.field_id === h);
          if (existFields.length === 0) {
            // 台账数据字段不存在
            this.notify.error(
              this.i18n.translateLang('common.message.errorTitle'),
              this.i18n.translateLang('common.validator.fieldNotFound', { field: h })
            );
            this.csvFileList = [];
            this.zipFileList = [];
            return;
          }
          if (existFields.length > 1) {
            // 台账数据字段异常
            this.notify.error(
              this.i18n.translateLang('common.message.errorTitle'),
              this.i18n.translateLang('common.validator.fieldDuplicated', { field: h })
            );
            this.csvFileList = [];
            this.zipFileList = [];
            return;
          }
          // 入力文件内同一字段重复验证
          const fieldsExistInFile = header.filter(f => f === h);
          if (fieldsExistInFile.length > 1) {
            this.notify.error(
              this.i18n.translateLang('common.message.errorTitle'),
              this.i18n.translateLang('common.validator.fieldDuplicated', { field: h })
            );
            this.csvFileList = [];
            this.zipFileList = [];
            return;
          }
        }
      } catch (error) {
        this.csvFileList = [];
        this.zipFileList = [];
        this.message.error(this.i18n.translateLang('common.validator.fileReadError'));
        return;
      }
      // 编辑其他Form参数数据-&-调用服务上传文件信息
      const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;
      // Form编辑
      formData.append('job_id', jobId);
      formData.append('file', this.csvFileList[0] as any);
      formData.append('zipFile', this.zipFileList[0] as any);
      formData.append('action', 'image');
      formData.append('encoding', this.encoding);
      formData.append('zip-charset', this.zipCharset);

      // 任务编辑
      this.csvFileList = [];
      this.zipFileList = [];
      // 调用服务上传文件信息
      this.item.importImage(this.datastoreId, 'data', formData).then(() => {
        this.showFileSelect = false;
        this.message.info(this.i18n.translateLang('common.message.info.I_001'));
      });
    };
    reader.readAsBinaryString(this.csvFileList[0] as any);
  }

  /**
   * @description: 取消文件选择-关闭选择对话框
   */
  fileSelectCancel() {
    this.csvFileList = [];
    this.zipFileList = [];
    this.showFileSelect = false;
  }
}
