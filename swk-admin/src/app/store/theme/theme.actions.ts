/*
 * @Description: 主题action管理
 * @Author: RXC 廖欣星
 * @Date: 2019-04-15 11:51:28
 * @LastEditors: RXC 廖欣星
 * @LastEditTime: 2019-06-21 13:24:12
 */

import { ThemeInfo } from './theme.interface';

// 设置主题
export class SetTheme {
  static readonly type = '[menu] SetTheme';
  constructor(public payload: ThemeInfo) {}
}

// 重置主题
export class ResetTheme {
  static readonly type = '[menu] ResetTheme';
}
