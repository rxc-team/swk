import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WorkflowFormComponent } from './workflow-form/workflow-form.component';
import { WorkflowListComponent } from './workflow-list/workflow-list.component';

// 用户路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: WorkflowListComponent,
        data: {
          title: 'route.workflowList',
          breadcrumb: 'route.workflowList'
        }
      },
      {
        path: 'add',
        component: WorkflowFormComponent,
        data: {
          title: 'route.workflowAdd',
          canBack: true,
          breadcrumb: 'route.workflowAdd'
        }
      },
      {
        path: ':wf_id/setting',
        component: WorkflowFormComponent,
        data: {
          title: 'route.workflowSetting',
          canBack: true,
          breadcrumb: 'route.workflowSetting'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule {}
