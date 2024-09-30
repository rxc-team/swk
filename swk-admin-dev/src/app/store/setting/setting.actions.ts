/*
 * @Description: 設置アクション
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-08-17 10:52:13
 */

/**
 * @description: 検索ショットカード設定
 */
export class SetSearchKey {
  static readonly type = '[setting] SetSearchKey';
  constructor(public payload: string) {}
}

/**
 * @description: FullScreen設定
 */
export class SetFullScreen {
  static readonly type = '[setting] SetFullScreen';
  constructor(public payload: boolean) {}
}

/**
 * @description: アサイドバー伸縮設置
 */
// 设置是否收缩侧边栏
export class SetSliderCollapse {
  static readonly type = '[setting] SetSliderCollapsed';
  constructor(public payload: string) {}
}

/**
 * @description: 検索背景設定
 */
export class SetSearchImage {
  static readonly type = '[setting] SetSearchImage';
}

/**
 * @description: 設置リセット
 */
export class ResetSetting {
  static readonly type = '[setting] ResetSetting';
}
