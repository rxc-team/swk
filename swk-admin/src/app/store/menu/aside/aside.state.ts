/*
 * @Description: 侧边栏状态管理
 * @Author: RXC 廖欣星
 * @Date: 2019-06-17 17:32:16
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-08-30 10:47:20
 */

import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import {
    AddAsideMenu, RemoveAsideMenu, ResetMenu, SelectAsideMenu, SetAsideMenu
} from './aside.actions';

// state
export class AsideMenuStateModel {
  menu: Array<any> | null;
  dynamicMenu: Array<any> | null;
}

@State<AsideMenuStateModel>({
  name: 'adm_aside',
  defaults: {
    menu: null,
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
  setMenu({ patchState }: StateContext<AsideMenuStateModel>, { main, database }: SetAsideMenu) {
    patchState({
      menu: main,
      dynamicMenu: database
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

  // 删除一个query菜单
  @Action(ResetMenu)
  reset({ getState, patchState }: StateContext<AsideMenuStateModel>) {
    const state = getState();
    patchState({
      menu: [...state.menu],
      dynamicMenu: []
    });
  }
}
