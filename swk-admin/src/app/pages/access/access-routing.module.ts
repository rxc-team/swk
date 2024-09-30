import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccessFormComponent } from './access-form/access-form.component';
import { AccessListComponent } from './access-list/access-list.component';

// 路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: AccessListComponent,
        data: {
          title: 'route.dataList',
          breadcrumb: 'route.dataList'
        }
      },
      {
        path: 'add',
        component: AccessFormComponent,
        data: {
          title: 'route.dataAdd',
          canBack: true,
          breadcrumb: 'route.dataAdd'
        }
      },
      {
        path: 'edit/:id',
        component: AccessFormComponent,
        data: {
          title: 'route.dataEdit',
          canBack: true,
          breadcrumb: 'route.dataEdit'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessRoutingModule {}
