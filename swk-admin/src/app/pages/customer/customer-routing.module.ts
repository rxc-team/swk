import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppCopyComponent } from './app-copy/app-copy.component';
import { AppListComponent } from './app-list/app-list.component';
import { CanDeactivateGuard } from './setting/can-deactivate.guard';
import { SettingComponent } from './setting/setting.component';

// 用户路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'setting',
        component: SettingComponent,
        data: {
          title: 'route.setting',
          breadcrumb: 'route.setting'
        },
        canDeactivate: [CanDeactivateGuard]
      },
      {
        path: 'app/setting',
        component: AppListComponent,
        data: {
          title: 'route.appSetting',
          canBack: true,
          breadcrumb: 'route.appSetting'
        }
      },
      {
        path: 'setting/copy',
        component: AppCopyComponent,
        data: {
          title: 'route.appAdd',
          canBack: true,
          breadcrumb: 'route.appAdd'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule {}
