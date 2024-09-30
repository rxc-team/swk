import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BackupListComponent } from './backup-list/backup-list.component';

// 用户路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: BackupListComponent,
        data: {
          title: 'route.backupList',
          breadcrumb: 'route.backupList'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackupRoutingModule {}
