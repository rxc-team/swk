import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { forkJoin } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AccessService, GroupService, RoleService } from '@api';
import { I18NService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-access-list',
  templateUrl: './access-list.component.html',
  styleUrls: ['./access-list.component.less']
})
export class AccessListComponent implements OnInit {
  cols = [
    {
      title: 'page.dataAccess.group',
      width: '150px'
    },
    {
      title: 'page.dataAccess.role',
      width: '150px'
    },
    {
      title: 'common.text.createdAt',
      width: '150px'
    },
    {
      title: 'common.text.updateAt'
    }
  ];

  // 显示数据
  listData = [];
  // 选中的数据
  selectData = [];
  selectDataOfValid = [];
  selectDataOfInvalid = [];
  // 检索表单
  seachForm: FormGroup;
  // 是否全部选中
  selectAll = false;

  // Access
  roles = [];
  // 组织
  groups = [];

  isSmall = false;
  isZoomFlg = false;

  confirmModal: NzModalRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService,
    private i18n: I18NService,
    private accessService: AccessService,
    private bs: NzBreakpointService,
    private groupService: GroupService,
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
      roleId: ['', []],
      groupId: ['', []],
      invalidatedIn: [null, []]
    });
    const jbos = [this.roleService.getRoles({ invalidatedIn: 'true' }), this.groupService.getGroups(), this.accessService.getAccess()];

    await forkJoin(jbos)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const roleData = data[0];
          const groupData = data[1];
          const accessData = data[2];

          if (roleData) {
            this.roles = roleData;
          } else {
            this.roles = [];
          }

          if (accessData) {
            this.listData = accessData;
          } else {
            this.listData = [];
          }

          if (groupData) {
            this.groups = groupData;
          } else {
            this.roles = [];
          }
        }
      });
  }

  /**
   * @description: Access一覧データ取得
   */
  async search() {
    // 获取检索条件
    const roleId = this.seachForm.get('roleId').value;
    const groupId = this.seachForm.get('groupId').value;
    // const invalidatedIn = this.seachForm.controls.invalidatedIn.value;
    // 检索Access数据
    await this.accessService.getAccess({ roleId: roleId, groupId: groupId }).then(data => {
      if (data) {
        this.listData = data;
      } else {
        this.listData = [];
      }
    });
    this.selectData = [];
    this.selectDataOfValid = [];
    this.selectDataOfInvalid = [];
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
    this.listData.forEach(f => (f.checked = event && f.role_type !== 1));
    this.selectData = this.listData.filter(d => d.checked === true);
    this.selectDataOfValid = this.listData.filter(d => d.checked === true && !d.deleted_by);
    this.selectDataOfInvalid = this.listData.filter(d => d.checked === true && d.deleted_by);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.listData.filter(d => d.checked === true);
    this.selectDataOfValid = this.listData.filter(d => d.checked === true && !d.deleted_by);
    this.selectDataOfInvalid = this.listData.filter(d => d.checked === true && d.deleted_by);

    if (this.selectData.length === this.listData.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 跳转到Access添加页面
   */
  foward() {
    this.router.navigate(['/access/add']);
  }

  /**
   * @description: 跳转到Access详细页面
   */
  goToDetail(accessId: string) {
    const editUrl = `/access/edit/${accessId}`;
    this.router.navigate([editUrl]);
  }

  /**
   * @description: 削除所有Access
   * @return:后台数据
   */
  deleteAll(): void {
    const params = [];
    this.selectDataOfValid.forEach(r => {
      params.push(r.access_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selDataDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selDataDelContent')}`,
      nzOnOk: () => {
        this.accessService.deleteSelectAccess(params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_009'));
          this.search();
        });
      }
    });
  }

  /**
   * @description: 物理削除所有Access
   * @return:后台数据
   */
  hardDeleteAll(): void {
    const params = [];
    this.selectData.forEach(r => {
      params.push(r.access_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selDataHardDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selDataHardDelContent')}`,
      nzOnOk: () => {
        this.accessService.harddeleteSelectAccess(params).then(async res => {
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
    this.selectData.forEach(d => {
      params.push(d.access_id);
    });

    this.roleService.recoverRoles(params).then(async res => {
      this.selectAll = false;
      this.message.success(this.i18n.translateLang('common.message.success.S_005'));
      this.search();
    });
    this.selectData = [];
    this.selectDataOfValid = [];
    this.selectDataOfInvalid = [];
  }

  getGroupName(groupId: string) {
    const group = this.groups.find(g => g.group_id === groupId);
    if (group) {
      return group.group_name;
    }
    return '';
  }

  getRoleName(roleId: string) {
    const role = this.roles.find(r => r.role_id === roleId);
    if (role) {
      return role.role_name;
    }
    return '';
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
