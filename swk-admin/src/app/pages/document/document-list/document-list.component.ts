/*
 * @Description: 文件管理控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-06-26 09:48:16
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-22 17:41:54
 */

import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { FolderService } from '@api';
import { I18NService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.less']
})
export class DocumentListComponent implements OnInit {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private i18n: I18NService,
    private folder: FolderService,
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
        this.position = 'top';
        this.isSmall = true;
      } else {
        this.position = 'left';
        this.isSmall = false;
      }
    });
    this.validateForm = this.fb.group({
      folder_name: [null, [Validators.required], [this.folderNameDuplicated]]
    });
  }

  // 数据定义
  validateForm: FormGroup;
  folderTabs: any[] = [];
  position = 'left';

  isSmall = false;

  /**
   * @description: 画面初始化处理
   */
  ngOnInit() {
    this.init();
  }

  async init() {
    await this.getFolders();
  }

  /**
   * @description: 文件夹名称唯一性检查
   */
  folderNameDuplicated = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.folder.folderNameDuplicated(control.value).then((folders: boolean) => {
        if (!folders) {
          observer.next({ error: true, duplicated: true });
        } else {
          if (
            control.value === `${this.i18n.translateLang('page.document.public')}` ||
            control.value === `${this.i18n.translateLang('page.document.company')}` ||
            control.value === `${this.i18n.translateLang('page.document.personFile')}`
          ) {
            observer.next({ error: true, duplicated: true });
          } else {
            observer.next(null);
          }
        }
        observer.complete();
      });
    });

  /**
   * @description: 调用服务获取文件夹
   */
  async getFolders() {
    await this.folder.getFolders().then((data: any[]) => {
      if (data) {
        this.folderTabs = data;
      } else {
        this.folderTabs = [];
      }
    });
  }

  /**
   * @description: 调用服务添加文件夹
   */
  submitForm = () => {
    const folderName = this.validateForm.controls.folder_name.value;
    const folderDir = folderName;
    const data = {
      folder_name: folderName,
      folder_dir: folderDir
    };

    this.folder.addFolder(data).then(res => {
      this.reset();
      this.init();
      this.message.success(this.i18n.translateLang('common.message.success.S_001'));
    });
  };

  /**
   * @description: 重置
   */
  reset() {
    this.validateForm.reset();
  }
}
