/*
 * @Description: 页面路由module
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 16:16:30
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-08-04 17:47:55
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

// 左侧菜单栏，登录的路由
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
      // {
      //   path: 'backup',
      //   loadChildren: () => import('./backup/backup.module').then(m => m.BackupModule)
      // },
      {
        path: 'generate',
        loadChildren: () => import('./generate/generate.module').then(m => m.GenerateModule)
      },
      {
        path: 'customer',
        loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule)
      },
      {
        path: 'schedule',
        loadChildren: () => import('./schedule/schedule.module').then(m => m.ScheduleModule)
      },
      {
        path: 'user',
        loadChildren: () => import('./user/user.module').then(m => m.UserModule)
      },
      {
        path: 'help',
        loadChildren: () => import('./help/help.module').then(m => m.HelpModule)
      },
      {
        path: 'log',
        loadChildren: () => import('./log/log.module').then(m => m.LogModule)
      },
      {
        path: 'question',
        loadChildren: () => import('./question/question.module').then(m => m.QuestionModule)
      },
      {
        path: 'option',
        loadChildren: () => import('./option/option.module').then(m => m.OptionModule)
      },
      {
        path: 'language',
        loadChildren: () => import('./language/language.module').then(m => m.LanguageModule)
      },
      {
        path: 'role',
        loadChildren: () => import('./role/role.module').then(m => m.RoleModule)
      },
      {
        path: 'group',
        loadChildren: () => import('./group/group.module').then(m => m.GroupModule)
      },
      {
        path: 'datastores',
        loadChildren: () => import('./datastore/datastore.module').then(m => m.DatastoreModule)
      },
      {
        path: 'document',
        loadChildren: () => import('./document/document.module').then(m => m.DocumentModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule)
      },
      {
        path: 'report',
        loadChildren: () => import('./report/report.module').then(m => m.ReportModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'workflow',
        loadChildren: () => import('./workflow/workflow.module').then(m => m.WorkflowModule)
      },
      {
        path: 'notice',
        loadChildren: () => import('./notice/notice.module').then(m => m.NoticeModule)
      },
      {
        path: 'access',
        loadChildren: () => import('./access/access.module').then(m => m.AccessModule)
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
          title: 'route.forgetpassword'
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
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class PageRoutingModule {}
