import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { LogRoutingModule } from './log-routing.module';
import { LoginListComponent } from './login-list/login-list.component';
import { OperateListComponent } from './operate-list/operate-list.component';

@NgModule({
  declarations: [LoginListComponent, OperateListComponent],
  imports: [CommonModule, SharedModule, LogRoutingModule]
})
export class LogModule {}
