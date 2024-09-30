/*
 * @Description: 首页控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-05-17 13:11:12
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-15 09:15:40
 */
import { format } from 'date-fns';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardService, ReportService } from '@api';
import { TokenStorageService } from '@core';
import { Select, Store } from '@ngxs/store';
import { ChangeStatus, Message, MessageState } from '@store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('chartScreen') chartScreen: ElementRef;

  // 仪表盘设置
  dashboards: any[] = [];
  // 当前时间
  time = format(new Date(), 'HH:mm:ss');
  // 当前时间
  dashUpdateTime = format(new Date(), 'HH:mm:ss');
  // 台账个数
  databaseNumber = 0;
  // 报表个数
  reportNumber = 0;
  // 文档个数
  documentNumber = 0;

  user: any = {};

  // Select 当前的侧边栏菜单信息
  @Select(MessageState.getMessages) messages$: Observable<Message[]>;
  @Select(MessageState.getUnreadMessages) unReadmessages$: Observable<Message[]>;

  constructor(
    private dashboard: DashboardService,
    private route: ActivatedRoute,
    private store: Store,
    private report: ReportService,
    private tokenService: TokenStorageService
  ) {
    this.user = this.tokenService.getUser();
  }

  /**
   * @description: 画面初始化
   */
  ngOnInit(): void {
    this.init();
  }

  async init() {
    /*  this.route.data.subscribe((data: any) => {
       this.databaseNumber = data.homeData.databaseNumber;
       this.reportNumber = data.homeData.reportNumber;
       this.documentNumber = data.homeData.documentNumber; 
       this.dashboards = data.homeData.dashboards;
     }); */
  }

  ngOnDestroy() { }

  /**
   * @description: 通知已读
   */
  changeStatus(id: string) {
    this.store.dispatch(new ChangeStatus(id));
  }

  /**
   * 刷新数据
   */
  async genReportData(reportId: string) {
    await this.report.genReportData(reportId).then(() => {
      this.dashUpdateTime = format(new Date(), 'HH:mm:ss');
    });
  }

  /**
   * @description: 获取仪表盘数据
   */
  async getDashboards() {
    this.dashboards = [];
    await this.dashboard.getDashboards().then((data: any[]) => {
      if (data) {
        this.dashboards = _.sortBy(data, 'created_at');
      } else {
        this.dashboards = [];
      }
    });
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    /* await this.init(); */
    await this.getDashboards();
  }
}
