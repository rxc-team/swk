import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { WorkflowFormComponent } from './workflow-form/workflow-form.component';
import { WorkflowListComponent } from './workflow-list/workflow-list.component';
import { WorkflowRoutingModule } from './workflow-routing.module';

@NgModule({
  declarations: [WorkflowFormComponent, WorkflowListComponent],
  imports: [SharedModule, WorkflowRoutingModule]
})
export class WorkflowModule {}
