/*
 * @Description: 侧边栏action管理
 * @Author: RXC 廖欣星
 * @Date: 2019-06-17 17:32:20
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-15 10:27:25
 */
export class AddAsideMenu {
  static readonly type = '[menu] AddAsideMenu';
  constructor(public payload: any) {}
}

export class SetAsideMenu {
  static readonly type = '[menu] SetAsideMenu';
  constructor(public payload: any[]) {}
}

export class SelectAsideMenu {
  static readonly type = '[menu] SelectAsideMenu';
  constructor(public payload: string) {}
}

export class RemoveAsideMenu {
  static readonly type = '[menu] RemoveAsideMenu';
  constructor(public path: string) {}
}

export class AddQueryMenu {
  static readonly type = '[menu] AddQueryMenu';
  constructor(public payload: any) {}
}

export class RemoveQureyMenu {
  static readonly type = '[menu] RemoveQureyMenu';
  constructor(public path: string) {}
}

export class ResetQureyMenu {
  static readonly type = '[menu] ResetQureyMenu';
}

export class ResetMenu {
  static readonly type = '[menu] ResetMenu';
}
