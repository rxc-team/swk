import { NgEventBus } from 'ng-event-bus';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService, MessageService } from '@api';
import { TokenStorageService } from '@core';
import { Select, Store } from '@ngxs/store';
import { ClearMessage } from '@store';

@Component({
  selector: 'app-notice-list',
  templateUrl: './notice-list.component.html',
  styleUrls: ['./notice-list.component.less']
})
export class NoticeListComponent implements OnInit {
  cols = [
    {
      title: 'page.notice.sender',
      width: '200px'
    },
    {
      title: 'page.notice.content',
      width: '100px'
    },
    {
      title: 'page.notice.status',
      width: '180px'
    },
    {
      title: 'page.notice.type',
      width: '100px'
    },
    {
      title: 'page.notice.object',
      width: '100px'
    },
    {
      title: 'page.notice.link',
      width: '180px'
    },
    {
      title: 'page.notice.sendTime'
    }
  ];

  seachForm: FormGroup;
  listOfDataDisplay = [];
  selectData = [];
  selectAll = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private messageService: MessageService,
    private cs: CustomerService,
    private tokenService: TokenStorageService,
    private router: Router,
    private event: NgEventBus
  ) {
    this.seachForm = fb.group({
      status: ['', []]
    });
    this.event.on('refresh:notice').subscribe(() => {
      this.search();
    });
  }

  ngOnInit(): void {
    this.search();
  }

  async search(): Promise<void> {
    // 获取当前用户的ID
    const userid = this.tokenService.getUserId();
    // 从数据库获取该用户所有通知
    const param = {
      recipient: userid,
      status: this.seachForm.get('status').value
    };
    await this.messageService.getMessages(param).then((data: any[]) => {
      if (data) {
        this.listOfDataDisplay = data;
      } else {
        this.listOfDataDisplay = [];
      }
    });
  }

  /**
   * @description: 跳转到问题详细页面
   */
  async goToLink(link: string, domain: string) {
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

  /**
   * @description: 清空消息中心
   */
  clear() {
    this.store.dispatch(new ClearMessage(false)).subscribe(() => {
      this.search();
    });
  }

  /**
   * @description: 刷新息中心
   */
  refresh() {
    this.search();
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
    this.listOfDataDisplay.forEach(f => (f.checked = event));
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
    if (this.selectData.length === this.listOfDataDisplay.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
