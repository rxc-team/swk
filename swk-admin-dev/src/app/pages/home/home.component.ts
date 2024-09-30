/*
 * @Description: ホームページ画面コントローラー
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-09-14 17:15:23
 */
import { format } from 'date-fns';
import * as _ from 'lodash';
import { forkJoin, Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { Chart } from '@antv/g2';
import { AppService, BackupService, CustomerService } from '@api';
import { I18NService } from '@core';
import { Select, Store } from '@ngxs/store';
import { ChangeStatus, Message, MessageState } from '@store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  time = '';
  customerNumber = 0;
  appNumber = 0;
  templateNumber = 0;
  dashboardDatas = [];

  // Select 当前的侧边栏菜单信息
  @Select(MessageState.getMessages) messages$: Observable<Message[]>;
  @Select(MessageState.getUnreadMessages) unReadmessages$: Observable<Message[]>;

  constructor(
    private customer: CustomerService,
    private bs: BackupService,
    private i18n: I18NService,
    private app: AppService,
    private store: Store
  ) {}

  /**
   * @description: 画面初期化
   */
  ngOnInit() {
    this.init();
  }

  async init() {
    this.dashboardDatas = [];
    this.time = format(new Date(), 'HH:mm:ss');

    const jobs = [this.customer.getCustomers(), this.app.getApps(), this.bs.getBackups()];

    forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const customerData = data[0];
          const appData = data[1];
          const backupData = data[2];
          if (customerData) {
            this.customerNumber = customerData.length;
            const cd = _.sortBy(customerData, 'created_at');
            const dt = _.groupBy(cd, function (b) {
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

            const lineReady = (chart: Chart) => {
              chart.data(dataItems);
              chart.scale('time', {
                alias: 'time',
                type: 'timeCat',
                mask: 'YYYY-MM',
                nice: true
              });
              chart.scale('count', {
                alias: 'Company',
                tickMethod: 'r-pretty',
                min: 0 // Y轴显示的最小值
              });
              chart.tooltip({
                showCrosshairs: true
              });

              chart.line().position('time*count');
              chart.render();
            };

            this.dashboardDatas.push({
              chartName: 'page.home.customer',
              options: lineOptions,
              ready: lineReady,
              empty: dataItems ? false : true,
              type: 'line'
            });
          } else {
            this.customerNumber = 0;
          }

          if (appData) {
            this.appNumber = appData.length;

            const ad = _.sortBy(appData, 'created_at');
            const dt = _.groupBy(ad, function (b) {
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

            const barOptions = {
              autoFit: true,
              height: 300
            };

            const barReady = (chart: Chart) => {
              chart.data(dataItems);
              chart.scale('time', {
                alias: 'time',
                type: 'timeCat',
                mask: 'YYYY-MM',
                nice: true
              });
              chart.scale('count', {
                alias: 'app',
                tickMethod: 'r-pretty',
                nice: true
              });
              chart.tooltip({
                showCrosshairs: true
              });
              chart.interval().position('time*count').color('time');
              chart.render();
            };
            this.dashboardDatas.push({
              chartName: 'page.home.application',
              options: barOptions,
              ready: barReady,
              empty: dataItems ? false : true,
              type: 'bar'
            });
          } else {
            this.appNumber = 0;
          }

          if (backupData) {
            this.templateNumber = backupData.length;
          } else {
            this.templateNumber = 0;
          }
        }
      });
  }
  /**
   * @description: 通知已读
   */
  changeStatus(id: string) {
    this.store.dispatch(new ChangeStatus(id));
  }
}
