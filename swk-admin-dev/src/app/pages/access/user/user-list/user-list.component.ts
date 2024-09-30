/*
 * @Description: 用户列表控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-04-29 13:44:16
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-09-23 10:57:55
 */

import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService, UserService } from '@api';
import { I18NService } from '@core';

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
      title: 'page.user.userRole',
      width: '200px'
    },
    {
      title: 'common.text.createdDate',
      width: '150px'
    },
    {
      title: 'common.text.updateDate'
    }
  ];

  listOfDataDisplay = [];
  rolesSelect = [];
  selectData = [];
  maxErrInputTimes = 5;
  seachForm: FormGroup;
  selectAll = false;
  confirmModal: NzModalRef;
  isSmall = false;
  isZoomFlg = false;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService,
    private i18n: I18NService,
    private bs: NzBreakpointService,
    private fb: FormBuilder
  ) {
    this.seachForm = this.fb.group({
      name: ['', []],
      email: ['', [Validators.email]],
      role: [null, []],
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
  }

  /**
   * @description: 用户一览数据取得
   */
  async search() {
    this.listOfDataDisplay = [];
    const params = {
      user_name: this.seachForm.controls.name.value,
      email: this.seachForm.controls.email.value,
      role: this.seachForm.controls.role.value,
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

    this.selectData = [];
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
    this.listOfDataDisplay.forEach(f => (f.checked = event && f.user_type !== 2));
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);

    if (this.selectData.length === this.listOfDataDisplay.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  getRoleName(roleId) {
    const role = this.rolesSelect.find(f => f.role_id === roleId);
    return role ? role.role_name : '';
  }

  /**
   * @description: 跳转到用户添加页面
   */
  foward() {
    this.router.navigate(['/access/user/add']);
  }

  /**
   * @description: 跳转到用户详细页面
   */
  goToDetail(userId: string) {
    const editUrl = `/access/user/edit/${userId}`;
    this.router.navigate([editUrl]);
  }

  get invalidDisabled() {
    const users = this.listOfDataDisplay.filter(d => d.checked === true && !d.deleted_by && d.user_type !== 2);
    return users.length === 0;
  }

  get unlockDisabled() {
    const users = this.listOfDataDisplay.filter(d => d.checked === true && d.error_count >= this.maxErrInputTimes);
    return users.length === 0;
  }

  get recoverDisabled() {
    const users = this.listOfDataDisplay.filter(d => d.checked === true && d.deleted_by && d.user_type !== 2);
    return users.length === 0;
  }

  /**
   * @description: 削除所有用户
   */
  deleteAll(): void {
    const params = [];

    const validUsers = this.listOfDataDisplay.filter(d => d.checked === true && !d.deleted_by && d.user_type !== 2);
    validUsers.forEach(d => {
      params.push(d.user_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selUserDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selUserDelContent')}`,
      nzOnOk: () => {
        // 删除选中数据
        this.userService.deleteSelectUsers(params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_009'));
          this.search();
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
    const invalidUsers = this.listOfDataDisplay.filter(d => d.checked === true && d.deleted_by);
    invalidUsers.forEach(d => {
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

    const lockedUsers = this.listOfDataDisplay.filter(d => d.checked === true && d.error_count >= this.maxErrInputTimes);
    lockedUsers.forEach(d => {
      params.push(d.user_id);
    });

    this.userService.unlockUsers(params, 'system').then(async res => {
      this.selectAll = false;
      this.message.success(this.i18n.translateLang('common.message.success.S_010'));
      this.search();
    });
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
