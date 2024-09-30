/*
 * @Description: 组控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-05-24 16:57:30
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-09-29 16:15:48
 */

import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
    Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    AccessService, DatastoreService, FieldService, GroupService, ItemService, UserService,
    WorkflowService
} from '@api';
import { I18NService } from '@core';
import { Select } from '@ngxs/store';
import { ThemeInfo, ThemeInfoState } from '@store';

import { GroupFormComponent } from '../group-form/group-form.component';

@Component({
  selector: 'app-group-tree',
  templateUrl: './group-tree.component.html',
  styleUrls: ['./group-tree.component.less']
})
export class GroupTreeComponent implements OnInit, OnDestroy {
  private clicks = new Subject();
  private subscription: Subscription;

  @ViewChild('body') body: ElementRef;

  // 构造函数
  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private message: NzMessageService,
    private db: DatastoreService,
    private item: ItemService,
    private fieldService: FieldService,
    private fb: FormBuilder,
    private wf: WorkflowService,
    private viewContainerRef: ViewContainerRef,
    private modal: NzModalService,
    private accessService: AccessService,
    private i18n: I18NService
  ) {
    this.migrationForm = this.fb.group({
      access_key: [null, [Validators.required]]
    });
  }

  // 全局类型
  nodes: NzTreeNodeOptions[] = [];
  // 下拉选项控制
  dropdown: NzDropdownMenuComponent;
  // 活动节点
  activedNode: NzTreeNode;
  // 组的数据
  groups = [];
  // 显示的一览数据
  displayData = [];
  // 组的用户数据
  groupUsers = [];
  // 整个公司的用户的数据
  companyUsers = [];
  // 显示数据迁移窗口
  migrationVisible = false;
  // 数据迁移表单
  migrationForm: FormGroup;
  // 选中用户组
  selectedGroup = '';
  selectedGroupID = '';

  // user设置显示
  showUser = false;
  // 台账信息
  datastores = [];
  itemTotal = 0;
  userTotal = 0;
  selectDatastoreId = '';
  selectDatastoreName = '';

  datastoreList = [];

  migrationNodes: NzTreeNodeOptions[] = [];

  confirmModal: NzModalRef;

  // Select 当前的主题名称
  @Select(ThemeInfoState.getThemeInfo) currentTheme$: Observable<ThemeInfo>;

  /**
   * @description: 画面初始化处理
   */
  async ngOnInit() {
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async init() {
    // 防止按钮重复触发事件
    this.subscription = this.clicks.pipe(debounceTime(200)).subscribe((value: any) => {
      this.activeNode(value);
      const group_id = value.node.origin.group_id;
      this.setTransferData(group_id);
      this.selectedGroup = value.node.origin.group_name;
      this.selectedGroupID = value.node.origin.group_id;
      this.getItems();
    });

    // 获取所有台账数据
    await this.db.getDatastores().then((data: any[]) => {
      if (data) {
        this.datastoreList = data;
      } else {
        this.datastoreList = [];
      }
    });
    await this.getData();
    await this.getItems();

    // 初始默认选中默认组名称设定
    const rootGroup = this.groups.filter(g => g.parent_group_id === 'root');
    this.selectedGroupID = rootGroup[0].group_id;
    this.selectedGroup = rootGroup[0].group_name;
  }

  async getItems() {
    this.itemTotal = 0;
    this.datastores = [];

    const jobs = this.datastoreList.map(async (ds, index) => {
      return this.item.getItems(
        ds.datastore_id,
        {
          condition_list: [],
          condition_type: 'and',
          page_index: 1,
          page_size: 1
        },
        [this.activedNode.origin.access_key]
      );
    });

    forkJoin(jobs)
      .toPromise()
      .then(data => {
        if (data) {
          data.forEach((it, index) => {
            if (it) {
              if (it.total > 0) {
                this.datastores.push({
                  datastore_id: this.datastoreList[index].datastore_id,
                  datastore_name: this.datastoreList[index].datastore_name,
                  total: it.total
                });
                this.itemTotal += it.total;
              }
            }
          });
        }
      });
  }

  openModal(id: string): void {
    const modal = this.modal.create({
      nzTitle: id ? this.i18n.translateLang('page.group.nameEdit') : this.i18n.translateLang('common.button.add'),
      nzContent: GroupFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        editNodeId: id
      },
      nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
      nzFooter: [
        {
          label: id ? this.i18n.translateLang('common.button.update') : this.i18n.translateLang('common.button.add'),
          type: 'primary',
          disabled: instance => instance.validateForm.invalid,
          onClick: instance => {
            instance.submitForm(id);
            modal.close(true);
          }
        },
        {
          label: this.i18n.translateLang('common.button.cancel'),
          onClick: () => {
            modal.close(false);
          }
        }
      ]
    });
    modal.afterClose.subscribe(async result => {
      if (result) {
        await this.i18n.updateDynamicLangData();
        this.getData();
        if (id) {
          this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        } else {
          this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        }
      }
    });
  }

  /**
   * @description: 通过调用服务获取组的数据
   */
  async getData() {
    await this.groupService.getGroups().then((data: any) => {
      if (data) {
        this.groups = data;
      } else {
        this.groups = [];
      }
    });

    this.setTreeNodes();
    this.setTransferData(this.getRootGroupId());
  }

  /**
   * @description: 打开收缩的组
   */
  openFolder(data: NzTreeNode | Required<NzFormatEmitEvent>): void {
    // do something if u want
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  /**
   * @description: 可活动的节点
   */
  activeNode(data: NzFormatEmitEvent): void {
    // tslint:disable-next-line:no-non-null-assertion
    this.activedNode = data.node!;
  }

  /**
   * @description: 设置数据的转移，例如：用户A从A组变为B组
   */
  async setTransferData(group_id: string) {
    await this.getGroupUsers(group_id);
    await this.getAllUsers();

    this.displayData = [];

    this.groupUsers.forEach(user => {
      const item = user;
      item.key = user.user_id;
      item.title = user.user_name;
      item.direction = 'left';

      this.displayData.push(item);
    });
    this.companyUsers.forEach(user => {
      const item = user;
      item.key = user.user_id;
      item.title = user.user_name;
      item.direction = 'right';

      if (this.groupUsers.filter(g => g.user_id === user.user_id).length === 0) {
        this.displayData.push(item);
      }
    });

    this.userTotal = this.displayData.filter(f => f.direction === 'left').length;
  }

  /**
   * @description: 设置数据树结构
   */
  setTreeData(source) {
    // 对源数据深度克隆
    const cloneData = JSON.parse(JSON.stringify(source));
    // 循环所有项，并添加children属性
    return cloneData.filter(father => {
      // 返回每一项的子级数组
      const branchArr = cloneData.filter(child => father.group_id === child.parent_group_id);
      if (branchArr.length === 0) {
        father.isLeaf = true;
        father.title = father.group_name;
        father.key = father.group_id;
        father.expanded = true;
        father.icon = 'anticon anticon-user';
      } else {
        father.title = father.group_name;
        father.expanded = true;
        father.key = father.group_id;
      }
      // 给父级添加一个children属性，并赋值
      // tslint:disable-next-line: no-unused-expression
      branchArr.length > 0 ? (father.children = branchArr) : '';
      // 返回第一层
      return father.parent_group_id === 'root';
    });
  }

  /**
   * @description: 设置树节点
   */
  setTreeNodes() {
    const treeData = this.setTreeData(this.groups);
    this.nodes = treeData;
    this.activedNode = new NzTreeNode(treeData[0]);
  }

  /**
   * @description: 通过组id获取组的根
   * @return：组id
   */
  getRootGroupId(): string {
    let id = '';
    for (let index = 0; index < this.groups.length; index++) {
      const g = this.groups[index];
      if (g.parent_group_id === 'root') {
        id = g.group_id;
        break;
      }
    }
    return id;
  }

  /**
   * @description: 选择组
   */
  select(value: any) {
    this.clicks.next(value);
  }

  /**
   * @description: 调用服务获取组包含的用户
   */
  async getGroupUsers(groupId: string) {
    const params = {
      group: groupId
    };
    await this.userService.getUsers(params).then(data => {
      if (data) {
        this.groupUsers = data;
      } else {
        this.groupUsers = [];
      }
    });
  }

  /**
   * @description: 调用服务获取所有的用户
   */
  async getAllUsers() {
    await this.userService.getUsers({}).then(data => {
      if (data) {
        this.companyUsers = data;
      } else {
        this.companyUsers = [];
      }
    });
  }

  /**
   * @description: 显示数据迁移窗口
   */
  showMigrationModal(id: string, name: string): void {
    this.selectDatastoreId = id;
    this.selectDatastoreName = name;

    // 数据迁移先用户组集合取得
    const treeData = this.setSelectTreeData(this.groups);
    this.checkMigrationDisabled(treeData, this.selectedGroupID);
    this.migrationNodes = treeData;

    this.migrationVisible = true;
  }

  /**
   * @description: 隐藏数据迁移模态窗口
   */
  handleMigrationCancel(): void {
    this.migrationVisible = false;
  }

  /**
   * @description: 组重命名事件
   */
  submitMigrationForm(): void {
    // 更新的组名信息
    const params = {
      old_owner: this.activedNode.origin.access_key,
      new_owner: this.getAccessKeyByGroupID(this.migrationForm.controls.access_key.value)
    };

    // 调用服务更新组
    this.item.changeOwner(this.selectDatastoreId, params).then(() => {
      this.migrationForm.reset();
      this.getItems();
      this.migrationVisible = false;
    });
  }

  /**
   * @description: 通过用户组ID获取access_key
   */
  getAccessKeyByGroupID(id: string): string {
    const group = this.groups.find(g => g.group_id === id);
    return group.access_key;
  }

  /**
   * @description: 递归判断用户组是否是迁移元用户组
   */
  checkMigrationDisabled(nodes: NzTreeNodeOptions[], key: string) {
    if (!nodes) {
      return;
    }
    nodes.forEach(n => {
      if (n.key === key) {
        n.disabled = true;
        return;
      } else {
        this.checkMigrationDisabled(n.children, key);
      }
    });
  }

  /**
   * @description: 递归判断是否选中
   */
  checkDisabled(nodes: NzTreeNodeOptions[], key: string) {
    if (!nodes) {
      return;
    }
    nodes.forEach(n => {
      if (n.key === key) {
        n.disabled = true;
        this.setDisabled(n.children);
        return;
      } else {
        this.checkDisabled(n.children, key);
      }
    });
  }

  /**
   * @description: 递归设置是否选中
   */
  setDisabled(nodes: NzTreeNodeOptions[]) {
    if (!nodes) {
      return;
    }
    nodes.forEach(n => {
      n.disabled = true;
      this.setDisabled(n.children);
    });
  }

  /**
   * @description: 设置数据树结构
   */
  setSelectTreeData(source) {
    // 对源数据深度克隆
    const cloneData = JSON.parse(JSON.stringify(source));
    // 循环所有项，并添加children属性
    return cloneData.filter(father => {
      // 返回每一项的子级数组
      const branchArr = cloneData.filter(child => father.group_id === child.parent_group_id);
      if (branchArr.length === 0) {
        father.isLeaf = true;
        father.title = this.i18n.translateLang(father.group_name);
        father.key = father.group_id;
        father.icon = 'anticon anticon-user';
      } else {
        father.title = this.i18n.translateLang(father.group_name);
        father.key = father.group_id;
      }

      // 给父级添加一个children属性，并赋值
      // tslint:disable-next-line: no-unused-expression
      branchArr.length > 0 ? (father.children = branchArr) : '';
      // 返回第一层
      return father.parent_group_id === 'root';
    });
  }

  async delete(node) {
    this.confirmModal = await this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.userGroupDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.userGroupDelContent')}`,
      nzOnOk: async () => {
        // 公司默认组织不能删除
        if (node.origin.parent_group_id === 'root') {
          this.message.error(this.i18n.translateLang('common.message.error.E_019'));
          return;
        }

        // 不能删除拥有子组织的组织
        if (node.children.length > 0) {
          this.message.error(
            this.i18n.translateLang('common.message.error.E_013', {
              children: node.children.length
            })
          );
          return;
        }
        let hasWf = false;
        await this.wf.getWorkflows({ group: node.origin.group_id }).then(data => {
          if (data && data.length > 0) {
            hasWf = true;
          }
        });

        if (hasWf) {
          this.message.error(this.i18n.translateLang('common.message.error.E_025'));
          return;
        }

        // 不能删除还包含用户组织
        await this.getGroupUsers(node.key);
        if (this.groupUsers.length > 0) {
          this.message.error(
            this.i18n.translateLang('common.message.error.E_017', {
              user: this.groupUsers.length
            })
          );
          return;
        }

        // 不能删除有正在使用的数据使用权的组织
        let accessCount = 0;
        // Access数据
        await this.accessService.getAccess().then(access => {
          if (access) {
            access.forEach((ac: any) => {
              if (ac.group_id === node.key) {
                accessCount++;
              }
            });
          }
        });
        // 关联的组织检查
        if (accessCount > 0) {
          this.message.error(
            this.i18n.translateLang('common.message.error.E_030', {
              access: accessCount
            })
          );
          return;
        }

        let canDelete = true;
        let datastoreList = [];
        // 获取所有台账数据
        await this.db.getDatastores().then((data: any[]) => {
          if (data) {
            datastoreList = data;
          } else {
            datastoreList = [];
          }
        });

        await Promise.all(
          datastoreList.map(async ds => {
            return this.fieldService.getFields(ds.datastore_id, { field_type: 'user', is_required: 'true' });
          })
        ).then((data: any[]) => {
          if (data) {
            const fieldList = [];
            data.forEach(fields => {
              if (fields) {
                fields.forEach(f => {
                  if (f.user_group_id === node.key) {
                    const ds = datastoreList.find(d => d.datastore_id === f.datastore_id);
                    fieldList.push({
                      datastoreName: this.i18n.translateLang(ds.datastore_name),
                      fieldName: this.i18n.translateLang(f.field_name)
                    });
                  }
                });
              }
            });
            if (fieldList.length > 0) {
              fieldList.forEach(item => {
                this.message.error(
                  this.i18n.translateLang('common.message.error.E_012', {
                    dsName: item.datastoreName,
                    fieldName: item.fieldName
                  })
                );
              });
              canDelete = false;
            }
          }
        });
        // 检查组织数据
        if (canDelete) {
          let total = 0;

          // 获取台账item的数据
          await Promise.all(
            datastoreList.map(async (ds, index) => {
              return this.item.getItems(
                ds.datastore_id,
                {
                  condition_list: [],
                  condition_type: 'and',
                  page_index: 1,
                  page_size: 1
                },
                [node.origin.access_key]
              );
            })
          ).then((data: any[]) => {
            data.forEach((it, index) => {
              if (it) {
                total += it.total;
              }
            });
          });
          if (total > 0) {
            this.message.error(
              this.i18n.translateLang('common.message.error.E_010', {
                total: total
              })
            );
          } else {
            const params = [];
            params.push(node.key);
            this.groupService.hardDeleteSelectGroups(params).then(async res => {
              await this.getData();
              this.message.success(this.i18n.translateLang('common.message.success.S_003'));
            });
          }
        }
      }
    });
  }

  /**
   * @description: 改变用户所在组
   */
  async change(value) {
    await this.groupService.getGroups().then((data: any) => {
      if (data) {
        this.groups = data;
      } else {
        this.groups = [];
      }
    });

    if (value.from === 'right') {
      const groupId = this.activedNode ? this.activedNode.origin.key : this.getRootGroupId();
      await this.updateUsers(value.list, groupId, value.from);
      this.setTransferData(groupId);
      return;
    }

    if (value.from === 'left') {
      if (this.activedNode.origin.key === this.getRootGroupId()) {
        this.message.warning(this.i18n.translateLang('common.message.warning.W_004'));
        this.setTransferData(this.activedNode.origin.key);
        return;
      }
      const groupId = this.getRootGroupId();
      await this.updateUsers(value.list, groupId, value.from);
      const currentGroupId = this.activedNode ? this.activedNode.origin.key : this.getRootGroupId();
      this.setTransferData(currentGroupId);
      return;
    }
  }

  /**
   * @description: 更新用户
   */
  async updateUsers(list: any[], groupId: string, from: string) {
    await Promise.all(
      list.map(async user => {
        return this.userService.updateUser({ group: groupId }, user.user_id);
      })
    ).then(data => {
      const user = [list.map(u => u.user_name)];
      const oldgroupId = list[0].group;
      this.message.success(
        this.i18n.translateLang('common.message.success.S_008', {
          user: user,
          oldGroup: this.getGroupName(oldgroupId),
          newGroup: this.getGroupName(groupId)
        })
      );
    });
  }

  getGroupName(groupId: string) {
    const group = this.groups.find(g => g.group_id === groupId);
    if (group) {
      return this.i18n.translateLang(group.group_name);
    }
  }

  /**
   * @description: 刷新
   */
  async refresh() {
    // 获取所有台账数据
    await this.db.getDatastores().then((data: any[]) => {
      if (data) {
        this.datastoreList = data;
      } else {
        this.datastoreList = [];
      }
    });
    await this.getData();
    await this.getItems();

    // 初始默认选中默认组名称设定
    const rootGroup = this.groups.filter(g => g.parent_group_id === 'root');
    this.selectedGroupID = rootGroup[0].group_id;
    this.selectedGroup = rootGroup[0].group_name;
  }

  /**
   * @description: 刷新
   */
  showUserSetting() {
    this.showUser = true;
  }

  /**
   * @description: 隐藏数据迁移模态窗口
   */
  hiddeUserSetting(): void {
    this.showUser = false;
  }
}
