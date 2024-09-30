/*
 * @Description: 报表模块
 * @Author: RXC 呉見華
 * @Date: 2019-08-30 17:12:22
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-23 11:07:58
 */
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ReportListComponent } from './report-list/report-list.component';
import { ReportRoutingModule } from './report-routing.module';
import { ReportSearchComponent } from './report-search/report-search.component';

@NgModule({
  declarations: [ReportListComponent, ReportSearchComponent],
  imports: [SharedModule, ReportRoutingModule]
})
export class ReportModule {}
