/*
 * @Descripttion:
 * @Author: Rxc 陳平
 * @Date: 2020-06-28 09:21:10
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2021-01-05 13:31:14
 */
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    AppService, AuthService, CustomerService, LevelService, RoleService, ScheduleService,
    UserService
} from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-customer-info',
  templateUrl: './customer-info.component.html',
  styleUrls: ['./customer-info.component.less']
})
export class CustomerInfoComponent implements OnInit {
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private cs: CustomerService,
    private ls: LevelService,
    private ss: ScheduleService,
    private message: NzMessageService,
    private i18n: I18NService,
    private aus: AuthService,
    private bs: NzBreakpointService,
    private as: AppService,
    private rs: RoleService
  ) {
    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'xs') {
        this.isSmall = true;
      } else if (data === 'sm' || data === 'md') {
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });
  }

  customerInfo: any = {};
  isSmall = false;
  apps: any[] = [];
  levels: any[] = [];
  showPswRset = false;
  showFileSelect = false;
  zipFileList: NzUploadFile[] = [];

  ngOnInit() {
    this.getCustomer();
    this.getApps();

    this.ls.getLevels().then((data: any[]) => {
      if (data) {
        this.levels = data;
      } else {
        this.levels = [];
      }
    });
  }

  getName(id: string): string {
    const lv = this.levels.find(l => l.level_id === id);
    if (lv) {
      return lv.level_name;
    }

    return '';
  }

  getCustomer() {
    const id = this.route.snapshot.paramMap.get('id');
    this.cs.getCustomerByID(id).then((data: any) => {
      if (data) {
        this.customerInfo = data;
      }
    });
  }

  /**
   * @description: 解锁客户管理员
   */
  async unlock(db: string): Promise<void> {
    const params = [];
    await this.userService.getDefaultUser('1', db).then((res: any) => {
      if (res && res.user_id) {
        params.push(res.user_id);
      }
    });
    if (params) {
      this.userService.unlockUsers(params, db).then(res => {
        this.message.success(this.i18n.translateLang('common.message.success.S_011'));
      });
    }
  }

  getApps() {
    const id = this.route.snapshot.paramMap.get('id');
    this.as.getApps({ customerId: id, invalidatedIn: 'true' }).then((data: any[]) => {
      if (data) {
        this.apps = data;
        this.showPswRset = true;
      } else {
        this.apps = [];
        this.showPswRset = false;
      }
    });
  }

  goAppList() {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate([`/customer/${id}/apps/list`]);
  }

  goCustomerSetting() {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate([`/customer/${id}/setting`]);
  }

  restPassword(customerId: string) {
    this.aus.userPasswordReset(customerId).then((ps: string) => {
      this.message.success(this.i18n.translateLang('common.message.success.S_009'));
    });
  }

  clearWhitelist(db: string, domain: string) {
    this.rs.whitelistClear(db, domain).then((wl: string) => {
      this.message.success(this.i18n.translateLang('common.message.success.S_012'));
    });
  }

  goToAppDetail(customerId: string, appId: string) {
    const editUrl = `/customer/${customerId}/apps/${appId}/setting`;
    this.router.navigate([editUrl]);
  }

  cancel() {
    // 上传文件初期化
    this.zipFileList = [];
    this.showFileSelect = false;
  }

  // 备份文件上传前
  beforeUpload = (file: NzUploadFile) => {
    return new Observable((observer: Observer<boolean>) => {
      // 上传文件类型限制
      if (!(file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
        this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
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
   * @description: 本地恢复数据库
   */
  localRestore() {
    const formData = new FormData();
    formData.append('db', this.customerInfo.customer_id);
    formData.append('domain', this.customerInfo.domain);
    formData.append('zipFile', this.zipFileList[0] as any);

    // 调用服务通过本地备份文件恢复DB
    this.ss.restore(formData).then(res => {
      if (res) {
        this.message.success(this.i18n.translateLang('common.message.info.I_001'));
      }
    });
    // 上传文件初期化
    this.zipFileList = [];
    this.showFileSelect = false;
  }
}
