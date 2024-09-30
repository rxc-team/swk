import * as _ from 'lodash';
import { forkJoin } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Chart } from '@antv/g2';
import {
    DashboardService, DatastoreService, OptionService, ReportService, UserService
} from '@api';
import { CommonService, I18NService } from '@core';

@Injectable({
  providedIn: 'root'
})
export class HomeResolverService implements Resolve<any> {
  constructor(
    private dashboard: DashboardService,
    private datastore: DatastoreService,
    private report: ReportService,
    private common: CommonService,
    private option: OptionService,
    private user: UserService,
    private i18n: I18NService
  ) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let databaseNumber = 0;
    let reportNumber = 0;
    let optionNumber = 0;
    const dashboardDatas = [];

    const jobs = [this.datastore.getDatastores(), this.report.getReports(), this.option.getOptions(), this.user.getUsers()];

    await forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const datastore = data[0];
          const report = data[1];
          const option = data[2];
          let allUser = data[3];

          if (datastore) {
            databaseNumber = datastore.length;
          } else {
            databaseNumber = 0;
          }

          if (report) {
            reportNumber = report.length;
          } else {
            reportNumber = 0;
          }

          if (option) {
            optionNumber = option.length;
          } else {
            optionNumber = 0;
          }

          if (allUser) {
            allUser = _.sortBy(allUser, 'created_at');
            const dt = _.groupBy(allUser, function (b) {
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

            dashboardDatas.push({
              chartName: 'page.home.monthlyUsers',
              options: lineOptions,
              ready: lineReady,
              empty: dataItems ? false : true,
              type: 'line'
            });

            const bar = _.groupBy(allUser, function (b) {
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

            dashboardDatas.push({
              chartName: 'page.home.yearUsers',
              options: barOptions,
              ready: barReady,
              empty: barDataItems ? false : true,
              type: 'bar'
            });
          }
        }
      });

    return { databaseNumber, reportNumber, optionNumber, dashboardDatas };
  }
}
