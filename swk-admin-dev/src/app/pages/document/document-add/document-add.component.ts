/*
 * @Description: 添加文件控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-06-26 09:48:16
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-06-15 13:19:35
 */
import { format } from 'date-fns';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '@api';
import { FileUtilService, I18NService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-document-add',
  templateUrl: './document-add.component.html',
  styleUrls: ['./document-add.component.less']
})
export class DocumentAddComponent implements OnInit {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    private files: FileService,
    private route: ActivatedRoute,
    private fileUtil: FileUtilService,
    private location: Location,
    private i18n: I18NService,
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
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });
    this.validateForm = this.fb.group({
      file_name: [null, [Validators.required], [this.fileNameDuplicated]]
    });
    this.supportFile = this.fileUtil.getSupportTypes(false);
  }

  // 数据定义
  validateForm: FormGroup;
  fileList: File[] = [];
  uploading = false;
  supportFile = [];
  isSmall = false;

  /**
   * @description: 画面初始化处理
   */
  ngOnInit() {}

  /**
   * @description: 文件名称唯一性检查
   */
  fileNameDuplicated = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const type = this.route.snapshot.paramMap.get('fo_id');
      this.files.fileNameDuplicated(type, control.value).then((file: boolean) => {
        if (!file) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  // 文件上传前
  beforeUpload = (file: File) => {
    return new Observable((observer: Observer<boolean>) => {
      // 上传文件类型限制
      const isSupportFileType = this.fileUtil.checkSupport(file.type, false);

      if (!isSupportFileType) {
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
      if (this.fileList && this.fileList.length >= 1) {
        this.message.error(this.i18n.translateLang('common.validator.singleFileUpload'));
        return;
      }

      this.fileList = this.fileList.concat(file);
      let fileName: string = this.fileList[0].name;
      fileName = fileName.slice(0, fileName.lastIndexOf('.'));
      fileName = this.filenameFilter(fileName);
      this.validateForm.controls.file_name.setValue(fileName);
      this.validateForm.controls.file_name.markAsDirty();
      return;
    });
  };

  /**
   * @description: 上传文件
   */
  handleUpload(): void {
    const formData = new FormData();
    const fo = this.route.snapshot.paramMap.get('fo_id');

    const fileName: string = this.fileList[0].name;
    const suffix = fileName.slice(fileName.lastIndexOf('.'), fileName.length);

    formData.append('file', this.fileList[0] as any);
    formData.append('file_name', this.validateForm.controls.file_name.value + suffix);

    this.uploading = true;
    // 调用服务上传文件信息
    this.files.uploadFile(fo, formData).then((file: any[]) => {
      this.uploading = false;
      this.reset();
      this.message.success(this.i18n.translateLang('common.message.success.S_006'));
      this.location.back();
    });
  }
  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
  }

  /**
   * @description: 重置
   */
  reset() {
    this.validateForm.reset();
    this.fileList = [];
  }

  /**
   * @description: 过滤文件名里的特殊字符
   */
  filenameFilter(filename: string): string {
    if (filename) {
      const name = filename.replace(/[`~!@#$%^&*()+=|\\\][\]\{\}:;'\,.<>/?]|[`~!@#$%^&*()+=|\\\][\]\{\}:;'\,.<>/?]+?$/g, '');
      return name ? name : 'file' + '_' + format(new Date(), 'yyyyMMddHHmmss');
    }
    return '';
  }
}
