/*
 * @Description: 侧边栏状态管理
 * @Author: RXC 廖欣星
 * @Date: 2019-06-17 17:32:16
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-15 10:32:33
 */
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import {
  AddAsideMenu, AddQueryMenu, RemoveAsideMenu, RemoveQureyMenu, ResetMenu, ResetQureyMenu,
  SelectAsideMenu, SetAsideMenu
} from './aside.actions';

// state
export class AsideMenuStateModel {
  menu: Array<any> | null;
  queryMenu: any | null;
  datastoreMenu: any | null;
  reportMenu: any | null;
  dynamicMenu: Array<any> | null;
}

@State<AsideMenuStateModel>({
  name: 'web_aside',
  defaults: {
    menu: null,
    queryMenu: null,
    datastoreMenu: null,
    reportMenu: null,
    dynamicMenu: null
  }
})
@Injectable()
export class AsideMenuState {
  @Selector()
  static getAsideMenuList(state: AsideMenuStateModel) {
    return state;
  }

  // 添加一个侧边栏菜单
  @Action(AddAsideMenu)
  add({ getState, patchState }: StateContext<AsideMenuStateModel>, { payload }: AddAsideMenu) {
    const state = getState();
    if (state.dynamicMenu) {
      if (!state.dynamicMenu.find(a => a.path === payload.path)) {
        patchState({ dynamicMenu: [...state.dynamicMenu, payload] });
      }
    } else {
      patchState({ dynamicMenu: [payload] });
    }
  }

  // 深度克隆
  deepClone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  // 设置侧边栏菜单选中
  @Action(SelectAsideMenu)
  selectMenu({ getState, patchState }: StateContext<AsideMenuStateModel>, { payload }: SelectAsideMenu) {
    const state = getState();

    let queryMenu = this.deepClone(state.queryMenu);
    if (queryMenu) {
      let queryChildMenu = this.deepClone(state.queryMenu).children;
      if (queryChildMenu) {
        queryChildMenu = this.select(queryChildMenu, payload);
      }
      queryMenu.children = queryChildMenu;
      queryMenu = this.open([queryMenu])[0];
      patchState({ queryMenu: queryMenu });
    }

    let menu = this.deepClone(state.menu);
    if (menu) {
      menu = this.select(menu, payload);
      menu = this.open(menu);
      patchState({ menu: menu });
    }

    let dynamicMenu = this.deepClone(state.dynamicMenu);
    if (dynamicMenu) {
      dynamicMenu = this.select(dynamicMenu, payload);
      dynamicMenu = this.open(dynamicMenu);
      patchState({ dynamicMenu: dynamicMenu });
    }
  }

  // 选中
  select(menu: any[], path: string) {
    if (!menu) {
      return;
    }

    menu.forEach(m => {
      if (m.path === path) {
        m.selected = true;
      } else {
        m.selected = false;
      }

      if (m.children) {
        this.select(m.children, path);
      }
    });

    return menu;
  }

  // 判断是否需要打开
  needOpen(menu: any[]): boolean {
    if (!menu) {
      return false;
    }
    let op = false;
    menu.forEach(m => {
      if (m.selected) {
        op = true;
      }
    });

    return op;
  }

  // 打开menu
  open(menu: any[]) {
    menu.forEach(m => {
      if (m.children && this.needOpen(m.children)) {
        m.open = true;
      }
    });

    return menu;
  }

  // 设置侧边栏菜单
  @Action(SetAsideMenu)
  setMenu({ patchState }: StateContext<AsideMenuStateModel>, { payload }: SetAsideMenu) {
    patchState({
      menu: payload,
      queryMenu: {
        level: 1,
        path: '/querys',
        title: 'menu.shortcut',
        icon: 'link',
        open: false,
        selected: false,
        disabled: false,
        children: []
      },
      datastoreMenu: {
        level: 1,
        path: '/datastores',
        title: 'menu.datastoreTitle',
        icon: 'database',
        open: false,
        selected: false,
        disabled: false,
        children: []
      },
      reportMenu: {
        level: 1,
        path: '/report',
        title: 'menu.reportTitle',
        icon: 'table',
        open: false,
        selected: false,
        disabled: false,
        children: []
      }
    });
  }

  // 删除一个侧边栏菜单
  @Action(RemoveAsideMenu)
  remove({ getState, patchState }: StateContext<AsideMenuStateModel>, { path }: RemoveAsideMenu) {
    const state = getState();
    patchState({
      dynamicMenu: state.dynamicMenu.filter(a => a.path !== path)
    });
  }

  // 添加一个query菜单
  @Action(AddQueryMenu)
  addQuery({ getState, patchState }: StateContext<AsideMenuStateModel>, { payload }: AddQueryMenu) {
    const state = getState();
    const queryMenu = this.deepClone(state.queryMenu);
    if (queryMenu) {
      if (queryMenu.children) {
        if (queryMenu.children.find(q => q.path === payload.path)) {
          return;
        } else {
          queryMenu.children.push(payload);
          patchState({
            queryMenu: queryMenu
          });
        }
      } else {
        queryMenu.children = [payload];
        patchState({
          queryMenu: queryMenu
        });
      }
    } else {
      const q = {
        level: 1,
        path: '/querys',
        title: 'menu.shortcut',
        icon: 'link',
        open: false,
        selected: false,
        disabled: false,
        children: []
      };
      q.children.push(payload);

      patchState({
        queryMenu: q
      });
    }
  }

  // 删除一个query菜单
  @Action(RemoveQureyMenu)
  removeQuery({ getState, patchState }: StateContext<AsideMenuStateModel>, { path }: RemoveQureyMenu) {
    const state = getState();
    const queryMenu = state.queryMenu;
    if (queryMenu) {
      if (queryMenu.children.find(q => q.path === path)) {
        const query = this.deepClone(queryMenu);
        query.children = queryMenu.children.filter(q => q.path !== path);
        if (query.children.length === 0) {
          const child = {
            level: 2,
            path: ``,
            title: 'menu.empty',
            open: false,
            selected: false,
            disabled: true
          };
          query.children = [child];
        }
        patchState({
          queryMenu: query
        });
      } else {
      }
    }
  }

  // 重置query菜单
  @Action(ResetQureyMenu)
  resetQureyMenu({ getState, patchState }: StateContext<AsideMenuStateModel>) {
    const state = getState();
    const queryMenu = state.queryMenu;
    const q = this.deepClone(queryMenu);
    q.children = [];
    patchState({
      queryMenu: q
    });
  }

  // 删除一个query菜单
  @Action(ResetMenu)
  reset({ getState, patchState }: StateContext<AsideMenuStateModel>) {
    const state = getState();
    patchState({
      menu: [...state.menu],
      queryMenu: {
        level: 1,
        path: '/querys',
        title: 'menu.shortcut',
        icon: 'link',
        open: false,
        selected: false,
        disabled: false,
        children: []
      },
      dynamicMenu: []
    });
  }
}
