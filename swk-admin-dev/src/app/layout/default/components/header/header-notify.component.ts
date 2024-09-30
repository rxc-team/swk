import { NgEventBus } from 'ng-event-bus';
/*
 * @Description: 通知中心
 * @Author: RXC 呉見華
 * @Date: 2019-10-10 16:27:51
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-09 16:22:02
 */
import { Observable } from 'rxjs';

// angular框架类库
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '@api';
// 第三方库
import { Select, Store } from '@ngxs/store';
// 自定义库
import {
    ChangeStatus, ClearMessage, Message, MessageState, RefreshMessage, RemoveMessage
} from '@store';

@Component({
  selector: 'app-header-notify',
  templateUrl: './header-notify.component.html',
  styleUrls: ['./header-notify.component.less']
})
export class HeaderNotifyComponent implements OnInit {
  @Input() nxShowText = false;

  // Select 当前的侧边栏菜单信息
  @Select(MessageState.getMessages) messages$: Observable<Message[]>;
  @Select(MessageState.getUnreadMessages) unReadmessages$: Observable<Message[]>;

  isVisible = false;
  customerId = '';

  constructor(private store: Store, private router: Router, private cs: CustomerService, private eventBus: NgEventBus) {}

  ngOnInit() {}

  /**
   * @description: 跳转到问题详细页面
   */
  async goToLink(id: string, link: string, domain: string) {
    this.isVisible = false;
    this.changeStatus(id);
    if (domain) {
      await this.cs.getCustomerByID(domain, 'domain').then((data: any) => {
        if (data) {
          const url = `/customer/${data.customer_id}${link}`;
          this.router.navigate([url]);
        }
      });
      return;
    }
  }

  refershWindows(id: string) {
    this.isVisible = false;
    this.changeStatus(id);
    this.router.navigate(['home']).then(() => {
      location.reload();
    });
  }

  /**
   * @description: 删除一条消息
   */
  close(id: string) {
    this.store.dispatch(new RemoveMessage(id));
  }

  /**
   * @description: 标记为已读
   */
  changeStatus(id: string) {
    this.store.dispatch(new ChangeStatus(id));
  }

  /**
   * @description: 清空消息中心
   */
  clear() {
    this.store.dispatch(new ClearMessage(false));
  }

  /**
   * @description: 清空消息中心
   */
  more() {
    this.isVisible = false;
    this.router.navigate(['notice/list']);
    this.eventBus.cast('refresh:notice');
  }

  /**
   * @description: 刷新息中心
   */
  refersh() {
    this.store.dispatch(new RefreshMessage());
  }

  /**
   * @description: 显示模态窗口
   */
  showModal(): void {
    this.store.dispatch(new RefreshMessage());
    this.isVisible = true;
  }

  /**
   * @description: 取消
   */
  handleCancel(): void {
    this.isVisible = false;
  }
}
