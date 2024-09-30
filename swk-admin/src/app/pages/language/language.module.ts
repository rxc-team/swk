/*
 * @Description: 多语言模块
 * @Author: RXC 廖云江
 * @Date: 2019-09-10 13:25:26
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-07-28 15:12:24
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { LanguageListComponent } from './language-list/language-list.component';
import { LanguageRoutingModule } from './language-routing.module';
import { LangugeAppComponent } from './languge-detail/languge-apps.component';
import { LangugeDashboardsComponent } from './languge-detail/languge-dashboards.component';
import { LangugeDatastoresComponent } from './languge-detail/languge-datastores.component';
import { LangugeFieldsComponent } from './languge-detail/languge-fields.component';
import { LangugeGroupsComponent } from './languge-detail/languge-groups.component';
import { LangugeMappingsComponent } from './languge-detail/languge-mappings.component';
import { LangugeOptionsComponent } from './languge-detail/languge-options.component';
import { LangugeReportsComponent } from './languge-detail/languge-reports.component';
import { LangugeWorkflowsComponent } from './languge-detail/languge-workflows.component';

@NgModule({
  declarations: [
    LanguageListComponent,
    LangugeAppComponent,
    LangugeGroupsComponent,
    LangugeDatastoresComponent,
    LangugeFieldsComponent,
    LangugeReportsComponent,
    LangugeDashboardsComponent,
    LangugeOptionsComponent,
    LangugeWorkflowsComponent,
    LangugeMappingsComponent
  ],
  imports: [SharedModule, LanguageRoutingModule]
})
export class LanguageModule {}
