/*
 * @Description: 页面路由管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-10 10:36:22
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-06-12 11:00:25
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, UpdateGuard } from '@core';
import { environment } from '@env/environment';

import { DefaultLayoutComponent } from '../layout/default/default-layout.component';
import { FullscreenComponent } from '../layout/fullscreen/fullscreen.component';
import { ForgetPasswordComponent } from './full/forget-password/forget-password.component';
import { LoginComponent } from './full/login/login.component';
import { MailActivateComponent } from './full/mail-activate/mail-activate.component';
import { PasswordResetComponent } from './full/password-reset/password-reset.component';
import { HomeResolverService } from './home/home-resolver.service';
import { HomeComponent } from './home/home.component';
import { ItSupportComponent } from './system/it-support/it-support.component';
import { PageNotFoundComponent } from './system/page-not-found/page-not-found.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [UpdateGuard, AuthGuard],
    canActivateChild: [UpdateGuard, AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        component: HomeComponent,
        resolve: {
          homeData: HomeResolverService
        },
        runGuardsAndResolvers: 'always',
        data: {
          title: 'route.home',
          breadcrumb: 'home'
        }
      },
      {
        path: 'lease',
        loadChildren: () => import('./lease/lease.module').then(m => m.LeaseModule)
      },
      {
        path: 'datastores',
        loadChildren: () => import('./database/database.module').then(m => m.DatabaseModule)
      },
      {
        path: 'help',
        loadChildren: () => import('./help/help.module').then(m => m.HelpModule)
      },
      {
        path: 'question',
        loadChildren: () => import('./question/question.module').then(m => m.QuestionModule)
      },
      {
        path: 'history',
        loadChildren: () => import('./database/database.module').then(m => m.DatabaseModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule)
      },
      {
        path: 'approve',
        loadChildren: () => import('./approve/approve.module').then(m => m.ApproveModule)
      },
      {
        path: 'report',
        loadChildren: () => import('./report/report.module').then(m => m.ReportModule)
      },
      {
        path: 'schedule',
        loadChildren: () => import('./schedule/schedule.module').then(m => m.ScheduleModule)
      },
      {
        path: 'notice',
        loadChildren: () => import('./notice/notice.module').then(m => m.NoticeModule)
      },
      {
        path: 'journal',
        loadChildren: () => import('./journal/journal.module').then(m => m.JournalModule)
      }
    ]
  },
  {
    path: '',
    component: FullscreenComponent,
    canActivate: [UpdateGuard],
    canActivateChild: [UpdateGuard],
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: {
          title: 'route.login'
        }
      },
      {
        path: 'forget_password',
        component: ForgetPasswordComponent,
        data: {
          title: 'route.login'
        }
      },
      {
        path: 'mail_activate/:loginId',
        component: MailActivateComponent,
        data: {
          title: 'route.login'
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
  },
  {
    path: 'it-support',
    component: ItSupportComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(ROUTES, {
      useHash: environment.useHash,
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'top',
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class PageRoutingModule {}
