/*
 * @Description: 仪表盘路由
 * @Author: RXC 呉見華
 * @Date: 2019-08-26 15:21:27
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-01 13:56:41
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardFormComponent } from './dashboard-form/dashboard-form.component';
import { DashboardListComponent } from './dashboard-list/dashboard-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'add', // 添加
        component: DashboardFormComponent,
        data: {
          title: 'route.chartAdd',
          breadcrumb: 'route.chartAdd'
        }
      },
      {
        path: 'list', // 一览
        component: DashboardListComponent,
        data: {
          title: 'route.chartList',
          breadcrumb: 'route.chartList'
        }
      },
      {
        path: 'edit/:id', // 更新
        component: DashboardFormComponent,
        data: {
          title: 'route.chartEdit',
          canBack: true,
          breadcrumb: 'route.chartEdit'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
