import { forkJoin, from, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
/*
 * @Description: 共通服务管理
 * @Author: RXC 呉見華
 * @Date: 2019-04-15 11:51:28
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-06-18 13:25:19
 */
import { Injectable } from '@angular/core';
import { RoleService, UserService } from '@api';
import { Store } from '@ngxs/store';
import { SetAsideMenu } from '@store';

import { TokenStorageService } from './token.service';

const allMenu = [
  '/home',
  '/document',
  '/access',
  '/access/user/list',
  '/access/role/list',
  '/system',
  '/system/template/list',
  '/system/backup/info',
  '/system/job/list',
  '/system/release',
  '/system/update/list',
  '/config',
  '/config/action/list',
  '/config/allow/list',
  '/config/level/list',
  '/help',
  '/help/typeList',
  '/help/list',
  '/log',
  '/log/login',
  '/log/operate',
  '/customer',
  '/customer/list',
  '/customer/question/list',
  '/customer/message'
];

// 第三方库
interface SelectItem {
  label: string;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class CommonService {
  // Select 当前的用户信息
  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private tokenService: TokenStorageService,
    private httpClient: HttpClient,
    private store: Store
  ) {}

  private USER_KEY = 'users';
  private ROLES_KEY = 'roles';

  /**
   * @description: 系统初始化加载，获取基本数据保存到本地。
   */
  load() {
    const userId = this.tokenService.getUserId();

    const jobs = [
      this.userService.getUsers({ invalidatedIn: 'true' }),
      this.roleService.getRoles(),
      this.userService.getUserByID(userId),
      this.httpClient.get('assets/app-data.json')
    ];
    forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const userData = data[0];
          const roleData = data[1];
          const userInfo = data[2];
          const appData = data[3];

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

          if (userInfo) {
            const menus = new Set<string>();

            for (let i = 0; i < userInfo.roles.length; i++) {
              const r = userInfo.roles[i];
              const role = roleData.find(rd => rd.role_id === r);

              if (role.role_type === 2) {
                allMenu.forEach(m => {
                  menus.add(m);
                });

                break;
              }

              if (role && role.menus) {
                role.menus.forEach(m => {
                  menus.add(m);
                });
              }
            }

            menus.forEach(m => {
              this.select(appData.slideMenu, m);
            });

            // 初始化左侧菜单
            this.store.dispatch(new SetAsideMenu(appData.slideMenu));
          }
        }
      });
  }

  // 选中
  select(menu: any[], key: string) {
    if (!menu) {
      return;
    }

    for (let i = 0; i < menu.length; i++) {
      const m = menu[i];
      if (m.path === key) {
        m.show = true;
        break;
      }

      if (m.children) {
        this.select(m.children, key);
      }
    }

    return menu;
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
}
