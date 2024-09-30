/*
 * @Description: 角色列表显示控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-04-22 13:09:48
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-23 10:53:20
 */

import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService, UserService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.less']
})
export class RoleListComponent implements OnInit {
  cols = [
    {
      title: 'page.role.roleName',
      width: '150px'
    },
    {
      title: 'page.role.roleDescription',
      width: '150px'
    },
    {
      title: 'common.text.createdDate',
      width: '150px'
    },
    {
      title: 'common.text.updateDate'
    }
  ];

  // 显示数据
  listOfDataDisplay = [];
  // 顾客信息
  customerSelectData = [];
  // 选中的数据
  selectData = [];
  // 检索表单
  seachForm: FormGroup;
  // 是否全部选中
  selectAll = false;

  // 整个公司的用户的数据
  companyUsers = [];

  isSmall = false;
  isZoomFlg = false;

  confirmModal: NzModalRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService,
    private i18n: I18NService,
    private userService: UserService,
    private bs: NzBreakpointService,
    private roleService: RoleService
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
  }

  /**
   * @description: 画面初期化処理
   */
  async ngOnInit() {
    this.seachForm = this.fb.group({
      roleName: ['', []],
      description: ['', []],
      invalidatedIn: [null, []]
    });
    this.search();
  }
  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    await this.i18n.updateDynamicLangData();
    await this.search();
  }

  /**
   * @description: 角色一覧データ取得
   */
  async search() {
    // 获取检索条件
    const roleName = this.seachForm.controls.roleName.value;
    const description = this.seachForm.controls.description.value;
    const invalidatedIn = this.seachForm.controls.invalidatedIn.value;
    // 检索角色数据
    await this.roleService.getRoles({ roleName: roleName, description: description, invalidatedIn: invalidatedIn }).then(data => {
      if (data) {
        this.listOfDataDisplay = data;
      } else {
        this.listOfDataDisplay = [];
      }
    });
    this.selectData = [];
  }

  get invalidDisabled() {
    const roles = this.listOfDataDisplay.filter(d => d.checked === true && !d.deleted_by && d.role_type !== 2);
    return roles.length === 0;
  }
  get recoverDisabled() {
    const roles = this.listOfDataDisplay.filter(d => d.checked === true && d.deleted_by && d.role_type !== 2);
    return roles.length === 0;
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
    this.listOfDataDisplay.forEach(f => (f.checked = event && f.role_type !== 2));
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

  /**
   * @description: 跳转到角色添加页面
   */
  foward() {
    this.router.navigate(['/access/role/add']);
  }

  /**
   * @description: 跳转到角色详细页面
   */
  goToDetail(roleId: string) {
    const editUrl = `/access/role/edit/${roleId}`;
    this.router.navigate([editUrl]);
  }

  /**
   * @description: 削除所有角色
   * @return:后台数据
   */
  async deleteAll(): Promise<void> {
    let i = 0;
    const params = [];

    // 获取用户数据
    await this.userService.getUsers({}).then(data => {
      if (data) {
        this.companyUsers = data;
      } else {
        this.companyUsers = [];
      }
    });

    const roles = this.listOfDataDisplay.filter(d => d.checked === true && !d.deleted_by && d.role_type !== 2);
    // 循环选中角色
    roles.forEach(r => {
      params.push(r.role_id);
    });
    // 用户是否使用该角色判断,累计使用的用户数
    if (this.companyUsers) {
      this.companyUsers.forEach(user => {
        let isUserUsed = false;
        if (user.roles) {
          for (let index = 0; index < user.roles.length; index++) {
            if (params.filter(r => r === user.roles[index]).length > 0) {
              isUserUsed = true;
            }
          }
        }
        if (isUserUsed) {
          i++;
        }
      });
    }

    // 无效化确认
    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selRoleDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selRoleDelContent')}`,
      nzOnOk: () => {
        // 使用角色的用户检查
        if (i > 0) {
          this.message.error(
            this.i18n.translateLang('common.message.error.E_018', {
              user: i
            })
          );
          return;
        }

        // 删除选中角色
        this.roleService.deleteSelectRoles(params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_009'));
          this.search();
        });
      }
    });
  }

  /**
   * @description: 物理削除所有角色
   * @return:后台数据
   */
  async hardDeleteAll(): Promise<void> {
    let i = 0;
    const params = [];

    // 获取用户数据
    await this.userService.getUsers({}).then(data => {
      if (data) {
        this.companyUsers = data;
      } else {
        this.companyUsers = [];
      }
    });

    const roles = this.listOfDataDisplay.filter(d => d.checked === true && d.role_type !== 2);
    // 循环选中角色
    roles.forEach(r => {
      params.push(r.role_id);
    });
    // 用户是否使用该角色判断,累计使用的用户数
    if (this.companyUsers) {
      this.companyUsers.forEach(user => {
        let isUserUsed = false;
        if (user.roles) {
          for (let index = 0; index < user.roles.length; index++) {
            if (params.filter(r => r === user.roles[index]).length > 0) {
              isUserUsed = true;
            }
          }
        }
        if (isUserUsed) {
          i++;
        }
      });
    }

    // 删除确认
    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selRoleHardDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selRoleHardDelContent')}`,
      nzOnOk: () => {
        // 使用角色的用户检查
        if (i > 0) {
          this.message.error(
            this.i18n.translateLang('common.message.error.E_018', {
              user: i
            })
          );
          return;
        }

        // 删除选中角色
        this.roleService.harddeleteSelectRoles(params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.search();
        });
      }
    });
  }

  /**
   * @description: 恢复选中的无效化APP记录
   */
  recover(): void {
    const params = [];

    const roles = this.listOfDataDisplay.filter(d => d.checked === true && !d.deleted_by && d.role_type !== 2);

    roles.forEach(d => {
      params.push(d.role_id);
    });

    this.roleService.recoverRoles(params).then(async res => {
      this.selectAll = false;
      this.message.success(this.i18n.translateLang('common.message.success.S_005'));
      this.search();
    });
    this.selectData = [];
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
