import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { forkJoin } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupService, ItemService, UserService } from '@api';
import { I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-change-owners',
  templateUrl: './change-owners.component.html',
  styleUrls: ['./change-owners.component.less']
})
export class ChangeOwnersComponent implements OnInit {
  // 台账字段
  @Input() conditionParam = {
    condition_list: [],
    condition_type: 'and'
  };
  @Input() showText = false;
  selectNodes: NzTreeNodeOptions[] = [];
  accessKey = '';
  visible = false;
  loadfinished = false;

  constructor(
    private gs: GroupService,
    private is: ItemService,
    private event: NgEventBus,
    private message: NzMessageService,
    private i18n: I18NService,
    private tokenService: TokenStorageService,
    private userService: UserService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  checkDisabled(nodes: NzTreeNodeOptions[], key: string) {
    if (!nodes) {
      return;
    }
    nodes.forEach(n => {
      if (n.key === key) {
        return;
      } else {
        n.disabled = true;
        this.checkDisabled(n.children, key);
      }
    });
  }

  show() {
    const userId = this.tokenService.getUserId();
    forkJoin([this.gs.getGroups(), this.userService.getUserByID({ type: '0', user_id: userId })])
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const groupsData: any[] = data[0];
          const userData = data[1];
          if (groupsData) {
            const nowUserGroup = groupsData.find(g => g.group_id === userData.group);
            const treeData = this.setSelectTreeData(groupsData);
            this.checkDisabled(treeData, nowUserGroup.access_key);
            this.selectNodes = treeData;
          } else {
            this.selectNodes = [];
          }
        }
      })
      .finally(() => {
        this.loadfinished = true;
      });
    this.visible = true;
  }

  change() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    const params = Object.assign(this.conditionParam, {
      owner: this.accessKey
    });

    this.is.changeSelectOwners(datastoreId, params).then(() => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
      this.visible = false;
      this.accessKey = '';
      this.event.cast('item:refresh');
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
        father.key = father.access_key;
        father.icon = 'anticon anticon-user';
      } else {
        father.title = this.i18n.translateLang(father.group_name);
        father.key = father.access_key;
      }

      // 给父级添加一个children属性，并赋值
      // tslint:disable-next-line: no-unused-expression
      branchArr.length > 0 ? (father.children = branchArr) : '';
      // 返回第一层
      return father.parent_group_id === 'root';
    });
  }
}
