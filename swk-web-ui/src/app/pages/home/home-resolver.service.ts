import { forkJoin, Observable } from 'rxjs';

import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { DashboardService, DatastoreService, ReportService } from '@api';
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
    private injector: Injector
  ) { }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let databaseNumber = 0;
    let reportNumber = 0;
    let documentNumber = 0;
    let dashboards = [];
  }
}
