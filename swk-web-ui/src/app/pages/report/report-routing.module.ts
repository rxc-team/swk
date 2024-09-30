/*
 * @Description: 报表路由
 * @Author: RXC 廖云江
 * @Date: 2019-08-26 15:21:32
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-01 13:40:03
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListResolverService } from './report-list/list-resolver.service';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportResolverService } from './report-resolver.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':r_id/list', // report/:r_id
        component: ReportListComponent,
        resolve: {
          breadcrumb: ReportResolverService,
          listData: ListResolverService
        },
        runGuardsAndResolvers: 'always',
        data: {
          title: 'route.databaseListTitle',
          reuse: true,
          breadcrumb: 'route.databaseListTitle'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule {}
