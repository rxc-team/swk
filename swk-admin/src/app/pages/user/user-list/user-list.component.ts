/*
 * @Description: 用户列表控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-04-29 13:44:16
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-09-23 10:57:55
 */

import { format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzUploadFile } from 'ng-zorro-antd/upload';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService, CustomerService, GroupService, ProcessService, RoleService, UserService, AuthService } from '@api';
import { FileUtilService, I18NService, TokenStorageService } from '@core';

import { UploadViewComponent } from '../upload-view/upload-view.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less']
})
export class UserListComponent implements OnInit {
  cols = [
    {
      title: 'page.user.userName',
      width: '80px'
    },
    {
      title: 'page.user.email',
      width: '150px'
    },
    {
      title: 'page.user.userGroup',
      width: '120px'
    },
    {
      title: 'page.user.app',
      width: '200px'
    },
    {
      title: 'page.user.userRole',
      width: '200px'
    },
    {
      title: 'page.user.mailverify',
      width: '200px'
    },
    {
      title: 'common.text.createdAt',
      width: '150px'
    },
    {
      title: 'common.text.updateAt'
    }
  ];

  listOfDataDisplay = [];
  rolesSelect = [];
  groupsSelect = [];
  appsSelect = [];
  selectData = [];
  selectDataOfValid = [];
  selectDataOfInvalid = [];
  selectDataOflocked = [];
  selectDataOfunlocked = [];
  maxErrInputTimes = 5;
  seachForm: FormGroup;
  selectAll = false;
  confirmModal: NzModalRef;
  isSmall = false;
  isZoomFlg = false;

  fileList = [];

