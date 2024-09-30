import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessService, DatastoreService, GroupService, RoleService } from '@api';
import { I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-access-form',
  templateUrl: './access-form.component.html',
  styleUrls: ['./access-form.component.less']
})
export class AccessFormComponent implements OnInit {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private message: NzMessageService,
    private i18n: I18NService,
    private tokenService: TokenStorageService,
    public router: Router,
    private bs: NzBreakpointService,
    private accessService: AccessService,
    private roleService: RoleService,
    private groupService: GroupService,
    private dsService: DatastoreService
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

  // 全局类型
  form: FormGroup;
  datastores = [];
  roles = [];
  groups = [];
  status = 'add';
  isSmall = false;

  dataAccess = [];
  currentApp = '';

  /**
   * @description: 画面初始化处理
   */
  async ngOnInit() {
    this.currentApp = this.tokenService.getUserApp();

    this.form = this.fb.group({
      roleId: ['', [Validators.required]],
      groupId: ['', [Validators.required]]
    });
    this.init();
  }

  /**
   * @description: 初期化处理
   */
  async init() {
    const jbos = [this.roleService.getRoles({ invalidatedIn: 'true' }), this.groupService.getGroups(), this.dsService.getDatastores()];
    await forkJoin(jbos)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const roleData = data[0];
          const groupData = data[1];
          const dsData = data[2];

          if (roleData) {
            this.roles = roleData;
          } else {
            this.roles = [];
          }

          if (dsData) {
            this.datastores = dsData;
          } else {
            this.datastores = [];
          }

          if (groupData) {
            this.groups = groupData;
          } else {
            this.groups = [];
          }
        }
      });

    this.datastores.forEach(ds => {
      this.dataAccess.push({
        datastore_id: ds.datastore_id,
        datastore_name: ds.datastore_name,
        actions: this.setTreeData(this.groups, []),
        nodes: []
      });
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.status = 'edit';
      await this.accessService.getAccessByID(id).then(data => {
        if (data) {
          this.form.get('roleId').setValue(data.role_id);
          this.form.get('groupId').setValue(data.group_id);
        }
      });
    }
  }

  /**
   * @description: 设置数据树结构
   */
  setTreeData(source: any[], actions: any[]) {
    // 对源数据深度克隆
    const cloneData = JSON.parse(JSON.stringify(source));
    // 循环所有项，并添加children属性
    return cloneData.filter(father => {
      // 返回每一项的子级数组
      const branchArr = cloneData.filter(child => father.group_id === child.parent_group_id);
      if (branchArr.length > 0) {
        father.children = branchArr;
      }

      if (actions) {
        const action = actions.find(a => a.group_id === father.group_id);
        if (action) {
          father.canFind = action.can_find;
          father.canUpdate = action.can_update;
          father.canDelete = action.can_delete;
        }
      }

      // 返回第一层
      return father.parent_group_id === 'root';
    });
  }

  /**
   * @description: 设置节点数据
   */
  setNodes(d, nodes) {
    d.nodes = nodes;
  }

  /**
   * @description: 角色添加事件
   */
  submitroleForm = ($event: any, value: any) => {
    const accessMap = new Map();

    this.dataAccess.forEach(d => {
      const actions = d.nodes;

      const result = [];

      if (actions && actions.length > 0) {
        actions.forEach(g => {
          result.push({
            group_id: g.group_id,
            access_key: g.access_key,
            can_find: g.canFind,
            can_update: g.canUpdate,
            can_delete: g.canDelete
          });
        });
      }

      accessMap[d.datastore_id] = { actions: result };
    });

    const apps = new Map();
    apps[this.currentApp] = { data_access: accessMap };

    // 角色添加的信息
    const params = {
      role_id: this.form.get('roleId').value,
      group_id: this.form.get('groupId').value,
      apps: apps
    };
    this.accessService.addAccess(params).then(res => {
      this.message.success(this.i18n.translateLang('common.message.success.S_001'));
      this.location.back();
    });
  };

  /**
   * @description: 组织变更
   */
  groupChange(groupId: string) {
    const roleId = this.form.get('roleId').value;
    if (groupId && roleId) {
      this.accessService.getAccess({ roleId, groupId }).then((data: any[]) => {
        if (data && data.length === 1) {
          const aceData = data[0];
          const apps = aceData.apps;

          for (const key in apps) {
            if (Object.prototype.hasOwnProperty.call(apps, key)) {
              if (key === this.currentApp) {
                const accessMap = apps[key].data_access;

                this.dataAccess.forEach(da => {
                  if (Object.prototype.hasOwnProperty.call(accessMap, da.datastore_id)) {
                    da.actions = this.setTreeData(this.groups, accessMap[da.datastore_id].actions);
                    const nodes = [];
                    if (accessMap[da.datastore_id].actions) {
                      accessMap[da.datastore_id].actions.forEach(a => {
                        nodes.push({
                          group_id: a.group_id,
                          access_key: a.access_key,
                          canFind: a.can_find,
                          canUpdate: a.can_update,
                          canDelete: a.can_delete
                        });
                      });
                    }
                    da.nodes = nodes;
                  }
                });
              }
            }
          }
        } else {
          this.dataAccess.forEach(da => {
            da.actions = this.setTreeData(this.groups, []);
            da.nodes = [];
          });
        }
      });
    }
  }

  /**
   * @description: 角色变更
   */
  roleChange(roleId: string) {
    const groupId = this.form.get('groupId').value;
    if (groupId && roleId) {
      this.accessService.getAccess({ roleId, groupId }).then((data: any[]) => {
        if (data && data.length === 1) {
          const aceData = data[0];
          const apps = aceData.apps;

          for (const key in apps) {
            if (Object.prototype.hasOwnProperty.call(apps, key)) {
              if (key === this.currentApp) {
                const accessMap = apps[key].data_access;

                this.dataAccess.forEach(da => {
                  if (Object.prototype.hasOwnProperty.call(accessMap, da.datastore_id)) {
                    da.actions = this.setTreeData(this.groups, accessMap[da.datastore_id].actions);
                    const nodes = [];
                    if (accessMap[da.datastore_id].actions) {
                      accessMap[da.datastore_id].actions.forEach(a => {
                        nodes.push({
                          group_id: a.group_id,
                          access_key: a.access_key,
                          canFind: a.can_find,
                          canUpdate: a.can_update,
                          canDelete: a.can_delete
                        });
                      });
                    }
                    da.nodes = nodes;
                  }
                });
              }
            }
          }
        } else {
          this.dataAccess.forEach(da => {
            da.actions = this.setTreeData(this.groups, []);
            da.nodes = [];
          });
        }
      });
    }
  }

  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
  }
}
