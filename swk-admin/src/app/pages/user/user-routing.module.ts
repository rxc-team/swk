/*
 * @Description: 用户路由module
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 09:49:00
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-01 13:55:54
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateUserinfoGuard } from './user-form/can-deactivate-userinfo.guard';

import { UserFormComponent } from './user-form/user-form.component';
import { UserListComponent } from './user-list/user-list.component';

// 用户路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: UserListComponent,
        data: {
          title: 'route.userList',
          breadcrumb: 'route.userList'
        }
      },
      {
        path: 'add',
        component: UserFormComponent,
        data: {
          title: 'route.userAdd',
          canBack: true,
          breadcrumb: 'route.userAdd'
        }
      },
      {
        path: 'edit/:id',
        component: UserFormComponent,
        data: {
          title: 'route.userEdit',
          canBack: true,
          breadcrumb: 'route.userEdit'
        },
        canDeactivate: [CanDeactivateUserinfoGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
