import { forkJoin, Observable } from 'rxjs';

import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { DashboardService, DatastoreService, FolderService, ReportService } from '@api';
import { Select } from '@ngxs/store';
import { SearchConditionState } from '@store';

@Injectable({
  providedIn: 'root'
})
export class HomeResolverService implements Resolve<any> {
  // Select 检索条件
  @Select(SearchConditionState.getSearchCondition) searchCondition$: Observable<any>;

  constructor(
    private dashboard: DashboardService,
    private datastore: DatastoreService,
    private report: ReportService,
    private folder: FolderService,
    private injector: Injector
  ) { }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let databaseNumber = 0;
    let reportNumber = 0;
    let documentNumber = 0;
    let dashboards = [];

    //const jobs = [this.datastore.getDatastores(), this.report.getReports(), this.folder.getFolders(), this.dashboard.getDashboards()];
    /* const jobs = [this.dashboard.getDashboards()]; */
    /* await forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const dsData = data[0];
          const rpData = data[1];
          const dcData = data[2];
          const dashData = data[3];

          if (dsData) {
            databaseNumber = dsData.length;
          } else {
            databaseNumber = 0;
          }
          if (rpData) {
            reportNumber = rpData.length;
          } else {
            reportNumber = 0;
          }
          if (dcData) {
            documentNumber = dcData.length;
          } else {
            documentNumber = 0;
          }
          if (dashData) {
            dashboards = dashData;
          } else {
            dashboards = [];
          }
        }
      });  */

    /* await forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const dashData = data[0];
          if (dashData) {
            dashboards = dashData;
          } else {
            dashboards = [];
          }
        }
      }); */
    //return { databaseNumber, reportNumber, documentNumber, dashboards };
    /* return { dashboards }; */
  }
}
