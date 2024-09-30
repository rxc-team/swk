import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CanDeactivateAddGuard } from './actions/item-add/can-deactivate-add.guard';
import { ItemAddComponent } from './actions/item-add/item-add.component';
import { CanDeactivateCopyGuard } from './actions/item-copy/can-deactivate-copy.guard';
import { ItemCopyComponent } from './actions/item-copy/item-copy.component';
import { CanDeactivateUpdateGuard } from './actions/item-update/can-deactivate-update.guard';
import { ItemUpdateComponent } from './actions/item-update/item-update.component';
import { DatabaseResolverService } from './database-resolver.service';
import { DatastoreDetailComponent } from './datastore-detail/datastore-detail.component';
import { DetailResolverService } from './datastore-detail/detail-resolver.service';
import { DatastoreListComponent } from './datastore-list/datastore-list.component';
import { ListResolverService } from './datastore-list/list-resolver.service';
import { CheckHistoryComponent } from './history-list/check-history/check-history.component';
import { ItemHistoryComponent } from './history-list/item-history/item-history.component';
import { QueryListComponent } from './query-list/query-list.component';
import { QueryResolverService } from './query-list/query-resolver.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':d_id/history', // history
        component: ItemHistoryComponent,
        data: {
          title: 'route.databaseHistoryTitle',
          canBack: true,
          breadcrumb: 'route.databaseHistoryTitle'
        }
      },
      {
        path: ':d_id/checkHistory', // history
        component: CheckHistoryComponent,
        data: {
          title: 'route.databaseCheckHistoryTitle',
          canBack: true,
          breadcrumb: 'route.databaseCheckHistoryTitle'
        }
      },
      {
        path: ':d_id/list', // datastores/:d_id/list
        component: DatastoreListComponent,
        resolve: {
          breadcrumb: DatabaseResolverService,
          listData: ListResolverService
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        data: {
          title: 'route.databaseListTitle',
          reuse: true,
          breadcrumb: 'route.databaseListTitle'
        }
      },
      {
        path: ':d_id/list/queries/:q_id', // datastores/:d_id/list/queries/:q_id
        component: QueryListComponent,
        resolve: {
          breadcrumb: DatabaseResolverService,
          listData: QueryResolverService
        },
        runGuardsAndResolvers: 'always',
        data: {
          title: 'route.databaseListTitle',
          breadcrumb: 'route.databaseListTitle'
        }
      },
      {
        path: ':d_id/items/:i_id', // datastores/:d_id/items/:i_id
        component: DatastoreDetailComponent,
        resolve: {
          detailData: DetailResolverService
        },
        runGuardsAndResolvers: 'always',
        data: {
          title: 'route.databasedetailTitle',
          canBack: true,
          breadcrumb: 'route.databasedetailTitle'
        }
      },
      {
        path: ':d_id/add', // datastores/:d_id/add
        component: ItemAddComponent,
        data: {
          title: 'route.databaseaddTitle',
          canBack: true,
          breadcrumb: 'route.databaseaddTitle'
        },
        canDeactivate: [CanDeactivateAddGuard]
      },
      {
        path: ':d_id/items/:i_id/update', // datastores/:d_id/items/:i_id/update
        component: ItemUpdateComponent,
        data: {
          title: 'route.databaseupdateTitle',
          canBack: true,
          breadcrumb: 'route.databaseupdateTitle'
        },
        canDeactivate: [CanDeactivateUpdateGuard]
      },
      {
        path: ':d_id/items/:i_id/copy', // datastores/:d_id/items/:i_id/copy
        component: ItemCopyComponent,
        data: {
          title: 'route.databasecopyTitle',
          canBack: true,
          breadcrumb: 'route.databasecopyTitle'
        },
        canDeactivate: [CanDeactivateCopyGuard]
      },
      {
        path: ':d_id/items/:i_id/history', // datastores/:d_id/items/:i_id/history
        component: ItemHistoryComponent,
        data: {
          title: 'route.databaseHistoryTitle',
          canBack: true,
          breadcrumb: 'route.databaseHistoryTitle'
        }
      },
      {
        path: ':d_id/items/:i_id/checkHistory', // datastores/:d_id/items/:i_id/history
        component: CheckHistoryComponent,
        data: {
          title: 'route.databaseCheckHistoryTitle',
          canBack: true,
          breadcrumb: 'route.databaseCheckHistoryTitle'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatabaseRoutingModule {}
