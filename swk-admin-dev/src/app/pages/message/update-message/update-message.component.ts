import { format, formatDistance } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, timer } from 'rxjs';
import { take } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-update-message',
  templateUrl: './update-message.component.html',
  styleUrls: ['./update-message.component.less']
})
export class UpdateMessageComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private message: NzMessageService,
    private messageSevice: MessageService
  ) {
    this.messageForm = this.fb.group({
      content: [null, [Validators.required]],
      endTime: [null, [Validators.required]]
    });
  }
  // 表单
  messageForm: FormGroup;
  // 选中顾客domain
  domain = '';
  // 发送消息给指定顾客/所有顾客
  sendType = 'all';

  // 消息内容
  psValue = '';
  // 消息记录
  messageRecords: any[] = [];
  // 结束时间
  endTime: Date = null;
  // 当前所在页数
  pageIndex = 1;
  // 显示加载更多
  loadingMore = false;
  // 页数size
  pageSize = 10;

  async ngOnInit(): Promise<void> {
    this.setMessageRecodes(1);
  }
  /**
   * @description: 发送
   */
  handleSubmit(): void {
    const params = {
      sender: 'SYSTEM',
      content: this.messageForm.controls.content.value,
      domain: this.domain,
      msg_type: 'update',
      status: 'read',
      end_time: format(this.messageForm.controls.endTime.value, 'yyyy-MM-dd HH:mm:ss')
    };

    // 接收者domain
    this.messageSevice.addMessage(params, this.sendType).then(async () => {
      this.messageForm.get('content').setValue('');
      this.messageForm.get('endTime').setValue('');
      this.messageRecords = [];
      this.setMessageRecodes(1);
      //this.message.success(this.i18n.translateLang('common.message.success.S_010'));
      this.message.info(this.i18n.translateLang('common.message.info.I_022'));
    });
  }
  // 监听滚动事件
  scroll(e) {
    const target = e.target;
    let scrollTop = target.scrollTop;
    let scrollHeight = target.scrollHeight;
    if (scrollTop + 300 >= scrollHeight) {
      this.onLoadMore();
    }
  }
  // 获取通知记录
  setMessageRecodes(pageIndex: number) {
    const param = {
      domain: this.domain,
      skip: pageIndex,
      limit: this.pageSize,
      msgType: 'update'
    };
    this.messageSevice.getMessages(param).then(res => {
      if (res) {
        if (res.length === param.limit) {
          this.loadingMore = true;
        }
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
      } else {
        this.loadingMore = false;
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
  onLoadMore() {
    this.pageIndex += 1;
    this.setMessageRecodes(this.pageIndex);
  }
}
