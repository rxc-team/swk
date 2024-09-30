/*
 * @Description: 设置状态管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-10 16:49:28
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-07-03 16:28:43
 */

import { Injectable } from '@angular/core';
import { MessageService } from '@api';
import { TokenStorageService } from '@core/services/token.service';
// 第三方类库
import { Action, Select, Selector, State, StateContext } from '@ngxs/store';

// 自定义服务或控件
import { ChangeStatus, ClearMessage, RefreshMessage, RemoveMessage } from './notify.actions';
import { Message } from './notify.interface';

// state
export class MessageStateModel {
  messages: Array<Message> | null;
}

@State<MessageStateModel>({
  name: 'dev_message',
  defaults: {
    messages: []
  }
})
@Injectable()
export class MessageState {
  @Selector()
  static getMessages(state: MessageStateModel) {
    return state.messages;
  }

  @Selector()
  static getUnreadMessages(state: MessageStateModel) {
    const messages = state.messages.filter(m => m.status === 'unread');
    return messages;
  }

  constructor(private messageService: MessageService, private tokenService: TokenStorageService) {}

  // 刷新消息
  @Action(RefreshMessage)
  async refresh({ getState, setState }: StateContext<MessageStateModel>, {}: RefreshMessage) {
    // 获取当前用户的ID
    const userid = this.tokenService.getUserId();
    // 从数据库获取该用户所有通知
    const param = {
      recipient: userid,
      limit: 20
    };
    await this.messageService.getMessages(param).then((res: any[]) => {
      if (res) {
        setState({
          messages: res
        });
      } else {
        setState({
          messages: []
        });
      }
    });
  }

  // 删除一条消息
  @Action(RemoveMessage)
  async remove({ getState, setState }: StateContext<MessageStateModel>, { message_id }: RemoveMessage) {
    // 删除数据
    // 这条通知从数据库中移除
    await this.messageService.deleteMessageById(message_id);
    // 获取当前用户的ID
    const userid = this.tokenService.getUserId();
    // 从数据库获取该用户所有通知
    const parma = {
      recipient: userid
    };
    await this.messageService.getMessages(parma).then((res: any[]) => {
      if (res) {
        setState({
          messages: res
        });
      } else {
        setState({
          messages: []
        });
      }
    });
  }

  // 删除一条消息
  @Action(ChangeStatus)
  async changeStatus({ getState, setState }: StateContext<MessageStateModel>, { message_id }: ChangeStatus) {
    // 更新状态
    await this.messageService.changeStatus(message_id);
    // 获取当前用户的ID
    const userid = this.tokenService.getUserId();
    // 从数据库获取该用户所有通知
    const parma = {
      recipient: userid
    };
    await this.messageService.getMessages(parma).then((res: any[]) => {
      if (res) {
        setState({
          messages: res
        });
      } else {
        setState({
          messages: []
        });
      }
    });
  }

  // 清空消息
  @Action(ClearMessage)
  clear({ getState, setState }: StateContext<MessageStateModel>, { onlyLocal }: ClearMessage) {
    if (!onlyLocal) {
      // 从数据库中移除
      this.messageService.deleteSelectMessages();
    }
    setState({
      messages: []
    });
  }
}
