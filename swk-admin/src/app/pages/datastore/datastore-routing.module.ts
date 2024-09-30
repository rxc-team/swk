/*
 * @Description: datastore
 * @Author: RXC 廖云江
 * @Date: 2019-08-02 09:07:08
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-01 13:56:10
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DatastoreFormComponent } from './datastore-form/datastore-form.component';
import { DatastoreInfoComponent } from './datastore-info/datastore-info.component';
import { DatastoreListComponent } from './datastore-list/datastore-list.component';
import { FieldFormComponent } from './field-form/field-form.component';
import { GridComponent } from './field-layout/grid/grid.component';
import { PrintComponent } from './field-layout/print/print.component';
import { WidthComponent } from './field-layout/width/width.component';
import { FieldListComponent } from './field-list/field-list.component';
import { MappingFormComponent } from './mapping-form/mapping-form.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'add',
        component: DatastoreFormComponent,
        data: {
          title: 'route.datastoreAdd',
          breadcrumb: 'route.datastoreAdd'
        }
      },
      {
        path: 'list',
        component: DatastoreListComponent,
        data: {
          title: 'route.datastoreList',
          breadcrumb: 'route.datastoreList'
        }
      },
      {
        path: ':d_id/info',
        component: DatastoreInfoComponent,
        data: {
          title: 'route.datastoreInfo',
          canBack: true,
          breadcrumb: 'route.datastoreInfo'
        }
      },
      {
        path: ':d_id/setting',
        component: DatastoreFormComponent,
        data: {
          title: 'route.datastoreSetting',
          canBack: true,
          breadcrumb: 'route.datastoreSetting'
        }
      },
      {
        path: ':d_id/mapping',
        children: [
          {
            path: 'add',
            component: MappingFormComponent,
            data: {
              title: 'route.mappingAdd',
              canBack: true,
              breadcrumb: 'route.mappingAdd'
            }
          },
          {
            path: ':m_id/setting',
            component: MappingFormComponent,
            data: {
              title: 'route.mappingSetting',
              canBack: true,
              breadcrumb: 'route.mappingSetting'
            }
          }
        ]
      },
      {
        path: ':d_id/field',
        children: [
          {
            path: 'list',
            component: FieldListComponent,
            data: {
              title: 'route.fieldList',
              canBack: true,
              breadcrumb: 'route.fieldList'
            }
          },
          {
            path: 'add',
            component: FieldFormComponent,
            data: {
              title: 'route.fieldAdd',
              breadcrumb: 'route.fieldAdd'
            }
          },
          {
            path: ':f_id/edit',
            component: FieldFormComponent,
            data: {
              title: 'route.fieldEdit',
              breadcrumb: 'route.fieldEdit'
            }
          },
          {
            path: 'layout',
            component: GridComponent,
            data: {
              title: 'route.fieldLayout',
              canBack: true,
              breadcrumb: 'route.fieldLayout'
            }
          },
          {
            path: 'width',
            component: WidthComponent,
            data: {
              title: 'route.fieldWidth',
              canBack: true,
              breadcrumb: 'route.fieldWidth'
            }
          },
          {
            path: 'print',
            component: PrintComponent,
            data: {
              title: 'route.fieldPrint',
              canBack: true,
              breadcrumb: 'route.fieldPrint'
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatastoreRoutingModule {}
