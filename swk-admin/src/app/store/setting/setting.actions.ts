/*
 * @Description: 设置action管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-10 16:49:18
 * @LastEditors: RXC 廖欣星
 * @LastEditTime: 2019-06-21 13:16:35
 */

// 设置检索快捷键
export class SetSearchKey {
  static readonly type = '[setting] SetSearchKey';
  constructor(public payload: string) {}
}

// 设置是否全屏
export class SetFullScreen {
  static readonly type = '[setting] SetFullScreen';
  constructor(public payload: boolean) {}
}

// 设置是否收缩侧边栏
export class SetSliderCollapse {
  static readonly type = '[setting] SetSliderCollapsed';
  constructor(public payload: string) {}
}

// 设置是否使用必应壁纸作为搜索画面背景
export class SetSearchImage {
  static readonly type = '[setting] SetSearchImage';
}

export class ResetSetting {
  static readonly type = '[setting] ResetSetting';
}
