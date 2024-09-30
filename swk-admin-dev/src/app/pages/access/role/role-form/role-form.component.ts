/*
 * @Description: 角色添加控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-05-22 10:54:46
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-12-29 10:51:10
 */
import * as _ from 'lodash';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.less']
})
export class RoleFormComponent implements OnInit {
  navigationSubscription;

  // 构造函数
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private event: NgEventBus,
    private message: NzMessageService,
    private i18n: I18NService,
    public router: Router,
    private bs: NzBreakpointService,
    private role: RoleService
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

  get name() {
    return this.roleForm.controls.name;
  }
  get description() {
    return this.roleForm.controls.description;
  }
  get ipWhitelist() {
    return this.roleForm.controls.ipWhitelist;
  }
  get menus() {
    return this.roleForm.controls.menus;
  }

  // 全局类型
  roleForm: FormGroup;
  ipSegments = [];
  menuList = [];
  selectMenuList = [];
  status = 'add';
  isSmall = false;

  /**
   * @description: 画面初始化处理
   */
  async ngOnInit() {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required], [this.roleNameAsyncValidator]],
      description: ['', []],
      ipWhitelist: ['', [this.validateIP]],
      menus: ['', []]
    });
    this.init();
  }

  /**
   * @description: 初期化处理
   */
  async init() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.status = 'edit';
      this.route.data.subscribe((data: { roleData: any }) => {
        const roleInfo = data.roleData.roleInfo;
        this.roleForm.controls.name.setValue(roleInfo.role_name);
        this.roleForm.controls.description.setValue(roleInfo.description);

        if (roleInfo.role_type === 2) {
          this.roleForm.disable();
        }

        this.menuList = data.roleData.menuList;
        this.ipSegments = data.roleData.roleInfo.ip_segments;
        this.setIPSegments();
      });
    } else {
      this.route.data.subscribe((data: { roleData: any }) => {
        this.menuList = data.roleData.menuList;
      });
    }
  }

  setIPSegments() {
    if (this.ipSegments && this.ipSegments.length > 0) {
      let segmentsStr = '';
      this.ipSegments.forEach(segment => {
        segmentsStr = segmentsStr + segment.start + '-' + segment.end + '\n';
      });
      this.roleForm.controls.ipWhitelist.setValue(segmentsStr);
    }
  }

  /**
   * @description: IP白名单合法性检查
   */
  validateIP(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      const segmentsStr: String = control.value;
      const segmentArr = segmentsStr.split('\n');
      let hasError = false;
      for (let index = 0; index < segmentArr.length; index++) {
        const segment = segmentArr[index];
        if (segment) {
          const segmentItems = segment.split('-');
          // 判断每个IP段是否有且仅有起止二个IP
          if (segmentItems.length !== 2) {
            hasError = true;
            break;
          }
          const ipStart = segmentItems[0];
          const ipEnd = segmentItems[1];
          // 判断每个IP段的起止IP皆不为空
          if (!ipStart || !ipEnd) {
            hasError = true;
            break;
          }
          // 判断每个IP段的起止IP是否为合法IP
          const start = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipStart);
          const end = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipEnd);
          if (!start || !end) {
            hasError = true;
            break;
          }
          // 判断每个IP段的起止IP是否为合法IP段
          const startNumbers = ipStart.split('.');
          const startNum =
            parseInt(startNumbers[0], 10) * 256 * 256 * 256 +
            parseInt(startNumbers[1], 10) * 256 * 256 +
            parseInt(startNumbers[2], 10) * 256 +
            parseInt(startNumbers[3], 10);
          const endNumbers = ipEnd.split('.');
          const endNum =
            parseInt(endNumbers[0], 10) * 256 * 256 * 256 +
            parseInt(endNumbers[1], 10) * 256 * 256 +
            parseInt(endNumbers[2], 10) * 256 +
            parseInt(endNumbers[3], 10);
          if (startNum > endNum) {
            hasError = true;
            break;
          }
        }
      }

      if (hasError) {
        return { validateIP: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  /**
   * @description: 角色名称唯一性检查
   */
  roleNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const id = this.route.snapshot.paramMap.get('id');
      this.role.roleNameAsyncValidator(id, control.value, 'true').then((role: boolean) => {
        if (!role) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 角色添加事件
   */
  submitroleForm = ($event: any, value: any) => {
    const ipSegments = [];
    if (this.ipWhitelist.value) {
      const segmentArr = this.ipWhitelist.value.split('\n');
      for (let index = 0; index < segmentArr.length; index++) {
        const element = segmentArr[index];
        if (element) {
          const arr = element.split('-');
          ipSegments.push({
            start: arr[0],
            end: arr[1]
          });
        }
      }
    }

    this.getSelected(this.menuList);

    if (this.status === 'add') {
      // 角色添加的信息
      const params = {
        role_name: this.name.value,
        description: this.description.value,
        ip_segments: ipSegments,
        menus: this.selectMenuList
      };
      this.role.post(params).then(res => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.event.cast('role:refresh');
        this.location.back();
      });
    } else {
      const params = {
        role_name: this.name.value,
        description: this.description.value,
        ip_segments: ipSegments,
        menus: this.selectMenuList
      };
      const id = this.route.snapshot.paramMap.get('id');
      this.role.put(id, params).then(res => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.event.cast('role:refresh');
        this.location.back();
      });
    }
  };

  // 选中
  getSelected(menu: any[]) {
    if (!menu) {
      return;
    }

    menu.forEach(m => {
      if (m.checked) {
        this.selectMenuList.push(m.key);
      }

      if (m.children) {
        this.getSelected(m.children);
      }
    });
  }

  /**
   * @description: 重置表单事件
   */
  reset() {
    this.roleForm.reset();
  }

  checkOffOther(value, folder) {
    if (value === false) {
      folder.write = false;
      folder.delete = false;
    }
  }

  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
  }
}
