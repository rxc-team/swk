import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { CronEditorComponent } from './cron-editor/cron-editor.component';
import { JobListComponent } from './job-list/job-list.component';
import { ScheduleFormComponent } from './schedule-form/schedule-form.component';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';
import { ScheduleRoutingModule } from './schedule-routing.module';

@NgModule({
  declarations: [ScheduleListComponent, ScheduleFormComponent, JobListComponent, CronEditorComponent],
  imports: [SharedModule, ScheduleRoutingModule]
})
export class ScheduleModule {}
