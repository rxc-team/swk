import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { NoticeListComponent } from './notice-list/notice-list.component';
import { NoticeRoutingModule } from './notice-routing.module';

@NgModule({
  declarations: [NoticeListComponent],
  imports: [SharedModule, NoticeRoutingModule]
})
export class NoticeModule {}
