/*
 * @Description: 文件管理控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-06-26 09:48:16
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-22 16:42:26
 */
import { NzBreakpointService } from 'ng-zorro-antd/core/services';

import { Component, OnInit } from '@angular/core';
import { FolderService } from '@api';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.less']
})
export class DocumentListComponent implements OnInit {
  cols = [
    {
      title: 'page.document.fileName',
      width: '200px'
    },
    {
      title: 'page.document.fileSize',
      width: '100px'
    },
    {
      title: 'page.document.fileType',
      width: '300px'
    },
    {
      title: 'page.document.action'
    }
  ];
  // 构造函数
  constructor(private folder: FolderService, private bs: NzBreakpointService) {
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

  position = 'left';

  // 数据定义
  folderTabs: any[] = [];

  /**
   * @description: 画面初始化处理
   */
  ngOnInit() {
    this.search();
  }

  async search() {
    await this.getFolders();
  }

  /**
   * @description: 调用服务获取文件夹
   */
  async getFolders() {
    await this.folder.getFolders().then((data: any[]) => {
      if (data) {
        this.folderTabs = data.filter(f => f.read === true);
      } else {
        this.folderTabs = [];
      }
    });
  }
}
