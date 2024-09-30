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
          title: 'route.loginLogger',
          breadcrumb: 'route.loginLogger'
        }
      },
      {
        path: 'operate',
        component: OperateListComponent,
        data: {
          title: 'route.actionLogger',
          breadcrumb: 'route.actionLogger'
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
