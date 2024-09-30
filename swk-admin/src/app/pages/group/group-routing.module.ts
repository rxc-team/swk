/*
 * @Description: 组路由管理器
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 16:16:02
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-09-03 16:31:00
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GroupTreeComponent } from './group-tree/group-tree.component';

// 路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: GroupTreeComponent,
        data: {
          title: 'route.groupmanage',
          breadcrumb: 'route.groupmanage'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupRoutingModule {}
