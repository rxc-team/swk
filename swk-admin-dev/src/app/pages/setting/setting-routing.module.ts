/*
 * @Description: 設定画面ルーティングモジュール
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-11-24 11:24:44
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseSettingComponent } from './base-setting/base-setting.component';
import { CanDeactivateUserGuard } from './base-setting/can-deactivate-user.guard';
import { MailSettingComponent } from './mail-setting/mail-setting.component';
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
          title: 'route.userCenter',
          breadcrumb: 'route.userCenter'
        },
        canDeactivate: [CanDeactivateUserGuard]
      },
      {
        path: 'safe',
        component: SafeSettingComponent,
        data: {
          title: 'route.userCenter',
          breadcrumb: 'route.userCenter'
        }
      },
      {
        path: 'mail',
        component: MailSettingComponent,
        data: {
          title: 'route.userCenter',
          breadcrumb: 'route.userCenter'
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
