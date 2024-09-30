/*
 * @Description: 检索action管理
 * @Author: RXC 呉見華
 * @Date: 2019-12-20 13:16:35
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-12-20 13:16:35
 */

// 设置检索快捷键
export class SetSearchCondition {
  static readonly type = '[search] SetSearchCondition';
  constructor(
    public payload: {
      conditions: any[];
      condition_type: string;
    }
  ) {}
}

export class ClearSearchCondition {
  static readonly type = '[search] ClearSearchCondition';
}
