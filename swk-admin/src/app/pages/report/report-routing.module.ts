/*
 * @Description: report_route
 * @Author: RXC 廖云江
 * @Date: 2019-08-26 09:04:20
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-01 13:56:54
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportFormComponent } from './report-form/report-form.component';
import { ReportListComponent } from './report-list/report-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'add', // 添加
        component: ReportFormComponent,
        data: {
          title: 'route.reportAdd',
          breadcrumb: 'route.reportAdd'
        }
      },
      {
        path: 'list', // 一览
        component: ReportListComponent,
        data: {
          title: 'route.reportList',
          breadcrumb: 'route.reportList'
        }
      },
      {
        path: 'edit/:id', // 更新
        component: ReportFormComponent,
        data: {
          title: 'route.reportEdit',
          canBack: true,
          breadcrumb: 'route.reportEdit'
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
