import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { JobListComponent } from './job-list/job-list.component';
import { ScheduleRoutingModule } from './schedule-routing.module';

@NgModule({
  declarations: [JobListComponent],
  imports: [SharedModule, ScheduleRoutingModule]
})
export class ScheduleModule {}
