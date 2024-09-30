import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { LogRoutingModule } from './log-routing.module';
import { LoginListComponent } from './login-list/login-list.component';
import { OperateListComponent } from './operate-list/operate-list.component';

@NgModule({
  declarations: [LoginListComponent, OperateListComponent],
  imports: [
    SharedModule,
    LogRoutingModule,
    NzCardModule,
    NzDatePickerModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSpaceModule,
    NzButtonModule,
    NzCollapseModule,
    NzTableModule,
    NzDropDownModule,
    NzResizableModule,
    NzIconModule
  ]
})
export class LogModule {}
