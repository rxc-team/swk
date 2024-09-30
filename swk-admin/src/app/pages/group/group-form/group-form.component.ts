import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { forkJoin, Observable, Observer } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupService, ValidationService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.less']
})
export class GroupFormComponent implements OnInit {
  @Input() editNodeId = '';

  validateForm: FormGroup;

  show = false;

  groups = [];
  selectNodes: NzTreeNodeOptions[] = [];

  constructor(
    private i18n: I18NService,
    private groupService: GroupService,
    private message: NzMessageService,
    private router: Router,
    private fb: FormBuilder,
    private validation: ValidationService
  ) {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required], [this.groupNameAsyncValidator]],
      parent_id: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.editNodeId) {
      forkJoin([this.groupService.getGroups(), this.groupService.getGroupById(this.editNodeId)])
        .toPromise()
        .then((data: any[]) => {
          if (data) {
            const groupsData = data[0];
            const groupData = data[1];

            if (groupsData) {
              this.groups = groupsData;
              const treeData = this.setSelectTreeData(this.groups);
              this.checkDisabled(treeData, this.editNodeId);
              this.selectNodes = treeData;
            } else {
              this.groups = [];
            }

            if (groupData) {
              this.validateForm.controls.parent_id.setValue(groupData.parent_group_id);
              this.validateForm.controls.name.setValue(this.i18n.translateLang(groupData.group_name));
              this.editNodeId = groupData.group_id;
            }
          }
        })
        .finally(() => {
          this.show = true;
        });
    } else {
      this.groupService
        .getGroups()
        .then((data: any) => {
          if (data) {
            this.groups = data;
            const treeData = this.setSelectTreeData(this.groups);
            this.selectNodes = treeData;
          } else {
            this.groups = [];
          }
        })
        .finally(() => {
          this.show = true;
        });
    }
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

  /**
   * @description: 用户组名称唯一性检查
   */
  groupNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.validation.validationUnique('common.groups', control.value, { change_id: this.editNodeId }).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

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
   * @description: 添加组事件
   */
  submitForm(id: string): void {
    let parentId = this.validateForm.controls.parent_id.value;
    if (!parentId) {
      parentId = this.getRootGroupId();
    }

    // 添加的组信息
    const params = {
      parent_group_id: parentId,
      group_name: this.validateForm.controls.name.value
    };

    if (id === '' || id === null) {
      // 调用服务添加组
      this.groupService.addGroup(params).then(() => {
        this.validateForm.reset();
      });
    } else {
      // 调用服务更新组
      this.groupService.updateGroup(id, params).then(() => {
        this.router.navigate(['/group/list']);
      });
    }
  }
}
