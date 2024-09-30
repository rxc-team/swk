import { cloneDeep } from 'lodash';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { RoleService } from '@api';

const menuList = [
  {
    key: '/home',
    title: 'menu.home',
    icon: 'home',
    isLeaf: true,
    checked: true,
    disabled: true
  },
  {
    key: '/document',
    title: 'menu.document',
    icon: 'folder-open',
    isLeaf: true,
    checked: false,
    disabled: false
  },
  {
    key: '/access',
    title: 'menu.accessManage',
    icon: 'safety',
    isLeaf: false,
    checked: false,
    disabled: false,
    children: [
      {
        key: '/access/user/list',
        title: 'menu.userManage',
        icon: 'user',
        isLeaf: true,
        checked: false,
        disabled: false
      },
      {
        key: '/access/role/list',
        title: 'menu.roleManage',
        icon: 'team',
        isLeaf: true,
        checked: false,
        disabled: false
      }
    ]
  },
  {
    key: '/system',
    title: 'menu.system',
    icon: 'interaction',
    isLeaf: false,
    checked: false,
    disabled: false,
    children: [
      {
        key: '/system/template/list',
        title: 'menu.template',
        isLeaf: true,
        checked: false,
        disabled: false
      },
      {
        key: '/system/backup/info',
        title: 'menu.backup',
        isLeaf: true,
        checked: false,
        disabled: false
      },
      {
        key: '/system/job/list',
        title: 'menu.job',
        isLeaf: true,
        checked: false,
        disabled: false
      },
      {
        key: '/system/release',
        title: 'menu.releaseSetting',
        isLeaf: true,
        checked: false,
        disabled: false
      },
      {
        key: '/system/update/list',
        title: 'menu.updateList',
        isLeaf: true,
        checked: false,
        disabled: false
      }
    ]
  },
  {
    key: '/config',
    title: 'menu.config.title',
    icon: 'unordered-list',
    isLeaf: false,
    checked: false,
    disabled: false,
    children: [
      {
        key: '/config/action/list',
        title: 'menu.config.action.list',
        isLeaf: true,
        checked: false,
        disabled: false
      },
      {
        key: '/config/allow/list',
        title: 'menu.config.allow.list',
        isLeaf: true,
        checked: false,
        disabled: false
      },
      {
        key: '/config/level/list',
        title: 'menu.config.level.list',
        isLeaf: true,
        checked: false,
        disabled: false
      }
    ]
  },
  {
    key: '/help',
    title: 'menu.help.title',
    icon: 'read',
    isLeaf: false,
    checked: false,
    disabled: false,
    children: [
      {
        key: '/help/typeList',
        title: 'menu.help.type',
        isLeaf: true,
        checked: false,
        disabled: false
      },
      {
        key: '/help/list',
        title: 'menu.help.article',
        isLeaf: true,
        checked: false,
        disabled: false
      }
    ]
  },
  {
    key: '/log',
    title: 'menu.logger.title',
    icon: 'history',
    isLeaf: false,
    checked: false,
    disabled: false,
    children: [
      {
        key: '/log/login',
        title: 'menu.logger.login',
        isLeaf: true,
        checked: false,
        disabled: false
      },
      {
        key: '/log/operate',
        title: 'menu.logger.action',
        isLeaf: true,
        checked: false,
        disabled: false
      }
    ]
  },
  {
    key: '/customer',
    title: 'menu.customer.title',
    icon: 'contacts',
    isLeaf: false,
    checked: false,
    disabled: false,
    children: [
      {
        key: '/customer/list',
        title: 'menu.customer.list',
        isLeaf: false,
        checked: false,
        disabled: false
      },
      {
        key: '/customer/question/list',
        title: 'menu.customer.qa',
        isLeaf: false,
        checked: false,
        disabled: false
      },
      {
        key: '/customer/message',
        title: 'header.title.noticeCenter',
        isLeaf: false,
        checked: false,
        disabled: false
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class RoleResolverService implements Resolve<any> {
  constructor(private role: RoleService) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const id = route.paramMap.get('id');

    if (id) {
      const roleInfo = await this.role.getRoleByID(id);

      const menus = cloneDeep(menuList);

      if (roleInfo.role_type === 2) {
        this.selectAll(menus);
        return { roleInfo, menuList: menus };
      }

      if (roleInfo && roleInfo.menus) {
        roleInfo.menus.forEach(m => {
          this.select(menus, m);
        });
      }

      return { roleInfo, menuList: menus };
    }
    const emptyMenus = cloneDeep(menuList);

    return { menuList: emptyMenus };
  }

  // 选中
  select(menu: any[], key: string) {
    if (!menu) {
      return;
    }

    for (let i = 0; i < menu.length; i++) {
      const m = menu[i];
      if (m.key === key) {
        m.checked = true;
        break;
      }

      if (m.children) {
        this.select(m.children, key);
      }
    }

    return menu;
  }

  // 选中
  selectAll(menu: any[]) {
    if (!menu) {
      return;
    }

    menu.forEach(m => {
      m.checked = true;
      m.disabled = true;

      if (m.children) {
        this.selectAll(m.children);
      }
    });

    return menu;
  }
}
