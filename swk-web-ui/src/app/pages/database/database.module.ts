/*
 * @Descripttion:
 * @Author: Rxc 陳平
 * @Date: 2020-05-20 09:26:26
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-22 16:04:19
 */
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ChangeHistoryComponent } from './actions/change-history/change-history.component';
import { ChangeOwnersComponent } from './actions/change-owners/change-owners.component';
import { ImportFromComponent } from './actions/import-from/import-from.component';
import { MtPipe } from './actions/import-from/mt.pipe';
import { ItemAddComponent } from './actions/item-add/item-add.component';
import { ItemCopyComponent } from './actions/item-copy/item-copy.component';
import { ItemUpdateComponent } from './actions/item-update/item-update.component';
import { PrintViewComponent } from './actions/print-view/print-view.component';
import { UploadImageComponent } from './actions/upload-image/upload-image.component';
import { UploadInventoryComponent } from './actions/upload-inventory/upload-inventory.component';
import { UploadModalComponent } from './actions/upload-modal/upload-modal.component';
import { UploadViewComponent } from './actions/upload-view/upload-view.component';
import { DatatypeFormComponent } from './components/datatype-form/datatype-form.component';
import { ItemListComponent } from './components/item-list/item-list.component';
import { ItemSearchComponent } from './components/item-search/item-search.component';
import { ItemViewComponent } from './components/item-view/item-view.component';
import { SearchViewComponent } from './components/search-view/search-view.component';
import { DatabaseRoutingModule } from './database-routing.module';
import { DatastoreDetailComponent } from './datastore-detail/datastore-detail.component';
import { DatastoreListComponent } from './datastore-list/datastore-list.component';
import { CheckHistoryComponent } from './history-list/check-history/check-history.component';
import { ItemHistoryComponent } from './history-list/item-history/item-history.component';
import {
    MappingDownloadComponent
} from './history-list/mapping-download/mapping-download.component';
import { QueryListComponent } from './query-list/query-list.component';
import { HistoryPreviewComponent } from './history-list/history-preview/history-preview.component';

@NgModule({
  declarations: [
    DatastoreDetailComponent,
    DatastoreListComponent,
    QueryListComponent,
    DatatypeFormComponent,
    ItemAddComponent,
    ItemSearchComponent,
    ItemUpdateComponent,
    ItemCopyComponent,
    ItemListComponent,
    ImportFromComponent,
    ItemHistoryComponent,
    PrintViewComponent,
    ItemViewComponent,
    UploadViewComponent,
    UploadInventoryComponent,
    ChangeOwnersComponent,
    UploadImageComponent,
    SearchViewComponent,
    UploadModalComponent,
    CheckHistoryComponent,
    ChangeHistoryComponent,
    MappingDownloadComponent,
    MtPipe,
    HistoryPreviewComponent
  ],
  imports: [SharedModule, DatabaseRoutingModule]
})
export class DatabaseModule {}
