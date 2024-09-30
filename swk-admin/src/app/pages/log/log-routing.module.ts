import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginListComponent } from './login-list/login-list.component';
import { OperateListComponent } from './operate-list/operate-list.component';

// 日志路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: LoginListComponent,
        data: {
          title: 'route.loginList',
          breadcrumb: 'route.loginList'
        }
      },
      {
        path: 'operate',
        component: OperateListComponent,
        data: {
          title: 'route.operateList',
          breadcrumb: 'route.operateList'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogRoutingModule {}
