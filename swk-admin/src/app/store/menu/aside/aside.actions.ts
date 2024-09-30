/*
 * @Description: 左侧菜单管理
 * @Author: RXC 廖欣星
 * @Date: 2019-04-24 11:18:10
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-08-29 14:35:04
 */

export class AddAsideMenu {
  static readonly type = '[menu] AddAsideMenu';
  constructor(public payload: any) {}
}

export class SetAsideMenu {
  static readonly type = '[menu] SetAsideMenu';
  constructor(public main: any[], public database: any[]) {}
}

export class SelectAsideMenu {
  static readonly type = '[menu] SelectAsideMenu';
  constructor(public payload: string) {}
}

export class RemoveAsideMenu {
  static readonly type = '[menu] RemoveAsideMenu';
  constructor(public path: string) {}
}

export class ResetMenu {
  static readonly type = '[menu] ResetMenu';
}
