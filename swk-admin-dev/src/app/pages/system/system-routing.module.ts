import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuckupInfoComponent } from './buckup-info/buckup-info.component';
import { JobListComponent } from './job-list/job-list.component';
import { ReleaseComponent } from './release/release.component';
import { TplFormComponent } from './template/tpl-form/tpl-form.component';
import { TplInfoComponent } from './template/tpl-info/tpl-info.component';
import { TplListComponent } from './template/tpl-list/tpl-list.component';
import { UpdateListComponent } from './update-list/update-list.component';

const routes: Routes = [
  {
    path: 'job',
    children: [
      {
        path: 'list',
        component: JobListComponent,
        data: {
          title: 'route.jobLog',
          breadcrumb: 'route.jobLog'
        }
      }
    ]
  },
  {
    path: 'release',
    component: ReleaseComponent,
    data: {
      title: 'route.releaseSetting',
      breadcrumb: 'route.releaseSetting'
    }
  },
  {
    path: 'update',
    children: [
      {
        path: 'list',
        component: UpdateListComponent,
        data: {
          title: 'route.updateList',
          breadcrumb: 'route.updateList'
        }
      }
    ]
  },
  {
    path: 'backup',
    children: [
      {
        path: 'info',
        component: BuckupInfoComponent,
        data: {
          title: 'route.backupInfo',
          breadcrumb: 'route.backupInfo'
        }
      }
    ]
  },
  {
    path: 'template',
    children: [
      {
        path: 'list',
        component: TplListComponent,
        data: {
          title: 'route.templateList',
          reuse: true,
          breadcrumb: 'route.templateList'
        }
      },
      {
        path: 'add',
        component: TplFormComponent,
        data: {
          title: 'route.addTemplate',
          breadcrumb: 'route.addTemplate'
        }
      },
      {
        path: ':id/info',
        component: TplInfoComponent,
        data: {
          title: 'route.templateInfo',
          canBack: true,
          breadcrumb: 'route.templateInfo'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemRoutingModule {}
