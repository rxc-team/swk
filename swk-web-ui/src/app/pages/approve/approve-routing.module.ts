import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ApproveInfoComponent } from './approve-info/approve-info.component';
import { ApproveListComponent } from './approve-list/approve-list.component';
import { ApproveResolverService } from './approve-list/approve-resolver.service';

// 用户路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':wf_id/list',
        component: ApproveListComponent,
        resolve: {
          listData: ApproveResolverService
        },
        runGuardsAndResolvers: 'always',
        data: {
          title: 'route.approveListTitle',
          reuse: true,
          breadcrumb: 'route.approveListTitle'
        }
      },
      {
        path: ':ex_id/info',
        component: ApproveInfoComponent,
        data: {
          title: 'route.approveInfoListTitle',
          canBack: true,
          breadcrumb: 'route.approveInfoListTitle'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApproveRoutingModule {}
