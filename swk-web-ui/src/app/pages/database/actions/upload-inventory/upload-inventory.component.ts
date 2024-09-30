import { format } from 'date-fns';
import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import * as XLSX from 'xlsx';

import { Component, Input, OnInit } from '@angular/core';
import { DatastoreService, ItemService, UserService } from '@api';
import { FileUtilService, I18NService, TokenStorageService } from '@core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-upload-inventory',
  templateUrl: './upload-inventory.component.html',
  styleUrls: ['./upload-inventory.component.less']
})
export class UploadInventoryComponent implements OnInit {
  // 入力项目
  @Input() keyFields: any[] = [];
  @Input() datastoreId: string;

  // 盘点类型文言
  checkTypes = [
    {
      label: 'common.text.visuallycheck',
      value: 'Visual'
    },
    {
      label: 'common.text.imagecheck',
      value: 'Image'
    },
    {
      label: 'common.text.barcodecheck',
      value: 'Scan'
    }
  ];

  // 文件编码
  encoding = 'utf-8';
  // 上传文件
  fileList: NzUploadFile[] = [];
  // 主键集合
  mainKeys = '';
  // 盘点类型
  checkType = 'Visual';
  // 盘点时刻
  checkedAt = new Date();
  // 盘点者
  checkedBy = '';

  // 主键可选集合
  canMainkeyFields: any[] = [];
  // 盘点者可选集合
  canSelUsers: any[] = [];

  // 文件上传画面显示/隐藏
  visible = false;

  //时区
  timezone: '';

  // 构造函数
  constructor(
    private item: ItemService,
    private message: NzMessageService,
    private notify: NzNotificationService,
    private tokenService: TokenStorageService,
    private i18n: I18NService,
    private ds: DatastoreService,
    private user: UserService,
    private fileUtil: FileUtilService
  ) { }

  // 画面初期化
  ngOnInit(): void {
    this.ds.getDatastoreByID(this.datastoreId).then(data => {
      if (data) {
        if (data.unique_fields) {
          data.unique_fields.forEach(f => {
            const fsList = this.showFieldInfo(f);

            this.canMainkeyFields = [
              { label: fsList.map(fd => this.i18n.translateLang(fd.field_name)).join(','), value: f },
              ...this.canMainkeyFields
            ];
          });
        }
      }

      const userId = this.tokenService.getUserId();
      forkJoin([this.user.getUserByID({ type: '0', user_id: userId })])
        .toPromise()
        .then((data: any[]) => {
          this.timezone = data[0].timezone
        })
    });

    // 可选盘点者集合获取
    this.user.getUsers({ invalid: 'true' }).then(res => {
      if (res) {
        this.canSelUsers = res;
        this.canSelUsers = _.sortBy(this.canSelUsers, 'user_name');
      }
    });
    // 设置默认盘点者
    this.checkedBy = this.tokenService.getUserId();
  }

  showFieldInfo(fs: string) {
    const fList = fs.split(',');
    if (fList) {
      const result = fList.map(f => this.keyFields.find(fd => fd.field_id === f));
      return result;
    }

    return [];
  }

  // 显示文件上传画面
  show() {
    this.visible = true;
  }

  // 文件上传前检查
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
    // 一次上传文件个数限制
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

    // 上传文件编码
    formData.append('encoding', this.encoding);
    // 上传文件
    const file = this.fileList[0];
    formData.append('file', file as any);
    this.fileList = [];

    // 调用服务上传文件信息
    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;

    formData.append('job_id', jobId);
    formData.append('main_keys', this.mainKeys);
    formData.append('check_type', this.checkType);
    formData.append('checked_at', format(this.checkedAt, 'yyyy-MM-dd HH:mm:ss'));
    formData.append('checked_by', this.checkedBy);
    formData.append('timezone', this.timezone);

    this.item.importCheckItems(this.datastoreId, formData).then(() => {
      this.onCancel();
      this.message.info(this.i18n.translateLang('common.message.info.I_001'));
    });
  }

  // 取消上传
  onCancel() {
    this.fileList = [];
    this.mainKeys = '';
    this.checkType = 'Visual';
    this.checkedAt = new Date();
    this.checkedBy = this.tokenService.getUserId();
    this.encoding = 'utf-8';
    this.visible = false;
  }
}
