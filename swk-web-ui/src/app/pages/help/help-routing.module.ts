import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HelpDetailComponent } from './help-detail/help-detail.component';
import { HelpHomeComponent } from './help-home/help-home.component';
import { HelpLayoutComponent } from './help-layout/help-layout.component';

// 帮助路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'type',
        component: HelpHomeComponent,
        data: {
          title: 'route.helpType',
          breadcrumb: 'route.helpType'
        }
      },
      {
        path: 'detail',
        component: HelpLayoutComponent,
        children: [
          {
            path: ':id',
            component: HelpDetailComponent,
            runGuardsAndResolvers: 'always',
            data: {
              title: 'route.helpDetail',
              canBack: true,
              breadcrumb: 'route.helpDetail'
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpRoutingModule {}