  // 是否还能添加新用户
  canAddMoreUser = true;
  // 是否还能恢复用户
  canRecoverUser = true;
  // 还可以使用的用户数
  canUseUsers = 0;

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private roleService: RoleService,
    private appService: AppService,
    private fileUtil: FileUtilService,
    private router: Router,
    private tokenService: TokenStorageService,
    private message: NzMessageService,
    private modal: NzModalService,
    private processService: ProcessService,
    private i18n: I18NService,
    private event: NgEventBus,
    private bs: NzBreakpointService,
    private customer: CustomerService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.event.on('user:refresh').subscribe(() => {
      this.search();
    });
    this.seachForm = this.fb.group({
      name: ['', []],
      email: ['', [Validators.email]],
      group: [null, []],
      app: [null, []],
      role: [null, []],
      status: [null, []],
      invalidatedIn: [null, []],
      errorCount: [null, []]
    });

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
  }

  /**
   * @description: 画面初期化処理
   */
  async ngOnInit() {
    await this.getSelectData();
    await this.search();
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    await this.i18n.updateDynamicLangData();
    await this.search();
  }

  /**
   * @description: 初期化処理
   */
  async init() {
    await this.search();
  }

  /**
   * @description: 获取选择框数据
   */
  async getSelectData() {
    await this.roleService.getRoles().then((data: any[]) => {
      if (data) {
        this.rolesSelect = data;
      } else {
        this.rolesSelect = [];
      }
    });
    await this.groupService.getGroups().then((data: any[]) => {
      if (data) {
        this.groupsSelect = data;
      } else {
        this.groupsSelect = [];
      }
    });
    await this.appService.getUserApps().then((data: any[]) => {
      if (data) {
        this.appsSelect = data;
      } else {
        this.appsSelect = [];
      }
    });
  }

  /**
   * @description: 用户一览数据取得
   */
  async search() {
    this.listOfDataDisplay = [];
    this.canUseUsers = 0;
    const params = {
      user_name: this.seachForm.controls.name.value,
      email: this.seachForm.controls.email.value,
      group: this.seachForm.controls.group.value,
      app: this.seachForm.controls.app.value,
      role: this.seachForm.controls.role.value,
      status: this.seachForm.controls.status.value,
      invalidatedIn: this.seachForm.controls.invalidatedIn.value,
      errorCount: this.seachForm.controls.errorCount.value
    };
    await this.userService.getUsers(params).then((data: any) => {
      if (data) {
        this.listOfDataDisplay = data;
      } else {
        this.listOfDataDisplay = [];
      }
    });

    // 判断客户用户数超过其限制否
    const user = this.tokenService.getUser();
    this.customer.getCustomerByID(user.customer_id).then(res => {
      if (res) {
        if (res.used_users >= res.max_users) {
          this.canAddMoreUser = false;
        } else {
          this.canUseUsers = res.max_users - res.used_users;
          this.canAddMoreUser = true;
        }
      }
    });
    this.selectData = [];
    this.selectDataOfValid = [];
    this.selectDataOfInvalid = [];
    this.selectDataOflocked = [];
    this.selectDataOfunlocked = [];
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
    this.listOfDataDisplay.forEach(f => (f.checked = event && f.user_type !== 1));
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
    this.selectDataOfValid = this.listOfDataDisplay.filter(d => d.checked === true && !d.deleted_by);
    this.selectDataOfInvalid = this.listOfDataDisplay.filter(d => d.checked === true && d.deleted_by);
    this.selectDataOflocked = this.listOfDataDisplay.filter(d => d.checked === true && d.error_count >= this.maxErrInputTimes);
    this.selectDataOfunlocked = this.listOfDataDisplay.filter(d => d.checked === true && d.error_count < this.maxErrInputTimes);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
    this.selectDataOfValid = this.listOfDataDisplay.filter(d => d.checked === true && !d.deleted_by);
    this.selectDataOfInvalid = this.listOfDataDisplay.filter(d => d.checked === true && d.deleted_by);
    this.selectDataOflocked = this.listOfDataDisplay.filter(d => d.checked === true && d.error_count >= this.maxErrInputTimes);
    this.selectDataOfunlocked = this.listOfDataDisplay.filter(d => d.checked === true && d.error_count < this.maxErrInputTimes);

    if (this.selectData.length === this.listOfDataDisplay.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
    if (this.selectDataOfInvalid.length > this.canUseUsers) {
      this.canRecoverUser = false;
    } else {
      this.canRecoverUser = true;
    }
  }

  getGroupName(groupId) {
    const group = this.groupsSelect.find(f => f.group_id === groupId);
    return group ? group.group_name : '';
  }

  getAppName(appId) {
    const app = this.appsSelect.find(f => f.app_id === appId);
    return app ? app.app_name : '';
  }

  getRoleName(roleId) {
    const role = this.rolesSelect.find(f => f.role_id === roleId);
    return role ? role.role_name : '';
  }

  /**
   * @description: 跳转到用户添加页面
   */
  foward() {
    this.router.navigate(['/user/add']);
  }

  /**
   * @description: 跳转到用户详细页面
   */
  goToDetail(userId: string) {
    const editUrl = `/user/edit/${userId}`;
    this.router.navigate([editUrl]);
  }

  /**
   * @description: 削除所有用户
   */
  deleteAll(): void {
    const params = [];
    this.selectDataOfValid.forEach(d => {
      params.push(d.user_id);
    });

    // 关联的流程检查
    let count = 0;
    this.selectData.forEach(u => {
      this.processService.getProcesses(u.user_id).then((data: any) => {
        if (data.length > 0) {
          count++;
        }
      });
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selUserDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selUserDelContent')}`,
      nzOnOk: () => {
        if (count > 0) {
          this.message.error(this.i18n.translateLang('common.message.error.E_025'));
          return;
        } else {
          // 删除选中数据
          this.userService.deleteSelectUsers(params).then(async res => {
            this.selectAll = false;
            this.message.success(this.i18n.translateLang('common.message.success.S_009'));
            this.search();
          });
        }
      }
    });
  }
  /**
   * @description: 重置选中用户密码
   */
  resetSelectedPassword(): void {
    const params = [];
    this.selectDataOfValid.forEach(d => {
      const param = {
        login_id: d.email,
        notice_email: d.notice_email
      };
      params.push(param);
    });
    this.auth.userSelectedPasswordReset(params).then(async res => {
      this.selectAll = false;
      this.message.success(this.i18n.translateLang('common.message.success.S_014'));
      this.search();
    });
  }

  /**
    * @description: 邮箱验证
    */
  mailverify(): void {
    const params = [];
    this.selectDataOfValid.forEach(d => {
      params.push(d.user_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selUserMailVerifyTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selUserMailVerifyContent')}`,
      nzOnOk: () => {
        // 进行邮箱验证
        this.userService.updateUserMail(params).then(async res => {
          if (res && res.msg) {
            this.message.error(res.msg);
          } else {
            this.selectAll = false;
            this.message.info(this.i18n.translateLang('common.message.info.I_022'));
            this.search();
          }
        });
      }
    });
  }

  /**
   * @description: 添加用户
   */
  forward(url: string) {
    this.router.navigateByUrl(url);
  }

  /**
   * @description: 恢复选中的无效化用户记录
   */
  recover(): void {
    const params = [];
    this.selectDataOfInvalid.forEach(d => {
      params.push(d.user_id);
    });

    this.userService.recoverUsers(params).then(async res => {
      this.selectAll = false;
      this.message.success(this.i18n.translateLang('common.message.success.S_005'));
      this.search();
    });
  }

  /**
   * @description: 解锁选中的被锁用户记录
   */
  unlock(): void {
    const params = [];
    this.selectDataOflocked.forEach(d => {
      params.push(d.user_id);
    });

    this.userService.unlockUsers(params).then(async res => {
      this.selectAll = false;
      this.message.success(this.i18n.translateLang('common.message.success.S_010'));
      this.search();
    });
  }

  /**
   * @description: 直接从服务器上下载csv文件
   * @return: csv文件
   */
  async downloadCsv() {
    const params = {
      user_name: this.seachForm.controls.name.value,
      email: this.seachForm.controls.email.value,
      group: this.seachForm.controls.group.value,
      app: this.seachForm.controls.app.value,
      role: this.seachForm.controls.role.value,
      invalidatedIn: this.seachForm.controls.invalidatedIn.value,
      errorCount: this.seachForm.controls.errorCount.value
    };

    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;

    await this.userService.downloadUsers(jobId, params).then(data => {
      this.message.info(this.i18n.translateLang('common.message.info.I_002'));
    });
  }

  uploadUsers() {
    // 获取APP选项
    const modalSel = this.modal.create({
      nzTitle: this.i18n.translateLang('page.user.uploadUser'),
      nzMaskClosable: false,
      nzWidth: 500,
      nzClosable: false,
      nzComponentParams: {},
      nzContent: UploadViewComponent,
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.cancel'),
          onClick: instance => {
            modalSel.close();
          }
        },
        {
          label: this.i18n.translateLang('common.button.upload'),
          disabled: instance => instance.fileList.length === 0,
          onClick: instance => {
            instance.handleUpload();
            modalSel.close();
          }
        }
      ]
    });
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
