/*
 * @Descripttion:
 * @Author: Rxc 陳平
 * @Date: 2020-07-23 17:54:26
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-22 15:51:55
 */
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ApproveInfoComponent } from './approve-info/approve-info.component';
import { ApproveListComponent } from './approve-list/approve-list.component';
import { ApproveRoutingModule } from './approve-routing.module';
import { FileItemComponent } from './file-item/file-item.component';
import { HistoryItemComponent } from './history-item/history-item.component';
import { ImageItemComponent } from './image-item/image-item.component';
import { ItemSearchComponent } from './item-search/item-search.component';
import { OptionsItemComponent } from './options-item/options-item.component';
import { SearchViewComponent } from './search-view/search-view.component';
import { SwitchItemComponent } from './switch-item/switch-item.component';
import { TextItemComponent } from './text-item/text-item.component';
import { TextareaItemComponent } from './textarea-item/textarea-item.component';
import { UserItemComponent } from './user-item/user-item.component';

@NgModule({
  declarations: [
    ApproveListComponent,
    ApproveInfoComponent,
    HistoryItemComponent,
    SwitchItemComponent,
    FileItemComponent,
    ImageItemComponent,
    TextareaItemComponent,
    UserItemComponent,
    TextItemComponent,
    SearchViewComponent,
    ItemSearchComponent,
    OptionsItemComponent
  ],
  imports: [SharedModule, ApproveRoutingModule]
})
export class ApproveModule {}
