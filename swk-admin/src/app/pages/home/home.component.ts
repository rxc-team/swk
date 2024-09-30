/*
 * @Description: 主页控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-04-22 10:19:56
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-07-03 13:40:14
 */

import { format } from 'date-fns';
import * as _ from 'lodash';
import { NgEventBus } from 'ng-event-bus';
import { Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart } from '@antv/g2';
import { UserService } from '@api';
import { I18NService, TokenStorageService } from '@core';
import { Select, Store } from '@ngxs/store';
import { ChangeStatus, Message, MessageState } from '@store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  time = format(new Date(), 'HH:mm:ss');
  databaseNumber = 0;
  reportNumber = 0;
  optionNumber = 0;
  // 仪表盘数据
  dashboardDatas: Array<{
    chartName: string;
    options: any;
    ready: any;
    type: string;
    empty: boolean;
  }> = [];
  show = false;
  selectItem;

  userinfo: any = {};

  // Select 当前的侧边栏菜单信息
  @Select(MessageState.getMessages) messages$: Observable<Message[]>;
  @Select(MessageState.getUnreadMessages) unReadmessages$: Observable<Message[]>;

  constructor(
    private user: UserService,
    private tokenService: TokenStorageService,
    private store: Store,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private event: NgEventBus
  ) {
    this.event.on('refresh:app').subscribe(() => {
      this.refreshAll();
    });
    this.userinfo = this.tokenService.getUser();
    this.tokenService.getUserInfo().subscribe(data => {
      if (data) {
        this.userinfo = data;
      }
    });
  }

  ngOnInit() {
    this.init();
  }

  async init() {
    this.route.data.subscribe((data: any) => {
      this.databaseNumber = data.homeData.databaseNumber;
      this.reportNumber = data.homeData.reportNumber;
      this.optionNumber = data.homeData.optionNumber;

      this.dashboardDatas = data.homeData.dashboardDatas;
      if (this.dashboardDatas) {
        this.selectItem = this.dashboardDatas[0];
      }
    });
  }

  async getDashboardData() {
    this.dashboardDatas = [];
    this.user.getUsers().then((data: any[]) => {
      if (data) {
        data = _.sortBy(data, 'created_at');
        const dt = _.groupBy(data, function (b) {
          return b.created_at.slice(0, 7);
        });
        const dataItems = [];

        // tslint:disable-next-line: forin
        for (const key in dt) {
          const element = dt[key];
          dataItems.push({
            time: key,
            count: element.length
          });
        }

        const lineOptions = {
          autoFit: true,
          height: 300
        };

        const counts = dataItems.map(v => v.count);
        const max = Math.max(...counts);

        const lineReady = (chart: Chart) => {
          chart.data(dataItems);
          chart.scale({
            time: {
              type: 'timeCat',
              mask: 'YYYY-MM'
            },
            count: {
              alias: this.i18n.translateLang('page.home.user'),
              min: 0,
              max: max * 10,
              nice: true
            }
          });
          chart.tooltip({
            showCrosshairs: true, // 展示 Tooltip 辅助线
            shared: true
          });
          chart.line().position('time*count');
          chart.point().position('time*count');
          chart.render();
        };

        this.dashboardDatas.push({
          chartName: 'page.home.monthlyUsers',
          options: lineOptions,
          ready: lineReady,
          empty: dataItems ? false : true,
          type: 'line'
        });

        const bar = _.groupBy(data, function (b) {
          return b.created_at.slice(0, 7);
        });

        const barDataItems = [];

        // tslint:disable-next-line: forin
        for (const key in bar) {
          const element = bar[key];
          barDataItems.push({
            time: key,
            count: element.length
          });
        }

        const barOptions = {
          autoFit: true,
          height: 300
        };

        const barReady = (chart: Chart) => {
          chart.data(barDataItems);
          chart.scale({
            time: {
              type: 'timeCat',
              mask: 'YYYY'
            },
            count: {
              alias: this.i18n.translateLang('page.home.user'),
              min: 0,
              max: max * 10,
              nice: true
            }
          });
          chart.interaction('active-region');
          chart.interval().position('time*count').color('time');
          chart.render();
        };

        this.dashboardDatas.push({
          chartName: 'page.home.yearUsers',
          options: barOptions,
          ready: barReady,
          empty: barDataItems ? false : true,
          type: 'bar'
        });
      }
    });
  }

  /**
   * @description: 通知已读
   */
  changeStatus(id: string) {
    this.store.dispatch(new ChangeStatus(id));
  }

  /**
   * @description: 刷新当前页面
   */
  async refreshAll() {
    await this.init();
    await this.getDashboardData();
  }
}
