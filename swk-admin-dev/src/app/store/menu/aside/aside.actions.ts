/*
 * @Description: アサイドアクション
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-06-19 15:54:00
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

export class ResetMenu {
  static readonly type = '[menu] ResetMenu';
}
