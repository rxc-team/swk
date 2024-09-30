/*
 * @Description: 共通服务管理
 * @Author: RXC 呉見華
 * @Date: 2019-04-15 11:51:28
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-06-22 09:41:08
 */

import { forkJoin } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { OptionService, RoleService, UserService } from '@api';

interface SelectItem {
  label: string;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class CommonService {
  constructor(private userService: UserService, private roleService: RoleService, private optionService: OptionService) {}

  private USER_KEY = 'users';
  private ROLES_KEY = 'roles';
  private OPTIONS_KEY = 'options';

  /**
   * @description: 系统初始化加载，获取基本数据保存到本地。
   */
  load() {
    const jobs = [
      this.userService.getUsers({ invalidatedIn: 'true' }),
      this.roleService.getRoles(),
      this.optionService.getAllOptionLabels()
    ];
    forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const userData = data[0];
          const roleData = data[1];
          const optionData = data[2];

          if (userData) {
            const userList: Array<SelectItem> = [];
            userData.forEach(user => {
              userList.push({ label: user.user_name, value: user.user_id });
            });
            sessionStorage.setItem(this.USER_KEY, JSON.stringify(userList));
          }

          if (roleData) {
            const roleList: Array<SelectItem> = [];
            roleData.forEach(role => {
              roleList.push({ label: role.role_name, value: role.role_id });
            });
            sessionStorage.setItem(this.ROLES_KEY, JSON.stringify(roleList));
          }

          if (optionData) {
            const optionList: Array<SelectItem> = [];
            optionData.forEach(option => {
              optionList.push({ label: option.option_label, value: option.option_value });
            });
            sessionStorage.setItem(this.OPTIONS_KEY, JSON.stringify(optionList));
          }
        }
      });
  }

  /**
   * @description: 获取所有用户
   * @return: 返回用户列表（只包含ID和用户名）
   */
  getUserList() {
    const userJson = sessionStorage.getItem(this.USER_KEY);
    const userList = JSON.parse(userJson);
    return userList;
  }

  /**
   * @description: 获取所有角色数据
   * @return: 返回角色列表（只包含ID和角色名）
   */
  getRoleList() {
    const roleJson = sessionStorage.getItem(this.ROLES_KEY);
    const roleList = JSON.parse(roleJson);
    return roleList;
  }

  /**
   * @description: 获取所有选项
   * @return: 返回用户列表（只包含value和label）
   */
  getOptionList() {
    const optionJson = sessionStorage.getItem(this.OPTIONS_KEY);
    const optionList = JSON.parse(optionJson);
    return optionList;
  }

  /**
   * @description: 根据快照获取URL地址
   * @param ActivatedRouteSnapshot 路由
   * @return: URL地址
   */
  getUrl(route: ActivatedRouteSnapshot): string {
    let next = this.getTruthRoute(route);
    const segments = [];
    while (next) {
      segments.push(next.url.join('/'));
      next = next.parent;
    }
    const url =
      '/' +
      segments
        .filter(i => i)
        .reverse()
        .join('/');
    return url;
  }

  /**
   * @description: 获取下一个子路由
   * @param ActivatedRouteSnapshot 路由
   * @return: 返回下一个子路由
   */
  getTruthRoute(route: ActivatedRouteSnapshot) {
    let next = route;
    while (next.firstChild) {
      next = next.firstChild;
    }
    return next;
  }
}
