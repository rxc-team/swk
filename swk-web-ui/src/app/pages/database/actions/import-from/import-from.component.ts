import { format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { filter } from 'rxjs/operators';

import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService, DatastoreService, ValidationService } from '@api';
import { CommonService, FileUtilService, I18NService } from '@core';

@Component({
  selector: 'app-import-from',
  templateUrl: './import-from.component.html',
  styleUrls: ['./import-from.component.less']
})
export class ImportFromComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private fileUtil: FileUtilService,
    private http: HttpClient,
    private i18n: I18NService,
    private db: DatabaseService,
    private common: CommonService,
    private eventBus: NgEventBus,
    private validation: ValidationService,
    private message: NzMessageService,
    private ds: DatastoreService
  ) { }
  @Input() conditionParam = {
    condition_list: [],
    condition_type: 'and'
  };
  @Input() showText = false;

  datastoreId = '';
  mappings: any[] = [];
  appId = '';
  files: NzUploadFile[] = [];
  selectMapping: any = {};
  selectMp = '';
  emptyChange = 'false';
  canUpload = true;
  forms = [];
  visible = false;
  change = 0;

  /**
   * @description: 初期化
   */
  ngOnInit() {
    /* this.init(); */
  }

  /**
   * @description: 映射导入画面显示/隐藏
   */
  async show() {
    this.datastoreId = this.route.snapshot.paramMap.get('d_id');
    await this.ds.getDatastoreByID(this.datastoreId).then((data: any) => {
      if (data) {
        this.appId = data.app_id;
        this.mappings = data.mappings;
      } else {
        this.mappings = [];
      }
    });
    this.visible = true;
  }

  /**
   * @description: 映射情报初始化
   */
  /* async init() {

  } */

  /**
   * @description: 文件上传前
   */
  beforeUpload = (file: NzUploadFile, fileList: NzUploadFile[]): boolean => {
    // 上传文件类型限制
    const isSupportFileType = this.fileUtil.checkSupport(file.type, false);
    if (!isSupportFileType) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
      return false;
    }

    // // 上传文件大小限制
    // const isLt5M = this.fileUtil.checkSize(file.size);
    // if (!isLt5M) {
    //   this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
    //   return false;
    // }

    this.files = [file];
    return false;
  };

  /**
   * @description: 文件上传
   */
  async handleUpload() {
    const formData = new FormData();

    let encoding = false;
    await this.fileUtil.checkEncoding(this.files[0] as any, this.selectMapping.char_encoding).then(result => {
      encoding = result;
    });

    if (!encoding) {
      this.message.error(this.i18n.translateLang('common.message.error.E_011', { encoding: this.selectMapping.char_encoding }));
      return;
    }

    // 设置文件
    formData.append('file', this.files[0] as any);
    // 设置参数mappingId
    formData.append('mapping_id', this.selectMapping.mapping_id);

    // 调用服务上传文件信息
    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;
    this.files = [];
    formData.append('empty_change', this.emptyChange);
    // 设置参数mappingId
    formData.append('job_id', jobId);

    // 设置访问头
    const req = new HttpRequest('POST', `/mapping/datastores/${this.datastoreId}/upload`, formData, {
      headers: new HttpHeaders({
        token: 'true'
      }),
      reportProgress: true,
      withCredentials: true
    });
    // 设置上传loading
    // 开始文件上传
    this.http
      .request(req)
      .pipe(filter(e => e instanceof HttpResponse))
      .subscribe(
        () => {
          // 上传成功
          this.visible = false;
          this.selectMapping = {};
          this.selectMp = '';
          this.message.success(this.i18n.translateLang('common.message.success.S_006'));
        },
        () => {
          // 上传失败
          this.visible = false;
          this.selectMapping = {};
          this.selectMp = '';
          this.message.error(this.i18n.translateLang('common.message.error.E_006'));
        }
      );
  }

  /**
   * @description: 直接从服务器上下载csv文件
   * @return: csv文件
   */
  async downloadCsv() {
    const params = {
      item_condition: this.conditionParam
    };

    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;

    await this.db.mappingDownload(this.datastoreId, jobId, params, this.selectMapping.mapping_id, this.selectMapping.download_encoding).then(data => {
      this.visible = false;
      this.selectMapping = {};
      this.selectMp = '';
      this.files = [];
      this.message.info(this.i18n.translateLang('common.message.info.I_002'));
    });
  }

  /**
   * @description: 选中台账映射
   */
  select(item: any) {
    if (item) {
      this.emptyChange = 'false';
      this.selectMapping = this.mappings.find(m => m.mapping_id === item);
      // 验证映射是否有流程
      this.validation.validationWorkflowExist(this.datastoreId, item).then((res: boolean) => {
        if (res) {
          this.canUpload = true;
        } else {
          this.canUpload = false;
        }
      });
    } else {
      this.selectMapping = {};
      this.selectMp = '';
      this.files = [];
    }
  }
}
