import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ItemSearchComponent } from './item-search/item-search.component';
import { ReportFormComponent } from './report-form/report-form.component';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportRoutingModule } from './report-routing.module';

@NgModule({
  declarations: [ReportFormComponent, ItemSearchComponent, ReportListComponent],
  imports: [SharedModule, ReportRoutingModule]
})
export class ReportModule {}
