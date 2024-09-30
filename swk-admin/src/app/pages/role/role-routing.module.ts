/*
 * @Description: 角色路由module
 * @Author: RXC 廖欣星
 * @Date: 2019-04-24 13:27:30
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-01 13:55:38
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoleFormComponent } from './role-form/role-form.component';
import { RoleResolverService } from './role-form/role-resolver.service';
import { RoleListComponent } from './role-list/role-list.component';

// 角色路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: RoleListComponent,
        data: {
          title: 'route.roleList',
          breadcrumb: 'route.roleList'
        }
      },
      {
        path: 'add',
        component: RoleFormComponent,
        resolve: {
          roleData: RoleResolverService
        },
        data: {
          title: 'route.roleAdd',
          canBack: true,
          breadcrumb: 'route.roleAdd'
        }
      },
      {
        path: 'edit/:id',
        component: RoleFormComponent,
        resolve: {
          roleData: RoleResolverService
        },
        data: {
          title: 'route.roleEdit',
          canBack: true,
          breadcrumb: 'route.roleEdit'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRoutingModule {}
