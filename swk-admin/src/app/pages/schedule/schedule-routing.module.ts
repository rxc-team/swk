import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { JobListComponent } from './job-list/job-list.component';
import { ScheduleFormComponent } from './schedule-form/schedule-form.component';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';

const routes: Routes = [
  // {
  //   path: '',
  //   children: [
  //     {
  //       path: 'list',
  //       component: ScheduleListComponent,
  //       data: {
  //         title: 'route.scheduleList',
  //         breadcrumb: 'route.scheduleList'
  //       }
  //     },
  //     {
  //       path: 'add',
  //       component: ScheduleFormComponent,
  //       data: {
  //         title: 'route.scheduleAdd',
  //         canBack: true,
  //         breadcrumb: 'route.scheduleAdd'
  //       }
  //     }
  //   ]
  // },
  {
    path: 'job',
    children: [
      {
        path: 'list',
        component: JobListComponent,
        data: {
          title: 'route.jobList',
          breadcrumb: 'route.jobList'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule {}
