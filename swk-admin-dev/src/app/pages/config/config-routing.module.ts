import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ActionFormComponent } from './action/action-form/action-form.component';
import { ActionListComponent } from './action/action-list/action-list.component';
import { AllowFormComponent } from './allow/allow-form/allow-form.component';
import { AllowListComponent } from './allow/allow-list/allow-list.component';
import { LevelFormComponent } from './level/level-form/level-form.component';
import { LevelListComponent } from './level/level-list/level-list.component';

const routes: Routes = [
  {
    path: 'action',
    children: [
      {
        path: 'list',
        component: ActionListComponent,
        data: {
          title: 'route.actionList',
          breadcrumb: 'route.actionList'
        }
      },
      {
        path: 'add',
        component: ActionFormComponent,
        data: {
          title: 'route.addAtion',
          breadcrumb: 'route.addAtion'
        }
      },
      {
        path: 'objs/:obj/actions/:key/setting',
        component: ActionFormComponent,
        data: {
          title: 'route.updateAction',
          canBack: true,
          breadcrumb: 'route.updateAction'
        }
      }
    ]
  },
  {
    path: 'allow',
    children: [
      {
        path: 'list',
        component: AllowListComponent,
        data: {
          title: 'route.allowList',
          breadcrumb: 'route.allowList'
        }
      },
      {
        path: 'add',
        component: AllowFormComponent,
        data: {
          title: 'route.addAllow',
          breadcrumb: 'route.addAllow'
        }
      },
      {
        path: ':a_id/setting',
        component: AllowFormComponent,
        data: {
          title: 'route.updateAllow',
          canBack: true,
          breadcrumb: 'route.updateAllow'
        }
      }
    ]
  },
  {
    path: 'level',
    children: [
      {
        path: 'list',
        component: LevelListComponent,
        data: {
          title: 'route.levelList',
          breadcrumb: 'route.levelList'
        }
      },
      {
        path: 'add',
        component: LevelFormComponent,
        data: {
          title: 'route.addLevel',
          breadcrumb: 'route.addLevel'
        }
      },
      {
        path: ':id/setting',
        component: LevelFormComponent,
        data: {
          title: 'route.updateLevel',
          canBack: true,
          breadcrumb: 'route.updateLevel'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule { }
