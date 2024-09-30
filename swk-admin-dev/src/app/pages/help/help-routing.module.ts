import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateGuard } from '../customer/customer-form/can-deactivate.guard';
import { HelpFormGuardGuard } from './help-form/help-form-guard.guard';

import { HelpFormComponent } from './help-form/help-form.component';
import { HelpListComponent } from './help-list/help-list.component';
import { HelpTypeFormComponent } from './help-type-form/help-type-form.component';
import { HelpTypeGuardGuard } from './help-type-form/help-type-guard.guard';
import { HelpTypeListComponent } from './help-type-list/help-type-list.component';

// 帮助路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'typeList',
        component: HelpTypeListComponent,
        data: {
          title: 'route.categoryList',
          breadcrumb: 'route.categoryList'
        }
      },
      {
        path: 'list',
        component: HelpListComponent,
        data: {
          title: 'route.documentList',
          breadcrumb: 'route.documentList'
        }
      },
      {
        path: 'update/:id',
        component: HelpFormComponent,
        data: {
          title: 'route.updateDocument',
          breadcrumb: 'route.updateDocument'
        },
        canDeactivate: [HelpFormGuardGuard]
      },
      {
        path: 'add',
        component: HelpFormComponent,
        data: {
          title: 'route.addDocument',
          breadcrumb: 'route.addDocument'
        },
        canDeactivate: [HelpFormGuardGuard]
      },
      {
        path: 'updateType/:id',
        component: HelpTypeFormComponent,
        data: {
          title: 'route.updateCategory',
          breadcrumb: 'route.updateCategory'
        },
        canDeactivate: [HelpTypeGuardGuard]
      },
      {
        path: 'addType',
        component: HelpTypeFormComponent,
        data: {
          title: 'route.addCategory',
          breadcrumb: 'route.addCategory'
        },
        canDeactivate: [HelpTypeGuardGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpRoutingModule {}
