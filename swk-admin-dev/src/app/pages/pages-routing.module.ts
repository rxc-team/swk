/*
 * @Description: ページルーティングモジュール
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-06-29 10:51:25
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core';
import { environment } from '@env/environment';

import { DefaultLayoutComponent } from '../layout/default/default-layout.component';
import { FullscreenComponent } from '../layout/fullscreen/fullscreen.component';
import { LoginComponent } from './full/login/login.component';
import { MailActivateComponent } from './full/mail-activate/mail-activate.component';
import { PasswordResetComponent } from './full/password-reset/password-reset.component';
import { HomeComponent } from './home/home.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        component: HomeComponent,
        data: {
          title: 'route.home',
          breadcrumb: 'home'
        }
      },
      {
        path: 'document',
        loadChildren: () => import('./document/document.module').then(m => m.DocumentModule)
      },
      {
        path: 'help',
        loadChildren: () => import('./help/help.module').then(m => m.HelpModule)
      },
      {
        path: 'access',
        loadChildren: () => import('./access/access.module').then(m => m.AccessModule)
      },
      {
        path: 'log',
        loadChildren: () => import('./log/log.module').then(m => m.LogModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule)
      },
      {
        path: 'customer',
        loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule)
      },
      {
        path: 'notice',
        loadChildren: () => import('./notice/notice.module').then(m => m.NoticeModule)
      },
      {
        path: 'config',
        loadChildren: () => import('./config/config.module').then(m => m.ConfigModule)
      },
      {
        path: 'system',
        loadChildren: () => import('./system/system.module').then(m => m.SystemModule)
      }
    ]
  },
  {
    path: '',
    component: FullscreenComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: {
          title: 'route.login'
        }
      },
      {
        path: 'mail_activate/:loginId',
        component: MailActivateComponent,
        data: {
          title: 'route.activeMail'
        }
      },
      {
        path: 'password_reset/:token',
        component: PasswordResetComponent,
        data: {
          title: 'route.passwordReset'
        }
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(ROUTES, {
      useHash: environment.useHash,
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class PageRoutingModule {}
