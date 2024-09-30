import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GenerateAttrSetComponent } from './generate-attr-set/generate-attr-set.component';
import { GenerateCompleteComponent } from './generate-complete/generate-complete.component';
import { GenerateDsSaveComponent } from './generate-ds-save/generate-ds-save.component';
import { GenerateDsSetComponent } from './generate-ds-set/generate-ds-set.component';
import { GenerateMpSaveComponent } from './generate-mp-save/generate-mp-save.component';
import { GenerateUploadComponent } from './generate-upload/generate-upload.component';
import { GenerateComponent } from './generate/generate.component';

const routes: Routes = [
  {
    path: '', // 添加
    component: GenerateComponent,
    data: {
      title: 'route.chartAdd',
      breadcrumb: 'route.chartAdd'
    },
    children: [
      { path: '', redirectTo: 'upload', pathMatch: 'full' },
      {
        path: 'upload', // 添加
        component: GenerateUploadComponent,
        data: {
          title: 'route.upload',
          breadcrumb: 'route.upload'
        }
      },
      {
        path: 'datastore/set', // 添加
        component: GenerateDsSetComponent,
        data: {
          title: 'route.datastoreSet',
          breadcrumb: 'route.datastoreSet'
        }
      },
      {
        path: 'field/set', // 添加
        component: GenerateAttrSetComponent,
        data: {
          title: 'route.fieldSet',
          breadcrumb: 'route.fieldSet'
        }
      },
      {
        path: 'datastore/save', // 添加
        component: GenerateDsSaveComponent,
        data: {
          title: 'route.datastoreCreate',
          breadcrumb: 'route.datastoreCreate'
        }
      },
      {
        path: 'mapping/save', // 添加
        component: GenerateMpSaveComponent,
        data: {
          title: 'route.mappingCreate',
          breadcrumb: 'route.mappingCreate'
        }
      },
      {
        path: 'complete', // 添加
        component: GenerateCompleteComponent,
        data: {
          title: 'route.complete',
          breadcrumb: 'route.complete'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GenerateRoutingModule {}
