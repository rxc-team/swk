/*
 * @Description: datastore module管理
 * @Author: RXC 廖欣星
 * @Date: 2019-06-12 13:58:50
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-07-30 10:26:07
 */

import { GridsterModule } from 'angular-gridster2';
import { NzResizableModule } from 'ng-zorro-antd/resizable';

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared';

import { DatastoreFormComponent } from './datastore-form/datastore-form.component';
import { DatastoreInfoComponent } from './datastore-info/datastore-info.component';
import { DatastoreListComponent } from './datastore-list/datastore-list.component';
import { DatastoreRoutingModule } from './datastore-routing.module';
import { FieldFormComponent } from './field-form/field-form.component';
import { FuncEditorComponent } from './field-form/func-editor/func-editor.component';
import { FuncGenComponent } from './field-form/func-gen/func-gen.component';
import { FuncParamComponent } from './field-form/func-param/func-param.component';
import { GridComponent } from './field-layout/grid/grid.component';
import { WidthComponent } from './field-layout/width/width.component';
import { FieldListComponent } from './field-list/field-list.component';
import { MappingFormComponent } from './mapping-form/mapping-form.component';
import { PrintComponent } from './field-layout/print/print.component';
import { UniqueAddComponent } from './unique-add/unique-add.component';
import { RelationAddComponent } from './relation-add/relation-add.component';

@NgModule({
  declarations: [
    FieldListComponent,
    FieldFormComponent,
    WidthComponent,
    GridComponent,
    PrintComponent,
    DatastoreListComponent,
    DatastoreInfoComponent,
    MappingFormComponent,
    DatastoreFormComponent,
    FuncEditorComponent,
    FuncGenComponent,
    FuncParamComponent,
    UniqueAddComponent,
    RelationAddComponent
  ],
  imports: [SharedModule, DatastoreRoutingModule, NzResizableModule, GridsterModule, FormsModule, ReactiveFormsModule]
})
export class DatastoreModule {}
