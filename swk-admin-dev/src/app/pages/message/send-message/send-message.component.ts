import { formatDistance } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustomerService, MessageService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.less']
})
export class SendMessageComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private message: NzMessageService,
    private messageSevice: MessageService,
    private customerService: CustomerService
  ) {
    this.form = this.fb.group({
      content: ['', [Validators.required]]
    });
  }
  // 表单
  form: FormGroup;
  // 顾客列表
  customerList = [];
  // 选中顾客domain
  domain = '';
  // 发送消息给指定顾客/所有顾客
  sendType = 'all';
  // 消息记录
  messageRecords: any[] = [];
  // 显示加载更多
  loadingMore = true;
  // 页码初始值
  pageIndex = 1;
  // 页码初始值
  pageSize = 10;

  async ngOnInit(): Promise<void> {
    // 获取所有顾客
    await this.customerService.getCustomers().then(res => {
      if (res) {
        this.customerList = res;
        this.customerChange();
      }
    });
  }

  scroll(e) {
    const target = e.target;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    if (scrollTop + 300 >= scrollHeight) {
      this.onLoadMore();
    }
  }

  /**
   * @description: 发送
   */
  handleSubmit(): void {
    const params = {
      sender: 'SYSTEM',
      content: this.form.get('content').value,
      domain: this.domain,
      msg_type: 'system',
      status: 'read'
    };
    if (this.domain) {
      this.sendType = 'select';
    } else {
      this.sendType = 'all';
    }

    // 接收者domain
    this.messageSevice.addMessage(params, this.sendType).then(async () => {
      this.form.get('content').setValue('');
      this.customerChange();
      //this.message.success(this.i18n.translateLang('common.message.success.S_010'));
      this.message.info(this.i18n.translateLang('common.message.info.I_022'));
    });
  }

  // 顾客变更通知记录
  async customerChange() {
    this.messageRecords = [];
    const param = {
      domain: this.domain || '',
      skip: 1,
      limit: this.pageSize,
      msgType: 'system'
    };

    await this.getMsgList(param);

    // 比较追加后的size和之前的size，如果相等，即没有更多数据
    if (this.messageRecords.length <= this.pageSize) {
      this.loadingMore = false;
    }
  }

  // 获取通知记录
  async getMsgList(param: any) {
    await this.messageSevice.getMessages(param).then(res => {
      if (res) {
        res.forEach((message: any) => {
          this.messageRecords = [
            ...this.messageRecords,
            {
              message_id: message.message_id,
              sender: message.sender,
              content: message.content,
              send_time: new Date(message.send_time),
              displayTime: formatDistance(new Date(), new Date(), {
                includeSeconds: true,
                addSuffix: true,
                locale: enUS
              })
            }
          ].map(e => {
            return {
              ...e,
              displayTime: formatDistance(e.send_time, new Date(), {
                includeSeconds: true,
                addSuffix: true,
                locale: enUS
              })
            };
          });
        });
      }
    });
  }

  /**
   * @description: 删除一条消息
   */
  close(id: string) {
    // 这条通知记录从数据库中移除
    this.messageSevice.deleteMessageById(id);
    // 这条通知从画面移除
    if (this.messageRecords.length) {
      this.messageRecords = this.messageRecords.filter(m => m.message_id !== id);
    }
  }
  /**
   * @description: 加载更多消息
   */
  async onLoadMore() {
    this.pageIndex += 1;

    const param = {
      domain: this.domain,
      skip: this.pageIndex,
      limit: this.pageSize,
      msgType: 'system'
    };

    // 获取当前的消息szie
    const current = this.messageRecords.length;

    await this.getMsgList(param);

    // 比较追加后的size和之前的size，如果相等，即没有更多数据
    if (this.messageRecords.length === current) {
      this.pageIndex--;
      this.loadingMore = false;
    }
  }
}
