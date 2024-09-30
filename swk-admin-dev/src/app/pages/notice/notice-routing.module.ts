import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NoticeListComponent } from './notice-list/notice-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: NoticeListComponent,
        data: {
          title: 'route.notice',
          breadcrumb: 'route.notice'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NoticeRoutingModule {}
