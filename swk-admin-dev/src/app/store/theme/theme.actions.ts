/*
 * @Description: テーマアクション
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-06-19 17:13:49
 */
// カスタムサービスまたは管理
import { ThemeInfo } from './theme.interface';

/**
 * @description: テーマ設定
 */
export class SetTheme {
  static readonly type = '[menu] SetTheme';
  constructor(public payload: ThemeInfo) {}
}

/**
 * @description: テーマリセット
 */
export class ResetTheme {
  static readonly type = '[menu] ResetTheme';
}
