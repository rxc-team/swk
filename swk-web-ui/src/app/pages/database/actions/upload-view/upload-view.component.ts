import { format } from 'date-fns';
import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';

import { Component, Input, OnInit } from '@angular/core';
import { AppService, DatastoreService, ItemService, WorkflowService } from '@api';
import { FileUtilService, I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-upload-view',
  templateUrl: './upload-view.component.html',
  styleUrls: ['./upload-view.component.less']
})
export class UploadViewComponent implements OnInit {
  // 台账字段
  @Input() fields: any[] = [];
  @Input() datastoreId: string;

  fileList: NzUploadFile[] = [];
  payFileList: NzUploadFile[] = [];
  workflows = [];
  wfId = '';
  action = 'insert';
  encoding = 'utf-8';
  zipCharset = 'utf-8';
  dsType = '';
  visible = false;
  emptyChange = 'false';

  constructor(
    private item: ItemService,
    private message: NzMessageService,
    private notify: NzNotificationService,
    private tokenService: TokenStorageService,
    private i18n: I18NService,
    private ds: DatastoreService,
    private app: AppService,
    private wf: WorkflowService,
    private fileUtil: FileUtilService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  async init() {
    const us = this.tokenService.getUser();
    const currentApp = us.current_app;
    const db = us.customer_id;

    const jobs = [
      this.ds.getDatastoreByID(this.datastoreId),
      this.app.getAppByID(currentApp, db),
      this.wf.getUserWorkflows(this.datastoreId, 'update')
    ];

    forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const dsData = data[0];
          const appData = data[1];
          const fsData = data[2];

          if (fsData) {
            this.workflows = fsData;
          } else {
            this.workflows = [];
          }

          if (appData && dsData) {
            const appType = appData.app_type;
            const dsApiKey = dsData.api_key;
            if (appType === 'rent' && dsApiKey === 'keiyakudaicho') {
              this.dsType = 'keiyakudaicho';
              this.action = 'contract-insert';
            }
          }
        }
      });
  }

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

    // // 上传文件大小限制
    // const isLt5M = this.fileUtil.checkSize(file.size);
    // if (!isLt5M) {
    //   this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
    //   this.fileList = [];
    //   return false;
    // }

    // 一次上传文件大小个数限制
    if (this.fileList && this.fileList.length >= 1) {
      this.message.error(this.i18n.translateLang('common.validator.singleFileUpload'));
      this.fileList = [];
      return false;
    }

    this.fileList = this.fileList.concat(file);
    return false;
  };

  payBeforeUpload = (file: NzUploadFile): boolean => {
    // 上传文件类型限制
    const isSupportFileType = this.fileUtil.checkSupport(file.type, false);

    if (!isSupportFileType) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
      this.payFileList = [];
      return false;
    }

    // // 上传文件大小限制
    // const isLt5M = this.fileUtil.checkSize(file.size);
    // if (!isLt5M) {
    //   this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
    //   this.payFileList = [];
    //   return false;
    // }

    // 一次上传文件大小个数限制
    if (this.payFileList && this.payFileList.length >= 1) {
      this.message.error(this.i18n.translateLang('common.validator.singleFileUpload'));
      this.payFileList = [];
      return false;
    }

    this.payFileList = this.payFileList.concat(file);
    return false;
  };

  /**
   * @description: 上传文件
   */
  handleUpload(): void {
    const formData = new FormData();

    formData.append('encoding', this.encoding);
    formData.append('zip-charset', this.zipCharset);
    formData.append('action', this.action);
    formData.append('empty_change', this.emptyChange);

    if (this.dsType === 'keiyakudaicho') {
      if ((this.action === 'contract-insert' || this.action === 'debt-change') && this.payFileList.length > 0) {
        const payFile = this.payFileList[0];
        formData.append('payFile', payFile as any);
      }
    }

    // 上传文件类型限制
    const file = this.fileList[0];

    // 上传文件
    formData.append('file', file as any);
    this.fileList = [];
    this.payFileList = [];
    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        const data = XLSX.utils.sheet_to_csv(ws);
        const dataList = data.split('\n');
        if (this.wfId !== '') {
          if (dataList.length > 2003) {
            this.message.error(this.i18n.translateLang('common.validator.csvApprovalFileMaxLength'));
            this.onCancel();
            return;
          }
        } else {
          if (dataList.length > 50003) {
            this.message.error(this.i18n.translateLang('common.validator.csvFileMaxLength'));
            this.onCancel();
            return;
          }
        }

        const header = dataList[1].split(',');
        for (let index = 0; index < header.length; index++) {
          if (index === 0 && header[index] === 'id') {
            index++;
          }
          const h = header[index];
          const existFields = this.fields.filter(f => f.field_id === h);
          if (existFields.length === 0) {
            if (h !== 'owner') {
              this.notify.error(
                this.i18n.translateLang('common.message.errorTitle'),
                this.i18n.translateLang('common.validator.fieldNotFound', { field: h })
              );
              this.onCancel();
              return;
            }
          }
          if (existFields.length > 1) {
            this.notify.error(
              this.i18n.translateLang('common.message.errorTitle'),
              this.i18n.translateLang('common.validator.fieldDuplicated', { field: h })
            );
            this.onCancel();
            return;
          }
          // 入力文件内同一字段重复验证
          const fieldsExistInFile = header.filter(f => f === h);
          if (fieldsExistInFile.length > 1) {
            this.notify.error(
              this.i18n.translateLang('common.message.errorTitle'),
              this.i18n.translateLang('common.validator.fieldDuplicated', { field: h })
            );
            this.onCancel();
            return;
          }
        }
      } catch (error) {
        this.onCancel();
        this.message.error(this.i18n.translateLang('common.validator.fileReadError'));
        return;
      }

      // 调用服务上传文件信息
      const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;

      formData.append('job_id', jobId);

      this.onCancel();

      this.item.importCSV(this.datastoreId, 'data', formData, this.wfId).then(() => {
        this.message.info(this.i18n.translateLang('common.message.info.I_001'));
      });
    };
    reader.readAsBinaryString(file as any);
  }

  onCancel() {
    this.fileList = [];
    this.payFileList = [];
    this.wfId = '';
    this.action = 'insert';
    this.encoding = 'utf-8';
    this.visible = false;
  }
  /**
   * @description: 选中台账映射
   */
  select(item: any) {
    if (item) {
      this.emptyChange = 'false';
    }
  }
}
