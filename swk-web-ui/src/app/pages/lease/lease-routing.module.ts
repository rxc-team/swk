import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ItemAddComponent } from './item-add/item-add.component';
import { ItemUpdateComponent } from './item-update/item-update.component';

const routes: Routes = [
  {
    path: 'datastores',
    children: [
      {
        path: ':d_id/add', // datastores/:d_id/add
        component: ItemAddComponent,
        data: {
          title: 'route.databaseaddTitle',
          canBack: true,
          breadcrumb: 'route.databaseaddTitle'
        }
      },
      {
        path: ':d_id/items/:i_id/update', // datastores/:d_id/items/:i_id/update
        component: ItemUpdateComponent,
        data: {
          title: 'route.databaseupdateTitle',
          canBack: true,
          breadcrumb: 'route.databaseupdateTitle'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaseRoutingModule {}
