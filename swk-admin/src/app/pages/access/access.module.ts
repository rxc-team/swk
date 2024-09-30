import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { AccessFormComponent } from './access-form/access-form.component';
import { AccessListComponent } from './access-list/access-list.component';
import { AccessRoutingModule } from './access-routing.module';
import { ActionFormComponent } from './action-form/action-form.component';
import { TreeAccessComponent } from './tree-access/tree-access.component';

@NgModule({
  declarations: [AccessListComponent, AccessFormComponent, ActionFormComponent, TreeAccessComponent],
  imports: [SharedModule, AccessRoutingModule]
})
export class AccessModule {}
