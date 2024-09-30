/*
 * @Description: 文件管理控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-06-26 09:48:16
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-22 13:42:41
 */
import { NzBreakpointService } from 'ng-zorro-antd/core/services';

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.less']
})
export class DocumentListComponent implements OnInit {
  // 构造函数
  constructor(private bs: NzBreakpointService) {
    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'sm' || data === 'xs') {
        this.position = 'top';
      } else {
        this.position = 'left';
      }
    });
  }

  // 数据定义
  position = 'left';

  /**
   * @description: 画面初始化处理
   */
  ngOnInit() {}
}
