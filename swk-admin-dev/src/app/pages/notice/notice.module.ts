import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { NoticeListComponent } from './notice-list/notice-list.component';
import { NoticeRoutingModule } from './notice-routing.module';

@NgModule({
  declarations: [NoticeListComponent],
  imports: [
    SharedModule,
    NoticeRoutingModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSpaceModule,
    NzButtonModule,
    NzRadioModule,
    NzCollapseModule,
    NzTableModule,
    NzDropDownModule,
    NzResizableModule,
    NzIconModule
  ]
})
export class NoticeModule {}
