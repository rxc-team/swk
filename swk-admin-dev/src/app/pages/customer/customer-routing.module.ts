/*
 * @Description: 会社管理路由模块
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-01 13:15:41
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppFormComponent } from './app/app-form/app-form.component';
import { AppListComponent } from './app/app-list/app-list.component';
import { CanDeactivateGuard } from './customer-form/can-deactivate.guard';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { QuestionDetailResolverService } from './question/question-form/question-detail-resolver.service';
import { QuestionFormComponent } from './question/question-form/question-form.component';
import { QuestionListComponent } from './question/question-list/question-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: CustomerListComponent,
        data: {
          title: 'route.customerList',
          breadcrumb: 'route.customerList'
        }
      },
      {
        path: 'add',
        component: CustomerFormComponent,
        data: {
          title: 'route.addCustomer',
          breadcrumb: 'route.addCustomer'
        },
        canDeactivate: [CanDeactivateGuard]
      },
      {
        path: 'message',
        loadChildren: () => import('../message/message.module').then(m => m.MessageModule)
      },
      {
        path: ':id/info',
        component: CustomerInfoComponent,
        data: {
          title: 'route.customerInfo',
          canBack: true,
          breadcrumb: 'route.customerInfo'
        }
      },
      {
        path: 'question/list',
        component: QuestionListComponent,
        data: {
          title: 'route.qaList',
          breadcrumb: 'route.qaList'
        }
      },
      {
        path: ':id/question/edit/:question_id',
        resolve: {
          question: QuestionDetailResolverService
        },
        runGuardsAndResolvers: 'always',
        component: QuestionFormComponent,
        data: {
          title: 'route.qaInfo',
          canBack: true,
          breadcrumb: 'route.qaInfo'
        }
      },
      {
        path: ':id/setting',
        component: CustomerFormComponent,
        data: {
          title: 'route.updateCustomer',
          canBack: true,
          breadcrumb: 'route.updateCustomer'
        },
        canDeactivate: [CanDeactivateGuard]
      },
      {
        path: ':id/apps/list',
        component: AppListComponent,
        data: {
          title: 'route.appList',
          canBack: true,
          breadcrumb: 'route.appList'
        }
      },
      {
        path: ':id/apps/add',
        component: AppFormComponent,
        data: {
          title: 'route.addApp',
          canBack: true,
          breadcrumb: 'route.addApp'
        }
      },
      {
        path: ':id/apps/:a_id/setting',
        component: AppFormComponent,
        data: {
          title: 'route.updateApp',
          canBack: true,
          breadcrumb: 'route.updateApp'
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
