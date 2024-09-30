/*
 * @Description: 仪表盘模块
 * @Author: RXC 呉見華
 * @Date: 2019-08-26 15:21:27
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-08-30 12:23:49
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { AreaChartComponent } from './chart/area-chart/area-chart.component';
import { BarChartComponent } from './chart/bar-chart/bar-chart.component';
import { ColumnChartComponent } from './chart/column-chart/column-chart.component';
import { HistogramChartComponent } from './chart/histogram-chart/histogram-chart.component';
import { LineChartComponent } from './chart/line-chart/line-chart.component';
import { PieChartComponent } from './chart/pie-chart/pie-chart.component';
import { PointChartComponent } from './chart/point-chart/point-chart.component';
import { RadarChartComponent } from './chart/radar-chart/radar-chart.component';
import { DashboardFormComponent } from './dashboard-form/dashboard-form.component';
import { DashboardListComponent } from './dashboard-list/dashboard-list.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { ReportListComponent } from './report-list/report-list.component';

@NgModule({
  declarations: [
    DashboardFormComponent,
    DashboardListComponent,
    ReportListComponent,
    LineChartComponent,
    AreaChartComponent,
    BarChartComponent,
    PieChartComponent,
    ColumnChartComponent,
    PointChartComponent,
    RadarChartComponent,
    HistogramChartComponent
  ],
  imports: [SharedModule, DashboardRoutingModule]
})
export class DashboardModule {}
