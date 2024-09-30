import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-generate-user-setting',
  templateUrl: './generate-user-setting.component.html',
  styleUrls: ['./generate-user-setting.component.less']
})
export class GenerateUserSettingComponent implements OnInit {
  @Input() groupId = '';
  @Input() disabled = false;

  // 构造函数
  constructor(private fb: FormBuilder, private groupService: GroupService, private i18n: I18NService, private bs: NzBreakpointService) {
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

    this.form = this.fb.group({
      userGroup: [null, [Validators.required]]
    });
  }

  // 全局类型
  // 画面迁移元区分flag
  form: FormGroup;
  // 用户选项
  userGroups = [];

  selectNodes: NzTreeNodeOptions[] = [];

  isSmall = false;

  /**
   * @description: 画面初始化
   */
  ngOnInit() {
    this.init();
  }

  /**
   * @description: 初始化处理
   */
  async init() {
    await this.groupService.getGroups().then(data => {
      if (data) {
        this.userGroups = data;
      } else {
        this.userGroups = [];
      }
    });

    const treeData = this.setSelectTreeData(this.userGroups);
    this.selectNodes = treeData;

    if (this.groupId) {
      this.getForm('userGroup').setValue(this.groupId);
    }

    if (this.disabled) {
      this.form.disable();
    }
  }

  getForm(formName: string) {
    return this.form.controls[formName];
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
}
