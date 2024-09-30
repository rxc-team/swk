/*
 * @Description: 消息action管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-10 16:49:18
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-07-03 10:38:06
 */
import { Message } from './notify.interface';

// 添加消息
export class AddMessage {
  static readonly type = '[message] AddMessage';
  constructor(public msg: Message) {}
}

// 刷新消息
export class RefreshMessage {
  static readonly type = '[message] RefreshMessage';
  constructor() {}
}

// 更新消息状态
export class ChangeStatus {
  static readonly type = '[message] ChangeStatus';
  constructor(public message_id: string) {}
}

// 删除一条消息
export class RemoveMessage {
  static readonly type = '[message] RemoveMessage';
  constructor(public message_id: string) {}
}

// 清空消息
export class ClearMessage {
  static readonly type = '[message] ClearMessage';
  constructor(public onlyLocal: boolean = true) {}
}
