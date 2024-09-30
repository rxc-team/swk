/*
 * @Description: 設定画面ルーティングモジュール
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-05-20 14:18:46
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseSettingComponent } from './base-setting/base-setting.component';
import { CanDeactivateUserinfoGuard } from './base-setting/can-deactivate-userinfo.guard';
import { SafeSettingComponent } from './safe-setting/safe-setting.component';

import { SettingComponent } from './setting.component';

const routes: Routes = [
  {
    path: '',
    component: SettingComponent,
    children: [
      { path: '', redirectTo: 'base', pathMatch: 'full' },
      {
        path: 'base',
        component: BaseSettingComponent,
        data: {
          title: 'route.baseSetting',
          breadcrumb: 'route.baseSetting'
        },
        canDeactivate: [CanDeactivateUserinfoGuard]
      },
      {
        path: 'safe',
        component: SafeSettingComponent,
        data: {
          title: 'route.safeSetting',
          breadcrumb: 'route.safeSetting'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule {}
